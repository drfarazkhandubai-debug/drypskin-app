import React from "react";
import {
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useI18n } from "@/context/I18nContext";
import { GoldButton } from "@/components/GoldButton";

const awards = [
  "Best Emerging Aesthetics Clinic 2024",
  "UAE Business Awards — Most Dedicated Aesthetic & Wellbeing Clinic Dubai 2024",
  "Multi Award Winner",
  "Professional Excellence Award",
  "People's Choice Award",
  "AMEA Business Awards — Winner",
];

const values = [
  { icon: "award", title: "Award Winning", desc: "Dubai's most dedicated aesthetic clinic" },
  { icon: "user-check", title: "Expert Team", desc: "Board-certified doctors & practitioners" },
  { icon: "heart", title: "Personalized", desc: "Every plan tailored to your unique needs" },
  { icon: "shield", title: "MOHAP Licensed", desc: "Highest safety & medical standards" },
];

export default function AboutScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 100 + bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Dark Hero */}
      <View style={[styles.hero, { paddingTop: topPad + 28, backgroundColor: colors.charcoal }]}>
        <Image source={require("@/assets/images/aesthetics.png")} style={styles.heroBg} resizeMode="cover" />
        <View style={styles.heroContent}>
          <Text style={[styles.heroTag, { color: colors.sage, fontFamily: "Lato_300Light" }]}>
            DRYP · SKIN
          </Text>
          <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>
            Private{"\n"}Wellness Club
          </Text>
          <Text style={[styles.heroDesc, { fontFamily: "Lato_300Light" }]}>
            drypSKin is your go-to aesthetic and wellbeing clinic — the place to look and feel your best from the inside and outside.
          </Text>
        </View>
      </View>

      {/* MOHAP */}
      <View style={[styles.mohap, { backgroundColor: colors.secondary, borderColor: colors.border, marginHorizontal: 20, marginTop: 20 }]}>
        <Feather name="shield" size={18} color={colors.sage} />
        <View style={{ flex: 1 }}>
          <Text style={[{ fontSize: 14, fontFamily: "Lato_700Bold", color: colors.foreground }]}>MOHAP Licensed Clinic</Text>
          <Text style={[{ fontSize: 12, color: colors.warmGray, fontFamily: "Lato_400Regular", marginTop: 1 }]}>Licence No: AB5RHSXW-131025</Text>
        </View>
        <View style={[styles.checkBadge, { backgroundColor: colors.sage }]}>
          <Feather name="check" size={12} color="#fff" />
        </View>
      </View>

      {/* Values */}
      <View style={[styles.section, { marginTop: 28 }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{t("why_drypskin")}</Text>
        <View style={styles.valuesGrid}>
          {values.map((v, i) => (
            <View key={i} style={[styles.valueCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.valueIcon, { backgroundColor: colors.secondary }]}>
                <Feather name={v.icon as any} size={20} color={colors.sage} />
              </View>
              <Text style={[styles.valueTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{v.title}</Text>
              <Text style={[styles.valueDesc, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>{v.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Awards */}
      <View style={[styles.section, { marginTop: 28 }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>Recognition</Text>
        <View style={[styles.awardsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {awards.map((a, i) => (
            <View key={i}>
              <View style={styles.awardRow}>
                <View style={[styles.dot, { backgroundColor: colors.sage }]} />
                <Text style={[styles.awardText, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}>{a}</Text>
              </View>
              {i < awards.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            </View>
          ))}
        </View>
      </View>

      {/* Location */}
      <View style={[styles.section, { marginTop: 28 }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>Find Us</Text>
        <View style={[styles.locationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.mapBox, { backgroundColor: colors.secondary }]}>
            <Feather name="map-pin" size={28} color={colors.sage} />
            <Text style={[{ fontSize: 18, fontFamily: "Cormorant_700Bold", color: colors.foreground, marginTop: 10, textAlign: "center" }]}>
              Marinascape Mall{"\n"}Dubai Marina
            </Text>
            <Text style={[{ fontSize: 13, color: colors.warmGray, fontFamily: "Lato_400Regular", marginTop: 4 }]}>
              Unit R-04, Marina, Dubai, UAE
            </Text>
            <Pressable
              onPress={() => Linking.openURL("https://maps.google.com/?q=Marinascape+Mall+Dubai+Marina")}
              style={[styles.dirBtn, { borderColor: colors.sage }]}
            >
              <Feather name="navigation" size={14} color={colors.sage} />
              <Text style={[{ color: colors.sage, fontSize: 14, fontFamily: "Lato_700Bold" }]}>{t("get_directions")}</Text>
            </Pressable>
          </View>
          {[
            { icon: "phone", val: "04 2759200", url: "tel:042759200" },
            { icon: "smartphone", val: "+971 586 078 532", url: "tel:+971586078532" },
            { icon: "mail", val: "info@drypskin.com", url: "mailto:info@drypskin.com" },
            { icon: "globe", val: "www.drypskin.com", url: "https://www.drypskin.com" },
          ].map((c, i, arr) => (
            <View key={i}>
              <Pressable onPress={() => Linking.openURL(c.url)} style={styles.contactRow}>
                <Feather name={c.icon as any} size={16} color={colors.sage} />
                <Text style={[{ fontSize: 15, color: colors.foreground, flex: 1, fontFamily: "Lato_400Regular" }]}>{c.val}</Text>
                <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
              </Pressable>
              {i < arr.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border, marginLeft: 44 }]} />}
            </View>
          ))}
        </View>
      </View>

      {/* Social */}
      <View style={[styles.section, { marginTop: 28 }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>Follow Us</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {[
            { icon: "instagram", label: "Instagram", url: "https://www.instagram.com/drypskin/" },
            { icon: "facebook", label: "Facebook", url: "https://www.facebook.com/drypskin" },
          ].map((s) => (
            <Pressable key={s.icon} onPress={() => Linking.openURL(s.url)} style={[styles.socialBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name={s.icon as any} size={22} color={colors.sage} />
              <Text style={[{ fontSize: 14, color: colors.foreground, fontFamily: "Lato_400Regular" }]}>{s.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <GoldButton
          title={t("book_whatsapp")}
          onPress={() => Linking.openURL("https://wa.me/971586078532?text=Hello%20I'd%20like%20to%20book%20an%20appointment")}
          fullWidth
          style={{ paddingVertical: 18, backgroundColor: colors.charcoal }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { paddingBottom: 36, paddingHorizontal: 24, position: "relative" },
  heroBg: { ...StyleSheet.absoluteFillObject, opacity: 0.15 },
  heroContent: { gap: 8 },
  heroTag: { fontSize: 10, letterSpacing: 4 },
  heroTitle: { fontSize: 48, lineHeight: 52, color: "#fff" },
  heroDesc: { fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 22 },
  mohap: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, gap: 12 },
  checkBadge: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  section: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 30, marginBottom: 14 },
  valuesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  valueCard: { width: "47%", padding: 16, borderRadius: 18, borderWidth: 1, gap: 8 },
  valueIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  valueTitle: { fontSize: 18 },
  valueDesc: { fontSize: 12, lineHeight: 16 },
  awardsCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  awardRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  awardText: { fontSize: 14, flex: 1, lineHeight: 18 },
  divider: { height: 1 },
  locationCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  mapBox: { padding: 28, alignItems: "center", gap: 4 },
  dirBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 50, borderWidth: 1.5, marginTop: 12 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  socialBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, borderRadius: 16, borderWidth: 1 },
});
