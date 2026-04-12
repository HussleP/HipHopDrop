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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { isArticleSaved, saveArticle, unsaveArticle } from '../services/savedArticlesService';

export default function ArticleDetailScreen({ route, navigation }) {
  const { article } = route.params;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    isArticleSaved(article.id).then(setSaved);
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
    if (saved) {
      await unsaveArticle(article.id);
      setSaved(false);
    } else {
      await saveArticle(article);
      setSaved(true);
    }
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
        <View style={[styles.coverImage, { backgroundColor: article.imageColor || '#1a1a1a' }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
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
        <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.7}>
          <Text style={styles.actionIcon}>↑</Text>
          <Text style={styles.actionLabel}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleSave} activeOpacity={0.7}>
          <Text style={[styles.actionIcon, saved && styles.savedIcon]}>{saved ? '♥' : '♡'}</Text>
          <Text style={[styles.actionLabel, saved && styles.savedLabel]}>
            {saved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.readFullBtn} onPress={handleReadFull} activeOpacity={0.85}>
          <Text style={styles.readFullText}>Read Full</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  coverImage: {
    height: 260,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 16,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center',
  },
  backArrow: { color: colors.textPrimary, fontSize: 20, lineHeight: 22 },
  content: { padding: 20, paddingBottom: 40 },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentTeal,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  categoryTagText: { color: '#000', fontSize: 11, fontWeight: '500', letterSpacing: 1 },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 30,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  actionIcon: { color: colors.textMuted, fontSize: 18 },
  savedIcon: { color: colors.accentTeal },
  actionLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '400' },
  savedLabel: { color: colors.accentTeal },
  readFullBtn: {
    flex: 1,
    backgroundColor: colors.accentTeal,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readFullText: { color: '#000', fontSize: 15, fontWeight: '500' },
});
