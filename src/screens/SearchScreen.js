import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { trendingSearches } from '../data/mockData';

const CATEGORIES = [
  { id: 'drops', label: 'Drops', emoji: '👟', color: colors.amber, bg: '#2a1e0a' },
  { id: 'tours', label: 'Tours', emoji: '🎤', color: colors.purple, bg: '#1a0a2a' },
  { id: 'interviews', label: 'Interviews', emoji: '🎙️', color: colors.teal, bg: '#0a1e1e' },
  { id: 'charts', label: 'Charts', emoji: '📊', color: colors.coral, bg: '#2a0e0e' },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Artists, albums, news..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            selectionColor={colors.accentGold}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Trending now */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          {trendingSearches.map((item) => (
            <TouchableOpacity key={item.id} style={styles.trendingRow} activeOpacity={0.7}>
              <Text style={styles.trendingRank}>{item.rank}</Text>
              <View style={[styles.trendingThumb, { backgroundColor: item.imageColor }]} />
              <View style={styles.trendingInfo}>
                <Text style={styles.trendingName}>{item.artist}</Text>
                <Text style={styles.trendingCount}>{item.articleCount} articles</Text>
              </View>
              <Text style={styles.trendingArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Browse by category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryCard, { backgroundColor: cat.bg }]}
                activeOpacity={0.75}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={[styles.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 24,
    marginTop: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '400',
    padding: 0,
  },
  clearIcon: {
    color: colors.textMuted,
    fontSize: 14,
    padding: 2,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 14,
  },
  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  trendingRank: {
    color: colors.accentGold,
    fontSize: 16,
    fontWeight: '500',
    width: 20,
    textAlign: 'center',
  },
  trendingThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  trendingInfo: {
    flex: 1,
  },
  trendingName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  trendingCount: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '400',
  },
  trendingArrow: {
    color: colors.textMuted,
    fontSize: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47.5%',
    aspectRatio: 1.6,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
});
