import React, { useState } from 'react';
import { 
  View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Switch, Modal, StyleSheet 
} from 'react-native';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

const SurveyCreationScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showQuestionTypeModal, setShowQuestionTypeModal] = useState(false);

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now().toString(),
      type,
      text: '',
      required: false,
      options: type === 'multiple-choice' ? ['Option 1', 'Option 2'] : []
    };
    setQuestions([...questions, newQuestion]);
    setShowQuestionTypeModal(false);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] } : q
    ));
  };

  const updateOption = (questionId, index, value) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, options: q.options.map((opt, i) => i === index ? value : opt) } : q
    ));
  };

  const removeOption = (questionId, index) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, options: q.options.filter((_, i) => i !== index) } : q
    ));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setExpiryDate(selectedDate);
  };

  const handleSave = async () => {
    if (!title.trim()) return Alert.alert('Error', 'Please enter a survey title');
    if (questions.length === 0) return Alert.alert('Error', 'Please add at least one question');

    const invalidQuestions = questions.filter(q => !q.text.trim());
    if (invalidQuestions.length > 0) return Alert.alert('Error', 'Please fill in all question texts');

    const invalidOptions = questions.filter(q => q.type === 'multiple-choice' && q.options.some(opt => !opt.trim()));
    if (invalidOptions.length > 0) return Alert.alert('Error', 'Please fill in all option texts for multiple choice questions');

    setSaving(true);
    try {
      // 1️⃣ Create survey
      const surveyRef = await addDoc(collection(db, 'surveys'), {
        title: title.trim(),
        description: description.trim(),
        expiryDate: expiryDate,
        questions: questions.map(q => ({
          id: q.id,
          type: q.type,
          text: q.text.trim(),
          required: q.required,
          options: q.options ? q.options.map(opt => opt.trim()) : []
        })),
        createdAt: serverTimestamp(),
        active: true
      });

      // 2️⃣ Create notification
      await addDoc(collection(db, 'notifications'), {
        title: "New Survey Available",
        message: `A new survey "${title.trim()}" has been created. Please complete it before ${expiryDate ? expiryDate.toLocaleDateString() : 'the deadline'}.`,
        timestamp: serverTimestamp()
      });

      Alert.alert('Success', 'Survey created and notification sent!', [{ text: 'OK', onPress: () => navigation.navigate('Surveys') }]);
    } catch (error) {
      console.error('Error creating survey:', error);
      Alert.alert('Error', 'Failed to create survey. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderQuestion = (question, index) => (
    <View key={question.id} style={styles.questionContainer}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionNumber}>Q{index + 1} ({question.type})</Text>
        <TouchableOpacity onPress={() => removeQuestion(question.id)}>
          <Text style={styles.removeButton}>Remove</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.questionInput}
        value={question.text}
        onChangeText={(text) => updateQuestion(question.id, 'text', text)}
        placeholder="Enter your question here..."
      />

      <View style={styles.requiredContainer}>
        <Text>Required:</Text>
        <Switch
          value={question.required}
          onValueChange={(value) => updateQuestion(question.id, 'required', value)}
        />
      </View>

      {question.type === 'multiple-choice' && (
        <View style={styles.optionsContainer}>
          {question.options.map((option, optIndex) => (
            <View key={optIndex} style={styles.optionRow}>
              <TextInput
                style={styles.optionInput}
                value={option}
                onChangeText={(text) => updateOption(question.id, optIndex, text)}
                placeholder={`Option ${optIndex + 1}`}
              />
              {question.options.length > 2 && (
                <TouchableOpacity onPress={() => removeOption(question.id, optIndex)}>
                  <Text style={styles.removeOption}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addOptionButton} onPress={() => addOption(question.id)}>
            <Text style={styles.addOptionText}>+ Add Option</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 🔹 Go Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>⬅ Go Back</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content}>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Survey Title *" />
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Survey Description" multiline numberOfLines={3} />

        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateButtonText}>{expiryDate ? expiryDate.toLocaleDateString() : 'Select expiry date'}</Text>
        </TouchableOpacity>
        {showDatePicker && <DateTimePicker value={expiryDate || new Date()} mode="date" display="default" onChange={handleDateChange} minimumDate={new Date()} />}

        {questions.map(renderQuestion)}

        <TouchableOpacity style={styles.addQuestionButton} onPress={() => setShowQuestionTypeModal(true)}>
          <Text style={styles.addQuestionButtonText}>+ Add Question</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.submitButton, saving && styles.submitButtonDisabled]} onPress={handleSave} disabled={saving}>
          <Text style={styles.submitButtonText}>{saving ? 'Creating Survey...' : 'Create Survey'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Question Type Modal */}
      <Modal visible={showQuestionTypeModal} transparent animationType="slide" onRequestClose={() => setShowQuestionTypeModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Question Type</Text>
            <TouchableOpacity style={styles.modalOption} onPress={() => addQuestion('text')}><Text>📝 Text Answer</Text></TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => addQuestion('multiple-choice')}><Text>🔘 Multiple Choice</Text></TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => addQuestion('rating')}><Text>⭐ Rating Scale</Text></TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowQuestionTypeModal(false)}><Text style={{color:'#e74c3c'}}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#3498db',
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  backButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  content: { flex: 1 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 6, marginBottom: 16 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  dateButton: { backgroundColor: '#fff', padding: 12, borderRadius: 6, marginBottom: 16 },
  dateButtonText: { color: '#2c3e50' },
  questionContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  questionNumber: { fontWeight: 'bold' },
  removeButton: { color: '#e74c3c' },
  questionInput: { borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 12 },
  requiredContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  optionsContainer: {},
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  optionInput: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#eee', marginRight: 8 },
  removeOption: { color: '#e74c3c', fontSize: 20, fontWeight: 'bold' },
  addOptionButton: { padding: 8, backgroundColor: '#ecf0f1', borderRadius: 4, alignItems: 'center', marginTop: 8 },
  addOptionText: { color: '#3498db', fontWeight: 'bold' },
  addQuestionButton: { backgroundColor: '#3498db', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  addQuestionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  submitButton: { backgroundColor: '#2ecc71', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 40 },
  submitButtonDisabled: { backgroundColor: '#bdc3c7' },
  submitButtonText: { color: 'white', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  modalOption: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  modalCancel: { padding: 15, marginTop: 10, alignItems: 'center' },
});

export default SurveyCreationScreen;
