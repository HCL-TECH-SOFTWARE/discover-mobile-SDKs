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

import { SafeAreaView, View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import Slider from 'react-native-slider';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import {hclDiscoverLibInstance} from './HCLDiscoverReactNative';

const LoanDetails = () => {

    const [primaryAssociation, setPrimaryAssociation] = useState(null);
    const [creditApplicationReason, setCreditApplicationReason] = useState(null);
    const [otherAssociation, setOtherAssociation] = useState(null);
    const [noneCheck, setNoneCheck] = useState(false);
    const [organisationinput, setOrganisationInput] = useState('Other');
    const [tenure, setTenure] = useState('1');
    const [otherInformation, setOtherInformation] = useState(null);
    const [expenses, setExpenses] = useState(null);
    const [creditCard, setCreditCard] = useState('NONE');
    const [years, setYears] = useState(1);
    const [creditValueRequested, setCreditValueRequested] = useState(null);
    const [currency, setCurrency] = useState('DEFAULT');
    const [progress, setProgress] = useState([
        { primaryAssociation: false },
        { creditApplicationReason: false },
        { otherAssociation: false },
        { organisationinput: true },
        { tenure: true },
        { otherInformation: false },
        { expenses: false },
        { creditCard: true },
        { years: true },
        { creditValueRequested: false },
        { currency: true },
    ]);

    const [count, setCount] = useState(0);

    useEffect(() =>{
    
        var customEvent = {
            name: 'Loan Details screen visited',
            data:{ info: 'user has visited Loan Details screen', time:Date.now() },
        };
    
        hclDiscoverLibInstance.logEvent(customEvent);
    
      }, []);
    
    useEffect(() => {
        let count = 0;
        progress.map((item) => {

            if (Object.values(item)[0]) {
                count++
            }
        })
        setCount(count)
    }, [progress])


    useEffect(() => {
        let array = [...progress]
        if (primaryAssociation != null) {
            array[0].primaryAssociation = true
        } else {
            array[0].primaryAssociation = false
        }
        setProgress(array)
    }, [primaryAssociation])


    useEffect(() => {
        let array = [...progress]
        if (creditApplicationReason) {
            array[1].creditApplicationReason = true
        } else {
            array[1].creditApplicationReason = false
        }
        setProgress(array)
    }, [creditApplicationReason])


    useEffect(() => {
        let array = [...progress]
        if (otherAssociation) {
            array[2].otherAssociation = true
        } else {
            array[2].otherAssociation = false
        }
        setProgress(array)
    }, [otherAssociation])

    useEffect(() => {
        let array = [...progress]
        if (organisationinput) {
            array[3].organisationinput = true
        } else {
            array[3].organisationinput = false
        }
        setProgress(array)
    }, [organisationinput])


    useEffect(() => {
        let array = [...progress]
        if (tenure) {
            array[4].tenure = true
        } else {
            array[4].tenure = false
        }
        setProgress(array)
    }, [tenure])


    useEffect(() => {
        let array = [...progress]
        if (otherInformation) {
            array[5].otherInformation = true
        } else {
            array[5].otherInformation = false
        }
        setProgress(array)
    }, [otherInformation])

    useEffect(() => {
        let array = [...progress]
        if (expenses) {
            array[6].expenses = true
        } else {
            array[6].expenses = false
        }
        setProgress(array)
    }, [expenses])

    useEffect(() => {
        let array = [...progress]
        if (creditCard) {
            array[7].creditCard = true
        } else {
            array[7].creditCard = false
        }
        setProgress(array)
    }, [creditCard])

    useEffect(() => {
        let array = [...progress]
        if (years) {
            array[8].years = true
        } else {
            array[8].years = false
        }
        setProgress(array)
    }, [years])

    useEffect(() => {
        let array = [...progress]
        if (creditValueRequested) {
            array[9].creditValueRequested = true
        } else {
            array[9].creditValueRequested = false
        }
        setProgress(array)
    }, [creditValueRequested])

    useEffect(() => {
        let array = [...progress]
        if (currency) {
            array[10].currency = true
        } else {
            array[10].currency = false
        }
        setProgress(array)
    }, [currency])

    const onEstimationPress = () => {
        // if (primaryAssociation == null) {
        //     alert('Primary association required');
        // } else if (!creditApplicationReason) {
        //     alert('Reason for credit application required');
        // } else if (!otherAssociation) {
        //     alert('Other association required');
        // } else if (!organisationinput) {
        //     alert('Organisation required');
        // } else if (!tenure) {
        //     alert('Tenure required');
        // } else if (!otherInformation) {
        //     alert('Other Information required');
        // } else if (!expenses) {
        //     alert('Monthly or Regural Expenses required');
        // } else if (!creditCard) {
        //     alert('Credit Card required');
        // } else if (!creditValueRequested) {
        //     alert('Credit value required');
        // } else if (!currency) {
        //     alert('Currency required');
        // } else {
        //     alert('Data saved successfully')
        // }
    }


    return (
        <SafeAreaView style={styles.safeAreaContainer} >

            <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>


                <View style={{ padding: 15 }} >
                    <Text style={styles.goalText} >Enabling you to reach your goal & achieve your dreams</Text>
                    <Text style={styles.detailText} >At Vivre we want to listen to you and your dreams and help you achieve your personal or business goals. Wether you have an account with us, or not we can help you through a tailored loan decision in 24hrs.</Text>

                </View>



                <View style={styles.subContainer} >

                    <Text style={styles.loginText} >Loan Sign Up</Text>

                    <View style={styles.borderBox} >

                        <View style={styles.progressaView}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressBarFill, { width: `${(count / 11) * 100}%` }]} />
                            </View>
                            <Text style={styles.progressText} >Progress: </Text>
                            <Text style={{ color: AppColors.darkTextColor }} >Getting there</Text>
                        </View>

                        <Text style={styles.detailText2} >It is important that any information including the reason for the credit application is provided in full and truthfull.</Text>
                        <Text style={styles.detailText3} >Any application that is found to contraviene the terms of the application linked below may result in a cancelation of the credit and 30 day repayment in full.</Text>


                        <Text style={styles.heading} >Select your primary association</Text>
                        {
                            ['Sustainable Business', 'New Business Opportunity', 'Self-build project (home or other building)', 'Other'].map((item, index) =>
                                <View style={styles.radioRow} >
                                    <TouchableOpacity onPress={() => setPrimaryAssociation(index)} style={{ height: 15, width: 15, borderRadius: 7.5, borderWidth: index == primaryAssociation ? 0 : 1, borderColor: AppColors.light_grey, marginRight: 10, marginLeft: 5, backgroundColor: index == primaryAssociation ? AppColors.blue : AppColors.white }} />
                                    <Text style={styles.radioText} >{item}</Text>
                                </View>)
                        }


                        <Text style={styles.heading} >Reason for credit application</Text>

                        <Text style={styles.detailText4} >Provide full explanation for credit application. ex. Funding for first year marketing of new thermal insulation product</Text>

                        <TextInput
                            value={creditApplicationReason}
                            onChangeText={(text) => setCreditApplicationReason(text)}
                            style={styles.input1}
                        />



                        <Text style={styles.heading} >Other</Text>

                        <Text style={styles.detailText5} >Describe your 'other' association with eco-projects or sustainable living.</Text>

                        <TextInput
                            value={otherAssociation}
                            onChangeText={(text) => setOtherAssociation(text)}
                            style={styles.input1}
                        />

                        <View style={styles.blueview}>
                            <Text style={styles.text1} >Membership or Accreditation</Text>
                        </View>

                        <Text style={{ color: AppColors.light_grey, marginTop: 5 }} >Provide your most prominent accreditation held, or most recent membership associated with you loan application and/or sustainability & eco credentials. <Text style={{ fontSize: 13, fontWeight: 'bold', color: AppColors.black }}>Note:</Text> If you hold no membership or accreditation skip this section.</Text>

                        <View onPress={() => setNoneCheck(!noneCheck)} style={styles.checkView} >
                            <TouchableOpacity onPress={() => setNoneCheck(!noneCheck)} style={{ height: 14, width: 14, borderRadius: 2, borderWidth: noneCheck ? 0 : 1, borderColor: AppColors.light_grey, marginRight: 10, marginLeft: 5, backgroundColor: noneCheck ? AppColors.blue : AppColors.white }} />
                            <Text style={styles.checkText} >I have None</Text>
                        </View>

                        <Text style={styles.blueText} >I confirm I hold no accreditation or membership affiliation related to sustainability or eco.</Text>

                        <Text style={styles.heading} >Organisation</Text>
                        <TextInput
                            value={organisationinput}
                            onChangeText={(text) => setOrganisationInput(text)}
                            style={styles.input2}
                        />
                        <Text style={styles.blueText} >Organisation or society.</Text>


                        <Text style={styles.heading} >Tenure</Text>
                        <TextInput
                            value={tenure}
                            onChangeText={(text) => setTenure(text)}
                            style={styles.input2}
                        />
                        <Text style={styles.blueText} >Tenure in years.</Text>



                        <Text style={styles.heading} >Other Information</Text>
                        <TextInput
                            value={otherInformation}
                            onChangeText={(text) => setOtherInformation(text)}
                            style={styles.input1}
                        />
                        <Text style={styles.blueText} >Use for other non-specified organisations, societies or facilities.</Text>



                        <Text style={styles.heading} >Monthly or Regural Expenses</Text>
                        <TextInput
                            value={expenses}
                            onChangeText={(text) => setExpenses(text)}
                            style={styles.input1}
                        />
                        <Text style={styles.blueText} >Regular monthly expenses. ex. Rent, food, insurances</Text>


                        <Text style={styles.heading} >Credit Cards</Text>
                        <TextInput
                            value={creditCard}
                            onChangeText={(text) => setCreditCard(text)}
                            style={styles.input2}
                        />
                        <Text style={styles.blueText} >Owned credit cards.</Text>

                        <Text style={{ color: AppColors.red, marginTop: 5, fontSize: 11 }} >* Length of credit</Text>

                        <Slider
                            step={1}
                            minimumValue={1}
                            maximumValue={3}
                            value={years}
                            onValueChange={(value) => setYears(value)} />

                        <View style={styles.sliderLabelView}>
                            <Text style={styles.blueText} >0.5</Text>
                            <Text style={styles.sliderLabel} >1</Text>
                            <Text style={styles.sliderLabel} >1.5</Text>
                        </View>


                        <Text style={styles.detailText6} >You loan amount will be submitted for the currency associated with your residency 'Iceland'. If this is not correct use the currency selctor provided.</Text>

                        <Text style={styles.text3} >Credit value beign requested</Text>
                        <TextInput
                            value={creditValueRequested}
                            onChangeText={(text) => setCreditValueRequested(text)}
                            style={styles.input1}
                        />
                        <Text style={styles.blueText} >Provide the full value in whole figures.</Text>


                        <Text style={styles.heading} >Currency</Text>
                        <TextInput
                            value={currency}
                            onChangeText={(text) => setCurrency(text)}
                            style={styles.input2}
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.personalButton}>
                                <Text style={styles.personalText} >PERSONAL</Text>
                            </TouchableOpacity>


                            <TouchableOpacity onPress={() => onEstimationPress()} style={styles.estimationButton}>
                                <Text style={styles.text1} >ESTIMATION</Text>
                            </TouchableOpacity>
                        </View>


                    </View>
                </View>
            </KeyboardAwareScrollView>

        </SafeAreaView>
    )
}

const AppColors = {
    black: '#000',
    white: '#FFF',
    red: "#E7224A",
    orange: "#ffa500",
    dark_blue: "#111625",
    dark_grey: "#848587",
    pink: '#FF1168',
    grey: "#2B2B2D",
    light_grey: "#707070",
    light_blue: "#179BD7",
    transparent: "transparent",
    whiteSmoke: '#D3D3D3',
    grey_bg: '#BEBEBE',


    yellow: '#F7CF51',
    blue: '#3881EF',
    green: '#14B467',
    background: '#F5F5F5',
    darkTextColor: '#0B0B0B',
    green_bg: '#14B4671A',
    blue1: 'rgb(42,100,174)'
}

const styles = StyleSheet.create({

    safeAreaContainer: {
        flex: 1,
        backgroundColor: AppColors.green
    },

    goalText: {
        fontWeight: '400',
        color: AppColors.white,
        textAlign: 'center',
        fontSize: 17
    },

    detailText: {
        color: AppColors.white,
        textAlign: 'center',
        fontSize: 14,
        marginTop: 10
    },

    subContainer: {
        flex: 1,
        backgroundColor: 'white',
        padding: 15
    },

    loginText: {
        fontSize: 18,
        fontWeight: '800',
        color: AppColors.black,
        marginBottom: 10
    },

    borderBox: {
        flex: 1,
        padding: 5,
        borderWidth: 1,
        borderColor: AppColors.grey_bg,
        borderRadius: 4
    },

    progressaView: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center'
    },

    progressText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: AppColors.black
    },

    detailText2: {
        fontSize: 13,
        color: AppColors.light_grey
    },

    detailText3: {
        fontSize: 13,
        color: AppColors.light_grey,
        marginTop: 5
    },

    heading: {
        fontSize: 13,
        fontWeight: 'bold',
        color: AppColors.black,
        marginTop: 10
    },

    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2.5
    },

    radioText: {
        color: AppColors.darkTextColor,
        fontSize: 12
    },

    detailText4: {
        color: AppColors.light_blue,
        fontSize: 12
    },

    input1: {
        width: '100%',
        borderWidth: 1,
        borderColor: AppColors.black,
        paddingHorizontal: 10,
        paddingVertical: 5
    },

    detailText5: {
        color: AppColors.light_blue,
        fontSize: 13
    },

    blueview: {
        width: '100%',
        backgroundColor: AppColors.blue1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginTop: 10
    },

    text1: {
        fontWeight: 'bold',
        color: AppColors.white
    },

    checkView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10
    },

    checkText: {
        color: AppColors.darkTextColor,
        fontWeight: '600'
    },

    blueText: {
        color: AppColors.light_blue,
        marginTop: 5,
        fontSize: 11
    },

    input2: {
        width: '30%',
        borderWidth: 1,
        borderColor: AppColors.grey_bg,
        paddingHorizontal: 10,
        paddingVertical: 5
    },

    sliderLabelView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },

    sliderLabel: {
        color: AppColors.light_grey,
        marginTop: 5,
        fontSize: 11
    },

    detailText6: {
        color: AppColors.light_grey,
        fontSize: 13
    },

    text3: {
        fontSize: 13,
        fontWeight: 'bold',
        color: AppColors.black,
        marginTop: 5
    },

    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: 20
    },

    personalButton: {
        width: '40%',
        alignItems: 'center',
        justifyContent: 'center',
        height: 35
    },

    personalText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: AppColors.black
    },

    estimationButton: {
        width: '40%',
        backgroundColor: AppColors.green,
        alignItems: 'center',
        justifyContent: 'center',
        height: 35,
        borderRadius: 3
    },

    progressBar: {
        height: 7,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        overflow: 'hidden',
        width: 100,
        marginRight: 10
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: AppColors.blue,
    },
})

export default LoanDetails
