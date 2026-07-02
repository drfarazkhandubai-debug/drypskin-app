import React, { useState } from "react";
import {
  Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

const PACKAGES = [
  {
    category: "IV Therapy",
    color: "#4A5B8A",
    items: [
      { name: "IV Energy Drip", duration: "45 min", price: "AED 450", desc: "B-vitamins, magnesium, amino acids" },
      { name: "IV Glow Drip", duration: "45 min", price: "AED 550", desc: "Glutathione + vitamin C + collagen" },
      { name: "NAD+ IV", duration: "2–4 hrs", price: "AED 1,800", desc: "High-dose NAD+ infusion" },
      { name: "Myers' Cocktail", duration: "45 min", price: "AED 500", desc: "Classic multi-nutrient IV" },
      { name: "IV Immunity Boost", duration: "45 min", price: "AED 400", desc: "High-dose vitamin C + zinc" },
    ],
  },
  {
    category: "Aesthetics",
    color: "#8A5A7A",
    items: [
      { name: "HydraFacial MD", duration: "60 min", price: "AED 370", desc: "15-step deep cleanse & hydration" },
      { name: "Profhilo® Bio-Remodelling", duration: "30 min", price: "AED 2,200", desc: "BDDE-free HA bio-remodeller" },
      { name: "Botox", duration: "30 min", price: "AED 1,050", desc: "Natural-looking wrinkle relaxation" },
      { name: "Dermal Fillers", duration: "45 min", price: "AED 900", desc: "Precision volume restoration" },
      { name: "PRP Treatment", duration: "60 min", price: "AED 450", desc: "Platelet-rich plasma rejuvenation" },
    ],
  },
  {
    category: "Laser",
    color: "#5C7A6B",
    items: [
      { name: "PicoSure Pro", duration: "30 min", price: "AED 1,200", desc: "Pigmentation & skin rejuvenation" },
      { name: "IPL Photofacial", duration: "45 min", price: "AED 800", desc: "Acne, redness & sun damage" },
      { name: "Laser Hair Removal", duration: "30+ min", price: "From AED 200", desc: "Diode laser — all skin tones" },
    ],
  },
  {
    category: "Peptides",
    color: "#C4956A",
    items: [
      { name: "BPC-157 Protocol", duration: "Ongoing", price: "AED 650", desc: "Gut healing & tissue repair" },
      { name: "Semaglutide Protocol", duration: "Ongoing", price: "AED 1,200", desc: "Weight management & metabolic" },
      { name: "NAD+ Oral Protocol", duration: "Ongoing", price: "AED 450", desc: "Cellular energy & longevity" },
    ],
  },
];

const MAX_ITEMS = 5;

export default function PackageBuilderScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [selected, setSelected] = useState<{ name: string; price: string; duration: string }[]>([]);

  const toggle = (item: { name: string; price: string; duration: string }) => {
    setSelected((prev) => {
      const exists = prev.find((s) => s.name === item.name);
      if (exists) return prev.filter((s) => s.name !== item.name);
      if (prev.length >= MAX_ITEMS) return prev;
      return [...prev, item];
    });
  };

  const isSelected = (name: string) => !!selected.find((s) => s.name === name);

  const totalDuration = selected.length > 0
    ? `${selected.length} treatment${selected.length > 1 ? "s" : ""}`
    : "No treatments selected";

  const sendPackage = () => {
    if (selected.length === 0) return;
    const list = selected.map((s) => `• ${s.name} (${s.duration} · ${s.price})`).join("\n");
    const msg = `Hello Drypskin! I've built a custom treatment package and would like to book:\n\n${list}\n\nPlease advise on availability and a combined price for my package.`;
    Linking.openURL(`https://wa.me/971586078532?text=${encodeURIComponent(msg)}`);
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
            <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>TREATMENT PLANNING</Text>
            <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>Package Builder</Text>
          </View>
          <View style={[styles.counter, { backgroundColor: "rgba(196,149,106,0.2)" }]}>
            <Text style={[{ color: "#C4956A", fontFamily: "Cormorant_700Bold", fontSize: 26, lineHeight: 28 }]}>{selected.length}</Text>
            <Text style={[{ color: "rgba(255,255,255,0.5)", fontFamily: "Lato_300Light", fontSize: 10 }]}>/ {MAX_ITEMS}</Text>
          </View>
        </View>
        <Text style={[{ color: "rgba(255,255,255,0.55)", fontFamily: "Lato_300Light", fontSize: 12, marginTop: 4 }]}>
          Select up to {MAX_ITEMS} treatments — we'll build a bespoke package price for you
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 120 + bottomPad, gap: 20 }}>
        {/* Selected summary */}
        {selected.length > 0 && (
          <View style={[styles.summaryCard, { backgroundColor: "#1a1a1a" }]}>
            <Text style={[{ color: "rgba(255,255,255,0.55)", fontSize: 10, letterSpacing: 2.5, fontFamily: "Lato_400Regular" }]}>YOUR PACKAGE</Text>
            <View style={{ gap: 8 }}>
              {selected.map((s, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#C4956A" }]} />
                  <Text style={{ flex: 1, color: "#fff", fontFamily: "Lato_400Regular", fontSize: 14 }}>{s.name}</Text>
                  <Text style={{ color: "#C4956A", fontFamily: "Lato_700Bold", fontSize: 13 }}>{s.price}</Text>
                  <Pressable onPress={() => toggle(s)}>
                    <Feather name="x" size={14} color="rgba(255,255,255,0.4)" />
                  </Pressable>
                </View>
              ))}
            </View>
            <Text style={[{ color: "rgba(255,255,255,0.4)", fontFamily: "Lato_300Light", fontSize: 11 }]}>
              Final package price subject to clinic consultation
            </Text>
          </View>
        )}

        {PACKAGES.map((cat) => (
          <View key={cat.category} style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={[styles.catDot, { backgroundColor: cat.color }]} />
              <Text style={[styles.catLabel, { color: cat.color, fontFamily: "Lato_700Bold" }]}>{cat.category.toUpperCase()}</Text>
            </View>
            {cat.items.map((item) => {
              const sel = isSelected(item.name);
              const full = !sel && selected.length >= MAX_ITEMS;
              return (
                <Pressable
                  key={item.name}
                  onPress={() => !full && toggle(item)}
                  style={({ pressed }) => [
                    styles.itemCard,
                    {
                      backgroundColor: sel ? `${cat.color}12` : colors.card,
                      borderColor: sel ? `${cat.color}60` : colors.border,
                      borderWidth: sel ? 1.5 : 1,
                      opacity: (pressed || full) && !sel ? 0.6 : 1,
                    },
                  ]}
                >
                  <View style={[styles.checkBox, { backgroundColor: sel ? cat.color : colors.secondary, borderColor: sel ? cat.color : colors.border }]}>
                    {sel && <Feather name="check" size={13} color="#fff" />}
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: colors.foreground, fontFamily: "Lato_700Bold", fontSize: 15 }}>{item.name}</Text>
                    <Text style={{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 12 }}>{item.desc}</Text>
                    <Text style={{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 11 }}>{item.duration}</Text>
                  </View>
                  <Text style={{ color: sel ? cat.color : colors.warmGray, fontFamily: "Lato_700Bold", fontSize: 14, flexShrink: 0 }}>{item.price}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Fixed CTA */}
      <View style={[styles.ctaBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: bottomPad + 12 }]}>
        <View>
          <Text style={[{ color: colors.foreground, fontFamily: "Lato_700Bold", fontSize: 14 }]}>{totalDuration}</Text>
          <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 11 }]}>Package pricing by consultation</Text>
        </View>
        <Pressable
          onPress={sendPackage}
          disabled={selected.length === 0}
          style={({ pressed }) => [styles.sendBtn, { backgroundColor: selected.length > 0 ? "#1a1a1a" : colors.secondary, opacity: pressed ? 0.85 : 1 }]}
        >
          <Feather name="message-circle" size={16} color={selected.length > 0 ? "#fff" : colors.mutedForeground} />
          <Text style={[{ color: selected.length > 0 ? "#fff" : colors.mutedForeground, fontFamily: "Lato_700Bold", fontSize: 14 }]}>Send to Clinic</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  heroLabel: { color: "rgba(255,255,255,0.45)", fontSize: 10, letterSpacing: 2.5 },
  heroTitle: { color: "#fff", fontSize: 38, lineHeight: 40 },
  counter: { padding: 12, borderRadius: 14, alignItems: "center" },
  summaryCard: { borderRadius: 18, padding: 20, gap: 12 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catLabel: { fontSize: 11, letterSpacing: 1.5 },
  itemCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16 },
  checkBox: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 1.5, flexShrink: 0 },
  ctaBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingHorizontal: 20, borderTopWidth: 1 },
  sendBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 50 },
});
