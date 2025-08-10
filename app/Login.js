import React, { useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ThemeContext } from './ThemeContext';

const Login = ({ onLogin, onRegister }) => {
  const theme = useContext(ThemeContext);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>SSG Customer Satisfaction</Text>
      
      <TextInput
        style={[styles.input, { 
          borderColor: theme.colors.border,
          color: theme.colors.text,
          backgroundColor: theme.colors.card
        }]}
        placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      
      <TextInput
        style={[styles.input, { 
          borderColor: theme.colors.border,
          color: theme.colors.text,
          backgroundColor: theme.colors.card
        }]}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={onLogin}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onRegister}>
        <Text style={[styles.link, { color: theme.colors.primary }]}>Don't have an account? Register</Text>
      </TouchableOpacity>

      <View style={[styles.socialContainer, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.orText, { color: theme.colors.text }]}>OR</Text>
        
        <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#3b5998' }]}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/124/124010.png' }} 
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>Continue with Facebook</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#db4437' }]}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/300/300221.png' }} 
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity>
        <Text style={[styles.link, { color: theme.colors.primary }]}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20
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
    marginBottom: 15,
    fontSize: 16
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  link: {
    textAlign: 'center',
    marginTop: 20
  },
  socialContainer: {
    marginVertical: 20,
    borderTopWidth: 1,
    paddingTop: 20
  },
  orText: {
    textAlign: 'center',
    marginBottom: 15
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 5,
    marginBottom: 10
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 15
  },
  socialText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default Login;