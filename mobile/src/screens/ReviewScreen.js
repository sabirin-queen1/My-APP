import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { reviewsAPI } from '../services/api';
import { COLORS, FONTS, SHADOWS } from '../components/theme';

export default function ReviewScreen({ route, navigation }) {
  const workerId = route?.params?.workerId;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) { Alert.alert('Error', 'Please select a rating'); return; }
    if (!comment.trim()) { Alert.alert('Error', 'Please write a review'); return; }
    setLoading(true);
    try {
      await reviewsAPI.create({ worker: workerId, rating, comment });
      Alert.alert('Thank you!', 'Your review has been submitted.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Rate Your Worker</Text>
        <Text style={styles.sub}>Share your experience with other families</Text>

        <View style={styles.stars}>
          {[1,2,3,4,5].map(i => (
            <TouchableOpacity key={i} onPress={() => setRating(i)}>
              <Text style={[styles.star, i <= rating && styles.starActive]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && <Text style={styles.ratingLabel}>{['','Poor','Fair','Good','Very Good','Excellent'][rating]}</Text>}

        <View style={styles.commentBox}>
          <TextInput
            style={styles.commentInput}
            placeholder="Write your honest review here..."
            multiline
            numberOfLines={6}
            maxLength={300}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{comment.length}/300</Text>
        </View>

        <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitText}>{loading ? 'Submitting...' : 'Submit Review'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 24 },
  backBtn: { marginBottom: 24 },
  backText: { color: COLORS.primary, fontSize: 15, ...FONTS.semibold },
  title: { fontSize: 24, ...FONTS.bold, color: COLORS.textDark, marginBottom: 8 },
  sub: { fontSize: 14, color: COLORS.textMedium, marginBottom: 32 },
  stars: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  star: { fontSize: 44, color: '#d1d5db' },
  starActive: { color: '#f59e0b' },
  ratingLabel: { fontSize: 16, ...FONTS.bold, color: '#f59e0b', marginBottom: 24 },
  commentBox: { backgroundColor: COLORS.bg, borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1.5, borderColor: COLORS.border },
  commentInput: { fontSize: 15, color: COLORS.textDark, minHeight: 120 },
  charCount: { textAlign: 'right', fontSize: 12, color: COLORS.textLight, marginTop: 8 },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', ...SHADOWS.md },
  submitText: { color: '#fff', fontSize: 16, ...FONTS.bold },
});
