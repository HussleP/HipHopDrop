import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const STORAGE_KEY = 'followed_artists_onboarding';

const ALL_ARTISTS = [
  { id: 'kendrick', name: 'Kendrick Lamar',     genre: 'West Coast'  },
  { id: 'drake',    name: 'Drake',              genre: 'Melodic'     },
  { id: 'jcole',    name: 'J. Cole',            genre: 'Conscious'   },
  { id: 'travis',   name: 'Travis Scott',       genre: 'Trap'        },
  { id: 'future',   name: 'Future',             genre: 'Trap'        },
  { id: 'carti',    name: 'Playboi Carti',      genre: 'Trap'        },
  { id: 'tyler',    name: 'Tyler, the Creator', genre: 'Conscious'   },
  { id: 'gunna',    name: 'Gunna',              genre: 'Trap'        },
  { id: 'lil_baby', name: 'Lil Baby',           genre: 'Trap'        },
  { id: 'nicki',    name: 'Nicki Minaj',        genre: 'East Coast'  },
  { id: 'doja',     name: 'Doja Cat',           genre: 'Melodic'     },
  { id: 'denzel',   name: 'Denzel Curry',       genre: 'Underground' },
];

export default function FollowedArtistsScreen({ navigation }) {
  const [followed, setFollowed] = useState(new Set());

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(STORAGE_KEY).then(raw => {
        if (raw) setFollowed(new Set(JSON.parse(raw)));
        else setFollowed(new Set());
      });
    }, [])
  );

  async function toggleFollow(id) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFollowed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  const followedArtists   = ALL_ARTISTS.filter(a => followed.has(a.id));
  const unfollowedArtists = ALL_ARTISTS.filter(a => !followed.has(a.id));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FOLLOWED ARTISTS</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{followed.size}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Following */}
        {followedArtists.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>FOLLOWING</Text>
            {followedArtists.map(artist => (
              <ArtistRow
                key={artist.id}
                artist={artist}
                isFollowing
                onToggle={() => toggleFollow(artist.id)}
              />
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={36} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No artists followed yet</Text>
            <Text style={styles.emptySub}>Follow artists below to get drop alerts when they release something new.</Text>
          </View>
        )}

        {/* Discover more */}
        {unfollowedArtists.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: 28 }]}>DISCOVER MORE</Text>
            {unfollowedArtists.map(artist => (
              <ArtistRow
                key={artist.id}
                artist={artist}
                isFollowing={false}
                onToggle={() => toggleFollow(artist.id)}
              />
            ))}
          </>
        )}

        {/* Browse in Search */}
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={() => navigation.navigate('Artists')}
          activeOpacity={0.8}
        >
          <Text style={styles.browseBtnText}>BROWSE ALL ARTISTS IN SEARCH</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ArtistRow({ artist, isFollowing, onToggle }) {
  return (
    <View style={styles.artistRow}>
      <View style={styles.artistEmojiBubble}>
        <Text style={styles.artistInitial}>{artist.name[0]}</Text>
      </View>
      <View style={styles.artistInfo}>
        <Text style={styles.artistName}>{artist.name}</Text>
        <Text style={styles.artistGenre}>{artist.genre}</Text>
      </View>
      <TouchableOpacity
        style={[styles.followBtn, isFollowing && styles.followBtnActive]}
        onPress={onToggle}
        activeOpacity={0.75}
      >
        <Text style={[styles.followBtnText, isFollowing && styles.followBtnTextActive]}>
          {isFollowing ? 'FOLLOWING' : '+ FOLLOW'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  backBtn:      { padding: 4 },
  backArrow:    { color: colors.textPrimary, fontSize: 20 },
  headerTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  countBadge: {
    backgroundColor: colors.accentTeal + '22',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countText: {
    color: colors.accentTeal,
    fontSize: 12,
    fontWeight: '700',
  },

  content: { paddingHorizontal: 16, paddingTop: 20 },

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 12,
  },

  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  artistEmojiBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistInitial: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  artistInfo:  { flex: 1 },
  artistName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  artistGenre: {
    color: colors.textMuted,
    fontSize: 11,
  },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  followBtnActive: {
    borderColor: colors.accentTeal,
    backgroundColor: colors.accentTeal + '18',
  },
  followBtnText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  followBtnTextActive: {
    color: colors.accentTeal,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 16,
  },

  browseBtn: {
    marginTop: 28,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accentTeal,
    alignItems: 'center',
    backgroundColor: colors.accentTeal + '0D',
  },
  browseBtnText: {
    color: colors.accentTeal,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
