import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { contractsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SHADOWS } from '../components/theme';

export default function ContractScreen({ navigation, route }) {
  const { user, role } = useAuth();
  const contractId = route?.params?.contractId;
  const [contracts, setContracts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contractsAPI.getAll().then(res => {
      setContracts(res.data);
      if (contractId) setSelected(res.data.find(c => c._id === contractId));
    }).finally(() => setLoading(false));
  }, []);

  const handleSign = async (contract) => {
    Alert.alert('Sign Contract', 'Are you sure you want to sign this contract?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign', onPress: async () => {
          try {
            await contractsAPI.sign(contract._id, { signature: user?.name + ' (Digital)' });
            Alert.alert('Signed!', 'Contract signed successfully');
            const res = await contractsAPI.getAll();
            setContracts(res.data);
            setSelected(null);
          } catch { Alert.alert('Error', 'Failed to sign'); }
        }
      }
    ]);
  };

  const BADGE_COLORS = { active: '#dcfce7', pending: '#fef3c7', cancelled: '#fee2e2', completed: '#ede9fd' };
  const BADGE_TEXT = { active: '#16a34a', pending: '#d97706', cancelled: '#dc2626', completed: COLORS.primary };

  if (selected) return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.pageTitle}>📋 Employment Contract</Text>
        <View style={[styles.badge, { backgroundColor: BADGE_COLORS[selected.status] || '#ede9fd' }]}>
          <Text style={[styles.badgeText, { color: BADGE_TEXT[selected.status] || COLORS.primary }]}>{selected.status?.toUpperCase()}</Text>
        </View>
        <View style={styles.table}>
          {[
            ['Worker', selected.worker?.name], ['Job Type', selected.jobType],
            ['Salary', `$${selected.salary}/Month`], ['Start', new Date(selected.startDate).toLocaleDateString()],
            ['End', new Date(selected.endDate).toLocaleDateString()], ['Household', selected.household?.name],
          ].map(([k, v], i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tableKey}>{k}</Text>
              <Text style={styles.tableVal}>{v}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
        {selected.termsAndConditions?.map((t, i) => <Text key={i} style={styles.term}>{i + 1}. {t}</Text>)}
        <Text style={styles.sectionTitle}>Signatures</Text>
        <View style={[styles.sigBox, selected.familySigned && styles.sigBoxSigned]}>
          <Text style={styles.sigLabel}>Family Signature</Text>
          <Text style={styles.sigValue}>{selected.familySigned ? selected.familySignature + ' ✅' : 'Awaiting...'}</Text>
        </View>
        <View style={[styles.sigBox, selected.workerSigned && styles.sigBoxSigned]}>
          <Text style={styles.sigLabel}>Worker Signature</Text>
          <Text style={styles.sigValue}>{selected.workerSigned ? selected.workerSignature + ' ✅' : 'Awaiting...'}</Text>
        </View>
        {selected.status === 'pending' && ((role === 'household' && !selected.familySigned) || (role === 'worker' && !selected.workerSigned)) && (
          <TouchableOpacity style={styles.signBtn} onPress={() => handleSign(selected)}>
            <Text style={styles.signBtnText}>✍️ Sign Contract</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>My Contracts</Text>
        {contracts.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyText}>No contracts yet</Text></View>
        ) : contracts.map(c => (
          <TouchableOpacity key={c._id} style={styles.contractCard} onPress={() => setSelected(c)}>
            <View style={styles.contractLeft}>
              <View style={styles.workerAvatar}><Text style={styles.workerInitial}>{(c.worker?.name || c.household?.name)?.charAt(0)}</Text></View>
              <View>
                <Text style={styles.workerName}>{c.worker?.name || c.household?.name}</Text>
                <Text style={styles.jobType}>{c.jobType}</Text>
                <Text style={styles.salary}>${c.salary}/month</Text>
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: BADGE_COLORS[c.status] || '#ede9fd' }]}>
              <Text style={[styles.badgeText, { color: BADGE_TEXT[c.status] || COLORS.primary }]}>{c.status}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, paddingBottom: 40 },
  backBtn: { marginBottom: 16 },
  backText: { color: COLORS.primary, fontSize: 15, ...FONTS.semibold },
  pageTitle: { fontSize: 22, ...FONTS.bold, color: COLORS.textDark, marginBottom: 16 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 20 },
  badgeText: { fontSize: 12, ...FONTS.bold },
  table: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 20, ...SHADOWS.sm },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tableKey: { fontSize: 13, color: COLORS.textLight, flex: 1 },
  tableVal: { fontSize: 14, ...FONTS.semibold, color: COLORS.textDark, flex: 2, textAlign: 'right' },
  sectionTitle: { fontSize: 15, ...FONTS.bold, marginBottom: 10 },
  term: { fontSize: 13, color: COLORS.textMedium, lineHeight: 20, marginBottom: 6 },
  sigBox: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.border },
  sigBoxSigned: { borderColor: COLORS.success, backgroundColor: '#f0fdf4' },
  sigLabel: { fontSize: 12, color: COLORS.textLight, marginBottom: 8 },
  sigValue: { fontSize: 15, color: COLORS.textDark, fontStyle: 'italic' },
  signBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16, ...SHADOWS.md },
  signBtnText: { color: '#fff', fontSize: 16, ...FONTS.bold },
  contractCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...SHADOWS.sm },
  contractLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  workerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  workerInitial: { fontSize: 18, ...FONTS.bold, color: COLORS.primary },
  workerName: { fontSize: 15, ...FONTS.bold, marginBottom: 2 },
  jobType: { fontSize: 13, color: COLORS.textMedium },
  salary: { fontSize: 13, ...FONTS.semibold, color: COLORS.primary },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: COLORS.textLight },
});
