/**
 * Hot Drop — Admin Drops Screen
 *
 * Add, edit, and manage drops directly from the app.
 * Access: Profile → tap "About Hot Drop" 5× → tap the 💊 chip at the top
 *
 * Only renders the edit UI if the signed-in email matches ADMIN_EMAIL.
 */

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';
import { useDrops, addDrop, updateDrop, softDeleteDrop, computeStatus } from '../services/dropsService';
import { getCurrentUser } from '../services/authService';

// ← Change this to your email address
const ADMIN_EMAIL = 'zachary.damien@gmail.com';

const CATEGORIES = ['tee','hoodie','jacket','hat','deck','vinyl','boxset'];
const ACCENT_PRESETS = [
  '#E07B0A','#FF1A1A','#a855f7','#4ade80','#00C4D4','#E8305A','#C9A45A','#00E676',
];

function statusColor(s) {
  if (s === 'live')     return '#4ade80';
  if (s === 'upcoming') return colors.accentTeal;
  return colors.textMuted;
}

// ── Add/Edit form ─────────────────────────────────────────────────────────────

function DropForm({ initial, onSave, onCancel, saving }) {
  const [artist,      setArtist]      = useState(initial?.artist      ?? '');
  const [item,        setItem]        = useState(initial?.item        ?? '');
  const [price,       setPrice]       = useState(String(initial?.price ?? ''));
  const [category,    setCategory]    = useState(initial?.category    ?? 'tee');
  const [dropTime,    setDropTime]    = useState(initial?.dropTime ? new Date(initial.dropTime) : new Date(Date.now() + 86400000));
  const [limited,     setLimited]     = useState(initial?.limited     ?? true);
  const [buyUrl,      setBuyUrl]      = useState(initial?.buyUrl      ?? '');
  const [sizesText,   setSizesText]   = useState(initial?.sizes?.join(', ') ?? 'S, M, L, XL');
  const [tagsText,    setTagsText]    = useState(initial?.tags?.join(', ')  ?? '');
  const [accentColor, setAccentColor] = useState(initial?.accentColor ?? '#E07B0A');
  const [brand,       setBrand]       = useState(initial?.brand       ?? 'hiphop');
  const [showPicker,  setShowPicker]  = useState(false);

  function submit() {
    if (!artist.trim() || !item.trim() || !buyUrl.trim()) {
      Alert.alert('Missing fields', 'Artist, item name, and buy URL are required.');
      return;
    }
    onSave({
      artist:      artist.trim(),
      item:        item.trim(),
      price:       parseFloat(price) || 0,
      category,
      dropTime:    dropTime.getTime(),
      sizes:       sizesText ? sizesText.split(',').map(s => s.trim()).filter(Boolean) : null,
      limited,
      buyUrl:      buyUrl.trim(),
      tags:        tagsText ? tagsText.split(',').map(s => s.trim().toUpperCase()).filter(Boolean) : [],
      accentColor,
      imageColor:  '#0a0a0a',
      brand,
    });
  }

  return (
    <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled">
      <Field label="ARTIST / BRAND" value={artist} onChangeText={setArtist} placeholder="e.g. Supreme" />
      <Field label="ITEM NAME"      value={item}   onChangeText={setItem}   placeholder="e.g. Box Logo Tee (Black)" />
      <Field label="PRICE ($)"      value={price}  onChangeText={setPrice}  placeholder="54" keyboardType="numeric" />
      <Field label="BUY URL"        value={buyUrl} onChangeText={setBuyUrl} placeholder="https://..." autoCapitalize="none" />
      <Field label="SIZES (comma-separated, leave blank if N/A)" value={sizesText} onChangeText={setSizesText} placeholder="S, M, L, XL" />
      <Field label='TAGS (comma-separated: LIMITED, COLLAB, RARE…)' value={tagsText} onChangeText={setTagsText} placeholder="LIMITED, COLLAB" />

      {/* Category */}
      <Text style={styles.fieldLabel}>CATEGORY</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map(c => (
          <TouchableOpacity key={c} style={[styles.chip, category === c && styles.chipActive]} onPress={() => setCategory(c)}>
            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Brand */}
      <Text style={styles.fieldLabel}>BRAND TYPE</Text>
      <View style={styles.chipRow}>
        {['hiphop','skate'].map(b => (
          <TouchableOpacity key={b} style={[styles.chip, brand === b && styles.chipActive]} onPress={() => setBrand(b)}>
            <Text style={[styles.chipText, brand === b && styles.chipTextActive]}>{b === 'hiphop' ? 'HIP-HOP' : 'SKATE'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Accent color */}
      <Text style={styles.fieldLabel}>ACCENT COLOR</Text>
      <View style={styles.chipRow}>
        {ACCENT_PRESETS.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.colorDot, { backgroundColor: c }, accentColor === c && styles.colorDotActive]}
            onPress={() => setAccentColor(c)}
          />
        ))}
      </View>

      {/* Drop time */}
      <Text style={styles.fieldLabel}>DROP TIME</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
        <Ionicons name="calendar-outline" size={16} color={colors.accentTeal} />
        <Text style={styles.dateBtnText}>{dropTime.toLocaleString()}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={dropTime}
          mode="datetime"
          display="default"
          onChange={(_, d) => { setShowPicker(false); if (d) setDropTime(d); }}
        />
      )}

      {/* Limited toggle */}
      <View style={styles.toggleRow}>
        <Text style={styles.fieldLabel}>LIMITED RELEASE</Text>
        <Switch
          value={limited}
          onValueChange={setLimited}
          trackColor={{ false: colors.border, true: colors.accentTeal }}
          thumbColor="#fff"
        />
      </View>

      {/* Actions */}
      <TouchableOpacity style={styles.saveBtn} onPress={submit} disabled={saving} activeOpacity={0.8}>
        {saving
          ? <ActivityIndicator color="#000" />
          : <Text style={styles.saveBtnText}>{initial ? 'SAVE CHANGES' : 'ADD DROP  ↑'}</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
        <Text style={styles.cancelBtnText}>CANCEL</Text>
      </TouchableOpacity>
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

function Field({ label, ...props }) {
  return (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...props} />
    </>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function AdminDropsScreen({ navigation }) {
  const user          = getCurrentUser();
  const isAdmin       = user?.email === ADMIN_EMAIL;
  const { drops }     = useDrops();
  const [mode,   setMode]   = useState('list'); // 'list' | 'add' | 'edit'
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);

  const sortedDrops = [...drops].sort((a, b) => a.dropTime - b.dropTime);

  async function handleSave(data) {
    setSaving(true);
    try {
      if (editing) {
        await updateDrop(editing.id, data);
      } else {
        await addDrop(data);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMode('list');
      setEditing(null);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(drop) {
    Alert.alert(
      'Remove Drop',
      `Remove "${drop.item}" from the feed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            try {
              await softDeleteDrop(drop.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => mode === 'list' ? navigation.goBack() : (setMode('list'), setEditing(null))}
          style={styles.back}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'list' ? 'MANAGE DROPS' : editing ? 'EDIT DROP' : 'ADD DROP'}
        </Text>
        {mode === 'list' && isAdmin
          ? <TouchableOpacity style={styles.addBtn} onPress={() => { setEditing(null); setMode('add'); }} activeOpacity={0.8}>
              <Ionicons name="add" size={20} color="#000" />
            </TouchableOpacity>
          : <View style={{ width: 40 }} />
        }
      </View>

      {!isAdmin && (
        <View style={styles.noAccess}>
          <Ionicons name="lock-closed-outline" size={36} color={colors.textMuted} />
          <Text style={styles.noAccessText}>Admin access only.</Text>
        </View>
      )}

      {isAdmin && mode === 'list' && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.countLabel}>{sortedDrops.length} DROPS IN FEED</Text>
          {sortedDrops.map(drop => {
            const status = computeStatus(drop);
            return (
              <View key={drop.id} style={styles.dropRow}>
                <View style={[styles.statusDot, { backgroundColor: statusColor(status) }]} />
                <View style={styles.dropInfo}>
                  <Text style={styles.dropArtist}>{drop.artist}</Text>
                  <Text style={styles.dropItem} numberOfLines={1}>{drop.item}</Text>
                  <Text style={styles.dropMeta}>
                    ${drop.price} · {drop.category.toUpperCase()} · {status.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.dropActions}>
                  <TouchableOpacity onPress={() => { setEditing(drop); setMode('edit'); }} style={styles.actionBtn}>
                    <Ionicons name="create-outline" size={18} color={colors.accentTeal} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(drop)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={18} color='#f87171' />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {isAdmin && (mode === 'add' || mode === 'edit') && (
        <DropForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setMode('list'); setEditing(null); }}
          saving={saving}
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  back:        { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: colors.textPrimary, fontSize: 13, fontWeight: '800', letterSpacing: 3 },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.accentTeal, justifyContent: 'center', alignItems: 'center',
  },

  countLabel: {
    color: colors.textMuted, fontSize: 9, fontWeight: '800',
    letterSpacing: 2, margin: 16, marginBottom: 8,
  },
  dropRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12,
  },
  statusDot:   { width: 8, height: 8, borderRadius: 4 },
  dropInfo:    { flex: 1 },
  dropArtist:  { color: colors.textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 1 },
  dropItem:    { color: colors.textMuted, fontSize: 12, marginBottom: 2 },
  dropMeta:    { color: colors.textMuted, fontSize: 10, letterSpacing: 0.5 },
  dropActions: { flexDirection: 'row', gap: 4 },
  actionBtn:   { padding: 8 },

  noAccess:     { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  noAccessText: { color: colors.textMuted, fontSize: 14 },

  // Form
  formScroll:  { flex: 1, padding: 16 },
  fieldLabel:  { color: colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 2, marginTop: 18, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface, borderRadius: 3,
    borderWidth: 1, borderColor: colors.border,
    color: colors.textPrimary, fontSize: 14,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  chipRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 3,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  chipActive:     { borderColor: colors.accentTeal, backgroundColor: 'rgba(224,123,10,0.1)' },
  chipText:       { color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  chipTextActive: { color: colors.accentTeal },
  colorDot:       { width: 28, height: 28, borderRadius: 14 },
  colorDotActive: { borderWidth: 2, borderColor: '#fff' },
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.surface, borderRadius: 3,
    borderWidth: 1, borderColor: colors.border, padding: 12,
  },
  dateBtnText:  { color: colors.textPrimary, fontSize: 14 },
  toggleRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 },
  saveBtn: {
    marginTop: 24, backgroundColor: colors.accentTeal,
    borderRadius: 3, paddingVertical: 16, alignItems: 'center',
  },
  saveBtnText:   { color: '#0A0907', fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  cancelBtn:     { marginTop: 10, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { color: colors.textMuted, fontSize: 13 },
});
