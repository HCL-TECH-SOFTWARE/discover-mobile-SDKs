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

/**
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

import HCLDiscoverReactNative from './HCLDiscoverReactNative';
import {hclDiscoverLibInstance} from './HCLDiscoverReactNative';

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
  })

  return (
    <HCLDiscoverReactNative>
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
    </HCLDiscoverReactNative>
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
