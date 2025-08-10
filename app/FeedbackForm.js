import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const FeedbackForm = ({ onSubmit, onBack }) => {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      
      <Text style={styles.header}>Feedback Form</Text>
      
      <Text style={styles.label}>Rating:</Text>
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text style={styles.star}>{star <= rating ? '★' : '☆'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.label}>Comments:</Text>
      <TextInput
        style={styles.commentsInput}
        multiline
        numberOfLines={4}
        value={comments}
        onChangeText={setComments}
        placeholder="Share your feedback..."
      />
      
      <TouchableOpacity 
        style={styles.submitButton}
        onPress={onSubmit}
      >
        <Text style={styles.submitText}>Submit Feedback</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  backButton: { marginBottom: 20 },
  backText: { color: '#3498db', fontSize: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 10 },
  ratingContainer: { flexDirection: 'row', marginBottom: 20 },
  star: { fontSize: 30, color: '#FFD700', marginRight: 10 },
  commentsInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    height: 100,
    textAlignVertical: 'top'
  },
  submitButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center'
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default FeedbackForm;