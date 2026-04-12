import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyA0cfWz8PYxeUcgusohuiLV2n59XxyqCcw',
  authDomain: 'hiphopdrop-1.firebaseapp.com',
  projectId: 'hiphopdrop-1',
  storageBucket: 'hiphopdrop-1.firebasestorage.app',
  messagingSenderId: '78789996357',
  appId: '1:78789996357:web:ce53ae1f269a619c43982c',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
