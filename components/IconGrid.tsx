import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import Text from './Text';

type Item = { id: string; label: string; icon?: ImageSourcePropType };

export default function IconGrid({ items, onPress }: { items: Item[]; onPress?: (label: string) => void }) {
  return (
    <View style={styles.grid}>
      {items.map((it) => (
        <TouchableOpacity key={it.id} style={styles.cell} onPress={() => onPress?.(it.label)}>
          <View style={styles.iconPlaceholder}>
            {it.icon ? <Image source={it.icon} style={styles.iconImage} resizeMode="contain" /> : null}
          </View>
          <Text style={styles.label}>{it.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cell: { width: '25%', alignItems: 'center', marginBottom: 12, backgroundColor: '#fff', padding: 6, borderRadius: 10 },
  iconPlaceholder: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f3f4f6', marginBottom: 8, alignItems: 'center', justifyContent: 'center' },
  iconImage: { width: 60, height: 60 },
  label: { fontSize: 14, color: '#111' },
});