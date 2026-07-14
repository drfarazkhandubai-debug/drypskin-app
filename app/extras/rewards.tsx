import React, { useEffect, useRef, useState } from "react";
import {
  Animated, Easing, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const API_BASE = `https://${process.env.EXPO_PUBLIC_API_URL}/api`;

const TIERS = [
  {
    name: "Bronze", min: 0, max: 499, color: "#8B7355", icon: "award",
    perks: [
      "Welcome wellness gift on first visit",
      "Exclusive member content & app features",
      "Birthday wellness gift (10% off on your birthday)",
      "Priority newsletter & tips from Dr. Khan",
      "AI coach & full health tracking access",
    ],
  },
  {
    name: "Silver", min: 500, max: 1999, color: "#8B9B8A", icon: "star",
    perks: [
      "All Bronze benefits",
      "5% off all treatments & packages",
      "Early access to new services & launches",
      "Monthly personal wellness tip from Dr. Khan",
      "Free skin consultation (once per quarter)",
      "Member-only in-clinic events",
    ],
  },
  {
    name: "Gold", min: 2000, max: 4999, color: "#C4956A", icon: "zap",
    perks: [
      "All Silver benefits",
      "10% off all treatments & products",
      "Priority booking — skip the waitlist",
      "Complimentary treatment add-on every quarter",
      "Free OligoScan yearly (minerals, heavy metals & vitamins)",
      "Dedicated wellness concierge",
      "Exclusive Gold member events",
    ],
  },
  {
    name: "Diamond", min: 5000, max: Infinity, color: "#4A5B8A", icon: "hexagon",
    perks: [
      "All Gold benefits",
      "15% off all treatments, products & packages",
      "VIP priority booking — same-day available",
      "Complimentary NAD+ infusion every month",
      "Free home service visits (quarterly)",
      "Private wellness dinners & VIP events",
      "Personal wellness manager",
      "Quarterly full body health assessment",
    ],
  },
];

const EARN_ACTIONS = [
  { icon: "activity", label: "Complete Health Scan", pts: "+10 pts", color: "#1a1a1a" },
  { icon: "sun", label: "Complete Skin Score", pts: "+10 pts", color: "#8A5A7A" },
  { icon: "zap-off", label: "Complete Burnout Index", pts: "+10 pts", color: "#4A5B8A" },
  { icon: "clock", label: "Complete a Fast", pts: "+15 pts", color: "#4A5B8A" },
  { icon: "calendar", label: "Plan an Appointment", pts: "+25 pts", color: "#1a1a1a" },
  { icon: "trending-up", label: "Log Body Metrics", pts: "+5 pts", color: "#5C7A6B" },
  { icon: "thermometer", label: "Add Lab Result", pts: "+5 pts", color: "#4A7AAA" },
  { icon: "check-square", label: "Log Supplement", pts: "+2 pts", color: "#8A5A7A" },
  { icon: "users", label: "Refer a Friend", pts: "+100 pts", color: "#C4956A" },
  { icon: "sun", label: "Daily Login", pts: "+5 pts", color: "#C4956A" },
];

const ACTION_LABELS: Record<string, string> = {
  complete_health_scan: "Health Scan",
  complete_skin_score: "Skin Score",
  complete_burnout_index: "Burnout Index",
  complete_fasting: "Fasting Session",
  plan_appointment: "Appointment Planned",
  complete_appointment: "Appointment Completed",
  rate_appointment: "Rating Given",
  log_supplement: "Supplement Logged",
  log_body_metrics: "Body Metrics",
  add_lab_result: "Lab Result Added",
  refer_friend: "Referral",
  daily_login: "Daily Login",
  send_ai_message: "AI Coach Chat",
};

export default function RewardsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (auth.token) load();
    else if (!auth.loading) setLoading(false);
  }, [auth.token, auth.loading]);

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/rewards`, { headers: { "x-auth-token": auth.token! } });
      if (res.ok) {
        const d = await res.json();
        setData(d);
        const tier = TIERS.find((t) => t.name === d.tier) ?? TIERS[0];
        const range = tier.name === "Diamond" ? 5000 : tier.max - tier.min;
        const ptInTier = d.points - tier.min;
        const pct = tier.name === "Diamond" ? 1 : Math.min(ptInTier / range, 1);
        Animated.timing(progressAnim, { toValue: pct, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
        Animated.timing(scoreAnim, { toValue: d.points, duration: 1800, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
      }
    } catch {}
    setLoading(false);
  };

  const currentTier = data ? TIERS.find((t) => t.name === data.tier) ?? TIERS[0] : TIERS[0];
  const nextTier = data ? TIERS.find((t) => t.min > data.points) : null;

  const shareReferral = () => {
    const msg = `Join me at drypSKin Clinic, Dubai Marina's most exclusive Private Wellness Club! Get expert IV therapy, peptides, longevity science & premium aesthetics. Book via WhatsApp: https://wa.me/971586078532`;
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: "#1a1a1a" }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
          <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Extras</Text>
        </Pressable>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <View>
            <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>LOYALTY PROGRAMME</Text>
            <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>Rewards</Text>
          </View>
          {data && (
            <View style={[styles.tierBadge, { backgroundColor: `${currentTier.color}25`, borderColor: `${currentTier.color}50` }]}>
              <Feather name={currentTier.icon as any} size={14} color={currentTier.color} />
              <Text style={[{ color: currentTier.color, fontFamily: "Lato_700Bold", fontSize: 14 }]}>{currentTier.name}</Text>
            </View>
          )}
        </View>
      </View>

      {!auth.token ? (
        <View style={styles.center}>
          <Feather name="lock" size={40} color={colors.mutedForeground} />
          <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", marginTop: 12, textAlign: "center" }]}>Sign in to view your wellness rewards</Text>
          <Pressable onPress={() => router.push("/extras/profile" as any)} style={[styles.cta, { backgroundColor: "#1a1a1a", marginTop: 16 }]}>
            <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold" }]}>Sign In</Text>
          </Pressable>
        </View>
      ) : loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.sage} /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 60 + bottomPad, gap: 20 }}>
          {/* Points card */}
          <View style={[styles.pointsCard, { backgroundColor: "#1a1a1a" }]}>
            <Text style={[{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: "Lato_400Regular", letterSpacing: 2.5 }]}>WELLNESS POINTS</Text>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
              <Animated.Text style={[{ fontSize: 72, lineHeight: 74, color: currentTier.color, fontFamily: "Cormorant_700Bold" }]}>
                {scoreAnim.interpolate({ inputRange: [0, Math.max(data?.points ?? 0, 1)], outputRange: ["0", (data?.points ?? 0).toString()] })}
              </Animated.Text>
              <Text style={[{ fontSize: 20, color: "rgba(255,255,255,0.4)", fontFamily: "Lato_300Light", marginBottom: 10 }]}>pts</Text>
            </View>

            {/* Tier progress */}
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Feather name={currentTier.icon as any} size={13} color={currentTier.color} />
                  <Text style={{ color: currentTier.color, fontFamily: "Lato_700Bold", fontSize: 12 }}>{currentTier.name}</Text>
                </View>
                {nextTier && <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Lato_300Light", fontSize: 11 }}>{nextTier.name} at {nextTier.min} pts</Text>
                  <Feather name={nextTier.icon as any} size={13} color={nextTier.color} />
                </View>}
              </View>
              <View style={[{ height: 8, borderRadius: 4, overflow: "hidden" }, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                <Animated.View style={[{ height: 8, borderRadius: 4, backgroundColor: currentTier.color }, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
              </View>
              {nextTier && <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Lato_300Light", textAlign: "center" }}>
                {nextTier.min - (data?.points ?? 0)} points to {nextTier.name}
              </Text>}
              {!nextTier && <Text style={{ color: currentTier.color, fontSize: 12, fontFamily: "Lato_700Bold", textAlign: "center" }}>
                You have reached the highest tier!
              </Text>}
            </View>

            {/* Current perks */}
            <View style={[styles.perksBox, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
              <Text style={[{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: "Lato_700Bold", letterSpacing: 1.5 }]}>YOUR {currentTier.name.toUpperCase()} PERKS</Text>
              {(data?.perks ?? []).map((p: string, i: number) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="check" size={12} color={currentTier.color} />
                  <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Lato_300Light" }}>{p}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Referral CTA */}
          <View style={[styles.referCard, { backgroundColor: colors.card, borderColor: `#C4956A40` }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={[{ width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" }, { backgroundColor: "#C4956A20" }]}>
                <Feather name="users" size={22} color="#C4956A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 24 }]}>Refer a Friend</Text>
                <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 12 }]}>Earn +100 points per referral</Text>
              </View>
              <View style={[{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: "#C4956A" }]}>
                <Text style={{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 13 }}>+100</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable onPress={shareReferral} style={({ pressed }) => [styles.referBtn, { flex: 1, backgroundColor: "#1a1a1a", opacity: pressed ? 0.85 : 1 }]}>
                <Feather name="share-2" size={16} color="#fff" />
                <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 14 }]}>Share Link</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/extras/account-referral" as any)} style={({ pressed }) => [styles.referBtn, { flex: 1, backgroundColor: "#C4956A20", borderWidth: 1, borderColor: "#C4956A80", opacity: pressed ? 0.85 : 1 }]}>
                <Feather name="gift" size={16} color="#C4956A" />
                <Text style={[{ color: "#C4956A", fontFamily: "Lato_700Bold", fontSize: 14 }]}>View Credits</Text>
              </Pressable>
            </View>
          </View>

          {/* All tiers */}
          <View style={[styles.tiersCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 26 }]}>Membership Tiers</Text>
            {TIERS.map((t, i) => {
              const isCurrent = t.name === data?.tier;
              return (
                <View key={t.name} style={[styles.tierBlock, { borderTopWidth: i > 0 ? 1 : 0, borderTopColor: colors.border, backgroundColor: isCurrent ? `${t.color}08` : "transparent" }]}>
                  {/* Tier header */}
                  <View style={styles.tierRow}>
                    <View style={[styles.tierIcon, { backgroundColor: `${t.color}18`, borderColor: isCurrent ? t.color : "transparent", borderWidth: 2 }]}>
                      <Feather name={t.icon as any} size={18} color={t.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={{ color: t.color, fontFamily: "Lato_700Bold", fontSize: 16 }}>{t.name}</Text>
                        {isCurrent && (
                          <View style={[{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, backgroundColor: t.color }]}>
                            <Text style={{ color: "#fff", fontSize: 9, fontFamily: "Lato_700Bold" }}>CURRENT</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ color: colors.mutedForeground, fontSize: 11, fontFamily: "Lato_300Light" }}>
                        {t.max === Infinity ? `${t.min.toLocaleString()}+ pts` : `${t.min.toLocaleString()}–${t.max.toLocaleString()} pts`}
                      </Text>
                    </View>
                  </View>
                  {/* All perks for this tier */}
                  <View style={{ paddingLeft: 60, gap: 7 }}>
                    {t.perks.map((p, pi) => (
                      <View key={pi} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                        <Feather name={p.startsWith("All ") ? "layers" : "check"} size={12} color={p.startsWith("All ") ? colors.mutedForeground : t.color} style={{ marginTop: 2 }} />
                        <Text style={{
                          flex: 1, fontSize: 13, fontFamily: p.startsWith("All ") ? "Lato_300Light" : "Lato_400Regular",
                          color: p.startsWith("All ") ? colors.mutedForeground : colors.foreground, lineHeight: 18,
                        }}>{p}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>

          {/* How to earn */}
          <View style={[styles.earnCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 26 }]}>Earn Points</Text>
            <View style={{ gap: 10 }}>
              {EARN_ACTIONS.map((a, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={[{ width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" }, { backgroundColor: `${a.color}12` }]}>
                    <Feather name={a.icon as any} size={14} color={a.color} />
                  </View>
                  <Text style={{ flex: 1, color: colors.foreground, fontFamily: "Lato_400Regular", fontSize: 13 }}>{a.label}</Text>
                  <Text style={{ color: "#5C7A6B", fontFamily: "Lato_700Bold", fontSize: 13 }}>{a.pts}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Event history */}
          {data?.events?.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text style={[{ color: colors.warmGray, fontSize: 11, fontFamily: "Lato_700Bold", letterSpacing: 1.5 }]}>RECENT ACTIVITY</Text>
              {data.events.map((e: any, i: number) => (
                <View key={i} style={[styles.eventRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Feather name="plus-circle" size={14} color="#5C7A6B" />
                  <Text style={{ flex: 1, color: colors.foreground, fontFamily: "Lato_400Regular", fontSize: 13 }}>
                    {ACTION_LABELS[e.action] ?? e.action}
                  </Text>
                  <Text style={{ color: "#5C7A6B", fontFamily: "Lato_700Bold", fontSize: 13 }}>+{e.points}</Text>
                </View>
              ))}
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
  tierBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  cta: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 50 },
  pointsCard: { borderRadius: 22, padding: 24, gap: 16 },
  perksBox: { borderRadius: 14, padding: 14, gap: 10 },
  referCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 14 },
  referBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50 },
  tiersCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 0, overflow: "hidden" },
  tierBlock: { paddingTop: 16, paddingBottom: 16, gap: 12, paddingHorizontal: 4, borderRadius: 10 },
  tierRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  tierIcon: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  earnCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 14 },
  eventRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
});
