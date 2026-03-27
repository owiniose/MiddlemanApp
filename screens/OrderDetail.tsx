import React from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import Text from '../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OrdersStackParamList } from '../types/navigation';
import { useOrders, OrderStatus } from '../context/OrdersContext';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrderDetail'>;

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; color: string; step: number }> = {
  'Pending':    { label: 'Pending',    bg: '#f3f4f6', color: '#6b7280', step: 0 },
  'Preparing':  { label: 'Preparing',  bg: '#fef3c7', color: '#d97706', step: 1 },
  'On the way': { label: 'On the way', bg: '#dbeafe', color: '#2563eb', step: 2 },
  'Delivered':  { label: 'Delivered',  bg: '#dcfce7', color: '#16a34a', step: 3 },
  'Cancelled':  { label: 'Cancelled',  bg: '#fee2e2', color: '#dc2626', step: -1 },
};

const STEPS: OrderStatus[] = ['Pending', 'Preparing', 'On the way', 'Delivered'];

export default function OrderDetail({ route, navigation }: Props) {
  const { orderId } = route.params;
  const { orders, cancelOrder } = useOrders();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.notFoundText}>Order not found.</Text>
      </SafeAreaView>
    );
  }

  const status = STATUS_CONFIG[order.status];
  const canCancel = order.status === 'Pending';
  const isCancelled = order.status === 'Cancelled';

  const handleCancel = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            cancelOrder(orderId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const date = order.createdAt.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  const time = order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Status tracker */}
        <View style={styles.trackerCard}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>

          {isCancelled ? (
            <View style={styles.cancelledNote}>
              <Text style={styles.cancelledNoteText}>This order was cancelled.</Text>
            </View>
          ) : (
            <View style={styles.tracker}>
              {STEPS.map((step, i) => {
                const currentStep = STATUS_CONFIG[order.status].step;
                const done = currentStep > i;
                const active = currentStep === i;
                return (
                  <React.Fragment key={step}>
                    <View style={styles.trackerStep}>
                      <View style={[styles.trackerDot, done || active ? styles.trackerDotActive : null]} />
                      <Text style={[styles.trackerLabel, active ? styles.trackerLabelActive : null]}>{step}</Text>
                    </View>
                    {i < STEPS.length - 1 && (
                      <View style={[styles.trackerLine, done ? styles.trackerLineActive : null]} />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          )}
        </View>

        {/* Order info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Info</Text>
          <Row label="Order ID" value={order.id} />
          <Row label="Vendor" value={order.vendorName} />
          <Row label="Date" value={`${date} · ${time}`} />
          <Row label="Payment" value="Cash on Delivery" />
        </View>

        {/* Delivery info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <Row label="Address" value={order.address} />
          <Row label="Phone" value={order.phone} />
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.qty}× {item.name}</Text>
              <Text style={styles.itemPrice}>₦{(item.price * item.qty).toLocaleString()}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <Row label="Subtotal" value={`₦${order.subtotal.toLocaleString()}`} />
          <Row label="Delivery fee" value={`₦${order.deliveryFee.toLocaleString()}`} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₦{order.total.toLocaleString()}</Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {canCancel && (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { padding: 16, gap: 12 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: '#6b7280', fontSize: 15 },

  trackerCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 16 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontWeight: '700', fontSize: 13 },
  cancelledNote: { paddingVertical: 8 },
  cancelledNoteText: { color: '#6b7280', fontSize: 13 },
  tracker: { flexDirection: 'row', alignItems: 'center' },
  trackerStep: { alignItems: 'center', gap: 6 },
  trackerDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#e5e7eb', borderWidth: 2, borderColor: '#e5e7eb' },
  trackerDotActive: { backgroundColor: '#0f766e', borderColor: '#0f766e' },
  trackerLine: { flex: 1, height: 2, backgroundColor: '#e5e7eb', marginBottom: 18 },
  trackerLineActive: { backgroundColor: '#0f766e' },
  trackerLabel: { fontSize: 11, color: '#9ca3af' },
  trackerLabelActive: { color: '#0f766e', fontWeight: '700' },

  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 10 },
  sectionTitle: { fontWeight: '700', fontSize: 14, color: '#111827', marginBottom: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  rowLabel: { color: '#6b7280', fontSize: 13, flex: 1 },
  rowValue: { color: '#111827', fontSize: 13, fontWeight: '500', flex: 2, textAlign: 'right' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 13, color: '#374151', flex: 1 },
  itemPrice: { fontSize: 13, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#f3f4f6' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4 },
  totalLabel: { fontWeight: '700', fontSize: 15 },
  totalValue: { fontWeight: '700', fontSize: 15, color: '#0f766e' },

  footer: { paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#f3f4f6' },
  cancelBtn: { marginTop: 12, borderWidth: 1.5, borderColor: '#ef4444', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
});
