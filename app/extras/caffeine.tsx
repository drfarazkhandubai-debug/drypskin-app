import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

const STORAGE_KEY = "drypskin_caffeine_logs";
const GOLD = "#C4956A";
const BROWN = "#8B6344";
const GREEN = "#22C55E";
const ORANGE = "#F59E0B";
const RED = "#EF4444";

type CaffeineEntry = { id: string; date: string; time: string; drink: string; mg: number };

const DRINKS = [
  { name: "Espresso",          mg: 63,  icon: "☕", emoji: true },
  { name: "Double Espresso",   mg: 126, icon: "☕", emoji: true },
  { name: "Filter Coffee",     mg: 95,  icon: "☕", emoji: true },
  { name: "Large Coffee",      mg: 180, icon: "☕", emoji: true },
  { name: "Matcha Latte",      mg: 70,  icon: "🍵", emoji: true },
  { name: "Green Tea",         mg: 35,  icon: "🍵", emoji: true },
  { name: "Black Tea",         mg: 47,  icon: "🫖", emoji: true },
  { name: "Cappuccino",        mg: 75,  icon: "☕", emoji: true },
  { name: "Energy Drink",      mg: 160, icon: "⚡", emoji: true },
  { name: "Diet Coke",         mg: 46,  icon: "🥤", emoji: true },
  { name: "Pre-Workout",       mg: 200, icon: "💪", emoji: true },
  { name: "Cold Brew",         mg: 200, icon: "☕", emoji: true },
];

const LIMIT_RECOMMENDED = 400;
const CUTOFF_HOUR = 15;

function todayStr() { return new Date().toISOString().slice(0, 10); }
function nowTime() { const d = new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; }

function levelColor(mg: number) {
  if (mg <= 200) return GREEN;
  if (mg <= 400) return ORANGE;
  return RED;
}
function levelLabel(mg: number) {
  if (mg === 0) return "None today";
  if (mg <= 200) return "Moderate";
  if (mg <= 400) return "High";
  return "Very High";
}

export default function CaffeineScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [entries, setEntries] = useState<CaffeineEntry[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customMg, setCustomMg] = useState("");
  const [logTime, setLogTime] = useState(nowTime());

  const load = useCallback(async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) setEntries(JSON.parse(raw));
  }, []);
  useEffect(() => { load(); }, [load]);

  const persist = async (updated: CaffeineEntry[]) => {
    setEntries(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addDrink = async (drink: { name: string; mg: number }) => {
    const entry: CaffeineEntry = { id: Date.now().toString(), date: todayStr(), time: logTime, drink: drink.name, mg: drink.mg };
    await persist([entry, ...entries]);
    setShowPicker(false);
  };

  const addCustom = async () => {
    const mg = parseInt(customMg);
    if (!customName || isNaN(mg) || mg <= 0) { Alert.alert("Please enter a name and valid mg amount."); return; }
    await addDrink({ name: customName, mg });
    setCustomName(""); setCustomMg("");
  };

  const del = (id: string) => {
    Alert.alert("Remove entry?", "", [
      { text: "Cancel" },
      { text: "Remove", style: "destructive", onPress: () => persist(entries.filter(e => e.id !== id)) },
    ]);
  };

  const today = entries.filter(e => e.date === todayStr());
  const totalToday = today.reduce((s, e) => s + e.mg, 0);
  const lastTime = today.length ? today[0].time : null;
  const lastHour = lastTime ? parseInt(lastTime.split(":")[0]) : 0;
  const lateWarning = lastHour >= CUTOFF_HOUR;
  const pct = Math.min((totalToday / LIMIT_RECOMMENDED) * 100, 100);

  // 7-day history
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const total = entries.filter(e => e.date === ds).reduce((s, e) => s + e.mg, 0);
    return { date: ds, total, label: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()] };
  }).reverse();
  const maxDay = Math.max(...last7Days.map(d => d.total), 400);

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 80 + bottomPad }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 12 }}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: 10, color: BROWN, fontFamily: "Lato_700Bold", letterSpacing: 2 }]}>TRACKERS</Text>
            <Text style={[{ fontSize: 30, color: colors.foreground, fontFamily: "Cormorant_700Bold", lineHeight: 32 }]}>Caffeine Tracker</Text>
          </View>
          <Pressable onPress={() => setShowPicker(!showPicker)} style={[styles.addBtn, { backgroundColor: showPicker ? colors.secondary : BROWN, borderColor: BROWN }]}>
            <Feather name={showPicker ? "x" : "plus"} size={16} color={showPicker ? BROWN : "#fff"} />
            {!showPicker && <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 13 }]}>Log</Text>}
          </Pressable>
        </View>
      </View>

      <View style={{ padding: 20, gap: 20 }}>

        {/* Today gauge */}
        <View style={[styles.gaugeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <View>
              <Text style={[{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Lato_700Bold", letterSpacing: 2 }]}>TODAY'S TOTAL</Text>
              <Text style={[{ fontSize: 48, color: levelColor(totalToday), fontFamily: "Cormorant_700Bold", lineHeight: 50 }]}>{totalToday}<Text style={[{ fontSize: 18 }]}>mg</Text></Text>
              <Text style={[{ fontSize: 13, color: colors.warmGray, fontFamily: "Lato_300Light" }]}>{levelLabel(totalToday)}</Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 4 }}>
              <Text style={[{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>
                Limit: {LIMIT_RECOMMENDED}mg
              </Text>
              {lastTime && <Text style={[{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>Last: {lastTime}</Text>}
            </View>
          </View>

          {/* Progress bar */}
          <View style={{ marginTop: 14, gap: 6 }}>
            <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
              <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: levelColor(totalToday) }]} />
              {/* 200mg marker */}
              <View style={[styles.marker, { left: "50%" as any }]} />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={[{ fontSize: 10, color: GREEN, fontFamily: "Lato_300Light" }]}>0</Text>
              <Text style={[{ fontSize: 10, color: ORANGE, fontFamily: "Lato_300Light" }]}>200mg</Text>
              <Text style={[{ fontSize: 10, color: RED, fontFamily: "Lato_300Light" }]}>400mg+</Text>
            </View>
          </View>
        </View>

        {/* Late caffeine warning */}
        {lateWarning && (
          <View style={[styles.warning, { backgroundColor: ORANGE + "15", borderColor: ORANGE + "40" }]}>
            <Feather name="alert-triangle" size={15} color={ORANGE} />
            <Text style={[{ flex: 1, color: colors.foreground, fontSize: 13, fontFamily: "Lato_400Regular", lineHeight: 18 }]}>
              <Text style={{ fontFamily: "Lato_700Bold" }}>Late caffeine detected.</Text> Caffeine at {lastTime} may impact your sleep quality. Half-life is ~5 hours.
            </Text>
          </View>
        )}

        {/* Drink picker */}
        {showPicker && (
          <View style={[styles.pickerCard, { backgroundColor: colors.card, borderColor: BROWN + "40" }]}>
            <Text style={[{ fontSize: 22, color: colors.foreground, fontFamily: "Cormorant_700Bold", marginBottom: 4 }]}>Add Drink</Text>

            <View style={{ gap: 6 }}>
              <Text style={[styles.label, { color: colors.warmGray }]}>Log Time</Text>
              <TextInput value={logTime} onChangeText={setLogTime} placeholder="HH:MM"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground, fontFamily: "Lato_400Regular" }]} />
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {DRINKS.map(d => (
                <Pressable key={d.name} onPress={() => addDrink(d)}
                  style={({ pressed }) => [styles.drinkChip, { backgroundColor: pressed ? BROWN + "20" : colors.secondary, borderColor: pressed ? BROWN : colors.border }]}>
                  <Text style={[{ fontSize: 16 }]}>{d.icon}</Text>
                  <View>
                    <Text style={[{ fontSize: 13, color: colors.foreground, fontFamily: "Lato_700Bold" }]}>{d.name}</Text>
                    <Text style={[{ fontSize: 10, color: BROWN, fontFamily: "Lato_300Light" }]}>{d.mg}mg</Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Custom */}
            <View style={[styles.customRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <TextInput value={customName} onChangeText={setCustomName} placeholder="Custom drink…"
                placeholderTextColor={colors.mutedForeground}
                style={[{ flex: 1, fontSize: 14, color: colors.foreground, fontFamily: "Lato_400Regular" }]} />
              <TextInput value={customMg} onChangeText={setCustomMg} placeholder="mg" keyboardType="numeric"
                placeholderTextColor={colors.mutedForeground}
                style={[{ width: 60, fontSize: 14, color: colors.foreground, fontFamily: "Lato_400Regular", textAlign: "right" }]} />
              <Pressable onPress={addCustom} style={[styles.customAddBtn, { backgroundColor: BROWN }]}>
                <Feather name="plus" size={14} color="#fff" />
              </Pressable>
            </View>
          </View>
        )}

        {/* 7-day chart */}
        {last7Days.some(d => d.total > 0) && (
          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[{ fontSize: 13, color: colors.warmGray, fontFamily: "Lato_700Bold", letterSpacing: 1, marginBottom: 14 }]}>7-DAY INTAKE</Text>
            <View style={styles.chart}>
              {last7Days.map((day, i) => {
                const pct = maxDay > 0 ? (day.total / maxDay) * 100 : 0;
                return (
                  <View key={i} style={{ alignItems: "center", flex: 1, gap: 4 }}>
                    <Text style={[{ fontSize: 9, color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>{day.total > 0 ? day.total : ""}</Text>
                    <View style={styles.barTrack}>
                      {day.total > 0 && <View style={[styles.bar, { height: `${pct}%` as any, backgroundColor: levelColor(day.total), borderRadius: 4 }]} />}
                    </View>
                    <Text style={[{ fontSize: 9, color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>{day.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Today's log */}
        {today.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={[{ fontSize: 10, color: colors.warmGray, fontFamily: "Lato_700Bold", letterSpacing: 2 }]}>TODAY</Text>
            {today.map(e => (
              <View key={e.id} style={[styles.entryRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.mgBadge, { backgroundColor: levelColor(e.mg) + "20", borderColor: levelColor(e.mg) + "40" }]}>
                  <Text style={[{ fontSize: 14, color: levelColor(e.mg), fontFamily: "Cormorant_700Bold" }]}>{e.mg}<Text style={{ fontSize: 9 }}>mg</Text></Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[{ color: colors.foreground, fontFamily: "Lato_700Bold", fontSize: 14 }]}>{e.drink}</Text>
                  <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 12 }]}>{e.time}</Text>
                </View>
                <Pressable onPress={() => del(e.id)} style={{ padding: 6 }}>
                  <Feather name="trash-2" size={13} color={colors.mutedForeground} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {entries.length === 0 && !showPicker && (
          <View style={{ alignItems: "center", gap: 10, paddingVertical: 40 }}>
            <Text style={[{ fontSize: 36 }]}>☕</Text>
            <Text style={[{ color: colors.warmGray, fontFamily: "Cormorant_700Bold", fontSize: 24 }]}>No caffeine logged</Text>
            <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 13 }]}>Tap Log to add your first drink</Text>
          </View>
        )}

        {/* Science tip */}
        <View style={[styles.tip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="info" size={13} color={BROWN} />
          <Text style={[{ flex: 1, fontSize: 12, color: colors.warmGray, fontFamily: "Lato_300Light", lineHeight: 17 }]}>
            Recommended daily limit is 400mg. Caffeine has a 5-hour half-life — avoid intake after 3pm to protect sleep quality.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: 1, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 50, borderWidth: 1 },
  gaugeCard: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 0 },
  progressTrack: { height: 10, borderRadius: 5, overflow: "hidden", position: "relative" },
  progressFill: { height: "100%", borderRadius: 5 },
  marker: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(255,255,255,0.4)" },
  warning: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  pickerCard: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 12 },
  label: { fontSize: 12, fontFamily: "Lato_700Bold", letterSpacing: 0.5 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  drinkChip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  customRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 4 },
  customAddBtn: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  chartCard: { padding: 18, borderRadius: 18, borderWidth: 1 },
  chart: { flexDirection: "row", height: 80, alignItems: "flex-end", gap: 4 },
  barTrack: { flex: 1, height: 70, justifyContent: "flex-end" },
  bar: { width: "100%" },
  entryRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  mgBadge: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", borderWidth: 1, flexShrink: 0 },
  tip: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
});
