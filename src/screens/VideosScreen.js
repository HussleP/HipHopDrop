import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { musicVideos } from '../data/mockData';

const { width } = Dimensions.get('window');
const THUMB_HEIGHT = (width - 32) * (9 / 16); // 16:9 ratio

const FILTERS = ['All', 'New', 'Hot', 'Classics', 'Underground'];

// YouTube thumbnail URL — free, no API key needed
function thumbUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function PlayIcon() {
  return (
    <View style={styles.playIconWrap}>
      <View style={styles.playIconCircle}>
        <Text style={styles.playIconTriangle}>▶</Text>
      </View>
    </View>
  );
}

function FeaturedCard({ video, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.featuredCard}
    >
      <View style={styles.featuredThumbWrap}>
        <Image
          source={{ uri: thumbUrl(video.videoId) }}
          style={styles.featuredThumb}
          resizeMode="cover"
        />
        {/* Scrim */}
        <View style={styles.featuredScrim} />
        <PlayIcon />
        {/* Duration badge */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
        {/* Category badge */}
        <View style={[styles.catBadge, { borderColor: video.accentColor }]}>
          <Text style={[styles.catBadgeText, { color: video.accentColor }]}>
            {video.category.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.featuredInfo}>
        <Text style={styles.featuredTitle} numberOfLines={2}>{video.title}</Text>
        <Text style={[styles.featuredArtist, { color: video.accentColor }]}>{video.artist}</Text>
        <View style={styles.featuredMeta}>
          <Text style={styles.metaText}>{video.views} views</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{video.uploadDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function VideoRow({ video, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.videoRow}
    >
      {/* Thumbnail */}
      <View style={styles.rowThumbWrap}>
        <Image
          source={{ uri: thumbUrl(video.videoId) }}
          style={styles.rowThumb}
          resizeMode="cover"
        />
        <View style={styles.rowDurationBadge}>
          <Text style={styles.rowDurationText}>{video.duration}</Text>
        </View>
        <View style={styles.rowPlayOverlay}>
          <Text style={styles.rowPlayIcon}>▶</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={2}>{video.title}</Text>
        <Text style={[styles.rowArtist, { color: video.accentColor }]}>{video.artist}</Text>
        <View style={styles.rowMeta}>
          <Text style={styles.metaText}>{video.views} views</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{video.uploadDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function VideosScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? musicVideos
    : musicVideos.filter(v => v.category === activeFilter);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  function openVideo(video) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('VideoPlayer', { video });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          MUSIC <Text style={styles.headerAccent}>VIDEOS</Text>
        </Text>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>YOUTUBE</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
          style={styles.filtersRow}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveFilter(f);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured video */}
        {featured && (
          <View style={styles.section}>
            <FeaturedCard video={featured} onPress={() => openVideo(featured)} />
          </View>
        )}

        {/* Divider label */}
        {rest.length > 0 && (
          <View style={styles.sectionLabelRow}>
            <Text style={styles.sectionLabel}>MORE VIDEOS</Text>
            <View style={styles.sectionLine} />
          </View>
        )}

        {/* Video list */}
        {rest.map(video => (
          <VideoRow
            key={video.id}
            video={video}
            onPress={() => openVideo(video)}
          />
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎬</Text>
            <Text style={styles.emptyText}>No videos in this category yet</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 3,
  },
  headerAccent: { color: colors.accentTeal },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E8305A',
  },
  liveText: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // Filters
  filtersRow: { marginBottom: 4 },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 3,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: 'transparent',
    borderColor: colors.accentTeal,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  chipTextActive: {
    color: colors.accentTeal,
    fontWeight: '700',
  },

  scroll: { paddingBottom: 20 },
  section: { paddingHorizontal: 16, marginTop: 12 },

  // Featured card
  featuredCard: {
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featuredThumbWrap: {
    width: '100%',
    height: THUMB_HEIGHT,
    backgroundColor: '#111',
  },
  featuredThumb: {
    width: '100%',
    height: '100%',
  },
  featuredScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  playIconWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconTriangle: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 3,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  catBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  catBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  featuredInfo: {
    padding: 14,
    gap: 4,
  },
  featuredTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  featuredArtist: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },

  // Section label
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  // Video row
  videoRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowThumbWrap: {
    width: 140,
    height: 140 * (9 / 16),
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: '#111',
    flexShrink: 0,
  },
  rowThumb: {
    width: '100%',
    height: '100%',
  },
  rowDurationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  rowDurationText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
  },
  rowPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  rowPlayIcon: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
  },
  rowInfo: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  rowTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  rowArtist: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },

  // Shared meta
  metaText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '400',
  },
  metaDot: { color: colors.textMuted, fontSize: 10 },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyEmoji: { fontSize: 36 },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '400',
  },
});
