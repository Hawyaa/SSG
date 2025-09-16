import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

const ViewFeedback = ({ navigation }) => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeedback = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "User not authenticated");
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, 'feedback'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc') // Changed to createdAt
      );
      
      const querySnapshot = await getDocs(q);
      const feedbackData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate()?.toLocaleString() || 'Unknown date' // Changed to createdAt
      }));
      
      setFeedback(feedbackData);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      Alert.alert("Error", "Failed to load feedback. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      currentTitle: item.title || "",
      currentCategory: item.category || "general",
      currentRating: item.rating ? item.rating.toString() : "5",
      currentMessage: item.message || item.comments || "",
      userId: auth.currentUser?.uid
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeedback();
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading feedback...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Feedback</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={feedback}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.feedbackItem}>
            <View style={styles.feedbackHeader}>
              <Text style={styles.feedbackTitle}>{item.title}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            
            <View style={styles.ratingCategory}>
              <Text style={styles.rating}>⭐ {item.rating}/5</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>
            
            {item.message && (
              <Text style={styles.message}>{item.message}</Text>
            )}
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.editButton]}
                onPress={() => handleEdit(item)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.deleteButton]}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No feedback submissions yet</Text>
            <Text style={styles.emptySubtext}>Submit your first feedback to see it here!</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666'
  },
  feedbackItem: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 10
  },
  ratingCategory: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFA500'
  },
  category: {
    fontSize: 14,
    color: '#3498db',
    textTransform: 'capitalize'
  },
  date: {
    fontSize: 12,
    color: '#666'
  },
  message: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 15
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6
  },
  editButton: {
    backgroundColor: '#3498db'
  },
  deleteButton: {
    backgroundColor: '#e74c3c'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center'
  },
  listContent: {
    paddingBottom: 20
  }
});

export default ViewFeedback;