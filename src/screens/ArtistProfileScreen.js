import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator, StatusBar, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getArtist, getArtistTopTracks, getArtistAlbums } from '../services/spotifyService';
import { fetchArticles } from '../services/newsService';
import { getArtistLore } from '../data/artistLore';

function formatFollowers(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M followers`;
  if (n >= 1000)    return `${Math.round(n / 1000)}K followers`;
  return `${n} followers`;
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ── Animated section reveal ──────────────────────────────────────────────────
function FadeSection({ children, delay = 0 }) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }).start();
  }, []);
  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

// ── Lore: artist story paragraphs ────────────────────────────────────────────
function LoreSection({ lore }) {
  const [expanded, setExpanded] = useState(false);
  const preview = lore.story.slice(0, 2);
  const rest    = lore.story.slice(2);

  return (
    <View style={[loreStyles.wrap, { borderLeftColor: lore.color }]}>
      {/* Badge + Era */}
      <View style={loreStyles.topRow}>
        <View style={[loreStyles.badge, { backgroundColor: lore.color }]}>
          <Text style={loreStyles.badgeText}>{lore.badge}</Text>
        </View>
        <Text style={loreStyles.era}>{lore.era} · {lore.origin}</Text>
      </View>

      {/* Tagline */}
      <Text style={[loreStyles.tagline, { color: lore.color }]}>"{lore.tagline}"</Text>

      {/* Story paragraphs */}
      {preview.map((p, i) => (
        <Text key={i} style={loreStyles.para}>{p}</Text>
      ))}

      {rest.length > 0 && (
        <>
          {expanded && rest.map((p, i) => (
            <Text key={i} style={loreStyles.para}>{p}</Text>
          ))}
          <TouchableOpacity
            style={[loreStyles.readMoreBtn, { borderColor: lore.color }]}
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.7}
          >
            <Text style={[loreStyles.readMoreText, { color: lore.color }]}>
              {expanded ? 'READ LESS' : 'READ FULL STORY'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Influence */}
      {lore.influence?.length > 0 && (
        <View style={loreStyles.influenceWrap}>
          <Text style={loreStyles.influenceLabel}>INFLUENCED</Text>
          <View style={loreStyles.influenceRow}>
            {lore.influence.map((name, i) => (
              <View key={i} style={[loreStyles.influencePill, { borderColor: lore.color + '60' }]}>
                <Text style={[loreStyles.influenceName, { color: lore.color }]}>{name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Legacy */}
      {lore.legacy && (
        <View style={loreStyles.legacyWrap}>
          <Text style={loreStyles.legacyLabel}>LEGACY</Text>
          <Text style={loreStyles.legacyText}>{lore.legacy}</Text>
        </View>
      )}

      {/* Quotes */}
      {lore.quotes?.length > 0 && (
        <View style={loreStyles.quotesWrap}>
          {lore.quotes.map((q, i) => (
            <View key={i} style={[loreStyles.quoteCard, { borderLeftColor: lore.color }]}>
              <Text style={loreStyles.quoteText}>{q}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Listen To */}
      {lore.listenTo?.length > 0 && (
        <View style={loreStyles.listenWrap}>
          <Text style={loreStyles.listenLabel}>START HERE</Text>
          {lore.listenTo.map((item, i) => (
            <View key={i} style={loreStyles.listenRow}>
              <View style={[loreStyles.listenNum, { backgroundColor: lore.color }]}>
                <Text style={loreStyles.listenNumText}>{i + 1}</Text>
              </View>
              <View style={loreStyles.listenInfo}>
                <Text style={loreStyles.listenTitle}>{item.title}</Text>
                <Text style={loreStyles.listenNote}>{item.year} · {item.note}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function ArtistProfileScreen({ route, navigation }) {
  const { artist: initialArtist } = route.params;
  const [artist,  setArtist]  = useState(initialArtist);
  const [tracks,  setTracks]  = useState([]);
  const [albums,  setAlbums]  = useState([]);
  const [news,    setNews]    = useState([]);
  const [loading, setLoading] = useState(true);

  const lore = getArtistLore(initialArtist.name);
  const accentColor = lore?.color || colors.accentTeal;

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [fullArtist, topTracks, artistAlbums, relatedNews] = await Promise.all([
        getArtist(initialArtist.id),
        getArtistTopTracks(initialArtist.id),
        getArtistAlbums(initialArtist.id),
        fetchArticles().then(all => all.filter(a =>
          a.title.toLowerCase().includes(initialArtist.name.toLowerCase()) ||
          (a.body || []).join(' ').toLowerCase().includes(initialArtist.name.toLowerCase())
        ).slice(0, 3)),
      ]);
      if (fullArtist) setArtist(fullArtist);
      setTracks(topTracks.slice(0, 5));
      setAlbums(artistAlbums.slice(0, 6));
      setNews(relatedNews);
    } catch (err) {
      console.warn('[ArtistProfile] load error:', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          {artist.imageUrl ? (
            <Image source={{ uri: artist.imageUrl }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: colors.surface }]} />
          )}
          {/* Gradient scrim */}
          <View style={styles.heroScrim} />
          <View style={styles.heroScrimBottom} />

          {/* Back button */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Lore badge on hero if available */}
          {lore && (
            <View style={[styles.loreBadgeHero, { backgroundColor: accentColor }]}>
              <Text style={styles.loreBadgeHeroText}>{lore.badge}</Text>
            </View>
          )}

          {/* Artist info */}
          <View style={styles.heroInfo}>
            <Text style={styles.artistName}>{artist.name}</Text>
            <Text style={[styles.artistFollowers, { color: accentColor }]}>
              {formatFollowers(artist.followers)}
            </Text>
            {artist.genres?.length > 0 && (
              <View style={styles.genresRow}>
                {artist.genres.slice(0, 3).map(g => (
                  <View key={g} style={[styles.genrePill, { borderColor: accentColor + '60' }]}>
                    <Text style={[styles.genreText, { color: accentColor }]}>{g}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={accentColor} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.content}>

            {/* ── Artist Lore (Underground OGs & others) ── */}
            {lore && (
              <FadeSection delay={0}>
                <LoreSection lore={lore} />
              </FadeSection>
            )}

            {/* ── Top Tracks ── */}
            {tracks.length > 0 && (
              <FadeSection delay={100}>
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={[styles.sectionBar, { backgroundColor: accentColor }]} />
                    <Text style={styles.sectionTitle}>TOP TRACKS</Text>
                  </View>
                  {tracks.map((track, i) => (
                    <View key={track.id} style={styles.trackRow}>
                      <Text style={[styles.trackNum, { color: accentColor }]}>{i + 1}</Text>
                      {track.imageUrl ? (
                        <Image source={{ uri: track.imageUrl }} style={styles.trackThumb} />
                      ) : (
                        <View style={[styles.trackThumb, { backgroundColor: colors.surface }]} />
                      )}
                      <View style={styles.trackInfo}>
                        <Text style={styles.trackName} numberOfLines={1}>{track.name}</Text>
                        <Text style={styles.trackAlbum} numberOfLines={1}>{track.album}</Text>
                      </View>
                      <Text style={styles.trackDuration}>{formatDuration(track.durationMs)}</Text>
                    </View>
                  ))}
                </View>
              </FadeSection>
            )}

            {/* ── Albums ── */}
            {albums.length > 0 && (
              <FadeSection delay={200}>
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={[styles.sectionBar, { backgroundColor: accentColor }]} />
                    <Text style={styles.sectionTitle}>DISCOGRAPHY</Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.albumsRow}>
                      {albums.map(album => (
                        <View key={album.id} style={styles.albumCard}>
                          {album.imageUrl ? (
                            <Image source={{ uri: album.imageUrl }} style={styles.albumArt} />
                          ) : (
                            <View style={[styles.albumArt, { backgroundColor: colors.surface }]} />
                          )}
                          <Text style={styles.albumName} numberOfLines={2}>{album.name}</Text>
                          <Text style={[styles.albumYear, { color: accentColor }]}>
                            {album.releaseDate?.slice(0, 4)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </FadeSection>
            )}

            {/* ── Latest News ── */}
            {news.length > 0 && (
              <FadeSection delay={300}>
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={[styles.sectionBar, { backgroundColor: accentColor }]} />
                    <Text style={styles.sectionTitle}>LATEST NEWS</Text>
                  </View>
                  {news.map(article => (
                    <TouchableOpacity
                      key={article.id}
                      style={styles.newsRow}
                      onPress={() => navigation.navigate('ArticleDetail', { article })}
                      activeOpacity={0.7}
                    >
                      {article.imageUrl ? (
                        <Image source={{ uri: article.imageUrl }} style={styles.newsThumb} />
                      ) : (
                        <View style={[styles.newsThumb, { backgroundColor: article.imageColor }]} />
                      )}
                      <View style={styles.newsInfo}>
                        <Text style={styles.newsTitle} numberOfLines={2}>{article.title}</Text>
                        <Text style={styles.newsMeta}>{article.source} · {article.timestamp}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </FadeSection>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Lore styles ──────────────────────────────────────────────────────────────
const loreStyles = StyleSheet.create({
  wrap: {
    borderLeftWidth: 3,
    paddingLeft: 18,
    marginBottom: 28,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    color: '#000',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  era: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '700',
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 16,
  },
  para: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 23,
    marginBottom: 13,
    opacity: 0.88,
  },
  readMoreBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
    marginTop: 4,
  },
  readMoreText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },
  influenceWrap: { marginTop: 8, marginBottom: 16 },
  influenceLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 10,
  },
  influenceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  influencePill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  influenceName: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  legacyWrap: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legacyLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 8,
  },
  legacyText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 21,
    fontStyle: 'italic',
  },
  quotesWrap: { gap: 10, marginBottom: 16 },
  quoteCard: {
    borderLeftWidth: 3,
    paddingLeft: 14,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingRight: 12,
  },
  quoteText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'italic',
    lineHeight: 21,
    opacity: 0.82,
  },
  listenWrap: { marginBottom: 8 },
  listenLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 12,
  },
  listenRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  listenNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  listenNumText: { color: '#000', fontSize: 10, fontWeight: '900' },
  listenInfo: { flex: 1 },
  listenTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  listenNote: { color: colors.textMuted, fontSize: 12, fontWeight: '400' },
});

// ── Screen styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 48 },

  hero:       { position: 'relative', height: 360 },
  heroImage:  { width: '100%', height: '100%' },
  heroScrim: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '45%',
    backgroundColor: 'rgba(10,9,7,0.25)',
  },
  heroScrimBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '58%',
    backgroundColor: 'rgba(10,9,7,0.9)',
  },
  backBtn: {
    position: 'absolute',
    top: 18, left: 18,
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  backArrow: { color: colors.textPrimary, fontSize: 20, lineHeight: 22 },
  loreBadgeHero: {
    position: 'absolute',
    top: 18, right: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  loreBadgeHeroText: {
    color: '#000',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  heroInfo: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 22,
  },
  artistName: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  artistFollowers: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  genresRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  genrePill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  genreText: { fontSize: 11, fontWeight: '600' },

  section: { marginBottom: 30 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionBar:  { width: 4, height: 18, borderRadius: 2 },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  trackNum:      { fontSize: 14, fontWeight: '700', width: 20, textAlign: 'center' },
  trackThumb:    { width: 46, height: 46, borderRadius: 8 },
  trackInfo:     { flex: 1 },
  trackName:     { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  trackAlbum:    { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  trackDuration: { color: colors.textMuted, fontSize: 12 },

  albumsRow:  { flexDirection: 'row', gap: 14, paddingBottom: 4 },
  albumCard:  { width: 136 },
  albumArt:   { width: 136, height: 136, borderRadius: 12, marginBottom: 8 },
  albumName:  { color: colors.textPrimary, fontSize: 12, fontWeight: '600', lineHeight: 17 },
  albumYear:  { fontSize: 11, fontWeight: '700', marginTop: 3 },

  newsRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  newsThumb: { width: 74, height: 74, borderRadius: 10 },
  newsInfo:  { flex: 1 },
  newsTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  newsMeta:  { color: colors.textMuted, fontSize: 11, marginTop: 4 },
});
