import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator, Alert, Platform, Pressable,
  ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";

const API_BASE = `https://${process.env.EXPO_PUBLIC_API_URL}/api`;

interface Favourite {
  id: number;
  service_id: string;
  service_name: string;
  service_category: string;
  service_price: string;
  created_at: string;
}

const categoryColors: Record<string, string> = {
  "iv-therapy": "#4A7AAA",
  aesthetics: "#8A5A7A",
  laser: "#C4956A",
  body: "#5C7A6B",
  packages: "#1a1a1a",
  "home-services": "#8B9B8A",
  "home-aesthetics": "#8A5A7A",
};

export default function FavouritesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const { t } = useI18n();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!auth.token) return;
    try {
      const res = await fetch(`${API_BASE}/favourites`, {
        headers: { "x-auth-token": auth.token },
      });
      const data = await res.json();
      if (data.favourites) setFavourites(data.favourites);
    } catch {}
    setLoading(false);
  }, [auth.token]);

  useEffect(() => { load(); }, [load]);

  const remove = async (serviceId: string) => {
    if (!auth.token) return;
    await fetch(`${API_BASE}/favourites/${serviceId}`, {
      method: "DELETE",
      headers: { "x-auth-token": auth.token },
    });
    setFavourites((prev) => prev.filter((f) => f.service_id !== serviceId));
  };

  const confirmRemove = (fav: Favourite) => {
    Alert.alert(t("remove"), `Remove "${fav.service_name}" from favourites?`, [
      { text: t("cancel"), style: "cancel" },
      { text: t("remove"), style: "destructive", onPress: () => remove(fav.service_id) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.hero, { paddingTop: topPad + 16, backgroundColor: "#1a1a1a" }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
          <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>{t("my_account")}</Text>
        </Pressable>
        <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>MY ACCOUNT</Text>
        <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>{t("favourites")}</Text>
        <Text style={[styles.heroSub, { fontFamily: "Lato_300Light" }]}>{t("saved_services")}</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : favourites.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="heart" size={32} color={colors.border} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
            {t("no_favourites")}
          </Text>
          <Text style={[styles.emptySub, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
            {t("no_favourites_sub")}
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/services" as any)}
            style={[styles.browseBtn, { backgroundColor: "#1a1a1a" }]}
          >
            <Feather name="search" size={15} color="#fff" />
            <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 14 }]}>Browse Treatments</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 + bottomPad, gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.count, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>
            {favourites.length} saved {favourites.length === 1 ? "treatment" : "treatments"}
          </Text>
          {favourites.map((fav) => {
            const accent = categoryColors[fav.service_category] ?? colors.sage;
            return (
              <Pressable
                key={fav.id}
                onPress={() => router.push(`/service/${fav.service_id}` as any)}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <View style={[styles.accentBar, { backgroundColor: accent }]} />
                <View style={{ flex: 1, paddingLeft: 12 }}>
                  <Text style={[styles.cardName, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
                    {fav.service_name}
                  </Text>
                  <View style={styles.cardMeta}>
                    <View style={[styles.catBadge, { backgroundColor: `${accent}18`, borderColor: `${accent}40` }]}>
                      <Text style={[{ color: accent, fontFamily: "Lato_700Bold", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }]}>
                        {fav.service_category.replace("-", " ")}
                      </Text>
                    </View>
                    {fav.service_price ? (
                      <Text style={[styles.cardPrice, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
                        {fav.service_price}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <Pressable
                  onPress={() => confirmRemove(fav)}
                  style={[styles.removeBtn, { backgroundColor: colors.secondary }]}
                  hitSlop={8}
                >
                  <Feather name="heart" size={16} color="#FF3B30" />
                </Pressable>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 24, paddingBottom: 28 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  heroLabel: { color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 2.5, marginBottom: 4 },
  heroTitle: { color: "#fff", fontSize: 42, lineHeight: 44 },
  heroSub: { color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 24, marginTop: 8 },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  browseBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 50, marginTop: 8 },
  count: { fontSize: 13, marginBottom: 4 },
  card: { flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1, overflow: "hidden", paddingRight: 12, paddingVertical: 14 },
  accentBar: { width: 4, alignSelf: "stretch" },
  cardName: { fontSize: 20, lineHeight: 22 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 5 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  cardPrice: { fontSize: 13 },
  removeBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
