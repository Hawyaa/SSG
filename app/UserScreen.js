// UserScreen.js
import React, { useState } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import { upsertUser, getUser, updateUser, deleteUser } from './firestoreService';

export default function UserScreen() {
  const [userId, setUserId] = useState('clwa'); // Your document ID
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userData, setUserData] = useState(null);

  // Create or update a user
  const handleSave = async () => {
    const success = await upsertUser(userId, {
      name,
      email,
      lastUpdated: new Date(),
    });
    if (success) alert('User saved!');
  };

  // Fetch a user
  const handleFetch = async () => {
    const data = await getUser(userId);
    setUserData(data);
    if (data) {
      setName(data.name || '');
      setEmail(data.email || '');
    } else {
      alert('User not found!');
    }
  };

  // Delete a user
  const handleDelete = async () => {
    const success = await deleteUser(userId);
    if (success) {
      alert('User deleted!');
      setUserData(null);
      setName('');
      setEmail('');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
      />
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <Button title="Save User" onPress={handleSave} />
      <Button title="Fetch User" onPress={handleFetch} />
      <Button title="Delete User" onPress={handleDelete} color="red" />

      {userData && (
        <View style={{ marginTop: 20 }}>
          <Text>Current User Data:</Text>
          <Text>Name: {userData.name}</Text>
          <Text>Email: {userData.email}</Text>
        </View>
      )}
    </View>
  );
}