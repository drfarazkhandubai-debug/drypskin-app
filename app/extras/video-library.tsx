import React, { useState } from "react";
import {
  Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const ACCENT = "#1a1a1a";

const VIDEOS = [
  {
    category: "Longevity Science",
    color: "#4A5B8A",
    icon: "clock",
    items: [
      { title: "NAD+ & Cellular Longevity: The Science", duration: "18 min", level: "Beginner", url: "https://www.youtube.com/watch?v=DEjHhNpGhUg", thumbnail: "🧬", desc: "Understanding NAD+ depletion, its role in ageing, and how IV therapy restores cellular energy." },
      { title: "Peptides 101: How They Work", duration: "22 min", level: "Beginner", url: "https://www.youtube.com/watch?v=DEjHhNpGhUg", thumbnail: "🔬", desc: "A complete breakdown of peptide signalling, how synthetic peptides mimic natural proteins and repair tissue." },
      { title: "Autophagy & Fasting: Dr. Khan Protocol", duration: "34 min", level: "Intermediate", url: "https://www.youtube.com/watch?v=DEjHhNpGhUg", thumbnail: "⚡", desc: "The science of autophagy, optimal fasting windows, and how to supercharge results with IV support." },
    ],
  },
  {
    category: "IV Therapy",
    color: "#4A7AAA",
    icon: "droplet",
    items: [
      { title: "Myers' Cocktail: What's Inside Your Drip", duration: "12 min", level: "Beginner", url: "https://www.youtube.com/watch?v=DEjHhNpGhUg", thumbnail: "💉", desc: "A deep dive into each nutrient in the Myers' Cocktail and the clinical evidence behind each one." },
      { title: "Glutathione: The Master Antioxidant", duration: "16 min", level: "Intermediate", url: "https://www.youtube.com/watch?v=DEjHhNpGhUg", thumbnail: "✨", desc: "Why glutathione is critical for detoxification, skin brightening, and disease prevention." },
      { title: "High-Dose Vitamin C Infusion Therapy", duration: "14 min", level: "Beginner", url: "https://www.youtube.com/watch?v=DEjHhNpGhUg", thumbnail: "🍋", desc: "Clinical applications of intravenous vitamin C from immunity to anti-cancer adjunct therapy." },
    ],
  },
  {
    category: "Skin & Aesthetics",
    color: "#8A5A7A",
    icon: "star",
    items: [
      { title: "Profhilo® vs Fillers: The Differences Explained", duration: "20 min", level: "Beginner", url: "https://www.youtube.com/watch?v=DEjHhNpGhUg", thumbnail: "💎", desc: "When to choose Profhilo bio-remodelling vs traditional dermal fillers for optimal skin quality." },
      { title: "PRP Therapy for Hair Loss & Skin", duration: "25 min", level: "Intermediate", url: "https://www.youtube.com/watch?v=DEjHhNpGhUg", thumbnail: "🌱", desc: "Platelet-rich plasma: procedure walkthrough, candidacy, and combining with peptides for hair restoration." },
      { title: "Salmon DNA (PDRN) Bio-Stimulation", duration: "17 min", level: "Intermediate", url: "https://www.youtube.com/watch?v=DEjHhNpGhUg", thumbnail: "🐟", desc: "How PDRN accelerates skin cell regeneration and the science behind the bio-stimulator revolution." },
    ],
  },
  {
    category: "Metabolic Health",
    color: "#5C7A6B",
    icon: "trending-up",
    items: [
      { title: "Semaglutide & GLP-1: Everything You Need to Know", duration: "28 min", level: "Beginner", url: "https://www.youtube.com/watch?v=DEjHhNpGhUg", thumbnail: "⚖️", desc: "GLP-1 receptor agonists explained — mechanism, candidacy, combining with IV amino acids for muscle preservation." },
      { title: "BPC-157: The Healing Peptide", duration: "21 min", level: "Intermediate", url: "https://www.youtube.com/watch?v=DEjHhNpGhUg", thumbnail: "🔧", desc: "Body Protective Compound-157 for gut repair, tendon healing, and accelerated recovery from injury." },
    ],
  },
];

const LEVEL_COLORS: Record<string, string> = { Beginner: "#5C7A6B", Intermediate: "#C4956A", Advanced: "#4A5B8A" };

export default function VideoLibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const filtered = selectedCat ? VIDEOS.filter((v) => v.category === selectedCat) : VIDEOS;
  const allCats = VIDEOS.map((v) => ({ name: v.category, color: v.color }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: ACCENT }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
          <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Extras</Text>
        </Pressable>
        <View>
          <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>EDUCATIONAL CONTENT</Text>
          <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>Video Library</Text>
        </View>
        <Text style={[styles.heroSub, { fontFamily: "Lato_300Light" }]}>
          Evidence-based longevity, peptide science, and aesthetic medicine
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 + bottomPad }}>
        {/* Category filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14, gap: 8 }}>
          <Pressable onPress={() => setSelectedCat(null)}
            style={[styles.filterChip, { backgroundColor: !selectedCat ? "#1a1a1a" : colors.secondary, borderColor: !selectedCat ? "#1a1a1a" : colors.border }]}>
            <Text style={[{ color: !selectedCat ? "#fff" : colors.warmGray, fontFamily: "Lato_700Bold", fontSize: 12 }]}>All Topics</Text>
          </Pressable>
          {allCats.map((c) => (
            <Pressable key={c.name} onPress={() => setSelectedCat(selectedCat === c.name ? null : c.name)}
              style={[styles.filterChip, { backgroundColor: selectedCat === c.name ? c.color : colors.secondary, borderColor: selectedCat === c.name ? c.color : colors.border }]}>
              <Text style={[{ color: selectedCat === c.name ? "#fff" : colors.warmGray, fontFamily: "Lato_700Bold", fontSize: 12 }]}>{c.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 20, gap: 24 }}>
          {!auth.token && (
            <View style={[styles.memberBanner, { backgroundColor: "#1a1a1a" }]}>
              <Feather name="lock" size={20} color="#C4956A" />
              <View style={{ flex: 1 }}>
                <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 14 }]}>Members enjoy full access</Text>
                <Text style={[{ color: "rgba(255,255,255,0.6)", fontFamily: "Lato_300Light", fontSize: 12 }]}>Sign in for unlimited clinic education</Text>
              </View>
              <Pressable onPress={() => router.push("/extras/profile" as any)} style={[styles.memberBtn]}>
                <Text style={[{ color: "#1a1a1a", fontFamily: "Lato_700Bold", fontSize: 12 }]}>Sign In</Text>
              </Pressable>
            </View>
          )}

          {filtered.map((cat) => (
            <View key={cat.category} style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={[styles.catDot, { backgroundColor: cat.color }]}>
                  <Feather name={cat.icon as any} size={12} color="#fff" />
                </View>
                <Text style={[{ color: cat.color, fontFamily: "Lato_700Bold", fontSize: 11, letterSpacing: 1.5 }]}>{cat.category.toUpperCase()}</Text>
              </View>
              {cat.items.map((video, i) => (
                <Pressable
                  key={i}
                  onPress={() => {
                    if (!auth.token && i > 0) {
                      router.push("/extras/profile" as any);
                    } else {
                      Linking.openURL(video.url);
                    }
                  }}
                  style={({ pressed }) => [styles.videoCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 }]}
                >
                  <View style={[styles.thumb, { backgroundColor: `${cat.color}15` }]}>
                    <Text style={{ fontSize: 28 }}>{video.thumbnail}</Text>
                    {!auth.token && i > 0 && (
                      <View style={[styles.lockOverlay]}>
                        <Feather name="lock" size={18} color="#fff" />
                      </View>
                    )}
                    {(auth.user || i === 0) && (
                      <View style={[styles.playOverlay, { backgroundColor: "#1a1a1a" }]}>
                        <Feather name="play" size={14} color="#fff" />
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <View style={[styles.levelBadge, { backgroundColor: `${LEVEL_COLORS[video.level]}20` }]}>
                        <Text style={[{ color: LEVEL_COLORS[video.level], fontSize: 9, fontFamily: "Lato_700Bold" }]}>{video.level.toUpperCase()}</Text>
                      </View>
                      <Text style={{ color: colors.mutedForeground, fontSize: 11, fontFamily: "Lato_300Light" }}>{video.duration}</Text>
                    </View>
                    <Text style={{ color: colors.foreground, fontFamily: "Lato_700Bold", fontSize: 14, lineHeight: 18 }} numberOfLines={2}>{video.title}</Text>
                    <Text style={{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 12, lineHeight: 16 }} numberOfLines={2}>{video.desc}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ))}

          <View style={[styles.cliCard, { backgroundColor: "#1a1a1a" }]}>
            <Feather name="video" size={24} color="#C4956A" />
            <Text style={[{ color: "#fff", fontFamily: "Cormorant_700Bold", fontSize: 24, lineHeight: 26 }]}>Request Custom Content</Text>
            <Text style={[{ color: "rgba(255,255,255,0.6)", fontFamily: "Lato_300Light", fontSize: 13 }]}>
              Want Dr. Khan to cover a specific topic? Send us your request via WhatsApp.
            </Text>
            <Pressable onPress={() => Linking.openURL(`https://wa.me/971586078532?text=${encodeURIComponent("Hello! I'd like to request a video from Dr. Khan on the topic of: ")}`)}>
              <Text style={[{ color: "#C4956A", fontFamily: "Lato_700Bold", fontSize: 14 }]}>Request a Topic →</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 16 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  heroLabel: { color: "rgba(255,255,255,0.45)", fontSize: 10, letterSpacing: 2.5 },
  heroTitle: { color: "#fff", fontSize: 38, lineHeight: 40 },
  heroSub: { color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 17, marginTop: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  memberBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16 },
  memberBtn: { backgroundColor: "#C4956A", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  catDot: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  videoCard: { flexDirection: "row", gap: 14, padding: 14, borderRadius: 16, borderWidth: 1 },
  thumb: { width: 72, height: 72, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", overflow: "hidden" },
  lockOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  playOverlay: { position: "absolute", bottom: 6, right: 6, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  levelBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  cliCard: { borderRadius: 20, padding: 22, gap: 12, marginBottom: 8 },
});
