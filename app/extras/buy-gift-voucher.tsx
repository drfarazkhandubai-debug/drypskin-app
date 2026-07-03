import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const GOLD = "#C4956A";
const CHARCOAL = "#1a1a1a";
const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
const PRESET_AMOUNTS = [100, 250, 500, 1000];

function formatCardNumber(val: string) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(val: string) {
  const d = val.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

// ─── Beautiful Gift Certificate Modal ────────────────────────────────────────
function CertificateModal({
  visible,
  amount,
  code,
  recipientName,
  message,
  expiresAt,
  onShare,
  onDone,
}: {
  visible: boolean;
  amount: number;
  code: string;
  recipientName: string;
  message: string;
  expiresAt: string;
  onShare: () => void;
  onDone: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const expiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const copyCode = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ScrollView
        style={{ flex: 1, backgroundColor: "#0e0e0e" }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Certificate card ─────────────────────────────────────────── */}
        <View style={cert.card}>
          {/* Header band */}
          <View style={cert.headerBand}>
            <View style={cert.goldLine} />
            <View style={cert.headerContent}>
              <Text style={cert.eyebrow}>✦  GIFT CERTIFICATE  ✦</Text>
              <Text style={cert.brandName}>drypSKin</Text>
              <Text style={cert.brandSub}>PRIVATE WELLNESS CLUB · DUBAI MARINA</Text>
            </View>
            <View style={cert.goldLine} />
          </View>

          {/* Amount */}
          <View style={cert.amountSection}>
            <Text style={cert.amountLabel}>VOUCHER VALUE</Text>
            <Text style={cert.amountValue}>AED {amount}</Text>
            {recipientName ? (
              <Text style={cert.forText}>For <Text style={{ color: GOLD }}>{recipientName}</Text></Text>
            ) : null}
            {message ? (
              <Text style={cert.messageText}>"{message}"</Text>
            ) : null}
          </View>

          {/* Divider */}
          <View style={cert.dividerRow}>
            <View style={cert.dividerLine} />
            <Feather name="gift" size={16} color={GOLD} />
            <View style={cert.dividerLine} />
          </View>

          {/* Code box */}
          <View style={cert.codeSection}>
            <Text style={cert.codeLabel}>REDEMPTION CODE</Text>
            <Text style={cert.codeValue}>{code}</Text>
            <Text style={cert.validText}>Valid until {expiry}</Text>
          </View>

          {/* Divider */}
          <View style={cert.dividerRow}>
            <View style={cert.dividerLine} />
            <Feather name="map-pin" size={14} color={`${GOLD}60`} />
            <View style={cert.dividerLine} />
          </View>

          {/* Footer of certificate */}
          <View style={cert.certFooter}>
            <Text style={cert.certFooterText}>Marinascape Mall · Dubai Marina · UAE</Text>
            <Text style={cert.certFooterSub}>Redeem in-app or present at the clinic</Text>
          </View>
        </View>

        {/* ── How to redeem ─────────────────────────────────────────────── */}
        <View style={cert.stepsBox}>
          <Text style={cert.stepsTitle}>HOW TO REDEEM</Text>
          {[
            "Open the drypSKin app",
            "Go to Account → Gift Card",
            'Tap "Redeem a Code" and enter the code above',
            "Your balance is added instantly to your wallet",
          ].map((s, i) => (
            <View key={i} style={cert.stepRow}>
              <View style={cert.stepNum}>
                <Text style={cert.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={cert.stepText}>{s}</Text>
            </View>
          ))}
        </View>

        {/* ── Email note ────────────────────────────────────────────────── */}
        <View style={cert.emailNote}>
          <Feather name="mail" size={14} color={GOLD} />
          <Text style={cert.emailNoteText}>
            A beautiful gift certificate has been sent to your email address.
          </Text>
        </View>

        {/* ── Action buttons ────────────────────────────────────────────── */}
        <View style={cert.actions}>
          <Pressable onPress={copyCode} style={({ pressed }) => [cert.btn, cert.btnSecondary, { opacity: pressed ? 0.8 : 1 }]}>
            <Feather name={copied ? "check" : "copy"} size={16} color={GOLD} />
            <Text style={[cert.btnText, { color: GOLD }]}>{copied ? "Copied!" : "Copy Code"}</Text>
          </Pressable>
          <Pressable onPress={onShare} style={({ pressed }) => [cert.btn, { backgroundColor: GOLD, opacity: pressed ? 0.85 : 1 }]}>
            <Feather name="share-2" size={16} color="#fff" />
            <Text style={[cert.btnText, { color: "#fff" }]}>Share Certificate</Text>
          </Pressable>
          <Pressable onPress={onDone} style={({ pressed }) => [cert.btn, cert.btnDone, { opacity: pressed ? 0.8 : 1 }]}>
            <Text style={[cert.btnText, { color: "rgba(255,255,255,0.7)" }]}>Done</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function BuyGiftVoucherScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Form state
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [cardName, setCardName] = useState(auth.user?.name ?? "");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Certificate state
  const [certVisible, setCertVisible] = useState(false);
  const [purchasedCode, setPurchasedCode] = useState("");
  const [purchasedAmount, setPurchasedAmount] = useState(0);
  const [purchasedExpiry, setPurchasedExpiry] = useState("");

  const finalAmount = selectedAmount ?? (customAmount ? parseInt(customAmount, 10) : null);

  const handlePurchase = async () => {
    if (!finalAmount || finalAmount < 50) {
      Alert.alert("Amount Required", "Please select or enter a minimum amount of AED 50.");
      return;
    }
    if (!cardName.trim()) { Alert.alert("Required", "Please enter the cardholder name."); return; }
    const cleanCard = cardNumber.replace(/\s/g, "");
    if (cleanCard.length < 13) { Alert.alert("Invalid Card", "Please enter a valid card number."); return; }
    if (expiry.length < 5) { Alert.alert("Invalid Expiry", "Please enter a valid expiry date (MM/YY)."); return; }
    if (cvv.length < 3) { Alert.alert("Invalid CVV", "Please enter a valid CVV."); return; }

    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const res = await fetch(`${API_BASE}/gift-cards/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": auth.token ?? "" },
        body: JSON.stringify({
          amount: finalAmount,
          recipient_name: recipientName || undefined,
          message: message || undefined,
          buyer_name: cardName,
          buyer_email: auth.user?.email,
        }),
      });
      const data = await res.json();
      if (data.error) {
        Alert.alert("Purchase Failed", data.error);
      } else {
        setPurchasedCode(data.code);
        setPurchasedAmount(data.amount);
        setPurchasedExpiry(data.expires_at);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCertVisible(true);
      }
    } catch {
      Alert.alert("Connection Error", "Please check your connection and try again.");
    }
    setSubmitting(false);
  };

  const handleShare = async () => {
    const expiry = purchasedExpiry
      ? new Date(purchasedExpiry).toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" })
      : "";
    const text = [
      "🎁 drypSKin Gift Certificate",
      "",
      `Voucher Value: AED ${purchasedAmount}`,
      recipientName ? `For: ${recipientName}` : null,
      message ? `"${message}"` : null,
      "",
      `Redemption Code: ${purchasedCode}`,
      `Valid until: ${expiry}`,
      "",
      "Redeem via the drypSKin app:",
      "Account → Gift Card → Redeem a Code",
      "",
      "Marinascape Mall · Dubai Marina · UAE",
    ].filter(Boolean).join("\n");
    await Share.share({ message: text, title: "drypSKin Gift Certificate" });
  };

  const handleDone = () => {
    setCertVisible(false);
    router.replace("/extras/account-giftcard" as any);
  };

  return (
    <>
      <CertificateModal
        visible={certVisible}
        amount={purchasedAmount}
        code={purchasedCode}
        recipientName={recipientName}
        message={message}
        expiresAt={purchasedExpiry}
        onShare={handleShare}
        onDone={handleDone}
      />

      <KeyboardAwareScrollView
          contentContainerStyle={{ paddingBottom: 40 + bottomPad }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bottomOffset={20}
        >
          {/* ── Header ──────────────────────────────────────────────────── */}
          <View style={[styles.hero, { paddingTop: topPad + 16 }]}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
            </Pressable>
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowDot} />
              <Text style={[styles.eyebrowText, { fontFamily: "Lato_700Bold" }]}>GIFT VOUCHERS</Text>
            </View>
            <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>Buy a{"\n"}Gift Voucher</Text>
            <Text style={[styles.heroSub, { fontFamily: "Lato_300Light" }]}>
              Send the gift of wellness to someone special
            </Text>
            <View style={styles.goldRule} />
          </View>

          <View style={{ padding: 16, gap: 16 }}>
            {/* ── Amount ──────────────────────────────────────────────── */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
                Select Amount
              </Text>
              <View style={styles.amountGrid}>
                {PRESET_AMOUNTS.map((amt) => (
                  <Pressable
                    key={amt}
                    onPress={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                    style={({ pressed }) => [
                      styles.amountChip,
                      {
                        backgroundColor: selectedAmount === amt ? GOLD : colors.secondary,
                        borderColor: selectedAmount === amt ? GOLD : colors.border,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.amountChipText, { fontFamily: "Cormorant_700Bold", color: selectedAmount === amt ? "#fff" : colors.foreground }]}>
                      AED {amt}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: selectedAmount === null && customAmount ? GOLD : colors.border }]}>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Lato_400Regular", fontSize: 15 }}>AED</Text>
                <TextInput
                  value={customAmount}
                  onChangeText={(v) => { setCustomAmount(v.replace(/\D/g, "")); setSelectedAmount(null); }}
                  placeholder="Custom amount (min. 50)"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  style={[styles.inputField, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}
                />
              </View>
              {finalAmount !== null && finalAmount >= 50 && (
                <View style={[styles.amountConfirm, { backgroundColor: `${GOLD}12`, borderColor: `${GOLD}40` }]}>
                  <Feather name="check-circle" size={14} color={GOLD} />
                  <Text style={{ color: GOLD, fontFamily: "Lato_700Bold", fontSize: 13 }}>
                    AED {finalAmount} gift voucher selected
                  </Text>
                </View>
              )}
            </View>

            {/* ── Recipient (optional) ────────────────────────────────── */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
                Recipient Details
              </Text>
              <Text style={{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 12, marginTop: -6 }}>
                Optional — include a personal touch
              </Text>
              <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border, marginTop: 4 }]}>
                <Feather name="user" size={16} color={colors.mutedForeground} />
                <TextInput
                  value={recipientName}
                  onChangeText={setRecipientName}
                  placeholder="Recipient name (e.g. Sarah)"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.inputField, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}
                />
              </View>
              <View style={[styles.messageBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Personal message (e.g. Happy Birthday! Enjoy some well-deserved care.)"
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  numberOfLines={3}
                  style={[styles.messageField, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}
                />
              </View>
            </View>

            {/* ── Card Details ─────────────────────────────────────────── */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.sectionTitleRow}>
                <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
                  Payment Details
                </Text>
                <View style={styles.secureTag}>
                  <Feather name="lock" size={10} color={GOLD} />
                  <Text style={[styles.secureText, { fontFamily: "Lato_700Bold" }]}>SECURE</Text>
                </View>
              </View>

              <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="user" size={16} color={colors.mutedForeground} />
                <TextInput
                  value={cardName}
                  onChangeText={setCardName}
                  placeholder="Cardholder name"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="words"
                  style={[styles.inputField, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}
                />
              </View>

              <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="credit-card" size={16} color={colors.mutedForeground} />
                <TextInput
                  value={cardNumber}
                  onChangeText={(v) => setCardNumber(formatCardNumber(v))}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  maxLength={19}
                  style={[styles.inputField, { color: colors.foreground, fontFamily: "Lato_700Bold", letterSpacing: 2 }]}
                />
              </View>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={[styles.inputRow, { flex: 1, backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Feather name="calendar" size={16} color={colors.mutedForeground} />
                  <TextInput
                    value={expiry}
                    onChangeText={(v) => setExpiry(formatExpiry(v))}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="number-pad"
                    maxLength={5}
                    style={[styles.inputField, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}
                  />
                </View>
                <View style={[styles.inputRow, { flex: 1, backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Feather name="shield" size={16} color={colors.mutedForeground} />
                  <TextInput
                    value={cvv}
                    onChangeText={(v) => setCvv(v.replace(/\D/g, "").slice(0, 4))}
                    placeholder="CVV"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={4}
                    style={[styles.inputField, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}
                  />
                </View>
              </View>

              <View style={styles.cardsRow}>
                {["Visa", "Mastercard", "Amex", "Apple Pay"].map((c) => (
                  <View key={c} style={[styles.cardTag, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                    <Text style={{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 10 }}>{c}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── Purchase button ─────────────────────────────────────── */}
            <Pressable
              onPress={handlePurchase}
              disabled={submitting}
              style={({ pressed }) => [styles.purchaseBtn, { backgroundColor: GOLD, opacity: pressed || submitting ? 0.8 : 1 }]}
            >
              <Feather name="gift" size={18} color="#fff" />
              <Text style={[styles.purchaseBtnText, { fontFamily: "Lato_700Bold" }]}>
                {submitting ? "Processing…" : `Purchase${finalAmount ? ` · AED ${finalAmount}` : ""}`}
              </Text>
            </Pressable>

            {/* Note */}
            <View style={[styles.note, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Feather name="info" size={13} color={colors.mutedForeground} />
              <Text style={{ flex: 1, color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 12, lineHeight: 17 }}>
                A unique gift code and beautiful certificate will be generated instantly and emailed to you. The recipient can redeem it directly in the app.
              </Text>
            </View>
          </View>
        </KeyboardAwareScrollView>
    </>
  );
}

// ─── Certificate styles ───────────────────────────────────────────────────────
const cert = StyleSheet.create({
  card: { margin: 20, borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: `${GOLD}30` },
  headerBand: { backgroundColor: CHARCOAL, paddingVertical: 32, paddingHorizontal: 24, alignItems: "center", gap: 16 },
  goldLine: { height: 1, width: "100%", backgroundColor: `${GOLD}40` },
  headerContent: { alignItems: "center", gap: 4 },
  eyebrow: { color: GOLD, fontSize: 10, letterSpacing: 3, fontWeight: "700" },
  brandName: { color: "#fff", fontSize: 44, fontFamily: "Cormorant_700Bold" as any },
  brandSub: { color: "rgba(255,255,255,0.35)", fontSize: 9, letterSpacing: 2.5 },
  amountSection: { backgroundColor: CHARCOAL, paddingHorizontal: 24, paddingBottom: 28, alignItems: "center", gap: 6 },
  amountLabel: { color: "rgba(255,255,255,0.35)", fontSize: 9, letterSpacing: 2.5 },
  amountValue: { color: GOLD, fontSize: 72, lineHeight: 74, fontFamily: "Cormorant_700Bold" as any },
  forText: { color: "rgba(255,255,255,0.6)", fontSize: 15, fontFamily: "Lato_300Light" as any },
  messageText: { color: "rgba(255,255,255,0.45)", fontSize: 13, fontStyle: "italic", textAlign: "center", paddingHorizontal: 16, fontFamily: "Lato_300Light" as any },
  dividerRow: { backgroundColor: CHARCOAL, flexDirection: "row", alignItems: "center", paddingHorizontal: 24, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: `${GOLD}25` },
  codeSection: { backgroundColor: CHARCOAL, paddingHorizontal: 24, paddingVertical: 24, alignItems: "center", gap: 8 },
  codeLabel: { color: "rgba(255,255,255,0.35)", fontSize: 9, letterSpacing: 2.5 },
  codeValue: { color: GOLD, fontSize: 28, letterSpacing: 6, fontWeight: "700", fontFamily: "Lato_700Bold" as any },
  validText: { color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: 0.5 },
  certFooter: { backgroundColor: "#131313", paddingVertical: 16, alignItems: "center", gap: 3 },
  certFooterText: { color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: 1.5 },
  certFooterSub: { color: "rgba(255,255,255,0.2)", fontSize: 9, letterSpacing: 1 },
  stepsBox: { marginHorizontal: 20, backgroundColor: "#181818", borderRadius: 16, padding: 20, gap: 12, borderWidth: 1, borderColor: "#2a2a2a" },
  stepsTitle: { color: "rgba(255,255,255,0.35)", fontSize: 9, letterSpacing: 2, marginBottom: 4 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: `${GOLD}25`, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  stepNumText: { color: GOLD, fontSize: 11, fontWeight: "700" },
  stepText: { flex: 1, color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 18 },
  emailNote: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginHorizontal: 20, marginTop: 12, backgroundColor: `${GOLD}10`, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: `${GOLD}25` },
  emailNoteText: { flex: 1, color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 17 },
  actions: { marginHorizontal: 20, marginTop: 20, gap: 10 },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 50 },
  btnSecondary: { backgroundColor: "#1e1e1e", borderWidth: 1, borderColor: `${GOLD}60` },
  btnDone: { backgroundColor: "transparent" },
  btnText: { fontSize: 15, fontWeight: "600" },
});

// ─── Form styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  hero: { paddingHorizontal: 24, paddingBottom: 24, backgroundColor: CHARCOAL },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  eyebrowDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GOLD },
  eyebrowText: { color: GOLD, fontSize: 9, letterSpacing: 2.5 },
  heroTitle: { color: "#fff", fontSize: 38, lineHeight: 42, marginBottom: 6 },
  heroSub: { color: "rgba(255,255,255,0.5)", fontSize: 13 },
  goldRule: { height: 1, backgroundColor: GOLD, opacity: 0.25, marginTop: 20, marginHorizontal: -24 },
  section: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 12 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 24 },
  secureTag: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: `${GOLD}14`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  secureText: { color: GOLD, fontSize: 8, letterSpacing: 1.5 },
  amountGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  amountChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 50, borderWidth: 1, minWidth: "45%" as any, alignItems: "center" },
  amountChipText: { fontSize: 20 },
  amountConfirm: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, padding: 10 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14 },
  inputField: { flex: 1, fontSize: 15 },
  messageBox: { borderRadius: 14, borderWidth: 1, padding: 14 },
  messageField: { fontSize: 14, lineHeight: 20, minHeight: 64 },
  cardsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  cardTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  purchaseBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18, borderRadius: 50 },
  purchaseBtnText: { color: "#fff", fontSize: 16 },
  note: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "flex-start" },
});
