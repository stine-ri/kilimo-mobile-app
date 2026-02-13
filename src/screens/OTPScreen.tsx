import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import axios from 'axios';
import { globalStyles } from '../constants/styles';
import { API_URL } from '../utils/api';
import { storage } from '../utils/storage';

export default function OTPScreen({ route, navigation }: any) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const { email } = route.params;

  useEffect(() => {
    Alert.alert(
      'Check Your Email',
      `We sent a 6-digit code to ${email}. Please enter it below.`,
      [{ text: 'OK' }]
    );
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code from your email');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email,
        otpCode: otp
      });

      if (response.data.success) {
        await storage.setToken(response.data.data.token);
        await storage.setUser(response.data.data.user);
        
        Alert.alert(
          'Verification Successful', 
          'Your account has been verified. Welcome to Kilimo!',
          [
            {
              text: 'Continue',
              onPress: () => navigation.reset({
                index: 0,
                routes: [{ name: 'Form' }],
              })
            }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/resend-otp`, { email });
      if (response.data.success) {
        setTimeLeft(120);
        Alert.alert('Code Sent', 'A new verification code has been sent to your email');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.otpContainer}>
        <Image 
          source={require('../../assets/plantimage.png')}
          style={globalStyles.smallLogo}
          resizeMode="contain"
        />
        <Text style={globalStyles.title}>Verify Your Email</Text>
        <Text style={globalStyles.subtitle}>
          Enter the 6-digit code sent to:
        </Text>
        <Text style={globalStyles.emailText}>{email}</Text>

        <View style={globalStyles.otpInputContainer}>
          <Image 
            source={require('../../assets/key-icon.png')}
            style={globalStyles.otpIcon}
            resizeMode="contain"
          />
          <TextInput
            style={globalStyles.otpInput}
            placeholder="000000"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus={true}
          />
        </View>

        <View style={globalStyles.timerContainer}>
          <Image 
            source={require('../../assets/clock-icon.png')}
            style={globalStyles.timerIcon}
            resizeMode="contain"
          />
          <Text style={globalStyles.timer}>
            Code expires in: {formatTime(timeLeft)}
          </Text>
        </View>

        <TouchableOpacity 
          style={[globalStyles.button, loading && globalStyles.buttonDisabled]}
          onPress={verifyOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={globalStyles.buttonText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={globalStyles.resendContainer}
          onPress={resendOTP}
          disabled={timeLeft > 0}
        >
          <Image 
            source={require('../../assets/updated-icon.png')}
            style={[globalStyles.resendIcon, timeLeft > 0 && globalStyles.disabledIcon]}
            resizeMode="contain"
          />
          <Text style={[globalStyles.linkText, timeLeft > 0 && globalStyles.disabledText]}>
            Didn't receive code? Resend
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={globalStyles.backContainer}
          onPress={() => navigation.navigate('Login')}
        >
          <Image 
            source={require('../../assets/back-icon.png')}
            style={globalStyles.backIcon}
            resizeMode="contain"
          />
          <Text style={globalStyles.backToLoginText}>
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}