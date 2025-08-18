import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

const ViewFeedback = ({ navigation }) => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      const q = query(
        collection(db, 'feedback'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const feedbackData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().timestamp?.toDate()?.toLocaleString() || 'Unknown date'
      }));
      
      setFeedback(feedbackData);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      Alert.alert("Error", "Failed to load feedback. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this feedback?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Delete", 
            onPress: async () => {
              await deleteDoc(doc(db, 'feedback', id));
              setFeedback(feedback.filter(item => item.id !== id));
              Alert.alert("Success", "Feedback deleted successfully");
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error deleting feedback:", error);
      Alert.alert("Error", "Failed to delete feedback");
    }
  };

const handleEdit = (item) => {
  navigation.navigate('EditFeedback', { 
    feedbackId: item.id,
    currentRating: item.rating ? item.rating.toString() : "3", // Ensure string conversion
    currentComments: item.comments || "", // Ensure string value
    userId: auth.currentUser.uid // Pass current user ID for validation
  });
};

  useEffect(() => {
    fetchFeedback();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Image
          source={require('./assets/back.png')}
          style={styles.backIcon}
        />
      </TouchableOpacity>
      
      <FlatList
        data={feedback}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.feedbackItem}>
            <View style={styles.feedbackContent}>
              <Text style={styles.rating}>Rating: {item.rating}/5</Text>
              <Text style={styles.comments}>Comments: {item.comments}</Text>
              <Text style={styles.date}>Date: {item.date}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => handleEdit(item)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No feedback submissions found</Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  feedbackItem: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  feedbackContent: {
    marginBottom: 10,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  comments: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
  },
  date: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  listContent: {
    paddingTop: 70,
    paddingBottom: 20,
  }
});

export default ViewFeedback;