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

import React from 'react';
import logo from './logo.svg';
import './App.css';

async function generateSessionId() {
  var dateTimeBuffer = new TextEncoder("utf-8").encode(Date.now().toString());
  var dateTimeHashedBuffer = await crypto.subtle.digest('SHA-256', dateTimeBuffer); 
  var sessionIdByDateTime = Array.prototype.map.call(new Uint8Array(dateTimeHashedBuffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  return sessionIdByDateTime;
}

const callBackendAPI_say_hello = async () => {
  const response = await fetch('/say_hello');
  const responseBody = await response.json();

  if (response.status !== 200) {
    throw Error(responseBody.message) 
  }
  return responseBody;
};

const callBackendAPI_list_sessions = async () => {
  const response = await fetch('/list_sessions');
  const responseBody = await response.json();

  if (response.status !== 200) {
    throw Error(responseBody.message) 
  }
  return responseBody;
};

const callBackendAPI_get_session = async (sessionId) => {
  const response = await fetch(`/get_session/${sessionId}`);
  const responseBody = await response.json();

  if (response.status !== 200) {
    throw Error(responseBody.message) 
  }
  return responseBody;
};

const callBackendAPI_get_messages = async (sessionId) => {
  const response = await fetch(`/get_messages/${sessionId}`);
  const responseBody = await response.json();

  if (response.status !== 200) {
    throw Error(responseBody.message) 
  }
  return responseBody;
};

const callBackendAPI_get_message = async (sessionId, messageIndex) => {
  console.log( 'getting message for session : ', sessionId, ' messageIndex ', messageIndex );
  const response = await fetch(`/get_messages/${sessionId}/${messageIndex}`);
  const responseBody = await response.json();

  if (response.status !== 200) {
    throw Error(responseBody.message) 
  }
  return responseBody;
};

const callBackendAPI_listener = async () => {
  
  var sessionIdByDateTime = await generateSessionId();
  const url = '/listener';
  
  const requestBody = {
          serialNumber: 1,
          messageVersion: '10.0.0',
          sessions:[{
            startTime: 1695727970,
            id: sessionIdByDateTime,
            messages:[
              {
                offset: 100,
                type: 2,
                logicalPageName: 'HomeScreen'
              },{
                offset: 210,
                type: 11
              }
            ]
          }],
          clientEnvironment:{
            mobileEnvironment:{
              keyboardType: 1,
              brand: 'worldphone',
              fingerPrint: ''
            },
            totalMemory: 6434342,
            totalStorage: 1280102010,
            orientationType: 'PORTRAIT',
            appVersion: '2.0.1',
            manufacturer: 'worldphone',
            deviceId: 'un1kEyedee',
            local: 'En-US',
            deviceModel: 'universalOne',
            language: 'English'
          },
          width: 640,
          height: 820,
          osVersion: '15.2'
        };

  const requestHeaders = {
          "Content-Type": "application/json",
        };
      
  const response = await fetch(url, {
                                      method: 'POST',
                                      headers: requestHeaders,
                                      body: JSON.stringify(requestBody, undefined, 2),
                                });
                                    
  const responseBody = await response.json();

  if (response.status !== 200) {
    throw Error(responseBody.message) 
  }
  return responseBody;
};

function trimBase64FromPayload(key, value){
  if( key == 'base64Image' ) return undefined;
  else return value;
};

function App() {
    const [expressPayload, setExpressPayload] = React.useState("Empty Payload");
    const [sessionListData, setSessionListData] = React.useState([{id:'-1'}]);
    const [sessionData, setSessionData] = React.useState([{id:'-1'}]);
    const [sessionMessages, setSessionMessages] = React.useState([{id:'-1'}]);
    const [replayData, setReplayData] = React.useState([{id:'-1'}]);
    const [currentSessionId, setCurrentSessionId] = React.useState(0);

    return (
      <div className="App">

        <div className='showtell-container'>
          <div className='top-toolbar-buttons'>
            <button type="button"
              onClick={() => {
                callBackendAPI_say_hello().then((thePayload) => {
                setExpressPayload(thePayload.express);
              });
              }}> Get Server Message 
            </button>
            <button type="button"
              onClick={() => {
                  callBackendAPI_listener().then((thePayload) => {
                  setExpressPayload(thePayload.express);
                });
              }}> Post Session To server 
            </button>
            <button type="button"
              onClick={() => {
                  callBackendAPI_list_sessions().then((theResponseData) => {
                    setSessionListData(theResponseData.data);
                });
              }}> List Sessions 
            </button>
          </div>
          <div>
            <p className="App-intro">{expressPayload}</p>
          </div>
          <div className='server-data-container'>
          <p>
            {
              sessionListData.map((sessionItem, sessionItemIndex) => {
                return(
                      <div key={sessionItemIndex} >
                        <a href="#" onClick={() => { setCurrentSessionId(sessionItem.id); setSessionData([{id:'-1'}]); setSessionMessages([{id:'-1'}]);}}>{sessionItem.id.substring(0, 9)} </a>
                        <button> Purge </button>
                        <button onClick={() => { callBackendAPI_get_session(sessionItem.id).then((theResponseData) => {
                                                                  setSessionData(theResponseData.data); });
                                                }}> Hits </button>
                        <button onClick={() => {  callBackendAPI_get_messages(sessionItem.id).then((theResponseData) => {
                                                                  setSessionMessages(theResponseData.data); });
                                                }}> Messages </button>
                      </div>);
              })
            }
            </p>
            <p>
            {
              sessionData.map((sessionItem, sessionItemIndex) => {
                return(
                      <div key={sessionItemIndex} >
                        <a href='#' onClick={() => { setReplayData(sessionItem); }}>Hit {sessionItem.serialNumber}
                        </a>
                      </div>);
              })
            }
            </p>
            <p>
            {
              sessionMessages.map((messageItem, messageIndex) => {
                return(
                      <div key={messageIndex}>
                        <a href='#' onClick={() => {  callBackendAPI_get_message(currentSessionId, messageIndex).then((theResponseData) => {
                                                                  setReplayData(theResponseData.data); });
                                                }}>Message Type {messageItem.type} </a>
                      </div>);
              })
            }
            </p>
            <div className='json-pretty'>
              <img alt='No screenshot available' src={`data:image/jpeg;base64,${replayData?.image?.base64Image}`} />
              <div>
                {JSON.stringify(replayData, trimBase64FromPayload, 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}

export default App;