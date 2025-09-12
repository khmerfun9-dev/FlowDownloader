// Firebase configuration for React Native
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Replace with your actual API key
  authDomain: "flowdownloader-project.firebaseapp.com", // Replace with your actual auth domain
  projectId: "flowdownloader-project", // Replace with your actual project ID
  storageBucket: "flowdownloader-project.appspot.com", // Replace with your actual storage bucket
  messagingSenderId: "123456789012", // Replace with your actual messaging sender ID
  appId: "1:123456789012:web:abcdefghijklmnopqrstuvwxyz", // Replace with your actual app ID
  measurementId: "G-XXXXXXXXXX" // Replace with your actual measurement ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { auth, db };
export default app;