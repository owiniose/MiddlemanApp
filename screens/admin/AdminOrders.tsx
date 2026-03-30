import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Modal, ScrollView, Alert,
} from 'react-native';
import Text from '../../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { OrderStatus } from '../../context/OrdersContext';

type AdminOrder = {
  id: string;
  orderNumber?: string;
  vendorName: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
};

const ALL_STATUSES: OrderStatus[] = ['Pending', 'Preparing', 'On the way', 'Delivered', 'Cancelled'];

const STATUS_CONFIG: Record<OrderStatus, { bg: string; color: string }> = {
  'Pending':    { bg: '#f3f4f6', color: '#6b7280' },
  'Preparing':  { bg: '#fef3c7', color: '#d97706' },
  'On the way': { bg: '#dbeafe', color: '#2563eb' },
  'Delivered':  { bg: '#dcfce7', color: '#16a34a' },
  'Cancelled':  { bg: '#fee2e2', color: '#dc2626' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'All'>('All');

  useEffect(() => {
    getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'))).then((snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          orderNumber: data.orderNumber,
          vendorName: data.vendorName ?? '—',
          customerName: data.customerName ?? '—',
          customerPhone: data.phone ?? '—',
          address: data.address ?? '—',
          items: data.items ?? [],
          subtotal: data.subtotal ?? 0,
          deliveryFee: data.deliveryFee ?? 0,
          total: data.total ?? 0,
          status: data.status as OrderStatus,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
        } as AdminOrder;
      });
      setOrders(list);
      setLoading(false);
    });
  }, []);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      setSelected((prev) => prev ? { ...prev, status: newStatus } : prev);
    } catch {
      Alert.alert('Error', 'Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = filterStatus === 'All' ? orders : orders.filter((o) => o.status === filterStatus);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Orders</Text>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ height: 50 }}
        contentContainerStyle={styles.filterRow}
      >
        {(['All', ...ALL_STATUSES] as (OrderStatus | 'All')[]).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.filterChip, filterStatus === s && styles.filterChipActive]}
            onPress={() => setFilterStatus(s)}
          >
            <Text style={[styles.filterChipText, filterStatus === s && styles.filterChipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator size="large" color="#1E22A3" /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No orders found</Text>}
          renderItem={({ item }) => {
            const sc = STATUS_CONFIG[item.status];
            return (
              <TouchableOpacity style={styles.card} onPress={() => setSelected(item)} activeOpacity={0.85}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.vendorName}>{item.vendorName}</Text>
                    <Text style={styles.customerName}>👤 {item.customerName}</Text>
                    {item.orderNumber && <Text style={styles.orderNumber}>#{item.orderNumber}</Text>}
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.color }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.itemsSummary} numberOfLines={1}>
                  {item.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
                </Text>
                <View style={styles.cardBottom}>
                  <Text style={styles.total}>₦{item.total.toLocaleString()}</Text>
                  <Text style={styles.time}>
                    {item.createdAt.toLocaleDateString([], { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Order Detail Modal */}
      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        {selected && (
          <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Detail</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Order</Text>
                <Text style={styles.modalValue}>#{selected.orderNumber ?? selected.id}</Text>
                <Text style={styles.modalSub}>{selected.vendorName}</Text>
              </View>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Customer</Text>
                <Text style={styles.modalValue}>{selected.customerName}</Text>
                <Text style={styles.modalSub}>📞 {selected.customerPhone}</Text>
                <Text style={styles.modalSub}>📍 {selected.address}</Text>
              </View>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Items</Text>
                {selected.items.map((item, i) => (
                  <View key={i} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.qty}× {item.name}</Text>
                    <Text style={styles.itemPrice}>₦{(item.price * item.qty).toLocaleString()}</Text>
                  </View>
                ))}
                <View style={styles.divider} />
                <View style={styles.itemRow}>
                  <Text style={styles.itemName}>Delivery Fee</Text>
                  <Text style={styles.itemPrice}>₦{selected.deliveryFee.toLocaleString()}</Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={[styles.itemName, { fontWeight: '700' }]}>Total</Text>
                  <Text style={[styles.itemPrice, { color: '#1E22A3' }]}>₦{selected.total.toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Update Status</Text>
                <View style={styles.statusGrid}>
                  {ALL_STATUSES.map((s) => {
                    const sc = STATUS_CONFIG[s];
                    const active = selected.status === s;
                    return (
                      <TouchableOpacity
                        key={s}
                        style={[styles.statusBtn, { backgroundColor: active ? sc.color : sc.bg }]}
                        onPress={() => updateStatus(selected.id, s)}
                        disabled={updating || active}
                      >
                        <Text style={[styles.statusBtnText, { color: active ? '#fff' : sc.color }]}>{s}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {updating && <ActivityIndicator size="small" color="#1E22A3" style={{ marginTop: 12 }} />}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { fontSize: 22, fontWeight: '700', color: '#111827', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },

  filterRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 8, alignItems: 'center', height: 50 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', alignSelf: 'flex-start' },
  filterChipActive: { backgroundColor: '#1E22A3', borderColor: '#1E22A3' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  filterChipTextActive: { color: '#fff' },

  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  empty: { textAlign: 'center', color: '#9ca3af', paddingVertical: 32, fontSize: 14 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, elevation: 1, gap: 6 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  vendorName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  customerName: { fontSize: 12, color: '#6b7280', marginTop: 1 },
  orderNumber: { fontSize: 11, color: '#9ca3af', marginTop: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginLeft: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  itemsSummary: { fontSize: 13, color: '#9ca3af' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { fontWeight: '700', fontSize: 14, color: '#1E22A3' },
  time: { fontSize: 12, color: '#9ca3af' },

  modal: { flex: 1, backgroundColor: '#f9fafb' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f3f4f6',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalClose: { fontSize: 20, color: '#6b7280', padding: 4 },
  modalScroll: { padding: 16, gap: 16 },
  modalSection: { backgroundColor: '#fff', borderRadius: 12, padding: 14, gap: 4 },
  modalLabel: { fontSize: 12, fontWeight: '700', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  modalValue: { fontSize: 15, fontWeight: '700', color: '#111827' },
  modalSub: { fontSize: 13, color: '#6b7280' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  itemName: { fontSize: 14, color: '#374151' },
  itemPrice: { fontSize: 14, fontWeight: '600', color: '#374151' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 6 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  statusBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  statusBtnText: { fontSize: 13, fontWeight: '600' },
});
