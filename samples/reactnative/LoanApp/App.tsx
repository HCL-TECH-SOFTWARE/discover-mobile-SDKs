/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  TouchableOpacity,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import PersonalDetails from './PersonalDetails';
import HelpScreen from './HelpScreen';
import LoanDetails from './LoanDetails';

// import HCLDiscoverReactNative from './HCLDiscoverReactNative';
// import {hclDiscoverLibInstance} from './HCLDiscoverReactNative';
// <HCLDiscoverReactNative></HCLDiscoverReactNative>


import {HCLDiscoverReactNativeContainer, hclDiscoverReactNative} from 'react-native-hcl-discover';
// <HCLDiscoverReactNativeContainer></HCLDiscoverReactNativeContainer>

/* Navigation code */

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  LoanDetails: undefined;
};

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

const HomeScreen: React.FC<HomeScreenProps> = (props) => {
  const handleGoToNextScreenFromPersonalDetails = () => {
    props.navigation.push("LoanDetails")
   };

  return (
    <View>
      <PersonalDetails handleGoToNextScreen={handleGoToNextScreenFromPersonalDetails}></PersonalDetails>
    </View>
  );
};

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, "Settings">;

const SettingsScreen: React.FC<SettingsScreenProps> = (props) => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Settings Screen</Text>
      <HelpScreen></HelpScreen>
      {/* <Button title='Go to Loan Details' onPress={() => props.navigation.push("LoanDetails")} /> */}
    </View>
  );
};

type LoanDetailsScreenProps = NativeStackScreenProps<RootStackParamList, "Settings">;

const LoanDetailsScreen: React.FC<LoanDetailsScreenProps> = (props) => {
  return (
    <View style={{ flex: 1}}>
      <LoanDetails></LoanDetails>
      <TouchableOpacity style={styles.buttonStyle} onPress={() => props.navigation.push("Settings")}>
          <Text> Go to Settings </Text>
      </TouchableOpacity>
    </View>
  );
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const routeNameRef = React.useRef();
  const navigationRef = React.useRef();

  useEffect(() =>{
    console.log('.....')
    console.log('useEffect called in App.tsx')
    console.log('.....')
 
 
    /* Initializer */
    var options = {
      //postMessageUrl: 'http://192.168.86.53:3001/listener',
      //postMessageUrl: 'http://sky.discoverstore.hclcx.com/DiscoverUIPost.php',
      postMessageUrl: 'http://185.64.247.121/DiscoverUIPost.php',
      //postMessageUrl: 'http://vivre-retail.discoverstore.hclcx.com/DiscoverUIPost.php',
      //postMessageUrl: 'https://slicendice.vercel.app/listener', 
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
          // 'Home':{
          //     pause: false,
          //     takeScreenShot: true,
          //     blurScreenShot: 0,
          // },
          // 'LoanDetails':{
          //     pause: false,
          //     takeScreenShot: true,
          //     blurScreenShot: 5,
          // },
          // 'Settings':{
          //     pause: false,
          //     takeScreenShot: true,
          //     blurScreenShot: 0,
          // },
      }
  };
  console.debug('Calling hclDiscoverReactNative.start', hclDiscoverReactNative.start);
  hclDiscoverReactNative.start( options ).then( (value) => {
      console.debug('the session value is', value);
      hclDiscoverReactNative.logAppContext( routeNameRef?.current? routeNameRef?.current : 'Home', '' ).then( resolve => {}, reject => {});
  });
  })

  useEffect(() =>{
 
  })

  return (
    <HCLDiscoverReactNativeContainer>
    <NavigationContainer
    ref={navigationRef}
    onReady={() =>{
                    console.log( 'NavigationContainer onReady' );
                    routeNameRef.current = navigationRef.current.getCurrentRoute().name;
                }
      }
      onStateChange={() => {
        console.log( 'NavigationContainer onStateChange' );
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current.getCurrentRoute().name;

        if (previousRouteName !== currentRouteName) {
          // Replace the line below to add the tracker from a mobile analytics SDK
          // alert(`The screen changed from ${previousRouteName} to ${currentRouteName}`);
        }

        // Save the current route name for later comparison
        routeNameRef.current = currentRouteName;
      }}
      >
      <Stack.Navigator>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen name='LoanDetails' component={LoanDetailsScreen} options={{ title: 'Loan Details' }}/>
        <Stack.Screen name='Settings' component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </HCLDiscoverReactNativeContainer>
  );
}

/* End of Navigation code */

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function OldApp(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
            Edit <Text style={styles.highlight}>App.tsx</Text> to change this
            screen and then come back to see your edits.
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  buttonStyle: {
    marginTop: '4%',
    marginBottom: '4%',
    marginRight: '2%',
    marginLeft: '2%',
    alignItems: 'center',
    backgroundColor: '#5DAB6D',
    padding: 10
  },
});

export default App;
