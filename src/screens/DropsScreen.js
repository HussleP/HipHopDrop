import React, { useState, useEffect } from 'react';
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
import { liveDrops, comingSoonDrops } from '../data/mockData';

// Countdown target: 2 hours from now
const TARGET_TIME = Date.now() + 2 * 60 * 60 * 1000;

function pad(n) {
  return String(n).padStart(2, '0');
}

function CountdownBanner() {
  const [remaining, setRemaining] = useState(TARGET_TIME - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(TARGET_TIME - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalSec = Math.max(0, Math.floor(remaining / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  return (
    <View style={styles.countdownBanner}>
      <View style={styles.countdownLeft}>
        <Text style={styles.countdownLabel}>Next Drop</Text>
        <Text style={styles.countdownItem} numberOfLines={1}>
          Drake — NOCTA Tech Fleece
        </Text>
      </View>
      <View style={styles.countdownTimer}>
        <Text style={styles.countdownTime}>
          {pad(h)}:{pad(m)}:{pad(s)}
        </Text>
        <Text style={styles.countdownTimerLabel}>until live</Text>
      </View>
    </View>
  );
}

function DropCard({ item, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.dropCard} activeOpacity={0.8}>
      <View style={[styles.dropImage, { backgroundColor: item.imageColor }]}>
        {item.status === 'live' && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>Live</Text>
          </View>
        )}
        {item.status === 'soon' && (
          <View style={styles.soonBadge}>
            <Text style={styles.soonBadgeText}>{item.timeLabel}</Text>
          </View>
        )}
      </View>
      <View style={styles.dropInfo}>
        <Text style={styles.dropArtist} numberOfLines={1}>{item.artist}</Text>
        <Text style={styles.dropName} numberOfLines={2}>{item.itemName}</Text>
        <Text style={styles.dropPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DropsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.headerText}>
          merch <Text style={styles.headerAccent}>drops</Text>
        </Text>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
          <Text style={styles.filterIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <CountdownBanner />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Now</Text>
          <View style={styles.grid}>
            {liveDrops.map((item) => (
              <DropCard
                key={item.id}
                item={item}
                onPress={() => navigation.navigate('MerchDetail', { item })}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coming Soon</Text>
          <View style={styles.grid}>
            {comingSoonDrops.map((item) => (
              <DropCard
                key={item.id}
                item={item}
                onPress={() => navigation.navigate('MerchDetail', { item })}
              />
            ))}
          </View>
        </View>
      </ScrollView>
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
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  headerAccent: {
    color: colors.accentTeal,
  },
  filterBtn: {
    padding: 4,
  },
  filterIcon: {
    color: colors.textMuted,
    fontSize: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  countdownBanner: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accentTeal,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  countdownLeft: {
    flex: 1,
    marginRight: 12,
  },
  countdownLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  countdownItem: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  countdownTimer: {
    alignItems: 'center',
  },
  countdownTime: {
    color: colors.accentTeal,
    fontSize: 26,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  countdownTimerLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '400',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dropCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dropImage: {
    height: 130,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  liveBadgeText: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '500',
  },
  soonBadge: {
    backgroundColor: colors.accentTeal,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  soonBadgeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '500',
  },
  dropInfo: {
    padding: 10,
    gap: 2,
  },
  dropArtist: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '400',
  },
  dropName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  dropPrice: {
    color: colors.accentTeal,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
});
