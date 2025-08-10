import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const HomeScreen = ({ user, onNavigate }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {user?.name}!</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => onNavigate('Surveys')}
      >
        <Text style={styles.buttonText}>View Surveys</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => onNavigate('Feedback')}
      >
        <Text style={styles.buttonText}>Provide Feedback</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => onNavigate('Settings')}
      >
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  welcome: { fontSize: 20, marginBottom: 30, textAlign: 'center' },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});

export default HomeScreen;