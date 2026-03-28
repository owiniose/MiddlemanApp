import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, FlatList, ActivityIndicator,
  TextInput, TouchableOpacity, Alert, Modal, ScrollView,
} from 'react-native';
import Text from '../../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Ionicons } from '@expo/vector-icons';

type UserRow = {
  uid: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  phone?: string;
};

const ROLES = ['customer', 'vendor', 'admin'] as const;

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  customer: { bg: '#e0f2fe', color: '#0369a1' },
  vendor:   { bg: '#f0fdf4', color: '#15803d' },
  admin:    { bg: '#fef3c7', color: '#b45309' },
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [filtered, setFiltered] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDocs(collection(db, 'users')).then((snap) => {
      const list = snap.docs.map((d) => d.data() as UserRow);
      list.sort((a, b) => a.name.localeCompare(b.name));
      setUsers(list);
      setFiltered(list);
      setLoading(false);
    });
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    const q = text.toLowerCase();
    setFiltered(users.filter((u) =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.includes(q),
    ));
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', editing.uid), {
        name: editing.name,
        phone: editing.phone ?? '',
        role: editing.role,
      });
      const updater = (list: UserRow[]) => list.map((u) => u.uid === editing.uid ? { ...u, ...editing } : u);
      setUsers(updater);
      setFiltered(updater);
      setEditing(null);
    } catch {
      Alert.alert('Error', 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = (user: UserRow) => {
    Alert.alert('Delete User', `Permanently delete "${user.name}"? This only removes their profile data.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteDoc(doc(db, 'users', user.uid));
            const updater = (list: UserRow[]) => list.filter((u) => u.uid !== user.uid);
            setUsers(updater);
            setFiltered(updater);
          } catch {
            Alert.alert('Error', 'Failed to delete user.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Users</Text>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email or role..."
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
          keyExtractor={(u) => u.uid}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No users found</Text>}
          renderItem={({ item }) => {
            const rs = ROLE_STYLE[item.role] ?? ROLE_STYLE.customer;
            return (
              <View style={styles.card}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                  {item.phone ? <Text style={styles.phone}>📞 {item.phone}</Text> : null}
                </View>
                <View style={[styles.roleBadge, { backgroundColor: rs.bg }]}>
                  <Text style={[styles.roleText, { color: rs.color }]}>{item.role}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => setEditing(item)} style={styles.iconBtn}>
                    <Ionicons name="pencil-outline" size={17} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteUser(item)} style={styles.iconBtn}>
                    <Ionicons name="trash-outline" size={17} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Edit Modal */}
      <Modal visible={!!editing} animationType="slide" onRequestClose={() => setEditing(null)}>
        {editing && (
          <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User</Text>
              <TouchableOpacity onPress={() => setEditing(null)}>
                <Ionicons name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              {([
                { label: 'Name', key: 'name' },
                { label: 'Phone', key: 'phone' },
              ] as { label: string; key: keyof UserRow }[]).map(({ label, key }) => (
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

              <Text style={styles.fieldLabel}>Role</Text>
              <View style={styles.roleRow}>
                {ROLES.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleChip, editing.role === r && styles.roleChipActive]}
                    onPress={() => setEditing((e) => e ? { ...e, role: r } : e)}
                  >
                    <Text style={[styles.roleChipText, editing.role === r && styles.roleChipTextActive]}>{r}</Text>
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

  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  empty: { textAlign: 'center', color: '#9ca3af', paddingVertical: 32, fontSize: 14 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', elevation: 1, gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#0f766e', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: '#111827' },
  email: { fontSize: 12, color: '#6b7280', marginTop: 1 },
  phone: { fontSize: 12, color: '#6b7280', marginTop: 1 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  actions: { flexDirection: 'row', gap: 2 },
  iconBtn: { padding: 6 },

  modal: { flex: 1, backgroundColor: '#f9fafb' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f3f4f6' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalScroll: { padding: 16, gap: 12 },

  field: { gap: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  fieldInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827' },

  roleRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  roleChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  roleChipActive: { backgroundColor: '#0f766e', borderColor: '#0f766e' },
  roleChipText: { fontSize: 13, fontWeight: '600', color: '#6b7280', textTransform: 'capitalize' },
  roleChipTextActive: { color: '#fff' },

  saveBtn: { backgroundColor: '#0f766e', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
