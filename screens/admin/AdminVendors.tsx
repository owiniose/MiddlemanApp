import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Switch, TextInput, Alert, Modal, ScrollView,
} from 'react-native';
import Text from '../../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Ionicons } from '@expo/vector-icons';

type VendorRow = {
  id: string;
  name: string;
  category: string;
  area: string;
  rating: string;
  open: boolean;
  approved: boolean;
  deliveryTime?: string;
  minOrder?: string;
  ownerId?: string;
};

const CATEGORIES = ['Restaurants', 'Shops', 'Pharmacies', 'Packages'];
const TABS = ['Approved', 'Pending'] as const;

export default function AdminVendors() {
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [tab, setTab] = useState<'Approved' | 'Pending'>('Approved');
  const [editing, setEditing] = useState<VendorRow | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    getDocs(collection(db, 'vendors')).then((snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<VendorRow, 'id'>),
        open: d.data().open !== false,
        approved: d.data().approved === true,
      }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      setVendors(list);
      setLoading(false);
    });
  };

  const toggleOpen = async (vendor: VendorRow) => {
    setToggling(vendor.id);
    try {
      const newVal = !vendor.open;
      await updateDoc(doc(db, 'vendors', vendor.id), { open: newVal });
      setVendors((prev) => prev.map((v) => v.id === vendor.id ? { ...v, open: newVal } : v));
    } catch {
      Alert.alert('Error', 'Failed to update vendor status.');
    } finally {
      setToggling(null);
    }
  };

  const approve = async (vendor: VendorRow) => {
    try {
      await updateDoc(doc(db, 'vendors', vendor.id), { approved: true });
      setVendors((prev) => prev.map((v) => v.id === vendor.id ? { ...v, approved: true } : v));
    } catch {
      Alert.alert('Error', 'Failed to approve vendor.');
    }
  };

  const reject = (vendor: VendorRow) => {
    Alert.alert('Reject Vendor', `Remove "${vendor.name}"? This will delete the vendor.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await deleteDoc(doc(db, 'vendors', vendor.id));
            setVendors((prev) => prev.filter((v) => v.id !== vendor.id));
          } catch {
            Alert.alert('Error', 'Failed to remove vendor.');
          }
        },
      },
    ]);
  };

  const deleteVendor = (vendor: VendorRow) => {
    Alert.alert('Delete Vendor', `Permanently delete "${vendor.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteDoc(doc(db, 'vendors', vendor.id));
            setVendors((prev) => prev.filter((v) => v.id !== vendor.id));
          } catch {
            Alert.alert('Error', 'Failed to delete vendor.');
          }
        },
      },
    ]);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'vendors', editing.id), {
        name: editing.name,
        category: editing.category,
        area: editing.area,
        deliveryTime: editing.deliveryTime ?? '',
        minOrder: editing.minOrder ?? '',
      });
      setVendors((prev) => prev.map((v) => v.id === editing.id ? { ...v, ...editing } : v));
      setEditing(null);
    } catch {
      Alert.alert('Error', 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const q = search.toLowerCase();
  const filtered = vendors
    .filter((v) => (tab === 'Approved' ? v.approved : !v.approved))
    .filter((v) => !q || v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q) || v.area.toLowerCase().includes(q));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Vendors</Text>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, category or area..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => {
          const count = vendors.filter((v) => t === 'Approved' ? v.approved : !v.approved).length;
          return (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
              {t === 'Pending' && count > 0 && (
                <View style={styles.badge}><Text style={styles.badgeText}>{count}</Text></View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator size="large" color="#0f766e" /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(v) => v.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>{tab === 'Pending' ? 'No pending vendors' : 'No vendors found'}</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.sub}>📍 {item.area} · {item.category}</Text>
                  {item.deliveryTime ? <Text style={styles.sub}>🕐 {item.deliveryTime}</Text> : null}
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => setEditing(item)} style={styles.iconBtn}>
                    <Ionicons name="pencil-outline" size={18} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteVendor(item)} style={styles.iconBtn}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {tab === 'Approved' ? (
                <View style={styles.cardBottom}>
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
              ) : (
                <View style={styles.approvalRow}>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => reject(item)}>
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => approve(item)}>
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}

      {/* Edit Modal */}
      <Modal visible={!!editing} animationType="slide" onRequestClose={() => setEditing(null)}>
        {editing && (
          <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Vendor</Text>
              <TouchableOpacity onPress={() => setEditing(null)}>
                <Ionicons name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              {([
                { label: 'Name', key: 'name' },
                { label: 'Area', key: 'area' },
                { label: 'Delivery Time', key: 'deliveryTime' },
                { label: 'Min Order', key: 'minOrder' },
              ] as { label: string; key: keyof VendorRow }[]).map(({ label, key }) => (
                <View key={key} style={styles.field}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={String(editing[key] ?? '')}
                    onChangeText={(t) => setEditing((e) => e ? { ...e, [key]: t } : e)}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              ))}

              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.catRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, editing.category === cat && styles.catChipActive]}
                    onPress={() => setEditing((e) => e ? { ...e, category: cat } : e)}
                  >
                    <Text style={[styles.catChipText, editing.category === cat && styles.catChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
              </TouchableOpacity>
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
  searchWrap: { paddingHorizontal: 16, marginBottom: 8 },
  searchInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827' },

  tabs: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e5e7eb', gap: 6 },
  tabActive: { backgroundColor: '#0f766e', borderColor: '#0f766e' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  badge: { backgroundColor: '#ef4444', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  empty: { textAlign: 'center', color: '#9ca3af', paddingVertical: 32, fontSize: 14 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, elevation: 1, gap: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  name: { fontSize: 14, fontWeight: '700', color: '#111827' },
  sub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 6 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  openLabel: { fontSize: 12, fontWeight: '700' },

  approvalRow: { flexDirection: 'row', gap: 8 },
  rejectBtn: { flex: 1, borderWidth: 1.5, borderColor: '#ef4444', borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  rejectBtnText: { color: '#ef4444', fontWeight: '700', fontSize: 13 },
  approveBtn: { flex: 1, backgroundColor: '#0f766e', borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  approveBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  modal: { flex: 1, backgroundColor: '#f9fafb' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f3f4f6' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalScroll: { padding: 16, gap: 12 },

  field: { gap: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  fieldInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827' },

  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  catChipActive: { backgroundColor: '#0f766e', borderColor: '#0f766e' },
  catChipText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  catChipTextActive: { color: '#fff' },

  saveBtn: { backgroundColor: '#0f766e', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
