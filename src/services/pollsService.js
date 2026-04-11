/**
 * pollsService.js
 *
 * Currently uses mock data.
 * When Firebase is connected, swap the mock functions below
 * with the Firebase equivalents — the rest of the app stays identical.
 *
 * Firebase real-time flow (future):
 *   - Polls are stored in Firestore: /polls/{pollId}
 *   - Votes stored in:              /polls/{pollId}/votes/{userId}
 *   - New articles trigger a Cloud Function that auto-generates polls
 *   - onSnapshot listener pushes live updates to the app
 */

import { polls as mockPolls } from '../data/mockData';

// ─── MOCK IMPLEMENTATION (active now) ────────────────────────────────────────

/**
 * Fetch all polls, optionally filtered by type.
 * @param {'beef'|'awards'|'versus'|null} type
 * @returns {Promise<Array>}
 */
export async function fetchPolls(type = null) {
  // TODO: Replace with Firestore query:
  // const q = type
  //   ? query(collection(db, 'polls'), where('type', '==', type), orderBy('createdAt', 'desc'))
  //   : query(collection(db, 'polls'), orderBy('createdAt', 'desc'));
  // const snapshot = await getDocs(q);
  // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return type ? mockPolls.filter(p => p.type === type) : mockPolls;
}

/**
 * Subscribe to real-time poll updates.
 * @param {Function} onUpdate - called with updated polls array
 * @param {'beef'|'awards'|'versus'|null} type
 * @returns {Function} unsubscribe function
 */
export function subscribeToPollsRealtime(onUpdate, type = null) {
  // TODO: Replace with Firestore onSnapshot:
  // const q = type
  //   ? query(collection(db, 'polls'), where('type', '==', type), orderBy('createdAt', 'desc'))
  //   : query(collection(db, 'polls'), orderBy('createdAt', 'desc'));
  // const unsubscribe = onSnapshot(q, snapshot => {
  //   const polls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  //   onUpdate(polls);
  // });
  // return unsubscribe;

  // Mock: just call once with current data
  const data = type ? mockPolls.filter(p => p.type === type) : mockPolls;
  onUpdate(data);
  return () => {}; // no-op unsubscribe
}

/**
 * Cast a vote on a poll.
 * @param {string} pollId
 * @param {'A'|'B'|'C'|'D'} option
 * @param {string} userId
 */
export async function castVote(pollId, option, userId) {
  // TODO: Replace with Firestore transaction:
  // const pollRef = doc(db, 'polls', pollId);
  // const voteRef = doc(db, 'polls', pollId, 'votes', userId);
  // await runTransaction(db, async (transaction) => {
  //   const voteDoc = await transaction.get(voteRef);
  //   if (voteDoc.exists()) throw new Error('Already voted');
  //   const pollDoc = await transaction.get(pollRef);
  //   const current = pollDoc.data()[`option${option}`]?.votes || 0;
  //   transaction.set(voteRef, { option, createdAt: serverTimestamp() });
  //   transaction.update(pollRef, { [`option${option}.votes`]: current + 1 });
  // });

  // Mock: handled locally in PollCard.js via AsyncStorage
  console.log(`[Mock] Vote cast: poll=${pollId}, option=${option}`);
}

/**
 * Auto-generate a poll from a news article.
 * Called by a Cloud Function in production when a new article is published.
 * @param {Object} article
 */
export async function generatePollFromArticle(article) {
  // TODO: This will be a Firebase Cloud Function trigger:
  // exports.onNewArticle = functions.firestore
  //   .document('articles/{articleId}')
  //   .onCreate(async (snap) => {
  //     const article = snap.data();
  //     if (article.category === 'Beef') {
  //       await generateBeefPoll(article);
  //     } else if (article.category === 'Awards') {
  //       await generateAwardsPoll(article);
  //     }
  //   });

  console.log(`[Mock] Would auto-generate poll for: ${article.title}`);
}
