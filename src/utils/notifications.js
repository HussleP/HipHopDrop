import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions and return whether granted.
 */
export async function requestNotificationPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('drops', {
      name: 'Merch Drops',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E07B0A',
    });
    await Notifications.setNotificationChannelAsync('polls', {
      name: 'Fan Polls',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#E07B0A',
    });
    await Notifications.setNotificationChannelAsync('news', {
      name: 'Breaking News',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#E07B0A',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Get the Expo push token for this device and save it to Firestore
 * under users/{uid}/pushToken so Cloud Functions can target this device.
 *
 * @param {string} uid - Firebase Auth user ID
 * @returns {string|null} the push token, or null if unavailable
 */
export async function registerPushToken(uid) {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return null;

    // projectId from app.json extra (needed for standalone builds)
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const token = tokenData.data;

    // Save to Firestore so the server can reach this device
    await setDoc(
      doc(db, 'users', uid),
      {
        pushToken: token,
        pushTokenUpdatedAt: serverTimestamp(),
        platform: Platform.OS,
      },
      { merge: true }
    );

    console.log('[PushToken] Registered:', token);
    return token;
  } catch (err) {
    // Expo Go on a simulator won't have a real token — that's fine
    console.warn('[PushToken] Could not register:', err.message);
    return null;
  }
}

/**
 * Schedule an immediate local notification.
 */
export async function scheduleDropNotification(artist, itemName) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${artist} — ${itemName} is live`,
      body: 'Limited run. Tap to shop before it sells out.',
      sound: true,
      data: { type: 'drop' },
    },
    trigger: null,
  });
}

/**
 * Schedule a delayed local notification (used for demo on launch).
 */
export async function scheduleDelayedDropNotification(artist, itemName, delaySeconds) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${artist} — ${itemName} is live`,
      body: 'Limited run. Tap to shop before it sells out.',
      sound: true,
      data: { type: 'drop' },
    },
    trigger: { seconds: delaySeconds },
  });
}
