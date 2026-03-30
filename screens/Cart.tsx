import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import Text from '../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCart } from '../context/CartContext';
import { RootStackParamList } from '../types/navigation';
import { CITY_FEE, OUTSKIRTS_FEE } from '../utils/deliveryFee';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export default function Cart({ navigation }: Props) {
  const { items, vendorName, total, count, addItem, removeItem } = useCart();

  if (count === 0) {
    return (
      <SafeAreaView style={styles.emptyWrap} edges={['bottom']}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add items from a vendor to get started</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.cartKey}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.vendorRow}>
            <Text style={styles.vendorLabel}>🏪 {vendorName}</Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₦{total.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery fee</Text>
              <Text style={styles.summaryValue}>₦{CITY_FEE.toLocaleString()} – ₦{OUTSKIRTS_FEE.toLocaleString()}</Text>
            </View>
            <View style={styles.feeNote}>
              <Text style={styles.feeNoteText}>Exact fee calculated at checkout based on your area</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>₦{total.toLocaleString()}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const optionsExtra = (item.selectedOptions ?? []).reduce(
            (s, g) => s + g.choices.reduce((cs, c) => cs + c.price, 0), 0,
          );
          const effectivePrice = item.price + optionsExtra;
          const optionTags = (item.selectedOptions ?? []).flatMap((g) =>
            g.choices.map((c) => c.name),
          );

          return (
            <View style={styles.card}>
              {item.image
                ? <Image source={{ uri: item.image }} style={styles.cardImage} />
                : <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
              }
              <View style={styles.cardInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {optionTags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {optionTags.map((tag, i) => (
                      <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <Text style={styles.itemPrice}>₦{effectivePrice.toLocaleString()}</Text>
              </View>
              <View style={styles.qtyControl}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => removeItem(item.cartKey)}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyCount}>{item.qty}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, styles.qtyBtnAdd]}
                  onPress={() => addItem({
                    id: item.id,
                    cartKey: item.cartKey,
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    vendorId: item.vendorId,
                    vendorName: item.vendorName,
                    image: item.image,
                    selectedOptions: item.selectedOptions,
                  })}
                >
                  <Text style={[styles.qtyBtnText, styles.qtyBtnAddText]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate('Checkout')}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          <Text style={styles.checkoutTotal}>₦{total.toLocaleString()} + delivery</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', gap: 8 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  emptySubtitle: { fontSize: 14, color: '#6b7280' },

  list: { padding: 16, gap: 12 },
  vendorRow: { backgroundColor: '#eef0ff', borderRadius: 10, padding: 10, marginBottom: 4 },
  vendorLabel: { fontSize: 13, fontWeight: '700', color: '#0f1575' },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 12, elevation: 1, gap: 12 },
  cardImage: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#f3f4f6' },
  cardImagePlaceholder: { backgroundColor: '#e5e7eb' },
  cardInfo: { flex: 1 },
  itemName: { fontWeight: '700', fontSize: 14, color: '#111827', marginBottom: 4 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 4 },
  tag: { backgroundColor: '#f3f4f6', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  tagText: { fontSize: 11, color: '#374151' },
  itemPrice: { fontWeight: '700', color: '#1E22A3', fontSize: 14 },

  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  qtyBtnAdd: { backgroundColor: '#1E22A3', borderColor: '#1E22A3' },
  qtyBtnText: { color: '#374151', fontSize: 16, lineHeight: 20 },
  qtyBtnAddText: { color: '#fff' },
  qtyCount: { fontSize: 15, fontWeight: '700', minWidth: 18, textAlign: 'center', color: '#111827' },

  summary: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 4, gap: 10, elevation: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: '#6b7280', fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  feeNote: { backgroundColor: '#f9fafb', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  feeNoteText: { fontSize: 11, color: '#9ca3af', textAlign: 'center' },
  totalRow: { borderTopWidth: 1, borderColor: '#f3f4f6', paddingTop: 10, marginTop: 2 },
  totalLabel: { fontWeight: '700', fontSize: 16, color: '#111827' },
  totalValue: { fontWeight: '700', fontSize: 16, color: '#1E22A3' },

  footer: { paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#f3f4f6' },
  checkoutBtn: { backgroundColor: '#1E22A3', borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 20, marginTop: 12 },
  checkoutText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  checkoutTotal: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
