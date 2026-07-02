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
import { programs } from "@/data/programs";
import { GoldButton } from "@/components/GoldButton";

export default function ProgramDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const program = programs.find((p) => p.id === id);
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!program) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground, fontFamily: "Lato_400Regular" }}>Program not found</Text>
      </View>
    );
  }

  const isDark = program.dark;
  const bg = isDark ? colors.charcoal : colors.background;
  const fg = isDark ? "#fff" : colors.foreground;
  const subColor = isDark ? colors.gold : colors.sage;
  const mutedColor = isDark ? "rgba(255,255,255,0.55)" : colors.warmGray;
  const cardBg = isDark ? "rgba(255,255,255,0.07)" : colors.card;
  const cardBorder = isDark ? "rgba(255,255,255,0.12)" : colors.border;

  const book = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const msg = `Hello Drypskin! I'd like to enquire about the ${program.name} (${program.price} ${program.priceNote}). Please let me know how to get started.`;
    Linking.openURL(`https://wa.me/971586078532?text=${encodeURIComponent(msg)}`);
  };

  return (
    <ScrollView
      style={{ backgroundColor: bg }}
      contentContainerStyle={{ paddingBottom: 120 + bottomPad, paddingTop: topPad + 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <Pressable onPress={() => router.back()} style={[styles.backBtn, { paddingHorizontal: 20 }]}>
        <Feather name="arrow-left" size={20} color={fg} />
      </Pressable>

      <View style={{ paddingHorizontal: 24, paddingTop: 16, gap: 8 }}>
        {program.badge && (
          <View style={[styles.badge, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : colors.secondary, borderColor: isDark ? "rgba(255,255,255,0.2)" : colors.border }]}>
            <Text style={[styles.badgeText, { color: isDark ? "#fff" : colors.sage, fontFamily: "Lato_700Bold" }]}>
              {program.badge.toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={[styles.title, { color: fg, fontFamily: "Cormorant_700Bold" }]}>
          {program.name}
        </Text>
        <Text style={[styles.subtitle, { color: subColor, fontFamily: "Lato_400Regular" }]}>
          {program.subtitle.toUpperCase()}
        </Text>
        <Text style={[styles.tagline, { color: mutedColor, fontFamily: "Lato_300Light" }]}>
          {program.tagline}
        </Text>
      </View>

      {/* Price */}
      <View style={[styles.priceCard, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : colors.card, borderColor: cardBorder, marginHorizontal: 24, marginTop: 24 }]}>
        <Text style={[styles.priceLabel, { color: mutedColor, fontFamily: "Lato_300Light" }]}>
          STARTING FROM
        </Text>
        <Text style={[styles.price, { color: fg, fontFamily: "Cormorant_700Bold" }]}>
          {program.price}
        </Text>
        <Text style={[styles.priceNote, { color: mutedColor, fontFamily: "Lato_300Light" }]}>
          {program.priceNote}
        </Text>
      </View>

      {/* Description */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder, marginHorizontal: 24, marginTop: 14 }]}>
        <Text style={[styles.cardTitle, { color: fg, fontFamily: "Cormorant_700Bold" }]}>About</Text>
        <Text style={[styles.desc, { color: isDark ? "rgba(255,255,255,0.75)" : colors.foreground, fontFamily: "Lato_400Regular" }]}>
          {program.description}
        </Text>
      </View>

      {/* Includes */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder, marginHorizontal: 24, marginTop: 14 }]}>
        <Text style={[styles.cardTitle, { color: fg, fontFamily: "Cormorant_700Bold" }]}>
          {program.id === "vip-membership" ? "Member Benefits" : "What's Included"}
        </Text>
        {program.includes.map((item, i) => (
          <View key={i} style={styles.includeRow}>
            <View style={[styles.checkCircle, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : colors.secondary }]}>
              <Feather name="check" size={12} color={subColor} />
            </View>
            <Text style={[styles.includeText, { color: isDark ? "rgba(255,255,255,0.8)" : colors.foreground, fontFamily: "Lato_400Regular" }]}>
              {item}
            </Text>
          </View>
        ))}
      </View>

      {/* Disclaimer */}
      <View style={[styles.disclaimer, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : colors.secondary, borderColor: cardBorder, marginHorizontal: 24, marginTop: 14 }]}>
        <Feather name="info" size={14} color={mutedColor} />
        <Text style={[styles.disclaimerText, { color: mutedColor, fontFamily: "Lato_300Light" }]}>
          Prices may vary based on individual assessment. Contact us for a free consultation.
        </Text>
      </View>

      {/* CTA */}
      <View style={{ paddingHorizontal: 24, marginTop: 24, gap: 12 }}>
        <GoldButton
          title={program.id === "vip-membership" ? "Join the Club" : `Book ${program.name}`}
          onPress={book}
          fullWidth
          style={{ paddingVertical: 18, backgroundColor: isDark ? "rgba(255,255,255,0.12)" : colors.primary, borderWidth: isDark ? 1 : 0, borderColor: "rgba(255,255,255,0.25)" }}
        />
        <Pressable onPress={() => router.push("/book")} style={styles.secondaryLink}>
          <Text style={[{ color: subColor, fontSize: 14, fontFamily: "Lato_400Regular" }]}>
            Use the booking form instead
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backBtn: { paddingVertical: 4 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50, borderWidth: 1 },
  badgeText: { fontSize: 10, letterSpacing: 1.5 },
  title: { fontSize: 44, lineHeight: 48 },
  subtitle: { fontSize: 11, letterSpacing: 2.5, marginTop: -4 },
  tagline: { fontSize: 16, lineHeight: 22, marginTop: 4 },
  priceCard: { padding: 20, borderRadius: 20, borderWidth: 1, alignItems: "center" },
  priceLabel: { fontSize: 10, letterSpacing: 2 },
  price: { fontSize: 48, lineHeight: 52 },
  priceNote: { fontSize: 13 },
  card: { padding: 18, borderRadius: 20, borderWidth: 1, gap: 12 },
  cardTitle: { fontSize: 22 },
  desc: { fontSize: 15, lineHeight: 22 },
  includeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkCircle: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  includeText: { fontSize: 14, flex: 1 },
  disclaimer: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  disclaimerText: { flex: 1, fontSize: 13, lineHeight: 18 },
  secondaryLink: { alignItems: "center", paddingVertical: 12 },
});
