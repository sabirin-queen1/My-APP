import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { contractsAPI, workersAPI, notificationsAPI } from '../services/api';
import { COLORS, FONTS, SHADOWS } from '../components/theme';

export default function WorkerDashboard({ navigation }) {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    Promise.all([contractsAPI.getAll(), workersAPI.getDashboard(), notificationsAPI.getAll()])
      .then(([c, s, n]) => { setContracts(c.data); setStats(s.data); setNotifications(n.data.notifications.slice(0, 5)); });
  }, []);

  const pending = contracts.filter(c => c.status === 'pending');
  const active = contracts.filter(c => c.status === 'active');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.sub}>Manage your jobs and contracts</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {stats?.rating || user?.rating || '0.0'}</Text>
          </View>
        </View>

        {!user?.isVerified && (
          <View style={styles.pendingAlert}>
            <Text style={styles.pendingText}>⏳ Your profile is pending admin verification</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          {[
            { icon: '💼', num: pending.length, label: 'Job Requests', highlight: true },
            { icon: '📋', num: active.length, label: 'Active Jobs' },
            { icon: '⭐', num: stats?.rating || '0', label: 'Rating' },
            { icon: '🔔', num: stats?.unreadNotifications || 0, label: 'Alerts' },
          ].map((s, i) => (
            <View key={i} style={[styles.statBox, s.highlight && pending.length > 0 && styles.statBoxHighlight]}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statNum}>{s.num}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {pending.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📩 Job Requests</Text>
            {pending.map(c => (
              <TouchableOpacity key={c._id} style={styles.contractCard} onPress={() => navigation.navigate('Contracts', { screen: 'ContractDetail', params: { contractId: c._id } })}>
                <View style={styles.cLeft}>
                  <View style={styles.cAvatar}><Text style={styles.cInitial}>{c.household?.name?.charAt(0)}</Text></View>
                  <View>
                    <Text style={styles.cName}>{c.household?.name}</Text>
                    <Text style={styles.cJob}>{c.jobType} · ${c.salary}/mo</Text>
                  </View>
                </View>
                <View style={styles.pendingBadge}><Text style={styles.pendingBadgeText}>Pending</Text></View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {active.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>✅ Active Jobs</Text>
            {active.map(c => (
              <TouchableOpacity key={c._id} style={styles.contractCard}>
                <View style={styles.cLeft}>
                  <View style={styles.cAvatar}><Text style={styles.cInitial}>{c.household?.name?.charAt(0)}</Text></View>
                  <View>
                    <Text style={styles.cName}>{c.household?.name}</Text>
                    <Text style={styles.cJob}>{c.jobType} · ${c.salary}/mo</Text>
                  </View>
                </View>
                <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>Active</Text></View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: 20 },
  greeting: { fontSize: 22, ...FONTS.bold },
  sub: { fontSize: 14, color: COLORS.textMedium, marginTop: 4 },
  ratingBadge: { backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  ratingText: { color: '#fff', fontSize: 14, ...FONTS.bold },
  pendingAlert: { marginHorizontal: 20, backgroundColor: '#fef3c7', borderRadius: 12, padding: 14, marginBottom: 16 },
  pendingText: { fontSize: 13, color: '#92400e', ...FONTS.medium },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', ...SHADOWS.sm },
  statBoxHighlight: { borderWidth: 2, borderColor: COLORS.primary },
  statIcon: { fontSize: 20, marginBottom: 6 },
  statNum: { fontSize: 22, ...FONTS.extrabold, color: COLORS.primary },
  statLabel: { fontSize: 10, color: COLORS.textLight, textAlign: 'center', marginTop: 3 },
  sectionTitle: { fontSize: 16, ...FONTS.bold, marginHorizontal: 20, marginBottom: 12 },
  contractCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginHorizontal: 20, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...SHADOWS.sm },
  cLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  cInitial: { fontSize: 16, ...FONTS.bold, color: COLORS.primary },
  cName: { fontSize: 14, ...FONTS.bold },
  cJob: { fontSize: 12, color: COLORS.textMedium },
  pendingBadge: { backgroundColor: '#fef3c7', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  pendingBadgeText: { fontSize: 12, ...FONTS.semibold, color: '#d97706' },
  activeBadge: { backgroundColor: '#dcfce7', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  activeBadgeText: { fontSize: 12, ...FONTS.semibold, color: '#16a34a' },
});
