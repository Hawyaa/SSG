import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { ThemeContext } from './ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { auth } from './firebase';
import { updateEmail, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';

const ProfileScreen = ({ navigation, route }) => {
  const theme = useContext(ThemeContext);
  const { user, updateUserProfile } = route.params;
  const db = getFirestore();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user.displayName || '',
    email: user.email || '',
    phone: user.phone || '',
    photoURL: user.photoURL || null
  });
  const [errors, setErrors] = useState({});

  // Fetch phone from Firestore
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().phone) {
          setForm(prev => ({ ...prev, phone: userDoc.data().phone }));
        }
      } catch (error) {
        console.error("Error fetching phone:", error);
      }
    };
    fetchPhoneNumber();
  }, [user.uid]);

  const formatPhoneNumber = (text) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.startsWith('251')) return `+${cleaned}`;
    if (cleaned.startsWith('0')) return `+251${cleaned.substring(1)}`;
    return text.startsWith('+') ? text : `+${text}`;
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (form.phone && !/^\+251[79]\d{8}$/.test(form.phone)) newErrors.phone = 'Invalid Ethiopian phone (e.g., +251911223344)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: form.name,
        photoURL: form.photoURL
      });

      if (form.email !== user.email) {
        await updateEmail(auth.currentUser, form.email);
      }

      // Update Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        displayName: form.name,
        email: form.email,
        phone: form.phone,
        photoURL: form.photoURL,
        lastUpdated: new Date()
      }, { merge: true });

      // Update parent state
      updateUserProfile({
        displayName: form.name,
        email: form.email,
        phone: form.phone,
        photoURL: form.photoURL
      });

      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera roll permission is needed to select a photo');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setForm(prev => ({ ...prev, photoURL: result.assets[0].uri }));
    }
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: theme.colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity onPress={editing ? pickImage : null}>
          <Image
            source={form.photoURL ? { uri: form.photoURL } : require('./assets/user.png')}
            style={styles.avatar}
          />
          {editing && <Text style={styles.changePhotoText}>Change Photo</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.editButton, { borderColor: theme.colors.primary }]}
          onPress={() => setEditing(!editing)}
        >
          <Text style={[styles.editText, { color: theme.colors.primary }]}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        {['name', 'email', 'phone'].map((field, idx) => (
          <View style={styles.formGroup} key={idx}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {field === 'name' ? 'Full Name' : field === 'email' ? 'Email' : 'Phone Number'}
            </Text>
            {editing ? (
              <>
                <TextInput
                  style={[styles.input, {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.card,
                    borderColor: errors[field] ? '#e74c3c' : theme.colors.border
                  }]}
                  value={form[field]}
                  onChangeText={text => setForm({ ...form, [field]: field === 'phone' ? formatPhoneNumber(text) : text })}
                  keyboardType={field === 'email' ? 'email-address' : field === 'phone' ? 'phone-pad' : 'default'}
                  autoCapitalize={field === 'email' ? 'none' : 'words'}
                  placeholder={field === 'phone' ? '+251911223344' : ''}
                  placeholderTextColor="#999"
                />
                {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
              </>
            ) : (
              <Text style={[styles.value, { color: theme.colors.text }]}>{form[field] || 'Not provided'}</Text>
            )}
          </View>
        ))}
      </View>

      {editing && (
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Changes</Text>}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.changePasswordButton, { borderColor: theme.colors.primary }]}
        onPress={handleChangePassword}
      >
        <Text style={[styles.changePasswordText, { color: theme.colors.primary }]}>Change Password</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  backText: { fontSize: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  profileSection: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 130, height: 130, borderRadius: 65, marginBottom: 10 },
  changePhotoText: { color: '#3498db', textAlign: 'center', marginTop: 5 },
  editButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, borderWidth: 1, marginTop: 10 },
  editText: { fontWeight: 'bold' },
  formContainer: { marginBottom: 20 },
  formGroup: { marginBottom: 20 },
  label: { fontWeight: 'bold', marginBottom: 6, fontSize: 16 },
  input: { height: 50, borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, fontSize: 16 },
  errorText: { color: '#e74c3c', fontSize: 14, marginTop: 5 },
  value: { fontSize: 16, paddingVertical: 12 },
  saveButton: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  changePasswordButton: { padding: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center', marginTop: 25, marginHorizontal: 50 },
  changePasswordText: { fontWeight: 'bold', fontSize: 16 },
});

export default ProfileScreen;
