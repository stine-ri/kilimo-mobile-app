import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL 
const API_URL = 'http://192.168.100.4:3000';

const Stack = createStackNavigator();

// ============ LOGIN SCREEN ============
function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
            await AsyncStorage.setItem('token', response.data.data.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
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

return (
  <KeyboardAvoidingView 
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.container}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
  >
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={styles.header}>
        <Image 
          source={require('./assets/plantimage.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Kilimo</Text>
        <Text style={styles.subtitle}>Your Farming Assistant</Text>
      </View>

      <View style={styles.form}>
        {isRegistering && (
          <>
            <View style={styles.inputContainer}>
              <Image 
                source={require('./assets/user-icon.png')}
                style={styles.inputIcon}
                resizeMode="contain"
              />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Image 
                source={require('./assets/user-icon.png')}
                style={styles.inputIcon}
                resizeMode="contain"
              />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Image 
                source={require('./assets/phone-icon.png')}
                style={styles.inputIcon}
                resizeMode="contain"
              />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          </>
        )}

        <View style={styles.inputContainer}>
          <Image 
            source={require('./assets/email-icon.png')}
            style={styles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.inputWithIcon}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Image 
            source={require('./assets/shield-icon.png')}
            style={styles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.inputWithIcon}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIconContainer}
          >
            <Image 
              source={showPassword 
                ? require('./assets/eye-open-icon.png') 
                : require('./assets/eye-closed-icon.png')
              }
              style={styles.eyeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {isRegistering ? 'Register' : 'Login'}
            </Text>
          )}
        </TouchableOpacity>

        {unverifiedEmail ? (
          <TouchableOpacity 
            style={styles.otpButton}
            onPress={() => navigation.navigate('OTP', { email: unverifiedEmail })}
          >
            <Image 
              source={require('./assets/key-icon.png')}
              style={styles.buttonIcon}
              resizeMode="contain"
            />
            <Text style={styles.otpButtonText}>
              I have an OTP - Enter Code
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity 
          style={styles.linkContainer}
          onPress={() => {
            setIsRegistering(!isRegistering);
            setUnverifiedEmail('');
            setShowPassword(false); // Reset password visibility when switching
          }}
        >
          <Text style={styles.linkText}>
            {isRegistering 
              ? 'Already have an account? Login' 
              : "Don't have an account? Register"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
);
}

// ============ OTP SCREEN ============
function OTPScreen({ route, navigation }: any) {
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
        await AsyncStorage.setItem('token', response.data.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
        
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
    <View style={styles.container}>
      <View style={styles.otpContainer}>
        <Image 
          source={require('./assets/plantimage.png')}
          style={styles.smallLogo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to:
        </Text>
        <Text style={styles.emailText}>{email}</Text>

        <View style={styles.otpInputContainer}>
          <Image 
            source={require('./assets/key-icon.png')}
            style={styles.otpIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.otpInput}
            placeholder="000000"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus={true}
          />
        </View>

        <View style={styles.timerContainer}>
          <Image 
            source={require('./assets/clock-icon.png')}
            style={styles.timerIcon}
            resizeMode="contain"
          />
          <Text style={styles.timer}>
            Code expires in: {formatTime(timeLeft)}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={verifyOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.resendContainer}
          onPress={resendOTP}
          disabled={timeLeft > 0}
        >
          <Image 
            source={require('./assets/updated-icon.png')}
            style={[styles.resendIcon, timeLeft > 0 && styles.disabledIcon]}
            resizeMode="contain"
          />
          <Text style={[styles.linkText, timeLeft > 0 && styles.disabledText]}>
            Didn't receive code? Resend
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backContainer}
          onPress={() => navigation.navigate('Login')}
        >
          <Image 
            source={require('./assets/back-icon.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
          <Text style={styles.backToLoginText}>
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============ FORM SCREEN ============
function FormScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('user').then((userData) => {
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setFormData({
          firstName: parsed.firstName || '',
          lastName: parsed.lastName || '',
          email: parsed.email || '',
          phoneNumber: parsed.phoneNumber || '',
          message: ''
        });
      }
    });
  }, []);

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phoneNumber || !formData.message) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (formData.message.length < 10) {
      Alert.alert('Error', 'Message must be at least 10 characters');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/form/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        Alert.alert(
          'Success', 
          'Form submitted successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                setFormData({
                  ...formData,
                  message: ''
                });
              }
            }
          ]
        );
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Submission failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    navigation.navigate('Login');
  };

return (
  <KeyboardAvoidingView 
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.container}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
  >
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={styles.header}>
        <Image 
          source={require('./assets/plantimage.png')}
          style={styles.smallLogo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Farmer Form</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutContainer}>
          <Image 
            source={require('./assets/logout-icon.png')}
            style={styles.logoutIcon}
            resizeMode="contain"
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Image 
            source={require('./assets/user-icon.png')}
            style={styles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.inputWithIcon}
            placeholder="First Name"
            value={formData.firstName}
            onChangeText={(text) => setFormData({...formData, firstName: text})}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Image 
            source={require('./assets/user-icon.png')}
            style={styles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.inputWithIcon}
            placeholder="Last Name"
            value={formData.lastName}
            onChangeText={(text) => setFormData({...formData, lastName: text})}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Image 
            source={require('./assets/email-icon.png')}
            style={styles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.inputWithIcon}
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Image 
            source={require('./assets/phone-icon.png')}
            style={styles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.inputWithIcon}
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
            keyboardType="phone-pad"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Image 
            source={require('./assets/chat-icon.png')}
            style={styles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={[styles.inputWithIcon, styles.textArea]}
            placeholder="Message (minimum 10 characters)"
            value={formData.message}
            onChangeText={(text) => setFormData({...formData, message: text})}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Image 
                source={require('./assets/submit-icon.png')}
                style={styles.buttonIcon}
                resizeMode="contain"
              />
              <Text style={styles.buttonText}>Submit Form</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
);
}

// ============ MAIN APP ============
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="Form" component={FormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ============ STYLES ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#4CAF50',
  },
  inputWithIcon: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: 'white',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#4CAF50',
    textAlign: 'center',
    fontSize: 16,
  },
  otpContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  otpInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
    marginVertical: 30,
    width: '100%',
    paddingHorizontal: 15,
  },
  otpIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    tintColor: '#4CAF50',
  },
  otpInput: {
    flex: 1,
    padding: 15,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 10,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: '#666',
  },
  timer: {
    fontSize: 18,
    color: '#666',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  resendIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: '#4CAF50',
  },
  disabledIcon: {
    tintColor: '#999',
  },
  disabledText: {
    color: '#999',
  },
  logoutContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIcon: {
    width: 18,
    height: 18,
    marginRight: 5,
    tintColor: '#f44336',
  },
  logoutText: {
    color: '#f44336',
    fontSize: 16,
  },
  otpButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  otpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emailText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  backContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  backIcon: {
    width: 16,
    height: 16,
    marginRight: 5,
    tintColor: '#666',
  },
  backToLoginText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  smallLogo: {
    width: 50,
    height: 50,
    marginBottom: 15,
  },
eyeIconContainer: {
  padding: 10,
  justifyContent: 'center',
  alignItems: 'center',
},
eyeIcon: {
  width: 22,
  height: 22,
  tintColor: '#666',
},
});