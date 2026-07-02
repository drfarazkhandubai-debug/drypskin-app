import React, { useState } from "react";
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

const GOLD = "#C4956A";
const PURPLE = "#7C3AED";
const TEAL = "#0D9488";
const BLUE = "#2563EB";
const ORANGE = "#EA580C";
const DARK_BLUE = "#1E3A5F";

interface Device {
  id: string;
  name: string;
  brand: string;
  icon: string;
  color: string;
  status: "coming_soon" | "available";
  metrics: string[];
  helpUrl?: string;
}

const DEVICES: Device[] = [
  {
    id: "apple-health",
    name: "Apple Health",
    brand: "Apple",
    icon: "heart",
    color: "#FF3B30",
    status: "coming_soon",
    metrics: ["Sleep", "Heart Rate", "HRV", "Steps", "Active Energy", "VO2 Max"],
    helpUrl: "https://www.apple.com/uk/ios/health/",
  },
  {
    id: "apple-watch",
    name: "Apple Watch",
    brand: "Apple",
    icon: "watch",
    color: "#FF3B30",
    status: "coming_soon",
    metrics: ["Sleep stages", "Blood oxygen", "ECG", "Skin temp", "Noise exposure"],
  },
  {
    id: "google-fit",
    name: "Google Fit",
    brand: "Google",
    icon: "activity",
    color: TEAL,
    status: "coming_soon",
    metrics: ["Heart Points", "Move Minutes", "Steps", "Weight", "Sleep"],
    helpUrl: "https://www.google.com/fit/",
  },
  {
    id: "wearos",
    name: "Wear OS",
    brand: "Google",
    icon: "watch",
    color: TEAL,
    status: "coming_soon",
    metrics: ["Steps", "Heart rate", "Sleep tracking", "Blood oxygen"],
  },
  {
    id: "samsung-health",
    name: "Samsung Health",
    brand: "Samsung",
    icon: "activity",
    color: "#1428A0",
    status: "coming_soon",
    metrics: ["Sleep analysis", "Stress score", "Blood oxygen", "Body composition"],
  },
  {
    id: "oura-ring",
    name: "Oura Ring",
    brand: "Oura",
    icon: "circle",
    color: PURPLE,
    status: "coming_soon",
    metrics: ["Readiness score", "Sleep stages", "HRV", "Skin temp", "Respiratory rate"],
    helpUrl: "https://ouraring.com/",
  },
  {
    id: "whoop",
    name: "WHOOP",
    brand: "WHOOP",
    icon: "zap",
    color: ORANGE,
    status: "coming_soon",
    metrics: ["Strain", "Recovery", "Sleep", "HRV", "Respiratory rate"],
    helpUrl: "https://www.whoop.com/",
  },
  {
    id: "garmin",
    name: "Garmin Connect",
    brand: "Garmin",
    icon: "navigation",
    color: BLUE,
    status: "coming_soon",
    metrics: ["Body Battery", "Stress", "Sleep", "VO2 Max", "HRV status"],
    helpUrl: "https://connect.garmin.com/",
  },
  {
    id: "fitbit",
    name: "Fitbit / Google",
    brand: "Fitbit",
    icon: "bar-chart-2",
    color: TEAL,
    status: "coming_soon",
    metrics: ["Sleep score", "Active Zone", "SpO2", "HRV", "Skin temp"],
  },
];

const DATA_CATEGORIES = [
  { icon: "moon",      label: "Sleep",      desc: "Duration, stages, quality score",     color: DARK_BLUE },
  { icon: "heart",     label: "Heart Rate", desc: "Resting HR, HRV, ECG",               color: "#FF3B30" },
  { icon: "trending-up", label: "Activity", desc: "Steps, calories, exercise",           color: TEAL },
  { icon: "thermometer", label: "Recovery", desc: "Readiness, strain, body battery",     color: ORANGE },
  { icon: "droplet",   label: "Blood O2",   desc: "SpO2, respiratory rate",              color: BLUE },
  { icon: "wind",      label: "Stress",     desc: "HRV, cortisol proxies, recovery",    color: PURPLE },
];

export default function IntegrationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  return (
    <>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 80 + bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 12 }}>
            <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Feather name="arrow-left" size={18} color={colors.foreground} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={[{ fontSize: 10, color: GOLD, fontFamily: "Lato_700Bold", letterSpacing: 2 }]}>WELLNESS HUB</Text>
              <Text style={[{ fontSize: 30, color: colors.foreground, fontFamily: "Cormorant_700Bold", lineHeight: 32 }]}>Smart Devices</Text>
            </View>
          </View>
        </View>

        <View style={{ padding: 20, gap: 24 }}>

          {/* Hero card */}
          <View style={[styles.heroCard, { backgroundColor: "#1a1a1a", borderColor: GOLD + "30" }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <View style={[styles.heroIcon, { backgroundColor: GOLD + "20", borderColor: GOLD + "40" }]}>
                <Feather name="wifi" size={22} color={GOLD} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[{ fontSize: 10, color: GOLD, fontFamily: "Lato_700Bold", letterSpacing: 2 }]}>SEAMLESS SYNC</Text>
                <Text style={[{ fontSize: 24, color: "#fff", fontFamily: "Cormorant_700Bold", lineHeight: 26 }]}>Connect your wearables</Text>
              </View>
            </View>
            <Text style={[{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "Lato_300Light", lineHeight: 19 }]}>
              Sync data from your Apple Watch, smart ring, or fitness tracker to enrich your Longevity Score, AI Coach conversations, and treatment recommendations — automatically.
            </Text>
            <View style={[styles.comingSoonBanner, { backgroundColor: GOLD + "20", borderColor: GOLD + "40" }]}>
              <Feather name="clock" size={13} color={GOLD} />
              <Text style={[{ color: GOLD, fontFamily: "Lato_700Bold", fontSize: 12 }]}>Integration coming soon — register your interest below</Text>
            </View>
          </View>

          {/* What data syncs */}
          <View>
            <Text style={[styles.sectionLabel, { color: colors.warmGray }]}>WHAT WE'LL SYNC</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {DATA_CATEGORIES.map((cat, i) => (
                <View key={i} style={[styles.dataChip, { backgroundColor: cat.color + "15", borderColor: cat.color + "30" }]}>
                  <Feather name={cat.icon as any} size={13} color={cat.color} />
                  <View>
                    <Text style={[{ fontSize: 12, color: colors.foreground, fontFamily: "Lato_700Bold" }]}>{cat.label}</Text>
                    <Text style={[{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>{cat.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Device list */}
          <View>
            <Text style={[styles.sectionLabel, { color: colors.warmGray }]}>SUPPORTED DEVICES</Text>
            <View style={{ gap: 10 }}>
              {DEVICES.map(device => (
                <Pressable
                  key={device.id}
                  onPress={() => setSelectedDevice(device)}
                  style={({ pressed }) => [styles.deviceCard, {
                    backgroundColor: pressed ? colors.secondary : colors.card,
                    borderColor: colors.border,
                  }]}
                >
                  <View style={[styles.deviceIcon, { backgroundColor: device.color + "15", borderColor: device.color + "25" }]}>
                    <Feather name={device.icon as any} size={20} color={device.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[{ fontSize: 16, color: colors.foreground, fontFamily: "Lato_700Bold" }]}>{device.name}</Text>
                    <Text style={[{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>
                      {device.metrics.slice(0, 3).join(" · ")}
                    </Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: GOLD + "20", borderColor: GOLD + "40" }]}>
                    <Text style={[{ fontSize: 9, color: GOLD, fontFamily: "Lato_700Bold", letterSpacing: 1 }]}>SOON</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* How it will work */}
          <View style={[styles.howCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[{ fontSize: 24, color: colors.foreground, fontFamily: "Cormorant_700Bold", marginBottom: 14 }]}>How it will work</Text>
            {[
              { step: "1", label: "Connect your device", desc: "Authorise once — your wearable's health data is securely synced." },
              { step: "2", label: "Auto-enriched insights", desc: "Your Longevity Score, Lab Results and AI Coach automatically include wearable data." },
              { step: "3", label: "Smarter treatment plans", desc: "Dr. Khan's team and your AI Coach use real biometric data to personalise your care." },
            ].map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={[styles.stepNum, { backgroundColor: GOLD }]}>
                  <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 12 }]}>{step.step}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[{ fontSize: 14, color: colors.foreground, fontFamily: "Lato_700Bold" }]}>{step.label}</Text>
                  <Text style={[{ fontSize: 12, color: colors.warmGray, fontFamily: "Lato_300Light", marginTop: 2, lineHeight: 17 }]}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Register interest */}
          <View style={[styles.interestCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="bell" size={18} color={GOLD} />
            <View style={{ flex: 1 }}>
              <Text style={[{ fontSize: 15, color: colors.foreground, fontFamily: "Lato_700Bold" }]}>Get notified when live</Text>
              <Text style={[{ fontSize: 12, color: colors.warmGray, fontFamily: "Lato_300Light", marginTop: 2 }]}>
                WhatsApp us to register your interest and be first to try smart integrations.
              </Text>
            </View>
            <Pressable
              onPress={() => Linking.openURL("https://wa.me/971586078532?text=Hi%20drypSKin!%20I'd%20like%20to%20be%20notified%20when%20smart%20device%20integrations%20go%20live.")}
              style={[styles.notifyBtn, { backgroundColor: GOLD }]}
            >
              <Feather name="message-circle" size={14} color="#fff" />
            </Pressable>
          </View>

          {/* Privacy note */}
          <View style={[styles.privacyNote, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="lock" size={13} color={colors.sage} />
            <Text style={[{ flex: 1, fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_300Light", lineHeight: 17 }]}>
              Your biometric data is end-to-end encrypted and never shared with third parties. You can disconnect any device at any time.
            </Text>
          </View>

        </View>
      </ScrollView>

      {/* Device detail modal */}
      <Modal visible={!!selectedDevice} transparent animationType="slide" onRequestClose={() => setSelectedDevice(null)}>
        <Pressable style={styles.overlay} onPress={() => setSelectedDevice(null)} />
        {selectedDevice && (
          <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <View style={[styles.deviceIcon, { backgroundColor: selectedDevice.color + "20", borderColor: selectedDevice.color + "30", width: 52, height: 52 }]}>
                <Feather name={selectedDevice.icon as any} size={22} color={selectedDevice.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[{ fontSize: 10, color: selectedDevice.color, fontFamily: "Lato_700Bold", letterSpacing: 1.5 }]}>{selectedDevice.brand.toUpperCase()}</Text>
                <Text style={[{ fontSize: 26, color: colors.foreground, fontFamily: "Cormorant_700Bold", lineHeight: 28 }]}>{selectedDevice.name}</Text>
              </View>
              <Pressable onPress={() => setSelectedDevice(null)} style={[styles.closeBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="x" size={16} color={colors.foreground} />
              </Pressable>
            </View>

            <Text style={[{ fontSize: 13, color: colors.warmGray, fontFamily: "Lato_300Light", marginBottom: 14 }]}>
              We'll sync the following metrics when {selectedDevice.name} integration goes live:
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
              {selectedDevice.metrics.map((m, i) => (
                <View key={i} style={[styles.metricChip, { backgroundColor: selectedDevice.color + "15", borderColor: selectedDevice.color + "30" }]}>
                  <Feather name="check" size={11} color={selectedDevice.color} />
                  <Text style={[{ fontSize: 12, color: colors.foreground, fontFamily: "Lato_400Regular" }]}>{m}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.comingSoonBanner, { backgroundColor: GOLD + "15", borderColor: GOLD + "30" }]}>
              <Feather name="clock" size={13} color={GOLD} />
              <Text style={[{ flex: 1, color: GOLD, fontFamily: "Lato_700Bold", fontSize: 12 }]}>
                Integration in development — coming soon
              </Text>
            </View>

            <Pressable
              onPress={() => {
                setSelectedDevice(null);
                Linking.openURL(`https://wa.me/971586078532?text=Hi%20drypSKin!%20I%20want%20to%20be%20notified%20when%20${encodeURIComponent(selectedDevice.name)}%20integration%20is%20ready.`);
              }}
              style={[styles.notifyBtnFull, { backgroundColor: GOLD }]}
            >
              <Feather name="message-circle" size={15} color="#fff" />
              <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 14 }]}>Notify me when ready</Text>
            </Pressable>
          </View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: 1, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  heroCard: { padding: 20, borderRadius: 22, borderWidth: 1 },
  heroIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, flexShrink: 0 },
  comingSoonBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 10, borderWidth: 1, marginTop: 14 },
  sectionLabel: { fontSize: 10, fontFamily: "Lato_700Bold", letterSpacing: 2, marginBottom: 12 },
  dataChip: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, width: "47%" },
  deviceCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, borderWidth: 1 },
  deviceIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, flexShrink: 0 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, flexShrink: 0 },
  howCard: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 14 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepNum: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  interestCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, borderWidth: 1 },
  notifyBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  privacyNote: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, padding: 24, paddingBottom: 40 },
  closeBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  metricChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 50, borderWidth: 1 },
  notifyBtnFull: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 50 },
});
