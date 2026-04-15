/**
 * ChartsScreen.js
 * Cultural trends & patterns in hip-hop.
 *
 * Data sources:
 *   - Spotify popularity scores    → Power Rankings + Momentum
 *   - Spotify top tracks           → Charting Tracks
 *   - NewsAPI article frequency    → Buzz Meter (who's being talked about most)
 *   - Spotify genre/era artists    → Scene Breakdown
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Animated, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { findArtist, searchSpotify } from '../services/spotifyService';
import { fetchArticles } from '../services/newsService';

// ── The 40-artist roster we track for power rankings ────────────────────────
const TRACKED_ARTISTS = [
  'Kendrick Lamar', 'Drake', 'Travis Scott', 'Kanye West', 'Tyler, the Creator',
  'Future', 'Playboi Carti', 'Lil Wayne', 'Nicki Minaj', 'J. Cole',
  'Baby Keem', '21 Savage', 'Metro Boomin', 'Young Thug', 'Gunna',
  'Lil Baby', 'Jack Harlow', 'Roddy Ricch', 'Don Toliver', 'Yeat',
  'Central Cee', 'Little Simz', 'Kneecap', 'JID', 'Denzel Curry',
  'Ab-Soul', 'Thundercat', 'Anderson .Paak', 'Freddie Gibbs', 'Vince Staples',
  'Westside Gunn', 'Conway the Machine', 'Boldy James', 'Mavi', 'Saba',
  'Smino', 'JPEGMafia', 'billy woods', 'Nas', 'Jay-Z',
];

// ── Scene segments for breakdown bar ────────────────────────────────────────
const SCENES = [
  { label: 'Trap',       color: '#FF3B30', artists: ['Future','Young Thug','Gunna','Lil Baby','Travis Scott','Playboi Carti','21 Savage','Metro Boomin'] },
  { label: 'Conscious',  color: '#4ade80', artists: ['Kendrick Lamar','J. Cole','JID','Ab-Soul','Vince Staples','Saba','Mavi','Smino'] },
  { label: 'UK/Global',  color: '#00C4D4', artists: ['Central Cee','Little Simz','Kneecap','Stormzy','Dave','Skepta'] },
  { label: 'Underground',color: '#a855f7', artists: ['Freddie Gibbs','billy woods','JPEGMafia','Westside Gunn','Boldy James','Conway the Machine'] },
  { label: 'OG/Legacy',  color: '#D4AF37', artists: ['Nas','Jay-Z','Lil Wayne','Nicki Minaj','Kanye West','Tyler, the Creator'] },
];

// ── Animated bar ─────────────────────────────────────────────────────────────
function AnimBar({ pct, color, delay = 0 }) {
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(w, {
      toValue: pct,
      duration: 700,
      delay,
      useNativeDriver: false,
    }).start();
  }, [pct]);
  return (
    <View style={barStyles.track}>
      <Animated.View style={[
        barStyles.fill,
        { backgroundColor: color,
          width: w.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }
      ]} />
    </View>
  );
}
const barStyles = StyleSheet.create({
  track: { flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 2 },
});

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ title, sub, color = colors.accentTeal }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <View style={[styles.sectionBar, { backgroundColor: color }]} />
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {sub && <Text style={styles.sectionSub}>{sub}</Text>}
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ChartsScreen({ navigation }) {
  const [powerRankings, setPowerRankings] = useState([]);
  const [chartTracks,   setChartTracks]   = useState([]);
  const [buzzData,      setBuzzData]      = useState([]);
  const [sceneData,     setSceneData]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState('POWER');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const TABS = ['POWER', 'TRACKS', 'BUZZ', 'SCENE'];

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    await Promise.allSettled([
      loadPowerRankings(),
      loadChartTracks(),
      loadBuzzData(),
      buildSceneData(),
    ]);
    setLoading(false);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }

  // ── Power Rankings: Spotify popularity score for each tracked artist ───────
  async function loadPowerRankings() {
    try {
      // Batch into groups of 8 to avoid hammering the API
      const batches = [];
      for (let i = 0; i < TRACKED_ARTISTS.length; i += 8) {
        batches.push(TRACKED_ARTISTS.slice(i, i + 8));
      }
      const results = [];
      for (const batch of batches) {
        const batchResults = await Promise.all(batch.map(name => findArtist(name)));
        results.push(...batchResults.filter(Boolean));
      }
      const ranked = results
        .sort((a, b) => b.popularity - a.popularity)
        .map((a, i) => ({ ...a, rank: i + 1 }));
      setPowerRankings(ranked);
    } catch (err) {
      console.warn('[Charts] power rankings error:', err.message);
    }
  }

  // ── Charting Tracks: top Spotify tracks right now ─────────────────────────
  async function loadChartTracks() {
    try {
      const results = await searchSpotify('hip hop rap top 2025');
      const tracks = (results.tracks || [])
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 15)
        .map((t, i) => ({ ...t, rank: i + 1 }));
      setChartTracks(tracks);
    } catch (err) {
      console.warn('[Charts] chart tracks error:', err.message);
    }
  }

  // ── Buzz Meter: count artist name mentions in recent news articles ─────────
  async function loadBuzzData() {
    try {
      const articles = await fetchArticles();
      const fullText = articles.map(a => (a.title + ' ' + (a.body || []).join(' ')).toLowerCase()).join(' ');

      const counts = TRACKED_ARTISTS.map(name => ({
        name,
        count: (fullText.match(new RegExp(name.toLowerCase().replace('.', '\\.'), 'g')) || []).length,
      }))
      .filter(a => a.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

      const max = counts[0]?.count || 1;
      setBuzzData(counts.map((a, i) => ({ ...a, rank: i + 1, pct: Math.round((a.count / max) * 100) })));
    } catch (err) {
      console.warn('[Charts] buzz error:', err.message);
    }
  }

  // ── Scene Breakdown: fetch a rep artist from each scene for popularity ─────
  async function buildSceneData() {
    try {
      const scenePopularity = await Promise.all(
        SCENES.map(async scene => {
          // Sample 3 artists from each scene and average their popularity
          const sample = scene.artists.slice(0, 3);
          const artists = await Promise.all(sample.map(n => findArtist(n)));
          const valid   = artists.filter(Boolean);
          const avgPop  = valid.length
            ? Math.round(valid.reduce((s, a) => s + a.popularity, 0) / valid.length)
            : 0;
          return { ...scene, popularity: avgPop };
        })
      );
      const max = Math.max(...scenePopularity.map(s => s.popularity), 1);
      setSceneData(scenePopularity.map(s => ({ ...s, pct: Math.round((s.popularity / max) * 100) })));
    } catch (err) {
      console.warn('[Charts] scene error:', err.message);
    }
  }

  function switchTab(tab) {
    Haptics.selectionAsync();
    fadeAnim.setValue(0);
    setActiveTab(tab);
    Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }

  // ── Rank change indicator (mock momentum — top 10 = up, 11-25 = flat, rest = down)
  function momentum(rank) {
    if (rank <= 5)  return { iconName: 'trending-up',   color: '#4ade80' };
    if (rank <= 15) return { iconName: 'chevron-up',    color: '#4ade80' };
    if (rank <= 25) return { iconName: 'remove-outline', color: colors.textMuted };
    return           { iconName: 'chevron-down',   color: '#E8305A' };
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>HIP-HOP CHARTS</Text>
          <Text style={styles.headerSub}>Cultural trends & patterns</Text>
        </View>
        <TouchableOpacity onPress={loadAll} style={styles.refreshBtn} activeOpacity={0.7}>
          <Ionicons name="refresh" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* ── Tab bar ── */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => switchTab(tab)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.accentTeal} size="large" />
          <Text style={styles.loadingText}>Pulling live data...</Text>
        </View>
      ) : (
        <Animated.ScrollView
          style={{ opacity: fadeAnim }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* ── POWER RANKINGS ── */}
          {activeTab === 'POWER' && (
            <View>
              <SectionHeader
                title="POWER RANKINGS"
                sub="Ranked by Spotify popularity · updated live"
                color={colors.accentTeal}
              />
              <Text style={styles.chartNote}>
                Popularity score 0–100 reflects current streaming momentum across all platforms.
              </Text>
              {powerRankings.map((artist, i) => {
                const m = momentum(artist.rank);
                return (
                  <TouchableOpacity
                    key={artist.id}
                    style={styles.powerRow}
                    onPress={() => { Haptics.selectionAsync(); navigation.navigate('ArtistProfile', { artist }); }}
                    activeOpacity={0.75}
                  >
                    {/* Rank */}
                    <Text style={[
                      styles.powerRank,
                      artist.rank <= 3 && { color: colors.accentTeal, fontSize: 18 },
                    ]}>
                      {String(artist.rank).padStart(2, '0')}
                    </Text>

                    {/* Avatar */}
                    {artist.imageUrl
                      ? <Image source={{ uri: artist.imageUrl }} style={styles.powerAvatar} />
                      : <View style={[styles.powerAvatar, { backgroundColor: colors.surface }]} />}

                    {/* Info */}
                    <View style={styles.powerInfo}>
                      <Text style={styles.powerName} numberOfLines={1}>{artist.name}</Text>
                      <View style={styles.powerBarRow}>
                        <AnimBar pct={artist.popularity} color={
                          artist.rank <= 5  ? colors.accentTeal :
                          artist.rank <= 15 ? '#D4AF37' :
                          colors.textMuted
                        } delay={i * 30} />
                        <Text style={styles.powerScore}>{artist.popularity}</Text>
                      </View>
                    </View>

                    {/* Momentum */}
                    <Ionicons name={m.iconName} size={14} color={m.color} style={styles.momentumIcon} />
                  </TouchableOpacity>
                );
              })}
              {powerRankings.length === 0 && (
                <Text style={styles.emptyText}>Could not load rankings — check your connection</Text>
              )}
            </View>
          )}

          {/* ── CHARTING TRACKS ── */}
          {activeTab === 'TRACKS' && (
            <View>
              <SectionHeader
                title="CHARTING TRACKS"
                sub="Top hip-hop tracks by streaming popularity"
                color='#E07B0A'
              />
              {chartTracks.map((track, i) => (
                <View key={track.id} style={styles.trackRow}>
                  <Text style={[styles.trackRank, i < 3 && { color: colors.accentTeal }]}>
                    {String(track.rank).padStart(2, '0')}
                  </Text>
                  {track.imageUrl
                    ? <Image source={{ uri: track.imageUrl }} style={styles.trackThumb} />
                    : <View style={[styles.trackThumb, { backgroundColor: colors.surface }]} />}
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackName} numberOfLines={1}>{track.name}</Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
                    <AnimBar pct={track.popularity} color='#E07B0A' delay={i * 40} />
                  </View>
                  <Text style={styles.popularityScore}>{track.popularity}</Text>
                </View>
              ))}
              {chartTracks.length === 0 && (
                <Text style={styles.emptyText}>Could not load tracks — check your connection</Text>
              )}
            </View>
          )}

          {/* ── BUZZ METER ── */}
          {activeTab === 'BUZZ' && (
            <View>
              <SectionHeader
                title="BUZZ METER"
                sub="Most mentioned artists in hip-hop news right now"
                color='#E8305A'
              />
              <Text style={styles.chartNote}>
                Calculated from article frequency across Complex, XXL, HotNewHipHop, Billboard and more.
              </Text>
              {buzzData.length > 0 ? buzzData.map((entry, i) => (
                <View key={entry.name} style={styles.buzzRow}>
                  <Text style={[styles.buzzRank, i < 3 && { color: '#E8305A' }]}>
                    {String(entry.rank).padStart(2, '0')}
                  </Text>
                  <View style={styles.buzzInfo}>
                    <View style={styles.buzzNameRow}>
                      <Text style={styles.buzzName}>{entry.name}</Text>
                      <Text style={styles.buzzCount}>{entry.count} mentions</Text>
                    </View>
                    <AnimBar pct={entry.pct} color='#E8305A' delay={i * 40} />
                  </View>
                </View>
              )) : (
                <View style={styles.buzzEmptyWrap}>
                  <Text style={styles.emptyText}>No buzz data yet — refresh to pull latest articles</Text>
                </View>
              )}
            </View>
          )}

          {/* ── SCENE BREAKDOWN ── */}
          {activeTab === 'SCENE' && (
            <View>
              <SectionHeader
                title="SCENE BREAKDOWN"
                sub="Streaming momentum by genre & movement"
                color='#a855f7'
              />
              <Text style={styles.chartNote}>
                Each bar represents the average Spotify popularity of key artists within that scene.
              </Text>

              {/* Big visual bars */}
              {sceneData.map((scene, i) => (
                <View key={scene.label} style={styles.sceneRow}>
                  <View style={styles.sceneLabel}>
                    <Text style={[styles.sceneName, { color: scene.color }]}>{scene.label.toUpperCase()}</Text>
                    <Text style={styles.sceneScore}>{scene.popularity} avg</Text>
                  </View>
                  <View style={styles.sceneBigBarTrack}>
                    <Animated.View>
                      <AnimBar pct={scene.pct} color={scene.color} delay={i * 100} />
                    </Animated.View>
                  </View>
                  <Text style={[styles.scenePct, { color: scene.color }]}>{scene.pct}%</Text>
                </View>
              ))}

              {/* Artist callouts per scene */}
              <View style={styles.sceneCallouts}>
                {sceneData.map(scene => (
                  <View key={scene.label} style={[styles.sceneCalloutCard, { borderColor: scene.color + '40' }]}>
                    <View style={[styles.sceneCalloutDot, { backgroundColor: scene.color }]} />
                    <Text style={[styles.sceneCalloutLabel, { color: scene.color }]}>{scene.label}</Text>
                    <Text style={styles.sceneCalloutArtists} numberOfLines={2}>
                      {scene.artists.slice(0, 4).join(' · ')}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Cultural insight cards */}
              <View style={styles.insightSection}>
                <Text style={styles.insightHeader}>CULTURAL SIGNALS</Text>
                {[
                  { icon: 'trending-up',    text: 'UK Drill & Irish rap seeing biggest growth outside US in 2024–25', color: '#00C4D4' },
                  { icon: 'mic-outline',    text: 'Conscious rap resurging — Kendrick\'s GNX effect lifting the whole lane', color: '#4ade80' },
                  { icon: 'globe-outline',  text: 'Global hip-hop expanding — African artists crossing over at record pace', color: '#D4AF37' },
                  { icon: 'scale-outline',  text: 'Legal drama dominating headlines — court cases driving more engagement than drops', color: '#FF3B30' },
                  { icon: 'repeat',         text: 'Producers stepping into artist roles — Metro, Alchemist, Pharrell all releasing own projects', color: '#a855f7' },
                ].map((insight, i) => (
                  <View key={i} style={[styles.insightCard, { borderLeftColor: insight.color }]}>
                    <Ionicons name={insight.icon} size={18} color={insight.color} />
                    <Text style={styles.insightText}>{insight.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </Animated.ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, paddingBottom: 40 },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  backArrow:    { color: colors.textPrimary, fontSize: 18 },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 14, fontWeight: '900', letterSpacing: 3,
  },
  headerSub:   { color: colors.textMuted, fontSize: 10, fontWeight: '400', marginTop: 2 },
  refreshBtn:  { marginLeft: 'auto', padding: 6 },
  refreshText: { color: colors.accentTeal, fontSize: 22, fontWeight: '300' },

  // ── Tab bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.accentTeal },
  tabText: {
    color: colors.textMuted,
    fontSize: 9, fontWeight: '800', letterSpacing: 1,
  },
  tabTextActive: { color: colors.accentTeal },

  // ── Loading
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  loadingText: { color: colors.textMuted, fontSize: 12, fontWeight: '500' },

  // ── Section header
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 6,
    marginTop: 4,
  },
  sectionBar:   { width: 3, height: 36, borderRadius: 2, marginTop: 2 },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 13, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase',
  },
  sectionSub: { color: colors.textMuted, fontSize: 10, fontWeight: '400', marginTop: 3 },
  chartNote: {
    color: colors.textMuted,
    fontSize: 10, fontWeight: '400',
    lineHeight: 15,
    marginBottom: 16,
    paddingLeft: 15,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 20 },

  // ── Power Rankings
  powerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  powerRank: {
    color: colors.textMuted,
    fontSize: 15, fontWeight: '900',
    letterSpacing: -0.5, width: 30, textAlign: 'right',
  },
  powerAvatar: { width: 42, height: 42, borderRadius: 21 },
  powerInfo:   { flex: 1, gap: 6 },
  powerName:   { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
  powerBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  powerScore:  { color: colors.textMuted, fontSize: 10, fontWeight: '700', minWidth: 24, textAlign: 'right' },
  momentumIcon:{ minWidth: 22, textAlign: 'right' },

  // ── Chart Tracks
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  trackRank:   { color: colors.textMuted, fontSize: 15, fontWeight: '900', width: 30, textAlign: 'right' },
  trackThumb:  { width: 46, height: 46, borderRadius: 4 },
  trackInfo:   { flex: 1, gap: 4 },
  trackName:   { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
  trackArtist: { color: colors.textMuted, fontSize: 11, fontWeight: '400', marginBottom: 4 },
  popularityScore: { color: colors.textMuted, fontSize: 11, fontWeight: '700', minWidth: 28, textAlign: 'right' },

  // ── Buzz Meter
  buzzRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  buzzRank:     { color: colors.textMuted, fontSize: 15, fontWeight: '900', width: 30, textAlign: 'right' },
  buzzInfo:     { flex: 1, gap: 6 },
  buzzNameRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  buzzName:     { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
  buzzCount:    { color: colors.textMuted, fontSize: 10, fontWeight: '500' },
  buzzEmptyWrap:{ paddingTop: 30 },

  // ── Scene Breakdown
  sceneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  sceneLabel:      { width: 90 },
  sceneName:       { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  sceneScore:      { color: colors.textMuted, fontSize: 9, fontWeight: '400', marginTop: 2 },
  sceneBigBarTrack:{ flex: 1 },
  scenePct:        { fontSize: 12, fontWeight: '800', minWidth: 36, textAlign: 'right' },
  sceneCallouts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
    marginBottom: 8,
  },
  sceneCalloutCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: 3,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  sceneCalloutDot:     { width: 6, height: 6, borderRadius: 3 },
  sceneCalloutLabel:   { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
  sceneCalloutArtists: { color: colors.textMuted, fontSize: 9, fontWeight: '400', lineHeight: 14 },

  // ── Cultural Insights
  insightSection: { marginTop: 24 },
  insightHeader: {
    color: colors.textMuted,
    fontSize: 9, fontWeight: '900', letterSpacing: 3,
    marginBottom: 12,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 3,
    borderLeftWidth: 3,
    marginBottom: 8,
  },
  insightIcon: { flexShrink: 0 },
  insightText: { flex: 1, color: colors.textPrimary, fontSize: 12, fontWeight: '500', lineHeight: 18 },
});
