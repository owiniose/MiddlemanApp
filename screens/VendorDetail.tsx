import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types/navigation';
import { RootStackParamList } from '../types/navigation';
import { MENU_DATA } from '../data/menu';
import { useCart } from '../context/CartContext';

type Props = NativeStackScreenProps<HomeStackParamList, 'VendorDetail'>;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function VendorDetail({ route }: Props) {
  const { id, title, rating } = route.params;
  const { addItem, removeItem, items, count, total } = useCart();
  const rootNav = useNavigation<RootNav>();

  const menuSections = MENU_DATA[id] ?? [];

  const getQty = (itemId: string) => items.find((i) => i.id === itemId)?.qty ?? 0;

  return (
    <View style={styles.container}>
      <View style={styles.hero} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.vendorName}>{title}</Text>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>⭐ {rating}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🕐 30–40 min</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🛵 Free delivery</Text>
            </View>
          </View>
        </View>

        {menuSections.map((section) => (
          <View key={section.section} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            {section.items.map((item) => {
              const qty = getQty(item.id);
              return (
                <View key={item.id} style={styles.menuItem}>
                  <View style={styles.menuImagePlaceholder} />
                  <View style={styles.menuInfo}>
                    <Text style={styles.menuName}>{item.name}</Text>
                    <Text style={styles.menuDesc}>{item.description}</Text>
                    <Text style={styles.menuPrice}>₦{item.price.toLocaleString()}</Text>
                  </View>
                  <View style={styles.qtyControl}>
                    {qty > 0 ? (
                      <>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => removeItem(item.id)}>
                          <Text style={styles.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyCount}>{qty}</Text>
                      </>
                    ) : null}
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => addItem({ id: item.id, name: item.name, description: item.description, price: item.price, vendorId: id, vendorName: title })}
                    >
                      <Text style={styles.addBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

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
  hero: { height: 240, backgroundColor: '#d1d5db' },
  scroll: { paddingBottom: 16 },

  infoCard: { padding: 16, borderBottomWidth: 1, borderColor: '#f3f4f6' },
  vendorName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  badges: { flexDirection: 'row', gap: 8 },
  badge: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, color: '#374151', fontWeight: '500' },

  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#111827' },

  menuItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  menuImagePlaceholder: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#f3f4f6', marginRight: 12 },
  menuInfo: { flex: 1 },
  menuName: { fontWeight: '600', fontSize: 14, marginBottom: 2 },
  menuDesc: { color: '#6b7280', fontSize: 12, marginBottom: 4 },
  menuPrice: { fontWeight: '700', color: '#0f766e' },

  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#0f766e', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: '#0f766e', fontSize: 16, lineHeight: 20 },
  qtyCount: { fontSize: 14, fontWeight: '600', minWidth: 16, textAlign: 'center' },
  addBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0f766e', alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 18, lineHeight: 22 },

  cartBarWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 12 },
  cartBar: { backgroundColor: '#0f766e', borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  cartCountBadge: { backgroundColor: '#0d9488', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cartCountText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  cartBarLabel: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 15 },
  cartBarTotal: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
