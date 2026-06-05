import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SHADOWS } from '../components/theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.logoArea}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🏠</Text>
        </View>
        <Text style={styles.appName}>HomeCare</Text>
        <Text style={styles.tagline}>Trusted Help, Happy Home</Text>
      </View>

      <View style={styles.heroArea}>
        <Text style={styles.heroText}>🇸🇴 Somalia&apos;s #1 Domestic Platform</Text>
        <Text style={styles.heroTitle}>Find Trusted{'\n'}Domestic Workers</Text>
        <Text style={styles.heroSub}>Safe · Reliable · Verified</Text>
      </View>

      <View style={styles.features}>
        {[
          { icon: '✅', label: 'Verified Workers' },
          { icon: '📋', label: 'Digital Contracts' },
          { icon: '⭐', label: 'Ratings & Reviews' },
        ].map((f, i) => (
          <View key={i} style={styles.featureChip}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureLabel}>{f.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.btnPrimaryText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.btnOutlineText}>Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stores}>
        <View style={styles.storeBtn}><Text style={styles.storeText}>📱 Google Play</Text></View>
        <View style={styles.storeBtn}><Text style={styles.storeText}>🍎 App Store</Text></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 24 },
  logoArea: { alignItems: 'center', marginTop: 32, marginBottom: 32 },
  logoBox: { width: 72, height: 72, backgroundColor: COLORS.primary, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 28, ...FONTS.extrabold, color: COLORS.primary },
  tagline: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  heroArea: { alignItems: 'center', marginBottom: 32 },
  heroText: { fontSize: 13, color: COLORS.primary, ...FONTS.semibold, marginBottom: 12, backgroundColor: COLORS.primaryLight, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  heroTitle: { fontSize: 36, ...FONTS.extrabold, color: COLORS.textDark, textAlign: 'center', lineHeight: 44, marginBottom: 8 },
  heroSub: { fontSize: 16, color: COLORS.textMedium },
  features: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 40, flexWrap: 'wrap' },
  featureChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.bg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  featureIcon: { fontSize: 16 },
  featureLabel: { fontSize: 13, ...FONTS.medium, color: COLORS.textMedium },
  actions: { gap: 12, marginBottom: 20 },
  btnPrimary: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', ...SHADOWS.md },
  btnPrimaryText: { color: '#fff', fontSize: 17, ...FONTS.bold },
  btnOutline: { borderWidth: 2, borderColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnOutlineText: { color: COLORS.primary, fontSize: 17, ...FONTS.bold },
  stores: { flexDirection: 'row', gap: 12 },
  storeBtn: { flex: 1, backgroundColor: COLORS.textDark, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  storeText: { color: '#fff', fontSize: 13, ...FONTS.semibold },
});
