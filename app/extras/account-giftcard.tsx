import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, Platform,
  Pressable, StyleSheet, Text, TextInput, View,
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

interface GiftCard {
  id: number;
  code: string;
  balance: string;
  original_amount: string;
  expires_at: string;
  redeemed_at: string;
}

export default function GiftCardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const { t } = useI18n();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [cards, setCards] = useState<GiftCard[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const load = useCallback(async () => {
    if (!auth.token) return;
    try {
      const res = await fetch(`${API_BASE}/gift-cards`, { headers: { "x-auth-token": auth.token } });
      const data = await res.json();
      if (data.cards) { setCards(data.cards); setTotalBalance(data.total_balance); }
    } catch {}
    setLoading(false);
  }, [auth.token]);

  useEffect(() => { load(); }, [load]);

  const redeem = async () => {
    if (!code.trim()) { Alert.alert("Required", "Enter a gift card code."); return; }
    setRedeeming(true);
    try {
      const res = await fetch(`${API_BASE}/gift-cards/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": auth.token ?? "" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.error) {
        Alert.alert("Redemption Failed", data.error);
      } else {
        Alert.alert("Gift Card Activated!", data.message);
        setCode("");
        load();
      }
    } catch {}
    setRedeeming(false);
  };

  const formatCode = (input: string) => {
    const clean = input.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (clean.length <= 3) return clean;
    if (clean.length <= 8) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    return `${clean.slice(0, 3)}-${clean.slice(3, 8)}-${clean.slice(8, 13)}`;
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
          <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>{t("gift_card")}</Text>
        </View>

        <View style={{ padding: 16, gap: 14 }}>
          {/* Balance tile */}
          <View style={[styles.balanceTile, { backgroundColor: "#1a1a1a" }]}>
            <View style={styles.balanceLeft}>
              <Feather name="tag" size={20} color={GOLD} />
              <View>
                <Text style={[styles.balanceLabel, { fontFamily: "Lato_300Light" }]}>{t("total_balance")}</Text>
                <Text style={[styles.balanceValue, { fontFamily: "Cormorant_700Bold" }]}>AED {totalBalance.toFixed(0)}</Text>
              </View>
            </View>
            <Text style={[styles.balanceSub, { fontFamily: "Lato_300Light" }]}>
              {cards.length} {cards.length === 1 ? "card" : "cards"} redeemed
            </Text>
          </View>

          {/* Buy Gift Voucher CTA */}
          <Pressable
            onPress={() => router.push("/extras/buy-gift-voucher" as any)}
            style={({ pressed }) => [styles.buyCard, { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }]}
          >
            <View style={styles.buyLeft}>
              <View style={styles.buyIconWrap}>
                <Feather name="gift" size={24} color={GOLD} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.buyTitle, { fontFamily: "Cormorant_700Bold" }]}>Buy a Gift Voucher</Text>
                <Text style={[styles.buySub, { fontFamily: "Lato_300Light" }]}>Send the gift of wellness to someone special</Text>
              </View>
            </View>
            <View style={styles.buyArrow}>
              <Feather name="arrow-right" size={14} color="#fff" />
            </View>
          </Pressable>

          {/* Redeem form */}
          <View style={[styles.redeemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.redeemTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{t("redeem_code")}</Text>
            <Text style={[styles.redeemSub, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
              Enter your gift card code in the format: DRY-XXXXX-XXXXX
            </Text>
            <View style={[styles.codeInput, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Feather name="gift" size={18} color={colors.mutedForeground} />
              <TextInput
                value={code}
                onChangeText={(v) => setCode(formatCode(v))}
                placeholder="DRY-XXXXX-XXXXX"
                autoCapitalize="characters"
                maxLength={17}
                placeholderTextColor={colors.mutedForeground}
                style={[styles.codeField, { color: colors.foreground, fontFamily: "Lato_700Bold" }]}
              />
            </View>
            <Pressable onPress={redeem} disabled={redeeming}
              style={({ pressed }) => [styles.redeemBtn, { backgroundColor: GOLD, opacity: pressed || redeeming ? 0.8 : 1 }]}>
              {redeeming ? <ActivityIndicator color="#fff" size="small" /> : (
                <><Feather name="check-circle" size={16} color="#fff" /><Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 15 }]}>{t("redeem")}</Text></>
              )}
            </Pressable>

            <View style={[styles.hint, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Feather name="info" size={12} color={colors.mutedForeground} />
              <Text style={[{ flex: 1, fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_300Light", lineHeight: 16 }]}>
                Gift cards can be purchased at drypSKin Clinic or received as a reward. Each code can only be redeemed once.
              </Text>
            </View>
          </View>

          {/* Cards list */}
          {loading ? <ActivityIndicator color={colors.primary} /> :
            cards.length === 0 ? (
              <View style={[styles.empty, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="gift" size={28} color={colors.border} />
                <Text style={[{ fontSize: 18, color: colors.foreground, fontFamily: "Cormorant_700Bold", marginTop: 8 }]}>{t("no_gift_cards")}</Text>
                <Text style={[{ fontSize: 13, color: colors.warmGray, fontFamily: "Lato_300Light", marginTop: 4, textAlign: "center" }]}>
                  Redeem a gift card code above to see your balance
                </Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                <Text style={[styles.sectionHead, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>REDEEMED CARDS</Text>
                {cards.map((card) => (
                  <View key={card.id} style={[styles.cardItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.cardIconWrap, { backgroundColor: `${GOLD}18` }]}>
                      <Feather name="tag" size={16} color={GOLD} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardCode, { color: colors.foreground, fontFamily: "Lato_700Bold" }]}>{card.code}</Text>
                      <Text style={[styles.cardMeta, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>
                        Redeemed {new Date(card.redeemed_at).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}
                      </Text>
                    </View>
                    <Text style={[styles.cardBal, { color: GOLD, fontFamily: "Cormorant_700Bold" }]}>AED {parseFloat(card.balance).toFixed(0)}</Text>
                  </View>
                ))}
              </View>
            )
          }
        </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 24, paddingBottom: 28 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  heroLabel: { color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 2.5, marginBottom: 4 },
  heroTitle: { color: "#fff", fontSize: 40, lineHeight: 44 },
  balanceTile: { borderRadius: 20, padding: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  balanceLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  balanceLabel: { color: "rgba(255,255,255,0.45)", fontSize: 12, letterSpacing: 0.5 },
  balanceValue: { color: "#fff", fontSize: 32, lineHeight: 34 },
  balanceSub: { color: "rgba(255,255,255,0.35)", fontSize: 12 },
  redeemCard: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 12 },
  redeemTitle: { fontSize: 24 },
  redeemSub: { fontSize: 13, lineHeight: 18, marginTop: -4 },
  codeInput: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14 },
  codeField: { flex: 1, fontSize: 18, letterSpacing: 2 },
  redeemBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 50 },
  hint: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  empty: { alignItems: "center", padding: 32, borderRadius: 20, borderWidth: 1, gap: 4 },
  sectionHead: { fontSize: 11, letterSpacing: 1.5, marginLeft: 4 },
  cardItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  cardIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cardCode: { fontSize: 15, letterSpacing: 0.5 },
  cardMeta: { fontSize: 12, marginTop: 2 },
  cardBal: { fontSize: 22 },
  buyCard: { borderRadius: 20, backgroundColor: "#1a1a1a", padding: 18, flexDirection: "row", alignItems: "center", gap: 14 },
  buyLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  buyIconWrap: { width: 50, height: 50, borderRadius: 14, backgroundColor: `${GOLD}18`, borderWidth: 1, borderColor: `${GOLD}40`, alignItems: "center", justifyContent: "center" },
  buyTitle: { color: "#fff", fontSize: 20, lineHeight: 22 },
  buySub: { color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 },
  buyArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: GOLD, alignItems: "center", justifyContent: "center" },
});
