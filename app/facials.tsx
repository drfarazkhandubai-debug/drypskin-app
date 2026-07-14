import React, { useCallback, useEffect, useState } from "react";
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

const API_BASE = `https://${process.env.EXPO_PUBLIC_API_URL}/api`;
const GOLD = "#C4956A";

interface Service {
  id: string;
  name: string;
  short_desc: string;
  original_price: number | null;
  price: number | null;
  price_display: string;
  price_note: string;
  duration: string;
  icon: string;
  is_popular: boolean;
}

const TIER_DETAILS: Record<string, { tagline: string; steps: string }> = {
  "hydrafacial-silver": {
    tagline: "The essential glow — perfect for all skin types",
    steps: "3-step cleanse, exfoliate & hydrate",
  },
  "hydrafacial-gold": {
    tagline: "Personalised & revitalising with LED therapy",
    steps: "5-step with acid peel & LED light therapy",
  },
  "hydrafacial-diamond": {
    tagline: "9-step luxury with lymphatic drainage",
    steps: "9-step with lymphatic drainage & deep infusion",
  },
  "hydrafacial-envoy": {
    tagline: "The ultimate 15-step signature experience",
    steps: "15-step full-face premium protocol",
  },
};

export default function FacialsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/services?subcategory=hydrafacials`);
      const data = await res.json();
      setServices(data.services ?? []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: "#1a1a1a" }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
          <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Back</Text>
        </Pressable>
        <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>
          AESTHETICS · HYDRAFACIALS
        </Text>
        <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>
          Facials
        </Text>
        <Text style={[styles.heroSub, { fontFamily: "Lato_300Light" }]}>
          Choose from four signature HydraFacial tiers — each step deeper than the last
        </Text>
      </View>

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={GOLD} size="large" />
          <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 13, marginTop: 12 }]}>
            Loading facials…
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 + bottomPad, gap: 12 }}
        >
          {services.map((item, index) => (
            <FacialCard
              key={item.id}
              service={item}
              tier={index + 1}
              colors={colors}
              onPress={() => router.push(`/service/${item.id}` as any)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function FacialCard({
  service, tier, colors, onPress,
}: { service: Service; tier: number; colors: any; onPress: () => void }) {
  const hasDiscount = service.original_price && service.price && service.original_price > service.price;
  const discount = hasDiscount
    ? Math.round((1 - service.price! / service.original_price!) * 100)
    : 0;
  const details = TIER_DETAILS[service.id];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      {/* Top row */}
      <View style={styles.cardTop}>
        <View style={[styles.tierBadge, { backgroundColor: GOLD + "18", borderColor: GOLD + "40" }]}>
          <Text style={[styles.tierNum, { color: GOLD, fontFamily: "Cormorant_700Bold" }]}>
            {["I", "II", "III", "IV"][tier - 1]}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <Text style={[styles.cardName, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              {service.name}
            </Text>
            {service.is_popular && (
              <View style={[styles.popularBadge, { backgroundColor: GOLD + "20", borderColor: GOLD + "40" }]}>
                <Text style={[{ fontSize: 9, color: GOLD, fontFamily: "Lato_700Bold", letterSpacing: 0.5 }]}>
                  POPULAR
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.duration, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>
            {service.duration}
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.border} />
      </View>

      {/* Tagline */}
      <Text style={[styles.tagline, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
        {details?.tagline ?? service.short_desc}
      </Text>

      {/* Steps pill */}
      {details?.steps && (
        <View style={[styles.stepsPill, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="check-circle" size={12} color={colors.sage} />
          <Text style={[styles.stepsText, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
            {details.steps}
          </Text>
        </View>
      )}

      {/* Price row */}
      <View style={styles.priceRow}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={[styles.price, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
            {service.price_display}
          </Text>
          {hasDiscount && (
            <Text style={[{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Lato_300Light", textDecorationLine: "line-through" }]}>
              AED {service.original_price?.toLocaleString()}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {hasDiscount && (
            <View style={[styles.discountBadge, { backgroundColor: "#22C55E15", borderColor: "#22C55E30" }]}>
              <Text style={[{ fontSize: 10, color: "#22C55E", fontFamily: "Lato_700Bold" }]}>{discount}% OFF</Text>
            </View>
          )}
          {service.price_note ? (
            <Text style={[{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>
              {service.price_note}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 28 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  heroLabel: { color: "rgba(255,255,255,0.45)", fontSize: 11, letterSpacing: 2.5, marginBottom: 4 },
  heroTitle: { color: "#fff", fontSize: 46, lineHeight: 48 },
  heroSub: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 6, lineHeight: 18 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 10 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  tierBadge: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  tierNum: { fontSize: 20, lineHeight: 22 },
  cardName: { fontSize: 20, lineHeight: 22 },
  duration: { fontSize: 11, marginTop: 2 },
  popularBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, borderWidth: 1 },
  tagline: { fontSize: 13, lineHeight: 18 },
  stepsPill: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  stepsText: { fontSize: 12 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  price: { fontSize: 22 },
  discountBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, borderWidth: 1 },
});
