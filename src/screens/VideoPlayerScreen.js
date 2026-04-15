import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubeIframe from 'react-native-youtube-iframe';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import CommentsSheet from '../components/CommentsSheet';
import { subscribeToReactions, getUserReaction, toggleReaction } from '../services/interactionsService';
import { isReposted, toggleRepost } from '../services/repostService';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const PLAYER_HEIGHT = width * (9 / 16);

function RelatedVideoCard({ video, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.relatedCard} activeOpacity={0.8}>
      <View style={styles.relatedThumbWrap}>
        <View style={styles.relatedThumb}>
          {/* Use colored background as placeholder — actual thumbnail via Image */}
          <Ionicons name="play" size={16} color={colors.textMuted} />
        </View>
        <View style={styles.relatedDuration}>
          <Text style={styles.relatedDurationText}>{video.duration}</Text>
        </View>
      </View>
      <View style={styles.relatedInfo}>
        <Text style={styles.relatedTitle} numberOfLines={2}>{video.title}</Text>
        <Text style={[styles.relatedArtist, { color: video.accentColor }]}>{video.artist}</Text>
        <Text style={styles.relatedViews}>{video.views} views</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function VideoPlayerScreen({ route, navigation }) {
  const { video, allVideos = [] } = route.params;
  const [playing,      setPlaying]      = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [reactions,    setReactions]    = useState({ likes: 0, dislikes: 0 });
  const [userReaction, setUserReaction] = useState(null);
  const [reposted,     setReposted]     = useState(false);
  const playerRef = useRef(null);

  // Load reactions and pause video when screen loses focus
  useFocusEffect(
    useCallback(() => {
      getUserReaction(video.id).then(setUserReaction);
      isReposted(video.id).then(setReposted);
      const unsub = subscribeToReactions(video.id, setReactions);

      return () => {
        unsub();
        setPlaying(false); // pause when navigating away
      };
    }, [video.id])
  );

  const onStateChange = useCallback((state) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

  async function handleReaction(type) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = userReaction === type ? null : type;
    setUserReaction(next);
    await toggleReaction(video.id, type);
  }

  async function handleShare() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `🎬 ${video.title} — ${video.artist}\n\nWatch on YouTube: https://youtu.be/${video.videoId}\n\nVia Hip-Hop Drop`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  }

  async function handleRepost() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const nowReposted = await toggleRepost({
      id:         video.id,
      type:       'video',
      title:      video.title,
      subtitle:   `${video.artist} · ${video.views} views`,
      imageUrl:   `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`,
      accentColor: video.accentColor,
      videoId:    video.videoId,
    });
    setReposted(nowReposted);
  }

  // Related videos — same category, excluding current (from the loaded list)
  const related = allVideos
    .filter(v => v.id !== video.id)
    .slice(0, 4);

  const totalReactions = reactions.likes + reactions.dislikes;
  const likePct = totalReactions > 0 ? Math.round((reactions.likes / totalReactions) * 100) : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Player — pinned at top */}
      <View style={styles.playerWrap}>
        <YoutubeIframe
          ref={playerRef}
          height={PLAYER_HEIGHT}
          width={width}
          videoId={video.videoId}
          play={playing}
          onChangeState={onStateChange}
          initialPlayerParams={{
            controls: true,
            modestbranding: true,
            rel: false,       // don't show unrelated videos at end
            showinfo: false,
          }}
          webViewStyle={{ backgroundColor: '#000' }}
        />

        {/* Back button overlaid on player */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            setPlaying(false);
            navigation.goBack();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Video info */}
        <View style={styles.infoBlock}>
          {/* Category + date */}
          <View style={styles.metaRow}>
            <View style={[styles.catBadge, { borderColor: video.accentColor }]}>
              <Text style={[styles.catBadgeText, { color: video.accentColor }]}>
                {video.category.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.metaText}>{video.uploadDate}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{video.views} views</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{video.duration}</Text>
          </View>

          <Text style={styles.videoTitle}>{video.title}</Text>
          <Text style={[styles.artistName, { color: video.accentColor }]}>{video.artist}</Text>

          {/* Description */}
          <Text style={styles.description}>{video.description}</Text>
        </View>

        {/* Action bar */}
        <View style={styles.actionBar}>
          {/* Like / Dislike pill pair */}
          <View style={styles.reactionGroup}>
            <TouchableOpacity
              style={styles.reactionBtn}
              onPress={() => handleReaction('like')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={userReaction === 'like' ? 'chevron-up' : 'chevron-up-outline'}
                size={16}
                color={userReaction === 'like' ? colors.accentTeal : colors.textMuted}
              />
              <Text style={[styles.reactionCount, userReaction === 'like' && { color: colors.accentTeal }]}>
                {reactions.likes > 0 ? reactions.likes.toLocaleString() : 'UP'}
              </Text>
            </TouchableOpacity>
            <View style={styles.reactionDivider} />
            <TouchableOpacity
              style={styles.reactionBtn}
              onPress={() => handleReaction('dislike')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={userReaction === 'dislike' ? 'chevron-down' : 'chevron-down-outline'}
                size={16}
                color={userReaction === 'dislike' ? colors.neonPink : colors.textMuted}
              />
              <Text style={[styles.reactionCount, userReaction === 'dislike' && { color: colors.neonPink }]}>
                {reactions.dislikes > 0 ? reactions.dislikes.toLocaleString() : 'DOWN'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Like ratio bar */}
          {likePct !== null && (
            <View style={styles.ratioWrap}>
              <View style={styles.ratioTrack}>
                <View style={[styles.ratioLike, { width: `${likePct}%` }]} />
                <View style={[styles.ratioDislike, { width: `${100 - likePct}%` }]} />
              </View>
              <Text style={styles.ratioLabel}>{totalReactions.toLocaleString()} reactions</Text>
            </View>
          )}

          {/* Comments */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => { Haptics.selectionAsync(); setShowComments(true); }}
            activeOpacity={0.75}
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
            <Text style={styles.actionCount}>TALK</Text>
          </TouchableOpacity>

          {/* Repost */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleRepost}
            activeOpacity={0.75}
          >
            <Ionicons name="repeat" size={18} color={reposted ? colors.green : colors.textMuted} />
            <Text style={[styles.actionCount, reposted && { color: colors.green }]}>
              {reposted ? 'POSTED' : 'REPOST'}
            </Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleShare}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-redo-outline" size={18} color={colors.textMuted} />
            <Text style={styles.actionCount}>SHARE</Text>
          </TouchableOpacity>
        </View>

        {/* Related videos */}
        {related.length > 0 && (
          <View style={styles.relatedSection}>
            <View style={styles.relatedHeader}>
              <Text style={styles.relatedHeaderText}>UP NEXT</Text>
              <View style={styles.relatedLine} />
            </View>
            {related.map(v => (
              <RelatedVideoCard
                key={v.id}
                video={v}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPlaying(false);
                  navigation.replace('VideoPlayer', { video: v });
                }}
              />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <CommentsSheet
        visible={showComments}
        onClose={() => setShowComments(false)}
        contentId={video.id}
        contentTitle={`${video.title} — ${video.artist}`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Player
  playerWrap: {
    width,
    height: PLAYER_HEIGHT,
    backgroundColor: '#000',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backArrow: { color: '#fff', fontSize: 18, lineHeight: 20 },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Info block
  infoBlock: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  catBadge: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  catBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  metaText: { color: colors.textMuted, fontSize: 10, fontWeight: '400' },
  metaDot: { color: colors.textMuted, fontSize: 10 },
  videoTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  artistName: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  description: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 20,
    marginTop: 6,
  },

  // Action bar
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1814',
    gap: 4,
  },
  reactionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2520',
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 4,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  reactionDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#2D2520',
  },
  reactionCount: { color: colors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  actionBtn: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flex: 1,
  },
  actionCount: { color: colors.textMuted, fontSize: 7, fontWeight: '800', letterSpacing: 1.5 },

  // Ratio
  ratioWrap: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  ratioTrack: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  ratioLike: { height: '100%', backgroundColor: colors.accentTeal },
  ratioDislike: { height: '100%', backgroundColor: colors.neonPink },
  ratioLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '600', letterSpacing: 0.3 },

  // Related
  relatedSection: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  relatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  relatedHeaderText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },
  relatedLine: { flex: 1, height: 1, backgroundColor: colors.border },

  relatedCard: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  relatedThumbWrap: {
    width: 120,
    height: 120 * (9 / 16),
    borderRadius: 3,
    overflow: 'hidden',
    flexShrink: 0,
    position: 'relative',
  },
  relatedThumb: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedPlayIcon: { color: colors.textMuted, fontSize: 18 },
  relatedDuration: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  relatedDurationText: { color: '#fff', fontSize: 8, fontWeight: '600' },
  relatedInfo: { flex: 1, justifyContent: 'center', gap: 3 },
  relatedTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  relatedArtist: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  relatedViews: { color: colors.textMuted, fontSize: 10 },
});
