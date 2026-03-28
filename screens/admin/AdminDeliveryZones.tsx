import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import Text from '../../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { DeliveryZone } from '../../utils/deliveryFee';
import { Ionicons } from '@expo/vector-icons';

type Config = {
  zones: DeliveryZone[];
  defaultFee: number;
  defaultZoneName: string;
};

export default function AdminDeliveryZones() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'settings', 'deliveryZones')).then((snap) => {
      if (snap.exists()) setConfig(snap.data() as Config);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'deliveryZones'), config);
      Alert.alert('Saved', 'Delivery zones updated successfully.');
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateZoneName = (i: number, name: string) => {
    setConfig((c) => {
      if (!c) return c;
      const zones = [...c.zones];
      zones[i] = { ...zones[i], name };
      return { ...c, zones };
    });
  };

  const updateZoneFee = (i: number, fee: string) => {
    setConfig((c) => {
      if (!c) return c;
      const zones = [...c.zones];
      zones[i] = { ...zones[i], fee: parseInt(fee) || 0 };
      return { ...c, zones };
    });
  };

  const updateKeywords = (i: number, text: string) => {
    setConfig((c) => {
      if (!c) return c;
      const zones = [...c.zones];
      zones[i] = { ...zones[i], keywords: text.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean) };
      return { ...c, zones };
    });
  };

  const addZone = () => {
    setConfig((c) => {
      if (!c) return c;
      return { ...c, zones: [...c.zones, { name: 'New Zone', fee: 0, keywords: [] }] };
    });
  };

  const removeZone = (i: number) => {
    Alert.alert('Remove Zone', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: () => setConfig((c) => {
          if (!c) return c;
          const zones = c.zones.filter((_, idx) => idx !== i);
          return { ...c, zones };
        }),
      },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0f766e" /></View>;
  if (!config) return <View style={styles.center}><Text>Failed to load config.</Text></View>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerBar}>
        <Text style={styles.header}>Delivery Zones</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.hint}>
          Zones are checked top to bottom — put more specific zones first. Keywords are comma-separated area names/road names.
        </Text>

        {config.zones.map((zone, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.zoneNumber}>Zone {i + 1}</Text>
              <TouchableOpacity onPress={() => removeZone(i)}>
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Zone Name</Text>
            <TextInput
              style={styles.input}
              value={zone.name}
              onChangeText={(t) => updateZoneName(i, t)}
              placeholder="e.g. City Centre"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Delivery Fee (₦)</Text>
            <TextInput
              style={styles.input}
              value={String(zone.fee)}
              onChangeText={(t) => updateZoneFee(i, t)}
              keyboardType="number-pad"
              placeholder="e.g. 1000"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Keywords (comma-separated)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={zone.keywords.join(', ')}
              onChangeText={(t) => updateKeywords(i, t)}
              placeholder="e.g. use app plaza, itu road, oron road"
              placeholderTextColor="#9ca3af"
              multiline
            />
          </View>
        ))}

        {/* Default fallback */}
        <View style={styles.card}>
          <Text style={styles.cardHeader2}>Default (no zone matched)</Text>
          <Text style={styles.label}>Zone Name</Text>
          <TextInput
            style={styles.input}
            value={config.defaultZoneName}
            onChangeText={(t) => setConfig((c) => c ? { ...c, defaultZoneName: t } : c)}
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.label}>Delivery Fee (₦)</Text>
          <TextInput
            style={styles.input}
            value={String(config.defaultFee)}
            onChangeText={(t) => setConfig((c) => c ? { ...c, defaultFee: parseInt(t) || 0 } : c)}
            keyboardType="number-pad"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={addZone}>
          <Ionicons name="add-circle-outline" size={18} color="#0f766e" />
          <Text style={styles.addBtnText}>Add Zone</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f3f4f6',
  },
  header: { fontSize: 20, fontWeight: '700', color: '#111827' },
  saveBtn: { backgroundColor: '#0f766e', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  scroll: { padding: 16, gap: 12 },
  hint: { fontSize: 13, color: '#6b7280', lineHeight: 19, marginBottom: 4 },

  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 6, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  zoneNumber: { fontSize: 13, fontWeight: '700', color: '#0f766e', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardHeader2: { fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },

  label: { fontSize: 12, fontWeight: '600', color: '#374151', marginTop: 4 },
  input: {
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 10, padding: 10, fontSize: 14, color: '#111827',
  },
  inputMultiline: { minHeight: 70, textAlignVertical: 'top' },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 14, borderRadius: 14, borderWidth: 1.5,
    borderColor: '#0f766e', borderStyle: 'dashed',
  },
  addBtnText: { color: '#0f766e', fontWeight: '700', fontSize: 14 },
});
