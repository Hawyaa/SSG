import React, { useState } from "react";
import { View, Text, Switch, TouchableOpacity, StyleSheet } from "react-native";

const SettingsScreen = ({ user, onLogout, onBack }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('#3498db'); // Default blue theme

  const themeColors = ['#3498db', '#e74c3c', '#2ecc71', '#9b59b6']; // Blue, Red, Green, Purple

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#121212' : '#fff' }]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={[styles.backText, { color: selectedTheme }]}>← Back</Text>
      </TouchableOpacity>

      <Text style={[styles.header, { color: darkMode ? '#fff' : '#000' }]}>Settings</Text>

      <View style={styles.settingItem}>
        <Text style={{ color: darkMode ? '#fff' : '#000' }}>Email: {user?.email}</Text>
      </View>

      <View style={styles.settingItem}>
        <Text style={{ color: darkMode ? '#fff' : '#000' }}>Enable Notifications</Text>
        <Switch 
          value={notifications} 
          onValueChange={setNotifications}
          trackColor={{ true: selectedTheme }}
          thumbColor={notifications ? '#fff' : '#f4f3f4'}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={{ color: darkMode ? '#fff' : '#000' }}>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          trackColor={{ true: selectedTheme }}
          thumbColor={darkMode ? '#fff' : '#f4f3f4'}
        />
      </View>

      {/* Theme Selection */}
      <View style={styles.settingItem}>
        <Text style={{ color: darkMode ? '#fff' : '#000' }}>Theme Color</Text>
        <View style={styles.themeOptions}>
          {themeColors.map(color => (
            <TouchableOpacity 
              key={color} 
              style={[
                styles.colorOption, 
                { 
                  backgroundColor: color,
                  borderWidth: selectedTheme === color ? 2 : 0,
                  borderColor: '#fff'
                }
              ]}
              onPress={() => setSelectedTheme(color)}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: selectedTheme }]} 
        onPress={onLogout}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  backButton: { marginBottom: 20 },
  backText: { fontSize: 16 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 30 },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  logoutButton: {
    marginTop: 40,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default SettingsScreen;