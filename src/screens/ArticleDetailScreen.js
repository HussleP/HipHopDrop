import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Share,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { isArticleSaved, saveArticle, unsaveArticle } from '../services/savedArticlesService';
import { subscribeToReactions, getUserReaction, toggleReaction } from '../services/interactionsService';
import CommentsSheet from '../components/CommentsSheet';

export default function ArticleDetailScreen({ route, navigation }) {
  const { article } = route.params;
  const [saved, setSaved] = useState(false);
  const [reactions, setReactions] = useState({ likes: 0, dislikes: 0 });
  const [userReaction, setUserReaction] = useState(null);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    isArticleSaved(article.id).then(setSaved);
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

  async function handleReaction(type) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = userReaction === type ? null : type;
    setUserReaction(next);
    await toggleReaction(article.id, type);
  }

  async function handleReadFull() {
    if (article.url) {
      await Linking.openURL(article.url);
    }
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
            <Text style={styles.backArrow}>←</Text>
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

          <View style={styles.fadeOut} />
        </View>
      </ScrollView>

      {/* Bottom action row */}
      <View style={styles.bottomBar}>
        {/* Like */}
        <TouchableOpacity
          style={[styles.reactionBtn, userReaction === 'like' && styles.reactionBtnLiked]}
          onPress={() => handleReaction('like')}
          activeOpacity={0.75}
        >
          <Text style={[styles.reactionIcon, userReaction === 'like' && { color: colors.accentTeal }]}>
            {userReaction === 'like' ? '▲' : '△'}
          </Text>
          <Text style={[styles.reactionCount, userReaction === 'like' && { color: colors.accentTeal }]}>
            {reactions.likes > 0 ? reactions.likes.toLocaleString() : ''}
          </Text>
        </TouchableOpacity>

        {/* Dislike */}
        <TouchableOpacity
          style={[styles.reactionBtn, userReaction === 'dislike' && styles.reactionBtnDisliked]}
          onPress={() => handleReaction('dislike')}
          activeOpacity={0.75}
        >
          <Text style={[styles.reactionIcon, userReaction === 'dislike' && { color: colors.neonPink }]}>
            {userReaction === 'dislike' ? '▼' : '▽'}
          </Text>
          <Text style={[styles.reactionCount, userReaction === 'dislike' && { color: colors.neonPink }]}>
            {reactions.dislikes > 0 ? reactions.dislikes.toLocaleString() : ''}
          </Text>
        </TouchableOpacity>

        {/* Comments */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => { Haptics.selectionAsync(); setShowComments(true); }}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionLabel}>Comments</Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleSave} activeOpacity={0.7}>
          <Text style={[styles.actionIcon, saved && styles.savedIcon]}>{saved ? '♥' : '♡'}</Text>
          <Text style={[styles.actionLabel, saved && styles.savedLabel]}>
            {saved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>

        {/* Read full */}
        <TouchableOpacity style={styles.readFullBtn} onPress={handleReadFull} activeOpacity={0.85}>
          <Text style={styles.readFullText}>Read</Text>
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
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 4,
  },
  reactionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 1,
    minWidth: 42,
  },
  reactionBtnLiked: {
    borderColor: colors.accentTeal,
    backgroundColor: 'rgba(224,123,10,0.08)',
  },
  reactionBtnDisliked: {
    borderColor: colors.neonPink,
    backgroundColor: 'rgba(232,48,90,0.08)',
  },
  reactionIcon: { color: colors.textMuted, fontSize: 14 },
  reactionCount: { color: colors.textMuted, fontSize: 10, fontWeight: '600' },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 7,
    gap: 2,
  },
  actionIcon: { color: colors.textMuted, fontSize: 16 },
  savedIcon: { color: colors.accentTeal },
  actionLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '600', letterSpacing: 0.5 },
  savedLabel: { color: colors.accentTeal },
  readFullBtn: {
    flex: 1,
    backgroundColor: colors.accentTeal,
    paddingVertical: 13,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  readFullText: { color: '#000', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
});
