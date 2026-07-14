import React, { useState, useEffect } from "react";
import {
  Image,
  Linking,
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
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useI18n } from "@/context/I18nContext";
import { useAuth } from "@/context/AuthContext";
import { programs, quickActions } from "@/data/programs";
import { ProgramCard } from "@/components/ProgramCard";
import { getPersonalizedMessage, type PersonalizedMessage } from "@/lib/personalization";

const GOLD = "#C4956A";
const SAGE = "#8B9B8A";


export default function HomeScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const [personalMsg, setPersonalMsg] = useState<PersonalizedMessage | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const msg = await getPersonalizedMessage(auth.user?.name ?? undefined);
      if (active) setPersonalMsg(msg);
    })();
    return () => { active = false; };
  }, [auth.user?.name]);

  const handleAction = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background, position: 'relative' }}
      contentContainerStyle={{ paddingBottom: 100 + bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: topPad + 24, paddingHorizontal: 24 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.brandSmall, { color: colors.sage, fontFamily: "Lato_300Light" }]}>
              DUBAI MARINA
            </Text>
            <Text style={[styles.brandName, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              drypSKin
            </Text>
            {/* <Text style={[styles.brandTagline, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
              Dubai’s first Members Wellness Club
            </Text> */}
            {/* {personalMsg && (auth.user || personalMsg.greeting !== "Welcome back, there.") ? ( */}
            {
              auth?.user ? (
                <>
                  <Text style={[styles.brandTagline, { color: GOLD, fontFamily: "Lato_400Regular", fontSize: 13, marginTop: 2 }]}>
                    Welcome back {auth?.user?.name},
                  </Text>
                  <Text style={[{ color: GOLD, fontFamily: "Lato_400Regular", fontSize: 13 }]}>
                    How can we help you?
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.brandTagline, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
                    Welcome to our platform!
                  </Text>
                  <Text style={[styles.brandTagline, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
                    How can we help you?
                  </Text>
                </>
              )
            }
            {/* ) : null} */}
          </View>
          <Pressable
            onPress={() => Linking.openURL("https://wa.me/971586078532?text=Hello%20Drypskin!")}
            style={[styles.whatsappFab, { backgroundColor: colors.primary }]}
          >
            <Feather name="message-circle" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* ── Hero Banner ───────────────────────────────────────────────── */}
      <View style={styles.heroBanner}>
        <Image
          source={require("@/assets/images/hero.png")}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroGradient}>
          <View style={[styles.heroPill, { backgroundColor: GOLD + "25", borderColor: GOLD + "50" }]}>
            <View style={[styles.heroPillDot, { backgroundColor: GOLD }]} />
            <Text style={[{ color: GOLD, fontSize: 10, letterSpacing: 1.5, fontFamily: "Lato_700Bold" }]}>
              PRIVATE WELLNESS CLUB
            </Text>
          </View>
          <Text style={[styles.heroHeadline, { fontFamily: "Cormorant_700Bold" }]}>
            Live your life.{"\n"}We're here to{"\n"}empower you.
          </Text>
          <Text style={[styles.heroSub, { fontFamily: "Lato_300Light" }]}>
            Award-winning aesthetics & wellness · Dubai Marina
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/services" as any)}
            style={[styles.heroBtn, { backgroundColor: GOLD }]}
          >
            <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 14, letterSpacing: 0.5 }]}>
              Explore Treatments
            </Text>
            <Feather name="arrow-right" size={15} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* ── Quick Actions ─────────────────────────────────────────────── */}
      <View style={[styles.section, { marginTop: 24 }]}>
        <Text style={[styles.sectionLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
          {t("quick_book_section")}
        </Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.id}
              onPress={() => handleAction(action.route)}
              style={({ pressed }) => [
                styles.actionChip,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Feather name={action.icon as any} size={15} color={colors.sage} />
              <Text style={[styles.actionLabel, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── Laser Hair Removal Card ───────────────────────────────────── */}
      <View style={[styles.section, { marginTop: 32 }]}>
        <Pressable
          onPress={() => router.push("/laser-hair-removal" as any)}
          style={({ pressed }) => [styles.laserCard, {
            backgroundColor: "#1a1a1a",
            borderColor: GOLD + "35",
            opacity: pressed ? 0.9 : 1,
          }]}
        >
          <View style={[styles.laserCardIcon, { backgroundColor: GOLD + "20", borderColor: GOLD + "40" }]}>
            <Feather name="zap" size={26} color={GOLD} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[{ fontSize: 10, color: GOLD, fontFamily: "Lato_700Bold", letterSpacing: 2 }]}>
              LASER HAIR REMOVAL
            </Text>
            <Text style={[{ fontSize: 26, color: "#fff", fontFamily: "Cormorant_700Bold", lineHeight: 28 }]}>
              Freedom starts{"\n"}at AED 50
            </Text>
            <Text style={[{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "Lato_300Light", marginTop: 2 }]}>
              15 areas · 1, 3 & 6-session pricing
            </Text>
          </View>
          <View style={[styles.laserCardArrow, { backgroundColor: GOLD }]}>
            <Feather name="arrow-right" size={16} color="#fff" />
          </View>
        </Pressable>
      </View>

      {/* ── IV Therapy Card ──────────────────────────────────────────── */}
      <View style={[styles.section, { marginTop: 14 }]}>
        <Pressable
          onPress={() => router.push("/iv-therapy" as any)}
          style={({ pressed }) => [styles.laserCard, {
            backgroundColor: colors.card,
            borderColor: GOLD + "30",
            opacity: pressed ? 0.9 : 1,
          }]}
        >
          <View style={[styles.laserCardIcon, { backgroundColor: GOLD + "15", borderColor: GOLD + "30" }]}>
            <Feather name="droplet" size={26} color={GOLD} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[{ fontSize: 10, color: GOLD, fontFamily: "Lato_700Bold", letterSpacing: 2 }]}>
              IV THERAPY
            </Text>
            <Text style={[{ fontSize: 26, color: colors.foreground, fontFamily: "Cormorant_700Bold", lineHeight: 28 }]}>
              Unlock your potential.{"\n"}Empowering dreams.
            </Text>
            <Text style={[{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Lato_300Light", marginTop: 2 }]}>
              16 precision drips · from AED 250
            </Text>
          </View>
          <View style={[styles.laserCardArrow, { backgroundColor: GOLD }]}>
            <Feather name="arrow-right" size={16} color="#fff" />
          </View>
        </Pressable>
      </View>

      {/* ── Home Care Card ───────────────────────────────────────────── */}
      <View style={[styles.section, { marginTop: 14 }]}>
        <Pressable
          onPress={() => router.push("/home-care" as any)}
          style={({ pressed }) => [styles.homeCareCard, {
            backgroundColor: colors.card,
            borderColor: SAGE + "50",
            opacity: pressed ? 0.9 : 1,
          }]}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={[styles.homeCareIcon, { backgroundColor: SAGE + "18" }]}>
                <Feather name="home" size={18} color={SAGE} />
              </View>
              <Text style={[{ fontSize: 10, color: SAGE, fontFamily: "Lato_700Bold", letterSpacing: 2 }]}>
                HOME CARE SERVICES
              </Text>
            </View>
            <Text style={[{ fontSize: 26, color: colors.foreground, fontFamily: "Cormorant_700Bold", lineHeight: 28, marginTop: 2 }]}>
              Can't get to clinic?{"\n"}Clinic will come to you.
            </Text>
            <View style={{ flexDirection: "row", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
              {["IV Drips", "Labs", "Aesthetics"].map((tag) => (
                <View key={tag} style={[styles.homeCareTag, { backgroundColor: SAGE + "14", borderColor: SAGE + "30" }]}>
                  <Text style={[{ color: SAGE, fontFamily: "Lato_400Regular", fontSize: 11 }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={[styles.laserCardArrow, { backgroundColor: SAGE }]}>
            <Feather name="arrow-right" size={16} color="#fff" />
          </View>
        </Pressable>
      </View>

      {/* ── Programs ──────────────────────────────────────────────────── */}
      <View style={[styles.section, { marginTop: 36 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
            {t("our_programs")}
          </Text>
          <Pressable onPress={() => router.push("/programs")}>
            <Text style={[styles.seeAll, { color: colors.sage, fontFamily: "Lato_400Regular" }]}>
              {t("view_all")}
            </Text>
          </Pressable>
        </View>
        <View style={{ gap: 14 }}>
          {programs.map((prog) => (
            <ProgramCard
              key={prog.id}
              program={prog}
              onPress={() => router.push(`/program/${prog.id}` as any)}
            />
          ))}
        </View>
      </View>

      {/* ── Exclusive Offers ──────────────────────────────────────────── */}
      <Pressable
        onPress={() => router.push("/offers" as any)}
        style={({ pressed }) => [
          styles.offersBanner,
          { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
        ]}
      >
        {/* Dark charcoal background with gold accents */}
        <View style={styles.offersBannerInner}>
          {/* Left: text */}
          <View style={{ flex: 1, gap: 6 }}>
            <View style={styles.offersEyebrow}>
              <View style={styles.offersEyebrowDot} />
              <Text style={styles.offersEyebrowText}>EXCLUSIVE</Text>
            </View>
            <Text style={styles.offersBannerTitle}>Monthly{"\n"}Offers</Text>
            <Text style={styles.offersBannerSub}>
              Tap to see this month's curated specials
            </Text>
          </View>

          {/* Right: gold tag icon + arrow */}
          <View style={{ alignItems: "center", gap: 14 }}>
            <View style={styles.offersIconWrap}>
              <Feather name="tag" size={26} color={GOLD} />
            </View>
            <View style={styles.offersArrow}>
              <Feather name="arrow-right" size={14} color="#fff" />
            </View>
          </View>
        </View>

        {/* Gold bottom stripe */}
        <View style={styles.offersGoldStripe} />
      </Pressable>

      {/* ── Stats Strip ───────────────────────────────────────────────── */}
      <View style={[styles.statsRow, { backgroundColor: colors.charcoal, marginTop: 32 }]}>
        {[
          { value: "10K+", label: t("stat_happy_clients") },
          { value: "6", label: t("stat_awards") },
          { value: "90+", label: "Treatments" },
          { value: "5★", label: t("stat_rating") },
        ].map((s, i) => (
          <View key={i} style={[styles.statItem, i < 3 && { borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.1)" }]}>
            <Text style={[styles.statValue, { color: "#fff", fontFamily: "Cormorant_700Bold" }]}>
              {s.value}
            </Text>
            <Text style={[styles.statLabel, { color: "rgba(255,255,255,0.45)", fontFamily: "Lato_300Light" }]}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Contact ───────────────────────────────────────────────────── */}
      <View style={[styles.section, { marginTop: 32 }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
          {t("reach_us")}
        </Text>
        <View style={styles.reachRow}>
          <Pressable
            onPress={() => Linking.openURL("tel:042759200")}
            style={[styles.reachBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="phone" size={16} color="#fff" />
            <Text style={[styles.reachBtnText, { color: "#fff", fontFamily: "Lato_400Regular" }]}>
              {t("call_us")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL("https://wa.me/971586078532?text=Hello%20Drypskin%2C%20I'd%20like%20to%20book%20an%20appointment")}
            style={[styles.reachBtn, { backgroundColor: SAGE }]}
          >
            <Feather name="message-circle" size={16} color="#fff" />
            <Text style={[styles.reachBtnText, { color: "#fff", fontFamily: "Lato_400Regular" }]}>
              {t("whatsapp_us")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL("https://www.instagram.com/drypskin/")}
            style={[styles.reachBtnIcon, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          >
            <Feather name="instagram" size={18} color={colors.foreground} />
          </Pressable>
        </View>
        <View style={[styles.locationChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="map-pin" size={14} color={colors.sage} />
          <Text style={[styles.locationText, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}>
            Unit R-04, Marinascape Mall, Marina, Dubai
          </Text>
        </View>
      </View>
    </ScrollView >
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 8 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brandSmall: { fontSize: 10, letterSpacing: 3, marginBottom: 2 },
  brandName: { fontSize: 40, lineHeight: 42 },
  brandTagline: { fontSize: 14, letterSpacing: 1, marginTop: 2 },
  whatsappFab: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", top: 10, position: 'absolute', right: -10 },

  heroBanner: { marginHorizontal: 20, marginTop: 20, height: 340, borderRadius: 24, overflow: "hidden" },
  heroImage: { width: "100%", height: "100%", position: "absolute" },
  heroGradient: {
    flex: 1,
    backgroundColor: "rgba(26,26,26,0.62)",
    padding: 24,
    justifyContent: "flex-end",
    gap: 10,
  },
  heroPill: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 50, borderWidth: 1 },
  heroPillDot: { width: 5, height: 5, borderRadius: 2.5 },
  heroHeadline: { fontSize: 40, lineHeight: 44, color: "#fff" },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.65)", letterSpacing: 0.3, lineHeight: 18 },
  heroBtn: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 50, marginTop: 4 },

  section: { paddingHorizontal: 20 },
  sectionLabel: { fontSize: 10, letterSpacing: 2.5, marginBottom: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  sectionTitle: { fontSize: 30, lineHeight: 34 },
  seeAll: { fontSize: 14, marginTop: 6 },

  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionChip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 50, borderWidth: 1 },
  actionLabel: { fontSize: 14 },

  laserCard: { flexDirection: "row", alignItems: "center", gap: 16, padding: 20, borderRadius: 22, borderWidth: 1 },
  laserCardIcon: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, flexShrink: 0 },
  laserCardArrow: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", flexShrink: 0 },

  homeCareCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 20, borderRadius: 22, borderWidth: 1 },
  homeCareIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  homeCareTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50, borderWidth: 1 },

  statsRow: { flexDirection: "row", marginHorizontal: 20, borderRadius: 20, overflow: "hidden" },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 20, gap: 4 },
  statValue: { fontSize: 24 },
  statLabel: { fontSize: 10, textAlign: "center" },

  reachRow: { flexDirection: "row", gap: 10, marginTop: 14, marginBottom: 12 },
  reachBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50 },
  reachBtnText: { fontSize: 14 },
  reachBtnIcon: { width: 50, alignItems: "center", justifyContent: "center", borderRadius: 50, borderWidth: 1 },
  locationChip: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1 },

  // ── Offers banner ────────────────────────────────────────────────────────
  offersBanner: { marginHorizontal: 20, marginTop: 24, borderRadius: 22, overflow: "hidden", backgroundColor: "#1a1a1a" },
  offersBannerInner: { flexDirection: "row", alignItems: "center", padding: 22, gap: 16 },
  offersEyebrow: { flexDirection: "row", alignItems: "center", gap: 6 },
  offersEyebrowDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GOLD },
  offersEyebrowText: { color: GOLD, fontFamily: "Lato_700Bold", fontSize: 9, letterSpacing: 2.5 },
  offersBannerTitle: { color: "#fff", fontFamily: "Cormorant_700Bold", fontSize: 32, lineHeight: 35 },
  offersBannerSub: { color: "rgba(255,255,255,0.45)", fontFamily: "Lato_300Light", fontSize: 12 },
  offersIconWrap: { width: 58, height: 58, borderRadius: 18, backgroundColor: GOLD + "18", borderWidth: 1, borderColor: GOLD + "40", alignItems: "center", justifyContent: "center" },
  offersArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: GOLD, alignItems: "center", justifyContent: "center" },
  offersGoldStripe: { height: 3, backgroundColor: GOLD, marginTop: 0 },
  locationText: { fontSize: 13, flex: 1 },
});

