import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { HomeStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<HomeStackParamList, 'CategoryList'>;

type Vendor = {
  id: string;
  name: string;
  area: string;
  rating: string;
  deliveryTime: string;
  minOrder: string;
  open: boolean;
  image?: string;
};

export default function CategoryList({ route, navigation }: Props) {
  const { category } = route.params;
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'vendors'), where('category', '==', category));
    getDocs(q).then((snap) => {
      setVendors(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vendor)));
      setLoading(false);
    });
  }, [category]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#0f766e" /></View>;
  }

  return (
    <FlatList
      data={vendors}
      keyExtractor={(v) => v.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No vendors available in this category yet</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('VendorDetail', {
            id: item.id,
            title: item.name,
            subtitle: item.area,
            rating: item.rating ?? '0.0',
          })}
        >
          {item.image
            ? <Image source={{ uri: item.image }} style={styles.cardImage} />
            : <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
          }
          <View style={styles.cardBody}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {item.rating ?? '—'}</Text>
              </View>
            </View>
            <Text style={styles.cardSubtitle}>📍 {item.area}</Text>
            <View style={styles.cardMeta}>
              <Text style={styles.metaText}>🕐 {item.deliveryTime}</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>Min. {item.minOrder}</Text>
              {!item.open && <Text style={styles.closedTag}>Closed</Text>}
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, gap: 12 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40 },

  card: { borderRadius: 12, backgroundColor: '#fff', elevation: 2, overflow: 'hidden' },
  cardImage: { height: 140, backgroundColor: '#f3f4f6' },
  cardImagePlaceholder: { backgroundColor: '#e5e7eb' },
  cardBody: { padding: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  ratingBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  cardSubtitle: { color: '#6b7280', fontSize: 13, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: '#6b7280' },
  metaDot: { color: '#d1d5db' },
  closedTag: { fontSize: 11, color: '#ef4444', fontWeight: '600', marginLeft: 4 },
});
