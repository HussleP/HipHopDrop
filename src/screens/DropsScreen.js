import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { DROPS, CATEGORY_FILTERS } from '../data/drops';

const NOTIFY_KEY = 'drop_notifications';

function pad(n) { return String(n).padStart(2, '0'); }

function timeUntil(ts) {
  const diff = ts - Date.now();
  if (diff <= 0) return 'LIVE';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h >= 24) { const d = Math.floor(h / 24); return `${d}d ${h % 24}h`; }
  if (h > 0)   return `${pad(h)}h ${pad(m)}m`;
  return `${pad(m)}:${pad(s)}`;
}

function formatDropDay(ts) {
  const d        = new Date(ts);
  const today    = new Date();
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString())    return 'TODAY';
  if (d.toDateString() === tomorrow.toDateString()) return 'TOMORROW';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// ── Countdown ticking label ───────────────────────────────────────────────────
function CountdownBadge({ dropTime, accentColor }) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    const update = () => setLabel(timeUntil(dropTime));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [dropTime]);

  const isLive = label === 'LIVE';
  return (
    <View style={[
      styles.countdownBadge,
      { borderColor: isLive ? '#4ade80' : accentColor },
      isLive && { backgroundColor: 'rgba(74,222,128,0.1)' },
    ]}>
      {isLive && <View style={styles.liveDot} />}
      <Text style={[styles.countdownText, { color: isLive ? '#4ade80' : accentColor }]}>
        {label}
      </Text>
    </View>
  );
}

// ── Full drop card in calendar list ──────────────────────────────────────────
function DropCard({ drop, notified, onNotify, onBuy }) {
  return (
    <View style={[styles.dropCard, { borderLeftColor: drop.accentColor, borderLeftWidth: 3 }]}>
      {/* Main info */}
      <View style={styles.dropCardTop}>
        <View style={styles.dropCardMain}>
          <Text style={[styles.dropArtist, { color: drop.accentColor }]}>
            {drop.artist.toUpperCase()}
          </Text>
          <Text style={styles.dropItem}>{drop.item}</Text>
          <Text style={styles.dropPrice}>${drop.price}</Text>

          {/* Tags */}
          {drop.tags.length > 0 && (
            <View style={styles.dropTags}>
              {drop.tags.map(t => (
                <View key={t} style={[styles.dropTag, { borderColor: drop.accentColor }]}>
                  <Text style={[styles.dropTagText, { color: drop.accentColor }]}>{t}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Sizes */}
          {drop.sizes && (
            <View style={styles.dropSizes}>
              <Text style={styles.dropSizesLabel}>SIZES  </Text>
              {drop.sizes.map(s => (
                <Text key={s} style={styles.dropSizeItem}>{s}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Right: time + notify */}
        <View style={styles.dropCardRight}>
          <CountdownBadge dropTime={drop.dropTime} accentColor={drop.accentColor} />
          <Text style={styles.dropTime}>{formatTime(drop.dropTime)}</Text>
          <TouchableOpacity
            style={[styles.notifyBtn, notified && { backgroundColor: drop.accentColor + '22', borderColor: drop.accentColor }]}
            onPress={onNotify}
            activeOpacity={0.75}
          >
            <Ionicons
              name={notified ? 'notifications' : 'notifications-outline'}
              size={14}
              color={notified ? drop.accentColor : colors.textMuted}
            />
            <Text style={[styles.notifyBtnText, notified && { color: drop.accentColor }]}>
              {notified ? 'ON' : 'NOTIFY'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Buy button */}
      <TouchableOpacity
        style={[styles.dropBuyBtn, { borderColor: drop.accentColor }]}
        onPress={onBuy}
        activeOpacity={0.8}
      >
        <Text style={[styles.dropBuyBtnText, { color: drop.accentColor }]}>VIEW DROP</Text>
        <Ionicons name="arrow-forward" size={12} color={drop.accentColor} />
      </TouchableOpacity>
    </View>
  );
}

// ── Ended drop — minimal row ──────────────────────────────────────────────────
function EndedRow({ drop }) {
  return (
    <View style={styles.endedRow}>
      <View style={[styles.endedDot, { backgroundColor: colors.textMuted }]} />
      <View style={styles.endedInfo}>
        <Text style={styles.endedItem}>{drop.item}</Text>
        <Text style={styles.endedArtist}>{drop.artist}</Text>
      </View>
      <View style={styles.endedRight}>
        <Text style={styles.endedPrice}>${drop.price}</Text>
        <View style={styles.soldOutBadge}>
          <Text style={styles.soldOutText}>ENDED</Text>
        </View>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function DropsScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(NOTIFY_KEY).then(raw => {
      if (raw) setNotifications(JSON.parse(raw));
    });
    const t = setInterval(() => setTick(n => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  async function toggleNotify(dropId) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = { ...notifications, [dropId]: !notifications[dropId] };
    setNotifications(updated);
    await AsyncStorage.setItem(NOTIFY_KEY, JSON.stringify(updated));
  }

  function openDrop(drop) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('ArticleWebView', {
      url: drop.buyUrl, title: drop.item, source: drop.artist,
    });
  }

  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); setTick(n => n + 1); }, 800);
  }

  // Filter logic
  const now = Date.now();
  const upcoming = DROPS.filter(d =>
    d.status !== 'ended' &&
    (activeFilter === 'all' || d.category === activeFilter)
  );
  const ended = DROPS.filter(d =>
    d.status === 'ended' &&
    (activeFilter === 'all' || d.category === activeFilter)
  );

  // Group upcoming by day
  const byDay = {};
  upcoming.forEach(d => {
    const key = formatDropDay(d.dropTime);
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(d);
  });

  const notifyCount = Object.values(notifications).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          DROP <Text style={styles.headerAccent}>CALENDAR</Text>
        </Text>
        {notifyCount > 0 && (
          <View style={styles.notifyCountBadge}>
            <Ionicons name="notifications" size={12} color={colors.accentTeal} />
            <Text style={styles.notifyCountText}>{notifyCount} ALERTS ON</Text>
          </View>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        style={styles.filtersScroll}
      >
        {CATEGORY_FILTERS.map(f => {
          const active = activeFilter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => { Haptics.selectionAsync(); setActiveFilter(f.id); }}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentTeal} />
        }
      >
        {/* Upcoming drops grouped by day */}
        {Object.entries(byDay).map(([day, dayDrops]) => (
          <View key={day} style={styles.daySection}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayHeaderText}>{day}</Text>
              <View style={styles.dayRule} />
              <Text style={styles.dayDropCount}>{dayDrops.length} DROP{dayDrops.length !== 1 ? 'S' : ''}</Text>
            </View>
            {dayDrops.map(drop => (
              <DropCard
                key={drop.id}
                drop={drop}
                notified={!!notifications[drop.id]}
                onNotify={() => toggleNotify(drop.id)}
                onBuy={() => openDrop(drop)}
              />
            ))}
          </View>
        ))}

        {/* Ended drops */}
        {ended.length > 0 && (
          <View style={styles.daySection}>
            <View style={styles.dayHeader}>
              <Text style={[styles.dayHeaderText, { color: colors.textMuted }]}>RECENTLY ENDED</Text>
              <View style={styles.dayRule} />
            </View>
            <View style={styles.endedCard}>
              {ended.map(drop => (
                <EndedRow key={drop.id} drop={drop} />
              ))}
            </View>
          </View>
        )}

        {upcoming.length === 0 && ended.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No drops in this category</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: colors.background },
  scroll:{ flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22, fontWeight: '900', color: colors.textPrimary,
    letterSpacing: 3, textTransform: 'uppercase',
  },
  headerAccent: { color: colors.accentTeal },
  notifyCountBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.accentTeal + '18', borderWidth: 1,
    borderColor: colors.accentTeal, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  notifyCountText: { color: colors.accentTeal, fontSize: 8, fontWeight: '900', letterSpacing: 1 },

  // Filters
  filtersScroll: { maxHeight: 50 },
  filtersRow:    { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.accentTeal, borderColor: colors.accentTeal },
  filterChipText:       { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  filterChipTextActive: { color: '#000' },

  // Day section
  daySection:    { marginBottom: 24 },
  dayHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 12,
  },
  dayHeaderText: {
    color: colors.accentTeal, fontSize: 10, fontWeight: '900',
    letterSpacing: 2.5, flexShrink: 0,
  },
  dayRule:      { flex: 1, height: 1, backgroundColor: colors.border },
  dayDropCount: { color: colors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1, flexShrink: 0 },

  // Drop card
  dropCard: {
    backgroundColor: colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: 10, overflow: 'hidden', padding: 16,
  },
  dropCardTop:  { flexDirection: 'row', gap: 12, marginBottom: 14 },
  dropCardMain: { flex: 1 },
  dropArtist:   { fontSize: 9, fontWeight: '900', letterSpacing: 2.5, marginBottom: 5 },
  dropItem:     { color: colors.textPrimary, fontSize: 16, fontWeight: '800', lineHeight: 22, marginBottom: 6 },
  dropPrice:    { color: colors.textPrimary, fontSize: 22, fontWeight: '900', letterSpacing: -0.5, marginBottom: 10 },
  dropTags:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  dropTag:      { borderWidth: 1, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  dropTagText:  { fontSize: 7, fontWeight: '900', letterSpacing: 1.5 },
  dropSizes:    { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  dropSizesLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  dropSizeItem:   { color: colors.textMuted, fontSize: 10, fontWeight: '500' },

  dropCardRight: { alignItems: 'flex-end', gap: 8, minWidth: 80 },
  countdownBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  liveDot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' },
  countdownText:{ fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  dropTime:     { color: colors.textMuted, fontSize: 10, fontWeight: '500', textAlign: 'right' },
  notifyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 5,
  },
  notifyBtnText: { color: colors.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 1 },

  dropBuyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1, borderRadius: 10,
    paddingVertical: 10,
  },
  dropBuyBtnText: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },

  // Ended section
  endedCard: {
    backgroundColor: colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  endedRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10,
  },
  endedDot:    { width: 6, height: 6, borderRadius: 3 },
  endedInfo:   { flex: 1 },
  endedItem:   { color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  endedArtist: { color: colors.textMuted, fontSize: 10 },
  endedRight:  { alignItems: 'flex-end', gap: 4 },
  endedPrice:  { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  soldOutBadge:{ backgroundColor: colors.border, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  soldOutText: { color: colors.textMuted, fontSize: 7, fontWeight: '900', letterSpacing: 1.5 },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText:  { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
});
