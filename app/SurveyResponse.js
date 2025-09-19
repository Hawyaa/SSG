import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase';

export default function SurveyResponse() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResponses = async () => {
      try {
        const q = query(
          collection(db, "surveyResponses"),
          where("userId", "==", auth.currentUser?.uid)
        );
        const snapshot = await getDocs(q);
        setResponses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error loading responses:", error);
      } finally {
        setLoading(false);
      }
    };
    loadResponses();
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <FlatList
      data={responses}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 15, borderBottomWidth: 1 }}>
          <Text>Survey ID: {item.surveyId}</Text>
          <Text>Answers: {JSON.stringify(item.answers)}</Text>
        </View>
      )}
    />
  );
}
