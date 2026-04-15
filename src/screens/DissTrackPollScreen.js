import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { DISS_TRACKS, ERA_COLORS } from '../data/dissTracks';
import { subscribeToVotes, castVote, getUserVote } from '../services/dissTrackService';

const SORT_OPTIONS = ['VOTES', 'CLASSIC', 'MODERN', 'UNDERGROUND'];

// ── Animated vote bar ────────────────────────────────────────────────────────
function VoteBar({ pct, color, voted }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={styles.barTrack}>
      <Animated.View
        style={[
          styles.barFill,
          {
            width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
            backgroundColor: color,
            opacity: voted ? 1 : 0.55,
          },
        ]}
      />
    </View>
  );
}

// ── Single diss track card ───────────────────────────────────────────────────
function DissCard({ track, rank, votes, totalVotes, isMyVote, onVote, disabled }) {
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const eraColor   = ERA_COLORS[track.era] || colors.accentTeal;
  const pct        = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

  function handlePress() {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start();
    onVote(track.id);
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          isMyVote && { borderColor: eraColor, backgroundColor: eraColor + '12' },
        ]}
        onPress={handlePress}
        activeOpacity={0.82}
      >
        {/* Rank */}
        <View style={styles.rankCol}>
          <Text style={[styles.rankNum, isMyVote && { color: eraColor }]}>
            {String(rank).padStart(2, '0')}
          </Text>
          {isMyVote && (
            <View style={[styles.myVoteDot, { backgroundColor: eraColor }]} />
          )}
        </View>

        {/* Info */}
        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <View style={[styles.eraPill, { borderColor: eraColor }]}>
              <Text style={[styles.eraText, { color: eraColor }]}>{track.era.toUpperCase()}</Text>
            </View>
            {isMyVote && (
              <View style={[styles.myVoteBadge, { backgroundColor: eraColor }]}>
                <Text style={styles.myVoteBadgeText}>YOUR PICK</Text>
              </View>
            )}
          </View>

          <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
          <Text style={[styles.trackArtist, { color: eraColor }]}>{track.artist}</Text>
          <Text style={styles.trackTarget}>vs {track.target} · {track.year}</Text>

          {/* Quote */}
          <Text style={styles.trackBar} numberOfLines={2}>"{track.bar}"</Text>

          {/* Vote bar */}
          <View style={styles.barRow}>
            <VoteBar pct={pct} color={eraColor} voted={isMyVote} />
            <Text style={[styles.pctText, { color: isMyVote ? eraColor : colors.textMuted }]}>
              {pct}%
            </Text>
          </View>

          <Text style={styles.voteCount}>
            {votes.toLocaleString()} {votes === 1 ? 'vote' : 'votes'}
          </Text>
        </View>

        {/* Vote button */}
        <TouchableOpacity
          style={[
            styles.voteBtn,
            isMyVote
              ? { backgroundColor: eraColor }
              : { borderColor: eraColor, borderWidth: 1 },
          ]}
          onPress={handlePress}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Ionicons
            name={isMyVote ? 'checkmark' : 'chevron-up'}
            size={16}
            color={isMyVote ? '#000' : eraColor}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function DissTrackPollScreen() {
  const [votes,     setVotes]     = useState({});
  const [myVote,    setMyVote]    = useState(null);
  const [sort,      setSort]      = useState('VOTES');
  const [voting,    setVoting]    = useState(false);
  const [loading,   setLoading]   = useState(true);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load user's existing vote
    getUserVote().then(v => { if (v) setMyVote(v); });

    // Subscribe to real-time Firestore vote counts
    const unsubscribe = subscribeToVotes(liveVotes => {
      setVotes(liveVotes);
      setLoading(false);
    });

    // Fade in header
    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    return unsubscribe;
  }, []);

  const totalVotes = Object.values(votes).reduce((s, v) => s + v, 0);

  // Sort tracks
  const sorted = [...DISS_TRACKS].sort((a, b) => {
    if (sort === 'VOTES') {
      const va = votes[a.id] || 0;
      const vb = votes[b.id] || 0;
      if (vb !== va) return vb - va;
      return b.year - a.year; // tiebreak: newer first
    }
    if (sort === 'CLASSIC')     return a.year - b.year;
    if (sort === 'MODERN')      return b.year - a.year;
    if (sort === 'UNDERGROUND') {
      const aU = a.era === 'Underground' ? 0 : 1;
      const bU = b.era === 'Underground' ? 0 : 1;
      if (aU !== bU) return aU - bU;
      return (votes[b.id] || 0) - (votes[a.id] || 0);
    }
    return 0;
  });

  async function handleVote(trackId) {
    if (voting) return;
    setVoting(true);
    try {
      const newVote = await castVote(trackId);
      setMyVote(newVote);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert('Vote failed', 'Could not register your vote. Check your connection.');
    } finally {
      setVoting(false);
    }
  }

  // Leader (most votes)
  const leader = sorted[0];
  const leaderVotes = leader ? (votes[leader.id] || 0) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Crown header ── */}
        <Animated.View style={[styles.crownSection, { opacity: headerAnim }]}>
          <Ionicons name="trophy" size={40} color={colors.accentTeal} style={{ marginBottom: 8 }} />
          <Text style={styles.crownTitle}>GREATEST DISS TRACK</Text>
          <Text style={styles.crownSub}>OF ALL TIME</Text>
          <Text style={styles.crownMeta}>
            {totalVotes.toLocaleString()} votes cast · {DISS_TRACKS.length} contenders
          </Text>

          {/* Current leader banner */}
          {!loading && leader && leaderVotes > 0 && (
            <View style={[styles.leaderBanner, { borderColor: ERA_COLORS[leader.era] }]}>
              <Text style={styles.leaderLabel}>CURRENT LEADER</Text>
              <Text style={[styles.leaderName, { color: ERA_COLORS[leader.era] }]}>
                {leader.title}
              </Text>
              <Text style={styles.leaderArtist}>
                {leader.artist} · {leaderVotes.toLocaleString()} votes
              </Text>
            </View>
          )}
        </Animated.View>

        {/* ── Your vote reminder ── */}
        {myVote && (() => {
          const myTrack = DISS_TRACKS.find(t => t.id === myVote);
          if (!myTrack) return null;
          return (
            <View style={[styles.yourVoteBar, { borderColor: ERA_COLORS[myTrack.era] + '60' }]}>
              <Text style={styles.yourVoteLabel}>YOUR PICK</Text>
              <Text style={[styles.yourVoteTitle, { color: ERA_COLORS[myTrack.era] }]}>
                {myTrack.title}
              </Text>
              <Text style={styles.yourVoteHint}>Tap another to change</Text>
            </View>
          );
        })()}

        {/* ── Sort options ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortRow}
        >
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.sortChip,
                sort === opt && { backgroundColor: colors.accentTeal },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setSort(opt);
              }}
              activeOpacity={0.75}
            >
              <Text style={[
                styles.sortChipText,
                sort === opt ? { color: '#0A0907' } : { color: colors.textMuted },
              ]}>
                {opt === 'VOTES' ? 'RANKED' :
                 opt === 'CLASSIC' ? 'CLASSICS FIRST' :
                 opt === 'MODERN' ? 'NEWEST FIRST' :
                 'UNDERGROUND'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Vote divider ── */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>VOTE BELOW</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── Track list ── */}
        <View style={styles.list}>
          {sorted.map((track, i) => (
            <DissCard
              key={track.id}
              track={track}
              rank={sort === 'VOTES' ? i + 1 : DISS_TRACKS.findIndex(t => t.id === track.id) + 1}
              votes={votes[track.id] || 0}
              totalVotes={totalVotes}
              isMyVote={myVote === track.id}
              onVote={handleVote}
              disabled={voting}
            />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 24 },

  // ── Crown header
  crownSection: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  crownTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  crownSub: {
    color: colors.accentTeal,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginTop: 2,
    marginBottom: 10,
  },
  crownMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 16,
  },
  leaderBanner: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 4,
  },
  leaderLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  leaderName: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  leaderArtist: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },

  // ── Your vote bar
  yourVoteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.surface,
    gap: 10,
  },
  yourVoteLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  yourVoteTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  yourVoteHint: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '400',
    fontStyle: 'italic',
  },

  // ── Sort chips
  sortRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 0,
  },
  sortChipText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  // ── Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 3,
  },

  // ── Card list
  list: {
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },

  // Rank column
  rankCol: {
    width: 32,
    alignItems: 'center',
    gap: 6,
  },
  rankNum: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: -1,
  },
  myVoteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Card body
  cardBody: { flex: 1, gap: 4 },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  eraPill: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  eraText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  myVoteBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  myVoteBadgeText: {
    color: '#000',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  trackTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  trackArtist: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  trackTarget: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '400',
  },
  trackBar: {
    color: 'rgba(237,232,223,0.4)',
    fontSize: 10,
    fontStyle: 'italic',
    lineHeight: 15,
    marginTop: 2,
  },

  // Vote bar
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  barTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  pctText: {
    fontSize: 11,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'right',
  },
  voteCount: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // Vote button
  voteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
});

