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

import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Android from '@mui/icons-material/Android.js';
import Apple from '@mui/icons-material/Apple.js';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import PlayCircle from '@mui/icons-material/PlayCircle.js';
import VideoCameraBack from '@mui/icons-material/VideoCameraBack.js';
import Delete from '@mui/icons-material/Delete.js';
import Refresh from '@mui/icons-material/Refresh.js';
import Upload from '@mui/icons-material/Upload.js';
import Paper from '@mui/material/Paper';
import Modal from '@mui/material/Modal';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useNavigate } from 'react-router-dom';

import {callBackendAPI_get_session, callBackendAPI_list_sessions, callBackendAPI_get_messages, callBackendAPI_get_message, callBackendAPI_get_images, callBackendAPI_delete_session} from './CallBackendAPI.js';

import './PersistentDrawerLeft.css';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const RightPaneContent = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'normal',
}));

const RightPaneMessageListContent = styled('div')(({ theme }) => ({
  justifyContent: 'normal',
}));

export default function PersistentDrawerLeft() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const [replayImage, setReplayImage] = React.useState('');
  const [replayImageDiv, setReplayImageDiv] = React.useState((<div/>));
  const [secondText, setSecondText] = React.useState('Select a session, then select a message');
  const [thirdText, setThirdText] = React.useState('');
  const [sessionListData, setSessionListData] = React.useState([{id:'-1'}]);   /* list of all sessions */
  const [currentSessionId, setCurrentSessionId] = React.useState(0);           /* currently selected session */
  const [sessionHitsData, setSessionHitsData] = React.useState([{id:'-1'}]);   /* all hits in the selected session */
  const [sessionMessages, setSessionMessages] = React.useState([{id:'-1'}]);   /* all messages in the selected session */
  const [sessionImages, setSessionImages] = React.useState([]);       /* all images in the selected session */
  const [selectedListItemIndex, setSelectedListItemIndex] = React.useState(-1);
  
  React.useEffect( () => {
    callBackendAPI_list_sessions().then((theResponseData) => {
      setSessionListData(theResponseData.data);
      generateThirdTextForTheSession();
    });
  }, []);
  React.useEffect( () => {
    generateThirdTextForTheSession();
  }, [sessionHitsData, sessionMessages]);
  React.useEffect( () => {
    generateThirdTextForTheSessionList();
  }, sessionListData);


  /* modal */
  const [openModal, setOpenModal] = React.useState(false);
  const handleOpenModal = () => { setOpenModal(true); setIndexSlideShow(0); } ;
  const handleCloseModal = () => { setOpenModal(false); setIndexSlideShow(-1); resetTimeoutSlideShow(); }

  /* drawer */
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

    /* Slideshow */
  const delaySlideShow = 1500;
  const [indexSlideShow, setIndexSlideShow] = React.useState(-1);
  const timeoutRefSlideShow = React.useRef(null);

  function resetTimeoutSlideShow() {
    if (timeoutRefSlideShow.current) {
      clearTimeout(timeoutRefSlideShow.current);
    }
  }
  React.useEffect(() => {
    resetTimeoutSlideShow();
    if( indexSlideShow > -1 ){
      timeoutRefSlideShow.current = setTimeout(
        () =>
        setIndexSlideShow((prevIndex) =>
            prevIndex === sessionImages.length - 1 ? 0 : prevIndex + 1
          ),
        delaySlideShow
      );
    }
    return () => {
      resetTimeoutSlideShow();
    };
  }, [indexSlideShow]);

  React.useEffect(() => {
      setReplayImageDiv( getReplayImage() );
  }, [replayImage]);
  
  const handleVideoButtonClick = (id) => {
      setCurrentSessionId(id); 
      setSecondText(`Select a session then select a message`);
      setReplayImage('');
      setSessionMessages([{id:'-1'}]);
      setSessionHitsData([{id:'-1'}]);
      callBackendAPI_get_images(id).then((theResponseData) => {
        setSessionImages(theResponseData?.data);
      });
      handleOpenModal();
  };
  const getMessageListText = (messageItem) => {
    switch( messageItem.type ){
      case 11:
        return `Gesture`;
      case 2:
        return `Load`;
      case 1:
        return 'Mobile State';
      case 4:
        return `${messageItem.event?.tlEvent}`;
      case 3:
        return `Network`;
      case 6:
        return `Exception`;
      case 5:
        return `Custom`;
      case 10:
        return `Dynamic Update`;
      default:
        return `Type ${messageItem.type}`;
    }
  }
  const getScreenViewNameFromJSON = (messageItem) => {
    var screenViewNameFromJSON = 'unknown screenview';
    if( messageItem?.screenview?.name ){
      screenViewNameFromJSON = messageItem.screenview?.name;
    }else if( messageItem?.context?.name ){
      screenViewNameFromJSON = messageItem.context?.name;
    }
    return screenViewNameFromJSON;
  }
  const setReplayImageFromPayload = (theResponseData) =>{
    var imgToSet = theResponseData?.data?.image?.base64Image ? theResponseData?.data?.image?.base64Image : (theResponseData?.data?.layout?.controls?theResponseData?.data?.layout?.controls[0]:null)?.image?.base64Image;
    setReplayImage( imgToSet ? imgToSet : (theResponseData?.data?.controls?theResponseData?.data?.controls[0]:null)?.image?.base64Image );
  }
  const getMessageListTextForListHeader = (messageItem) => {
    switch( messageItem.type ){
      case 11:
        return `${messageItem.event?.tlEvent} Gesture`;
      case 2:
        return <span STYLE="color:blue;font-weight:bold;">{getScreenViewNameFromJSON(messageItem)}</span>;
      case 1:
        return 'Mobile State Message';
      case 4:
        return `${messageItem.event?.tlEvent} Event`;
      default:
        return `Type ${messageItem.type}`;
    }
  }
  const getReplayImage = () => {
        if(replayImage?.length){
            return (<img width={300} height={500} alt='No screenshot available' src={`data:image/jpeg;base64,${replayImage}`}/>);
        }else if( currentSessionId ){
            return (<div><svg width={300} height={500}><text x="100" y="200" fontFamily='cursive' fontSize={24} fill='red' transform="rotate(30 20,40)">No screenshot was captured !</text></svg></div>);
        }
        return (<div/>);
  }
  const getVideoReplayImage = (imageIndex, imgagebase64) => {
    if(imgagebase64?.length){
        return (<div id={'"'+imageIndex+'"'}>
                  <img width={300} height={500} src={`data:image/jpeg;base64,${imgagebase64}`} alt='No screenshot available' loading="lazy"/>
                  {/* <svg viewBox="0 0 300 300">
                  <circle position='absolute' cx="15" cy="15" r="30" fill-opacity="0.5" opacity={1}/>
                  </svg> */}
                </div>);
    }else{
      //return (<div/>);
      return (<div id={'"'+imageIndex+'"'}><svg width={300} height={500}><text x="100" y="200" fontFamily='cursive' fontSize={24} fill='red' transform="rotate(30 20,40)">No screenshot was captured !</text></svg></div>);
    }
}
const getNumberOfScreenViews = () => {
  var numberOfScreenViews = 0;
  sessionMessages.map((msg) => {
    if( msg.type == 2 ){
      numberOfScreenViews++;
    }
  })
  return numberOfScreenViews;
}
const generateThirdTextForTheSessionList = () => {
  setThirdText( <div> You have <span STYLE="color:blue;font-weight:bold;">{sessionListData.length}</span> sessions.</div> );
}
const generateThirdTextForTheSession = () => {
  var generatedText = ' building session info .. ';
  if( sessionHitsData ){
    if( sessionHitsData[0].sessions ){
        var sessionStartDateStr = new Date( sessionHitsData[0].sessions[0].startTime ).toDateString();
        var sessionStartTimeStr = new Date( sessionHitsData[0].sessions[0].startTime ).toTimeString();
        generatedText = <div>This is <span STYLE="color:blue;font-weight:bold;">{sessionHitsData[0]?.clientEnvironment?.appName}'s</span> {sessionHitsData[0]?.clientEnvironment?.osType === 'ios' ? <span STYLE="font-size:30px"></span> : <Android/>} session from a <span STYLE="font-weight:bold;">{sessionHitsData[0]?.clientEnvironment?.deviceModel}</span> device started on <span STYLE="text-decoration:underline">{sessionStartDateStr} at {sessionStartTimeStr}</span>. <p/>It has <span STYLE="color:blue">{sessionHitsData.length} Hits</span> and <span STYLE="color:green">{sessionMessages.length} Messages</span>.
                        <p/> There are <span STYLE="color:blue;font-weight:bold;">{getNumberOfScreenViews()} screen views</span> in this session. <p/>So far the user has spent <span STYLE="text-decoration:underline">{(sessionMessages[sessionMessages.length-1].offset)/1000} seconds</span> using the application.</div>
      }
    }
    setThirdText( generatedText );
}
const generateThirdTextForTheMessage = (messageIndex) => {
  var generatedText = 'building message info ..';
  if( sessionMessages && messageIndex >= 0 && sessionMessages[messageIndex] )
  var currentMessage = sessionMessages[messageIndex];
  if( currentMessage.type == 2 ){
      var nextScreenViewMessageOffset = undefined;
      var otherMessageCount = 1;
      var i = i = messageIndex+1;
      for( ; i < sessionMessages.length; i++ ){
        nextScreenViewMessageOffset = sessionMessages[i].offset;
        if( sessionMessages[i].type == 2 ){
            break;
          }
      }
      otherMessageCount = i - messageIndex;
      var timeSpentOnCurrentScreen = (nextScreenViewMessageOffset - currentMessage.offset) / 1000;
      generatedText = <div>Screen <span STYLE="color:blue;font-weight:bold;">"{getScreenViewNameFromJSON(currentMessage)}"</span> was loaded <span STYLE="text-decoration:underline">{(currentMessage.offset / 1000)} seconds after</span> the session started.
                            <p/> There were <span STYLE="color:green;font-weight:bold;">{otherMessageCount} user interactions</span> on {getScreenViewNameFromJSON(currentMessage)}. <p/> User spent <span STYLE="text-decoration:underline">{timeSpentOnCurrentScreen} seconds</span> on this screen.</div>;
  }else if( currentMessage.type == 4 ){
      generatedText = <div>This is a <span STYLE="color:blue;font-weight:bold;">{currentMessage?.event?.tlEvent}</span> Event that happened <span STYLE="text-decoration:underline">{ currentMessage.offset / 1000 } seconds after</span> the session started; and <span STYLE="text-decoration:underline">{(currentMessage.screenviewOffset?currentMessage.screenviewOffset:currentMessage.screenViewOffset) / 1000} seconds after</span> the screen was loaded. <p/>User typed in <span STYLE="color:green;font-weight:bold;">"{currentMessage.target?.currState.text}"</span> in this textbox whose id is <span STYLE="font-weight:bold;">{currentMessage.target?.id}</span>. The data was {(currentMessage.target?.currState.matched?.replace?.length > 0 )? ` masked using regular expression for ${currentMessage.target?.currState.matched.name}` : ' not masked'}. </div>;
  }else if( currentMessage.type == 3 ){
    generatedText = <div>Application tried to make network connection : <span STYLE="color:blue;font-weight:bold;">{currentMessage.connection.url}</span> at <span STYLE="text-decoration:underline">{ new Date(currentMessage.connection.initTime).toTimeString() }</span> and got http response code <span STYLE="color:blue;font-weight:bold;">{currentMessage.connection.statusCode}</span> and network message: <p/>'{currentMessage.connection.message}.' </div>;
  }else if( currentMessage.type == 10 ){
    generatedText = <div>Event <span STYLE="color:blue;font-weight:bold;">Layout or Dynamic Update</span> occured <span STYLE="text-decoration:underline">{ currentMessage.offset / 1000 } seconds after</span> the session started; and <span STYLE="text-decoration:underline">{(currentMessage.screenviewOffset?currentMessage.screenviewOffset:currentMessage.screenViewOffset) / 1000} seconds after</span> the screen was loaded.</div>;
  }else if( currentMessage.type == 6 ){
    generatedText = <div>Exception occured : <span STYLE="color:blue;font-weight:bold;">{currentMessage.exception.name}</span></div>;
  }else if( currentMessage.type == 5 ){
    generatedText = <div>Custom event recorded : <span STYLE="color:blue;font-weight:bold;">{currentMessage.customEvent.name}</span></div>;
  }else if( currentMessage.type > 2 ){
      generatedText = <div>Event <span STYLE="color:blue;font-weight:bold;">{currentMessage?.event?.tlEvent?currentMessage?.event?.tlEvent:'Type ' + currentMessage.type}</span> occured <span STYLE="text-decoration:underline">{ currentMessage.offset / 1000 } seconds after</span> the session started; and <span STYLE="text-decoration:underline">{(currentMessage.screenviewOffset?currentMessage.screenviewOffset:currentMessage.screenViewOffset) / 1000} seconds after</span> the screen was loaded.</div>;
  }else{
      generatedText = <div>This is a type <span STYLE="color:blue;font-weight:bold;">{currentMessage.type}</span> event that occured <span STYLE="text-decoration:underline">{ currentMessage.offset / 1000 } seconds after</span> the session started; and <span STYLE="text-decoration:underline">{(currentMessage.screenviewOffset?currentMessage.screenviewOffset:currentMessage.screenViewOffset) / 1000} seconds after</span> the screen was loaded.</div>;
  }
  setThirdText( generatedText );
}
const getSlicedSessionMessages = () => {
  var slicedMessagesArray = [];
  var slicedMessagesInnerArray = [];
  for( var messageIndex = 0; messageIndex < sessionMessages.length; messageIndex++ ){
    var messageItem = sessionMessages[messageIndex];
    messageItem['theMessageIndex'] = messageIndex;
    if( messageItem.type == 2 ){
      if( slicedMessagesInnerArray.length > 0 ){
        slicedMessagesArray.push( slicedMessagesInnerArray );
      }
      slicedMessagesArray.push(messageItem);
      slicedMessagesInnerArray = [];
      slicedMessagesInnerArray.push(messageItem);
    }else{
      slicedMessagesInnerArray.push(messageItem);
    }
  }
  if( slicedMessagesInnerArray.length > 0 ){
    slicedMessagesArray.push( slicedMessagesInnerArray );
  }
  // console.log( 'slicedMessagesArray : ', slicedMessagesArray);
  // console.log( 'slicedMessagesInnerArray : ', slicedMessagesInnerArray);
  return slicedMessagesArray;
}
const generateStickyListDiv = () => {
    var retDiv = [];
    var slicedMessagesArray = getSlicedSessionMessages();

    //console.log( 'slicedMessagesArray length: ', slicedMessagesArray.length, ' and sessionMessages length: ', sessionMessages.length );

    for( var messageIndex = 0; messageIndex < slicedMessagesArray.length; messageIndex++ ){
          var itemAtIndex = slicedMessagesArray[messageIndex];
          if( Array.isArray(itemAtIndex) ){
            //console.log( 'array item in sliced: ', itemAtIndex );
            itemAtIndex.map( ( msg, msgIndex ) => {
              retDiv.push( <ListItem key={`item-${msgIndex}-${msg.type}`} onClick={() => {  setSessionImages([]);
                                                                      setSecondText(JSON.stringify(msg, undefined, 2));
                                                                      callBackendAPI_get_message(currentSessionId, msg.theMessageIndex).then((theResponseData) => {
                                                                        //setReplayImage(theResponseData?.data?.image?.base64Image?theResponseData?.data?.image?.base64Image:theResponseData?.data?.layout?.controls[0].image?.base64Image);
                                                                        setReplayImageFromPayload(theResponseData);
                                                                        generateThirdTextForTheMessage(msg.theMessageIndex); });
                                                                        setSelectedListItemIndex(msg.theMessageIndex);
                                                                    }}>
                            <ListItemButton selected={selectedListItemIndex === msg.theMessageIndex}>
                                <ListItemIcon>
                                  {<PlayCircle />}
                                </ListItemIcon>
                                <ListItemText primary={getMessageListText(msg)} />
                            </ListItemButton>
                          </ListItem> );

            });
          }else if(itemAtIndex.type == 2) {
            //console.log( 'type 2 item in sliced: ', itemAtIndex );
            var innerDiv = [];
            messageIndex++;
            if( messageIndex < slicedMessagesArray.length ){
              var innerMsgList = slicedMessagesArray[messageIndex];
              if( Array.isArray(innerMsgList) ){
                innerMsgList.map( ( msg, msgIndex ) => {
                  innerDiv.push( <ListItem key={`item-${msgIndex}-${msg.type}`} onClick={() => {  setSessionImages([]);
                                                                                                  setSecondText(JSON.stringify(msg, undefined, 2));
                                                                                                  callBackendAPI_get_message(currentSessionId, msg.theMessageIndex).then((theResponseData) => {
                                                                                                    //setReplayImage(theResponseData?.data?.image?.base64Image?theResponseData?.data?.image?.base64Image:theResponseData?.data?.layout?.controls[0].image?.base64Image);
                                                                                                    setReplayImageFromPayload(theResponseData);
                                                                                                    generateThirdTextForTheMessage(msg.theMessageIndex); });
                                                                                                    setSelectedListItemIndex(msg.theMessageIndex);
                                                                                                }}>
                                    <ListItemButton selected={selectedListItemIndex === msg.theMessageIndex}>
                                      <ListItemIcon>
                                        {<PlayCircle />}
                                      </ListItemIcon>
                                      <ListItemText primary={getMessageListText(msg)} />
                                  </ListItemButton>
                                </ListItem>);
                  });
            }
            retDiv.push( <li key={`section-${messageIndex}`}> <ul>
                                <ListSubheader>{getMessageListTextForListHeader(itemAtIndex)}</ListSubheader>
                                {innerDiv}
                          </ul></li>);
          }
        }
    }

    return retDiv;
}

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => {
                  setSecondText('Select a session, then select a message');
                  setThirdText('');
                  setReplayImage('');
                  setSessionImages([]);
                  callBackendAPI_list_sessions().then((theResponseData) => {
                    setSessionListData(theResponseData.data);
                  });
              }}><Refresh></Refresh></IconButton>
          <Typography variant="h8" noWrap component="div">
            Reload Sessions
          </Typography>
          <Typography variant="h4" noWrap component="div" marginLeft={'30%'}>
            Mobile Replay
          </Typography>
          <div style={{ marginLeft: "auto" }}>
          <IconButton color="inherit" onClick={() => {
                navigate('/uploadSession', { replace: false });
              }}><Upload></Upload></IconButton>
          </div>
          <Typography variant="h8" noWrap component="div">
            Upload Session
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        key={1}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {sessionListData.map((sessionItem, sessionItemIndex) => (
            <ListItem key={sessionItemIndex} disablePadding  onClick={() => { setCurrentSessionId(sessionItem.id); 
                                                                              setSelectedListItemIndex(-1);
                                                                              setReplayImage('');
                                                                              setSecondText('Select a session, then select a message');
                                                                              callBackendAPI_get_session(sessionItem.id).then(async (theResponseData) => {
                                                                                  await setSessionHitsData(theResponseData.data); 
                                                                                }); 
                                                                              callBackendAPI_get_messages(sessionItem.id).then((theResponseData) => {
                                                                                    setSessionMessages(theResponseData.data); });
                                                                              setSessionImages([]);
                                                                                  }}>
              <ListItemButton selected={currentSessionId===sessionItem.id} onClick={() => {     setCurrentSessionId(sessionItem.id); }} >
                <ListItemIcon onClick={() => {     setCurrentSessionId(sessionItem.id); }} >
                  {
                    <Delete onClick={() =>  {
                                                callBackendAPI_delete_session(sessionItem.id).then((deleteSessionResponseData) => {
                                                    console.log('deleteSessionResponseData : ', deleteSessionResponseData);
                                                    callBackendAPI_list_sessions().then((theResponseData) => {
                                                      setSessionListData(theResponseData.data); 
                                                      setSessionHitsData([{id:'-1'}]);
                                                      setSessionMessages([{id:'-1'}]);
                                                    });
                                                });
                                            }
                            }>
                    </Delete>}
                </ListItemIcon>
                <ListItemText primary={sessionItem.id.substring(0, 7)} />
              </ListItemButton>
              <ListItemButton onClick={() => {     setCurrentSessionId(sessionItem.id); }} >
                <ListItemIcon onClick={() => {     setCurrentSessionId(sessionItem.id); }} >
                  <VideoCameraBack onClick={() => {  handleVideoButtonClick(sessionItem.id); }}>
                  </VideoCameraBack>
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {['Settings'].map((text, index) => (
            <ListItem key={text} disablePadding onClick={() => {setSecondText(`${text} related data`)}}>
              <ListItemButton>
                <ListItemIcon>
                  {<InboxIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <RightPaneContent>
            <RightPaneMessageListContent>
              {/* working messages list */}
            {/* <Paper style={{maxHeight: 500, width:200, overflow: 'auto'}}>
              <List sx={{bgcolor:'#fdfefc'}}>
                  {sessionMessages.map((messageItem, messageIndex) => (
                    <ListItem key={messageIndex} disablePadding onClick={() => {  setSessionImages([]);
                                                                                  setSecondText(JSON.stringify(messageItem, undefined, 2));
                                                                                  callBackendAPI_get_message(currentSessionId, messageIndex).then((theResponseData) => {
                                                                                    setReplayImage(theResponseData?.data?.image?.base64Image);
                                                                                    generateThirdTextForTheMessage(messageIndex); });
                                                                                }}>
                      <ListItemButton>
                        <ListItemIcon>
                          {<PlayCircle />}
                        </ListItemIcon>
                        <ListItemText primary={ getMessageListText(messageItem) } />
                      </ListItemButton>
                    </ListItem>
                  ))}
              </List>
              </Paper>
              <Divider /> */}
              {/* end of working messages list */}

              {/* experimental message list */}
              <Paper style={{maxHeight: 500, width:250, overflow: 'auto'}}>
              <List
                  sx={{
                    width: '100%',
                    maxWidth: 360,
                    bgcolor: 'background.paper',
                    position: 'relative',
                    overflow: 'auto',
                    maxHeight: 500,
                    '& ul': { padding: 0 },
                  }}
                  subheader={<li />}
              >
                {
                  generateStickyListDiv()
                }
              </List>
              </Paper>
              {/* end of experimental message list */}
              <Divider></Divider>
              <List sx={{bgcolor:'#f5f5f0'}}>
                  {sessionHitsData.map((sessionHitItem, sessionHitItemIndex) => (
                    <ListItem key={sessionHitItemIndex} disablePadding onClick={() => {
                                                                                        setSessionImages([]);
                                                                                        setSecondText(JSON.stringify(sessionHitItem, undefined, 2)); 
                                                                                        setReplayImage('');
                                                                                      }}>
                      <ListItemButton>
                        <ListItemIcon>
                          {<PlayCircle />}
                        </ListItemIcon>
                        <ListItemText primary={`Hit # ${sessionHitItem.serialNumber}`} />
                      </ListItemButton>
                    </ListItem>
                  ))}
              </List>
              </RightPaneMessageListContent>
            <Typography paragraph marginLeft={'5px'}>
              {replayImageDiv}
              {/* or should I show the message text here ? */}
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Box component="span" sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}>
            <Card variant='outlined'>
            <CardContent>
              <Typography variant="subtitle1" marginLeft={'5px'}>
              <pre><code STYLE='white-space: pre-wrap;'>{secondText}</code></pre>
              </Typography>
            </CardContent>
            </Card>
            </Box>
            <Box component="span" sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)', maxWidth:500}}>
            <Card >
              <CardContent>
                <Typography variant="subtitle1" marginLeft={'5px'} noWrap={false}>
                  <code>
                    {thirdText}
                  </code>
                </Typography>
              </CardContent>
            </Card>
            </Box>
        </RightPaneContent>
      </Main>

      {/* working video replay */}
      {/* {
          <Modal
          open={openModal}
          onClose={handleModalClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Paper style={{maxHeight: 300, width:'100%', overflow: 'scroll'}}>
          <Box sx={basicModalBoxStyle}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Video Replay
            </Typography>
            {
              <div class="scrollmenu">
                {sessionImages.map((item, imageIndex) => (
                      getVideoReplayImage(imageIndex, item?.image?.base64Image)))
                }
              </div>              
            }
          </Box>
          </Paper>
        </Modal>
      } */}

      {/* experimental video replay */}
        <Modal open={openModal} onClose={handleCloseModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Paper style={{maxHeight: 300, width:'100%', overflow: 'scroll'}}>
          <Box sx={basicModalBoxStyle}>
            {
              <div className="slideshow">
                <div
                  className="slideshowSlider"
                  style={{ transform: `translate3d(${-indexSlideShow * 100}%, 0, 0)` }}
                >
                  {sessionImages.map((item, index) => (
                    <div
                      className="slide"
                      key={index}
                      //style={{ backgroundColor }}
                    >
                      {getVideoReplayImage(index, item?.image?.base64Image)}
                    </div>
                  ))}
                </div>

                <div className="slideshowDots">
                  {sessionImages.map((_, idx) => (
                    <div
                      key={idx}
                      className={`slideshowDot${indexSlideShow === idx ? " active" : ""}`}
                      onClick={() => {
                        setIndexSlideShow(idx);
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            }
            </Box>
          </Paper>
        </Modal>
      {/* end of experimental video replay */}

    </Box>
  );
}

const basicModalBoxStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
