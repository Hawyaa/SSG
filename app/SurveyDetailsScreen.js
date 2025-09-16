import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { auth } from './firebase';

const SurveyDetailsScreen = ({ navigation, route }) => {
  const { survey } = route.params || {};
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Safe access to questions with fallback
  const questions = survey?.questions || [];
  
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const validateSurvey = async () => {
    try {
      // Check if survey still exists in Firestore
      if (!survey?.id) return false;
      
      const surveyRef = doc(db, 'surveys', survey.id);
      const surveyDoc = await getDoc(surveyRef);
      
      if (!surveyDoc.exists()) {
        Alert.alert('Error', 'This survey no longer exists');
        return false;
      }
      
      // Check if survey is expired
      const surveyData = surveyDoc.data();
      if (surveyData.expiryDate && surveyData.expiryDate.toDate() < new Date()) {
        Alert.alert('Error', 'This survey has expired');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating survey:', error);
      return true; // Continue submission if validation fails
    }
  };

  const handleSubmit = async () => {
    if (!survey || !survey.id) {
      Alert.alert('Error', 'Survey data is missing');
      return;
    }

    // Validate required questions
    const requiredQuestions = questions.filter(q => q.required);
    const missingAnswers = requiredQuestions.filter(q => !answers[q.id] || answers[q.id].toString().trim() === '');
    
    if (missingAnswers.length > 0) {
      Alert.alert(
        'Validation Error', 
        `Please answer all required questions:\n${missingAnswers.map(q => `• ${q.text}`).join('\n')}`
      );
      return;
    }

    // Validate survey before submission
    setLoading(true);
    const isValid = await validateSurvey();
    setLoading(false);
    
    if (!isValid) return;

    setSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated. Please log in again.');
        setSubmitting(false);
        return;
      }
      
      // Prepare response data
      const responseData = {
        surveyId: survey.id,
        surveyTitle: survey.title || 'Untitled Survey',
        answers: answers,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Anonymous',
        submittedAt: serverTimestamp(),
        status: 'completed',
        // Add question metadata for easier analysis
        questions: questions.map(q => ({
          id: q.id,
          text: q.text,
          type: q.type,
          required: q.required
        }))
      };

      // Save survey response
      const responseRef = collection(db, 'surveyResponses');
      await addDoc(responseRef, responseData);

      Alert.alert(
        'Success', 
        'Thank you for completing the survey!',
        [{ 
          text: 'OK', 
          onPress: () => navigation.navigate('SurveyList') 
        }]
      );
    } catch (error) {
      console.error('Error submitting survey:', error);
      
      let errorMessage = 'Failed to submit survey. Please try again.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'You do not have permission to submit this survey. Please contact support.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      Alert.alert('Submission Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateProgress = () => {
    const answeredQuestions = Object.keys(answers).length;
    return questions.length > 0 ? answeredQuestions / questions.length : 0;
  };

  const renderQuestion = (question, index) => {
    if (!question || !question.id) return null;

    switch (question.type) {
      case 'multiple-choice':
        return (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {index + 1}. {question.text || 'Untitled question'} {question.required && '*'}
            </Text>
            {(question.options || []).map((option, optionIndex) => (
              <TouchableOpacity
                key={optionIndex}
                style={styles.optionButton}
                onPress={() => handleAnswerChange(question.id, option)}
              >
                <View style={styles.radioCircle}>
                  {answers[question.id] === option && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'rating':
        return (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {index + 1}. {question.text || 'Untitled question'} {question.required && '*'}
            </Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleAnswerChange(question.id, star)}
                  style={styles.ratingButton}
                >
                  <Text style={[
                    styles.ratingText,
                    answers[question.id] === star && styles.ratingTextSelected
                  ]}>
                    {star}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.ratingLabels}>
              <Text style={styles.ratingLabel}>Poor</Text>
              <Text style={styles.ratingLabel}>Excellent</Text>
            </View>
          </View>
        );

      case 'text':
      default:
        return (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {index + 1}. {question.text || 'Untitled question'} {question.required && '*'}
            </Text>
            <TextInput
              style={styles.textInput}
              value={answers[question.id] || ''}
              onChangeText={(text) => handleAnswerChange(question.id, text)}
              placeholder="Type your answer here..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        );
    }
  };

  if (!survey) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Survey</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Survey data is missing</Text>
          <TouchableOpacity 
            style={styles.backButtonContainer}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Survey</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.surveyHeader}>
          <Text style={styles.surveyTitle}>{survey.title || 'Untitled Survey'}</Text>
          <Text style={styles.surveyDescription}>{survey.description || 'No description'}</Text>
          
          {survey.expiryDate && (
            <Text style={styles.expiryText}>
              Expires: {survey.expiryDate.toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Progress: {Object.keys(answers).length} of {questions.length} questions answered
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${calculateProgress() * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Questions */}
        {questions.length > 0 ? (
          questions.map((question, index) => renderQuestion(question, index))
        ) : (
          <View style={styles.noQuestionsContainer}>
            <Text style={styles.noQuestionsText}>No questions available for this survey</Text>
          </View>
        )}

        {/* Submit Button */}
        {questions.length > 0 && (
          <TouchableOpacity 
            style={[styles.submitButton, (submitting || loading) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting || loading}
          >
            {submitting || loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                Submit Survey
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
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
    fontSize: 16,
    color: '#3498db',
    fontWeight: 'bold'
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButtonContainer: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  surveyHeader: {
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  surveyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  surveyDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 22,
    marginBottom: 8,
  },
  expiryText: {
    fontSize: 14,
    color: '#e67e22',
    fontStyle: 'italic',
  },
  progressContainer: {
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  questionContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#3498db',
  },
  optionText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  ratingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingButton: {
    width: '18%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  ratingTextSelected: {
    color: '#3498db',
    fontSize: 18,
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  noQuestionsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  noQuestionsText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SurveyDetailsScreen;