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

// ─── Vertical tabs ─────────────────────────────────────────────────────────────
type Vertical = "iv" | "labs" | "aesthetics";

// ─── IV Drips at Home ──────────────────────────────────────────────────────────
const HOME_IV_DRIPS = [
  { name: "Ocean", tagline: "Express hydration · rapid replenishment", price: "AED 290", surcharge: "AED 150", icon: "droplet", color: "#4A7AAA" },
  { name: "Simba", tagline: "Antioxidant cleanse · free radical elimination", price: "AED 390", surcharge: "AED 150", icon: "shield", color: "#8B9B8A" },
  { name: "Bagira", tagline: "Energy · immunity · deep hydration", price: "AED 490", surcharge: "AED 150", icon: "activity", color: "#5C7A6B" },
  { name: "Hakuna", tagline: "The legendary Myers Cocktail", price: "AED 790", surcharge: "AED 150", icon: "heart", color: "#8A5A7A" },
  { name: "Glutathione", tagline: "Skin brightening · cellular detox", price: "AED 790", surcharge: "AED 150", icon: "sun", color: GOLD },
  { name: "Thunder Buzz", tagline: "Ultimate hangover & fatigue recovery", price: "AED 1,090", surcharge: "AED 150", icon: "zap", color: "#E8A838" },
  { name: "Super Flush", tagline: "Liver cleanse · full metabolic reset", price: "AED 1,150", surcharge: "AED 150", icon: "refresh-cw", color: "#6B8AAA" },
  { name: "Ce La Vie", tagline: "Full-spectrum detox · radiance · immunity", price: "AED 1,690", surcharge: "AED 150", icon: "award", color: GOLD },
];

// ─── Labs at Home ──────────────────────────────────────────────────────────────
interface LabTest {
  name: string;
  desc: string;
  includes: string[];
  price: string;
  turnaround: string;
  icon: string;
  color: string;
}

const ROUTINE_LABS: LabTest[] = [
  {
    name: "Standard Health Check-up",
    desc: "A thorough baseline blood and urine screen covering all essential health categories. Ideal for annual wellness reviews.",
    includes: [
      "Complete Blood Count (CBC) — 15 parameters",
      "Kidney Function: Phosphorus, Uric Acid, Calcium (free & total), Urea, Creatinine",
      "Liver Function: Protein, Albumin, Globulin, A/G ratio, Bilirubin (total & direct), ALT, AST, ALP, GGT",
      "Lipid Profile: Total Cholesterol, HDL, LDL, VLDL, Triglycerides, Cholesterol/HDL Ratio",
      "Diabetes Profile: HbA1c, Estimated Average Glucose",
      "Thyroid Stimulating Hormone (TSH)",
      "Vitamin D, 25-hydroxy (25-OH-Cholecalciferol)",
      "Urine Routine (22 parameters)",
    ],
    price: "AED 400",
    turnaround: "24 hours",
    icon: "clipboard",
    color: "#5C7A6B",
  },
  {
    name: "Executive Health Check-up",
    desc: "Our most extensive health check-up package — a deep-dive screening across all key organ systems. Recommended annually for high-performance individuals.",
    includes: [
      "Everything in Standard Health Check-up",
      "Complete Blood Count (CBC) — 15 parameters",
      "Full Kidney Function Panel",
      "Full Liver Function Panel",
      "Full Lipid Profile",
      "Full Diabetes Profile (HbA1c + average glucose)",
      "Thyroid Stimulating Hormone (TSH)",
      "Vitamin D, 25-hydroxy",
      "Urine Routine (22 parameters)",
    ],
    price: "AED 700",
    turnaround: "24 hours",
    icon: "trending-up",
    color: "#4A5B8A",
  },
  {
    name: "Gulf Risk Profile",
    desc: "Comprehensive screen targeting the most prevalent health risks in the Gulf region — from Vitamin D deficiency to thyroid, metabolic, and liver markers.",
    includes: [
      "Vitamin D 25-OH",
      "HbA1c",
      "CBC",
      "ESR",
      "ATPO & ATG (thyroid antibodies)",
      "TSH",
      "H. Pylori Antigen",
      "HCV Antibody",
      "HBsAg (Hepatitis B)",
      "Uric Acid, Ferritin, Homocysteine",
      "Full Lipid Profile",
      "Full Liver Function Profile",
    ],
    price: "On request",
    turnaround: "2–3 days",
    icon: "activity",
    color: "#C4956A",
  },
  {
    name: "Thyroid Extended Profile",
    desc: "Complete thyroid function and antibody panel — goes beyond TSH to identify Hashimoto's, Graves', and subclinical thyroid conditions.",
    includes: [
      "TSH (Thyroid Stimulating Hormone)",
      "Total T3 & Total T4",
      "Free T3 & Free T4",
      "Thyroid Peroxidase Antibodies (anti-TPO)",
      "Thyroglobulin Antibodies (anti-TG)",
    ],
    price: "On request",
    turnaround: "2–3 days",
    icon: "activity",
    color: "#7A5A8A",
  },
  {
    name: "Fertility Profile — Female",
    desc: "Six-marker hormonal assessment of female fertility — evaluates ovarian reserve, cycle regulation, and thyroid function.",
    includes: [
      "Follicle Stimulating Hormone (FSH)",
      "Luteinizing Hormone (LH)",
      "Progesterone",
      "Prolactin",
      "Estradiol (E2)",
      "TSH",
    ],
    price: "On request",
    turnaround: "3 days",
    icon: "activity",
    color: "#8A5A7A",
  },
  {
    name: "Fertility Profile — Male",
    desc: "Full male reproductive hormonal panel including testosterone, SHBG, and gonadotropins — assessed with Free Androgen Index.",
    includes: [
      "Follicle Stimulating Hormone (FSH)",
      "Luteinizing Hormone (LH)",
      "Prolactin",
      "Estradiol (E2)",
      "Testosterone (Total)",
      "SHBG",
      "Free Androgen Index (FAI)",
    ],
    price: "On request",
    turnaround: "3–5 days",
    icon: "activity",
    color: "#5A6A8A",
  },
  {
    name: "Tumour Markers Screen — Female",
    desc: "Key cancer marker screen for women covering breast, ovarian, gastrointestinal, and liver-related markers.",
    includes: ["CEA", "CA 15.3 (Breast)", "CA 19.9 (GI)", "CA 125 (Ovarian)", "AFP (Liver)"],
    price: "On request",
    turnaround: "2–3 days",
    icon: "shield",
    color: "#7A4A4A",
  },
  {
    name: "Tumour Markers Screen — Male",
    desc: "Cancer marker screen for men — prostate, liver, GI, and testicular markers in one draw.",
    includes: ["CA 19.9", "CEA", "PSA Total", "PSA Free", "AFP (Liver)", "Beta-HCG (Testicular)"],
    price: "On request",
    turnaround: "2–3 days",
    icon: "shield",
    color: "#7A4A4A",
  },
  {
    name: "Cardiac Markers",
    desc: "Four acute cardiac markers for cardiac risk screening and monitoring — collected at your home or hotel.",
    includes: ["CPK (Creatine Phosphokinase)", "CK-MB", "Troponin I", "LDH (Lactate Dehydrogenase)"],
    price: "On request",
    turnaround: "1 day",
    icon: "activity",
    color: "#AA4A4A",
  },
];

const DNA_TESTS: LabTest[] = [
  {
    name: "Skin DNA Test",
    desc: "Reveals your skin's unique genetic code, allowing our dermatologists to address skin problems before they appear. Covers collagen quality, pigmentation, antioxidants, and sensitivity.",
    includes: [
      "Collagen quality & degradation rate",
      "Skin elasticity genetics",
      "Fine lines & wrinkles predisposition",
      "Sun protection & UV response",
      "Pigmentation risk",
      "Skin antioxidant capacity",
      "Skin sensitivity & inflammation",
    ],
    price: "AED 2,200",
    turnaround: "10–14 days",
    icon: "cpu",
    color: GOLD,
  },
  {
    name: "Diet DNA Test",
    desc: "The most accurate way to determine how your body responds to and metabolises specific nutrients. More effective than blood testing for identifying the underlying cause of weight and metabolic issues.",
    includes: [
      "Genetic variations linked to obesity & weight",
      "Ability to lose or gain weight easily",
      "Body's responsiveness to exercise",
      "Macro nutrient metabolism",
      "Optimal dietary approach",
    ],
    price: "AED 2,200",
    turnaround: "10–14 days",
    icon: "trending-up",
    color: "#5C7A6B",
  },
  {
    name: "Sports & Fitness DNA Test",
    desc: "Understand your genetic proclivity for performance — endurance, muscle type, blood flow, and fuel efficiency — to train smarter and recover faster.",
    includes: [
      "Endurance & aerobic capacity",
      "Muscle fibre type & bone composition",
      "Energy & fuel during exercise",
      "Blood flow: blood pressure & oxygenation",
      "Recovery rate genetics",
    ],
    price: "AED 2,200",
    turnaround: "10–14 days",
    icon: "activity",
    color: "#4A5B8A",
  },
  {
    name: "Health & Wellness DNA Test",
    desc: "A thorough annual genetic health screening using cutting-edge software based on the latest medical research — tests up to 80 health markers across key chronic disease risk categories.",
    includes: [
      "Cholesterol metabolism genetics",
      "Bone health predisposition",
      "Inflammation markers",
      "Oxidative stress risk",
      "Susceptibility to diabetes",
      "Food responsiveness & sensitivities",
    ],
    price: "AED 2,700",
    turnaround: "10–14 days",
    icon: "layers",
    color: "#6B4A7A",
  },
  {
    name: "Genetic Ancestry DNA Test",
    desc: "Explore your family history beyond what relatives or records can reveal. Analyses DNA variations for ancestral origins, haplogroups, migration patterns, and potential relatives.",
    includes: [
      "Ethnicity estimate — ancestral geographic regions",
      "Haplogroups — paternal & maternal lineages",
      "Genetic matches — potential relatives in database",
      "Migration patterns — historical movement of ancestors",
      "Health-related information (optional)",
    ],
    price: "On consultation",
    turnaround: "14–21 days",
    icon: "globe",
    color: "#5A7A6B",
  },
  {
    name: "Acne Genetic Testing",
    desc: "Examines your genetic predisposition to acne and the associated risk factors, hormonal influences, and inflammatory markers — enabling a truly personalised treatment protocol.",
    includes: [
      "Genetic predisposition to acne",
      "Risk factors associated with acne",
      "Inflammatory markers linked to acne",
      "Hormonal factors contributing to acne",
      "Genetic variations influencing acne development",
    ],
    price: "On consultation",
    turnaround: "14–21 days",
    icon: "cpu",
    color: "#8A6A5A",
  },
  {
    name: "Hair Loss Genetic Testing",
    desc: "The Trichotest — an effective first step in addressing hair loss. Eliminates the trial-and-error approach by identifying the genetic root cause and enabling personalised treatment pathways.",
    includes: [
      "Genetic predisposition to hair loss",
      "Risk factors associated with hair loss",
      "Hormonal factors related to hair loss",
      "Genetic variations influencing hair loss",
      "Potential treatment pathway mapping",
    ],
    price: "On consultation",
    turnaround: "14–21 days",
    icon: "trending-up",
    color: "#7A6A5A",
  },
  {
    name: "Telomere Genetic Testing",
    desc: "Measures the length and shortening rate of your telomeres — the protective caps on chromosomes — as a biological marker of cellular ageing and long-term health.",
    includes: [
      "Measurement of telomere length",
      "Rate at which telomeres are shortening",
      "Genetic factors that impact telomere length",
      "Health implications related to telomeres",
      "Assessment of age-related telomere erosion",
    ],
    price: "On consultation",
    turnaround: "14–21 days",
    icon: "activity",
    color: "#5A6A8A",
  },
];

const FOOD_INTOLERANCE_TESTS: LabTest[] = [
  {
    name: "Food & Drink Intolerance Panel",
    desc: "Identifies IgG-mediated reactions to a comprehensive range of foods and beverages — collected at your home with results reviewed by Dr. Khan's team and a personalised elimination protocol.",
    includes: [
      "200+ foods & beverages tested",
      "IgG-specific antibody measurement",
      "Gluten, dairy, wheat, eggs, soy",
      "Nuts, seeds & legumes",
      "Meats, fish & seafood",
      "Fruits, vegetables & grains",
      "Beverages: coffee, tea, alcohol, juices",
      "Spices & additives",
      "Personalised elimination & reintroduction plan",
      "Results reviewed by Dr. Khan's clinical team",
    ],
    price: "AED 2,500",
    turnaround: "5–7 days",
    icon: "coffee",
    color: "#8B7355",
  },
];

const STD_PANELS: LabTest[] = [
  {
    name: "STD Panel 4",
    desc: "Entry-level screen covering the four most common bacterial STIs. Ideal for a quick, targeted check with rapid 48-hour results.",
    includes: [
      "Chlamydia Trachomatis (PCR)",
      "Neisseria Gonorrhoeae (PCR)",
      "Mycoplasma Genitalium",
      "Trichomonas Vaginalis",
    ],
    price: "AED 700",
    turnaround: "48 hours",
    icon: "shield",
    color: "#4A7AAA",
  },
  {
    name: "STD Panel 7",
    desc: "Expanded bacterial panel adding Mycoplasma Hominis and both Ureaplasma strains for a more complete picture of urogenital health.",
    includes: [
      "Chlamydia Trachomatis (PCR)",
      "Mycoplasma Genitalium",
      "Mycoplasma Hominis",
      "Trichomonas Vaginalis",
      "Ureaplasma Urealyticum",
      "Ureaplasma Parvum",
      "Neisseria Gonorrhoeae (PCR)",
    ],
    price: "AED 730",
    turnaround: "48 hours",
    icon: "shield",
    color: "#4A7AAA",
  },
  {
    name: "STD Panel 14",
    desc: "Adds viral pathogens — Herpes Simplex types I & II, Syphilis, CMV, VZV, and LGV — for comprehensive bacterial and viral coverage.",
    includes: [
      "All 7 markers from Panel 7",
      "Herpes Simplex Virus (HSV) 1 (PCR)",
      "Herpes Simplex Virus (HSV) 2 (PCR)",
      "Treponema Pallidum (Syphilis)",
      "Haemophilus Ducreyi",
      "CMV (Cytomegalovirus)",
      "VZV (Varicella-Zoster Virus)",
      "LGV (Lymphogranuloma Venereum)",
    ],
    price: "AED 1,200",
    turnaround: "48 hours",
    icon: "check-circle",
    color: "#5C7A6B",
  },
  {
    name: "STD Panel 21",
    desc: "Panel 14 plus a full Candida fungal species screen — seven Candida variants — for a complete sexual and vaginal health assessment.",
    includes: [
      "All 14 markers from Panel 14",
      "Candida Albicans",
      "Candida Glabrata",
      "Candida Krusei",
      "Candida Tropicans",
      "Candida Parapsilosis",
      "Candida Lusitaniae",
      "Candida Dubliniensis",
    ],
    price: "AED 1,500",
    turnaround: "48 hours",
    icon: "check-circle",
    color: "#5C7A6B",
  },
  {
    name: "STD Panel 28",
    desc: "Our most comprehensive sexual health screen. Adds vaginal microbiome analysis — Gardnerella, Bacterial Vaginosis markers, Mobiluncus, Bacteroides, and Lactobacillus species — to all 21 prior markers.",
    includes: [
      "All 21 markers from Panel 21",
      "Gardnerella Vaginalis",
      "Atopobium Vaginae",
      "Megasphaera Type-1",
      "Bacterial Vaginosis Associated Bacteria 2",
      "Mobiluncus spp (M.mulieris, M.curtisii)",
      "Bacteroides Fragilis",
      "Lactobacillus spp (L.crispatus, L.gasseri, L.jensenii)",
    ],
    price: "AED 2,100",
    turnaround: "48 hours",
    icon: "layers",
    color: "#6B4A7A",
  },
];

const STD_INDIVIDUAL: LabTest[] = [
  {
    name: "HIV Combo Test",
    desc: "HIV Type 1 & 2 Antibodies + p24 Antigen. The most accurate early-detection HIV test available.",
    includes: ["HIV Type 1 Antibody", "HIV Type 2 Antibody", "p24 Antigen (early detection)"],
    price: "AED 300",
    turnaround: "6–9 hours",
    icon: "activity",
    color: "#7A4A4A",
  },
  {
    name: "Hepatitis Marker Screen",
    desc: "Key hepatitis markers in one draw — covers Hepatitis A (acute), B surface antigen, and Hepatitis C antibody.",
    includes: ["HAV IgM (Hepatitis A acute)", "HBsAg (Hepatitis B surface antigen)", "HCV Antibodies"],
    price: "AED 630",
    turnaround: "1 day",
    icon: "activity",
    color: "#7A4A4A",
  },
  {
    name: "Hepatitis B Full Profile",
    desc: "Complete Hepatitis B serology — six markers covering surface, core, and 'e' antigens and antibodies for full status clarity.",
    includes: ["HBsAg", "HBsAb (Anti-HBs)", "HBc IgM", "HBc Ab (Anti-HBc total)", "HBeAg", "HBeAb (Anti-HBe)"],
    price: "AED 1,260",
    turnaround: "3–5 days",
    icon: "activity",
    color: "#7A4A4A",
  },
  {
    name: "Herpes Simplex Full Profile",
    desc: "All four HSV antibody classes — IgG and IgM for both Herpes type I and type II — for definitive active vs. past infection clarity.",
    includes: ["HSV I IgG", "HSV I IgM", "HSV II IgG", "HSV II IgM"],
    price: "AED 840",
    turnaround: "3–4 days",
    icon: "activity",
    color: "#7A4A4A",
  },
  {
    name: "Syphilis Profile",
    desc: "Four-marker syphilis confirmation panel using both screening (RPR) and confirmatory (TPHA, FTA, TP) methods.",
    includes: ["RPR (Rapid Plasma Reagin)", "TPHA (T. pallidum Haemagglutination)", "FTA (Fluorescent Treponemal Antibody)", "Syphilis TP"],
    price: "AED 437.50",
    turnaround: "3–5 days",
    icon: "shield",
    color: "#7A4A4A",
  },
  {
    name: "STD Serology Screen",
    desc: "Antibody-based full screen combining Chlamydia serology, Hepatitis markers, HIV, Herpes II, and Syphilis in one blood draw.",
    includes: [
      "Chlamydia Trachomatis IgG",
      "Chlamydia Trachomatis IgM",
      "HBsAg (Hepatitis B)",
      "HCV Antibody",
      "HIV 1 & 2 + p24 Antigen",
      "HSV-II IgM",
      "RPR (Syphilis Screening)",
    ],
    price: "AED 1,400",
    turnaround: "3–4 days",
    icon: "check-circle",
    color: "#7A4A4A",
  },
];

const STD_TESTS = [...STD_PANELS, ...STD_INDIVIDUAL];

// ─── Aesthetics at Home ────────────────────────────────────────────────────────
interface AestheticService {
  name: string;
  tagline: string;
  desc: string;
  price: string;
  duration: string;
  benefits: string[];
  icon: string;
  color: string;
}

const AESTHETICS_AT_HOME: AestheticService[] = [
  {
    name: "HydraFacial at Home",
    tagline: "Our signature 15-step facial — now delivered to your door",
    desc: "The complete drypSKin HydraFacial Envoy experience brought to your residence. Our expert aesthetician brings the full professional device, performing all 15 steps of this multi-dimensional facial — cleansing, exfoliating, extracting, and infusing with premium serums targeting fine lines, hydration, and radiance.",
    price: "AED 499",
    duration: "75–90 min",
    benefits: ["15-step signature protocol", "Deep cleanse & extraction", "Hydrating serum infusion", "Visible glow immediately"],
    icon: "sun",
    color: GOLD,
  },
  {
    name: "Microneedling Mesotherapy",
    tagline: "Skin renewal & rejuvenation with active serum infusion",
    desc: "Our advanced microneedling combined with targeted mesotherapy cocktails stimulates collagen production and delivers active ingredients deep into the dermis. Ideal for fine lines, acne scars, dull skin, and hair rejuvenation. Performed by our certified aestheticians at your home.",
    price: "From AED 799",
    duration: "60–75 min",
    benefits: ["Collagen stimulation", "Acne scar reduction", "Deep serum infusion", "Skin texture refinement"],
    icon: "grid",
    color: "#8A5A7A",
  },
  {
    name: "Ulthera at Home",
    tagline: "FDA-cleared ultrasound lifting — in your own space",
    desc: "Experience the world's most trusted non-surgical lifting treatment in the privacy of your home. Our certified Ulthera practitioner brings the device to you, delivering focused ultrasound energy to lift and tighten the brow, neck, chin, and décolletage with precision depth targeting.",
    price: "From AED 8,500",
    duration: "90–120 min",
    benefits: ["FDA-cleared lifting device", "Brow · neck · chin · décolletage", "Long-lasting collagen remodelling", "No downtime"],
    icon: "radio",
    color: "#4A5B8A",
  },
  {
    name: "LipoZero 5D Contouring",
    tagline: "Non-invasive body sculpting at your home or hotel",
    desc: "Our 5D LipoZero combines multiple advanced contouring technologies to target stubborn fat, smooth cellulite, and reshape the body non-invasively — all in the comfort of your home. Available across all body areas with no downtime and immediate visible results.",
    price: "From AED 700",
    duration: "45–90 min",
    benefits: ["Multi-technology contouring", "Chin · abdomen · legs · arms", "Cellulite smoothing", "No downtime"],
    icon: "zap-off",
    color: "#5C7A6B",
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function HomeCareScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [activeVertical, setActiveVertical] = useState<Vertical>("iv");
  const [activeLabCategory, setActiveLabCategory] = useState<"routine" | "dna" | "std" | "intolerance">("routine");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const book = (service?: string) => {
    const msg = service
      ? `Hello drypSKin! I'd like to book a home visit for ${service}. Please let me know your availability and location requirements.`
      : `Hello drypSKin! I'd like to book a Home Care Service. Please let me know your availability.`;
    Linking.openURL(`https://wa.me/971586078532?text=${encodeURIComponent(msg)}`);
  };

  const labData =
    activeLabCategory === "routine" ? ROUTINE_LABS
    : activeLabCategory === "dna" ? DNA_TESTS
    : activeLabCategory === "intolerance" ? FOOD_INTOLERANCE_TESTS
    : STD_TESTS;

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
            <Text style={[styles.headerEyebrow, { color: SAGE, fontFamily: "Lato_700Bold" }]}>HOME CARE SERVICES</Text>
            <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>Clinic at Your Door</Text>
          </View>
          <Pressable
            onPress={() => book()}
            style={[styles.bookFab, { backgroundColor: CHARCOAL }]}
          >
            <Feather name="message-circle" size={15} color="#fff" />
            <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 12 }]}>Book</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ gap: 28, padding: 20 }}>

        {/* ── Hero Card ────────────────────────────────────────────────── */}
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}>
            <View style={[styles.heroIcon, { backgroundColor: SAGE + "18" }]}>
              <Feather name="home" size={26} color={SAGE} />
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={[{ color: SAGE, fontFamily: "Lato_700Bold", fontSize: 9, letterSpacing: 2 }]}>
                PRIVATE WELLNESS CLUB · DUBAI MARINA
              </Text>
              <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 32, lineHeight: 36 }]}>
                Can't get to clinic?{"\n"}Clinic will come{"\n"}to you.
              </Text>
              <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 13, lineHeight: 19, marginTop: 2 }]}>
                IV drips, aesthetic treatments, and lab testing — all performed by our medical team at your home, hotel, or office. Dubai Marina & surrounding areas.
              </Text>
            </View>
          </View>
          <View style={[styles.heroStats, { borderColor: colors.border }]}>
            {[
              { v: "1hr", l: "Arrival" },
              { v: "24/7", l: "Available" },
              { v: "Dubai", l: "Coverage" },
              { v: "Dr. Khan", l: "Supervised" },
            ].map((s, i) => (
              <View key={i} style={[styles.heroStatItem, i < 3 && { borderRightColor: colors.border, borderRightWidth: 1 }]}>
                <Text style={[{ color: GOLD, fontFamily: "Cormorant_700Bold", fontSize: 18 }]}>{s.v}</Text>
                <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 10 }]}>{s.l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Vertical Tabs ────────────────────────────────────────────── */}
        <View style={[styles.verticalTabs, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          {([
            { key: "iv" as Vertical, label: "IV Drips", icon: "droplet" },
            { key: "labs" as Vertical, label: "Labs", icon: "clipboard" },
            { key: "aesthetics" as Vertical, label: "Aesthetics", icon: "star" },
          ] as const).map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => { setActiveVertical(tab.key); setExpandedItem(null); }}
              style={[
                styles.verticalTab,
                activeVertical === tab.key && { backgroundColor: CHARCOAL, borderRadius: 14 },
              ]}
            >
              <Feather
                name={tab.icon as any}
                size={15}
                color={activeVertical === tab.key ? GOLD : colors.mutedForeground}
              />
              <Text style={[{
                fontFamily: "Lato_700Bold",
                fontSize: 12,
                color: activeVertical === tab.key ? "#fff" : colors.mutedForeground,
              }]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* VERTICAL 1 — IV DRIPS AT HOME                                 */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeVertical === "iv" && (
          <View style={{ gap: 16 }}>
            <View style={{ gap: 4 }}>
              <Text style={[styles.sectionLabel, { color: colors.warmGray, fontFamily: "Lato_700Bold" }]}>IV DRIPS AT HOME</Text>
              <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 13, lineHeight: 19 }]}>
                Any drip from our full clinic menu — administered by our medical team at your home, hotel, or office. AED 150 home-visit surcharge applies.
              </Text>
            </View>

            {/* Callout note */}
            <View style={[styles.noteCard, { backgroundColor: GOLD + "10", borderColor: GOLD + "30" }]}>
              <Feather name="info" size={14} color={GOLD} />
              <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 12, lineHeight: 17, flex: 1 }]}>
                The prices below are the base drip prices. A home-visit fee of <Text style={{ fontFamily: "Lato_700Bold", color: GOLD }}>AED 150</Text> is added per session. All sessions include a medical assessment and continuous monitoring.
              </Text>
            </View>

            {HOME_IV_DRIPS.map((drip) => {
              const expanded = expandedItem === `iv-${drip.name}`;
              return (
                <Pressable
                  key={drip.name}
                  onPress={() => setExpandedItem(expanded ? null : `iv-${drip.name}`)}
                  style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                    <View style={[styles.itemIcon, { backgroundColor: drip.color + "15", borderColor: drip.color + "30" }]}>
                      <Feather name={drip.icon as any} size={18} color={drip.color} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 20 }]}>{drip.name}</Text>
                      <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 11, lineHeight: 15 }]}>{drip.tagline}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 2 }}>
                      <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 17 }]}>{drip.price}</Text>
                      <Text style={[{ color: GOLD, fontFamily: "Lato_400Regular", fontSize: 10 }]}>+{drip.surcharge} home</Text>
                      <Feather name={expanded ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} />
                    </View>
                  </View>
                  {expanded && (
                    <Pressable
                      onPress={() => book(`${drip.name} IV Drip`)}
                      style={({ pressed }) => [styles.bookBtn, { backgroundColor: GOLD, marginTop: 14, opacity: pressed ? 0.85 : 1 }]}
                    >
                      <Feather name="message-circle" size={14} color="#fff" />
                      <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 13 }]}>
                        Book {drip.name} Home Visit
                      </Text>
                    </Pressable>
                  )}
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => router.push("/iv-therapy" as any)}
              style={[styles.viewAllBtn, { borderColor: colors.border }]}
            >
              <Text style={[{ color: colors.foreground, fontFamily: "Lato_400Regular", fontSize: 13 }]}>
                View full IV drip menu
              </Text>
              <Feather name="arrow-right" size={14} color={colors.foreground} />
            </Pressable>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* VERTICAL 2 — LABS AT HOME                                     */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeVertical === "labs" && (
          <View style={{ gap: 16 }}>
            <View style={{ gap: 4 }}>
              <Text style={[styles.sectionLabel, { color: colors.warmGray, fontFamily: "Lato_700Bold" }]}>LABS AT HOME</Text>
              <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 13, lineHeight: 19 }]}>
                Professional sample collection at your door. Results reviewed by Dr. Khan's team and delivered with personalised recommendations.
              </Text>
            </View>

            {/* Lab category sub-tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
              {([
                { key: "routine" as const, label: "Routine Labs" },
                { key: "dna" as const, label: "DNA Tests" },
                { key: "std" as const, label: "STD Tests" },
                { key: "intolerance" as const, label: "Intolerance" },
              ]).map((cat) => (
                <Pressable
                  key={cat.key}
                  onPress={() => { setActiveLabCategory(cat.key); setExpandedItem(null); }}
                  style={[
                    styles.subTab,
                    {
                      backgroundColor: activeLabCategory === cat.key ? CHARCOAL : colors.secondary,
                      borderColor: activeLabCategory === cat.key ? CHARCOAL : colors.border,
                    },
                  ]}
                >
                  <Text style={[{
                    fontFamily: "Lato_700Bold",
                    fontSize: 11,
                    textAlign: "center",
                    color: activeLabCategory === cat.key ? "#fff" : colors.foreground,
                  }]}>
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* STD confidentiality callout */}
            {activeLabCategory === "std" && (
              <View style={[styles.noteCard, { backgroundColor: "#4A7AAA15", borderColor: "#4A7AAA30" }]}>
                <Feather name="lock" size={14} color="#4A7AAA" />
                <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 12, lineHeight: 17, flex: 1 }]}>
                  Complete confidentiality guaranteed. Results are encrypted, shared only with you, and never stored without your consent.
                </Text>
              </View>
            )}

            {/* DNA note */}
            {activeLabCategory === "dna" && (
              <View style={[styles.noteCard, { backgroundColor: GOLD + "10", borderColor: GOLD + "30" }]}>
                <Feather name="info" size={14} color={GOLD} />
                <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 12, lineHeight: 17, flex: 1 }]}>
                  DNA tests require a simple saliva swab collected at your home. Results are reviewed by Dr. Khan with a personalised protocol consultation.
                </Text>
              </View>
            )}

            {/* Intolerance note */}
            {activeLabCategory === "intolerance" && (
              <View style={[styles.noteCard, { backgroundColor: "#8B735515", borderColor: "#8B735535" }]}>
                <Feather name="coffee" size={14} color="#8B7355" />
                <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 12, lineHeight: 17, flex: 1 }]}>
                  A blood sample is collected at your home. Tests 200+ foods and beverages via IgG antibody reaction. Results include a personalised elimination and reintroduction plan reviewed by Dr. Khan.
                </Text>
              </View>
            )}

            {activeLabCategory === "std" ? (
              <>
                {/* ── Multi-Marker Panels ─────────────────────────── */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 }}>
                  <Text style={[{ color: "#4A7AAA", fontFamily: "Lato_700Bold", fontSize: 9, letterSpacing: 2 }]}>
                    MULTI-MARKER PANELS
                  </Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: "#4A7AAA20" }} />
                </View>
                {STD_PANELS.map((test) => {
                  const key = `lab-${test.name}`;
                  const expanded = expandedItem === key;
                  return (
                    <Pressable
                      key={test.name}
                      onPress={() => setExpandedItem(expanded ? null : key)}
                      style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
                        <View style={[styles.itemIcon, { backgroundColor: test.color + "15", borderColor: test.color + "30" }]}>
                          <Feather name={test.icon as any} size={18} color={test.color} />
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 20, lineHeight: 22 }]}>{test.name}</Text>
                          <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 11, lineHeight: 15 }]}>{test.desc}</Text>
                        </View>
                        <View style={{ alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                          <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 17 }]}>{test.price}</Text>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                            <Feather name="clock" size={9} color={colors.mutedForeground} />
                            <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 10 }]}>{test.turnaround}</Text>
                          </View>
                          <Feather name={expanded ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} />
                        </View>
                      </View>
                      {expanded && (
                        <View style={{ gap: 12, marginTop: 14 }}>
                          <View style={[styles.divider, { backgroundColor: colors.border }]} />
                          <Text style={[{ color: colors.warmGray, fontFamily: "Lato_700Bold", fontSize: 9, letterSpacing: 1.5 }]}>INCLUDES</Text>
                          <View style={{ gap: 6 }}>
                            {test.includes.map((item) => (
                              <View key={item} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <View style={[{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: test.color, flexShrink: 0 }]} />
                                <Text style={[{ color: colors.foreground, fontFamily: "Lato_400Regular", fontSize: 13, lineHeight: 18 }]}>{item}</Text>
                              </View>
                            ))}
                          </View>
                          <Pressable
                            onPress={() => book(`${test.name}`)}
                            style={({ pressed }) => [styles.bookBtn, { backgroundColor: CHARCOAL, opacity: pressed ? 0.85 : 1 }]}
                          >
                            <Feather name="message-circle" size={14} color="#fff" />
                            <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 13 }]}>
                              Book Home Visit · {test.price}
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </Pressable>
                  );
                })}

                {/* ── Individual & Specialty Tests ────────────────── */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <Text style={[{ color: "#7A4A4A", fontFamily: "Lato_700Bold", fontSize: 9, letterSpacing: 2 }]}>
                    INDIVIDUAL & SPECIALTY TESTS
                  </Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: "#7A4A4A20" }} />
                </View>
                {STD_INDIVIDUAL.map((test) => {
                  const key = `lab-${test.name}`;
                  const expanded = expandedItem === key;
                  return (
                    <Pressable
                      key={test.name}
                      onPress={() => setExpandedItem(expanded ? null : key)}
                      style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
                        <View style={[styles.itemIcon, { backgroundColor: test.color + "15", borderColor: test.color + "30" }]}>
                          <Feather name={test.icon as any} size={18} color={test.color} />
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 20, lineHeight: 22 }]}>{test.name}</Text>
                          <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 11, lineHeight: 15 }]}>{test.desc}</Text>
                        </View>
                        <View style={{ alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                          <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 17 }]}>{test.price}</Text>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                            <Feather name="clock" size={9} color={colors.mutedForeground} />
                            <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 10 }]}>{test.turnaround}</Text>
                          </View>
                          <Feather name={expanded ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} />
                        </View>
                      </View>
                      {expanded && (
                        <View style={{ gap: 12, marginTop: 14 }}>
                          <View style={[styles.divider, { backgroundColor: colors.border }]} />
                          <Text style={[{ color: colors.warmGray, fontFamily: "Lato_700Bold", fontSize: 9, letterSpacing: 1.5 }]}>INCLUDES</Text>
                          <View style={{ gap: 6 }}>
                            {test.includes.map((item) => (
                              <View key={item} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <View style={[{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: test.color, flexShrink: 0 }]} />
                                <Text style={[{ color: colors.foreground, fontFamily: "Lato_400Regular", fontSize: 13, lineHeight: 18 }]}>{item}</Text>
                              </View>
                            ))}
                          </View>
                          <Pressable
                            onPress={() => book(`${test.name}`)}
                            style={({ pressed }) => [styles.bookBtn, { backgroundColor: CHARCOAL, opacity: pressed ? 0.85 : 1 }]}
                          >
                            <Feather name="message-circle" size={14} color="#fff" />
                            <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 13 }]}>
                              Book Home Visit · {test.price}
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </>
            ) : (
              labData.map((test) => {
                const key = `lab-${test.name}`;
                const expanded = expandedItem === key;
                return (
                  <Pressable
                    key={test.name}
                    onPress={() => setExpandedItem(expanded ? null : key)}
                    style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
                      <View style={[styles.itemIcon, { backgroundColor: test.color + "15", borderColor: test.color + "30" }]}>
                        <Feather name={test.icon as any} size={18} color={test.color} />
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 20, lineHeight: 22 }]}>{test.name}</Text>
                        <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 11, lineHeight: 15 }]}>{test.desc}</Text>
                      </View>
                      <View style={{ alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                        <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 17 }]}>{test.price}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                          <Feather name="clock" size={9} color={colors.mutedForeground} />
                          <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 10 }]}>{test.turnaround}</Text>
                        </View>
                        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} />
                      </View>
                    </View>
                    {expanded && (
                      <View style={{ gap: 12, marginTop: 14 }}>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <Text style={[{ color: colors.warmGray, fontFamily: "Lato_700Bold", fontSize: 9, letterSpacing: 1.5 }]}>INCLUDES</Text>
                        <View style={{ gap: 6 }}>
                          {test.includes.map((item) => (
                            <View key={item} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                              <View style={[{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: test.color, flexShrink: 0 }]} />
                              <Text style={[{ color: colors.foreground, fontFamily: "Lato_400Regular", fontSize: 13, lineHeight: 18 }]}>{item}</Text>
                            </View>
                          ))}
                        </View>
                        <Pressable
                          onPress={() => book(`${test.name}`)}
                          style={({ pressed }) => [styles.bookBtn, { backgroundColor: CHARCOAL, opacity: pressed ? 0.85 : 1 }]}
                        >
                          <Feather name="message-circle" size={14} color="#fff" />
                          <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 13 }]}>
                            Book Home Visit · {test.price}
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </Pressable>
                );
              })
            )}
          </View>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* VERTICAL 3 — AESTHETICS AT HOME                               */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeVertical === "aesthetics" && (
          <View style={{ gap: 16 }}>
            <View style={{ gap: 4 }}>
              <Text style={[styles.sectionLabel, { color: colors.warmGray, fontFamily: "Lato_700Bold" }]}>AESTHETICS AT HOME</Text>
              <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 13, lineHeight: 19 }]}>
                Clinic-grade aesthetic treatments performed by our certified team at your residence, hotel suite, or office.
              </Text>
            </View>

            {AESTHETICS_AT_HOME.map((svc) => {
              const key = `aes-${svc.name}`;
              const expanded = expandedItem === key;
              return (
                <Pressable
                  key={svc.name}
                  onPress={() => setExpandedItem(expanded ? null : key)}
                  style={[styles.aestheticCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  {/* Top accent strip */}
                  <View style={[styles.accentStrip, { backgroundColor: svc.color + "20", borderBottomColor: svc.color + "20" }]}>
                    <View style={[styles.itemIcon, { backgroundColor: svc.color + "20", borderColor: svc.color + "35" }]}>
                      <Feather name={svc.icon as any} size={18} color={svc.color} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 22, lineHeight: 24 }]}>
                        {svc.name}
                      </Text>
                      <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 11, lineHeight: 15 }]}>
                        {svc.tagline}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                      <Text style={[{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 18 }]}>{svc.price}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                        <Feather name="clock" size={9} color={colors.mutedForeground} />
                        <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 10 }]}>{svc.duration}</Text>
                      </View>
                      <Feather name={expanded ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} />
                    </View>
                  </View>

                  {/* Benefits row — always visible */}
                  <View style={{ padding: 16, gap: 12 }}>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                      {svc.benefits.map((b) => (
                        <View key={b} style={[styles.benefitPill, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                          <View style={[{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: svc.color }]} />
                          <Text style={[{ color: colors.foreground, fontFamily: "Lato_400Regular", fontSize: 11 }]}>{b}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Expanded: description + CTA */}
                    {expanded && (
                      <View style={{ gap: 12 }}>
                        <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 13, lineHeight: 20 }]}>
                          {svc.desc}
                        </Text>
                        <Pressable
                          onPress={() => book(svc.name)}
                          style={({ pressed }) => [styles.bookBtn, { backgroundColor: svc.color, opacity: pressed ? 0.85 : 1 }]}
                        >
                          <Feather name="message-circle" size={14} color="#fff" />
                          <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 13 }]}>
                            Book Home Visit · {svc.price}
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* ── Bottom CTA ──────────────────────────────────────────────── */}
        <View style={[styles.ctaCard, { backgroundColor: CHARCOAL }]}>
          <Text style={[{ color: SAGE, fontFamily: "Lato_700Bold", fontSize: 9, letterSpacing: 2 }]}>CONCIERGE WELLNESS</Text>
          <Text style={[{ color: "#fff", fontFamily: "Cormorant_700Bold", fontSize: 28, lineHeight: 32, marginTop: 6 }]}>
            We come to you.{"\n"}Anywhere in Dubai.
          </Text>
          <Text style={[{ color: "rgba(255,255,255,0.5)", fontFamily: "Lato_300Light", fontSize: 13, lineHeight: 19, marginTop: 4 }]}>
            Tell us what you need and where you are — our team will confirm availability and arrival time within minutes.
          </Text>
          <Pressable
            onPress={() => book()}
            style={({ pressed }) => [styles.ctaBtn, { backgroundColor: SAGE, opacity: pressed ? 0.88 : 1 }]}
          >
            <Feather name="message-circle" size={15} color="#fff" />
            <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 14, letterSpacing: 0.4 }]}>
              Request a Home Visit
            </Text>
          </Pressable>
          <View style={[styles.contactRow, { borderTopColor: "rgba(255,255,255,0.1)" }]}>
            <Pressable
              onPress={() => Linking.openURL("tel:042759200")}
              style={styles.contactBtn}
            >
              <Feather name="phone" size={14} color="rgba(255,255,255,0.55)" />
              <Text style={[{ color: "rgba(255,255,255,0.55)", fontFamily: "Lato_400Regular", fontSize: 13 }]}>
                04 275 9200
              </Text>
            </Pressable>
            <View style={[styles.contactDivider, { backgroundColor: "rgba(255,255,255,0.12)" }]} />
            <Pressable
              onPress={() => Linking.openURL("https://maps.app.goo.gl/drypskin")}
              style={styles.contactBtn}
            >
              <Feather name="map-pin" size={14} color="rgba(255,255,255,0.55)" />
              <Text style={[{ color: "rgba(255,255,255,0.55)", fontFamily: "Lato_400Regular", fontSize: 13 }]}>
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

  heroCard: { padding: 22, borderRadius: 24, borderWidth: 1, gap: 18 },
  heroIcon: { width: 54, height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  heroStats: { flexDirection: "row", borderWidth: 1, borderRadius: 14, overflow: "hidden" },
  heroStatItem: { flex: 1, alignItems: "center", paddingVertical: 12, gap: 3 },

  verticalTabs: { flexDirection: "row", borderRadius: 18, borderWidth: 1, padding: 4, gap: 2 },
  verticalTab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11 },

  sectionLabel: { fontSize: 9, letterSpacing: 2 },
  noteCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },

  subTab: { paddingVertical: 9, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1, alignItems: "center" },

  itemCard: { padding: 18, borderRadius: 20, borderWidth: 1 },
  itemIcon: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center", borderWidth: 1, flexShrink: 0 },
  divider: { height: 1 },
  bookBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 14 },
  viewAllBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },

  aestheticCard: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  accentStrip: { flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 18, borderBottomWidth: 1 },
  benefitPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 50, borderWidth: 1 },

  ctaCard: { padding: 24, borderRadius: 24 },
  ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50, marginTop: 20 },
  contactRow: { flexDirection: "row", alignItems: "center", paddingTop: 16, marginTop: 16, borderTopWidth: 1 },
  contactBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  contactDivider: { width: 1, height: 24 },
});
