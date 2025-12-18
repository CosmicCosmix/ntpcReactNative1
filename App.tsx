import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    TextInput,
    View,
    Text,
    ScrollView,
    Image,
    Keyboard,
    TouchableOpacity,
    KeyboardAvoidingView,
    NativeEventEmitter,
    NativeModules,
    Platform,
    Dimensions,
    BackHandler,
    Alert,
    TextInput as RNTextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoaderScreen from './LoaderScreen';
import DeviceInfo from 'react-native-device-info';
import CheckBox from '@react-native-community/checkbox';
import { API_KEY } from "@env";

import {
    Card,
    Button,
    ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import JailMonkey from 'jail-monkey';
import { fetch } from 'react-native-ssl-pinning';
import Recaptcha from 'react-native-recaptcha-that-works';
import type { RecaptchaRef } from 'react-native-recaptcha-that-works';

import {
    certsSha256,
    disableSslPinning,
    ReqTimeOutInt,
} from './constants/config';

import VersionCheck from './components/VersionCheck';

const { DeviceStatus } = NativeModules;
const { width } = Dimensions.get('window');

// API URLs
const urlBaseProd = "https://webapp.ntpc.co.in/nqweldapi/api/";
const urlValidateUser = urlBaseProd + "Auth/ValidateUserV2";
const urlValidateOtp = urlBaseProd + "Auth/ValidateOTP";

// Types
interface ApiResponse {
    statusCode?: number;
    statusDescLong?: string;
    tokenString?: string;
    userid?: string;
    data?: Array<{
        userLoginId: string;
        userName: string;
        role: string;
        project: string;
        tokenObj: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    [key: string]: any; // Allow additional properties
}

interface DeviceStatusModule {
    isJailBroken: (callback: (value: boolean) => void) => void;
}

const LoginScreen = () => {
    const navigation = useNavigation<any>();

    // State management
    const [userEmail, setUserEmail] = useState<string>('');
    const [userPassword, setUserPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [errortext, setErrortext] = useState<string>('');
    const [isOtpLoading, setIsOtpLoading] = useState<boolean>(false);
    const [showOTPField, setShowOTPField] = useState<boolean>(false);
    const [isEditUserid, setIsEditUserid] = useState<boolean>(true);
    const [tempTokenStr, setTempTokenStr] = useState<string | null>(null);
    const [reCaptchaToken, setReCaptchaToken] = useState<string | null>(null);
    const [isRooted, setIsRooted] = useState<boolean>(false);
    const [isIosRooted, setIsIosRooted] = useState<boolean>(false);

    // Color states
    const activeBGColor = '#002A6A';
    const inActiveBGColor = '#E5E4E2';
    const activeFontColor = '#FFFFFF';
    const inActiveFontColor = '#000000';

    const [bGColor, setBGColor] = useState<string>(activeBGColor);
    const [fontColor, setFontColor] = useState<string>(activeFontColor);

    // Refs
    const passwordInputRef = useRef<RNTextInput>(null);
    const recaptcha = useRef<RecaptchaRef>(null);

    // ReCaptcha handlers
    const send = (): void => {
        recaptcha.current?.open();
    };

    const onVerify = (token: string): void => {
        setReCaptchaToken(token);
    };

    const onExpire = (): void => {
        console.warn('ReCaptcha expired!');
        setReCaptchaToken(null);
    };

    // Check if user is already logged in
    const checkAsync = async (): Promise<void> => {
        try {
            const tkn = await AsyncStorage.getItem('accessToken');
            const rtkn = await AsyncStorage.getItem('refToken');
            const usr = await AsyncStorage.getItem('UserId');

            if (tkn && rtkn && usr) {
                navigation.replace('MainDrawer');
            }
        } catch (error) {
            console.error('Error checking login status:', error);
        }
    };

    // Check if device is rooted
    const checkRooted = async (): Promise<void> => {
        try {
            const rooteddev = await DeviceInfo.isEmulator();
            if (JailMonkey.isJailBroken() || rooteddev) {
                setIsRooted(true);
                Alert.alert(
                    'Security Warning',
                    'This device is either Rooted or is an emulator',
                    [{ text: 'Exit', onPress: () => BackHandler.exitApp() }]
                );
                return;
            }
        } catch (error) {
            console.error('Error checking rooted status:', error);
        }
    };

    // Check iOS jailbreak
    const checkIosJailbreak = (): void => {
        if (Platform.OS === 'ios' && DeviceStatus) {
            const deviceStatusModule = DeviceStatus as DeviceStatusModule;
            deviceStatusModule.isJailBroken((value: boolean) => {
                if (value) {
                    setIsIosRooted(true);
                    Alert.alert(
                        'Security Warning',
                        'This iOS device is jailbroken',
                        [{ text: 'Exit', onPress: () => BackHandler.exitApp() }]
                    );
                }
            });
        }
    };

    // Reset form
    const handleResetPress = (): void => {
        setIsEditUserid(true);
        setShowOTPField(false);
        setUserEmail('');
        setUserPassword('');
        setBGColor(activeBGColor);
        setFontColor(activeFontColor);
        setTempTokenStr(null);
        setErrortext('');
    };

    // Get OTP
    const handleGetOtpPress = async (): Promise<void> => {
        setErrortext('');

        if (!userEmail.trim()) {
            Alert.alert('Error', 'Please enter your username');
            return;
        }

        if (!reCaptchaToken) {
            Alert.alert('Error', 'Please complete the captcha verification');
            return;
        }

        setLoading(true);
        setIsOtpLoading(true);

        const requestBody = JSON.stringify({
            userLoginId: userEmail.trim(),
            captchaToken: reCaptchaToken,
        });

        try {
            const response = await fetch(urlValidateUser, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'XAPIKEY': API_KEY
                },
                body: requestBody,
                timeoutInterval: ReqTimeOutInt,
                disableAllSecurity: Platform.OS === 'ios',
                pkPinning: true,
                sslPinning: {
                    certs: certsSha256,
                },
            });

            setLoading(false);
            setIsOtpLoading(false);

            if (response.status === 401) {
                Alert.alert('Error', 'Your session token expired. Please try again.');
                return;
            }

            if (response.status !== 200) {
                Alert.alert('Error', 'Something went wrong. Please try again.');
                return;
            }

            const resp = await response.json() as ApiResponse;

            if (resp.statusCode !== 200) {
                Alert.alert(
                    'Error',
                    `Something went wrong. Error: ${resp.statusDescLong || 'Unknown error'}. Please contact app administrator.`
                );
                return;
            }

            const tknString = resp.tokenString;
            const usr = resp.userid;

            if (!tknString || userEmail.trim() !== usr) {
                Alert.alert('Error', 'Invalid response. Please try again.');
                return;
            }

            setTempTokenStr(tknString);
            Alert.alert('Success', 'If user exists, OTP sent to registered mobile number');
            setShowOTPField(true);
            setIsEditUserid(false);
            setFontColor(inActiveFontColor);
            setBGColor(inActiveBGColor);

        } catch (error) {
            setShowOTPField(false);
            setIsEditUserid(true);
            setLoading(false);
            setIsOtpLoading(false);
            const errorMessage = error instanceof Error ? error.message : 'Please check your connection';
            Alert.alert('Error', `Network error: ${errorMessage}`);
        }
    };

    // Login with OTP
    const handleLoginPress = async (): Promise<void> => {
        setErrortext('');

        if (!userEmail.trim() || !userPassword.trim() || !tempTokenStr) {
            Alert.alert('Error', 'All fields are mandatory.');
            return;
        }

        const postbody = JSON.stringify({
            userName: userEmail.trim(),
            password: userPassword,
            tokenString: tempTokenStr,
        });

        try {
            setLoading(true);
            const response = await fetch(urlValidateOtp, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: postbody,
                timeoutInterval: ReqTimeOutInt,
                disableAllSecurity: Platform.OS === 'ios',
                pkPinning: true,
                sslPinning: {
                    certs: certsSha256,
                },
            });

            setLoading(false);

            if (response.status === 401) {
                Alert.alert('Error', 'Your session token expired. Please try again.');
                return;
            }

            if (response.status !== 200) {
                Alert.alert('Error', 'Something went wrong. Please try again.');
                return;
            }

            const resp = await response.json() as ApiResponse;

            if (resp.statusCode !== 200) {
                Alert.alert(
                    'Error',
                    `Login failed. Code: ${resp.statusCode}. Please contact app administrator.`
                );
                return;
            }

            if (!resp.data || !resp.data[0]) {
                Alert.alert('Error', 'Invalid response. Please try again.');
                return;
            }

            const retData = resp.data[0];
            const { userLoginId, userName, role, project, tokenObj } = retData;

            if (userEmail.trim() !== userLoginId) {
                Alert.alert('Error', 'User validation failed. Please try again.');
                return;
            }

            const { accessToken: jwtToken, refreshToken: refToken } = tokenObj || {};

            if (!userName || !role || !jwtToken || !refToken) {
                Alert.alert('Error', 'Incomplete authentication data. Please try again.');
                return;
            }

            // Save to AsyncStorage
            await AsyncStorage.multiSet([
                ['accessToken', jwtToken],
                ['refToken', refToken],
                ['UserName', userName],
                ['UserRole', role],
                ['UserProject', project || ''],
                ['UserId', userLoginId]
            ]);

            Alert.alert('Success', 'Login Successful', [
                { text: 'OK', onPress: () => navigation.replace('MainDrawer') }
            ]);

        } catch (error) {
            handleResetPress();
            setLoading(false);
            const errorMessage = error instanceof Error ? error.message : 'Please try again';
            Alert.alert('Error', `Login failed: ${errorMessage}`);
        }
    };

    // Sanitize user input
    const sanitizeInput = (text: string): string => {
        return text.trim().replace(/[^\w]/gi, '');
    };

    // Effects
    useEffect(() => {
        checkRooted();
        checkIosJailbreak();
        checkAsync();
    }, []);

    // Render rooted device warning
    if (isRooted || isIosRooted) {
        return (
            <SafeAreaView style={styles.rootedContainer}>
                <Text style={styles.rootedText}>
                    Trust failed with this device. This device is rooted/jailbroken, which is a security breach.
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.mainBody}>
            <VersionCheck />
            <LoaderScreen loading={loading} />

            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={100}>

                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContainer}>

                    <View>
                        {/* Logo Section */}
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('./assets/images/logo/ntpc-logo-white.png')}
                                style={styles.logoImage}
                            />
                            <Text style={styles.appTitle}>NQWeld</Text>
                            <Image
                                source={require('./assets/images/login-page/plant-01.jpg')}
                                style={styles.plantImage}
                            />
                        </View>

                        {/* Username Input */}
                        <View style={styles.SectionStyle}>
                            <TextInput
                                style={[styles.inputStyle, { backgroundColor: bGColor, color: fontColor }]}
                                onChangeText={(text: string) => setUserEmail(sanitizeInput(text))}
                                placeholder="Login Id"
                                placeholderTextColor="#8b9cb5"
                                autoCapitalize="none"
                                keyboardType="default"
                                returnKeyType="next"
                                onSubmitEditing={() => passwordInputRef.current?.focus()}
                                underlineColorAndroid="transparent"
                                blurOnSubmit={false}
                                editable={isEditUserid}
                                value={userEmail}
                                textAlign="center"
                            />
                        </View>

                        {/* Captcha Section */}
                        <View style={styles.captchaContainer}>
                            <CheckBox
                                tintColor="#FFFFFF"
                                onCheckColor="#FFFFFF"
                                onTintColor="#FFFFFF"
                                onFillColor="#00FF00"
                                style={styles.checkbox}
                                value={!!reCaptchaToken}
                                disabled={true}
                            />
                            <Text style={styles.captchaText}>Captcha attempted?</Text>

                            <Recaptcha
                                ref={recaptcha}
                                siteKey="6Le9yzwrAAAAAP3EZLHzitEMhdjwIYGdGU0Cm68J"
                                baseUrl="https://webapp.ntpc.co.in"
                                onVerify={onVerify}
                                onExpire={onExpire}
                                size="normal"
                            />

                            <Button
                                mode="elevated"
                                onPress={send}
                                style={styles.captchaButton}>
                                Show Captcha
                            </Button>
                        </View>

                        {/* Get OTP Button */}
                        {!showOTPField && (
                            <TouchableOpacity
                                style={styles.buttonStyle}
                                activeOpacity={0.5}
                                onPress={handleGetOtpPress}>
                                {isOtpLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.buttonTextStyle}>GET OTP</Text>
                                )}
                            </TouchableOpacity>
                        )}

                        {/* OTP Input and Login */}
                        {showOTPField && (
                            <>
                                <View style={styles.SectionStyle}>
                                    <TextInput
                                        style={styles.inputStyle}
                                        secureTextEntry={true}
                                        editable={!isEditUserid}
                                        onChangeText={setUserPassword}
                                        placeholder="Enter OTP"
                                        placeholderTextColor="#8b9cb5"
                                        keyboardType="number-pad"
                                        ref={passwordInputRef}
                                        onSubmitEditing={Keyboard.dismiss}
                                        blurOnSubmit={false}
                                        underlineColorAndroid="transparent"
                                        returnKeyType="done"
                                        value={userPassword}
                                    />
                                </View>

                                {errortext !== '' && (
                                    <Text style={styles.errorTextStyle}>{errortext}</Text>
                                )}

                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={[styles.buttonStyle, styles.loginButton]}
                                        activeOpacity={0.5}
                                        onPress={handleLoginPress}>
                                        <Text style={styles.buttonTextStyle}>Login</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.buttonStyle, styles.resetButton]}
                                        activeOpacity={0.5}
                                        onPress={handleResetPress}>
                                        <Text style={styles.buttonTextStyle}>Reset</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {/* Footer Card */}
                        <Card style={styles.footerCard} elevation={5}>
                            <Card.Content>
                                <Text style={styles.footerText}>
                                    An initiative by{'\n'}
                                    <Text style={styles.footerTextBold}>
                                        NTPC QA Division{'\n'}
                                        in association with NTPC IT Department
                                    </Text>
                                </Text>
                                <Text style={styles.copyrightText}>
                                    {'\u00A9'} NTPC Limited
                                </Text>
                            </Card.Content>
                        </Card>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    mainBody: {
        flex: 1,
        backgroundColor: '#cceeff',
    },
    rootedContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#007C80',
        padding: 20,
    },
    rootedText: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    overlay: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logoImage: {
        width: '90%',
        height: width * 0.3,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    appTitle: {
        color: 'black',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    plantImage: {
        width: '85%',
        height: width * 0.5,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    SectionStyle: {
        height: 50,
        marginTop: 15,
        marginHorizontal: 35,
    },
    inputStyle: {
        flex: 1,
        backgroundColor: '#002A6A',
        color: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderWidth: 1,
        borderRadius: 30,
        borderColor: '#dadae8',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    captchaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginHorizontal: 20,
        marginVertical: 15,
    },
    checkbox: {
        height: 20,
        width: 20,
    },
    captchaText: {
        color: 'black',
        fontSize: 14,
    },
    captchaButton: {
        backgroundColor: '#bcdeefff',
    },
    buttonStyle: {
        backgroundColor: '#36454F',
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        marginHorizontal: 35,
        marginVertical: 10,
    },
    buttonTextStyle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    loginButton: {
        backgroundColor: 'green',
        width: 120,
        marginHorizontal: 5,
    },
    resetButton: {
        width: 120,
        marginHorizontal: 5,
    },
    errorTextStyle: {
        color: 'red',
        textAlign: 'center',
        fontSize: 14,
        marginTop: 10,
    },
    footerCard: {
        width: '96%',
        backgroundColor: '#e6e6e6',
        marginTop: 20,
        alignSelf: 'center',
    },
    footerText: {
        fontSize: 14,
        color: 'black',
        textAlign: 'center',
        marginBottom: 5,
    },
    footerTextBold: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    copyrightText: {
        fontSize: 12,
        color: 'black',
        textAlign: 'center',
        marginTop: 5,
    },
});