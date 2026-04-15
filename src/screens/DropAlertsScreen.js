import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const CATEGORIES = [
  {
    id: 'tees',
    label: 'Tees & Hoodies',
    description: 'T-shirts, hoodies, crewnecks',
    icon: 'shirt-outline',
    color: colors.amber,
  },
  {
    id: 'vinyl',
    label: 'Vinyl & CDs',
    description: 'Records, CDs, cassettes',
    icon: 'disc-outline',
    color: colors.purple,
  },
  {
    id: 'hats',
    label: 'Hats & Accessories',
    description: 'Caps, beanies, bags',
    icon: 'glasses-outline',
    color: colors.teal,
  },
  {
    id: 'posters',
    label: 'Posters & Art Prints',
    description: 'Signed & unsigned prints',
    icon: 'image-outline',
    color: colors.coral,
  },
  {
    id: 'boxsets',
    label: 'Limited Box Sets',
    description: 'Collector bundles & exclusives',
    icon: 'cube-outline',
    color: colors.accentTeal,
  },
];

const ARTISTS = [
  'Travis Scott',
  'Kendrick Lamar',
  'Drake',
  'Tyler, the Creator',
  'A$AP Rocky',
  'J. Cole',
  'Kanye West',
];

const STORAGE_KEY_CATEGORIES = 'dropAlerts_categories';
const STORAGE_KEY_ARTISTS = 'dropAlerts_artists';

export default function DropAlertsScreen({ navigation }) {
  const [categoryToggles, setCategoryToggles] = useState({});
  const [artistToggles, setArtistToggles] = useState({});

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      const catRaw = await AsyncStorage.getItem(STORAGE_KEY_CATEGORIES);
      const artRaw = await AsyncStorage.getItem(STORAGE_KEY_ARTISTS);
      if (catRaw) setCategoryToggles(JSON.parse(catRaw));
      if (artRaw) setArtistToggles(JSON.parse(artRaw));
    } catch (_) {}
  }

  async function toggleCategory(id) {
    const updated = { ...categoryToggles, [id]: !categoryToggles[id] };
    setCategoryToggles(updated);
    await AsyncStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
  }

  async function toggleArtist(name) {
    const updated = { ...artistToggles, [name]: !artistToggles[name] };
    setArtistToggles(updated);
    await AsyncStorage.setItem(STORAGE_KEY_ARTISTS, JSON.stringify(updated));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Drop Alerts</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category toggles */}
        <Text style={styles.sectionTitle}>By Category</Text>
        <View style={styles.card}>
          {CATEGORIES.map((cat, index) => (
            <View
              key={cat.id}
              style={[
                styles.toggleRow,
                index < CATEGORIES.length - 1 && styles.toggleRowBorder,
              ]}
            >
              <View style={[styles.iconCircle, { backgroundColor: cat.color + '22' }]}>
                <Ionicons name={cat.icon} size={20} color={cat.color} />
              </View>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>{cat.label}</Text>
                <Text style={styles.toggleDescription}>{cat.description}</Text>
              </View>
              <Switch
                value={!!categoryToggles[cat.id]}
                onValueChange={() => toggleCategory(cat.id)}
                trackColor={{ false: colors.border, true: colors.accentTeal + '66' }}
                thumbColor={categoryToggles[cat.id] ? colors.accentTeal : '#555'}
              />
            </View>
          ))}
        </View>

        {/* Artist toggles */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>My Artists</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.artistsRow}
        >
          {ARTISTS.map((artist) => (
            <TouchableOpacity
              key={artist}
              onPress={() => toggleArtist(artist)}
              style={[
                styles.artistPill,
                artistToggles[artist] && styles.artistPillActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.artistPillText,
                  artistToggles[artist] && styles.artistPillTextActive,
                ]}
              >
                {artist}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addPill} activeOpacity={0.7}>
            <Text style={styles.addPillText}>+ Add</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Notification preview */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Preview</Text>
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewApp}>Hip-Hop Drop</Text>
            <Text style={styles.previewTime}>now</Text>
          </View>
          <Text style={styles.previewTitle}>Travis Scott — Utopia Flame Tee is live</Text>
          <Text style={styles.previewBody}>Limited run. Tap to shop before it sells out.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  backArrow: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 22,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  toggleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  toggleDescription: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '400',
  },
  artistsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  artistPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  artistPillActive: {
    backgroundColor: colors.accentTeal,
    borderColor: colors.accentTeal,
  },
  artistPillText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  artistPillTextActive: {
    color: '#000',
  },
  addPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addPillText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  previewCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 4,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  previewApp: {
    color: colors.accentTeal,
    fontSize: 12,
    fontWeight: '500',
  },
  previewTime: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '400',
  },
  previewTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  previewBody: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
});
