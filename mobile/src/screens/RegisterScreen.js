import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SHADOWS } from '../components/theme';

const SKILLS = ['Cleaning', 'Cooking', 'Child Care', 'Laundry', 'Ironing', 'Elder Care'];

export default function RegisterScreen({ navigation }) {
  const [type, setType] = useState('household');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', location: 'Mogadishu, Somalia', skills: [], experience: 0, bio: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const toggleSkill = (s) => setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s] }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { Alert.alert('Error', 'Please fill all required fields'); return; }
    if (form.password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = type === 'worker' ? await authAPI.registerWorker(form) : await authAPI.registerHousehold(form);
      await login(res.data.token, res.data.user, res.data.user.role);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.sub}>Join HomeCare today</Text>

        <View style={styles.roleTabs}>
          {['household', 'worker'].map(r => (
            <TouchableOpacity key={r} style={[styles.tab, type === r && styles.tabActive]} onPress={() => setType(r)}>
              <Text style={[styles.tabText, type === r && styles.tabTextActive]}>{r === 'household' ? '👨‍👩‍👧 Family' : '👷 Worker'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {[
          { label: 'Full Name *', key: 'name', placeholder: 'Ahmed Mohamed' },
          { label: 'Email *', key: 'email', placeholder: 'your@email.com', keyboardType: 'email-address' },
          { label: 'Password *', key: 'password', placeholder: 'Min 6 characters', secure: true },
          { label: 'Phone', key: 'phone', placeholder: '+252 61 1234567', keyboardType: 'phone-pad' },
          { label: 'Location', key: 'location', placeholder: 'Mogadishu, Somalia' },
        ].map(f => (
          <View key={f.key} style={styles.inputGroup}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput style={styles.input} placeholder={f.placeholder} keyboardType={f.keyboardType || 'default'} secureTextEntry={f.secure} autoCapitalize="none" value={form[f.key]} onChangeText={t => setForm({ ...form, [f.key]: t })} />
          </View>
        ))}

        {type === 'worker' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Experience (years)</Text>
              <TextInput style={styles.input} keyboardType="numeric" placeholder="0" value={String(form.experience)} onChangeText={t => setForm({ ...form, experience: Number(t) || 0 })} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Skills</Text>
              <View style={styles.skillsGrid}>
                {SKILLS.map(s => (
                  <TouchableOpacity key={s} style={[styles.skillChip, form.skills.includes(s) && styles.skillChipActive]} onPress={() => toggleSkill(s)}>
                    <Text style={[styles.skillText, form.skills.includes(s) && styles.skillTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>About You</Text>
              <TextInput style={[styles.input, { height: 80 }]} placeholder="Tell families about your experience..." multiline textAlignVertical="top" value={form.bio} onChangeText={t => setForm({ ...form, bio: t })} />
            </View>
          </>
        )}

        <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
          <Text style={styles.submitText}>{loading ? 'Creating...' : 'Create Account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.switchText}>Already have an account? <Text style={styles.switchLink}>Login</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24, paddingBottom: 40 },
  backBtn: { marginBottom: 20 },
  backText: { color: COLORS.primary, fontSize: 15, ...FONTS.semibold },
  title: { fontSize: 26, ...FONTS.bold, marginBottom: 6 },
  sub: { fontSize: 14, color: COLORS.textLight, marginBottom: 24 },
  roleTabs: { flexDirection: 'row', backgroundColor: COLORS.bg, borderRadius: 14, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: '#fff', ...SHADOWS.sm },
  tabText: { fontSize: 14, ...FONTS.semibold, color: COLORS.textMedium },
  tabTextActive: { color: COLORS.primary },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, ...FONTS.medium, color: COLORS.textMedium, marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15 },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border },
  skillChipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  skillText: { fontSize: 13, ...FONTS.medium, color: COLORS.textMedium },
  skillTextActive: { color: COLORS.primary },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 20, ...SHADOWS.md },
  submitText: { color: '#fff', fontSize: 16, ...FONTS.bold },
  switchText: { textAlign: 'center', fontSize: 14, color: COLORS.textMedium },
  switchLink: { color: COLORS.primary, ...FONTS.bold },
});
