// app/HelpScreen.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function HelpScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>❓ Help & Support</Text>
      <Text style={styles.text}>Need assistance? Find help here.</Text>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>⬅ Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  text: { fontSize: 16, color: "#555" },
  backButton: { marginTop: 20, padding: 10, backgroundColor: "#9b59b6", borderRadius: 8 },
  backText: { color: "white", fontWeight: "bold" }
});
