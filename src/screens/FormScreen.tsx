import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import axios from 'axios';
import { globalStyles } from '../constants/styles';
import { API_URL } from '../utils/api';
import { storage } from '../utils/storage';

export default function FormScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const user = await storage.getUser();
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        message: ''
      });
    }
  };

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
      const token = await storage.getToken();
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
        await storage.clearAll();
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Submission failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await storage.clearAll();
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={globalStyles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={globalStyles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Simple Header - No Card Container */}
        <View style={styles.simpleHeader}>
          <View style={styles.logoTitleRow}>
            <Image 
              source={require('../../assets/plantimage.png')}
              style={globalStyles.smallLogo}
              resizeMode="contain"
            />
            <Text style={globalStyles.title}>Farmer Form</Text>
          </View>
          
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Submissions')}
              style={styles.simpleHistoryButton}
            >
              <Image 
                source={require('../../assets/history-icon.png')}
                style={styles.simpleIcon}
                resizeMode="contain"
              />
              <Text style={styles.simpleHistoryText}>History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleLogout} style={styles.simpleLogoutButton}>
              <Image 
                source={require('../../assets/logout-icon.png')}
                style={styles.simpleIcon}
                resizeMode="contain"
              />
              <Text style={styles.simpleLogoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Section */}
        <View style={globalStyles.form}>
          {/* First Name */}
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
              value={formData.firstName}
              onChangeText={(text) => setFormData({...formData, firstName: text})}
            />
          </View>
          
          {/* Last Name */}
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
              value={formData.lastName}
              onChangeText={(text) => setFormData({...formData, lastName: text})}
            />
          </View>
          
          {/* Email (read-only) */}
          <View style={globalStyles.inputContainer}>
            <Image 
              source={require('../../assets/email-icon.png')}
              style={globalStyles.inputIcon}
              resizeMode="contain"
            />
            <TextInput
              style={[globalStyles.inputWithIcon, { color: '#666' }]}
              placeholder="Email"
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />
          </View>
          
          {/* Phone Number */}
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
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
              keyboardType="phone-pad"
            />
          </View>
          
          {/* Message */}
          <View style={globalStyles.inputContainer}>
            <Image 
              source={require('../../assets/chat-icon.png')}
              style={globalStyles.inputIcon}
              resizeMode="contain"
            />
            <TextInput
              style={[globalStyles.inputWithIcon, globalStyles.textArea]}
              placeholder="Message (minimum 10 characters)"
              placeholderTextColor="#999"
              value={formData.message}
              onChangeText={(text) => setFormData({...formData, message: text})}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[globalStyles.button, loading && globalStyles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Image 
                  source={require('../../assets/submit-icon.png')}
                  style={globalStyles.buttonIcon}
                  resizeMode="contain"
                />
                <Text style={globalStyles.buttonText}>Submit Form</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Simple styles - no card container
const styles = {
  simpleHeader: {
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: '100%' as const,
    paddingTop: 50,
    paddingBottom: 30,
    gap: 15,
  },
  logoTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 20,
  },
  simpleHistoryButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  simpleLogoutButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  simpleIcon: {
    width: 18,
    height: 18,
  },
  simpleHistoryText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500' as const,
  },
  simpleLogoutText: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: '500' as const,
  },
};