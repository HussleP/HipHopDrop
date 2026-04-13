import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const LAST_UPDATED  = 'April 13, 2025';
const CONTACT_EMAIL = 'support@hiphop-drop.app';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By downloading, installing, or using Hip-Hop Drop, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the app.`,
  },
  {
    title: '2. Use of the App',
    body: `Hip-Hop Drop is a hip-hop news, culture, and music discovery app. You agree to use the app only for lawful purposes and in a way that does not infringe the rights of others.

You must not:
• Post false, misleading, or defamatory content
• Harass, abuse, or threaten other users
• Submit tips or content you know to be false
• Attempt to gain unauthorised access to our systems
• Use the app for commercial purposes without our written consent`,
  },
  {
    title: '3. User-Generated Content',
    body: `When you submit tips, comments, or other content through Hip-Hop Drop, you grant us a non-exclusive, worldwide, royalty-free licence to use, display, and moderate that content within the app.

You are solely responsible for the content you submit. We reserve the right to remove any content that violates these terms or that we deem inappropriate, without notice.`,
  },
  {
    title: '4. Intellectual Property',
    body: `All content within Hip-Hop Drop — including design, code, graphics, and editorial content — is owned by Hip-Hop Drop or its licensors and is protected by copyright and other intellectual property laws.

Music videos are sourced via the YouTube Data API and remain the property of their respective rights holders. Hip-Hop Drop claims no ownership over third-party music content.`,
  },
  {
    title: '5. Push Notifications',
    body: `By enabling push notifications, you consent to receive alerts about new music drops, breaking news, and other hip-hop culture updates. You can opt out at any time via your device's notification settings or through the Drop Alerts screen in the app.`,
  },
  {
    title: '6. Disclaimers',
    body: `Hip-Hop Drop is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or timeliness of any content in the app. Music release dates, tour announcements, and other information may change without notice.

Tips submitted by users are unverified until reviewed. We are not responsible for inaccurate user-submitted content.`,
  },
  {
    title: '7. Limitation of Liability',
    body: `To the maximum extent permitted by law, Hip-Hop Drop and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the app.`,
  },
  {
    title: '8. Account Termination',
    body: `We reserve the right to suspend or terminate your account at any time if you violate these terms. You may delete your account at any time via Profile → Delete Account.`,
  },
  {
    title: '9. Changes to Terms',
    body: `We may update these Terms of Service from time to time. We will notify you of material changes via push notification or in-app notice. Continued use of the app after changes constitutes acceptance of the updated terms.`,
  },
  {
    title: '10. Governing Law',
    body: `These terms are governed by the laws of the jurisdiction in which Hip-Hop Drop operates. Any disputes shall be resolved in the appropriate courts of that jurisdiction.`,
  },
  {
    title: '11. Contact',
    body: `For questions about these Terms of Service, contact us at:\n\n${CONTACT_EMAIL}`,
  },
];

export default function TermsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} activeOpacity={0.7}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TERMS OF SERVICE</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.updated}>Last updated: {LAST_UPDATED}</Text>
        <Text style={styles.intro}>
          Please read these Terms of Service carefully before using Hip-Hop Drop.
          These terms govern your access to and use of our app and services.
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
  back:        { width: 40, height: 40, justifyContent: 'center' },
  backText:    { color: colors.textPrimary, fontSize: 20 },
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
