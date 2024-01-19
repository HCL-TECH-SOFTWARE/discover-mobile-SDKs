import React, {useEffect} from 'react';
import { StyleSheet, Text, View } from 'react-native';
//import {hclDiscoverLibInstance} from './HCLDiscoverReactNative';

export default function HelpScreen(){

  useEffect(() =>{
    
    var numberArray = [42, 11, 32, 2];    
    var exceptionData = {
        data:{ arr:numberArray, i:numberArray.length+1 },
        name: 'array out of bounds exception',
        description: `array length : ${numberArray.length}. Array index accessed : ${numberArray.length+1}`,
        unhandled: true,
        stackTrace: {},
    };

    // hclDiscoverLibInstance.logException(exceptionData);

  }, []);

  return (
    <View>
      <Text>Help is here :) !</Text>
    </View>
  );
}