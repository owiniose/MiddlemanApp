import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderConfirmation'>;

export default function OrderConfirmation({ route, navigation }: Props) {
  const { orderId, orderNumber, vendorName, total } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.checkmark}>✅</Text>
        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>Your order from {vendorName} has been received. We'll notify you when the vendor accepts it.</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID</Text>
            <Text style={styles.infoValue}>#{orderNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Paid</Text>
            <Text style={styles.infoValue}>₦{total.toLocaleString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Pending</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main', state: { index: 2, routes: [{ name: 'Orders' }] } }],
            });
          }}
        >
          <Text style={styles.trackBtnText}>Track Order in Orders Tab</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  checkmark: { fontSize: 72, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 32 },

  infoCard: { width: '100%', backgroundColor: '#f9fafb', borderRadius: 14, padding: 16, gap: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { color: '#6b7280', fontSize: 14 },
  infoValue: { fontWeight: '600', fontSize: 14, color: '#111827' },
  statusBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: '#d97706', fontWeight: '600', fontSize: 13 },

  footer: { padding: 16, gap: 10 },
  trackBtn: { backgroundColor: '#1E22A3', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  trackBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  homeBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  homeBtnText: { color: '#1E22A3', fontWeight: '600', fontSize: 15 },
});
