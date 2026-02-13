import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import axios from 'axios';
import { globalStyles } from '../constants/styles';
import { API_URL } from '../utils/api';
import { storage } from '../utils/storage';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }

    if (isRegistering && (!firstName || !lastName || !phoneNumber)) {
      Alert.alert('Error', 'All fields are required for registration');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegistering 
        ? { email, password, firstName, lastName, phoneNumber }
        : { email, password };

      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      
      if (response.data.success) {
        if (isRegistering) {
          Alert.alert(
            'Registration Successful', 
            'We sent a 6-digit OTP to your email. Please verify to continue.',
            [
              {
                text: 'Enter OTP',
                onPress: () => navigation.navigate('OTP', { email })
              }
            ]
          );
        } else {
          if (response.data.requiresOTP) {
            setUnverifiedEmail(email);
            Alert.alert(
              'Account Not Verified', 
              'Please verify your email address with the OTP we sent.',
              [
                {
                  text: 'Enter OTP',
                  onPress: () => navigation.navigate('OTP', { email })
                },
                {
                  text: 'Resend OTP',
                  onPress: () => handleResendOTP(email)
                }
              ]
            );
          } else {
            await storage.setToken(response.data.data.token);
            await storage.setUser(response.data.data.user);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Form' }],
            });
          }
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (email: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/resend-otp`, { email });
      if (response.data.success) {
        Alert.alert('OTP Sent', 'Check your email for the new verification code');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const handleModeSwitch = () => {
    setIsSwitching(true);
    
    if (isRegistering) {
      setFirstName('');
      setLastName('');
      setPhoneNumber('');
    }
    
    setUnverifiedEmail('');
    setShowPassword(false);
    
    setTimeout(() => {
      setIsRegistering(!isRegistering);
      setIsSwitching(false);
    }, 300);
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView 
        contentContainerStyle={globalStyles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={globalStyles.header}>
          <Image 
            source={require('../../assets/plantimage.png')}
            style={globalStyles.logo}
            resizeMode="contain"
          />
          <Text style={globalStyles.title}>Kilimo</Text>
          <Text style={globalStyles.subtitle}>Your Farming Assistant</Text>
        </View>

        <View style={globalStyles.form}>
          {isSwitching ? (
            <View style={globalStyles.switchingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={globalStyles.switchingText}>
                {isRegistering ? 'Switching to Login...' : 'Loading Registration...'}
              </Text>
            </View>
          ) : (
            <>
              {isRegistering && (
                <>
                  <View style={globalStyles.inputContainer}>
                    <Image 
                      source={require('../../assets/user-icon.png')}
                      style={globalStyles.inputIcon}
                      resizeMode="contain"
                    />
                    <TextInput
                      style={globalStyles.inputWithIcon}
                      placeholder="First Name"
                      placeholderTextColor="#999"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={globalStyles.inputContainer}>
                    <Image 
                      source={require('../../assets/user-icon.png')}
                      style={globalStyles.inputIcon}
                      resizeMode="contain"
                    />
                    <TextInput
                      style={globalStyles.inputWithIcon}
                      placeholder="Last Name"
                      placeholderTextColor="#999"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={globalStyles.inputContainer}>
                    <Image 
                      source={require('../../assets/phone-icon.png')}
                      style={globalStyles.inputIcon}
                      resizeMode="contain"
                    />
                    <TextInput
                      style={globalStyles.inputWithIcon}
                      placeholder="Phone Number"
                      placeholderTextColor="#999"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                    />
                  </View>
                </>
              )}

              <View style={globalStyles.inputContainer}>
                <Image 
                  source={require('../../assets/email-icon.png')}
                  style={globalStyles.inputIcon}
                  resizeMode="contain"
                />
                <TextInput
                  style={globalStyles.inputWithIcon}
                  placeholder="Email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
              <View style={globalStyles.inputContainer}>
                <Image 
                  source={require('../../assets/shield-icon.png')}
                  style={globalStyles.inputIcon}
                  resizeMode="contain"
                />
                <TextInput
                  style={globalStyles.inputWithIcon}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={globalStyles.eyeIconContainer}
                  activeOpacity={0.7}
                >
                  <Image 
                    source={showPassword 
                      ? require('../../assets/eye-open-icon.png') 
                      : require('../../assets/eye-closed-icon.png')
                    }
                    style={globalStyles.eyeIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[globalStyles.button, loading && globalStyles.buttonDisabled]}
                onPress={handleAuth}
                disabled={loading}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={globalStyles.buttonText}>
                    {isRegistering ? 'Register' : 'Login'}
                  </Text>
                )}
              </TouchableOpacity>

              {unverifiedEmail && !isRegistering ? (
                <TouchableOpacity 
                  style={globalStyles.otpButton}
                  onPress={() => navigation.navigate('OTP', { email: unverifiedEmail })}
                  activeOpacity={0.7}
                >
                  <Image 
                    source={require('../../assets/key-icon.png')}
                    style={globalStyles.buttonIcon}
                    resizeMode="contain"
                  />
                  <Text style={globalStyles.otpButtonText}>
                    I have an OTP - Enter Code
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity 
                style={globalStyles.linkContainer}
                onPress={handleModeSwitch}
                activeOpacity={0.7}
                disabled={isSwitching}
              >
                <Text style={[globalStyles.linkText, isSwitching && globalStyles.disabledText]}>
                  {isRegistering 
                    ? 'Already have an account? Login' 
                    : "Don't have an account? Register"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}