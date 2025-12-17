import React, { useState, useRef } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Animated,
  Dimensions,
  useColorScheme,
  Platform,
  ImageBackground,
  Keyboard,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import { styles } from './assets/css/App.styles';

import Icon from 'react-native-vector-icons/FontAwesome';
import BootstrapIcon from 'react-native-vector-icons/FontAwesome5';
const { width, height } = Dimensions.get('window');

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentScreen, setCurrentScreen] = useState<'login' | 'otp'>('login');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleLogin = () => {
    Keyboard.dismiss();
    if (username.trim()) {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 260,
        useNativeDriver: true,
      }).start(() => {
        setCurrentScreen('otp');
      });
    }
  };

  const handleBack = () => {
    Keyboard.dismiss();
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start(() => {
      setCurrentScreen('login');
      setOtp('');
    });
  };

  const handleVerifyOTP = () => {
    Keyboard.dismiss();
    if (otp.trim()) {
      console.log('Verifying OTP:', otp);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        {/* Full Screen Background with Plant Image */}
        <ImageBackground
          source={require('./assets/images/login-page/plant-01.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >

          {/* Content */}
          <View style={styles.background}>
            {/* Top Left Text */}
            <View style={styles.topTextContainer}>
              <Text style={styles.topText}><Text style={styles.topTextBlue}>Log In </Text>to stay on</Text>
              <Text style={styles.topText}>top of your Tasks</Text>
              <Text style={styles.topText}>and <Text style={styles.topTextBlue}>Projects.</Text></Text>
            </View>

            {/* Bottom Right Logo */}
            <View style={styles.bottomLogoContainer}>
              <Image
                source={require('./assets/images/logo/ntpc-logo-white.png')}
                style={styles.bottomLogo}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Glass Card with Grainy Effect */}
          <View style={styles.cardContainer}>
            {Platform.OS === 'ios' ? (
              <BlurView
                style={styles.glassWrapper}
                blurType="light"
                blurAmount={30}
                reducedTransparencyFallbackColor="rgba(255,255,255,0.75)"
              >
                <View style={styles.grainOverlay} />
                <View style={styles.cardInner}>
                  <CardContent
                    slideAnim={slideAnim}
                    username={username}
                    setUsername={setUsername}
                    otp={otp}
                    setOtp={setOtp}
                    handleLogin={handleLogin}
                    handleBack={handleBack}
                    handleVerifyOTP={handleVerifyOTP}
                  />
                </View>
              </BlurView>
            ) : (
              <View style={[styles.glassWrapper, styles.androidGlassFallback]}>
                <View style={styles.grainOverlay} />
                <View style={styles.cardInner}>
                  <CardContent
                    slideAnim={slideAnim}
                    username={username}
                    setUsername={setUsername}
                    otp={otp}
                    setOtp={setOtp}
                    handleLogin={handleLogin}
                    handleBack={handleBack}
                    handleVerifyOTP={handleVerifyOTP}
                  />
                </View>
              </View>
            )}
          </View>
        </ImageBackground>
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
            Don&apos;t have an account?{' '}
            <Text style={styles.signUpLink}>Sign up</Text>
          </Text>

          {/* Username Input Field */}
          <View style={styles.inputContainer}>
            <Icon name="user" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor="#C7CACD"
              autoCapitalize="words"
            />
          </View>
          <TouchableOpacity
            style={[
              styles.button,
              !username.trim() && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={!username.trim()}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* OTP Screen */}
        <View style={styles.screen}>
          {/* Back button and Title on same row */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.titleWithBack}>Enter OTP</Text>
          </View>

          <Text style={styles.subtitle}>
            We have sent a
            <Text style={styles.signUpLink}> 6 digit </Text>
            password to your email.
          </Text>

          {/* OTP Input Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter OTP"
              placeholderTextColor="#C7CACD"
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              !otp.trim() && styles.buttonDisabled,
            ]}
            onPress={handleVerifyOTP}
            disabled={!otp.trim()}
          >
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const HORIZONTAL_PADDING = 24;

export default App;