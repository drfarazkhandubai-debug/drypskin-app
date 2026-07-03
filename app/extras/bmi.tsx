import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
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


interface BmiCategory {
  label: string;
  range: string;
  color: string;
  advice: string;
  service: string;
}

const BMI_CATEGORIES: BmiCategory[] = [
  {
    label: "Underweight",
    range: "< 18.5",
    color: "#4A7AAA",
    advice:
      "Your weight is below the healthy range. Consider a nutrition consultation and IV therapy to support healthy weight gain.",
    service: "IV Immunity Boost",
  },
  {
    label: "Normal Weight",
    range: "18.5 – 24.9",
    color: "#5C7A6B",
    advice:
      "Your BMI is in the healthy range. Maintain your wellness with our preventative care and body contouring options.",
    service: "IV Glow Drip",
  },
  {
    label: "Overweight",
    range: "25 – 29.9",
    color: "#C4956A",
    advice:
      "You're slightly above the healthy range. Our EMS Zero + RF and Fat Loss Protocol can help you sculpt and tone.",
    service: "Fat Loss Protocol",
  },
  {
    label: "Obese",
    range: "≥ 30",
    color: "#B05A3A",
    advice:
      "We recommend our 5D Lipo Zero body contouring and Kickstart Metabolism Fat Burn Protocol, combined with expert nutritional guidance.",
    service: "5D Lipo Zero",
  },
];

function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return BMI_CATEGORIES[0];
  if (bmi < 25) return BMI_CATEGORIES[1];
  if (bmi < 30) return BMI_CATEGORIES[2];
  return BMI_CATEGORIES[3];
}

// Simple segmented bar with needle — no absolute % positioning
function ScaleBar({ bmi, colors }: { bmi: number; colors: any }) {
  // map bmi 10–40 onto 0–100%
  const pct = Math.min(Math.max(((bmi - 10) / 30) * 100, 0), 100);
  const segments = [
    { color: "#4A7AAA", flex: 1.5 },   // < 18.5
    { color: "#5C7A6B", flex: 2 },     // 18.5–25
    { color: "#C4956A", flex: 1.5 },   // 25–30
    { color: "#B05A3A", flex: 2 },     // 30+
  ];
  return (
    <View>
      {/* Track + needle overlay */}
      <View style={{ height: 20, justifyContent: "flex-end" }}>
        {/* Segments */}
        <View style={{ flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden" }}>
          {segments.map((s, i) => (
            <View key={i} style={{ flex: s.flex, backgroundColor: s.color }} />
          ))}
        </View>
        {/* Needle — positioned via left margin calculation using flex-based approach */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: `${pct}%` as any,
            width: 3,
            height: 18,
            backgroundColor: colors.foreground,
            borderRadius: 2,
            marginLeft: -1,
          }}
        />
      </View>
      {/* Labels */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
        {["10", "18.5", "25", "30", "40+"].map((l) => (
          <Text key={l} style={{ fontSize: 9, color: colors.mutedForeground, fontFamily: "Lato_300Light" }}>
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function BmiCalculatorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [error, setError] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const calculate = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!height || !weight || isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      setError("Please enter valid height and weight values.");
      return;
    }
    setError("");
    const hm = h / 100;
    setBmi(Math.round((w / (hm * hm)) * 10) / 10);
    Keyboard.dismiss();
  };

  const category = bmi !== null ? getBmiCategory(bmi) : null;

  const bookWhatsApp = () => {
    if (!category) return;
    const msg = `Hello Drypskin! My BMI is ${bmi} (${category.label}). I'm interested in the ${category.service} service. Please advise.`;
    Linking.openURL(`https://wa.me/971586078532?text=${encodeURIComponent(msg)}`);
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 60 + bottomPad }}
      keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: topPad + 16, backgroundColor: "#5C7A6B" }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.8)" />
            <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Extras</Text>
          </Pressable>
          <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>BODY MASS INDEX</Text>
          <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>BMI Calculator</Text>
          <Text style={[styles.heroSub, { fontFamily: "Lato_300Light" }]}>
            Understand your body composition instantly
          </Text>
        </View>

        <View style={styles.content}>
          {/* Input card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              Your Measurements
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {/* Height */}
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={[styles.inputLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                  Height (cm)
                </Text>
                <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <TextInput
                    value={height}
                    onChangeText={(v) => { setHeight(v); setError(""); }}
                    placeholder="170"
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.textInput, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}
                  />
                  <Text style={[styles.unit, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>cm</Text>
                </View>
              </View>
              {/* Weight */}
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={[styles.inputLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                  Weight (kg)
                </Text>
                <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <TextInput
                    value={weight}
                    onChangeText={(v) => { setWeight(v); setError(""); }}
                    placeholder="70"
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.textInput, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}
                  />
                  <Text style={[styles.unit, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>kg</Text>
                </View>
              </View>
            </View>

            {!!error && (
              <Text style={{ color: colors.destructive, fontSize: 13, fontFamily: "Lato_400Regular" }}>
                {error}
              </Text>
            )}

            <Pressable
              onPress={calculate}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: "#5C7A6B", opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Feather name="bar-chart-2" size={18} color="#fff" />
              <Text style={[styles.primaryBtnText, { fontFamily: "Lato_700Bold" }]}>Calculate BMI</Text>
            </Pressable>
          </View>

          {/* Result */}
          {bmi !== null && category && (
            <>
              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: category.color },
                ]}
              >
                {/* BMI value + badge */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View>
                    <Text style={[styles.resultLabel, { color: category.color, fontFamily: "Lato_700Bold" }]}>
                      YOUR BMI
                    </Text>
                    <Text style={[styles.resultValue, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
                      {bmi}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: category.color }]}>
                    <Text style={[styles.badgeText, { fontFamily: "Lato_700Bold" }]}>{category.label}</Text>
                  </View>
                </View>

                {/* Scale bar */}
                <ScaleBar bmi={bmi} colors={colors} />

                {/* Category list */}
                <View style={{ gap: 8, marginTop: 4 }}>
                  {BMI_CATEGORIES.map((c) => (
                    <View key={c.label} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <View style={[styles.dot, { backgroundColor: c.color }]} />
                      <Text style={[{ flex: 1, fontSize: 13, color: colors.foreground, fontFamily: c.label === category.label ? "Lato_700Bold" : "Lato_400Regular" }]}>
                        {c.label}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.warmGray, fontFamily: "Lato_300Light" }}>{c.range}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Recommendation */}
              <View
                style={[
                  styles.card,
                  { backgroundColor: `${category.color}12`, borderColor: `${category.color}35` },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Feather name="message-circle" size={16} color={category.color} />
                  <Text style={{ fontSize: 11, color: category.color, fontFamily: "Lato_700Bold", letterSpacing: 1.2, textTransform: "uppercase" }}>
                    Drypskin Recommendation
                  </Text>
                </View>
                <Text style={{ fontSize: 14, lineHeight: 22, color: colors.foreground, fontFamily: "Lato_300Light", marginBottom: 14 }}>
                  {category.advice}
                </Text>
                <Pressable
                  onPress={bookWhatsApp}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { backgroundColor: category.color, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Feather name="message-circle" size={16} color="#fff" />
                  <Text style={[styles.primaryBtnText, { fontFamily: "Lato_700Bold" }]}>
                    Book {category.service} via WhatsApp
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          {/* Reference */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              BMI Reference
            </Text>
            {BMI_CATEGORIES.map((c, i) => (
              <View
                key={c.label}
                style={[
                  styles.refRow,
                  { borderTopColor: colors.border, borderTopWidth: i > 0 ? 1 : 0 },
                ]}
              >
                <View style={[styles.dot, { backgroundColor: c.color }]} />
                <Text style={{ flex: 1, fontSize: 14, color: colors.foreground, fontFamily: "Lato_400Regular" }}>
                  {c.label}
                </Text>
                <Text style={{ fontSize: 13, color: colors.warmGray, fontFamily: "Lato_700Bold" }}>{c.range}</Text>
              </View>
            ))}
          </View>
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
  inputLabel: { fontSize: 13 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textInput: { flex: 1, fontSize: 22 },
  unit: { fontSize: 14 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 50,
  },
  primaryBtnText: { color: "#fff", fontSize: 16 },
  resultLabel: { fontSize: 11, letterSpacing: 2, marginBottom: 2 },
  resultValue: { fontSize: 56, lineHeight: 58 },
  badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  badgeText: { color: "#fff", fontSize: 14 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  refRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 10 },
});
