import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image,
} from 'react-native';

const logo = require('../../assets/icon.png');
import Text from '../../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, UserRole, VendorStoreInfo } from '../../context/AuthContext';

type Props = { onGoLogin: () => void };

const CATEGORIES = ['Restaurants', 'Shops', 'Pharmacies', 'Packages'];

export default function SignUpScreen({ onGoLogin }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');

  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('Restaurants');
  const [area, setArea] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim()) return 'Name is required.';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return 'Enter a valid email.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (role === 'vendor') {
      if (!storeName.trim()) return 'Store name is required.';
      if (!area.trim()) return 'Store location is required.';
    }
    return null;
  };

  const handleSignUp = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const storeInfo: VendorStoreInfo | undefined = role === 'vendor'
        ? { storeName: storeName.trim(), category, area: area.trim(), deliveryTime: deliveryTime.trim() || '30–45 min' }
        : undefined;
      await signUp(email.trim(), password, name.trim(), role, storeInfo);
    } catch (e: any) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.outer} edges={['top']}>
      {/* Teal header */}
      <View style={styles.header}>
        <Image source={logo} style={styles.logoImg} resizeMode="contain" />
        <Text style={styles.appName}>Middleman</Text>
        <Text style={styles.tagline}>Join thousands of happy customers</Text>
      </View>

      {/* White form card */}
      <KeyboardAvoidingView style={styles.cardWrap} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
        <ScrollView contentContainerStyle={styles.card} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create an account</Text>

          <Text style={styles.label}>I am a...</Text>
          <View style={styles.roleRow}>
            {(['customer', 'vendor'] as UserRole[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                onPress={() => setRole(r)}
              >
                <Text style={styles.roleEmoji}>{r === 'customer' ? '🛒' : '🍽️'}</Text>
                <Text style={[styles.roleLabel, role === r && styles.roleLabelActive]}>
                  {r === 'customer' ? 'Customer' : 'Vendor'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} placeholder="e.g. Chidi Okeke" placeholderTextColor="#9ca3af" value={name} onChangeText={setName} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="you@email.com" placeholderTextColor="#9ca3af" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder="Min. 6 characters" placeholderTextColor="#9ca3af" value={password} onChangeText={setPassword} secureTextEntry />

          {role === 'vendor' && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Set Up Your Store</Text>

              <Text style={styles.label}>Store Name</Text>
              <TextInput style={styles.input} placeholder="e.g. Mama Titi's Kitchen" placeholderTextColor="#9ca3af" value={storeName} onChangeText={setStoreName} />

              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.categoryBtnText, category === cat && styles.categoryBtnTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Location / Area</Text>
              <TextInput style={styles.input} placeholder="e.g. Ikorodu, Lagos" placeholderTextColor="#9ca3af" value={area} onChangeText={setArea} />

              <Text style={styles.label}>Delivery Time (optional)</Text>
              <TextInput style={styles.input} placeholder="e.g. 30–45 min" placeholderTextColor="#9ca3af" value={deliveryTime} onChangeText={setDeliveryTime} />
            </>
          )}

          <TouchableOpacity style={styles.btn} onPress={handleSignUp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchBtn} onPress={onGoLogin}>
            <Text style={styles.switchText}>
              Already have an account? <Text style={styles.switchLink}>Log In</Text>
            </Text>
          </TouchableOpacity>

          <View style={{ height: 16 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function friendlyError(code: string) {
  switch (code) {
    case 'auth/email-already-in-use': return 'An account with this email already exists.';
    case 'auth/weak-password': return 'Password is too weak.';
    default: return 'Something went wrong. Please try again.';
  }
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#fff' },

  header: { alignItems: 'center', paddingTop: 20, paddingBottom: 28, backgroundColor: '#fff' },
  logoImg: { width: 80, height: 80 },
  appName: { fontSize: 28, fontWeight: '800', color: '#1E22A3', marginTop: 8, letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: '#6b7280', marginTop: 4 },

  cardWrap: { flex: 1 },
  card: {
    flexGrow: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: 28,
    paddingTop: 32,
  },

  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 20 },
  errorBox: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#dc2626', fontSize: 13 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#111827',
    marginBottom: 16,
  },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBtn: { flex: 1, borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, padding: 14, alignItems: 'center', gap: 6, backgroundColor: '#f9fafb' },
  roleBtnActive: { borderColor: '#1E22A3', backgroundColor: '#eef0ff' },
  roleEmoji: { fontSize: 26 },
  roleLabel: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  roleLabelActive: { color: '#1E22A3' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  categoryBtn: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#f9fafb' },
  categoryBtnActive: { borderColor: '#1E22A3', backgroundColor: '#eef0ff' },
  categoryBtnText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  categoryBtnTextActive: { color: '#1E22A3' },
  btn: { backgroundColor: '#1E22A3', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchBtn: { alignItems: 'center', marginTop: 24 },
  switchText: { color: '#6b7280', fontSize: 14 },
  switchLink: { color: '#1E22A3', fontWeight: '700' },
});
