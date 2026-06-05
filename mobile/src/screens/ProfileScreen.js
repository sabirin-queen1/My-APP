import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SHADOWS } from '../components/theme';

export default function ProfileScreen({ navigation }) {
  const { user, role, logout } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}><Text style={styles.initial}>{user?.name?.charAt(0)}</Text></View>
          <Text style={[styles.name, { color: colors.textDark }]}>{user?.name}</Text>
          <Text style={[styles.email, { color: colors.textMedium }]}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.roleText, { color: colors.primary }]}>{role?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.bgCard }]}>
          {[
            { icon: '🔔', label: 'Notifications', onPress: () => navigation.navigate('Notifications') },
            { icon: '📱', label: 'My Contracts', onPress: () => {} },
            { icon: '⚙️', label: 'Settings', onPress: () => {} },
            { icon: '❓', label: 'Help & Support', onPress: () => {} },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={item.onPress}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuLabel, { color: colors.textDark }]}>{item.label}</Text>
              <Text style={[styles.menuArrow, { color: colors.textLight }]}>›</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={toggleTheme}>
            <Text style={styles.menuIcon}>{isDark ? '☀️' : '🌙'}</Text>
            <Text style={[styles.menuLabel, { color: colors.textDark }]}>{isDark ? 'Light Mode' : 'Dark Mode'}</Text>
            <View style={[styles.togglePill, { backgroundColor: isDark ? colors.primary : colors.border }]}>
              <View style={[styles.toggleThumb, { transform: [{ translateX: isDark ? 18 : 2 }] }]} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>

        <Text style={[styles.footer, { color: colors.textLight }]}>HomeCare Somalia v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 20 },
  card: { borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 20, ...SHADOWS.sm },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  initial: { fontSize: 32, ...FONTS.bold, color: '#fff' },
  name: { fontSize: 20, ...FONTS.bold, marginBottom: 4 },
  email: { fontSize: 14, marginBottom: 12 },
  roleBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  roleText: { fontSize: 12, ...FONTS.bold },
  menuSection: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, ...SHADOWS.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, ...FONTS.medium },
  togglePill: { width: 44, height: 26, borderRadius: 13, justifyContent: 'center', position: 'relative' },
  toggleThumb: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', ...SHADOWS.sm },
  menuArrow: { fontSize: 22 },
  logoutBtn: { backgroundColor: '#fee2e2', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  logoutText: { color: '#ef4444', fontSize: 16, ...FONTS.bold },
  footer: { textAlign: 'center', fontSize: 12 },
});
