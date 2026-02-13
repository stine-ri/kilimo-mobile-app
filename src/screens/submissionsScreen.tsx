import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl
} from 'react-native';
import axios from 'axios';
import { globalStyles } from '../constants/styles';
import { API_URL } from '../utils/api';
import { storage } from '../utils/storage';

interface Submission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  message: string;
  createdAt: string;
}

export default function SubmissionsScreen({ navigation }: any) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const token = await storage.getToken();
      const response = await axios.get(
        `${API_URL}/api/form/submissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setSubmissions(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'Failed to load submissions');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSubmissions();
  };

  const handleDelete = (submissionId: string) => {
    Alert.alert(
      'Delete Submission',
      'Are you sure you want to delete this submission?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteSubmission(submissionId)
        }
      ]
    );
  };

  const deleteSubmission = async (submissionId: string) => {
    try {
      const token = await storage.getToken();
      const response = await axios.delete(
        `${API_URL}/api/form/submissions/${submissionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Submission deleted successfully');
        // Remove from list
        setSubmissions(submissions.filter(s => s.id !== submissionId));
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete submission');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderSubmission = ({ item }: { item: Submission }) => (
    <View style={styles.submissionCard}>
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={() => navigation.navigate('SubmissionDetail', { submission: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.submissionName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.submissionDate}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        <Text style={styles.submissionMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.submissionEmail}>{item.email}</Text>
          <Text style={styles.viewDetails}>View Details →</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <Image 
          source={require('../../assets/delete-icon.png')}
          style={styles.deleteIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={globalStyles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading submissions...</Text>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>My Submissions</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Form')}
          style={styles.newButton}
        >
          <Text style={styles.newButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {submissions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image 
            source={require('../../assets/plantimage.png')}
            style={styles.emptyLogo}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>No Submissions Yet</Text>
          <Text style={styles.emptyText}>
            Your form submissions will appear here. Start by submitting your first form!
          </Text>
          <TouchableOpacity 
            style={globalStyles.button}
            onPress={() => navigation.navigate('Form')}
          >
            <Text style={globalStyles.buttonText}>Submit Form</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={submissions}
          renderItem={renderSubmission}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
            />
          }
        />
      )}
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
  backButton: {
    padding: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  newButton: {
    padding: 10,
  },
  newButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  listContainer: {
    padding: 20,
  },
  submissionCard: {
    flexDirection: 'row' as const,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 10,
  },
  submissionName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
  },
  submissionDate: {
    fontSize: 12,
    color: '#999',
  },
  submissionMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  submissionEmail: {
    fontSize: 12,
    color: '#4CAF50',
  },
  viewDetails: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500' as const,
  },
  deleteButton: {
    justifyContent: 'center' as const,
    paddingHorizontal: 15,
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
  },
  deleteIcon: {
    width: 20,
    height: 20,
    tintColor: '#f44336',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 40,
  },
  emptyLogo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center' as const,
    marginBottom: 30,
  },
};