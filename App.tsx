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
import { validateUser, validateOtp } from './services/authService';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!username.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await validateUser(username.trim());

      if (response.statusCode === 200) {
        // Success - move to OTP screen
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 260,
          useNativeDriver: true,
        }).start();
      } else {
        // Error - show message
        setError(response.message || 'Invalid username. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    Keyboard.dismiss();
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
    if (!otp.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await validateOtp(username.trim(), otp.trim());

      if (response.statusCode === 200) {
        // Success - login complete
        console.log('Login successful!', response);
      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
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
                  loading={loading}
                  error={error}
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
  loading: boolean;
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
  loading,
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
            Don't have an account? <Text style={styles.signUpLink}>Sign up</Text>
          </Text>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Username Input Field with SVG Icon */}
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
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, (!username.trim() || loading) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!username.trim() || loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Validating...' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* OTP Screen */}
        <View style={styles.screen}>
          {/* Back button and Title on same row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              disabled={loading}
            >
              <ArrowLeftIcon size={26} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.titleWithBack}>Enter OTP</Text>
          </View>
          <Text style={styles.subtitle}>
            We have sent a
            <Text style={styles.signUpLink}> 6 digit </Text>
            password to your email.
          </Text>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

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
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, (!otp.trim() || loading) && styles.buttonDisabled]}
            onPress={handleVerifyOTP}
            disabled={!otp.trim() || loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default App;