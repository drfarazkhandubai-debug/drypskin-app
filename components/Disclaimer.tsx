import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function Disclaimer() {
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: `${colors.warmGray}12`, borderColor: `${colors.warmGray}30` }]}>
      <Feather name="shield" size={15} color={colors.warmGray} style={{ marginTop: 1, flexShrink: 0 }} />
      <Text style={[styles.text, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
        This app provides wellness recommendations only and does not replace medical advice. Consult a licensed professional before starting any treatment.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  text: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
