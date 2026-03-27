import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Switch, TextInput, Alert,
} from 'react-native';
import Text from '../../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

type VendorRow = {
  id: string;
  name: string;
  category: string;
  area: string;
  rating: string;
  open: boolean;
  deliveryTime?: string;
};

const CAT_COLOR: Record<string, string> = {
  Restaurants: '#fff3e0',
  Shops:       '#e3f2fd',
  Pharmacies:  '#e8f5e9',
  Packages:    '#f3e5f5',
};

export default function AdminVendors() {
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [filtered, setFiltered] = useState<VendorRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = () => {
    setLoading(true);
    getDocs(collection(db, 'vendors')).then((snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<VendorRow, 'id'>),
        open: d.data().open !== false,
      }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      setVendors(list);
      setFiltered(list);
      setLoading(false);
    });
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    const q = text.toLowerCase();
    setFiltered(vendors.filter((v) =>
      v.name.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.area.toLowerCase().includes(q),
    ));
  };

  const toggleOpen = async (vendor: VendorRow) => {
    const newVal = !vendor.open;
    setToggling(vendor.id);
    try {
      await updateDoc(doc(db, 'vendors', vendor.id), { open: newVal });
      const updater = (list: VendorRow[]) =>
        list.map((v) => v.id === vendor.id ? { ...v, open: newVal } : v);
      setVendors(updater);
      setFiltered(updater);
    } catch {
      Alert.alert('Error', 'Failed to update vendor status.');
    } finally {
      setToggling(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Vendors</Text>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, category or area..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator size="large" color="#0f766e" /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(v) => v.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No vendors found</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={[styles.catBadge, { backgroundColor: CAT_COLOR[item.category] ?? '#f3f4f6' }]}>
                <Text style={styles.catText}>{item.category}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>📍 {item.area}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.rating}>⭐ {item.rating}</Text>
                  {item.deliveryTime ? <Text style={styles.delivery}>🕐 {item.deliveryTime}</Text> : null}
                </View>
              </View>
              <View style={styles.toggleWrap}>
                <Text style={[styles.openLabel, { color: item.open ? '#16a34a' : '#9ca3af' }]}>
                  {item.open ? 'Open' : 'Closed'}
                </Text>
                <Switch
                  value={item.open}
                  onValueChange={() => toggleOpen(item)}
                  disabled={toggling === item.id}
                  trackColor={{ false: '#d1d5db', true: '#0f766e' }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { fontSize: 22, fontWeight: '700', color: '#111827', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },

  searchWrap: { paddingHorizontal: 16, marginBottom: 8 },
  searchInput: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: '#111827',
  },

  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  empty: { textAlign: 'center', color: '#9ca3af', paddingVertical: 32, fontSize: 14 },

  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', elevation: 1, gap: 10,
  },
  catBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  catText: { fontSize: 10, fontWeight: '700', color: '#374151' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  sub: { fontSize: 12, color: '#6b7280' },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 3 },
  rating: { fontSize: 12, color: '#374151', fontWeight: '600' },
  delivery: { fontSize: 12, color: '#6b7280' },
  toggleWrap: { alignItems: 'center', gap: 2 },
  openLabel: { fontSize: 11, fontWeight: '700' },
});
