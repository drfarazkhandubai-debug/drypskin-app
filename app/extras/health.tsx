import React, { useState } from "react";
import { Disclaimer } from "@/components/Disclaimer";
import {
  Keyboard,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";


interface HealthScore {
  hydration: number;
  activity: number;
  nutrition: number;
  total: number;
}

// Same formula as the backend code provided
function calculateScore(water: number, steps: number, calories: number): HealthScore {
  const hydration = Math.min((water / 3000) * 100, 100);
  const activity  = Math.min((steps / 10000) * 100, 100);
  const nutrition = Math.min((calories / 2000) * 100, 100);
  const total = Math.round((hydration + activity + nutrition) / 3);
  return {
    hydration: Math.round(hydration),
    activity:  Math.round(activity),
    nutrition: Math.round(nutrition),
    total,
  };
}

interface Recommendation {
  title: string;
  description: string;
  services: string[];
  waMessage: string;
  color: string;
}

function getRecommendation(score: HealthScore): Recommendation {
  if (score.total >= 80) {
    return {
      title: "Excellent Wellness",
      description:
        "Your health metrics are outstanding. Enhance your performance with our longevity and optimisation protocols.",
      services: ["NAD+ IV Therapy", "Longevity Protocol", "Peptide Performance Stack"],
      waMessage:
        "Hello Drypskin! My wellness score is excellent. I'd like to enhance my performance with your NAD+ and longevity protocols.",
      color: "#5C7A6B",
    };
  }
  if (score.hydration < 50) {
    return {
      title: "Hydration Priority",
      description:
        "Your hydration is low — this impacts energy, skin quality, and cognitive function. An IV drip can restore balance immediately.",
      services: ["Glam IV Drip", "IV Immunity Boost", "IV Detox Drip"],
      waMessage:
        "Hello Drypskin! My hydration score is low. I need an urgent IV drip recommendation.",
      color: "#4A7AAA",
    };
  }
  if (score.activity < 50) {
    return {
      title: "Boost Your Activity",
      description:
        "Your activity levels are below optimal. Our EMS Zero + RF and Fat Loss Protocol can accelerate your results.",
      services: ["EMS Zero + RF", "Fat Loss Protocol", "5D Lipo Zero"],
      waMessage:
        "Hello Drypskin! My activity score is low. I'd like to learn about your body contouring and fat loss options.",
      color: "#B05A3A",
    };
  }
  if (score.total >= 60) {
    return {
      title: "Good — Room to Improve",
      description:
        "You're doing well but there's room to optimise. Our Energy and Recovery protocols can take you to the next level.",
      services: ["IV Energy Drip", "Recovery Protocol", "CJC + Ipamorelin"],
      waMessage:
        "Hello Drypskin! My wellness score is good. I'd like to explore your Energy and Recovery protocols.",
      color: "#C4956A",
    };
  }
  return {
    title: "Nutritional Support Needed",
    description:
      "Your nutrition could be optimised. Our IV therapy drips deliver micronutrients directly to your cells for immediate results.",
    services: ["IV Glow Drip", "Iron IV Drip", "NAD+ IV Therapy"],
    waMessage:
      "Hello Drypskin! My nutrition score needs improvement. Please advise on IV therapy options.",
    color: "#7A5A8A",
  };
}

// Clean linear progress bar component
function MetricBar({
  icon,
  label,
  value,
  unit,
  goalLabel,
  score,
  color,
  colors,
}: {
  icon: string;
  label: string;
  value: number;
  unit: string;
  goalLabel: string;
  score: number;
  color: string;
  colors: any;
}) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
            <Feather name={icon as any} size={14} color={color} />
          </View>
          <View>
            <Text style={{ fontSize: 14, color: colors.foreground, fontFamily: "Lato_700Bold" }}>{label}</Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_300Light" }}>{goalLabel}</Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 18, color, fontFamily: "Cormorant_700Bold" }}>{score}%</Text>
          <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_300Light" }}>
            {value.toLocaleString()} {unit}
          </Text>
        </View>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(score, 100)}%` as any, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

export default function HealthTrackerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [waterInput, setWaterInput]     = useState("");
  const [stepsInput, setStepsInput]     = useState("");
  const [caloriesInput, setCalInput]    = useState("");
  const [score, setScore]               = useState<HealthScore | null>(null);
  const [logged, setLogged]             = useState({ water: 0, steps: 0, calories: 0 });
  const [error, setError]               = useState("");

  const handleCalculate = () => {
    const w = parseInt(waterInput,    10);
    const s = parseInt(stepsInput,    10);
    const c = parseInt(caloriesInput, 10);
    if (isNaN(w) || w < 0) { setError("Please enter a valid water intake (e.g. 2000)."); return; }
    if (isNaN(s) || s < 0) { setError("Please enter valid steps walked (e.g. 7000).");  return; }
    if (isNaN(c) || c < 0) { setError("Please enter valid calories eaten (e.g. 1500).");return; }
    setError("");
    setLogged({ water: w, steps: s, calories: c });
    setScore(calculateScore(w, s, c));
    Keyboard.dismiss();
  };

  const rec = score ? getRecommendation(score) : null;
  const totalColor = !score ? "#4A5B8A" : score.total >= 80 ? "#5C7A6B" : score.total >= 60 ? "#C4956A" : "#B05A3A";

  const openWhatsApp = () => {
    if (!rec) return;
    Linking.openURL(`https://wa.me/971586078532?text=${encodeURIComponent(rec.waMessage)}`);
  };

  return (
    <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 + bottomPad }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: topPad + 16, backgroundColor: "#4A5B8A" }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.8)" />
            <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Extras</Text>
          </Pressable>
          <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>WELLNESS SCORE</Text>
          <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>Health Tracker</Text>
          <Text style={[styles.heroSub, { fontFamily: "Lato_300Light" }]}>
            Log today's data and get your wellness score
          </Text>
        </View>

        <View style={styles.content}>
          {/* Input card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              Today's Data
            </Text>
            <Text style={{ fontSize: 13, color: colors.warmGray, fontFamily: "Lato_300Light", marginTop: -8 }}>
              Enter your daily health metrics to calculate your wellness score
            </Text>

            {/* Water */}
            <View style={styles.metricInputRow}>
              <View style={[styles.iconWrap, { backgroundColor: "#4A7AAA18" }]}>
                <Feather name="droplet" size={16} color="#4A7AAA" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: colors.foreground, fontFamily: "Lato_700Bold" }}>Water Intake</Text>
                <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_300Light" }}>Goal: 3,000 ml/day</Text>
              </View>
              <View style={[styles.numInput, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <TextInput
                  value={waterInput}
                  onChangeText={(v) => { setWaterInput(v); setError(""); }}
                  placeholder="e.g. 2000"
                  keyboardType="number-pad"
                  returnKeyType="done"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.numInputText, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}
                />
                <Text style={[styles.numUnit, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>ml</Text>
              </View>
            </View>

            {/* Steps */}
            <View style={styles.metricInputRow}>
              <View style={[styles.iconWrap, { backgroundColor: "#5C7A6B18" }]}>
                <Feather name="navigation" size={16} color="#5C7A6B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: colors.foreground, fontFamily: "Lato_700Bold" }}>Steps Walked</Text>
                <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_300Light" }}>Goal: 10,000 steps/day</Text>
              </View>
              <View style={[styles.numInput, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <TextInput
                  value={stepsInput}
                  onChangeText={(v) => { setStepsInput(v); setError(""); }}
                  placeholder="e.g. 7000"
                  keyboardType="number-pad"
                  returnKeyType="done"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.numInputText, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}
                />
                <Text style={[styles.numUnit, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>steps</Text>
              </View>
            </View>

            {/* Calories */}
            <View style={styles.metricInputRow}>
              <View style={[styles.iconWrap, { backgroundColor: "#C4956A18" }]}>
                <Feather name="zap" size={16} color="#C4956A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: colors.foreground, fontFamily: "Lato_700Bold" }}>Calories Eaten</Text>
                <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_300Light" }}>Goal: 2,000 kcal/day</Text>
              </View>
              <View style={[styles.numInput, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <TextInput
                  value={caloriesInput}
                  onChangeText={(v) => { setCalInput(v); setError(""); }}
                  placeholder="e.g. 1500"
                  keyboardType="number-pad"
                  returnKeyType="done"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.numInputText, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}
                />
                <Text style={[styles.numUnit, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>kcal</Text>
              </View>
            </View>

            {!!error && (
              <Text style={{ color: colors.destructive, fontSize: 13, fontFamily: "Lato_400Regular" }}>
                {error}
              </Text>
            )}

            <Pressable
              onPress={handleCalculate}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: "#4A5B8A", opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Feather name="heart" size={18} color="#fff" />
              <Text style={[styles.primaryBtnText, { fontFamily: "Lato_700Bold" }]}>
                Calculate Wellness Score
              </Text>
            </Pressable>
          </View>

          {/* Score display */}
          {score && rec && (
            <>
              {/* Overall score card */}
              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: `${totalColor}40`, borderLeftWidth: 4, borderLeftColor: totalColor },
                ]}
              >
                {/* Big score */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View>
                    <Text style={{ fontSize: 10, color: totalColor, fontFamily: "Lato_700Bold", letterSpacing: 2, marginBottom: 2 }}>
                      WELLNESS SCORE
                    </Text>
                    <Text style={{ fontSize: 64, lineHeight: 66, color: totalColor, fontFamily: "Cormorant_700Bold" }}>
                      {score.total}
                      <Text style={{ fontSize: 22, color: colors.warmGray, fontFamily: "Cormorant_400Regular" }}>/100</Text>
                    </Text>
                    <Text style={{ fontSize: 15, color: colors.warmGray, fontFamily: "Lato_300Light" }}>
                      {score.total >= 80 ? "Excellent" : score.total >= 60 ? "Good — room to improve" : score.total >= 40 ? "Needs attention" : "Requires support"}
                    </Text>
                  </View>
                  <View style={[styles.scoreCircle, { borderColor: totalColor }]}>
                    <Text style={{ fontSize: 24, color: totalColor, fontFamily: "Cormorant_700Bold" }}>{score.total}</Text>
                    <Text style={{ fontSize: 10, color: colors.warmGray, fontFamily: "Lato_300Light" }}>/ 100</Text>
                  </View>
                </View>

                {/* Overall bar */}
                <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
                  <View
                    style={[styles.progressFill, { width: `${score.total}%` as any, backgroundColor: totalColor }]}
                  />
                </View>

                {/* Three metric bars */}
                <MetricBar
                  icon="droplet"
                  label="Hydration"
                  value={logged.water}
                  unit="ml"
                  goalLabel="Goal: 3,000 ml/day"
                  score={score.hydration}
                  color="#4A7AAA"
                  colors={colors}
                />
                <View style={{ height: 1, backgroundColor: colors.border }} />
                <MetricBar
                  icon="navigation"
                  label="Activity"
                  value={logged.steps}
                  unit="steps"
                  goalLabel="Goal: 10,000 steps/day"
                  score={score.activity}
                  color="#5C7A6B"
                  colors={colors}
                />
                <View style={{ height: 1, backgroundColor: colors.border }} />
                <MetricBar
                  icon="zap"
                  label="Nutrition"
                  value={logged.calories}
                  unit="kcal"
                  goalLabel="Goal: 2,000 kcal/day"
                  score={score.nutrition}
                  color="#C4956A"
                  colors={colors}
                />
              </View>

              {/* Recommendation card */}
              <View
                style={[
                  styles.card,
                  { backgroundColor: `${rec.color}0E`, borderColor: `${rec.color}35` },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={[styles.recoBadge, { backgroundColor: rec.color }]}>
                    <Feather name="message-circle" size={16} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, color: rec.color, fontFamily: "Lato_700Bold", letterSpacing: 1.5, textTransform: "uppercase" }}>
                      Drypskin Recommendation
                    </Text>
                    <Text style={{ fontSize: 24, lineHeight: 26, color: colors.foreground, fontFamily: "Cormorant_700Bold" }}>
                      {rec.title}
                    </Text>
                  </View>
                </View>

                <Text style={{ fontSize: 14, lineHeight: 22, color: colors.foreground, fontFamily: "Lato_300Light" }}>
                  {rec.description}
                </Text>

                <Text style={{ fontSize: 12, color: colors.foreground, fontFamily: "Lato_700Bold", letterSpacing: 0.8, textTransform: "uppercase" }}>
                  Suggested Treatments
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {rec.services.map((s, i) => (
                    <View
                      key={i}
                      style={[
                        styles.recoChip,
                        { backgroundColor: `${rec.color}18`, borderColor: `${rec.color}35` },
                      ]}
                    >
                      <Feather name="check" size={11} color={rec.color} />
                      <Text style={{ fontSize: 12, color: colors.foreground, fontFamily: "Lato_400Regular" }}>{s}</Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  onPress={openWhatsApp}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { backgroundColor: rec.color, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Feather name="message-circle" size={18} color="#fff" />
                  <Text style={[styles.primaryBtnText, { fontFamily: "Lato_700Bold" }]}>
                    Book Recommended Treatment
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          {/* How it works */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              How Scoring Works
            </Text>
            {[
              { icon: "droplet",    label: "Hydration",  detail: "Score = (water ÷ 3,000) × 100",  color: "#4A7AAA" },
              { icon: "navigation", label: "Activity",   detail: "Score = (steps ÷ 10,000) × 100", color: "#5C7A6B" },
              { icon: "zap",        label: "Nutrition",  detail: "Score = (calories ÷ 2,000) × 100",color: "#C4956A" },
            ].map((item, i) => (
              <View
                key={i}
                style={[
                  { flexDirection: "row", alignItems: "center", gap: 12 },
                  i > 0 && { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: `${item.color}18` }]}>
                  <Feather name={item.icon as any} size={14} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: colors.foreground, fontFamily: "Lato_700Bold" }}>{item.label}</Text>
                  <Text style={{ fontSize: 12, color: colors.warmGray, fontFamily: "Lato_300Light" }}>{item.detail}</Text>
                </View>
              </View>
            ))}
            <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_300Light" }}>
              Overall score = average of the three metrics (max 100)
            </Text>
          </View>

          <Disclaimer />
        </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 24, paddingBottom: 28 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.8)", fontSize: 15 },
  heroLabel: { color: "rgba(255,255,255,0.65)", fontSize: 11, letterSpacing: 2.5, marginBottom: 4 },
  heroTitle: { color: "#fff", fontSize: 42, lineHeight: 44 },
  heroSub: { color: "rgba(255,255,255,0.75)", fontSize: 14, marginTop: 4 },
  content: { padding: 20, gap: 16 },
  card: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 14 },
  cardTitle: { fontSize: 26 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  metricInputRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  numInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
    minWidth: 110,
  },
  numInputText: { flex: 1, fontSize: 16, textAlign: "right" },
  numUnit: { fontSize: 11 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 50,
  },
  primaryBtnText: { color: "#fff", fontSize: 15 },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  recoBadge: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  recoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
});
