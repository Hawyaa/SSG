import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Register from './app/Register';
import Login from './app/Login';
import ProfileScreen from './app/ProfileScreen';
import ChangePasswordScreen from './app/ChangePasswordScreen';
import SurveyList from './app/SurveyList';
import FeedbackForm from './app/FeedbackForm';
import ViewFeedback from './app/ViewFeedback';
import EditFeedback from './app/EditFeedback';
import HelpScreen from './app/HelpScreen';
import NotificationsScreen from './app/NotificationsScreen'; // Add this import
import { ThemeContext } from './app/ThemeContext';
import { auth } from './app/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const defaultTheme = {
  colors: {
    background: '#ffffff',
    text: '#2c3e50',
    border: '#e0e0e0',
    primary: '#3498db',
    card: '#f8f9fa',
    secondary: '#2ecc71'
  }
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Loading');
  const [user, setUser] = useState(null);

  const forceLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUserProfile = (updatedUserData) => {
    setUser(prev => ({ ...prev, ...updatedUserData }));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL || null
        });
        setCurrentScreen('Home');
      } else {
        setUser(null);
        setCurrentScreen('Login');
      }
    });

    return () => unsubscribe();
  }, []);

  const navigate = (screen) => setCurrentScreen(screen);

  const goBack = () => {
    if (currentScreen === 'Profile') navigate('Home');
    else if (currentScreen === 'ChangePassword') navigate('Profile');
    else if (currentScreen === 'SurveyDetails') navigate('Surveys');
    else if (currentScreen === 'Feedback') navigate('Home');
    else if (currentScreen === 'ViewFeedback') navigate('Home');
    else if (currentScreen === 'EditFeedback') navigate('ViewFeedback');
    else if (currentScreen === 'Notifications') navigate('Home'); // Add this case
    else if (currentScreen === 'Help') navigate('Home');
    else navigate('Home');
  };

  return (
    <ThemeContext.Provider value={defaultTheme}>
      <View style={styles.container}>
        {currentScreen === 'Loading' ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={defaultTheme.colors.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : currentScreen === 'Register' ? (
          <Register 
            onRegisterSuccess={() => navigate('Login')}
            onNavigate={navigate}
          />
        ) : currentScreen === 'Login' ? (
          <Login 
            onLoginSuccess={() => navigate('Home')}
            onNavigate={navigate}
          />
        ) : currentScreen === 'Profile' ? (
          <ProfileScreen 
            navigation={{ goBack, navigate }}
            route={{ params: { user, updateUserProfile } }}
          />
        ) : currentScreen === 'ChangePassword' ? (
          <ChangePasswordScreen 
            navigation={{ goBack, navigate }}
          />
        ) : currentScreen === 'Surveys' ? (
          <SurveyList 
            navigation={{ goBack, navigate }}
          />
        ) : currentScreen === 'Feedback' ? (
          <FeedbackForm 
            navigation={{ goBack, navigate }}
          />
        ) : currentScreen === 'ViewFeedback' ? (
          <ViewFeedback
            navigation={{ goBack, navigate }}
            route={{ params: { user } }}
          />
        ) : currentScreen === 'EditFeedback' ? (
          <EditFeedback
            navigation={{ goBack, navigate }}
            route={{ params: { user } }}
          />
        ) : currentScreen === 'Notifications' ? ( // Add this case
          <NotificationsScreen
            navigation={{ goBack, navigate }}
          />
        ) : currentScreen === 'Help' ? (
          <HelpScreen 
            navigation={{ goBack, navigate }}
          />
        ) : (
          <ScrollView style={styles.homeContainer}>
            <View style={styles.header}>
              <Text style={styles.welcomeText}>
                Welcome, {user?.displayName || user?.email.split('@')[0]}
              </Text>
            </View>

            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={[styles.actionButton, {backgroundColor: '#3498db'}]}
                onPress={() => navigate('Surveys')}
              >
                <Text style={styles.actionButtonText}>Take Survey</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, {backgroundColor: '#2ecc71'}]}
                onPress={() => navigate('Feedback')}
              >
                <Text style={styles.actionButtonText}>Submit Feedback</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, {backgroundColor: '#FFA500'}]}
                onPress={() => navigate('ViewFeedback')}
              >
                <Text style={styles.actionButtonText}>View Feedback</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, {backgroundColor: '#9b59b6'}]}
                onPress={() => navigate('Notifications')}
              >
                <Text style={styles.actionButtonText}>Notifications</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.menuContainer}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigate('Surveys')}
              >
                <Text style={styles.menuItemText}>📋 Surveys</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigate('Feedback')}
              >
                <Text style={styles.menuItemText}>💬 Submit Feedback</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigate('ViewFeedback')}
              >
                <Text style={styles.menuItemText}>👁️ View Feedback</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigate('Notifications')}
              >
                <Text style={styles.menuItemText}>🔔 Notifications</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigate('Profile')}
              >
                <Text style={styles.menuItemText}>👤 Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigate('Help')}
              >
                <Text style={styles.menuItemText}>❓ Help</Text>
              </TouchableOpacity>
            </View>

            

            <TouchableOpacity onPress={forceLogout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f5f7fa'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#7f8c8d'
  },
  homeContainer: {
    flex: 1,
    padding: 20
  },
  header: {
    alignItems: 'center',
    marginBottom: 30
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 30,
    gap: 10
  },
  actionButton: {
    width: '48%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    minWidth: 150
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center'
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
    elevation: 2
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50'
  },
  menuItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1'
  },
  menuItemText: {
    fontSize: 16,
    color: '#34495e'
  },
  notificationsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50'
  },
  notificationItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1'
  },
  notificationText: {
    fontSize: 14,
    color: '#7f8c8d'
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});