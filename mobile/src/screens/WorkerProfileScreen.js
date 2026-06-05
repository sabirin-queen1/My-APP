import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { workersAPI, contractsAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SHADOWS } from '../components/theme';

export default function WorkerProfileScreen({ route, navigation }) {
  const { workerId } = route.params;
  const { role } = useAuth();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showHire, setShowHire] = useState(false);
  const [hireForm, setHireForm] = useState({ jobType: '', salary: '', startDate: '', endDate: '' });
  const [hiring, setHiring] = useState(false);

  useEffect(() => {
    Promise.all([workersAPI.getById(workerId), reviewsAPI.getByWorker(workerId)])
      .then(([w, r]) => { setWorker(w.data); setReviews(r.data); });
  }, [workerId]);

  const handleHire = async () => {
    if (!hireForm.jobType || !hireForm.salary) { Alert.alert('Error', 'Please fill all required fields'); return; }
    setHiring(true);
    try {
      const res = await contractsAPI.create({ worker: workerId, ...hireForm, salary: Number(hireForm.salary) });
      setShowHire(false);
      Alert.alert('Success', 'Contract created successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create contract');
    } finally { setHiring(false); }
  };

  if (!worker) return <View style={styles.loading}><Text>Loading...</Text></View>;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backText}>←</Text></TouchableOpacity>
          <TouchableOpacity style={styles.heartBtn}><Text>❤️</Text></TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.avatar}><Text style={styles.initial}>{worker.name.charAt(0)}</Text></View>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{worker.name}</Text>
            {worker.isVerified && <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✅ Verified</Text></View>}
          </View>
          <View style={styles.stars}>
            {[1,2,3,4,5].map(i => <Text key={i} style={{ fontSize: 20, color: i <= Math.round(worker.rating) ? '#f59e0b' : '#d1d5db' }}>★</Text>)}
            <Text style={styles.reviewCount}>({worker.totalReviews} Reviews)</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          {[
            { label: 'Skills', value: worker.skills?.join(', ') || '-' },
            { label: 'Experience', value: `${worker.experience} Years` },
            { label: 'Nationality', value: worker.nationality },
            { label: 'Languages', value: worker.languages?.join(', ') },
            { label: 'Salary', value: `$${worker.salary?.min} - $${worker.salary?.max}/Month` },
          ].map((d, i) => (
            <View key={i} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{d.label}</Text>
              <Text style={styles.detailValue}>{d.value}</Text>
            </View>
          ))}
        </View>

        {reviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {reviews.map(r => (
              <View key={r._id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}><Text style={styles.reviewInitial}>{r.household?.name?.charAt(0)}</Text></View>
                  <View>
                    <Text style={styles.reviewerName}>{r.household?.name}</Text>
                    <Text>{[1,2,3,4,5].map(i => i <= r.rating ? '⭐' : '☆').join('')}</Text>
                  </View>
                </View>
                <Text style={styles.reviewText}>{r.comment}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {role === 'household' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.chatBtn}><Text style={styles.chatText}>💬 Chat</Text></TouchableOpacity>
          <TouchableOpacity style={styles.hireBtn} onPress={() => setShowHire(true)}><Text style={styles.hireText}>Hire Now</Text></TouchableOpacity>
        </View>
      )}

      <Modal visible={showHire} animationType="slide" presentationStyle="formSheet">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Create Contract</Text>
          <Text style={styles.modalSub}>with {worker.name}</Text>
          {[
            { label: 'Job Type', key: 'jobType', placeholder: 'e.g. House Cleaning' },
            { label: 'Monthly Salary (USD)', key: 'salary', placeholder: 'e.g. 250', keyboardType: 'numeric' },
            { label: 'Start Date', key: 'startDate', placeholder: 'YYYY-MM-DD' },
            { label: 'End Date', key: 'endDate', placeholder: 'YYYY-MM-DD' },
          ].map(f => (
            <View key={f.key} style={styles.inputGroup}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput style={styles.input} placeholder={f.placeholder} keyboardType={f.keyboardType || 'default'} value={hireForm[f.key]} onChangeText={t => setHireForm({ ...hireForm, [f.key]: t })} />
            </View>
          ))}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowHire(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleHire} disabled={hiring}>
              <Text style={styles.confirmText}>{hiring ? 'Creating...' : 'Confirm'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  profileTop: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, marginBottom: 8 },
  backBtn: { width: 40, height: 40, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm },
  backText: { fontSize: 20, color: COLORS.primary },
  heartBtn: { width: 40, height: 40, backgroundColor: '#fee2e2', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', margin: 20, borderRadius: 20, padding: 24, alignItems: 'center', ...SHADOWS.sm },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  initial: { fontSize: 30, ...FONTS.bold, color: COLORS.primary },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  name: { fontSize: 20, ...FONTS.bold, color: COLORS.textDark },
  verifiedBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  verifiedText: { fontSize: 12, ...FONTS.semibold, color: '#16a34a' },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  reviewCount: { fontSize: 13, color: COLORS.textLight, marginLeft: 6 },
  detailsCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 20, padding: 20, marginBottom: 16, ...SHADOWS.sm },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  detailLabel: { fontSize: 13, color: COLORS.textLight, flex: 1 },
  detailValue: { fontSize: 14, ...FONTS.semibold, color: COLORS.textDark, flex: 2, textAlign: 'right' },
  reviewsSection: { marginHorizontal: 20, marginBottom: 100 },
  sectionTitle: { fontSize: 16, ...FONTS.bold, marginBottom: 12 },
  reviewCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, ...SHADOWS.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  reviewInitial: { fontSize: 14, ...FONTS.bold, color: COLORS.primary },
  reviewerName: { fontSize: 13, ...FONTS.semibold, marginBottom: 2 },
  reviewText: { fontSize: 13, color: COLORS.textMedium, lineHeight: 20 },
  actions: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, backgroundColor: '#fff', gap: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  chatBtn: { flex: 1, borderWidth: 2, borderColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  chatText: { color: COLORS.primary, fontSize: 15, ...FONTS.bold },
  hireBtn: { flex: 2, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', ...SHADOWS.md },
  hireText: { color: '#fff', fontSize: 15, ...FONTS.bold },
  modal: { flex: 1, padding: 24, backgroundColor: '#fff' },
  modalTitle: { fontSize: 22, ...FONTS.bold, marginBottom: 4 },
  modalSub: { fontSize: 14, color: COLORS.textMedium, marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, ...FONTS.medium, color: COLORS.textMedium, marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, borderWidth: 2, borderColor: COLORS.border, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontSize: 15, ...FONTS.bold, color: COLORS.textMedium },
  confirmBtn: { flex: 2, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  confirmText: { color: '#fff', fontSize: 15, ...FONTS.bold },
});
