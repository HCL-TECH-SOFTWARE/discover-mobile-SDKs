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

import React, {useCallback, useEffect, useRef} from "react";
import { Dimensions, NativeModules, Platform } from 'react-native';
import { StyleSheet , View, TextInput, Keyboard, findNodeHandle } from "react-native";
import { AppState, AppStateStatus } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { sha256 } from 'react-native-sha256';
import { DiscoverTextInputContext } from './DiscoverTextInputContext';

const REACT_NATIVE_HCL_DISCOVER_VERSION = '1.0.28';

const LINKING_ERROR =
  `The package 'react-native-hcl-discover' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const HclDiscover = NativeModules.HclDiscover
  ? NativeModules.HclDiscover
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );


var hclDiscoverLib = (function () {

    /* private variables */
    var _sessionId = '';
    var _sessionStartTime = Date.now();
    var _screenViewLoadTime = Date.now();
    var _serialNumber = 0;
    var _paused = false;
    var _postMessageUrl = 'http://192.168.86.23:3001/listener'; // 'http://185.64.247.121/DiscoverUIPost.php';
    var _killSwitchUrl = 'http://localhost:3001/killOrLive';
    var _flushQueueTimerInterval = 0;
    var _stopFlushQueueTimer = false;
    var _regexList = [];
    var _screens = {};
    var _currentScreenName = '';
    var _defaultScreen = {
        pause: false,
        takeScreenShot: true,
        blurScreenShot: 0,
    };
    var _messageVersion = '10.0.0';
    var _deviceLocale = '';
    var _totalMemory = 0;
    var _totalStorage = 0;
    var _manufacturer = '';
    var _deviceUniqueId = '';
    var _userAgent = '';
    var _fingerPrint = '';
    /* messages array */
    var _messages = [];

    var _hclDiscoverLib = {};

    /* public variables */
    _hclDiscoverLib.debugFlag = true;
    let appStateSubscription;

    /* public methods */
    _hclDiscoverLib.debugLog = (...args) => {
        if( _hclDiscoverLib.debugFlag ){
            console.log('\n~\nHCLDiscoverReactNative: \t', ...args, '\n~~~\n\n');
            // console.log(...args);
        }
    }

    _hclDiscoverLib.start = async (options:{}) => {
        _hclDiscoverLib?.debugLog('start invoked with : ', options);
        return new Promise( async (resolve, reject) => {
                if( _sessionId.length > 0){
                    _hclDiscoverLib.stop();
                }
                //clearing messages before creating new session id
                _messages = [];
                /* keep killswitch off
                checkKillSwitch().then( async (value) => {
                    if( value ){ */
                        generateSessionId().then( async (value) => {
                            _hclDiscoverLib?.debugLog('generated session id, initializing configurations ');
                            // init
                            _postMessageUrl = (options && options.postMessageUrl) ? options.postMessageUrl : _postMessageUrl;
                            _killSwitchUrl = (options && options.killSwitchUrl) ? options.killSwitchUrl : _killSwitchUrl;
                            _regexList = (options && options.regexList) ? options.regexList : _regexList;
                            _screens = (options && options.screens) ? options.screens : _screens;
        
                            if( _screens && Object.keys(_screens).length == 0 ){
                            _hclDiscoverLib?.debugLog('There are No screens defined, will start flush timer');
                            _flushQueueTimerInterval = options.flushQueueTimerInterval? options.flushQueueTimerInterval : 7000;
                            if( _flushQueueTimerInterval < 7000 ){
                                _flushQueueTimerInterval = 7000;
                            }
                            }else{
                            _hclDiscoverLib?.debugLog('There are screens defined, will not start flush timer');
                            }
                            
                            _hclDiscoverLib?.debugLog( 'starting session with sessionId : ', value, ' and _screens ', _screens );
                            
                            _totalMemory ? _totalMemory : DeviceInfo.getTotalMemory().then( async (promiseVal) => {_totalMemory = promiseVal});
                            _totalStorage ? _totalStorage : DeviceInfo.getTotalDiskCapacity().then( async (promiseVal) => {_totalStorage = promiseVal});
                            _deviceLocale = _deviceLocale.length ? _deviceLocale : (Platform.OS === 'ios' ? getAppleLocale() //For iOS 13 and later
                                                                                            : NativeModules.I18nManager.localeIdentifier // android
                                                                    );
                            _manufacturer.length ? _manufacturer : DeviceInfo.getManufacturer().then( async (promiseVal) => {_manufacturer = promiseVal});
                            _deviceUniqueId.length ? _deviceUniqueId : DeviceInfo.getUniqueId().then( async (promiseVal) => {_deviceUniqueId = promiseVal});
                            _userAgent.length ? _userAgent : DeviceInfo.getUserAgent().then( async (promiseVal) => {_userAgent = promiseVal});
                            if( Platform.OS === 'android'){
                                _fingerPrint.length ? _fingerPrint : DeviceInfo.getFingerprint().then( async (promiseVal) => {_fingerPrint = promiseVal});
                            }
                            if( _flushQueueTimerInterval > 0 ){
                                _stopFlushQueueTimer = false;
                                startFlushTimer();
                            }
                            // Register the AppState listener once during SDK initialization.
                            registerAppStateListener();
                            _hclDiscoverLib?.debugLog(
                                'Discover AppState listener registered successfully.'
                            );
                            resolve(value);
                        });
                    /* keep killswitch off}else{
                        resolve(false);
                    }
                }); */
            });
    }

    _hclDiscoverLib.stop = async () => {
        stopFlushTimer();
        var currentScreenConfigs = _defaultScreen;
        if (_screens && _screens[_currentScreenName]) {
            currentScreenConfigs = _screens[_currentScreenName];
        }
        if ((_sessionId != undefined) && (_sessionId.length > 0) && (currentScreenConfigs.pause == false)) {
            if (_messages.length > 0) {
                flushMessageQueue();
            }
        }
        _sessionId = '';
        removeAppStateListener();
    }

    _hclDiscoverLib.pause = async () => {
        var currentScreenConfigs = _defaultScreen;
        if (_screens && _screens[_currentScreenName]) {
            currentScreenConfigs = _screens[_currentScreenName];
        }
        if ((_sessionId != undefined) && (_sessionId.length > 0) && (currentScreenConfigs.pause == false)) {
            if (_messages.length > 0) {
                flushMessageQueue();
            }
        }
        _paused = true;
    }

    _hclDiscoverLib.resume = async () => {
        _paused = false;
    }

    _hclDiscoverLib.printSessionId = () => {
        _hclDiscoverLib?.debugLog('sessionId is :', _sessionId);
    }

    _hclDiscoverLib.getSessionId = () => {
        return _sessionId;
    }

    /* type 2 : screenview */
    _hclDiscoverLib.logAppContext = async (screenName:string, referrerScreenName:string) => {
        return new Promise( async (resolve, reject) => {
            if( _sessionId == undefined || _sessionId.length <= 0 ){
                _hclDiscoverLib?.debugLog('Discover not initialized');
                reject(false);
                return;
            }
            _hclDiscoverLib?.debugLog(`Type 2 : Screen Change : From ${referrerScreenName} to ${screenName}`);

            _currentScreenName = screenName;
            var currentScreenConfigs = _defaultScreen;
            if( _screens && _screens[_currentScreenName] ){
                currentScreenConfigs = _screens[_currentScreenName];
            }
            _hclDiscoverLib?.debugLog('New screen configs : ', currentScreenConfigs);

            if( currentScreenConfigs.pause == true ){
                _hclDiscoverLib?.debugLog('Discover is paused');
                reject(false);
                return;
            }
      
            if( (_sessionId != undefined) && (_sessionId.length > 0)  && (currentScreenConfigs.pause == false) ){
                _hclDiscoverLib?.debugLog('Discover is not paused, logging new screen.');
                /** New Screen */
                if( _messages.length > 0 ){
                    flushMessageQueue();
                }
                _screenViewLoadTime = Date.now();
                setTimeout(() => {
                    var blurLevel = currentScreenConfigs?.blurScreenShot? currentScreenConfigs.blurScreenShot : _defaultScreen.blurScreenShot;
                    if (Platform.OS === 'ios') {
                        blurLevel = Math.min(blurLevel, 20);
                    } else if (Platform.OS === 'android') {
                        blurLevel = Math.min(blurLevel * 4, 25);
                    }
                    clickclick(1.0, blurLevel).then( (base64Image) => {
                        _messages.push({
                            type: 2,
                            offset: offset(),
                            screenview:{
                                type: 'LOAD',
                                name: screenName,
                                referrer:referrerScreenName,
                                paused:false
                            },
                            image:{
                                base64Image: ( currentScreenConfigs && currentScreenConfigs.takeScreenShot ) ? base64Image : ''
                            }
                        });
                        captureClientState().then((clientStateMessage) => {
                            _messages.push(clientStateMessage);
                        });
                        resolve(true);
                    });                    
                },500)

            }
        });
    }

    /* type 3 : connection */
    _hclDiscoverLib.logConnection = async (connectionData:{}) => {
        return new Promise( async (resolve, reject) => {
            if( _sessionId == undefined || _sessionId.length <= 0 ){
                _hclDiscoverLib?.debugLog('Discover not initialized');
                reject(false);
                return;
            }
            var currentScreenConfigs = _defaultScreen;
            if( _screens && _screens[_currentScreenName] ){
                currentScreenConfigs = _screens[_currentScreenName];
            }

             if( currentScreenConfigs.pause == true ){
                _hclDiscoverLib?.debugLog('Discover is paused');
                reject(false);
                return;
            }
            if( (_sessionId != undefined) && (_sessionId.length > 0)  && (currentScreenConfigs.pause == false) ) {
                 _messages.push({
                    type: 3,
                    offset: offset(),
                    screenviewOffset: screenviewOffset(),
                    connection: connectionData ? connectionData : {}
                 });
                resolve(true);
            }
        
        });
    }

    /* type 4 : textChange */
    _hclDiscoverLib.logTextChange = async (newValue,currentRegexValue,targetId) => {
        return new Promise( async (resolve, reject) => {
            if( _sessionId == undefined || _sessionId.length <= 0 ){
                _hclDiscoverLib?.debugLog('Discover not initialized');
                reject(false);
                return;
            }

            var currentScreenConfigs = _defaultScreen;
            if( _screens && _screens[_currentScreenName] ){
                currentScreenConfigs = _screens[_currentScreenName];
            }

             if( currentScreenConfigs.pause == true ){
                _hclDiscoverLib?.debugLog('Discover is paused');
                reject(false);
                return;
            }

            if( (_sessionId != undefined) && (_sessionId.length > 0)  && (currentScreenConfigs.pause == false) ) {
                
                var textValue = newValue;
                var currentRegex = currentRegexValue;
                
                _hclDiscoverLib?.debugLog('Type 4 : Text Change " ' +  textValue + ' " on target " ' + targetId + ' " ');
                
                var blurLevel = currentScreenConfigs?.blurScreenShot? currentScreenConfigs.blurScreenShot : _defaultScreen.blurScreenShot;
                if (Platform.OS === 'ios') {
                    blurLevel = Math.min(blurLevel, 20);
                } else if (Platform.OS === 'android') {
                    blurLevel = Math.min(blurLevel * 4, 25);
                }
                clickclick(1.0, blurLevel).then( (base64Image) => {
                    _messages.push({
                        type: 4,
                        offset: offset(),
                        screenviewOffset: screenviewOffset(),
                        target:{
                            id:targetId,
                            currState:{
                                text: textValue,
                                matched:currentRegex
                            },
                        },
                        event:{
                            tlEvent: 'textChange',
                            type: 'textChange'
                        },
                        image:{
                            base64Image: ( currentScreenConfigs && currentScreenConfigs.takeScreenShot ) ? base64Image : ''
                        }
                    });
                    resolve(true);
                });
            }
        });
    }    

     _hclDiscoverLib.getMaskedText = (newValue) => {
        let textValue = newValue;
        let currentRegex = { name: 'no regex matches' };

        if (_regexList.length > 0) {
            _regexList.every((regexItem) => {
                const maskedValue = newValue.replace(
                    regexItem.regex,
                    regexItem.replace || 'xxx'
                );

                if (maskedValue !== newValue) {
                    _hclDiscoverLib?.debugLog(
                        newValue,
                        ' did match ',
                        regexItem.regex.toString(),
                        ' breaking '
                    );
                    textValue = maskedValue;
                    currentRegex = regexItem;
                    return false; // Stop at first matching regex
                }

                _hclDiscoverLib?.debugLog(
                    newValue,
                    ' did not match ',
                    regexItem.regex.toString(),
                    ' continuing '
                );

                return true; // Try next regex
            });
        }

        return {textValue,currentRegex};
    }

    /* type 5 : custom event*/
    _hclDiscoverLib.logEvent = async (evt:{}) => {
        return new Promise( async (resolve, reject) => {
            if( _sessionId == undefined || _sessionId.length <= 0 ){
                _hclDiscoverLib?.debugLog('Discover not initialized');
                reject(false);
                return;
            }
            var currentScreenConfigs = _defaultScreen;
            if( _screens && _screens[_currentScreenName] ){
                currentScreenConfigs = _screens[_currentScreenName];
            }

             if( currentScreenConfigs.pause == true ){
                _hclDiscoverLib?.debugLog('Discover is paused');
                reject(false);
                return;
            }
            if ((_sessionId != undefined) && (_sessionId.length > 0) && (currentScreenConfigs.pause == false)) {
                _messages.push({
                    type: 5,
                    offset: offset(),
                    screenviewOffset: screenviewOffset(),
                    customEvent: evt ? evt : { name: 'Default Custom Event', data: {} }
                });
                resolve(true);
            }
           
        });
    }

    /* type 6 : exception */
    _hclDiscoverLib.logException = async (exceptionData:{}) => {
        return new Promise( async (resolve, reject) => {
            if( _sessionId == undefined || _sessionId.length <= 0 ){
                _hclDiscoverLib?.debugLog('Discover not initialized');
                reject(false);
                return;
            }
            var currentScreenConfigs = _defaultScreen;
            if( _screens && _screens[_currentScreenName] ){
                currentScreenConfigs = _screens[_currentScreenName];
            }

             if( currentScreenConfigs.pause == true ){
                _hclDiscoverLib?.debugLog('Discover is paused');
                reject(false);
                return;
            }
            if ((_sessionId != undefined) && (_sessionId.length > 0) && (currentScreenConfigs.pause == false)) {
                _messages.push({
                    type: 6,
                    offset: offset(),
                    screenviewOffset: screenviewOffset(),
                    exception: exceptionData ? exceptionData : {}
                });
                resolve(true);
            }
           
        });
    }

    /* type 11 : gesture */
    _hclDiscoverLib.logTouch = async (evt) => {
        return new Promise( async (resolve, reject) => {
            if( _sessionId == undefined || _sessionId.length <= 0 ){
                _hclDiscoverLib?.debugLog('Discover not initialized');
                reject(false);
                return;
            }
            var currentScreenConfigs = _defaultScreen;
            if( _screens && _screens[_currentScreenName] ){
                currentScreenConfigs = _screens[_currentScreenName];
            }

             if( currentScreenConfigs.pause == true ){
                _hclDiscoverLib?.debugLog('Discover is paused');
                reject(false);
                return;
            }
            if( (_sessionId != undefined) && (_sessionId.length > 0)  && (currentScreenConfigs.pause == false) ) {
                    const nativeEvent = evt?.nativeEvent;
                    const target = nativeEvent?.target;

                    _hclDiscoverLib?.debugLog(
                    `Type 11 : Touch : ` +
                    `pageX=${nativeEvent?.pageX ?? 'N/A'}, ` +
                    `pageY=${nativeEvent?.pageY ?? 'N/A'}, ` +
                    `x=${nativeEvent?.locationX ?? 'N/A'}, ` +
                    `y=${nativeEvent?.locationY ?? 'N/A'}, ` +
                    `target=${target ?? 'N/A'}, ` +
                    `timeStamp=${evt?.timeStamp ?? 'N/A'}, ` +
                    `targetClass=${evt?.target?.viewConfig?.uiViewClassName ?? 'N/A'}, ` +
                    `nodeHandle=${typeof target === 'number' ? target : 'N/A'}, ` +
                    `touchId=${nativeEvent?.identifier ?? 'N/A'}`
                    );
                    
                    var touchEventIdString = 'tap';
                    // if( Platform.OS === 'android'){
                    //     touchEventIdString = (evt?.nativeEvent?.identifier == 0) ? 'tap' : 'pinch';
                    // }else{
                    //     touchEventIdString = (evt?.nativeEvent?.identifier == 1) ? 'tap' : 'pinch';
                    // }

                    var touchEvtMessage = {
                        type: 11,
                        offset: offset(),
                        screenviewOffset: screenviewOffset(),
                        event:{
                            type: evt?.nativeEvent?.identifier,
                            tlEvent: touchEventIdString,
                        },
                        touches:[
                            {
                                position:{
                                    x: evt?.nativeEvent?.locationX,
                                    y: evt?.nativeEvent?.locationY,
                                    pageX: evt?.nativeEvent?.pageX,
                                    pageY: evt?.nativeEvent?.pageY
                                },
                                control:{
                                    id: findNodeHandle(evt?.nativeEvent?.target),
                                    type: evt?.target?.viewConfig?.uiViewClassName
                                }
                            }
                        ],
                        //nativeTouches: evt?.nativeEvent?.touches
                        image:{
                            base64Image:'',
                        }
                    }
                    
                    var blurLevel = currentScreenConfigs?.blurScreenShot? currentScreenConfigs.blurScreenShot : _defaultScreen.blurScreenShot;
                    if (Platform.OS === 'ios') {
                        blurLevel = Math.min(blurLevel, 20);
                    } else if (Platform.OS === 'android') {
                        blurLevel = Math.min(blurLevel * 4, 25);
                    }
                    clickclick(1.0, blurLevel).then( (base64Image) => {
                            touchEvtMessage.image.base64Image = ( currentScreenConfigs && currentScreenConfigs.takeScreenShot ) ? base64Image : '';
                            _messages.push(touchEvtMessage);
                            resolve(true);
                    });
                }
        });
    }
  
    /* private methods */
     const getAppleLocale = () => {
        if (Platform.OS !== 'ios') {
        return null;
        }

        const settings = NativeModules.SettingsManager?.settings;

        return (
        settings?.AppleLocale ??
        settings?.AppleLanguages?.[0] ??
        'en_US'
        );
    };

    //To flush the data when the app goes to background
    const registerAppStateListener = () => {
        // Prevent duplicate listeners.
        if (appStateSubscription) {
            return;
        }

        appStateSubscription = AppState.addEventListener(
            'change',
            (nextAppState) => {
                if (nextAppState === 'background') {
                    _hclDiscoverLib?.debugLog(
                        'App moved to background. Flushing Discover queue.'
                    );
                    var currentScreenConfigs = _defaultScreen;
                    if( _screens && _screens[_currentScreenName] ){
                        currentScreenConfigs = _screens[_currentScreenName];
                    }
                    if( (_sessionId != undefined) && (_sessionId.length > 0)  && (currentScreenConfigs.pause == false) ) {
                        if (_messages.length > 0) {
                            flushMessageQueue();
                        }
                    }
                    else {
                            _hclDiscoverLib?.debugLog(
                            'Discover queue is not flushed'
                        );
                    }
                }
            }
        );
    };

    const removeAppStateListener = () => {
        appStateSubscription?.remove();
        appStateSubscription = undefined;
    };

    const checkKillSwitch = async () => {
        if( killSwitchUrl && killSwitchUrl.length > 0 ){
            const requestHeaders = {
                "Content-Type": "application/json",
                "User-Agent": _userAgent,
                "X_DISCOVER_HASUICDATA": "false",
                "X_DISCOVER": ( Platform.OS === 'ios' ) ? `device (iOS) Lib/${REACT_NATIVE_HCL_DISCOVER_VERSION}` : `device (Android) Lib/${REACT_NATIVE_HCL_DISCOVER_VERSION}`,
                "X_DISCOVER_PROPERTY": `TLT_SCREEN_HEIGHT=${Dimensions.get('window').height};TLT_SCREEN_WIDTH=${Dimensions.get('window').width};TLT_BRAND=${DeviceInfo.getBrand()}`,
                "TlNativeReplay": "true",
            };
            try {
                _hclDiscoverLib?.debugLog('Killswitch check : ', killSwitchUrl);
                // _hclDiscoverLib?.debugLog('Json data : ', stringyfiedBody);
                const response = await fetch(url, {
                        method: 'GET',
                        headers: requestHeaders,
                        credentials: "same-origin",
                        body: '',
                });
                    
                const responseBody = response;
    
                if (response.status !== 200) {
                    _hclDiscoverLib?.debugLog('Killswitch check Connection failed :', responseBody);
                    reject(false);
                }else{
                    _hclDiscoverLib?.debugLog('Killswitch check Connection finished :', responseBody);
                    if( responseBody && responseBody.toString().includes('1') ){
                        resolve(true); 
                    }else{
                        reject(false);
                    }
                }
    
            } catch (error) {
                _hclDiscoverLib?.debugLog('Killswitch check Connection failed : Fetch Exception : ', error);
                reject(false);
            }  
        }else{
            resolve(true);
        }
    }

    const offset = () => {
        return (Date.now() - _sessionStartTime);
    }

    const screenviewOffset = () => {
        return (Date.now() - _screenViewLoadTime);
    }

    /* generate new session Id */
    const generateSessionId = async () => {
        _hclDiscoverLib?.debugLog('generateSessionId invoked');
        return new Promise( async (resolve, reject) => {
            var deviceIdStr = DeviceInfo.getDeviceId();
            _hclDiscoverLib?.debugLog('deviceIdStr is', deviceIdStr);
            _sessionStartTime = Date.now();
            _screenViewLoadTime = _sessionStartTime;
            var dateTimeStr = _sessionStartTime.toString();
            sha256(deviceIdStr+dateTimeStr).then( hash => {
                _sessionId = hash.substring(0, 32).toUpperCase();
                _serialNumber = 1;
                _hclDiscoverLib?.debugLog('generated sessionId is :', _sessionId);
                resolve( _sessionId );
            })
        });
    }

    /* type 1 */
    const captureClientState = async () => {
        return new Promise( async (resolve, reject) => {
            var clientStateMessage = {
                type: 1,
                offset: offset(),
                screenviewOffset: screenviewOffset(),
                mobileState:{
                    orientation:( Dimensions.get('window').width > Dimensions.get('window').height ) ? 90 : 0,
                }
            };
            DeviceInfo.getFreeDiskStorage().then((freeStorage) => {
                clientStateMessage.mobileState.freeStorage = freeStorage;
                DeviceInfo.getBatteryLevel().then((batteryLevel) => {
                    clientStateMessage.mobileState.battery = batteryLevel;
                    DeviceInfo.getUsedMemory().then((usedMemory) => {
                        clientStateMessage.mobileState.freeMemory = (_totalMemory - usedMemory);
                        DeviceInfo.getCarrier().then((carrier) => {
                            clientStateMessage.mobileState.connectionType = 'Unknown';
                            clientStateMessage.mobileState.networkReachability = 'Unknown';
                            clientStateMessage.mobileState.ip = '0.0.0.0';
                            clientStateMessage.mobileState.carrier = carrier;
                            resolve( clientStateMessage );
                        });
                    });
                });
            });
        });
    }
    
    const flushMessageQueue = async () => {
        const payload = [..._messages];
        // Temporarily remove messages from the queue
        _messages = [];
        try {
            await flushQueue(payload);

            _hclDiscoverLib?.debugLog(
                'Queue flushed successfully'
            );
        } catch (error) {
            // Restore failed messages before newer messages
            _messages = [...payload, ..._messages];

            _hclDiscoverLib?.debugLog(
                'Flush failed. Messages restored to queue.',
                error
            );
        }
    }

    const startFlushTimer = async () => {
        if (_stopFlushQueueTimer == false) {
            _hclDiscoverLib?.debugLog('Starting flush queue timer every ', _flushQueueTimerInterval, ' milliseconds');
            (function queueFlushIteration() {
                setTimeout(async () => {
                    if (_messages.length > 0) {
                        flushMessageQueue();
                    } else {
                        _hclDiscoverLib?.debugLog('Nothing to flush');
                    }

                    if (_stopFlushQueueTimer == false) {
                        queueFlushIteration();
                    } else {
                        _hclDiscoverLib?.debugLog('Cancelled flush queue timer');
                    }
                }, _flushQueueTimerInterval);
            })();
        } else {
            _hclDiscoverLib?.debugLog('Flush queue timer is already on');
        }
    }

    const stopFlushTimer = async () => {
        _hclDiscoverLib?.debugLog('Cancelling flush queue timer');
        _stopFlushQueueTimer = true;
    }

    /* post to discover */
    const flushQueue = async (payload) => {
        return new Promise( async (resolve, reject) => {
        /* check if there is connection before posting */
            if( _sessionId == undefined || _sessionId.length <= 0 ){
                _hclDiscoverLib?.debugLog('Discover not initialized');
                reject(false);
            }
            var isConnectedToWWW = true;
            if( isConnectedToWWW ){
                const url = _postMessageUrl;
                const requestBody = {
                        serialNumber: _serialNumber++,
                        messageVersion: _messageVersion,
                        sessions:[{
                        startTime: _sessionStartTime,
                        id: _sessionId,
                        messages:payload,
                        clientEnvironment:{
                            mobileEnvironment:{
                                keyboardType: 3,
                                brand: DeviceInfo.getBrand(),
                                fingerPrint: _fingerPrint
                            },
                            totalMemory: _totalMemory,
                            totalStorage: _totalStorage,
                            orientationType: ( Dimensions.get('window').width > Dimensions.get('window').height ) ? 'LANDSCAPE' : 'PORTRAIT',
                            appVersion: DeviceInfo.getReadableVersion(),
                            manufacturer: _manufacturer,
                            deviceId: _deviceUniqueId,
                            local: _deviceLocale,
                            deviceModel: (Platform.OS === 'ios' ? DeviceInfo.getDeviceId() : DeviceInfo.getModel()),
                            appName: DeviceInfo.getApplicationName(),
                            language: _deviceLocale,
                            osType: Platform.OS,
                            width: Dimensions.get('screen').width,
                            height: Dimensions.get('screen').height,
                            deviceWidth: Dimensions.get('window').width,
                            deviceHeight: Dimensions.get('window').height,
                            pixelDensity: Dimensions.get('screen').scale,
                            osVersion: DeviceInfo.getSystemVersion()
                            },
                        }],
                    };
            
                const requestHeaders = {
                        "Content-Type": "application/json",
                        "User-Agent": _userAgent,
                        "X_DISCOVER_HASUICDATA": "false",
                        "X_DISCOVER": ( Platform.OS === 'ios' ) ? `device (iOS) Lib/${REACT_NATIVE_HCL_DISCOVER_VERSION}` : `device (Android) Lib/${REACT_NATIVE_HCL_DISCOVER_VERSION}`,
                        "X_DISCOVER_PROPERTY": `TLT_SCREEN_HEIGHT=${Dimensions.get('window').height};TLT_SCREEN_WIDTH=${Dimensions.get('window').width};TLT_BRAND=${DeviceInfo.getBrand()}`,
                        "TlNativeReplay": "true",
                        "TLTSID": _sessionId,
                        "X_DISCOVER_REACTNATIVE_MERGEID": _sessionId,
                    };
                try {
                        var stringyfiedBody = JSON.stringify(requestBody);//JSON.stringify(requestBody, undefined, 2);

                        _hclDiscoverLib?.debugLog('requestBody', requestBody);
                        _hclDiscoverLib?.debugLog('Json_data : ', stringyfiedBody);

                        _hclDiscoverLib?.debugLog('Posting to : ', url);
                       
                        const response = await fetch(url, {
                                method: 'POST',
                                headers: requestHeaders,
                                credentials: "same-origin",
                                body: stringyfiedBody,
                        });
                            
                        /* const responseBody = await response.json(); */ // Discover static page does not return json. It returns HTML blob
                        const responseBody = response;

                        if (response.status !== 200) {
                            _hclDiscoverLib?.debugLog('Connection failed : status : ', response.status, response.statusText, responseBody);
                            reject(false);
                        }else{
                            _hclDiscoverLib?.debugLog('Connection finished : status : ', response.status, response.statusText, responseBody);
                            resolve(true);
                        }

                } catch (error) {
                    _hclDiscoverLib?.debugLog('Connection failed : Fetch Exception : ', error);
                    reject(false);
                }    
            }
            else{
                _hclDiscoverLib?.debugLog('Connection failed : No network');
                reject(false);
            }
        });
    }

    return _hclDiscoverLib;
  })();


export const HCLDiscoverReactNativeContainer = (props) => {
    const {
        children,
        navigationRef,
        getScreenName = (ref) =>
            ref?.current?.getCurrentRoute?.()?.name,
    } = props;

    const currentRoute = useRef(null);
    const previousRoute = useRef(null);
    const initial = useRef(false);

    const discoverTextTracker = useRef(null);
    const discoverTextTargetTracker = useRef(null);

    //Handling Type : 4 - user entered text
    const deviceKeyPressHandler = useCallback(
        (evt, bubbledEvent,textInput) => {

            // Update the latest text and input target.
            if (evt?.nativeEvent) {
                discoverTextTracker.current =
                    evt.nativeEvent.text ?? '';

                discoverTextTargetTracker.current =
                    evt.nativeEvent.target ?? null;

                hclDiscoverReactNative?.debugLog(
                    `Text updated; length=${discoverTextTracker.current.length}, ` +
                    `target=${String(discoverTextTargetTracker.current)}`
                );
            }

            // Log the final text when editing ends.
            if (evt == null && bubbledEvent === 'DiscoverTextChangeCompleteEvent') {
                const text = discoverTextTracker.current;
                const target = discoverTextTargetTracker.current;

                if (text !== '' && text !== null) {
                    const { textValue, currentRegex } = hclDiscoverReactNative
                        ?.getMaskedText(text);

                    if(textInput) {
                        textInput.setNativeProps({ text: textValue });
                    }
                    hclDiscoverReactNative
                        ?.logTextChange(textValue, currentRegex,target)
                        .catch((error) => {
                            hclDiscoverReactNative?.debugLog(
                                `logTextChange failed: ${String(error)}`
                            );
                        });
                }

                discoverTextTracker.current = '';
                discoverTextTargetTracker.current = null;
                return;
            }
        },
        [hclDiscoverReactNative]
    );

    //Handling Type : 2 - Screen load/Navigations
    useEffect(() => {
        const nav = navigationRef?.current;

        if (!nav || typeof nav.addListener !== 'function' || typeof nav.getCurrentRoute !== 'function') {
            hclDiscoverReactNative?.debugLog('Navigation ref is not available');
            return;
        }

        const trackCurrentScreen = () => {
           
            const currentScreenName = getScreenName(navigationRef);

            if (!currentScreenName) {
                return;
            }
            // Do not process repeated events for the same screen.
            if (currentRoute.current === currentScreenName) {
                return;
            }

            const previousScreenName = currentRoute.current;

            previousRoute.current = previousScreenName;
            currentRoute.current = currentScreenName;

            hclDiscoverReactNative?.debugLog(
                'Previous screen:',
                previousScreenName ?? '(initial)'
            );

            hclDiscoverReactNative?.debugLog(
                'Current screen:',
                currentScreenName
            );

            hclDiscoverReactNative
                ?.logAppContext(
                    currentScreenName,
                    previousScreenName ?? ''
                )
                ?.catch(error => {
                    hclDiscoverReactNative?.debugLog(
                        'Error logging screen change:',
                        error
                    );
                });
        };

        // Track the initial screen.
        trackCurrentScreen();

        // Track subsequent screen changes.
        const unsubscribeState = nav.addListener(
            'state',
            trackCurrentScreen
        );

        // Keep this listener only if you also need navigation options.
        const unsubscribeOptions = nav.addListener(
            'options',
            event => {
                hclDiscoverReactNative?.debugLog(
                    'Navigation options changed:',
                    event?.data?.options
                );
            }
        );

        return () => {
            unsubscribeState();
            unsubscribeOptions();
        };
    }, [navigationRef]);

    //Handling Type : 11 - gestures
    const onStartShouldSetResponderCapture = useCallback((event) => {
        // Log the touch event to the Discover SDK.
        hclDiscoverReactNative.logTouch(event).catch((error) => {
            hclDiscoverReactNative?.debugLog(`logTouch failed: ${String(error)}`);
        });

        // Safely retrieve the native event target.
        const target = event?.nativeEvent?.target;

        // Log the native view class when available.
        const viewConfig = event?.target?.viewConfig;
        const uiViewClassName = viewConfig?.uiViewClassName;

        if (uiViewClassName) {
            hclDiscoverReactNative?.debugLog(uiViewClassName);
        }

        // Log the native node handle.
        const nodeHandle =
            target != null ? findNodeHandle(target) : null;

        hclDiscoverReactNative?.debugLog(
            `node handle: ${nodeHandle ?? 'unavailable'}`
        );

        // Notify Discover that text-change tracking may be required.
        // deviceKeyPressHandler(
        //     null,
        //     'DiscoverTextChangeCompleteEvent'
        // );

        // Observe the responder event without claiming the responder.
        return false;

    }, [hclDiscoverReactNative, deviceKeyPressHandler]);

    //onLayout changes Type - 10 partially implemented
    const onLayout = useCallback(() => {
        if (initial.current) {
            return;
        }

        initial.current = true;

        const screenName = navigationRef?.current?.getCurrentRoute?.()?.name;

        if (screenName) {
            hclDiscoverReactNative?.debugLog(`Type 10 : Screen : ${screenName}`);
        }
    }, [navigationRef]);

    return (
        <View style={styles.HCLDiscoverReactNative_main}
            onLayout={onLayout}
            onStartShouldSetResponderCapture={onStartShouldSetResponderCapture}
        >
            <DiscoverTextInputContext.Provider
                value={deviceKeyPressHandler}
            >
                {children}
            </DiscoverTextInputContext.Provider>
        </View>
    );
};

function extractName(navigation){
  try {
        if(navigation?.current?.getCurrentRoute?.()?.params){
            const { name } = navigation.current.getCurrentRoute().params;
            return name;
        }
    } catch (error) {
        console.log('Error extracting name:', error);
    }
    return "";
}

const styles = StyleSheet.create({
  HCLDiscoverReactNative_main: {
      flex: 1
  }
})

export function multiply(a, b) {
  return HclDiscover.multiply(a, b);
}
export function clickclick(white, alpha) {
  return HclDiscover.clickclick(white, alpha);
}

export const hclDiscoverReactNative = hclDiscoverLib;

export { default as HCLDiscoverTextInput } from './HCLDiscoverTextInput';
