// firestoreService.js
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

// Create or update a document
export const upsertUser = async (userId, data) => {
  try {
    await setDoc(doc(db, 'users', userId), data, { merge: true });
    console.log('Document written with ID: ', userId);
    return true;
  } catch (e) {
    console.error('Error writing document: ', e);
    return false;
  }
};

// Get a document
export const getUser = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (e) {
    console.error('Error getting document: ', e);
    return null;
  }
};

// Update a document
export const updateUser = async (userId, newData) => {
  try {
    await updateDoc(doc(db, 'users', userId), newData);
    console.log('Document updated successfully!');
    return true;
  } catch (e) {
    console.error('Error updating document: ', e);
    return false;
  }
};

// Delete a document
export const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
    console.log('Document deleted successfully!');
    return true;
  } catch (e) {
    console.error('Error deleting document: ', e);
    return false;
  }
};