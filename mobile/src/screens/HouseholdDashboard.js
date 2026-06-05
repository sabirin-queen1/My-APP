import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { contractsAPI, workersAPI, notificationsAPI } from '../services/api';
import { COLORS, FONTS, SHADOWS } from '../components/theme';

export default function HouseholdDashboard({ navigation }) {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([contractsAPI.getAll(), workersAPI.search({ limit: 4 }), notificationsAPI.getAll()])
      .then(([c, w, n]) => { setContracts(c.data); setRecommended(w.data.workers); setUnread(n.data.unreadCount); })
      .finally(() => setLoading(false));
  }, []);

  const activeContracts = contracts.filter(c => c.status === 'active');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} Family 👋</Text>
            <Text style={styles.subGreet}>What would you like to do today?</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
            <Text style={{ fontSize: 22 }}>🔔</Text>
            {unread > 0 && <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{unread}</Text></View>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.findCard} onPress={() => navigation.navigate('Search')}>
          <Text style={styles.findIcon}>🔍</Text>
          <View>
            <Text style={styles.findTitle}>Find a Worker</Text>
            <Text style={styles.findSub}>Search and hire verified domestic workers.</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{activeContracts.length}</Text>
            <Text style={styles.statLabel}>Active Contracts</Text>
          </View>
          <View style={[styles.statBox, { marginHorizontal: 12 }]}>
            <Text style={styles.statNum}>{unread}</Text>
            <Text style={styles.statLabel}>Notifications</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{contracts.filter(c => c.status === 'completed').length}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recommended Workers</Text>
        {recommended.length === 0 ? (
          <View style={styles.emptyBox}><Text style={styles.emptyText}>No verified workers yet</Text></View>
        ) : (
          <FlatList
            data={recommended}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={w => w._id}
            contentContainerStyle={{ paddingBottom: 8 }}
            renderItem={({ item: w }) => (
              <TouchableOpacity style={styles.workerCard} onPress={() => navigation.navigate('WorkerProfile', { workerId: w._id })}>
                <View style={styles.workerAvatar}><Text style={styles.workerInitial}>{w.name.charAt(0)}</Text></View>
                <Text style={styles.workerName} numberOfLines={1}>{w.name}</Text>
                <Text style={styles.workerJob} numberOfLines={1}>{w.jobTypes?.[0]}</Text>
                <Text style={styles.workerExp}>{w.experience} Yrs Exp</Text>
                <View style={styles.workerBottom}>
                  <Text style={styles.workerRating}>⭐ {w.rating || '0.0'}</Text>
                  <Text style={styles.workerSalary}>${w.salary?.min}/mo</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingTop: 20, marginBottom: 20 },
  greeting: { fontSize: 22, ...FONTS.bold, color: COLORS.textDark },
  subGreet: { fontSize: 14, color: COLORS.textMedium, marginTop: 4 },
  notifBtn: { width: 44, height: 44, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm, position: 'relative' },
  notifBadge: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.danger, alignItems: 'center', justifyContent: 'center' },
  notifBadgeText: { color: '#fff', fontSize: 10, ...FONTS.bold },
  findCard: { backgroundColor: COLORS.primary, borderRadius: 18, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16, ...SHADOWS.md },
  findIcon: { fontSize: 32 },
  findTitle: { fontSize: 17, ...FONTS.bold, color: '#fff', marginBottom: 4 },
  findSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  statsRow: { flexDirection: 'row', marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', ...SHADOWS.sm },
  statNum: { fontSize: 24, ...FONTS.extrabold, color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.textLight, marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 17, ...FONTS.bold, marginBottom: 14 },
  workerCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, width: 150, marginRight: 12, ...SHADOWS.sm, alignItems: 'center' },
  workerAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  workerInitial: { fontSize: 22, ...FONTS.bold, color: COLORS.primary },
  workerName: { fontSize: 14, ...FONTS.bold, textAlign: 'center', marginBottom: 4 },
  workerJob: { fontSize: 12, color: COLORS.textMedium, textAlign: 'center', marginBottom: 4 },
  workerExp: { fontSize: 11, color: COLORS.textLight, marginBottom: 8 },
  workerBottom: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  workerRating: { fontSize: 12, ...FONTS.semibold },
  workerSalary: { fontSize: 12, ...FONTS.bold, color: COLORS.primary },
  emptyBox: { backgroundColor: '#fff', borderRadius: 14, padding: 24, alignItems: 'center' },
  emptyText: { color: COLORS.textLight, fontSize: 14 },
});
