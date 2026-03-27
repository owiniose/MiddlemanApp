import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Text from '../../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { sendPushNotification } from '../../utils/notifications';

type OrderStatus = 'Pending' | 'Preparing' | 'On the way' | 'Delivered' | 'Cancelled';

type Order = {
  id: string;
  customerId: string;
  customerName: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  address: string;
  phone: string;
  status: OrderStatus;
  createdAt: any;
};

const STATUS_CONFIG: Record<OrderStatus, { bg: string; color: string }> = {
  Pending:      { bg: '#f3f4f6', color: '#374151' },
  Preparing:    { bg: '#fef3c7', color: '#d97706' },
  'On the way': { bg: '#dbeafe', color: '#2563eb' },
  Delivered:    { bg: '#dcfce7', color: '#16a34a' },
  Cancelled:    { bg: '#fee2e2', color: '#dc2626' },
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  Pending:      'Preparing',
  Preparing:    'On the way',
  'On the way': 'Delivered',
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  Pending:      'Accept Order',
  Preparing:    'Mark On the Way',
  'On the way': 'Mark Delivered',
};

const NOTIFICATION_COPY: Partial<Record<OrderStatus, { title: string; body: (vendor: string) => string }>> = {
  Preparing:    { title: 'Order Confirmed! 🍳', body: (v) => `Your order from ${v} is being prepared.` },
  'On the way': { title: "On the Way! 🛵",      body: (v) => `Your order from ${v} is heading to you.` },
  Delivered:    { title: 'Delivered! 🎉',        body: (v) => `Your order from ${v} has arrived. Enjoy!` },
  Cancelled:    { title: 'Order Cancelled ❌',   body: (v) => `Your order from ${v} was cancelled.` },
};

async function notifyCustomer(customerId: string, status: OrderStatus, vendorName: string) {
  const copy = NOTIFICATION_COPY[status];
  if (!copy) return;
  try {
    const userSnap = await getDoc(doc(db, 'users', customerId));
    const pushToken = userSnap.data()?.pushToken as string | undefined;
    if (pushToken) {
      await sendPushNotification(pushToken, copy.title, copy.body(vendorName));
    }
  } catch {
    // Notification failure should never break the order flow
  }
}

export default function VendorOrders() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.vendorId) return;
    const q = query(collection(db, 'orders'), where('vendorId', '==', profile.vendorId));
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      fetched.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      setOrders(fetched);
      setLoading(false);
    });
    return unsub;
  }, [profile?.vendorId]);

  const updateStatus = async (order: Order, status: OrderStatus) => {
    await updateDoc(doc(db, 'orders', order.id), { status });
    notifyCustomer(order.customerId, status, profile?.name ?? 'Your vendor');
  };

  const cancelOrder = async (order: Order) => {
    await updateDoc(doc(db, 'orders', order.id), { status: 'Cancelled' });
    notifyCustomer(order.customerId, 'Cancelled', profile?.name ?? 'Your vendor');
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0f766e" /></View>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Incoming Orders</Text>
      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>New orders will appear here in real time</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const cfg = STATUS_CONFIG[item.status];
            const nextStatus = NEXT_STATUS[item.status];
            const nextLabel = NEXT_LABEL[item.status];
            const time = item.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? '';
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View>
                    <Text style={styles.orderId}>{item.id}</Text>
                    <Text style={styles.customerName}>{item.customerName}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.badgeText, { color: cfg.color }]}>{item.status}</Text>
                    </View>
                    <Text style={styles.time}>{time}</Text>
                  </View>
                </View>

                <View style={styles.itemsList}>
                  {item.items.map((i, idx) => (
                    <Text key={idx} style={styles.itemText}>{i.qty}× {i.name}</Text>
                  ))}
                </View>

                <View style={styles.cardMeta}>
                  <Text style={styles.metaText}>📍 {item.address}</Text>
                  <Text style={styles.metaText}>📞 {item.phone}</Text>
                  <Text style={styles.total}>₦{item.total.toLocaleString()}</Text>
                </View>

                {(nextStatus || item.status === 'Pending') && (
                  <View style={styles.actionRow}>
                    {item.status === 'Pending' && (
                      <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelOrder(item)}>
                        <Text style={styles.cancelBtnText}>Reject</Text>
                      </TouchableOpacity>
                    )}
                    {nextStatus && nextLabel && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { flex: item.status === 'Pending' ? 1 : undefined }]}
                        onPress={() => updateStatus(item, nextStatus)}
                      >
                        <Text style={styles.actionBtnText}>{nextLabel}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 22, fontWeight: '700', padding: 16, paddingBottom: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#374151' },
  emptySubtitle: { fontSize: 13, color: '#9ca3af' },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, elevation: 2, gap: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 11, color: '#9ca3af' },
  customerName: { fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  time: { fontSize: 11, color: '#9ca3af' },
  itemsList: { gap: 2 },
  itemText: { fontSize: 13, color: '#374151' },
  cardMeta: { gap: 4 },
  metaText: { fontSize: 12, color: '#6b7280' },
  total: { fontSize: 15, fontWeight: '700', color: '#0f766e', marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { backgroundColor: '#0f766e', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cancelBtn: { borderWidth: 1.5, borderColor: '#ef4444', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  cancelBtnText: { color: '#ef4444', fontWeight: '700', fontSize: 13 },
});
