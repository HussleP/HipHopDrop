/**
 * interactionsService.js
 *
 * Handles likes, dislikes, and comments for both articles and polls.
 * All data lives in Firestore under:
 *   interactions/{contentId}            — like/dislike counts
 *   interactions/{contentId}/comments/  — comment subcollection
 *
 * User's own vote is stored in AsyncStorage to prevent double-voting
 * without requiring a server round-trip on every render.
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  increment,
  runTransaction,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import { getCurrentUser } from './authService';

// ─── LIKE / DISLIKE ───────────────────────────────────────────────────────────

/**
 * Subscribe to real-time like/dislike counts for a piece of content.
 * @param {string} contentId  - article id or poll id
 * @param {Function} onUpdate - called with { likes, dislikes }
 * @returns unsubscribe function
 */
export function subscribeToReactions(contentId, onUpdate) {
  const ref = doc(db, 'interactions', contentId);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const d = snap.data();
      onUpdate({ likes: d.likes || 0, dislikes: d.dislikes || 0 });
    } else {
      onUpdate({ likes: 0, dislikes: 0 });
    }
  }, () => {
    onUpdate({ likes: 0, dislikes: 0 });
  });
}

/**
 * Get the current user's reaction from AsyncStorage.
 * @returns {'like'|'dislike'|null}
 */
export async function getUserReaction(contentId) {
  const key = `reaction_${contentId}`;
  return await AsyncStorage.getItem(key);
}

/**
 * Toggle a like or dislike. Handles switching between them.
 * @param {string} contentId
 * @param {'like'|'dislike'} reaction
 */
export async function toggleReaction(contentId, reaction) {
  const ref = doc(db, 'interactions', contentId);
  const key = `reaction_${contentId}`;
  const current = await AsyncStorage.getItem(key);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists() ? snap.data() : { likes: 0, dislikes: 0 };

    let newLikes = data.likes || 0;
    let newDislikes = data.dislikes || 0;

    if (current === reaction) {
      // Undo existing reaction
      if (reaction === 'like') newLikes = Math.max(0, newLikes - 1);
      else newDislikes = Math.max(0, newDislikes - 1);

      await AsyncStorage.removeItem(key);
      tx.set(ref, { likes: newLikes, dislikes: newDislikes }, { merge: true });
      return;
    }

    // Remove old reaction if switching
    if (current === 'like') newLikes = Math.max(0, newLikes - 1);
    if (current === 'dislike') newDislikes = Math.max(0, newDislikes - 1);

    // Add new reaction
    if (reaction === 'like') newLikes += 1;
    else newDislikes += 1;

    await AsyncStorage.setItem(key, reaction);
    tx.set(ref, { likes: newLikes, dislikes: newDislikes }, { merge: true });
  });
}

// ─── COMMENTS ─────────────────────────────────────────────────────────────────

/**
 * Subscribe to real-time comments for a piece of content.
 * @param {string} contentId
 * @param {Function} onUpdate - called with array of comment objects
 * @returns unsubscribe function
 */
export function subscribeToComments(contentId, onUpdate) {
  const q = query(
    collection(db, 'interactions', contentId, 'comments'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const comments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onUpdate(comments);
  }, () => {
    onUpdate([]);
  });
}

/**
 * Post a new comment.
 * @param {string} contentId
 * @param {string} text
 */
export async function postComment(contentId, text) {
  const user = getCurrentUser();
  const displayName = user?.displayName || 'Anonymous';
  const uid = user?.uid || 'anon';

  // Ensure the parent interaction doc exists
  const ref = doc(db, 'interactions', contentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { likes: 0, dislikes: 0 });
  }

  await addDoc(collection(db, 'interactions', contentId, 'comments'), {
    text: text.trim(),
    displayName,
    uid,
    createdAt: serverTimestamp(),
    likes: 0,
  });
}

/**
 * Like a comment.
 */
export async function likeComment(contentId, commentId) {
  const key = `comment_like_${contentId}_${commentId}`;
  const already = await AsyncStorage.getItem(key);
  if (already) return;

  await updateDoc(
    doc(db, 'interactions', contentId, 'comments', commentId),
    { likes: increment(1) }
  );
  await AsyncStorage.setItem(key, '1');
}
