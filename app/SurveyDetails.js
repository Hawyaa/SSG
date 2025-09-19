import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SurveyDetails = ({ navigation, route }) => {
  const { survey } = route.params;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < survey.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      submitSurvey();
    }
  };

  const submitSurvey = async () => {
    try {
      await addDoc(collection(db, 'surveyResponses'), {
        surveyId: survey.id,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        answers,
        timestamp: serverTimestamp()
      });
      
      Alert.alert('Success', 'Thank you for completing the survey!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error submitting survey:', error);
      Alert.alert('Error', 'Failed to submit survey. Please try again.');
    }
  };

  if (!survey) {
    return (
      <View style={styles.container}>
        <Text>Survey not found</Text>
      </View>
    );
  }

  const question = survey.questions[currentQuestion];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{survey.title}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.progress}>
          Question {currentQuestion + 1} of {survey.questions.length}
        </Text>
        
        <Text style={styles.question}>{question.text}</Text>
        
        {question.type === 'multiple-choice' && question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              answers[question.id] === option && styles.selectedOption
            ]}
            onPress={() => handleAnswer(question.id, option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
        
        {question.type === 'text' && (
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            placeholder="Type your answer here"
            value={answers[question.id] || ''}
            onChangeText={(text) => handleAnswer(question.id, text)}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentQuestion < survey.questions.length - 1 ? 'Next' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  backButton: {
    fontSize: 24,
    color: '#3498db',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  progress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  option: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#3498db',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    backgroundColor: '#fff',
  },
  nextButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SurveyDetails;