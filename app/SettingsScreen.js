import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { auth } from "./firebase";

const SettingsScreen = ({ navigation }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [privacyEnabled, setPrivacyEnabled] = useState(false);
  const [colorScheme, setColorScheme] = useState("blue");
  const [language, setLanguage] = useState("en"); // "en" or "am"

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const togglePrivacy = () => setPrivacyEnabled(!privacyEnabled);
  const selectColorScheme = (scheme) => setColorScheme(scheme);
  const selectLanguage = (lang) => setLanguage(lang);

  const handleLogout = () => {
    Alert.alert(
      language === "en" ? "Logout" : "ውጣ",
      language === "en"
        ? "Are you sure you want to logout?"
        : "እርግጠኛ ነህ መውጣት ይፈልጋሉ?",
      [
        { text: language === "en" ? "Cancel" : "ተሰርዝ", style: "cancel" },
        {
          text: language === "en" ? "Logout" : "ውጣ",
          onPress: () => auth.signOut(),
        },
      ]
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? "#1c1c1c" : "#f5f5f5",
      padding: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    backButton: {
      marginRight: 10,
      padding: 5,
    },
    backText: {
      fontSize: 20,
      fontWeight: "bold",
      color: darkMode ? "#fff" : "#333",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: darkMode ? "#fff" : "#333",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginVertical: 10,
      color: darkMode ? "#fff" : "#333",
    },
    itemContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "#333" : "#ccc",
    },
    itemText: {
      fontSize: 16,
      color: darkMode ? "#fff" : "#333",
    },
    button: {
      padding: 12,
      borderRadius: 8,
      marginVertical: 5,
      alignItems: "center",
    },
    selectedButton: {
      backgroundColor:
        colorScheme === "blue"
          ? "#3498db"
          : colorScheme === "green"
          ? "#2ecc71"
          : colorScheme === "purple"
          ? "#9b59b6"
          : "#3498db",
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
    },
    logoutButton: {
      marginTop: 30,
      backgroundColor: "#e74c3c",
      padding: 15,
      borderRadius: 12,
      alignItems: "center",
    },
    logoutText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  });

  return (
    <ScrollView style={dynamicStyles.container}>
      {/* Header with Back button */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity
          style={dynamicStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={dynamicStyles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>
          {language === "en" ? "Settings" : "ቅንብሮች"}
        </Text>
      </View>

      {/* Dark Mode */}
      <Text style={dynamicStyles.sectionTitle}>
        {language === "en" ? "Appearance" : "የማያይ ሁኔታ"}
      </Text>
      <View style={dynamicStyles.itemContainer}>
        <Text style={dynamicStyles.itemText}>
          {language === "en" ? "Dark Mode" : "ጨለማ ሁኔታ"}
        </Text>
        <Switch value={darkMode} onValueChange={toggleDarkMode} />
      </View>

      {/* Color Scheme */}
      <Text style={dynamicStyles.sectionTitle}>
        {language === "en" ? "Color Scheme" : "የቀለም አቀማመጥ"}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {["blue", "green", "purple"].map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              dynamicStyles.button,
              colorScheme === color && dynamicStyles.selectedButton,
            ]}
            onPress={() => selectColorScheme(color)}
          >
            <Text style={dynamicStyles.buttonText}>
              {color === "blue"
                ? language === "en"
                  ? "Blue"
                  : "ሰማያዊ"
                : color === "green"
                ? language === "en"
                  ? "Green"
                  : "አረንጋዴ"
                : language === "en"
                ? "Purple"
                : "ሐምራዊ"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Privacy */}
      <Text style={dynamicStyles.sectionTitle}>
        {language === "en" ? "Privacy Settings" : "የግል መረጃ ቅንብሮች"}
      </Text>
      <View style={dynamicStyles.itemContainer}>
        <Text style={dynamicStyles.itemText}>
          {language === "en" ? "Enable Privacy Mode" : "የግል ሁኔታ አቀማመጥ"}
        </Text>
        <Switch value={privacyEnabled} onValueChange={togglePrivacy} />
      </View>

      {/* Language */}
      <Text style={dynamicStyles.sectionTitle}>
        {language === "en" ? "Language" : "ቋንቋ"}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableOpacity
          style={[
            dynamicStyles.button,
            language === "en" && dynamicStyles.selectedButton,
          ]}
          onPress={() => selectLanguage("en")}
        >
          <Text style={dynamicStyles.buttonText}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            dynamicStyles.button,
            language === "am" && dynamicStyles.selectedButton,
          ]}
          onPress={() => selectLanguage("am")}
        >
          <Text style={dynamicStyles.buttonText}>አማርኛ</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={dynamicStyles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={dynamicStyles.logoutText}>
          {language === "en" ? "Logout" : "ውጣ"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SettingsScreen;
