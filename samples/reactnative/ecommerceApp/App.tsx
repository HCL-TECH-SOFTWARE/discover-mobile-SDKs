import React from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CartProvider } from './src/context/CartContext';
import {HCLDiscoverReactNativeContainer, hclDiscoverReactNative} from 'react-native-hcl-discover';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ProductScreen from './src/screens/ProductScreen';
import CartScreen from './src/screens/CartScreen';
import ShippingScreen from './src/screens/ShippingScreen';
import BillingScreen from './src/screens/BillingScreen';
import OrderConfirmationScreen from './src/screens/OrderConfirmationScreen';

export type RootStackParamList = {
  Home: undefined;
  Product: { productId: string };
  Cart: undefined;
  Shipping: undefined;
  Billing: undefined;
  OrderConfirmation: { orderId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {

  const routeNameRef = useRef<string | null>(null);
  const navigationRef = useRef<any>(null);

  const getScreenName = (ref: typeof navigationRef) => {
    return ref.current?.getCurrentRoute?.()?.name;
  };

  useEffect(() =>{
    console.log('.....')
    console.log('useEffect called in App.tsx')
    console.log('.....')
 
    /* Initializer */
    var options = {
      
      postMessageUrl: 'http://10.115.147.14:8050/DDiscoverUIPost.php',
      //killSwitchUrl:'http://localhost:3001/killOrLive',
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
              blurScreenShot: 5,
          },
          'Product':{
              pause: false,
              takeScreenShot: true,
              blurScreenShot: 6,
          },
          'Cart':{
              pause: false,
              takeScreenShot: true,
              blurScreenShot: 7,
          },
          'Shipping':{
              pause: false,
              takeScreenShot: true,
              blurScreenShot: 8,
          },
          'Billing':{
              pause: false,
              takeScreenShot: true,
              blurScreenShot: 9,
          },
          'OrderConfirmation':{
              pause: false,
              takeScreenShot: true,
              blurScreenShot: 10,
          },
      }
  };
  console.debug('Calling hclDiscoverReactNative.start', hclDiscoverReactNative.start);
  hclDiscoverReactNative.start( options ).then( (value) => {
      console.debug('the session value is', value);
      hclDiscoverReactNative.logAppContext( routeNameRef?.current? routeNameRef?.current : 'HomeScreen', '' ).then( resolve => {}, reject => {});
  });
  })

  return (
    <CartProvider>
      <HCLDiscoverReactNativeContainer 
        navigationRef={navigationRef}
        getScreenName={getScreenName}
        >
      <NavigationContainer
        ref={navigationRef}
        onReady={() =>{
          console.log('NavigationContainer onReady');
          const route = navigationRef.current?.getCurrentRoute();
          routeNameRef.current = route?.name ?? '';
          console.log('[App] Current screen:', routeNameRef.current);
          }
        }
        onStateChange={() => {
          console.log('NavigationContainer onStateChange');

          const previousRouteName = routeNameRef.current;
          const currentRouteName =
            navigationRef.current?.getCurrentRoute()?.name ?? '';

          if (previousRouteName !== currentRouteName) {
            console.log(
              `[App] Screen changed: ${previousRouteName} -> ${currentRouteName}`
            );
          }
          routeNameRef.current = currentRouteName;
        }}
      >
        <Stack.Navigator
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2C3E50',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Shop',
              headerBackVisible: false,
            }}
          />
          <Stack.Screen
            name="Product"
            component={ProductScreen}
            options={{
              title: 'Product Details',
            }}
          />
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{
              title: 'Shopping Cart',
            }}
          />
          <Stack.Screen
            name="Shipping"
            component={ShippingScreen}
            options={{
              title: 'Shipping Address',
            }}
          />
          <Stack.Screen
            name="Billing"
            component={BillingScreen}
            options={{
              title: 'Billing Information',
            }}
          />
          <Stack.Screen
            name="OrderConfirmation"
            component={OrderConfirmationScreen}
            options={{
              title: 'Order Confirmed',
              headerBackVisible: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      </HCLDiscoverReactNativeContainer>
    </CartProvider>
  );
}

export default App;
