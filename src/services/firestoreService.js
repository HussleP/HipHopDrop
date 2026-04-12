import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  increment,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import { polls as mockPolls, liveDrops, comingSoonDrops } from '../data/mockData';

// ─── POLLS ────────────────────────────────────────────────────────────────────

/**
 * Subscribe to real-time polls feed.
 * Falls back to mock data if Firestore is empty.
 */
export function subscribeToPollsRealtime(onUpdate, type = null) {
  const q = type
    ? query(collection(db, 'polls'), where('type', '==', type), orderBy('createdAt', 'desc'))
    : query(collection(db, 'polls'), orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    if (snapshot.empty) {
      // Seed with mock polls if Firestore is empty
      await seedPolls();
      onUpdate(type ? mockPolls.filter(p => p.type === type) : mockPolls);
      return;
    }
    const polls = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    onUpdate(polls);
  }, (err) => {
    console.warn('[Firestore] polls error, using mock:', err.message);
    onUpdate(type ? mockPolls.filter(p => p.type === type) : mockPolls);
  });

  return unsubscribe;
}

/**
 * Cast a vote on a poll (one vote per user per poll).
 */
export async function castVoteFirestore(pollId, option, userId) {
  const voteRef = doc(db, 'polls', pollId, 'votes', userId);
  const pollRef = doc(db, 'polls', pollId);

  await runTransaction(db, async (transaction) => {
    const voteDoc = await transaction.get(voteRef);
    if (voteDoc.exists()) throw new Error('Already voted');
    transaction.set(voteRef, { option, createdAt: serverTimestamp() });
    transaction.update(pollRef, {
      [`option${option}.votes`]: increment(1),
    });
  });
}

/**
 * Seed Firestore with mock polls on first run.
 */
async function seedPolls() {
  const { polls } = await import('../data/mockData');
  for (const poll of polls) {
    await setDoc(doc(db, 'polls', poll.id), {
      ...poll,
      createdAt: serverTimestamp(),
    });
  }
  console.log('[Firestore] Seeded polls');
}

// ─── DROPS ────────────────────────────────────────────────────────────────────

/**
 * Subscribe to real-time drops feed.
 */
export function subscribeToDropsRealtime(onUpdate) {
  const q = query(collection(db, 'drops'), orderBy('dropTime', 'asc'));

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    if (snapshot.empty) {
      await seedDrops();
      onUpdate({ live: liveDrops, soon: comingSoonDrops });
      return;
    }
    const drops = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    onUpdate({
      live: drops.filter(d => d.status === 'live'),
      soon: drops.filter(d => d.status === 'soon'),
    });
  }, (err) => {
    console.warn('[Firestore] drops error, using mock:', err.message);
    onUpdate({ live: liveDrops, soon: comingSoonDrops });
  });

  return unsubscribe;
}

/**
 * Seed Firestore with mock drops on first run.
 */
async function seedDrops() {
  const allDrops = [...liveDrops, ...comingSoonDrops];
  for (const drop of allDrops) {
    await setDoc(doc(db, 'drops', drop.id), {
      ...drop,
      dropTime: serverTimestamp(),
    });
  }
  console.log('[Firestore] Seeded drops');
}

// ─── USER PREFERENCES ────────────────────────────────────────────────────────

/**
 * Save user alert preferences to Firestore.
 */
export async function saveUserPreferences(userId, categories, artists) {
  await updateDoc(doc(db, 'users', userId), {
    alertCategories: categories,
    alertArtists: artists,
  });
}

/**
 * Get user alert preferences from Firestore.
 */
export async function getUserPreferences(userId) {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return { categories: {}, artists: {} };
  const data = snap.data();
  return {
    categories: data.alertCategories || {},
    artists: data.alertArtists || {},
  };
}
