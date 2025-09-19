import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  LogBox,
} from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import Register from "./app/Register";
import Login from "./app/Login";
import ProfileScreen from "./app/ProfileScreen";
import ChangePasswordScreen from "./app/ChangePasswordScreen";
import FeedbackForm from "./app/FeedbackForm";
import ViewFeedback from "./app/ViewFeedback";
import EditFeedback from "./app/EditFeedback";
import HelpScreen from "./app/HelpScreen";
import NotificationsScreen from "./app/NotificationsScreen";
import AdminDashboardScreen from "./app/AdminDashboardScreen";
import SurveyListScreen from "./app/SurveyListScreen";
import SurveyDetailsScreen from "./app/SurveyDetailsScreen";
import SurveyCreationScreen from "./app/SurveyCreationScreen";
import SettingsScreen from "./app/SettingsScreen"; // ✅ Settings import

import { ThemeContext } from "./app/ThemeContext";
import { auth, db } from "./app/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// 🔹 Ignore physical device warning for Expo notifications
LogBox.ignoreLogs([
  "Must use physical device for Push Notifications"
]);

const defaultTheme = {
  colors: {
    background: "#ffffff",
    text: "#2c3e50",
    border: "#e0e0e0",
    primary: "#3498db",
    card: "#f8f9fa",
    secondary: "#2ecc71",
  },
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("Loading");
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("user");
  const [routeParams, setRouteParams] = useState({});
  const [history, setHistory] = useState([]);
  const [expoPushToken, setExpoPushToken] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      console.log("Push Token:", token);
    });

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      Alert.alert(
        notification.request.content.title,
        notification.request.content.body
      );
      console.log("Notification received:", notification);
    });

    return () => subscription.remove();
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert("Failed to get push token for notifications!");
        return;
      }
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }

  const forceLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const updateUserProfile = (updatedUserData) => {
    setUser((prev) => ({ ...prev, ...updatedUserData }));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const isAdminEmail = firebaseUser.email === "admins@gmail.com";
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (isAdminEmail && userData.role !== "admin") {
              await updateDoc(userDocRef, { role: "admin" });
              setUserRole("admin");
            } else {
              setUserRole(userData.role || "user");
            }

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || userData.displayName,
              photoURL: firebaseUser.photoURL || userData.photoURL,
              role: isAdminEmail ? "admin" : userData.role || "user",
            });
          } else {
            const userRole = isAdminEmail ? "admin" : "user";
            await setDoc(userDocRef, {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: userRole,
              createdAt: serverTimestamp(),
            });

            setUserRole(userRole);
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: userRole,
            });
          }

          setCurrentScreen("Home");
        } catch (error) {
          console.error("Error fetching user data:", error);
          const isAdminEmail = firebaseUser.email === "admins@gmail.com";
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: isAdminEmail ? "admin" : "user",
          });
          setUserRole(isAdminEmail ? "admin" : "user");
          setCurrentScreen("Home");
        }
      } else {
        setUser(null);
        setUserRole("user");
        setCurrentScreen("Login");
      }
    });

    return () => unsubscribe();
  }, []);

  const navigate = (screen, params = {}) => {
    setHistory((prev) => [
      ...prev,
      { screen: currentScreen, params: routeParams },
    ]);
    setCurrentScreen(screen);
    setRouteParams(params);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prevScreen = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setCurrentScreen(prevScreen.screen);
      setRouteParams(prevScreen.params);
    } else {
      setCurrentScreen("Home");
    }
  };

  const renderScreen = () => {
    const navigation = { navigate, goBack };
    const route = { params: routeParams };

    switch (currentScreen) {
      case "Loading":
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={defaultTheme.colors.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        );
      case "Register":
        return <Register onRegisterSuccess={() => navigate("Login")} onNavigate={navigate} />;
      case "Login":
        return <Login onLoginSuccess={() => navigate("Home")} onNavigate={navigate} />;
      case "AdminDashboard":
        return <AdminDashboardScreen navigation={navigation} />;
      case "Profile":
        return <ProfileScreen navigation={navigation} route={{ params: { user: routeParams.user || user, updateUserProfile } }} />;
      case "ChangePassword":
        return <ChangePasswordScreen navigation={navigation} />;
      case "Surveys":
        return <SurveyListScreen navigation={navigation} userRole={userRole} />;
      case "SurveyDetails":
        return <SurveyDetailsScreen navigation={navigation} route={route} />;
      case "CreateSurvey":
        return <SurveyCreationScreen navigation={navigation} />;
      case "Feedback":
      case "FeedbackForm":
        return <FeedbackForm navigation={navigation} route={route} />;
      case "ViewFeedback":
        return <ViewFeedback navigation={navigation} route={{ params: { user, userRole } }} />;
      case "EditFeedback":
        return <EditFeedback navigation={navigation} route={route} />;
      case "Notifications":
        return <NotificationsScreen navigation={navigation} userRole={userRole} />;
      case "Help":
        return <HelpScreen navigation={navigation} />;
      case "Settings": // ✅ New Settings screen
        return <SettingsScreen navigation={navigation} />;
      default:
        return (
          <ScrollView style={styles.homeContainer}>
            <View style={styles.header}>
              <Text style={styles.welcomeText}>
                Welcome, {user?.displayName || user?.email?.split("@")[0] || "User"}
              </Text>
              {userRole === "admin" && <Text style={styles.adminBadge}>Administrator</Text>}
            </View>

            {/* Quick actions */}
            {/* <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#3498db" }]} onPress={() => navigate("Surveys")}>
                <Text style={styles.actionButtonText}>Take Survey</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#2ecc71" }]} onPress={() => navigate("FeedbackForm")}>
                <Text style={styles.actionButtonText}>Submit Feedback</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#FFA500" }]} onPress={() => navigate("ViewFeedback")}>
                <Text style={styles.actionButtonText}>View Feedback</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#9b59b6" }]} onPress={() => navigate("Notifications")}>
                <Text style={styles.actionButtonText}>Notifications</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#8e44ad" }]} onPress={() => navigate("Settings")}>
                <Text style={styles.actionButtonText}>Settings</Text>
              </TouchableOpacity>
            </View> */}

            {/* Menu */}
            <View style={styles.menuContainer}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigate("Surveys")}>
                <Text style={styles.menuItemText}>📋 Surveys</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigate("FeedbackForm")}>
                <Text style={styles.menuItemText}>💬 Submit Feedback</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigate("ViewFeedback")}>
                <Text style={styles.menuItemText}>👁 View Feedback</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigate("Notifications")}>
                <Text style={styles.menuItemText}>🔔 Notifications</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigate("Settings")}>
                <Text style={styles.menuItemText}>⚙️ Settings</Text>
              </TouchableOpacity>
              {userRole === "admin" && (
                <>
                  <TouchableOpacity style={styles.menuItem} onPress={() => navigate("CreateSurvey")}>
                    <Text style={styles.menuItemText}>➕ Create Survey</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem} onPress={() => navigate("AdminDashboard")}>
                    <Text style={styles.menuItemText}>👑 Admin Dashboard</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity style={styles.menuItem} onPress={() => navigate("Profile")}>
                <Text style={styles.menuItemText}>👤 Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigate("Help")}>
                <Text style={styles.menuItemText}>❓ Help</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={forceLogout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        );
    }
  };

  return (
    <ThemeContext.Provider value={defaultTheme}>
      <View style={styles.container}>{renderScreen()}</View>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 20, fontSize: 18, color: "#7f8c8d" },
  homeContainer: { flex: 1, padding: 20 },
  header: { alignItems: "center", marginBottom: 30 },
  welcomeText: { fontSize: 22, fontWeight: "bold", color: "#2c3e50", marginBottom: 5 },
  adminBadge: { backgroundColor: "#e74c3c", color: "white", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: "bold" },
  quickActions: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", marginBottom: 30, gap: 10 },
  actionButton: { width: "48%", padding: 15, borderRadius: 8, alignItems: "center", elevation: 2, minWidth: 150 },
  actionButtonText: { color: "white", fontWeight: "bold", fontSize: 16, textAlign: "center" },
  menuContainer: { backgroundColor: "white", borderRadius: 10, padding: 15, marginBottom: 25, elevation: 2 },
  menuTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, color: "#2c3e50" },
  menuItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#ecf0f1" },
  menuItemText: { fontSize: 16, color: "#34495e" },
  logoutButton: { backgroundColor: "#e74c3c", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20 },
  logoutButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
