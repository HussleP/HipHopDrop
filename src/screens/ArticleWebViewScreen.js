import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Share, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function ArticleWebViewScreen({ route, navigation }) {
  const { url, title, source } = route.params;

  const [loadProgress, setLoadProgress] = useState(0);
  const [canGoBack,    setCanGoBack]    = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [pageTitle,    setPageTitle]    = useState(title || '');
  const [error,        setError]        = useState(false);

  const webViewRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  function onLoadProgress({ nativeEvent }) {
    const p = nativeEvent.progress;
    setLoadProgress(p);
    Animated.timing(progressAnim, {
      toValue: p,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }

  function onNavigationStateChange(state) {
    setCanGoBack(state.canGoBack);
    setCanGoForward(state.canGoForward);
    if (state.title && state.title !== 'about:blank') {
      setPageTitle(state.title);
    }
  }

  async function handleShare() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({ title, message: `${title}\n\n${url}` });
    } catch (_) {}
  }

  function handleBack() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (canGoBack) {
      webViewRef.current?.goBack();
    } else {
      navigation.goBack();
    }
  }

  const progressWidth = progressAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Chrome header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerSource} numberOfLines={1}>{source || 'Article'}</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{pageTitle}</Text>
        </View>

        <TouchableOpacity onPress={handleShare} style={styles.headerBtn} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      {loadProgress < 1 && (
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      )}

      {/* WebView */}
      {error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorEmoji}>📡</Text>
          <Text style={styles.errorTitle}>Couldn't load article</Text>
          <Text style={styles.errorSub}>{url}</Text>
          <TouchableOpacity
            style={styles.errorBtn}
            onPress={() => { setError(false); webViewRef.current?.reload(); }}
            activeOpacity={0.8}
          >
            <Text style={styles.errorBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webview}
          onLoadProgress={onLoadProgress}
          onLoadEnd={() => setLoadProgress(1)}
          onNavigationStateChange={onNavigationStateChange}
          onError={() => setError(true)}
          onHttpError={() => setError(true)}
          allowsBackForwardNavigationGestures
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction
          injectedJavaScript={READER_CSS}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingWrap}>
              <Text style={styles.loadingText}>Loading article...</Text>
            </View>
          )}
        />
      )}

      {/* Bottom nav bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.navBtn, !canGoBack && styles.navBtnDisabled]}
          onPress={() => canGoBack && webViewRef.current?.goBack()}
          activeOpacity={0.7}
          disabled={!canGoBack}
        >
          <Ionicons name="chevron-back" size={22} color={canGoBack ? colors.textPrimary : colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, !canGoForward && styles.navBtnDisabled]}
          onPress={() => canGoForward && webViewRef.current?.goForward()}
          activeOpacity={0.7}
          disabled={!canGoForward}
        >
          <Ionicons name="chevron-forward" size={22} color={canGoForward ? colors.textPrimary : colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => webViewRef.current?.reload()}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.navSpacer} />

        <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.8}>
          <Text style={styles.shareBtnText}>SHARE ARTICLE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Injected CSS to improve readability on article pages
const READER_CSS = `
  (function() {
    var style = document.createElement('style');
    style.textContent = \`
      * { -webkit-tap-highlight-color: transparent; }
      :root {
        color-scheme: dark;
        background: #0c0a08;
      }
    \`;
    document.head.appendChild(style);
  })();
  true;
`;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    gap: 6,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  headerSource: {
    color: colors.accentTeal,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  progressTrack: {
    height: 2,
    backgroundColor: colors.border,
    width: '100%',
  },
  progressFill: {
    height: 2,
    backgroundColor: colors.accentTeal,
  },

  webview: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
  },

  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
    backgroundColor: colors.background,
  },
  errorEmoji: { fontSize: 40 },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  errorSub: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
  errorBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.accentTeal,
  },
  errorBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: 4,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnDisabled: { opacity: 0.3 },
  navSpacer:      { flex: 1 },
  shareBtn: {
    backgroundColor: colors.accentTeal,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  shareBtnText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
