import React, { useState, useRef } from "react";
import { Disclaimer } from "@/components/Disclaimer";
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

interface SkinQuestion {
  id: string;
  text: string;
  options: { label: string; value: number; concern?: string }[];
}

const QUESTIONS: SkinQuestion[] = [
  {
    id: "type",
    text: "What best describes your skin type?",
    options: [
      { label: "Normal — balanced, few issues", value: 90 },
      { label: "Dry — tight, flaky, dull", value: 50 },
      { label: "Oily — shiny, prone to breakouts", value: 55 },
      { label: "Combination — oily T-zone, dry cheeks", value: 65 },
      { label: "Sensitive — reactive, easily irritated", value: 45 },
    ],
  },
  {
    id: "concern",
    text: "What is your primary skin concern?",
    options: [
      { label: "Ageing & wrinkles", value: 40, concern: "aging" },
      { label: "Acne & breakouts", value: 40, concern: "acne" },
      { label: "Pigmentation & dark spots", value: 40, concern: "pigmentation" },
      { label: "Dullness & uneven tone", value: 45, concern: "dullness" },
      { label: "No major concern", value: 95, concern: "none" },
    ],
  },
  {
    id: "severity",
    text: "How visible are your skin concerns?",
    options: [
      { label: "Severe — very noticeable", value: 15 },
      { label: "Moderate — clearly visible", value: 40 },
      { label: "Mild — slightly visible", value: 65 },
      { label: "Minimal — barely noticeable", value: 85 },
      { label: "None visible", value: 100 },
    ],
  },
  {
    id: "sun",
    text: "How much sun exposure do you get?",
    options: [
      { label: "Very high — outdoors most of the day", value: 30 },
      { label: "High — outdoor activities daily", value: 50 },
      { label: "Moderate — some outdoor time", value: 70 },
      { label: "Minimal — mostly indoors", value: 90 },
    ],
  },
  {
    id: "routine",
    text: "How consistent is your skincare routine?",
    options: [
      { label: "None — I don't follow a routine", value: 20 },
      { label: "Basic — cleanse only", value: 45 },
      { label: "Moderate — cleanse + moisturise + SPF", value: 70 },
      { label: "Comprehensive — full multi-step routine", value: 95 },
    ],
  },
  {
    id: "hydration",
    text: "How hydrated does your skin feel through the day?",
    options: [
      { label: "Very dry — tight and uncomfortable", value: 20 },
      { label: "Dry — noticeable dryness", value: 45 },
      { label: "Moderate — sometimes dry", value: 65 },
      { label: "Hydrated — comfortable all day", value: 90 },
    ],
  },
];

interface Treatment {
  name: string;
  category: string;
  reason: string;
}

function getRecommendations(answers: Record<string, any>, score: number): Treatment[] {
  const recs: Treatment[] = [];
  const concern = answers.concern_raw ?? "";

  if (concern === "aging" || answers.type < 55) {
    recs.push({ name: "Profhilo® Bio-Remodelling", category: "Aesthetics", reason: "Deep skin hydration and collagen stimulation for lifted, youthful skin" });
  }
  if (concern === "acne") {
    recs.push({ name: "IPL Photofacial", category: "Laser & Light", reason: "Targets active acne bacteria and reduces inflammation at the source" });
  }
  if (concern === "pigmentation" || answers.sun < 60) {
    recs.push({ name: "PicoSure Pro Laser", category: "Laser & Light", reason: "Breaks down pigment clusters for an even, luminous complexion" });
  }
  if (concern === "dullness" || answers.hydration < 55) {
    recs.push({ name: "IV Glow Drip", category: "IV Therapy", reason: "Glutathione + vitamins delivered directly for radiant skin from within" });
  }
  if (score >= 70) {
    recs.push({ name: "Biorevitalisation Injections", category: "Aesthetics", reason: "Maintain and enhance already-healthy skin with targeted hydration" });
  }
  if (answers.routine < 45) {
    recs.push({ name: "HydraFacial MD®", category: "Aesthetics", reason: "Instant deep cleanse, extraction and hydration — a strong starting point" });
  }

  if (recs.length === 0) {
    recs.push({ name: "Skin Consultation", category: "Aesthetics", reason: "A personalised assessment with our skin specialist" });
  }
  return recs.slice(0, 3);
}

const CATEGORY_COLORS: Record<string, string> = {
  "Aesthetics": "#8A5A7A",
  "Laser & Light": "#4A7AAA",
  "IV Therapy": "#5C7A6B",
};

export default function SkinScoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [complete, setComplete] = useState(false);
  const [score, setScore] = useState(0);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  const ACCENT = "#8A5A7A";
  const total = QUESTIONS.length;
  const current = QUESTIONS[step];

  const selectOption = (opt: SkinQuestion["options"][0]) => {
    const newAnswers = {
      ...answers,
      [current.id]: opt.value,
      ...(opt.concern ? { concern_raw: opt.concern } : {}),
    };
    setAnswers(newAnswers);

    Animated.timing(progressAnim, {
      toValue: (step + 1) / total,
      duration: 400,
      useNativeDriver: false,
    }).start();

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
      const vals = Object.entries(newAnswers)
        .filter(([k]) => !k.endsWith("_raw"))
        .map(([, v]) => v as number);
      const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      setScore(avg);

      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setComplete(true);
        setTimeout(() => {
          Animated.timing(scoreAnim, { toValue: avg, duration: 1800, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
          Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        }, 100);

        if (auth.user) {
          const recs = getRecommendations(newAnswers, avg).map((r) => r.name);
          auth.saveHealthScan({ scan_type: "skin", answers: newAnswers, score: avg, recommendations: recs });
        }
      });
    }
  };

  const scoreColor = score >= 70 ? "#5C7A6B" : score >= 50 ? "#8A5A7A" : "#B05A3A";
  const scoreLabel = score >= 70 ? "Healthy Skin" : score >= 50 ? "Moderate Concerns" : "Needs Professional Care";
  const recs = complete ? getRecommendations(answers, score) : [];

  const bookWhatsApp = () => {
    const msg = `Hello Drypskin! My Skin Score is ${score}/100 (${scoreLabel}). Recommended: ${recs.map((r) => r.name).join(", ")}. Please advise.`;
    Linking.openURL(`https://wa.me/971586078532?text=${encodeURIComponent(msg)}`);
  };

  const restart = () => {
    setStep(0); setAnswers({}); setComplete(false); setScore(0);
    progressAnim.setValue(0); scoreAnim.setValue(0); slideAnim.setValue(0); fadeAnim.setValue(1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: ACCENT }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
          <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Extras</Text>
        </Pressable>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>SKIN ANALYSIS</Text>
            <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>Skin Score</Text>
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
                <Feather name="sun" size={28} color={ACCENT} />
              </View>
            </View>

            <Text style={[styles.questionText, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              {current.text}
            </Text>

            <View style={{ gap: 10, marginTop: 8 }}>
              {current.options.map((opt, i) => (
                <Pressable
                  key={i}
                  onPress={() => selectOption(opt)}
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
          </Animated.View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim, gap: 20 }}>
            {/* Score card */}
            <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: `${scoreColor}40`, borderLeftColor: scoreColor, borderLeftWidth: 4 }]}>
              <Text style={[styles.scanComplete, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>SKIN ANALYSIS COMPLETE</Text>
              <Text style={[styles.resultTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>Your Skin Score</Text>

              <View style={styles.scoreRow}>
                <Animated.Text style={[styles.scoreBig, { color: scoreColor, fontFamily: "Cormorant_700Bold" }]}>
                  {scoreAnim.interpolate({ inputRange: [0, score], outputRange: ["0", score.toString()] })}
                </Animated.Text>
                <Text style={[styles.scoreOf, { color: colors.warmGray, fontFamily: "Cormorant_400Regular" }]}>/ 100</Text>
              </View>

              <View style={[styles.badge, { backgroundColor: scoreColor }]}>
                <Text style={[styles.badgeText, { fontFamily: "Lato_700Bold" }]}>{scoreLabel}</Text>
              </View>

              <View style={[{ height: 8, borderRadius: 4, overflow: "hidden" }, { backgroundColor: colors.secondary }]}>
                <View style={{ height: 8, borderRadius: 4, backgroundColor: scoreColor, width: `${score}%` as any }} />
              </View>

              {/* Sub-scores */}
              {[
                { key: "severity", label: "Concern Severity", icon: "alert-circle" },
                { key: "hydration", label: "Skin Hydration", icon: "droplet" },
                { key: "routine", label: "Skincare Routine", icon: "star" },
                { key: "sun", label: "Sun Protection", icon: "sun" },
              ].map((item) => {
                const val = answers[item.key] ?? 0;
                const c = val >= 70 ? "#5C7A6B" : val >= 50 ? ACCENT : "#B05A3A";
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

            {/* Treatments */}
            <View style={[styles.recoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.recoTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>Recommended Treatments</Text>
              <Text style={[{ fontSize: 13, color: colors.warmGray, fontFamily: "Lato_300Light" }]}>Personalised for your skin profile</Text>
              {recs.map((r, i) => {
                const catColor = CATEGORY_COLORS[r.category] ?? "#5C7A6B";
                return (
                  <View key={i} style={[styles.treatRow, { borderTopColor: colors.border, borderTopWidth: i > 0 ? 1 : 0 }]}>
                    <View style={[styles.catBadge, { backgroundColor: `${catColor}18` }]}>
                      <Text style={[styles.catText, { color: catColor, fontFamily: "Lato_700Bold" }]}>{r.category}</Text>
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
                <Text style={[styles.bookBtnText, { fontFamily: "Lato_700Bold" }]}>Book Skin Consultation</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={restart}
              style={({ pressed }) => [styles.restartBtn, { borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
            >
              <Feather name="refresh-cw" size={15} color={colors.warmGray} />
              <Text style={[styles.restartText, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>Retake Assessment</Text>
            </Pressable>

            <Disclaimer />
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
  resultCard: { borderRadius: 20, borderWidth: 1, padding: 22, gap: 14 },
  scanComplete: { fontSize: 10, letterSpacing: 3 },
  resultTitle: { fontSize: 32, lineHeight: 34 },
  scoreRow: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  scoreBig: { fontSize: 72, lineHeight: 74 },
  scoreOf: { fontSize: 24, marginBottom: 8 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 8 },
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
  restartText: { fontSize: 14 },
});
