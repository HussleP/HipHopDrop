import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getSavedArticles, unsaveArticle } from '../services/savedArticlesService';

export default function SavedArticlesScreen({ navigation }) {
  const [articles, setArticles] = useState([]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    const saved = await getSavedArticles();
    setArticles(saved);
  }

  async function handleUnsave(id) {
    await unsaveArticle(id);
    setArticles(prev => prev.filter(a => a.id !== id));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Articles</Text>
        <View style={{ width: 38 }} />
      </View>

      {articles.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>♡</Text>
          <Text style={styles.emptyTitle}>No saved articles</Text>
          <Text style={styles.emptySub}>Tap the heart on any article to save it here</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {articles.map(article => (
            <TouchableOpacity
              key={article.id}
              style={styles.articleRow}
              onPress={() => navigation.navigate('ArticleDetail', { article })}
              activeOpacity={0.7}
            >
              <View style={[styles.thumb, { backgroundColor: article.imageColor }]} />
              <View style={styles.info}>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryText}>{article.category}</Text>
                </View>
                <Text style={styles.title} numberOfLines={2}>{article.title}</Text>
                <Text style={styles.meta}>{article.source} · {article.timestamp}</Text>
              </View>
              <TouchableOpacity onPress={() => handleUnsave(article.id)} style={styles.unsaveBtn}>
                <Text style={styles.unsaveIcon}>♥</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  backArrow: { color: colors.textPrimary, fontSize: 20, lineHeight: 22 },
  headerTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '500' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyEmoji: { fontSize: 48, color: colors.textMuted },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '500' },
  emptySub: { color: colors.textMuted, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
  list: { padding: 16, paddingBottom: 40 },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  thumb: { width: 80, height: 80, borderRadius: 10, flexShrink: 0 },
  info: { flex: 1, gap: 4 },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  categoryText: { color: colors.accentTeal, fontSize: 10, fontWeight: '500', textTransform: 'uppercase' },
  title: { color: colors.textPrimary, fontSize: 14, fontWeight: '500', lineHeight: 20 },
  meta: { color: colors.textMuted, fontSize: 11 },
  unsaveBtn: { padding: 8 },
  unsaveIcon: { color: colors.accentTeal, fontSize: 20 },
});
