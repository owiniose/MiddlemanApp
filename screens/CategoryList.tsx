import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types/navigation';
import { VENDORS } from '../data/vendors';

type Props = NativeStackScreenProps<HomeStackParamList, 'CategoryList'>;

export default function CategoryList({ route, navigation }: Props) {
  const { category } = route.params;
  const vendors = VENDORS[category] ?? [];

  return (
    <FlatList
      data={vendors}
      keyExtractor={(v) => v.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No vendors available</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('VendorDetail', {
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            rating: item.rating,
          })}
        >
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          <View style={styles.cardBody}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {item.rating}</Text>
              </View>
            </View>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            <View style={styles.cardMeta}>
              <Text style={styles.metaText}>🕐 {item.deliveryTime}</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>Min. {item.minOrder}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40 },

  card: { borderRadius: 12, backgroundColor: '#fff', elevation: 2, overflow: 'hidden' },
  cardImage: { height: 140, backgroundColor: '#f3f4f6' },
  cardBody: { padding: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  ratingBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  cardSubtitle: { color: '#6b7280', fontSize: 13, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: '#6b7280' },
  metaDot: { color: '#d1d5db' },
});
