import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ThemeContext } from './ThemeContext';

const ProfileScreen = ({ user, onBack, onSave }) => {
  const theme = useContext(ThemeContext);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (form.phone && !/^\+?[\d\s-]{10,}$/.test(form.phone)) newErrors.phone = 'Invalid phone';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(form);
      setEditing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={[styles.backText, { color: theme.colors.primary }]}>← Back</Text>
      </TouchableOpacity>
      
      <View style={styles.profileHeader}>
        <Image 
          source={require('./assets/user.png')} 
          style={styles.avatar}
        />
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => editing ? setEditing(false) : setEditing(true)}
        >
          <Text style={[styles.editText, { color: theme.colors.primary }]}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Full Name</Text>
        {editing ? (
          <>
            <TextInput
              style={[styles.input, { 
                color: theme.colors.text,
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border
              }, errors.name && styles.errorInput]}
              value={form.name}
              onChangeText={text => setForm({...form, name: text})}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </>
        ) : (
          <Text style={[styles.value, { color: theme.colors.text }]}>{user.name}</Text>
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
                borderColor: theme.colors.border
              }, errors.email && styles.errorInput]}
              value={form.email}
              onChangeText={text => setForm({...form, email: text})}
              keyboardType="email-address"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </>
        ) : (
          <Text style={[styles.value, { color: theme.colors.text }]}>{user.email}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Phone</Text>
        {editing ? (
          <>
            <TextInput
              style={[styles.input, { 
                color: theme.colors.text,
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border
              }, errors.phone && styles.errorInput]}
              value={form.phone}
              onChangeText={text => setForm({...form, phone: text})}
              keyboardType="phone-pad"
              placeholder="+1234567890"
              placeholderTextColor="#999"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </>
        ) : (
          <Text style={[styles.value, { color: theme.colors.text }]}>{user.phone || 'Not provided'}</Text>
        )}
      </View>
      
      {editing && (
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity style={styles.changePasswordButton}>
        <Text style={[styles.changePasswordText, { color: theme.colors.primary }]}>
          Change Password
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  backButton: {
    marginBottom: 20
  },
  backText: {
    fontSize: 16
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
  editButton: {
    padding: 10
  },
  editText: {
    fontWeight: 'bold'
  },
  formGroup: {
    marginBottom: 20
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10
  },
  errorInput: {
    borderColor: '#e74c3c'
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5
  },
  value: {
    fontSize: 16,
    paddingVertical: 12
  },
  saveButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  changePasswordButton: {
    marginTop: 30,
    alignSelf: 'center'
  },
  changePasswordText: {
    fontWeight: 'bold'
  }
});

export default ProfileScreen;