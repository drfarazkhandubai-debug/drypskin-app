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
const ACCENT = "#5C7A6B";

function getBmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", color: "#4A5B8A" };
  if (bmi < 25) return { label: "Healthy Weight", color: "#5C7A6B" };
  if (bmi < 30) return { label: "Overweight", color: "#C4956A" };
  return { label: "Obese", color: "#B05A3A" };
}

function getBfCategory(bf: number) {
  if (bf < 6) return { label: "Essential Fat", color: "#4A5B8A" };
  if (bf < 14) return { label: "Athletic", color: "#5C7A6B" };
  if (bf < 21) return { label: "Fit", color: "#8B9B8A" };
  if (bf < 25) return { label: "Average", color: "#C4956A" };
  return { label: "Above Average", color: "#B05A3A" };
}

export default function BodyMetricsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [arm, setArm] = useState("");

  useEffect(() => { if (auth.token) load(); else setLoading(false); }, [auth.token]);

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/body-metrics`, { headers: { "x-auth-token": auth.token! } });
      if (res.ok) { const d = await res.json(); setMetrics(d.metrics); }
    } catch {}
    setLoading(false);
  };

  const save = async () => {
    if (!weight && !bodyFat && !waist) { Alert.alert("Required", "Enter at least one measurement."); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/body-metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": auth.token! },
        body: JSON.stringify({
          weight_kg: weight ? parseFloat(weight) : null,
          body_fat_pct: bodyFat ? parseFloat(bodyFat) : null,
          waist_cm: waist ? parseFloat(waist) : null,
          hip_cm: hip ? parseFloat(hip) : null,
          arm_cm: arm ? parseFloat(arm) : null,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setMetrics((prev) => [d.metric, ...prev]);
        setWeight(""); setHeight(""); setBodyFat(""); setWaist(""); setHip(""); setArm("");
        setShowForm(false);
      }
    } catch {}
    setSaving(false);
  };

  const latest = metrics[0];
  const bmi = latest?.weight_kg && height ? latest.weight_kg / ((parseFloat(height) / 100) ** 2) : null;
  const bmiCat = bmi ? getBmiCategory(bmi) : null;
  const bfCat = latest?.body_fat_pct ? getBfCategory(latest.body_fat_pct) : null;

  // Trend calculation (compare latest to previous)
  const prev = metrics[1];
  const weightTrend = latest?.weight_kg && prev?.weight_kg ? latest.weight_kg - prev.weight_kg : null;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: ACCENT }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
          <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Extras</Text>
        </Pressable>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <View>
            <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>BODY COMPOSITION</Text>
            <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>Body Metrics</Text>
          </View>
          {auth.user && (
            <Pressable onPress={() => setShowForm(!showForm)} style={[styles.addBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Feather name={showForm ? "x" : "plus"} size={18} color="#fff" />
              <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 13 }]}>{showForm ? "Cancel" : "Log"}</Text>
            </Pressable>
          )}
        </View>
      </View>

      {!auth.token ? (
        <View style={styles.center}>
          <Feather name="lock" size={40} color={colors.mutedForeground} />
          <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", marginTop: 12, textAlign: "center" }]}>Sign in to track your body composition</Text>
          <Pressable onPress={() => router.push("/extras/profile" as any)} style={[styles.cta, { backgroundColor: "#1a1a1a", marginTop: 16 }]}>
            <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold" }]}>Sign In</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 60 + bottomPad, gap: 16 }} keyboardShouldPersistTaps="handled">
          {/* Latest snapshot */}
          {latest && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>Current Status</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {latest.weight_kg && (
                  <View style={[styles.statCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                    <Feather name="user" size={16} color={ACCENT} />
                    <Text style={[styles.statVal, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{latest.weight_kg}</Text>
                    <Text style={[styles.statUnit, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>kg</Text>
                    {weightTrend !== null && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                        <Feather name={weightTrend < 0 ? "trending-down" : "trending-up"} size={11} color={weightTrend < 0 ? "#5C7A6B" : "#B05A3A"} />
                        <Text style={{ fontSize: 10, color: weightTrend < 0 ? "#5C7A6B" : "#B05A3A", fontFamily: "Lato_700Bold" }}>
                          {weightTrend > 0 ? "+" : ""}{weightTrend.toFixed(1)} kg
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                {latest.body_fat_pct && (
                  <View style={[styles.statCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                    <Feather name="percent" size={16} color={bfCat?.color ?? ACCENT} />
                    <Text style={[styles.statVal, { color: bfCat?.color ?? colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{latest.body_fat_pct}</Text>
                    <Text style={[styles.statUnit, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>% body fat</Text>
                    {bfCat && <Text style={{ fontSize: 10, color: bfCat.color, fontFamily: "Lato_700Bold" }}>{bfCat.label}</Text>}
                  </View>
                )}
                {latest.waist_cm && (
                  <View style={[styles.statCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                    <Feather name="minimize-2" size={16} color={colors.sage} />
                    <Text style={[styles.statVal, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{latest.waist_cm}</Text>
                    <Text style={[styles.statUnit, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>cm waist</Text>
                  </View>
                )}
                {latest.hip_cm && (
                  <View style={[styles.statCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                    <Feather name="maximize-2" size={16} color={colors.sage} />
                    <Text style={[styles.statVal, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{latest.hip_cm}</Text>
                    <Text style={[styles.statUnit, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>cm hip</Text>
                  </View>
                )}
              </View>
              {bmi && bmiCat && (
                <View style={{ gap: 6 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ color: colors.warmGray, fontFamily: "Lato_400Regular", fontSize: 12 }}>BMI</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={{ color: bmiCat.color, fontFamily: "Lato_700Bold", fontSize: 13 }}>{bmi.toFixed(1)}</Text>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: bmiCat.color }}>
                        <Text style={{ color: "#fff", fontSize: 10, fontFamily: "Lato_700Bold" }}>{bmiCat.label}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[{ height: 6, borderRadius: 3, overflow: "hidden" }, { backgroundColor: colors.secondary }]}>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: bmiCat.color, width: `${Math.min((bmi / 40) * 100, 100)}%` as any }} />
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Log form */}
          {showForm && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>Log Measurements</Text>
              {[
                { label: "Weight (kg)", value: weight, setter: setWeight, placeholder: "e.g. 72.5" },
                { label: "Height (cm) — for BMI", value: height, setter: setHeight, placeholder: "e.g. 175" },
                { label: "Body Fat (%)", value: bodyFat, setter: setBodyFat, placeholder: "e.g. 18.5" },
                { label: "Waist (cm)", value: waist, setter: setWaist, placeholder: "e.g. 82" },
                { label: "Hip (cm)", value: hip, setter: setHip, placeholder: "e.g. 96" },
                { label: "Arm (cm)", value: arm, setter: setArm, placeholder: "e.g. 34" },
              ].map((f) => (
                <View key={f.label} style={{ gap: 6 }}>
                  <Text style={[styles.fieldLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>{f.label}</Text>
                  <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                    <TextInput value={f.value} onChangeText={f.setter} keyboardType="decimal-pad" placeholder={f.placeholder}
                      placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, fontFamily: "Lato_400Regular" }]} />
                  </View>
                </View>
              ))}
              <Pressable onPress={save} disabled={saving} style={[styles.saveBtn, { backgroundColor: ACCENT }]}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : (
                  <><Feather name="check" size={16} color="#fff" /><Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 15 }]}>Save Measurements</Text></>
                )}
              </Pressable>
            </View>
          )}

          {/* History */}
          {loading ? <ActivityIndicator color={ACCENT} /> : metrics.length > 0 ? (
            <View style={{ gap: 10 }}>
              <Text style={[{ color: colors.warmGray, fontSize: 11, fontFamily: "Lato_700Bold", letterSpacing: 1.5 }]}>HISTORY</Text>
              {metrics.map((m, i) => (
                <View key={m.id} style={[styles.histRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={{ fontSize: 12, color: colors.warmGray, fontFamily: "Lato_300Light" }}>
                    {new Date(m.recorded_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                    {m.weight_kg && <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: "Lato_400Regular" }}>{m.weight_kg} kg</Text>}
                    {m.body_fat_pct && <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: "Lato_400Regular" }}>{m.body_fat_pct}% fat</Text>}
                    {m.waist_cm && <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: "Lato_400Regular" }}>{m.waist_cm}cm waist</Text>}
                  </View>
                </View>
              ))}
            </View>
          ) : !showForm ? (
            <View style={[styles.empty, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Feather name="bar-chart-2" size={28} color={colors.mutedForeground} />
              <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", textAlign: "center" }]}>
                No measurements logged yet. Tap "Log" above to start tracking.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}
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
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  cta: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 50 },
  card: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 14 },
  cardTitle: { fontSize: 26 },
  statCard: { borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", minWidth: 100, gap: 4 },
  statVal: { fontSize: 30, lineHeight: 32 },
  statUnit: { fontSize: 11 },
  fieldLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 },
  inputRow: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11 },
  input: { fontSize: 15 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50 },
  histRow: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 6 },
  empty: { borderRadius: 18, borderWidth: 1, padding: 28, alignItems: "center", gap: 12 },
});
