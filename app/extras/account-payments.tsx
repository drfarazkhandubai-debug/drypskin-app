import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, Platform,
  Pressable, StyleSheet, Text, TextInput, View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";

const API_BASE = `https://${process.env.EXPO_PUBLIC_API_URL}/api`;
const GOLD = "#C4956A";
const RED = "#FF3B30";

interface PaymentMethod {
  id: number;
  type: string;
  brand: string;
  last4: string;
  cardholder_name: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
}

const BRANDS = ["Visa", "Mastercard", "Amex", "Other"];
const brandColors: Record<string, string> = {
  Visa: "#1A1F71", Mastercard: "#EB001B", Amex: "#2E77BC", Other: "#8B9B8A",
};

// ── Wallet definitions ──────────────────────────────────────────────────────
const WALLETS = [
  {
    type: "apple_pay",
    name: "Apple Pay",
    sub: "Touch ID / Face ID",
    icon: "smartphone",
    color: "#1a1a1a",
    badge: "",
  },
  {
    type: "google_pay",
    name: "Google Pay",
    sub: "Contactless payments",
    icon: "credit-card",
    color: "#4285F4",
    badge: "",
  },
];

export default function PaymentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const { t } = useI18n();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  // Card form state
  const [brand, setBrand] = useState("Visa");
  const [last4, setLast4] = useState("");
  const [name, setName] = useState(auth.user?.name ?? "");
  const [expiry, setExpiry] = useState("");

  // Sync cardholder name when profile loads
  useEffect(() => {
    if (auth.user?.name && !name) setName(auth.user.name);
  }, [auth.user]);
  const [isDefault, setIsDefault] = useState(false);

  const load = useCallback(async () => {
    if (!auth.token) return;
    try {
      const res = await fetch(`${API_BASE}/payment-methods`, {
        headers: { "x-auth-token": auth.token },
      });
      const data = await res.json();
      if (data.methods) setMethods(data.methods);
    } catch {}
    setLoading(false);
  }, [auth.token]);

  useEffect(() => { load(); }, [load]);

  const cards = methods.filter((m) => m.type === "card" || !m.type);
  const hasWallet = (type: string) => methods.some((m) => m.type === type);
  const hasCash = hasWallet("cash");
  const defaultMethod = methods.find((m) => m.is_default);

  // ── Toggle wallet (Apple Pay / Google Pay) ─────────────────────────────
  const toggleWallet = async (type: string) => {
    if (!auth.token) return;
    setSaving(type);
    if (hasWallet(type)) {
      const existing = methods.find((m) => m.type === type);
      if (existing) {
        await fetch(`${API_BASE}/payment-methods/${existing.id}`, {
          method: "DELETE",
          headers: { "x-auth-token": auth.token },
        });
        setMethods((prev) => prev.filter((m) => m.id !== existing.id));
      }
    } else {
      const res = await fetch(`${API_BASE}/payment-methods`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": auth.token },
        body: JSON.stringify({ type, is_default: methods.length === 0 }),
      });
      const data = await res.json();
      if (data.method) setMethods((prev) => [...prev, data.method]);
    }
    setSaving(null);
  };

  // ── Toggle cash / pay at clinic ────────────────────────────────────────
  const toggleCash = async () => {
    if (!auth.token) return;
    setSaving("cash");
    if (hasCash) {
      const existing = methods.find((m) => m.type === "cash");
      if (existing) {
        await fetch(`${API_BASE}/payment-methods/${existing.id}`, {
          method: "DELETE",
          headers: { "x-auth-token": auth.token },
        });
        setMethods((prev) => prev.filter((m) => m.id !== existing.id));
      }
    } else {
      const res = await fetch(`${API_BASE}/payment-methods`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": auth.token },
        body: JSON.stringify({ type: "cash", is_default: methods.length === 0 }),
      });
      const data = await res.json();
      if (data.method) setMethods((prev) => [...prev, data.method]);
    }
    setSaving(null);
  };

  // ── Set default ────────────────────────────────────────────────────────
  const setAsDefault = async (id: number) => {
    if (!auth.token) return;
    setSaving("default_" + id);
    await fetch(`${API_BASE}/payment-methods/${id}/default`, {
      method: "PUT",
      headers: { "x-auth-token": auth.token },
    }).catch(() => {});
    setMethods((prev) => prev.map((m) => ({ ...m, is_default: m.id === id })));
    setSaving(null);
  };

  // ── Add card ───────────────────────────────────────────────────────────
  const parseExpiry = (val: string) => {
    const parts = val.replace(/[^0-9/]/g, "").split("/");
    return {
      month: parseInt(parts[0] ?? "0"),
      year: parseInt(parts[1] ?? "0") + (parts[1]?.length === 2 ? 2000 : 0),
    };
  };

  const saveCard = async () => {
    if (last4.length !== 4 || !/^\d+$/.test(last4)) {
      Alert.alert("Invalid", "Enter the last 4 digits of your card.");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Required", "Enter cardholder name.");
      return;
    }
    setSaving("new_card");
    const { month, year } = parseExpiry(expiry);
    const res = await fetch(`${API_BASE}/payment-methods`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-auth-token": auth.token ?? "" },
      body: JSON.stringify({
        type: "card", brand, last4, cardholder_name: name,
        expiry_month: month, expiry_year: year, is_default: isDefault,
      }),
    });
    const data = await res.json();
    if (data.method) {
      setMethods((prev) =>
        isDefault
          ? prev.map((m) => ({ ...m, is_default: false })).concat(data.method)
          : [...prev, data.method]
      );
      setShowForm(false);
      setBrand("Visa"); setLast4(""); setName(""); setExpiry(""); setIsDefault(false);
    }
    setSaving(null);
  };

  const removeCard = (id: number) => {
    Alert.alert(t("remove"), "Remove this card?", [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("remove"), style: "destructive", onPress: async () => {
          await fetch(`${API_BASE}/payment-methods/${id}`, {
            method: "DELETE", headers: { "x-auth-token": auth.token ?? "" },
          });
          setMethods((prev) => prev.filter((m) => m.id !== id));
        },
      },
    ]);
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 40 + bottomPad }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bottomOffset={20}
    >
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <View style={[styles.hero, { paddingTop: topPad + 16, backgroundColor: "#1a1a1a" }]}>
          <Pressable
            onPress={() => { if (showForm) setShowForm(false); else router.back(); }}
            style={styles.backBtn}
          >
            <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
            <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>
              {showForm ? t("payment_methods") : t("my_account")}
            </Text>
          </Pressable>
          <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>MY ACCOUNT</Text>
          <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>
            {showForm ? t("add_card") : t("payment_methods")}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
        ) : showForm ? (
          /* ── Add card form ─────────────────────────────────────────── */
          <View style={{ padding: 16 }}>
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.formLockRow, { backgroundColor: "#F5F0EB", borderColor: "#C4956A30" }]}>
                <Feather name="lock" size={13} color={GOLD} />
                <Text style={[styles.formLockText, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
                  Only the last 4 digits are stored. No full card data is ever saved.
                </Text>
              </View>

              <Text style={[styles.fieldLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>CARD TYPE</Text>
              <View style={styles.brandRow}>
                {BRANDS.map((b) => (
                  <Pressable
                    key={b}
                    onPress={() => setBrand(b)}
                    style={[styles.brandChip, {
                      backgroundColor: brand === b ? brandColors[b] : colors.secondary,
                      borderColor: brand === b ? brandColors[b] : colors.border,
                    }]}
                  >
                    <Text style={[{
                      fontSize: 13, fontFamily: brand === b ? "Lato_700Bold" : "Lato_400Regular",
                      color: brand === b ? "#fff" : colors.foreground,
                    }]}>{b}</Text>
                  </Pressable>
                ))}
              </View>

              {[
                { label: "Last 4 Digits", value: last4, setter: setLast4, placeholder: "1234", keyboard: "number-pad" as const, maxLen: 4 },
                { label: t("cardholder_name"), value: name, setter: setName, placeholder: "As shown on card", keyboard: "default" as const, maxLen: 100 },
                { label: `${t("expiry")} (MM/YY)`, value: expiry, setter: setExpiry, placeholder: "12/27", keyboard: "numbers-and-punctuation" as const, maxLen: 5 },
              ].map((f) => (
                <View key={f.label} style={{ gap: 5 }}>
                  <Text style={[styles.fieldLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                    {f.label.toUpperCase()}
                  </Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                    <TextInput
                      value={f.value} onChangeText={f.setter} placeholder={f.placeholder}
                      keyboardType={f.keyboard} maxLength={f.maxLen}
                      placeholderTextColor={colors.mutedForeground}
                      style={[styles.input, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}
                    />
                  </View>
                </View>
              ))}

              <Pressable onPress={() => setIsDefault(!isDefault)} style={styles.checkRow}>
                <View style={[styles.checkbox, {
                  borderColor: isDefault ? "#1a1a1a" : colors.border,
                  backgroundColor: isDefault ? "#1a1a1a" : "transparent",
                }]}>
                  {isDefault && <Feather name="check" size={12} color="#fff" />}
                </View>
                <Text style={[{ fontSize: 14, fontFamily: "Lato_400Regular", color: colors.foreground }]}>
                  {t("set_default")}
                </Text>
              </Pressable>

              <Pressable
                onPress={saveCard}
                disabled={saving === "new_card"}
                style={({ pressed }) => [styles.saveBtn, { backgroundColor: "#1a1a1a", opacity: pressed || saving === "new_card" ? 0.8 : 1 }]}
              >
                {saving === "new_card"
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <>
                    <Feather name="lock" size={15} color="#fff" />
                    <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 15 }]}>Save Securely</Text>
                  </>
                }
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={{ padding: 16, gap: 20 }}>

            {/* ── Default payment banner ─────────────────────────────── */}
            {defaultMethod && (
              <View style={[styles.defaultBanner, { backgroundColor: "#C4956A12", borderColor: "#C4956A30" }]}>
                <View style={[styles.defaultDot, { backgroundColor: GOLD }]}>
                  <Feather name="check" size={11} color="#fff" />
                </View>
                <Text style={[styles.defaultBannerText, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
                  Default:{" "}
                  <Text style={[{ fontFamily: "Lato_700Bold", color: colors.foreground }]}>
                    {defaultMethod.type === "apple_pay" ? "Apple Pay" :
                     defaultMethod.type === "google_pay" ? "Google Pay" :
                     defaultMethod.type === "cash" ? "Pay at Clinic" :
                     `${defaultMethod.brand} ••••${defaultMethod.last4}`}
                  </Text>
                </Text>
              </View>
            )}

            {/* ── Digital Wallets ────────────────────────────────────── */}
            <View style={{ gap: 8 }}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>
                DIGITAL WALLETS
              </Text>
              {WALLETS.map((wallet) => {
                const active = hasWallet(wallet.type);
                const busy = saving === wallet.type;
                const isThisDefault = defaultMethod?.type === wallet.type;
                return (
                  <View
                    key={wallet.type}
                    style={[styles.walletCard, {
                      backgroundColor: active ? colors.card : colors.secondary,
                      borderColor: active ? GOLD + "50" : colors.border,
                    }]}
                  >
                    {/* Icon + info */}
                    <View style={[styles.walletIcon, {
                      backgroundColor: wallet.type === "apple_pay"
                        ? "#000"
                        : wallet.type === "google_pay"
                          ? "#fff"
                          : (active ? wallet.color + "18" : colors.background),
                      borderColor: wallet.type === "apple_pay"
                        ? "#2a2a2a"
                        : wallet.type === "google_pay"
                          ? "#e8e8e8"
                          : (active ? wallet.color + "30" : colors.border),
                    }]}>
                      {wallet.type === "apple_pay" ? (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                          <FontAwesome name="apple" size={16} color="#fff" />
                          <Text style={{
                            color: "#fff",
                            fontSize: 12,
                            fontFamily: "Lato_700Bold",
                            letterSpacing: -0.2,
                          }}>Pay</Text>
                        </View>
                      ) : wallet.type === "google_pay" ? (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 1 }}>
                          <Text style={{ color: "#4285F4", fontSize: 12, fontFamily: "Lato_700Bold" }}>G</Text>
                          <Text style={{ color: "#555", fontSize: 11, fontFamily: "Lato_400Regular" }}>Pay</Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={[styles.walletName, { color: colors.foreground, fontFamily: "Lato_700Bold" }]}>
                          {wallet.name}
                        </Text>
                        {isThisDefault && (
                          <View style={[styles.defBadge, { backgroundColor: GOLD + "20", borderColor: GOLD + "40" }]}>
                            <Text style={[{ fontSize: 9, color: GOLD, fontFamily: "Lato_700Bold" }]}>DEFAULT</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.walletSub, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>
                        {active ? "Connected · Tap to remove" : wallet.sub}
                      </Text>
                    </View>

                    {/* Actions */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      {active && !isThisDefault && (
                        <Pressable
                          onPress={() => setAsDefault(methods.find((m) => m.type === wallet.type)!.id)}
                          style={[styles.setDefaultBtn, { borderColor: GOLD }]}
                        >
                          <Text style={[{ fontSize: 10, color: GOLD, fontFamily: "Lato_700Bold" }]}>SET DEFAULT</Text>
                        </Pressable>
                      )}
                      <Pressable
                        onPress={() => toggleWallet(wallet.type)}
                        disabled={busy}
                        style={[styles.walletToggle, {
                          backgroundColor: active ? "#FF3B3015" : "#1a1a1a",
                          borderColor: active ? "#FF3B3040" : "#1a1a1a",
                        }]}
                      >
                        {busy ? (
                          <ActivityIndicator size="small" color={active ? RED : "#fff"} />
                        ) : active ? (
                          <Feather name="x" size={14} color={RED} />
                        ) : (
                          <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 12 }]}>ADD</Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* ── Saved Cards ────────────────────────────────────────── */}
            <View style={{ gap: 8 }}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>
                SAVED CARDS
              </Text>

              {cards.length === 0 ? (
                <View style={[styles.emptyCards, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Feather name="credit-card" size={28} color={colors.border} />
                  <Text style={[{ fontSize: 14, color: colors.warmGray, fontFamily: "Lato_300Light", textAlign: "center", marginTop: 8, lineHeight: 20 }]}>
                    {t("no_cards")} — save a card{"\n"}for faster booking confirmation
                  </Text>
                </View>
              ) : (
                cards.map((card) => {
                  const bc = brandColors[card.brand] ?? "#8B9B8A";
                  const isThisDefault = card.is_default;
                  return (
                    <View key={card.id} style={[styles.cardTile, { backgroundColor: "#1a1a1a" }]}>
                      {/* Top row */}
                      <View style={styles.cardTileTop}>
                        <View style={[styles.brandPill, { backgroundColor: bc }]}>
                          <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 9, letterSpacing: 0.5 }]}>
                            {card.brand.slice(0, 2).toUpperCase()}
                          </Text>
                        </View>
                        {isThisDefault && (
                          <View style={[styles.defBadge, { backgroundColor: "#C4956A25", borderColor: "#C4956A50" }]}>
                            <Text style={[{ fontSize: 9, color: GOLD, fontFamily: "Lato_700Bold" }]}>DEFAULT</Text>
                          </View>
                        )}
                        <View style={{ flex: 1 }} />
                        {!isThisDefault && (
                          <Pressable onPress={() => setAsDefault(card.id)} style={styles.setDefaultTileBtn}>
                            <Text style={[{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "Lato_400Regular" }]}>
                              Set default
                            </Text>
                          </Pressable>
                        )}
                        <Pressable onPress={() => removeCard(card.id)} style={styles.removeTileBtn}>
                          <Feather name="trash-2" size={13} color="rgba(255,255,255,0.35)" />
                        </Pressable>
                      </View>

                      {/* Card number */}
                      <Text style={[styles.cardNumber, { fontFamily: "Lato_400Regular" }]}>
                        •••• •••• •••• {card.last4}
                      </Text>

                      {/* Bottom */}
                      <View style={styles.cardTileBottom}>
                        <View>
                          <Text style={[styles.tileSmall, { fontFamily: "Lato_300Light" }]}>CARDHOLDER</Text>
                          <Text style={[styles.tileName, { fontFamily: "Lato_400Regular" }]}>{card.cardholder_name}</Text>
                        </View>
                        {card.expiry_month ? (
                          <View>
                            <Text style={[styles.tileSmall, { fontFamily: "Lato_300Light" }]}>{t("expires").toUpperCase()}</Text>
                            <Text style={[styles.tileName, { fontFamily: "Lato_400Regular" }]}>
                              {String(card.expiry_month).padStart(2, "0")}/{String(card.expiry_year).slice(-2)}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  );
                })
              )}

              {/* Add card button */}
              <Pressable
                onPress={() => setShowForm(true)}
                style={({ pressed }) => [styles.addCardBtn, { borderColor: GOLD, opacity: pressed ? 0.8 : 1 }]}
              >
                <Feather name="plus" size={16} color={GOLD} />
                <Text style={[{ color: GOLD, fontFamily: "Lato_700Bold", fontSize: 14 }]}>{t("add_card")}</Text>
              </Pressable>
            </View>

            {/* ── Pay at Clinic ──────────────────────────────────────── */}
            <View style={{ gap: 8 }}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>
                IN-CLINIC PAYMENT
              </Text>
              <Pressable
                onPress={toggleCash}
                disabled={saving === "cash"}
                style={({ pressed }) => [styles.cashCard, {
                  backgroundColor: hasCash ? colors.card : colors.secondary,
                  borderColor: hasCash ? GOLD + "50" : colors.border,
                  opacity: pressed ? 0.85 : 1,
                }]}
              >
                <View style={[styles.cashIcon, {
                  backgroundColor: hasCash ? "#C4956A18" : colors.background,
                  borderColor: hasCash ? GOLD + "30" : colors.border,
                }]}>
                  <Text style={{ fontSize: 22 }}>💵</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.walletName, { color: colors.foreground, fontFamily: "Lato_700Bold" }]}>
                    Pay at Clinic
                  </Text>
                  <Text style={[styles.walletSub, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>
                    {hasCash ? "Selected — cash, card or bank transfer at reception" : "Cash, card or bank transfer at reception"}
                  </Text>
                </View>
                {saving === "cash" ? (
                  <ActivityIndicator size="small" color={GOLD} />
                ) : (
                  <View style={[styles.toggle, {
                    backgroundColor: hasCash ? GOLD : colors.border,
                  }]}>
                    <View style={[styles.toggleKnob, { transform: [{ translateX: hasCash ? 16 : 0 }] }]} />
                  </View>
                )}
              </Pressable>
            </View>

            {/* ── Security note ──────────────────────────────────────── */}
            <View style={[styles.secureNote, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Feather name="shield" size={14} color={colors.sage} />
              <Text style={[styles.secureNoteText, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
                Your payment details are stored securely. Full card numbers are never saved.
                Actual charges are processed at the clinic or via WhatsApp invoice.
              </Text>
            </View>
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

  sectionLabel: { fontSize: 11, letterSpacing: 1.5, marginLeft: 2 },

  defaultBanner: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  defaultDot: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  defaultBannerText: { fontSize: 13 },

  // Wallets
  walletCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  walletIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, flexShrink: 0 },
  walletName: { fontSize: 15 },
  walletSub: { fontSize: 12, marginTop: 1 },
  walletToggle: { width: 44, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  setDefaultBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  defBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, borderWidth: 1 },

  // Cards
  emptyCards: { alignItems: "center", justifyContent: "center", paddingVertical: 36, borderRadius: 16, borderWidth: 1 },
  cardTile: { borderRadius: 20, padding: 20, gap: 10 },
  cardTileTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  cardNumber: { fontSize: 20, color: "#fff", letterSpacing: 3 },
  cardTileBottom: { flexDirection: "row", alignItems: "flex-end", gap: 24 },
  tileSmall: { fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, marginBottom: 2 },
  tileName: { fontSize: 13, color: "#fff" },
  setDefaultTileBtn: { padding: 4 },
  removeTileBtn: { padding: 4 },
  addCardBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50, borderWidth: 1.5, borderStyle: "dashed" },

  // Cash
  cashCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  cashIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, flexShrink: 0 },
  toggle: { width: 40, height: 24, borderRadius: 12, padding: 2, flexShrink: 0 },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff" },

  // Secure note
  secureNote: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  secureNoteText: { flex: 1, fontSize: 12, lineHeight: 18 },

  // Form
  formCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 14 },
  formLockRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: 2 },
  formLockText: { flex: 1, fontSize: 12, lineHeight: 17 },
  fieldLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 },
  brandRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  brandChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, borderWidth: 1 },
  inputWrap: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  input: { fontSize: 15 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 50 },
});
