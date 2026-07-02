import React, { useState } from "react";
import {
  Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useI18n } from "@/context/I18nContext";

const WHATSAPP = "https://wa.me/971586078532";
const SAGE = "#8B9B8A";

interface FAQ {
  qKey: string;
  aKey: string;
  icon: string;
  color: string;
}

const FAQS: FAQ[] = [
  { qKey: "faq_booking_q", aKey: "faq_booking_a", icon: "calendar", color: "#1a1a1a" },
  { qKey: "faq_iv_q", aKey: "faq_iv_a", icon: "droplet", color: "#4A7AAA" },
  { qKey: "faq_home_q", aKey: "faq_home_a", icon: "home", color: "#5C7A6B" },
  { qKey: "faq_cancel_q", aKey: "faq_cancel_a", icon: "x-circle", color: "#C4956A" },
  { qKey: "faq_membership_q", aKey: "faq_membership_a", icon: "star", color: "#C4956A" },
];

const EXTRA_FAQS = [
  { q: "What are your operating hours?", a: "We are open 7 days a week, 10:00 AM – 10:00 PM. Home service visits are available from 9:00 AM – 8:00 PM.", icon: "clock", color: "#8B9B8A" },
  { q: "How do I prepare for an IV drip?", a: "We recommend eating a light meal 1–2 hours before your session and drinking water. Avoid heavy exercise immediately before.", icon: "info", color: "#4A5B8A" },
  { q: "Are the treatments safe?", a: "All treatments are administered by licensed nurses and supervised by Dr. Khan. We use only pharmaceutical-grade formulations.", icon: "shield", color: "#5C7A6B" },
  { q: "What payment methods do you accept?", a: "We accept cash, card, bank transfer, and selected digital wallets. Packages can be split across sessions.", icon: "credit-card", color: "#C4956A" },
  { q: "Can I gift a treatment to someone?", a: "Yes! We offer gift cards and vouchers for all treatments. Contact us via WhatsApp to arrange.", icon: "gift", color: "#8A5A7A" },
];

export default function HelpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useI18n();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [open, setOpen] = useState<number | null>(null);

  const allFaqs = [
    ...FAQS.map((f) => ({ q: t(f.qKey), a: t(f.aKey), icon: f.icon, color: f.color })),
    ...EXTRA_FAQS,
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 + bottomPad }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { paddingTop: topPad + 16, backgroundColor: "#1a1a1a" }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
            <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>{t("my_account")}</Text>
          </Pressable>
          <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>SUPPORT</Text>
          <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>{t("get_help")}</Text>
          <Text style={[styles.heroSub, { fontFamily: "Lato_300Light" }]}>Everything you need to know</Text>
        </View>

        <View style={{ padding: 16, gap: 14 }}>
          {/* FAQ list */}
          <Text style={[styles.sectionHead, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>
            {t("faq").toUpperCase()}
          </Text>
          <View style={[styles.faqGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {allFaqs.map((faq, i) => (
              <View key={i} style={[styles.faqItem, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Pressable onPress={() => setOpen(open === i ? null : i)} style={styles.faqHeader}>
                  <View style={[styles.faqIcon, { backgroundColor: `${faq.color}15` }]}>
                    <Feather name={faq.icon as any} size={14} color={faq.color} />
                  </View>
                  <Text style={[styles.faqQ, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}>{faq.q}</Text>
                  <Feather name={open === i ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
                </Pressable>
                {open === i && (
                  <View style={[styles.faqAnswer, { borderTopColor: colors.border }]}>
                    <Text style={[styles.faqA, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>{faq.a}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Still need help */}
          <View style={[styles.supportCard, { backgroundColor: "#1a1a1a" }]}>
            <View style={styles.supportHeader}>
              <Feather name="message-circle" size={20} color={SAGE} />
              <Text style={[styles.supportTitle, { fontFamily: "Cormorant_700Bold" }]}>{t("still_need_help")}</Text>
            </View>
            <Text style={[styles.supportDesc, { fontFamily: "Lato_300Light" }]}>
              Our team is available 7 days a week. We typically respond within minutes via WhatsApp.
            </Text>
            <Pressable
              onPress={() => Linking.openURL(WHATSAPP)}
              style={[styles.waBtn, { backgroundColor: "#25D366" }]}
            >
              <Feather name="message-circle" size={18} color="#fff" />
              <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 15 }]}>{t("whatsapp_us")}</Text>
            </Pressable>
          </View>

          {/* Quick links */}
          <View style={[styles.quickLinks, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { label: "Pricing & Packages", icon: "tag", onPress: () => router.push("/(tabs)/services" as any) },
              { label: "Book a Treatment", icon: "calendar", onPress: () => Linking.openURL(WHATSAPP) },
              { label: "Contact Us", icon: "phone", onPress: () => router.push("/extras/account-contact" as any) },
            ].map((link, i) => (
              <Pressable key={i} onPress={link.onPress}
                style={({ pressed }) => [styles.quickItem, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }, { opacity: pressed ? 0.75 : 1 }]}>
                <View style={[styles.quickIcon, { backgroundColor: colors.secondary }]}>
                  <Feather name={link.icon as any} size={14} color={colors.warmGray} />
                </View>
                <Text style={[styles.quickLabel, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}>{link.label}</Text>
                <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
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
  faqGroup: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  faqItem: {},
  faqHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  faqIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  faqQ: { flex: 1, fontSize: 14, lineHeight: 19 },
  faqAnswer: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1 },
  faqA: { fontSize: 13, lineHeight: 20, paddingTop: 10 },
  supportCard: { borderRadius: 20, padding: 20, gap: 10 },
  supportHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  supportTitle: { color: "#fff", fontSize: 22 },
  supportDesc: { color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 18 },
  waBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50 },
  quickLinks: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  quickItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  quickIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  quickLabel: { flex: 1, fontSize: 14 },
});
