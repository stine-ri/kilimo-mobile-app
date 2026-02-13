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
        <View style={globalStyles.header}>
          <Image 
            source={require('../../assets/plantimage.png')}
            style={globalStyles.smallLogo}
            resizeMode="contain"
          />
          <Text style={globalStyles.title}>Farmer Form</Text>
            <TouchableOpacity 
                onPress={() => navigation.navigate('Submissions')}
                style={styles.historyButton}
            >
               <Image 
                 source={require('../../assets/history-icon.png')}
                 style={styles.historyIcon}
                 resizeMode="contain"
                />
           </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={globalStyles.logoutContainer}>
            <Image 
              source={require('../../assets/logout-icon.png')}
              style={globalStyles.logoutIcon}
              resizeMode="contain"
            />
            <Text style={globalStyles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={globalStyles.form}>
          <View style={globalStyles.inputContainer}>
            <Image 
              source={require('../../assets/user-icon.png')}
              style={globalStyles.inputIcon}
              resizeMode="contain"
            />
            <TextInput
              style={globalStyles.inputWithIcon}
              placeholder="First Name"
              value={formData.firstName}
              onChangeText={(text) => setFormData({...formData, firstName: text})}
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
              value={formData.lastName}
              onChangeText={(text) => setFormData({...formData, lastName: text})}
            />
          </View>
          
          <View style={globalStyles.inputContainer}>
            <Image 
              source={require('../../assets/email-icon.png')}
              style={globalStyles.inputIcon}
              resizeMode="contain"
            />
            <TextInput
              style={globalStyles.inputWithIcon}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
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
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={globalStyles.inputContainer}>
            <Image 
              source={require('../../assets/chat-icon.png')}
              style={globalStyles.inputIcon}
              resizeMode="contain"
            />
            <TextInput
              style={[globalStyles.inputWithIcon, globalStyles.textArea]}
              placeholder="Message (minimum 10 characters)"
              value={formData.message}
              onChangeText={(text) => setFormData({...formData, message: text})}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

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

const styles = {
  headerButtons: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    position: 'absolute' as const,
    right: 0,
    top: 0,
  },
  historyButton: {
    marginRight: 15,
    padding: 5,
  },
  historyIcon: {
    width: 24,
    height: 24,
    tintColor: '#4CAF50',
  },
};