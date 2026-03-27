import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Text from '../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { HomeStackParamList, RootStackParamList } from '../types/navigation';
import { useCart } from '../context/CartContext';

type Props = NativeStackScreenProps<HomeStackParamList, 'VendorDetail'>;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  section: string;
  image?: string;
  available: boolean;
};

type VendorData = {
  deliveryTime?: string;
  minOrder?: string;
  image?: string;
  open?: boolean;
};

export default function VendorDetail({ route }: Props) {
  const { id, title, rating } = route.params;
  const { addItem, removeItem, items, count, total } = useCart();
  const rootNav = useNavigation<RootNav>();

  const [menuSections, setMenuSections] = useState<{ section: string; items: MenuItem[] }[]>([]);
  const [vendorData, setVendorData] = useState<VendorData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDoc(doc(db, 'vendors', id)),
      getDocs(query(collection(db, 'menuItems'), where('vendorId', '==', id))),
    ]).then(([vendorSnap, menuSnap]) => {
      if (vendorSnap.exists()) setVendorData(vendorSnap.data() as VendorData);

      const allItems = menuSnap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem));
      const grouped: Record<string, MenuItem[]> = {};
      allItems.forEach((item) => {
        if (!grouped[item.section]) grouped[item.section] = [];
        grouped[item.section].push(item);
      });
      setMenuSections(Object.entries(grouped).map(([section, items]) => ({ section, items })));
      setLoading(false);
    });
  }, [id]);

  const getQty = (itemId: string) => items.find((i) => i.id === itemId)?.qty ?? 0;

  return (
    <View style={styles.container}>
      {vendorData.image
        ? <Image source={{ uri: vendorData.image }} style={styles.hero} />
        : <View style={[styles.hero, styles.heroPlaceholder]} />
      }

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.vendorName}>{title}</Text>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>⭐ {rating}</Text>
            </View>
            {vendorData.deliveryTime && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🕐 {vendorData.deliveryTime}</Text>
              </View>
            )}
            {vendorData.minOrder && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Min. {vendorData.minOrder}</Text>
              </View>
            )}
          </View>
        </View>

        {vendorData.open === false && (
          <View style={styles.closedBanner}>
            <Text style={styles.closedBannerText}>🔴 This store is currently closed and not accepting orders</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.menuLoader}>
            <ActivityIndicator size="small" color="#0f766e" />
          </View>
        ) : menuSections.length === 0 ? (
          <View style={styles.emptyMenu}>
            <Text style={styles.emptyMenuText}>No menu items added yet</Text>
          </View>
        ) : (
          menuSections.map((sec) => (
            <View key={sec.section} style={styles.section}>
              <Text style={styles.sectionTitle}>{sec.section}</Text>
              {sec.items.map((item) => {
                const qty = getQty(item.id);
                const isClosed = vendorData.open === false;
                return (
                  <View key={item.id} style={styles.menuItem}>
                    {item.image
                      ? <Image source={{ uri: item.image }} style={styles.menuImage} />
                      : <View style={[styles.menuImage, styles.menuImagePlaceholder]} />
                    }
                    <View style={styles.menuInfo}>
                      <Text style={styles.menuName}>{item.name}</Text>
                      <Text style={styles.menuDesc}>{item.description}</Text>
                      <Text style={styles.menuPrice}>₦{item.price.toLocaleString()}</Text>
                    </View>
                    <View style={styles.qtyControl}>
                      {qty > 0 && !isClosed ? (
                        <>
                          <TouchableOpacity style={styles.qtyBtn} onPress={() => removeItem(item.id)}>
                            <Text style={styles.qtyBtnText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.qtyCount}>{qty}</Text>
                        </>
                      ) : null}
                      <TouchableOpacity
                        style={[styles.addBtn, isClosed && styles.addBtnDisabled]}
                        disabled={isClosed}
                        onPress={() => addItem({ id: item.id, name: item.name, description: item.description, price: item.price, vendorId: id, vendorName: title, image: item.image })}
                      >
                        <Text style={styles.addBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {count > 0 && (
        <SafeAreaView edges={['bottom']} style={styles.cartBarWrap}>
          <TouchableOpacity style={styles.cartBar} onPress={() => rootNav.navigate('Cart')}>
            <View style={styles.cartCountBadge}>
              <Text style={styles.cartCountText}>{count}</Text>
            </View>
            <Text style={styles.cartBarLabel}>View Cart</Text>
            <Text style={styles.cartBarTotal}>₦{total.toLocaleString()}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  hero: { height: 240, backgroundColor: '#d1d5db', width: '100%' },
  heroPlaceholder: { backgroundColor: '#e5e7eb' },
  scroll: { paddingBottom: 16 },

  infoCard: { padding: 16, borderBottomWidth: 1, borderColor: '#f3f4f6' },
  vendorName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, color: '#374151', fontWeight: '500' },

  menuLoader: { padding: 40, alignItems: 'center' },
  emptyMenu: { padding: 40, alignItems: 'center' },
  emptyMenuText: { color: '#9ca3af', fontSize: 14 },

  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#111827' },

  menuItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  menuImage: { width: 72, height: 72, borderRadius: 10, marginRight: 12 },
  menuImagePlaceholder: { backgroundColor: '#f3f4f6' },
  menuInfo: { flex: 1 },
  menuName: { fontWeight: '600', fontSize: 14, marginBottom: 2 },
  menuDesc: { color: '#6b7280', fontSize: 12, marginBottom: 4 },
  menuPrice: { fontWeight: '700', color: '#0f766e' },

  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#0f766e', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: '#0f766e', fontSize: 16, lineHeight: 20 },
  qtyCount: { fontSize: 14, fontWeight: '600', minWidth: 16, textAlign: 'center' },
  addBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0f766e', alignItems: 'center', justifyContent: 'center' },
  addBtnDisabled: { backgroundColor: '#d1d5db' },
  addBtnText: { color: '#fff', fontSize: 18, lineHeight: 22 },
  closedBanner: { backgroundColor: '#fef2f2', borderRadius: 10, marginHorizontal: 16, marginTop: 12, padding: 12 },
  closedBannerText: { color: '#dc2626', fontSize: 13, fontWeight: '600', textAlign: 'center' },

  cartBarWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 12 },
  cartBar: { backgroundColor: '#0f766e', borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  cartCountBadge: { backgroundColor: '#0d9488', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cartCountText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  cartBarLabel: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 15 },
  cartBarTotal: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
