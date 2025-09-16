import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ImageBackground,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "./firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";

const SurveyListScreen = ({ navigation, userRole = "user" }) => {
  const [surveys, setSurveys] = useState([]);
  const [filteredSurveys, setFilteredSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    fetchSurveys();
  }, []);

  useEffect(() => {
    filterAndSearchSurveys();
  }, [surveys, searchText, filter]);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fetchSurveys = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "User not authenticated");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const surveysRef = collection(db, "surveys");
      const q = query(surveysRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const surveysData = [];
      for (const doc of querySnapshot.docs) {
        const surveyData = { id: doc.id, ...doc.data() };

        if (
          surveyData.createdAt &&
          typeof surveyData.createdAt.toDate === "function"
        ) {
          surveyData.createdAt = surveyData.createdAt.toDate();
        }

        if (
          surveyData.expiryDate &&
          typeof surveyData.expiryDate.toDate === "function"
        ) {
          surveyData.expiryDate = surveyData.expiryDate.toDate();
        }

        try {
          const responsesRef = collection(db, "surveyResponses");
          const responseQuery = query(
            responsesRef,
            where("surveyId", "==", doc.id),
            where("userId", "==", user.uid)
          );
          const responseSnapshot = await getDocs(responseQuery);

          surveyData.completed = !responseSnapshot.empty;
          if (
            !responseSnapshot.empty &&
            responseSnapshot.docs[0].data().submittedAt
          ) {
            surveyData.completionDate = responseSnapshot.docs[0]
              .data()
              .submittedAt.toDate();
          } else {
            surveyData.completionDate = null;
          }
        } catch (error) {
          console.error("Error checking survey completion:", error);
          surveyData.completed = false;
          surveyData.completionDate = null;
        }

        surveysData.push(surveyData);
      }

      setSurveys(surveysData);
      setLoading(false);
      setRefreshing(false);
      setPermissionError(false);
    } catch (error) {
      console.error("Error fetching surveys:", error);
      if (
        error.code === "permission-denied" ||
        error.message.includes("permission")
      ) {
        setPermissionError(true);
        Alert.alert(
          "Permission Error",
          "You do not have permission to view surveys. Please contact support."
        );
      } else {
        Alert.alert("Error", "Failed to load surveys. Please try again.");
      }
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterAndSearchSurveys = () => {
    let filtered = surveys;

    switch (filter) {
      case "active":
        filtered = filtered.filter(
          (survey) =>
            (!survey.expiryDate || survey.expiryDate > new Date()) &&
            !survey.completed
        );
        break;
      case "completed":
        filtered = filtered.filter((survey) => survey.completed);
        break;
      case "expired":
        filtered = filtered.filter(
          (survey) => survey.expiryDate && survey.expiryDate <= new Date()
        );
        break;
      default:
        break;
    }

    if (searchText) {
      filtered = filtered.filter(
        (survey) =>
          survey.title.toLowerCase().includes(searchText.toLowerCase()) ||
          (survey.description &&
            survey.description.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    setFilteredSurveys(filtered);
  };

  const getSurveyStatus = (survey) => {
    if (survey.completed)
      return { text: "Completed", color: "#27ae60", icon: "checkmark-circle" };
    if (survey.expiryDate && survey.expiryDate <= new Date()) {
      return { text: "Expired", color: "#e74c3c", icon: "time-outline" };
    }
    return { text: "Active", color: "#3498db", icon: "rocket" };
  };

  const getCategoryColor = (category) => {
    const colors = {
      service: "#e67e22",
      feedback: "#9b59b6",
      product: "#3498db",
      general: "#7f8c8d",
      default: "#34495e",
    };
    return colors[category?.toLowerCase()] || colors.default;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSurveys();
  };

  const renderSurveyItem = ({ item }) => {
    const status = getSurveyStatus(item);
    const categoryColor = getCategoryColor(item.category);

    return (
      <Animated.View
        style={[
          styles.surveyCard,
          {
            opacity: status.text === "Expired" || item.completed ? 0.8 : 1,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View
          style={[styles.categoryIndicator, { backgroundColor: categoryColor }]}
        />

        <View style={styles.surveyContent}>
          <View style={styles.surveyHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.surveyTitle} numberOfLines={1}>
                {item.title}
              </Text>
              {item.priority === "high" && (
                <View style={styles.priorityBadge}>
                  <Ionicons name="alert" size={12} color="#fff" />
                  <Text style={styles.priorityText}>Priority</Text>
                </View>
              )}
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: status.color }]}
            >
              <Ionicons name={status.icon} size={14} color="#fff" />
              <Text style={styles.statusText}>{status.text}</Text>
            </View>
          </View>

          <Text style={styles.surveyDescription} numberOfLines={2}>
            {item.description || "No description available"}
          </Text>

          <View style={styles.surveyFooter}>
            <View style={styles.metaInfo}>
              {item.expiryDate && (
                <View style={styles.metaItem}>
                  <Ionicons name="calendar" size={12} color="#95a5a6" />
                  <Text style={styles.metaText}>
                    Expires: {item.expiryDate.toLocaleDateString()}
                  </Text>
                </View>
              )}

              {item.category && (
                <View style={styles.metaItem}>
                  <Ionicons name="pricetag" size={12} color={categoryColor} />
                  <Text style={[styles.metaText, { color: categoryColor }]}>
                    {item.category}
                  </Text>
                </View>
              )}
            </View>

            {item.completed && item.completionDate && (
              <View style={styles.completionBadge}>
                <Ionicons name="trophy" size={12} color="#27ae60" />
                <Text style={styles.completionDate}>
                  Completed {item.completionDate.toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            (status.text === "Expired" || item.completed) &&
              styles.actionButtonDisabled,
          ]}
          onPress={() => {
            animateButton();
            setTimeout(
              () => navigation.navigate("SurveyDetails", { survey: item }),
              100
            );
          }}
          disabled={status.text === "Expired" || item.completed}
        >
          <Ionicons
            name={item.completed ? "checkmark-done" : "arrow-forward"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
        }}
        style={styles.loadingContainer}
        blurRadius={2}
      >
        <View style={styles.overlay} />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading Surveys...</Text>
      </ImageBackground>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
        }}
        style={styles.headerBackground}
        blurRadius={5}
      >
        <View style={styles.headerOverlay} />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>⬅ Go Back</Text>
              </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Available Surveys</Text>
          <Text style={styles.headerSubtitle}>
            Share your feedback and earn rewards
          </Text>

          {userRole === "admin" && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate("CreateSurvey")}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Create Survey</Text>
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>

      <View style={styles.content}>
        {permissionError && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning" size={20} color="#fff" />
            <Text style={styles.errorText}>
              Permission Error: Check your Firestore rules
            </Text>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#7f8c8d"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search surveys..."
            placeholderTextColor="#95a5a6"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={20} color="#7f8c8d" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Buttons (Toolbar style) */}
        <View style={styles.filterToolbar}>
          {[
            { key: "all", label: "All Surveys" },
            { key: "active", label: "Active" },
            { key: "completed", label: "Completed" },
            { key: "expired", label: "Expired" },
          ].map((filterType) => (
            <TouchableOpacity
              key={filterType.key}
              style={[
                styles.filterButton,
                filter === filterType.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(filterType.key)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === filterType.key && styles.filterButtonTextActive,
                ]}
              >
                {filterType.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.resultsText}>
          {filteredSurveys.length} survey
          {filteredSurveys.length !== 1 ? "s" : ""} found
        </Text>

        <FlatList
          data={filteredSurveys}
          renderItem={renderSurveyItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text" size={64} color="#bdc3c7" />
              <Text style={styles.emptyText}>No surveys found</Text>
              <Text style={styles.emptySubtext}>
                {surveys.length === 0
                  ? "No surveys available at the moment"
                  : "Try changing your filters or search"}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3498db"]}
              tintColor="#3498db"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  headerBackground: { height: 200, width: "100%" },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  backButton: { position: "absolute", top: 40, left: 20, zIndex: 10 },
  header: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 5 },
  headerSubtitle: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 15 },
  createButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#27ae60", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  createButtonText: { color: "#fff", fontWeight: "600", marginLeft: 5 },
  content: { flex: 1, padding: 15 },
  errorBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#e74c3c", padding: 15, borderRadius: 8, marginBottom: 15 },
  errorText: { color: "#fff", marginLeft: 10, fontWeight: "500" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#2c3e50" },

  // Toolbar style filters
  filterToolbar: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  filterButton: { flex: 1, alignItems: "center", paddingVertical: 10, marginHorizontal: 3, borderRadius: 8, borderWidth: 1, borderColor: "#3498db", backgroundColor: "#fff" },
  filterButtonActive: { backgroundColor: "#3498db" },
  filterButtonText: { color: "#3498db", fontWeight: "500" },
  filterButtonTextActive: { color: "#fff" },

  resultsText: { fontSize: 14, color: "#7f8c8d", marginBottom: 10, marginLeft: 5 },
  listContainer: { paddingBottom: 20 },
  surveyCard: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, marginBottom: 15, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  categoryIndicator: { width: 8, height: "100%" },
  surveyContent: { flex: 1, padding: 15 },
  surveyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  titleContainer: { flex: 1, flexDirection: "row", alignItems: "center" },
  surveyTitle: { fontSize: 18, fontWeight: "bold", color: "#2c3e50", marginRight: 10 },
  priorityBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#e74c3c", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  priorityText: { color: "#fff", fontSize: 10, fontWeight: "bold", marginLeft: 3 },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600", marginLeft: 4 },
  surveyDescription: { fontSize: 14, color: "#7f8c8d", marginBottom: 12, lineHeight: 20 },
  surveyFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metaInfo: { flex: 1 },
  metaItem: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  metaText: { fontSize: 12, color: "#95a5a6", marginLeft: 5 },
  completionBadge: { flexDirection: "row", alignItems: "center" },
  completionDate: { fontSize: 12, color: "#27ae60", marginLeft: 5, fontWeight: "500" },
  actionButton: { justifyContent: "center", alignItems: "center", backgroundColor: "#3498db", width: 60, borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  actionButtonDisabled: { backgroundColor: "#bdc3c7" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  loadingText: { color: "#fff", marginTop: 15, fontSize: 16 },
  emptyContainer: { alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: { fontSize: 18, color: "#7f8c8d", marginTop: 15, marginBottom: 5 },
  emptySubtext: { fontSize: 14, color: "#bdc3c7", textAlign: "center" },
});

export default SurveyListScreen;