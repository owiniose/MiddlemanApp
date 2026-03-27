import React, { useEffect, useState } from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Switch, Alert,
} from 'react-native';
import Text from '../../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import ImagePickerField from '../../components/ImagePickerField';

const CATEGORIES = ['Restaurants', 'Shops', 'Pharmacies', 'Packages'];

type StoreData = {
  name: string;
  category: string;
  area: string;
  deliveryTime: string;
  minOrder: string;
  open: boolean;
  image?: string;
};

export default function VendorStoreSettings() {
  const { profile, logOut } = useAuth();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile?.vendorId) return;
    getDoc(doc(db, 'vendors', profile.vendorId)).then((snap) => {
      if (snap.exists()) setStore(snap.data() as StoreData);
      setLoading(false);
    });
  }, [profile?.vendorId]);

  const handleSave = async () => {
    if (!store || !profile?.vendorId) return;
    if (!store.name.trim()) { Alert.alert('Error', 'Store name is required'); return; }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'vendors', profile.vendorId), {
        name: store.name.trim(),
        category: store.category,
        area: store.area.trim(),
        deliveryTime: store.deliveryTime.trim() || '30–45 min',
        minOrder: store.minOrder.trim() || '₦500',
        open: store.open,
        ...(store.image !== undefined ? { image: store.image } : {}),
      });
      Alert.alert('Saved', 'Store settings updated successfully.');
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logOut },
    ]);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#0f766e" /></View>;
  }

  if (!store) {
    return <View style={styles.center}><Text style={styles.errorText}>Could not load store data.</Text></View>;
  }

  const set = (key: keyof StoreData) => (val: string | boolean) =>
    setStore((s) => s ? { ...s, [key]: val } : s);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Store Settings</Text>

        {/* Account info */}
        <View style={styles.accountCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() ?? '?'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.accountName}>{profile?.name}</Text>
            <Text style={styles.accountEmail}>{profile?.email}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Store Photo</Text>
        <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
          <ImagePickerField
            value={store.image}
            onChange={(url) => set('image')(url)}
            width={340}
            height={160}
            aspect={[16, 9]}
          />
        </View>

        <Text style={styles.sectionLabel}>Store Info</Text>
        <View style={styles.card}>
          <Field label="Store Name" value={store.name} onChangeText={set('name')} placeholder="e.g. Mama Titi's Kitchen" />
          <Field label="Location / Area" value={store.area} onChangeText={set('area')} placeholder="e.g. Ikorodu, Lagos" />
          <Field label="Delivery Time" value={store.deliveryTime} onChangeText={set('deliveryTime')} placeholder="e.g. 30–45 min" />
          <Field label="Min. Order" value={store.minOrder} onChangeText={set('minOrder')} placeholder="e.g. ₦500" />
        </View>

        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryBtn, store.category === cat && styles.categoryBtnActive]}
              onPress={() => set('category')(cat)}
            >
              <Text style={[styles.categoryBtnText, store.category === cat && styles.categoryBtnTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Status</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Store Open</Text>
              <Text style={styles.toggleSub}>Customers can place orders when open</Text>
            </View>
            <Switch
              value={store.open}
              onValueChange={(v) => set('open')(v)}
              trackColor={{ true: '#0f766e', false: '#e5e7eb' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, placeholder }: {
  label: string; value: string; onChangeText: (v: string) => void; placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#6b7280', fontSize: 15 },
  header: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 16 },

  accountCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, elevation: 1, gap: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0f766e', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  accountName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  accountEmail: { fontSize: 13, color: '#6b7280', marginTop: 2 },

  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, elevation: 1, gap: 4 },

  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827' },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  categoryBtn: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff' },
  categoryBtnActive: { borderColor: '#0f766e', backgroundColor: '#f0fdf4' },
  categoryBtnText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  categoryBtnTextActive: { color: '#0f766e' },

  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  toggleSub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  saveBtn: { backgroundColor: '#0f766e', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  signOutBtn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, alignItems: 'center', elevation: 1 },
  signOutText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
});
