import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('timestamp', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const notificationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title || 'Notification',
          message: doc.data().message || '',
          date: doc.data().timestamp?.toDate()?.toLocaleString() || 'Recently'
        }));
        
        setNotifications(notificationsData);
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
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
      {/* Back Button */}
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
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.notificationItem}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationDate}>{item.date}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notifications yet</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  notificationItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    marginHorizontal: 15
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5
  },
  notificationDate: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666'
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10
  },
  backIcon: {
    width: 24,
    height: 24
  },
  listContent: {
    paddingTop: 70,
    paddingBottom: 20
  }
});

export default NotificationsScreen;