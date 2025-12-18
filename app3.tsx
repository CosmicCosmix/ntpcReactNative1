// Import React and Component
import React, { useState, useEffect, createRef, useRef } from 'react';
import {
    StyleSheet,
    TextInput,
    View,
    Text,
    ScrollView,
    Image,
    Keyboard,
    TouchableOpacity,
    ImageBackground,
    KeyboardAvoidingView,
    NativeEventEmitter,
    NativeModules,
    Platform,
    Dimensions, BackHandler
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoaderScreen from './../LoaderScreen';
import DeviceInfo from 'react-native-device-info';
import CheckBox from '@react-native-community/checkbox';
import { API_KEY } from "@env"

import {
    Card,
    Divider,
    Dialog,
    Portal,
    Provider,
    Button,
    List,
    ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import JailMonkey from 'jail-monkey';

import { fetch } from 'react-native-ssl-pinning';

import Recaptcha from 'react-native-recaptcha-that-works';
import Carousel from 'react-native-reanimated-carousel';
import {
    urlValidateUser,
    urlValidateOtp,
    certsSha256,
    disableSslPinning,
    ReqTimeOutInt,
} from '../../constants/Constants';
import { ApiKey } from '@env';
import VersionCheck from '../../components/VersionCheck';

const { DeviceStatus } = NativeModules;

//carousel data//

const { width, height } = Dimensions.get('window');

const backgroundImages = [
    require('./../../../assets/images/ntpcmobimg2.png'),
    require('./../../../assets/images/ntpclogo_50mobimg.png'),
    require('./../../../assets/images/ntpcmobimg1.png'),
];

//carousel data end//

const LoginScreen = ({ props }) => {
    const navigation = useNavigation();
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errortext, setErrortext] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(0);
    const [isOtpLoading, setIsOtpLoading] = useState(false);

    const [showOTPField, setShowOTPField] = useState(false);
    const [isEditUserid, setIsEditUserid] = useState(true);

    const [activeBGColor, setActiveBGColor] = useState('#002A6A');
    const [inActiveBGColor, setInActiveBGColor] = useState('#E5E4E2');

    const [activeFontColor, setActiveFontColor] = useState('#FFFF');
    const [inActiveFontColor, setInActiveFontColor] = useState('#000');

    const [bGColor, setBGColor] = useState('#002A6A');
    const [fontColor, setFontColor] = useState('#FFFF');

    const [data, setData] = useState([]);
    const passwordInputRef = createRef();

    const [tempTokenStr, setTempTokenStr] = useState(null);

    const { DeviceStatus } = NativeModules;

    const networkStatusEmitter = new NativeEventEmitter(DeviceStatus);

    /* REcaptcha Code */
    const [reCaptchaToken, setReCaptchaToken] = useState(null);
    const recaptcha = useRef();

    const send = () => {
        //-- console.log('send!');
        recaptcha.current?.open();
    };

    const onVerify = token => {
        //-- console.log('Recaptcha Token:', token);
        setReCaptchaToken(token);
    };

    const onExpire = () => {
        //-- console.warn('expired!');
    };

    /***End of reCaptcha Code*** */

    const loadData = async () => {
        try {
            let uname = await AsyncStorage.getItem('user_id');
            if (uname != null) {
                setIsLoggedIn(1);
            }
        } catch (err) {
            alert(err);
        }
    };

    const checkAsync = async () => {
        let tkn = await AsyncStorage.getItem('accessToken');
        let rtkn = await AsyncStorage.getItem('refToken');
        let usr = await AsyncStorage.getItem('UserId');

        if (tkn && rtkn && usr) {
            navigation.navigate('MainDrawer');
        }
    };

    const [isIosRooted, setIsIosLRooted] = useState(false);
    const [isRooted, setIsLRooted] = useState(false);
    const checkRooted = async () => {
        const rooteddev = await DeviceInfo.isEmulator();
        if (JailMonkey.isJailBroken() || rooteddev) {
            setIsLRooted(true || rooteddev);
            alert('This device is either Rooted or device is emulator');
            BackHandler.exitApp();
            return;
        } else {
            console.warn('Android Device is NOT Rooted');
        }
    };

    const handleResetPress = () => {
        setIsEditUserid(true);
        setShowOTPField(false);
        setActiveFontColor(activeFontColor);
        setUserEmail('');
        setBGColor(activeBGColor);
    };

    useEffect(() => {
        //checkRooted();
        loadData();
        checkAsync();

        //to be executed in case of iOS only
        if (Platform.OS == 'ios') {
            //console.log("Inside checking IOS Deviec Routed = " ,NativeModules.DeviceStatus);
            NativeModules.DeviceStatus.isJailBroken(value => {
                // console.log('IOS Device rooted');
                /*setIsIosLRooted(value);
                if(value==true){
                  alert('This iOS device is either Rooted or device is emulator');
                  BackHandler.exitApp();
                 
                }*/
            });
        }
    }, []);

    async function handleGetOtpPress() {
        console.warn('Called emp submit = ' + userEmail);
        setErrortext('');
        if (!userEmail) {
            alert(
                'Either username not entered or captcha not responded. Please try again.',
            );
            return;
        }

        setLoading(true);
        setIsOtpLoading(true);

        //console.warn("just before fetching function, certs = " + JSON.stringify(certsSha256));
        //--console.log('url to send OTP for login = ' + urlValidateUser);
        //setLoading(false);
        //return;

        let url = urlValidateUser;
        //https://webapp.ntpc.co.in/nqweldapi/api/Auth/ValidateUserV2
        const raw = JSON.stringify({
            userLoginId: userEmail,
            captchaToken: reCaptchaToken,
        });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Accept': 'application/json',
                    //'Accept': '*/*',
                    //'XApiKey':ApiKey
                    'XAPIKEY': API_KEY
                },

                body: raw,

                /*all ssl pinning configuration starts here*/
                timeoutInterval: ReqTimeOutInt, // milliseconds
                disableAllSecurity: Platform.OS == 'ios' ? true : false,//disableSslPinning,
                pkPinning: true,
                sslPinning: {
                    certs: certsSha256,
                },
            });
            setLoading(false);
            setIsOtpLoading(false);
            //--  console.log(response);
            if (response.status == '401') {
                alert('Your session token expired. Please try again.');
                return;
            }

            if (response.status != '200') {
                alert('Something went wrong. Please try again.');
                return;
            }

            const resp = await response.json();
            //-- console.log(JSON.stringify(resp));
            if (resp.statusCode != 200) {
                alert(
                    'Something went wrong. Returned Code = ' +
                    resp.statusCode + ". Error=" + resp.statusDescLong +
                    '. Please contact app administrator',
                );
                return;
            }

            let tknString = resp.tokenString;
            let usr = resp.userid;

            if (!tknString || userEmail != usr) {
                alert('Something went wrong.  Please try again.');
                return;
            }

            setTempTokenStr(tknString);

            alert('If user exists, OTP sent to registered mobile number');
            setShowOTPField(true);
            setIsEditUserid(false);
            setFontColor(inActiveFontColor);
            setBGColor(inActiveBGColor);
        } catch (err) {
            setShowOTPField(false);
            setIsEditUserid(true);
            setLoading(false);
            setIsOtpLoading(false);
            alert("Error = " + JSON.stringify(err));
        }
    }

    const handleLoginPress = async () => {
        setErrortext('');
        //validate inputs
        if (!userEmail || !userPassword || !tempTokenStr) {
            alert('All mandatory inputs not provided.');
            return;
        }

        let url = urlValidateOtp;

        //-- console.log('URL for validating OTP = ' + url);

        const postbody = JSON.stringify({
            userName: userEmail,
            password: userPassword,
            tokenString: tempTokenStr,
        });
        //-- console.log(      'PostBody for validate otp api is = ' + JSON.stringify(postbody),    );

        try {
            setLoading(true);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

                body: postbody,

                /*all ssl pinning configuration starts here*/
                timeoutInterval: ReqTimeOutInt, // milliseconds
                disableAllSecurity: Platform.OS == 'ios' ? true : false,//disableSslPinning,
                pkPinning: true,
                sslPinning: {
                    certs: certsSha256,
                },
            });
            setLoading(false);
            //-- console.log(response);
            if (response.status == '401') {
                alert('Your session token expired. Please try again.');
                return;
            }

            if (response.status != '200') {
                alert('Something went wrong. Please try again.');
                return;
            }

            const resp = await response.json();
            //-- console.log(JSON.stringify(resp));
            if (resp.statusCode != 200) {
                alert(
                    'Something went wrong. Returned Code = ' +
                    resp.statusCode +
                    '. Please contact app administrator',
                );
                return;
            }

            if (!resp.data) {
                alert('Something went wrong2. Returned Code. Please try again.');
                return;
            }

            let retData = resp.data[0];
            if (!retData) {
                alert('Something went wrong3. Please try again.');
                return;
            }
            let usr = retData.userLoginId;

            if (userEmail != usr) {
                alert('Something went wrong1. Returned Code. Please try again.');
                return;
            }

            let userName = retData.userName;
            let userRole = retData.role;
            let project = retData.project;
            let jwtToken = retData.tokenObj.accessToken;
            let refToken = retData.tokenObj.refreshToken;

            //--  console.log(         'Returned parameters = ',         userName, userRole, project, refToken,  );
            if (!userName || !userRole || !jwtToken || !refToken) {
                alert('Something went wrong4. Please try again.');
                return;
            }

            try {
                await AsyncStorage.setItem('accessToken', jwtToken);
                await AsyncStorage.setItem('refToken', refToken);

                await AsyncStorage.setItem('UserName', userName);
                await AsyncStorage.setItem('UserRole', userRole);
                await AsyncStorage.setItem('UserProject', project);
                await AsyncStorage.setItem('UserId', usr);
            } catch (er) {
                alert('Unable to create session.');
            }

            navigation.replace('MainDrawer');

            alert('Login Successfull');
        } catch (err) {
            handleResetPress();
            setLoading(false);
            alert(err);
        }
    };

    return (
        <SafeAreaView style={styles.mainBody}>


            {/* caurosell code start
      <Carousel
        loop
        autoPlay
        autoPlayInterval={1000}
        width={width}
        height={height}
        data={backgroundImages}
        scrollAnimationDuration={1000}
        renderItem={({item}) => (
          <ImageBackground
            source={item}
            style={styles.background}
            resizeMode="cover"
          />
        )}
      />
 */}
            {/*  caurosell code  end */}

            {/* Added for version check and force updation  */}
            <VersionCheck />

            {(isRooted == true || isIosRooted == true) && (
                <>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            backgroundColor: '#007C80',
                            alignContent: 'center',
                        }}>
                        <Text
                            style={{
                                color: 'white',
                                fontSize: 25,
                                fontWeight: 'bold',
                                alignSelf: 'center',
                            }}>
                            Trust failed with this device. This device is a rooted, a security
                            breach .
                        </Text>
                    </View>
                </>
            )}

            {isRooted == false && isIosRooted == false && (
                <>
                    <LoaderScreen loading={loading} />
                    <KeyboardAvoidingView
                        style={styles.overlay}
                        behavior="padding"
                        enabled
                        keyboardVerticalOffset={100}>
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{
                                flex: 1,
                                justifyContent: 'center',
                                alignContent: 'center',
                            }}>
                            <View>
                                <View style={{ alignItems: 'center' }}>
                                    <Image
                                        //source={require('./../../images/logo.png')}
                                        source={require('./../../../assets/images/nlogo.png')}
                                        style={{

                                            width: '90%',
                                            height: Dimensions.get('window').width * 0.3,
                                            resizeMode: 'contain',
                                            margin: 5,
                                            marginBottom: 50,
                                        }}
                                    />
                                    <View
                                        style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            alignSelf: 'center',
                                        }}>
                                        <Text
                                            style={{
                                                color: 'black',
                                                fontSize: 28,
                                                fontWeight: 'bold',
                                            }}>
                                            NQWeld{' '}
                                        </Text>
                                    </View>

                                    <Image
                                        //source={require('./../../images/logo.png')}
                                        source={require('./../../../assets/images/weldingpic3.png')}
                                        borderRadius={10}
                                        style={{
                                            width: '85%',
                                            //width: 320,
                                            height: Dimensions.get('window').width * 0.5,
                                            resizeMode: 'contain',
                                            margin: 5,
                                            borderRadius: 10,
                                            borderColor: 'black',
                                            //borderWidth:2,
                                            resizeMode: "cover"
                                        }}
                                    />
                                </View>

                                <View style={styles.SectionStyle}>
                                    <TextInput
                                        style={[
                                            styles.inputStyle,
                                            {
                                                backgroundColor: bGColor,
                                                color: fontColor,
                                                alignContent: 'center',
                                                alignSelf: 'center',
                                                padding: 10
                                            },
                                        ]}
                                        onChangeText={UserEmail => setUserEmail(UserEmail)}
                                        placeholder="Login Id" //dummy@abc.com
                                        placeholderTextColor="#8b9cb5"
                                        autoCapitalize="none"
                                        keyboardType={'default'}
                                        //keyboardType="email-address"
                                        returnKeyType="next"
                                        onSubmitEditing={() =>
                                            passwordInputRef.current &&
                                            passwordInputRef.current.focus()
                                        }
                                        underlineColorAndroid="#f000"
                                        blurOnSubmit={false}
                                        editable={isEditUserid}
                                        value={userEmail.trim().replace(/[^\w\s]/gi, '')}
                                        textAlign={'center'}
                                    />
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        // alignItems: 'baseline',
                                        alignItems: "center", //added
                                        justifyContent: 'space-around',
                                        margin: 18    //added margin
                                    }}>
                                    {/* <CheckBox color={"white"} status={reCaptchaToken ? (reCaptchaToken!=""||reCaptchaToken!=null?'checked':'unchecked') : 'unchecked'} disabled={true}  mode="android"/> */}

                                    <CheckBox
                                        tintColor="#FFFFFF"
                                        onCheckColor="#FFFFFF"
                                        onTintColor="#FFFFFF"
                                        onFillColor="#00FF00"
                                        style={{ height: 18 }}
                                        value={
                                            reCaptchaToken
                                                ? reCaptchaToken != '' || reCaptchaToken != null
                                                    ? true
                                                    : false
                                                : false
                                        }
                                        disabled={true}
                                    /*onValueChange={newValue => {
                                       console.log(newValue);
                                     }}*/
                                    />

                                    <Text style={{ color: 'black' }}>
                                        Captcha attempted?{'      '}
                                    </Text>

                                    <Recaptcha
                                        ref={recaptcha}
                                        siteKey="6Le9yzwrAAAAAP3EZLHzitEMhdjwIYGdGU0Cm68J"
                                        baseUrl="https://webapp.ntpc.co.in"
                                        onVerify={onVerify}
                                        onExpire={onExpire}
                                        size="normal"
                                    />

                                    <Button mode="elevated" onPress={send} style={{ backgroundColor: '#bcdeefff', }}>
                                        Show Captcha
                                    </Button>
                                </View>
                                {!showOTPField && (
                                    <>
                                        <TouchableOpacity
                                            style={styles.buttonStyle}
                                            activeOpacity={0.5}
                                            onPress={handleGetOtpPress}
                                        //data.statusCode == 102 ? navigation.navigate('MainDrawer') : alert("Invalid Credentials"+ data.statusCode) } }
                                        >
                                            {isOtpLoading ? (
                                                <ActivityIndicator
                                                    animating={isOtpLoading}
                                                    style={{ backgroundColor: 'white' }}
                                                />
                                            ) : (
                                                <Text style={styles.buttonTextStyle}>GET OTP</Text>
                                            )}
                                        </TouchableOpacity>
                                    </>
                                )}

                                {showOTPField && (
                                    <>
                                        <View style={styles.SectionStyle}>
                                            <TextInput
                                                style={[styles.inputStyle]}
                                                secureTextEntry={true}
                                                editable={!isEditUserid}
                                                onChangeText={UserPassword =>
                                                    setUserPassword(UserPassword)
                                                }
                                                placeholder="Enter Password" //12345
                                                placeholderTextColor="#8b9cb5"
                                                keyboardType="default"
                                                ref={passwordInputRef}
                                                onSubmitEditing={Keyboard.dismiss}
                                                blurOnSubmit={false}
                                                underlineColorAndroid="#f000"
                                                returnKeyType="next"
                                            />
                                        </View>

                                        {errortext != '' ? (
                                            <Text style={styles.errorTextStyle}>{errortext}</Text>
                                        ) : null}

                                        <View
                                            style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.buttonStyle,
                                                    { width: 100, backgroundColor: 'green' },
                                                ]}
                                                width={2500}
                                                activeOpacity={0.5}
                                                onPress={handleLoginPress}
                                            //data.statusCode == 102 ? navigation.navigate('MainDrawer') : alert("Invalid Credentials"+ data.statusCode) } }
                                            >
                                                <Text
                                                    style={[
                                                        styles.buttonTextStyle,
                                                        { backgroundColor: 'green' },
                                                    ]}>
                                                    Login
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.buttonStyle, { width: 100 }]}
                                                width={2500}
                                                activeOpacity={0.5}
                                                onPress={handleResetPress}
                                            //data.statusCode == 102 ? navigation.navigate('MainDrawer') : alert("Invalid Credentials"+ data.statusCode) } }
                                            >
                                                <Text style={styles.buttonTextStyle}>Reset</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}

                                <Card
                                    raised
                                    theme={{ roundness: 4 }}
                                    mode="outlined"
                                    style={{
                                        width: '96%',
                                        backgroundColor: '#e6e6e6',
                                        marginTop: 0,
                                        paddingTop: 0,
                                        alignSelf: 'center',
                                    }}
                                    elevation={200}>
                                    <Card.Content>
                                        <Text
                                            style={[
                                                styles.registerTextStyle,
                                                { fontSize: 14, color: 'black' },
                                            ]}>
                                            An initiative by {'\n'}
                                            <Text
                                                style={[
                                                    styles.registerTextStyle,
                                                    { fontSize: 15, color: 'black' },
                                                ]}>
                                                NTPC QA Division{'\n'}
                                                in association with NTPC IT Department
                                            </Text>
                                        </Text>

                                        <Text
                                            style={[
                                                styles.registerTextStyle,
                                                { fontSize: 12, color: 'black' },
                                            ]}>
                                            {' '}
                                            {'\u00A9'}NTPC Limited
                                        </Text>
                                    </Card.Content>
                                </Card>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </>
            )}

        </SafeAreaView>
    );
};
export default LoginScreen;

const styles = StyleSheet.create({
    mainBody: {
        flex: 1,
        justifyContent: 'center',
        //backgroundColor: '#002A6A',
        backgroundColor: '#cceeff',
        alignContent: 'center',
        //paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    SectionStyle: {
        flexDirection: 'row',
        height: 40,
        marginTop: 10,
        marginLeft: 35,
        marginRight: 35,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonStyle: {
        backgroundColor: '#36454F',
        borderWidth: 0,
        color: '#FFFFFF',
        borderColor: '#7DE24E',
        height: 40,
        alignItems: 'center',
        borderRadius: 15,
        marginLeft: 35,
        marginRight: 35,
        marginTop: 10,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    buttonTextStyle: {
        color: '#FFFFFF',
        paddingVertical: 10,
        //fontSize: 34,
        fontWeight: 'bold',
    },
    inputStyle: {
        flex: 1,
        backgroundColor: '#002A6A',
        color: 'white',
        paddingLeft: 15,
        paddingRight: 15,
        borderWidth: 1,
        borderRadius: 30,
        borderColor: '#dadae8',
        fontWeight: 'bold',
        alignContent: 'center',
        alignContent: 'center',
        paddingVertical: 8
    },
    registerTextStyle: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 14,
        alignSelf: 'center',
        padding: 1,
    },
    errorTextStyle: {
        color: 'red',
        textAlign: 'center',
        fontSize: 14,
    },
    background: {
        width,
        height,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000000080',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
});