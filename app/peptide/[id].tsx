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
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { peptides } from "@/data/peptides";
import { GoldButton } from "@/components/GoldButton";

export default function PeptideDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const peptide = peptides.find((p) => p.id === id);
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!peptide) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground, fontFamily: "Lato_400Regular" }}>Peptide not found</Text>
      </View>
    );
  }

  const enquire = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const msg = `Hello Drypskin! I'd like to enquire about ${peptide.name} ${peptide.dosage} (${peptide.price}). Can you help me get started?`;
    Linking.openURL(`https://wa.me/971586078532?text=${encodeURIComponent(msg)}`);
  };

  const shopNow = () => {
    Linking.openURL(peptide.url);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 120 + bottomPad, paddingTop: topPad + 12 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <Pressable
        onPress={() => router.back()}
        style={[styles.backBtn, { paddingHorizontal: 20 }]}
      >
        <Feather name="arrow-left" size={20} color={colors.foreground} />
      </Pressable>

      {/* Hero */}
      <View style={[styles.hero, { paddingHorizontal: 24 }]}>
        <View
          style={[
            styles.heroIcon,
            { backgroundColor: colors.secondary, borderColor: colors.border },
          ]}
        >
          <Feather name={peptide.icon as any} size={32} color={colors.sage} />
        </View>

        <View
          style={[
            styles.categoryChip,
            { backgroundColor: colors.secondary, borderColor: colors.border },
          ]}
        >
          <Text
            style={[
              styles.categoryText,
              { color: colors.sage, fontFamily: "Lato_700Bold" },
            ]}
          >
            {peptide.categoryLabel.toUpperCase()}
          </Text>
        </View>

        <Text
          style={[
            styles.title,
            { color: colors.foreground, fontFamily: "Cormorant_700Bold" },
          ]}
        >
          {peptide.name}
        </Text>
        <Text
          style={[
            styles.dosage,
            { color: colors.warmGray, fontFamily: "Lato_300Light" },
          ]}
        >
          {peptide.dosage} · Lab-Grade Purity
        </Text>
      </View>

      {/* Price Card */}
      <View
        style={[
          styles.priceCard,
          {
            backgroundColor: colors.charcoal,
            marginHorizontal: 20,
            marginTop: 20,
          },
        ]}
      >
        <View>
          <Text
            style={[
              styles.priceLabel,
              { color: "rgba(255,255,255,0.5)", fontFamily: "Lato_300Light" },
            ]}
          >
            PRICE
          </Text>
          <Text
            style={[
              styles.price,
              { color: "#fff", fontFamily: "Cormorant_700Bold" },
            ]}
          >
            {peptide.price}
          </Text>
        </View>
        <Pressable
          onPress={shopNow}
          style={[
            styles.shopNowBtn,
            { backgroundColor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" },
          ]}
        >
          <Text
            style={[
              styles.shopNowText,
              { color: "#fff", fontFamily: "Lato_700Bold" },
            ]}
          >
            Shop Now
          </Text>
          <Feather name="external-link" size={13} color="#fff" />
        </Pressable>
      </View>

      {/* Description */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            marginHorizontal: 20,
            marginTop: 14,
          },
        ]}
      >
        <Text
          style={[
            styles.cardTitle,
            { color: colors.foreground, fontFamily: "Cormorant_700Bold" },
          ]}
        >
          About
        </Text>
        <Text
          style={[
            styles.desc,
            { color: colors.foreground, fontFamily: "Lato_400Regular" },
          ]}
        >
          {peptide.fullDescription}
        </Text>
      </View>

      {/* Benefits */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            marginHorizontal: 20,
            marginTop: 14,
          },
        ]}
      >
        <Text
          style={[
            styles.cardTitle,
            { color: colors.foreground, fontFamily: "Cormorant_700Bold" },
          ]}
        >
          Key Benefits
        </Text>
        {peptide.benefits.map((benefit, i) => (
          <View key={i} style={styles.benefitRow}>
            <View
              style={[
                styles.checkCircle,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Feather name="check" size={12} color={colors.sage} />
            </View>
            <Text
              style={[
                styles.benefitText,
                { color: colors.foreground, fontFamily: "Lato_400Regular" },
              ]}
            >
              {benefit}
            </Text>
          </View>
        ))}
      </View>

      {/* Disclaimer */}
      <View
        style={[
          styles.disclaimerCard,
          {
            backgroundColor: colors.secondary,
            borderColor: colors.border,
            marginHorizontal: 20,
            marginTop: 14,
          },
        ]}
      >
        <Feather name="alert-circle" size={15} color={colors.warmGray} />
        <Text
          style={[
            styles.disclaimerText,
            { color: colors.warmGray, fontFamily: "Lato_300Light" },
          ]}
        >
          This peptide is intended for wellness use only. Always consult a qualified healthcare professional before starting any peptide protocol. Our team is available for a free consultation.
        </Text>
      </View>

      {/* CTAs */}
      <View style={{ paddingHorizontal: 20, marginTop: 24, gap: 12 }}>
        <GoldButton
          title="Enquire via WhatsApp"
          onPress={enquire}
          fullWidth
          style={{ paddingVertical: 18, backgroundColor: colors.primary }}
        />
        <Pressable
          onPress={shopNow}
          style={[
            styles.outlineBtn,
            { borderColor: colors.border },
          ]}
        >
          <Feather name="shopping-bag" size={16} color={colors.foreground} />
          <Text
            style={[
              styles.outlineBtnText,
              { color: colors.foreground, fontFamily: "Lato_400Regular" },
            ]}
          >
            Buy from peptidedxb.shop
          </Text>
          <Feather name="external-link" size={14} color={colors.warmGray} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    paddingVertical: 8,
  },
  hero: {
    paddingTop: 16,
    gap: 10,
  },
  heroIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 4,
  },
  categoryChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 10,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 46,
    lineHeight: 50,
  },
  dosage: {
    fontSize: 15,
    marginTop: -4,
  },
  priceCard: {
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceLabel: {
    fontSize: 10,
    letterSpacing: 2,
  },
  price: {
    fontSize: 36,
    lineHeight: 40,
  },
  shopNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 1,
  },
  shopNowText: {
    fontSize: 14,
  },
  card: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  cardTitle: {
    fontSize: 24,
  },
  desc: {
    fontSize: 15,
    lineHeight: 22,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
  },
  disclaimerCard: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 50,
    borderWidth: 1,
  },
  outlineBtnText: {
    fontSize: 14,
    flex: 1,
    textAlign: "center",
  },
});
