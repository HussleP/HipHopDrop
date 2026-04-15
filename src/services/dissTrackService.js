/**
 * dissTrackService.js
 * Real Firestore voting for the Greatest Diss Track poll.
 *
 * Firestore structure:
 *   disstrack_poll/{trackId}  →  { votes: number }
 *
 * One vote per device. User can change their vote — old track decrements,
 * new track increments. All handled in a Firestore transaction.
 */

import {
  collection, doc, getDoc, getDocs,
  setDoc, updateDoc, increment,
  onSnapshot, runTransaction,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';

const COLLECTION        = 'disstrack_poll';
const USER_VOTE_KEY     = 'user_diss_vote';  // AsyncStorage key

// ── Subscribe to live vote counts ────────────────────────────────────────────
// Returns an unsubscribe function.
export function subscribeToVotes(onUpdate) {
  const ref = collection(db, COLLECTION);
  return onSnapshot(ref, snapshot => {
    const votes = {};
    snapshot.forEach(doc => { votes[doc.id] = doc.data().votes || 0; });
    onUpdate(votes);
  }, err => {
    console.warn('[DissVote] onSnapshot error:', err.message);
  });
}

// ── Get the current user's stored vote ───────────────────────────────────────
export async function getUserVote() {
  try {
    return await AsyncStorage.getItem(USER_VOTE_KEY);
  } catch (_) {
    return null;
  }
}

// ── Cast or change a vote ────────────────────────────────────────────────────
// Returns the new trackId the user voted for (same as input unless error).
export async function castVote(newTrackId) {
  try {
    const prevTrackId = await getUserVote();

    // No-op if tapping the same track
    if (prevTrackId === newTrackId) return prevTrackId;

    const newRef  = doc(db, COLLECTION, newTrackId);
    const prevRef = prevTrackId ? doc(db, COLLECTION, prevTrackId) : null;

    await runTransaction(db, async tx => {
      // Increment new track
      const newSnap = await tx.get(newRef);
      if (newSnap.exists()) {
        tx.update(newRef, { votes: increment(1) });
      } else {
        tx.set(newRef, { votes: 1 });
      }

      // Decrement old track if it exists and has votes
      if (prevRef) {
        const prevSnap = await tx.get(prevRef);
        if (prevSnap.exists()) {
          const current = prevSnap.data().votes || 0;
          tx.update(prevRef, { votes: Math.max(0, current - 1) });
        }
      }
    });

    await AsyncStorage.setItem(USER_VOTE_KEY, newTrackId);
    return newTrackId;

  } catch (err) {
    console.warn('[DissVote] castVote error:', err.message);
    throw err;
  }
}

// ── Get a one-time snapshot of all vote counts ───────────────────────────────
export async function getVoteSnapshot() {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION));
    const votes = {};
    snapshot.forEach(doc => { votes[doc.id] = doc.data().votes || 0; });
    return votes;
  } catch (err) {
    console.warn('[DissVote] getVoteSnapshot error:', err.message);
    return {};
  }
}
