import React from 'react';
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

export default function UndergroundArtistScreen({ route, navigation }) {
  const { artist } = route.params;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: artist.colorBg }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <View style={styles.undergroundBadge}>
              <Text style={styles.undergroundBadgeText}>🔥 UNDERGROUND</Text>
            </View>
            <Text style={styles.artistName}>{artist.name}</Text>
            <Text style={styles.location}>📍 {artist.location}</Text>
            <View style={styles.tagsRow}>
              {artist.tags.map(tag => (
                <View key={tag} style={[styles.tag, { borderColor: artist.accentColor }]}>
                  <Text style={[styles.tagText, { color: artist.accentColor }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.content}>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: artist.accentColor }]}>
                {artist.monthlyListeners}
              </Text>
              <Text style={styles.statLabel}>Monthly Listeners</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: artist.accentColor }]}>
                {artist.releaseYear}
              </Text>
              <Text style={styles.statLabel}>Latest Project</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: artist.accentColor }]}>
                {artist.latestProject.split(' ').length > 2
                  ? artist.latestProject.split(' ').slice(0, 2).join(' ') + '…'
                  : artist.latestProject}
              </Text>
              <Text style={styles.statLabel}>Project</Text>
            </View>
          </View>

          {/* Bio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{artist.bio}</Text>
          </View>

          {/* Latest Project */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Latest Project</Text>
            <View style={[styles.projectCard, { backgroundColor: artist.colorBg }]}>
              <View style={styles.projectIcon}>
                <Text style={styles.projectEmoji}>💿</Text>
              </View>
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{artist.latestProject}</Text>
                <Text style={styles.projectYear}>{artist.releaseYear}</Text>
              </View>
              <View style={[styles.newBadge, { backgroundColor: artist.accentColor }]}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            </View>
          </View>

          {/* Articles */}
          {artist.articles?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Features</Text>
              {artist.articles.map(article => (
                <TouchableOpacity
                  key={article.id}
                  style={styles.articleCard}
                  onPress={() => navigation.navigate('ArticleDetail', { article })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.articleThumb, { backgroundColor: article.imageColor }]} />
                  <View style={styles.articleInfo}>
                    <View style={[styles.categoryPill, { borderColor: artist.accentColor }]}>
                      <Text style={[styles.categoryText, { color: artist.accentColor }]}>
                        {article.category.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
                    <Text style={styles.articleMeta}>{article.source} · {article.timestamp}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Support button */}
          <TouchableOpacity
            style={[styles.supportBtn, { backgroundColor: artist.accentColor }]}
            activeOpacity={0.85}
          >
            <Text style={styles.supportBtnText}>🎵  Listen Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: { minHeight: 280, padding: 20, justifyContent: 'space-between' },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backArrow: { color: colors.textPrimary, fontSize: 20, lineHeight: 22 },
  heroContent: { marginTop: 20 },
  undergroundBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  undergroundBadgeText: { color: colors.textPrimary, fontSize: 11, fontWeight: '500', letterSpacing: 1 },
  artistName: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 6,
  },
  location: { color: colors.textMuted, fontSize: 13, marginBottom: 12 },
  tagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { fontSize: 11, fontWeight: '500' },
  content: { padding: 16, paddingBottom: 40 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    marginBottom: 24,
  },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  statValue: { fontSize: 16, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  statLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '400', textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: colors.border },
  section: { marginBottom: 24 },
  sectionTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '500', marginBottom: 12 },
  bioText: { color: colors.textMuted, fontSize: 14, fontWeight: '400', lineHeight: 22 },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  projectIcon: {
    width: 50, height: 50, borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  projectEmoji: { fontSize: 24 },
  projectInfo: { flex: 1 },
  projectName: { color: colors.textPrimary, fontSize: 15, fontWeight: '500', marginBottom: 3 },
  projectYear: { color: colors.textMuted, fontSize: 12 },
  newBadge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  newBadgeText: { color: '#000', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  articleCard: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  articleThumb: { width: 75, height: 75, borderRadius: 8 },
  articleInfo: { flex: 1, gap: 4 },
  categoryPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryText: { fontSize: 10, fontWeight: '500', letterSpacing: 0.5 },
  articleTitle: { color: colors.textPrimary, fontSize: 13, fontWeight: '500', lineHeight: 18 },
  articleMeta: { color: colors.textMuted, fontSize: 11 },
  supportBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  supportBtnText: { color: '#000', fontSize: 16, fontWeight: '500' },
});
