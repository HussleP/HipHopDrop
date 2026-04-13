import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import ArtistProfileScreen from '../screens/ArtistProfileScreen';
import DropsScreen from '../screens/DropsScreen';
import MerchDetailScreen from '../screens/MerchDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DropAlertsScreen from '../screens/DropAlertsScreen';
import SavedArticlesScreen from '../screens/SavedArticlesScreen';
import SubmitTipScreen from '../screens/SubmitTipScreen';
import LabelSelectScreen from '../screens/LabelSelectScreen';
import AboutScreen from '../screens/AboutScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsScreen from '../screens/TermsScreen';
import UndergroundArtistScreen from '../screens/UndergroundArtistScreen';
import PosthumousDetailScreen from '../screens/PosthumousDetailScreen';
import VideosScreen from '../screens/VideosScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeFeed" component={HomeScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
      <Stack.Screen name="UndergroundArtist" component={UndergroundArtistScreen} />
      <Stack.Screen name="PosthumousDetail" component={PosthumousDetailScreen} />
    </Stack.Navigator>
  );
}

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="ArtistProfile" component={ArtistProfileScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
    </Stack.Navigator>
  );
}

function DropsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DropsFeed" component={DropsScreen} />
      <Stack.Screen name="MerchDetail" component={MerchDetailScreen} />
    </Stack.Navigator>
  );
}

function VideosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VideosFeed" component={VideosScreen} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain"   component={ProfileScreen}      />
      <Stack.Screen name="DropAlerts"    component={DropAlertsScreen}   />
      <Stack.Screen name="SavedArticles" component={SavedArticlesScreen} />
      <Stack.Screen name="SubmitTip"     component={SubmitTipScreen}     />
      <Stack.Screen name="LabelSelect"   component={LabelSelectScreen}   />
      <Stack.Screen name="About"         component={AboutScreen}         />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Terms"         component={TermsScreen}         />
    </Stack.Navigator>
  );
}

function TabIcon({ name, focused }) {
  const icons = {
    Home:   focused ? '🏠' : '🏚',
    Search: '🔍',
    Drops:  '👟',
    Videos: '🎬',
    Profile:'👤',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[name]}
    </Text>
  );
}

const linking = {
  prefixes: ['hiphop-drop://', 'https://hiphop-drop.app'],
  config: {
    screens: {
      Home: {
        screens: {
          HomeFeed:         'home',
          ArticleDetail:    'article/:id',
          UndergroundArtist:'underground/:id',
          PosthumousDetail: 'legacy/:id',
        },
      },
      Search: {
        screens: {
          SearchMain:   'search',
          ArtistProfile:'artist/:id',
          ArticleDetail:'search/article/:id',
        },
      },
      Drops: {
        screens: {
          DropsFeed:  'drops',
          MerchDetail:'drops/merch/:id',
        },
      },
      Videos: {
        screens: {
          VideosFeed: 'videos',
          VideoPlayer:'videos/play/:id',
        },
      },
      Profile: {
        screens: {
          ProfileMain:   'profile',
          DropAlerts:    'profile/alerts',
          SavedArticles: 'profile/saved',
          SubmitTip:     'profile/submit-tip',
        },
      },
    },
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon name={route.name} focused={focused} />
          ),
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: 4,
            height: 60,
          },
          tabBarActiveTintColor: colors.tabActive,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Search" component={SearchStack} />
        <Tab.Screen name="Drops" component={DropsStack} />
        <Tab.Screen name="Videos" component={VideosStack} />
        <Tab.Screen name="Profile" component={ProfileStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
