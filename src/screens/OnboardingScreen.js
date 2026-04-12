import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const ARTISTS = [
  'Kendrick Lamar', 'Drake', 'Travis Scott', 'Tyler, the Creator',
  'J. Cole', 'A$AP Rocky', 'Kanye West', 'Lil Uzi Vert',
  'Future', 'Playboi Carti', '21 Savage', 'Doechii',
  'Cardi B', 'Nicki Minaj', 'Megan Thee Stallion', 'Ice Spice',
];

const CATEGORIES = [
  { id: 'Drops', emoji: '👟', label: 'Drops', desc: 'Merch & sneaker drops' },
  { id: 'Tours', emoji: '🎤', label: 'Tours', desc: 'Concert & tour news' },
  { id: 'Beef', emoji: '🔥', label: 'Beef', desc: 'Rapper feuds & drama' },
  { id: 'Awards', emoji: '🏆', label: 'Awards', desc: 'Awards & nominations' },
  { id: 'Versus', emoji: '⚔️', label: 'Versus', desc: 'Fan polls & debates' },
];

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  function toggleArtist(name) {
    setSelectedArtists(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  }

  function toggleCategory(id) {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  async function finish() {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    await AsyncStorage.setItem('followed_artists', JSON.stringify(selectedArtists));
    await AsyncStorage.setItem('followed_categories', JSON.stringify(selectedCategories));
    onComplete();
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
        ))}
      </View>

      {/* Step 0 — Welcome */}
      {step === 0 && (
        <View style={styles.stepContainer}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeEmoji}>🎵</Text>
            <Text style={styles.welcomeTitle}>
              Welcome to{'\n'}hip-hop <Text style={styles.accent}>drop</Text>
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Your #1 source for hip-hop news, merch drops, and fan polls — all in one place.
            </Text>
            <View style={styles.featureList}>
              {[
                { emoji: '📰', text: 'Real-time hip-hop news' },
                { emoji: '👟', text: 'Merch drop alerts' },
                { emoji: '🗳️', text: 'Fan polls & debates' },
                { emoji: '🎵', text: 'Powered by Spotify' },
              ].map(f => (
                <View key={f.text} style={styles.featureRow}>
                  <Text style={styles.featureEmoji}>{f.emoji}</Text>
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              ))}
            </View>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(1)} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 1 — Pick Artists */}
      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Who do you follow?</Text>
          <Text style={styles.stepSubtitle}>Pick your favorite artists to personalize your feed</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
            <View style={styles.pillGrid}>
              {ARTISTS.map(name => (
                <TouchableOpacity
                  key={name}
                  style={[styles.pill, selectedArtists.includes(name) && styles.pillActive]}
                  onPress={() => toggleArtist(name)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, selectedArtists.includes(name) && styles.pillTextActive]}>
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.skipBtn} onPress={() => setStep(2)} activeOpacity={0.7}>
              <Text style={styles.skipBtnText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryBtn, styles.primaryBtnFlex]}
              onPress={() => setStep(2)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>
                Next {selectedArtists.length > 0 ? `(${selectedArtists.length})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Step 2 — Pick Categories */}
      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>What are you into?</Text>
          <Text style={styles.stepSubtitle}>Choose the content you want to see first</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryRow, selectedCategories.includes(cat.id) && styles.categoryRowActive]}
                onPress={() => toggleCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                  <Text style={styles.categoryDesc}>{cat.desc}</Text>
                </View>
                <View style={[styles.checkbox, selectedCategories.includes(cat.id) && styles.checkboxActive]}>
                  {selectedCategories.includes(cat.id) && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.skipBtn} onPress={finish} activeOpacity={0.7}>
              <Text style={styles.skipBtnText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, styles.primaryBtnFlex]} onPress={finish} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Let's Go 🎵</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: { backgroundColor: colors.accentTeal, width: 24, borderRadius: 2 },
  stepContainer: { flex: 1, padding: 24 },
  welcomeContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcomeEmoji: { fontSize: 60, marginBottom: 20 },
  welcomeTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 42,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  accent: { color: colors.accentTeal },
  welcomeSubtitle: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  featureList: { width: '100%', gap: 12 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureEmoji: { fontSize: 22 },
  featureText: { color: colors.textPrimary, fontSize: 14, fontWeight: '500' },
  primaryBtn: {
    backgroundColor: colors.accentTeal,
    paddingVertical: 16,
    borderRadius: 3,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryBtnFlex: { flex: 1, marginTop: 0 },
  primaryBtnText: { color: '#000', fontSize: 11, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  stepTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  stepSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 20,
  },
  scrollArea: { flex: 1 },
  pillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 3,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: { backgroundColor: 'transparent', borderColor: colors.accentTeal },
  pillText: { color: colors.textMuted, fontSize: 13, fontWeight: '500' },
  pillTextActive: { color: colors.accentTeal, fontWeight: '700' },
  bottomRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  skipBtn: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtnText: { color: colors.textMuted, fontSize: 15, fontWeight: '500' },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  categoryRowActive: { borderColor: colors.accentTeal },
  categoryEmoji: { fontSize: 26 },
  categoryInfo: { flex: 1 },
  categoryLabel: { color: colors.textPrimary, fontSize: 15, fontWeight: '500', marginBottom: 2 },
  categoryDesc: { color: colors.textMuted, fontSize: 12, fontWeight: '400' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: colors.accentTeal, borderColor: colors.accentTeal },
  checkmark: { color: '#000', fontSize: 13, fontWeight: '700' },
});
