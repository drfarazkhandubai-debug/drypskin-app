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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { peptides, peptideCategories } from "@/data/peptides";

export default function PeptidesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const filtered =
    activeCategory === "all"
      ? peptides
      : peptides.filter((p) => p.category === activeCategory);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 20,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text
              style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}
            >
              Peptide Therapy
            </Text>
            <Text
              style={[styles.headerSub, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}
            >
              {peptides.length} premium formulations · Lab-grade purity
            </Text>
          </View>
          <Pressable
            onPress={() => Linking.openURL("https://peptidedxb.shop")}
            style={[styles.shopBtn, { backgroundColor: colors.charcoal, borderColor: colors.charcoal }]}
          >
            <Feather name="external-link" size={13} color="#fff" />
            <Text style={[styles.shopBtnText, { color: "#fff", fontFamily: "Lato_700Bold" }]}>
              Shop
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 16 }}
          style={{ marginTop: 14 }}
        >
          {peptideCategories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setActiveCategory(cat.id)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: activeCategory === cat.id ? colors.primary : colors.card,
                  borderColor: activeCategory === cat.id ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: activeCategory === cat.id ? colors.primaryForeground : colors.foreground,
                    fontFamily: activeCategory === cat.id ? "Lato_700Bold" : "Lato_400Regular",
                  },
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 + bottomPad, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[styles.disclaimer, { backgroundColor: colors.secondary, borderColor: colors.border }]}
        >
          <Feather name="info" size={14} color={colors.sage} />
          <Text style={[styles.disclaimerText, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
            All peptides are lab-grade formulations. Consult our team before use. Available via our partner store or in-clinic.
          </Text>
        </View>

        {filtered.map((peptide) => (
          <PeptideCard
            key={peptide.id}
            peptide={peptide}
            onPress={() => router.push(`/peptide/${peptide.id}` as any)}
            colors={colors}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function PeptideCard({
  peptide,
  onPress,
  colors,
}: {
  peptide: (typeof peptides)[0];
  onPress: () => void;
  colors: any;
}) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
          <Feather name={peptide.icon as any} size={20} color={colors.sage} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.peptideName, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}
            >
              {peptide.name}
            </Text>
            <View
              style={[styles.dosageBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            >
              <Text style={[styles.dosageText, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                {peptide.dosage}
              </Text>
            </View>
          </View>
          <Text
            style={[styles.categoryLabel, { color: colors.sage, fontFamily: "Lato_400Regular" }]}
          >
            {peptide.categoryLabel.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text
        style={[styles.desc, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}
        numberOfLines={2}
      >
        {peptide.shortDescription}
      </Text>

      <View style={styles.cardBottom}>
        <Text style={[styles.price, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
          {peptide.price}
        </Text>
        <View style={styles.actions}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Linking.openURL(
                `https://wa.me/971586078532?text=${encodeURIComponent(
                  `Hello Drypskin, I'd like to enquire about ${peptide.name} ${peptide.dosage} (${peptide.price})`
                )}`
              );
            }}
            style={[styles.actionBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          >
            <Feather name="message-circle" size={14} color={colors.sage} />
          </Pressable>
          <Pressable
            onPress={handlePress}
            style={[styles.actionBtnPrimary, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.actionBtnText, { color: "#fff", fontFamily: "Lato_700Bold" }]}>
              View
            </Text>
            <Feather name="arrow-right" size={13} color="#fff" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 4,
  },
  headerTitle: { fontSize: 34 },
  headerSub: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  shopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    marginTop: 4,
  },
  shopBtnText: { fontSize: 13 },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 50,
    borderWidth: 1,
  },
  filterText: { fontSize: 13 },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  disclaimerText: { flex: 1, fontSize: 12, lineHeight: 17 },
  card: { padding: 16, borderRadius: 20, borderWidth: 1, gap: 10 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  peptideName: { fontSize: 24, lineHeight: 26 },
  dosageBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  dosageText: { fontSize: 11 },
  categoryLabel: { fontSize: 10, letterSpacing: 2, marginTop: 2 },
  desc: { fontSize: 14, lineHeight: 20 },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(128,128,128,0.1)",
  },
  price: { fontSize: 24 },
  actions: { flexDirection: "row", gap: 8, alignItems: "center" },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 50,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
  },
  actionBtnText: { fontSize: 13 },
});
