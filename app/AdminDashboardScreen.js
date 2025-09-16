import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { db } from "./firebase";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

const AdminDashboardScreen = ({ navigation }) => {
  const [surveyResponses, setSurveyResponses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("responses");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "responses") {
        const responsesRef = collection(db, "surveyResponses");
        const q = query(responsesRef, orderBy("submittedAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().submittedAt?.toDate()?.toLocaleString() || "Unknown date",
        }));
        setSurveyResponses(data);
      } else {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const toggleUserRole = async (userId, currentRole) => {
    try {
      const userRef = doc(db, "users", userId);
      const newRole = currentRole === "admin" ? "user" : "admin";
      await updateDoc(userRef, { role: newRole });
      Alert.alert("Success", `User role changed to ${newRole}`);
      fetchData();
    } catch (error) {
      console.error("Error updating user role:", error);
      Alert.alert("Error", "Failed to update user role");
    }
  };

  const renderResponseItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.surveyTitle || "Unknown Survey"}</Text>
      <Text style={styles.cardSubtitle}>By: {item.userName || item.userEmail}</Text>
      <Text style={styles.cardDate}>{item.date}</Text>
      {item.answers &&
        Object.entries(item.answers).map(([questionId, answer]) => (
          <View key={questionId} style={styles.answerItem}>
            <Text style={styles.answerText}>Q: {questionId}</Text>
            <Text style={styles.answerValue}>A: {String(answer)}</Text>
          </View>
        ))}
    </View>
  );

  const renderUserItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.displayName || "No Name"}</Text>
      <Text style={styles.cardSubtitle}>{item.email}</Text>
      <View style={styles.userRoleContainer}>
        <Text
          style={[
            styles.roleBadge,
            item.role === "admin" ? styles.adminBadge : styles.userBadge,
          ]}
        >
          {item.role || "user"}
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            style={[
              styles.promoteButton,
              { backgroundColor: item.role === "admin" ? "#e67e22" : "#2ecc71" },
            ]}
            onPress={() => toggleUserRole(item.id, item.role)}
          >
            <Ionicons
              name={item.role === "admin" ? "arrow-down" : "arrow-up"}
              size={16}
              color="#fff"
            />
            <Text style={styles.promoteText}>{item.role === "admin" ? "Make User" : "Make Admin"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.promoteButton, { backgroundColor: "#3498db" }]}
            onPress={() => navigation.navigate("Profile", { user: item })}
          >
            <Ionicons name="person-circle" size={16} color="#fff" />
            <Text style={styles.promoteText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={20} color="#fff" />
        <Text style={styles.goBackText}>Go Back</Text>
      </TouchableOpacity>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "responses" && styles.activeTab]}
          onPress={() => setActiveTab("responses")}
        >
          <Ionicons name="document-text" size={20} color={activeTab === "responses" ? "#3498db" : "#7f8c8d"} />
          <Text style={[styles.tabText, activeTab === "responses" && styles.activeTabText]}>
            Responses ({surveyResponses.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "users" && styles.activeTab]}
          onPress={() => setActiveTab("users")}
        >
          <Ionicons name="people" size={20} color={activeTab === "users" ? "#3498db" : "#7f8c8d"} />
          <Text style={[styles.tabText, activeTab === "users" && styles.activeTabText]}>
            Users ({users.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === "responses" ? surveyResponses : users}
        renderItem={activeTab === "responses" ? renderResponseItem : renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name={activeTab === "responses" ? "document-text" : "people"} size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>
              {activeTab === "responses" ? "No survey responses yet" : "No users found"}
            </Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3498db"]} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  goBackButton: { flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "#3498db", borderRadius: 8, margin: 16, alignSelf: "flex-start" },
  goBackText: { color: "#fff", fontWeight: "bold", marginLeft: 8 },
  tabContainer: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eaeaea" },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 15, gap: 8 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#3498db" },
  tabText: { fontSize: 14, color: "#7f8c8d", fontWeight: "500" },
  activeTabText: { color: "#3498db" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  listContainer: { padding: 16 },
  card: { backgroundColor: "white", padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#2c3e50", marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: "#7f8c8d", marginBottom: 8 },
  cardDate: { fontSize: 12, color: "#95a5a6", marginBottom: 12 },
  answerItem: { marginBottom: 8, padding: 8, backgroundColor: "#f8f9fa", borderRadius: 6 },
  answerText: { fontSize: 12, color: "#7f8c8d", fontWeight: "500" },
  answerValue: { fontSize: 14, color: "#2c3e50" },
  userRoleContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: "bold", color: "white" },
  adminBadge: { backgroundColor: "#e74c3c" },
  userBadge: { backgroundColor: "#3498db" },
  promoteButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, gap: 4 },
  promoteText: { color: "white", fontSize: 12, fontWeight: "bold" },
  emptyContainer: { alignItems: "center", padding: 40 },
  emptyText: { fontSize: 16, color: "#7f8c8d", marginTop: 16, textAlign: "center" },
});

export default AdminDashboardScreen;
