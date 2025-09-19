import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { getDoc, doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase'; // Note: no auth required if used for anonymous surveys
import { RadioButton, Checkbox, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const SurveyTaker = ({ navigation, route }) => {
  const { surveyId, surveyTitle } = route.params;
  const [surveyData, setSurveyData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        console.log('Fetching survey with ID:', surveyId);
        const docRef = doc(db, 'surveys', surveyId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSurveyData(data);
          
          const initialAnswers = {};
          if (data.questions) {
            data.questions.forEach(q => {
              if (q.type === 'checkbox') {
                initialAnswers[q.id] = [];
              } else {
                initialAnswers[q.id] = '';
              }
            });
          }
          setAnswers(initialAnswers);
        } else {
          // Changed navigation from goBack() to navigate('Surveys') for consistency
          Alert.alert('Error', 'Survey not found.');
          navigation.navigate('Surveys');
        }
      } catch (error) {
        console.error('Error fetching survey:', error);
        // Changed navigation from goBack() to navigate('Surveys') for consistency
        Alert.alert('Error', 'Failed to load survey. Please try again.');
        navigation.navigate('Surveys');
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId, navigation]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId, option) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      const newAnswers = currentAnswers.includes(option)
        ? currentAnswers.filter(item => item !== option)
        : [...currentAnswers, option];
      return { ...prev, [questionId]: newAnswers };
    });
  };

  const validateAnswers = () => {
    if (!surveyData || !surveyData.questions) return false;
    for (const question of surveyData.questions) {
      if (question.required) {
        const answer = answers[question.id];
        if (question.type === 'checkbox') {
          if (!answer || answer.length === 0) return false;
        } else {
          if (!answer || answer.trim() === '') return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) {
      Alert.alert('Validation Error', 'Please answer all required questions.');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'surveyResponses'), {
        surveyId: surveyId,
        answers: answers,
        timestamp: serverTimestamp(),
        // Note: No userId or userEmail for an anonymous taker
      });
      
      Alert.alert('Success', 'Survey submitted successfully!');
      navigation.navigate('Surveys');
    } catch (error) {
      console.error('Error submitting survey:', error);
      Alert.alert('Error', 'Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading survey...</Text>
      </View>
    );
  }

  if (!surveyData || !surveyData.questions) {
    return (
      <View style={styles.noQuestionsContainer}>
        <Text style={styles.noQuestionsText}>No questions found for this survey.</Text>
        <TouchableOpacity style={styles.backButtonLarge} onPress={() => navigation.navigate('Surveys')}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Surveys')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{surveyTitle}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.surveyDescription}>{surveyData.description}</Text>
        {surveyData.questions.map((question, index) => (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {index + 1}. {question.question}
              {question.required && <Text style={styles.requiredMarker}> *</Text>}
            </Text>
            {question.type === 'text' && (
              <TextInput
                style={styles.textInput}
                value={answers[question.id]}
                onChangeText={(text) => handleAnswerChange(question.id, text)}
                placeholder="Type your answer here"
                mode="outlined"
              />
            )}
            {question.type === 'radio' && (
              <RadioButton.Group
                onValueChange={value => handleAnswerChange(question.id, value)}
                value={answers[question.id]}
              >
                {question.options.map(option => (
                  <View key={option.value} style={styles.radioOption}>
                    <RadioButton value={option.value} />
                    <Text style={styles.optionText}>{option.label}</Text>
                  </View>
                ))}
              </RadioButton.Group>
            )}
            {question.type === 'checkbox' && (
              <View>
                {question.options.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.checkboxOption}
                    onPress={() => handleCheckboxChange(question.id, option.value)}
                  >
                    <Checkbox
                      status={
                        answers[question.id] && answers[question.id].includes(option.value)
                          ? 'checked'
                          : 'unchecked'
                      }
                    />
                    <Text style={styles.optionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Survey</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 16,
  },
  noQuestionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  noQuestionsText: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
    marginRight: 10,
  },
  backButtonLarge: {
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    flexShrink: 1,
  },
  scrollViewContent: {
    padding: 20,
  },
  surveyDescription: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 24,
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1E293B',
  },
  requiredMarker: {
    color: '#E74C3C',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#334155',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
});

export default SurveyTaker;
