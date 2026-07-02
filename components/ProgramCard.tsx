import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import type { Program } from "@/data/programs";

interface ProgramCardProps {
  program: Program;
  onPress: () => void;
}

export function ProgramCard({ program, onPress }: ProgramCardProps) {
  const colors = useColors();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const isDark = program.dark;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: isDark ? colors.charcoal : colors.card,
          borderColor: isDark ? "transparent" : colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      {program.badge && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isDark ? "rgba(255,255,255,0.12)" : colors.secondary,
              borderColor: isDark ? "rgba(255,255,255,0.2)" : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isDark ? "#fff" : colors.sage, fontFamily: "Lato_700Bold" },
            ]}
          >
            {program.badge.toUpperCase()}
          </Text>
        </View>
      )}

      <Text
        style={[
          styles.name,
          { color: isDark ? "#fff" : colors.foreground, fontFamily: "Cormorant_700Bold" },
        ]}
      >
        {program.name}
      </Text>
      <Text
        style={[
          styles.subtitle,
          {
            color: isDark ? colors.gold : colors.sage,
            fontFamily: "Lato_400Regular",
          },
        ]}
      >
        {program.subtitle.toUpperCase()}
      </Text>

      <View style={styles.divider} />

      {program.includes.slice(0, 3).map((item, i) => (
        <View key={i} style={styles.includeRow}>
          <Feather
            name="check"
            size={13}
            color={isDark ? colors.gold : colors.sage}
          />
          <Text
            style={[
              styles.includeText,
              {
                color: isDark ? "rgba(255,255,255,0.75)" : colors.foreground,
                fontFamily: "Lato_400Regular",
              },
            ]}
          >
            {item}
          </Text>
        </View>
      ))}
      {program.includes.length > 3 && (
        <Text
          style={[
            styles.moreText,
            { color: isDark ? "rgba(255,255,255,0.4)" : colors.mutedForeground, fontFamily: "Lato_300Light" },
          ]}
        >
          +{program.includes.length - 3} more
        </Text>
      )}

      <View style={styles.footer}>
        <View>
          <Text
            style={[
              styles.price,
              {
                color: isDark ? "#fff" : colors.foreground,
                fontFamily: "Cormorant_700Bold",
              },
            ]}
          >
            {program.price}
          </Text>
          <Text
            style={[
              styles.priceNote,
              {
                color: isDark ? "rgba(255,255,255,0.5)" : colors.mutedForeground,
                fontFamily: "Lato_300Light",
              },
            ]}
          >
            {program.priceNote}
          </Text>
        </View>
        <View
          style={[
            styles.cta,
            {
              backgroundColor: isDark ? "rgba(255,255,255,0.1)" : colors.primary,
              borderColor: isDark ? "rgba(255,255,255,0.25)" : "transparent",
              borderWidth: isDark ? 1 : 0,
            },
          ]}
        >
          <Text
            style={[
              styles.ctaText,
              { color: isDark ? "#fff" : colors.primaryForeground, fontFamily: "Lato_700Bold" },
            ]}
          >
            {program.id === "vip-membership" ? "Join" : "Book"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: { elevation: 4 },
    }),
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
    borderWidth: 1,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 1.5,
  },
  name: {
    fontSize: 26,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 11,
    letterSpacing: 2,
    marginTop: -4,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(128,128,128,0.15)",
    marginVertical: 4,
  },
  includeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  includeText: {
    fontSize: 13,
    flex: 1,
  },
  moreText: {
    fontSize: 12,
    marginTop: -4,
    marginLeft: 21,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  price: {
    fontSize: 28,
    lineHeight: 32,
  },
  priceNote: {
    fontSize: 12,
  },
  cta: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 50,
  },
  ctaText: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
