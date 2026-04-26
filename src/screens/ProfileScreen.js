import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
  Alert, TextInput, Keyboard, Animated, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { logOut, getCurrentUser } from '../services/authService';
import { getSavedCount } from '../services/savedArticlesService';
import { getReposts, removeRepost } from '../services/repostService';
import { LABELS } from '../data/labels';
import { LABEL_STORAGE_KEY } from './LabelSelectScreen';
import ProfilePictureSheet from '../components/ProfilePictureSheet';

const LYRIC_KEY       = 'user_favorite_lyric';
const BIO_KEY         = 'user_bio';
const PROFILE_PIC_KEY = 'user_profile_pic';

const MENU_ITEMS = [
  { id: 'label',         label: 'My Label',              sub: 'Choose your affiliation',     icon: 'pricetag-outline',            nav: 'LabelSelect'        },
  { id: 'alerts',        label: 'Drop Alerts',           sub: 'Manage your notifications',   icon: 'notifications-outline',       nav: 'DropAlerts'         },
  { id: 'saved',         label: 'Saved Articles',        sub: 'Your bookmarked articles',    icon: 'bookmark-outline',            nav: 'SavedArticles'      },
  { id: 'tip',           label: 'Submit a Tip',          sub: 'Send us a story or sighting', icon: 'mail-outline',                nav: 'SubmitTip'          },
  { id: 'followed',      label: 'Followed Artists',      sub: 'Artists you follow',          icon: 'star-outline',                nav: 'FollowedArtists'    },
  { id: 'notifications', label: 'Notification Settings', sub: 'Push, email preferences',     icon: 'settings-outline',            nav: 'NotificationSettings' },
  { id: 'about',         label: 'About Hot Drop',    sub: 'Version 1.1.0 · Legal',       icon: 'information-circle-outline',  nav: 'About'              },
];

// ── Editable field card ───────────────────────────────────────────────────────
function EditableCard({
  label, placeholder, value, onSave, accent,
  multiline = false, maxLength = 200, icon,
}) {
  const [editing,  setEditing]  = useState(false);
  const [draft,    setDraft]    = useState(value);
  const inputRef               = useRef(null);
  const borderAnim             = useRef(new Animated.Value(0)).current;

  function startEdit() {
    setDraft(value);
    setEditing(true);
    Haptics.selectionAsync();
    setTimeout(() => inputRef.current?.focus(), 60);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  }

  function handleSave() {
    Keyboard.dismiss();
    setEditing(false);
    onSave(draft.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  }

  function handleCancel() {
    Keyboard.dismiss();
    setEditing(false);
    setDraft(value);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  }

  const borderColor = borderAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [colors.border, accent],
  });

  return (
    <Animated.View style={[styles.editCard, { borderColor }]}>
      <View style={styles.editCardHeader}>
        <Ionicons name={icon} size={16} color={colors.textMuted} />
        <Text style={styles.editCardLabel}>{label}</Text>
        {!editing && (
          <TouchableOpacity onPress={startEdit} style={styles.editBtn} activeOpacity={0.7}>
            <Text style={[styles.editBtnText, { color: accent }]}>
              {value ? 'EDIT' : 'ADD'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {editing ? (
        <>
          <TextInput
            ref={inputRef}
            style={[styles.editInput, multiline && styles.editInputMulti, { color: colors.textPrimary }]}
            value={draft}
            onChangeText={setDraft}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            multiline={multiline}
            maxLength={maxLength}
            selectionColor={accent}
            returnKeyType={multiline ? 'default' : 'done'}
            onSubmitEditing={multiline ? undefined : handleSave}
          />
          <View style={styles.editActions}>
            <Text style={styles.charCount}>{draft.length}/{maxLength}</Text>
            <View style={styles.editBtnsRow}>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn} activeOpacity={0.7}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.saveBtn, { backgroundColor: accent }]}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        value ? (
          <TouchableOpacity onPress={startEdit} activeOpacity={0.75}>
            <Text style={styles.editCardValue}>{value}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={startEdit} activeOpacity={0.7}>
            <Text style={styles.editCardEmpty}>{placeholder}</Text>
          </TouchableOpacity>
        )
      )}
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const user = getCurrentUser();
  const [savedCount,   setSavedCount]   = useState(0);
  const [userLabel,    setUserLabel]    = useState(null);
  const [lyric,        setLyric]        = useState('');
  const [bio,          setBio]          = useState('');
  const [reposts,      setReposts]      = useState([]);
  const [profilePic,   setProfilePic]   = useState(null);
  const [showPicSheet, setShowPicSheet] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getSavedCount().then(setSavedCount);
      AsyncStorage.getItem(LABEL_STORAGE_KEY).then(id => {
        if (id) setUserLabel(LABELS.find(l => l.id === id) || null);
        else    setUserLabel(null);
      });
      AsyncStorage.getItem(LYRIC_KEY).then(v => setLyric(v || ''));
      AsyncStorage.getItem(BIO_KEY).then(v => setBio(v || ''));
      AsyncStorage.getItem(PROFILE_PIC_KEY).then(v => setProfilePic(v || null));
      getReposts().then(setReposts);
    }, [])
  );

  async function saveLyric(val) {
    setLyric(val);
    await AsyncStorage.setItem(LYRIC_KEY, val);
  }

  async function saveBio(val) {
    setBio(val);
    await AsyncStorage.setItem(BIO_KEY, val);
  }

  async function handleSelectPic(selected) {
    const uri = selected.uri;
    setProfilePic(uri);
    await AsyncStorage.setItem(PROFILE_PIC_KEY, uri);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function handleRemoveRepost(id) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await removeRepost(id);
    setReposts(prev => prev.filter(r => r.id !== id));
  }

  async function handleLogOut() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: async () => await logOut() },
    ]);
  }

  const displayName = user?.displayName || 'Hip-Hop Fan';
  const email       = user?.email || '';
  const initial     = displayName.charAt(0).toUpperCase();

  const accent  = userLabel?.accentColor || colors.accentTeal;
  const heroBg  = userLabel?.headerBg    || colors.surface;
  const labelBg = userLabel?.bgColor     || colors.background;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: labelBg }]}>
      <StatusBar barStyle="light-content" backgroundColor={labelBg} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero header ── */}
        <View style={[styles.heroSection, { backgroundColor: heroBg }]}>
          {userLabel && (
            <View style={[styles.labelBanner, { borderBottomColor: userLabel.accentColor }]}>
              <View style={[styles.labelLogoPill, { borderColor: userLabel.accentColor }]}>
                <Text style={[styles.labelLogoText, { color: userLabel.accentColor }]}>
                  {userLabel.logo}
                </Text>
              </View>
              <View style={styles.labelBannerInfo}>
                <Text style={[styles.labelBannerName, { color: userLabel.accentColor }]}>
                  {userLabel.name}
                </Text>
                <Text style={styles.labelBannerVibe}>{userLabel.vibe}</Text>
              </View>
              <Text style={styles.labelBannerEmoji}>{userLabel.emoji}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => setShowPicSheet(true)}
            activeOpacity={0.85}
            style={styles.avatarWrap}
          >
            <View style={[styles.avatar, { borderColor: accent, backgroundColor: heroBg }]}>
              {profilePic ? (
                <Image source={{ uri: profilePic }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarText, { color: accent }]}>{initial}</Text>
              )}
            </View>
            <View style={[styles.avatarEditBadge, { backgroundColor: accent }]}>
              <Text style={styles.avatarEditBadgeText}>📷</Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.displayName, { color: userLabel ? userLabel.accentColor : colors.textPrimary }]}>
            {displayName}
          </Text>
          <Text style={styles.handle}>{email}</Text>

          <View style={[styles.statsRow, { borderColor: userLabel ? userLabel.accentColor + '40' : colors.border }]}>
            {[
              { value: '7',        label: 'Artists' },
              { value: savedCount, label: 'Saved'   },
              { value: '3',        label: 'Alerts'  },
            ].map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: accent }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
                {i < arr.length - 1 && (
                  <View style={[styles.statDivider, { backgroundColor: userLabel ? userLabel.accentColor + '30' : colors.border }]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ── Favorite Lyric ── */}
        <View style={styles.profileSection}>
          <EditableCard
            icon="mic-outline"
            label="FAVORITE LYRIC"
            placeholder="Drop your favorite bar for anyone who visits your profile..."
            value={lyric}
            onSave={saveLyric}
            accent={accent}
            multiline
            maxLength={280}
          />
        </View>

        {/* ── Bio ── */}
        <View style={styles.profileSection}>
          <EditableCard
            icon="create-outline"
            label="BIO"
            placeholder="Who are you in the culture? Write anything..."
            value={bio}
            onSave={saveBio}
            accent={accent}
            multiline
            maxLength={400}
          />
        </View>

        {/* ── Reposts ── */}
        {reposts.length > 0 && (
          <View style={styles.profileSection}>
            <View style={styles.repostHeader}>
              <Text style={styles.repostHeaderTitle}>MY REPOSTS</Text>
              <Text style={styles.repostHeaderCount}>{reposts.length}</Text>
            </View>
            {reposts.map(item => (
              <View key={item.id} style={styles.repostCard}>
                {/* Type badge */}
                <View style={[styles.repostTypeBadge, {
                  backgroundColor:
                    item.type === 'video' ? '#00C4D420' :
                    item.type === 'poll'  ? '#a855f720' :
                    '#E07B0A20',
                }]}>
                  <Text style={[styles.repostTypeBadgeText, {
                    color:
                      item.type === 'video' ? '#00C4D4' :
                      item.type === 'poll'  ? '#a855f7' :
                      colors.accentTeal,
                  }]}>
                    {item.type === 'video' ? 'VIDEO' : item.type === 'poll' ? 'POLL' : 'ARTICLE'}
                  </Text>
                </View>

                <View style={styles.repostBody}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.repostThumb} resizeMode="cover" />
                  ) : (
                    <View style={[styles.repostThumb, { backgroundColor: item.imageColor || colors.surfaceHigh }]} />
                  )}
                  <View style={styles.repostInfo}>
                    <Text style={styles.repostTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.repostSub} numberOfLines={1}>{item.subtitle}</Text>
                  </View>
                </View>

                {/* Remove button */}
                <TouchableOpacity
                  style={styles.repostRemoveBtn}
                  onPress={() => handleRemoveRepost(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.repostRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ── No label prompt ── */}
        {!userLabel && (
          <TouchableOpacity
            style={styles.labelPrompt}
            onPress={() => navigation.navigate('LabelSelect')}
            activeOpacity={0.8}
          >
            <Text style={styles.labelPromptEmoji}>🏷️</Text>
            <View style={styles.labelPromptInfo}>
              <Text style={styles.labelPromptTitle}>CLAIM YOUR LABEL</Text>
              <Text style={styles.labelPromptSub}>Show your affiliation on your profile</Text>
            </View>
            <Text style={styles.labelPromptArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* ── Menu ── */}
        <View style={[styles.menuCard, { backgroundColor: colors.surface, marginTop: userLabel ? 20 : 12 }]}>
          {MENU_ITEMS.map((item, index) => {
            const sub = item.id === 'label' && userLabel ? userLabel.name : item.sub;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuRow, index < MENU_ITEMS.length - 1 && styles.menuRowBorder]}
                onPress={() => item.nav && navigation.navigate(item.nav)}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconBox}>
                  <Ionicons name={item.icon} size={18} color={colors.textMuted} />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={[styles.menuSub, item.id === 'label' && userLabel && { color: userLabel.accentColor }]}>
                    {sub}
                  </Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Log out ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogOut} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
      <ProfilePictureSheet
        visible={showPicSheet}
        onClose={() => setShowPicSheet(false)}
        onSelect={(selected) => {
          setShowPicSheet(false);
          handleSelectPic(selected);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1 },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  labelBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  labelLogoPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 10,
  },
  labelLogoText:    { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  labelBannerInfo:  { flex: 1 },
  labelBannerName: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  labelBannerVibe: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  labelBannerEmoji: { fontSize: 22 },

  avatarWrap: {
    marginBottom: 12,
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  avatarText: { fontSize: 34, fontWeight: '700' },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#080706',
  },
  avatarEditBadgeText: { fontSize: 11 },

  displayName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  handle: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 20,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '90%',
  },
  stat:        { flex: 1, alignItems: 'center' },
  statValue:   { fontSize: 20, fontWeight: '700', marginBottom: 2, letterSpacing: 1 },
  statLabel:   { color: colors.textMuted, fontSize: 9, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' },
  statDivider: { width: 1, height: 30 },

  // ── Profile section wrapper
  profileSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },

  // ── Editable card
  editCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
  },
  editCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  editCardLabel: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBtnText: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },

  editCardValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 23,
    fontStyle: 'italic',
  },
  editCardEmpty: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
  },

  editInput: {
    color: colors.textPrimary,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 23,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 10,
    minHeight: 36,
  },
  editInputMulti: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  charCount: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '400',
  },
  editBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
  },
  saveBtnText: { color: '#000', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

  // ── Reposts
  repostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  repostHeaderTitle: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  repostHeaderCount: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '800',
    backgroundColor: colors.green + '18',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  repostCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  repostTypeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
  },
  repostTypeBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  repostBody: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  repostThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    flexShrink: 0,
    backgroundColor: colors.surfaceHigh,
  },
  repostInfo:  { flex: 1 },
  repostTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 4,
  },
  repostSub: {
    color: colors.textMuted,
    fontSize: 11,
  },
  repostRemoveBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
  },
  repostRemoveText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },

  // Label prompt
  labelPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accentTeal,
    backgroundColor: 'rgba(224,123,10,0.06)',
    gap: 12,
  },
  labelPromptEmoji: { fontSize: 20 },
  labelPromptInfo:  { flex: 1 },
  labelPromptTitle: {
    color: colors.accentTeal,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 2,
  },
  labelPromptSub:   { color: colors.textMuted, fontSize: 11 },
  labelPromptArrow: { color: colors.textMuted, fontSize: 20 },

  // Menu
  menuCard: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuInfo:  { flex: 1 },
  menuLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  menuSub:   { color: colors.textMuted, fontSize: 12 },
  menuArrow: { color: colors.textMuted, fontSize: 20 },

  // Logout
  logoutBtn: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f87171',
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: '#f87171', fontSize: 15, fontWeight: '500' },
});
