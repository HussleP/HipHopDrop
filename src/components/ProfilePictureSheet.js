/**
 * ProfilePictureSheet.js
 * Bottom sheet for choosing a profile picture:
 *   Tab 1 — Upload from camera roll
 *   Tab 2 — Pick any rapper from the database (fetched live from Spotify)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  ScrollView, Image, ActivityIndicator, Animated,
  Dimensions, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { findArtist } from '../services/spotifyService';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_H = SCREEN_H * 0.72;

// Full rapper database — pulled from Spotify on open
const RAPPER_NAMES = [
  // Legends
  'Kendrick Lamar', 'Drake', 'Travis Scott', 'Kanye West', 'J. Cole',
  'Lil Wayne', 'Eminem', 'Jay-Z', 'Nas', 'Snoop Dogg',
  'Ice Cube', '2Pac', 'The Notorious B.I.G.',
  // Current
  'Tyler, the Creator', 'Future', 'Playboi Carti', 'Young Thug',
  'Gunna', 'Lil Baby', 'A$AP Rocky', 'Cardi B', 'Nicki Minaj',
  'Baby Keem', 'Don Toliver', 'Lil Uzi Vert', 'Yeat', 'Central Cee',
  'Little Simz', 'Doechii', 'JID', 'Freddie Gibbs', 'Denzel Curry',
  // Underground OGs
  'Chief Keef', 'Lil B', 'Yung Lean', 'Lil Peep',
  'Juice WRLD', 'Mac Miller', 'Xavier Wulf', 'Pouya',
  'Bones', 'Night Lovell',
];

export default function ProfilePictureSheet({ visible, onClose, onSelect }) {
  const [tab,       setTab]       = useState('rappers'); // 'rappers' | 'upload'
  const [rappers,   setRappers]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const slideAnim = useRef(new Animated.Value(SHEET_H)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
      if (!rappers.length) loadRappers();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: SHEET_H, duration: 260, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  async function loadRappers() {
    setLoading(true);
    try {
      // Fetch in parallel batches of 8
      const results = [];
      for (let i = 0; i < RAPPER_NAMES.length; i += 8) {
        const batch = RAPPER_NAMES.slice(i, i + 8);
        const fetched = await Promise.all(batch.map(n => findArtist(n)));
        results.push(...fetched.filter(Boolean));
      }
      setRappers(results);
    } catch (err) {
      console.warn('[ProfilePicSheet] load error:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Allow photo access in Settings to upload a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      onSelect({ uri: result.assets[0].uri, type: 'upload' });
      onClose();
    }
  }

  async function handleCamera() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Allow camera access in Settings to take a profile photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      onSelect({ uri: result.assets[0].uri, type: 'upload' });
      onClose();
    }
  }

  function handleRapperPick(rapper) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect({ uri: rapper.imageUrl, type: 'rapper', name: rapper.name });
    onClose();
  }

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: overlayAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile Picture</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'rappers' && styles.tabActive]}
            onPress={() => { setTab('rappers'); Haptics.selectionAsync(); }}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, tab === 'rappers' && styles.tabTextActive]}>🎤 Rapper</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'upload' && styles.tabActive]}
            onPress={() => { setTab('upload'); Haptics.selectionAsync(); }}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, tab === 'upload' && styles.tabTextActive]}>📷 My Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {tab === 'upload' ? (
          <View style={styles.uploadTab}>
            <TouchableOpacity style={styles.uploadOption} onPress={handleUpload} activeOpacity={0.8}>
              <View style={styles.uploadIconWrap}>
                <Text style={styles.uploadIcon}>🖼️</Text>
              </View>
              <View style={styles.uploadInfo}>
                <Text style={styles.uploadLabel}>Choose from Library</Text>
                <Text style={styles.uploadSub}>Pick any photo from your camera roll</Text>
              </View>
              <Text style={styles.uploadArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadOption} onPress={handleCamera} activeOpacity={0.8}>
              <View style={styles.uploadIconWrap}>
                <Text style={styles.uploadIcon}>📸</Text>
              </View>
              <View style={styles.uploadInfo}>
                <Text style={styles.uploadLabel}>Take a Photo</Text>
                <Text style={styles.uploadSub}>Use your camera right now</Text>
              </View>
              <Text style={styles.uploadArrow}>›</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={colors.accentTeal} size="large" />
                <Text style={styles.loadingText}>Loading artists...</Text>
              </View>
            ) : (
              <ScrollView
                contentContainerStyle={styles.rapperGrid}
                showsVerticalScrollIndicator={false}
              >
                {rappers.map(rapper => (
                  <TouchableOpacity
                    key={rapper.id}
                    style={styles.rapperCell}
                    onPress={() => handleRapperPick(rapper)}
                    activeOpacity={0.8}
                  >
                    {rapper.imageUrl ? (
                      <Image source={{ uri: rapper.imageUrl }} style={styles.rapperImg} />
                    ) : (
                      <View style={[styles.rapperImg, { backgroundColor: colors.surfaceHigh, justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ fontSize: 24 }}>🎤</Text>
                      </View>
                    )}
                    <Text style={styles.rapperName} numberOfLines={1}>{rapper.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_H,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: colors.background,
    borderRadius: 16,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },

  // Tabs
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.surface },
  tabText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: '800',
  },

  // Upload tab
  uploadTab: {
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  uploadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
  },
  uploadIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surfaceHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon:  { fontSize: 22 },
  uploadInfo:  { flex: 1 },
  uploadLabel: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  uploadSub:   { color: colors.textMuted, fontSize: 12 },
  uploadArrow: { color: colors.textMuted, fontSize: 22 },

  // Loading
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { color: colors.textMuted, fontSize: 13 },

  // Rapper grid
  rapperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  rapperCell: {
    width: '22%',
    alignItems: 'center',
    gap: 6,
  },
  rapperImg: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 50,
    backgroundColor: colors.surfaceHigh,
  },
  rapperName: {
    color: colors.textPrimary,
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
