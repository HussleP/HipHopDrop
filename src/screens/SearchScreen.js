import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Image, ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { searchSpotify, findArtist } from '../services/spotifyService';

// ── Categories — each has a Spotify search term or a curated artist list ────
const CATEGORIES = [
  {
    id: 'discover',
    label: 'Discover',
    icon: 'compass-outline',
    color: '#4ade80',
    bg: '#071a0e',
    description: 'Slept-on legends & rising names',
    mode: 'curated',
    artists: [
      'Ab-Soul', 'Thundercat', 'Anderson .Paak', 'Denzel Curry',
      'JID', 'Freddie Gibbs', 'billy woods', 'JPEGMafia',
      'Armand Hammer', 'Westside Gunn', 'Conway the Machine',
      'Boldy James', 'Mach-Hommy', 'Vince Staples', 'Injury Reserve',
      'Serengeti', 'Open Mike Eagle', 'Quelle Chris', 'Deca',
      'Mavi', 'Saba', 'Smino', 'Pivot Gang', 'Navy Blue',
    ],
  },
  {
    id: 'ug_ogs',
    label: 'UG OGs',
    icon: 'skull-outline',
    color: '#a855f7',
    bg: '#0d0518',
    description: 'Chief Keef, Yung Lean, Lil Peep era',
    mode: 'curated',
    badge: 'ARCHITECT',
    artists: [
      'Chief Keef', 'Lil B', 'Xavier Wulf', 'Bones', 'Chris Travis',
      'Lil Peep', 'Juice WRLD', 'Yung Lean', 'Lil Ugly Mane',
      'Spaceghostpurrp', 'Denzel Curry', 'Night Lovell', 'Eddy Baker',
      'Pouya', 'Fat Nick', 'Horse Head', 'Wicca Phase Springs Eternal',
      'Cold Hart', 'glaive', 'Rxseboy', 'Crypt', 'Nothing Nowhere',
    ],
  },
  {
    id: 'new_releases',
    label: 'New Drops',
    icon: 'flash-outline',
    color: '#E07B0A',
    bg: '#1a0e03',
    description: 'Fresh albums & singles',
    mode: 'search',
    query: 'new hip hop rap album 2025',
  },
  {
    id: 'west_coast',
    label: 'West Coast',
    icon: 'partly-sunny-outline',
    color: '#00C4D4',
    bg: '#031a1a',
    description: 'LA, Compton, Oakland & beyond',
    mode: 'search',
    query: 'west coast rap Los Angeles hip hop',
  },
  {
    id: 'east_coast',
    label: 'East Coast',
    icon: 'business-outline',
    color: '#a855f7',
    bg: '#0d0518',
    description: 'NYC, Bronx, Brooklyn, Queens',
    mode: 'search',
    query: 'new york rap east coast hip hop NYC',
  },
  {
    id: 'uk_drill',
    label: 'UK & Ireland',
    icon: 'globe-outline',
    color: '#E8305A',
    bg: '#180508',
    description: 'UK drill, grime, Irish rap',
    mode: 'search',
    query: 'UK drill grime London rap Kneecap',
  },
  {
    id: 'producers',
    label: 'Producers',
    icon: 'musical-notes-outline',
    color: '#D4AF37',
    bg: '#1a1503',
    description: 'Alchemist, Madlib, Metro Boomin',
    mode: 'search',
    query: 'Alchemist Madlib Metro Boomin producer hip hop',
  },
  {
    id: 'classics',
    label: 'Classics',
    icon: 'time-outline',
    color: '#C9A45A',
    bg: '#120e05',
    description: '90s & 2000s essential hip hop',
    mode: 'search',
    query: 'classic 90s hip hop rap album Nas Jay-Z Biggie',
  },
  {
    id: 'trap',
    label: 'Trap',
    icon: 'pulse-outline',
    color: '#FF3B30',
    bg: '#180303',
    description: 'ATL, Houston & trap bangers',
    mode: 'search',
    query: 'trap rap Atlanta Young Thug Future Gunna',
  },
  {
    id: 'charts',
    label: 'Charts',
    icon: 'bar-chart-outline',
    color: '#D4AF37',
    bg: '#1a1503',
    description: 'Power rankings, buzz & scene trends',
    mode: 'navigate',
  },
];

// ── Trending artists shown on the default view ───────────────────────────────
const TRENDING_NAMES = [
  'Kendrick Lamar', 'Drake', 'Travis Scott',
  'Tyler, the Creator', 'Future', 'Playboi Carti',
];

function formatFollowers(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M followers`;
  if (n >= 1000)    return `${Math.round(n / 1000)}K followers`;
  return `${n} followers`;
}

export default function SearchScreen({ navigation }) {
  const [query,           setQuery]           = useState('');
  const [searchResults,   setSearchResults]   = useState(null);
  const [searching,       setSearching]       = useState(false);
  const [trendingArtists, setTrendingArtists] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [activeCategory,  setActiveCategory]  = useState(null); // category object
  const [catResults,      setCatResults]      = useState([]);
  const [loadingCat,      setLoadingCat]      = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => { loadTrendingArtists(); }, []);

  async function loadTrendingArtists() {
    setLoadingTrending(true);
    try {
      const results = await Promise.all(TRENDING_NAMES.map(n => findArtist(n)));
      setTrendingArtists(results.filter(Boolean));
    } catch {
      setTrendingArtists([]);
    } finally {
      setLoadingTrending(false);
    }
  }

  // Debounced search as user types
  useEffect(() => {
    if (!query.trim()) { setSearchResults(null); return; }
    setActiveCategory(null);
    const t = setTimeout(() => handleSearch(query), 500);
    return () => clearTimeout(t);
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

  async function handleCategoryPress(cat) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Charts navigates to its own full screen
    if (cat.mode === 'navigate') {
      navigation.navigate('Charts');
      return;
    }

    // Deselect if tapping active category
    if (activeCategory?.id === cat.id) {
      setActiveCategory(null);
      setCatResults([]);
      return;
    }

    setQuery('');
    setSearchResults(null);
    setActiveCategory(cat);
    setLoadingCat(true);
    setCatResults([]);

    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    try {
      if (cat.mode === 'curated') {
        // Fetch a random subset of the curated list in parallel
        const subset = [...cat.artists].sort(() => Math.random() - 0.5).slice(0, 12);
        const results = await Promise.all(subset.map(name => findArtist(name)));
        setCatResults(results.filter(Boolean));
      } else {
        const results = await searchSpotify(cat.query);
        setCatResults(results.artists);
      }
    } catch {
      setCatResults([]);
    } finally {
      setLoadingCat(false);
    }
  }

  const showDefault = !searchResults && !activeCategory;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Search bar ── */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Artists, albums, tracks..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            selectionColor={colors.accentTeal}
          />
          {searching && <ActivityIndicator size="small" color={colors.accentTeal} />}
          {!searching && (query.length > 0 || activeCategory) && (
            <TouchableOpacity onPress={() => { setQuery(''); setActiveCategory(null); setCatResults([]); }}>
              <Ionicons name="close" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Category pills — always visible ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catPillsRow}
          style={styles.catPillsScroll}
        >
          {CATEGORIES.map(cat => {
            const isActive = activeCategory?.id === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catPill,
                  { borderColor: isActive ? cat.color : colors.border },
                  isActive && { backgroundColor: cat.color + '20' },
                ]}
                onPress={() => handleCategoryPress(cat)}
                activeOpacity={0.75}
              >
                <Ionicons name={cat.icon} size={13} color={isActive ? cat.color : colors.textMuted} />
                <Text style={[styles.catPillLabel, { color: isActive ? cat.color : colors.textMuted }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ── Category results ── */}
          {activeCategory && (
            <View style={styles.section}>
              <View style={styles.catHeaderRow}>
                <View style={[styles.catHeaderBar, { backgroundColor: activeCategory.color }]} />
                <View>
                  <Text style={[styles.catHeaderTitle, { color: activeCategory.color }]}>
                    {activeCategory.label.toUpperCase()}
                  </Text>
                  <Text style={styles.catHeaderDesc}>{activeCategory.description}</Text>
                </View>
              </View>

              {loadingCat ? (
                <ActivityIndicator color={activeCategory.color} style={{ marginTop: 24 }} />
              ) : catResults.length > 0 ? (
                catResults.map((artist, i) => (
                  <TouchableOpacity
                    key={artist.id}
                    style={styles.resultRow}
                    onPress={() => {
                      Haptics.selectionAsync();
                      navigation.navigate('ArtistProfile', { artist });
                    }}
                    activeOpacity={0.7}
                  >
                    {artist.imageUrl
                      ? <Image source={{ uri: artist.imageUrl }} style={styles.artistThumb} />
                      : <View style={[styles.artistThumb, { backgroundColor: colors.surface }]} />}
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{artist.name}</Text>
                      <Text style={styles.resultSub}>{formatFollowers(artist.followers)}</Text>
                    </View>
                    {(activeCategory.id === 'discover' || activeCategory.id === 'ug_ogs') && (
                      <View style={[styles.discoverBadge, { borderColor: activeCategory.color }]}>
                        <Text style={[styles.discoverBadgeText, { color: activeCategory.color }]}>
                          {activeCategory.badge || 'SLEPT ON'}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.rowArrow}>›</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noResults}>Nothing found — try another category</Text>
              )}
            </View>
          )}

          {/* ── Live search results ── */}
          {searchResults && (
            <View style={styles.section}>
              {searchResults.artists.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Artists</Text>
                  {searchResults.artists.map(artist => (
                    <TouchableOpacity
                      key={artist.id}
                      style={styles.resultRow}
                      onPress={() => { Haptics.selectionAsync(); navigation.navigate('ArtistProfile', { artist }); }}
                      activeOpacity={0.7}
                    >
                      {artist.imageUrl
                        ? <Image source={{ uri: artist.imageUrl }} style={styles.artistThumb} />
                        : <View style={[styles.artistThumb, { backgroundColor: colors.surface }]} />}
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultName}>{artist.name}</Text>
                        <Text style={styles.resultSub}>{formatFollowers(artist.followers)}</Text>
                      </View>
                      <Text style={styles.rowArrow}>›</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {searchResults.albums.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Albums</Text>
                  {searchResults.albums.map(album => (
                    <TouchableOpacity
                      key={album.id}
                      style={styles.resultRow}
                      activeOpacity={0.7}
                      onPress={() => {
                        Haptics.selectionAsync();
                        navigation.navigate('ArtistProfile', {
                          artist: { id: album.artistId, name: album.artist, imageUrl: album.imageUrl },
                        });
                      }}
                    >
                      {album.imageUrl
                        ? <Image source={{ uri: album.imageUrl }} style={styles.albumThumb} />
                        : <View style={[styles.albumThumb, { backgroundColor: colors.surface }]} />}
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultName}>{album.name}</Text>
                        <Text style={styles.resultSub}>{album.artist} · {album.releaseDate?.slice(0, 4)}</Text>
                      </View>
                      <Text style={styles.rowArrow}>›</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {searchResults.tracks.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Tracks</Text>
                  {searchResults.tracks.map(track => (
                    <TouchableOpacity
                      key={track.id}
                      style={styles.resultRow}
                      activeOpacity={0.7}
                      onPress={() => {
                        Haptics.selectionAsync();
                        navigation.navigate('ArtistProfile', {
                          artist: { id: track.artistId, name: track.artist, imageUrl: track.imageUrl },
                        });
                      }}
                    >
                      {track.imageUrl
                        ? <Image source={{ uri: track.imageUrl }} style={styles.albumThumb} />
                        : <View style={[styles.albumThumb, { backgroundColor: colors.surface }]} />}
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultName}>{track.name}</Text>
                        <Text style={styles.resultSub}>{track.artist} · {track.album}</Text>
                      </View>
                      <Text style={styles.rowArrow}>›</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {!searchResults.artists.length && !searchResults.albums.length && !searchResults.tracks.length && (
                <Text style={styles.noResults}>No results for "{query}"</Text>
              )}
            </View>
          )}

          {/* ── Default: Trending + Category grid ── */}
          {showDefault && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trending Now</Text>
                {loadingTrending ? (
                  <ActivityIndicator color={colors.accentTeal} style={{ marginTop: 20 }} />
                ) : trendingArtists.length > 0 ? (
                  trendingArtists.map((artist, i) => (
                    <TouchableOpacity
                      key={artist.id}
                      style={styles.trendingRow}
                      onPress={() => { Haptics.selectionAsync(); navigation.navigate('ArtistProfile', { artist }); }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.trendingRank}>{i + 1}</Text>
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
                  <ActivityIndicator color={colors.accentTeal} style={{ marginTop: 20 }} />
                )}
              </View>

              {/* Category cards grid */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Browse by Category</Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryCard, { backgroundColor: cat.bg, borderColor: cat.color + '40' }]}
                      onPress={() => handleCategoryPress(cat)}
                      activeOpacity={0.78}
                    >
                      <Ionicons name={cat.icon} size={24} color={cat.color} style={{ marginBottom: 4 }} />
                      <Text style={[styles.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
                      <Text style={styles.categoryDesc} numberOfLines={1}>{cat.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: colors.background },
  scroll:        { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 40 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 16,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '400',
    padding: 0,
  },
  // ── Category pills (horizontal scroll)
  catPillsScroll: { marginBottom: 22 },
  catPillsRow:    { gap: 8, paddingRight: 16 },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  catPillLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Category results header
  catHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  catHeaderBar: { width: 4, height: 36, borderRadius: 2, marginTop: 2 },
  catHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  catHeaderDesc: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '400',
  },

  discoverBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 4,
  },
  discoverBadgeText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  section:      { marginBottom: 28 },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 14,
  },

  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  artistThumb: { width: 50, height: 50, borderRadius: 25 },
  albumThumb:  { width: 50, height: 50, borderRadius: 8 },
  resultInfo:  { flex: 1 },
  resultName:  { color: colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  resultSub:   { color: colors.textMuted, fontSize: 12 },
  rowArrow:    { color: colors.textMuted, fontSize: 20 },

  noResults: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 20 },

  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  trendingRank:  { color: colors.accentTeal, fontSize: 17, fontWeight: '800', width: 24, textAlign: 'center' },
  trendingThumb: { width: 50, height: 50, borderRadius: 25 },
  trendingInfo:  { flex: 1 },
  trendingName:  { color: colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  trendingCount: { color: colors.textMuted, fontSize: 12 },
  trendingArrow: { color: colors.textMuted, fontSize: 20 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: {
    width: '47.5%',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    gap: 6,
  },
  categoryLabel: { fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  categoryDesc:  { color: colors.textMuted, fontSize: 10, fontWeight: '400' },
});
