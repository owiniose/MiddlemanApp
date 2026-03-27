import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ImageBackground, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import IconGrid from '../components/IconGrid';
import { HomeStackParamList } from '../types/navigation';
const restaurants = require('../assets/Icons/restaurants.png');
const groceries = require('../assets/Icons/groceries.png');
const pharmacies = require('../assets/Icons/pharmacies.png');
const packages = require('../assets/Icons/packages.png');

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'HomeScreen'>;

type Vendor = {
  id: string;
  name: string;
  area: string;
  rating: string;
  image?: string;
};

const CATEGORIES = [
  { id: '1', label: 'Restaurants', icon: restaurants },
  { id: '2', label: 'Shops', icon: groceries },
  { id: '3', label: 'Pharmacies', icon: pharmacies },
  { id: '4', label: 'Packages', icon: packages },
];

const BANNER_URI = 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&auto=format&fit=crop&q=80';

export default function Home() {
  const navigation = useNavigation<NavProp>();
  const [featured, setFeatured] = useState<Vendor[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    getDocs(collection(db, 'vendors')).then((snap) => {
      const vendors = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vendor));
      setFeatured(vendors.slice(0, 10));
      setLoadingFeatured(false);
    });
  }, []);

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

        {/* Banner */}
        <ImageBackground source={{ uri: BANNER_URI }} style={styles.banner} imageStyle={styles.bannerImage}>
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Fast Delivery</Text>
            <Text style={styles.bannerSub}>Food, groceries & more to your door</Text>
          </View>
        </ImageBackground>

        <IconGrid items={CATEGORIES} onPress={(category) => navigation.navigate('CategoryList', { category })} />

        <View style={styles.promoBox}>
          <Text style={styles.promoText}>🎉 Get Free Delivery for 30 days!  Redeem Now</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured 🌟</Text>
        </View>

        {loadingFeatured ? (
          <View style={styles.featuredLoader}>
            <ActivityIndicator size="small" color="#0f766e" />
          </View>
        ) : featured.length === 0 ? (
          <Text style={styles.noVendors}>No vendors available yet</Text>
        ) : (
          <FlatList
            data={featured}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(v) => v.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('VendorDetail', {
                  id: item.id,
                  title: item.name,
                  subtitle: item.area,
                  rating: item.rating ?? '0.0',
                })}
                activeOpacity={0.85}
              >
                {item.image
                  ? <Image source={{ uri: item.image }} style={styles.cardImage} />
                  : <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
                }
                <View style={styles.cardRatingRow}>
                  <Text style={styles.cardRating}>⭐ {item.rating ?? '—'}</Text>
                </View>
                <Text style={styles.cardTitle}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

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

  banner: { height: 150, borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  bannerImage: { borderRadius: 12 },
  bannerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', padding: 16, justifyContent: 'flex-end' },
  bannerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  bannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },

  promoBox: { backgroundColor: '#eef2ff', padding: 12, borderRadius: 10, marginVertical: 16 },
  promoText: { color: '#3730a3', fontWeight: '600' },
  sectionHeader: { marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },

  featuredLoader: { height: 160, alignItems: 'center', justifyContent: 'center' },
  noVendors: { color: '#9ca3af', fontSize: 13, marginBottom: 12 },

  card: { width: 200, marginRight: 12, borderRadius: 10, backgroundColor: '#fff', elevation: 2, paddingBottom: 10 },
  cardImage: { height: 120, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: '#f3f4f6' },
  cardImagePlaceholder: { backgroundColor: '#e5e7eb' },
  cardRatingRow: { paddingHorizontal: 8, paddingTop: 8 },
  cardRating: { fontSize: 12, color: '#374151' },
  cardTitle: { fontWeight: '700', paddingHorizontal: 8, paddingTop: 2, fontSize: 13 },
});
