import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import Text from '../../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { VendorStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<VendorStackParamList, 'VendorMenu'>;

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  section: string;
  image?: string;
  available: boolean;
};

export default function VendorMenu({ navigation }: Props) {
  const { profile } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.vendorId) return;
    const q = query(collection(db, 'menuItems'), where('vendorId', '==', profile.vendorId));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem)));
      setLoading(false);
    });
    return unsub;
  }, [profile?.vendorId]);

  const handleDelete = (item: MenuItem) => {
    Alert.alert('Delete Item', `Remove "${item.name}" from your menu?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteDoc(doc(db, 'menuItems', item.id)) },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0f766e" /></View>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>My Menu</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('VendorAddItem')}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text style={styles.emptyTitle}>No menu items yet</Text>
          <TouchableOpacity style={styles.emptyAddBtn} onPress={() => navigation.navigate('VendorAddItem')}>
            <Text style={styles.emptyAddBtnText}>Add your first item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.image
                ? <Image source={{ uri: item.image }} style={styles.cardImage} />
                : <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
              }
              <View style={styles.cardInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSection}>{item.section}</Text>
                <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>
                <Text style={styles.itemPrice}>₦{item.price.toLocaleString()}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('VendorEditItem', {
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    section: item.section,
                    image: item.image ?? '',
                  })}
                  style={styles.actionBtn}
                >
                  <Ionicons name="pencil-outline" size={18} color="#0f766e" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  header: { fontSize: 22, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f766e', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, gap: 4 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptyAddBtn: { backgroundColor: '#0f766e', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  emptyAddBtnText: { color: '#fff', fontWeight: '700' },
  list: { padding: 16, gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 10, elevation: 1 },
  cardImage: { width: 64, height: 64, borderRadius: 10, marginRight: 12 },
  cardImagePlaceholder: { backgroundColor: '#f3f4f6' },
  cardInfo: { flex: 1 },
  itemName: { fontWeight: '700', fontSize: 14, color: '#111827' },
  itemSection: { fontSize: 11, color: '#0f766e', fontWeight: '600', marginTop: 1 },
  itemDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#0f766e', marginTop: 4 },
  actions: { flexDirection: 'column', gap: 8, paddingLeft: 4 },
  actionBtn: { padding: 6 },
});
