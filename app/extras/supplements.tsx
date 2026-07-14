import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const API_BASE = `https://${process.env.EXPO_PUBLIC_API_URL}/api`;

const PEPTIDE_PROTOCOLS = [
  { name: "BPC-157", dose: "500 mcg", category: "peptide", icon: "zap", benefit: "Gut healing & recovery" },
  { name: "Thymosin Alpha-1", dose: "1.5 mg", category: "peptide", icon: "shield", benefit: "Immune modulation" },
  { name: "NAD+ (Oral)", dose: "500 mg", category: "peptide", icon: "battery-charging", benefit: "Cellular energy & longevity" },
  { name: "Semaglutide", dose: "0.5 mg", category: "peptide", icon: "trending-down", benefit: "Metabolic & GLP-1" },
  { name: "PT-141", dose: "2 mg", category: "peptide", icon: "heart", benefit: "Libido & sexual health" },
  { name: "TB-500", dose: "5 mg", category: "peptide", icon: "activity", benefit: "Tissue repair" },
  { name: "Epitalon", dose: "10 mg", category: "peptide", icon: "clock", benefit: "Telomere support" },
  { name: "Melanotan II", dose: "0.5 mg", category: "peptide", icon: "sun", benefit: "Tanning & appetite" },
  { name: "CJC-1295 / Ipamorelin", dose: "2 mg", category: "peptide", icon: "arrow-up", benefit: "Growth hormone release" },
  { name: "KPV", dose: "500 mcg", category: "peptide", icon: "wind", benefit: "Anti-inflammatory" },
];

const SUPPLEMENTS = [
  { name: "Vitamin D3/K2", dose: "5000 IU", category: "supplement", icon: "sun", benefit: "Bone & immune health" },
  { name: "Magnesium Glycinate", dose: "400 mg", category: "supplement", icon: "moon", benefit: "Sleep & stress" },
  { name: "Omega-3 EPA/DHA", dose: "2 g", category: "supplement", icon: "droplet", benefit: "Heart & brain health" },
  { name: "Zinc", dose: "30 mg", category: "supplement", icon: "shield", benefit: "Immune & testosterone" },
  { name: "Berberine", dose: "500 mg", category: "supplement", icon: "leaf", benefit: "Glucose control" },
  { name: "NMN", dose: "500 mg", category: "supplement", icon: "battery-charging", benefit: "NAD+ precursor" },
  { name: "CoQ10 (Ubiquinol)", dose: "200 mg", category: "supplement", icon: "zap", benefit: "Mitochondrial support" },
  { name: "Ashwagandha", dose: "600 mg", category: "supplement", icon: "wind", benefit: "Cortisol & stress" },
  { name: "Quercetin", dose: "500 mg", category: "supplement", icon: "circle", benefit: "Senolytic & anti-aging" },
  { name: "Melatonin", dose: "0.5 mg", category: "supplement", icon: "moon", benefit: "Circadian reset" },
];

const CATEGORY_COLOR: Record<string, string> = { peptide: "#8A5A7A", supplement: "#5C7A6B" };

export default function SupplementsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState<string | null>(null);
  const [tab, setTab] = useState<"peptides" | "supplements">("peptides");

  useEffect(() => { if (auth.token) load(); else setLoading(false); }, [auth.token]);

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/supplements`, { headers: { "x-auth-token": auth.token! } });
      if (res.ok) { const d = await res.json(); setLogs(d.logs); }
    } catch {}
    setLoading(false);
  };

  const logItem = async (item: typeof PEPTIDE_PROTOCOLS[0]) => {
    if (!auth.token || logging) return;
    setLogging(item.name);
    try {
      const res = await fetch(`${API_BASE}/supplements`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": auth.token },
        body: JSON.stringify({ supplement_name: item.name, dose: item.dose, category: item.category }),
      });
      if (res.ok) {
        const d = await res.json();
        setLogs((prev) => [d.log, ...prev]);
        // Award points
        await fetch(`${API_BASE}/rewards`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-auth-token": auth.token },
          body: JSON.stringify({ action: "log_supplement", description: `Logged: ${item.name}` }),
        });
      }
    } catch {}
    setLogging(null);
  };

  // Today's logs
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayLogs = logs.filter((l) => new Date(l.taken_at) >= todayStart);
  const todayNames = new Set(todayLogs.map((l) => l.supplement_name));

  // Streak calculation
  const streak = (() => {
    let s = 0;
    const days = new Set(logs.map((l) => new Date(l.taken_at).toDateString()));
    let d = new Date();
    while (days.has(d.toDateString())) { s++; d.setDate(d.getDate() - 1); }
    return s;
  })();

  const items = tab === "peptides" ? PEPTIDE_PROTOCOLS : SUPPLEMENTS;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: "#8A5A7A" }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
          <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Extras</Text>
        </Pressable>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <View>
            <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>PROTOCOL TRACKER</Text>
            <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>Supplement Log</Text>
          </View>
          {streak > 0 && (
            <View style={[styles.streakBadge, { backgroundColor: "rgba(196,149,106,0.25)" }]}>
              <Feather name="zap" size={14} color="#C4956A" />
              <Text style={[{ color: "#C4956A", fontFamily: "Lato_700Bold", fontSize: 14 }]}>{streak}</Text>
              <Text style={[{ color: "rgba(255,255,255,0.7)", fontFamily: "Lato_300Light", fontSize: 10 }]}>day streak</Text>
            </View>
          )}
        </View>
      </View>

      {!auth.token ? (
        <View style={styles.center}>
          <Feather name="lock" size={40} color={colors.mutedForeground} />
          <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", marginTop: 12, textAlign: "center" }]}>Sign in to track your protocols</Text>
          <Pressable onPress={() => router.push("/extras/profile" as any)} style={[styles.cta, { backgroundColor: "#1a1a1a", marginTop: 16 }]}>
            <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold" }]}>Sign In</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 60 + bottomPad, gap: 16 }}>
          {/* Today's summary */}
          <View style={[styles.todayCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 24 }]}>Today's Protocol</Text>
              <Text style={[{ color: colors.sage, fontFamily: "Lato_700Bold", fontSize: 13 }]}>{todayLogs.length} taken</Text>
            </View>
            {todayLogs.length > 0 ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {todayLogs.slice(0, 6).map((l, i) => (
                  <View key={i} style={[styles.todayChip, { backgroundColor: `${CATEGORY_COLOR[l.category] ?? "#5C7A6B"}18`, borderColor: `${CATEGORY_COLOR[l.category] ?? "#5C7A6B"}30` }]}>
                    <Feather name="check" size={10} color={CATEGORY_COLOR[l.category] ?? "#5C7A6B"} />
                    <Text style={[{ color: CATEGORY_COLOR[l.category] ?? "#5C7A6B", fontSize: 11, fontFamily: "Lato_700Bold" }]}>{l.supplement_name}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 13 }]}>Nothing logged yet today — tap any item below to log it</Text>
            )}
          </View>

          {/* Tab switcher */}
          <View style={[styles.tabs, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            {(["peptides", "supplements"] as const).map((t) => (
              <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && { backgroundColor: colors.card }]}>
                <Text style={[{ color: tab === t ? colors.foreground : colors.warmGray, fontFamily: tab === t ? "Lato_700Bold" : "Lato_400Regular", fontSize: 13, textTransform: "capitalize" }]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          {/* Protocol items */}
          <View style={{ gap: 10 }}>
            {items.map((item) => {
              const taken = todayNames.has(item.name);
              const isLogging = logging === item.name;
              const cc = CATEGORY_COLOR[item.category];
              return (
                <View key={item.name} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: taken ? `${cc}40` : colors.border, borderLeftWidth: taken ? 3 : 1, borderLeftColor: taken ? cc : colors.border }]}>
                  <View style={[styles.itemIcon, { backgroundColor: `${cc}15` }]}>
                    <Feather name={item.icon as any} size={18} color={cc} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.foreground, fontSize: 15, fontFamily: "Lato_700Bold" }}>{item.name}</Text>
                    <Text style={{ color: colors.warmGray, fontSize: 12, fontFamily: "Lato_300Light" }}>{item.dose} · {item.benefit}</Text>
                  </View>
                  <Pressable
                    onPress={() => logItem(item)}
                    disabled={taken || !!logging}
                    style={[styles.logBtn, { backgroundColor: taken ? `${cc}15` : cc, opacity: isLogging ? 0.7 : 1 }]}
                  >
                    {isLogging ? (
                      <ActivityIndicator size="small" color={taken ? cc : "#fff"} />
                    ) : (
                      <Feather name={taken ? "check" : "plus"} size={16} color={taken ? cc : "#fff"} />
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>

          {/* Recent history */}
          {logs.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text style={[{ color: colors.warmGray, fontSize: 11, fontFamily: "Lato_700Bold", letterSpacing: 1.5 }]}>RECENT LOG</Text>
              {logs.slice(0, 8).map((l, i) => (
                <View key={i} style={[styles.logRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Feather name="check-circle" size={14} color={CATEGORY_COLOR[l.category] ?? "#5C7A6B"} />
                  <Text style={{ flex: 1, color: colors.foreground, fontSize: 13, fontFamily: "Lato_400Regular" }}>{l.supplement_name}</Text>
                  <Text style={{ color: colors.mutedForeground, fontSize: 11, fontFamily: "Lato_300Light" }}>
                    {new Date(l.taken_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  heroLabel: { color: "rgba(255,255,255,0.5)", fontSize: 10, letterSpacing: 2.5 },
  heroTitle: { color: "#fff", fontSize: 38, lineHeight: 40 },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 4, padding: 10, borderRadius: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  cta: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 50 },
  todayCard: { borderRadius: 18, borderWidth: 1, padding: 18, gap: 10 },
  todayChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  tabs: { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center" },
  itemCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  itemIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, borderWidth: 1 },
});
