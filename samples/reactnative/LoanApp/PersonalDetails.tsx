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

import React, {useEffect} from 'react';
import type {PropsWithChildren} from 'react';
import { useState } from "react";
import * as Progress from 'react-native-progress';
import {Dimensions} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import CheckBox from '@react-native-community/checkbox';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import {
    Colors,
    DebugInstructions,
    Header,
    LearnMoreLinks,
    ReloadInstructions,
  } from 'react-native/Libraries/NewAppScreen';
  
  import {hclDiscoverLibInstance} from './HCLDiscoverReactNative';

  type LAVFlexBoxProps = PropsWithChildren<{
    handleGoToNextScreen: () => any;
  }>;

var countryList = [
  {label: "Albania", value: "AL"},
  {label: "Åland Islands", value: "AX"},
  {label: "Algeria", value: "DZ"},
  {label: "American Samoa", value: "AS"},
  {label: "Andorra", value: "AD"},
  {label: "Angola", value: "AO"},
  {label: "Anguilla", value: "AI"},
  {label: "Antarctica", value: "AQ"},
  {label: "Antigua and Barbuda", value: "AG"},
  {label: "Argentina", value: "AR"},
  {label: "Armenia", value: "AM"},
  {label: "Aruba", value: "AW"},
  {label: "Australia", value: "AU"},
  {label: "Austria", value: "AT"},
  {label: "Azerbaijan", value: "AZ"},
  {label: "Bahamas (the)", value: "BS"},
  {label: "Bahrain", value: "BH"},
  {label: "Bangladesh", value: "BD"},
  {label: "Barbados", value: "BB"},
  {label: "Belarus", value: "BY"},
  {label: "Belgium", value: "BE"},
  {label: "Belize", value: "BZ"},
  {label: "Benin", value: "BJ"},
  {label: "Bermuda", value: "BM"},
  {label: "Bhutan", value: "BT"},
  {label: "Bolivia (Plurinational State of)", value: "BO"},
  {label: "Bonaire, Sint Eustatius and Saba", value: "BQ"},
  {label: "Bosnia and Herzegovina", value: "BA"},
  {label: "Botswana", value: "BW"},
  {label: "Bouvet Island", value: "BV"},
  {label: "Brazil", value: "BR"},
  {label: "British Indian Ocean Territory (the)", value: "IO"},
  {label: "Brunei Darussalam", value: "BN"},
  {label: "Bulgaria", value: "BG"},
  {label: "Burkina Faso", value: "BF"},
  {label: "Burundi", value: "BI"},
  {label: "Cabo Verde", value: "CV"},
  {label: "Cambodia", value: "KH"},
  {label: "Cameroon", value: "CM"},
  {label: "Canada", value: "CA"},
  {label: "Cayman Islands (the)", value: "KY"},
  {label: "Central African Republic (the)", value: "CF"},
  {label: "Chad", value: "TD"},
  {label: "Chile", value: "CL"},
  {label: "China", value: "CN"},
  {label: "Christmas Island", value: "CX"},
  {label: "Cocos (Keeling) Islands (the)", value: "CC"},
  {label: "Colombia", value: "CO"},
  {label: "Comoros (the)", value: "KM"},
  {label: "Congo (the Democratic Republic of the)", value: "CD"},
  {label: "Congo (the)", value: "CG"},
  {label: "Cook Islands (the)", value: "CK"},
  {label: "Costa Rica", value: "CR"},
  {label: "Croatia", value: "HR"},
  {label: "Cuba", value: "CU"},
  {label: "Curaçao", value: "CW"},
  {label: "Cyprus", value: "CY"},
  {label: "Czechia", value: "CZ"},
  {label: "Côte d'Ivoire", value: "CI"},
  {label: "Denmark", value: "DK"},
  {label: "Djibouti", value: "DJ"},
  {label: "Dominica", value: "DM"},
  {label: "Dominican Republic (the)", value: "DO"},
  {label: "Ecuador", value: "EC"},
  {label: "Egypt", value: "EG"},
  {label: "El Salvador", value: "SV"},
  {label: "Equatorial Guinea", value: "GQ"},
  {label: "Eritrea", value: "ER"},
  {label: "Estonia", value: "EE"},
  {label: "Eswatini", value: "SZ"},
  {label: "Ethiopia", value: "ET"},
  {label: "Falkland Islands (the) [Malvinas]", value: "FK"},
  {label: "Faroe Islands (the)", value: "FO"},
  {label: "Fiji", value: "FJ"},
  {label: "Finland", value: "FI"},
  {label: "France", value: "FR"},
  {label: "French Guiana", value: "GF"},
  {label: "French Polynesia", value: "PF"},
  {label: "French Southern Territories (the)", value: "TF"},
  {label: "Gabon", value: "GA"},
  {label: "Gambia (the)", value: "GM"},
  {label: "Georgia", value: "GE"},
  {label: "Germany", value: "DE"},
  {label: "Ghana", value: "GH"},
  {label: "Gibraltar", value: "GI"},
  {label: "Greece", value: "GR"},
  {label: "Greenland", value: "GL"},
  {label: "Grenada", value: "GD"},
  {label: "Guadeloupe", value: "GP"},
  {label: "Guam", value: "GU"},
  {label: "Guatemala", value: "GT"},
  {label: "Guernsey", value: "GG"},
  {label: "Guinea", value: "GN"},
  {label: "Guinea-Bissau", value: "GW"},
  {label: "Guyana", value: "GY"},
  {label: "Haiti", value: "HT"},
  {label: "Heard Island and McDonald Islands", value: "HM"},
  {label: "Holy See (the)", value: "VA"},
  {label: "Honduras", value: "HN"},
  {label: "Hong Kong", value: "HK"},
  {label: "Hungary", value: "HU"},
  {label: "Iceland", value: "IS"},
  {label: "India", value: "IN"},
  {label: "Indonesia", value: "ID"},
  {label: "Iran (Islamic Republic of)", value: "IR"},
  {label: "Iraq", value: "IQ"},
  {label: "Ireland", value: "IE"},
  {label: "Isle of Man", value: "IM"},
  {label: "Israel", value: "IL"},
  {label: "Italy", value: "IT"},
  {label: "Jamaica", value: "JM"},
  {label: "Japan", value: "JP"},
  {label: "Jersey", value: "JE"},
  {label: "Jordan", value: "JO"},
  {label: "Kazakhstan", value: "KZ"},
  {label: "Kenya", value: "KE"},
  {label: "Kiribati", value: "KI"},
  {label: "Korea (the Democratic People's Republic of)", value: "KP"},
  {label: "Korea (the Republic of)", value: "KR"},
  {label: "Kuwait", value: "KW"},
  {label: "Kyrgyzstan", value: "KG"},
  {label: "Lao People's Democratic Republic (the)", value: "LA"},
  {label: "Latvia", value: "LV"},
  {label: "Lebanon", value: "LB"},
  {label: "Lesotho", value: "LS"},
  {label: "Liberia", value: "LR"},
  {label: "Libya", value: "LY"},
  {label: "Liechtenstein", value: "LI"},
  {label: "Lithuania", value: "LT"},
  {label: "Luxembourg", value: "LU"},
  {label: "Macao", value: "MO"},
  {label: "Madagascar", value: "MG"},
  {label: "Malawi", value: "MW"},
  {label: "Malaysia", value: "MY"},
  {label: "Maldives", value: "MV"},
  {label: "Mali", value: "ML"},
  {label: "Malta", value: "MT"},
  {label: "Marshall Islands (the)", value: "MH"},
  {label: "Martinique", value: "MQ"},
  {label: "Mauritania", value: "MR"},
  {label: "Mauritius", value: "MU"},
  {label: "Mayotte", value: "YT"},
  {label: "Mexico", value: "MX"},
  {label: "Micronesia (Federated States of)", value: "FM"},
  {label: "Moldova (the Republic of)", value: "MD"},
  {label: "Monaco", value: "MC"},
  {label: "Mongolia", value: "MN"},
  {label: "Montenegro", value: "ME"},
  {label: "Montserrat", value: "MS"},
  {label: "Morocco", value: "MA"},
  {label: "Mozambique", value: "MZ"},
  {label: "Myanmar", value: "MM"},
  {label: "Namibia", value: "NA"},
  {label: "Nauru", value: "NR"},
  {label: "Nepal", value: "NP"},
  {label: "Netherlands (the)", value: "NL"},
  {label: "New Caledonia", value: "NC"},
  {label: "New Zealand", value: "NZ"},
  {label: "Nicaragua", value: "NI"},
  {label: "Niger (the)", value: "NE"},
  {label: "Nigeria", value: "NG"},
  {label: "Niue", value: "NU"},
  {label: "Norfolk Island", value: "NF"},
  {label: "Northern Mariana Islands (the)", value: "MP"},
  {label: "Norway", value: "NO"},
  {label: "Oman", value: "OM"},
  {label: "Pakistan", value: "PK"},
  {label: "Palau", value: "PW"},
  {label: "Palestine, State of", value: "PS"},
  {label: "Panama", value: "PA"},
  {label: "Papua New Guinea", value: "PG"},
  {label: "Paraguay", value: "PY"},
  {label: "Peru", value: "PE"},
  {label: "Philippines (the)", value: "PH"},
  {label: "Pitcairn", value: "PN"},
  {label: "Poland", value: "PL"},
  {label: "Portugal", value: "PT"},
  {label: "Puerto Rico", value: "PR"},
  {label: "Qatar", value: "QA"},
  {label: "Republic of North Macedonia", value: "MK"},
  {label: "Romania", value: "RO"},
  {label: "Russian Federation (the)", value: "RU"},
  {label: "Rwanda", value: "RW"},
  {label: "Réunion", value: "RE"},
  {label: "Saint Barthélemy", value: "BL"},
  {label: "Saint Helena, Ascension and Tristan da Cunha", value: "SH"},
  {label: "Saint Kitts and Nevis", value: "KN"},
  {label: "Saint Lucia", value: "LC"},
  {label: "Saint Martin (French part)", value: "MF"},
  {label: "Saint Pierre and Miquelon", value: "PM"},
  {label: "Saint Vincent and the Grenadines", value: "VC"},
  {label: "Samoa", value: "WS"},
  {label: "San Marino", value: "SM"},
  {label: "Sao Tome and Principe", value: "ST"},
  {label: "Saudi Arabia", value: "SA"},
  {label: "Senegal", value: "SN"},
  {label: "Serbia", value: "RS"},
  {label: "Seychelles", value: "SC"},
  {label: "Sierra Leone", value: "SL"},
  {label: "Singapore", value: "SG"},
  {label: "Sint Maarten (Dutch part)", value: "SX"},
  {label: "Slovakia", value: "SK"},
  {label: "Slovenia", value: "SI"},
  {label: "Solomon Islands", value: "SB"},
  {label: "Somalia", value: "SO"},
  {label: "South Africa", value: "ZA"},
  {label: "South Georgia and the South Sandwich Islands", value: "GS"},
  {label: "South Sudan", value: "SS"},
  {label: "Spain", value: "ES"},
  {label: "Sri Lanka", value: "LK"},
  {label: "Sudan (the)", value: "SD"},
  {label: "Suriname", value: "SR"},
  {label: "Svalbard and Jan Mayen", value: "SJ"},
  {label: "Sweden", value: "SE"},
  {label: "Switzerland", value: "CH"},
  {label: "Syrian Arab Republic", value: "SY"},
  {label: "Taiwan (Province of China)", value: "TW"},
  {label: "Tajikistan", value: "TJ"},
  {label: "Tanzania, United Republic of", value: "TZ"},
  {label: "Thailand", value: "TH"},
  {label: "Timor-Leste", value: "TL"},
  {label: "Togo", value: "TG"},
  {label: "Tokelau", value: "TK"},
  {label: "Tonga", value: "TO"},
  {label: "Trinidad and Tobago", value: "TT"},
  {label: "Tunisia", value: "TN"},
  {label: "Turkey", value: "TR"},
  {label: "Turkmenistan", value: "TM"},
  {label: "Turks and Caicos Islands (the)", value: "TC"},
  {label: "Tuvalu", value: "TV"},
  {label: "Uganda", value: "UG"},
  {label: "Ukraine", value: "UA"},
  {label: "United Arab Emirates (the)", value: "AE"},
  {label: "United Kingdom of Great Britain and Northern Ireland (the)", value: "GB"},
  {label: "United States Minor Outlying Islands (the)", value: "UM"},
  {label: "United States of America (the)", value: "US", selected: true},
  {label: "Uruguay", value: "UY"},
  {label: "Uzbekistan", value: "UZ"},
  {label: "Vanuatu", value: "VU"},
  {label: "Venezuela (Bolivarian Republic of)", value: "VE"},
  {label: "Viet Nam", value: "VN"},
  {label: "Virgin Islands (British)", value: "VG"},
  {label: "Virgin Islands (U.S.)", value: "VI"},
  {label: "Wallis and Futuna", value: "WF"},
  {label: "Western Sahara", value: "EH"},
  {label: "Yemen", value: "YE"},
  {label: "Zambia", value: "ZM"},
  {label: "Zimbabwe", value: "ZW"}
];

function LAVFlexBox({handleGoToNextScreen}: LAVFlexBoxProps): JSX.Element {

  // useEffect(() =>{
  //   console.log('.....')
  //   console.log('useEffect called in LAVFlexBox PersonalDetails.tsx')
  //   console.log('.....')
  // })

  const isDarkMode = useColorScheme() === 'dark';
  const [text, onChangeText] = React.useState('Enter name');
  const [number, onChangeNumber] = React.useState('');

  const [openDropDown, setOpenDropDown] = useState(false);
  const [valueDropDown, setValueDropDown] = useState(null);
  const [itemsDropDown, setItemsDropDown] = useState(countryList);
  const [toggleCheckBox, setToggleCheckBox] = useState(false);

  DropDownPicker.setListMode("SCROLLVIEW")
  DropDownPicker.setDropDownDirection("AUTO")

  return(
    <View style={[{marginTop:'2%'}, {backgroundColor:'white'}, {flexDirection: 'column'}, {width:Dimensions.get('window').width}]}>
      <Text style={[{padding:'4%'}, {color:'black'}, {fontWeight:'bold'}, {fontSize:18}, {fontFamily:'System'}, {textAlign:'left'}]}>Loan Sign Up</Text>
      <View style={[{marginTop:2}, {backgroundColor:'white'}, {flexDirection: 'row'}, {width:Dimensions.get('window').width}]}>
        <Progress.Bar progress={0.1} height={16} unfilledColor='#D3D3D3' borderColor='white'/>
        <Text style={[{padding:'0%'}, {marginLeft:'1%'}, {color:'black'}, {fontWeight:'bold'}, {fontSize:13}, {fontFamily:'System'}, {textAlign:'left'}]}>Progress: </Text>
        <Text style={[{marginRight:'1%'}, {color:'black'}, {fontWeight:'normal'}, {fontSize:13}, {fontFamily:'PingFang TC Regular'}, {textAlign:'left'}]}>Just getting started</Text>
      </View>
      <Text style={[{padding:'2%'}, {marginRight:'1%'}, {color:'#797979'}, {fontWeight:'normal'}, {fontSize:13}, {fontFamily:'PingFang TC Regular'}, {textAlign:'left'}]}>You are applying for individual credit ( a loan ) in your name and with your own assets, relying upon your own income for any repayments necessary.</Text>
      <Text style={[{padding:'2%'}, {marginRight:'1%'}, {color:'#797979'}, {fontWeight:'normal'}, {fontSize:13}, {fontFamily:'PingFang TC Regular'}, {textAlign:'left'}]}>Upon a successful credit request you will be emailed a summary of your responses.  Please keep this for. your future records.  Vivre will keep this on file for the term of your successfuly loan + 6 years.</Text>
      <Text style={[{padding:'2%'}, {marginRight:'1%'}, {color:'#797979'}, {fontWeight:'normal'}, {fontSize:13}, {fontFamily:'PingFang TC Regular'}, {textAlign:'left'}]}>Check the box below to show you are in full agreement of this term.  Note that your rights are not affected by accepting this.</Text>
      <Text style={[{padding:'2%'}, {marginLeft:'1%'}, {color:'black'}, {fontWeight:'bold'}, {fontSize:16}, {fontFamily:'System'}, {textAlign:'left'}]}>First Name</Text>
      <TextInput style={[styles.input]} onChangeText={onChangeText} value={text}></TextInput>
      <Text style={[{padding:'2%'}, {marginLeft:'1%'}, {color:'black'}, {fontWeight:'bold'}, {fontSize:16}, {fontFamily:'System'}, {textAlign:'left'}]}>Middle Name</Text>
      <TextInput style={[styles.input, {marginTop:'1%'}]} onChangeText={onChangeText} placeholder='useless placeholder' keyboardType='numeric'></TextInput>
      <Text style={[{padding:'2%'}, {marginLeft:'1%'}, {color:'black'}, {fontWeight:'bold'}, {fontSize:16}, {fontFamily:'System'}, {textAlign:'left'}]}>Last Name</Text>
      <TextInput style={[styles.input, {marginTop:'1%'}]} onChangeText={onChangeText} placeholder='useless placeholder' keyboardType='numeric'></TextInput>
      <Text style={[{padding:'2%'}, {marginLeft:'1%'}, {color:'black'}, {fontWeight:'bold'}, {fontSize:16}, {fontFamily:'System'}, {textAlign:'left'}]}>Email</Text>
      <TextInput style={[styles.input, {marginTop:'1%'}]} onChangeText={onChangeText} placeholder='useless placeholder' keyboardType='numeric'></TextInput>
      <Text style={[{padding:'2%'}, {marginLeft:'1%'}, {color:'black'}, {fontWeight:'bold'}, {fontSize:16}, {fontFamily:'System'}, {textAlign:'left'}]}>House Number or Name</Text>
      <TextInput style={[styles.input, {marginTop:'1%'}]} onChangeText={onChangeText} placeholder='useless placeholder' keyboardType='numeric'></TextInput>
      <Text style={[{padding:'2%'}, {marginLeft:'1%'}, {color:'black'}, {fontWeight:'bold'}, {fontSize:16}, {fontFamily:'System'}, {textAlign:'left'}]}>Address Line 1</Text>
      <TextInput style={[styles.input, {marginTop:'1%'}]} onChangeText={onChangeText} placeholder='useless placeholder' keyboardType='numeric'></TextInput>
      <Text style={[{padding:'2%'}, {marginLeft:'1%'}, {color:'black'}, {fontWeight:'bold'}, {fontSize:16}, {fontFamily:'System'}, {textAlign:'left'}]}>Address Line 2</Text>
      <TextInput style={[styles.input, {marginTop:'1%'}]} onChangeText={onChangeText} placeholder='useless placeholder' keyboardType='numeric'></TextInput>
      <Text style={[{padding:'2%'}, {marginLeft:'1%'}, {color:'black'}, {fontWeight:'bold'}, {fontSize:16}, {fontFamily:'System'}, {textAlign:'left'}]}>Country</Text>
      <DropDownPicker style={[{marginLeft:'2%'}, {width:Dimensions.get('window').width-(Dimensions.get('window').width*0.04)}]} open={openDropDown}
      value={valueDropDown}
      items={itemsDropDown}
      setOpen={setOpenDropDown}
      setValue={setValueDropDown}
      setItems={setItemsDropDown}></DropDownPicker>
      <Text style={[{padding:'2%'}, {marginLeft:'1%'}, {color:'black'}, {fontWeight:'bold'}, {fontSize:16}, {fontFamily:'System'}, {textAlign:'left'}]}>Postal Code</Text>
      <TextInput style={[styles.input, {marginTop:'1%'}]} onChangeText={onChangeText} placeholder='useless placeholder' keyboardType='numeric'></TextInput>
      <View style={[{marginTop:'4%'}, {backgroundColor:'white'}, {flexDirection: 'row'}]}>
        <CheckBox style={[{marginTop:'2%'}, {marginLeft:'15%'}]} disabled={false} value={toggleCheckBox} onValueChange={(newValue) => setToggleCheckBox(newValue)}></CheckBox>
        <Text style={[{marginTop:'2%'}]}>Accept Terms & Conditions </Text>
      </View>
      {/* <HCLDiscoverMaskingReactNative> */}
        <TouchableOpacity style={styles.buttonStyle} onPress={handleGoToNextScreen}>
          <Text> Go to Loan Details </Text>
        </TouchableOpacity>
      {/* </HCLDiscoverMaskingReactNative> */}
    </View>
  );
};

type LAHFlexBoxProps = PropsWithChildren<{}>;

function LAHFlexBox({}: LAHFlexBoxProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return(
    <View style={[{marginTop:2}, {backgroundColor:'white'}, {flexDirection: 'column'}, {width:Dimensions.get('window').width}]}>
      <Text style={[{padding:'4%'}, {color:'black'}, {fontWeight:'bold'}, {fontSize:18}, {fontFamily:'System'}, {textAlign:'left'}]}>Loan Sign Up</Text>
      <View style={[{marginTop:2}, {backgroundColor:'white'}, {flexDirection: 'row'}, {width:Dimensions.get('window').width}]}>
        <Text style={[{padding:'1%'}, {color:'black'}, {fontWeight:'bold'}, {fontSize:12}, {fontFamily:'System'}, {textAlign:'left'}]}>Progress: </Text>
        <Text style={[{marginLeft:'1%'}, {marginRight:'1%'}, {color:'black'}, {fontWeight:'normal'}, {fontSize:12}, {fontFamily:'PingFang TC Regular'}, {textAlign:'left'}]}>Just getting started</Text>
      </View>
    </View>
  );
};

type LAHeaderProps = PropsWithChildren<{
  title: string;
  label: string;
}>;

function LAHeader({children, title, label}: LAHeaderProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View>
      <Text style={[{padding:'1%'}, {color:'white'},{fontWeight:'normal'},{fontSize:18}, {fontFamily:'PingFang TC Semibold'}, {textAlign:'center'}]}>{title}</Text>
      <Text style={[{marginLeft:'1%'}, {marginRight:'1%'}, {color:'white'},{fontWeight:'normal'},{fontSize:12}, {fontFamily:'PingFang TC Regular'}, {textAlign:'center'}]}>{label}</Text>
    </View>
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
    input: {
      borderWidth: 1,
      padding: 10,
      marginLeft: 10,
      marginRight: 10,
    },
    listItemStyle: {
      backgroundColor: "blue",
      color: "white",
      padding: 2,
      margin: 2,
    },
    buttonStyle: {
      marginTop: '4%',
      marginRight: '2%',
      marginLeft: '2%',
      marginBottom: '4%',
      alignItems: 'center',
      backgroundColor: '#5DAB6D',
      padding: 10
    }
});
  
const stylesContainer = StyleSheet.create({
   
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'grey',
    },
});

interface NextScreenProps {
  handleGoToNextScreen: () => any;
}

function PersonalDetails({handleGoToNextScreen}:NextScreenProps): JSX.Element {

  useEffect(() =>{
    
    var responseString = 'connection successful : userId is : demodata@gmail.com';
    var connection = {
        'statusCode': 200,
        'responseDataSize': responseString.length,
        'initTime': Date.now(),
        'responseTime': (Date.now() + 1000),
        'url': "http://localhost:3001/demoData",
        'loadTime': (Date.now() + 200),
        'message': responseString,
    };

    hclDiscoverLibInstance.logConnection(connection);

  }, []);
  
    const isDarkMode = useColorScheme() === 'dark';
  
    const backgroundStyle = {
      backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };
  
    return (
        <SafeAreaView style={[{backgroundColor:'#5DAB6D'}, {marginBottom:'67%'}, {marginTop:'1%'}]}>
        <LAHeader title='Enabling you to reach your goal & achieve your dreams' label='At Vivre we want to listen to you and your dreams and help you achieve your personal or business goals. Wether you have an account with us, or not we can help you through a tailored loan decision in 24hrs.'></LAHeader>
          <ScrollView style={[{marginBottom:'1%'}]}>
            <LAVFlexBox handleGoToNextScreen={handleGoToNextScreen}>
            </LAVFlexBox>
          </ScrollView>
        </SafeAreaView>
    );
}

export default PersonalDetails;