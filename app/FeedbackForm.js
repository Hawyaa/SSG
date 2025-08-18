import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const FeedbackForm = ({ navigation }) => {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        rating,
        comments,
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        userName: auth.currentUser?.displayName || auth.currentUser?.email.split('@')[0],
        timestamp: serverTimestamp()
      });
      Alert.alert('Success', 'Thank you for your feedback!');
      navigation.navigate('ViewFeedback');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image 
            source={require('./assets/back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Feedback</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>How would you rate your experience?</Text>
        
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity 
              key={star} 
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Image
                source={star <= rating ? 
                  require('./assets/star_filled.png') : 
                  require('./assets/star_empty.png')}
                style={styles.starIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.ratingText}>
          {rating === 0 ? 'Select a rating' : `You rated: ${rating} star${rating > 1 ? 's' : ''}`}
        </Text>

        <Text style={styles.sectionTitle}>Additional Comments</Text>
        <TextInput
          style={styles.commentsInput}
          multiline
          numberOfLines={5}
          value={comments}
          onChangeText={setComments}
          placeholder="Tell us more about your experience..."
          placeholderTextColor="#999"
        />

        <TouchableOpacity 
          style={[styles.submitButton, (rating === 0 || isSubmitting) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 24,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  starButton: {
    padding: 10,
  },
  starIcon: {
    width: 40,
    height: 40,
  },
  ratingText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
    fontSize: 14,
  },
  commentsInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    height: 150,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#333',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#4caf50',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FeedbackForm;