import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const STORAGE_KEY = 'notification_settings';

const DEFAULTS = {
  pushNewDrops:        true,
  pushFollowedArtists: true,
  pushBreakingNews:    true,
  pushNewVideos:       false,
  pushPolls:           false,
  emailWeeklyDigest:   false,
  emailDropAlerts:     false,
};

const SECTIONS = [
  {
    title: 'PUSH NOTIFICATIONS',
    items: [
      { key: 'pushNewDrops',        label: 'New Drops',             sub: 'Merch drops, albums, singles'         },
      { key: 'pushFollowedArtists', label: 'Followed Artists',      sub: 'Activity from artists you follow'    },
      { key: 'pushBreakingNews',    label: 'Breaking News',         sub: 'Major stories as they happen'         },
      { key: 'pushNewVideos',       label: 'New Music Videos',      sub: 'Fresh visuals added to the app'      },
      { key: 'pushPolls',           label: 'Polls & Votes',         sub: 'New beef polls and voting rounds'    },
    ],
  },
  {
    title: 'EMAIL',
    items: [
      { key: 'emailWeeklyDigest', label: 'Weekly Digest',   sub: 'Top stories every Monday morning' },
      { key: 'emailDropAlerts',   label: 'Drop Alerts',     sub: 'Email when a followed artist drops' },
    ],
  },
];

export default function NotificationSettingsScreen({ navigation }) {
  const [settings, setSettings] = useState(DEFAULTS);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(STORAGE_KEY).then(raw => {
        if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
      });
    }, [])
  );

  async function toggle(key) {
    Haptics.selectionAsync();
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  async function disableAll() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const all = Object.fromEntries(Object.keys(DEFAULTS).map(k => [k, false]));
    setSettings(all);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  const anyEnabled = Object.values(settings).some(Boolean);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NOTIFICATION SETTINGS</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <View
                  key={item.key}
                  style={[
                    styles.settingRow,
                    index < section.items.length - 1 && styles.settingRowBorder,
                  ]}
                >
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    <Text style={styles.settingSub}>{item.sub}</Text>
                  </View>
                  <Switch
                    value={settings[item.key]}
                    onValueChange={() => toggle(item.key)}
                    trackColor={{ false: colors.border, true: colors.accentTeal + '80' }}
                    thumbColor={settings[item.key] ? colors.accentTeal : colors.textMuted}
                    ios_backgroundColor={colors.border}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        {anyEnabled && (
          <TouchableOpacity style={styles.disableAllBtn} onPress={disableAll} activeOpacity={0.75}>
            <Text style={styles.disableAllText}>Disable All Notifications</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerNote}>
          Push notifications require device permissions. You can manage them in your phone's Settings app.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  backBtn:     { padding: 4 },
  backArrow:   { color: colors.textPrimary, fontSize: 20 },
  headerTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },

  content: { paddingHorizontal: 16, paddingTop: 24 },

  section:      { marginBottom: 24 },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo:  { flex: 1 },
  settingLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSub: {
    color: colors.textMuted,
    fontSize: 12,
  },

  disableAllBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f87171',
    alignItems: 'center',
    marginBottom: 20,
  },
  disableAllText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '500',
  },

  footerNote: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
});
