import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { articles, polls } from '../data/mockData';
import PollCard from '../components/PollCard';

const FILTERS = ['All', 'Drops', 'Tours', 'Beef', 'Awards', 'Versus'];

function Logo() {
  return (
    <View style={styles.logoRow}>
      <Text style={styles.logoText}>
        hip-hop <Text style={styles.logoAccent}>drop</Text>
      </Text>
    </View>
  );
}

function CategoryChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function HeroCard({ article, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.heroCard}>
      <View style={[styles.heroImage, { backgroundColor: article.imageColor }]}>
        <View style={styles.breakingBadge}>
          <Text style={styles.breakingText}>Breaking</Text>
        </View>
      </View>
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle} numberOfLines={2}>{article.title}</Text>
        <Text style={styles.heroMeta}>{article.source} · {article.timestamp}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ArticleRow({ article, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.articleRow} activeOpacity={0.7}>
      <View style={[styles.articleThumb, { backgroundColor: article.imageColor }]} />
      <View style={styles.articleInfo}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryPillText}>{article.category}</Text>
        </View>
        <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
        <Text style={styles.articleMeta}>{article.source} · {article.timestamp}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredArticles = activeFilter === 'All'
    ? articles
    : activeFilter === 'Versus'
    ? []
    : articles.filter((a) => a.category === activeFilter);

  const filteredPolls = activeFilter === 'All'
    ? polls.filter(p => p.type === 'beef' || p.type === 'awards').slice(0, 2)
    : activeFilter === 'Beef'
    ? polls.filter(p => p.type === 'beef')
    : activeFilter === 'Awards'
    ? polls.filter(p => p.type === 'awards')
    : activeFilter === 'Versus'
    ? polls.filter(p => p.type === 'versus')
    : [];

  const heroArticle = filteredArticles[0];
  const listArticles = filteredArticles.slice(1);

  const showPolls = ['All', 'Beef', 'Awards', 'Versus'].includes(activeFilter);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <Logo />
        <TouchableOpacity style={styles.bellBtn}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersRow}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTERS.map((f) => (
            <CategoryChip
              key={f}
              label={f}
              active={activeFilter === f}
              onPress={() => setActiveFilter(f)}
            />
          ))}
        </ScrollView>

        {/* Hero card (articles only) */}
        {heroArticle && (
          <HeroCard
            article={heroArticle}
            onPress={() => navigation.navigate('ArticleDetail', { article: heroArticle })}
          />
        )}

        {/* Polls section */}
        {showPolls && filteredPolls.length > 0 && (
          <View style={styles.pollsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeFilter === 'Beef' ? '🔥 Beef Polls' :
                 activeFilter === 'Awards' ? '🏆 Awards Polls' :
                 activeFilter === 'Versus' ? '⚔️ Versus Polls' :
                 '🗳️ Fan Polls'}
              </Text>
            </View>
            {filteredPolls.map(poll => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </View>
        )}

        {/* Article list */}
        {listArticles.length > 0 && (
          <View style={styles.listSection}>
            {listArticles.map((article) => (
              <ArticleRow
                key={article.id}
                article={article}
                onPress={() => navigation.navigate('ArticleDetail', { article })}
              />
            ))}
          </View>
        )}

        {/* Empty state for Versus */}
        {activeFilter === 'Versus' && filteredPolls.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>⚔️</Text>
            <Text style={styles.emptyText}>No versus polls right now</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  logoAccent: {
    color: colors.accentTeal,
  },
  bellBtn: {
    padding: 4,
  },
  bellIcon: {
    fontSize: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  filtersRow: {
    marginTop: 4,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.accentTeal,
    borderColor: colors.accentTeal,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#000',
    fontWeight: '500',
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroImage: {
    height: 200,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 12,
  },
  breakingBadge: {
    backgroundColor: colors.accentTeal,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  breakingText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroContent: {
    padding: 14,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
    marginBottom: 8,
  },
  heroMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '400',
  },
  pollsSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  listSection: {
    marginTop: 8,
    paddingHorizontal: 16,
    gap: 2,
  },
  articleRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  articleThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
    flexShrink: 0,
  },
  articleInfo: {
    flex: 1,
    gap: 4,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  categoryPillText: {
    color: colors.accentTeal,
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  articleTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  articleMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '400',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '400',
  },
});
