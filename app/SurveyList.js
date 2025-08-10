import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const SurveyList = ({ onSelectSurvey, onBack }) => {
  const surveys = [
    {
      id: 1,
      title: 'Customer Satisfaction',
      description: 'Rate your recent experience with our services',
      dueDate: 'Due: Jun 15, 2023',
      status: 'Pending'
    },
    {
      id: 2,
      title: 'Product Feedback',
      description: 'Tell us about our latest product features',
      dueDate: 'Completed: Jun 5, 2023',
      status: 'Completed'
    }
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      
      <Text style={styles.header}>Available Surveys</Text>
      
      <FlatList
        data={surveys}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.surveyCard}
            onPress={() => onSelectSurvey(item.id)}
          >
            <Text style={styles.surveyTitle}>{item.title}</Text>
            <Text style={styles.surveyDesc}>{item.description}</Text>
            <View style={styles.footer}>
              <Text style={styles.dueDate}>{item.dueDate}</Text>
              <Text style={[
                styles.status,
                item.status === 'Completed' ? styles.completed : styles.pending
              ]}>
                {item.status}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  backButton: { marginBottom: 15 },
  backText: { color: '#3498db', fontSize: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  surveyCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  surveyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  surveyDesc: { color: '#666', marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  dueDate: { color: '#888', fontSize: 12 },
  status: { fontSize: 12, fontWeight: 'bold' },
  completed: { color: 'green' },
  pending: { color: 'orange' }
});

export default SurveyList;