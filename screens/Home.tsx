import React, { useEffect, useState } from 'react';
import {
  ScrollView, View, StyleSheet, TouchableOpacity,
  FlatList, Image, ImageBackground, ActivityIndicator,
} from 'react-native';
import Text from '../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { HomeStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';

const restaurants = require('../assets/Icons/restaurants.png');
const groceries   = require('../assets/Icons/groceries.png');
const pharmacies  = require('../assets/Icons/pharmacies.png');
const packages    = require('../assets/Icons/packages.png');

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'HomeScreen'>;
type Vendor = { id: string; name: string; area: string; rating: string; image?: string; category: string; deliveryTime?: string; minOrder?: string; open?: boolean };

const CATEGORIES = [
  { id: '1', label: 'Restaurants', icon: restaurants, bg: '#fff3e0', emoji: '🍽️' },
  { id: '2', label: 'Shops',       icon: groceries,   bg: '#e3f2fd', emoji: '🛒' },
  { id: '3', label: 'Pharmacies',  icon: pharmacies,  bg: '#e8f5e9', emoji: '💊' },
  { id: '4', label: 'Packages',    icon: packages,    bg: '#f3e5f5', emoji: '📦' },
];

const BANNER_URI = 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&auto=format&fit=crop&q=80';

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function VendorCard({ item, onPress }: { item: Vendor; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {item.image
        ? <Image source={{ uri: item.image }} style={styles.cardImage} />
        : <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
      }
      {item.open === false && (
        <View style={styles.closedOverlay}><Text style={styles.closedOverlayText}>Closed</Text></View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardArea} numberOfLines={1}>📍 {item.area}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardRating}>⭐ {item.rating ?? '—'}</Text>
          {item.deliveryTime ? <Text style={styles.cardDelivery}>🕐 {item.deliveryTime}</Text> : null}
        </View>
        {item.minOrder ? <Text style={styles.cardMinOrder}>Min. {item.minOrder}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

export default function Home() {
  const navigation = useNavigation<NavProp>();
  const { profile } = useAuth();
  const [vendorsByCategory, setVendorsByCategory] = useState<Record<string, Vendor[]>>({});
  const [featured, setFeatured] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName = profile?.name?.split(' ')[0] ?? '';

  useEffect(() => {
    getDocs(collection(db, 'vendors')).then((snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vendor));
      // Featured: open stores first, then sort by rating descending
      const sorted = [...all]
        .sort((a, b) => {
          if (a.open === false && b.open !== false) return 1;
          if (b.open === false && a.open !== false) return -1;
          return parseFloat(b.rating ?? '0') - parseFloat(a.rating ?? '0');
        });
      setFeatured(sorted.slice(0, 8));
      const grouped: Record<string, Vendor[]> = {};
      all.forEach((v) => {
        if (!grouped[v.category]) grouped[v.category] = [];
        grouped[v.category].push(v);
      });
      setVendorsByCategory(grouped);
      setLoading(false);
    });
  }, []);

  const goToVendor = (item: Vendor) =>
    navigation.navigate('VendorDetail', {
      id: item.id, title: item.name,
      subtitle: item.area, rating: item.rating ?? '0.0',
    });

  const hasAnyVendors = Object.values(vendorsByCategory).some((v) => v.length > 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{timeGreeting()}{firstName ? `, ${firstName}` : ''} 👋</Text>
            <Text style={styles.locationSub}>What are you getting today? 🍽️</Text>
          </View>
        </View>

        {/* Banner */}
        <ImageBackground source={{ uri: BANNER_URI }} style={styles.banner} imageStyle={styles.bannerImage}>
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Fast Delivery</Text>
            <Text style={styles.bannerSub}>Food, groceries & more to your door</Text>
          </View>
        </ImageBackground>

        {/* Category quick-access */}
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCell}
              onPress={() => navigation.navigate('CategoryList', { category: cat.label })}
              activeOpacity={0.75}
            >
              <View style={[styles.categoryIcon, { backgroundColor: cat.bg }]}>
                <Image source={cat.icon} style={styles.categoryImage} resizeMode="contain" />
              </View>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Promo */}
        <View style={styles.promoBox}>
          <Text style={styles.promoText}>🎉 Free Delivery on your first 3 orders!</Text>
        </View>

        {/* Featured */}
        {!loading && featured.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionEmoji}>🌟</Text>
                <Text style={styles.sectionTitle}>Featured</Text>
              </View>
            </View>
            <FlatList
              data={featured}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(v) => v.id}
              contentContainerStyle={styles.sectionList}
              renderItem={({ item }) => (
                <VendorCard item={item} onPress={() => goToVendor(item)} />
              )}
            />
          </View>
        )}

        {/* Category sections */}
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#0f766e" />
          </View>
        ) : !hasAnyVendors ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏪</Text>
            <Text style={styles.emptyTitle}>No vendors yet</Text>
            <Text style={styles.emptySubtitle}>Vendors will appear here once they sign up</Text>
          </View>
        ) : (
          CATEGORIES.map((cat) => {
            const vendors = vendorsByCategory[cat.label];
            if (!vendors || vendors.length === 0) return null;
            return (
              <View key={cat.id} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionEmoji}>{cat.emoji}</Text>
                    <Text style={styles.sectionTitle}>{cat.label}</Text>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('CategoryList', { category: cat.label })}>
                    <Text style={styles.sectionLink}>See all</Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={vendors}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(v) => v.id}
                  contentContainerStyle={styles.sectionList}
                  renderItem={({ item }) => (
                    <VendorCard item={item} onPress={() => goToVendor(item)} />
                  )}
                />
              </View>
            );
          })
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { paddingBottom: 0 },

  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  greeting: { fontSize: 20, fontWeight: '700', color: '#111827' },
  locationSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },

  banner: { height: 156, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  bannerImage: { borderRadius: 16 },
  bannerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.38)', padding: 16, justifyContent: 'flex-end' },
  bannerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  bannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },

  categoryGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 20 },
  categoryCell: { flex: 1, alignItems: 'center', gap: 6 },
  categoryIcon: { width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  categoryImage: { width: 38, height: 38 },
  categoryLabel: { fontSize: 11, fontWeight: '600', color: '#374151', textAlign: 'center' },

  promoBox: { marginHorizontal: 16, backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#a7f3d0', padding: 12, borderRadius: 12, marginBottom: 24 },
  promoText: { color: '#065f46', fontWeight: '600', fontSize: 13 },

  loader: { paddingVertical: 60, alignItems: 'center' },
  emptyState: { paddingVertical: 48, alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptySubtitle: { fontSize: 13, color: '#9ca3af', textAlign: 'center', paddingHorizontal: 40 },

  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionEmoji: { fontSize: 18 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  sectionLink: { fontSize: 13, color: '#0f766e', fontWeight: '600' },
  sectionList: { paddingLeft: 16, paddingRight: 8 },

  card: { width: 200, marginRight: 12, borderRadius: 14, backgroundColor: '#fff', elevation: 2, overflow: 'hidden' },
  cardImage: { height: 120, backgroundColor: '#f3f4f6', width: '100%' },
  cardImagePlaceholder: { backgroundColor: '#e5e7eb' },
  closedOverlay: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  closedOverlayText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardBody: { padding: 10, gap: 2 },
  cardTitle: { fontWeight: '700', fontSize: 14, color: '#111827' },
  cardArea: { fontSize: 12, color: '#6b7280' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  cardRating: { fontSize: 12, color: '#374151', fontWeight: '600' },
  cardDelivery: { fontSize: 11, color: '#6b7280' },
  cardMinOrder: { fontSize: 11, color: '#9ca3af', marginTop: 1 },
});
