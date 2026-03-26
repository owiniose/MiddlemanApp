import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import IconGrid from '../components/IconGrid';
import { HomeStackParamList } from '../types/navigation';
const restaurants = require('../assets/Icons/restaurants.png');
const groceries = require('../assets/Icons/groceries.png');
const pharmacies = require('../assets/Icons/pharmacies.png');
const packages = require('../assets/Icons/packages.png');

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'HomeScreen'>;

const CATEGORIES = [
  { id: '1', label: 'Restaurants', icon: restaurants },
  { id: '2', label: 'Shops', icon: groceries },
  { id: '3', label: 'Pharmacies', icon: pharmacies },
  { id: '4', label: 'Packages', icon: packages },
];

const FEATURED = [
  { id: 'r1', title: 'Calabar-Igbo Restaurant - Ikorodu', subtitle: 'From ₦500 · 30 - 40 min', rating: '4.0' },
  { id: 'r2', title: 'Chicken Republic', subtitle: 'From ₦700 · 25 - 35 min', rating: '4.2' },
];

export default function Home() {
  const navigation = useNavigation<NavProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.locationLabel}>Ikorodu</Text>
            <Text style={styles.locationSub}>Change location</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>Promo Banner</Text>
        </View>

        <IconGrid items={CATEGORIES} onPress={(category) => navigation.navigate('CategoryList', { category })} />

        <View style={styles.promoBox}>
          <Text style={styles.promoText}>Get Free Delivery for 30 days!  Redeem Now</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured 🌟</Text>
        </View>

        <FlatList
          data={FEATURED}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('VendorDetail', {
                id: item.id,
                title: item.title,
                subtitle: item.subtitle,
                rating: item.rating,
              })}
              activeOpacity={0.85}
            >
              <View style={styles.cardImage} />
              <View style={styles.cardRatingRow}>
                <Text style={styles.cardRating}>⭐ {item.rating}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 16, paddingBottom: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  locationLabel: { fontSize: 18, fontWeight: '600' },
  locationSub: { color: '#666' },
  filterBtn: { backgroundColor: '#0f766e', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  filterText: { color: '#fff' },
  banner: { height: 140, backgroundColor: '#f3f4f6', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  bannerText: { color: '#111' },
  promoBox: { backgroundColor: '#eef2ff', padding: 12, borderRadius: 10, marginVertical: 16 },
  promoText: { color: '#3730a3', fontWeight: '600' },
  sectionHeader: { marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  card: { width: 260, marginRight: 12, borderRadius: 10, backgroundColor: '#fff', elevation: 2, paddingBottom: 10 },
  cardImage: { height: 120, backgroundColor: '#f8fafc', borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  cardRatingRow: { paddingHorizontal: 8, paddingTop: 8 },
  cardRating: { fontSize: 12, color: '#374151' },
  cardTitle: { fontWeight: '700', paddingHorizontal: 8, paddingTop: 2 },
  cardSubtitle: { color: '#6b7280', paddingHorizontal: 8, paddingTop: 4, fontSize: 12 },
});
