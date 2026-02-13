import React, { useState } from 'react';
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

export default function EditSubmissionScreen({ route, navigation }: any) {
  const { submission } = route.params;
  const [formData, setFormData] = useState({
    firstName: submission.firstName,
    lastName: submission.lastName,
    email: submission.email,
    phoneNumber: submission.phoneNumber,
    message: submission.message
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9]{10,}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Phone number must be at least 10 digits';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = await storage.getToken();
      const response = await axios.put(
        `${API_URL}/api/form/submissions/${submission.id}`,
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
          'Submission updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Update failed');
      }
    } finally {
      setLoading(false);
    }
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
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Image 
              source={require('../../assets/back-icon.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Submission</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={globalStyles.form}>
          {/* First Name */}
          <View>
            <View style={[globalStyles.inputContainer, errors.firstName && styles.inputError]}>
              <Image 
                source={require('../../assets/user-icon.png')}
                style={globalStyles.inputIcon}
                resizeMode="contain"
              />
              <TextInput
                style={globalStyles.inputWithIcon}
                placeholder="First Name"
                value={formData.firstName}
                onChangeText={(text) => {
                  setFormData({...formData, firstName: text});
                  if (errors.firstName) setErrors({...errors, firstName: ''});
                }}
              />
            </View>
            {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
          </View>
          
          {/* Last Name */}
          <View>
            <View style={[globalStyles.inputContainer, errors.lastName && styles.inputError]}>
              <Image 
                source={require('../../assets/user-icon.png')}
                style={globalStyles.inputIcon}
                resizeMode="contain"
              />
              <TextInput
                style={globalStyles.inputWithIcon}
                placeholder="Last Name"
                value={formData.lastName}
                onChangeText={(text) => {
                  setFormData({...formData, lastName: text});
                  if (errors.lastName) setErrors({...errors, lastName: ''});
                }}
              />
            </View>
            {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
          </View>
          
          {/* Email */}
          <View>
            <View style={[globalStyles.inputContainer, errors.email && styles.inputError]}>
              <Image 
                source={require('../../assets/email-icon.png')}
                style={globalStyles.inputIcon}
                resizeMode="contain"
              />
              <TextInput
                style={globalStyles.inputWithIcon}
                placeholder="Email"
                value={formData.email}
                onChangeText={(text) => {
                  setFormData({...formData, email: text});
                  if (errors.email) setErrors({...errors, email: ''});
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>
          
          {/* Phone Number */}
          <View>
            <View style={[globalStyles.inputContainer, errors.phoneNumber && styles.inputError]}>
              <Image 
                source={require('../../assets/phone-icon.png')}
                style={globalStyles.inputIcon}
                resizeMode="contain"
              />
              <TextInput
                style={globalStyles.inputWithIcon}
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChangeText={(text) => {
                  setFormData({...formData, phoneNumber: text});
                  if (errors.phoneNumber) setErrors({...errors, phoneNumber: ''});
                }}
                keyboardType="phone-pad"
              />
            </View>
            {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}
          </View>
          
          {/* Message */}
          <View>
            <View style={[globalStyles.inputContainer, errors.message && styles.inputError]}>
              <Image 
                source={require('../../assets/chat-icon.png')}
                style={globalStyles.inputIcon}
                resizeMode="contain"
              />
              <TextInput
                style={[globalStyles.inputWithIcon, globalStyles.textArea]}
                placeholder="Message (minimum 10 characters)"
                value={formData.message}
                onChangeText={(text) => {
                  setFormData({...formData, message: text});
                  if (errors.message) setErrors({...errors, message: ''});
                }}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            {errors.message ? <Text style={styles.errorText}>{errors.message}</Text> : null}
          </View>

          {/* Update Button */}
          <TouchableOpacity 
            style={[globalStyles.button, loading && globalStyles.buttonDisabled]}
            onPress={handleUpdate}
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
                <Text style={globalStyles.buttonText}>Update Submission</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = {
  ...globalStyles,
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#4CAF50',
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  inputError: {
    borderColor: '#f44336',
    borderWidth: 2,
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 35,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center' as const,
    marginTop: 10,
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600' as const,
  },
};