import React, { useState } from "react";
import {
  ActivityIndicator, Linking, Platform, Pressable, ScrollView,
  StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useI18n, LANGUAGES, type LangCode } from "@/context/I18nContext";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const { t, lang, changeLanguage } = useI18n();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const executeDelete = async () => {
    setDeletingAccount(true);
    setDeleteError("");
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        method: "DELETE",
        headers: { "x-auth-token": auth.token ?? "" },
      });
      if (res.ok) {
        await auth.logout();
        router.replace("/extras/profile" as any);
        return;
      }
      const data = await res.json().catch(() => ({}));
      setDeleteError(data.error || "Could not delete account. Please try again.");
    } catch {
      setDeleteError("Network error. Please check your connection.");
    }
    setDeletingAccount(false);
    setConfirmDelete(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 + bottomPad }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { paddingTop: topPad + 16, backgroundColor: "#1a1a1a" }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
            <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>{t("my_account")}</Text>
          </Pressable>
          <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>MY ACCOUNT</Text>
          <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>{t("settings")}</Text>
        </View>

        <View style={{ padding: 16, gap: 14 }}>
          {/* Language section */}
          <Text style={[styles.sectionHead, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>
            {t("select_language").toUpperCase()}
          </Text>
          <View style={[styles.langGrid, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {LANGUAGES.map((language, i) => {
              const isSelected = lang === language.code;
              return (
                <Pressable
                  key={language.code}
                  onPress={() => changeLanguage(language.code as LangCode)}
                  style={({ pressed }) => [
                    styles.langItem,
                    i % 2 !== 0 && { borderLeftWidth: 1, borderLeftColor: colors.border },
                    Math.floor(i / 2) > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                    isSelected && { backgroundColor: "#1a1a1a" },
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Text style={[styles.langFlag]}>{language.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.langNative, { color: isSelected ? "#fff" : colors.foreground, fontFamily: "Lato_700Bold" }]}>
                      {language.nativeLabel}
                    </Text>
                    <Text style={[styles.langEn, { color: isSelected ? "rgba(255,255,255,0.5)" : colors.mutedForeground, fontFamily: "Lato_300Light" }]}>
                      {language.label}
                    </Text>
                  </View>
                  {isSelected && <Feather name="check" size={14} color="#C4956A" />}
                </Pressable>
              );
            })}
          </View>

          {/* Privacy & Security */}
          <Text style={[styles.sectionHead, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>
            PRIVACY & SECURITY
          </Text>
          <View style={[styles.menuGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { icon: "shield", label: "Privacy Policy", onPress: () => Linking.openURL("https://wa.me/971586078532") },
              { icon: "file-text", label: "Terms of Service", onPress: () => Linking.openURL("https://wa.me/971586078532") },
              { icon: "bell", label: t("push_notifications"), onPress: () => {} },
            ].map((item, i) => (
              <Pressable key={i} onPress={item.onPress}
                style={({ pressed }) => [styles.menuItem, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }, { opacity: pressed ? 0.75 : 1 }]}>
                <View style={[styles.menuIcon, { backgroundColor: colors.secondary }]}>
                  <Feather name={item.icon as any} size={14} color={colors.warmGray} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}>{item.label}</Text>
                <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>

          {/* App info */}
          <View style={[styles.infoCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>App</Text>
              <Text style={[styles.infoValue, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}>drypSKin Clinic</Text>
            </View>
            <View style={[styles.infoRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>Version</Text>
              <Text style={[styles.infoValue, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}>1.0.0</Text>
            </View>
            <View style={[styles.infoRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>Location</Text>
              <Text style={[styles.infoValue, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}>Dubai Marina, UAE</Text>
            </View>
          </View>

          {/* ── Danger zone ────────────────────────────────────────────────── */}
          {auth.user && (
            <>
              <Text style={[styles.sectionHead, { color: "#FF3B30", fontFamily: "Lato_400Regular" }]}>
                {t("danger_zone").toUpperCase()}
              </Text>

              <View style={[styles.dangerCard, { backgroundColor: "#FF3B3008", borderColor: "#FF3B3030" }]}>
                <View style={styles.dangerHeader}>
                  <View style={[styles.dangerIcon, { backgroundColor: "#FF3B3015" }]}>
                    <Feather name="alert-triangle" size={18} color="#FF3B30" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.dangerTitle, { color: "#FF3B30", fontFamily: "Lato_700Bold" }]}>
                      {t("delete_account")}
                    </Text>
                    <Text style={[styles.dangerDesc, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
                      {t("delete_warning")}
                    </Text>
                  </View>
                </View>

                {deleteError ? (
                  <View style={[styles.errorBox, { backgroundColor: "#FF3B3015", borderColor: "#FF3B3040" }]}>
                    <Feather name="alert-circle" size={13} color="#FF3B30" />
                    <Text style={[styles.errorText, { color: "#FF3B30", fontFamily: "Lato_400Regular" }]}>{deleteError}</Text>
                  </View>
                ) : null}

                {!confirmDelete ? (
                  /* Step 1 — show the delete button */
                  <Pressable
                    onPress={() => { setConfirmDelete(true); setDeleteError(""); }}
                    style={({ pressed }) => [styles.deleteBtn, { borderColor: "#FF3B30", opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Feather name="trash-2" size={15} color="#FF3B30" />
                    <Text style={[{ color: "#FF3B30", fontFamily: "Lato_700Bold", fontSize: 14 }]}>
                      {t("delete_account")}
                    </Text>
                  </Pressable>
                ) : (
                  /* Step 2 — inline confirmation: Cancel / Confirm */
                  <View style={styles.confirmRow}>
                    <Pressable
                      onPress={() => { setConfirmDelete(false); setDeleteError(""); }}
                      disabled={deletingAccount}
                      style={({ pressed }) => [styles.cancelBtn, { backgroundColor: colors.secondary, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
                    >
                      <Text style={[{ color: colors.foreground, fontFamily: "Lato_700Bold", fontSize: 14 }]}>
                        {t("cancel")}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={executeDelete}
                      disabled={deletingAccount}
                      style={({ pressed }) => [styles.confirmDeleteBtn, { backgroundColor: "#FF3B30", opacity: pressed || deletingAccount ? 0.75 : 1 }]}
                    >
                      {deletingAccount ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <Feather name="trash-2" size={14} color="#fff" />
                          <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 14 }]}>
                            {t("confirm_delete")}
                          </Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                )}
              </View>
            </>
          )}
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
  sectionHead: { fontSize: 11, letterSpacing: 1.5, marginLeft: 4 },
  langGrid: { borderRadius: 16, borderWidth: 1, overflow: "hidden", flexDirection: "row", flexWrap: "wrap" },
  langItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, width: "50%" },
  langFlag: { fontSize: 20 },
  langNative: { fontSize: 14 },
  langEn: { fontSize: 11, marginTop: 1 },
  menuGroup: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  menuIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 14 },
  infoCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13 },
  dangerCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  dangerHeader: { flexDirection: "row", gap: 12 },
  dangerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  dangerTitle: { fontSize: 15 },
  dangerDesc: { fontSize: 12, lineHeight: 17, marginTop: 3 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 10, borderWidth: 1 },
  errorText: { flex: 1, fontSize: 13, lineHeight: 17 },
  deleteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 50, borderWidth: 1.5 },
  confirmRow: { flexDirection: "row", gap: 10 },
  cancelBtn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 13, borderRadius: 50, borderWidth: 1.5 },
  confirmDeleteBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 50 },
});
