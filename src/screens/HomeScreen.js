import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Animated, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { useDrops } from '../services/dropsService';
import { buildAffiliateUrl, trackBuyClick } from '../services/affiliateService';

// ── Helpers ───────────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0'); }

function timeUntil(ts) {
  const diff = ts - Date.now();
  if (diff <= 0) return null;
  const totalSec = Math.floor(diff / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h >= 24) { const d = Math.floor(h / 24); return `${d}d ${h % 24}h`; }
  if (h > 0)   return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

function timeLeft(endTs) {
  const diff = endTs - Date.now();
  if (diff <= 0) return 'ENDING';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${pad(m)}m left`;
  return `${m}m left`;
}

function formatDropDay(ts) {
  const d        = new Date(ts);
  const today    = new Date();
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString())    return 'TODAY';
  if (d.toDateString() === tomorrow.toDateString()) return 'TOMORROW';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// ── Pulsing live dot ──────────────────────────────────────────────────────────
function LiveDot() {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 2.4, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,   duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={styles.liveDotWrap}>
      <Animated.View style={[styles.liveDotRing, { transform: [{ scale: pulse }] }]} />
      <View style={styles.liveDot} />
    </View>
  );
}

// ── Countdown — ticks every second ───────────────────────────────────────────
function Countdown({ dropTime, style }) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    const update = () => setLabel(timeUntil(dropTime) || '00:00');
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [dropTime]);
  return <Text style={style}>{label}</Text>;
}

// ── Hero card — live drop ─────────────────────────────────────────────────────
function LiveCard({ drop, onBuy }) {
  const glow = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1,   duration: 1600, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.6, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.liveCard}>
      <View style={[styles.liveCardBg, { backgroundColor: drop.imageColor }]} />
      <Animated.View style={[styles.liveCardBorder, { borderColor: drop.accentColor, opacity: glow }]} />

      <View style={styles.liveCardContent}>
        {/* Top row */}
        <View style={styles.liveTopRow}>
          <View style={styles.liveBadge}>
            <LiveDot />
            <Text style={styles.liveBadgeText}>LIVE NOW</Text>
          </View>
          <View style={styles.tagRow}>
            {drop.tags.map(tag => (
              <View key={tag} style={[styles.tag, { borderColor: drop.accentColor }]}>
                <Text style={[styles.tagText, { color: drop.accentColor }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Artist + item */}
        <Text style={[styles.liveArtist, { color: drop.accentColor }]}>
          {drop.artist.toUpperCase()}
        </Text>
        <Text style={styles.liveItem}>{drop.item}</Text>
        <Text style={styles.livePrice}>${drop.price}</Text>

        {/* Size availability */}
        {drop.sizes && (
          <View style={styles.sizesRow}>
            <Text style={styles.sizesLabel}>SIZES</Text>
            {drop.sizes.map(s => (
              <View key={s} style={styles.sizeChip}>
                <Text style={styles.sizeChipText}>{s}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.liveFooter}>
          <View>
            <Text style={styles.endsLabel}>ENDS IN</Text>
            <Text style={[styles.endsTime, { color: drop.accentColor }]}>
              {timeLeft(drop.endTime)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.buyBtn, { backgroundColor: drop.accentColor }]}
            onPress={onBuy}
            activeOpacity={0.8}
          >
            <Text style={styles.buyBtnText}>BUY NOW</Text>
            <Ionicons name="arrow-forward" size={14} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── Compact card — dropping soon ──────────────────────────────────────────────
function SoonCard({ drop, onPress }) {
  return (
    <TouchableOpacity style={styles.soonCard} onPress={onPress} activeOpacity={0.82}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: drop.imageColor, borderRadius: 14 }]} />
      <View style={[styles.soonAccentBar, { backgroundColor: drop.accentColor }]} />
      <View style={styles.soonContent}>
        <Text style={[styles.soonArtist, { color: drop.accentColor }]} numberOfLines={1}>
          {drop.artist.toUpperCase()}
        </Text>
        <Text style={styles.soonItem} numberOfLines={2}>{drop.item}</Text>
        <Text style={styles.soonPrice}>${drop.price}</Text>
        <View style={styles.soonTimerRow}>
          <Ionicons name="time-outline" size={10} color={colors.textMuted} />
          <Countdown dropTime={drop.dropTime} style={styles.soonTimer} />
        </View>
        {drop.tags.includes('LIMITED') && (
          <View style={[styles.soonTag, { borderColor: drop.accentColor }]}>
            <Text style={[styles.soonTagText, { color: drop.accentColor }]}>LIMITED</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Week list row ─────────────────────────────────────────────────────────────
function WeekRow({ drop, onPress }) {
  return (
    <TouchableOpacity style={styles.weekRow} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.weekDot, { backgroundColor: drop.accentColor }]} />
      <View style={styles.weekInfo}>
        <Text style={styles.weekItem} numberOfLines={1}>{drop.item}</Text>
        <Text style={[styles.weekArtist, { color: drop.accentColor }]}>{drop.artist}</Text>
        {drop.tags.length > 0 && (
          <Text style={styles.weekTagLine}>{drop.tags.join(' · ')}</Text>
        )}
      </View>
      <View style={styles.weekRight}>
        <Text style={styles.weekPrice}>${drop.price}</Text>
        <Text style={styles.weekTime}>{formatTime(drop.dropTime)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { drops }             = useDrops();
  const [refreshing, setRefreshing] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  function onRefresh() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); setTick(n => n + 1); }, 800);
  }

  function openDrop(drop) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    trackBuyClick(drop); // fire-and-forget analytics
    navigation.navigate('ArticleWebView', {
      url: buildAffiliateUrl(drop),
      title: drop.item,
      source: drop.artist,
    });
  }

  const now       = Date.now();
  const liveNow   = drops.filter(d => d.status === 'live' && (!d.endTime || d.endTime > now));
  const soonDrops = drops.filter(d => d.status === 'upcoming' && (d.dropTime - now) < 6 * 3600000 && d.dropTime > now);
  const weekDrops = drops.filter(d => d.status === 'upcoming' && (d.dropTime - now) >= 6 * 3600000);

  const byDay = {};
  weekDrops.forEach(d => {
    const key = formatDropDay(d.dropTime);
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(d);
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            HIP-HOP <Text style={styles.headerAccent}>DROP</Text>
          </Text>
          <Text style={styles.headerSub}>merch · releases · restocks</Text>
        </View>
        <View style={styles.headerRight}>
          {liveNow.length > 0 && (
            <View style={styles.liveCountBadge}>
              <LiveDot />
              <Text style={styles.liveCountText}>{liveNow.length} LIVE</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentTeal} />
        }
      >
        {/* LIVE NOW */}
        {liveNow.map(drop => (
          <LiveCard key={drop.id} drop={drop} onBuy={() => openDrop(drop)} />
        ))}

        {/* DROPPING SOON */}
        {soonDrops.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>DROPPING SOON</Text>
              <View style={styles.rule} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.soonRow}
            >
              {soonDrops.map(drop => (
                <SoonCard key={drop.id} drop={drop} onPress={() => openDrop(drop)} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* THIS WEEK */}
        {Object.keys(byDay).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>THIS WEEK</Text>
              <View style={styles.rule} />
            </View>
            <View style={styles.weekCard}>
              {Object.entries(byDay).map(([day, dayDrops], gi) => (
                <View key={day}>
                  <View style={[styles.dayHeader, gi > 0 && { marginTop: 4 }]}>
                    <Text style={styles.dayHeaderText}>{day}</Text>
                  </View>
                  {dayDrops.map(drop => (
                    <WeekRow key={drop.id} drop={drop} onPress={() => openDrop(drop)} />
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty */}
        {liveNow.length === 0 && soonDrops.length === 0 && weekDrops.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No drops scheduled</Text>
            <Text style={styles.emptySub}>Pull down to refresh</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: colors.background },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22, fontWeight: '900', color: colors.textPrimary,
    letterSpacing: 3, textTransform: 'uppercase',
  },
  headerAccent: { color: colors.accentTeal },
  headerSub: {
    color: colors.textMuted, fontSize: 10, fontWeight: '500',
    letterSpacing: 1.5, marginTop: 2,
  },
  headerRight: { alignItems: 'flex-end' },
  liveCountBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(74,222,128,0.1)', borderWidth: 1,
    borderColor: '#4ade80', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  liveCountText: { color: '#4ade80', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },

  // Live dot
  liveDotWrap: { width: 10, height: 10, justifyContent: 'center', alignItems: 'center' },
  liveDot:     { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ade80', position: 'absolute' },
  liveDotRing: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(74,222,128,0.3)', position: 'absolute' },

  // Section
  section:     { marginBottom: 28 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  sectionTitle: {
    color: colors.textPrimary, fontSize: 10, fontWeight: '900',
    letterSpacing: 3, textTransform: 'uppercase',
  },
  rule: { flex: 1, height: 1, backgroundColor: colors.border },

  // Live card
  liveCard: {
    borderRadius: 18, overflow: 'hidden', marginBottom: 24, minHeight: 260,
  },
  liveCardBg: { ...StyleSheet.absoluteFillObject, opacity: 0.75 },
  liveCardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18, borderWidth: 1.5,
  },
  liveCardContent: { padding: 20 },
  liveTopRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(74,222,128,0.12)', borderWidth: 1,
    borderColor: '#4ade80', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  liveBadgeText: { color: '#4ade80', fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  tagRow: { flexDirection: 'row', gap: 6 },
  tag: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 7, fontWeight: '900', letterSpacing: 1.5 },

  liveArtist: { fontSize: 11, fontWeight: '900', letterSpacing: 3, marginBottom: 4 },
  liveItem:  { color: colors.textPrimary, fontSize: 22, fontWeight: '800', lineHeight: 28, marginBottom: 8 },
  livePrice: { color: colors.textPrimary, fontSize: 34, fontWeight: '900', letterSpacing: -1, marginBottom: 16 },

  sizesRow:    { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 22 },
  sizesLabel:  { color: colors.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 2, marginRight: 2 },
  sizeChip:    { borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 9, paddingVertical: 4 },
  sizeChipText:{ color: colors.textPrimary, fontSize: 10, fontWeight: '600' },

  liveFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  endsLabel:  { color: colors.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 2, marginBottom: 3 },
  endsTime:   { fontSize: 16, fontWeight: '700' },
  buyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 24, paddingHorizontal: 22, paddingVertical: 14,
  },
  buyBtnText: { color: '#000', fontSize: 12, fontWeight: '900', letterSpacing: 2 },

  // Soon cards
  soonRow:  { gap: 10, paddingBottom: 4 },
  soonCard: { width: 160, height: 195, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.surface },
  soonAccentBar: { height: 3, width: '100%' },
  soonContent:   { padding: 12, flex: 1 },
  soonArtist:    { fontSize: 8, fontWeight: '900', letterSpacing: 2, marginBottom: 6 },
  soonItem:      { color: colors.textPrimary, fontSize: 13, fontWeight: '700', lineHeight: 18, marginBottom: 8, flex: 1 },
  soonPrice:     { color: colors.textPrimary, fontSize: 19, fontWeight: '900', letterSpacing: -0.5, marginBottom: 8 },
  soonTimerRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  soonTimer:     { color: colors.accentTeal, fontSize: 11, fontWeight: '700' },
  soonTag:       { borderWidth: 1, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start' },
  soonTagText:   { fontSize: 7, fontWeight: '900', letterSpacing: 1.2 },

  // Week list
  weekCard: {
    backgroundColor: colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  dayHeader:     { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  dayHeaderText: { color: colors.accentTeal, fontSize: 9, fontWeight: '900', letterSpacing: 3 },
  weekRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    borderTopWidth: 1, borderTopColor: colors.border, gap: 12,
  },
  weekDot:    { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  weekInfo:   { flex: 1 },
  weekItem:   { color: colors.textPrimary, fontSize: 13, fontWeight: '700', marginBottom: 2 },
  weekArtist: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  weekTagLine:{ color: colors.textMuted, fontSize: 9, letterSpacing: 0.5 },
  weekRight:  { alignItems: 'flex-end', gap: 2 },
  weekPrice:  { color: colors.textPrimary, fontSize: 14, fontWeight: '800' },
  weekTime:   { color: colors.textMuted, fontSize: 10 },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 100, gap: 10 },
  emptyText:  { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
  emptySub:   { color: colors.textMuted, fontSize: 12 },
});
