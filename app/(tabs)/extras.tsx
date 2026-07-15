import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
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
import { useI18n } from "@/context/I18nContext";
import { runHealthPipeline, riskColor, type HealthPrediction, type PersonalizedMessage } from "@/lib/healthPipeline";
import { generateWellnessInsight, type WellnessInsight } from "@/lib/intelligence";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

// ─── Classic wellness tools ───────────────────────────────────────────────────
const classicTools = [
  { id: "bmi", title: "BMI Calculator", subtitle: "Body Mass Index", description: "Instantly calculate your BMI and understand what it means for your health.", icon: "bar-chart-2", color: "#5C7A6B", route: "/extras/bmi" },
  { id: "calorie", title: "Calorie Diary", subtitle: "Daily Food Log", description: "Track your daily food intake, log meals, and monitor calories against your goal.", icon: "book-open", color: "#C4956A", route: "/extras/calorie" },
  { id: "health", title: "Health Tracker", subtitle: "Wellness Score", description: "Log water, steps and calories to get a real-time wellness score and recommendations.", icon: "heart", color: "#4A5B8A", route: "/extras/health" },
];

// ─── Animated assessments ────────────────────────────────────────────────────
const assessments = [
  { id: "scan", title: "Health Scan", subtitle: "2-Minute Assessment", description: "10 questions across all wellness domains. Get a holistic health score and personalised IV therapy recommendations.", icon: "activity", color: "#1a1a1a", badge: "2 MIN", route: "/extras/scan" },
  { id: "skin-score", title: "Skin Score", subtitle: "Skin Analysis", description: "Assess your skin type, concerns and routine. Receive a skin health score and targeted aesthetic treatment plan.", icon: "sun", color: "#8A5A7A", badge: "6 Q", route: "/extras/skin-score" },
  { id: "burnout", title: "Burnout Index", subtitle: "Stress & Recovery", description: "Measure exhaustion, stress resilience and recovery status. Uncover your burnout risk and discover your recovery protocol.", icon: "zap-off", color: "#4A5B8A", badge: "7 Q", route: "/extras/burnout" },
];

// ─── New premium tools ────────────────────────────────────────────────────────
const myHealthTools = [
  { id: "journey", title: "Longevity Score", subtitle: "Wellness Journey", icon: "clock", color: "#1a1a1a", route: "/extras/journey", desc: "Your composite health score & bio-age" },
  { id: "ai-coach", title: "AI Coach", subtitle: "Wellness AI", icon: "cpu", color: "#C4956A", route: "/extras/ai-coach", desc: "Dr. Khan's personalised AI advisor" },
  { id: "rewards", title: "Rewards", subtitle: "Loyalty Points", icon: "award", color: "#8B9B8A", route: "/extras/rewards", desc: "Earn points across all activities" },
];

const trackerTools = [
  { id: "body-metrics",   title: "Body Metrics",    icon: "trending-up",  color: "#5C7A6B", route: "/extras/body-metrics",   desc: "Weight, body fat & measurements" },
  { id: "lab-results",    title: "Lab Results",     icon: "thermometer",  color: "#4A7AAA", route: "/extras/lab-results",    desc: "18 biomarkers with optimal ranges" },
  { id: "supplements",    title: "Supplement Log",  icon: "check-square", color: "#8A5A7A", route: "/extras/supplements",    desc: "Peptides & supplement daily tracker" },
  { id: "fasting",        title: "Fasting Timer",   icon: "clock",        color: "#4A5B8A", route: "/extras/fasting",        desc: "16:8, OMAD & IF protocols" },
  { id: "sleep-tracker",  title: "Sleep Tracker",   icon: "moon",         color: "#1E3A5F", route: "/extras/sleep-tracker",  desc: "Log & chart nightly sleep duration" },
  { id: "sleep",          title: "Sleep Optimiser", icon: "sunrise",      color: "#4A5B8A", route: "/extras/sleep",          desc: "Chronotype analysis & recommendations" },
  { id: "caffeine",       title: "Caffeine Tracker", icon: "coffee",      color: "#8B6344", route: "/extras/caffeine",       desc: "Daily intake · late-caffeine alerts" },
  { id: "appointments",   title: "Appointments",    icon: "calendar",     color: "#8B9B8A", route: "/extras/appointments",   desc: "Treatment history & ratings" },
];

const clinicTools = [
  { id: "package-builder", title: "Package Builder", subtitle: "Treatment Planning", icon: "layers", color: "#1a1a1a", route: "/extras/package-builder", desc: "Build a custom treatment package & send to clinic" },
];

export default function ExtrasScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const { t } = useI18n();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const initials = (auth.user?.name || auth.user?.email || "?")
    .split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!auth.loading) setAuthReady(true);
  }, [auth.loading]);

  const [prediction, setPrediction] = useState<HealthPrediction | null>(null);
  const [personalMsg, setPersonalMsg] = useState<PersonalizedMessage | null>(null);
  const [insight, setInsight] = useState<WellnessInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);

  // ── Animation values ──────────────────────────────────────────────────────
  const insightFade = useRef(new Animated.Value(0)).current;
  const ctaScale    = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let active = true;
    (async () => {
      setInsightLoading(true);
      try {
        let scans: any[] = [];
        if (auth.token) {
          const res = await fetch(`${API_BASE}/health-scans`, {
            headers: { "x-auth-token": auth.token },
          });
          if (res.ok) {
            const data = await res.json();
            scans = (data.scans ?? data ?? []).map((s: any) => ({
              date: s.created_at,
              answers: s.answers ?? {},
              score: s.score,
            }));
          }
        }
        if (!active) return;
        const pipelineResult = await runHealthPipeline(scans, auth.user?.name ?? undefined);
        if (!active) return;
        setPrediction(pipelineResult.prediction);
        setPersonalMsg(pipelineResult.personalizedMessage);
        setInsight(generateWellnessInsight(pipelineResult));
      } catch {
        if (!active) return;
        const pipelineResult = await runHealthPipeline([], auth.user?.name ?? undefined);
        setPrediction(pipelineResult.prediction);
        setInsight(generateWellnessInsight(pipelineResult));
      } finally {
        if (active) {
          setInsightLoading(false);
          Animated.timing(insightFade, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }).start();
        }
      }
    })();
    return () => { active = false; };
  }, [auth.token, auth.user?.name]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPad + 20, borderBottomColor: colors.border }]}>
        <Text style={[styles.eyebrow, { color: colors.sage, fontFamily: "Lato_400Regular" }]}>PRIVATE WELLNESS CLUB</Text>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{t("wellness_hub")}</Text>
        <Text style={[styles.sub, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
          {t("wellness_hub_sub")}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 + bottomPad, gap: 20 }}>

        {/* ── Profile banner ─────────────────────────────────────────────── */}
        <Pressable
          onPress={() => {
            if (!authReady) return;
            router.push(auth.user ? "/extras/account" : "/extras/profile" as any);
          }}
          style={({ pressed }) => [styles.profileBanner, { backgroundColor: auth.user ? colors.card : "#1a1a1a", borderColor: auth.user ? colors.border : "#1a1a1a", opacity: pressed ? 0.9 : 1 }]}>
          {auth.loading ? (
            <>
              <View style={[styles.profileAvatar, { backgroundColor: "rgba(196,149,106,0.15)" }]}>
                <ActivityIndicator size="small" color="#C4956A" />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <View style={{ height: 14, width: 120, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.12)" }} />
                <View style={{ height: 10, width: 80, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.08)" }} />
              </View>
            </>
          ) : auth.user ? (
            <>
              <View style={[styles.profileAvatar, { backgroundColor: "#C4956A" }]}>
                <Text style={[styles.profileInitials, { fontFamily: "Cormorant_700Bold" }]}>{initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.profileName, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{auth.user.name || "My Account"}</Text>
                <Text style={[styles.profileEmail, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>{t("profile_links")}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </>
          ) : (
            <>
              <View style={[styles.profileAvatar, { backgroundColor: "rgba(196,149,106,0.2)" }]}>
                <Feather name="user" size={22} color="#C4956A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.profileName, { color: "#fff", fontFamily: "Cormorant_700Bold" }]}>{t("join_club")}</Text>
                <Text style={[{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "Lato_300Light" }]}>{t("sign_in_unlock")}</Text>
              </View>
              <View style={[styles.joinBtn, { backgroundColor: "#C4956A" }]}>
                <Text style={[{ color: "#fff", fontSize: 12, fontFamily: "Lato_700Bold" }]}>{t("sign_in")}</Text>
              </View>
            </>
          )}
        </Pressable>

        {/* ── My Health (Tier 1) ─────────────────────────────────────────── */}
        <View style={{ gap: 6 }}>
          <Text style={[styles.sectionLabel, { color: colors.warmGray, fontFamily: "Lato_700Bold" }]}>{t("my_health_label")}</Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>{t("my_health_sub")}</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          {myHealthTools.map((tool) => (
            <Pressable key={tool.id} onPress={() => router.push(tool.route as any)}
              style={({ pressed }) => [styles.triCard, { backgroundColor: colors.card, borderColor: colors.border, flex: 1, opacity: pressed ? 0.85 : 1 }]}>
              <View style={[styles.triIcon, { backgroundColor: `${tool.color}15` }]}>
                <Feather name={tool.icon as any} size={20} color={tool.color} />
              </View>
              <Text style={[{ color: tool.color, fontSize: 8, fontFamily: "Lato_700Bold", letterSpacing: 1.5 }]}>{tool.subtitle.toUpperCase()}</Text>
              <Text style={[{ color: colors.foreground, fontSize: 17, fontFamily: "Cormorant_700Bold", lineHeight: 18 }]}>{tool.title}</Text>
              <Text style={[{ color: colors.mutedForeground, fontSize: 10, fontFamily: "Lato_300Light", lineHeight: 14 }]}>{tool.desc}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Upcoming Insight (Predictive Health) ───────────────────────── */}
        {insightLoading ? (
          <View style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.border, alignItems: "center", justifyContent: "center", minHeight: 96 }]}>
            <ActivityIndicator size="small" color="#C4956A" />
          </View>
        ) : prediction ? (
          <Animated.View style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: insightFade }]}>
            <View style={styles.insightHeader}>
              <View style={[styles.insightDot, { backgroundColor: riskColor(prediction.riskLevel) }]} />
              <Text style={[styles.insightEyebrow, { color: colors.warmGray, fontFamily: "Lato_700Bold" }]}>UPCOMING INSIGHT</Text>
              <View style={[styles.insightBadge, { backgroundColor: riskColor(prediction.riskLevel) + "20", borderColor: riskColor(prediction.riskLevel) + "40" }]}>
                <Text style={[{ color: riskColor(prediction.riskLevel), fontSize: 9, fontFamily: "Lato_700Bold", letterSpacing: 1 }]}>
                  {prediction.riskLevel.toUpperCase()} RISK
                </Text>
              </View>
            </View>

            {/* Prediction headline */}
            <Text style={[styles.insightPrediction, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              {prediction.prediction}
            </Text>

            {/* Doctor message — premium clinical prose */}
            {insight?.doctorMessage ? (
              <Text style={[styles.insightSub, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>
                {insight.doctorMessage}
              </Text>
            ) : personalMsg?.insight ? (
              <Text style={[styles.insightSub, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>
                {personalMsg.insight}
              </Text>
            ) : null}

            {/* Returning user comparison delta */}
            {insight?.comparisonDelta ? (
              <Text style={[{ fontSize: 11, color: riskColor(prediction.riskLevel), fontFamily: "Lato_400Regular", fontStyle: "italic" }]}>
                {insight.comparisonDelta}
              </Text>
            ) : null}

            {/* Recommendation bar */}
            <View style={[styles.insightRec, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="zap" size={12} color="#C4956A" />
              <Text style={[styles.insightRecText, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                {insight?.recommendation ?? prediction.recommendation}
              </Text>
            </View>

            {/* Social proof */}
            {insight?.socialProof ? (
              <Text style={[{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_300Light", textAlign: "center" }]}>
                {insight.socialProof}
              </Text>
            ) : null}

            {/* CTA — scale-animated, smart-routed */}
            <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
              <Pressable
                onPress={() => {
                  Animated.sequence([
                    Animated.timing(ctaScale, { toValue: 0.96, duration: 80, useNativeDriver: false }),
                    Animated.timing(ctaScale, { toValue: 1,    duration: 80, useNativeDriver: false }),
                  ]).start(() => router.push((insight?.ctaRoute ?? "/extras/scan") as any));
                }}
                style={[styles.insightCta, { backgroundColor: "#C4956A" }]}
              >
                <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 13, letterSpacing: 0.5 }]}>
                  {insight?.ctaLabel ?? "Fix This Now"}
                </Text>
                <Feather name="arrow-right" size={13} color="#fff" />
              </Pressable>
            </Animated.View>
          </Animated.View>
        ) : null}

        {/* ── Health Assessments ─────────────────────────────────────────── */}
        <View style={{ gap: 6 }}>
          <Text style={[styles.sectionLabel, { color: colors.warmGray, fontFamily: "Lato_700Bold" }]}>{t("health_assess_label")}</Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>{t("health_assess_sub")}</Text>
        </View>

        {assessments.map((tool) => (
          <Pressable key={tool.id} onPress={() => router.push(tool.route as any)}
            style={({ pressed }) => [styles.assessCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 }]}>
            <View style={[styles.assessBar, { backgroundColor: tool.color }]}>
              <Feather name={tool.icon as any} size={20} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.assessSubtitle, { fontFamily: "Lato_700Bold" }]}>{tool.subtitle.toUpperCase()}</Text>
                <Text style={[styles.assessTitle, { fontFamily: "Cormorant_700Bold" }]}>{tool.title}</Text>
              </View>
              <View style={[styles.assessBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                <Text style={[styles.assessBadgeText, { fontFamily: "Lato_700Bold" }]}>{tool.badge}</Text>
              </View>
            </View>
            <View style={styles.assessBody}>
              <Text style={[styles.assessDesc, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>{tool.description}</Text>
              <View style={styles.assessFooter}>
                <Text style={[styles.assessStart, { color: tool.color, fontFamily: "Lato_700Bold" }]}>{t("start_assessment")}</Text>
                <Feather name="arrow-right" size={14} color={tool.color} />
              </View>
            </View>
          </Pressable>
        ))}

        {/* ── Trackers (Tier 2 & 3) ──────────────────────────────────────── */}
        <View style={{ gap: 6 }}>
          <Text style={[styles.sectionLabel, { color: colors.warmGray, fontFamily: "Lato_700Bold" }]}>{t("trackers_label")}</Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>{t("trackers_sub")}</Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {trackerTools.map((tool) => (
            <Pressable key={tool.id} onPress={() => router.push(tool.route as any)}
              style={({ pressed }) => [styles.trackerCard, { backgroundColor: colors.card, borderColor: colors.border, width: "47%", opacity: pressed ? 0.85 : 1 }]}>
              <View style={[styles.trackerIcon, { backgroundColor: `${tool.color}15` }]}>
                <Feather name={tool.icon as any} size={18} color={tool.color} />
              </View>
              <Text style={[{ color: colors.foreground, fontSize: 15, fontFamily: "Lato_700Bold", lineHeight: 18 }]}>{tool.title}</Text>
              <Text style={[{ color: colors.mutedForeground, fontSize: 11, fontFamily: "Lato_300Light", lineHeight: 14 }]}>{tool.desc}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                <Text style={[{ color: tool.color, fontSize: 11, fontFamily: "Lato_700Bold" }]}>{t("open_tool")}</Text>
                <Feather name="arrow-right" size={10} color={tool.color} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* ── Smart Devices ─────────────────────────────────────────────── */}
        <View style={{ gap: 6 }}>
          <Text style={[styles.sectionLabel, { color: colors.warmGray, fontFamily: "Lato_700Bold" }]}>SMART DEVICES</Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>Apple Watch, Oura Ring, Google Fit & more</Text>
        </View>

        <Pressable onPress={() => router.push("/extras/integrations" as any)}
          style={({ pressed }) => [styles.deviceBanner, { backgroundColor: "#1a1a1a", borderColor: "#C4956A33", opacity: pressed ? 0.9 : 1 }]}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {[
              { label: "Apple Watch", color: "#FF3B30" },
              { label: "Oura Ring",   color: "#7C3AED" },
              { label: "Google Fit",  color: "#0D9488" },
              { label: "WHOOP",       color: "#EA580C" },
              { label: "Garmin",      color: "#2563EB" },
              { label: "Samsung",     color: "#1428A0" },
            ].map(d => (
              <View key={d.label} style={[styles.devicePill, { backgroundColor: d.color + "20", borderColor: d.color + "40" }]}>
                <View style={[styles.deviceDot, { backgroundColor: d.color }]} />
                <Text style={[{ fontSize: 11, color: "#fff", fontFamily: "Lato_700Bold" }]}>{d.label}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}>
              <Text style={[{ fontSize: 22, color: "#fff", fontFamily: "Cormorant_700Bold", lineHeight: 24 }]}>Connect your wearables</Text>
              <Text style={[{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "Lato_300Light", marginTop: 4 }]}>Sync sleep, HRV, steps & recovery into your Longevity Score</Text>
            </View>
            <View style={[styles.deviceArrow, { backgroundColor: "#C4956A" }]}>
              <Feather name="arrow-right" size={16} color="#fff" />
            </View>
          </View>
        </Pressable>

        {/* ── AI Health Tools ────────────────────────────────────────────── */}
        <View style={{ gap: 6 }}>
          <Text style={[styles.sectionLabel, { color: colors.warmGray, fontFamily: "Lato_700Bold" }]}>AI HEALTH TOOLS</Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>Smart assessments powered by clinical AI</Text>
        </View>

        {/* ── Symptom Checker card ────────────────────────────────────────── */}
        <Pressable
          onPress={() => router.push("/extras/symptom-mode" as any)}
          style={({ pressed }) => [{
            flexDirection: "row" as const,
            alignItems: "center" as const,
            gap: 14,
            padding: 18,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#AA4A4A30",
            backgroundColor: "#AA4A4A08",
            opacity: pressed ? 0.88 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          }]}
        >
          <View style={{
            width: 48, height: 48, borderRadius: 24,
            backgroundColor: "#AA4A4A15",
            alignItems: "center", justifyContent: "center",
          }}>
            <Feather name="thermometer" size={20} color="#AA4A4A" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[{ color: "#AA4A4A", fontFamily: "Lato_700Bold", fontSize: 9, letterSpacing: 2 }]}>
              AI-POWERED
            </Text>
            <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 20, lineHeight: 22 }]}>
              Symptom Checker
            </Text>
            <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 12, lineHeight: 16 }]}>
              Get a clinical assessment + personalised recommendation
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.warmGray} />
        </Pressable>

        {/* ── Clinic Services (Package Builder + Video Library) ─────────── */}
        <View style={{ gap: 6 }}>
          <Text style={[styles.sectionLabel, { color: colors.warmGray, fontFamily: "Lato_700Bold" }]}>{t("clinic_svc_label")}</Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>{t("clinic_svc_sub")}</Text>
        </View>

        {clinicTools.map((tool) => (
          <Pressable key={tool.id} onPress={() => router.push(tool.route as any)}
            style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 }]}>
            <View style={[styles.cardColorBar, { backgroundColor: tool.color }]} />
            <View style={styles.cardBody}>
              <View style={[styles.iconWrap, { backgroundColor: `${tool.color}18` }]}>
                <Feather name={tool.icon as any} size={26} color={tool.color} />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardSubtitle, { color: tool.color, fontFamily: "Lato_700Bold" }]}>{tool.subtitle.toUpperCase()}</Text>
                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{tool.title}</Text>
                <Text style={[styles.cardDesc, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>{tool.desc}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} style={styles.chevron} />
            </View>
          </Pressable>
        ))}

        {/* ── Classic Wellness Tools ─────────────────────────────────────── */}
        <View style={{ gap: 6, marginTop: 4 }}>
          <Text style={[styles.sectionLabel, { color: colors.warmGray, fontFamily: "Lato_700Bold" }]}>{t("wellness_tools_label")}</Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>{t("wellness_tools_sub")}</Text>
        </View>

        {classicTools.map((tool) => (
          <Pressable key={tool.id} onPress={() => router.push(tool.route as any)}
            style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 }]}>
            <View style={[styles.cardColorBar, { backgroundColor: tool.color }]} />
            <View style={styles.cardBody}>
              <View style={[styles.iconWrap, { backgroundColor: `${tool.color}18` }]}>
                <Feather name={tool.icon as any} size={26} color={tool.color} />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardSubtitle, { color: tool.color, fontFamily: "Lato_700Bold" }]}>{tool.subtitle.toUpperCase()}</Text>
                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{tool.title}</Text>
                <Text style={[styles.cardDesc, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>{tool.description}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} style={styles.chevron} />
            </View>
          </Pressable>
        ))}

        <View style={[styles.note, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="info" size={14} color={colors.sage} />
          <Text style={[styles.noteText, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
            {t("tools_disclaimer")}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 20, borderBottomWidth: 1 },
  eyebrow: { fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 },
  title: { fontSize: 42, lineHeight: 46 },
  sub: { fontSize: 14, marginTop: 4 },
  sectionLabel: { fontSize: 11, letterSpacing: 1.5 },
  sectionSub: { fontSize: 12, lineHeight: 16 },
  profileBanner: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 18, borderWidth: 1 },
  profileAvatar: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  profileInitials: { color: "#fff", fontSize: 20 },
  profileName: { fontSize: 22, lineHeight: 24 },
  profileEmail: { fontSize: 12, marginTop: 1 },
  joinBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, flexShrink: 0 },
  triCard: { borderRadius: 18, borderWidth: 1, padding: 14, gap: 6 },
  triIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  trackerCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 6 },
  trackerIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  assessCard: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  assessBar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingVertical: 14 },
  assessSubtitle: { color: "rgba(255,255,255,0.7)", fontSize: 9, letterSpacing: 2, marginBottom: 1 },
  assessTitle: { color: "#fff", fontSize: 24, lineHeight: 26 },
  assessBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, flexShrink: 0 },
  assessBadgeText: { color: "#fff", fontSize: 11 },
  assessBody: { padding: 16, gap: 10 },
  assessDesc: { fontSize: 13, lineHeight: 19 },
  assessFooter: { flexDirection: "row", alignItems: "center", gap: 6 },
  assessStart: { fontSize: 13 },
  card: { borderRadius: 22, borderWidth: 1, overflow: "hidden" },
  cardColorBar: { height: 4 },
  cardBody: { flexDirection: "row", alignItems: "flex-start", padding: 18, gap: 14 },
  iconWrap: { width: 54, height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardText: { flex: 1, gap: 3 },
  cardSubtitle: { fontSize: 10, letterSpacing: 1.5 },
  cardTitle: { fontSize: 26, lineHeight: 28 },
  cardDesc: { fontSize: 13, lineHeight: 19, marginTop: 2 },
  chevron: { marginTop: 4, flexShrink: 0 },
  note: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  noteText: { flex: 1, fontSize: 12, lineHeight: 18 },
  insightCard: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 12 },
  insightHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  insightDot: { width: 8, height: 8, borderRadius: 4 },
  insightEyebrow: { fontSize: 9, letterSpacing: 1.5, flex: 1 },
  insightBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50, borderWidth: 1 },
  insightPrediction: { fontSize: 22, lineHeight: 26 },
  insightSub: { fontSize: 13, lineHeight: 18, marginTop: -4 },
  insightRec: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  insightRecText: { flex: 1, fontSize: 13, lineHeight: 18 },
  insightCta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 14 },
  deviceBanner: { padding: 18, borderRadius: 22, borderWidth: 1 },
  devicePill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 50, borderWidth: 1 },
  deviceDot: { width: 6, height: 6, borderRadius: 3 },
  deviceArrow: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", flexShrink: 0 },
});
