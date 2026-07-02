import React from "react";
import {
  Dimensions,
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
import { offers, WHATSAPP_NUMBER } from "@/data/offers";

const GOLD = "#C4956A";
const CHARCOAL = "#1a1a1a";
const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W - 40;

function openWhatsApp(message: string) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  Linking.openURL(url);
}

function groupByMonth(offerList: typeof offers) {
  const map: Record<string, typeof offers> = {};
  for (const o of offerList) {
    if (!map[o.month]) map[o.month] = [];
    map[o.month].push(o);
  }
  return Object.entries(map);
}

export default function OffersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const grouped = groupByMonth(offers);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={[styles.hero, { paddingTop: topPad + 16, backgroundColor: CHARCOAL }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
        </Pressable>
        <View style={styles.heroLabelRow}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>EXCLUSIVE</Text>
          </View>
        </View>
        <Text style={[styles.heroTitle, { color: "#fff" }]}>Monthly Offers</Text>
        <Text style={[styles.heroSub, { color: "rgba(255,255,255,0.5)" }]}>
          Tap any offer to enquire & book via WhatsApp
        </Text>
        <View style={styles.goldRule} />
      </View>

      {/* ── Cards ───────────────────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {grouped.map(([month, monthOffers]) => (
          <View key={month} style={{ marginBottom: 36 }}>
            {/* Month label */}
            <View style={styles.monthRow}>
              <View style={[styles.monthLine, { backgroundColor: GOLD }]} />
              <Text style={[styles.monthLabel, { color: GOLD }]}>{month.toUpperCase()}</Text>
              <View style={[styles.monthLine, { backgroundColor: GOLD, opacity: 0.3 }]} />
            </View>

            <View style={{ gap: 20, paddingHorizontal: 20 }}>
              {monthOffers.map((offer) => (
                <Pressable
                  key={offer.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    openWhatsApp(offer.whatsappMessage);
                  }}
                  style={({ pressed }) => [
                    styles.card,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      opacity: pressed ? 0.93 : 1,
                      transform: [{ scale: pressed ? 0.984 : 1 }],
                    },
                  ]}
                >
                  {/* Full-bleed thumbnail */}
                  <View style={[styles.imgWrap, { width: CARD_W }]}>
                    <Image
                      source={{ uri: offer.image }}
                      style={styles.img}
                      resizeMode="cover"
                    />
                    {offer.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{offer.badge}</Text>
                      </View>
                    )}
                  </View>

                  {/* Info + CTA row */}
                  <View style={styles.cardBody}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                        {offer.title}
                      </Text>
                      {offer.subtitle && (
                        <Text style={[styles.cardSub, { color: colors.warmGray }]}>
                          {offer.subtitle}
                        </Text>
                      )}
                    </View>
                    <View style={styles.waCta}>
                      <Feather name="message-circle" size={14} color="#fff" />
                      <Text style={styles.waCtaText}>Book</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* ── View all on website ─────────────────────────────────────────── */}
        <Pressable
          onPress={() => Linking.openURL("https://drypskin.com/special-offer")}
          style={({ pressed }) => ({
            marginHorizontal: 20,
            marginTop: 8,
            marginBottom: 8,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: GOLD + "50",
            backgroundColor: GOLD + "10",
            paddingVertical: 16,
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Feather name="external-link" size={15} color={GOLD} />
          <Text style={{ color: GOLD, fontFamily: "Lato_700Bold", fontSize: 14, letterSpacing: 0.5 }}>
            Check out all offers on our website
          </Text>
        </Pressable>

        {/* Empty state */}
        {offers.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 80, gap: 12 }}>
            <Feather name="tag" size={40} color={GOLD} />
            <Text style={{ color: GOLD, fontFamily: "Cormorant_700Bold", fontSize: 26 }}>
              Offers Coming Soon
            </Text>
            <Text style={{ color: "rgba(128,128,128,0.6)", fontFamily: "Lato_300Light", fontSize: 14, textAlign: "center", paddingHorizontal: 40 }}>
              Check back each month for exclusive treatments and packages.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroLabelRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  heroBadge: {
    backgroundColor: GOLD + "22",
    borderColor: GOLD + "50",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroBadgeText: {
    color: GOLD,
    fontFamily: "Lato_700Bold",
    fontSize: 9,
    letterSpacing: 2,
  },
  heroTitle: {
    fontFamily: "Cormorant_700Bold",
    fontSize: 38,
    lineHeight: 42,
    marginBottom: 6,
  },
  heroSub: {
    fontFamily: "Lato_300Light",
    fontSize: 13,
  },
  goldRule: {
    height: 1,
    backgroundColor: GOLD,
    opacity: 0.25,
    marginTop: 20,
    marginHorizontal: -24,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  monthLine: {
    flex: 1,
    height: 1,
  },
  monthLabel: {
    fontFamily: "Lato_700Bold",
    fontSize: 10,
    letterSpacing: 2.5,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  imgWrap: {
    height: CARD_W * 0.60,
    position: "relative",
  },
  img: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: GOLD,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: "#fff",
    fontFamily: "Lato_700Bold",
    fontSize: 9,
    letterSpacing: 1.5,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  cardTitle: {
    fontFamily: "Cormorant_700Bold",
    fontSize: 20,
    lineHeight: 23,
  },
  cardSub: {
    fontFamily: "Lato_300Light",
    fontSize: 12,
    marginTop: 2,
  },
  waCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#25D366",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  waCtaText: {
    color: "#fff",
    fontFamily: "Lato_700Bold",
    fontSize: 12,
  },
});
