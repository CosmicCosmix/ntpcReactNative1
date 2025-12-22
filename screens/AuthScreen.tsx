import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ImageBackground,
    Keyboard,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { styles } from '../assets/css/App.styles';
import { validateOtp, validateUser } from '../services/authService';
import Recaptcha, { RecaptchaRef } from 'react-native-recaptcha-that-works';
import { RECAPTCHA_SITE_KEY } from '../constants/config';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;
const { width } = Dimensions.get('window');

// Custom SVG Icon Components
const UserIcon = ({ size = 20, color = '#9CA3AF' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Circle
            cx="12"
            cy="7"
            r="4"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

const LockIcon = ({ size = 20, color = '#9CA3AF' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M7 11V7a5 5 0 0 1 10 0v4"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

const ArrowLeftIcon = ({ size = 24, color = '#111827' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M19 12H5M5 12l7 7M5 12l7-7"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

type CardContentProps = {
    slideAnim: Animated.Value;
    username: string;
    setUsername: (v: string) => void;
    otp: string;
    setOtp: (v: string) => void;
    handleLogin: () => void;
    handleBack: () => void;
    handleVerifyOTP: () => void;
    openCaptcha: () => void;
    loginLoading: boolean;
    otpLoading: boolean;
    error: string;
    captchaToken: string;
    onSkipToHome: () => void;
};

const CardContent: React.FC<CardContentProps> = ({
    slideAnim,
    username,
    setUsername,
    otp,
    setOtp,
    handleLogin,
    handleBack,
    handleVerifyOTP,
    loginLoading,
    otpLoading,
    error,
    openCaptcha,
    captchaToken,
    onSkipToHome,
}) => {
    return (
        <View style={styles.cardContent}>
            <Animated.View
                style={[
                    styles.screenContainer,
                    {
                        transform: [{ translateX: slideAnim }],
                    },
                ]}
            >
                {/* Login Screen */}
                <View style={styles.screen}>
                    <Text style={styles.title}>Login</Text>
                    <Text style={styles.subtitle}>
                        Don&apos;t have an account? <Text style={styles.signUpLink}>Sign up</Text>
                    </Text>
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputIcon}>
                            <UserIcon size={20} color="#9CA3AF" />
                        </View>
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Enter username"
                            placeholderTextColor="#C7CACD"
                            autoCapitalize="none"
                            editable={!loginLoading}
                        />
                    </View>
                    <TouchableOpacity onPress={openCaptcha}>
                        <Text>Show Captcha {captchaToken ? '✓' : ''}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            (!username.trim() || loginLoading || !captchaToken) && styles.buttonDisabled,
                        ]}
                        onPress={handleLogin}
                        disabled={!username.trim() || loginLoading || !captchaToken}
                    >
                        <Text style={styles.buttonText}>{loginLoading ? 'Verifying...' : 'Login'}</Text>
                    </TouchableOpacity>
                    {/* DEV ONLY */}
                    <TouchableOpacity onPress={onSkipToHome}>
                        <Text>Skip to home page</Text>
                    </TouchableOpacity>
                </View>
                {/* OTP Screen */}
                <View style={styles.screen}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleBack}
                            disabled={loginLoading || otpLoading}
                        >
                            <ArrowLeftIcon size={26} color="#111827" />
                        </TouchableOpacity>
                        <Text style={styles.titleWithBack}>Enter OTP</Text>
                    </View>
                    <Text style={styles.subtitle}>
                        We have sent a<Text style={styles.signUpLink}> 6 digit </Text>password to your email.
                    </Text>
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputIcon}>
                            <LockIcon size={20} color="#9CA3AF" />
                        </View>
                        <TextInput
                            style={styles.input}
                            value={otp}
                            onChangeText={setOtp}
                            placeholder="Enter OTP"
                            placeholderTextColor="#C7CACD"
                            keyboardType="number-pad"
                            maxLength={6}
                            editable={!otpLoading}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.button, (!otp.trim() || otpLoading) && styles.buttonDisabled]}
                        onPress={handleVerifyOTP}
                        disabled={!otp.trim() || otpLoading}
                    >
                        <Text style={styles.buttonText}>{otpLoading ? 'Verifying...' : 'Verify OTP'}</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

export default function AuthScreen({ navigation }: Props) {
    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [error, setError] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [tempTokenStr, setTempTokenStr] = useState(''); // Store token from first API call
    const slideAnim = useRef(new Animated.Value(0)).current;
    const recaptchaRef = useRef<RecaptchaRef | null>(null);

    const openCaptcha = () => {
        try {
            recaptchaRef.current?.open();
        } catch (e) {
            console.error('Captcha open error:', e);
            setError('Captcha could not be started. Please try again.');
        }
    };

    const handleRecaptchaVerify = (token: string) => {
        console.log('Recaptcha token received:', token);
        setCaptchaToken(token);
    };

    const handleRecaptchaError = (err: any) => {
        console.error('Recaptcha Error:', err);
        setError('Captcha verification failed. Please try again.');
        setCaptchaToken('');
    };

    const handleRecaptchaExpire = () => {
        console.log('Recaptcha expired');
        setError('Captcha expired. Please try again.');
        setCaptchaToken('');
    };

    const handleRecaptchaClose = () => {
        console.log('Recaptcha closed by user');
    };

    const handleLoginPress = async () => {
        Keyboard.dismiss();
        if (loginLoading) return;
        if (!username.trim()) {
            setError('Please enter username');
            return;
        }
        if (!captchaToken) {
            setError('Please complete the captcha first');
            return;
        }
        setError('');
        setLoginLoading(true);
        try {
            const response = await validateUser(username.trim(), captchaToken);
            if (response.statusCode === 200) {
                // Store the tokenString for OTP verification
                if (response.tokenString) {
                    setTempTokenStr(response.tokenString);
                    Animated.timing(slideAnim, {
                        toValue: -width,
                        duration: 260,
                        useNativeDriver: true,
                    }).start();
                } else {
                    setError('Invalid response from server. Please try again.');
                    setCaptchaToken('');
                }
            } else {
                setError(response.statusDescShort || 'Invalid username. Please try again.');
                setCaptchaToken(''); // reset captcha token on error
            }
        } catch (e: any) {
            console.error('Validation error:', e);
            setError(e?.message || 'An error occurred. Please try again.');
            setCaptchaToken('');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleBack = () => {
        Keyboard.dismiss();
        if (loginLoading || otpLoading) return;
        setError('');
        setCaptchaToken('');
        setTempTokenStr(''); // Clear token
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
        }).start(() => {
            setOtp('');
        });
    };

    const handleVerifyOTP = async () => {
        Keyboard.dismiss();
        if (otpLoading) return;
        if (!otp.trim()) {
            setError('Please enter OTP');
            return;
        }
        if (!tempTokenStr) {
            setError('Session expired. Please login again.');
            handleBack();
            return;
        }

        setOtpLoading(true);
        setError('');
        try {
            // Pass the tokenString from first API call
            const response = await validateOtp(username.trim(), otp.trim(), tempTokenStr);
            if (response.statusCode === 200) {
                // Success - navigate to Home
                navigation.replace('Home');
            } else {
                setError(response.statusDescShort || 'Invalid OTP. Please try again.');
            }
        } catch (e: any) {
            setError(e?.message || 'An error occurred. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    return (
        <>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
                <View style={styles.mainContainer}>
                    {/* Background Image Section */}
                    <View style={styles.imageSection}>
                        <ImageBackground
                            source={require('../assets/images/login-page/illustration-01.png')}
                            style={styles.backgroundImage}
                            resizeMode="cover"
                        >
                            <View style={styles.overlay} />
                            <View style={styles.centeredLogoContainer}>
                                <Image
                                    source={require('../assets/images/logo/ntpc-logo-white.png')}
                                    style={styles.centeredLogo}
                                    resizeMode="contain"
                                />
                            </View>
                        </ImageBackground>
                    </View>
                    {/* White Card */}
                    <View style={styles.cardContainer}>
                        <View style={styles.solidCardWrapper}>
                            <View style={styles.cardInner}>
                                <CardContent
                                    slideAnim={slideAnim}
                                    username={username}
                                    setUsername={setUsername}
                                    otp={otp}
                                    setOtp={setOtp}
                                    handleLogin={handleLoginPress}
                                    handleBack={handleBack}
                                    handleVerifyOTP={handleVerifyOTP}
                                    loginLoading={loginLoading}
                                    otpLoading={otpLoading}
                                    error={error}
                                    openCaptcha={openCaptcha}
                                    captchaToken={captchaToken}
                                    onSkipToHome={() => navigation.navigate('Home')}
                                />
                            </View>
                        </View>
                    </View>
                </View>
                {/* Recaptcha Component - Hidden, triggered programmatically */}
                <Recaptcha
                    ref={recaptchaRef}
                    siteKey={RECAPTCHA_SITE_KEY}
                    baseUrl="https://webapp.ntpc.co.in"
                    onVerify={handleRecaptchaVerify}
                    onError={handleRecaptchaError}
                    onExpire={handleRecaptchaExpire}
                    onClose={handleRecaptchaClose}
                    size="normal"
                    hideBadge={false}
                />
            </SafeAreaView>
        </>
    );
}