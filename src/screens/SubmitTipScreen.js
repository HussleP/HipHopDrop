import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getCurrentUser } from '../services/authService';
import { colors } from '../theme/colors';

const CATEGORIES = [
  { id: 'tip',      label: 'News Tip',  icon: '🗞️', desc: 'Breaking story or insider info'  },
  { id: 'sighting', label: 'Sighting',  icon: '📍', desc: 'Spotted an artist somewhere'      },
  { id: 'leak',     label: 'Leak',      icon: '💧', desc: 'Unreleased music or merch'        },
  { id: 'event',    label: 'Event',     icon: '🎤', desc: 'Upcoming show or appearance'      },
];

export default function SubmitTipScreen({ navigation }) {
  const [category,   setCategory]   = useState('tip');
  const [title,      setTitle]      = useState('');
  const [body,       setBody]       = useState('');
  const [location,   setLocation]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  const user = getCurrentUser();
  const canSubmit = title.trim().length >= 5 && body.trim().length >= 20 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'tips'), {
        category,
        title:    title.trim(),
        body:     body.trim(),
        location: location.trim() || null,
        uid:      user?.uid      || 'anonymous',
        userName: user?.displayName || 'Anonymous',
        status:   'pending',
        createdAt: serverTimestamp(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitted(true);
    } catch {
      Alert.alert('Submission Failed', 'Could not send your tip. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />
        <View style={styles.successWrap}>
          <Text style={styles.successEmoji}>📬</Text>
          <Text style={styles.successTitle}>TIP RECEIVED</Text>
          <Text style={styles.successSub}>
            Our team will review your submission.{'\n'}Thanks for keeping the culture honest.
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.backBtnText}>BACK TO PROFILE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack} activeOpacity={0.7}>
            <Text style={styles.headerBackArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SUBMIT TIP</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Category */}
          <Text style={styles.fieldLabel}>WHAT ARE YOU SUBMITTING?</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => {
              const active = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, active && styles.categoryCardActive]}
                  onPress={() => { Haptics.selectionAsync(); setCategory(cat.id); }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>
                    {cat.label}
                  </Text>
                  <Text style={styles.categoryDesc}>{cat.desc}</Text>
                  {active && <View style={styles.activeBar} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Title */}
          <Text style={styles.fieldLabel}>
            HEADLINE <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Give it a punchy headline..."
            placeholderTextColor={colors.textMuted}
            maxLength={100}
            returnKeyType="next"
          />
          <Text style={styles.charCount}>{title.length} / 100</Text>

          {/* Body */}
          <Text style={styles.fieldLabel}>
            DETAILS <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={body}
            onChangeText={setBody}
            placeholder="What do you know? Be specific — who, what, when, where..."
            placeholderTextColor={colors.textMuted}
            maxLength={1000}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{body.length} / 1000</Text>

          {/* Location (optional) */}
          <Text style={styles.fieldLabel}>
            LOCATION <Text style={styles.optional}>(OPTIONAL)</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="City, venue, or address..."
            placeholderTextColor={colors.textMuted}
            maxLength={80}
          />

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              Tips are reviewed before publishing. False or harmful submissions will be ignored.
              Your identity is kept confidential.
            </Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.8}
          >
            <Text style={[styles.submitBtnText, !canSubmit && styles.submitBtnTextDisabled]}>
              {submitting ? 'SENDING...' : 'SUBMIT TIP  ↑'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBack:       { width: 40, height: 40, justifyContent: 'center' },
  headerBackArrow:  { color: colors.textPrimary, fontSize: 20 },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
  },

  scroll:        { flex: 1 },
  scrollContent: { padding: 16 },

  fieldLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
    marginTop: 20,
  },
  required: { color: colors.accentTeal },
  optional: { color: colors.textMuted, fontWeight: '400' },

  // Category grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '47%',
    padding: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    position: 'relative',
    overflow: 'hidden',
  },
  categoryCardActive: {
    borderColor: colors.accentTeal,
    backgroundColor: 'rgba(224,123,10,0.06)',
  },
  categoryIcon:  { fontSize: 22, marginBottom: 8 },
  categoryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  categoryLabelActive: { color: colors.textPrimary },
  categoryDesc: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 14,
  },
  activeBar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 3,
    height: '100%',
    backgroundColor: colors.accentTeal,
  },

  // Inputs
  input: {
    backgroundColor: colors.surface,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '400',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputMultiline: {
    minHeight: 120,
    paddingTop: 12,
    lineHeight: 22,
  },
  charCount: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '400',
    textAlign: 'right',
    marginTop: 5,
    letterSpacing: 0.5,
  },

  // Disclaimer
  disclaimer: {
    marginTop: 20,
    padding: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  disclaimerText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 17,
  },

  // Submit
  submitBtn: {
    marginTop: 20,
    backgroundColor: colors.accentTeal,
    borderRadius: 3,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitBtnText: {
    color: '#0A0907',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  submitBtnTextDisabled: { color: colors.textMuted },

  // Success screen
  successWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successEmoji: { fontSize: 64, marginBottom: 24 },
  successTitle: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  successSub: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  backBtn: {
    backgroundColor: colors.accentTeal,
    borderRadius: 3,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  backBtnText: {
    color: '#0A0907',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
