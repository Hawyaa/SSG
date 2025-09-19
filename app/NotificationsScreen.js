import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Alert, 
  TouchableOpacity,
  LogBox
} from "react-native";
import { db } from "./firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import * as Notifications from "expo-notifications";

// 🔹 Suppress the simulator warning
LogBox.ignoreLogs([
  "Must be run on a physical device"
]);

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(data);
    });

    // Listen for foreground notifications
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        Alert.alert(
          notification.request.content.title,
          notification.request.content.body
        );
      }
    );

    return () => {
      unsubscribe();
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* 🔹 Go Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>⬅ Go Back</Text>
      </TouchableOpacity>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message}>{item.message}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notifications yet.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f7fa" },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#3498db",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  backButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  message: { fontSize: 14, color: "#333" },
  emptyText: { textAlign: "center", marginTop: 50, color: "#888" },
});

export default NotificationsScreen;
