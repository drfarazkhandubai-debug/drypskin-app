import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
import { setSymptomPrefill, type PrefillSymptom } from "@/services/symptomPrefill";

const GOLD = "#C4956A";
const DARK = "#1a1a1a";
const API_BASE = `https://${process.env.EXPO_PUBLIC_API_URL}/api`;

const SYMPTOM_COLORS: Record<string, { color: string; icon: string }> = {
  fatigue: { color: "#4A7AAA", icon: "battery" },
  "low-energy": { color: "#8A5A7A", icon: "zap" },
  "brain-fog": { color: "#4A5B8A", icon: "cloud" },
  "skin-dullness": { color: "#C4956A", icon: "sun" },
  "stress-anxiety": { color: "#AA4A4A", icon: "activity" },
  "poor-sleep": { color: "#5C7A6B", icon: "moon" },
  dehydration: { color: "#4A8A8A", icon: "droplet" },
};

const DEFAULT_COLOR = { color: GOLD, icon: "thermometer" };

export default function SymptomModeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [mode, setMode] = useState<"select" | "describe">("select");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<PrefillSymptom[] | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const fadeTransition = (fn: () => void) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: false }).start(() => {
      fn();
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    });
  };

  const handleExtract = async () => {
    if (text.trim().length < 10) {
      setError("Please describe your symptoms in a little more detail.");
      return;
    }
    setLoading(true);
    setError(null);
    setExtracted(null);

    try {
      const res = await fetch(`${API_BASE}/symptoms/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Extraction failed");

      const symptoms: PrefillSymptom[] = (data.symptoms ?? []).map((s: any) => {
        const meta = SYMPTOM_COLORS[s.id] ?? DEFAULT_COLOR;
        return {
          id: s.id,
          label: s.label,
          severity: Math.max(1, Math.min(5, s.severity ?? 3)),
          color: meta.color,
          icon: meta.icon,
        };
      });

      if (symptoms.length === 0) {
        setError("We couldn't identify specific symptoms. Please try the structured check or add more detail.");
        return;
      }
      setExtracted(symptoms);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (!extracted || extracted.length === 0) return;
    setSymptomPrefill({ symptoms: extracted, fromText: text.trim() });
    router.push("/extras/symptom-checker" as any);
  };

  const topPad = (Platform.OS === "web" ? 67 : insets.top) + 12;
  const botPad = (Platform.OS === "web" ? 34 : insets.bottom) + 48;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Pressable
          onPress={() => {
            if (mode === "describe") { fadeTransition(() => { setMode("select"); setExtracted(null); setError(null); }); }
            else router.back();
          }}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Feather name="chevron-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: GOLD, fontFamily: "Lato_700Bold" }]}>
            SYMPTOM CHECKER
          </Text>
          <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
            {mode === "select" ? "How would you like to proceed?" : "Describe your symptoms"}
          </Text>
        </View>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: botPad }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Mode selection ────────────────────────────────────────────── */}
          {mode === "select" && (
            <View style={{ gap: 14 }}>
              <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 14, lineHeight: 22 }]}>
                Choose how you'd like to check your symptoms. Both methods use AI to personalise your clinical assessment.
              </Text>

              {/* Quick Check card */}
              <Pressable
                onPress={() => router.push("/extras/symptom-checker" as any)}
                style={({ pressed }) => [
                  styles.modeCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: pressed ? 0.88 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <View style={[styles.modeIcon, { backgroundColor: `${GOLD}15` }]}>
                  <Feather name="list" size={24} color={GOLD} />
                </View>
                <View style={{ gap: 4, flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 22, lineHeight: 24 }]}>
                      Quick Check
                    </Text>
                    <View style={[styles.pill, { backgroundColor: `${GOLD}14`, borderColor: `${GOLD}30` }]}>
                      <Text style={[{ color: GOLD, fontFamily: "Lato_700Bold", fontSize: 9, letterSpacing: 1.2 }]}>
                        RECOMMENDED
                      </Text>
                    </View>
                  </View>
                  <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 13, lineHeight: 20 }]}>
                    Select from common symptoms, rate severity, and choose duration. Best for clear symptoms.
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.warmGray} />
              </Pressable>

              {/* Describe Symptoms card */}
              <Pressable
                onPress={() => fadeTransition(() => setMode("describe"))}
                style={({ pressed }) => [
                  styles.modeCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: pressed ? 0.88 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <View style={[styles.modeIcon, { backgroundColor: "#4A5B8A15" }]}>
                  <Feather name="message-circle" size={24} color="#4A5B8A" />
                </View>
                <View style={{ gap: 4, flex: 1 }}>
                  <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 22, lineHeight: 24 }]}>
                    Describe Symptoms
                  </Text>
                  <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 13, lineHeight: 20 }]}>
                    Type or speak freely — our AI extracts your symptoms and analyses them clinically.
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.warmGray} />
              </Pressable>

              {/* Trust strip */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}>
                <Feather name="shield" size={12} color={colors.warmGray} />
                <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 11 }]}>
                  Powered by DrypSkin AI · Clinical-grade · Private
                </Text>
              </View>
            </View>
          )}

          {/* ── Describe mode ─────────────────────────────────────────────── */}
          {mode === "describe" && (
            <View style={{ gap: 18 }}>
              <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 14, lineHeight: 22 }]}>
                Describe how you have been feeling in your own words. Our AI will identify your symptoms and estimate severity.
              </Text>

              {/* Text input */}
              {!extracted && (
                <View style={{ gap: 14 }}>
                  <View style={[styles.textBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TextInput
                      multiline
                      placeholder="e.g. I have been feeling very tired for the past week, can't sleep properly, and my skin looks dull and dehydrated..."
                      placeholderTextColor={colors.mutedForeground}
                      value={text}
                      onChangeText={(t) => { setText(t); setError(null); }}
                      style={[{
                        color: colors.foreground,
                        fontFamily: "Lato_300Light",
                        fontSize: 15,
                        lineHeight: 24,
                        minHeight: 140,
                        textAlignVertical: "top",
                      }]}
                    />
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                    <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 11 }]}>
                      {text.length} characters
                    </Text>
                  </View>

                  {error && (
                    <View style={[styles.errorBox, { backgroundColor: "#AA4A4A0C", borderColor: "#AA4A4A25" }]}>
                      <Feather name="alert-circle" size={14} color="#AA4A4A" />
                      <Text style={[{ color: "#AA4A4A", fontFamily: "Lato_300Light", fontSize: 13, flex: 1, lineHeight: 20 }]}>
                        {error}
                      </Text>
                    </View>
                  )}

                  <Pressable
                    onPress={handleExtract}
                    disabled={loading || text.trim().length < 10}
                    style={({ pressed }) => [
                      styles.nextBtn,
                      {
                        backgroundColor: text.trim().length >= 10 && !loading ? GOLD : colors.border,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Feather name="cpu" size={16} color="#fff" />
                    )}
                    <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 15 }]}>
                      {loading ? "Extracting symptoms…" : "Extract Symptoms with AI"}
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Extracted results */}
              {extracted && extracted.length > 0 && (
                <View style={{ gap: 16 }}>
                  <View style={{ gap: 6 }}>
                    <Text style={[{ color: GOLD, fontFamily: "Lato_700Bold", fontSize: 10, letterSpacing: 1.8 }]}>
                      AI EXTRACTED {extracted.length} SYMPTOM{extracted.length > 1 ? "S" : ""}
                    </Text>
                    <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 13, lineHeight: 20 }]}>
                      These symptoms were identified from your description. Tap to remove any that don't apply.
                    </Text>
                  </View>

                  <View style={{ gap: 10 }}>
                    {extracted.map((s) => (
                      <View
                        key={s.id}
                        style={[
                          styles.extractedChip,
                          { backgroundColor: `${s.color}10`, borderColor: `${s.color}30` },
                        ]}
                      >
                        <View style={[styles.chipIcon, { backgroundColor: `${s.color}18` }]}>
                          <Feather name={s.icon as any} size={14} color={s.color} />
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text style={[{ color: s.color, fontFamily: "Lato_700Bold", fontSize: 14 }]}>
                            {s.label}
                          </Text>
                          <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 11 }]}>
                            Severity: {s.severity}/5 · {
                              ["", "Mild", "Mild–Moderate", "Moderate", "Significant", "Severe"][s.severity]
                            }
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => setExtracted((prev) => prev?.filter((x) => x.id !== s.id) ?? [])}
                          hitSlop={8}
                        >
                          <Feather name="x" size={16} color={colors.warmGray} />
                        </Pressable>
                      </View>
                    ))}
                  </View>

                  {/* Source text preview */}
                  <View style={[styles.textPreview, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[{ color: GOLD, fontFamily: "Lato_700Bold", fontSize: 9, letterSpacing: 1.5, marginBottom: 6 }]}>
                      FROM YOUR DESCRIPTION
                    </Text>
                    <Text
                      style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 13, lineHeight: 20 }]}
                      numberOfLines={3}
                    >
                      "{text}"
                    </Text>
                  </View>

                  <Pressable
                    onPress={handleProceed}
                    style={({ pressed }) => [
                      styles.nextBtn,
                      {
                        backgroundColor: DARK,
                        opacity: pressed ? 0.85 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      },
                    ]}
                  >
                    <Feather name="arrow-right" size={16} color="#fff" />
                    <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 15 }]}>
                      Continue to Assessment
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => { setExtracted(null); setError(null); }}
                    style={{ alignItems: "center", paddingVertical: 6 }}
                  >
                    <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 12, textDecorationLine: "underline" }]}>
                      Edit my description
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
    paddingBottom: 14,
  },
  backBtn: { paddingTop: 4 },
  eyebrow: { fontSize: 9, letterSpacing: 2.5, marginBottom: 2 },
  heading: { fontSize: 26, lineHeight: 28 },
  content: { paddingHorizontal: 20, paddingTop: 6, gap: 0 },
  modeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
  },
  modeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  textBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: 50,
  },
  extractedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  textPreview: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
});

