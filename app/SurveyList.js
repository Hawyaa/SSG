import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert, FlatList } from 'react-native';
import { db } from './firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

const SurveyList = ({ navigation, userRole }) => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      // Get all surveys from Firestore
      const surveysRef = collection(db, 'surveys');
      const q = query(surveysRef, where('active', '==', true));
      const querySnapshot = await getDocs(q);
      
      const surveysData = [];
      querySnapshot.forEach((doc) => {
        surveysData.push({ id: doc.id, ...doc.data() });
      });
      
      setSurveys(surveysData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      Alert.alert('Error', 'Failed to load surveys. Please try again.');
      setLoading(false);
    }
  };

  const handleTakeSurvey = (survey) => {
    navigation.navigate('SurveyDetails', { survey });
  };

  const renderSurveyItem = ({ item }) => (
    <View style={styles.surveyCard}>
      <Text style={styles.surveyTitle}>{item.title}</Text>
      <Text style={styles.surveyDescription}>{item.description}</Text>
      <Text style={styles.surveyDate}>
        Expires: {new Date(item.expiryDate?.toDate()).toLocaleDateString()}
      </Text>
      
      <TouchableOpacity 
        style={styles.takeSurveyButton}
        onPress={() => handleTakeSurvey(item)}
      >
        <Text style={styles.takeSurveyButtonText}>Take Survey</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading surveys...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Surveys</Text>
      
      {surveys.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No surveys available at the moment.</Text>
        </View>
      ) : (
        <FlatList
          data={surveys}
          renderItem={renderSurveyItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
      
      {userRole === 'admin' && (
        <TouchableOpacity 
          style={styles.adminButton}
          onPress={() => navigation.navigate('CreateSurvey')}
        >
          <Text style={styles.adminButtonText}>Create New Survey</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f7fa'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center'
  },
  listContainer: {
    paddingBottom: 20
  },
  surveyCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2
  },
  surveyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50'
  },
  surveyDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10
  },
  surveyDate: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 15,
    fontStyle: 'italic'
  },
  takeSurveyButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center'
  },
  takeSurveyButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center'
  },
  adminButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  adminButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

export default SurveyList;