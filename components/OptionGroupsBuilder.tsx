import React from 'react';
import {
  View, TextInput, TouchableOpacity, Switch, StyleSheet,
} from 'react-native';
import Text from './Text';
import { OptionGroup, OptionChoice } from '../context/CartContext';

type Props = {
  groups: OptionGroup[];
  onChange: (groups: OptionGroup[]) => void;
};

export default function OptionGroupsBuilder({ groups, onChange }: Props) {
  const addGroup = () => {
    onChange([...groups, { name: '', required: false, multiSelect: false, choices: [] }]);
  };

  const removeGroup = (gi: number) => {
    onChange(groups.filter((_, i) => i !== gi));
  };

  const updateGroup = (gi: number, patch: Partial<OptionGroup>) => {
    onChange(groups.map((g, i) => i === gi ? { ...g, ...patch } : g));
  };

  const addChoice = (gi: number) => {
    const updated = groups.map((g, i) =>
      i === gi ? { ...g, choices: [...g.choices, { name: '', price: 0 }] } : g,
    );
    onChange(updated);
  };

  const removeChoice = (gi: number, ci: number) => {
    const updated = groups.map((g, i) =>
      i === gi ? { ...g, choices: g.choices.filter((_, j) => j !== ci) } : g,
    );
    onChange(updated);
  };

  const updateChoice = (gi: number, ci: number, patch: Partial<OptionChoice>) => {
    const updated = groups.map((g, i) =>
      i === gi
        ? { ...g, choices: g.choices.map((c, j) => j === ci ? { ...c, ...patch } : c) }
        : g,
    );
    onChange(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Customization Options</Text>
        <Text style={styles.sectionHint}>e.g. Size, Toppings, Crust</Text>
      </View>

      {groups.map((group, gi) => (
        <View key={gi} style={styles.groupCard}>
          <View style={styles.groupHeaderRow}>
            <TextInput
              style={styles.groupNameInput}
              value={group.name}
              onChangeText={(t) => updateGroup(gi, { name: t })}
              placeholder="Group name (e.g. Size)"
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity onPress={() => removeGroup(gi)} style={styles.removeGroupBtn}>
              <Text style={styles.removeGroupText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggle}>
              <Text style={styles.toggleLabel}>Required</Text>
              <Switch
                value={group.required}
                onValueChange={(v) => updateGroup(gi, { required: v })}
                trackColor={{ true: '#1E22A3', false: '#d1d5db' }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.toggle}>
              <Text style={styles.toggleLabel}>Multi-select</Text>
              <Switch
                value={group.multiSelect}
                onValueChange={(v) => updateGroup(gi, { multiSelect: v })}
                trackColor={{ true: '#1E22A3', false: '#d1d5db' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {group.choices.length > 0 && (
            <View style={styles.choicesHeader}>
              <Text style={styles.choicesLabel}>Choice</Text>
              <Text style={styles.choicesPriceLabel}>Extra (₦)</Text>
            </View>
          )}

          {group.choices.map((choice, ci) => (
            <View key={ci} style={styles.choiceRow}>
              <TextInput
                style={styles.choiceNameInput}
                value={choice.name}
                onChangeText={(t) => updateChoice(gi, ci, { name: t })}
                placeholder="e.g. Large"
                placeholderTextColor="#9ca3af"
              />
              <TextInput
                style={styles.choicePriceInput}
                value={choice.price === 0 ? '' : String(choice.price)}
                onChangeText={(t) => updateChoice(gi, ci, { price: Number(t) || 0 })}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
              <TouchableOpacity onPress={() => removeChoice(gi, ci)} style={styles.removeChoiceBtn}>
                <Text style={styles.removeChoiceText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity onPress={() => addChoice(gi)} style={styles.addChoiceBtn}>
            <Text style={styles.addChoiceBtnText}>+ Add Choice</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity onPress={addGroup} style={styles.addGroupBtn}>
        <Text style={styles.addGroupBtnText}>+ Add Option Group</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  sectionHeader: { marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  sectionHint: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  groupCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  groupHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  groupNameInput: { flex: 1, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, color: '#111827' },
  removeGroupBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },
  removeGroupText: { color: '#ef4444', fontSize: 13, fontWeight: '700' },

  toggleRow: { flexDirection: 'row', gap: 20, marginBottom: 12 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleLabel: { fontSize: 13, color: '#374151' },

  choicesHeader: { flexDirection: 'row', paddingHorizontal: 2, marginBottom: 4 },
  choicesLabel: { flex: 1, fontSize: 11, fontWeight: '600', color: '#9ca3af' },
  choicesPriceLabel: { width: 72, fontSize: 11, fontWeight: '600', color: '#9ca3af', textAlign: 'center' },

  choiceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  choiceNameInput: { flex: 1, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, fontSize: 13, color: '#111827' },
  choicePriceInput: { width: 72, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, fontSize: 13, color: '#111827', textAlign: 'center' },
  removeChoiceBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },
  removeChoiceText: { color: '#ef4444', fontSize: 12, fontWeight: '700' },

  addChoiceBtn: { alignSelf: 'flex-start', marginTop: 2 },
  addChoiceBtnText: { color: '#1E22A3', fontSize: 13, fontWeight: '600' },

  addGroupBtn: { borderWidth: 1.5, borderColor: '#1E22A3', borderStyle: 'dashed', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  addGroupBtnText: { color: '#1E22A3', fontWeight: '700', fontSize: 14 },
});
