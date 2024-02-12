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
import DeviceInfo from 'react-native-device-info';
import { sha256 } from 'react-native-sha256';


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
                            _deviceLocale = _deviceLocale.length ? _deviceLocale : (Platform.OS === 'ios' ? NativeModules.SettingsManager.settings.AppleLocale ||
                                                                                            NativeModules.SettingsManager.settings.AppleLanguages[0] //For iOS 13 and later
                                                                                            : NativeModules.I18nManager.localeIdentifier // android
                                                                    );
                            _manufacturer.length ? _manufacturer : DeviceInfo.getManufacturer().then( async (promiseVal) => {_manufacturer = promiseVal});
                            _deviceUniqueId.length ? _deviceUniqueId : DeviceInfo.getUniqueId().then( async (promiseVal) => {_deviceUniqueId = promiseVal});
                            _userAgent.length ? _userAgent : DeviceInfo.getUserAgent().then( async (promiseVal) => {_userAgent = promiseVal});
                            if( Platform.OS === 'android'){
                                _fingerPrint.length ? _fingerPrint : DeviceInfo.getFingerprint().then( async (promiseVal) => {_fingerPrint = promiseVal});
                            }
                            if( _flushQueueTimerInterval > 0 ){
                            startFlushTimer();
                            }
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
        if( _messages.length > 0 ){
            flushQueue([..._messages]).then( resolve => {}, reject => {});
        }
        _sessionId = '';
        _messages = [];
    }
    _hclDiscoverLib.pause = async () => {
        if( _messages.length > 0 ){
            flushQueue([..._messages]).then( resolve => {}, reject => {});
        }
        _messages = [];
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
            _hclDiscoverLib?.debugLog(`Type 2 : Screen Change : From ${referrerScreenName} to ${screenName}`);
            if( _sessionId == undefined || _sessionId.length <= 0 ){
                _hclDiscoverLib?.debugLog('Discover not initialized');
                reject(false);
            }
            _currentScreenName = screenName;
            var currentScreenConfigs = _defaultScreen;
            if( _screens && _screens[_currentScreenName] ){
                currentScreenConfigs = _screens[_currentScreenName];
            }
            _hclDiscoverLib?.debugLog('New screen configs : ', currentScreenConfigs);
            if( currentScreenConfigs.pause ){ /** Add paused screen message so that it gets flushed */
                _hclDiscoverLib?.debugLog('Adding new screen message and flushing before pausing');
                _screenViewLoadTime = Date.now();
                _messages.push({
                    type: 2,
                    offset: offset(),
                    screenview:{
                        type: 'LOAD',
                        name: screenName,
                        referrer:referrerScreenName,
                        paused:true
                    },
                    image:{
                        base64Image: ( currentScreenConfigs && currentScreenConfigs.takeScreenShot ) ? base64Image : ''
                    }
                });
                captureClientState().then((clientStateMessage) => {
                    _messages.push(clientStateMessage);
                });
                resolve(true);
                await _hclDiscoverLib.pause(); /* pause will flush */
                _messages = []; /* we flushed and paused, reset queue */
            }else if( (_paused == true) && (currentScreenConfigs.pause == false)){
                _hclDiscoverLib?.debugLog('Discover was paused, resuming');
                await _hclDiscoverLib.resume(); /** if already paused and if current configs */
            }
            if( (_sessionId != undefined) && (_sessionId.length > 0)  && (_paused == false) ){
                _hclDiscoverLib?.debugLog('Discover is not paused, logging new screen.');
                /** New Screen */
                if( _messages.length > 0 ){
                    flushQueue([..._messages]).then( resolve => {}, reject => {});
                }
                _messages = [];
                _screenViewLoadTime = Date.now();
                setTimeout(() => {
                    var blurLevel = currentScreenConfigs?.blurScreenShot? currentScreenConfigs.blurScreenShot : _defaultScreen.blurScreenShot;
                    if( Platform.OS === 'android'){
                        if(blurLevel > 7){
                            blurLevel = 25;
                        }else{
                            blurLevel = blurLevel * 4;
                        }
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
            }
            if( _paused == true ){
                _hclDiscoverLib?.debugLog('Discover is paused');
                reject(false);
            }
            _messages.push({
                type: 3,
                offset: offset(),
                screenviewOffset: screenviewOffset(),
                connection: connectionData ? connectionData : {}
            });
            resolve(true);
        });
    }
    /* type 4 : textChange */
    _hclDiscoverLib.logTextChange = async (newValue:string, targetId:string) => {
        return new Promise( async (resolve, reject) => {
            if( _sessionId == undefined || _sessionId.length <= 0 ){
                _hclDiscoverLib?.debugLog('Discover not initialized');
                reject(false);
            }
            if( _paused == true ){
                _hclDiscoverLib?.debugLog('Discover is paused');
                reject(false);
            }
            else{
                var textValue = '';
                var currentRegex = {name: 'no regex matches'};
                if( _regexList.length > 0 ){
                    _regexList.every(regexItem => {
                        textValue = newValue.replace(regexItem.regex, regexItem.replace ? regexItem.replace : 'xxx');
                        if( textValue != newValue ){
                            _hclDiscoverLib?.debugLog( newValue, ' did match ', regexItem.regex.toString(), ' breaking ' );
                            currentRegex = regexItem;
                            return false;
                        }
                        else{
                            _hclDiscoverLib?.debugLog( newValue, ' did not match ', regexItem.regex.toString(), ' continuing ' );
                            return true;
                        }
                    });
                }
                
                _hclDiscoverLib?.debugLog('Type 4 : Text Change " ' +  textValue + ' " on target " ' + targetId + ' " ');
                var currentScreenConfigs = _defaultScreen;
                if( _screens && _screens[_currentScreenName] ){
                    currentScreenConfigs = _screens[_currentScreenName];
                }
                var blurLevel = currentScreenConfigs?.blurScreenShot? currentScreenConfigs.blurScreenShot : _defaultScreen.blurScreenShot;
                if( Platform.OS === 'android'){
                    if(blurLevel > 7){
                        blurLevel = 25;
                    }else{
                        blurLevel = blurLevel * 4;
                    }
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
    /* type 5 : custom event*/
    _hclDiscoverLib.logEvent = async (evt:{}) => {
        return new Promise( async (resolve, reject) => {
            if( _sessionId == undefined || _sessionId.length <= 0 ){
                _hclDiscoverLib?.debugLog('Discover not initialized');
                reject(false);
            }
            if( _paused == true ){
                _hclDiscoverLib?.debugLog('Discover is paused');
                reject(false);
            }
            _messages.push({
                type: 5,
                offset: offset(),
                screenviewOffset: screenviewOffset(),
                customEvent: evt ? evt : {name:'Default Custom Event', data:{}}
            });
            resolve(true);
        });
    }
    /* type 6 : exception */
    _hclDiscoverLib.logException = async (exceptionData:{}) => {
        return new Promise( async (resolve, reject) => {
            if( _sessionId == undefined || _sessionId.length <= 0 ){
                _hclDiscoverLib?.debugLog('Discover not initialized');
                reject(false);
            }
            if( _paused == true ){
                _hclDiscoverLib?.debugLog('Discover is paused');
                reject(false);
            }
            _messages.push({
                type: 6,
                offset: offset(),
                screenviewOffset: screenviewOffset(),
                exception: exceptionData ? exceptionData : {}
            });
            resolve(true);
        });
    }
    /* type 11 : gesture */
    _hclDiscoverLib.logTouch = async (evt) => {
        return new Promise( async (resolve, reject) => {
            if( _sessionId == undefined || _sessionId.length <= 0 ){
                _hclDiscoverLib?.debugLog('Discover not initialized');
                reject(false);
            }
            if( _paused == true ){
                _hclDiscoverLib?.debugLog('Discover is paused');
                reject(false);
            }else{
                    _hclDiscoverLib?.debugLog( 'Type 11 : Touch : event pageX, PageY, x, y : ' + evt.nativeEvent.pageX + ', ' + evt.nativeEvent.pageY + ', ' + 
                                                evt.nativeEvent.locationX + ', ' + evt.nativeEvent.locationY + ' on target : ' + evt.nativeEvent.target + ' event timeStamp : ' + evt.timeStamp + 
                                                ' target class ' + evt.target.viewConfig.uiViewClassName + ' node handle : ' + findNodeHandle(evt.nativeEvent.target) +
                                                ' Touch Id ' + evt.nativeEvent.identifier);
                    var touchEventIdString = '';
                    if( Platform.OS === 'android'){
                        touchEventIdString = (evt?.nativeEvent?.identifier == 0) ? 'tap' : 'pinch';
                    }else{
                        touchEventIdString = (evt?.nativeEvent?.identifier == 1) ? 'tap' : 'pinch';
                    }
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
                    var currentScreenConfigs = _defaultScreen;
                    if( _screens && _screens[_currentScreenName] ){
                        currentScreenConfigs = _screens[_currentScreenName];
                    }
                    var blurLevel = currentScreenConfigs?.blurScreenShot? currentScreenConfigs.blurScreenShot : _defaultScreen.blurScreenShot;
                    if( Platform.OS === 'android'){
                        if(blurLevel > 7){
                            blurLevel = 25;
                        }else{
                            blurLevel = blurLevel * 4;
                        }
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
    const checkKillSwitch = async () => {
        const requestHeaders = {
            "Content-Type": "application/json",
            "User-Agent": _userAgent,
            "X_DISCOVER_HASUICDATA": false,
            "X_DISCOVER": ( Platform.OS === 'ios' ) ? 'device (iOS) Lib/1.0.20' : 'device (android) Lib/1.0.20',
            "X_TEALEAF_PROPERTY": `TLT_SCREEN_HEIGHT=${Dimensions.get('window').height};TLT_SCREEN_WIDTH=${Dimensions.get('window').width};TLT_BRAND=${DeviceInfo.getBrand()}`,
            "X_DISCOVER_PROPERTY": `TLT_SCREEN_HEIGHT=${Dimensions.get('window').height};TLT_SCREEN_WIDTH=${Dimensions.get('window').width};TLT_BRAND=${DeviceInfo.getBrand()}`,
            "TlNativeReplay": true,
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
                _sessionId = hash.toUpperCase();
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
    const startFlushTimer = async () => {
    if( _stopFlushQueueTimer == false ){
        _hclDiscoverLib?.debugLog('Starting flush queue timer every ', _flushQueueTimerInterval, ' milliseconds');
        (function queueFlushIteration() {
            setTimeout(() => {
                if( _messages.length > 0 ){
                    flushQueue([..._messages]).then( resolve => {}, reject => {});
                    _messages = [];
                }else{
                    _hclDiscoverLib?.debugLog('Nothing to flush');
                }
                
                if( _stopFlushQueueTimer == false ){
                    queueFlushIteration();
                }else{
                    _hclDiscoverLib?.debugLog('Cancelled flush queue timer');
                }
            }, _flushQueueTimerInterval);
        })();
    }else{
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
                            deviceModel: DeviceInfo.getDeviceId(),
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
                        "X_DISCOVER_HASUICDATA": false,
                        "X_DISCOVER": ( Platform.OS === 'ios' ) ? 'device (iOS) Lib/1.0.20' : 'device (android) Lib/1.0.20',
                        "X_TEALEAF_PROPERTY": `TLT_SCREEN_HEIGHT=${Dimensions.get('window').height};TLT_SCREEN_WIDTH=${Dimensions.get('window').width};TLT_BRAND=${DeviceInfo.getBrand()}`,
                        "X_DISCOVER_PROPERTY": `TLT_SCREEN_HEIGHT=${Dimensions.get('window').height};TLT_SCREEN_WIDTH=${Dimensions.get('window').width};TLT_BRAND=${DeviceInfo.getBrand()}`,
                        "TlNativeReplay": true,
                        "TLTSID": _sessionId,
                        "X_DISCOVER_REACTNATIVE_MERGEID": _sessionId,
                    };
                try {
                        var stringyfiedBody = JSON.stringify(requestBody);//JSON.stringify(requestBody, undefined, 2);
                        _hclDiscoverLib?.debugLog('Posting to : ', url);
                        // _hclDiscoverLib?.debugLog('Json data : ', stringyfiedBody);
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
    };
  
    return _hclDiscoverLib;
  })();

export const HCLDiscoverReactNativeContainer = (props) => {
    const { children, captureKeyboardEvents } = props;
    const navigation = children.ref;
    const currentRoute = useRef();
    const initial = useRef(false);
    var discoverTextTracker = '';
    var discoverTextTargetTracker = '';

    const deviceKeyPressHandler = (evt, bubbledEvent) => {
        if(evt == null){
            if( discoverTextTracker != '' ){
                //hclDiscoverReactNative?.debugLog('Type 4 : Text Change " ' +  discoverTextTracker + ' " on target " ' + discoverTextTargetTracker + ' " ');
                hclDiscoverReactNative.logTextChange( discoverTextTracker, discoverTextTargetTracker ).then( resolve => {}, reject => {});
            }
        }
        if( bubbledEvent == 'DiscoverTextChangeCompleteEvent' ){
            discoverTextTracker = '';
            discoverTextTargetTracker = '';
            //hclDiscoverReactNative?.debugLog('DiscoverTextChangeEvent Event ' +  discoverTextTracker + ' bubbledEvent ' + bubbledEvent); 
        }
        else {
            //hclDiscoverReactNative?.debugLog('Global Key Press Event ' +  evt?.nativeEvent?.text + ' bubbledEvent ' + bubbledEvent + ' evt ' + evt + ' evet.nativeEvent.target ' + evt?.nativeEvent?.target ); 
            discoverTextTracker = evt?.nativeEvent?.text;
            discoverTextTargetTracker = evt?.nativeEvent?.target;
        }
      }
    
    useEffect(() => {

        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            TextInput.defaultProps = TextInput.defaultProps || {};

            hclDiscoverReactNative?.debugLog( 'Text Input props 1: ' + TextInput.defaultProps.onChange )

            var theTextHandlerVar = evt => deviceKeyPressHandler(evt, 'GlobalKeyPressEvent');
            TextInput.defaultProps.onChange = theTextHandlerVar;

            hclDiscoverReactNative?.debugLog( 'Text Input props 2: ' + TextInput.defaultProps.onChange )

            hclDiscoverReactNative?.debugLog( 'Text Input props 3: ' + (theTextHandlerVar) )

            hclDiscoverReactNative?.debugLog( 'Text Input props 3.5: ' + ((theTextHandlerVar) == TextInput.defaultProps.onChange ) )

            hclDiscoverReactNative?.debugLog( 'Text Input props 4: ' + TextInput.defaultProps.onEndEditing )
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', (evt) => {
            TextInput.defaultProps = TextInput.defaultProps || {};
            //TextInput.defaultProps.onChange = evt => deviceKeyPressHandler(evt, 'DiscoverTextChangeEvent');
        });
    
        return () => {
          showSubscription.remove();
          hideSubscription.remove();
        };
       
      }, []);

    // useEffect(() => { HCLDiscoverReactNativeBridge.interceptKeyboardEvents(captureKeyboardEvents); }, [captureKeyboardEvents]);
    
    useEffect(() => {

        hclDiscoverReactNative?.debugLog('.....')
        hclDiscoverReactNative?.debugLog('navigation changed : ', navigation)
        hclDiscoverReactNative?.debugLog('.....')

        if(!navigation || typeof navigation.current.addListener !== 'function' || typeof navigation.current.getCurrentRoute !== 'function'){
            // console.warn('HCLDiscoverReactNative: The HCLDiscoverReactNative components first child must be a NavigationContainer with a ref.');
            return;
        }
        
        const unsubscribe = navigation.current.addListener('state', () => {
            var previousRouteName = currentRoute.current;
            currentRoute.current = extractName(navigation) || navigation.current.getCurrentRoute().name;
            if (Platform.OS === 'ios' && currentRoute && currentRoute.current) {
                // HCLDiscoverReactNativePlugin.setCurrentScreenName(currentRoute.current);
            } else if (Platform.OS === 'android') {
                // HCLDiscoverReactNativeBridge.logScreenLayout(currentRoute.current);
            }
            //_hclDiscoverLib?.debugLog(`Type 2 : Screen Change : From ${previousRouteName} to ${currentRoute.current}`);
            hclDiscoverReactNative.logAppContext( currentRoute.current, previousRouteName ).then( resolve => {}, reject => {});
        });
        
        const unsubscribeOptions = navigation.current.addListener('options', (e) => {
            // You can get the new options for the currently focused screen
            hclDiscoverReactNative?.debugLog(e.data.options);
          });

        return unsubscribe;
    }, [navigation]);


    useEffect(() => {

        hclDiscoverReactNative?.debugLog('.....')
        hclDiscoverReactNative?.debugLog('navigation current changed : ', navigation.current)
        hclDiscoverReactNative?.debugLog('.....')

        const unsubscribeOptions = navigation.current.addListener('options', (e) => {
            // You can get the new options for the currently focused screen
            hclDiscoverReactNative?.debugLog('navigation current options', e.data.options);
          });

        return unsubscribeOptions;
    }, [navigation.current]);

    useEffect(() =>{
        hclDiscoverReactNative?.debugLog('.....')
        hclDiscoverReactNative?.debugLog('children changed : ', children)
        hclDiscoverReactNative?.debugLog('.....')
    },[])

    /* useEffect(() =>{
        var options = {
            postMessageUrl: 'http://192.168.86.53:3001/listener', 
            //postMessageUrl: 'http://185.64.247.121/DiscoverUIPost.php', 
            //postMessageUrl: 'http://sky.discoverstore.hclcx.com/DiscoverUIPost.php',
            killSwitchUrl:'http://localhost:3001/killswitch',
            regexList:[
                {   regex: /(?:\d{4}[ -]?){4}/gm,
                    replace:'**** **** **** ****',
                    name: 'visa card'
                },
                {   regex: /^\d{3}-?\d{2}-?\d{4}$/,
                    replace:'*** ** ****',
                    name: 'ssn'
                },
                {
                    regex: /^(?:[Pp][Oo]\s[Bb][Oo][Xx]|[0-9]+)\s(?:[0-9A-Za-z\.'#]|[^\S\r\n])+/,
                    replace: 'xx xxx xx',
                    name: 'address line 1'
                },
                {
                    regex: /^\s*\S+(?:\s+\S+){2}/,
                    replace: 'xx xxx',
                    name: 'address line 1, 2'
                },
                {
                    regex: /([a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s+(\d{5}(?:[\-]\d{4})?)/,
                    replace: 'xxxx xx xxxxx',
                    name: 'city, state, zip'
                },
                {
                    regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    replace: 'xx@xx.xxx',
                    name: 'email'
                },
            ],
            screens:{
                'Home':{
                    pause: false,
                    takeScreenShot: true,
                    blurScreenShot: 0,
                },
                'LoanDetails':{
                    pause: false,
                    takeScreenShot: true,
                    blurScreenShot: 5,
                },
                'Settings':{
                    pause: false,
                    takeScreenShot: true,
                    blurScreenShot: 0,
                },
            }
        };
        hclDiscoverReactNative.start( options ).then( (value) => {
            console.debug('the session value is', value);
            hclDiscoverReactNative.logAppContext( currentRoute?.current? currentRoute.current : 'Home', '' ).then( resolve => {}, reject => {});
        });
    }) */

    const onStartShouldSetResponderCapture = useCallback((event) => {
        currentRoute.current = extractName(navigation) || navigation.current.getCurrentRoute().name;
        if (currentRoute && currentRoute.current) {
            // HCLDiscoverReactNativePlugin.setCurrentScreenName(currentRoute.current);
        }
        // HCLDiscoverReactNativeBridge.logClickEvent(event);

        //screenshotting
        // clickclick(1.0, 1.0).then( (value) => {
        //     console.debug(value);
        //     }
        // );
        
        //hclDiscoverReactNative?.debugLog( 'captured event : ' + util.inspect(baseEvent, {showHidden: false, depth: null}) + ' on target : ' + event.nativeEvent.target );
        //hclDiscoverReactNative?.debugLog( 'Type 11 : Touch : event pageX, PageY, x, y : ' + event.nativeEvent.pageX + ', ' + event.nativeEvent.pageY + ', ' + event.nativeEvent.locationX + ', ' + event.nativeEvent.locationY + ' on target : ' + event.nativeEvent.target + ' event timeStamp : ' + event.timeStamp );
        
        // hclDiscoverReactNative.debugFlag = true;
        // hclDiscoverReactNative.printSessionId();
        
        hclDiscoverReactNative.logTouch(event).then( resolve => {}, reject => {});

        // Following gives us the right element type to track for example RCTSinglelineTextInputView or AndroidTextInput
        // Which is the info we need to use to enable text change tracking instead of keyboardshow and hide
        // once you lose the tap to some other element for example a button or another textinput; you capture it as textchange
        hclDiscoverReactNative?.debugLog(event.target.viewConfig.uiViewClassName); 

        hclDiscoverReactNative?.debugLog(' node handle : ' + findNodeHandle(event.nativeEvent.target) )

        //hclDiscoverReactNative?.debugLog( 'Element is : ' + ReactNativeComponentTree.getInstanceFromNode(event.nativeEvent.target) );

        // recurisveIterate(children);
        //hclDiscoverReactNative?.debugLog(children.props.children.props.children[0].props.component);

        React.Children.map(children, (child, childIndex) => {
            // hclDiscoverReactNative?.debugLog('child is : ', child);
            //hclDiscoverReactNative?.debugLog('text is : ', event?.nativeEvent?.text);
            deviceKeyPressHandler(null, 'DiscoverTextChangeCompleteEvent');
            React.Children.map(child, i => {
                //hclDiscoverReactNative?.debugLog('i is : ', i);
            })
        })

        return false; 
    }, []);
    
    const onStartShouldSetPanResponderCapture = useCallback((event, gestureState) => {
        hclDiscoverReactNative?.debugLog( "onStartShouldSetPanResponderCapture : event ", event  );
        hclDiscoverReactNative?.debugLog( "onStartShouldSetPanResponderCapture : gestureState ", gestureState  );
    }, []);

    const onLayout = useCallback(() => {
        if(initial.current){ return false; }
        initial.current = true;

        currentRoute.current = navigation.current.getCurrentRoute().name;
        if (Platform.OS === 'ios' && currentRoute && currentRoute.current) {
            // HCLDiscoverReactNativePlugin.setCurrentScreenName(currentRoute.current);
        } else if (Platform.OS === 'android') {
            // HCLDiscoverReactNativeBridge.logScreenLayout(currentRoute.current);
        }
        hclDiscoverReactNative?.debugLog(`Type 10 : Screen : ${currentRoute.current}`);
    }, [navigation]);

    return (
            <View style={styles.HCLDiscoverReactNative_main} 
                onLayout={onLayout}
                onStartShouldSetResponderCapture={onStartShouldSetResponderCapture}
                //onStartShouldSetPanResponderCapture={onStartShouldSetPanResponderCapture}
            >
                    {children}
            </View>
    );
};

function extractName(navigation){
  if(navigation.current.getCurrentRoute().params){
      const { name } =  navigation.current.getCurrentRoute().params
      return name
  }
  return ""
}

const styles = StyleSheet.create({
  HCLDiscoverReactNative_main: {
      flex: 1
  }
})

export function multiply(a: number, b: number): Promise<number> {
  return HclDiscover.multiply(a, b);
}
export function clickclick(white: number, alpha: number): Promise<number> {
  return HclDiscover.clickclick(white, alpha);
}

export const hclDiscoverReactNative = hclDiscoverLib;