import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { polls, undergroundArtists } from '../data/mockData';
import { fetchArticles } from '../services/newsService';
import PollCard from '../components/PollCard';
import { HomeFeedSkeleton } from '../components/SkeletonLoader';

const FILTERS = ['All', 'Drops', 'Tours', 'Beef', 'Awards', 'Versus', 'Underground'];

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
  function handlePress() {
    Haptics.selectionAsync();
    onPress();
  }
  return (
    <TouchableOpacity
      onPress={handlePress}
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
  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={styles.heroCard}>
      {article.imageUrl ? (
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.heroImage, { backgroundColor: article.imageColor }]} />
      )}
      <View style={styles.heroImageOverlay}>
        {article.isBreaking && (
          <View style={styles.breakingBadge}>
            <Text style={styles.breakingText}>Breaking</Text>
          </View>
        )}
      </View>
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle} numberOfLines={2}>{article.title}</Text>
        <Text style={styles.heroMeta}>{article.source} · {article.timestamp}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ArticleRow({ article, onPress }) {
  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }
  return (
    <TouchableOpacity onPress={handlePress} style={styles.articleRow} activeOpacity={0.7}>
      {article.imageUrl ? (
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.articleThumb}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.articleThumb, { backgroundColor: article.imageColor }]} />
      )}
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

function UndergroundSpotlightCard({ artist, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={[styles.ugCard, { backgroundColor: artist.colorBg }]}
    >
      <View style={styles.ugFlameBadge}>
        <Text style={styles.ugFlameText}>🔥 UNDERGROUND</Text>
      </View>
      <Text style={[styles.ugName, { color: '#fff' }]}>{artist.name}</Text>
      <Text style={styles.ugLocation}>📍 {artist.location}</Text>
      <View style={styles.ugTagsRow}>
        {artist.tags.slice(0, 2).map(tag => (
          <View key={tag} style={[styles.ugTag, { borderColor: artist.accentColor }]}>
            <Text style={[styles.ugTagText, { color: artist.accentColor }]}>{tag}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.ugListeners}>{artist.monthlyListeners} monthly listeners</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    setLoading(true);
    const data = await fetchArticles();
    setArticles(data);
    setLoading(false);
    // Fade in content smoothly once loaded
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }

  async function onRefresh() {
    setRefreshing(true);
    const data = await fetchArticles();
    setArticles(data);
    setRefreshing(false);
  }

  const filteredArticles = activeFilter === 'All'
    ? articles
    : activeFilter === 'Versus' || activeFilter === 'Underground'
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
  const showUnderground = activeFilter === 'All' || activeFilter === 'Underground';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <Logo />
        <TouchableOpacity style={styles.bellBtn}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Skeleton loading state */}
      {loading && <HomeFeedSkeleton />}

      {!loading && (
      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accentTeal}
          />
        }
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

        {/* Underground Spotlight */}
        {showUnderground && (
          <View style={styles.ugSection}>
            <View style={styles.ugSectionHeader}>
              <Text style={styles.sectionTitle}>🔥 Underground Spotlight</Text>
              {activeFilter === 'All' && (
                <TouchableOpacity onPress={() => setActiveFilter('Underground')}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.ugScroll}
            >
              {undergroundArtists.map(artist => (
                <UndergroundSpotlightCard
                  key={artist.id}
                  artist={artist}
                  onPress={() => navigation.navigate('UndergroundArtist', { artist })}
                />
              ))}
            </ScrollView>
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
      </Animated.View>
      )}
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
    height: 210,
    width: '100%',
    backgroundColor: '#1a1a1a',
  },
  heroImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 210,
    padding: 12,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    // subtle gradient-like fade at bottom
    backgroundColor: 'transparent',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  ugSection: {
    marginTop: 20,
    paddingHorizontal: 0,
  },
  ugSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  ugScroll: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  ugCard: {
    width: 200,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 6,
  },
  ugFlameBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  ugFlameText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  ugName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  ugLocation: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
  },
  ugTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  ugTag: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ugTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  ugListeners: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginTop: 6,
  },
  seeAll: {
    color: colors.accentTeal,
    fontSize: 13,
    fontWeight: '500',
  },
});
