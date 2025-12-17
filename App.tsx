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
import Icon from 'react-native-vector-icons/FontAwesome';
const { width, height } = Dimensions.get('window');

function App() {
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
        <View style={styles.mainContainer}>
          {/* Background Image Section - Only above card */}
          <View style={styles.imageSection}>
            <ImageBackground
              source={require('./assets/images/login-page/plant-01.jpg')}
              style={styles.backgroundImage}
              resizeMode="cover"
            >
              {/* Centered Logo */}
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