import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { getArtist, getArtistTopTracks, getArtistAlbums } from '../services/spotifyService';
import { fetchArticles } from '../services/newsService';

function formatFollowers(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M followers`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K followers`;
  return `${n} followers`;
}

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ArtistProfileScreen({ route, navigation }) {
  const { artist: initialArtist } = route.params;
  const [artist, setArtist] = useState(initialArtist);
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

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
        {/* Hero */}
        <View style={styles.hero}>
          {artist.imageUrl ? (
            <Image source={{ uri: artist.imageUrl }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: colors.surface }]} />
          )}
          <View style={styles.heroOverlay}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.artistName}>{artist.name}</Text>
            <Text style={styles.artistFollowers}>{formatFollowers(artist.followers)}</Text>
            {artist.genres?.length > 0 && (
              <View style={styles.genresRow}>
                {artist.genres.slice(0, 3).map(g => (
                  <View key={g} style={styles.genrePill}>
                    <Text style={styles.genreText}>{g}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accentTeal} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.content}>

            {/* Top Tracks */}
            {tracks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Tracks</Text>
                {tracks.map((track, i) => (
                  <View key={track.id} style={styles.trackRow}>
                    <Text style={styles.trackNum}>{i + 1}</Text>
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
            )}

            {/* Albums */}
            {albums.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Albums</Text>
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
                        <Text style={styles.albumYear}>{album.releaseDate?.slice(0, 4)}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Related News */}
            {news.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Latest News</Text>
                {news.map(article => (
                  <TouchableOpacity
                    key={article.id}
                    style={styles.newsRow}
                    onPress={() => navigation.navigate('ArticleDetail', { article })}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.newsThumb, { backgroundColor: article.imageColor }]} />
                    <View style={styles.newsInfo}>
                      <Text style={styles.newsTitle} numberOfLines={2}>{article.title}</Text>
                      <Text style={styles.newsMeta}>{article.source} · {article.timestamp}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: { position: 'relative', height: 320 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { color: colors.textPrimary, fontSize: 20, lineHeight: 22 },
  heroInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  artistName: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  artistFollowers: {
    color: colors.accentTeal,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  genresRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  genrePill: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  genreText: { color: colors.textMuted, fontSize: 11, fontWeight: '400' },
  content: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 28 },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 14,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  trackNum: { color: colors.textMuted, fontSize: 14, width: 18, textAlign: 'center' },
  trackThumb: { width: 40, height: 40, borderRadius: 4 },
  trackInfo: { flex: 1 },
  trackName: { color: colors.textPrimary, fontSize: 14, fontWeight: '500' },
  trackAlbum: { color: colors.textMuted, fontSize: 12, fontWeight: '400', marginTop: 2 },
  trackDuration: { color: colors.textMuted, fontSize: 12 },
  albumsRow: { flexDirection: 'row', gap: 14, paddingBottom: 4 },
  albumCard: { width: 130 },
  albumArt: { width: 130, height: 130, borderRadius: 8, marginBottom: 8 },
  albumName: { color: colors.textPrimary, fontSize: 13, fontWeight: '500', lineHeight: 18 },
  albumYear: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  newsRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  newsThumb: { width: 70, height: 70, borderRadius: 8 },
  newsInfo: { flex: 1 },
  newsTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '500', lineHeight: 20 },
  newsMeta: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
});
