import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const RegisterWithSocial = ({ onRegister }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join With Social</Text>
      
      <TouchableOpacity style={[styles.socialButton, styles.facebook]}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/124/124010.png' }} 
          style={styles.icon}
        />
        <Text style={styles.socialText}>Continue with Facebook</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.socialButton, styles.google]}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/300/300221.png' }} 
          style={styles.icon}
        />
        <Text style={styles.socialText}>Continue with Google</Text>
      </TouchableOpacity>
      
      <Text style={styles.orText}>OR</Text>
      
      <TouchableOpacity 
        style={styles.emailButton}
        onPress={onRegister}
      >
        <Text style={styles.emailText}>Sign up with Email</Text>
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
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15
  },
  facebook: {
    backgroundColor: '#3b5998'
  },
  google: {
    backgroundColor: '#db4437'
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 15
  },
  socialText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  orText: {
    textAlign: 'center',
    marginVertical: 15,
    color: '#95a5a6'
  },
  emailButton: {
    borderWidth: 1,
    borderColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center'
  },
  emailText: {
    color: '#3498db',
    fontWeight: 'bold'
  }
});

export default RegisterWithSocial;