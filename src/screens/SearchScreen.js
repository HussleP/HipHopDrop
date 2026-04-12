import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { trendingSearches } from '../data/mockData';
import { searchSpotify, findArtist } from '../services/spotifyService';

const CATEGORIES = [
  { id: 'drops', label: 'Drops', emoji: '👟', color: colors.amber, bg: '#2a1e0a' },
  { id: 'tours', label: 'Tours', emoji: '🎤', color: colors.purple, bg: '#1a0a2a' },
  { id: 'interviews', label: 'Interviews', emoji: '🎙️', color: colors.teal, bg: '#0a1e1e' },
  { id: 'charts', label: 'Charts', emoji: '📊', color: colors.coral, bg: '#2a0e0e' },
];

const HIP_HOP_ARTISTS = [
  'Kendrick Lamar',
  'Drake',
  'Travis Scott',
  'Tyler, the Creator',
];

function formatFollowers(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M followers`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K followers`;
  return `${n} followers`;
}

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [trendingArtists, setTrendingArtists] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    loadTrendingArtists();
  }, []);

  async function loadTrendingArtists() {
    setLoadingTrending(true);
    try {
      const results = await Promise.all(HIP_HOP_ARTISTS.map(name => findArtist(name)));
      setTrendingArtists(results.filter(Boolean));
    } catch {
      setTrendingArtists([]);
    } finally {
      setLoadingTrending(false);
    }
  }

  useEffect(() => {
    if (!query.trim()) { setSearchResults(null); return; }
    const timeout = setTimeout(() => handleSearch(query), 500);
    return () => clearTimeout(timeout);
  }, [query]);

  async function handleSearch(q) {
    setSearching(true);
    try {
      const results = await searchSpotify(q);
      setSearchResults(results);
    } catch {
      setSearchResults(null);
    } finally {
      setSearching(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Artists, albums, news..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            selectionColor={colors.accentTeal}
          />
          {searching && <ActivityIndicator size="small" color={colors.accentTeal} />}
          {!searching && query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search results */}
        {searchResults && (
          <View style={styles.section}>
            {searchResults.artists.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Artists</Text>
                {searchResults.artists.map(artist => (
                  <TouchableOpacity
                    key={artist.id}
                    style={styles.resultRow}
                    onPress={() => navigation.navigate('ArtistProfile', { artist })}
                    activeOpacity={0.7}
                  >
                    {artist.imageUrl
                      ? <Image source={{ uri: artist.imageUrl }} style={styles.artistThumb} />
                      : <View style={[styles.artistThumb, { backgroundColor: colors.surface }]} />}
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{artist.name}</Text>
                      <Text style={styles.resultSub}>{formatFollowers(artist.followers)}</Text>
                    </View>
                    <Text style={{ color: colors.textMuted, fontSize: 20 }}>›</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {searchResults.albums.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Albums</Text>
                {searchResults.albums.map(album => (
                  <View key={album.id} style={styles.resultRow}>
                    {album.imageUrl
                      ? <Image source={{ uri: album.imageUrl }} style={styles.albumThumb} />
                      : <View style={[styles.albumThumb, { backgroundColor: colors.surface }]} />}
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{album.name}</Text>
                      <Text style={styles.resultSub}>{album.artist} · {album.releaseDate?.slice(0, 4)}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {searchResults.tracks.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Tracks</Text>
                {searchResults.tracks.map(track => (
                  <View key={track.id} style={styles.resultRow}>
                    {track.imageUrl
                      ? <Image source={{ uri: track.imageUrl }} style={styles.albumThumb} />
                      : <View style={[styles.albumThumb, { backgroundColor: colors.surface }]} />}
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{track.name}</Text>
                      <Text style={styles.resultSub}>{track.artist} · {track.album}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {!searchResults.artists.length && !searchResults.albums.length && !searchResults.tracks.length && (
              <Text style={styles.noResults}>No results found for "{query}"</Text>
            )}
          </View>
        )}

        {/* Default — trending + categories */}
        {!searchResults && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending Now</Text>
              {loadingTrending ? (
                <ActivityIndicator color={colors.accentTeal} style={{ marginTop: 20 }} />
              ) : trendingArtists.length > 0 ? (
                trendingArtists.map((artist, index) => (
                  <TouchableOpacity
                    key={artist.id}
                    style={styles.trendingRow}
                    onPress={() => navigation.navigate('ArtistProfile', { artist })}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.trendingRank}>{index + 1}</Text>
                    {artist.imageUrl
                      ? <Image source={{ uri: artist.imageUrl }} style={styles.trendingThumb} />
                      : <View style={[styles.trendingThumb, { backgroundColor: colors.surface }]} />}
                    <View style={styles.trendingInfo}>
                      <Text style={styles.trendingName}>{artist.name}</Text>
                      <Text style={styles.trendingCount}>{formatFollowers(artist.followers)}</Text>
                    </View>
                    <Text style={styles.trendingArrow}>›</Text>
                  </TouchableOpacity>
                ))
              ) : (
                trendingSearches.map(item => (
                  <View key={item.id} style={styles.trendingRow}>
                    <Text style={styles.trendingRank}>{item.rank}</Text>
                    <View style={[styles.trendingThumb, { backgroundColor: item.imageColor }]} />
                    <View style={styles.trendingInfo}>
                      <Text style={styles.trendingName}>{item.artist}</Text>
                      <Text style={styles.trendingCount}>{item.articleCount} articles</Text>
                    </View>
                    <Text style={styles.trendingArrow}>›</Text>
                  </View>
                ))
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse by Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryCard, { backgroundColor: cat.bg }]}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomColor: colors.accentTeal,
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 24,
    marginTop: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '400',
    padding: 0,
  },
  clearIcon: { color: colors.textMuted, fontSize: 14, padding: 2 },
  section: { marginBottom: 28 },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  artistThumb: { width: 44, height: 44, borderRadius: 22 },
  albumThumb: { width: 44, height: 44, borderRadius: 6 },
  resultInfo: { flex: 1 },
  resultName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  resultSub: { color: colors.textMuted, fontSize: 12, fontWeight: '400' },
  noResults: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  trendingRank: {
    color: colors.accentTeal,
    fontSize: 16,
    fontWeight: '500',
    width: 20,
    textAlign: 'center',
  },
  trendingThumb: { width: 44, height: 44, borderRadius: 22 },
  trendingInfo: { flex: 1 },
  trendingName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  trendingCount: { color: colors.textMuted, fontSize: 12, fontWeight: '400' },
  trendingArrow: { color: colors.textMuted, fontSize: 20 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: {
    width: '47.5%',
    aspectRatio: 1.6,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  categoryEmoji: { fontSize: 28 },
  categoryLabel: { fontSize: 15, fontWeight: '500' },
});
