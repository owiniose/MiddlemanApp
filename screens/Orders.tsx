import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOrders, Order, OrderStatus } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { OrdersStackParamList } from '../types/navigation';

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; color: string }> = {
  'Pending':    { label: 'Pending',    bg: '#f3f4f6', color: '#6b7280' },
  'Preparing':  { label: 'Preparing',  bg: '#fef3c7', color: '#d97706' },
  'On the way': { label: 'On the way', bg: '#dbeafe', color: '#2563eb' },
  'Delivered':  { label: 'Delivered',  bg: '#dcfce7', color: '#16a34a' },
  'Cancelled':  { label: 'Cancelled',  bg: '#fee2e2', color: '#dc2626' },
};

type NavProp = NativeStackNavigationProp<OrdersStackParamList, 'OrdersList'>;

function OrderCard({ order }: { order: Order }) {
  const navigation = useNavigation<NavProp>();
  const status = STATUS_CONFIG[order.status];
  const itemsSummary = order.items.map((i) => `${i.qty}× ${i.name}`).join(', ');
  const time = order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = order.createdAt.toLocaleDateString([], { day: 'numeric', month: 'short' });

  return (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.vendorName}>{order.vendorName}</Text>
          <Text style={styles.orderId}>{order.id}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
      <Text style={styles.itemsSummary} numberOfLines={2}>{itemsSummary}</Text>
      <View style={styles.cardBottom}>
        <Text style={styles.total}>₦{order.total.toLocaleString()}</Text>
        <Text style={styles.time}>{date} · {time}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function Orders() {
  const { orders, listenToOrders } = useOrders();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = listenToOrders(user.uid);
    return unsub;
  }, [user?.uid]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Orders</Text>
      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>Your placed orders will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <OrderCard order={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: '700', padding: 16, paddingBottom: 8 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#6b7280' },

  list: { padding: 16, gap: 12 },

  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, elevation: 2, gap: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  vendorName: { fontWeight: '700', fontSize: 15, color: '#111827' },
  orderId: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginLeft: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  itemsSummary: { fontSize: 13, color: '#6b7280', lineHeight: 18 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  total: { fontWeight: '700', fontSize: 15, color: '#0f766e' },
  time: { fontSize: 12, color: '#9ca3af' },
});
