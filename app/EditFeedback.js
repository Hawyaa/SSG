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
      <Text style={styles.label}>Rating (1-5):</Text>
      <TextInput
        style={styles.input}
        value={rating}
        onChangeText={setRating}
        keyboardType="numeric"
        maxLength={1}
      />

      <Text style={styles.label}>Comments:</Text>
      <TextInput
        style={[styles.input, styles.commentsInput]}
        value={comments}
        onChangeText={setComments}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={styles.updateButton}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16
  },
  commentsInput: {
    height: 100,
    textAlignVertical: 'top'
  },
  updateButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default EditFeedback;