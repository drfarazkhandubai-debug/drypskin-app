import React, { useEffect, useRef, useState } from "react";
import {
  Animated, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
const ACCENT = "#4A5B8A";

const PROTOCOLS = [
  { id: "16:8", label: "16:8 Fasting", hours: 16, desc: "16 hours fast, 8-hour eating window. Most popular longevity protocol.", icon: "clock", color: "#4A5B8A" },
  { id: "18:6", label: "18:6 Extended", hours: 18, desc: "Enhanced autophagy activation and deeper cellular repair.", icon: "zap", color: "#8A5A7A" },
  { id: "omad", label: "OMAD", hours: 23, desc: "One Meal A Day — maximum metabolic flexibility and autophagy.", icon: "target", color: "#5C7A6B" },
  { id: "5:2", label: "5:2 Protocol", hours: 36, desc: "5 normal days + 2 very low calorie days per week.", icon: "calendar", color: "#C4956A" },
];

const IV_RECS: Record<string, { name: string; reason: string }[]> = {
  "16:8": [{ name: "IV Electrolyte Boost", reason: "Replenish minerals during your eating window" }],
  "18:6": [{ name: "IV NAD+ Infusion", reason: "Amplify autophagy benefits during extended fast" }, { name: "IV Magnesium Drip", reason: "Prevent muscle cramps and support energy" }],
  "omad": [{ name: "IV Myers' Cocktail", reason: "Replace essential nutrients with single-meal protocol" }, { name: "NAD+ IV", reason: "Maximise cellular repair during extended fast" }],
  "5:2": [{ name: "IV Amino Acid Drip", reason: "Preserve muscle mass on low-calorie days" }],
};

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function FastingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [selectedProtocol, setSelectedProtocol] = useState(PROTOCOLS[0]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [elapsed, setElapsed] = useState(0);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (auth.token) loadData();
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [auth.token]);

  useEffect(() => {
    if (activeSession) {
      const pulse = Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]));
      pulse.start();
      tickRef.current = setInterval(() => {
        setElapsed(Date.now() - new Date(activeSession.start_time).getTime());
      }, 1000);
      return () => { pulse.stop(); if (tickRef.current) clearInterval(tickRef.current); };
    }
  }, [activeSession]);

  const loadData = async () => {
    try {
      const [activeRes, sessRes] = await Promise.all([
        fetch(`${API_BASE}/fasting/active`, { headers: { "x-auth-token": auth.token! } }),
        fetch(`${API_BASE}/fasting`, { headers: { "x-auth-token": auth.token! } }),
      ]);
      if (activeRes.ok) { const d = await activeRes.json(); if (d.session) { setActiveSession(d.session); setElapsed(Date.now() - new Date(d.session.start_time).getTime()); } }
      if (sessRes.ok) { const d = await sessRes.json(); setSessions(d.sessions.filter((s: any) => s.end_time)); }
    } catch {}
  };

  const startFast = async () => {
    if (!auth.token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/fasting/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": auth.token },
        body: JSON.stringify({ protocol: selectedProtocol.id, target_hours: selectedProtocol.hours }),
      });
      if (res.ok) { const d = await res.json(); setActiveSession(d.session); setElapsed(0); }
    } catch {}
    setLoading(false);
  };

  const endFast = async () => {
    if (!auth.token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/fasting/end`, { method: "POST", headers: { "x-auth-token": auth.token } });
      if (res.ok) {
        const d = await res.json();
        setSessions((prev) => [d.session, ...prev]);
        setActiveSession(null);
        setElapsed(0);
        if (tickRef.current) clearInterval(tickRef.current);
        await fetch(`${API_BASE}/rewards`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-auth-token": auth.token },
          body: JSON.stringify({ action: "complete_fasting", description: `Completed ${selectedProtocol.label}` }),
        });
      }
    } catch {}
    setLoading(false);
  };

  const progress = activeSession ? Math.min(elapsed / (selectedProtocol.hours * 3600 * 1000), 1) : 0;
  const targetMs = selectedProtocol.hours * 3600 * 1000;
  const remaining = activeSession ? Math.max(targetMs - elapsed, 0) : 0;
  const recs = IV_RECS[selectedProtocol.id] ?? [];

  const completedCount = sessions.filter((s) => s.completed).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: ACCENT }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
          <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Extras</Text>
        </Pressable>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <View>
            <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>LONGEVITY PROTOCOL</Text>
            <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>Fasting Timer</Text>
          </View>
          {completedCount > 0 && (
            <View style={[styles.streak, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
              <Feather name="award" size={14} color="#C4956A" />
              <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 12 }]}>{completedCount} completed</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 60 + bottomPad, gap: 16 }}>
        {/* Timer display */}
        <View style={[styles.timerCard, { backgroundColor: colors.card, borderColor: activeSession ? `${selectedProtocol.color}50` : colors.border }]}>
          {activeSession ? (
            <>
              <Text style={[styles.timerLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                {selectedProtocol.label} · FASTING
              </Text>
              <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: "center" }}>
                <Text style={[styles.timerText, { color: selectedProtocol.color, fontFamily: "Cormorant_700Bold" }]}>
                  {formatDuration(elapsed)}
                </Text>
              </Animated.View>
              <View style={{ gap: 6 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: colors.warmGray, fontSize: 12, fontFamily: "Lato_300Light" }}>Progress</Text>
                  <Text style={{ color: selectedProtocol.color, fontSize: 12, fontFamily: "Lato_700Bold" }}>{Math.round(progress * 100)}%</Text>
                </View>
                <View style={[{ height: 8, borderRadius: 4, overflow: "hidden" }, { backgroundColor: colors.secondary }]}>
                  <View style={{ height: 8, borderRadius: 4, backgroundColor: selectedProtocol.color, width: `${progress * 100}%` as any }} />
                </View>
                <Text style={{ color: colors.mutedForeground, fontSize: 11, fontFamily: "Lato_300Light", textAlign: "center" }}>
                  {remaining > 0 ? `${formatDuration(remaining)} remaining` : "🎉 Target reached!"}
                </Text>
              </View>
              <Pressable onPress={endFast} disabled={loading}
                style={({ pressed }) => [styles.stopBtn, { backgroundColor: "#B05A3A", opacity: pressed ? 0.85 : 1 }]}>
                <Feather name="square" size={16} color="#fff" />
                <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 15 }]}>End Fast</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={[styles.timerLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>READY TO FAST</Text>
              <Text style={[styles.timerText, { color: colors.mutedForeground, fontFamily: "Cormorant_700Bold" }]}>00:00:00</Text>
              <Pressable onPress={auth.user ? startFast : () => router.push("/extras/profile" as any)} disabled={loading}
                style={({ pressed }) => [styles.startBtn, { backgroundColor: selectedProtocol.color, opacity: pressed ? 0.85 : 1 }]}>
                <Feather name="play" size={18} color="#fff" />
                <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 16 }]}>{auth.user ? "Start Fast" : "Sign In to Start"}</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Protocol selector */}
        {!activeSession && (
          <View style={{ gap: 10 }}>
            <Text style={[{ color: colors.warmGray, fontSize: 11, fontFamily: "Lato_700Bold", letterSpacing: 1.5 }]}>SELECT PROTOCOL</Text>
            {PROTOCOLS.map((p) => (
              <Pressable key={p.id} onPress={() => setSelectedProtocol(p)}
                style={({ pressed }) => [
                  styles.protocolCard,
                  { backgroundColor: colors.card, borderColor: selectedProtocol.id === p.id ? `${p.color}60` : colors.border, borderLeftWidth: selectedProtocol.id === p.id ? 4 : 1, borderLeftColor: selectedProtocol.id === p.id ? p.color : colors.border, opacity: pressed ? 0.9 : 1 },
                ]}>
                <View style={[styles.protocolIcon, { backgroundColor: `${p.color}15` }]}>
                  <Feather name={p.icon as any} size={20} color={p.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontSize: 16, fontFamily: "Lato_700Bold" }}>{p.label}</Text>
                  <Text style={{ color: colors.warmGray, fontSize: 12, fontFamily: "Lato_300Light", lineHeight: 17, marginTop: 2 }}>{p.desc}</Text>
                </View>
                <View style={[styles.hoursChip, { backgroundColor: selectedProtocol.id === p.id ? p.color : colors.secondary }]}>
                  <Text style={[{ color: selectedProtocol.id === p.id ? "#fff" : colors.warmGray, fontSize: 12, fontFamily: "Lato_700Bold" }]}>{p.hours}h</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* IV recommendations */}
        {recs.length > 0 && (
          <View style={[styles.recoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 24 }]}>Support Your Fast</Text>
            <Text style={[{ color: colors.warmGray, fontSize: 13, fontFamily: "Lato_300Light" }]}>Recommended IV therapy for {selectedProtocol.label}</Text>
            {recs.map((r, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, paddingTop: i > 0 ? 10 : 0, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: colors.border }}>
                <View style={[{ width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" }, { backgroundColor: ACCENT }]}>
                  <Feather name="droplet" size={11} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontFamily: "Lato_700Bold" }}>{r.name}</Text>
                  <Text style={{ color: colors.warmGray, fontSize: 12, fontFamily: "Lato_300Light" }}>{r.reason}</Text>
                </View>
              </View>
            ))}
            <Pressable onPress={() => Linking.openURL(`https://wa.me/971586078532?text=${encodeURIComponent(`Hello Drypskin! I'm doing the ${selectedProtocol.label} and would like to book an IV therapy session to support my fasting protocol.`)}`)}
              style={({ pressed }) => [styles.waBtn, { backgroundColor: "#1a1a1a", opacity: pressed ? 0.85 : 1 }]}>
              <Feather name="message-circle" size={16} color="#fff" />
              <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold" }]}>Book IV Support</Text>
            </Pressable>
          </View>
        )}

        {/* History */}
        {sessions.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={[{ color: colors.warmGray, fontSize: 11, fontFamily: "Lato_700Bold", letterSpacing: 1.5 }]}>FASTING HISTORY</Text>
            {sessions.slice(0, 5).map((s, i) => {
              const dur = s.end_time ? new Date(s.end_time).getTime() - new Date(s.start_time).getTime() : 0;
              return (
                <View key={i} style={[styles.histRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Feather name={s.completed ? "check-circle" : "x-circle"} size={16} color={s.completed ? "#5C7A6B" : "#B05A3A"} />
                  <Text style={{ flex: 1, color: colors.foreground, fontFamily: "Lato_400Regular" }}>{s.protocol} fast</Text>
                  <Text style={{ color: colors.warmGray, fontSize: 12, fontFamily: "Lato_300Light" }}>{formatDuration(dur)}</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  heroLabel: { color: "rgba(255,255,255,0.5)", fontSize: 10, letterSpacing: 2.5 },
  heroTitle: { color: "#fff", fontSize: 38, lineHeight: 40 },
  streak: { flexDirection: "row", alignItems: "center", gap: 5, padding: 8, borderRadius: 10 },
  timerCard: { borderRadius: 20, borderWidth: 1, padding: 24, gap: 16, alignItems: "center" },
  timerLabel: { fontSize: 10, letterSpacing: 2.5 },
  timerText: { fontSize: 60, lineHeight: 64 },
  startBtn: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 50 },
  stopBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 50 },
  protocolCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  protocolIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  hoursChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, flexShrink: 0 },
  recoCard: { borderRadius: 18, borderWidth: 1, padding: 18, gap: 12 },
  waBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50 },
  histRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
});
