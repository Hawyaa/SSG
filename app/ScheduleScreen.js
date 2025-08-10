// app/ScheduleScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const ScheduleScreen = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('Upcoming');
  
  const surveys = [
    {
      id: 1,
      title: 'Customer Satisfaction',
      date: 'June 15, 2023',
      time: '10:00 AM',
      status: 'Upcoming'
    },
    {
      id: 2,
      title: 'Product Feedback',
      date: 'June 20, 2023', 
      time: '2:00 PM',
      status: 'Completed'
    }
  ];

  const filteredSurveys = surveys.filter(survey => survey.status === activeTab);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Survey Schedule</Text>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('Upcoming')}
        >
          <Text style={styles.tabText}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Completed' && styles.activeTab]}
          onPress={() => setActiveTab('Completed')}
        >
          <Text style={styles.tabText}>Completed</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredSurveys}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.surveyCard}>
            <Text style={styles.surveyTitle}>{item.title}</Text>
            <View style={styles.surveyDetails}>
              <Text style={styles.surveyDate}>{item.date}</Text>
              <Text style={styles.surveyTime}>{item.time}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No {activeTab.toLowerCase()} surveys</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa'
  },
  backButton: {
    marginBottom: 20
  },
  backText: {
    color: '#3498db',
    fontSize: 16
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center'
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db'
  },
  tabText: {
    fontSize: 16,
    color: '#2c3e50'
  },
  surveyCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  surveyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
  surveyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  surveyDate: {
    color: '#7f8c8d'
  },
  surveyTime: {
    color: '#7f8c8d'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#95a5a6'
  }
});

export default ScheduleScreen;