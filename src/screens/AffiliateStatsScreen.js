/**
 * Hot Drop — Affiliate Stats
 *
 * Shows live click data from Firestore.
 * Use this to:
 *  - Know which drops drive the most buy intent
 *  - Show brands hard numbers when pitching deals
 *  - Spot which affiliate programs to join first
 *
 * Access: Profile → About → hidden tap (or add to dev menu)
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  StatusBar, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  collection, query, orderBy, limit, getDocs, where, Timestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { colors } from '../theme/colors';

export default function AffiliateStatsScreen({ navigation }) {
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);
  const [byArtist, setByArtist] = useState([]);
  const [recent,   setRecent]   = useState([]);
  const [period,   setPeriod]   = useState('7d'); // '24h' | '7d' | '30d'

  useEffect(() => { loadStats(); }, [period]);

  async function loadStats() {
    setLoading(true);
    try {
      const since = new Date();
      if (period === '24h') since.setHours(since.getHours() - 24);
      else if (period === '7d') since.setDate(since.getDate() - 7);
      else since.setDate(since.getDate() - 30);

      const ref = collection(db, 'affiliate_clicks');
      const q   = query(ref, where('timestamp', '>=', Timestamp.fromDate(since)));
      const snap = await getDocs(q);

      const docs = snap.docs.map(d => d.data());
      setTotal(docs.length);

      // Group by artist
      const artistMap = {};
      docs.forEach(d => {
        if (!artistMap[d.artist]) artistMap[d.artist] = { clicks: 0, gmv: 0 };
        artistMap[d.artist].clicks++;
        artistMap[d.artist].gmv += d.price || 0;
      });
      const sorted = Object.entries(artistMap)
        .map(([artist, v]) => ({ artist, ...v }))
        .sort((a, b) => b.clicks - a.clicks);
      setByArtist(sorted);

      // Recent 10
      const recentQ = query(ref, orderBy('timestamp', 'desc'), limit(10));
      const recentSnap = await getDocs(recentQ);
      setRecent(recentSnap.docs.map(d => d.data()));
    } catch (e) {
      console.warn('Stats load error:', e);
    } finally {
      setLoading(false);
    }
  }

  const totalGmv = byArtist.reduce((s, r) => s + r.gmv, 0);
  // Conservative 5% blended rate estimate
  const estEarnings = (totalGmv * 0.05).toFixed(2);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AFFILIATE STATS</Text>
        <TouchableOpacity onPress={loadStats} style={styles.back} activeOpacity={0.7}>
          <Ionicons name="refresh" size={20} color={colors.accentTeal} />
        </TouchableOpacity>
      </View>

      {/* Period picker */}
      <View style={styles.periodRow}>
        {['24h', '7d', '30d'].map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            onPress={() => setPeriod(p)}
            activeOpacity={0.7}
          >
            <Text style={[styles.periodLabel, period === p && styles.periodLabelActive]}>
              {p === '24h' ? 'TODAY' : p === '7d' ? '7 DAYS' : '30 DAYS'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accentTeal} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Summary cards */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{total}</Text>
              <Text style={styles.summaryLabel}>BUY TAPS</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: colors.accentTeal }]}>
                ${totalGmv.toLocaleString()}
              </Text>
              <Text style={styles.summaryLabel}>GMV DRIVEN</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: '#4ade80' }]}>
                ~${estEarnings}
              </Text>
              <Text style={styles.summaryLabel}>EST. EARNED</Text>
            </View>
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              Est. earnings assume 5% blended rate. Actual varies by program.
              Activate IDs in affiliateConfig.js to start collecting.
            </Text>
          </View>

          {/* By artist */}
          {byArtist.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>BY BRAND / ARTIST</Text>
              {byArtist.map((row, i) => (
                <View key={row.artist} style={styles.rankRow}>
                  <Text style={styles.rankNum}>{i + 1}</Text>
                  <View style={styles.rankInfo}>
                    <Text style={styles.rankArtist}>{row.artist}</Text>
                    <Text style={styles.rankSub}>${row.gmv.toLocaleString()} GMV</Text>
                  </View>
                  <View style={styles.rankRight}>
                    <Text style={styles.rankClicks}>{row.clicks}</Text>
                    <Text style={styles.rankClicksLabel}>taps</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Recent taps */}
          {recent.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>RECENT TAPS</Text>
              {recent.map((r, i) => (
                <View key={i} style={styles.recentRow}>
                  <View style={styles.recentDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentItem} numberOfLines={1}>{r.item}</Text>
                    <Text style={styles.recentArtist}>{r.artist} · ${r.price}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {total === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyText}>No clicks yet in this period.</Text>
              <Text style={styles.emptySubText}>
                Taps on BUY NOW and VIEW DROP will appear here.
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  back:        { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: colors.textPrimary, fontSize: 13, fontWeight: '800', letterSpacing: 3 },

  periodRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8,
  },
  periodBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 3,
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, alignItems: 'center',
  },
  periodBtnActive:  { borderColor: colors.accentTeal, backgroundColor: 'rgba(224,123,10,0.08)' },
  periodLabel:      { color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  periodLabelActive:{ color: colors.accentTeal },

  scroll: { padding: 16 },

  summaryRow:  { flexDirection: 'row', gap: 10, marginBottom: 12 },
  summaryCard: {
    flex: 1, backgroundColor: colors.surface,
    borderRadius: 3, borderWidth: 1, borderColor: colors.border,
    padding: 14, alignItems: 'center',
  },
  summaryValue: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  summaryLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 1.5 },

  noteBox: {
    backgroundColor: colors.surface, borderRadius: 3,
    borderWidth: 1, borderColor: colors.border,
    padding: 12, marginBottom: 24,
  },
  noteText: { color: colors.textMuted, fontSize: 10, lineHeight: 16 },

  section:      { marginBottom: 28 },
  sectionTitle: {
    color: colors.textMuted, fontSize: 9, fontWeight: '800',
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12,
  },

  rankRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12,
  },
  rankNum:          { color: colors.accentTeal, fontSize: 14, fontWeight: '700', width: 20, textAlign: 'center' },
  rankInfo:         { flex: 1 },
  rankArtist:       { color: colors.textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  rankSub:          { color: colors.textMuted, fontSize: 11 },
  rankRight:        { alignItems: 'center' },
  rankClicks:       { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  rankClicksLabel:  { color: colors.textMuted, fontSize: 9, fontWeight: '600', letterSpacing: 1 },

  recentRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12,
  },
  recentDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accentTeal },
  recentItem:   { color: colors.textPrimary, fontSize: 13, fontWeight: '500', marginBottom: 2 },
  recentArtist: { color: colors.textMuted, fontSize: 11 },

  emptyState:  { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText:   { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  emptySubText:{ color: colors.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
