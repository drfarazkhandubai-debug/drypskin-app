import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { programs } from "@/data/programs";
import { ProgramCard } from "@/components/ProgramCard";

export default function ProgramsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 100 + bottomPad, paddingTop: topPad + 20, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
        Wellness{"\n"}Programs
      </Text>
      <Text style={[styles.sub, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
        Curated packages for lasting results
      </Text>

      <View style={{ marginTop: 24, gap: 16 }}>
        {programs.map((prog) => (
          <ProgramCard
            key={prog.id}
            program={prog}
            onPress={() => router.push(`/program/${prog.id}` as any)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 42, lineHeight: 46 },
  sub: { fontSize: 15, marginTop: 6 },
});
