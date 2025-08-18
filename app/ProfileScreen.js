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
  const [form, setForm] = useState({
    name: user.displayName || '',
    email: user.email || '',
    phone: user.phone || '',
    photoURL: user.photoURL || null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().phone) {
          setForm(prev => ({...prev, phone: userDoc.data().phone}));
        }
      } catch (error) {
        console.error("Error fetching phone number:", error);
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
    if (form.phone && !/^\+251[79]\d{8}$/.test(form.phone)) {
      newErrors.phone = 'Invalid Ethiopian phone (e.g., +251911223344)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      
      await updateProfile(auth.currentUser, {
        displayName: form.name,
        photoURL: form.photoURL
      });
      
      if (form.email !== user.email) {
        await updateEmail(auth.currentUser, form.email);
      }

      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        displayName: form.name,
        email: form.email,
        phone: form.phone,
        photoURL: form.photoURL,
        lastUpdated: new Date()
      }, { merge: true });

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
      Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload photos');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setForm({...form, photoURL: result.assets[0].uri});
    }
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Profile Management</Text>
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
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Full Name</Text>
          {editing ? (
            <>
              <TextInput
                style={[styles.input, { 
                  color: theme.colors.text,
                  backgroundColor: theme.colors.card,
                  borderColor: errors.name ? '#e74c3c' : theme.colors.border
                }]}
                value={form.name}
                onChangeText={text => setForm({...form, name: text})}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </>
          ) : (
            <Text style={[styles.value, { color: theme.colors.text }]}>{form.name || 'Not provided'}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
          {editing ? (
            <>
              <TextInput
                style={[styles.input, { 
                  color: theme.colors.text,
                  backgroundColor: theme.colors.card,
                  borderColor: errors.email ? '#e74c3c' : theme.colors.border
                }]}
                value={form.email}
                onChangeText={text => setForm({...form, email: text})}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </>
          ) : (
            <Text style={[styles.value, { color: theme.colors.text }]}>{form.email}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Phone Number</Text>
          {editing ? (
            <>
              <TextInput
                style={[styles.input, { 
                  color: theme.colors.text,
                  backgroundColor: theme.colors.card,
                  borderColor: errors.phone ? '#e74c3c' : theme.colors.border
                }]}
                value={form.phone}
                onChangeText={text => setForm({...form, phone: formatPhoneNumber(text)})}
                keyboardType="phone-pad"
                placeholder="+251911223344"
                placeholderTextColor="#999"
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </>
          ) : (
            <Text style={[styles.value, { color: theme.colors.text }]}>{form.phone || 'Not provided'}</Text>
          )}
        </View>
      </View>

      {editing && (
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity 
        style={[styles.changePasswordButton, { borderColor: theme.colors.primary }]}
        onPress={handleChangePassword}
      >
        <Text style={[styles.changePasswordText, { color: theme.colors.primary }]}>
          Change Password
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
  },
  backText: {
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  changePhotoText: {
    color: '#3498db',
    textAlign: 'center',
    marginTop: 5,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 10,
  },
  editText: {
    fontWeight: 'bold',
  },
  formContainer: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5,
  },
  value: {
    fontSize: 16,
    paddingVertical: 12,
  },
  saveButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  changePasswordButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 30,
    marginHorizontal: 50,
  },
  changePasswordText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen;