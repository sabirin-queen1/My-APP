import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../components/theme';

export default function WorkerJobsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Available Jobs</Text>
        <Text style={styles.sub}>Jobs matching your skills will appear here</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💼</Text>
          <Text style={styles.emptyText}>Jobs will appear once families post requests</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, ...FONTS.bold, marginBottom: 8 },
  sub: { fontSize: 14, color: COLORS.textMedium, marginBottom: 40 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyText: { fontSize: 15, color: COLORS.textLight, textAlign: 'center', lineHeight: 22 },
});
