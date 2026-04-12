import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';

function getPercent(votes, total) {
  if (total === 0) return 0;
  return Math.round((votes / total) * 100);
}

function VoteBar({ percent, color, animated }) {
  const width = animated.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });
  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFill, { width, backgroundColor: color }]} />
    </View>
  );
}

export default function PollCard({ poll }) {
  const [voted, setVoted] = useState(null);
  const [localVotes, setLocalVotes] = useState({});
  const [anims] = useState(() => {
    const obj = {};
    ['A', 'B', 'C', 'D'].forEach(k => { obj[k] = new Animated.Value(0); });
    return obj;
  });

  const storageKey = `poll_vote_${poll.id}`;

  useEffect(() => {
    // Load saved vote
    AsyncStorage.getItem(storageKey).then(saved => {
      if (saved) {
        setVoted(saved);
        initVotes(saved);
      }
    });
  }, []);

  function initVotes(votedKey) {
    const initial = buildVotes(votedKey);
    const total = Object.values(initial).reduce((a, b) => a + b, 0);
    setLocalVotes(initial);
    animateBars(initial, total);
  }

  function buildVotes(votedKey) {
    const base = {
      A: poll.optionA?.votes || 0,
      B: poll.optionB?.votes || 0,
      C: poll.optionC?.votes || 0,
      D: poll.optionD?.votes || 0,
    };
    if (votedKey) base[votedKey] = (base[votedKey] || 0) + 1;
    return base;
  }

  function animateBars(votes, total) {
    const animations = Object.keys(votes).map(key =>
      Animated.timing(anims[key], {
        toValue: getPercent(votes[key], total),
        duration: 600,
        useNativeDriver: false,
      })
    );
    Animated.parallel(animations).start();
  }

  async function handleVote(option) {
    if (voted) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const updated = buildVotes(option);
    const total = Object.values(updated).reduce((a, b) => a + b, 0);
    setVoted(option);
    setLocalVotes(updated);
    animateBars(updated, total);
    await AsyncStorage.setItem(storageKey, option);
  }

  const options = [
    poll.optionA && { key: 'A', ...poll.optionA },
    poll.optionB && { key: 'B', ...poll.optionB },
    poll.optionC && { key: 'C', ...poll.optionC },
    poll.optionD && { key: 'D', ...poll.optionD },
  ].filter(Boolean);

  const totalVotes = Object.values(localVotes).reduce((a, b) => a + b, 0);
  const isTwoOption = options.length === 2;

  const optionColors = ['#00C4B4', '#a855f7', '#14b8a6', '#f87171'];

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.typeBadge, poll.type === 'beef' && styles.beefBadge,
          poll.type === 'awards' && styles.awardsBadge,
          poll.type === 'versus' && styles.versusBadge]}>
          <Text style={styles.typeBadgeText}>
            {poll.type === 'beef' ? '🔥 BEEF' : poll.type === 'awards' ? '🏆 AWARDS' : '⚔️ VERSUS'}
          </Text>
        </View>
        {voted && (
          <Text style={styles.totalVotes}>
            {totalVotes.toLocaleString()} votes
          </Text>
        )}
      </View>

      <Text style={styles.question}>{poll.question}</Text>
      <Text style={styles.subtitle}>{poll.subtitle}</Text>

      {/* Two-option layout (beef/versus 2) */}
      {isTwoOption ? (
        <View style={styles.twoOptionRow}>
          {options.map((opt, i) => {
            const pct = voted ? getPercent(localVotes[opt.key], totalVotes) : null;
            const isWinner = voted && localVotes[opt.key] === Math.max(...Object.values(localVotes));
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.twoOptionBtn,
                  { backgroundColor: opt.colorBg },
                  voted && voted === opt.key && styles.votedBorder,
                  i === 0 ? { marginRight: 6 } : { marginLeft: 6 },
                ]}
                onPress={() => handleVote(opt.key)}
                activeOpacity={0.8}
                disabled={!!voted}
              >
                <Text style={styles.optionLabel} numberOfLines={2}>{opt.label}</Text>
                {opt.sublabel && <Text style={styles.optionSublabel}>{opt.sublabel}</Text>}
                {voted ? (
                  <View style={styles.pctRow}>
                    <Text style={[styles.pctText, { color: optionColors[i] }]}>{pct}%</Text>
                    {isWinner && <Text style={styles.winnerCrown}>👑</Text>}
                  </View>
                ) : (
                  <Text style={styles.tapToVote}>Tap to vote</Text>
                )}
                {voted && (
                  <VoteBar
                    percent={pct}
                    color={optionColors[i]}
                    animated={anims[opt.key]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        // Multi-option layout (awards)
        <View style={styles.multiOptions}>
          {options.map((opt, i) => {
            const pct = voted ? getPercent(localVotes[opt.key], totalVotes) : null;
            const isWinner = voted && localVotes[opt.key] === Math.max(...Object.values(localVotes));
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.multiOptionBtn,
                  voted && voted === opt.key && styles.votedBorderLeft,
                  { borderLeftColor: optionColors[i] },
                ]}
                onPress={() => handleVote(opt.key)}
                activeOpacity={0.8}
                disabled={!!voted}
              >
                <View style={styles.multiOptionRow}>
                  <View style={[styles.optionDot, { backgroundColor: optionColors[i] }]} />
                  <View style={styles.multiOptionInfo}>
                    <Text style={styles.multiOptionLabel}>{opt.label}</Text>
                    {voted && (
                      <View style={styles.multiPctRow}>
                        <VoteBar
                          percent={pct}
                          color={optionColors[i]}
                          animated={anims[opt.key]}
                        />
                        <Text style={[styles.multiPct, { color: optionColors[i] }]}>{pct}%</Text>
                        {isWinner && <Text style={styles.winnerCrown}>👑</Text>}
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {!voted && (
        <Text style={styles.votePrompt}>Cast your vote</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#2a1a0e',
  },
  beefBadge: { backgroundColor: '#2a0e0e' },
  awardsBadge: { backgroundColor: '#1a1a0e' },
  versusBadge: { backgroundColor: '#0e1a2a' },
  typeBadgeText: {
    color: colors.accentTeal,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  totalVotes: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '400',
  },
  question: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 14,
  },
  twoOptionRow: {
    flexDirection: 'row',
    gap: 0,
  },
  twoOptionBtn: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 90,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  votedBorder: {
    borderColor: colors.accentTeal,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  optionSublabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '400',
    marginTop: 2,
  },
  pctRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  pctText: {
    fontSize: 20,
    fontWeight: '500',
  },
  winnerCrown: {
    fontSize: 16,
  },
  tapToVote: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '400',
    marginTop: 8,
  },
  barTrack: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  multiOptions: {
    gap: 8,
  },
  multiOptionBtn: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.accentTeal,
  },
  votedBorderLeft: {
    borderWidth: 1,
    borderColor: colors.accentTeal,
  },
  multiOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  multiOptionInfo: {
    flex: 1,
  },
  multiOptionLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  multiPctRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  multiPct: {
    fontSize: 13,
    fontWeight: '500',
  },
  votePrompt: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 12,
  },
});
