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
import AlertComponent from "@/components/AlertComponent";

const STORAGE_KEY = "drypskin_sleep_logs";
const GOLD = "#C4956A";
const BLUE = "#4A5B8A";
const GREEN = "#22C55E";
const ORANGE = "#F59E0B";
const RED = "#EF4444";

type SleepLog = {
  id: string;
  date: string;
  bedtime: string;
  waketime: string;
  duration: number;
  quality: number;
  notes: string;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function sleepColor(h: number) {
  if (h >= 7.5) return GREEN;
  if (h >= 6) return ORANGE;
  return RED;
}

function qualityLabel(q: number) {
  return ["", "Poor", "Fair", "Good", "Great", "Excellent"][q] ?? "";
}

function calcDuration(bed: string, wake: string): number {
  try {
    const [bh, bm] = bed.split(":").map(Number);
    const [wh, wm] = wake.split(":").map(Number);
    let mins = (wh * 60 + wm) - (bh * 60 + bm);
    if (mins < 0) mins += 24 * 60;
    return Math.round((mins / 60) * 10) / 10;
  } catch { return 0; }
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function SleepTrackerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [alertVisible, setAlertVisible] = useState<null | string>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: todayStr(), bedtime: "22:30", waketime: "06:30", quality: 3, notes: "" });

  const load = useCallback(async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) setLogs(JSON.parse(raw));
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (updated: SleepLog[]) => {
    setLogs(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addLog = async () => {
    const dur = calcDuration(form.bedtime, form.waketime);
    if (dur <= 0 || dur > 16) {
      Alert.alert("Check times", "Please enter valid bedtime and wake time.");
      return;
    }
    const newLog: SleepLog = { id: Date.now().toString(), date: form.date, bedtime: form.bedtime, waketime: form.waketime, duration: dur, quality: form.quality, notes: form.notes };
    const updated = [newLog, ...logs].sort((a, b) => b.date.localeCompare(a.date));
    await save(updated);
    setShowForm(false);
    setForm({ date: todayStr(), bedtime: "22:30", waketime: "06:30", quality: 3, notes: "" });
  };


  const del = (id?: string) => {

    if (Platform.OS === "web") {
      Alert.alert("Delete entry?", "", [
        { text: "Cancel" },
        { text: "Delete", style: "destructive", onPress: () => save(logs.filter(l => l.id !== id)) },
      ]);
    } else {
      setAlertVisible(id || null)
    }
  };

  const recent7 = logs.slice(0, 7);
  const avgDur = recent7.length ? Math.round((recent7.reduce((s, l) => s + l.duration, 0) / recent7.length) * 10) / 10 : 0;
  const avgQual = recent7.length ? Math.round(recent7.reduce((s, l) => s + l.quality, 0) / recent7.length * 10) / 10 : 0;
  const maxDur = Math.max(...recent7.map(l => l.duration), 8);
  const previewDur = calcDuration(form.bedtime, form.waketime);

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 80 + bottomPad }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 12 }}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: 10, color: BLUE, fontFamily: "Lato_700Bold", letterSpacing: 2 }]}>TRACKERS</Text>
            <Text style={[{ fontSize: 30, color: colors.foreground, fontFamily: "Cormorant_700Bold", lineHeight: 32 }]}>Sleep Tracker</Text>
          </View>
          <Pressable onPress={() => setShowForm(!showForm)} style={[styles.addBtn, { backgroundColor: showForm ? colors.secondary : BLUE, borderColor: BLUE }]}>
            <Feather name={showForm ? "x" : "plus"} size={16} color={showForm ? BLUE : "#fff"} />
            {!showForm && <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 13 }]}>Log</Text>}
          </Pressable>
        </View>
      </View>


      <View style={{ padding: 20, gap: 20 }}>

        {/* Stats row */}
        {recent7.length > 0 && (
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[
              { label: "Avg Duration", value: `${avgDur}h`, color: sleepColor(avgDur) },
              { label: "Avg Quality", value: qualityLabel(Math.round(avgQual)), color: GOLD },
              { label: "Nights Logged", value: `${logs.length}`, color: BLUE },
            ].map((s, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}>
                <Text style={[{ fontSize: 22, color: s.color, fontFamily: "Cormorant_700Bold" }]}>{s.value}</Text>
                <Text style={[{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Bar chart */}
        {recent7.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[{ fontSize: 13, color: colors.warmGray, fontFamily: "Lato_700Bold", letterSpacing: 1, marginBottom: 14 }]}>LAST 7 NIGHTS</Text>
            <View style={styles.chart}>
              {recent7.slice().reverse().map((log, i) => {
                const pct = (log.duration / maxDur) * 100;
                const d = new Date(log.date + "T00:00:00");
                return (
                  <View key={log.id} style={{ alignItems: "center", flex: 1, gap: 4 }}>
                    <Text style={[{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>{log.duration}h</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.bar, { height: `${pct}%` as any, backgroundColor: sleepColor(log.duration), borderRadius: 4 }]} />
                    </View>
                    <Text style={[{ fontSize: 9, color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>{DAYS[d.getDay()]}</Text>
                  </View>
                );
              })}
            </View>
            {/* Target line legend */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 }}>
              <View style={{ width: 20, height: 2, backgroundColor: GREEN, borderRadius: 1 }} />
              <Text style={[{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>7.5h target</Text>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: ORANGE, marginLeft: 8 }} />
              <Text style={[{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>6–7.5h</Text>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: RED, marginLeft: 8 }} />
              <Text style={[{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>&lt;6h</Text>
            </View>
          </View>
        )}

        {/* Log form */}
        {showForm && (
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: BLUE + "50" }]}>
            <Text style={[{ fontSize: 22, color: colors.foreground, fontFamily: "Cormorant_700Bold", marginBottom: 4 }]}>Log Night's Sleep</Text>

            <View style={{ gap: 14 }}>
              <View style={{ gap: 6 }}>
                <Text style={[styles.label, { color: colors.warmGray }]}>Date</Text>
                <TextInput value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))}
                  placeholder="YYYY-MM-DD" placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground, fontFamily: "Lato_400Regular" }]} />
              </View>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={[styles.label, { color: colors.warmGray }]}>Bedtime</Text>
                  <TextInput value={form.bedtime} onChangeText={v => setForm(f => ({ ...f, bedtime: v }))}
                    placeholder="22:30" placeholderTextColor={colors.mutedForeground}
                    style={[styles.input, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground, fontFamily: "Lato_400Regular" }]} />
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={[styles.label, { color: colors.warmGray }]}>Wake Time</Text>
                  <TextInput value={form.waketime} onChangeText={v => setForm(f => ({ ...f, waketime: v }))}
                    placeholder="06:30" placeholderTextColor={colors.mutedForeground}
                    style={[styles.input, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground, fontFamily: "Lato_400Regular" }]} />
                </View>
              </View>

              {previewDur > 0 && (
                <View style={[styles.durationBadge, { backgroundColor: sleepColor(previewDur) + "20", borderColor: sleepColor(previewDur) + "40" }]}>
                  <Feather name="moon" size={13} color={sleepColor(previewDur)} />
                  <Text style={[{ color: sleepColor(previewDur), fontFamily: "Lato_700Bold", fontSize: 14 }]}>
                    {previewDur}h sleep · {previewDur >= 7.5 ? "Great!" : previewDur >= 6 ? "Borderline" : "Too short"}
                  </Text>
                </View>
              )}

              <View style={{ gap: 6 }}>
                <Text style={[styles.label, { color: colors.warmGray }]}>Sleep Quality</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(q => (
                    <Pressable key={q} onPress={() => setForm(f => ({ ...f, quality: q }))}
                      style={[styles.qualBtn, { backgroundColor: form.quality >= q ? GOLD : colors.secondary, borderColor: form.quality >= q ? GOLD : colors.border }]}>
                      <Feather name="star" size={16} color={form.quality >= q ? "#fff" : colors.mutedForeground} />
                    </Pressable>
                  ))}
                  <Text style={[{ color: GOLD, fontFamily: "Lato_700Bold", fontSize: 13, alignSelf: "center" }]}>
                    {qualityLabel(form.quality)}
                  </Text>
                </View>
              </View>

              <View style={{ gap: 6 }}>
                <Text style={[styles.label, { color: colors.warmGray }]}>Notes (optional)</Text>
                <TextInput value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))}
                  placeholder="Vivid dreams, woke up once..." placeholderTextColor={colors.mutedForeground} multiline numberOfLines={2}
                  style={[styles.input, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground, fontFamily: "Lato_400Regular", height: 64, textAlignVertical: "top" }]} />
              </View>

              <Pressable onPress={addLog} style={[styles.saveBtn, { backgroundColor: BLUE }]}>
                <Feather name="check" size={16} color="#fff" />
                <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 15 }]}>Save Night</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Log list */}
        {logs.length === 0 && !showForm ? (
          <View style={{ alignItems: "center", gap: 10, paddingVertical: 40 }}>
            <Feather name="moon" size={36} color={colors.border} />
            <Text style={[{ color: colors.warmGray, fontFamily: "Cormorant_700Bold", fontSize: 24 }]}>No sleep logged yet</Text>
            <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 13 }]}>Tap Log to track tonight's rest</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <Text style={[{ fontSize: 10, color: colors.warmGray, fontFamily: "Lato_700Bold", letterSpacing: 2 }]}>HISTORY</Text>
            {logs.map(log => (
              <View key={log.id} style={[styles.logRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.durationDisc, { backgroundColor: sleepColor(log.duration) + "20", borderColor: sleepColor(log.duration) + "40" }]}>
                  <Text style={[{ fontSize: 16, color: sleepColor(log.duration), fontFamily: "Cormorant_700Bold" }]}>{log.duration}h</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[{ color: colors.foreground, fontFamily: "Lato_700Bold", fontSize: 14 }]}>{log.date}</Text>
                  <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 12, marginTop: 1 }]}>
                    {log.bedtime} → {log.waketime} · {"★".repeat(log.quality)} {qualityLabel(log.quality)}
                  </Text>
                  {log.notes ? <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 11, marginTop: 2 }]} numberOfLines={1}>{log.notes}</Text> : null}
                </View>
                <Pressable onPress={() => del(log.id)} style={{ padding: 6 }}>
                  <Feather name="trash-2" size={14} color={colors.mutedForeground} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Tip */}
        <View style={[styles.tip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="info" size={13} color={BLUE} />
          <Text style={[{ flex: 1, fontSize: 12, color: colors.warmGray, fontFamily: "Lato_300Light", lineHeight: 17 }]}>
            Adults need 7–9 hours of sleep. Consistent sleep and wake times improve circadian rhythm and cellular repair.
          </Text>
        </View>
      </View>

      <AlertComponent 
        visible={Boolean(alertVisible)}
        icon={<Feather name="trash-2" size={30} color={'red'} />}
        onCancel={() => setAlertVisible(null)}
        onConfirm={() => {
          save(logs.filter(l => l.id !== alertVisible as string))
          setAlertVisible(null)
        }}
        message="Are you sure you want to delete this entry?"
        confirmStyles={{ backgroundColor: 'crimson' }}
        label="Delete"
      />
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: 1, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 50, borderWidth: 1 },
  statCard: { padding: 14, borderRadius: 16, borderWidth: 1, alignItems: "center", gap: 4 },
  chartCard: { padding: 18, borderRadius: 18, borderWidth: 1 },
  chart: { flexDirection: "row", height: 100, alignItems: "flex-end", gap: 6 },
  barTrack: { flex: 1, height: 80, justifyContent: "flex-end" },
  bar: { width: "100%" },
  formCard: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 0 },
  label: { fontSize: 12, fontFamily: "Lato_700Bold", letterSpacing: 0.5 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  durationBadge: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  qualBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50 },
  logRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  durationDisc: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", borderWidth: 1, flexShrink: 0 },
  tip: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
});
