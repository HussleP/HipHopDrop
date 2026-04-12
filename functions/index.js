/**
 * Hip-Hop Drop — Firebase Cloud Functions
 *
 * These functions run on Google's servers and push notifications to users
 * via Expo's Push Notification API. No FCM setup required — Expo handles
 * the delivery to both iOS (APNs) and Android (FCM) automatically.
 *
 * Deploy with:
 *   cd functions && npm install
 *   cd .. && firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();
const db = admin.firestore();

// ─── Expo Push API endpoint ────────────────────────────────────────────────
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// ─── Helper: get all registered push tokens from Firestore ────────────────
async function getAllPushTokens() {
  const snapshot = await db
    .collection('users')
    .where('pushToken', '!=', null)
    .get();

  return snapshot.docs
    .map(d => d.data().pushToken)
    .filter(t => t && t.startsWith('ExponentPushToken'));
}

// ─── Helper: get push tokens for users who follow a specific artist ────────
async function getTokensForArtist(artistName) {
  const snapshot = await db
    .collection('users')
    .where('pushToken', '!=', null)
    .get();

  return snapshot.docs
    .filter(d => {
      const artists = d.data().followedArtists || [];
      return artists.some(a =>
        a.toLowerCase().includes(artistName.toLowerCase())
      );
    })
    .map(d => d.data().pushToken)
    .filter(t => t && t.startsWith('ExponentPushToken'));
}

// ─── Helper: send messages via Expo Push API in chunks of 100 ─────────────
async function sendExpoNotifications(messages) {
  if (!messages.length) return;

  // Expo recommends batches of 100
  const chunks = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });
      const data = await res.json();
      functions.logger.info('Expo push response:', data);
    } catch (err) {
      functions.logger.error('Expo push error:', err);
    }
  }
}

// ─── Log sent notification to Firestore ───────────────────────────────────
async function logNotification(type, title, body, recipientCount) {
  await db.collection('notification_log').add({
    type,
    title,
    body,
    recipientCount,
    sentAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// TRIGGER 1: New Drop added to Firestore → notify all users
// Fires when a document is created in the `drops` collection
// ══════════════════════════════════════════════════════════════════════════════
exports.onNewDrop = functions.firestore
  .document('drops/{dropId}')
  .onCreate(async (snap) => {
    const drop = snap.data();
    if (!drop) return;

    const title = `🔥 ${drop.artist} — ${drop.itemName} is LIVE`;
    const body = drop.price
      ? `${drop.price} · Limited run. Tap to shop before it sells out.`
      : 'Limited run. Tap to shop now.';

    // Get tokens — if artist field exists, target followers; else send to all
    const tokens = drop.artist
      ? await getTokensForArtist(drop.artist)
      : await getAllPushTokens();

    if (!tokens.length) {
      functions.logger.info('No push tokens found for drop notification');
      return;
    }

    const messages = tokens.map(token => ({
      to: token,
      title,
      body,
      sound: 'default',
      badge: 1,
      data: { type: 'drop', dropId: snap.id },
      channelId: 'drops',
    }));

    await sendExpoNotifications(messages);
    await logNotification('drop', title, body, tokens.length);
    functions.logger.info(`Drop notification sent to ${tokens.length} devices`);
  });

// ══════════════════════════════════════════════════════════════════════════════
// TRIGGER 2: New Poll added to Firestore → notify all users
// Fires when a document is created in the `polls` collection
// ══════════════════════════════════════════════════════════════════════════════
exports.onNewPoll = functions.firestore
  .document('polls/{pollId}')
  .onCreate(async (snap) => {
    const poll = snap.data();
    if (!poll) return;

    const typeLabel =
      poll.type === 'beef' ? '🔥 BEEF POLL' :
      poll.type === 'awards' ? '🏆 AWARDS POLL' :
      poll.type === 'versus' ? '⚔️ VERSUS POLL' : '🗳️ NEW POLL';

    const title = `${typeLabel} — Cast Your Vote`;
    const body = poll.question
      ? `${poll.question}: ${poll.subtitle || ''}`
      : 'A new fan poll is live. Your vote counts.';

    const tokens = await getAllPushTokens();
    if (!tokens.length) return;

    const messages = tokens.map(token => ({
      to: token,
      title,
      body,
      sound: 'default',
      badge: 1,
      data: { type: 'poll', pollId: snap.id },
      channelId: 'polls',
    }));

    await sendExpoNotifications(messages);
    await logNotification('poll', title, body, tokens.length);
    functions.logger.info(`Poll notification sent to ${tokens.length} devices`);
  });

// ══════════════════════════════════════════════════════════════════════════════
// TRIGGER 3: Breaking News — new article tagged isBreaking → notify all users
// Fires when a document is created in the `articles` collection
// ══════════════════════════════════════════════════════════════════════════════
exports.onBreakingNews = functions.firestore
  .document('articles/{articleId}')
  .onCreate(async (snap) => {
    const article = snap.data();
    if (!article || !article.isBreaking) return; // only breaking news

    const title = `⚡ BREAKING — ${article.source || 'Hip-Hop Drop'}`;
    const body = article.title || 'Breaking hip-hop news just dropped.';

    const tokens = await getAllPushTokens();
    if (!tokens.length) return;

    const messages = tokens.map(token => ({
      to: token,
      title,
      body,
      sound: 'default',
      badge: 1,
      data: { type: 'article', articleId: snap.id },
      channelId: 'news',
    }));

    await sendExpoNotifications(messages);
    await logNotification('article', title, body, tokens.length);
    functions.logger.info(`Breaking news notification sent to ${tokens.length} devices`);
  });

// ══════════════════════════════════════════════════════════════════════════════
// CALLABLE: sendCustomNotification
// Call this from your admin dashboard or Postman to push any message manually.
//
// Usage (from client or admin SDK):
//   const fn = httpsCallable(functions, 'sendCustomNotification');
//   await fn({ title: 'Test', body: 'Hello world', type: 'news' });
// ══════════════════════════════════════════════════════════════════════════════
exports.sendCustomNotification = functions.https.onCall(async (data, context) => {
  // Require authentication to call this function
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be signed in to send notifications.'
    );
  }

  const { title, body, type = 'news', targetArtist } = data;

  if (!title || !body) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'title and body are required.'
    );
  }

  const tokens = targetArtist
    ? await getTokensForArtist(targetArtist)
    : await getAllPushTokens();

  if (!tokens.length) {
    return { success: true, sent: 0, message: 'No registered devices' };
  }

  const messages = tokens.map(token => ({
    to: token,
    title,
    body,
    sound: 'default',
    badge: 1,
    data: { type },
    channelId: type === 'drop' ? 'drops' : type === 'poll' ? 'polls' : 'news',
  }));

  await sendExpoNotifications(messages);
  await logNotification(type, title, body, tokens.length);

  return { success: true, sent: tokens.length };
});

// ══════════════════════════════════════════════════════════════════════════════
// SCHEDULED: Daily digest — every day at noon ET
// Sends a "Top stories today" notification to keep users engaged
// ══════════════════════════════════════════════════════════════════════════════
exports.dailyDigest = functions.pubsub
  .schedule('0 17 * * *') // 17:00 UTC = 12:00 ET / 17:00 GMT
  .timeZone('America/New_York')
  .onRun(async () => {
    const title = '🎤 Hip-Hop Drop — Daily Digest';
    const body = 'Check today\'s drops, polls, and breaking news.';

    const tokens = await getAllPushTokens();
    if (!tokens.length) return null;

    const messages = tokens.map(token => ({
      to: token,
      title,
      body,
      sound: 'default',
      data: { type: 'digest' },
      channelId: 'news',
    }));

    await sendExpoNotifications(messages);
    await logNotification('digest', title, body, tokens.length);
    functions.logger.info(`Daily digest sent to ${tokens.length} devices`);
    return null;
  });
