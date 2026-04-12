import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { onAuthChange } from './src/services/authService';
import { requestNotificationPermissions, scheduleDelayedDropNotification } from './src/utils/notifications';
import { demoNotificationDrop } from './src/data/mockData';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';
import { colors } from './src/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => setUser(u));
    initNotifications();
    return unsubscribe;
  }, []);

  async function initNotifications() {
    const granted = await requestNotificationPermissions();
    if (!granted) return;
    try {
      const catRaw = await AsyncStorage.getItem('dropAlerts_categories');
      const artRaw = await AsyncStorage.getItem('dropAlerts_artists');
      const isFirstLaunch = catRaw === null && artRaw === null;
      const categoryToggles = catRaw ? JSON.parse(catRaw) : {};
      const artistToggles = artRaw ? JSON.parse(artRaw) : {};
      const categoryEnabled = categoryToggles[demoNotificationDrop.category];
      const artistEnabled = artistToggles[demoNotificationDrop.artist];
      if (isFirstLaunch || (categoryEnabled && artistEnabled)) {
        await scheduleDelayedDropNotification(
          demoNotificationDrop.artist,
          demoNotificationDrop.itemName,
          30
        );
      }
    } catch (_) {}
  }

  // Still checking auth state
  if (user === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accentTeal} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      {user ? <AppNavigator user={user} /> : <AuthScreen />}
    </>
  );
}
