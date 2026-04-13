import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { logOut, getCurrentUser } from '../services/authService';
import { getSavedCount } from '../services/savedArticlesService';
import { LABELS } from '../data/labels';
import { LABEL_STORAGE_KEY } from './LabelSelectScreen';

const MENU_ITEMS = [
  { id: 'label',         label: 'My Label',              sub: 'Choose your affiliation',     emoji: '🏷️', nav: 'LabelSelect'  },
  { id: 'alerts',        label: 'Drop Alerts',           sub: 'Manage your notifications',   emoji: '🔔', nav: 'DropAlerts'   },
  { id: 'saved',         label: 'Saved Articles',        sub: 'Your bookmarked articles',    emoji: '♡',  nav: 'SavedArticles' },
  { id: 'tip',           label: 'Submit a Tip',          sub: 'Send us a story or sighting', emoji: '📬', nav: 'SubmitTip'    },
  { id: 'followed',      label: 'Followed Artists',      sub: '7 artists',                   emoji: '⭐', nav: null           },
  { id: 'notifications', label: 'Notification Settings', sub: 'Push, email preferences',     emoji: '⚙️', nav: null           },
  { id: 'about',         label: 'About Hip-Hop Drop',    sub: 'Version 1.1.0 · Legal',       emoji: 'ℹ️', nav: 'About'        },
];

export default function ProfileScreen({ navigation }) {
  const user = getCurrentUser();
  const [savedCount,  setSavedCount]  = useState(0);
  const [userLabel,   setUserLabel]   = useState(null);

  useFocusEffect(
    useCallback(() => {
      getSavedCount().then(setSavedCount);
      AsyncStorage.getItem(LABEL_STORAGE_KEY).then(id => {
        if (id) setUserLabel(LABELS.find(l => l.id === id) || null);
        else    setUserLabel(null);
      });
    }, [])
  );

  async function handleLogOut() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: async () => await logOut() },
    ]);
  }

  const displayName = user?.displayName || 'Hip-Hop Fan';
  const email       = user?.email || '';
  const initial     = displayName.charAt(0).toUpperCase();

  // Theme derived from chosen label
  const accent    = userLabel?.accentColor  || colors.accentTeal;
  const heroBg    = userLabel?.headerBg     || colors.surface;
  const labelBg   = userLabel?.bgColor      || colors.background;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: labelBg }]}>
      <StatusBar barStyle="light-content" backgroundColor={labelBg} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Hero header ── */}
        <View style={[styles.heroSection, { backgroundColor: heroBg }]}>

          {/* Label banner at top of hero */}
          {userLabel && (
            <View style={[styles.labelBanner, { borderBottomColor: userLabel.accentColor }]}>
              <View style={[styles.labelLogoPill, { borderColor: userLabel.accentColor }]}>
                <Text style={[styles.labelLogoText, { color: userLabel.accentColor }]}>
                  {userLabel.logo}
                </Text>
              </View>
              <View style={styles.labelBannerInfo}>
                <Text style={[styles.labelBannerName, { color: userLabel.accentColor }]}>
                  {userLabel.name}
                </Text>
                <Text style={styles.labelBannerVibe}>{userLabel.vibe}</Text>
              </View>
              <Text style={styles.labelBannerEmoji}>{userLabel.emoji}</Text>
            </View>
          )}

          {/* Avatar */}
          <View style={[styles.avatar, { borderColor: accent, backgroundColor: heroBg }]}>
            <Text style={[styles.avatarText, { color: accent }]}>{initial}</Text>
          </View>

          <Text style={[styles.displayName, { color: userLabel ? userLabel.accentColor : colors.textPrimary }]}>
            {displayName}
          </Text>
          <Text style={styles.handle}>{email}</Text>

          {/* Stats */}
          <View style={[styles.statsRow, { borderColor: userLabel ? userLabel.accentColor + '40' : colors.border }]}>
            {[
              { value: '7',          label: 'Artists' },
              { value: savedCount,   label: 'Saved'   },
              { value: '3',          label: 'Alerts'  },
            ].map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: accent }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
                {i < arr.length - 1 && (
                  <View style={[styles.statDivider, { backgroundColor: userLabel ? userLabel.accentColor + '30' : colors.border }]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ── No label prompt ── */}
        {!userLabel && (
          <TouchableOpacity
            style={styles.labelPrompt}
            onPress={() => navigation.navigate('LabelSelect')}
            activeOpacity={0.8}
          >
            <Text style={styles.labelPromptEmoji}>🏷️</Text>
            <View style={styles.labelPromptInfo}>
              <Text style={styles.labelPromptTitle}>CLAIM YOUR LABEL</Text>
              <Text style={styles.labelPromptSub}>Show your affiliation on your profile</Text>
            </View>
            <Text style={styles.labelPromptArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* ── Menu ── */}
        <View style={[styles.menuCard, { backgroundColor: colors.surface, marginTop: userLabel ? 20 : 12 }]}>
          {MENU_ITEMS.map((item, index) => {
            // Update label sub-text dynamically
            const sub = item.id === 'label' && userLabel
              ? userLabel.name
              : item.sub;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuRow, index < MENU_ITEMS.length - 1 && styles.menuRowBorder]}
                onPress={() => item.nav && navigation.navigate(item.nav)}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconBox}>
                  <Text style={styles.menuEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={[styles.menuSub, item.id === 'label' && userLabel && { color: userLabel.accentColor }]}>
                    {sub}
                  </Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Log out ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogOut} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1 },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  // Label banner
  labelBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  labelLogoPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 2,
  },
  labelLogoText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  labelBannerInfo:  { flex: 1 },
  labelBannerName: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  labelBannerVibe: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  labelBannerEmoji: { fontSize: 22 },

  // Avatar
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '700' },

  displayName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  handle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.5,
    marginBottom: 20,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 3,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '90%',
  },
  stat:         { flex: 1, alignItems: 'center' },
  statValue:    { fontSize: 20, fontWeight: '700', marginBottom: 2, letterSpacing: 1 },
  statLabel:    { color: colors.textMuted, fontSize: 9, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' },
  statDivider:  { width: 1, height: 30 },

  // Label prompt
  labelPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.accentTeal,
    backgroundColor: 'rgba(224,123,10,0.06)',
    gap: 12,
  },
  labelPromptEmoji: { fontSize: 20 },
  labelPromptInfo:  { flex: 1 },
  labelPromptTitle: {
    color: colors.accentTeal,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 2,
  },
  labelPromptSub:   { color: colors.textMuted, fontSize: 11 },
  labelPromptArrow: { color: colors.textMuted, fontSize: 20 },

  // Menu
  menuCard: {
    marginHorizontal: 16,
    borderRadius: 3,
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
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuEmoji: { fontSize: 18 },
  menuInfo:  { flex: 1 },
  menuLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  menuSub:   { color: colors.textMuted, fontSize: 12, fontWeight: '400' },
  menuArrow: { color: colors.textMuted, fontSize: 20 },

  // Logout
  logoutBtn: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#f87171',
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: '#f87171', fontSize: 15, fontWeight: '500' },
});
