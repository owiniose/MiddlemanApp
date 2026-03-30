import React, { useState } from 'react';
import {
  View, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import Text from '../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../context/ProfileContext';

export default function ManageAddresses() {
  const { addresses, addAddress, removeAddress } = useProfile();
  const [modalVisible, setModalVisible] = useState(false);
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<{ label?: string; address?: string }>({});

  const openModal = () => {
    setLabel('');
    setAddress('');
    setErrors({});
    setModalVisible(true);
  };

  const handleAdd = () => {
    const e: typeof errors = {};
    if (!label.trim()) e.label = 'Label is required (e.g. Home, Work)';
    if (!address.trim()) e.address = 'Address is required';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    addAddress(label.trim(), address.trim());
    setModalVisible(false);
  };

  const handleRemove = (id: string) => {
    Alert.alert('Remove Address', 'Delete this saved address?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeAddress(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={addresses}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.emptySubtitle}>Add an address to speed up checkout</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <Ionicons name={item.label.toLowerCase() === 'home' ? 'home' : item.label.toLowerCase() === 'work' ? 'briefcase' : 'location'} size={20} color="#1E22A3" />
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>{item.label}</Text>
              <Text style={styles.addressText}>{item.address}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn} onPress={openModal}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add New Address</Text>
        </TouchableOpacity>
      </View>

      {/* Add address modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Address</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Label</Text>
            <TextInput
              style={[styles.input, errors.label ? styles.inputError : null]}
              placeholder="e.g. Home, Work, Other"
              placeholderTextColor="#9ca3af"
              value={label}
              onChangeText={(t) => { setLabel(t); setErrors((e) => ({ ...e, label: undefined })); }}
            />
            {errors.label ? <Text style={styles.errorText}>{errors.label}</Text> : null}

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Address</Text>
            <TextInput
              style={[styles.input, styles.inputMulti, errors.address ? styles.inputError : null]}
              placeholder="Enter full address"
              placeholderTextColor="#9ca3af"
              value={address}
              onChangeText={(t) => { setAddress(t); setErrors((e) => ({ ...e, address: undefined })); }}
              multiline
            />
            {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}

            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
              <Text style={styles.saveBtnText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 16, gap: 10, flexGrow: 1 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptySubtitle: { fontSize: 13, color: '#9ca3af', textAlign: 'center' },

  addressCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, elevation: 1 },
  addressIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eef0ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  addressInfo: { flex: 1 },
  addressLabel: { fontWeight: '700', fontSize: 14, color: '#111827' },
  addressText: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  deleteBtn: { padding: 8 },

  footer: { padding: 16, paddingBottom: 12 },
  addBtn: { backgroundColor: '#1E22A3', borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827' },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  inputError: { borderColor: '#ef4444' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  saveBtn: { backgroundColor: '#1E22A3', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
