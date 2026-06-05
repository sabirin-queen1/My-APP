import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { workersAPI } from '../services/api';
import { COLORS, FONTS, SHADOWS } from '../components/theme';

const JOB_TYPES = ['All', 'House Cleaning', 'Cooking', 'Babysitter', 'Nanny', 'Driver', 'Gardener', 'Elder Care'];

export default function SearchWorkerScreen({ navigation }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => { fetchWorkers(); }, [selectedJob]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedJob && selectedJob !== 'All') params.jobType = selectedJob;
      const res = await workersAPI.search(params);
      setWorkers(res.data.workers);
    } catch {} finally { setLoading(false); }
  };

  const filtered = workers.filter(w => w.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Worker</Text>
        <Text style={styles.sub}>Find the perfect match</Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput style={styles.searchInput} placeholder="Search by name..." value={query} onChangeText={setQuery} />
      </View>

      <FlatList
        data={JOB_TYPES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={j => j}
        contentContainerStyle={styles.jobTypes}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.jobChip, (selectedJob === item || (item === 'All' && !selectedJob)) && styles.jobChipActive]}
            onPress={() => setSelectedJob(item === 'All' ? '' : item)}
          >
            <Text style={[(selectedJob === item || (item === 'All' && !selectedJob)) ? styles.jobChipTextActive : styles.jobChipText]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={w => w._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => <View style={styles.empty}><Text style={styles.emptyText}>No workers found</Text></View>}
          renderItem={({ item: w }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('WorkerProfile', { workerId: w._id })}>
              <View style={styles.cardLeft}>
                <View style={styles.avatar}><Text style={styles.initial}>{w.name.charAt(0)}</Text></View>
                <View style={styles.info}>
                  <Text style={styles.name}>{w.name}</Text>
                  <Text style={styles.job}>{w.jobTypes?.join(' · ')}</Text>
                  <Text style={styles.rating}>⭐ {w.rating || '0.0'} ({w.totalReviews} reviews)</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.salary}>${w.salary?.min}/mo</Text>
                <Text style={styles.exp}>{w.experience} yrs</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 16 },
  title: { fontSize: 22, ...FONTS.bold, color: COLORS.textDark },
  sub: { fontSize: 14, color: COLORS.textMedium, marginTop: 2 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 14, paddingHorizontal: 16, marginBottom: 16, ...SHADOWS.sm },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: COLORS.textDark },
  jobTypes: { paddingHorizontal: 20, paddingBottom: 16, gap: 8 },
  jobChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.border, marginRight: 8 },
  jobChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  jobChipText: { fontSize: 13, ...FONTS.medium, color: COLORS.textMedium },
  jobChipTextActive: { fontSize: 13, ...FONTS.semibold, color: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...SHADOWS.sm },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  initial: { fontSize: 20, ...FONTS.bold, color: COLORS.primary },
  info: { flex: 1 },
  name: { fontSize: 15, ...FONTS.bold, color: COLORS.textDark, marginBottom: 3 },
  job: { fontSize: 12, color: COLORS.textMedium, marginBottom: 3 },
  rating: { fontSize: 12, color: COLORS.textMedium },
  cardRight: { alignItems: 'flex-end' },
  salary: { fontSize: 15, ...FONTS.bold, color: COLORS.primary },
  exp: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: COLORS.textLight },
});
