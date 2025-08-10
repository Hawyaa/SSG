import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
// In App.js - Update all imports to include the 'app/' directory
import Register from './app/Register';
import RegisterWithSocial from './app/RegisterWithSocial';
import Login from './app/Login';
import ProfileScreen from './app/ProfileScreen';
import ScheduleScreen from './app/ScheduleScreen';
import HomeScreen from './app/Homescreen';
import SurveyList from './app/SurveyList';
import FeedbackForm from './app/FeedbackForm';
import SettingsScreen from './app/SettingsScreen';
import { ThemeContext } from './app/ThemeContext';

const defaultTheme = {
  colors: {
    background: '#ffffff',
    text: '#000000',
    border: '#cccccc',
    primary: '#007bff',
    card: '#f8f9fa'
  }
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [user, setUser] = useState(null);
  const [surveys, setSurveys] = useState([
    { id: 1, title: 'Service Quality', completed: false },
    { id: 2, title: 'Product Feedback', completed: true }
  ]);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentScreen('Home');
  };

  const handleRegister = (userData) => {
    handleLogin(userData); // Automatically log in after registration
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('Login');
  };

  const completeSurvey = (id) => {
    setSurveys(surveys.map(s => 
      s.id === id ? {...s, completed: true} : s
    ));
  };

  const renderScreen = () => {
    switch(currentScreen) {
      case 'Register':
        return <Register onRegister={handleRegister} />;
      case 'RegisterWithSocial':
        return <RegisterWithSocial onRegister={handleLogin} />;
      case 'Login':
        return <Login 
          onLogin={handleLogin} 
          onRegister={() => setCurrentScreen('Register')} 
        />;
      case 'Profile':
        return <ProfileScreen 
          user={user} 
          onBack={() => setCurrentScreen('Home')}
          onSave={(updatedUser) => setUser(updatedUser)}
        />;
      case 'Schedule':
        return <ScheduleScreen onBack={() => setCurrentScreen('Home')} />;
      case 'Home':
        return <HomeScreen 
          user={user} 
          onNavigate={setCurrentScreen} 
        />;
      case 'Surveys':
        return <SurveyList 
          surveys={surveys}
          onBack={() => setCurrentScreen('Home')}
          onSelectSurvey={(id) => {
            completeSurvey(id);
            setCurrentScreen('Feedback');
          }}
        />;
      case 'Feedback':
        return <FeedbackForm 
          onBack={() => setCurrentScreen('Surveys')}
          onSubmit={() => setCurrentScreen('Home')}
        />;
      case 'Settings':
        return <SettingsScreen 
          user={user}
          onBack={() => setCurrentScreen('Home')}
          onLogout={handleLogout}
        />;
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <ThemeContext.Provider value={defaultTheme}>
      <View style={styles.container}>{renderScreen()}</View>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  }
});