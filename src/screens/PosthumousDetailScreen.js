import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

function daysLabel(album) {
  const d = album.daysAfterDeath;
  if (d < 0) {
    // Released before death (Nipsey, Dilla)
    return {
      text: `Released ${Math.abs(d)} days before death`,
      sub: `${album.releaseDate}`,
      color: colors.neon,
    };
  }
  return {
    text: `Released ${d} days after death`,
    sub: `${album.releaseDate}`,
    color: colors.accentTeal,
  };
}

export default function PosthumousDetailScreen({ route, navigation }) {
  const { album } = route.params;
  const [tracksExpanded, setTracksExpanded] = useState(false);
  const timing = daysLabel(album);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: album.colorBg }]}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.heroInner}>
            {/* Cover art placeholder */}
            <View style={[styles.coverArt, { borderColor: album.accentColor }]}>
              <Text style={styles.coverEmoji}>{album.coverEmoji}</Text>
            </View>

            {/* Badge */}
            <View style={[styles.legacyBadge, { borderColor: album.accentColor }]}>
              <Text style={[styles.legacyBadgeText, { color: album.accentColor }]}>
                LEGACY VAULT
              </Text>
            </View>

            <Text style={styles.albumTitle}>{album.albumTitle}</Text>
            <Text style={[styles.artistName, { color: album.accentColor }]}>{album.artist}</Text>
            <Text style={styles.tagline}>{album.tagline}</Text>
          </View>
        </View>

        {/* Timeline bar */}
        <View style={[styles.timelineBar, { borderLeftColor: timing.color }]}>
          <Text style={[styles.timelineMain, { color: timing.color }]}>{timing.text}</Text>
          <Text style={styles.timelineSub}>
            Died: {album.deathDate}  ·  Released: {album.releaseDate}  ·  {album.label}
          </Text>
        </View>

        <View style={styles.content}>

          {/* Short description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.shortDesc}>{album.shortDesc}</Text>
          </View>

          {/* Divider */}
          <View style={[styles.accentDivider, { backgroundColor: album.accentColor }]} />

          {/* Full origin story */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>The Story Behind It</Text>
            {album.origin.map((paragraph, i) => (
              <Text key={i} style={styles.bodyText}>{paragraph}</Text>
            ))}
          </View>

          {/* Tracklist */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.tracklistHeader}
              onPress={() => {
                Haptics.selectionAsync();
                setTracksExpanded(v => !v);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>Tracklist</Text>
              <Text style={[styles.tracklistToggle, { color: album.accentColor }]}>
                {tracksExpanded ? 'Hide' : 'Show all'}
              </Text>
            </TouchableOpacity>
            {(tracksExpanded ? album.tracks : album.tracks.slice(0, 5)).map((track, i) => (
              <View key={i} style={styles.trackRow}>
                <Text style={[styles.trackNum, { color: album.accentColor }]}>
                  {String(i + 1).padStart(2, '0')}
                </Text>
                <Text style={styles.trackName}>{track}</Text>
              </View>
            ))}
            {!tracksExpanded && album.tracks.length > 5 && (
              <Text style={styles.trackMore}>
                + {album.tracks.length - 5} more tracks
              </Text>
            )}
          </View>

          {/* Legacy */}
          <View style={[styles.legacyCard, { borderColor: album.accentColor, backgroundColor: album.colorBg }]}>
            <Text style={[styles.legacyTitle, { color: album.accentColor }]}>LEGACY</Text>
            <Text style={styles.legacyText}>{album.legacy}</Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 60 },

  // Hero
  hero: {
    minHeight: 340,
    padding: 20,
    paddingBottom: 32,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backArrow: { color: colors.textPrimary, fontSize: 20, lineHeight: 22 },
  heroInner: { alignItems: 'center', marginTop: 16 },
  coverArt: {
    width: 130,
    height: 130,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  coverEmoji: { fontSize: 56 },
  legacyBadge: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  legacyBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },
  albumTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 6,
    lineHeight: 30,
  },
  artistName: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  tagline: {
    color: 'rgba(237,232,223,0.6)',
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
    paddingHorizontal: 10,
  },

  // Timeline
  timelineBar: {
    borderLeftWidth: 3,
    marginHorizontal: 16,
    marginTop: 20,
    paddingLeft: 14,
    paddingVertical: 8,
  },
  timelineMain: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timelineSub: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '400',
  },

  // Content
  content: { padding: 16 },
  section: { marginBottom: 28 },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  shortDesc: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 24,
    opacity: 0.85,
  },
  accentDivider: {
    height: 1,
    width: 40,
    marginBottom: 28,
    opacity: 0.6,
  },
  bodyText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 24,
    marginBottom: 16,
    opacity: 0.8,
  },

  // Tracklist
  tracklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tracklistToggle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 14,
  },
  trackNum: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    width: 24,
  },
  trackName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '400',
    flex: 1,
  },
  trackMore: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '400',
    marginTop: 8,
    textAlign: 'center',
  },

  // Legacy card
  legacyCard: {
    borderWidth: 1,
    borderRadius: 3,
    padding: 16,
    gap: 10,
  },
  legacyTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2.5,
  },
  legacyText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    opacity: 0.85,
  },
});
