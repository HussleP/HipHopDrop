import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { logOut, getCurrentUser } from '../services/authService';
import { getSavedCount } from '../services/savedArticlesService';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const MENU_ITEMS = [
  { id: 'alerts', label: 'Drop Alerts', sub: 'Manage your notifications', emoji: '🔔', nav: 'DropAlerts' },
  { id: 'saved', label: 'Saved Articles', sub: 'Your bookmarked articles', emoji: '♡', nav: 'SavedArticles' },
  { id: 'followed', label: 'Followed Artists', sub: '7 artists', emoji: '⭐', nav: null },
  { id: 'notifications', label: 'Notification Settings', sub: 'Push, email preferences', emoji: '⚙️', nav: null },
  { id: 'about', label: 'About Hip-Hop Drop', sub: 'Version 1.0.0', emoji: 'ℹ️', nav: null },
];

export default function ProfileScreen({ navigation }) {
  const user = getCurrentUser();
  const [savedCount, setSavedCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getSavedCount().then(setSavedCount);
    }, [])
  );

  async function handleLogOut() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: async () => await logOut() },
    ]);
  }

  const displayName = user?.displayName || 'Hip-Hop Fan';
  const email = user?.email || '';
  const initial = displayName.charAt(0).toUpperCase();
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.handle}>{email}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Artists</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{savedCount}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Alerts</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuRow,
                index < MENU_ITEMS.length - 1 && styles.menuRowBorder,
              ]}
              onPress={() => item.nav && navigation.navigate(item.nav)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconBox}>
                <Text style={styles.menuEmoji}>{item.emoji}</Text>
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Log out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogOut} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentTeal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#000',
    fontSize: 32,
    fontWeight: '500',
  },
  displayName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 4,
  },
  handle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 0,
    width: '100%',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 2,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '400',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuEmoji: {
    fontSize: 18,
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  menuSub: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '400',
  },
  menuArrow: {
    color: colors.textMuted,
    fontSize: 20,
  },
  logoutBtn: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f87171',
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#f87171',
    fontSize: 15,
    fontWeight: '500',
  },
});
