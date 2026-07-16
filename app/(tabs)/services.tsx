import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useI18n } from "@/context/I18nContext";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
const GOLD = "#C4956A";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  count: number;
}

interface Service {
  id: string;
  category_id: string;
  category_name: string;
  subcategory: string;
  name: string;
  short_desc: string;
  full_desc: string;
  original_price: number | null;
  price: number | null;
  price_display: string;
  price_note: string;
  duration: string;
  icon: string;
  benefits: string[];
  is_popular: boolean;
}

const SUBCATEGORY_LABELS: Record<string, string> = {
  hydrafacials: "Hydrafacials",
  peels: "Peels",
  botox: "Botox",
  fillers: "Fillers",
  "bio-stimulators": "Bio-Stimulators",
  hifu: "HIFU",
  morpheus: "Morpheus 8",
  lipozero: "Lipozero",
  slimming: "Slimming",
  fotona: "Fotona",
  resurfacing: "Resurfacing",
  bbl: "BBL",
  removal: "Removal",
  venus: "Venus Packages",
};

const CAT_ICONS: Record<string, string> = {
  all: "grid",
  aesthetics: "star",
  "face-lifting": "trending-up",
  laser: "sun",
  "iv-therapy": "droplet",
  packages: "package",
};

export default function ServicesScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubcat, setActiveSubcat] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [catsRes, svcRes] = await Promise.all([
        fetch(`${API_BASE}/service-categories`),
        fetch(`${API_BASE}/services`),
      ]);
      const catsData = await catsRes.json();
      const svcData = await svcRes.json();
      setCategories(catsData.categories ?? []);
      setServices(svcData.services ?? []);
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Derived data
  const allCount = services.length;

  const filtered = services.filter((s) => {
    if (activeCategory !== "all" && s.category_id !== activeCategory) return false;
    if (activeSubcat && s.subcategory !== activeSubcat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.short_desc.toLowerCase().includes(q);
    }
    return true;
  });

  // Subcategories for current category
  const subcats = activeCategory === "all"
    ? []
    : Array.from(new Set(
      services
        .filter((s) => s.category_id === activeCategory && s.subcategory)
        .map((s) => s.subcategory)
    ));

  const handleCategoryChange = (catId: string) => {
    if (catId === "iv-therapy") {
      router.push("/iv-therapy" as any);
      return;
    }
    setActiveCategory(catId);
    setActiveSubcat(null);
    setSearch("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={[styles.header, {
        paddingTop: topPad + 16,
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
      }]}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 20 }}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              Treatments
            </Text>
            <Text style={[styles.headerSub, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
              {loading ? "Loading…" : `${filtered.length} available · Dubai Marina`}
            </Text>
          </View>
          <Pressable
            onPress={() => { setShowSearch(!showSearch); if (showSearch) setSearch(""); }}
            style={[styles.searchBtn, { backgroundColor: showSearch ? "#1a1a1a" : colors.secondary, borderColor: showSearch ? "#1a1a1a" : colors.border }]}
          >
            <Feather name={showSearch ? "x" : "search"} size={16} color={showSearch ? "#fff" : colors.warmGray} />
          </Pressable>
        </View>

        {/* Search bar */}
        {showSearch && (
          <View style={[styles.searchBar, { backgroundColor: colors.secondary, borderColor: colors.border, marginHorizontal: 20, marginTop: 10 }]}>
            <Feather name="search" size={15} color={colors.warmGray} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search treatments…"
              placeholderTextColor={colors.mutedForeground}
              style={[{ flex: 1, fontSize: 15, fontFamily: "Lato_400Regular", color: colors.foreground }]}
              autoFocus
            />
          </View>
        )}

        {/* Category pills */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 14, paddingTop: 12 }}
        >
          {/* ALL */}
          <Pressable
            onPress={() => handleCategoryChange("all")}
            style={[styles.filterPill, {
              backgroundColor: activeCategory === "all" ? "#1a1a1a" : colors.card,
              borderColor: activeCategory === "all" ? "#1a1a1a" : colors.border,
            }]}
          >
            <Feather name="grid" size={12} color={activeCategory === "all" ? "#fff" : colors.warmGray} />
            <Text style={[styles.filterText, {
              color: activeCategory === "all" ? "#fff" : colors.foreground,
              fontFamily: activeCategory === "all" ? "Lato_700Bold" : "Lato_400Regular",
            }]}>All</Text>
            <View style={[styles.countBadge, { backgroundColor: activeCategory === "all" ? "rgba(255,255,255,0.2)" : colors.secondary }]}>
              <Text style={[styles.countText, { color: activeCategory === "all" ? "#fff" : colors.warmGray, fontFamily: "Lato_700Bold" }]}>
                {allCount}
              </Text>
            </View>
          </Pressable>

          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => handleCategoryChange(cat.id)}
              style={[styles.filterPill, {
                backgroundColor: activeCategory === cat.id ? "#1a1a1a" : colors.card,
                borderColor: activeCategory === cat.id ? "#1a1a1a" : colors.border,
              }]}
            >
              <Feather
                name={(CAT_ICONS[cat.id] ?? "star") as any}
                size={12}
                color={activeCategory === cat.id ? "#fff" : colors.warmGray}
              />
              <Text style={[styles.filterText, {
                color: activeCategory === cat.id ? "#fff" : colors.foreground,
                fontFamily: activeCategory === cat.id ? "Lato_700Bold" : "Lato_400Regular",
              }]}>{cat.name}</Text>
              <View style={[styles.countBadge, { backgroundColor: activeCategory === cat.id ? "rgba(255,255,255,0.2)" : colors.secondary }]}>
                <Text style={[styles.countText, { color: activeCategory === cat.id ? "#fff" : colors.warmGray, fontFamily: "Lato_700Bold" }]}>
                  {cat.count}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Subcategory pills */}
        {subcats.length > 1 && (
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 6, paddingBottom: 12 }}
          >
            <Pressable
              onPress={() => setActiveSubcat(null)}
              style={[styles.subcatPill, {
                backgroundColor: !activeSubcat ? GOLD + "20" : "transparent",
                borderColor: !activeSubcat ? GOLD : colors.border,
              }]}
            >
              <Text style={[styles.subcatText, {
                color: !activeSubcat ? GOLD : colors.warmGray,
                fontFamily: !activeSubcat ? "Lato_700Bold" : "Lato_400Regular",
              }]}>All</Text>
            </Pressable>
            {subcats.map((sub) => (
              <Pressable
                key={sub}
                onPress={() => setActiveSubcat(sub === activeSubcat ? null : sub)}
                style={[styles.subcatPill, {
                  backgroundColor: activeSubcat === sub ? GOLD + "20" : "transparent",
                  borderColor: activeSubcat === sub ? GOLD : colors.border,
                }]}
              >
                <Text style={[styles.subcatText, {
                  color: activeSubcat === sub ? GOLD : colors.warmGray,
                  fontFamily: activeSubcat === sub ? "Lato_700Bold" : "Lato_400Regular",
                }]}>
                  {SUBCATEGORY_LABELS[sub] ?? sub}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {/* ── Content ─────────────────────────────────────────────────── */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={GOLD} size="large" />
          <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 13, marginTop: 12 }]}>
            Loading treatments…
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Feather name="search" size={32} color={colors.border} />
          <Text style={[{ color: colors.warmGray, fontFamily: "Lato_400Regular", fontSize: 15 }]}>
            No treatments found
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              colors={colors}
              onPress={() => router.push((item.category_id === "iv-therapy" ? "/iv-therapy" : `/service/${item.id}`) as any)}
            />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 + bottomPad, gap: 12 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// ── Service Card ────────────────────────────────────────────────────────────
function ServiceCard({
  service, colors, onPress,
}: { service: Service; colors: any; onPress: () => void }) {
  const hasDiscount = service.original_price && service.price && service.original_price > service.price;
  const discount = hasDiscount
    ? Math.round((1 - service.price! / service.original_price!) * 100)
    : 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, {
        backgroundColor: colors.card,
        borderColor: colors.border,
        opacity: pressed ? 0.92 : 1,
      }]}
    >
      {/* Top row */}
      <View style={styles.cardTop}>
        <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
          <Feather name={(service.icon as any) ?? "star"} size={20} color={GOLD} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <Text style={[styles.cardName, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              {service.name}
            </Text>
            {service.is_popular && (
              <View style={[styles.popularBadge, { backgroundColor: GOLD + "20", borderColor: GOLD + "40" }]}>
                <Text style={[{ fontSize: 9, color: GOLD, fontFamily: "Lato_700Bold", letterSpacing: 0.5 }]}>POPULAR</Text>
              </View>
            )}
          </View>
          <Text style={[{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_400Regular", marginTop: 2 }]}>
            {SUBCATEGORY_LABELS[service.subcategory] ?? service.category_name} · {service.duration}
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.border} />
      </View>

      {/* Description */}
      <Text style={[styles.cardDesc, { color: colors.warmGray, fontFamily: "Lato_300Light" }]} numberOfLines={2}>
        {service.short_desc}
      </Text>

      {/* Price row */}
      <View style={styles.priceRow}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={[styles.price, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
            {service.price_display}
          </Text>
          {hasDiscount && (
            <Text style={[{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Lato_300Light", textDecorationLine: "line-through" }]}>
              AED {service.original_price?.toLocaleString()}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {hasDiscount && (
            <View style={[styles.discountBadge, { backgroundColor: "#22C55E15", borderColor: "#22C55E30" }]}>
              <Text style={[{ fontSize: 10, color: "#22C55E", fontFamily: "Lato_700Bold" }]}>{discount}% OFF</Text>
            </View>
          )}
          {service.price_note ? (
            <Text style={[{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>
              {service.price_note}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: 1 },
  headerTitle: { fontSize: 38, lineHeight: 42 },
  headerSub: { fontSize: 13, marginTop: 1 },
  searchBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  filterPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 50, borderWidth: 1 },
  filterText: { fontSize: 13 },
  countBadge: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  countText: { fontSize: 10 },
  subcatPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50, borderWidth: 1 },
  subcatText: { fontSize: 12 },

  card: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 10 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardName: { fontSize: 19, lineHeight: 22 },
  popularBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, borderWidth: 1 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price: { fontSize: 22 },
  discountBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
});
