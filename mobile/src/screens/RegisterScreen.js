import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SHADOWS } from '../components/theme';

const SKILLS = ['Cleaning', 'Cooking', 'Child Care', 'Laundry', 'Ironing', 'Elder Care'];

// build email from username; append @gmail.com if no @ present
const buildEmail = (username) => {
  const u = (username || '').trim();
  if (!u) return '';
  return u.includes('@') ? u.toLowerCase() : `${u.toLowerCase()}@gmail.com`;
};

export default function RegisterScreen({ navigation }) {
  const [type, setType] = useState('household');
  const [username, setUsername] = useState('');
  const [form, setForm] = useState({
    name: '', password: '', phone: '', location: 'Mogadishu, Somalia',
    skills: [], experience: 0, bio: '', salaryMin: '150', salaryMax: '300', idNumber: '',
    guarantor: { name: '', idName: '', idNumber: '', phone: '', relationship: '' },
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const toggleSkill = (s) => setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s] }));
  const setGuarantor = (key, val) => setForm(f => ({ ...f, guarantor: { ...f.guarantor, [key]: val } }));

  const handleRegister = async () => {
    const email = buildEmail(username);
    if (!form.name || !email || !form.password) { Alert.alert('Error', 'Please fill all required fields'); return; }
    if (form.password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }

    if (type === 'worker') {
      const g = form.guarantor;
      if (!g.name.trim() || !g.idName.trim() || !g.idNumber.trim()) {
        Alert.alert('Error', 'Guarantor name, ID name, and ID number are required.'); return;
      }
      if (g.name.trim().toLowerCase().replace(/\s+/g, ' ') !== g.idName.trim().toLowerCase().replace(/\s+/g, ' ')) {
        Alert.alert('Error', 'Guarantor name does not match the name on the ID.'); return;
      }
    }

    setLoading(true);
    try {
      const payload = { name: form.name, email, password: form.password, phone: form.phone, location: form.location };
      if (type === 'worker') {
        Object.assign(payload, {
          skills: form.skills, experience: form.experience, bio: form.bio, idNumber: form.idNumber,
          salary: { min: Number(form.salaryMin), max: Number(form.salaryMax), currency: 'USD' },
          guarantor: form.guarantor,
        });
      }
      const res = type === 'worker' ? await authAPI.registerWorker(payload) : await authAPI.registerHousehold(payload);
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput style={styles.input} placeholder="Ahmed Mohamed" value={form.name} onChangeText={t => setForm({ ...form, name: t })} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username *</Text>
          <View style={styles.emailWrap}>
            <TextInput style={styles.emailInput} placeholder="ahmett" autoCapitalize="none" value={username} onChangeText={t => setUsername(t.replace(/\s/g, ''))} />
            <View style={styles.emailSuffix}><Text style={styles.emailSuffixText}>@gmail.com</Text></View>
          </View>
          {username ? <Text style={styles.emailPreview}>Email: {buildEmail(username)}</Text> : null}
        </View>

        {[
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
              <Text style={styles.label}>Expected Salary (USD / month)</Text>
              <View style={styles.salaryRow}>
                <TextInput style={[styles.input, { flex: 1 }]} keyboardType="numeric" placeholder="Min" value={String(form.salaryMin)} onChangeText={t => setForm({ ...form, salaryMin: t })} />
                <Text style={styles.salaryDash}>—</Text>
                <TextInput style={[styles.input, { flex: 1 }]} keyboardType="numeric" placeholder="Max" value={String(form.salaryMax)} onChangeText={t => setForm({ ...form, salaryMax: t })} />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your National ID Number</Text>
              <TextInput style={styles.input} placeholder="e.g. 1234567890" value={form.idNumber} onChangeText={t => setForm({ ...form, idNumber: t })} />
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

            {/* Guarantor (Damiin) */}
            <View style={styles.guarantorBox}>
              <Text style={styles.guarantorTitle}>🛡️ Guarantor (Damiin) — required</Text>
              <Text style={styles.guarantorNote}>The guarantor name must match the name on the guarantor's ID.</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Guarantor Full Name *</Text>
                <TextInput style={styles.input} placeholder="Guarantor's name" value={form.guarantor.name} onChangeText={t => setGuarantor('name', t)} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name as written on Guarantor's ID *</Text>
                <TextInput style={styles.input} placeholder="Exactly as on the ID" value={form.guarantor.idName} onChangeText={t => setGuarantor('idName', t)} />
                {form.guarantor.name && form.guarantor.idName ? (
                  form.guarantor.name.trim().toLowerCase() === form.guarantor.idName.trim().toLowerCase()
                    ? <Text style={styles.matchOk}>✅ Names match</Text>
                    : <Text style={styles.matchBad}>❌ Names do not match</Text>
                ) : null}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Guarantor ID Number *</Text>
                <TextInput style={styles.input} placeholder="Guarantor's national ID" value={form.guarantor.idNumber} onChangeText={t => setGuarantor('idNumber', t)} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Guarantor Phone</Text>
                <TextInput style={styles.input} placeholder="+252 61 7654321" keyboardType="phone-pad" value={form.guarantor.phone} onChangeText={t => setGuarantor('phone', t)} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Relationship to Worker</Text>
                <TextInput style={styles.input} placeholder="Relative, Friend, Neighbour" value={form.guarantor.relationship} onChangeText={t => setGuarantor('relationship', t)} />
              </View>
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
  emailWrap: { flexDirection: 'row', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, overflow: 'hidden' },
  emailInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15 },
  emailSuffix: { backgroundColor: COLORS.primaryLight, justifyContent: 'center', paddingHorizontal: 14 },
  emailSuffixText: { color: COLORS.primary, ...FONTS.semibold, fontSize: 14 },
  emailPreview: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  salaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  salaryDash: { color: COLORS.textLight, ...FONTS.bold },
  guarantorBox: { borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed', borderRadius: 12, padding: 14, marginBottom: 16, backgroundColor: COLORS.primaryLight },
  guarantorTitle: { fontSize: 15, ...FONTS.bold, color: COLORS.primary, marginBottom: 4 },
  guarantorNote: { fontSize: 12, color: COLORS.textMedium, marginBottom: 12 },
  matchOk: { fontSize: 12, color: COLORS.success, ...FONTS.semibold, marginTop: 4 },
  matchBad: { fontSize: 12, color: COLORS.danger, ...FONTS.semibold, marginTop: 4 },
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
