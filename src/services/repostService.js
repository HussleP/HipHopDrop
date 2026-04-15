/**
 * repostService.js
 * Saves/removes/fetches user reposts via AsyncStorage.
 * Each repost stores enough data to render a preview card on the profile.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const REPOSTS_KEY = 'user_reposts_v1';

/** Load all reposts, newest first */
export async function getReposts() {
  try {
    const raw = await AsyncStorage.getItem(REPOSTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Check if an item is already reposted */
export async function isReposted(id) {
  const reposts = await getReposts();
  return reposts.some(r => r.id === id);
}

/**
 * Add a repost. item shape:
 *   { id, type: 'article'|'video'|'poll', title, subtitle, imageUrl, imageColor, accentColor, timestamp }
 */
export async function addRepost(item) {
  const reposts = await getReposts();
  if (reposts.some(r => r.id === item.id)) return; // already reposted
  const updated = [{ ...item, repostedAt: Date.now() }, ...reposts];
  await AsyncStorage.setItem(REPOSTS_KEY, JSON.stringify(updated));
}

/** Remove a repost by id */
export async function removeRepost(id) {
  const reposts = await getReposts();
  const updated = reposts.filter(r => r.id !== id);
  await AsyncStorage.setItem(REPOSTS_KEY, JSON.stringify(updated));
}

/** Toggle repost — returns true if now reposted, false if removed */
export async function toggleRepost(item) {
  const already = await isReposted(item.id);
  if (already) {
    await removeRepost(item.id);
    return false;
  } else {
    await addRepost(item);
    return true;
  }
}
