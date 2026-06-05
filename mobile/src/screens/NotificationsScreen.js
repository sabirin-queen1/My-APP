import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { notificationsAPI } from '../services/api';
import { COLORS, FONTS, SHADOWS } from '../components/theme';

const ICONS = { contract_expiry: '📅', new_job_request: '💼', worker_verified: '✅', new_review: '⭐', job_request: '💼', contract_confirmed: '📋' };

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => { load(); }, [filter]);

  const load = async () => {
    const res = await notificationsAPI.getAll(filter === 'all' ? undefined : filter);
    setNotifications(res.data.notifications);
  };

  const markRead = async (id) => {
    await notificationsAPI.markRead(id);
    setNotifications(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
  };

  const timeAgo = (d) => {
    const s = (Date.now() - new Date(d)) / 1000;
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={() => notificationsAPI.markAllRead().then(load)}><Text style={styles.readAll}>Read All</Text></TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {['all', 'unread', 'important'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterTab, filter === f && styles.filterTabActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={n => n._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => <View style={styles.empty}><Text style={{ fontSize: 40 }}>🔔</Text><Text style={styles.emptyText}>No notifications</Text></View>}
        renderItem={({ item: n }) => (
          <TouchableOpacity style={[styles.item, !n.isRead && styles.itemUnread]} onPress={() => !n.isRead && markRead(n._id)}>
            <View style={styles.itemIcon}><Text style={{ fontSize: 20 }}>{ICONS[n.type] || '🔔'}</Text></View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>{n.title}</Text>
              <Text style={styles.itemMsg} numberOfLines={2}>{n.message}</Text>
            </View>
            <View style={styles.itemMeta}>
              <Text style={styles.itemTime}>{timeAgo(n.createdAt)}</Text>
              {!n.isRead && <View style={styles.unreadDot} />}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, marginBottom: 16 },
  backBtn: { width: 40, height: 40, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm },
  backText: { fontSize: 20, color: COLORS.primary },
  title: { fontSize: 20, ...FONTS.bold },
  readAll: { fontSize: 13, color: COLORS.primary, ...FONTS.semibold },
  filters: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.border },
  filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 13, ...FONTS.medium, color: COLORS.textMedium },
  filterTextActive: { color: '#fff', ...FONTS.semibold },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  item: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, ...SHADOWS.sm },
  itemUnread: { backgroundColor: '#faf9ff' },
  itemIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 14, ...FONTS.semibold, marginBottom: 4 },
  itemMsg: { fontSize: 13, color: COLORS.textMedium, lineHeight: 18 },
  itemMeta: { alignItems: 'flex-end', gap: 6, marginLeft: 8 },
  itemTime: { fontSize: 11, color: COLORS.textLight },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 15, color: COLORS.textLight, marginTop: 12 },
});
