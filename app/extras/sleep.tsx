import React, { useState, useRef } from "react";
import {
  Animated, Easing, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

const ACCENT = "#4A5B8A";

const QUESTIONS = [
  { id: "bedtime", text: "What time do you usually go to bed?", options: [
    { label: "Before 9pm", value: 0 }, { label: "9–10pm", value: 1 }, { label: "10–11pm", value: 2 },
    { label: "11pm–midnight", value: 3 }, { label: "After midnight", value: 4 },
  ]},
  { id: "waketime", text: "What time do you naturally wake up (without alarm)?", options: [
    { label: "Before 6am", value: 0 }, { label: "6–7am", value: 1 }, { label: "7–8am", value: 2 },
    { label: "8–9am", value: 3 }, { label: "After 9am", value: 4 },
  ]},
  { id: "quality", text: "How rested do you feel on waking?", options: [
    { label: "Exhausted — still tired", value: 0 }, { label: "Groggy — takes time to function", value: 1 },
    { label: "Moderate — takes 30+ mins", value: 2 }, { label: "Good — functional within 15 mins", value: 3 },
    { label: "Excellent — spring out of bed", value: 4 },
  ]},
  { id: "sleep_time", text: "How long does it take you to fall asleep?", options: [
    { label: "Under 5 minutes", value: 3 }, { label: "5–15 minutes", value: 4 },
    { label: "15–30 minutes", value: 2 }, { label: "30–60 minutes", value: 1 }, { label: "Over 60 minutes", value: 0 },
  ]},
  { id: "duration", text: "How many hours of sleep do you typically get?", options: [
    { label: "Less than 5 hours", value: 0 }, { label: "5–6 hours", value: 1 }, { label: "6–7 hours", value: 2 },
    { label: "7–8 hours", value: 4 }, { label: "More than 9 hours", value: 3 },
  ]},
  { id: "waking", text: "Do you wake during the night?", options: [
    { label: "Never", value: 4 }, { label: "Rarely — once a week", value: 3 }, { label: "Sometimes — a few nights", value: 2 },
    { label: "Often — most nights", value: 1 }, { label: "Every night, multiple times", value: 0 },
  ]},
];

function getChronotype(bedtime: number, waketime: number) {
  const avg = (bedtime + waketime) / 2;
  if (avg <= 0.5) return { type: "Lion", icon: "sun", desc: "Early chronotype — you naturally wake early and perform best in the morning. Optimal for AM protocols.", color: "#C4956A" };
  if (avg <= 2) return { type: "Bear", icon: "moon", desc: "Mid-range chronotype — aligned with the solar cycle. Most common. Peak performance mid-morning to early afternoon.", color: "#5C7A6B" };
  return { type: "Wolf", icon: "star", desc: "Late chronotype — you're naturally a night owl. Peak cognitive performance in the evening. Forced early rising impacts your cortisol axis.", color: ACCENT };
}

function getRecommendations(answers: Record<string, number>, quality: number, duration: number) {
  const recs: { name: string; type: string; reason: string }[] = [];
  if (quality < 2) recs.push({ name: "Magnesium Glycinate", type: "Supplement", reason: "Promotes GABA production and deep sleep architecture" });
  if (answers.sleep_time <= 1) recs.push({ name: "NAD+ IV Therapy", type: "IV", reason: "Supports circadian gene expression and sleep-wake cycle regulation" });
  if (duration <= 1) recs.push({ name: "Recovery Protocol", type: "Protocol", reason: "Peptide stack + IV to maximise cellular repair during shortened sleep windows" });
  if (answers.waking <= 1) recs.push({ name: "Thymosin Alpha-1", type: "Peptide", reason: "Modulates immune and stress response for uninterrupted sleep" });
  recs.push({ name: "Sleep Optimisation Consultation", type: "Clinic", reason: "Dr. Khan's personalised chronobiology assessment and protocol design" });
  return recs.slice(0, 3);
}

export default function SleepScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [complete, setComplete] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  const total = QUESTIONS.length;

  const select = (questionId: string, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
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
      const maxScore = total * 4;
      const raw = vals.reduce((a, b) => a + b, 0);
      const pct = Math.round((raw / maxScore) * 100);
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setComplete(true);
        setTimeout(() => {
          Animated.timing(scoreAnim, { toValue: pct, duration: 1800, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
          Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        }, 100);
      });
    }
  };

  const reset = () => {
    setStep(0); setAnswers({}); setComplete(false);
    progressAnim.setValue(0); scoreAnim.setValue(0); slideAnim.setValue(0); fadeAnim.setValue(1);
  };

  const vals = Object.values(answers);
  const maxScore = total * 4;
  const raw = vals.reduce((a, b) => a + b, 0);
  const pct = vals.length === total ? Math.round((raw / maxScore) * 100) : 0;
  const chronotype = answers.bedtime !== undefined && answers.waketime !== undefined
    ? getChronotype(answers.bedtime, answers.waketime)
    : null;
  const scoreColor = pct >= 70 ? "#5C7A6B" : pct >= 45 ? "#C4956A" : "#B05A3A";
  const scoreLabel = pct >= 70 ? "Excellent Sleep" : pct >= 45 ? "Moderate Sleep" : "Poor Sleep";
  const recs = complete ? getRecommendations(answers, answers.quality ?? 0, answers.duration ?? 0) : [];

  const TYPE_COLORS: Record<string, string> = { IV: ACCENT, Peptide: "#8A5A7A", Supplement: "#5C7A6B", Protocol: "#5C7A6B", Clinic: "#C4956A" };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: ACCENT }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
          <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Extras</Text>
        </Pressable>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
          <View>
            <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>CHRONOBIOLOGY</Text>
            <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>Sleep Optimiser</Text>
          </View>
          {!complete && <Text style={[{ color: "rgba(255,255,255,0.55)", fontSize: 24, fontFamily: "Cormorant_400Regular" }]}>{step + 1}/{total}</Text>}
        </View>
        <View style={[styles.progressTrack, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Animated.View style={[styles.progressFill, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 60 + bottomPad }} keyboardShouldPersistTaps="handled">
        {!complete ? (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
            <View style={{ alignItems: "center", marginBottom: 20, marginTop: 8 }}>
              <View style={[styles.iconCircle, { backgroundColor: `${ACCENT}15` }]}>
                <Feather name="moon" size={28} color={ACCENT} />
              </View>
            </View>
            <Text style={[styles.questionText, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              {QUESTIONS[step].text}
            </Text>
            <View style={{ gap: 10, marginTop: 8 }}>
              {QUESTIONS[step].options.map((opt, i) => (
                <Pressable key={i} onPress={() => select(QUESTIONS[step].id, opt.value)}
                  style={({ pressed }) => [styles.optionBtn, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
                  <View style={[styles.optDot, { borderColor: ACCENT }]} />
                  <Text style={[{ flex: 1, fontSize: 15, color: colors.foreground, fontFamily: "Lato_400Regular" }]}>{opt.label}</Text>
                  <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </View>
          </Animated.View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim, gap: 20 }}>
            {/* Score */}
            <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: `${scoreColor}40`, borderLeftColor: scoreColor, borderLeftWidth: 4 }]}>
              <Text style={[{ fontSize: 10, letterSpacing: 3, color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>SLEEP ASSESSMENT</Text>
              <Text style={[{ fontSize: 32, color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>Sleep Quality Score</Text>
              <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
                <Animated.Text style={[{ fontSize: 72, lineHeight: 74, color: scoreColor, fontFamily: "Cormorant_700Bold" }]}>
                  {scoreAnim.interpolate({ inputRange: [0, pct], outputRange: ["0", pct.toString()] })}
                </Animated.Text>
                <Text style={[{ fontSize: 24, color: colors.warmGray, fontFamily: "Cormorant_400Regular", marginBottom: 8 }]}>/100</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: scoreColor }]}>
                <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 13 }]}>{scoreLabel}</Text>
              </View>
              <View style={[{ height: 8, borderRadius: 4, overflow: "hidden" }, { backgroundColor: colors.secondary }]}>
                <View style={{ height: 8, borderRadius: 4, backgroundColor: scoreColor, width: `${pct}%` as any }} />
              </View>
            </View>

            {/* Chronotype */}
            {chronotype && (
              <View style={[styles.chronoCard, { backgroundColor: colors.card, borderColor: `${chronotype.color}40` }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={[styles.chronoIcon, { backgroundColor: `${chronotype.color}20` }]}>
                    <Feather name={chronotype.icon as any} size={24} color={chronotype.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[{ fontSize: 10, color: chronotype.color, fontFamily: "Lato_700Bold", letterSpacing: 2 }]}>YOUR CHRONOTYPE</Text>
                    <Text style={[{ fontSize: 28, color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{chronotype.type}</Text>
                  </View>
                </View>
                <Text style={[{ fontSize: 13, color: colors.warmGray, fontFamily: "Lato_300Light", lineHeight: 19 }]}>{chronotype.desc}</Text>
              </View>
            )}

            {/* Recommendations */}
            <View style={[styles.recoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[{ fontSize: 28, color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>Optimisation Plan</Text>
              <Text style={[{ fontSize: 13, color: colors.warmGray, fontFamily: "Lato_300Light" }]}>Based on your sleep profile</Text>
              {recs.map((r, i) => {
                const c = TYPE_COLORS[r.type] ?? "#5C7A6B";
                return (
                  <View key={i} style={{ paddingTop: i > 0 ? 12 : 0, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: colors.border, gap: 4 }}>
                    <View style={[styles.typeBadge, { backgroundColor: `${c}15` }]}>
                      <Text style={[{ color: c, fontSize: 10, fontFamily: "Lato_700Bold", letterSpacing: 1 }]}>{r.type.toUpperCase()}</Text>
                    </View>
                    <Text style={{ color: colors.foreground, fontSize: 15, fontFamily: "Lato_700Bold" }}>{r.name}</Text>
                    <Text style={{ color: colors.warmGray, fontSize: 12, fontFamily: "Lato_300Light" }}>{r.reason}</Text>
                  </View>
                );
              })}
              <Pressable onPress={() => Linking.openURL(`https://wa.me/971586078532?text=${encodeURIComponent(`Hello Drypskin! My sleep quality score is ${pct}/100 and my chronotype is ${chronotype?.type}. I'd like to book a Sleep Optimisation Consultation.`)}`)}
                style={({ pressed }) => [styles.waBtn, { backgroundColor: ACCENT, opacity: pressed ? 0.85 : 1 }]}>
                <Feather name="message-circle" size={18} color="#fff" />
                <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 15 }]}>Book Sleep Consultation</Text>
              </Pressable>
            </View>

            <Pressable onPress={reset} style={({ pressed }) => [styles.retakeBtn, { borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}>
              <Feather name="refresh-cw" size={15} color={colors.warmGray} />
              <Text style={[{ color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>Retake Assessment</Text>
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
  heroLabel: { color: "rgba(255,255,255,0.5)", fontSize: 10, letterSpacing: 2.5 },
  heroTitle: { color: "#fff", fontSize: 38, lineHeight: 40 },
  progressTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.85)" },
  iconCircle: { width: 70, height: 70, borderRadius: 35, alignItems: "center", justifyContent: "center" },
  questionText: { fontSize: 30, lineHeight: 36, marginBottom: 20 },
  optionBtn: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  optDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, flexShrink: 0 },
  scoreCard: { borderRadius: 20, borderWidth: 1, padding: 22, gap: 14 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 8 },
  chronoCard: { borderRadius: 18, borderWidth: 1, padding: 20, gap: 12 },
  chronoIcon: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  recoCard: { borderRadius: 18, borderWidth: 1, padding: 20, gap: 14 },
  typeBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  waBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 50 },
  retakeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50, borderWidth: 1 },
});
