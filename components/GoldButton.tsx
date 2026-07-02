import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface GoldButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline" | "ghost";
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function GoldButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
  fullWidth = false,
}: GoldButtonProps) {
  const colors = useColors();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && {
          backgroundColor: disabled ? colors.muted : colors.primary,
        },
        variant === "outline" && {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: colors.primary,
        },
        variant === "ghost" && {
          backgroundColor: "transparent",
        },
        fullWidth && { alignSelf: "stretch" },
        pressed && { opacity: 0.82 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#fff" : colors.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.label,
            {
              color:
                variant === "primary"
                  ? colors.primaryForeground
                  : colors.primary,
              fontFamily: "Lato_700Bold",
            },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  label: {
    fontSize: 15,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});
