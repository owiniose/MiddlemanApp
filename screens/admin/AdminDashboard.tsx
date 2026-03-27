import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import Text from '../../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { OrderStatus } from '../../context/OrdersContext';

type StatsType = {
  customers: number;
  vendors: number;
  orders: number;
  revenue: number;
};

type RecentOrder = {
  id: string;
  vendorName: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  'Pending':    '#6b7280',
  'Preparing':  '#d97706',
  'On the way': '#2563eb',
  'Delivered':  '#16a34a',
  'Cancelled':  '#dc2626',
};

export default function AdminDashboard() {
  const { logOut, profile } = useAuth();
  const [stats, setStats] = useState<StatsType | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'vendors')),
      getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10))),
    ]).then(([usersSnap, vendorsSnap, ordersSnap]) => {
      const allUsers = usersSnap.docs.map((d) => d.data());
      const customers = allUsers.filter((u) => u.role === 'customer').length;
      const vendors = vendorsSnap.size;

      const allOrders = ordersSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          vendorName: data.vendorName ?? '—',
          customerName: data.customerName ?? '—',
          total: data.total ?? 0,
          status: data.status as OrderStatus,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
        };
      });
      const revenue = allOrders.reduce((s, o) => s + (o.status !== 'Cancelled' ? o.total : 0), 0);

      setStats({ customers, vendors, orders: ordersSnap.size, revenue });
      setRecentOrders(allOrders);
      setLoading(false);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSub}>Welcome back, {profile?.name?.split(' ')[0]}</Text>
        </View>
        <TouchableOpacity onPress={logOut} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#0f766e" />
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <StatCard label="Customers" value={stats!.customers} icon="👤" color="#e0f2fe" />
              <StatCard label="Vendors" value={stats!.vendors} icon="🏪" color="#f0fdf4" />
              <StatCard label="Orders" value={stats!.orders} icon="📦" color="#fef3c7" />
              <StatCard label="Revenue" value={`₦${stats!.revenue.toLocaleString()}`} icon="💰" color="#fce7f3" />
            </View>

            <Text style={styles.sectionTitle}>Recent Orders</Text>
            {recentOrders.length === 0 ? (
              <Text style={styles.emptyText}>No orders yet</Text>
            ) : (
              recentOrders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.orderVendor}>{order.vendorName}</Text>
                      <Text style={styles.orderCustomer}>👤 {order.customerName}</Text>
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[order.status] + '22' }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLOR[order.status] }]}>{order.status}</Text>
                    </View>
                  </View>
                  <View style={styles.orderBottom}>
                    <Text style={styles.orderTotal}>₦{order.total.toLocaleString()}</Text>
                    <Text style={styles.orderTime}>
                      {order.createdAt.toLocaleDateString([], { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f3f4f6',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  headerSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  logoutBtn: { backgroundColor: '#fef2f2', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  logoutText: { color: '#dc2626', fontWeight: '600', fontSize: 13 },

  scroll: { padding: 16 },
  loader: { paddingVertical: 80, alignItems: 'center' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    width: '47%', borderRadius: 14, padding: 16, alignItems: 'center', gap: 4,
  },
  statIcon: { fontSize: 26, marginBottom: 2 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600' },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 12 },
  emptyText: { color: '#9ca3af', textAlign: 'center', paddingVertical: 24 },

  orderCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    elevation: 1, gap: 8,
  },
  orderTop: { flexDirection: 'row', alignItems: 'flex-start' },
  orderVendor: { fontSize: 14, fontWeight: '700', color: '#111827' },
  orderCustomer: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  statusDot: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { fontWeight: '700', fontSize: 14, color: '#0f766e' },
  orderTime: { fontSize: 12, color: '#9ca3af' },
});
