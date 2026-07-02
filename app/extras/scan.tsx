import React, { useState, useRef, useEffect } from "react";
import { recordScanResult, recordMoodSelection } from "@/lib/personalization";
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

interface Question {
  id: string;
  text: string;
  options: { label: string; value: number }[];
}

const QUESTIONS: Question[] = [
  {
    id: "sleep",
    text: "How would you rate your sleep quality?",
    options: [
      { label: "Very Poor — I wake often", value: 10 },
      { label: "Poor — Rarely rested", value: 30 },
      { label: "Moderate — Sometimes rested", value: 60 },
      { label: "Good — Usually rested", value: 80 },
      { label: "Excellent — Always refreshed", value: 100 },
    ],
  },
  {
    id: "energy",
    text: "How is your energy level today?",
    options: [
      { label: "Exhausted — Barely functioning", value: 10 },
      { label: "Low — Struggling through the day", value: 30 },
      { label: "Moderate — Getting by", value: 55 },
      { label: "Good — Feeling capable", value: 80 },
      { label: "High — Full of energy", value: 100 },
    ],
  },
  {
    id: "exercise",
    text: "How often do you exercise each week?",
    options: [
      { label: "Never", value: 10 },
      { label: "1–2 times per week", value: 40 },
      { label: "3–4 times per week", value: 75 },
      { label: "Daily or more", value: 100 },
    ],
  },
  {
    id: "hydration",
    text: "How much water do you drink daily?",
    options: [
      { label: "Less than 1 litre", value: 20 },
      { label: "1–2 litres", value: 55 },
      { label: "2–3 litres", value: 80 },
      { label: "More than 3 litres", value: 100 },
    ],
  },
  {
    id: "diet",
    text: "How would you describe your diet?",
    options: [
      { label: "Mostly processed & fast food", value: 10 },
      { label: "Mixed — some healthy choices", value: 50 },
      { label: "Healthy — balanced meals", value: 80 },
      { label: "Very clean — whole foods", value: 100 },
    ],
  },
  {
    id: "stress",
    text: "How stressed do you feel on a typical day?",
    options: [
      { label: "Extremely stressed", value: 10 },
      { label: "Quite stressed", value: 30 },
      { label: "Mildly stressed", value: 60 },
      { label: "Occasionally stressed", value: 80 },
      { label: "Calm and in control", value: 100 },
    ],
  },
  {
    id: "skin",
    text: "How would you rate your current skin health?",
    options: [
      { label: "Poor — visible concerns", value: 20 },
      { label: "Fair — minor issues", value: 50 },
      { label: "Good — mostly clear", value: 80 },
      { label: "Excellent — radiant skin", value: 100 },
    ],
  },
  {
    id: "focus",
    text: "How is your mental focus and clarity?",
    options: [
      { label: "Very foggy — hard to concentrate", value: 10 },
      { label: "Foggy — easily distracted", value: 35 },
      { label: "Moderate — sometimes sharp", value: 60 },
      { label: "Good — mostly focused", value: 80 },
      { label: "Laser sharp — peak clarity", value: 100 },
    ],
  },
  {
    id: "fatigue",
    text: "How often do you feel fatigued mid-day?",
    options: [
      { label: "Always — constant fatigue", value: 10 },
      { label: "Often — most afternoons", value: 35 },
      { label: "Sometimes — occasional slump", value: 65 },
      { label: "Rarely — sustained energy", value: 100 },
    ],
  },
  {
    id: "goal",
    text: "What is your primary wellness goal?",
    options: [
      { label: "Boost energy & vitality", value: 70 },
      { label: "Improve skin & appearance", value: 70 },
      { label: "Lose weight & sculpt body", value: 70 },
      { label: "Recover & reduce stress", value: 70 },
      { label: "Longevity & prevention", value: 70 },
    ],
  },
];

interface ServiceRec {
  name: string;
  reason: string;
}

function getRecommendations(answers: Record<string, number>, total: number): ServiceRec[] {
  const recs: ServiceRec[] = [];
  if (answers.energy < 60 || answers.fatigue < 60) recs.push({ name: "IV Energy Drip", reason: "Restores cellular energy and combats fatigue" });
  if (answers.stress < 60) recs.push({ name: "Recovery Protocol", reason: "Reduces cortisol and restores balance" });
  if (answers.sleep < 60) recs.push({ name: "NAD+ IV Therapy", reason: "Supports deep sleep and cellular repair" });
  if (answers.skin < 60) recs.push({ name: "IV Glow Drip", reason: "Brightens and nourishes skin from within" });
  if (answers.hydration < 60) recs.push({ name: "IV Immunity Boost", reason: "Rapid rehydration and immune support" });
  if (total >= 75) recs.push({ name: "Longevity Protocol", reason: "Optimise already-strong health for peak performance" });
  if (recs.length === 0) recs.push({ name: "IV Detox Drip", reason: "Cleanse and reset your system" });
  return recs.slice(0, 3);
}

export default function HealthScanScreen() {
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
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for the scan feel
  useEffect(() => {
    if (!complete) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [complete]);

  const totalQ = QUESTIONS.length;
  const currentQ = QUESTIONS[step];

  const selectOption = (questionId: string, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    // Animate progress
    Animated.timing(progressAnim, {
      toValue: (step + 1) / totalQ,
      duration: 400,
      useNativeDriver: false,
    }).start();

    if (step < totalQ - 1) {
      // Transition to next question
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
      // Calculate and reveal score
      const vals = Object.values(newAnswers);
      const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      setScore(avg);

      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setComplete(true);
        setTimeout(() => {
          Animated.timing(scoreAnim, {
            toValue: avg,
            duration: 1800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }).start();
          Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        }, 100);

        // Save to server if logged in
        if (auth.user) {
          auth.saveHealthScan({
            scan_type: "general",
            answers: newAnswers,
            score: avg,
            recommendations: getRecommendations(newAnswers, avg).map((r) => r.name),
          });
        }
        // Always record locally for personalization & prediction engines
        recordScanResult({
          overallScore: avg,
          energyScore:   newAnswers.energy,
          sleepScore:    newAnswers.sleep,
          stressScore:   newAnswers.stress,
          skinScore:     newAnswers.skin,
        });
        // Record mood preference from energy + fatigue scores
        if (newAnswers.energy < 40 || newAnswers.fatigue < 60) {
          recordMoodSelection("tired");
        } else if (newAnswers.skin < 60) {
          recordMoodSelection("glow");
        } else {
          recordMoodSelection("balanced");
        }
      });
    }
  };

  const scoreColor = score >= 75 ? "#5C7A6B" : score >= 55 ? "#C4956A" : "#B05A3A";
  const scoreLabel = score >= 75 ? "Excellent" : score >= 55 ? "Good" : score >= 35 ? "Fair" : "Needs Attention";
  const recs = complete ? getRecommendations(answers, score) : [];

  const bookWhatsApp = () => {
    const msg = `Hello Drypskin! I just completed a 2-Minute Health Scan with a score of ${score}/100 (${scoreLabel}). I'm interested in: ${recs.map((r) => r.name).join(", ")}. Please advise on the best treatment plan.`;
    Linking.openURL(`https://wa.me/971586078532?text=${encodeURIComponent(msg)}`);
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setComplete(false);
    setScore(0);
    progressAnim.setValue(0);
    scoreAnim.setValue(0);
    slideAnim.setValue(0);
    fadeAnim.setValue(1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: "#1a1a1a" }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
          <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Extras</Text>
        </Pressable>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>DRYPSKIN</Text>
            <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>Health Scan</Text>
          </View>
          {!complete && (
            <Text style={[styles.counter, { color: "rgba(255,255,255,0.5)", fontFamily: "Lato_300Light" }]}>
              {step + 1} / {totalQ}
            </Text>
          )}
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: "#C4956A",
                width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
              },
            ]}
          />
        </View>
        {!complete && (
          <Text style={[styles.estTime, { color: "rgba(255,255,255,0.4)", fontFamily: "Lato_300Light" }]}>
            ~2 minutes · {totalQ - step - 1} questions remaining
          </Text>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 60 + bottomPad, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {!complete ? (
          // ── Question view ──────────────────────────────────────────────
          <Animated.View
            style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}
          >
            {/* Scan pulse indicator */}
            <View style={styles.scanIndicator}>
              <Animated.View
                style={[
                  styles.scanPulse,
                  { backgroundColor: "#C4956A18", transform: [{ scale: pulseAnim }] },
                ]}
              />
              <View style={[styles.scanDot, { backgroundColor: "#C4956A" }]} />
            </View>

            <Text style={[styles.questionText, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              {currentQ.text}
            </Text>

            <View style={{ gap: 10, marginTop: 8 }}>
              {currentQ.options.map((opt, i) => (
                <Pressable
                  key={i}
                  onPress={() => selectOption(currentQ.id, opt.value)}
                  style={({ pressed }) => [
                    styles.optionBtn,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      opacity: pressed ? 0.85 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  <View style={[styles.optionDot, { borderColor: colors.border }]} />
                  <Text style={[styles.optionText, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}>
                    {opt.label}
                  </Text>
                  <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </View>

            <View style={[styles.tipCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Feather name="info" size={13} color={colors.sage} />
              <Text style={[styles.tipText, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
                Answer honestly for the most accurate wellness recommendations
              </Text>
            </View>
          </Animated.View>
        ) : (
          // ── Results view ───────────────────────────────────────────────
          <Animated.View style={{ opacity: fadeAnim, gap: 20 }}>
            {/* Score card */}
            <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: `${scoreColor}40`, borderLeftColor: scoreColor, borderLeftWidth: 4 }]}>
              <Text style={[styles.scanComplete, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                SCAN COMPLETE
              </Text>
              <Text style={[styles.resultTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
                Your Health Score
              </Text>

              <View style={styles.scoreBigRow}>
                <Animated.Text
                  style={[styles.scoreBig, { color: scoreColor, fontFamily: "Cormorant_700Bold" }]}
                >
                  {scoreAnim.interpolate({ inputRange: [0, score], outputRange: ["0", score.toString()] })}
                </Animated.Text>
                <Text style={[styles.scoreOf, { color: colors.warmGray, fontFamily: "Cormorant_400Regular" }]}>/ 100</Text>
              </View>

              <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
                <Text style={[styles.scoreBadgeText, { fontFamily: "Lato_700Bold" }]}>{scoreLabel}</Text>
              </View>

              <View style={[styles.scoreBar, { backgroundColor: colors.secondary }]}>
                <View style={[styles.scoreBarFill, { width: `${score}%` as any, backgroundColor: scoreColor }]} />
              </View>

              {/* Category scores */}
              <View style={{ gap: 10 }}>
                {[
                  { key: "sleep", label: "Sleep Quality", icon: "moon" },
                  { key: "energy", label: "Energy Level", icon: "zap" },
                  { key: "stress", label: "Stress Resilience", icon: "wind" },
                  { key: "focus", label: "Mental Clarity", icon: "eye" },
                ].map((item) => {
                  const val = answers[item.key] ?? 0;
                  const c = val >= 75 ? "#5C7A6B" : val >= 50 ? "#C4956A" : "#B05A3A";
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
                        <View style={[{ height: 4, borderRadius: 2, backgroundColor: c, width: `${val}%` as any }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Recommendations */}
            <View style={[styles.recoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.recoTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
                Drypskin Recommends
              </Text>
              <Text style={[styles.recoSub, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
                Based on your health scan results
              </Text>
              {recs.map((r, i) => (
                <View key={i} style={[styles.recoRow, { borderTopColor: colors.border, borderTopWidth: i > 0 ? 1 : 0 }]}>
                  <View style={[styles.recoNum, { backgroundColor: "#C4956A" }]}>
                    <Text style={[{ color: "#fff", fontSize: 11, fontFamily: "Lato_700Bold" }]}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, color: colors.foreground, fontFamily: "Lato_700Bold" }}>{r.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.warmGray, fontFamily: "Lato_300Light", marginTop: 2 }}>{r.reason}</Text>
                  </View>
                </View>
              ))}

              <Pressable
                onPress={bookWhatsApp}
                style={({ pressed }) => [styles.bookBtn, { backgroundColor: "#1a1a1a", opacity: pressed ? 0.85 : 1 }]}
              >
                <Feather name="message-circle" size={18} color="#fff" />
                <Text style={[styles.bookBtnText, { fontFamily: "Lato_700Bold" }]}>Book My Treatment Plan</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={restart}
              style={({ pressed }) => [styles.restartBtn, { borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
            >
              <Feather name="refresh-cw" size={15} color={colors.warmGray} />
              <Text style={[styles.restartText, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                Retake Scan
              </Text>
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
  heroLabel: { color: "rgba(255,255,255,0.45)", fontSize: 10, letterSpacing: 2.5 },
  heroTitle: { color: "#fff", fontSize: 38, lineHeight: 40 },
  counter: { fontSize: 28, lineHeight: 30 },
  progressTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },
  estTime: { fontSize: 11, marginTop: 6 },
  scanIndicator: { alignItems: "center", justifyContent: "center", marginBottom: 24, marginTop: 8 },
  scanPulse: { width: 80, height: 80, borderRadius: 40, position: "absolute" },
  scanDot: { width: 16, height: 16, borderRadius: 8 },
  questionText: { fontSize: 30, lineHeight: 36, marginBottom: 20 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, flexShrink: 0 },
  optionText: { flex: 1, fontSize: 15, lineHeight: 20 },
  tipCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 16 },
  tipText: { flex: 1, fontSize: 12, lineHeight: 18 },
  scoreCard: { borderRadius: 20, borderWidth: 1, padding: 22, gap: 14 },
  scanComplete: { fontSize: 10, letterSpacing: 3, textTransform: "uppercase" },
  resultTitle: { fontSize: 32, lineHeight: 34 },
  scoreBigRow: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  scoreBig: { fontSize: 72, lineHeight: 74 },
  scoreOf: { fontSize: 24, marginBottom: 8 },
  scoreBadge: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 8 },
  scoreBadgeText: { color: "#fff", fontSize: 13 },
  scoreBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  scoreBarFill: { height: 8, borderRadius: 4 },
  recoCard: { borderRadius: 20, borderWidth: 1, padding: 22, gap: 14 },
  recoTitle: { fontSize: 30 },
  recoSub: { fontSize: 13, marginTop: -8 },
  recoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingTop: 12 },
  recoNum: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  bookBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 50 },
  bookBtnText: { color: "#fff", fontSize: 15 },
  restartBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50, borderWidth: 1 },
  restartText: { fontSize: 14 },
});
