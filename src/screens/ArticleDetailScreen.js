import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Share,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { isArticleSaved, saveArticle, unsaveArticle } from '../services/savedArticlesService';
import { subscribeToReactions, getUserReaction, toggleReaction } from '../services/interactionsService';
import { isReposted, toggleRepost } from '../services/repostService';
import CommentsSheet from '../components/CommentsSheet';

export default function ArticleDetailScreen({ route, navigation }) {
  const { article } = route.params;
  const [saved,        setSaved]        = useState(false);
  const [reposted,     setReposted]     = useState(false);
  const [reactions,    setReactions]    = useState({ likes: 0, dislikes: 0 });
  const [userReaction, setUserReaction] = useState(null);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    isArticleSaved(article.id).then(setSaved);
    isReposted(article.id).then(setReposted);
    getUserReaction(article.id).then(setUserReaction);
    const unsub = subscribeToReactions(article.id, setReactions);
    return unsub;
  }, []);

  async function handleShare() {
    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\n\nVia Hip-Hop Drop — ${article.source}`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  }

  async function handleSave() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (saved) {
      await unsaveArticle(article.id);
      setSaved(false);
    } else {
      await saveArticle(article);
      setSaved(true);
    }
  }

  async function handleRepost() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const nowReposted = await toggleRepost({
      id:         article.id,
      type:       'article',
      title:      article.title,
      subtitle:   `${article.source} · ${article.timestamp}`,
      imageUrl:   article.imageUrl,
      imageColor: article.imageColor,
      accentColor: '#E07B0A',
      category:   article.category,
    });
    setReposted(nowReposted);
  }

  async function handleReaction(type) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = userReaction === type ? null : type;
    setUserReaction(next);
    await toggleReaction(article.id, type);
  }

  function handleReadFull() {
    if (!article.url) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ArticleWebView', {
      url:    article.url,
      title:  article.title,
      source: article.source,
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Cover image with back arrow */}
        <View style={styles.coverWrapper}>
          {article.imageUrl ? (
            <Image
              source={{ uri: article.imageUrl }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.coverImage, { backgroundColor: article.imageColor || '#1a1a1a' }]} />
          )}
          {/* Scrim for readability */}
          <View style={styles.coverScrim} />
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Category tag */}
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{article.category?.toUpperCase()}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{article.title}</Text>

          {/* Byline */}
          <View style={styles.bylineRow}>
            <Text style={styles.byline}>{article.source}</Text>
            <Text style={styles.bylineDot}>·</Text>
            <Text style={styles.byline}>{article.timestamp}</Text>
            <Text style={styles.bylineDot}>·</Text>
            <Text style={styles.byline}>{article.readTime}</Text>
          </View>

          <View style={styles.divider} />

          {/* Body */}
          {(article.body || []).map((paragraph, index) => (
            <Text key={index} style={styles.bodyText}>{paragraph}</Text>
          ))}

          {/* Read full article CTA */}
          {article.url ? (
            <TouchableOpacity
              style={styles.readFullCard}
              onPress={handleReadFull}
              activeOpacity={0.85}
            >
              <View style={styles.readFullCardInner}>
                <Text style={styles.readFullCardEmoji}>📰</Text>
                <View style={styles.readFullCardText}>
                  <Text style={styles.readFullCardTitle}>Continue Reading</Text>
                  <Text style={styles.readFullCardSource}>{article.source}</Text>
                </View>
                <Text style={styles.readFullCardArrow}>›</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.fadeOut} />
          )}
        </View>
      </ScrollView>

      {/* Bottom action row */}
      <View style={styles.bottomBar}>
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
            {reactions.likes > 0 && (
              <Text style={[styles.reactionCount, userReaction === 'like' && { color: colors.accentTeal }]}>
                {reactions.likes.toLocaleString()}
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
              size={16}
              color={userReaction === 'dislike' ? colors.neonPink : colors.textMuted}
            />
            {reactions.dislikes > 0 && (
              <Text style={[styles.reactionCount, userReaction === 'dislike' && { color: colors.neonPink }]}>
                {reactions.dislikes.toLocaleString()}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Comments */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => { Haptics.selectionAsync(); setShowComments(true); }}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
          <Text style={styles.actionLabel}>TALK</Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleSave} activeOpacity={0.7}>
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={saved ? colors.accentTeal : colors.textMuted}
          />
          <Text style={[styles.actionLabel, saved && { color: colors.accentTeal }]}>
            {saved ? 'SAVED' : 'SAVE'}
          </Text>
        </TouchableOpacity>

        {/* Repost */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleRepost} activeOpacity={0.7}>
          <Ionicons name="repeat" size={18} color={reposted ? colors.green : colors.textMuted} />
          <Text style={[styles.actionLabel, reposted && { color: colors.green }]}>
            {reposted ? 'POSTED' : 'REPOST'}
          </Text>
        </TouchableOpacity>

        {/* Read full */}
        <TouchableOpacity
          style={[styles.readFullBtn, !article.url && styles.readFullBtnDisabled]}
          onPress={handleReadFull}
          activeOpacity={0.85}
          disabled={!article.url}
        >
          <Text style={styles.readFullText}>READ FULL</Text>
        </TouchableOpacity>
      </View>

      <CommentsSheet
        visible={showComments}
        onClose={() => setShowComments(false)}
        contentId={article.id}
        contentTitle={article.title}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  coverWrapper: {
    height: 270,
    position: 'relative',
  },
  coverImage: {
    height: 270,
    width: '100%',
  },
  coverScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { color: colors.textPrimary, fontSize: 20, lineHeight: 22 },
  content: { padding: 20, paddingBottom: 40 },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accentTeal,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 2,
    marginBottom: 14,
  },
  categoryTagText: { color: colors.accentTeal, fontSize: 9, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: 0.3,
    marginBottom: 12,
  },
  bylineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  byline: { color: colors.textMuted, fontSize: 12, fontWeight: '400' },
  bylineDot: { color: colors.textMuted, fontSize: 12 },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 16 },
  bodyText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 24,
    marginBottom: 16,
    opacity: 0.9,
  },
  fadeOut: { height: 60 },
  readFullCard: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.accentTeal,
    backgroundColor: colors.accentTeal + '0D',
    overflow: 'hidden',
  },
  readFullCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  readFullCardEmoji: { fontSize: 24 },
  readFullCardText:  { flex: 1 },
  readFullCardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  readFullCardSource: {
    color: colors.accentTeal,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  readFullCardArrow: {
    color: colors.accentTeal,
    fontSize: 24,
    fontWeight: '300',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#070605',
    borderTopWidth: 1,
    borderTopColor: '#1C1814',
    gap: 2,
  },
  reactionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2520',
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 6,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  reactionDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#2D2520',
  },
  reactionCount: { color: colors.textMuted, fontSize: 10, fontWeight: '600' },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 3,
    flex: 1,
  },
  actionLabel: {
    color: colors.textMuted,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  readFullBtn: {
    backgroundColor: colors.accentTeal,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  readFullBtnDisabled: {
    opacity: 0.35,
  },
  readFullText: { color: '#000', fontSize: 9, fontWeight: '900', letterSpacing: 2 },
});
