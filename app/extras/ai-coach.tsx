import React, { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const API_BASE = `https://${process.env.EXPO_PUBLIC_API_URL}/api`;

const ACCENT = "#C4956A";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

const SUGGESTED_PROMPTS = [
  "What peptides help with energy and recovery?",
  "How can I improve my sleep quality?",
  "Which IV drip is best for skin glow?",
  "What does my burnout score mean?",
  "How do I start a longevity protocol?",
  "What should I eat for cellular repair?",
];

export default function AiCoachScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (auth.user && auth.token) {
      loadHistory();
    } else {
      setLoadingHistory(false);
    }
  }, [auth.user]);

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/coach/messages`, {
        headers: { "x-auth-token": auth.token! },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.messages.length > 0) setMessages(data.messages);
      }
    } catch {}
    setLoadingHistory(false);
  };

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    if (!auth.token) {
      Alert.alert("Sign In Required", "Please sign in to chat with your wellness coach.");
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      const res = await fetch(`${API_BASE}/coach/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": auth.token },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (res.ok) {
        const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: data.response };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "I'm having trouble responding. Please try again in a moment." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Connection error. Please check your network and try again." }]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const clearChat = async () => {
    if (!auth.token) return;
    try {
      await fetch(`${API_BASE}/coach/messages`, { method: "DELETE", headers: { "x-auth-token": auth.token } });
    } catch {}
    setMessages([]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: "#1a1a1a" }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
            <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Extras</Text>
          </Pressable>
          {messages.length > 0 && auth.token && (
            <Pressable onPress={clearChat} style={styles.clearBtn}>
              <Feather name="trash-2" size={15} color="rgba(255,255,255,0.5)" />
              <Text style={[{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "Lato_400Regular" }]}>Clear</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.coachRow}>
          <View style={[styles.coachAvatar, { backgroundColor: ACCENT }]}>
            <Feather name="cpu" size={20} color="#fff" />
          </View>
          <View>
            <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>POWERED BY CLAUDE AI</Text>
            <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>Wellness Coach</Text>
          </View>
        </View>
        <Text style={[styles.heroSub, { fontFamily: "Lato_300Light" }]}>
          Your personalised Dr. Khan AI — peptides, longevity &amp; regenerative medicine
        </Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 16, gap: 12 }}
        onContentSizeChange={scrollToBottom}
        keyboardShouldPersistTaps="handled"
      >
        {/* Auth gate */}
        {!auth.token && (
          <View style={[styles.authGate, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="lock" size={32} color={ACCENT} />
            <Text style={[styles.authTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              Members Only
            </Text>
            <Text style={[styles.authSub, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
              Sign in to access your personalised AI wellness coach, trained on Dr. Khan's protocols and enriched with your health data.
            </Text>
            <Pressable
              onPress={() => router.push("/extras/profile" as any)}
              style={[styles.authBtn, { backgroundColor: "#1a1a1a" }]}
            >
              <Text style={[{ color: "#fff", fontSize: 15, fontFamily: "Lato_700Bold" }]}>Sign In to Continue</Text>
            </Pressable>
          </View>
        )}

        {/* Welcome message */}
        {auth.user && messages.length === 0 && !loadingHistory && (
          <>
            <View style={[styles.welcomeCard, { backgroundColor: colors.card, borderColor: `${ACCENT}30` }]}>
              <Text style={[styles.welcomeTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
                Welcome, {auth.user.name?.split(" ")[0] || "Member"}
              </Text>
              <Text style={[styles.welcomeText, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
                I'm your personalised wellness coach, trained on Dr. Khan's regenerative medicine protocols. I have access to your health scores and can provide personalised guidance on peptides, IV therapy, longevity science, and more.
              </Text>
            </View>
            <Text style={[styles.suggestLabel, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>
              SUGGESTED QUESTIONS
            </Text>
            <View style={{ gap: 8 }}>
              {SUGGESTED_PROMPTS.map((p, i) => (
                <Pressable
                  key={i}
                  onPress={() => sendMessage(p)}
                  style={({ pressed }) => [styles.suggest, { backgroundColor: colors.secondary, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }]}
                >
                  <Feather name="message-square" size={13} color={ACCENT} />
                  <Text style={[styles.suggestText, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}>{p}</Text>
                  <Feather name="chevron-right" size={13} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Message bubbles */}
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.msgRow, msg.role === "user" && styles.msgRowUser]}>
            {msg.role === "assistant" && (
              <View style={[styles.msgAvatar, { backgroundColor: ACCENT }]}>
                <Feather name="cpu" size={12} color="#fff" />
              </View>
            )}
            <View
              style={[
                styles.bubble,
                msg.role === "user"
                  ? [styles.bubbleUser, { backgroundColor: "#1a1a1a" }]
                  : [styles.bubbleAssistant, { backgroundColor: colors.card, borderColor: colors.border }],
              ]}
            >
              <Text style={[
                styles.bubbleText,
                { color: msg.role === "user" ? "#fff" : colors.foreground, fontFamily: "Lato_400Regular" },
              ]}>
                {msg.content}
              </Text>
            </View>
          </View>
        ))}

        {/* Loading indicator */}
        {loading && (
          <View style={styles.msgRow}>
            <View style={[styles.msgAvatar, { backgroundColor: ACCENT }]}>
              <Feather name="cpu" size={12} color="#fff" />
            </View>
            <View style={[styles.bubble, styles.bubbleAssistant, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                <ActivityIndicator size="small" color={ACCENT} />
                <Text style={[{ color: colors.warmGray, fontSize: 13, fontFamily: "Lato_300Light" }]}>Thinking...</Text>
              </View>
            </View>
          </View>
        )}

        {/* Disclaimer */}
        {messages.length > 2 && (
          <Text style={[styles.disclaimer, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>
            AI guidance is informational only. Always consult the clinic before starting any protocol.
          </Text>
        )}
      </ScrollView>

      {/* Input bar */}
      {auth.user && (
        <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: bottomPad + 8 }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about peptides, longevity, skin..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.textInput, { color: colors.foreground, backgroundColor: colors.secondary, fontFamily: "Lato_400Regular" }]}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
          />
          <Pressable
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={({ pressed }) => [
              styles.sendBtn,
              { backgroundColor: input.trim() && !loading ? "#1a1a1a" : colors.secondary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="send" size={18} color={input.trim() && !loading ? "#fff" : colors.mutedForeground} />
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 18 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  clearBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  coachRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  coachAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  heroLabel: { color: "rgba(255,255,255,0.45)", fontSize: 9, letterSpacing: 2 },
  heroTitle: { color: "#fff", fontSize: 28, lineHeight: 30 },
  heroSub: { color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 17 },
  authGate: { borderRadius: 20, borderWidth: 1, padding: 28, alignItems: "center", gap: 14, marginTop: 20 },
  authTitle: { fontSize: 30 },
  authSub: { fontSize: 14, lineHeight: 20, textAlign: "center" },
  authBtn: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 50 },
  welcomeCard: { borderRadius: 18, borderWidth: 1, padding: 18, gap: 8 },
  welcomeTitle: { fontSize: 26 },
  welcomeText: { fontSize: 13, lineHeight: 20 },
  suggestLabel: { fontSize: 10, letterSpacing: 2, marginTop: 4 },
  suggest: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  suggestText: { flex: 1, fontSize: 14 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  msgRowUser: { flexDirection: "row-reverse" },
  msgAvatar: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  bubble: { maxWidth: "80%", borderRadius: 18, padding: 12 },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleAssistant: { borderWidth: 1, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  disclaimer: { textAlign: "center", fontSize: 11, lineHeight: 16, marginTop: 4 },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 10, padding: 12, paddingHorizontal: 16, borderTopWidth: 1 },
  textInput: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", flexShrink: 0 },
});
