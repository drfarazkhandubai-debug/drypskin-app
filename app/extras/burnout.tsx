import React, { useState, useRef } from "react";
import {
  Animated,
  Easing,
  Linking,
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
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

interface BurnoutQ {
  id: string;
  text: string;
  options: { label: string; value: number }[];
}

// High values = LOW burnout risk (healthy state)
const QUESTIONS: BurnoutQ[] = [
  {
    id: "exhaustion",
    text: "How exhausted do you feel at the end of each day?",
    options: [
      { label: "Completely drained — can't function", value: 5 },
      { label: "Very tired — struggling", value: 25 },
      { label: "Moderately tired — manageable", value: 55 },
      { label: "Mildly tired — normal tiredness", value: 80 },
      { label: "Energised — feeling fulfilled", value: 100 },
    ],
  },
  {
    id: "overwhelm",
    text: "How often do you feel overwhelmed or unable to cope?",
    options: [
      { label: "Almost always", value: 5 },
      { label: "Very often — most days", value: 25 },
      { label: "Sometimes — a few times a week", value: 55 },
      { label: "Rarely — occasionally", value: 85 },
      { label: "Never — I manage well", value: 100 },
    ],
  },
  {
    id: "sleep_stress",
    text: "Do you struggle to sleep due to stress or racing thoughts?",
    options: [
      { label: "Every night", value: 5 },
      { label: "Most nights", value: 25 },
      { label: "Frequently — several nights/week", value: 45 },
      { label: "Occasionally — once a week", value: 70 },
      { label: "Rarely or never", value: 100 },
    ],
  },
  {
    id: "motivation",
    text: "How motivated do you feel for daily tasks and work?",
    options: [
      { label: "No motivation at all", value: 5 },
      { label: "Very low — just going through motions", value: 25 },
      { label: "Moderate — some good days", value: 55 },
      { label: "Good — mostly engaged", value: 80 },
      { label: "Highly motivated and purposeful", value: 100 },
    ],
  },
  {
    id: "mood",
    text: "How often do you feel irritable, anxious or emotionally flat?",
    options: [
      { label: "Constantly", value: 5 },
      { label: "Very often — daily", value: 25 },
      { label: "Sometimes — a few times a week", value: 55 },
      { label: "Rarely", value: 85 },
      { label: "Almost never — emotionally stable", value: 100 },
    ],
  },
  {
    id: "recovery",
    text: "When did you last have a full rest and recovery day?",
    options: [
      { label: "I can't remember", value: 5 },
      { label: "Over 3 months ago", value: 20 },
      { label: "About a month ago", value: 50 },
      { label: "Last week", value: 80 },
      { label: "I take one regularly", value: 100 },
    ],
  },
  {
    id: "physical",
    text: "Are you experiencing physical symptoms (headaches, tension, gut issues)?",
    options: [
      { label: "Yes — severe and frequent", value: 5 },
      { label: "Yes — moderately often", value: 30 },
      { label: "Occasionally — mild symptoms", value: 60 },
      { label: "Rarely — almost never", value: 85 },
      { label: "No physical symptoms", value: 100 },
    ],
  },
];

interface Recovery {
  name: string;
  type: string;
  reason: string;
}

function getRecoveries(answers: Record<string, number>, burnoutScore: number): Recovery[] {
  const recs: Recovery[] = [];
  const risk = 100 - burnoutScore; // Higher = more burned out

  if (risk >= 60) {
    recs.push({ name: "NAD+ IV Therapy", type: "IV Therapy", reason: "Restores cellular energy and neurological function at the deepest level" });
  }
  if (answers.sleep_stress < 60) {
    recs.push({ name: "Recovery Protocol", type: "Protocol", reason: "Peptide + IV combo designed to calm the nervous system and restore sleep" });
  }
  if (answers.exhaustion < 55) {
    recs.push({ name: "IV Energy Drip", type: "IV Therapy", reason: "Rapid infusion of B-vitamins, magnesium and amino acids for cellular energy" });
  }
  if (answers.mood < 55) {
    recs.push({ name: "Cognition Protocol", type: "Protocol", reason: "Nootropic peptides + IV therapy to lift mood and sharpen mental clarity" });
  }
  if (answers.physical < 55) {
    recs.push({ name: "IV Detox Drip", type: "IV Therapy", reason: "Flushes stress-related toxins and supports adrenal recovery" });
  }
  if (burnoutScore >= 70) {
    recs.push({ name: "Longevity Protocol", type: "Protocol", reason: "Maintain resilience and prevent future burnout with elite wellness optimization" });
  }

  if (recs.length === 0) {
    recs.push({ name: "IV Immunity Boost", type: "IV Therapy", reason: "Strengthen your foundation with essential micronutrients" });
  }
  return recs.slice(0, 3);
}

const TYPE_COLORS: Record<string, string> = {
  "IV Therapy": "#4A7AAA",
  "Protocol": "#5C7A6B",
};

export default function BurnoutIndexScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [complete, setComplete] = useState(false);
  const [score, setScore] = useState(0);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  const ACCENT = "#4A5B8A";
  const RISK_COLOR = "#B05A3A";
  const total = QUESTIONS.length;
  const current = QUESTIONS[step];

  const selectOption = (value: number) => {
    const newAnswers = { ...answers, [current.id]: value };
    setAnswers(newAnswers);

    Animated.timing(progressAnim, { toValue: (step + 1) / total, duration: 400, useNativeDriver: false }).start();

    if (step < total - 1) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -40, duration: 180, useNativeDriver: true }),
      ]).start(() => {
        setStep((s) => s + 1);
        slideAnim.setValue(40);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]).start();
      });
    } else {
      const vals = Object.values(newAnswers);
      const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      setScore(avg);

      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setComplete(true);
        setTimeout(() => {
          Animated.timing(scoreAnim, { toValue: avg, duration: 1800, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
          Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        }, 100);

        if (auth.user) {
          const recs = getRecoveries(newAnswers, avg).map((r) => r.name);
          auth.saveHealthScan({ scan_type: "burnout", answers: newAnswers, score: avg, recommendations: recs });
        }
      });
    }
  };

  const riskLevel = 100 - score;
  const riskLabel = riskLevel >= 70 ? "High Burnout Risk" : riskLevel >= 45 ? "Moderate Risk" : riskLevel >= 20 ? "Low Risk" : "Resilient";
  const scoreColor = riskLevel >= 70 ? "#B05A3A" : riskLevel >= 45 ? "#C4956A" : "#5C7A6B";
  const recs = complete ? getRecoveries(answers, score) : [];

  const bookWhatsApp = () => {
    const msg = `Hello Drypskin! My Burnout Index score is ${riskLevel}/100 risk (${riskLabel}). Wellness score: ${score}/100. Recommended: ${recs.map((r) => r.name).join(", ")}. Please book a recovery consultation.`;
    Linking.openURL(`https://wa.me/971586078532?text=${encodeURIComponent(msg)}`);
  };

  const restart = () => {
    setStep(0); setAnswers({}); setComplete(false); setScore(0);
    progressAnim.setValue(0); scoreAnim.setValue(0); slideAnim.setValue(0); fadeAnim.setValue(1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: ACCENT }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
          <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Extras</Text>
        </Pressable>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>STRESS & RECOVERY</Text>
            <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>Burnout Index</Text>
          </View>
          {!complete && (
            <Text style={[styles.counter, { color: "rgba(255,255,255,0.55)", fontFamily: "Lato_300Light" }]}>
              {step + 1} / {total}
            </Text>
          )}
        </View>
        <View style={[styles.progressTrack, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Animated.View
            style={[styles.progressFill, { backgroundColor: "rgba(255,255,255,0.85)", width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 60 + bottomPad }}
        keyboardShouldPersistTaps="handled"
      >
        {!complete ? (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
            <View style={{ alignItems: "center", marginBottom: 20, marginTop: 8 }}>
              <View style={[styles.iconCircle, { backgroundColor: `${ACCENT}15` }]}>
                <Feather name="activity" size={28} color={ACCENT} />
              </View>
            </View>
            <Text style={[styles.questionText, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              {current.text}
            </Text>
            <View style={{ gap: 10, marginTop: 8 }}>
              {current.options.map((opt, i) => (
                <Pressable
                  key={i}
                  onPress={() => selectOption(opt.value)}
                  style={({ pressed }) => [
                    styles.optionBtn,
                    { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
                  ]}
                >
                  <View style={[styles.optionDot, { borderColor: ACCENT }]} />
                  <Text style={[styles.optionText, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}>{opt.label}</Text>
                  <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </View>
            <View style={[styles.tipCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Feather name="heart" size={13} color={colors.sage} />
              <Text style={[styles.tipText, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
                Be honest — this assessment is entirely private and confidential
              </Text>
            </View>
          </Animated.View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim, gap: 20 }}>
            {/* Burnout risk meter */}
            <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: `${scoreColor}40`, borderLeftColor: scoreColor, borderLeftWidth: 4 }]}>
              <Text style={[styles.scanComplete, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>BURNOUT ASSESSMENT</Text>
              <Text style={[styles.resultTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>Your Burnout Index</Text>

              {/* Dual display: Risk score + Wellness score */}
              <View style={{ flexDirection: "row", gap: 16 }}>
                <View style={[styles.dualCard, { backgroundColor: `${scoreColor}10`, borderColor: `${scoreColor}25`, flex: 1 }]}>
                  <Text style={[{ fontSize: 10, color: scoreColor, fontFamily: "Lato_700Bold", letterSpacing: 1.5 }]}>RISK LEVEL</Text>
                  <Text style={[{ fontSize: 44, lineHeight: 46, color: scoreColor, fontFamily: "Cormorant_700Bold" }]}>{riskLevel}</Text>
                  <Text style={[{ fontSize: 11, color: colors.warmGray, fontFamily: "Lato_300Light" }]}>/ 100 risk</Text>
                </View>
                <View style={[styles.dualCard, { backgroundColor: "#5C7A6B10", borderColor: "#5C7A6B25", flex: 1 }]}>
                  <Text style={[{ fontSize: 10, color: "#5C7A6B", fontFamily: "Lato_700Bold", letterSpacing: 1.5 }]}>RESILIENCE</Text>
                  <Animated.Text style={[{ fontSize: 44, lineHeight: 46, color: "#5C7A6B", fontFamily: "Cormorant_700Bold" }]}>
                    {scoreAnim.interpolate({ inputRange: [0, score], outputRange: ["0", score.toString()] })}
                  </Animated.Text>
                  <Text style={[{ fontSize: 11, color: colors.warmGray, fontFamily: "Lato_300Light" }]}>/ 100 score</Text>
                </View>
              </View>

              <View style={[styles.riskBadge, { backgroundColor: scoreColor }]}>
                <Text style={[styles.badgeText, { fontFamily: "Lato_700Bold" }]}>{riskLabel}</Text>
              </View>

              {/* Risk meter */}
              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 11, color: colors.warmGray, fontFamily: "Lato_300Light" }}>Burnout Risk Level</Text>
                <View style={[{ height: 10, borderRadius: 5, overflow: "hidden" }, { backgroundColor: colors.secondary }]}>
                  <View style={{ height: 10, borderRadius: 5, backgroundColor: scoreColor, width: `${riskLevel}%` as any }} />
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 9, color: colors.mutedForeground, fontFamily: "Lato_300Light" }}>Low Risk</Text>
                  <Text style={{ fontSize: 9, color: colors.mutedForeground, fontFamily: "Lato_300Light" }}>High Risk</Text>
                </View>
              </View>

              {/* Category breakdown */}
              {[
                { key: "exhaustion", label: "Physical Exhaustion", icon: "battery" },
                { key: "motivation", label: "Motivation", icon: "trending-up" },
                { key: "sleep_stress", label: "Sleep Quality", icon: "moon" },
                { key: "mood", label: "Emotional State", icon: "heart" },
              ].map((item) => {
                const val = answers[item.key] ?? 0;
                const c = val >= 70 ? "#5C7A6B" : val >= 45 ? "#C4956A" : "#B05A3A";
                return (
                  <View key={item.key} style={{ gap: 4 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Feather name={item.icon as any} size={12} color={c} />
                        <Text style={{ fontSize: 12, color: colors.warmGray, fontFamily: "Lato_400Regular" }}>{item.label}</Text>
                      </View>
                      <Text style={{ fontSize: 12, color: c, fontFamily: "Lato_700Bold" }}>{val}%</Text>
                    </View>
                    <View style={[{ height: 4, borderRadius: 2, overflow: "hidden" }, { backgroundColor: colors.secondary }]}>
                      <View style={{ height: 4, borderRadius: 2, backgroundColor: c, width: `${val}%` as any }} />
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Recovery plan */}
            <View style={[styles.recoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.recoTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>Recovery Plan</Text>
              <Text style={{ fontSize: 13, color: colors.warmGray, fontFamily: "Lato_300Light" }}>Personalised based on your burnout profile</Text>

              {recs.map((r, i) => {
                const tColor = TYPE_COLORS[r.type] ?? ACCENT;
                return (
                  <View key={i} style={[styles.treatRow, { borderTopColor: colors.border, borderTopWidth: i > 0 ? 1 : 0 }]}>
                    <View style={[styles.catBadge, { backgroundColor: `${tColor}15` }]}>
                      <Text style={[styles.catText, { color: tColor, fontFamily: "Lato_700Bold" }]}>{r.type}</Text>
                    </View>
                    <Text style={[styles.treatName, { color: colors.foreground, fontFamily: "Lato_700Bold" }]}>{r.name}</Text>
                    <Text style={[styles.treatReason, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>{r.reason}</Text>
                  </View>
                );
              })}

              <Pressable
                onPress={bookWhatsApp}
                style={({ pressed }) => [styles.bookBtn, { backgroundColor: ACCENT, opacity: pressed ? 0.85 : 1 }]}
              >
                <Feather name="message-circle" size={18} color="#fff" />
                <Text style={[styles.bookBtnText, { fontFamily: "Lato_700Bold" }]}>Book Recovery Consultation</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={restart}
              style={({ pressed }) => [styles.restartBtn, { borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
            >
              <Feather name="refresh-cw" size={15} color={colors.warmGray} />
              <Text style={{ fontSize: 14, color: colors.warmGray, fontFamily: "Lato_400Regular" }}>Retake Assessment</Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 },
  heroLabel: { color: "rgba(255,255,255,0.5)", fontSize: 10, letterSpacing: 2.5 },
  heroTitle: { color: "#fff", fontSize: 38, lineHeight: 40 },
  counter: { fontSize: 28, lineHeight: 30 },
  progressTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },
  iconCircle: { width: 70, height: 70, borderRadius: 35, alignItems: "center", justifyContent: "center" },
  questionText: { fontSize: 30, lineHeight: 36, marginBottom: 20 },
  optionBtn: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  optionDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, flexShrink: 0 },
  optionText: { flex: 1, fontSize: 15, lineHeight: 20 },
  tipCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 16 },
  tipText: { flex: 1, fontSize: 12, lineHeight: 18 },
  resultCard: { borderRadius: 20, borderWidth: 1, padding: 22, gap: 14 },
  scanComplete: { fontSize: 10, letterSpacing: 3 },
  resultTitle: { fontSize: 32, lineHeight: 34 },
  dualCard: { borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 2 },
  riskBadge: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 8 },
  badgeText: { color: "#fff", fontSize: 13 },
  recoCard: { borderRadius: 20, borderWidth: 1, padding: 22, gap: 14 },
  recoTitle: { fontSize: 30 },
  treatRow: { paddingTop: 12, gap: 4 },
  catBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catText: { fontSize: 10, letterSpacing: 1 },
  treatName: { fontSize: 16 },
  treatReason: { fontSize: 13, lineHeight: 18 },
  bookBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 50 },
  bookBtnText: { color: "#fff", fontSize: 15 },
  restartBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50, borderWidth: 1 },
});
