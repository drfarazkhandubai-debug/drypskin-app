import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

const API_BASE = `https://${process.env.EXPO_PUBLIC_API_URL}/api`;

interface LongevityScore { score: number; bio_age: number | null; label: string; components: Record<string, number | null>; scans_completed: number; }
interface JourneyData { scans: any[]; lab_results: any[]; body_metrics: any[]; appointments: any[]; }

const SCAN_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  general: { label: "Health Scan", color: "#1a1a1a", icon: "activity" },
  skin: { label: "Skin Score", color: "#8A5A7A", icon: "sun" },
  burnout: { label: "Burnout Index", color: "#4A5B8A", icon: "zap-off" },
};

const STATUS_COLORS: Record<string, string> = {
  optimal: "#5C7A6B",
  suboptimal: "#C4956A",
  low: "#4A5B8A",
  high: "#B05A3A",
  critical: "#8B1A1A",
  pending: "#8B9B8A",
};

function formatDate(d?: string) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function JourneyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [ls, setLs] = useState<LongevityScore | null>(null);
  const [journey, setJourney] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.token) loadData();
    else setLoading(false);
  }, [auth.token]);

  const loadData = async () => {
    try {
      const [lsRes, jRes] = await Promise.all([
        fetch(`${API_BASE}/longevity-score`, { headers: { "x-auth-token": auth.token! } }),
        fetch(`${API_BASE}/journey`, { headers: { "x-auth-token": auth.token! } }),
      ]);
      if (lsRes.ok) setLs(await lsRes.json());
      if (jRes.ok) setJourney(await jRes.json());
    } catch {}
    setLoading(false);
  };

  const scoreColor = ls ? (ls.score >= 75 ? "#5C7A6B" : ls.score >= 55 ? "#C4956A" : ls.score >= 30 ? "#4A5B8A" : "#B05A3A") : "#8B9B8A";

  // Build combined timeline
  const timeline: any[] = [];
  if (journey) {
    journey.scans.forEach((s) => timeline.push({ type: "scan", ...s, date: s.created_at }));
    journey.lab_results.forEach((l) => timeline.push({ type: "lab", ...l, date: l.recorded_date }));
    journey.body_metrics.forEach((m) => timeline.push({ type: "metric", ...m, date: m.recorded_at }));
    journey.appointments.forEach((a) => timeline.push({ type: "appointment", ...a, date: a.appointment_date || a.created_at }));
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: "#1a1a1a" }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
          <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Extras</Text>
        </Pressable>
        <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>WELLNESS TIMELINE</Text>
        <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>My Journey</Text>
      </View>

      {!auth.token ? (
        <View style={styles.center}>
          <Feather name="lock" size={40} color={colors.mutedForeground} />
          <Text style={[{ color: colors.warmGray, fontSize: 16, fontFamily: "Lato_300Light", marginTop: 12, textAlign: "center" }]}>
            Sign in to view your wellness journey
          </Text>
          <Pressable onPress={() => router.push("/extras/profile" as any)} style={[styles.ctaBtn, { backgroundColor: "#1a1a1a", marginTop: 16 }]}>
            <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold" }]}>Sign In</Text>
          </Pressable>
        </View>
      ) : loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.sage} /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 60 + bottomPad, gap: 16 }}>
          {/* Longevity Score card */}
          <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: `${scoreColor}40`, borderLeftWidth: 4, borderLeftColor: scoreColor }]}>
            <Text style={[styles.scoreEyebrow, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>LONGEVITY SCORE</Text>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
              <Text style={[styles.scoreBig, { color: scoreColor, fontFamily: "Cormorant_700Bold" }]}>
                {ls?.score ?? "—"}
              </Text>
              <Text style={[{ fontSize: 22, color: colors.warmGray, fontFamily: "Cormorant_400Regular", marginBottom: 6 }]}>/100</Text>
              {ls?.bio_age && (
                <View style={[styles.bioAgePill, { backgroundColor: `${scoreColor}18` }]}>
                  <Text style={[{ color: scoreColor, fontFamily: "Lato_700Bold", fontSize: 12 }]}>Bio Age: {ls.bio_age}</Text>
                </View>
              )}
            </View>
            <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
              <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 12 }]}>{ls?.label ?? "Not Yet Assessed"}</Text>
            </View>

            {/* Component bars */}
            {ls && ls.scans_completed > 0 && (
              <View style={{ gap: 8, marginTop: 4 }}>
                {[
                  { key: "health", label: "Health Score", icon: "activity" },
                  { key: "skin", label: "Skin Score", icon: "sun" },
                  { key: "burnout", label: "Burnout Resilience", icon: "wind" },
                ].map((item) => {
                  const val = ls.components[item.key];
                  if (!val) return null;
                  const c = val >= 70 ? "#5C7A6B" : val >= 50 ? "#C4956A" : "#B05A3A";
                  return (
                    <View key={item.key} style={{ gap: 4 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                          <Feather name={item.icon as any} size={11} color={c} />
                          <Text style={{ fontSize: 12, color: colors.warmGray, fontFamily: "Lato_400Regular" }}>{item.label}</Text>
                        </View>
                        <Text style={{ fontSize: 12, color: c, fontFamily: "Lato_700Bold" }}>{val}</Text>
                      </View>
                      <View style={[{ height: 4, borderRadius: 2, overflow: "hidden" }, { backgroundColor: colors.secondary }]}>
                        <View style={{ height: 4, borderRadius: 2, backgroundColor: c, width: `${val}%` as any }} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {(!ls || ls.scans_completed === 0) && (
              <View style={{ alignItems: "center", gap: 8, paddingVertical: 8 }}>
                <Text style={{ fontSize: 13, color: colors.warmGray, fontFamily: "Lato_300Light", textAlign: "center" }}>
                  Complete at least one health assessment to calculate your Longevity Score
                </Text>
                <Pressable onPress={() => router.push("/extras/scan" as any)} style={[styles.ctaBtn, { backgroundColor: "#1a1a1a" }]}>
                  <Text style={[{ color: "#fff", fontSize: 13, fontFamily: "Lato_700Bold" }]}>Take Health Scan</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Timeline */}
          {timeline.length > 0 ? (
            <View style={{ gap: 4 }}>
              <Text style={[styles.sectionLabel, { color: colors.warmGray, fontFamily: "Lato_700Bold" }]}>WELLNESS TIMELINE</Text>
              <View style={{ gap: 12, marginTop: 8 }}>
                {timeline.map((item, i) => {
                  if (item.type === "scan") {
                    const meta = SCAN_LABELS[item.scan_type] ?? { label: "Scan", color: "#8B9B8A", icon: "activity" };
                    const sColor = item.score >= 70 ? "#5C7A6B" : item.score >= 50 ? "#C4956A" : "#B05A3A";
                    return (
                      <View key={`scan-${item.id}-${i}`} style={[styles.timelineItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <View style={[styles.dot, { backgroundColor: meta.color }]}>
                              <Feather name={meta.icon as any} size={11} color="#fff" />
                            </View>
                            <Text style={{ fontSize: 14, color: colors.foreground, fontFamily: "Lato_700Bold" }}>{meta.label}</Text>
                          </View>
                          <View style={[{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: sColor }]}>
                            <Text style={[{ color: "#fff", fontSize: 12, fontFamily: "Lato_700Bold" }]}>{item.score}/100</Text>
                          </View>
                        </View>
                        <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_300Light", marginTop: 4 }}>{formatDate(item.date)}</Text>
                      </View>
                    );
                  }
                  if (item.type === "lab") {
                    const sc = STATUS_COLORS[item.status] ?? "#8B9B8A";
                    return (
                      <View key={`lab-${item.id}-${i}`} style={[styles.timelineItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <View style={[styles.dot, { backgroundColor: sc }]}>
                              <Feather name="thermometer" size={11} color="#fff" />
                            </View>
                            <Text style={{ fontSize: 14, color: colors.foreground, fontFamily: "Lato_700Bold" }}>{item.marker_name}</Text>
                          </View>
                          <Text style={{ fontSize: 13, color: sc, fontFamily: "Lato_700Bold" }}>{item.value} {item.unit}</Text>
                        </View>
                        <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_300Light", marginTop: 4 }}>{formatDate(item.date)} · Lab Result</Text>
                      </View>
                    );
                  }
                  if (item.type === "metric") {
                    return (
                      <View key={`metric-${item.id}-${i}`} style={[styles.timelineItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <View style={[styles.dot, { backgroundColor: "#5C7A6B" }]}>
                            <Feather name="trending-up" size={11} color="#fff" />
                          </View>
                          <Text style={{ fontSize: 14, color: colors.foreground, fontFamily: "Lato_700Bold" }}>
                            Body Metrics {item.weight_kg ? `· ${item.weight_kg} kg` : ""} {item.body_fat_pct ? `· ${item.body_fat_pct}% fat` : ""}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_300Light", marginTop: 4 }}>{formatDate(item.date)}</Text>
                      </View>
                    );
                  }
                  if (item.type === "appointment") {
                    const ac = item.status === "completed" ? "#5C7A6B" : item.status === "planned" ? "#C4956A" : "#8B9B8A";
                    return (
                      <View key={`appt-${item.id}-${i}`} style={[styles.timelineItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <View style={[styles.dot, { backgroundColor: ac }]}>
                              <Feather name="calendar" size={11} color="#fff" />
                            </View>
                            <Text style={{ fontSize: 14, color: colors.foreground, fontFamily: "Lato_700Bold" }}>{item.service_name}</Text>
                          </View>
                          {item.rating && <View style={{ flexDirection: "row", gap: 1 }}>{[1,2,3,4,5].map((s) => <Feather key={s} name="star" size={10} color={s <= item.rating ? "#C4956A" : colors.border} />)}</View>}
                        </View>
                        <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_300Light", marginTop: 4 }}>{formatDate(item.date)} · {item.status}</Text>
                      </View>
                    );
                  }
                  return null;
                })}
              </View>
            </View>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Feather name="clock" size={28} color={colors.mutedForeground} />
              <Text style={[{ color: colors.warmGray, fontSize: 15, fontFamily: "Lato_300Light", textAlign: "center" }]}>
                Your wellness journey will appear here as you complete assessments and track your health
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  heroLabel: { color: "rgba(255,255,255,0.45)", fontSize: 10, letterSpacing: 2.5 },
  heroTitle: { color: "#fff", fontSize: 38, lineHeight: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  scoreCard: { borderRadius: 20, borderWidth: 1, padding: 22, gap: 12 },
  scoreEyebrow: { fontSize: 10, letterSpacing: 2.5 },
  scoreBig: { fontSize: 72, lineHeight: 74 },
  bioAgePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  scoreBadge: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 8 },
  ctaBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 50 },
  sectionLabel: { fontSize: 11, letterSpacing: 1.5 },
  timelineItem: { borderRadius: 14, borderWidth: 1, padding: 14 },
  dot: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  emptyCard: { borderRadius: 18, borderWidth: 1, padding: 28, alignItems: "center", gap: 12 },
});
