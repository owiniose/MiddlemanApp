import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image,
} from 'react-native';

const logo = require('../../assets/icon.png');
import Text from '../../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

type Props = { onGoSignUp: () => void };

export default function LoginScreen({ onGoSignUp }: Props) {
  const { logIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    try {
      await logIn(email.trim(), password.trim());
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
        <Text style={styles.tagline}>Delivery at your doorstep</Text>
      </View>

      {/* White form card */}
      <KeyboardAvoidingView style={styles.cardWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.card} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Welcome back</Text>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@email.com"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Your password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Log In</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchBtn} onPress={onGoSignUp}>
            <Text style={styles.switchText}>
              Don't have an account? <Text style={styles.switchLink}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function friendlyError(code: string) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Invalid email or password.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
    default: return 'Something went wrong. Please try again.';
  }
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#fff' },

  header: { alignItems: 'center', paddingTop: 28, paddingBottom: 36, backgroundColor: '#fff' },
  logoImg: { width: 80, height: 80 },
  appName: { fontSize: 30, fontWeight: '800', color: '#1E22A3', marginTop: 10, letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: '#6b7280', marginTop: 4 },

  cardWrap: { flex: 1 },
  card: {
    flexGrow: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 28,
    padding: 28,
    paddingTop: 32,
  },

  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 24 },
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
  btn: { backgroundColor: '#1E22A3', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchBtn: { alignItems: 'center', marginTop: 24 },
  switchText: { color: '#6b7280', fontSize: 14 },
  switchLink: { color: '#1E22A3', fontWeight: '700' },
});
