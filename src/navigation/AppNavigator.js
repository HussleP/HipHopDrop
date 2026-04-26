import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen              from '../screens/HomeScreen';
import DropsScreen             from '../screens/DropsScreen';
import SearchScreen            from '../screens/SearchScreen';
import ArtistProfileScreen     from '../screens/ArtistProfileScreen';
import ChartsScreen            from '../screens/ChartsScreen';
import MerchDetailScreen       from '../screens/MerchDetailScreen';
import ProfileScreen           from '../screens/ProfileScreen';
import DropAlertsScreen        from '../screens/DropAlertsScreen';
import SavedArticlesScreen     from '../screens/SavedArticlesScreen';
import SubmitTipScreen         from '../screens/SubmitTipScreen';
import LabelSelectScreen       from '../screens/LabelSelectScreen';
import AboutScreen             from '../screens/AboutScreen';
import PrivacyPolicyScreen     from '../screens/PrivacyPolicyScreen';
import TermsScreen             from '../screens/TermsScreen';
import FollowedArtistsScreen   from '../screens/FollowedArtistsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import ArticleDetailScreen     from '../screens/ArticleDetailScreen';
import ArticleWebViewScreen    from '../screens/ArticleWebViewScreen';
import AffiliateStatsScreen    from '../screens/AffiliateStatsScreen';
import AdminDropsScreen        from '../screens/AdminDropsScreen';
import { colors }              from '../theme/colors';
import { LABELS }              from '../data/labels';
import { LABEL_STORAGE_KEY }   from '../screens/LabelSelectScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── LIVE tab stack (home drop feed) ──────────────────────────────────────────
function LiveStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeFeed"       component={HomeScreen}           />
      <Stack.Screen name="ArticleWebView" component={ArticleWebViewScreen} />
      <Stack.Screen name="ArticleDetail"  component={ArticleDetailScreen}  />
      <Stack.Screen name="MerchDetail"    component={MerchDetailScreen}    />
    </Stack.Navigator>
  );
}

// ── CALENDAR tab stack (drop calendar) ───────────────────────────────────────
function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DropsFeed"      component={DropsScreen}          />
      <Stack.Screen name="MerchDetail"    component={MerchDetailScreen}    />
      <Stack.Screen name="ArticleWebView" component={ArticleWebViewScreen} />
      <Stack.Screen name="ArticleDetail"  component={ArticleDetailScreen}  />
    </Stack.Navigator>
  );
}

// ── ARTISTS tab stack (search + artist profiles) ──────────────────────────────
function ArtistsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain"     component={SearchScreen}         />
      <Stack.Screen name="ArtistProfile"  component={ArtistProfileScreen}  />
      <Stack.Screen name="ArticleDetail"  component={ArticleDetailScreen}  />
      <Stack.Screen name="ArticleWebView" component={ArticleWebViewScreen} />
      <Stack.Screen name="Charts"         component={ChartsScreen}         />
    </Stack.Navigator>
  );
}

// ── PROFILE tab stack ─────────────────────────────────────────────────────────
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain"          component={ProfileScreen}             />
      <Stack.Screen name="DropAlerts"           component={DropAlertsScreen}          />
      <Stack.Screen name="SavedArticles"        component={SavedArticlesScreen}       />
      <Stack.Screen name="SubmitTip"            component={SubmitTipScreen}           />
      <Stack.Screen name="LabelSelect"          component={LabelSelectScreen}         />
      <Stack.Screen name="About"                component={AboutScreen}               />
      <Stack.Screen name="PrivacyPolicy"        component={PrivacyPolicyScreen}       />
      <Stack.Screen name="Terms"                component={TermsScreen}               />
      <Stack.Screen name="FollowedArtists"      component={FollowedArtistsScreen}     />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen}/>
      <Stack.Screen name="ArticleWebView"       component={ArticleWebViewScreen}      />
      <Stack.Screen name="AffiliateStats"       component={AffiliateStatsScreen}      options={{ headerShown: false }} />
      <Stack.Screen name="AdminDrops"           component={AdminDropsScreen}          options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// ── Tab icon map ──────────────────────────────────────────────────────────────
const TAB_ICONS = {
  Live:     ['radio-outline',          'radio',              24],
  Calendar: ['calendar-outline',       'calendar',           22],
  Artists:  ['people-outline',         'people',             23],
  Profile:  ['person-circle-outline',  'person-circle',      24],
};

// ── Navigator ─────────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const [labelColor, setLabelColor] = useState(colors.tabActive);

  async function loadLabelColor() {
    try {
      const id = await AsyncStorage.getItem(LABEL_STORAGE_KEY);
      if (id) {
        const label = LABELS.find(l => l.id === id);
        if (label) { setLabelColor(label.accentColor); return; }
      }
      setLabelColor(colors.tabActive);
    } catch (_) {
      setLabelColor(colors.tabActive);
    }
  }

  useEffect(() => { loadLabelColor(); }, []);

  return (
    <NavigationContainer onStateChange={loadLabelColor}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color }) => {
            const [outline, filled, iconSize] = TAB_ICONS[route.name] || ['ellipse-outline', 'ellipse', 22];
            const iconColor = (route.name === 'Profile' && focused) ? labelColor : color;
            return <Ionicons name={focused ? filled : outline} size={iconSize} color={iconColor} />;
          },
          tabBarActiveTintColor:   colors.tabActive,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarStyle: {
            backgroundColor: '#080706',
            borderTopColor:  '#1E1A16',
            borderTopWidth:  1,
            paddingBottom:   8,
            paddingTop:      6,
            height:          66,
            shadowColor:     '#000',
            shadowOffset:    { width: 0, height: -3 },
            shadowOpacity:   0.4,
            shadowRadius:    8,
            elevation:       12,
          },
          tabBarLabelStyle: {
            fontSize: 10, fontWeight: '700', letterSpacing: 0.6, marginTop: -1,
          },
        })}
      >
        <Tab.Screen name="Live"     component={LiveStack}     />
        <Tab.Screen name="Calendar" component={CalendarStack} />
        <Tab.Screen name="Artists"  component={ArtistsStack}  />
        <Tab.Screen name="Profile"  component={ProfileStack}  />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
