/**
 * CommentsSheet
 *
 * A full-screen modal sheet with:
 *  - Like / Dislike buttons (real-time counts from Firestore)
 *  - Scrollable comment thread (real-time)
 *  - Text input to post new comments
 *  - Like button on individual comments
 *
 * Usage:
 *   <CommentsSheet
 *     visible={showComments}
 *     onClose={() => setShowComments(false)}
 *     contentId={article.id}
 *     contentTitle={article.title}
 *   />
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import {
  subscribeToReactions,
  subscribeToComments,
  getUserReaction,
  toggleReaction,
  postComment,
  likeComment,
} from '../services/interactionsService';

// ─── Time formatter ───────────────────────────────────────────────────────────
function timeAgo(ts) {
  if (!ts) return 'Just now';
  const ms = ts.toMillis ? ts.toMillis() : ts;
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

// ─── Single comment row ───────────────────────────────────────────────────────
function CommentRow({ comment, contentId }) {
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(comment.likes || 0);

  function handleLike() {
    if (liked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked(true);
    setLocalLikes(n => n + 1);
    likeComment(contentId, comment.id);
  }

  // First letter of display name
  const initial = (comment.displayName || '?').charAt(0).toUpperCase();

  return (
    <View style={styles.commentRow}>
      <View style={styles.commentAvatar}>
        <Text style={styles.commentAvatarText}>{initial}</Text>
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>{comment.displayName || 'Anonymous'}</Text>
          <Text style={styles.commentTime}>{timeAgo(comment.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
        <TouchableOpacity onPress={handleLike} style={styles.commentLikeBtn} activeOpacity={0.7}>
          <Text style={[styles.commentLikeIcon, liked && styles.commentLikedIcon]}>
            {liked ? '♥' : '♡'}
          </Text>
          {localLikes > 0 && (
            <Text style={[styles.commentLikeCount, liked && { color: colors.accentTeal }]}>
              {localLikes}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CommentsSheet({ visible, onClose, contentId, contentTitle }) {
  const [reactions, setReactions] = useState({ likes: 0, dislikes: 0 });
  const [userReaction, setUserReaction] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [inputText, setInputText] = useState('');
  const [posting, setPosting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!visible || !contentId) return;

    setLoadingComments(true);

    // Load user's existing reaction from AsyncStorage
    getUserReaction(contentId).then(setUserReaction);

    // Subscribe to live reaction counts
    const unsubReactions = subscribeToReactions(contentId, setReactions);

    // Subscribe to live comments
    const unsubComments = subscribeToComments(contentId, (data) => {
      setComments(data);
      setLoadingComments(false);
    });

    return () => {
      unsubReactions();
      unsubComments();
    };
  }, [visible, contentId]);

  async function handleReaction(type) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = userReaction === type ? null : type;
    setUserReaction(next);
    await toggleReaction(contentId, type);
  }

  async function handlePost() {
    const text = inputText.trim();
    if (!text || posting) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPosting(true);
    setInputText('');
    inputRef.current?.blur();
    try {
      await postComment(contentId, text);
    } catch (err) {
      console.warn('Post comment error:', err);
    } finally {
      setPosting(false);
    }
  }

  const total = reactions.likes + reactions.dislikes;
  const likePct = total > 0 ? Math.round((reactions.likes / total) * 100) : 50;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheet}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle} numberOfLines={1}>{contentTitle}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Like / Dislike row */}
          <View style={styles.reactionsRow}>
            <TouchableOpacity
              style={[styles.reactionBtn, userReaction === 'like' && styles.reactionBtnActive]}
              onPress={() => handleReaction('like')}
              activeOpacity={0.75}
            >
              <Text style={[styles.reactionIcon, userReaction === 'like' && styles.reactionIconLiked]}>
                {userReaction === 'like' ? '▲' : '△'}
              </Text>
              <Text style={[styles.reactionCount, userReaction === 'like' && { color: colors.accentTeal }]}>
                {reactions.likes.toLocaleString()}
              </Text>
              <Text style={[styles.reactionLabel, userReaction === 'like' && { color: colors.accentTeal }]}>
                LIKE
              </Text>
            </TouchableOpacity>

            {/* Ratio bar */}
            <View style={styles.ratioWrap}>
              <View style={styles.ratioTrack}>
                <View style={[styles.ratioFillLike, { width: `${likePct}%` }]} />
                <View style={[styles.ratioFillDislike, { width: `${100 - likePct}%` }]} />
              </View>
              {total > 0 && (
                <Text style={styles.ratioTotal}>{total.toLocaleString()} reactions</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.reactionBtn, userReaction === 'dislike' && styles.reactionBtnDislikeActive]}
              onPress={() => handleReaction('dislike')}
              activeOpacity={0.75}
            >
              <Text style={[styles.reactionIcon, userReaction === 'dislike' && styles.reactionIconDisliked]}>
                {userReaction === 'dislike' ? '▼' : '▽'}
              </Text>
              <Text style={[styles.reactionCount, userReaction === 'dislike' && { color: colors.neonPink }]}>
                {reactions.dislikes.toLocaleString()}
              </Text>
              <Text style={[styles.reactionLabel, userReaction === 'dislike' && { color: colors.neonPink }]}>
                DISLIKE
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Comments section label */}
          <View style={styles.commentsLabelRow}>
            <Text style={styles.commentsLabel}>
              COMMENTS {comments.length > 0 ? `· ${comments.length}` : ''}
            </Text>
          </View>

          {/* Comment list */}
          {loadingComments ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.accentTeal} />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No comments yet.</Text>
              <Text style={styles.emptySubtext}>Be the first to say something.</Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <CommentRow comment={item} contentId={contentId} />
              )}
              style={styles.commentList}
              contentContainerStyle={styles.commentListContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )}

          {/* Input row */}
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={280}
              selectionColor={colors.accentTeal}
              returnKeyType="send"
              onSubmitEditing={handlePost}
            />
            <TouchableOpacity
              onPress={handlePost}
              style={[
                styles.postBtn,
                (!inputText.trim() || posting) && styles.postBtnDisabled,
              ]}
              activeOpacity={0.8}
              disabled={!inputText.trim() || posting}
            >
              {posting
                ? <ActivityIndicator size="small" color="#000" />
                : <Text style={styles.postBtnText}>POST</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '88%',
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },

  // Header
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  sheetTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: 14,
  },

  // Reactions
  reactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  reactionBtn: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 64,
  },
  reactionBtnActive: {
    borderColor: colors.accentTeal,
    backgroundColor: 'rgba(224,123,10,0.08)',
  },
  reactionBtnDislikeActive: {
    borderColor: colors.neonPink,
    backgroundColor: 'rgba(232,48,90,0.08)',
  },
  reactionIcon: {
    color: colors.textMuted,
    fontSize: 16,
  },
  reactionIconLiked: { color: colors.accentTeal },
  reactionIconDisliked: { color: colors.neonPink },
  reactionCount: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  reactionLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // Ratio bar
  ratioWrap: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  ratioTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  ratioFillLike: {
    height: '100%',
    backgroundColor: colors.accentTeal,
  },
  ratioFillDislike: {
    height: '100%',
    backgroundColor: colors.neonPink,
  },
  ratioTotal: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },

  // Comments label
  commentsLabelRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  commentsLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },

  // List
  commentList: { flex: 1 },
  commentListContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 6,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: 12,
  },

  // Comment rows
  commentRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  commentAvatarText: {
    color: colors.accentTeal,
    fontSize: 13,
    fontWeight: '700',
  },
  commentBody: { flex: 1, gap: 4 },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentName: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  commentTime: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '400',
  },
  commentText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    opacity: 0.9,
  },
  commentLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  commentLikeIcon: {
    color: colors.textMuted,
    fontSize: 13,
  },
  commentLikedIcon: { color: colors.accentTeal },
  commentLikeCount: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    borderBottomColor: colors.accentTeal,
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
    maxHeight: 90,
  },
  postBtn: {
    backgroundColor: colors.accentTeal,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postBtnDisabled: {
    opacity: 0.35,
  },
  postBtnText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
