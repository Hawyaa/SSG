// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  inMemoryPersistence,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ---------------- Firebase Config ----------------
const firebaseConfig = {
  apiKey: "AIzaSyAr95bpAX-rMBns8eYUCw1KwpDmfmiKU8k",
  authDomain: "mahi-c83c7.firebaseapp.com",
  projectId: "mahi-c83c7",
  storageBucket: "mahi-c83c7.appspot.com",
  messagingSenderId: "351107771374",
  appId: "1:351107771374:web:77ec919a1b2430b0bbfcff",
  measurementId: "G-QT77HKNQMM",
};

// ---------------- Initialize Firebase ----------------
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// ---------------- Auth Initialization ----------------
let auth;

try {
  auth = getAuth(app);

  // Hot reload protection
  if (!auth._canInit) {
    console.log("⚡ Reusing existing Firebase Auth instance");
  }
} catch (e) {
  console.log("⚡ Initializing Firebase Auth with persistence...");
  auth = initializeAuth(app, {
    persistence:
      typeof getReactNativePersistence === "function"
        ? getReactNativePersistence(AsyncStorage)
        : inMemoryPersistence,
  });
}

// ---------------- Firestore ----------------
const db = getFirestore(app);

// ---------------- Firestore Safe Update Helper ----------------
export const safeUpdateDoc = async (collectionName, docId, data) => {
  try {
    const ref = doc(db, collectionName, docId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      await updateDoc(ref, data);
      console.log(`✅ Document '${collectionName}/${docId}' updated`);
    } else {
      await setDoc(ref, data, { merge: true });
      console.log(`🆕 Document '${collectionName}/${docId}' created`);
    }
  } catch (error) {
    console.error("❌ Firestore safeUpdateDoc error:", error);
    throw error;
  }
};

export { auth, db, app };
