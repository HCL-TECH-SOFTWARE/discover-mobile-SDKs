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
import { Readable } from 'stream';

import { useFilePicker } from 'use-file-picker';

import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import ArrowBack from '@mui/icons-material/ArrowBack';


import './ProcessAndBlastSession.css';

const drawerWidth = 240;
const serverRootPath = 'https://slicendice.vercel.app/'; //'http://192.168.86.53:3001/;

export default function ProcessAndBlastSession() {
    const navigate = useNavigate();

    const { openFilePicker, filesContent, loading } = useFilePicker({
        accept: '.dca',
      });

    const [hitArray, setHitArray] = React.useState([]);
    const [hitArrayStatus, setHitArrayStatus] = React.useState([]);

    React.useEffect(() => {
        if( filesContent ){
            setHitArray([]);
            setHitArrayStatus([]);
            const requestHeaders = {
                "Content-Type": "application/json",
                //"User-Agent": _userAgent,
                "HTTP_X_DISCOVER_HASUICDATA": false,
                //"HTTP_X_DISCOVER": ( Platform.OS === 'ios' ) ? 'device (iOS) Lib/1.0.0' : 'device (android) Lib/1.0.0',
                //"HTTP_X_TEALEAF_PROPERTY": `TLT_SCREEN_HEIGHT=${Dimensions.get('window').height};TLT_SCREEN_WIDTH=${Dimensions.get('window').width};TLT_BRAND=${DeviceInfo.getBrand()}`,
                "TlNativeReplay": true,
                //"TLTSID": _sessionId,
            };
            var url = serverRootPath + 'listener';

            filesContent.map((file, index) => {
                var lines = file.content.split(/\r?\n/);
                console.log( 'line count : ', lines.length );
                lines.map(async (line, lineIndex)  => {
                    if( line == '[RequestBody]' ){
                        console.log( 'found request body' );
                        //console.log( lines[lineIndex+1] );
                        setHitArray(oldArray => [...oldArray, lines[lineIndex+1]]);

                        try{
                            var stringyfiedBody = lines[lineIndex+1];//JSON.stringify(lines[lineIndex+1]);//JSON.stringify(requestBody, undefined, 2);
                            console.log('Posting to : ', url);
                            console.log( stringyfiedBody );

                            const response = await fetch(url, {
                                    method: 'POST',
                                    headers: requestHeaders,
                                    credentials: "same-origin",
                                    body: stringyfiedBody,
                            });
                                
                            /* const responseBody = await response.json(); */ // Discover static page does not return json. It returns HTML blob
                            const responseBody = response;

                            if (response.status !== 200) {
                                console.log('Connection failed :', responseBody);
                                setHitArrayStatus(oldArray => [...oldArray, 'Connection failed']);
                            }else{
                                console.log('Connection finished :', responseBody);
                                setHitArrayStatus(oldArray => [...oldArray, 'Connection finished']);
                            }
                        }
                        catch (error) {
                            console.log('Connection failed : Fetch Exception : ', error);
                            setHitArrayStatus(oldArray => [...oldArray, 'Connection failed : Fetch Exception']);
                        }   
                    }else{
                        console.log( 'found something else' );
                    }
                });
            })
        }
    }, [filesContent]);

    return (
        <Box>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <MuiAppBar position="fixed">
                <Toolbar>
                    <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    sx={{ mr: 2, ...(1 && { display: 'none' }) }}
                    >
                    <MenuIcon />
                    </IconButton>
                    <IconButton color="inherit" onClick={() => {
                        navigate(-1);
                        }}><ArrowBack></ArrowBack></IconButton>
                    <Typography variant="h8" noWrap component="div">
                    Mobile Replay
                    </Typography>
                    <Typography variant="h4" noWrap component="div" marginLeft={'30%'}>
                    Session Feeder
                    </Typography>
                </Toolbar>
                </MuiAppBar>
            </Box>
            <Box marginTop={10}>
               <div>
                    <button onClick={() => openFilePicker()}>Select session file for processing </button>
                    <br />
                    {
                        filesContent.map((file, index) => {
                            <h1>Processing file : {file.name}</h1>
                        })
                    }
                    {hitArrayStatus.map((payload, index) => (
                        <div>
                            <h2>Hit : {index}</h2>
                            <div className='display-linebreak' key={index}>{payload}</div>
                            <br />
                        </div>
                    ))}
                </div>
            </Box>
        </Box>
    );
}