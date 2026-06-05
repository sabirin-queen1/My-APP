import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SHADOWS } from '../components/theme';

export default function LoginScreen({ navigation }) {
  const [form, setForm] = useState({ email: '', password: '', role: 'household' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!form.email || !form.password) { Alert.alert('Error', 'Please fill all fields'); return; }
    setLoading(true);
    try {
      let res;
      if (form.role === 'worker') res = await authAPI.loginWorker({ email: form.email, password: form.password });
      else res = await authAPI.loginHousehold({ email: form.email, password: form.password });
      await login(res.data.token, res.data.user, res.data.user.role);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoBox}><Text style={{ fontSize: 28 }}>🏠</Text></View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to your account</Text>
        </View>

        <View style={styles.roleTabs}>
          {['household', 'worker'].map(r => (
            <TouchableOpacity key={r} style={[styles.roleTab, form.role === r && styles.roleTabActive]} onPress={() => setForm({ ...form, role: r })}>
              <Text style={[styles.roleTabText, form.role === r && styles.roleTabTextActive]}>
                {r === 'household' ? '👨‍👩‍👧 Family' : '👷 Worker'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput style={styles.input} placeholder="your@email.com" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={t => setForm({ ...form, email: t })} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} placeholder="••••••••" secureTextEntry value={form.password} onChangeText={t => setForm({ ...form, password: t })} />
          </View>
          <TouchableOpacity style={styles.forgot}><Text style={styles.forgotText}>Forgot Password?</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.btnPrimary, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.btnPrimaryText}>{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.switchText}>Don't have an account? <Text style={styles.switchLink}>Register</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24, flexGrow: 1 },
  backBtn: { marginBottom: 20 },
  backText: { color: COLORS.primary, fontSize: 15, ...FONTS.semibold },
  header: { alignItems: 'center', marginBottom: 32 },
  logoBox: { width: 64, height: 64, backgroundColor: COLORS.primary, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 26, ...FONTS.bold, color: COLORS.textDark, marginBottom: 6 },
  subtitle: { fontSize: 15, color: COLORS.textLight },
  roleTabs: { flexDirection: 'row', backgroundColor: COLORS.bg, borderRadius: 14, padding: 4, marginBottom: 28 },
  roleTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  roleTabActive: { backgroundColor: '#fff', ...SHADOWS.sm },
  roleTabText: { fontSize: 14, ...FONTS.semibold, color: COLORS.textMedium },
  roleTabTextActive: { color: COLORS.primary },
  form: { marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, ...FONTS.medium, color: COLORS.textMedium, marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: COLORS.textDark, backgroundColor: '#fff' },
  forgot: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 13, color: COLORS.primary, ...FONTS.semibold },
  btnPrimary: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', ...SHADOWS.md },
  btnDisabled: { opacity: 0.7 },
  btnPrimaryText: { color: '#fff', fontSize: 16, ...FONTS.bold },
  switchText: { textAlign: 'center', fontSize: 14, color: COLORS.textMedium },
  switchLink: { color: COLORS.primary, ...FONTS.bold },
});
