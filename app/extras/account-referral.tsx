import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, Clipboard, Linking,
  Platform, Pressable, Share, StyleSheet, Text, View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";

const API_BASE = `https://${process.env.EXPO_PUBLIC_API_URL}/api`;
const GOLD = "#C4956A";

interface ReferralData {
  referral_code: string;
  total_earned: number;
  total_redeemed: number;
  available_balance: number;
  referrals: { id: number; referred_email: string; status: string; credit_amount: number; created_at: string }[];
}

export default function ReferralScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const { t } = useI18n();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!auth.token) return;
    try {
      const res = await fetch(`${API_BASE}/referral`, { headers: { "x-auth-token": auth.token } });
      const d = await res.json();
      setData(d);
    } catch {}
    setLoading(false);
  }, [auth.token]);

  useEffect(() => { load(); }, [load]);

  const copyCode = () => {
    if (!data?.referral_code) return;
    Clipboard.setString(data.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = async () => {
    if (!data?.referral_code) return;
    try {
      await Share.share({
        message: `Join drypSKin Private Wellness Club in Dubai Marina! Use my referral code ${data.referral_code} and get a special welcome offer. Book IV therapy, aesthetics & wellness at: https://wa.me/971586078532`,
        title: "drypSKin Referral Invitation",
      });
    } catch {}
  };

  const shareViaWhatsApp = async () => {
    if (!data?.referral_code) return;
    const msg = encodeURIComponent(
      `Hey! I'm a member of drypSKin Private Wellness Club in Dubai Marina — IV therapy, aesthetics & wellness. Use my code *${data.referral_code}* when you sign up and I'll earn AED 50 credit 🎁\n\nDownload the app or book here: https://wa.me/971586078532`
    );
    await Linking.openURL(`https://wa.me/?text=${msg}`);
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 40 + bottomPad }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bottomOffset={20}
    >
        <View style={[styles.hero, { paddingTop: topPad + 16, backgroundColor: "#1a1a1a" }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
            <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>{t("my_account")}</Text>
          </Pressable>
          <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>MY ACCOUNT</Text>
          <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>{t("referral_credits")}</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
        ) : (
          <View style={{ padding: 16, gap: 14 }}>
            {/* Stats row */}
            <View style={styles.statsRow}>
              {[
                { label: t("available_balance"), value: `AED ${data?.available_balance ?? 0}`, accent: GOLD },
                { label: t("credits_earned"), value: `AED ${data?.total_earned ?? 0}`, accent: colors.sage },
                { label: t("referrals_sent"), value: String(data?.referrals.length ?? 0), accent: colors.foreground },
              ].map((s, i) => (
                <View key={i} style={[styles.statCell, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.statValue, { color: s.accent, fontFamily: "Cormorant_700Bold" }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Referral code card */}
            <View style={[styles.codeCard, { backgroundColor: "#1a1a1a" }]}>
              <View style={styles.codeCardHeader}>
                <Feather name="gift" size={18} color={GOLD} />
                <Text style={[styles.codeTitle, { fontFamily: "Cormorant_700Bold" }]}>{t("referral_code")}</Text>
              </View>
              <Text style={[styles.codeDesc, { fontFamily: "Lato_300Light" }]}>{t("referral_info")}</Text>
              <View style={styles.codeBox}>
                <Text style={[styles.codeText, { fontFamily: "Lato_700Bold" }]}>{data?.referral_code ?? "..."}</Text>
                <Pressable onPress={copyCode} style={[styles.copyBtn, { backgroundColor: copied ? "#5C7A6B" : GOLD }]}>
                  <Feather name={copied ? "check" : "copy"} size={14} color="#fff" />
                  <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 12 }]}>{copied ? "Copied!" : "Copy"}</Text>
                </Pressable>
              </View>
              <Pressable onPress={shareCode} style={[styles.shareBtn, { backgroundColor: GOLD }]}>
                <Feather name="share-2" size={16} color="#fff" />
                <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 15 }]}>{t("share_code")}</Text>
              </Pressable>
            </View>

            {/* How it works */}
            <View style={[styles.inviteCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.inviteTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{t("invite_friend")}</Text>
              {[
                { icon: "share-2", text: "Share your code with a friend via WhatsApp or any channel." },
                { icon: "user-plus", text: "They enter your code when creating their account." },
                { icon: "gift", text: "You earn AED 50 credit the moment they join — automatically." },
              ].map((step, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                  <View style={[styles.stepIcon, { backgroundColor: `${GOLD}18`, borderColor: `${GOLD}30` }]}>
                    <Feather name={step.icon as any} size={13} color={GOLD} />
                  </View>
                  <Text style={{ flex: 1, fontSize: 13, color: colors.warmGray, fontFamily: "Lato_300Light", lineHeight: 19, paddingTop: 1 }}>
                    {step.text}
                  </Text>
                </View>
              ))}
              <Pressable onPress={shareViaWhatsApp}
                style={({ pressed }) => [styles.sendBtn, { backgroundColor: "#25D366", opacity: pressed ? 0.85 : 1 }]}>
                <Feather name="message-circle" size={15} color="#fff" />
                <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 14 }]}>Share via WhatsApp</Text>
              </Pressable>
            </View>

            {/* Referral history */}
            {data?.referrals && data.referrals?.length > 0 ? (
              <View style={[styles.histCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.histTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>Referral History</Text>
                {data.referrals.map((r) => (
                  <View key={r.id} style={[styles.histRow, { borderTopColor: colors.border }]}>
                    <View style={[styles.histIcon, { backgroundColor: r.status === "completed" ? "#5C7A6B20" : colors.secondary }]}>
                      <Feather name={r.status === "completed" ? "check" : "clock"} size={13} color={r.status === "completed" ? "#5C7A6B" : colors.warmGray} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[{ fontSize: 14, color: colors.foreground, fontFamily: "Lato_400Regular" }]}>{r.referred_email}</Text>
                      <Text style={[{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Lato_300Light", marginTop: 1 }]}>
                        {r.status === "completed" ? `AED ${r.credit_amount} earned` : "Pending"}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: r.status === "completed" ? "#5C7A6B20" : colors.secondary }]}>
                      <Text style={[{ fontSize: 11, color: r.status === "completed" ? "#5C7A6B" : colors.warmGray, fontFamily: "Lato_700Bold" }]}>
                        {r.status === "completed" ? t("completed") : t("pending")}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.noReferrals, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="users" size={20} color={colors.mutedForeground} />
                <Text style={[{ fontSize: 14, color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>{t("no_referrals")}</Text>
              </View>
            )}
          </View>
        )}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 24, paddingBottom: 28 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  heroLabel: { color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 2.5, marginBottom: 4 },
  heroTitle: { color: "#fff", fontSize: 40, lineHeight: 44 },
  statsRow: { flexDirection: "row", gap: 8 },
  statCell: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "center" },
  statValue: { fontSize: 20, lineHeight: 22 },
  statLabel: { fontSize: 11, textAlign: "center", marginTop: 3, lineHeight: 15 },
  codeCard: { borderRadius: 20, padding: 20, gap: 12 },
  codeCardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  codeTitle: { color: "#fff", fontSize: 22 },
  codeDesc: { color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 18 },
  codeBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 12, padding: 14, gap: 10 },
  codeText: { flex: 1, color: "#fff", fontSize: 18, letterSpacing: 2 },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  shareBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50 },
  inviteCard: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 14 },
  inviteTitle: { fontSize: 22 },
  stepIcon: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center", marginTop: 1 },
  sendBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50, marginTop: 2 },
  histCard: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 10 },
  histTitle: { fontSize: 22 },
  histRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, borderTopWidth: 1 },
  histIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6 },
  noReferrals: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 20, borderRadius: 14, borderWidth: 1 },
});
