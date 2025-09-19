// SurveyDetail.js
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "./firebase";

const SurveyDetail = ({ route, navigation }) => {
  const { surveyId } = route.params;
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const snapshot = await getDocs(collection(db, "surveys", surveyId, "questions"));
        const questionData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setQuestions(questionData);
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [surveyId]);

  const handleAnswer = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "surveyResponses"), {
        surveyId,
        userId: auth.currentUser ? auth.currentUser.uid : "guest",
        answers,
        createdAt: serverTimestamp(),
      });
      Alert.alert("Success", "Your responses have been submitted!");
      navigation.goBack();
    } catch (err) {
      console.error("Error submitting response:", err);
      Alert.alert("Error", "Failed to submit survey.");
    }
  };

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={styles.container}>
      {questions.map((q) => (
        <View key={q.id} style={styles.question}>
          <Text style={styles.qText}>{q.text}</Text>
          {q.type === "text" && (
            <TextInput
              style={styles.input}
              placeholder="Type your answer..."
              onChangeText={(text) => handleAnswer(q.id, text)}
            />
          )}
          {q.type === "rating" && (
            <TextInput
              style={styles.input}
              placeholder="Rate 1–5"
              keyboardType="numeric"
              onChangeText={(text) => handleAnswer(q.id, Number(text))}
            />
          )}
        </View>
      ))}
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  question: { marginBottom: 15 },
  qText: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 5 }
});

export default SurveyDetail;
