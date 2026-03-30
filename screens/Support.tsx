import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import Text from '../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const FAQS = [
  {
    q: 'How do I track my order?',
    a: 'Go to the Orders tab and tap on your active order to see the live status tracker.',
  },
  {
    q: 'Can I cancel an order?',
    a: 'Yes — you can cancel an order while it is still in "Preparing" status. Once it moves to "On the way" cancellation is no longer available.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Delivery times vary by vendor, typically between 20–90 minutes. You can see the estimated time on each vendor\'s page.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We currently accept Cash on Delivery, Bank Transfer, and Card payments.',
  },
  {
    q: 'How do I save a delivery address?',
    a: 'Go to Profile → Saved Addresses and add as many addresses as you need. They will be available to select at checkout.',
  },
  {
    q: 'What if an item is missing from my order?',
    a: 'Contact us via the form below or call our support line and we will resolve it as quickly as possible.',
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity style={styles.faqItem} onPress={() => setOpen((o) => !o)} activeOpacity={0.7}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#9ca3af" />
      </View>
      {open && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
}

export default function Support() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!name.trim() || !message.trim()) {
      Alert.alert('Missing info', 'Please fill in your name and message.');
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setName('');
      setMessage('');
      Alert.alert('Message Sent', 'We\'ll get back to you within 24 hours.');
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.header}>Support</Text>

          {/* Contact cards */}
          <View style={styles.contactRow}>
            <View style={styles.contactCard}>
              <Ionicons name="call-outline" size={22} color="#1E22A3" />
              <Text style={styles.contactLabel}>Call Us</Text>
              <Text style={styles.contactValue}>0800-MIDDLEMAN</Text>
            </View>
            <View style={styles.contactCard}>
              <Ionicons name="mail-outline" size={22} color="#1E22A3" />
              <Text style={styles.contactLabel}>Email Us</Text>
              <Text style={styles.contactValue}>help@middleman.ng</Text>
            </View>
          </View>

          {/* FAQ */}
          <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>
          <View style={styles.faqCard}>
            {FAQS.map((faq, i) => (
              <React.Fragment key={i}>
                <FaqItem question={faq.q} answer={faq.a} />
                {i < FAQS.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>

          {/* Contact form */}
          <Text style={styles.sectionLabel}>Send Us a Message</Text>
          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Chidi Okeke"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />
            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Message</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Describe your issue or question..."
              placeholderTextColor="#9ca3af"
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity style={[styles.sendBtn, sending && styles.sendBtnDisabled]} onPress={handleSend} disabled={sending}>
              <Text style={styles.sendBtnText}>{sending ? 'Sending...' : 'Send Message'}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { padding: 16 },
  header: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 16 },

  contactRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  contactCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 6, elevation: 1 },
  contactLabel: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  contactValue: { fontSize: 12, fontWeight: '700', color: '#111827', textAlign: 'center' },

  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, marginLeft: 4 },

  faqCard: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 20, elevation: 1 },
  faqItem: { padding: 16 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  faqQuestion: { fontSize: 14, fontWeight: '600', color: '#111827', flex: 1 },
  faqAnswer: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginTop: 10 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 16 },

  formCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, elevation: 1, marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827' },
  inputMulti: { minHeight: 100, textAlignVertical: 'top', marginBottom: 4 },
  sendBtn: { backgroundColor: '#1E22A3', borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 12 },
  sendBtnDisabled: { opacity: 0.6 },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
