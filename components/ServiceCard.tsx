import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import type { Service } from "@/data/services";

interface ServiceCardProps {
  service: Service;
  onPress: () => void;
  compact?: boolean;
}

export function ServiceCard({ service, onPress, compact = false }: ServiceCardProps) {
  const colors = useColors();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  if (compact) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.compactCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <View style={[styles.compactIconWrap, { backgroundColor: colors.secondary }]}>
          <Feather name={service.icon as any} size={18} color={colors.primary} />
        </View>
        <View style={styles.compactContent}>
          <Text
            style={[styles.compactName, { color: colors.foreground, fontFamily: "Cormorant_600SemiBold" }]}
            numberOfLines={1}
          >
            {service.name}
          </Text>
          <Text
            style={[styles.compactDesc, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}
            numberOfLines={1}
          >
            {service.shortDescription}
          </Text>
          <Text style={[styles.compactPrice, { color: colors.primary, fontFamily: "Lato_700Bold" }]}>
            {service.price}
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
        <Feather name={service.icon as any} size={24} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.category, { color: colors.primary, fontFamily: "Lato_400Regular" }]}>
          {service.categoryLabel}
        </Text>
        <Text style={[styles.name, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
          {service.name}
        </Text>
        <Text
          style={[styles.description, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}
          numberOfLines={2}
        >
          {service.shortDescription}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.duration, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>
            {service.duration}
          </Text>
          <Text style={[styles.price, { color: colors.primary, fontFamily: "Lato_700Bold" }]}>
            {service.price}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#2C1810",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  category: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 20,
    lineHeight: 24,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  duration: {
    fontSize: 12,
  },
  price: {
    fontSize: 14,
  },

  compactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  compactIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  compactContent: {
    flex: 1,
    gap: 2,
  },
  compactName: {
    fontSize: 16,
    lineHeight: 20,
  },
  compactDesc: {
    fontSize: 12,
  },
  compactPrice: {
    fontSize: 13,
    marginTop: 2,
  },
});
