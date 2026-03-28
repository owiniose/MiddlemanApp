import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import Text from '../../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { VendorStackParamList } from '../../types/navigation';
import ImagePickerField from '../../components/ImagePickerField';
import OptionGroupsBuilder from '../../components/OptionGroupsBuilder';
import { OptionGroup } from '../../context/CartContext';

type Props = NativeStackScreenProps<VendorStackParamList, 'VendorAddItem'>;

export default function VendorAddItem({ navigation }: Props) {
  const { profile } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [section, setSection] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [options, setOptions] = useState<OptionGroup[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Item name is required';
    if (!description.trim()) e.description = 'Description is required';
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) e.price = 'Enter a valid price';
    if (!section.trim()) e.section = 'Section/category is required (e.g. Popular, Drinks)';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, 'menuItems'), {
        vendorId: profile?.vendorId,
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        section: section.trim(),
        image: imageUrl ?? null,
        options: options.filter((g) => g.name.trim() && g.choices.length > 0),
        available: true,
        createdAt: serverTimestamp(),
      });
      navigation.goBack();
    } catch {
      setErrors({ general: 'Failed to save. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {errors.general ? <View style={styles.errorBox}><Text style={styles.errorText}>{errors.general}</Text></View> : null}

        <View style={styles.imageSection}>
          <ImagePickerField
            value={imageUrl}
            onChange={setImageUrl}
            width={200}
            height={150}
            aspect={[4, 3]}
          />
        </View>

        <Field label="Item Name" value={name} onChangeText={setName} placeholder="e.g. Jollof Rice + Chicken" error={errors.name} />
        <Field label="Description" value={description} onChangeText={setDescription} placeholder="Short description of the item" multiline error={errors.description} />
        <Field label="Price (₦)" value={price} onChangeText={setPrice} placeholder="e.g. 1800" keyboardType="numeric" error={errors.price} />
        <Field label="Section" value={section} onChangeText={setSection} placeholder="e.g. Popular, Sides, Drinks" error={errors.section} />

        <View style={styles.divider} />
        <OptionGroupsBuilder groups={options} onChange={setOptions} />

        <View style={{ height: 24 }} />
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Item</Text>}
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, error, ...props }: { label: string; error?: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, props.multiline && styles.inputMulti, error ? styles.inputError : null]}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { padding: 16 },
  imageSection: { alignItems: 'center', marginBottom: 20 },
  errorBox: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#dc2626', fontSize: 13 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827' },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  inputError: { borderColor: '#ef4444' },
  fieldError: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 20 },
  footer: { paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#f3f4f6' },
  saveBtn: { backgroundColor: '#0f766e', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
