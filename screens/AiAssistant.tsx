import React, { useState, useRef, useEffect } from 'react';
import {
  View, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { GEMINI_API_KEY } from '../config/ai';
import { useAuth } from '../context/AuthContext';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type Vendor = { id: string; name: string; category: string; area: string; rating: string; open?: boolean };
type MenuItem = { vendorId: string; name: string; description: string; price: number; section: string };

const SUGGESTIONS = [
  "What should I eat tonight? 🍽️",
  "Find me a pharmacy nearby 💊",
  "I need groceries 🛒",
  "How do I track my order? 📦",
  "What shops are open now? 🏪",
  "Surprise me!",
];

function buildSystemPrompt(vendors: Vendor[], menuItems: MenuItem[], firstName: string): string {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  const vendorList = vendors.length
    ? vendors.map((v) => {
        const status = v.open === false ? ' — CLOSED' : '';
        const items = menuItems.filter((m) => m.vendorId === v.id);
        const itemLines = items.length
          ? items.map((m) => `    • ${m.name} — ₦${m.price.toLocaleString()}${m.description ? ` (${m.description})` : ''}`).join('\n')
          : '    (No items listed yet)';
        return `🏪 ${v.name}${status} | ${v.category} | ${v.area} | ⭐${v.rating}\n${itemLines}`;
      }).join('\n\n')
    : 'No vendors available yet.';

  return `You are Mido, a friendly and knowledgeable assistant for Middleman — a delivery app. ${firstName ? `The user's name is ${firstName}.` : ''}

It's ${timeOfDay} right now. Middleman delivers across four categories:
- 🍽️ Restaurants — food and meals
- 🛒 Shops — groceries, everyday essentials, household items
- 💊 Pharmacies — medicines, health and wellness products
- 📦 Packages — courier and parcel delivery

You can help users with:
- Finding the right vendor or item across any category
- Recommending what to order based on their needs or mood
- Explaining how the app works (placing orders, tracking, ratings, payment)
- Answering questions about vendors, delivery times, and pricing
- General shopping or errand advice

Here are all the available vendors and their items:

${vendorList}

Guidelines:
- Keep responses short, warm, and conversational (2–4 sentences max)
- Recommend specific items and prices from the listings above
- Only suggest vendors that are open (not marked CLOSED)
- Help with any question related to the app or its categories — not just food
- Use occasional relevant emojis to keep it friendly ✨
- Never make up vendors or items not listed above
- If asked something completely unrelated to the app or shopping, gently redirect`;
}

async function callGemini(
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt: string,
): Promise<string> {
  // Gemini uses "model" instead of "assistant"
  const contents = messages.map(({ role, content }) => ({
    role: role === 'assistant' ? 'model' : 'user',
    parts: [{ text: content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 512, temperature: 0.9 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sorry, I could not generate a response.';
}

export default function AiAssistant({ onClose }: { onClose?: () => void }) {
  const { profile } = useAuth();
  const firstName = profile?.name?.split(' ')[0] ?? '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    Promise.all([
      getDocs(collection(db, 'vendors')),
      getDocs(collection(db, 'menuItems')),
    ]).then(([vendorSnap, menuSnap]) => {
      setVendors(vendorSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Vendor)));
      setMenuItems(menuSnap.docs.map((d) => d.data() as MenuItem));
    });
  }, []);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const history = nextMessages.map(({ role, content }) => ({ role, content }));
      const reply = await callGemini(history, buildSystemPrompt(vendors, menuItems, firstName));
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: reply },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: `Error: ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>✨</Text>
          </View>
          <View>
            <Text style={styles.headerName}>Mido</Text>
            <Text style={styles.headerSub}>Your Middleman assistant</Text>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>✨</Text>
            <Text style={styles.emptyTitle}>Hi{firstName ? `, ${firstName}` : ''}! I'm Mido</Text>
            <Text style={styles.emptySub}>Ask me anything — food, shops, pharmacies, packages, or how the app works.</Text>
            <View style={styles.suggestionsGrid}>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => sendMessage(s)}>
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
                <Text style={[styles.bubbleText, item.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAi]}>
                  {item.content}
                </Text>
              </View>
            )}
            ListFooterComponent={
              loading ? (
                <View style={styles.typingIndicator}>
                  <ActivityIndicator size="small" color="#0f766e" />
                  <Text style={styles.typingText}>Mido is thinking...</Text>
                </View>
              ) : null
            }
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything..."
            placeholderTextColor="#9ca3af"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderColor: '#f3f4f6',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#bbf7d0',
  },
  avatarText: { fontSize: 20 },
  headerName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerSub: { fontSize: 12, color: '#6b7280' },

  emptyState: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 40, gap: 8 },
  emptyEmoji: { fontSize: 52, marginBottom: 4 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  emptySub: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  suggestionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 16 },
  suggestionChip: {
    backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  suggestionText: { fontSize: 13, color: '#065f46', fontWeight: '600' },

  messageList: { padding: 16, gap: 10 },
  bubble: { maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser: { backgroundColor: '#0f766e', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleAi: { backgroundColor: '#f3f4f6', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: '#fff' },
  bubbleTextAi: { color: '#111827' },

  typingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  typingText: { color: '#9ca3af', fontSize: 13 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderColor: '#f3f4f6', backgroundColor: '#fff',
  },
  input: {
    flex: 1, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, color: '#111827', maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#0f766e', alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#d1d5db' },
  sendBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
});
