// app/SurveyForm.js
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { collection, getDocs, getDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

export default function SurveyForm({ navigation, route }) {
  const { surveyId, surveyTitle } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]); // [{id, text, type, required, options, order}]
  const [answers, setAnswers] = useState({});     // { [qid]: value }
  const user = auth.currentUser;

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        // 1) Try subcollection
        const qCol = collection(db, 'surveys', surveyId, 'questions');
        const qSnap = await getDocs(qCol);
        let qs = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // 2) If no subcollection questions exist, fallback to embedded array
        if (qs.length === 0) {
          const sDoc = await getDoc(doc(db, 'surveys', surveyId));
          const sData = sDoc.exists() ? sDoc.data() : {};
          const embedded = Array.isArray(sData?.questions) ? sData.questions : [];
          qs = embedded.map((q, idx) => ({
            id: q.id || `q_${idx + 1}`,
            text: q.text || '',
            type: q.type || 'text',
            required: !!q.required,
            options: q.options || [],
            order: q.order ?? idx + 1
          }));
        }

        // sort by order if provided
        qs.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
        setQuestions(qs);
      } catch (err) {
        console.error('Error loading questions:', err);
        Alert.alert('Error', 'Missing or insufficient permissions, or data not found.');
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [surveyId]);

  const setAnswer = (qid, value) => setAnswers(prev => ({ ...prev, [qid]: value }));

  const validate = useMemo(() => {
    return () => questions.every(q => {
      if (!q.required) return true;
      const v = answers[q.id];
      if (q.type === 'rating') return typeof v === 'number' && v > 0;
      return v !== undefined && v !== null && String(v).trim().length > 0;
    });
  }, [questions, answers]);

  const submit = async () => {
    if (!user) {
      Alert.alert('Login required', 'Please log in to submit.');
      return;
    }
    if (!validate()) {
      Alert.alert('Incomplete', 'Please answer all required questions.');
      return;
    }
    try {
      await addDoc(collection(db, 'surveyResponses'), {
        surveyId,
        userId: user.uid,
        userEmail: user.email,
        answers,
        createdAt: serverTimestamp(),
      });
      Alert.alert('Submitted', 'Thanks for completing the survey!', [
        { text: 'Give Feedback', onPress: () => navigation.navigate('FeedbackForm', { surveyId, surveyTitle }) },
        { text: 'Close', style: 'cancel', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error('Error submitting response:', err);
      Alert.alert('Error', 'Could not save your responses.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading questions…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{surveyTitle || 'Survey'}</Text>

      {questions.map(q => (
        <View key={q.id} style={styles.qBlock}>
          <Text style={styles.qText}>
            {q.text} {q.required ? <Text style={{ color: '#e74c3c' }}>*</Text> : null}
          </Text>

          {/* TEXT */}
          {(q.type === 'text' || !q.type) && (
            <TextInput
              style={styles.input}
              placeholder="Type your answer"
              value={answers[q.id] || ''}
              onChangeText={(t) => setAnswer(q.id, t)}
              multiline
            />
          )}

          {/* MCQ */}
          {q.type === 'mcq' && Array.isArray(q.options) && q.options.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {q.options.map(opt => {
                const selected = answers[q.id] === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setAnswer(q.id, opt)}
                    style={[styles.option, selected && styles.optionSelected]}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* RATING (1..5) */}
          {q.type === 'rating' && (
            <View style={styles.ratingRow}>
              {[1,2,3,4,5].map(n => {
                const on = (answers[q.id] || 0) >= n;
                return (
                  <TouchableOpacity key={n} onPress={() => setAnswer(q.id, n)} style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
                    <Text style={[styles.star, on && styles.starOn]}>{on ? '★' : '☆'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.submitBtn} onPress={submit}>
        <Text style={styles.submitText}>Submit Survey</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16, paddingBottom: 40 },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  qBlock: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, elevation: 1 },
  qText: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 10, minHeight: 80, textAlignVertical: 'top' },
  option: { borderWidth: 1, borderColor: '#d0d0d0', borderRadius: 8, padding: 10, marginBottom: 8 },
  optionSelected: { borderColor: '#3498db', backgroundColor: '#eef6ff' },
  optionText: { color: '#333' },
  optionTextSelected: { color: '#1d6fdc', fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  star: { fontSize: 28, color: '#999' },
  starOn: { color: '#FFD700' },
  submitBtn: { backgroundColor: '#4caf50', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});
