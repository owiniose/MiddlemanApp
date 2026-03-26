import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

const DELIVERY_FEE = 500;

const PAYMENT_METHODS = ['Cash on Delivery', 'Bank Transfer', 'Card'];

export default function Checkout({ navigation }: Props) {
  const { items, vendorId, vendorName, total, clearCart } = useCart();
  const { addOrder } = useOrders();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [payment, setPayment] = useState('Cash on Delivery');
  const [errors, setErrors] = useState<{ address?: string; phone?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!address.trim()) e.address = 'Delivery address is required';
    if (!phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\+?[\d\s-]{7,15}$/.test(phone.trim())) e.phone = 'Enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = () => {
    if (!validate()) return;
    const orderId = addOrder({
      vendorId: vendorId!,
      vendorName: vendorName!,
      items,
      subtotal: total,
      deliveryFee: DELIVERY_FEE,
      total: total + DELIVERY_FEE,
      address: address.trim(),
      phone: phone.trim(),
    });
    clearCart();
    navigation.replace('OrderConfirmation', {
      orderId,
      vendorName: vendorName!,
      total: total + DELIVERY_FEE,
    });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Delivery details */}
        <Text style={styles.sectionTitle}>Delivery Details</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, errors.address ? styles.inputError : null]}
            placeholder="Enter your delivery address"
            placeholderTextColor="#9ca3af"
            value={address}
            onChangeText={(t) => { setAddress(t); setErrors((e) => ({ ...e, address: undefined })); }}
            multiline
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, errors.phone ? styles.inputError : null]}
            placeholder="e.g. 08012345678"
            placeholderTextColor="#9ca3af"
            value={phone}
            onChangeText={(t) => { setPhone(t); setErrors((e) => ({ ...e, phone: undefined })); }}
            keyboardType="phone-pad"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        {/* Payment method */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method}
            style={styles.paymentOption}
            onPress={() => setPayment(method)}
          >
            <View style={[styles.radio, payment === method && styles.radioSelected]} />
            <Text style={styles.paymentLabel}>{method}</Text>
          </TouchableOpacity>
        ))}

        {/* Order summary */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.vendorName}>{vendorName}</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.summaryRow}>
              <Text style={styles.summaryItem}>{item.qty}× {item.name}</Text>
              <Text style={styles.summaryPrice}>₦{(item.price * item.qty).toLocaleString()}</Text>
            </View>
          ))}
          <View style={styles.divider} />
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

        <View style={{ height: 24 }} />
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <TouchableOpacity style={styles.placeOrderBtn} onPress={placeOrder}>
          <Text style={styles.placeOrderText}>Place Order · ₦{(total + DELIVERY_FEE).toLocaleString()}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { padding: 16 },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 8 },

  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827' },
  inputError: { borderColor: '#ef4444' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },

  paymentOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, gap: 12 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#d1d5db' },
  radioSelected: { borderColor: '#0f766e', backgroundColor: '#0f766e' },
  paymentLabel: { fontSize: 14, color: '#111827' },

  summaryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 8 },
  vendorName: { fontWeight: '700', fontSize: 14, marginBottom: 4, color: '#0f766e' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryItem: { fontSize: 13, color: '#374151', flex: 1 },
  summaryPrice: { fontSize: 13, fontWeight: '500' },
  summaryLabel: { fontSize: 13, color: '#6b7280' },
  summaryValue: { fontSize: 13 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 4 },
  totalRow: { borderTopWidth: 1, borderColor: '#f3f4f6', paddingTop: 8 },
  totalLabel: { fontWeight: '700', fontSize: 15 },
  totalValue: { fontWeight: '700', fontSize: 15, color: '#0f766e' },

  footer: { paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#f3f4f6' },
  placeOrderBtn: { backgroundColor: '#0f766e', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 12 },
  placeOrderText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
