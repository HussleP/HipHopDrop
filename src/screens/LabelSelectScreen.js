import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  StatusBar, Dimensions, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { LABELS } from '../data/labels';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export const LABEL_STORAGE_KEY = 'user_label_id';

export default function LabelSelectScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LABEL_STORAGE_KEY).then(id => {
      if (id) setSelected(id);
    });
  }, []);

  function handleSelect(label) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(prev => prev === label.id ? null : label.id);
  }

  async function handleSave() {
    if (!selected) {
      Alert.alert('No label selected', 'Pick a label to claim it.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(true);
    await AsyncStorage.setItem(LABEL_STORAGE_KEY, selected);
    setSaving(false);
    navigation.goBack();
  }

  async function handleClear() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.removeItem(LABEL_STORAGE_KEY);
    setSelected(null);
  }

  const selectedLabel = LABELS.find(l => l.id === selected);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} activeOpacity={0.7}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CLAIM YOUR LABEL</Text>
        <TouchableOpacity onPress={handleClear} style={styles.clearBtn} activeOpacity={0.7}>
          <Text style={styles.clearText}>CLEAR</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Pick the label that speaks to your soul. It'll appear on your profile.
      </Text>

      <FlatList
        data={LABELS}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selected === item.id;
          return (
            <TouchableOpacity
              style={[
                styles.card,
                { borderColor: isSelected ? item.accentColor : colors.border },
                isSelected && { backgroundColor: item.bgColor },
              ]}
              onPress={() => handleSelect(item)}
              activeOpacity={0.8}
            >
              {/* Top accent bar */}
              <View style={[styles.cardBar, { backgroundColor: item.accentColor }]} />

              {/* Logo block */}
              <View style={[styles.logoBlock, { backgroundColor: item.bgColor }]}>
                <Text style={[styles.logoText, { color: item.accentColor }]}>
                  {item.logo}
                </Text>
              </View>

              {/* Label name */}
              <Text style={[styles.labelName, isSelected && { color: item.accentColor }]}>
                {item.name}
              </Text>

              {/* Vibe */}
              <Text style={styles.labelVibe} numberOfLines={1}>{item.vibe}</Text>

              {/* Artists */}
              <Text style={styles.labelArtists} numberOfLines={2}>
                {item.artists.slice(0, 3).join(' · ')}
              </Text>

              {/* Selected check */}
              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: item.accentColor }]}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={<View style={{ height: 120 }} />}
      />

      {/* CTA */}
      <View style={styles.ctaWrap}>
        {selectedLabel && (
          <View style={[styles.selectedBanner, { borderColor: selectedLabel.accentColor }]}>
            <Text style={styles.selectedBannerEmoji}>{selectedLabel.emoji}</Text>
            <Text style={[styles.selectedBannerName, { color: selectedLabel.accentColor }]}>
              {selectedLabel.name}
            </Text>
            <Text style={styles.selectedBannerVibe}>{selectedLabel.vibe}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            selected
              ? { backgroundColor: selectedLabel?.accentColor }
              : { backgroundColor: colors.surfaceHigh, borderWidth: 1, borderColor: colors.border },
          ]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={[styles.saveBtnText, !selected && { color: colors.textMuted }]}>
            {saving ? 'SAVING...' : selected ? `CLAIM ${selectedLabel?.name.toUpperCase()}` : 'SELECT A LABEL'}
          </Text>
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back:        { width: 40, height: 40, justifyContent: 'center' },
  backText:    { color: colors.textPrimary, fontSize: 20 },
  headerTitle: { color: colors.textPrimary, fontSize: 13, fontWeight: '800', letterSpacing: 3 },
  clearBtn:    { width: 50, alignItems: 'flex-end', justifyContent: 'center' },
  clearText:   { color: colors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },

  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '400',
    paddingHorizontal: 16,
    paddingVertical: 12,
    lineHeight: 18,
  },

  grid: { paddingHorizontal: 16, paddingTop: 4 },
  row:  { gap: 16, marginBottom: 16 },

  card: {
    width: CARD_WIDTH,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    position: 'relative',
  },
  cardBar: { height: 3, width: '100%' },

  logoBlock: {
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 12,
    marginBottom: 8,
    borderRadius: 2,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  labelName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    paddingHorizontal: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  labelVibe: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 1,
    paddingHorizontal: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  labelArtists: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '400',
    paddingHorizontal: 12,
    paddingBottom: 14,
    lineHeight: 15,
  },

  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: { color: '#000', fontSize: 11, fontWeight: '900' },

  // Bottom CTA
  ctaWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 28,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 3,
    backgroundColor: colors.surface,
  },
  selectedBannerEmoji: { fontSize: 18 },
  selectedBannerName: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  selectedBannerVibe: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  saveBtn: {
    borderRadius: 3,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#0A0907',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
