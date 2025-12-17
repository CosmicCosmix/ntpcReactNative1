import React, { useState, useRef } from 'react';
import {
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Animated,
  Dimensions,
  ImageBackground,
  Keyboard,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './assets/css/App.styles';
import Svg, { Path, Circle } from 'react-native-svg';
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
  const slideAnim = useRef(new Animated.Value(0)).current;
  const handleLogin = () => {
    Keyboard.dismiss();
    if (username.trim()) {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }
  };
  const handleBack = () => {
    Keyboard.dismiss();
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start(() => {
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
        <View style={styles.mainContainer}>
          {/* Background Image Section - Only above card */}
          <View style={styles.imageSection}>
            <ImageBackground
              source={require('./assets/images/login-page/illustration-01.png')}
              style={styles.backgroundImage}
              resizeMode="cover"
            >
              {/* Overlay */}
              <View style={styles.overlay} />
              {/* Foreground content */}
              <View style={styles.centeredLogoContainer}>
                <Image
                  source={require('./assets/images/logo/ntpc-logo-white.png')}
                  style={styles.centeredLogo}
                  resizeMode="contain"
                />
              </View>
            </ImageBackground>
          </View>
          {/* White Card - Overlaps image slightly */}
          <View style={styles.cardContainer}>
            <View style={styles.solidCardWrapper}>
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
          </View>
        </View>
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
            Don&apos;t have an account? <Text style={styles.signUpLink}>Sign up</Text>
          </Text>
          {/* Username Input Field with SVG Icon */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <UserIcon size={20} color="#9CA3AF" />
            </View>
            <TextInput
              style={styles.input}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor="#C7CACD"
              autoCapitalize="words"
            />
          </View>
          <TouchableOpacity
            style={[styles.button, !username.trim() && styles.buttonDisabled]}
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
              <ArrowLeftIcon size={26} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.titleWithBack}>Enter OTP</Text>
          </View>
          <Text style={styles.subtitle}>
            We have sent a
            <Text style={styles.signUpLink}> 6 digit </Text>
            password to your email.
          </Text>
          {/* OTP Input Field with SVG Icon */}
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
            />
          </View>
          <TouchableOpacity
            style={[styles.button, !otp.trim() && styles.buttonDisabled]}
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
export default App;