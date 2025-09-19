import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

const EditFeedback = ({ navigation, route }) => {
  const { feedbackId, currentRating, currentComments, timestamp } = route.params;
  const [rating, setRating] = useState(String(currentRating));
  const [comments, setComments] = useState(currentComments);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    // Validate inputs
    if (!rating.trim() || !comments.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      Alert.alert("Error", "Please enter a valid rating between 1 and 5");
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare update data
      const updateData = {
        rating: ratingNum,
        comments: comments,
        timestamp: timestamp instanceof Date ? timestamp : new Date(timestamp)
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      await updateDoc(doc(db, 'feedback', feedbackId), updateData);
      
      Alert.alert("Success", "Feedback updated successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Full update error:", {
        message: error.message,
        code: error.code,
        details: error
      });
      Alert.alert("Error", `Failed to update feedback: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Feedback</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Rating (1-5):</Text>
        <TextInput
          style={styles.input}
          value={rating}
          onChangeText={setRating}
          keyboardType="numeric"
          maxLength={1}
        />

        <Text style={styles.sectionTitle}>Comments:</Text>
        <TextInput
          style={[styles.input, styles.commentsInput]}
          value={comments}
          onChangeText={setComments}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.updateButton, isLoading && styles.updateButtonDisabled]}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Update Feedback</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
  backButton: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: 'bold'
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
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  commentsInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  updateButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditFeedback;