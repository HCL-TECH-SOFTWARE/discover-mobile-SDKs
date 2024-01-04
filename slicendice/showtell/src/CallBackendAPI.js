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
//  "proxy": "http://localhost:3001",
const serverRootPath = 'https://slicendice.vercel.app';

export const callBackendAPI_say_hello = async () => {
    const response = await fetch(serverRootPath+'/say_hello');
    const responseBody = await response.json();
  
    if (response.status !== 200) {
      throw Error(responseBody.message) 
    }
    return responseBody;
};
export const callBackendAPI_list_sessions = async () => {
    const response = await fetch(serverRootPath+'/list_sessions');
    const responseBody = await response.json();
  
    if (response.status !== 200) {
      throw Error(responseBody.message) 
    }
    return responseBody;
};
export const callBackendAPI_get_session = async (sessionId) => {
    const response = await fetch(serverRootPath+`/get_session/${sessionId}`);
    const responseBody = await response.json();
  
    if (response.status !== 200) {
      throw Error(responseBody.message) 
    }
    return responseBody;
};
export const callBackendAPI_delete_session = async (sessionId) => {
  const response = await fetch(serverRootPath+`/delete_session/${sessionId}`);
  const responseBody = await response.json();

  if (response.status !== 200) {
    throw Error(responseBody.message) 
  }
  return responseBody;
};  
export const callBackendAPI_get_messages = async (sessionId) => {
    const response = await fetch(serverRootPath+`/get_messages/${sessionId}`);
    const responseBody = await response.json();
  
    if (response.status !== 200) {
      throw Error(responseBody.message) 
    }
    return responseBody;
};
export const callBackendAPI_get_images = async (sessionId) => {
  const response = await fetch(serverRootPath+`/get_images/${sessionId}`);
  const responseBody = await response.json();

  if (response.status !== 200) {
    throw Error(responseBody.message) 
  }
  return responseBody;
};
export const callBackendAPI_get_message = async (sessionId, messageIndex) => {
    console.log( 'getting message for session : ', sessionId, ' messageIndex ', messageIndex );
    const response = await fetch(serverRootPath+`/get_messages/${sessionId}/${messageIndex}`);
    const responseBody = await response.json();
  
    if (response.status !== 200) {
      throw Error(responseBody.message) 
    }
    return responseBody;
};