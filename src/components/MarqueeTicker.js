import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function MarqueeTicker({ items = [], accentColor = colors.accentTeal }) {
  const pos         = useRef(new Animated.Value(0)).current;
  const containerW  = useRef(350);
  const contentW    = useRef(0);
  const [ready, setReady] = useState(false);
  const animRef     = useRef(null);

  const ticker = items.length
    ? items.map(s => `${s}   ◆   `).join('')
    : null;

  function run() {
    pos.setValue(containerW.current);
    animRef.current = Animated.timing(pos, {
      toValue: -contentW.current,
      duration: (containerW.current + contentW.current) * 14,
      useNativeDriver: true,
    });
    animRef.current.start(({ finished }) => {
      if (finished) run();
    });
  }

  useEffect(() => {
    if (ready) run();
    return () => animRef.current?.stop();
  }, [ready]);

  if (!ticker) return null;

  return (
    <View
      style={styles.wrap}
      onLayout={e => { containerW.current = e.nativeEvent.layout.width; }}
    >
      <View style={[styles.badge, { backgroundColor: accentColor }]}>
        <Text style={styles.badgeText}>LIVE</Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={{ transform: [{ translateX: pos }] }}
          onLayout={e => {
            contentW.current = e.nativeEvent.layout.width;
            if (!ready) setReady(true);
          }}
        >
          <Text style={[styles.text, { color: accentColor }]} numberOfLines={1}>
            {ticker}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D0A07',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#252018',
    height: 34,
    overflow: 'hidden',
  },
  badge: {
    height: '100%',
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  badgeText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  track: {
    flex: 1,
    overflow: 'hidden',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingLeft: 10,
  },
});
