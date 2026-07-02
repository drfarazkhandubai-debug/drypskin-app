import React, { useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

const GOLD = "#C4956A";

const AREAS = [
  { area: "Small Areas",                    sub: "Upper lip · Lower lip · Chin · Jawline", price1: 50,  price3: 100,   price6: 200   },
  { area: "Face",                           sub: "Full face coverage",                      price1: 125, price3: 337.5, price6: 675   },
  { area: "Beard Shaping",                  sub: "Precision beard line & edges",            price1: 75,  price3: 202.5, price6: 405   },
  { area: "Neck & Nape",                    sub: "Clean neckline front & back",             price1: 125, price3: 337.5, price6: 675   },
  { area: "Underarms",                      sub: "Both underarms",                          price1: 100, price3: 270,   price6: 540   },
  { area: "Half Arms",                      sub: "Wrist–elbow or elbow–shoulder",           price1: 150, price3: 405,   price6: 810   },
  { area: "Chest / Tummy / Half Back",      sub: "One area per session",                   price1: 150, price3: 405,   price6: 810   },
  { area: "Bikini",                         sub: "Gentle & precise",                        price1: 150, price3: 405,   price6: 810   },
  { area: "Half Legs",                      sub: "Upper thighs or knee–ankle",             price1: 150, price3: 405,   price6: 810   },
  { area: "Full Arms",                      sub: "Wrist to shoulder",                       price1: 350, price3: 945,   price6: 1890  },
  { area: "Bikini + Underarms",             sub: "Combo deal — two areas",                 price1: 250, price3: 675,   price6: 1350  },
  { area: "Chest & Tummy / Full Back",      sub: "Full torso — front or back",             price1: 350, price3: 945,   price6: 1890  },
  { area: "Full Legs",                      sub: "Ankle to hip",                            price1: 350, price3: 945,   price6: 1890  },
  { area: "Full Body (Excl. Front & Back)", sub: "Excl. chest & full back",                price1: 499, price3: 1350,  price6: 2520  },
  { area: "Full Body (All Areas)",          sub: "Complete head-to-toe",                   price1: 550, price3: 1500,  price6: 2800  },
];

const SESSION_OPTIONS = [
  { key: "1", label: "1 Session",  field: "price1" as const },
  { key: "3", label: "3 Sessions", field: "price3" as const },
  { key: "6", label: "6 Sessions", field: "price6" as const },
];

const FAQS = [
  { q: "How many sessions do I need?", a: "Most areas achieve 70–90% permanent reduction in 6 sessions. Underarms and small areas often show results after 3." },
  { q: "Does it hurt?", a: "Our advanced diode laser includes a cooling system. Most clients describe it as a mild snap — very tolerable. Small areas are barely felt at all." },
  { q: "Is it safe for darker skin tones?", a: "Yes. Our diode laser is suitable for all Fitzpatrick skin types including tan and darker Middle Eastern skin tones common in the UAE." },
  { q: "How long between sessions?", a: "4–6 weeks for facial areas, 6–8 weeks for body areas, to align with the hair growth cycle." },
  { q: "Do I need to shave before?", a: "Yes — shave the area 24 hours before your appointment. Do not wax or use depilatory creams for at least 4 weeks prior." },
];

export default function LaserHairRemovalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [activeSession, setActiveSession] = useState<"price1" | "price3" | "price6">("price1");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const book = (area?: string) => {
    const msg = area
      ? `Hello drypSKin! I'd like to book Laser Hair Removal for ${area}. Please let me know your availability.`
      : `Hello drypSKin! I'd like to book a Laser Hair Removal consultation. Please let me know your availability.`;
    Linking.openURL(`https://wa.me/971586078532?text=${encodeURIComponent(msg)}`);
  };

  const fmt = (v: number) => v % 1 === 0 ? `AED ${v}` : `AED ${v.toFixed(0)}`;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 100 + bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 12 }}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: 11, color: GOLD, fontFamily: "Lato_700Bold", letterSpacing: 2, marginBottom: 2 }]}>
              LASER SERVICES
            </Text>
            <Text style={[{ fontSize: 30, color: colors.foreground, fontFamily: "Cormorant_700Bold", lineHeight: 32 }]}>
              Hair Removal
            </Text>
          </View>
          <Pressable
            onPress={() => book()}
            style={[styles.bookBtn, { backgroundColor: GOLD }]}
          >
            <Feather name="message-circle" size={15} color="#fff" />
            <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 13 }]}>Book</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ padding: 20, gap: 24 }}>

        {/* ── Hero quote ────────────────────────────────────────────── */}
        <View style={[styles.quoteCard, { backgroundColor: "#1a1a1a", borderColor: GOLD + "30" }]}>
          <View style={[styles.quoteDot, { backgroundColor: GOLD }]} />
          <Text style={[styles.quoteText, { color: "#fff", fontFamily: "Cormorant_700Bold" }]}>
            "Stop letting hair removal{"\n"}rule your schedule."
          </Text>
          <Text style={[styles.quoteSub, { color: "rgba(255,255,255,0.5)", fontFamily: "Lato_300Light" }]}>
            Permanent laser reduction means more time doing what you love. You deserve effortless confidence, every single day.
          </Text>
          <View style={styles.quotePills}>
            {["All skin types", "Diode laser", "15 areas", "From AED 50"].map((t) => (
              <View key={t} style={[styles.quotePill, { backgroundColor: GOLD + "20", borderColor: GOLD + "40" }]}>
                <Text style={[{ color: GOLD, fontSize: 11, fontFamily: "Lato_700Bold" }]}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Session selector ──────────────────────────────────────── */}
        <View>
          <Text style={[styles.sectionLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
            SELECT PACKAGE
          </Text>
          <View style={[styles.segmentRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            {SESSION_OPTIONS.map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => setActiveSession(opt.field)}
                style={[styles.segment, {
                  backgroundColor: activeSession === opt.field ? "#1a1a1a" : "transparent",
                  flex: 1,
                }]}
              >
                <Text style={[styles.segmentText, {
                  color: activeSession === opt.field ? "#fff" : colors.warmGray,
                  fontFamily: activeSession === opt.field ? "Lato_700Bold" : "Lato_400Regular",
                }]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {activeSession === "price3" && (
            <Text style={[styles.savingsNote, { color: GOLD, fontFamily: "Lato_400Regular" }]}>
              Save ~10% compared to single sessions
            </Text>
          )}
          {activeSession === "price6" && (
            <Text style={[styles.savingsNote, { color: GOLD, fontFamily: "Lato_400Regular" }]}>
              Best value — save ~27% vs single sessions
            </Text>
          )}
        </View>

        {/* ── Pricing table ─────────────────────────────────────────── */}
        <View>
          <Text style={[styles.sectionLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
            AREAS & PRICING
          </Text>
          <View style={{ gap: 8 }}>
            {AREAS.map((row, i) => (
              <Pressable
                key={i}
                onPress={() => book(row.area)}
                style={({ pressed }) => [styles.areaCard, {
                  backgroundColor: pressed ? GOLD + "10" : colors.card,
                  borderColor: pressed ? GOLD + "40" : colors.border,
                }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.areaName, { color: colors.foreground, fontFamily: "Lato_700Bold" }]}>
                    {row.area}
                  </Text>
                  <Text style={[styles.areaSub, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>
                    {row.sub}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 2 }}>
                  <Text style={[styles.areaPrice, { color: GOLD, fontFamily: "Cormorant_700Bold" }]}>
                    {fmt(row[activeSession])}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={[{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>
                      tap to book
                    </Text>
                    <Feather name="message-circle" size={10} color={colors.mutedForeground} />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.currencyNote, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>
            All prices in AED (Emirati Dirhams) · Inclusive of VAT
          </Text>
        </View>

        {/* ── Why laser ─────────────────────────────────────────────── */}
        <View style={[styles.whyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.whyTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
            Why choose laser?
          </Text>
          {[
            { icon: "zap",        label: "Permanent reduction",       desc: "Up to 90% hair reduction after full course" },
            { icon: "shield",     label: "All skin types",            desc: "Safe for Fitzpatrick I–VI including darker tones" },
            { icon: "clock",      label: "Fast sessions",             desc: "Small areas in under 15 minutes" },
            { icon: "award",      label: "Diode laser technology",    desc: "Gold standard for precision & comfort" },
            { icon: "heart",      label: "No more ingrown hairs",     desc: "Laser eliminates the root cause permanently" },
          ].map((item, i) => (
            <View key={i} style={styles.whyRow}>
              <View style={[styles.whyIcon, { backgroundColor: GOLD + "15" }]}>
                <Feather name={item.icon as any} size={15} color={GOLD} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[{ fontSize: 14, color: colors.foreground, fontFamily: "Lato_700Bold" }]}>{item.label}</Text>
                <Text style={[{ fontSize: 12, color: colors.warmGray, fontFamily: "Lato_300Light", marginTop: 1 }]}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── FAQ ───────────────────────────────────────────────────── */}
        <View>
          <Text style={[styles.sectionLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
            FREQUENTLY ASKED
          </Text>
          <View style={{ gap: 8 }}>
            {FAQS.map((faq, i) => (
              <Pressable
                key={i}
                onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
                style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQ, { color: colors.foreground, fontFamily: "Lato_700Bold", flex: 1 }]}>
                    {faq.q}
                  </Text>
                  <Feather
                    name={expandedFaq === i ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.warmGray}
                  />
                </View>
                {expandedFaq === i && (
                  <Text style={[styles.faqA, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                    {faq.a}
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <View style={[styles.ctaCard, { backgroundColor: "#1a1a1a", borderColor: GOLD + "30" }]}>
          <Text style={[{ fontSize: 26, color: "#fff", fontFamily: "Cormorant_700Bold", lineHeight: 30, marginBottom: 6 }]}>
            Ready to live freely?
          </Text>
          <Text style={[{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "Lato_300Light", lineHeight: 19, marginBottom: 16 }]}>
            Book a free consultation or go straight to treatment. Our team at Marinascape Mall, Dubai Marina will guide you through the best plan for your skin.
          </Text>
          <Pressable
            onPress={() => book()}
            style={[styles.ctaBtn, { backgroundColor: GOLD }]}
          >
            <Feather name="message-circle" size={16} color="#fff" />
            <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 15 }]}>
              Book via WhatsApp
            </Text>
          </Pressable>
          <Text style={[{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "Lato_300Light", textAlign: "center", marginTop: 10 }]}>
            +971 56 607 8532 · Unit R-04, Marinascape Mall
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: 1, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  bookBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 50 },

  quoteCard: { padding: 22, borderRadius: 22, borderWidth: 1, gap: 10 },
  quoteDot: { width: 28, height: 3, borderRadius: 2 },
  quoteText: { fontSize: 26, lineHeight: 30 },
  quoteSub: { fontSize: 13, lineHeight: 19 },
  quotePills: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  quotePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50, borderWidth: 1 },

  sectionLabel: { fontSize: 10, letterSpacing: 2.5, marginBottom: 12 },

  segmentRow: { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 4, gap: 4 },
  segment: { paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  segmentText: { fontSize: 13 },
  savingsNote: { fontSize: 12, marginTop: 8, textAlign: "center" },

  areaCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, gap: 12 },
  areaName: { fontSize: 14, lineHeight: 18 },
  areaSub: { fontSize: 11, marginTop: 2 },
  areaPrice: { fontSize: 22 },
  currencyNote: { fontSize: 11, textAlign: "center", marginTop: 10 },

  whyCard: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 16 },
  whyTitle: { fontSize: 26 },
  whyRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  whyIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },

  faqCard: { padding: 16, borderRadius: 14, borderWidth: 1 },
  faqHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  faqQ: { fontSize: 14, lineHeight: 19 },
  faqA: { fontSize: 13, lineHeight: 19, marginTop: 10 },

  ctaCard: { padding: 24, borderRadius: 22, borderWidth: 1 },
  ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 50 },
});
