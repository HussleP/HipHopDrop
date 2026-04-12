import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * Sign up with email and password.
 * Creates a user document in Firestore.
 */
export async function signUp(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });

  // Create user profile in Firestore
  await setDoc(doc(db, 'users', cred.user.uid), {
    displayName,
    email,
    createdAt: serverTimestamp(),
    followedArtists: [],
    alertCategories: {},
    alertArtists: {},
  });

  return cred.user;
}

/**
 * Sign in with email and password.
 */
export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/**
 * Sign out current user.
 */
export async function logOut() {
  await signOut(auth);
}

/**
 * Get current user's Firestore profile.
 */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

/**
 * Listen for auth state changes.
 * @param {Function} callback - called with user or null
 * @returns unsubscribe function
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get currently signed in user.
 */
export function getCurrentUser() {
  return auth.currentUser;
}
