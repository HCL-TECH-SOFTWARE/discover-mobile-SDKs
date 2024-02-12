/*

Copyright 2024-2025 HCL Software

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const {MongoClient} = require('mongodb');
const mongoURI = 'mongodb+srv://slicendice:slicendicepwd@cluster0.mws7m0d.mongodb.net/?retryWrites=true&w=majority'; //process.env.MONGOURI || 'mongodb://127.0.0.1:27017/?maxPoolSize=30&maxConnecting=20&minPoolSize=10&w=majority&retryWrites=true';
const mongoClient = new MongoClient(mongoURI);
const mongoDB = process.env.MONGODBNAME || "slicendicedb";
const app = express();
const port = process.env.PORT || 3001;

//origin: ["https://slicendice-frontend.vercel.app/", "https://slicendice.vercel.app/"],

app.use(cors(
  {
      origin: "*",
      methods: ["POST", "GET"],
      credentials: true
  }
));

app.listen(port, () => console.log(`Listening on port ${port}`));

app.use(express.json({limit: '50mb', type: '*/*'}));
app.use(express.urlencoded({limit: '50mb'}));

app.get("/", (req, res) => {
  res.send({ express: 'Listen server says hi' });
})
app.get('/say_hello', (req, res) => {
  res.send({ express: 'Hi, listen server says hello' });
});
app.post('/listener', bodyParser.json(), async (req, res) => { 
  console.log('/listener invoked : ', req.body, req.headers);
  var payload = req.body;
  var messages = payload.sessions[0].messages;
  payload.sessions[0].messages = [];
  await messages.forEach(async message => {
    await mongoClient.db(mongoDB).collection(`sessionmessages_${payload.sessions[0].id}`).insertOne(message);
  });
  await mongoClient.db(mongoDB).collection('sessionsdata').insertOne(payload);
  await mongoClient.db(mongoDB).collection('slicendicesessions').updateOne({id:payload.sessions[0].id}, {$set:{id:payload.sessions[0].id}}, { upsert: true });
  res.send({ express: `ok processed session data : ${ payload.sessions[0].id }` });
});
app.get('/list_sessions', async (req, res) => {
  console.log('list_sessions invoked');
  const sessionsCursor = await mongoClient.db(mongoDB).collection(`slicendicesessions`).find({}).sort({_id:-1}); //.aggregate([{$project:{_id:0}}]);
  const sessions = await sessionsCursor.toArray();
  res.send( {data: sessions} );
});
app.get('/get_session/:sessionId/', async (req, res) => {
  console.log(`get_session invoked. sessionId: ${req.params.sessionId}`);
  var messages = await mongoClient.db(mongoDB).collection(`sessionsdata`).find({'sessions.0.id':req.params.sessionId},{_id:0}).sort({ "serialNumber": 1 }).toArray();
  res.send( {data: messages} );
});
app.get('/delete_session/:sessionId/', async (req, res) => {
  console.log(`delete_session invoked. sessionId: ${req.params.sessionId}`);
  var sessionsdataDeleteOneResult = await mongoClient.db(mongoDB).collection(`sessionsdata`).deleteMany({'sessions.0.id':req.params.sessionId});
  var slicendicesessionsDeleteOneResult = await mongoClient.db(mongoDB).collection(`slicendicesessions`).deleteOne({'id':req.params.sessionId});
  var sessionmessagesDeleteOneResult = await mongoClient.db(mongoDB).collection(`sessionmessages_${req.params.sessionId}`).drop();
  res.send( {data: {'sessionsdataDeleteOneResult': sessionsdataDeleteOneResult, 
                    'slicendicesessionsDeleteOneResult': slicendicesessionsDeleteOneResult,
                    'sessionmessagesDeleteOneResult': sessionmessagesDeleteOneResult}, 
          } );
});
app.post('/delete_sessions/', async (req, res) => {
  console.log(`delete_sessions invoked`);

  var sessionsdataDeleteManyResults = [];
  var slicendicesessionsDeleteManyResults = [];
  var sessionmessagesDeleteManyResults = [];

  var payload = req.body;
  await payload.sessions.forEach(async sessionId => {
    var sessionsdataDeleteOneResult = await mongoClient.db(mongoDB).collection(`sessionsdata`).deleteOne({'sessions.0.id':sessionId});
    sessionsdataDeleteManyResults.push(  { sessionId:sessionsdataDeleteOneResult } );
    var slicendicesessionsDeleteOneResult = await mongoClient.db(mongoDB).collection(`slicendicesessions`).deleteOne({'id':sessionId});
    slicendicesessionsDeleteManyResults.push(  { sessionId:slicendicesessionsDeleteOneResult } );
    var sessionmessagesDeleteOneResult = await mongoClient.db(mongoDB).collection(`sessionmessages_${sessionId}`).deleteOne({'id':sessionId});
    sessionmessagesDeleteManyResults.push(  { sessionId:sessionmessagesDeleteOneResult } );
  });

  res.send( {data: {'sessionsdataDeleteManyResults': sessionsdataDeleteManyResults, 
                    'slicendicesessionsDeleteManyResults': slicendicesessionsDeleteManyResults,
                    'sessionmessagesDeleteManyResults': sessionmessagesDeleteManyResults}, 
            } );
});
app.get('/get_messages/:sessionId/:messageIndex', async (req, res) => {
  console.log(`get_messages invoked. sessionId: ${req.params.sessionId} messageIndex: ${req.params.messageIndex}`);
  var messages = {}
  if( req.params.messageIndex == undefined || req.params.messageIndex < 0 ){
    messages = await mongoClient.db(mongoDB).collection(`sessionmessages_${req.params.sessionId}`).aggregate([{$sort:{offset:1}},{$project:{_id:0, type:1}}]).toArray();
    res.send( {data: messages} );
  }
  else{
    messages = await mongoClient.db(mongoDB).collection(`sessionmessages_${req.params.sessionId}`).aggregate([{$sort:{offset:1}},{$project:{_id:0}}]).toArray();
    res.send( {data: messages[req.params.messageIndex]} );
  }
});
app.get('/get_messages/:sessionId/', async (req, res) => {
  console.log(`get_messages invoked. sessionId: ${req.params.sessionId}`);
  var messages = await mongoClient.db(mongoDB).collection(`sessionmessages_${req.params.sessionId}`).aggregate([{$sort:{offset:1}},{$project:{_id:0, image:0, 'layout.controls.image':0}}]).toArray();
  //console.log(messages);
  res.send( {data: messages} );
});
app.get('/get_video/:sessionId/', async (req, res) => {
  console.log(`get_video invoked. sessionId: ${req.params.sessionId}`);
  var messages = await mongoClient.db(mongoDB).collection(`sessionmessages_${req.params.sessionId}`).aggregate([{$sort:{offset:1}},{$project:{_id:0, image:0}}]).toArray();
  res.send( {data: messages} );
});
app.get('/get_images/:sessionId/', async (req, res) => {
  console.log(`get_images invoked. sessionId: ${req.params.sessionId}`);
  var messages = await mongoClient.db(mongoDB).collection(`sessionmessages_${req.params.sessionId}`).aggregate([{$sort:{offset:1}},{$project:{_id:0, 'image.base64Image':1, 'layout.controls':1}}]).toArray();
  res.send( {data: messages} );
});
app.get('/killswitch', async (req, res) => {
  console.log(`killswitch invoked.`);
  var messages = await mongoClient.db(mongoDB).collection(`killswitch`).find({id:1}).toArray();
  var response = 0;
  if( messages && messages[0] && (messages[0].value != undefined) && (messages[0].value != null) ){
    response = messages[0].value;
  }
  res.send( response );
});
app.get('/set_killswitch/:killswitchvalue', async (req, res) => {
  console.log(`set_killswitch invoked. killswitchvalue: ${req.params.killswitchvalue}`);
  var messages = await mongoClient.db(mongoDB).collection(`killswitch`).updateOne({id:1}, {$set:{value:req.params.killswitchvalue}}, { upsert: true });
  res.send( {data: messages} );
});