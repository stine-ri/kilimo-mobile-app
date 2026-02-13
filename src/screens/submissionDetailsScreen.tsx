import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import axios from 'axios';
import { globalStyles } from '../constants/styles';
import { API_URL } from '../utils/api';
import { storage } from '../utils/storage';

export default function SubmissionDetailScreen({ route, navigation }: any) {
  const { submission } = route.params;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Submission',
      'Are you sure you want to delete this submission?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteSubmission()
        }
      ]
    );
  };

  const deleteSubmission = async () => {
    try {
      const token = await storage.getToken();
      const response = await axios.delete(
        `${API_URL}/api/form/submissions/${submission.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Submission deleted successfully');
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete submission');
    }
  };

  return (
    <View style={globalStyles.container}>
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
        <Text style={styles.headerTitle}>Submission Details</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('EditSubmission', { submission })}
            style={styles.editButton}
          >
            <Image 
              source={require('../../assets/edit-icon.png')}
              style={styles.editIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Image 
              source={require('../../assets/delete-icon.png')}
              style={styles.deleteIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.detailContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>
              {submission.firstName} {submission.lastName}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{submission.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{submission.phoneNumber}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message</Text>
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{submission.message}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submission Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Submission ID:</Text>
            <Text style={styles.detailValueSmall}>{submission.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Submitted:</Text>
            <Text style={styles.detailValue}>{formatDate(submission.createdAt)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
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
  headerButtons: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  editButton: {
    padding: 10,
  },
  editIcon: {
    width: 20,
    height: 20,
    tintColor: '#2196F3',
    marginRight: 10,
  },
  deleteButton: {
    padding: 10,
  },
  deleteIcon: {
    width: 20,
    height: 20,
    tintColor: '#f44336',
  },
  detailContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#4CAF50',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row' as const,
    marginBottom: 10,
  },
  detailLabel: {
    width: 100,
    fontSize: 14,
    color: '#999',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500' as const,
  },
  detailValueSmall: {
    flex: 1,
    fontSize: 12,
    color: '#666',
  },
  messageBox: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
};