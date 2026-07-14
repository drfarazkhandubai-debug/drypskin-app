import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { GoldButton } from "@/components/GoldButton";


const API_BASE = `https://${process.env.EXPO_PUBLIC_API_URL}/api`;
const GOLD = "#C4956A";
const GREEN = "#22C55E";


interface ServiceDetail {
  id: string;
  category_id: string;
  category_name: string;
  subcategory: string;
  name: string;
  short_desc: string;
  full_desc: string;
  original_price: number | null;
  price: number | null;
  price_display: string;
  price_note: string;
  duration: string;
  icon: string;
  benefits: string[];
  is_popular: boolean;
}

const SUBCATEGORY_LABELS: Record<string, string> = {
  hydrafacials: "Hydrafacials",
  peels: "Peels",
  botox: "Botox",
  fillers: "Dermal Fillers",
  "bio-stimulators": "Bio-Stimulators",
  hifu: "HIFU",
  morpheus: "Morpheus 8",
  lipozero: "Lipozero",
  slimming: "Body Slimming",
  fotona: "Fotona",
  resurfacing: "Laser Resurfacing",
  bbl: "BBL",
  removal: "Laser Removal",
  venus: "Venus Treatments",
};

const CATEGORY_IMAGES: Record<string, any> = {
  aesthetics: require("@/assets/images/aesthetics.png"),
  "face-lifting": require("@/assets/images/aesthetics.png"),
  laser: require("@/assets/images/aesthetics.png"),
  "iv-therapy": require("@/assets/images/iv-therapy.png"),
  packages: require("@/assets/images/aesthetics.png"),
};

export default function ServiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);


  // Load service
  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/services/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.service) setService(d.service); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Load favourite state
  useEffect(() => {
    if (!auth.token || !id) return;
    fetch(`${API_BASE}/favourites`, { headers: { "x-auth-token": auth.token } })
      .then((r) => r.json())
      .then((d) => {
        if (d.favourites) setIsFav(d.favourites.some((f: any) => f.service_id === id));
      })
      .catch(() => {});
  }, [auth.token, id]);

  const toggleFav = useCallback(async () => {
    if (!auth.token || !service) return;
    setFavLoading(true);
    try {
      if (isFav) {
        await fetch(`${API_BASE}/favourites/${id}`, { method: "DELETE", headers: { "x-auth-token": auth.token } });
        setIsFav(false);
      } else {
        await fetch(`${API_BASE}/favourites`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-auth-token": auth.token },
          body: JSON.stringify({
            service_id: id,
            service_name: service.name,
            service_category: service.category_id,
            service_price: service.price_display,
          }),
        });
        setIsFav(true);
      }
    } catch {}
    setFavLoading(false);
  }, [auth.token, id, isFav, service]);

  const bookService = (note?: string) => {
    let msg = `Hello drypSKin! I'd like to book ${service?.name ?? "a treatment"}`;
    if (note) msg += ` — ${note}`;
    msg += `. Please let me know your availability.`;
    Linking.openURL(`https://wa.me/971586078532?text=${encodeURIComponent(msg)}`);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={GOLD} size="large" />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, gap: 12 }}>
        <Feather name="alert-circle" size={32} color={colors.border} />
        <Text style={{ color: colors.warmGray, fontFamily: "Lato_400Regular" }}>Treatment not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: GOLD, fontFamily: "Lato_700Bold" }}>← Go back</Text>
        </Pressable>
      </View>
    );
  }

  const hasDiscount = service.original_price && service.price && service.original_price > service.price;
  const discountPct = hasDiscount ? Math.round((1 - service.price! / service.original_price!) * 100) : 0;
  const savings = hasDiscount ? service.original_price! - service.price! : 0;


  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 120 + bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <View style={styles.imageContainer}>
        <Image
          source={CATEGORY_IMAGES[service.category_id] ?? CATEGORY_IMAGES.aesthetics}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={18} color="#fff" />
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={[styles.catBadge, { backgroundColor: "rgba(0,0,0,0.6)", borderColor: "rgba(255,255,255,0.2)" }]}>
              <Text style={[styles.catBadgeText, { fontFamily: "Lato_700Bold" }]}>
                {SUBCATEGORY_LABELS[service.subcategory] ?? service.category_name}
              </Text>
            </View>
            {service?.is_popular && (
              <View style={[styles.catBadge, { backgroundColor: GOLD + "CC", borderColor: GOLD }]}>
                <Text style={[styles.catBadgeText, { fontFamily: "Lato_700Bold" }]}>POPULAR</Text>
              </View>
            )}
            {auth?.user && (
              <Pressable
                onPress={toggleFav}
                disabled={favLoading}
                style={[styles.favBtn, { backgroundColor: isFav ? "#FF3B30CC" : "rgba(0,0,0,0.5)" }]}
              >
                <Feather name="heart" size={16} color="#fff" />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* ── Title ───────────────────────────────────────────────── */}
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
          {service.name}
        </Text>

        {/* ── Price + duration chips ──────────────────────────── */}
        <View style={styles.chipsRow}>
          <View style={[styles.chip, { backgroundColor: "#1a1a1a" }]}>
            <Feather name="tag" size={13} color={GOLD} />
            <Text style={[styles.chipText, { color: "#fff", fontFamily: "Lato_700Bold" }]}>
              {service.price_display}
            </Text>
          </View>
          {hasDiscount && (
            <View style={[styles.chip, { backgroundColor: GREEN + "15", borderColor: GREEN + "30" }]}>
              <Text style={[styles.chipText, { color: GREEN, fontFamily: "Lato_700Bold" }]}>
                {discountPct}% OFF
              </Text>
            </View>
          )}
          <View style={[styles.chip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="clock" size={13} color={GOLD} />
            <Text style={[styles.chipText, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}>
              {service.duration}
            </Text>
          </View>
        </View>

        {/* Discount savings call-out */}
        {hasDiscount && (
          <View style={[styles.savingsBanner, { backgroundColor: GREEN + "10", borderColor: GREEN + "25" }]}>
            <Feather name="check-circle" size={14} color={GREEN} />
            <Text style={[{ fontSize: 13, color: colors.foreground, fontFamily: "Lato_400Regular", flex: 1, lineHeight: 18 }]}>
              <Text style={{ fontFamily: "Lato_700Bold", color: GREEN }}>Save AED {savings.toLocaleString()}</Text>
              {service.price_note ? ` · ${service.price_note}` : " on this treatment"}
            </Text>
          </View>
        )}

        {/* Was price note */}
        {!hasDiscount && service.price_note ? (
          <Text style={[{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Lato_300Light", marginTop: -4 }]}>
            {service.price_note}
          </Text>
        ) : null}

        {/* ── About ───────────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_600SemiBold" }]}>
            About This Treatment
          </Text>
          <Text style={[styles.desc, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}>
            {service.full_desc}
          </Text>
        </View>

        {/* ── Benefits ────────────────────────────────────────────── */}
        {service.benefits?.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_600SemiBold" }]}>
              Key Benefits
            </Text>
            <View style={styles.benefitsGrid}>
              {service.benefits.map((b, i) => (
                <View key={i} style={[styles.benefitChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <View style={[styles.benefitDot, { backgroundColor: GOLD }]} />
                  <Text style={[{ fontSize: 13, color: colors.foreground, fontFamily: "Lato_400Regular" }]}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Package offers (if applicable) ──────────────────── */}
        {service.price_note?.includes("session") && (
          <View style={[styles.packagesCard, { backgroundColor: "#1a1a1a", borderColor: GOLD + "30" }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Feather name="package" size={16} color={GOLD} />
              <Text style={[styles.cardTitle, { color: "#fff", fontFamily: "Cormorant_700Bold" }]}>
                Package Deals
              </Text>
            </View>
            <Text style={[{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: "Lato_300Light", marginBottom: 14, lineHeight: 18 }]}>
              {service.price_note}
            </Text>
            {["Single session", "3-session package", "6-session package"].map((pkg, i) => (
              <Pressable
                key={i}
                onPress={() => bookService(pkg)}
                style={({ pressed }) => [styles.pkgRow, {
                  backgroundColor: pressed ? GOLD + "20" : "rgba(255,255,255,0.05)",
                  borderColor: GOLD + "25",
                }]}
              >
                <Text style={[{ color: "#fff", fontSize: 14, fontFamily: "Lato_400Regular" }]}>{pkg}</Text>
                <Feather name="chevron-right" size={14} color={GOLD} />
              </Pressable>
            ))}
          </View>
        )}

        {/* ── Disclaimer ──────────────────────────────────────── */}
        <View style={[styles.disclaimer, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="info" size={14} color={colors.mutedForeground} />
          <Text style={[{ flex: 1, fontSize: 12, color: colors.mutedForeground, fontFamily: "Lato_300Light", lineHeight: 17 }]}>
            Prices and durations may vary based on individual assessment. A consultation with our team is recommended before treatment.
          </Text>
        </View>
      </View>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        <GoldButton
          title={`Book ${service.name}`}
          onPress={() => bookService()}
          fullWidth
          style={{ paddingVertical: 18 }}
        />
        <Pressable onPress={() => router.push("/book")} style={{ alignItems: "center", paddingVertical: 10 }}>
          <Text style={[{ color: GOLD, fontFamily: "Lato_400Regular", fontSize: 14 }]}>
            Use our booking form instead
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  imageContainer: { height: 280, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  imageOverlay: {
    position: "absolute", inset: 0, padding: 20,
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  backBtn: {
    position: "absolute", top: 20, left: 20,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center",
  },
  catBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 50, borderWidth: 1 },
  catBadgeText: { color: "#fff", fontSize: 10, letterSpacing: 1.2 },
  favBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },

  content: { padding: 20, gap: 16 },
  title: { fontSize: 38, lineHeight: 42 },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 50, borderWidth: 1, borderColor: "transparent" },
  chipText: { fontSize: 14 },

  savingsBanner: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },

  card: { padding: 18, borderRadius: 18, borderWidth: 1, gap: 12 },
  cardTitle: { fontSize: 22 },
  desc: { fontSize: 15, lineHeight: 23 },

  benefitsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  benefitChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 50, borderWidth: 1 },
  benefitDot: { width: 5, height: 5, borderRadius: 2.5, flexShrink: 0 },

  packagesCard: { padding: 20, borderRadius: 18, borderWidth: 1, gap: 8 },
  pkgRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 4 },

  disclaimer: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
});
