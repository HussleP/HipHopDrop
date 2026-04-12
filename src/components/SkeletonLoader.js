import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

/**
 * A single shimmering skeleton block.
 * Pass width, height, borderRadius as style props.
 */
export function SkeletonBlock({ style }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.block,
        { opacity },
        style,
      ]}
    />
  );
}

/**
 * A full skeleton screen for the home feed — shows while articles are loading.
 */
export function HomeFeedSkeleton() {
  return (
    <View style={styles.container}>
      {/* Hero skeleton */}
      <SkeletonBlock style={styles.heroBlock} />

      {/* Article row skeletons */}
      {[1, 2, 3, 4].map(i => (
        <View key={i} style={styles.rowWrap}>
          <SkeletonBlock style={styles.thumbBlock} />
          <View style={styles.rowLines}>
            <SkeletonBlock style={styles.lineShort} />
            <SkeletonBlock style={styles.lineLong} />
            <SkeletonBlock style={styles.lineMed} />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Skeleton for artist profile top section.
 */
export function ArtistProfileSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonBlock style={styles.artistHero} />
      <View style={{ padding: 16, gap: 12 }}>
        <SkeletonBlock style={styles.lineLong} />
        <SkeletonBlock style={styles.lineMed} />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          {[1, 2, 3].map(i => (
            <SkeletonBlock key={i} style={styles.trackThumb} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.border,
    borderRadius: 6,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 0,
  },
  heroBlock: {
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
  },
  rowWrap: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  thumbBlock: {
    width: 80,
    height: 80,
    borderRadius: 10,
    flexShrink: 0,
  },
  rowLines: {
    flex: 1,
    gap: 8,
  },
  lineShort: {
    height: 10,
    width: '35%',
    borderRadius: 5,
  },
  lineLong: {
    height: 13,
    width: '90%',
    borderRadius: 5,
  },
  lineMed: {
    height: 10,
    width: '55%',
    borderRadius: 5,
  },
  artistHero: {
    height: 300,
    borderRadius: 0,
    marginHorizontal: -16,
  },
  trackThumb: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});
