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
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { styles } from './assets/css/App.styles';
import { validateOtp, validateUser } from './services/authService';
import Recaptcha, { RecaptchaRef } from 'react-native-recaptcha-that-works';
import { RECAPTCHA_SITE_KEY } from './constants/config';

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

function App() {
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');

  const slideAnim = useRef(new Animated.Value(0)).current;
  const recaptchaRef = useRef<RecaptchaRef | null>(null);

  const openCaptcha = () => {
    // If Recaptcha isn't ready for any reason, fail gracefully.
    try {
      recaptchaRef.current?.open();
    } catch (e) {
      setLoginLoading(false);
      setError('Captcha could not be started. Please try again.');
    }
  };

  const handleLoginPress = () => {
    Keyboard.dismiss();
    if (loginLoading) return;

    if (!username.trim()) return;

    setError('');
    setLoginLoading(true);

    // Trigger invisible reCAPTCHA; once verified, onVerify() will run and call the API.
    openCaptcha();
  };

  const handleRecaptchaVerify = async (token: string) => {
    try {
      const response = await validateUser(username.trim(), token);

      if (response.statusCode === 200) {
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 260,
          useNativeDriver: true,
        }).start();
      } else {
        setError(response.statusDescShort || 'Invalid username. Please try again.');
      }
    } catch (e: any) {
      setError(e?.message || 'An error occurred. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRecaptchaError = (e: any) => {
    setLoginLoading(false);
    setError('Captcha verification failed. Please try again.');
    console.error('Recaptcha Error:', e);
  };

  const handleRecaptchaExpire = () => {
    setLoginLoading(false);
    setError('Captcha expired. Please try again.');
  };

  const handleRecaptchaClose = () => {
    // If the captcha modal opens (challenge) and user closes it, stop loading.
    setLoginLoading(false);
  };

  const handleBack = () => {
    Keyboard.dismiss();
    if (loginLoading || otpLoading) return;

    setError('');
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

    if (!otp.trim()) return;

    setOtpLoading(true);
    setError('');

    try {
      const response = await validateOtp(username.trim(), otp.trim());

      if (response.statusCode === 200) {
        console.log('Login successful!', response);
        // TODO: Store token and navigate to home screen
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
    <SafeAreaProvider>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <View style={styles.mainContainer}>
          {/* Background Image Section */}
          <View style={styles.imageSection}>
            <ImageBackground
              source={require('./assets/images/login-page/illustration-01.png')}
              style={styles.backgroundImage}
              resizeMode="cover"
            >
              <View style={styles.overlay} />
              <View style={styles.centeredLogoContainer}>
                <Image
                  source={require('./assets/images/logo/ntpc-logo-white.png')}
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
                />
              </View>
            </View>
          </View>
        </View>

        {/* Mount Recaptcha once; no custom Modal/backdrop */}
        <Recaptcha
          ref={recaptchaRef}
          siteKey={RECAPTCHA_SITE_KEY}
          baseUrl="https://webapp.ntpc.co.in"
          onVerify={handleRecaptchaVerify}
          onError={handleRecaptchaError}
          onExpire={handleRecaptchaExpire}
          onClose={handleRecaptchaClose}
          size="invisible"
          hideBadge={true}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

type CardContentProps = {
  slideAnim: Animated.Value;
  username: string;
  setUsername: (v: string) => void;
  otp: string;
  setOtp: (v: string) => void;
  handleLogin: () => void;
  handleBack: () => void;
  handleVerifyOTP: () => void;
  loginLoading: boolean;
  otpLoading: boolean;
  error: string;
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

          <TouchableOpacity
            style={[styles.button, (!username.trim() || loginLoading) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!username.trim() || loginLoading}
          >
            <Text style={styles.buttonText}>{loginLoading ? 'Verifying...' : 'Login'}</Text>
          </TouchableOpacity>
        </View>

        {/* OTP Screen */}
        <View style={styles.screen}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={loginLoading || otpLoading}>
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

export default App;