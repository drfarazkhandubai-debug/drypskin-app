import React from "react";
import {
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
import { protocols } from "@/data/protocols";
import { GoldButton } from "@/components/GoldButton";

export default function ProtocolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const protocol = protocols.find((p) => p.id === id);

  if (!protocol) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground, fontFamily: "Lato_400Regular" }}>Protocol not found</Text>
      </View>
    );
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const openWhatsApp = () => {
    const msg = `Hello Drypskin! I'm interested in the ${protocol.area} Protocol — ${protocol.packageName}. Please provide more information and availability.`;
    Linking.openURL(`https://wa.me/971586078532?text=${encodeURIComponent(msg)}`);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 120 + bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      <View style={[styles.hero, { backgroundColor: protocol.color, paddingTop: topPad + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.8)" />
          <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Back</Text>
        </Pressable>

        <View style={styles.heroContent}>
          <Text style={[styles.heroArea, { fontFamily: "Lato_700Bold" }]}>
            {protocol.area.toUpperCase()} PROTOCOL
          </Text>
          <Text style={[styles.heroTagline, { fontFamily: "Cormorant_700Bold" }]}>
            {protocol.tagline}
          </Text>
          <View style={[styles.heroBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={[styles.heroBadgeText, { fontFamily: "Lato_400Regular" }]}>
              {protocol.subtagline}
            </Text>
          </View>
        </View>

        {/* Price chip */}
        <View style={[styles.priceChip, { backgroundColor: "rgba(0,0,0,0.25)" }]}>
          <Text style={[styles.priceChipText, { fontFamily: "Cormorant_700Bold" }]}>
            {protocol.price}
          </Text>
          <Text style={[styles.priceChipSub, { fontFamily: "Lato_300Light" }]}>per session</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Package name */}
        <View style={styles.pkgHeader}>
          <View style={[styles.pkgBadge, { backgroundColor: `${protocol.color}18`, borderColor: `${protocol.color}35` }]}>
            <Text style={[styles.pkgBadgeLabel, { color: protocol.color, fontFamily: "Lato_700Bold" }]}>
              {protocol.badge}
            </Text>
          </View>
          <Text style={[styles.pkgName, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
            {protocol.packageName}
          </Text>
        </View>

        {/* Description */}
        <Text style={[styles.description, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
          {protocol.description}
        </Text>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* What's included */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
          What's Included
        </Text>

        {protocol.includes.map((item, i) => (
          <View
            key={i}
            style={[
              styles.includeCard,
              {
                backgroundColor: colors.card,
                borderColor: `${protocol.color}30`,
                borderLeftColor: protocol.color,
              },
            ]}
          >
            <View style={styles.includeHeader}>
              <View style={[styles.typeBadge, { backgroundColor: `${protocol.color}18`, borderColor: `${protocol.color}30` }]}>
                <Feather
                  name={item.type === "iv" ? "droplet" : "activity"}
                  size={13}
                  color={protocol.color}
                />
                <Text style={[styles.typeText, { color: protocol.color, fontFamily: "Lato_700Bold" }]}>
                  {item.type === "iv" ? "IV Drip" : "Peptide"}
                </Text>
              </View>
            </View>

            <Text style={[styles.includeName, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              {item.name}
            </Text>

            <View style={styles.bulletList}>
              {item.bullets.map((bullet, bi) => (
                <View key={bi} style={styles.bulletRow}>
                  <View style={[styles.bulletDot, { backgroundColor: protocol.color }]} />
                  <Text style={[styles.bulletText, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                    {bullet}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Free consultation note */}
        <View style={[styles.noteCard, { backgroundColor: `${protocol.color}10`, borderColor: `${protocol.color}25` }]}>
          <Feather name="user-check" size={16} color={protocol.color} />
          <Text style={[styles.noteText, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}>
            {protocol.priceNote}
          </Text>
        </View>

        {/* All protocols reminder */}
        <View style={[styles.allProtocolsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="grid" size={16} color={colors.sage} />
          <Text style={[styles.allProtocolsText, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
            All 7 protocols available · AED 2,880 each
          </Text>
        </View>
      </View>

      {/* ── CTA Buttons ─────────────────────────────────────────────── */}
      <View style={[styles.cta, { borderTopColor: colors.border }]}>
        <Pressable
          onPress={openWhatsApp}
          style={({ pressed }) => [
            styles.waBtn,
            { backgroundColor: protocol.color, opacity: pressed ? 0.88 : 1 },
          ]}
        >
          <Feather name="message-circle" size={20} color="#fff" />
          <Text style={[styles.waBtnText, { fontFamily: "Lato_700Bold" }]}>
            Book via WhatsApp
          </Text>
        </Pressable>

        <Pressable
          onPress={() => Linking.openURL("tel:042759200")}
          style={({ pressed }) => [
            styles.callBtn,
            { borderColor: protocol.color, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="phone" size={18} color={protocol.color} />
          <Text style={[styles.callBtnText, { color: protocol.color, fontFamily: "Lato_700Bold" }]}>
            Call 04 275 9200
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  backText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
  },
  heroContent: {
    gap: 8,
  },
  heroArea: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    letterSpacing: 2.5,
  },
  heroTagline: {
    color: "#fff",
    fontSize: 44,
    lineHeight: 46,
  },
  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  heroBadgeText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
  },
  priceChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  priceChipText: {
    color: "#fff",
    fontSize: 26,
  },
  priceChipSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  content: {
    padding: 24,
    gap: 14,
  },
  pkgHeader: {
    gap: 6,
  },
  pkgBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  pkgBadgeLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  pkgName: {
    fontSize: 32,
    lineHeight: 34,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 28,
    lineHeight: 30,
  },
  includeCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 18,
    gap: 10,
  },
  includeHeader: {
    flexDirection: "row",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  includeName: {
    fontSize: 24,
    lineHeight: 26,
  },
  bulletList: {
    gap: 6,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 7,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 21,
    flex: 1,
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  noteText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },
  allProtocolsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  allProtocolsText: {
    fontSize: 13,
  },
  cta: {
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  waBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
  },
  waBtnText: {
    color: "#fff",
    fontSize: 16,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 50,
    borderWidth: 1.5,
  },
  callBtnText: {
    fontSize: 15,
  },
});
