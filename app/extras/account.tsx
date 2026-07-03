import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import AlertComponent from "@/components/AlertComponent";

const GOLD = "#C4956A";
const CHARCOAL = "#1a1a1a";

interface MenuItem {
  icon: string;
  labelKey: string;
  route: string;
  badge?: string;
  destructive?: boolean;
  accent?: string;
}

const SECTIONS: { titleKey?: string; items: MenuItem[] }[] = [
  {
    titleKey: undefined,
    items: [
      { icon: "user", labelKey: "profile", route: "/extras/profile", accent: GOLD },
    ],
  },
  {
    titleKey: "saved_services",
    items: [
      { icon: "heart", labelKey: "favourites", route: "/extras/account-favourites" },
      { icon: "map-pin", labelKey: "addresses", route: "/extras/account-addresses" },
      { icon: "credit-card", labelKey: "payment_methods", route: "/extras/account-payments" },
    ],
  },
  {
    titleKey: "referral_credits",
    items: [
      { icon: "gift", labelKey: "referral_credits", route: "/extras/account-referral", accent: "#8B9B8A" },
      { icon: "tag", labelKey: "gift_card", route: "/extras/account-giftcard", accent: GOLD },
    ],
  },
  {
    titleKey: "get_help",
    items: [
      { icon: "help-circle", labelKey: "get_help", route: "/extras/account-help" },
      { icon: "message-circle", labelKey: "contact_us", route: "/extras/account-contact" },
    ],
  },
  {
    titleKey: "settings",
    items: [
      { icon: "settings", labelKey: "settings", route: "/extras/account-settings" },
    ],
  },
];

export default function AccountScreen() {

  const [showAlert, setShowAlert] = useState(false);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const { t, isRTL } = useI18n();

  const handleAlert = () => {
    setShowAlert(prev => !prev);
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const initials = (auth.user?.name || auth.user?.email || "?")
    .split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  const handleSignOut = () => {
    if (Platform.OS === "web") {
      auth.logout();
    } else {
      handleAlert()
    }
  };

  if (!auth.token) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.hero, { paddingTop: topPad + 16, backgroundColor: CHARCOAL }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
            <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Back</Text>
          </Pressable>
          <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>{t("my_account")}</Text>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Feather name="user" size={48} color={colors.border} />
          <Text style={[{ fontSize: 24, marginTop: 16, color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
            {t("sign_in")}
          </Text>
          <Text style={[{ fontSize: 14, marginTop: 8, color: colors.warmGray, fontFamily: "Lato_300Light", textAlign: "center" }]}>
            Create an account or sign in to access your personal wellness account
          </Text>
          <Pressable
            onPress={() => router.push("/extras/profile" as any)}
            style={[styles.signInBtn, { backgroundColor: CHARCOAL, marginTop: 24 }]}
          >
            <Feather name="log-in" size={16} color="#fff" />
            <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 15 }]}>{t("sign_in")} / {t("create_account")}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 + bottomPad }}
      >
        {/* Hero header */}
        <View style={[styles.hero, { paddingTop: topPad + 16, backgroundColor: CHARCOAL }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
            <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Back</Text>
          </Pressable>
          <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>PRIVATE WELLNESS CLUB</Text>
          <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>{t("my_account")}</Text>
        </View>

        {/* User card */}
        <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: GOLD }]}>
            <Text style={[styles.initials, { fontFamily: "Cormorant_700Bold" }]}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              {auth.user?.name || "Wellness Member"}
            </Text>
            <Text style={[styles.userEmail, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
              {auth.user?.email}
            </Text>
            <View style={[styles.memberBadge, { backgroundColor: `${GOLD}18`, borderColor: `${GOLD}40` }]}>
              <Feather name="star" size={10} color={GOLD} />
              <Text style={[styles.memberText, { color: GOLD, fontFamily: "Lato_700Bold" }]}>
                {t("wellness_member")}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/extras/profile" as any)}
            style={[styles.editChip, { borderColor: colors.border }]}
          >
            <Feather name="edit-2" size={13} color={colors.warmGray} />
          </Pressable>
        </View>

        {/* Menu sections */}
        <View style={{ padding: 16, gap: 8 }}>
          {SECTIONS.map((section, si) => (
            <View key={si} style={{ gap: 4 }}>
              {section.titleKey && (
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>
                  {t(section.titleKey).toUpperCase()}
                </Text>
              )}
              <View style={[styles.menuGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {section.items.map((item, ii) => (
                  <Pressable
                    key={item.route}
                    onPress={() => router.push(item.route as any)}
                    style={({ pressed }) => [
                      styles.menuItem,
                      ii < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                      { opacity: pressed ? 0.75 : 1 },
                    ]}
                  >
                    <View style={[styles.menuIcon, { backgroundColor: item.destructive ? "#FF3B3010" : colors.secondary }]}>
                      <Feather
                        name={item.icon as any}
                        size={16}
                        color={item.destructive ? "#FF3B30" : (item.accent ?? colors.warmGray)}
                      />
                    </View>
                    <Text style={[
                      styles.menuLabel,
                      {
                        color: item.destructive ? "#FF3B30" : colors.foreground,
                        fontFamily: "Lato_400Regular",
                        textAlign: isRTL ? "right" : "left",
                      },
                    ]}>
                      {t(item.labelKey)}
                    </Text>
                    <Feather
                      name={isRTL ? "chevron-left" : "chevron-right"}
                      size={16}
                      color={colors.mutedForeground}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          {/* Sign out */}
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [styles.signOutBtn, { borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
          >
            <Feather name="log-out" size={16} color="#FF3B30" />
            <Text style={[{ color: "#FF3B30", fontFamily: "Lato_400Regular", fontSize: 15 }]}>
              {t("sign_out")}
            </Text>
          </Pressable>

          <AlertComponent
            visible={showAlert}
            icon={<Feather name="log-out" size={35} color="#FF3B30" />}
            message={t("Are you sure you want to sign out?")}
            onConfirm={() => {
              auth.logout();
              handleAlert();
            }}
            onCancel={handleAlert}
          />

          <View style={[styles.footerNote, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="shield" size={12} color={colors.sage} />
            <Text style={[{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 11, flex: 1, lineHeight: 16 }]}>
              Your data is encrypted and stored securely. We never share your personal information.
            </Text>
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
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    margin: 16,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  initials: { color: "#fff", fontSize: 24 },
  userName: { fontSize: 22, lineHeight: 24 },
  userEmail: { fontSize: 13, marginTop: 1 },
  memberBadge: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, marginTop: 6 },
  memberText: { fontSize: 11 },
  editChip: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  sectionLabel: { fontSize: 11, letterSpacing: 1.5, marginLeft: 4, marginTop: 8, marginBottom: 2 },
  menuGroup: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  menuIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 15 },
  signOutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50, borderWidth: 1, marginTop: 8 },
  footerNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 8 },
  signInBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 50 },
});
