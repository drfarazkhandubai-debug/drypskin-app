import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

interface Address {
  id: number;
  label: string;
  line1: string;
  line2: string;
  area: string;
  city: string;
  instructions: string;
  is_default: boolean;
}

const LABELS = ["Home", "Work", "Hotel", "Other"];
const LABEL_ICONS: Record<string, string> = { Home: "home", Work: "briefcase", Hotel: "shield", Other: "map-pin" };

export default function AddressesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const { t } = useI18n();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [label, setLabel] = useState("Home");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("Dubai");
  const [instructions, setInstructions] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const load = useCallback(async () => {
    if (!auth.token) return;
    try {
      const res = await fetch(`${API_BASE}/addresses`, { headers: { "x-auth-token": auth.token } });
      const data = await res.json();
      if (data.addresses) setAddresses(data.addresses);
    } catch {}
    setLoading(false);
  }, [auth.token]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setLabel("Home"); setLine1(""); setLine2(""); setArea(""); setCity("Dubai"); setInstructions(""); setIsDefault(false); setEditId(null); };

  const openEdit = (a: Address) => {
    setLabel(a.label); setLine1(a.line1); setLine2(a.line2); setArea(a.area);
    setCity(a.city); setInstructions(a.instructions); setIsDefault(a.is_default);
    setEditId(a.id); setShowForm(true);
  };

  const save = async () => {
    if (!line1.trim()) { Alert.alert("Required", "Please enter an address."); return; }
    setSaving(true);
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `${API_BASE}/addresses/${editId}` : `${API_BASE}/addresses`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "x-auth-token": auth.token ?? "" },
        body: JSON.stringify({ label, line1, line2, area, city, instructions, is_default: isDefault }),
      });
      const data = await res.json();
      if (data.address) {
        setAddresses((prev) =>
          editId ? prev.map((a) => (a.id === editId ? data.address : (isDefault ? { ...a, is_default: false } : a)))
            : (isDefault ? prev.map((a) => ({ ...a, is_default: false })).concat(data.address) : [...prev, data.address])
        );
      }
      setShowForm(false); resetForm();
    } catch {}
    setSaving(false);
  };

  const remove = async (id: number) => {
    Alert.alert(t("remove"), "Remove this address?", [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("remove"), style: "destructive", onPress: async () => {
          await fetch(`${API_BASE}/addresses/${id}`, { method: "DELETE", headers: { "x-auth-token": auth.token ?? "" } });
          setAddresses((prev) => prev.filter((a) => a.id !== id));
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 + bottomPad }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { paddingTop: topPad + 16, backgroundColor: "#1a1a1a" }]}>
          <Pressable onPress={() => { if (showForm) { setShowForm(false); resetForm(); } else router.back(); }} style={styles.backBtn}>
            <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
            <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>{showForm ? t("addresses") : t("my_account")}</Text>
          </Pressable>
          <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>MY ACCOUNT</Text>
          <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>{showForm ? (editId ? t("edit") : t("add_address")) : t("addresses")}</Text>
        </View>

        <View style={{ padding: 16, gap: 12 }}>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : showForm ? (
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Label selector */}
              <Text style={[styles.fieldLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>{t("label_home").toUpperCase()}</Text>
              <View style={styles.labelRow}>
                {LABELS.map((lbl) => (
                  <Pressable key={lbl} onPress={() => setLabel(lbl)}
                    style={[styles.labelChip, { backgroundColor: label === lbl ? "#1a1a1a" : colors.secondary, borderColor: label === lbl ? "#1a1a1a" : colors.border }]}>
                    <Feather name={LABEL_ICONS[lbl] as any} size={12} color={label === lbl ? "#fff" : colors.warmGray} />
                    <Text style={[{ fontSize: 12, fontFamily: label === lbl ? "Lato_700Bold" : "Lato_400Regular", color: label === lbl ? "#fff" : colors.foreground }]}>{lbl}</Text>
                  </Pressable>
                ))}
              </View>

              {[
                { key: "line1", value: line1, setter: setLine1, label: t("address_line1"), placeholder: "Building, Street", required: true },
                { key: "line2", value: line2, setter: setLine2, label: t("address_line2"), placeholder: "Apartment, Unit, Floor" },
                { key: "area", value: area, setter: setArea, label: t("area"), placeholder: "Dubai Marina, JBR, DIFC..." },
                { key: "city", value: city, setter: setCity, label: t("city"), placeholder: "Dubai" },
                { key: "instructions", value: instructions, setter: setInstructions, label: t("special_instructions"), placeholder: "Ring doorbell, Gate code..." },
              ].map((f) => (
                <View key={f.key} style={{ gap: 5 }}>
                  <Text style={[styles.fieldLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>{f.label}</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                    <TextInput value={f.value} onChangeText={f.setter} placeholder={f.placeholder} placeholderTextColor={colors.mutedForeground}
                      style={[styles.input, { color: colors.foreground, fontFamily: "Lato_400Regular" }]} />
                  </View>
                </View>
              ))}

              <Pressable onPress={() => setIsDefault(!isDefault)} style={styles.defaultRow}>
                <View style={[styles.checkbox, { borderColor: isDefault ? "#1a1a1a" : colors.border, backgroundColor: isDefault ? "#1a1a1a" : "transparent" }]}>
                  {isDefault && <Feather name="check" size={12} color="#fff" />}
                </View>
                <Text style={[{ fontSize: 14, fontFamily: "Lato_400Regular", color: colors.foreground }]}>{t("set_default")}</Text>
              </Pressable>

              <Pressable onPress={save} disabled={saving}
                style={({ pressed }) => [styles.saveBtn, { backgroundColor: "#1a1a1a", opacity: pressed || saving ? 0.8 : 1 }]}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : (
                  <>
                    <Feather name="check" size={16} color="#fff" />
                    <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 15 }]}>{t("save")}</Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : (
            <>
              {addresses.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="map-pin" size={36} color={colors.border} />
                  <Text style={[{ fontSize: 22, marginTop: 12, color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{t("no_addresses")}</Text>
                  <Text style={[{ fontSize: 14, marginTop: 6, color: colors.warmGray, fontFamily: "Lato_300Light", textAlign: "center" }]}>
                    Save your home, work or hotel address for faster home service bookings
                  </Text>
                </View>
              ) : (
                addresses.map((addr) => (
                  <View key={addr.id} style={[styles.addrCard, { backgroundColor: colors.card, borderColor: addr.is_default ? "#C4956A40" : colors.border }]}>
                    <View style={[styles.addrIconWrap, { backgroundColor: addr.is_default ? "#C4956A18" : colors.secondary }]}>
                      <Feather name={LABEL_ICONS[addr.label] as any ?? "map-pin"} size={16} color={addr.is_default ? "#C4956A" : colors.warmGray} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.addrHeader}>
                        <Text style={[styles.addrLabel, { color: colors.foreground, fontFamily: "Lato_700Bold" }]}>{addr.label}</Text>
                        {addr.is_default && (
                          <View style={[styles.defaultBadge, { backgroundColor: "#C4956A18", borderColor: "#C4956A40" }]}>
                            <Text style={[{ fontSize: 10, color: "#C4956A", fontFamily: "Lato_700Bold" }]}>{t("default").toUpperCase()}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.addrLine, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}>{addr.line1}</Text>
                      {addr.line2 ? <Text style={[styles.addrLine, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>{addr.line2}</Text> : null}
                      <Text style={[styles.addrLine, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>{[addr.area, addr.city].filter(Boolean).join(", ")}</Text>
                      {addr.instructions ? <Text style={[styles.addrInstr, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>{addr.instructions}</Text> : null}
                    </View>
                    <View style={styles.addrActions}>
                      <Pressable onPress={() => openEdit(addr)} style={[styles.addrActionBtn, { backgroundColor: colors.secondary }]}>
                        <Feather name="edit-2" size={13} color={colors.warmGray} />
                      </Pressable>
                      <Pressable onPress={() => remove(addr.id)} style={[styles.addrActionBtn, { backgroundColor: "#FF3B3010" }]}>
                        <Feather name="trash-2" size={13} color="#FF3B30" />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
              <Pressable onPress={() => setShowForm(true)}
                style={({ pressed }) => [styles.addBtn, { borderColor: "#C4956A", opacity: pressed ? 0.8 : 1 }]}>
                <Feather name="plus" size={16} color="#C4956A" />
                <Text style={[{ color: "#C4956A", fontFamily: "Lato_700Bold", fontSize: 14 }]}>{t("add_address")}</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 24, paddingBottom: 28 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  heroLabel: { color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 2.5, marginBottom: 4 },
  heroTitle: { color: "#fff", fontSize: 40, lineHeight: 44 },
  formCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 14 },
  fieldLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 },
  labelRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  labelChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 50, borderWidth: 1 },
  inputWrap: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  input: { fontSize: 15 },
  defaultRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 50, marginTop: 4 },
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 4 },
  addrCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  addrIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 2 },
  addrHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  addrLabel: { fontSize: 15 },
  defaultBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, borderWidth: 1 },
  addrLine: { fontSize: 13, lineHeight: 19 },
  addrInstr: { fontSize: 12, marginTop: 3 },
  addrActions: { gap: 6 },
  addrActionBtn: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50, borderWidth: 1.5, borderStyle: "dashed" },
});
