import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
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

type Meal = "breakfast" | "lunch" | "dinner" | "snack";

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  time: string;
  meal: Meal;
}

const MEAL_META: Record<Meal, { label: string; color: string; icon: string }> = {
  breakfast: { label: "Breakfast", color: "#C4956A", icon: "sunrise" },
  lunch:     { label: "Lunch",     color: "#5C7A6B", icon: "sun" },
  dinner:    { label: "Dinner",    color: "#4A5B8A", icon: "moon" },
  snack:     { label: "Snack",     color: "#8A5A6A", icon: "coffee" },
};

const QUICK_FOODS = [
  { name: "Chicken Salad", cal: 350 },
  { name: "Avocado Toast", cal: 280 },
  { name: "Protein Shake", cal: 180 },
  { name: "Greek Yogurt",  cal: 120 },
  { name: "Mixed Nuts",    cal: 170 },
  { name: "Grilled Salmon",cal: 420 },
];

export default function CalorieDiaryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [goal, setGoal] = useState(2000);
  const [goalInput, setGoalInput] = useState("2000");
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [foodName, setFoodName] = useState("");
  const [foodCal, setFoodCal] = useState("");
  const [activeMeal, setActiveMeal] = useState<Meal>("lunch");
  const [addError, setAddError] = useState("");

  const total = entries.reduce((s, e) => s + e.calories, 0);
  const remaining = goal - total;
  const pct = Math.min((total / goal) * 100, 100);
  const over = total > goal;

  const mealTotals = (Object.keys(MEAL_META) as Meal[]).reduce<Record<string, number>>((acc, m) => {
    acc[m] = entries.filter((e) => e.meal === m).reduce((s, e) => s + e.calories, 0);
    return acc;
  }, {});

  const addEntry = () => {
    const cal = parseInt(foodCal, 10);
    if (!foodName.trim()) { setAddError("Please enter a food name."); return; }
    if (!foodCal || isNaN(cal) || cal <= 0) { setAddError("Please enter a valid calorie amount."); return; }
    const now = new Date();
    setEntries((prev) => [
      {
        id: Date.now().toString(),
        name: foodName.trim(),
        calories: cal,
        time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        meal: activeMeal,
      },
      ...prev,
    ]);
    setFoodName("");
    setFoodCal("");
    setAddError("");
    Keyboard.dismiss();
  };

  const applyGoal = () => {
    const g = parseInt(goalInput, 10);
    if (g > 0) setGoal(g);
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 + bottomPad }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: topPad + 16, backgroundColor: "#C4956A" }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.8)" />
            <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Extras</Text>
          </Pressable>
          <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>DAILY FOOD LOG</Text>
          <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>Calorie Diary</Text>
          <Text style={[styles.heroSub, { fontFamily: "Lato_300Light" }]}>
            Track your nutrition with precision
          </Text>
        </View>

        <View style={styles.content}>
          {/* Summary card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Calories big number */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
              <View>
                <Text style={[styles.summaryLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                  Consumed today
                </Text>
                <Text style={[styles.summaryBig, { color: over ? "#B05A3A" : colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
                  {total.toLocaleString()}
                  <Text style={{ fontSize: 18, color: colors.warmGray }}> kcal</Text>
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.summaryLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                  Goal
                </Text>
                <Text style={[{ fontSize: 20, color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
                  {goal.toLocaleString()} kcal
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={{ gap: 6 }}>
              <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${pct}%` as any,
                      backgroundColor: over ? "#B05A3A" : "#C4956A",
                    },
                  ]}
                />
              </View>
              <Text style={[{ fontSize: 13, fontFamily: "Lato_700Bold" }, { color: over ? "#B05A3A" : "#5C7A6B" }]}>
                {over
                  ? `${(total - goal).toLocaleString()} kcal over goal`
                  : `${remaining.toLocaleString()} kcal remaining`}
              </Text>
            </View>

            {/* Meal breakdown */}
            <View style={styles.mealRow}>
              {(Object.entries(MEAL_META) as [Meal, typeof MEAL_META[Meal]][]).map(([meal, meta]) => (
                <View key={meal} style={styles.mealStat}>
                  <View style={[styles.dot, { backgroundColor: meta.color }]} />
                  <Text style={[styles.mealName, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                    {meta.label}
                  </Text>
                  <Text style={[styles.mealCal, { color: colors.foreground, fontFamily: "Lato_700Bold" }]}>
                    {mealTotals[meal]}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Goal setter */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              Daily Goal
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={[styles.inputRow, { flex: 1, backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <TextInput
                  value={goalInput}
                  onChangeText={setGoalInput}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={applyGoal}
                  placeholder="2000"
                  placeholderTextColor={colors.mutedForeground}
                  style={[{ flex: 1, fontSize: 20, color: colors.foreground, fontFamily: "Lato_400Regular" }]}
                />
                <Text style={{ fontSize: 13, color: colors.warmGray, fontFamily: "Lato_400Regular" }}>kcal</Text>
              </View>
              <Pressable
                onPress={applyGoal}
                style={({ pressed }) => [
                  styles.setBtn,
                  { backgroundColor: "#C4956A", opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={{ color: "#fff", fontSize: 15, fontFamily: "Lato_700Bold" }}>Set</Text>
              </Pressable>
            </View>
          </View>

          {/* Add food */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              Add Food
            </Text>

            {/* Meal type pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8, paddingVertical: 2 }}>
                {(Object.entries(MEAL_META) as [Meal, typeof MEAL_META[Meal]][]).map(([meal, meta]) => (
                  <Pressable
                    key={meal}
                    onPress={() => setActiveMeal(meal)}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: activeMeal === meal ? meta.color : colors.secondary,
                        borderColor: activeMeal === meal ? meta.color : colors.border,
                      },
                    ]}
                  >
                    <Feather
                      name={meta.icon as any}
                      size={12}
                      color={activeMeal === meal ? "#fff" : colors.warmGray}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        color: activeMeal === meal ? "#fff" : colors.foreground,
                        fontFamily: activeMeal === meal ? "Lato_700Bold" : "Lato_400Regular",
                      }}
                    >
                      {meta.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Food name + calories */}
            <View style={{ gap: 10 }}>
              <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <TextInput
                  value={foodName}
                  onChangeText={(v) => { setFoodName(v); setAddError(""); }}
                  placeholder="Food name..."
                  returnKeyType="next"
                  placeholderTextColor={colors.mutedForeground}
                  style={[{ flex: 1, fontSize: 16, color: colors.foreground, fontFamily: "Lato_400Regular" }]}
                />
              </View>
              <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <TextInput
                  value={foodCal}
                  onChangeText={(v) => { setFoodCal(v); setAddError(""); }}
                  placeholder="Calories (e.g. 350)"
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={addEntry}
                  placeholderTextColor={colors.mutedForeground}
                  style={[{ flex: 1, fontSize: 16, color: colors.foreground, fontFamily: "Lato_400Regular" }]}
                />
                <Text style={{ fontSize: 13, color: colors.warmGray, fontFamily: "Lato_400Regular" }}>kcal</Text>
              </View>
            </View>

            {/* Quick-add chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8, paddingVertical: 2 }}>
                {QUICK_FOODS.map((f) => (
                  <Pressable
                    key={f.name}
                    onPress={() => { setFoodName(f.name); setFoodCal(f.cal.toString()); setAddError(""); }}
                    style={[styles.quickChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                  >
                    <Text style={{ fontSize: 12, color: colors.foreground, fontFamily: "Lato_400Regular" }}>
                      {f.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#C4956A", fontFamily: "Lato_700Bold" }}>{f.cal}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {!!addError && (
              <Text style={{ color: colors.destructive, fontSize: 13, fontFamily: "Lato_400Regular" }}>
                {addError}
              </Text>
            )}

            <Pressable
              onPress={addEntry}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: "#C4956A", opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Feather name="plus" size={18} color="#fff" />
              <Text style={[styles.primaryBtnText, { fontFamily: "Lato_700Bold" }]}>Add to Diary</Text>
            </Pressable>
          </View>

          {/* Log entries */}
          {entries.length > 0 ? (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
                  Today's Log
                </Text>
                <Pressable
                  onPress={() => setEntries([])}
                  style={[styles.clearBtn, { borderColor: colors.border }]}
                >
                  <Text style={{ fontSize: 12, color: colors.warmGray, fontFamily: "Lato_400Regular" }}>
                    Clear all
                  </Text>
                </Pressable>
              </View>
              {entries.map((entry, i) => (
                <View
                  key={entry.id}
                  style={[
                    styles.logRow,
                    { borderTopColor: colors.border, borderTopWidth: i > 0 ? 1 : 0 },
                  ]}
                >
                  <View style={[styles.dot, { backgroundColor: MEAL_META[entry.meal].color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, color: colors.foreground, fontFamily: "Lato_400Regular" }}>
                      {entry.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_300Light" }}>
                      {MEAL_META[entry.meal].label} · {entry.time}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 18, color: colors.foreground, fontFamily: "Cormorant_700Bold" }}>
                    {entry.calories}
                  </Text>
                  <Pressable onPress={() => setEntries((prev) => prev.filter((e) => e.id !== entry.id))} style={{ padding: 6 }}>
                    <Feather name="x" size={14} color={colors.mutedForeground} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Feather name="book-open" size={24} color={colors.mutedForeground} />
              <Text style={{ fontSize: 13, color: colors.warmGray, fontFamily: "Lato_300Light", textAlign: "center" }}>
                No entries yet. Add your first meal above.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  summaryLabel: { fontSize: 12, marginBottom: 2 },
  summaryBig: { fontSize: 44, lineHeight: 46 },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  mealRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 4 },
  mealStat: { alignItems: "center", gap: 4 },
  mealName: { fontSize: 11 },
  mealCal: { fontSize: 15 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  setBtn: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12, justifyContent: "center" },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, borderWidth: 1 },
  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 50,
  },
  primaryBtnText: { color: "#fff", fontSize: 15 },
  logRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 10 },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  emptyCard: { borderRadius: 16, borderWidth: 1, padding: 28, alignItems: "center", gap: 10 },
});
