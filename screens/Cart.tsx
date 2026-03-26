import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCart } from '../context/CartContext';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

const DELIVERY_FEE = 500;

export default function Cart({ navigation }: Props) {
  const { items, vendorName, total, count, addItem, removeItem } = useCart();

  if (count === 0) {
    return (
      <SafeAreaView style={styles.empty} edges={['bottom']}>
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
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.vendorLabel}>From: {vendorName}</Text>
        }
        ListFooterComponent={
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₦{total.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery fee</Text>
              <Text style={styles.summaryValue}>₦{DELIVERY_FEE.toLocaleString()}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₦{(total + DELIVERY_FEE).toLocaleString()}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardImage} />
            <View style={styles.cardInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>
              <Text style={styles.itemPrice}>₦{item.price.toLocaleString()}</Text>
            </View>
            <View style={styles.qtyControl}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => removeItem(item.id)}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyCount}>{item.qty}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => addItem({ id: item.id, name: item.name, description: item.description, price: item.price, vendorId: item.vendorId, vendorName: item.vendorName })}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate('Checkout')}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          <Text style={styles.checkoutTotal}>₦{(total + DELIVERY_FEE).toLocaleString()}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#6b7280' },

  list: { padding: 16, gap: 12 },
  vendorLabel: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 4 },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 1 },
  cardImage: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#f3f4f6', marginRight: 12 },
  cardInfo: { flex: 1 },
  itemName: { fontWeight: '700', fontSize: 14, marginBottom: 2 },
  itemDesc: { color: '#6b7280', fontSize: 12, marginBottom: 4 },
  itemPrice: { fontWeight: '700', color: '#0f766e' },

  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#0f766e', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: '#0f766e', fontSize: 16, lineHeight: 20 },
  qtyCount: { fontSize: 14, fontWeight: '700', minWidth: 16, textAlign: 'center' },

  summary: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 8, gap: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: '#6b7280', fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '500' },
  totalRow: { borderTopWidth: 1, borderColor: '#f3f4f6', paddingTop: 10, marginTop: 2 },
  totalLabel: { fontWeight: '700', fontSize: 16 },
  totalValue: { fontWeight: '700', fontSize: 16, color: '#0f766e' },

  footer: { paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#f3f4f6' },
  checkoutBtn: { backgroundColor: '#0f766e', borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 20, marginTop: 12 },
  checkoutText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  checkoutTotal: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
