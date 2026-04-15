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
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function MerchDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const isLive = item.status === 'live';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Cover */}
        <View style={[styles.coverImage, { backgroundColor: item.imageColor }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          {isLive ? (
            <View style={styles.liveOverlay}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live Now</Text>
            </View>
          ) : (
            <View style={styles.soonOverlay}>
              <Text style={styles.soonText}>Dropping {item.timeLabel}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.artist}>{item.artist}</Text>
          <Text style={styles.itemName}>{item.itemName}</Text>
          <Text style={styles.price}>{item.price}</Text>

          <View style={styles.divider} />

          <Text style={styles.detailsHeader}>Details</Text>
          <Text style={styles.detailsBody}>
            Limited release item. Ships within 5–7 business days of drop close. All sales final. No restocks planned.
          </Text>

          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Limited Edition</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Official Merch</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {isLive ? (
          <TouchableOpacity style={styles.shopBtn} activeOpacity={0.85}>
            <Text style={styles.shopBtnText}>Shop Now</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.alertBtn} activeOpacity={0.85}>
              <Text style={styles.alertBtnText}>🔔  Set Alert</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shopBtnDisabled} activeOpacity={0.85}>
              <Text style={styles.shopBtnDisabledText}>Not Yet Live</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: { flex: 1 },
  coverImage: {
    height: 280,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 22,
  },
  liveOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.2)',
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  liveText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '500',
  },
  soonOverlay: {
    backgroundColor: colors.accentTeal,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  soonText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '500',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  artist: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 4,
  },
  itemName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 30,
    marginBottom: 8,
  },
  price: {
    color: colors.accentTeal,
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 20,
  },
  detailsHeader: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  detailsBody: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '400',
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  shopBtn: {
    flex: 1,
    backgroundColor: colors.accentTeal,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  shopBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  alertBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  alertBtnText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  shopBtnDisabled: {
    flex: 1,
    backgroundColor: colors.border,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  shopBtnDisabledText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
});
