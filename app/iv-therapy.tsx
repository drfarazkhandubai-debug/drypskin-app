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
const SAGE = "#8B9B8A";
const CHARCOAL = "#1a1a1a";

// ─── Category filters ─────────────────────────────────────────────────────────
type Category = "All" | "Express" | "Wellness" | "Glow" | "Recovery" | "Performance" | "Premium";

const CATEGORIES: Category[] = ["All", "Express", "Wellness", "Glow", "Recovery", "Performance", "Premium"];

// ─── IV Drip data ─────────────────────────────────────────────────────────────
interface IVDrip {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: string;
  category: Category;
  icon: string;
  color: string;
  benefits: string[];
  duration: string;
}

const DRIPS: IVDrip[] = [
  {
    id: "oxygen",
    name: "Oxygen",
    tagline: "Stress relief, headache remedy & mood elevation",
    description: "A revitalising infusion designed to combat stress, ease headaches and migraines, improve sleep quality, and elevate energy levels and mental clarity. A gentle yet powerfully restorative drip for those seeking balance and calm.",
    price: "AED 250",
    category: "Express",
    icon: "wind",
    color: "#6B9FAA",
    benefits: ["Stress reduction", "Headache & migraine relief", "Better sleep quality", "Elevated mood & clarity"],
    duration: "30–45 min",
  },
  {
    id: "ocean",
    name: "Ocean",
    tagline: "Pure express hydration — swift, simple, deeply replenishing",
    description: "The Ocean drip is our most refined hydration offering — a swift infusion of medical-grade fluids to restore optimal cellular hydration. Ideal before or after travel, long days, or whenever your body craves pure replenishment.",
    price: "AED 290",
    category: "Express",
    icon: "droplet",
    color: "#4A7AAA",
    benefits: ["Express hydration", "Cellular replenishment", "Rapid recovery", "Pre & post-travel"],
    duration: "30 min",
  },
  {
    id: "simba",
    name: "Simba",
    tagline: "Antioxidant-rich cleanse — eliminate free radicals and revitalise",
    description: "Simba is our signature anti-radical infusion, formulated with Vitamin B12, powerful antioxidants, and a bespoke mineral complex. It neutralises oxidative stress, supports cellular defence, and restores a sense of inner vitality and clarity.",
    price: "AED 390",
    category: "Wellness",
    icon: "shield",
    color: "#8B9B8A",
    benefits: ["Free radical elimination", "Antioxidant protection", "B12 replenishment", "Cellular revitalisation"],
    duration: "45 min",
  },
  {
    id: "bagira",
    name: "Bagira",
    tagline: "Energy, immunity, and deep hydration in one elegant infusion",
    description: "Bagira delivers a curated blend of essential nutrients to simultaneously boost energy reserves, fortify immune defences, and restore deep cellular hydration. A beautifully balanced drip for those seeking comprehensive daily wellness support.",
    price: "AED 490",
    category: "Wellness",
    icon: "activity",
    color: "#5C7A6B",
    benefits: ["Energy enhancement", "Immune fortification", "Deep hydration", "Daily wellness support"],
    duration: "45–60 min",
  },
  {
    id: "hakuna",
    name: "Hakuna",
    tagline: "The gold standard Myers Cocktail — comprehensive wellbeing",
    description: "Hakuna is our refined rendition of the legendary Myers Cocktail — an expertly balanced infusion of medical-grade fluids, high-dose Vitamin C, and a full B-Complex spectrum (B1, B6, B12). Trusted worldwide for comprehensive wellbeing and immune resilience.",
    price: "AED 790",
    category: "Wellness",
    icon: "heart",
    color: "#8A5A7A",
    benefits: ["Myers Cocktail formula", "High-dose Vitamin C", "Full B-Complex", "Immune resilience"],
    duration: "60 min",
  },
  {
    id: "glutathione",
    name: "Glutathione",
    tagline: "Skin brightening, luminosity & deep cellular detox",
    description: "Our Glutathione infusion delivers the body's most potent antioxidant directly into the bloodstream, bypassing the digestive system for maximum efficacy. Formulated with Glutathione, high-dose Vitamin C, and hydrating fluids for visible brightening and profound detox.",
    price: "AED 790",
    category: "Glow",
    icon: "sun",
    color: "#C4956A",
    benefits: ["Skin whitening & brightening", "Luminous complexion", "Deep cellular detox", "Master antioxidant"],
    duration: "45–60 min",
  },
  {
    id: "glam",
    name: "Glam",
    tagline: "Elevate hair, skin & nails with a high-potency Biotin infusion",
    description: "Glam is our beauty-focused infusion, delivering a high-potency Biotin complex alongside skin-nourishing vitamins and minerals. Strengthens hair follicles, promotes luminous skin, and fortifies nails from the inside out.",
    price: "AED 1,450",
    category: "Glow",
    icon: "star",
    color: "#D4A0C4",
    benefits: ["Hair strengthening", "Skin luminosity", "Nail fortification", "Extra Biotin infusion"],
    duration: "60–75 min",
  },
  {
    id: "thunder-buzz",
    name: "Thunder Buzz",
    tagline: "The ultimate hangover recovery — reset and restore instantly",
    description: "Thunder Buzz is our most sought-after recovery infusion — combining Vitamin C, the complete B-Complex (B1, B6, B12), amino acids, anti-nausea agents, and pain relief. Designed to swiftly and elegantly restore equilibrium after fatigue, dehydration, or a late evening.",
    price: "AED 1,090",
    category: "Recovery",
    icon: "zap",
    color: "#E8A838",
    benefits: ["Hangover recovery", "Nausea elimination", "Rehydration & detox", "Headache relief"],
    duration: "60 min",
  },
  {
    id: "super-flush",
    name: "Super Flush",
    tagline: "Intensive liver cleanse — reboot your system from the inside out",
    description: "Super Flush is a powerful hepatic support infusion designed to deeply cleanse the liver, eliminate radical buildup, and reboot your entire metabolic system using the potency of premium antioxidants and cellular renewal compounds.",
    price: "AED 1,150",
    category: "Recovery",
    icon: "refresh-cw",
    color: "#6B8AAA",
    benefits: ["Liver deep cleanse", "Radical elimination", "Metabolic reset", "Antioxidant power"],
    duration: "60–75 min",
  },
  {
    id: "jaguar",
    name: "Jaguar",
    tagline: "Superior immune support, energy elevation & muscle recovery",
    description: "Jaguar is our premium all-rounder — a meticulously crafted formula with 17+ ingredients including high-dose Vitamin C, B-Complex, amino acids, minerals, and immune boosters. Designed for those who demand the best.",
    price: "AED 1,250",
    category: "Performance",
    icon: "trending-up",
    color: "#5C7A6B",
    benefits: ["Superior immune support", "High-dose Vitamin C", "Muscle recovery", "17+ premium ingredients"],
    duration: "75 min",
  },
  {
    id: "tornado",
    name: "Tornado Energy",
    tagline: "Explosive athletic energy and peak performance support",
    description: "Tornado Energy is engineered for peak performers — a high-potency infusion combining energising B-vitamins, amino acids, and precision minerals to maximise athletic performance, endurance, and mental focus.",
    price: "AED 1,250",
    category: "Performance",
    icon: "zap-off",
    color: "#4A5B8A",
    benefits: ["Athletic energy boost", "Peak performance", "Enhanced endurance", "Mental & physical focus"],
    duration: "75 min",
  },
  {
    id: "ironman",
    name: "Ironman",
    tagline: "Elite muscle building, high metabolism & superior athletic recovery",
    description: "Ironman is the drip of champions — a powerful BCAA-rich infusion formulated to support muscle synthesis, accelerate recovery, drive high metabolism, and push elite performance to the next level.",
    price: "AED 1,550",
    category: "Performance",
    icon: "cpu",
    color: "#3A4A7A",
    benefits: ["Muscle building", "High metabolism", "BCAA complex", "Elite recovery"],
    duration: "75–90 min",
  },
  {
    id: "brainiac",
    name: "Brainiac",
    tagline: "Cognitive enhancement and memory optimisation",
    description: "Brainiac is formulated for the discerning mind — a precision blend of high-dose B12, nootropic co-factors, and trace minerals targeting memory, focus, and cognitive performance for sustained mental excellence.",
    price: "AED 1,250",
    category: "Premium",
    icon: "layers",
    color: "#7A5A8A",
    benefits: ["Memory enhancement", "Mental sharpness", "B12 high-dose", "Trace mineral support"],
    duration: "60–75 min",
  },
  {
    id: "phantom",
    name: "Phantom",
    tagline: "Metabolic mastery — weight management & hormonal balance",
    description: "Phantom targets metabolic health at its root — combining our exclusive MIC complex (Methionine, Inositol, Choline) with liver support and hormone-balancing cofactors. Ideal for weight management, PCOS support, and thyroid care.",
    price: "AED 1,450",
    category: "Premium",
    icon: "eye-off",
    color: "#5A6A8A",
    benefits: ["Weight management support", "Liver health", "MIC complex", "Hormonal & PCOS support"],
    duration: "75 min",
  },
  {
    id: "healthy-gut",
    name: "Healthy Gut",
    tagline: "Gut restoration — eliminate bloating, leaky gut & digestive distress",
    description: "Healthy Gut is our specialised gut-health protocol delivering targeted nutrients to repair the gut lining, reduce inflammation, prevent leaky gut, and restore digestive harmony from the inside out.",
    price: "AED 1,590",
    category: "Premium",
    icon: "circle",
    color: "#6B9B6B",
    benefits: ["Gut lining restoration", "Bloating prevention", "Leaky gut repair", "Digestive harmony"],
    duration: "75 min",
  },
  {
    id: "ce-la-vie",
    name: "Ce La Vie",
    tagline: "Full-spectrum detox, radiance, immunity & mineral restoration",
    description: "Ce La Vie is our most comprehensive infusion — a masterfully composed formula delivering deep detoxification, skin radiance, immune fortification, and complete mineral restoration. The pinnacle of IV wellness excellence.",
    price: "AED 1,690",
    category: "Premium",
    icon: "award",
    color: "#C4956A",
    benefits: ["Comprehensive detox", "Skin radiance", "Full immunity support", "Mineral restoration"],
    duration: "90 min",
  },
];

const FAQS = [
  {
    q: "How long does an IV drip take?",
    a: "Express drips (Ocean, Oxygen) take 30–45 minutes. Wellness and Recovery drips are 45–60 minutes. Premium formulas run 75–90 minutes. You're welcome to rest, work, or relax in our private treatment suite.",
  },
  {
    q: "Is IV therapy safe?",
    a: "Yes. All drips are administered by our qualified medical team under the supervision of Dr. Khan. We use only pharmaceutical-grade ingredients sourced from accredited suppliers. A brief health assessment is completed before every session.",
  },
  {
    q: "How often should I get an IV drip?",
    a: "Wellness maintenance is optimal at 1–2 sessions per month. Recovery drips (Thunder Buzz, Super Flush) are used as needed. Performance drips can be taken weekly during intense training periods. Our team will recommend a personalised cadence.",
  },
  {
    q: "Will I feel results immediately?",
    a: "Most clients notice a tangible improvement in energy, clarity, and hydration within hours. Glow drips (Glutathione, Glam) show progressive skin brightening over 3–5 sessions. Recovery drips work within 1–2 hours.",
  },
  {
    q: "Can I customise my drip?",
    a: "Absolutely. Our medical team can add boosters such as Vitamin B12, Zinc, Biotin, Magnesium, Amino Acids, and CoQ10 to any drip. Mention your goals when you book and we'll tailor the formula to you.",
  },
];

const WHY_IV = [
  { icon: "zap", title: "100% Absorption", desc: "Bypasses digestion for direct cellular delivery" },
  { icon: "clock", title: "Results in Hours", desc: "Feel the difference within 2–4 hours" },
  { icon: "shield", title: "Medical Grade", desc: "Pharmaceutical-quality ingredients only" },
  { icon: "user-check", title: "Doctor Supervised", desc: "Every session overseen by Dr. Khan's team" },
];

export default function IVTherapyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedDrip, setExpandedDrip] = useState<string | null>(null);

  const filtered = activeCategory === "All" ? DRIPS : DRIPS.filter((d) => d.category === activeCategory);

  const book = (drip?: string) => {
    const msg = drip
      ? `Hello drypSKin! I'd like to book the ${drip} IV Drip. Please let me know your availability.`
      : `Hello drypSKin! I'd like to book an IV Drip session. Please let me know your availability.`;
    Linking.openURL(`https://wa.me/971586078532?text=${encodeURIComponent(msg)}`);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 100 + bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 12 }}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerEyebrow, { color: GOLD, fontFamily: "Lato_700Bold" }]}>IV THERAPY</Text>
            <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>Drip Menu</Text>
          </View>
          <Pressable
            onPress={() => book()}
            style={[styles.bookFab, { backgroundColor: GOLD }]}
          >
            <Feather name="message-circle" size={16} color="#fff" />
            <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 12 }]}>Book</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ gap: 28, padding: 20 }}>

        {/* ── Hero Quote Card ──────────────────────────────────────────── */}
        <View style={[styles.heroCard, { backgroundColor: CHARCOAL }]}>
          <View style={{ gap: 4, marginBottom: 10 }}>
            <Text style={[{ color: GOLD, fontFamily: "Lato_700Bold", fontSize: 10, letterSpacing: 2 }]}>
              PRIVATE WELLNESS CLUB · DUBAI MARINA
            </Text>
            <Text style={[{ color: "#fff", fontFamily: "Cormorant_700Bold", fontSize: 34, lineHeight: 38 }]}>
              Unlock your potential.{"\n"}Empowering dreams.
            </Text>
          </View>
          <Text style={[{ color: "rgba(255,255,255,0.55)", fontFamily: "Lato_300Light", fontSize: 14, lineHeight: 20 }]}>
            Physician-formulated IV drips delivered directly to your bloodstream — 100% absorption, transformative results.
          </Text>
          <View style={[styles.heroStat, { borderColor: "rgba(196,149,106,0.3)" }]}>
            {[
              { v: "16", l: "Drips" },
              { v: "100%", l: "Absorption" },
              { v: "30m+", l: "Sessions" },
              { v: "Dr. Khan", l: "Supervised" },
            ].map((s, i) => (
              <View key={i} style={[styles.heroStatItem, i < 3 && { borderRightWidth: 1, borderRightColor: "rgba(196,149,106,0.25)" }]}>
                <Text style={[{ color: GOLD, fontFamily: "Cormorant_700Bold", fontSize: 18 }]}>{s.v}</Text>
                <Text style={[{ color: "rgba(255,255,255,0.45)", fontFamily: "Lato_300Light", fontSize: 10 }]}>{s.l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Why IV Therapy ───────────────────────────────────────────── */}
        <View style={{ gap: 10 }}>
          <Text style={[styles.sectionLabel, { color: colors.warmGray, fontFamily: "Lato_700Bold" }]}>WHY IV THERAPY</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {WHY_IV.map((item) => (
              <View
                key={item.icon}
                style={[styles.whyCard, { backgroundColor: colors.card, borderColor: colors.border, width: "47%" }]}
              >
                <View style={[styles.whyIcon, { backgroundColor: GOLD + "18" }]}>
                  <Feather name={item.icon as any} size={18} color={GOLD} />
                </View>
                <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 17, lineHeight: 19 }]}>{item.title}</Text>
                <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 12, lineHeight: 16 }]}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Category Filters ─────────────────────────────────────────── */}
        <View style={{ gap: 10 }}>
          <Text style={[styles.sectionLabel, { color: colors.warmGray, fontFamily: "Lato_700Bold" }]}>DRIP MENU</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[
                  styles.catPill,
                  {
                    backgroundColor: activeCategory === cat ? CHARCOAL : colors.secondary,
                    borderColor: activeCategory === cat ? CHARCOAL : colors.border,
                  },
                ]}
              >
                <Text style={[{
                  fontFamily: "Lato_700Bold",
                  fontSize: 12,
                  color: activeCategory === cat ? "#fff" : colors.foreground,
                }]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ── Drip Cards ───────────────────────────────────────────────── */}
        <View style={{ gap: 12 }}>
          {filtered.map((drip) => {
            const expanded = expandedDrip === drip.id;
            return (
              <Pressable
                key={drip.id}
                onPress={() => setExpandedDrip(expanded ? null : drip.id)}
                style={[styles.dripCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                {/* Card Header */}
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
                  <View style={[styles.dripIcon, { backgroundColor: drip.color + "18", borderColor: drip.color + "35" }]}>
                    <Feather name={drip.icon as any} size={20} color={drip.color} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 22, lineHeight: 24 }]}>
                        {drip.name}
                      </Text>
                      <View style={[styles.catTag, { backgroundColor: drip.color + "15", borderColor: drip.color + "30" }]}>
                        <Text style={[{ color: drip.color, fontFamily: "Lato_700Bold", fontSize: 8, letterSpacing: 0.8 }]}>
                          {drip.category.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 12, lineHeight: 17 }]}>
                      {drip.tagline}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 18 }]}>
                      {drip.price}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Feather name="clock" size={10} color={colors.mutedForeground} />
                      <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 10 }]}>
                        {drip.duration}
                      </Text>
                    </View>
                    <Feather
                      name={expanded ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={colors.mutedForeground}
                    />
                  </View>
                </View>

                {/* Expanded Content */}
                {expanded && (
                  <View style={{ gap: 14, marginTop: 6 }}>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 13, lineHeight: 20 }]}>
                      {drip.description}
                    </Text>
                    {/* Benefits */}
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                      {drip.benefits.map((b) => (
                        <View key={b} style={[styles.benefitPill, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                          <View style={[{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: drip.color }]} />
                          <Text style={[{ color: colors.foreground, fontFamily: "Lato_400Regular", fontSize: 11 }]}>{b}</Text>
                        </View>
                      ))}
                    </View>
                    {/* Book CTA */}
                    <Pressable
                      onPress={() => book(drip.name)}
                      style={({ pressed }) => [styles.dripBook, { backgroundColor: GOLD, opacity: pressed ? 0.85 : 1 }]}
                    >
                      <Feather name="message-circle" size={14} color="#fff" />
                      <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 13, letterSpacing: 0.4 }]}>
                        Book {drip.name} · {drip.price}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        <View style={{ gap: 10 }}>
          <Text style={[styles.sectionLabel, { color: colors.warmGray, fontFamily: "Lato_700Bold" }]}>FREQUENTLY ASKED</Text>
          {FAQS.map((faq, i) => (
            <Pressable
              key={i}
              onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
              style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 17, lineHeight: 21, flex: 1 }]}>
                  {faq.q}
                </Text>
                <Feather
                  name={expandedFaq === i ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.mutedForeground}
                />
              </View>
              {expandedFaq === i && (
                <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 13, lineHeight: 20, marginTop: 10 }]}>
                  {faq.a}
                </Text>
              )}
            </Pressable>
          ))}
        </View>

        {/* ── Bottom CTA ──────────────────────────────────────────────── */}
        <View style={[styles.ctaCard, { backgroundColor: CHARCOAL }]}>
          <Text style={[{ color: GOLD, fontFamily: "Lato_700Bold", fontSize: 10, letterSpacing: 2 }]}>NOT SURE WHICH DRIP?</Text>
          <Text style={[{ color: "#fff", fontFamily: "Cormorant_700Bold", fontSize: 28, lineHeight: 32, marginTop: 6 }]}>
            Our team will build{"\n"}your perfect formula.
          </Text>
          <Text style={[{ color: "rgba(255,255,255,0.5)", fontFamily: "Lato_300Light", fontSize: 13, lineHeight: 19, marginTop: 4 }]}>
            Tell us your goal — energy, glow, recovery or performance — and we'll customise a drip to match.
          </Text>
          <Pressable
            onPress={() => book()}
            style={({ pressed }) => [styles.ctaBtn, { backgroundColor: GOLD, opacity: pressed ? 0.88 : 1 }]}
          >
            <Feather name="message-circle" size={15} color="#fff" />
            <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 14, letterSpacing: 0.4 }]}>
              Chat to Our Team
            </Text>
          </Pressable>
          <View style={[styles.contactRow, { borderTopColor: "rgba(255,255,255,0.1)" }]}>
            <Pressable
              onPress={() => Linking.openURL("tel:042759200")}
              style={[styles.contactBtn, { borderColor: "rgba(255,255,255,0.15)" }]}
            >
              <Feather name="phone" size={14} color="rgba(255,255,255,0.6)" />
              <Text style={[{ color: "rgba(255,255,255,0.6)", fontFamily: "Lato_400Regular", fontSize: 13 }]}>
                04 275 9200
              </Text>
            </Pressable>
            <View style={[styles.contactDivider, { backgroundColor: "rgba(255,255,255,0.1)" }]} />
            <Pressable
              onPress={() => Linking.openURL("https://maps.app.goo.gl/drypskin")}
              style={[styles.contactBtn, { borderColor: "rgba(255,255,255,0.15)" }]}
            >
              <Feather name="map-pin" size={14} color="rgba(255,255,255,0.6)" />
              <Text style={[{ color: "rgba(255,255,255,0.6)", fontFamily: "Lato_400Regular", fontSize: 13 }]}>
                Dubai Marina
              </Text>
            </Pressable>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 16, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  headerEyebrow: { fontSize: 9, letterSpacing: 2 },
  headerTitle: { fontSize: 28, lineHeight: 30 },
  bookFab: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 50 },

  heroCard: { padding: 24, borderRadius: 24, gap: 14 },
  heroStat: { flexDirection: "row", borderWidth: 1, borderRadius: 14, overflow: "hidden", marginTop: 4 },
  heroStatItem: { flex: 1, alignItems: "center", paddingVertical: 14, gap: 3 },

  sectionLabel: { fontSize: 9, letterSpacing: 2 },

  whyCard: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 8 },
  whyIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },

  catPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50, borderWidth: 1 },

  dripCard: { padding: 18, borderRadius: 20, borderWidth: 1 },
  dripIcon: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, flexShrink: 0 },
  catTag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 50, borderWidth: 1 },
  divider: { height: 1, marginVertical: 2 },
  benefitPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 50, borderWidth: 1 },
  dripBook: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 14 },

  faqCard: { padding: 18, borderRadius: 16, borderWidth: 1 },

  ctaCard: { padding: 24, borderRadius: 24, gap: 0 },
  ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50, marginTop: 20 },
  contactRow: { flexDirection: "row", alignItems: "center", paddingTop: 16, marginTop: 16, borderTopWidth: 1 },
  contactBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  contactDivider: { width: 1, height: 24 },
});
