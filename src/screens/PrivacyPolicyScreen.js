import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const LAST_UPDATED = 'April 13, 2025';
const CONTACT_EMAIL = 'support@hiphop-drop.app';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `We collect the following information when you use Hip-Hop Drop:

• Email address and display name (when you create an account)
• Device push notification token (to send you drop alerts)
• Your followed artists and genre preferences (stored locally on your device)
• Content you submit: tip submissions, comments, poll votes, and article reactions
• Basic usage data: screens viewed and features used (not sold or shared with advertisers)`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use your information solely to operate and improve Hip-Hop Drop:

• To deliver personalised drop alerts and push notifications
• To display your comments and reactions in the app
• To review and moderate tip submissions
• To maintain your account and preferences
• We do not sell your personal data to any third parties`,
  },
  {
    title: '3. Third-Party Services',
    body: `Hip-Hop Drop uses the following third-party services:

• Firebase (Google) — authentication, database, and push notifications. Google's privacy policy applies to data processed by Firebase.
• YouTube Data API — for fetching music video content. Google's privacy policy applies.
• Expo — for app delivery and over-the-air updates.

We do not use third-party advertising networks or tracking SDKs.`,
  },
  {
    title: '4. Data Storage & Security',
    body: `Your data is stored securely in Firebase Firestore, hosted by Google Cloud. We use Firebase Authentication for secure account management. Data is encrypted in transit and at rest. We retain your data only as long as your account is active.`,
  },
  {
    title: '5. Your Rights',
    body: `You have the right to:

• Access the personal data we hold about you
• Correct inaccurate data
• Delete your account and all associated data at any time (via Profile → Delete Account)
• Opt out of push notifications at any time via your device settings

To request a copy of your data or raise a privacy concern, contact us at ${CONTACT_EMAIL}.`,
  },
  {
    title: '6. Children\'s Privacy',
    body: `Hip-Hop Drop is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us with personal information, please contact us at ${CONTACT_EMAIL} and we will delete it promptly.`,
  },
  {
    title: '7. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes via a push notification or in-app notice. Your continued use of the app after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '8. Contact Us',
    body: `If you have any questions about this Privacy Policy or how we handle your data, please contact us at:\n\n${CONTACT_EMAIL}`,
  },
];

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} activeOpacity={0.7}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PRIVACY POLICY</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.updated}>Last updated: {LAST_UPDATED}</Text>
        <Text style={styles.intro}>
          Hip-Hop Drop ("we", "our", "us") is committed to protecting your privacy.
          This policy explains what data we collect, how we use it, and your rights
          regarding your personal information.
        </Text>

        {SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back:       { width: 40, height: 40, justifyContent: 'center' },
  backText:   { color: colors.textPrimary, fontSize: 20 },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
  },
  scroll:        { flex: 1 },
  scrollContent: { padding: 20 },
  updated: {
    color: colors.accentTeal,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  intro: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 21,
    marginBottom: 24,
  },
  section:      { marginBottom: 24 },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  sectionBody: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 22,
  },
});
