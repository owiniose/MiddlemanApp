import React, { useState } from 'react';
import {
  Modal, View, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import Text from './Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  collection, addDoc, serverTimestamp,
  getDocs, query, where, updateDoc, doc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmitted: (rating: number) => void;
  vendorId: string;
  vendorName: string;
  orderId: string;
};

export default function ReviewModal({ visible, onClose, onSubmitted, vendorId, vendorName, orderId }: Props) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const reset = () => { setRating(0); setComment(''); setError(''); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a star rating.'); return; }
    if (!user || !profile) return;
    setSubmitting(true);
    setError('');
    try {
      // Save review
      await addDoc(collection(db, 'reviews'), {
        vendorId,
        orderId,
        customerId: user.uid,
        customerName: profile.name,
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });

      // Recalculate vendor average rating
      const snap = await getDocs(query(collection(db, 'reviews'), where('vendorId', '==', vendorId)));
      const total = snap.docs.reduce((s, d) => s + (d.data().rating as number), 0);
      const avg = (total / snap.size).toFixed(1);
      await updateDoc(doc(db, 'vendors', vendorId), { rating: avg });

      reset();
      onSubmitted(rating);
    } catch {
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>Rate your order</Text>
          <Text style={styles.subtitle}>{vendorName}</Text>

          {/* Stars */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                <Text style={[styles.star, star <= rating ? styles.starFilled : styles.starEmpty]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>
            {rating === 0 ? 'Tap to rate' : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </Text>

          {/* Comment */}
          <TextInput
            style={styles.input}
            placeholder="Leave a comment (optional)"
            placeholderTextColor="#9ca3af"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            maxLength={300}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting || rating === 0}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>Submit Review</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClose} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingTop: 12, gap: 12,
  },
  handle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: -4 },

  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 4 },
  star: { fontSize: 44 },
  starFilled: { color: '#f59e0b' },
  starEmpty: { color: '#e5e7eb' },
  ratingLabel: { textAlign: 'center', fontSize: 14, color: '#6b7280', fontWeight: '600', marginTop: -4 },

  input: {
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 12, padding: 14, fontSize: 14, color: '#111827',
    textAlignVertical: 'top', minHeight: 80,
  },
  errorText: { color: '#ef4444', fontSize: 13, textAlign: 'center' },

  submitBtn: { backgroundColor: '#1E22A3', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#d1d5db' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  skipBtn: { alignItems: 'center', paddingBottom: 4 },
  skipText: { color: '#9ca3af', fontSize: 14 },
});
