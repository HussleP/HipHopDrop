import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { getCurrentUser } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';

const VERSION      = '1.1.0';
const BUILD        = '2';
const SUPPORT_EMAIL = 'support@hiphop-drop.app';
const PRIVACY_URL   = 'https://hiphop-drop.app/privacy';
const TERMS_URL     = 'https://hiphop-drop.app/terms';

export default function AboutScreen({ navigation }) {
  const [deleting, setDeleting] = useState(false);
  const user = getCurrentUser();

  function handleEmail() {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Hip-Hop Drop Support`);
  }

  function confirmDeleteAccount() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account, comments, reactions, and all personal data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete My Account', style: 'destructive', onPress: deleteAccount },
      ]
    );
  }

  async function deleteAccount() {
    if (!user) return;
    setDeleting(true);
    try {
      const batch = writeBatch(db);

      // Delete user Firestore document
      batch.delete(doc(db, 'users', user.uid));

      // Delete user's comments (best-effort)
      try {
        const commentsSnap = await getDocs(collection(db, 'users', user.uid, 'comments'));
        commentsSnap.forEach(d => batch.delete(d.ref));
      } catch { /* non-fatal */ }

      await batch.commit();

      // Clear all local storage
      await AsyncStorage.clear();

      // Delete Firebase Auth account
      await deleteUser(auth.currentUser);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Auth state change will redirect to AuthScreen automatically
    } catch (err) {
      setDeleting(false);
      if (err.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Re-authentication Required',
          'For security, please log out and log back in before deleting your account.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Could not delete account. Please try again or contact support.');
      }
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} activeOpacity={0.7}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ABOUT</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* App identity */}
        <View style={styles.appCard}>
          <Text style={styles.appName}>HIP-HOP</Text>
          <Text style={styles.appNameAccent}>DROP</Text>
          <View style={styles.appLine} />
          <Text style={styles.appTagline}>THE PULSE OF HIP-HOP</Text>
          <View style={styles.versionRow}>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>v{VERSION} · BUILD {BUILD}</Text>
            </View>
          </View>
        </View>

        {/* Legal */}
        <Text style={styles.groupLabel}>LEGAL</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={[styles.menuRow, styles.menuRowBorder]}
            onPress={() => navigation.navigate('PrivacyPolicy')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuEmoji}>🔒</Text>
            <Text style={styles.menuLabel}>Privacy Policy</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Terms')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuEmoji}>📋</Text>
            <Text style={styles.menuLabel}>Terms of Service</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support */}
        <Text style={styles.groupLabel}>SUPPORT</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={handleEmail}
            activeOpacity={0.7}
          >
            <Text style={styles.menuEmoji}>✉️</Text>
            <Text style={styles.menuLabel}>Contact Support</Text>
            <Text style={styles.menuSub}>{SUPPORT_EMAIL}</Text>
          </TouchableOpacity>
        </View>

        {/* Powered by */}
        <Text style={styles.groupLabel}>POWERED BY</Text>
        <View style={styles.poweredCard}>
          {[
            ['🔴', 'YouTube Data API',  'Music video content'],
            ['🔥', 'Firebase',          'Auth, database & notifications'],
            ['⚡', 'Expo',             'App framework & OTA updates'],
          ].map(([icon, name, sub]) => (
            <View key={name} style={styles.poweredRow}>
              <Text style={styles.poweredIcon}>{icon}</Text>
              <View style={styles.poweredInfo}>
                <Text style={styles.poweredName}>{name}</Text>
                <Text style={styles.poweredSub}>{sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Danger zone */}
        <Text style={styles.groupLabel}>ACCOUNT</Text>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={confirmDeleteAccount}
          disabled={deleting}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteBtnText}>
            {deleting ? 'DELETING...' : 'DELETE MY ACCOUNT'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.deleteWarning}>
          Permanently deletes your account, comments, and all personal data.
          This cannot be undone.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back:        { width: 40, height: 40, justifyContent: 'center' },
  backText:    { color: colors.textPrimary, fontSize: 20 },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
  },
  scroll:        { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 20 },

  // App identity card
  appCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 28,
    backgroundColor: colors.surface,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appName: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 6,
    lineHeight: 32,
  },
  appNameAccent: {
    color: colors.accentTeal,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 6,
    lineHeight: 32,
  },
  appLine: {
    width: 32,
    height: 2,
    backgroundColor: colors.accentTeal,
    marginTop: 10,
    marginBottom: 10,
  },
  appTagline: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 16,
  },
  versionRow:  { alignItems: 'center' },
  versionBadge: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  versionText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
  },

  // Section labels
  groupLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
    marginTop: 4,
  },

  // Menu card
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 24,
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
  menuEmoji: { fontSize: 18, width: 26 },
  menuLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  menuSub: {
    color: colors.textMuted,
    fontSize: 11,
  },
  menuArrow: { color: colors.textMuted, fontSize: 20 },

  // Powered by
  poweredCard: {
    backgroundColor: colors.surface,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 14,
    marginBottom: 24,
  },
  poweredRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  poweredIcon: { fontSize: 18, width: 26, textAlign: 'center' },
  poweredInfo: { flex: 1 },
  poweredName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  poweredSub: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '400',
  },

  // Delete account
  deleteBtn: {
    borderWidth: 1,
    borderColor: colors.neonPink,
    borderRadius: 3,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteBtnText: {
    color: colors.neonPink,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  deleteWarning: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 8,
  },
});
