import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const GENRES = [
  { id: 'trap',        label: 'Trap',         icon: 'flame-outline' },
  { id: 'drill',       label: 'Drill',        icon: 'radio-outline' },
  { id: 'boom_bap',    label: 'Boom Bap',     icon: 'headset-outline' },
  { id: 'west_coast',  label: 'West Coast',   icon: 'partly-sunny-outline' },
  { id: 'east_coast',  label: 'East Coast',   icon: 'business-outline' },
  { id: 'uk_rap',      label: 'UK Rap',       icon: 'globe-outline' },
  { id: 'conscious',   label: 'Conscious',    icon: 'heart-outline' },
  { id: 'melodic',     label: 'Melodic',      icon: 'musical-note-outline' },
  { id: 'old_school',  label: 'Old School',   icon: 'time-outline' },
  { id: 'underground', label: 'Underground',  icon: 'moon-outline' },
];

const ARTISTS = [
  { id: 'kendrick', name: 'Kendrick Lamar',     genre: 'West Coast'  },
  { id: 'drake',    name: 'Drake',              genre: 'Melodic'     },
  { id: 'jcole',    name: 'J. Cole',            genre: 'Conscious'   },
  { id: 'travis',   name: 'Travis Scott',       genre: 'Trap'        },
  { id: 'future',   name: 'Future',             genre: 'Trap'        },
  { id: 'carti',    name: 'Playboi Carti',      genre: 'Trap'        },
  { id: 'tyler',    name: 'Tyler, the Creator', genre: 'Conscious'   },
  { id: 'gunna',    name: 'Gunna',              genre: 'Trap'        },
  { id: 'lil_baby', name: 'Lil Baby',           genre: 'Trap'        },
  { id: 'nicki',    name: 'Nicki Minaj',        genre: 'East Coast'  },
  { id: 'doja',     name: 'Doja Cat',           genre: 'Melodic'     },
  { id: 'denzel',   name: 'Denzel Curry',       genre: 'Underground' },
];

const TOTAL_STEPS = 4;

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep]                     = useState(0);
  const [selectedGenres, setSelectedGenres] = useState(new Set());
  const [followedArtists, setFollowedArtists] = useState(new Set());
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function goNext() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
    setStep(s => s + 1);
  }

  function toggleGenre(id) {
    Haptics.selectionAsync();
    setSelectedGenres(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleArtist(id) {
    Haptics.selectionAsync();
    setFollowedArtists(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function finish() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem('onboarding_complete', '1');
    await AsyncStorage.setItem('followed_genres', JSON.stringify([...selectedGenres]));
    await AsyncStorage.setItem('followed_artists_onboarding', JSON.stringify([...followedArtists]));
    onComplete();
  }

  const showProgress = step > 0 && step < TOTAL_STEPS - 1;
  const progress = step / (TOTAL_STEPS - 1);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {showProgress && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      )}

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {step === 0 && <WelcomeStep onNext={goNext} />}
        {step === 1 && (
          <GenreStep selectedGenres={selectedGenres} onToggle={toggleGenre} onNext={goNext} />
        )}
        {step === 2 && (
          <ArtistStep followedArtists={followedArtists} onToggle={toggleArtist} onNext={goNext} />
        )}
        {step === 3 && <FinishStep onFinish={finish} />}
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Step 0: Welcome ─────────────────────────────────────────────────────────

function WelcomeStep({ onNext }) {
  return (
    <View style={styles.stepWrap}>
      <View style={styles.logoWrap}>
        <Text style={styles.logoMain}>HOT</Text>
        <Text style={styles.logoDrop}>DROP</Text>
        <View style={styles.logoLine} />
      </View>

      <Text style={styles.welcomeTagline}>
        THE PULSE OF THE CULTURE.{'\n'}DROPS, COLLABS, EXCLUSIVES.
      </Text>
      <Text style={styles.welcomeSub}>
        Set up your feed in 2 quick steps and never miss a moment.
      </Text>

      <View style={styles.welcomeFeatures}>
        {[
          ['flash-outline',         'Breaking drops & releases'],
          ['newspaper-outline',     'Culture news & beef'],
          ['videocam-outline',      'Music videos & exclusives'],
          ['notifications-outline', 'Real-time drop alerts'],
        ].map(([icon, text]) => (
          <View key={text} style={styles.featureRow}>
            <Ionicons name={icon} size={20} color={colors.accentTeal} style={styles.featureIcon} />
            <Text style={styles.featureText}>{text}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={onNext} activeOpacity={0.8}>
        <Text style={styles.primaryBtnText}>LET'S GO</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 1: Genres ──────────────────────────────────────────────────────────

function GenreStep({ selectedGenres, onToggle, onNext }) {
  return (
    <View style={styles.stepWrap}>
      <Text style={styles.stepLabel}>01 / 02</Text>
      <Text style={styles.stepTitle}>WHAT DO YOU{'\n'}VIBE WITH?</Text>
      <Text style={styles.stepSub}>Pick your genres — we'll tailor your feed.</Text>

      <View style={styles.chipGrid}>
        {GENRES.map(g => {
          const active = selectedGenres.has(g.id);
          return (
            <TouchableOpacity
              key={g.id}
              style={[styles.genreChip, active && styles.genreChipActive]}
              onPress={() => onToggle(g.id)}
              activeOpacity={0.75}
            >
              <Ionicons name={g.icon} size={13} color={active ? colors.accentTeal : colors.textMuted} />
              <Text style={[styles.genreChipText, active && styles.genreChipTextActive]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, { marginTop: 24 }]}
        onPress={onNext}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryBtnText}>
          {selectedGenres.size > 0 ? `${selectedGenres.size} SELECTED  →` : 'SKIP →'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 2: Artists ─────────────────────────────────────────────────────────

function ArtistStep({ followedArtists, onToggle, onNext }) {
  return (
    <View style={styles.stepWrap}>
      <Text style={styles.stepLabel}>02 / 02</Text>
      <Text style={styles.stepTitle}>WHO DO YOU{'\n'}FOLLOW?</Text>
      <Text style={styles.stepSub}>Get alerts when they drop something new.</Text>

      <ScrollView style={styles.artistScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.artistGrid}>
          {ARTISTS.map(a => {
            const active = followedArtists.has(a.id);
            return (
              <TouchableOpacity
                key={a.id}
                style={[styles.artistCard, active && styles.artistCardActive]}
                onPress={() => onToggle(a.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.artistAvatarWrap, active && styles.artistAvatarWrapActive]}>
                  <Text style={styles.artistInitial}>{a.name[0]}</Text>
                </View>
                <Text
                  style={[styles.artistName, active && styles.artistNameActive]}
                  numberOfLines={2}
                >
                  {a.name}
                </Text>
                <Text style={styles.artistGenre}>{a.genre}</Text>
                {active && (
                  <View style={styles.artistCheck}>
                    <Ionicons name="checkmark" size={9} color="#000" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ height: 8 }} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.primaryBtn, { marginTop: 12 }]}
        onPress={onNext}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryBtnText}>
          {followedArtists.size > 0 ? `FOLLOW ${followedArtists.size} →` : 'SKIP →'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 3: Finish ──────────────────────────────────────────────────────────

function FinishStep({ onFinish }) {
  return (
    <View style={[styles.stepWrap, styles.finishWrap]}>
      <Ionicons name="mic-outline" size={56} color={colors.accentTeal} style={{ marginBottom: 20 }} />
      <Text style={styles.finishTitle}>YOU'RE IN.</Text>
      <Text style={styles.finishSub}>
        Your personalized drop feed is ready.{'\n'}Stay first. Stay informed.
      </Text>

      <View style={styles.finishCard}>
        {[
          ['flash-outline',         'Breaking drops & releases'],
          ['newspaper-outline',     'Culture news & beef'],
          ['videocam-outline',      'Music videos & exclusives'],
          ['notifications-outline', 'Real-time drop alerts'],
          ['chatbubble-outline',    'Community comments & polls'],
        ].map(([icon, text]) => (
          <View key={text} style={styles.featureRow}>
            <Ionicons name={icon} size={20} color={colors.accentTeal} style={styles.featureIcon} />
            <Text style={styles.featureText}>{text}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={onFinish} activeOpacity={0.8}>
        <Text style={styles.primaryBtnText}>ENTER THE DROP</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },

  progressTrack: {
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentTeal,
    borderRadius: 1,
  },

  stepWrap: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },

  // Welcome
  logoWrap:   { marginBottom: 36 },
  logoMain: {
    color: colors.textPrimary,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 6,
    lineHeight: 44,
  },
  logoDrop: {
    color: colors.accentTeal,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 6,
    lineHeight: 44,
  },
  logoLine: {
    width: 44,
    height: 3,
    backgroundColor: colors.accentTeal,
    marginTop: 10,
  },
  welcomeTagline: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.5,
    lineHeight: 30,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  welcomeSub: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 21,
    marginBottom: 28,
  },
  welcomeFeatures: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },

  // Feature rows (welcome + finish)
  featureRow:  { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: { width: 28, textAlign: 'center' },
  featureText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // Step headers
  stepLabel: {
    color: colors.accentTeal,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 10,
  },
  stepTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
    lineHeight: 34,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  stepSub: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 20,
  },

  // Genre chips
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  genreChipActive: {
    borderColor: colors.accentTeal,
    backgroundColor: 'rgba(224,123,10,0.1)',
  },
  genreChipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  genreChipTextActive:   { color: colors.accentTeal },

  // Artist grid
  artistScroll: { flex: 1 },
  artistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  artistCard: {
    width: (width - 48 - 10) / 3,
    alignItems: 'center',
    padding: 12,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    position: 'relative',
    overflow: 'hidden',
  },
  artistCardActive: {
    borderColor: colors.accentTeal,
    backgroundColor: 'rgba(224,123,10,0.07)',
  },
  artistAvatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceHigh,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  artistAvatarWrapActive: {
    backgroundColor: 'rgba(224,123,10,0.15)',
  },
  artistInitial: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  artistName: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 3,
    lineHeight: 14,
  },
  artistNameActive: { color: colors.textPrimary },
  artistGenre: {
    color: colors.textMuted,
    fontSize: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  artistCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accentTeal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Finish
  finishWrap: { justifyContent: 'center', alignItems: 'center', paddingTop: 0 },
  finishTitle: {
    color: colors.textPrimary,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 6,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  finishSub: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  finishCard: {
    alignSelf: 'stretch',
    gap: 14,
    marginBottom: 36,
    backgroundColor: colors.surface,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },

  // Shared CTA
  primaryBtn: {
    backgroundColor: colors.accentTeal,
    borderRadius: 3,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#0A0907',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
