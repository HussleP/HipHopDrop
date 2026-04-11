/**
 * dropsService.js
 *
 * Currently uses mock data.
 * When Firebase + Shopify are connected, swap the functions below.
 *
 * Live flow (future):
 *   - Drops stored in Firestore: /drops/{dropId}
 *   - Status changes from 'soon' → 'live' trigger push notifications
 *   - Firebase Cloud Function checks drop times every minute
 *   - onSnapshot pushes live status updates to the app
 */

import { liveDrops, comingSoonDrops } from '../data/mockData';

/**
 * Subscribe to real-time drops feed.
 * @param {Function} onUpdate - called with { live, soon } arrays
 * @returns {Function} unsubscribe
 */
export function subscribeToDropsRealtime(onUpdate) {
  // TODO: Replace with Firestore onSnapshot:
  // const q = query(collection(db, 'drops'), orderBy('dropTime', 'asc'));
  // return onSnapshot(q, snapshot => {
  //   const drops = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  //   onUpdate({
  //     live: drops.filter(d => d.status === 'live'),
  //     soon: drops.filter(d => d.status === 'soon'),
  //   });
  // });

  onUpdate({ live: liveDrops, soon: comingSoonDrops });
  return () => {};
}

/**
 * Set a drop's status to live.
 * In production this is triggered by a Cloud Function on a schedule.
 * @param {string} dropId
 */
export async function setDropLive(dropId) {
  // TODO:
  // await updateDoc(doc(db, 'drops', dropId), {
  //   status: 'live',
  //   wentLiveAt: serverTimestamp(),
  // });
  // Cloud Function then fires push notifications to subscribed users.

  console.log(`[Mock] Drop ${dropId} set to live`);
}
