import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Switch } from 'react-native';
import { ThemeContext } from './ThemeContext';

const Register = ({ onRegister }) => {
  const theme = useContext(ThemeContext);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!form.name.trim()) newErrors.name = 'Name is required';
    else if (form.name.length < 3) newErrors.name = 'Name too short';
    
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Invalid email format';
    
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^[0-9]{10,15}$/.test(form.phone)) newErrors.phone = 'Invalid phone number';
    
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (!form.agreeToTerms) newErrors.agreeToTerms = 'You must agree to terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setIsLoading(true);
      try {
        await onRegister({
          name: form.name,
          email: form.email,
          phone: form.phone
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
      
      <TextInput
        style={[styles.input, { 
          borderColor: errors.name ? '#e74c3c' : theme.colors.border,
          color: theme.colors.text,
          backgroundColor: theme.colors.card
        }]}
        placeholder="Full Name"
        placeholderTextColor="#999"
        value={form.name}
        onChangeText={text => setForm({...form, name: text})}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      
      <TextInput
        style={[styles.input, { 
          borderColor: errors.email ? '#e74c3c' : theme.colors.border,
          color: theme.colors.text,
          backgroundColor: theme.colors.card
        }]}
        placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={text => setForm({...form, email: text})}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      
      <TextInput
        style={[styles.input, { 
          borderColor: errors.phone ? '#e74c3c' : theme.colors.border,
          color: theme.colors.text,
          backgroundColor: theme.colors.card
        }]}
        placeholder="Phone Number"
        placeholderTextColor="#999"
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={text => setForm({...form, phone: text})}
      />
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      
      <TextInput
        style={[styles.input, { 
          borderColor: errors.password ? '#e74c3c' : theme.colors.border,
          color: theme.colors.text,
          backgroundColor: theme.colors.card
        }]}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={form.password}
        onChangeText={text => setForm({...form, password: text})}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      
      <TextInput
        style={[styles.input, { 
          borderColor: errors.confirmPassword ? '#e74c3c' : theme.colors.border,
          color: theme.colors.text,
          backgroundColor: theme.colors.card
        }]}
        placeholder="Confirm Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={form.confirmPassword}
        onChangeText={text => setForm({...form, confirmPassword: text})}
      />
      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      
      <View style={styles.termsContainer}>
        <Switch
          value={form.agreeToTerms}
          onValueChange={value => setForm({...form, agreeToTerms: value})}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        />
        <Text style={[styles.termsText, { color: theme.colors.text }]}>
          I agree to terms and conditions
        </Text>
      </View>
      {errors.agreeToTerms && <Text style={styles.errorText}>{errors.agreeToTerms}</Text>}
      
      <TouchableOpacity 
        style={[styles.button, { 
          backgroundColor: theme.colors.primary,
          opacity: isLoading ? 0.7 : 1
        }]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center'
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 15,
    fontSize: 12
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15
  },
  termsText: {
    marginLeft: 10,
    fontSize: 14
  }
});

export default Register;