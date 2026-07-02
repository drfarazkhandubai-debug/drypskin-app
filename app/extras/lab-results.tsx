import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
const ACCENT = "#4A7AAA";

const BIOMARKERS = [
  { name: "Vitamin D", unit: "ng/mL", optimal: "40-80", category: "Vitamins" },
  { name: "Vitamin B12", unit: "pg/mL", optimal: "400-900", category: "Vitamins" },
  { name: "Iron (Ferritin)", unit: "ng/mL", optimal: "30-150", category: "Minerals" },
  { name: "Magnesium", unit: "mg/dL", optimal: "1.8-2.4", category: "Minerals" },
  { name: "Cortisol (AM)", unit: "µg/dL", optimal: "6-23", category: "Hormones" },
  { name: "Testosterone (Total)", unit: "ng/dL", optimal: "300-900", category: "Hormones" },
  { name: "Oestrogen (E2)", unit: "pg/mL", optimal: "30-400", category: "Hormones" },
  { name: "TSH", unit: "mIU/L", optimal: "0.4-4.0", category: "Thyroid" },
  { name: "Free T4", unit: "ng/dL", optimal: "0.8-1.8", category: "Thyroid" },
  { name: "HbA1c", unit: "%", optimal: "<5.7", category: "Metabolic" },
  { name: "Fasting Glucose", unit: "mg/dL", optimal: "70-99", category: "Metabolic" },
  { name: "HDL Cholesterol", unit: "mg/dL", optimal: ">60", category: "Lipids" },
  { name: "LDL Cholesterol", unit: "mg/dL", optimal: "<100", category: "Lipids" },
  { name: "Triglycerides", unit: "mg/dL", optimal: "<150", category: "Lipids" },
  { name: "CRP (hs-CRP)", unit: "mg/L", optimal: "<1.0", category: "Inflammation" },
  { name: "Homocysteine", unit: "µmol/L", optimal: "<10", category: "Inflammation" },
  { name: "NAD+", unit: "µM", optimal: ">30", category: "Longevity" },
  { name: "IGF-1", unit: "ng/mL", optimal: "115-307", category: "Longevity" },
];

const STATUS_OPTS = ["optimal", "suboptimal", "low", "high", "critical"] as const;
const STATUS_COLORS: Record<string, string> = {
  optimal: "#5C7A6B", suboptimal: "#C4956A", low: "#4A5B8A", high: "#B05A3A", critical: "#8B1A1A", pending: "#8B9B8A",
};
const STATUS_ICONS: Record<string, string> = {
  optimal: "check-circle", suboptimal: "alert-circle", low: "arrow-down-circle", high: "arrow-up-circle", critical: "x-circle", pending: "circle",
};

export default function LabResultsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [markerName, setMarkerName] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [status, setStatus] = useState<string>("pending");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => { if (auth.token) load(); else setLoading(false); }, [auth.token]);

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/lab-results`, { headers: { "x-auth-token": auth.token! } });
      if (res.ok) { const d = await res.json(); setResults(d.results); }
    } catch {}
    setLoading(false);
  };

  const save = async () => {
    if (!markerName.trim() || !value.trim()) { Alert.alert("Required", "Enter marker name and value."); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/lab-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": auth.token! },
        body: JSON.stringify({ marker_name: markerName.trim(), value: parseFloat(value), unit, status }),
      });
      if (res.ok) {
        const d = await res.json();
        setResults((prev) => [d.result, ...prev]);
        setMarkerName(""); setValue(""); setUnit(""); setStatus("pending"); setShowForm(false);
      }
    } catch {}
    setSaving(false);
  };

  const del = async (id: number) => {
    await fetch(`${API_BASE}/lab-results/${id}`, { method: "DELETE", headers: { "x-auth-token": auth.token! } });
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  const suggestions = BIOMARKERS.filter((b) => b.name.toLowerCase().includes(markerName.toLowerCase())).slice(0, 5);

  const grouped = results.reduce((acc: any, r: any) => {
    const key = r.status;
    acc[key] = acc[key] ?? [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: ACCENT }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
          <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Extras</Text>
        </Pressable>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <View>
            <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>BIOMARKERS</Text>
            <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>Lab Results</Text>
          </View>
          {auth.user && (
            <Pressable onPress={() => setShowForm(!showForm)} style={[styles.addBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Feather name={showForm ? "x" : "plus"} size={18} color="#fff" />
              <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 13 }]}>{showForm ? "Cancel" : "Add"}</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 60 + bottomPad, gap: 16 }} keyboardShouldPersistTaps="handled">
        {!auth.token ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="lock" size={32} color={colors.mutedForeground} />
            <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", textAlign: "center" }]}>Sign in to track your biomarkers</Text>
            <Pressable onPress={() => router.push("/extras/profile" as any)} style={[styles.cta, { backgroundColor: "#1a1a1a" }]}>
              <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold" }]}>Sign In</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Add form */}
        {showForm && auth.user && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>Add Lab Result</Text>

            <View style={{ gap: 6 }}>
              <Text style={[styles.fieldLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>Biomarker Name *</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <TextInput value={markerName} onChangeText={(t) => { setMarkerName(t); setShowSuggestions(true); }}
                  placeholder="e.g. Vitamin D" placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { color: colors.foreground, fontFamily: "Lato_400Regular" }]} />
              </View>
              {showSuggestions && markerName.length > 0 && suggestions.length > 0 && (
                <View style={[{ borderRadius: 10, borderWidth: 1, overflow: "hidden" }, { borderColor: colors.border, backgroundColor: colors.card }]}>
                  {suggestions.map((s) => (
                    <Pressable key={s.name} onPress={() => { setMarkerName(s.name); setUnit(s.unit); setShowSuggestions(false); }}
                      style={[{ padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                      <Text style={[{ color: colors.foreground, fontFamily: "Lato_400Regular" }]}>{s.name}</Text>
                      <Text style={[{ color: colors.warmGray, fontSize: 11, fontFamily: "Lato_300Light" }]}>Optimal: {s.optimal} {s.unit}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 2, gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>Value *</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <TextInput value={value} onChangeText={setValue} keyboardType="decimal-pad" placeholder="e.g. 42.5"
                    placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, fontFamily: "Lato_400Regular" }]} />
                </View>
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>Unit</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <TextInput value={unit} onChangeText={setUnit} placeholder="ng/mL" placeholderTextColor={colors.mutedForeground}
                    style={[styles.input, { color: colors.foreground, fontFamily: "Lato_400Regular" }]} />
                </View>
              </View>
            </View>

            <View style={{ gap: 6 }}>
              <Text style={[styles.fieldLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>Status</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {STATUS_OPTS.map((s) => (
                  <Pressable key={s} onPress={() => setStatus(s)}
                    style={[styles.statusChip, { backgroundColor: status === s ? STATUS_COLORS[s] : colors.secondary, borderColor: status === s ? STATUS_COLORS[s] : colors.border }]}>
                    <Text style={[{ color: status === s ? "#fff" : colors.warmGray, fontSize: 12, fontFamily: "Lato_700Bold", textTransform: "capitalize" }]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable onPress={save} disabled={saving} style={[styles.saveBtn, { backgroundColor: ACCENT }]}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : (
                <><Feather name="check" size={16} color="#fff" /><Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 15 }]}>Save Result</Text></>
              )}
            </Pressable>
          </View>
        )}

        {/* Reference panel */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>Optimal Ranges</Text>
          <Text style={[{ color: colors.warmGray, fontSize: 12, fontFamily: "Lato_300Light" }]}>Key biomarkers tracked at Drypskin</Text>
          {["Vitamins", "Hormones", "Metabolic", "Longevity"].map((cat) => (
            <View key={cat} style={{ gap: 6 }}>
              <Text style={[{ color: ACCENT, fontSize: 10, fontFamily: "Lato_700Bold", letterSpacing: 1.5 }]}>{cat.toUpperCase()}</Text>
              {BIOMARKERS.filter((b) => b.category === cat).map((b) => (
                <View key={b.name} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: "Lato_400Regular" }}>{b.name}</Text>
                  <Text style={{ color: colors.warmGray, fontSize: 12, fontFamily: "Lato_300Light" }}>{b.optimal} {b.unit}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Results list */}
        {loading ? <ActivityIndicator color={ACCENT} /> : results.length > 0 ? (
          <View style={{ gap: 10 }}>
            <Text style={[{ color: colors.warmGray, fontSize: 11, fontFamily: "Lato_700Bold", letterSpacing: 1.5 }]}>YOUR RESULTS</Text>
            {results.map((r) => {
              const sc = STATUS_COLORS[r.status] ?? "#8B9B8A";
              const si = STATUS_ICONS[r.status] ?? "circle";
              return (
                <View key={r.id} style={[styles.resultRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Feather name={si as any} size={18} color={sc} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.foreground, fontSize: 15, fontFamily: "Lato_700Bold" }}>{r.marker_name}</Text>
                    <Text style={{ color: colors.warmGray, fontSize: 12, fontFamily: "Lato_300Light" }}>{r.recorded_date}</Text>
                  </View>
                  <Text style={{ color: sc, fontSize: 15, fontFamily: "Lato_700Bold" }}>{r.value} {r.unit}</Text>
                  <Pressable onPress={() => del(r.id)} style={{ padding: 4 }}>
                    <Feather name="trash-2" size={14} color={colors.mutedForeground} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : auth.user && !showForm ? (
          <View style={[styles.empty, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="thermometer" size={28} color={colors.mutedForeground} />
            <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", textAlign: "center" }]}>
              No lab results yet. Tap "Add" to log your first biomarker result.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  heroLabel: { color: "rgba(255,255,255,0.5)", fontSize: 10, letterSpacing: 2.5 },
  heroTitle: { color: "#fff", fontSize: 38, lineHeight: 40 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  card: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 14 },
  cardTitle: { fontSize: 26 },
  fieldLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 },
  inputRow: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11 },
  input: { fontSize: 15 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50 },
  resultRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  empty: { borderRadius: 18, borderWidth: 1, padding: 28, alignItems: "center", gap: 12 },
  cta: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 50 },
});
