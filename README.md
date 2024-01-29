# TOC

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Install](#install)
- [Update](#update)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Introduction

### React Native SDK and Developer Tools for HCL Discover

This repository includes the following : 

1. HCL Discover React Native SDK code that can be used by NPM Package.
2. React Native Developer tools specific to HCL Discover React Native SDK such as Application Session Replay
3. Example that shows how to use HCL Discover React Native SDK

More details will be added here about installation, integration.


## Prerequisites

1. HCL Discover React Native package assumes the React Native Application uses NavigationContainer, createNativeStackNavigator and NativeStackScreenProps from "@react-navigation/native" to setup navigation between multiple screens of the application.
2. HCL Discover React Native package uses react-native-sha256 to create various hashes needed for sessionization.
3. HCL Discover React Native package uses react-native-device-info to collect various device details.
4. react-native-sha256 and react-native-device-info will be added by following installation steps.

## Install

> If you use yarn, cd to your project folder; copy and paste the following line in terminal window

```sh
yarn add react-native-sha256 react-native-device-info react-native-hcl-discover 
```

> Or if you use npm

```sh
npm install react-native-sha256 react-native-device-info react-native-hcl-discover 
```

> Since npm auto linking is unreliable, do the following to install pods, just to be sure

```sh
cd ios
rm -rf build
pod install
cd ..
```

## Update

> If you use yarn

```sh
yarn upgrade react-native-hcl-discover 
```

> Or if you use npm

```sh
npm update react-native-hcl-discover 
```

> Install pods

```sh
cd ios
rm -rf build
pod install
cd ..
```


## Usage

> Copy and paste the following line in your App.tsx / App.js file

```js
    /* Import from  react-native-hcl-discover */
import { hclDiscoverReactNative, HCLDiscoverReactNativeContainer } from 'react-native-hcl-discover';
```

> As mentioned in prerequisites, for screen change tracking, HCL Discover React Native SDK assumes - your application is already setup with react navigation

```js
    /* Your app is expected to create instance from  createNativeStackNavigator needed to create Navigation Stack later */
const Stack = createNativeStackNavigator<RootStackParamList>();
```

```js
    /* Your app is expected to create Screens with NativeStackScreenProps. For example - */
	type Screen1Props = NativeStackScreenProps<RootStackParamList, "Screen1">;
	const Screen1: React.FC<Screen1Props> = (props) => {
  			const handleGoToNextScreenFromScreen1 = () => {
    		props.navigation.push("Screen2")
   		};
		return (
			<View>
			<Screen1View handleGoToNextScreen={handleGoToNextScreenFromScreen1}></Screen1View>
			</View>
		);
	};
```

```js
    /* Start of your app function */
function App() {
```

> Copy and paste the following line in your App function

```js
    /* At the beginning of your app function */
    /* Create a navigation reference; then pass it on to NavigationContainer as a ref */
    const navigationRef = React.useRef();
    /* Rest of your app variables and initializers */
```
> Copy and paste the following code block in your App function. This invokes start method of the SDK. Edit screen settings as needed.

```js
    /* Inside your app function */
    /* Configure your screens and invoke start method on hclDiscoverReactNative */
    useEffect(() =>{
            /* Initializer */
            var options = {
            //postMessageUrl: 'http://192.168.86.53:3001/listener', 'http://sky.discoverstore.hclcx.com/DiscoverUIPost.php',
            postMessageUrl: 'https://slicendice.vercel.app/listener', 
            killSwitchUrl:'http://localhost:3001/killOrLive',
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
                'Screen1':{
                    pause: false,
                    takeScreenShot: true,
                    blurScreenShot: 0,
                },
                'Screen2':{
                    pause: false,
                    takeScreenShot: true,
                    blurScreenShot: 5,
                },
                'Screen3':{
                    pause: false,
                    takeScreenShot: true,
                    blurScreenShot: 0,
                },
            }
        };
        hclDiscoverReactNative.start( options ).then( (value) => {
            console.debug('The hcl discover session id is', value);
            
            /* Invoke First Screen Change event log as first screen was invoked well before HCL Discover React Native SDK booted */
            hclDiscoverReactNative.logAppContext( routeNameRef?.current? routeNameRef?.current : 'Home', '' ).then( resolve => {}, reject => {});
        });
    })
```

> Your App's HTML code should be approximately as follows

```js
    /* HTML for your app function to return should resemble .. */
    /* Wrap  NavigationContainer inside HCLDiscoverReactNativeContainer and setup ref={navigationRef} */
	return (
		<HCLDiscoverReactNativeContainer>
		<NavigationContainer ref={navigationRef} >
			<Stack.Navigator>
				{your application screens here - refer to "@react-navigation/native" documentation}
				<Stack.Screen name='Screen1' component={Screen1} />
				<Stack.Screen name='Screen2' component={Screen2} options={{ title: 'Screen Two' }}/>
				<Stack.Screen name='Screen3' component={Screen3} />
			</Stack.Navigator>
		</NavigationContainer>
		</HCLDiscoverReactNativeContainer>
	);
```

```js
} /* End of your app function */
```

## Contributing

Kindly reach out to HCL Discover SDK Team.
[Details here](CONTRIBUTING.md)

## License

Apache License Version 2.0

Kindly read the [License Text](LICENSE)

---
