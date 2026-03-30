import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  TextInput,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Text from '../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { SearchStackParamList } from '../types/navigation';

type NavProp = NativeStackNavigationProp<SearchStackParamList, 'SearchScreen'>;

type Vendor = {
  id: string;
  name: string;
  area: string;
  rating: string;
  deliveryTime: string;
  minOrder: string;
  category: string;
  open: boolean;
};

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  section: string;
  vendorId: string;
};

const CATEGORY_EMOJI: Record<string, string> = {
  Restaurants: '🍽️',
  Shops: '🛒',
  Pharmacies: '💊',
  Packages: '📦',
};

const CATEGORIES = ['All', 'Restaurants', 'Shops', 'Pharmacies', 'Packages'] as const;

type ResultSection =
  | { type: 'vendor'; data: Vendor }
  | { type: 'item'; data: MenuItem; vendor?: Vendor };

export default function Search() {
  const navigation = useNavigation<NavProp>();
  const [query, setQuery] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('All');
  const [openOnly, setOpenOnly] = useState(false);
  const [topRated, setTopRated] = useState(false);

  useEffect(() => {
    Promise.all([
      getDocs(collection(db, 'vendors')),
      getDocs(collection(db, 'menuItems')),
    ]).then(([vendorSnap, menuSnap]) => {
      setVendors(vendorSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Vendor)).filter((v: any) => v.approved !== false));
      setMenuItems(menuSnap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem)));
      setLoading(false);
    });
  }, []);

  const vendorMap = useMemo(() =>
    Object.fromEntries(vendors.map((v) => [v.id, v])),
    [vendors]
  );

  const hasFilter = category !== 'All' || openOnly || topRated;

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && !hasFilter) return [];

    let vendorHits = vendors;
    if (q) {
      vendorHits = vendorHits.filter((v) =>
        v.name.toLowerCase().includes(q) ||
        v.area.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
      );
    }
    if (category !== 'All') vendorHits = vendorHits.filter((v) => v.category === category);
    if (openOnly) vendorHits = vendorHits.filter((v) => v.open !== false);
    if (topRated) vendorHits = [...vendorHits].sort((a, b) => parseFloat(b.rating ?? '0') - parseFloat(a.rating ?? '0'));

    const filteredVendorIds = new Set(vendorHits.map((v) => v.id));

    let itemHits: MenuItem[] = [];
    if (q) {
      itemHits = menuItems.filter((m) =>
        m.name.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q)
      );
      if (category !== 'All' || openOnly) {
        itemHits = itemHits.filter((m) => filteredVendorIds.has(m.vendorId));
      }
    }

    const result = [];
    if (vendorHits.length > 0)
      result.push({ title: 'Vendors', data: vendorHits.map((v) => ({ type: 'vendor' as const, data: v })) });
    if (itemHits.length > 0)
      result.push({ title: 'Menu Items', data: itemHits.map((m) => ({ type: 'item' as const, data: m, vendor: vendorMap[m.vendorId] })) });
    return result;
  }, [query, category, openOnly, topRated, vendors, menuItems, vendorMap, hasFilter]);

  const goToVendor = (vendor: Vendor) =>
    navigation.navigate('VendorDetail', {
      id: vendor.id,
      title: vendor.name,
      subtitle: vendor.area,
      rating: vendor.rating ?? '0.0',
    });

  const renderItem = ({ item }: { item: ResultSection }) => {
    if (item.type === 'vendor') {
      const v = item.data;
      return (
        <TouchableOpacity style={styles.card} onPress={() => goToVendor(v)} activeOpacity={0.85}>
          <View style={styles.iconBox}>
            <Text style={styles.iconEmoji}>{CATEGORY_EMOJI[v.category] ?? '🏪'}</Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{v.name}</Text>
              <Text style={styles.cardRating}>⭐ {v.rating ?? '—'}</Text>
            </View>
            <Text style={styles.cardSubtitle}>📍 {v.area}</Text>
            <View style={styles.cardMeta}>
              <Text style={styles.metaText}>🕐 {v.deliveryTime}</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>Min. {v.minOrder}</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.categoryTag}>{v.category}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    const m = item.data;
    const vendor = item.vendor;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => vendor && goToVendor(vendor)}
        activeOpacity={0.85}
      >
        <View style={styles.iconBox}>
          <Text style={styles.iconEmoji}>{vendor ? CATEGORY_EMOJI[vendor.category] ?? '🏪' : '🍽️'}</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={styles.cardTitle}>{m.name}</Text>
            <Text style={styles.menuPrice}>₦{m.price.toLocaleString()}</Text>
          </View>
          <Text style={styles.cardSubtitle}>{m.description}</Text>
          {vendor && (
            <View style={styles.cardMeta}>
              <Text style={styles.metaText}>📍 {vendor.name}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search vendors, items, categories..."
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && styles.chipActive]}
            onPress={() => setCategory(cat)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.chip, openOnly && styles.chipActive]}
          onPress={() => setOpenOnly((v) => !v)}
          activeOpacity={0.75}
        >
          <Text style={[styles.chipText, openOnly && styles.chipTextActive]}>Open now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, topRated && styles.chipActive]}
          onPress={() => setTopRated((v) => !v)}
          activeOpacity={0.75}
        >
          <Text style={[styles.chipText, topRated && styles.chipTextActive]}>Ratings {topRated ? '▲' : '▾'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#1E22A3" />
        </View>
      ) : !query.trim() && !hasFilter ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Find anything</Text>
          <Text style={styles.emptySubtitle}>Search vendors, menu items, or categories</Text>
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>😕</Text>
          <Text style={styles.emptyTitle}>No results</Text>
          <Text style={styles.emptySubtitle}>Try a different search term or filter</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.type + item.data.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    height: 48,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  clearBtn: { fontSize: 14, color: '#9ca3af', paddingHorizontal: 4 },

  filterRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 8, alignItems: 'center' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb',
    backgroundColor: '#fff', alignSelf: 'flex-start',
  },
  chipActive: { backgroundColor: '#1E22A3', borderColor: '#1E22A3' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  chipTextActive: { color: '#fff' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', paddingHorizontal: 40 },

  list: { paddingHorizontal: 16, paddingBottom: 16 },
  sectionHeader: { fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16, marginBottom: 8 },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, elevation: 2, padding: 12, marginBottom: 10 },
  iconBox: { width: 52, height: 52, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iconEmoji: { fontSize: 24 },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  cardTitle: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  cardRating: { fontSize: 12, color: '#374151' },
  menuPrice: { fontSize: 13, fontWeight: '700', color: '#1E22A3' },
  cardSubtitle: { fontSize: 12, color: '#6b7280', marginBottom: 5 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: '#6b7280' },
  metaDot: { color: '#d1d5db', fontSize: 11 },
  categoryTag: { fontSize: 11, color: '#1E22A3', fontWeight: '600' },
});
