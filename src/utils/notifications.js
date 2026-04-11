import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('drops', {
      name: 'Merch Drops',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00C4B4',
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

export async function scheduleDropNotification(artist, itemName) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${artist} — ${itemName} is live`,
      body: 'Limited run. Tap to shop before it sells out.',
      sound: true,
      color: '#00C4B4',
    },
    trigger: null, // immediate
  });
}

export async function scheduleDelayedDropNotification(artist, itemName, delaySeconds) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${artist} — ${itemName} is live`,
      body: 'Limited run. Tap to shop before it sells out.',
      sound: true,
      color: '#00C4B4',
    },
    trigger: { seconds: delaySeconds },
  });
}
