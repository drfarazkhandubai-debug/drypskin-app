import React from "react";
import {
  Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useI18n } from "@/context/I18nContext";

const GOLD = "#C4956A";
const SAGE = "#8B9B8A";

const CONTACTS = [
  {
    icon: "message-circle",
    label: "WhatsApp",
    value: "+971 58 607 8532",
    subtitle: "Fastest response — 7 days a week",
    color: "#25D366",
    action: () => Linking.openURL("https://wa.me/971586078532"),
  },
  {
    icon: "phone",
    label: "Call Us",
    value: "+971 58 607 8532",
    subtitle: "Available 10AM – 10PM daily",
    color: "#4A7AAA",
    action: () => Linking.openURL("tel:+971586078532"),
  },
  {
    icon: "mail",
    label: "Email",
    value: "info@drypskin.com",
    subtitle: "We reply within 24 hours",
    color: GOLD,
    action: () => Linking.openURL("mailto:info@drypskin.com"),
  },
  {
    icon: "instagram",
    label: "Instagram",
    value: "@drypskin",
    subtitle: "Follow for wellness tips & offers",
    color: "#C13584",
    action: () => Linking.openURL("https://www.instagram.com/drypskin"),
  },
];

export default function ContactScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useI18n();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 + bottomPad }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { paddingTop: topPad + 16, backgroundColor: "#1a1a1a" }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
            <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>{t("my_account")}</Text>
          </Pressable>
          <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>PRIVATE WELLNESS CLUB</Text>
          <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>{t("contact_us")}</Text>
          <Text style={[styles.heroSub, { fontFamily: "Lato_300Light" }]}>drypSKin Clinic, Dubai Marina</Text>
        </View>

        <View style={{ padding: 16, gap: 14 }}>
          {/* Contact methods */}
          <Text style={[styles.sectionHead, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>
            {t("reach_us").toUpperCase()}
          </Text>
          {CONTACTS.map((c, i) => (
            <Pressable
              key={i}
              onPress={c.action}
              style={({ pressed }) => [styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.88 : 1 }]}
            >
              <View style={[styles.contactIcon, { backgroundColor: `${c.color}18` }]}>
                <Feather name={c.icon as any} size={22} color={c.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactLabel, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>{c.label.toUpperCase()}</Text>
                <Text style={[styles.contactValue, { color: colors.foreground, fontFamily: "Lato_700Bold" }]}>{c.value}</Text>
                <Text style={[styles.contactSub, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>{c.subtitle}</Text>
              </View>
              <View style={[styles.actionBtn, { backgroundColor: `${c.color}18`, borderColor: `${c.color}30` }]}>
                <Feather name="arrow-up-right" size={16} color={c.color} />
              </View>
            </Pressable>
          ))}

          {/* Location card */}
          <Text style={[styles.sectionHead, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>
            {t("visit_us").toUpperCase()}
          </Text>
          <View style={[styles.locationCard, { backgroundColor: "#1a1a1a" }]}>
            <View style={styles.locationHeader}>
              <View style={[styles.locIcon, { backgroundColor: `${GOLD}25` }]}>
                <Feather name="map-pin" size={18} color={GOLD} />
              </View>
              <View>
                <Text style={[styles.locationTitle, { fontFamily: "Cormorant_700Bold" }]}>drypSKin Clinic</Text>
                <Text style={[styles.locationSub, { fontFamily: "Lato_300Light" }]}>Dubai Marina, Dubai, UAE</Text>
              </View>
            </View>
            <View style={[styles.locationDetails, { borderTopColor: "rgba(255,255,255,0.08)" }]}>
              {[
                { icon: "clock", label: "Hours", value: "Mon–Sun: 10:00 AM – 10:00 PM" },
                { icon: "map", label: "Address", value: "Dubai Marina Walk, Near Marina Promenade" },
                { icon: "navigation", label: "Getting Here", value: "Near Dubai Marina Metro Station (Red Line)" },
              ].map((row, i) => (
                <View key={i} style={[styles.locRow, i > 0 && { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" }]}>
                  <Feather name={row.icon as any} size={13} color="rgba(255,255,255,0.35)" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.locRowLabel, { fontFamily: "Lato_400Regular" }]}>{row.label}</Text>
                    <Text style={[styles.locRowValue, { fontFamily: "Lato_300Light" }]}>{row.value}</Text>
                  </View>
                </View>
              ))}
            </View>
            <Pressable
              onPress={() => Linking.openURL("https://maps.google.com/?q=Dubai+Marina+Clinic")}
              style={[styles.mapsBtn, { backgroundColor: GOLD }]}
            >
              <Feather name="map" size={16} color="#fff" />
              <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 14 }]}>Open in Maps</Text>
            </Pressable>
          </View>

          {/* Book now CTA */}
          <Pressable
            onPress={() => Linking.openURL("https://wa.me/971586078532?text=Hi%20drypSKin%2C%20I'd%20like%20to%20book%20a%20treatment")}
            style={[styles.bookCTA, { backgroundColor: "#25D366" }]}
          >
            <Feather name="message-circle" size={18} color="#fff" />
            <View>
              <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 16 }]}>Book via WhatsApp</Text>
              <Text style={[{ color: "rgba(255,255,255,0.7)", fontFamily: "Lato_300Light", fontSize: 12 }]}>Instant confirmation</Text>
            </View>
            <Feather name="arrow-right" size={18} color="#fff" style={{ marginLeft: "auto" as any }} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 24, paddingBottom: 28 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  heroLabel: { color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 2.5, marginBottom: 4 },
  heroTitle: { color: "#fff", fontSize: 40, lineHeight: 44 },
  heroSub: { color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 },
  sectionHead: { fontSize: 11, letterSpacing: 1.5, marginLeft: 4 },
  contactCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 18, borderWidth: 1 },
  contactIcon: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  contactLabel: { fontSize: 10, letterSpacing: 1 },
  contactValue: { fontSize: 16, marginTop: 1 },
  contactSub: { fontSize: 12, marginTop: 2 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  locationCard: { borderRadius: 20, overflow: "hidden" },
  locationHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 18 },
  locIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  locationTitle: { color: "#fff", fontSize: 20 },
  locationSub: { color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 },
  locationDetails: { borderTopWidth: 1, padding: 16, gap: 10 },
  locRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingTop: 10 },
  locRowLabel: { color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 0.5 },
  locRowValue: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2, lineHeight: 18 },
  mapsBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, margin: 16, marginTop: 8, paddingVertical: 14, borderRadius: 50 },
  bookCTA: { flexDirection: "row", alignItems: "center", gap: 12, padding: 18, borderRadius: 18 },
});

