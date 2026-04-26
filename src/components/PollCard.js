import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { subscribeToReactions, getUserReaction, toggleReaction } from '../services/interactionsService';
import { isReposted, toggleRepost } from '../services/repostService';
import CommentsSheet from './CommentsSheet';

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
  const [reactions,    setReactions]    = useState({ likes: 0, dislikes: 0 });
  const [userReaction, setUserReaction] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [reposted,     setReposted]     = useState(false);

  const storageKey = `poll_vote_${poll.id}`;

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then(saved => {
      if (saved) {
        setVoted(saved);
        initVotes(saved);
      }
    });
    getUserReaction(poll.id).then(setUserReaction);
    isReposted(poll.id).then(setReposted);
    const unsub = subscribeToReactions(poll.id, setReactions);
    return unsub;
  }, []);

  function initVotes(votedKey) {
    const initial = buildVotes(votedKey);
    const total = Object.values(initial).reduce((a, b) => a + b, 0);
    setLocalVotes(initial);
    animateBars(initial, total);
  }

  function buildVotes(newVote, prevVote) {
    const base = {
      A: poll.optionA?.votes || 0,
      B: poll.optionB?.votes || 0,
      C: poll.optionC?.votes || 0,
      D: poll.optionD?.votes || 0,
    };
    // Add new vote
    if (newVote) base[newVote] = (base[newVote] || 0) + 1;
    // Remove old vote when changing
    if (prevVote && prevVote !== newVote) base[prevVote] = Math.max(0, (base[prevVote] || 0) - 1);
    return base;
  }

  function animateBars(votes, total) {
    const animations = Object.keys(votes).map(key =>
      Animated.timing(anims[key], {
        toValue: getPercent(votes[key], total),
        duration: 500,
        useNativeDriver: false,
      })
    );
    Animated.parallel(animations).start();
  }

  async function handleVote(option) {
    // Tapping the same option a second time does nothing
    if (voted === option) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const prevVote = voted;
    const updated  = buildVotes(option, prevVote);
    const total    = Object.values(updated).reduce((a, b) => a + b, 0);
    setVoted(option);
    setLocalVotes(updated);
    animateBars(updated, total);
    await AsyncStorage.setItem(storageKey, option);
  }

  async function handleShare() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const options = [
      poll.optionA,
      poll.optionB,
      poll.optionC,
      poll.optionD,
    ].filter(Boolean);

    const total = Object.values(localVotes).reduce((a, b) => a + b, 0);

    let message = `🎤 Hot Drop Poll\n\n"${poll.question}"\n${poll.subtitle}\n\n`;

    if (voted && total > 0) {
      options.forEach((opt, i) => {
        const key = ['A', 'B', 'C', 'D'][i];
        const pct = getPercent(localVotes[key] || 0, total);
        const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
        message += `${opt.label}\n${bar} ${pct}%\n\n`;
      });
      message += `${total.toLocaleString()} votes cast\n\n`;
    } else {
      options.forEach(opt => {
        message += `• ${opt.label}\n`;
      });
      message += '\nCast your vote on Hot Drop 🔥';
    }

    try {
      await Share.share({ message });
    } catch (err) {
      console.warn('Share error:', err);
    }
  }

  async function handleReaction(type) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = userReaction === type ? null : type;
    setUserReaction(next);
    await toggleReaction(poll.id, type);
  }

  const options = [
    poll.optionA && { key: 'A', ...poll.optionA },
    poll.optionB && { key: 'B', ...poll.optionB },
    poll.optionC && { key: 'C', ...poll.optionC },
    poll.optionD && { key: 'D', ...poll.optionD },
  ].filter(Boolean);

  const totalVotes = Object.values(localVotes).reduce((a, b) => a + b, 0);
  const isTwoOption = options.length === 2;

  const optionColors = ['#E07B0A', '#00C4D4', '#a855f7', '#E8305A'];

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.typeBadge, poll.type === 'beef' && styles.beefBadge,
          poll.type === 'awards' && styles.awardsBadge,
          poll.type === 'versus' && styles.versusBadge]}>
          <Text style={styles.typeBadgeText}>
            {poll.type === 'beef' ? 'BEEF' : poll.type === 'awards' ? 'AWARDS' : 'VERSUS'}
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

      {/* Footer row */}
      <View style={styles.footer}>
        {/* Like / Dislike pill pair */}
        <View style={styles.reactionGroup}>
          <TouchableOpacity
            style={styles.reactionBtn}
            onPress={() => handleReaction('like')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={userReaction === 'like' ? 'chevron-up' : 'chevron-up-outline'}
              size={14}
              color={userReaction === 'like' ? colors.accentTeal : colors.textMuted}
            />
            {reactions.likes > 0 && (
              <Text style={[styles.reactionCount, userReaction === 'like' && { color: colors.accentTeal }]}>
                {reactions.likes}
              </Text>
            )}
          </TouchableOpacity>
          <View style={styles.reactionDivider} />
          <TouchableOpacity
            style={styles.reactionBtn}
            onPress={() => handleReaction('dislike')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={userReaction === 'dislike' ? 'chevron-down' : 'chevron-down-outline'}
              size={14}
              color={userReaction === 'dislike' ? colors.neonPink : colors.textMuted}
            />
            {reactions.dislikes > 0 && (
              <Text style={[styles.reactionCount, userReaction === 'dislike' && { color: colors.neonPink }]}>
                {reactions.dislikes}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Vote count or prompt */}
        <Text style={styles.votePrompt}>
          {!voted
            ? 'Cast your vote'
            : `${Object.values(localVotes).reduce((a, b) => a + b, 0).toLocaleString()} votes`}
        </Text>

        {/* Comments */}
        <TouchableOpacity
          style={styles.footerIconBtn}
          onPress={() => { Haptics.selectionAsync(); setShowComments(true); }}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={17} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Repost */}
        <TouchableOpacity
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const now = await toggleRepost({
              id:         poll.id,
              type:       'poll',
              title:      poll.question,
              subtitle:   poll.subtitle,
              accentColor: '#E07B0A',
              category:   poll.type,
            });
            setReposted(now);
          }}
          style={styles.footerIconBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="repeat" size={17} color={reposted ? colors.green : colors.textMuted} />
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-redo-outline" size={14} color={colors.accentTeal} />
          <Text style={styles.shareLabel}>SHARE</Text>
        </TouchableOpacity>
      </View>

      <CommentsSheet
        visible={showComments}
        onClose={() => setShowComments(false)}
        contentId={poll.id}
        contentTitle={poll.question}
      />
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
    borderRadius: 3,
    backgroundColor: '#2A1A08',
    borderWidth: 1,
    borderColor: '#3A2A10',
  },
  beefBadge: { backgroundColor: '#2A0E10', borderColor: '#3A1018' },
  awardsBadge: { backgroundColor: '#2A2008', borderColor: '#3A3010' },
  versusBadge: { backgroundColor: '#0A1A2A', borderColor: '#102030' },
  typeBadgeText: {
    color: colors.accentTeal,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1C1814',
  },
  reactionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2520',
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 2,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  reactionDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#2D2520',
  },
  reactionCount: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  votePrompt: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  footerIconBtn: {
    padding: 6,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2D2520',
  },
  shareLabel: {
    color: colors.accentTeal,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
