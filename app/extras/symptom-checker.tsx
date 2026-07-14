import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useColors } from "@/hooks/useColors";
import { consumeSymptomPrefill } from "@/services/symptomPrefill";
import { setConsultPrefill } from "@/services/consultPrefill";

const GOLD = "#C4956A";
const DARK = "#1a1a1a";
const API_BASE = `https://${process.env.EXPO_PUBLIC_API_URL}/api`;

// ─── Data ─────────────────────────────────────────────────────────────────────
const SYMPTOMS = [
  { id: "fatigue", label: "Fatigue", icon: "battery", color: "#4A7AAA" },
  { id: "low-energy", label: "Low Energy", icon: "zap", color: "#8A5A7A" },
  { id: "brain-fog", label: "Brain Fog", icon: "cloud", color: "#4A5B8A" },
  { id: "skin-dullness", label: "Skin Dullness", icon: "sun", color: "#C4956A" },
  { id: "stress-anxiety", label: "Stress / Anxiety", icon: "activity", color: "#AA4A4A" },
  { id: "poor-sleep", label: "Poor Sleep", icon: "moon", color: "#5C7A6B" },
  { id: "dehydration", label: "Dehydration", icon: "droplet", color: "#4A8A8A" },
];

const DURATIONS = [
  { id: "today", label: "Today", sub: "Started today" },
  { id: "2-3 days", label: "2–3 Days", sub: "A few days" },
  { id: "1 week+", label: "1 Week+", sub: "More than a week" },
  { id: "chronic", label: "Chronic", sub: "Ongoing / recurring" },
];

const SEVERITY_LABEL: Record<number, string> = {
  1: "Barely noticeable",
  2: "Mild",
  3: "Moderate",
  4: "Significant",
  5: "Severe",
};

// Steps: 1 Select · 2 Severity · 3 Duration · 4 Review · 5 Result
const TOTAL_STEPS = 5;

type SelectedSymptom = {
  id: string;
  label: string;
  severity: number;
  color: string;
  icon: string;
};

type AIResult = {
  severityScore: number;
  riskLevel: "low" | "medium" | "high";
  summary: string;
  recommendation: string;
  urgency: boolean;
  keyDrivers: string[];
  causes: string[];
  consult_type?: "iv" | "nurse" | "gp" | "specialist";
  specialty?: string;
};

type ScanContext = {
  healthScore?: number;
  skinScore?: number;
  burnoutScore?: number;
};

const RISK_COLOR = { low: "#5C7A6B", medium: GOLD, high: "#AA4A4A" };
const RISK_LABEL = { low: "LOW RISK", medium: "MODERATE", high: "HIGH PRIORITY" };

const STEP_TITLES = [
  "",
  "How are you feeling?",
  "Rate your severity",
  "How long has this been?",
  "Review your answers",
  "Your Clinical Assessment",
];

// ─── Fetch user scan context (best-effort) ────────────────────────────────────
async function fetchScanContext(): Promise<ScanContext> {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) return {};
    const res = await fetch(`${API_BASE}/health-scans`, {
      headers: { "x-auth-token": token },
    });
    if (!res.ok) return {};
    const data = await res.json();
    const scans: Array<{ scan_type: string; score: number }> = data.scans ?? [];
    const map: Record<string, number> = {};
    scans.forEach((s) => { map[s.scan_type] = s.score; });
    return {
      healthScore: map["general"],
      skinScore: map["skin"],
      burnoutScore: map["burnout"],
    };
  } catch {
    return {};
  }
}

export default function SymptomCheckerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [severities, setSeverities] = useState<Record<string, number>>({});
  const [duration, setDuration] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanCtx, setScanCtx] = useState<ScanContext>({});

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Fetch scan context and check for prefilled symptoms on mount
  useEffect(() => {
    fetchScanContext().then(setScanCtx);
    const prefill = consumeSymptomPrefill();
    if (prefill && prefill.symptoms.length > 0) {
      const ids = new Set(prefill.symptoms.map((s) => s.id));
      const sevs: Record<string, number> = {};
      prefill.symptoms.forEach((s) => { sevs[s.id] = s.severity; });
      setSelectedIds(ids);
      setSeverities(sevs);
      setStep(3); // skip to duration (symptoms + severity already filled)
    }
  }, []);

  const transition = (next: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: false }),
      Animated.timing(slideAnim, { toValue: 20, duration: 140, useNativeDriver: false }),
    ]).start(() => {
      setStep(next);
      slideAnim.setValue(-20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: false }),
        Animated.timing(slideAnim, { toValue: 0, duration: 180, useNativeDriver: false }),
      ]).start();
    });
  };

  const goBack = () => {
    if (step === 1) { router.back(); return; }
    if (step === 5 && !loading) { transition(4); return; }
    transition(step - 1);
  };

  const toggleSymptom = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setSeverities((s) => { const n = { ...s }; delete n[id]; return n; });
      } else {
        next.add(id);
        setSeverities((s) => ({ ...s, [id]: 3 }));
      }
      return next;
    });
  };

  const selectedSymptoms = (): SelectedSymptom[] =>
    SYMPTOMS.filter((s) => selectedIds.has(s.id)).map((s) => ({
      ...s,
      severity: severities[s.id] ?? 3,
    }));

  const handleAnalyze = async () => {
    if (!duration) return;
    setLoading(true);
    setError(null);
    transition(5);

    let scanContext: string | undefined;
    if (scanCtx.healthScore || scanCtx.skinScore || scanCtx.burnoutScore) {
      const parts: string[] = [];
      if (scanCtx.healthScore) parts.push(`Overall Health Score: ${scanCtx.healthScore}/100`);
      if (scanCtx.skinScore) parts.push(`Skin Health Score: ${scanCtx.skinScore}/100`);
      if (scanCtx.burnoutScore) parts.push(`Burnout Resilience Score: ${scanCtx.burnoutScore}/100 (burnout risk: ${100 - scanCtx.burnoutScore}%)`);
      scanContext = parts.join(", ");
    }

    try {
      const res = await fetch(`${API_BASE}/symptoms/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selectedSymptoms(),
          duration,
          scanContext,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setResult(data);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const topPad = (Platform.OS === "web" ? 67 : insets.top) + 12;
  const botPad = (Platform.OS === "web" ? 34 : insets.bottom) + 48;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Pressable
          onPress={goBack}
          style={styles.backBtn}
          hitSlop={12}
          disabled={step === 5 && loading}
        >
          <Feather
            name="chevron-left"
            size={22}
            color={step === 5 && loading ? colors.border : colors.foreground}
          />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: GOLD, fontFamily: "Lato_700Bold" }]}>
            SYMPTOM CHECKER
          </Text>
          <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
            {STEP_TITLES[step]}
          </Text>
        </View>
      </View>

      {/* ── Step dots (hidden on result) ───────────────────────────────────── */}
      {step < 5 && (
        <View style={styles.dots}>
          {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i + 1 <= step ? GOLD : colors.border,
                  width: i + 1 === step ? 22 : 8,
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* ── Animated content ───────────────────────────────────────────────── */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: botPad }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* ══ STEP 1 — Symptom Selection ══════════════════════════════════ */}
          {step === 1 && (
            <View style={{ gap: 16 }}>
              <Text style={[styles.stepDesc, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
                Select all the symptoms you are currently experiencing. You can choose multiple.
              </Text>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {SYMPTOMS.map((s) => {
                  const sel = selectedIds.has(s.id);
                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => toggleSymptom(s.id)}
                      style={[
                        styles.symptomChip,
                        {
                          backgroundColor: sel ? `${s.color}14` : colors.card,
                          borderColor: sel ? s.color : colors.border,
                        },
                      ]}
                    >
                      <View style={[styles.chipIcon, { backgroundColor: sel ? `${s.color}20` : `${s.color}0C` }]}>
                        <Feather name={s.icon as any} size={15} color={s.color} />
                      </View>
                      <Text style={[
                        styles.chipLabel,
                        {
                          color: sel ? s.color : colors.foreground,
                          fontFamily: sel ? "Lato_700Bold" : "Lato_400Regular",
                        },
                      ]}>
                        {s.label}
                      </Text>
                      {sel && <Feather name="check" size={13} color={s.color} />}
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                onPress={() => { if (selectedIds.size > 0) transition(2); }}
                style={({ pressed }) => [
                  styles.nextBtn,
                  {
                    backgroundColor: selectedIds.size > 0 ? DARK : colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text style={[styles.nextBtnText, { fontFamily: "Lato_700Bold" }]}>
                  Continue · {selectedIds.size} selected
                </Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </Pressable>
            </View>
          )}

          {/* ══ STEP 2 — Severity Rating ════════════════════════════════════ */}
          {step === 2 && (
            <View style={{ gap: 16 }}>
              <Text style={[styles.stepDesc, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
                Rate how severely each symptom is affecting you, from 1 (mild) to 5 (severe).
              </Text>

              {selectedSymptoms().map((s) => (
                <View
                  key={s.id}
                  style={[styles.severityCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  {/* Symptom header */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <View style={[styles.chipIcon, { backgroundColor: `${s.color}16` }]}>
                      <Feather name={s.icon as any} size={14} color={s.color} />
                    </View>
                    <Text style={[{ color: colors.foreground, fontFamily: "Lato_700Bold", fontSize: 14, flex: 1 }]}>
                      {s.label}
                    </Text>
                    <View style={[{
                      backgroundColor: `${s.color}18`, borderRadius: 20,
                      paddingHorizontal: 10, paddingVertical: 4,
                    }]}>
                      <Text style={[{ color: s.color, fontFamily: "Cormorant_700Bold", fontSize: 20, lineHeight: 22 }]}>
                        {s.severity}/5
                      </Text>
                    </View>
                  </View>
                  {/* Severity label */}
                  <Text style={[{
                    color: s.color,
                    fontFamily: "Lato_300Light",
                    fontSize: 11,
                    marginBottom: 14,
                    marginLeft: 36,
                  }]}>
                    {SEVERITY_LABEL[s.severity]}
                  </Text>

                  {/* 1–5 selector */}
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Pressable
                        key={n}
                        onPress={() => setSeverities((prev) => ({ ...prev, [s.id]: n }))}
                        style={[
                          styles.severityBtn,
                          {
                            backgroundColor: n <= s.severity ? s.color : colors.background,
                            borderColor: n <= s.severity ? s.color : colors.border,
                            flex: 1,
                          },
                        ]}
                      >
                        <Text style={[{
                          color: n <= s.severity ? "#fff" : colors.warmGray,
                          fontFamily: "Lato_700Bold",
                          fontSize: 13,
                        }]}>
                          {n}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 5 }}>
                    <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 10 }]}>Mild</Text>
                    <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 10 }]}>Severe</Text>
                  </View>
                </View>
              ))}

              <Pressable
                onPress={() => transition(3)}
                style={({ pressed }) => [
                  styles.nextBtn,
                  { backgroundColor: DARK, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={[styles.nextBtnText, { fontFamily: "Lato_700Bold" }]}>Continue</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </Pressable>
            </View>
          )}

          {/* ══ STEP 3 — Duration ════════════════════════════════════════════ */}
          {step === 3 && (
            <View style={{ gap: 14 }}>
              <Text style={[styles.stepDesc, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
                How long have you been experiencing these symptoms?
              </Text>

              {DURATIONS.map((d) => (
                <Pressable
                  key={d.id}
                  onPress={() => setDuration(d.id)}
                  style={[
                    styles.durationRow,
                    {
                      backgroundColor: duration === d.id ? `${GOLD}10` : colors.card,
                      borderColor: duration === d.id ? GOLD : colors.border,
                    },
                  ]}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[{
                      color: colors.foreground,
                      fontFamily: duration === d.id ? "Cormorant_700Bold" : "Lato_400Regular",
                      fontSize: duration === d.id ? 21 : 16,
                      lineHeight: 23,
                    }]}>
                      {d.label}
                    </Text>
                    <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 12 }]}>
                      {d.sub}
                    </Text>
                  </View>
                  {duration === d.id && (
                    <View style={[styles.checkCircle, { backgroundColor: GOLD }]}>
                      <Feather name="check" size={12} color="#fff" />
                    </View>
                  )}
                </Pressable>
              ))}

              <Pressable
                onPress={() => { if (duration) transition(4); }}
                disabled={!duration}
                style={({ pressed }) => [
                  styles.nextBtn,
                  {
                    backgroundColor: duration ? DARK : colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text style={[styles.nextBtnText, { fontFamily: "Lato_700Bold" }]}>
                  Review My Answers
                </Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </Pressable>
            </View>
          )}

          {/* ══ STEP 4 — Review ══════════════════════════════════════════════ */}
          {step === 4 && (
            <View style={{ gap: 18 }}>
              <Text style={[styles.stepDesc, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
                Please confirm your answers before we generate your personalised clinical assessment.
              </Text>

              {/* Symptoms + severities */}
              <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.reviewHeader}>
                  <Feather name="list" size={13} color={GOLD} />
                  <Text style={[styles.reviewSection, { color: GOLD, fontFamily: "Lato_700Bold" }]}>
                    SYMPTOMS
                  </Text>
                  <Pressable onPress={() => transition(1)} hitSlop={8}>
                    <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_400Regular", fontSize: 12, textDecorationLine: "underline" }]}>
                      Edit
                    </Text>
                  </Pressable>
                </View>

                {selectedSymptoms().map((s) => (
                  <View key={s.id} style={[styles.reviewRow, { borderTopColor: colors.border }]}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                      <View style={[styles.reviewIcon, { backgroundColor: `${s.color}14` }]}>
                        <Feather name={s.icon as any} size={12} color={s.color} />
                      </View>
                      <Text style={[{ color: colors.foreground, fontFamily: "Lato_400Regular", fontSize: 14 }]}>
                        {s.label}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 1 }}>
                      <Text style={[{ color: s.color, fontFamily: "Cormorant_700Bold", fontSize: 18, lineHeight: 20 }]}>
                        {s.severity}/5
                      </Text>
                      <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 10 }]}>
                        {SEVERITY_LABEL[s.severity]}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Duration */}
              <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.reviewHeader}>
                  <Feather name="clock" size={13} color={GOLD} />
                  <Text style={[styles.reviewSection, { color: GOLD, fontFamily: "Lato_700Bold" }]}>
                    DURATION
                  </Text>
                  <Pressable onPress={() => transition(3)} hitSlop={8}>
                    <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_400Regular", fontSize: 12, textDecorationLine: "underline" }]}>
                      Edit
                    </Text>
                  </Pressable>
                </View>
                <View style={[styles.reviewRow, { borderTopColor: colors.border }]}>
                  <Text style={[{ color: colors.foreground, fontFamily: "Lato_400Regular", fontSize: 14 }]}>
                    {DURATIONS.find((d) => d.id === duration)?.label}
                  </Text>
                  <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 13 }]}>
                    {DURATIONS.find((d) => d.id === duration)?.sub}
                  </Text>
                </View>
              </View>

              {/* Health scan context notice */}
              {(scanCtx.healthScore || scanCtx.skinScore || scanCtx.burnoutScore) && (
                <View style={[{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  padding: 14,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: `${GOLD}25`,
                  backgroundColor: `${GOLD}06`,
                }]}>
                  <Feather name="zap" size={14} color={GOLD} />
                  <Text style={[{
                    color: colors.warmGray,
                    fontFamily: "Lato_300Light",
                    fontSize: 12,
                    lineHeight: 18,
                    flex: 1,
                  }]}>
                    Your health scan data will be included for a more personalised assessment.
                  </Text>
                </View>
              )}

              {/* Generate CTA */}
              <Pressable
                onPress={handleAnalyze}
                style={({ pressed }) => [
                  styles.nextBtn,
                  {
                    backgroundColor: GOLD,
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <Feather name="cpu" size={16} color="#fff" />
                <Text style={[styles.nextBtnText, { fontFamily: "Lato_700Bold" }]}>
                  Generate Clinical Assessment
                </Text>
              </Pressable>

              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Feather name="shield" size={11} color={colors.warmGray} />
                <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 11 }]}>
                  Powered by DrypSkin AI · Clinical-grade analysis
                </Text>
              </View>
            </View>
          )}

          {/* ══ STEP 5 — AI Result ═══════════════════════════════════════════ */}
          {step === 5 && (
            <View style={{ gap: 20 }}>
              {/* Loading */}
              {loading && (
                <View style={{ gap: 24, alignItems: "center", paddingTop: 32 }}>
                  <View style={[styles.loadingOrb, { borderColor: `${GOLD}40`, backgroundColor: `${GOLD}08` }]}>
                    <ActivityIndicator size="large" color={GOLD} />
                  </View>
                  <View style={{ gap: 8, alignItems: "center" }}>
                    <Text style={[{
                      color: colors.foreground,
                      fontFamily: "Cormorant_700Bold",
                      fontSize: 24,
                      textAlign: "center",
                      lineHeight: 28,
                    }]}>
                      Analysing your symptoms
                    </Text>
                    <Text style={[{
                      color: colors.warmGray,
                      fontFamily: "Lato_300Light",
                      fontSize: 13,
                      textAlign: "center",
                      lineHeight: 20,
                      maxWidth: 280,
                    }]}>
                      Our AI is reviewing your profile and generating a personalised clinical summary…
                    </Text>
                  </View>
                  {(scanCtx.healthScore || scanCtx.skinScore || scanCtx.burnoutScore) && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Feather name="zap" size={11} color={GOLD} />
                      <Text style={[{ color: GOLD, fontFamily: "Lato_700Bold", fontSize: 10, letterSpacing: 1.2 }]}>
                        HEALTH SCANS INCLUDED
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Error */}
              {!loading && error && (
                <View style={{ gap: 16, alignItems: "center", paddingTop: 24 }}>
                  <Feather name="alert-circle" size={38} color="#AA4A4A" />
                  <Text style={[{
                    color: colors.foreground,
                    fontFamily: "Cormorant_700Bold",
                    fontSize: 22,
                    textAlign: "center",
                  }]}>
                    Analysis Unavailable
                  </Text>
                  <Text style={[{
                    color: colors.warmGray,
                    fontFamily: "Lato_300Light",
                    fontSize: 13,
                    textAlign: "center",
                    lineHeight: 20,
                  }]}>
                    {error}
                  </Text>
                  <Pressable
                    onPress={() => { setError(null); transition(4); }}
                    style={[styles.nextBtn, { backgroundColor: DARK }]}
                  >
                    <Text style={[styles.nextBtnText, { fontFamily: "Lato_700Bold" }]}>Try Again</Text>
                  </Pressable>
                </View>
              )}

              {/* Result */}
              {!loading && !error && result && (
                <View style={{ gap: 18 }}>
                  {/* Risk badge + score */}
                  <View style={{ alignItems: "center", gap: 12, paddingTop: 8 }}>
                    <View style={[
                      styles.riskBadge,
                      {
                        backgroundColor: `${RISK_COLOR[result.riskLevel]}16`,
                        borderColor: `${RISK_COLOR[result.riskLevel]}45`,
                      },
                    ]}>
                      <View style={[styles.riskDot, { backgroundColor: RISK_COLOR[result.riskLevel] }]} />
                      <Text style={[{
                        color: RISK_COLOR[result.riskLevel],
                        fontFamily: "Lato_700Bold",
                        fontSize: 11,
                        letterSpacing: 1.8,
                      }]}>
                        {RISK_LABEL[result.riskLevel]}
                      </Text>
                    </View>

                    <Text style={[{
                      color: RISK_COLOR[result.riskLevel],
                      fontFamily: "Cormorant_700Bold",
                      fontSize: 52,
                      lineHeight: 54,
                    }]}>
                      {result.severityScore}
                      <Text style={{ fontSize: 20, color: colors.warmGray }}> /100</Text>
                    </Text>
                    <Text style={[{
                      color: colors.mutedForeground,
                      fontFamily: "Lato_300Light",
                      fontSize: 12,
                      marginTop: -8,
                    }]}>
                      Symptom Severity Score
                    </Text>
                  </View>

                  {/* AI Clinical Summary */}
                  <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <View style={[styles.chipIcon, { backgroundColor: `${GOLD}16` }]}>
                        <Feather name="cpu" size={14} color={GOLD} />
                      </View>
                      <Text style={[{ color: GOLD, fontFamily: "Lato_700Bold", fontSize: 10, letterSpacing: 1.5 }]}>
                        AI CLINICAL SUMMARY
                      </Text>
                    </View>
                    <Text style={[{
                      color: colors.foreground,
                      fontFamily: "Lato_300Light",
                      fontSize: 15,
                      lineHeight: 25,
                    }]}>
                      {result.summary}
                    </Text>
                  </View>

                  {/* Likely Causes */}
                  {result.causes && result.causes.length > 0 && (
                    <View style={{ gap: 10 }}>
                      <Text style={[{ color: colors.warmGray, fontFamily: "Lato_700Bold", fontSize: 10, letterSpacing: 1.5 }]}>
                        LIKELY CAUSES
                      </Text>
                      <View style={{ gap: 8 }}>
                        {result.causes.map((cause, i) => (
                          <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                            <View style={[{
                              width: 22, height: 22, borderRadius: 11,
                              backgroundColor: `${RISK_COLOR[result.riskLevel]}15`,
                              alignItems: "center", justifyContent: "center", marginTop: 1,
                            }]}>
                              <Text style={[{
                                color: RISK_COLOR[result.riskLevel],
                                fontFamily: "Lato_700Bold",
                                fontSize: 10,
                              }]}>
                                {i + 1}
                              </Text>
                            </View>
                            <Text style={[{
                              color: colors.foreground,
                              fontFamily: "Lato_300Light",
                              fontSize: 14,
                              lineHeight: 22,
                              flex: 1,
                            }]}>
                              {cause}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Key Drivers */}
                  {result.keyDrivers && result.keyDrivers.length > 0 && (
                    <View style={{ gap: 10 }}>
                      <Text style={[{ color: colors.warmGray, fontFamily: "Lato_700Bold", fontSize: 10, letterSpacing: 1.5 }]}>
                        KEY DRIVERS
                      </Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        {result.keyDrivers.map((d) => (
                          <View key={d} style={[styles.driverPill, { backgroundColor: `${GOLD}10`, borderColor: `${GOLD}28` }]}>
                            <Feather name="alert-triangle" size={10} color={GOLD} />
                            <Text style={[{ color: GOLD, fontFamily: "Lato_700Bold", fontSize: 11 }]}>{d}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Recommendation */}
                  <View style={[styles.recoCard, {
                    backgroundColor: result.urgency ? "#AA4A4A0C" : `${GOLD}08`,
                    borderColor: result.urgency ? "#AA4A4A35" : `${GOLD}28`,
                  }]}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <Feather
                        name={result.urgency ? "alert-circle" : "heart"}
                        size={14}
                        color={result.urgency ? "#AA4A4A" : GOLD}
                      />
                      <Text style={[{
                        color: result.urgency ? "#AA4A4A" : GOLD,
                        fontFamily: "Lato_700Bold",
                        fontSize: 10,
                        letterSpacing: 1.5,
                      }]}>
                        {result.urgency ? "PRIORITY RECOMMENDATION" : "RECOMMENDED ACTION"}
                      </Text>
                    </View>
                    <Text style={[{
                      color: colors.foreground,
                      fontFamily: "Lato_400Regular",
                      fontSize: 14,
                      lineHeight: 23,
                    }]}>
                      {result.recommendation}
                    </Text>
                  </View>

                  {/* Smart routing CTAs */}
                  {result.consult_type === "iv" ? (
                    <Pressable
                      onPress={() => router.push("/services" as any)}
                      style={({ pressed }) => [styles.ctaBtn, { backgroundColor: GOLD, opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
                    >
                      <Feather name="droplet" size={17} color="#fff" />
                      <Text style={[styles.ctaBtnText, { fontFamily: "Lato_700Bold" }]}>
                        Book Recommended IV
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => {
                        setConsultPrefill({
                          typeId: (result.consult_type as any) ?? "gp",
                          specialty: result.specialty,
                        });
                        router.push("/extras/consult" as any);
                      }}
                      style={({ pressed }) => [styles.ctaBtn, { backgroundColor: DARK, opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
                    >
                      <Feather name="video" size={17} color="#fff" />
                      <Text style={[styles.ctaBtnText, { fontFamily: "Lato_700Bold" }]}>
                        {result.consult_type === "specialist"
                          ? `Consult ${result.specialty ?? "Specialist"}`
                          : result.consult_type === "nurse"
                            ? "Book Nurse Consultation"
                            : "Consult a GP"}
                      </Text>
                    </Pressable>
                  )}

                  {result.consult_type !== "iv" && (
                    <Pressable
                      onPress={() => router.push("/services" as any)}
                      style={({ pressed }) => [styles.ctaBtnOutline, { borderColor: GOLD, opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
                    >
                      <Feather name="droplet" size={17} color={GOLD} />
                      <Text style={[{ color: GOLD, fontFamily: "Lato_700Bold", fontSize: 15 }]}>
                        Browse IV Treatments
                      </Text>
                    </Pressable>
                  )}

                  <Pressable
                    onPress={() => {
                      setStep(1);
                      setSelectedIds(new Set());
                      setSeverities({});
                      setDuration(null);
                      setResult(null);
                      setError(null);
                    }}
                    style={{ alignItems: "center", paddingVertical: 8 }}
                  >
                    <Text style={[{
                      color: colors.warmGray,
                      fontFamily: "Lato_300Light",
                      fontSize: 12,
                      textDecorationLine: "underline",
                    }]}>
                      Start new assessment
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  backBtn: { paddingTop: 4 },
  eyebrow: { fontSize: 9, letterSpacing: 2.5, marginBottom: 2 },
  heading: { fontSize: 28, lineHeight: 30 },
  dots: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  dot: { height: 6, borderRadius: 3 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  stepDesc: { fontSize: 14, lineHeight: 22, marginBottom: 2 },

  symptomChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 1,
  },
  chipIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  chipLabel: { fontSize: 14 },

  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: 50,
    marginTop: 6,
  },
  nextBtnText: { color: "#fff", fontSize: 15 },

  severityCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  severityBtn: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  reviewCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 14,
    paddingBottom: 12,
  },
  reviewSection: { fontSize: 10, letterSpacing: 1.5, flex: 1 },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  reviewIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingOrb: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 50,
    borderWidth: 1,
  },
  riskDot: { width: 8, height: 8, borderRadius: 4 },

  summaryCard: { borderRadius: 20, borderWidth: 1, padding: 20 },

  driverPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 50,
    borderWidth: 1,
  },

  recoCard: { borderRadius: 18, borderWidth: 1, padding: 18 },

  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: 50,
  },
  ctaBtnText: { color: "#fff", fontSize: 15 },
  ctaBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: 50,
    borderWidth: 1.5,
  },
});

