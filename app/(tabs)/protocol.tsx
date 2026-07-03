import React, { useRef, useState, useCallback } from "react";
import {
  Animated,
  Dimensions,
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
import { protocols } from "@/data/protocols";

const GOLD = "#C4956A";
const { width: SCREEN_W } = Dimensions.get("window");
const WHEEL_SIZE = Math.min(SCREEN_W - 48, 330);
const WHEEL_RADIUS = WHEEL_SIZE / 2;
const NODE_SIZE = 74;
const NODE_RADIUS = NODE_SIZE / 2;
const HUB_SIZE = 100;
const SPOKE_LENGTH = WHEEL_RADIUS - NODE_SIZE / 2 - 6;

function getNodePosition(index: number, total: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const spokeR = WHEEL_RADIUS - NODE_SIZE / 2 - 4;
  return {
    x: WHEEL_RADIUS + Math.cos(angle) * spokeR - NODE_SIZE / 2,
    y: WHEEL_RADIUS + Math.sin(angle) * spokeR - NODE_SIZE / 2,
  };
}

function Spoke({
  index,
  total,
  color,
  active,
}: {
  index: number;
  total: number;
  color: string;
  active: boolean;
}) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const degAngle = (angle * 180) / Math.PI;
  return (
    <View
      pointerEvents="none"
      style={[
        styles.spoke,
        {
          width: SPOKE_LENGTH,
          left: WHEEL_RADIUS - SPOKE_LENGTH / 2,
          top: WHEEL_RADIUS - 0.5,
          transform: [{ rotate: `${degAngle}deg` }, { translateX: SPOKE_LENGTH / 2 }],
          borderTopColor: active ? color : "rgba(196,149,106,0.22)",
          borderTopWidth: active ? 1.5 : 0.5,
          opacity: active ? 1 : 0.8,
        },
      ]}
    />
  );
}

export default function ProtocolWheelScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const [selected, setSelected] = useState<string | null>(null);
  const scaleAnims = useRef(protocols.map(() => new Animated.Value(1))).current;
  const glowAnims  = useRef(protocols.map(() => new Animated.Value(0))).current;
  const proceedAnim = useRef(new Animated.Value(0)).current;
  const cardAnim    = useRef(new Animated.Value(0)).current;

  const handleSelect = useCallback(
    (id: string) => {
      const wasSelected = selected === id;
      const newSelected = wasSelected ? null : id;
      setSelected(newSelected);

      protocols.forEach((p, i) => {
        const shouldActivate = p.id === id && !wasSelected;
        Animated.parallel([
          Animated.spring(scaleAnims[i], {
            toValue: shouldActivate ? 1.12 : 1,
            useNativeDriver: true,
            tension: 160,
            friction: 7,
          }),
          Animated.timing(glowAnims[i], {
            toValue: shouldActivate ? 1 : 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start();
      });

      Animated.parallel([
        Animated.spring(proceedAnim, {
          toValue: newSelected ? 1 : 0,
          useNativeDriver: true,
          tension: 110,
          friction: 8,
        }),
        Animated.timing(cardAnim, {
          toValue: newSelected ? 1 : 0,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [selected, scaleAnims, glowAnims, proceedAnim, cardAnim]
  );

  const selectedProtocol = protocols.find((p) => p.id === selected);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 + bottomPad }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: topPad + 24 }]}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDot} />
            <Text style={[styles.eyebrow, { color: GOLD, fontFamily: "Lato_400Regular" }]}>
              DR. KHAN'S SIGNATURE PROTOCOL
            </Text>
            <View style={styles.eyebrowDot} />
          </View>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
            Peptides + IV Drips
          </Text>
          <Text style={[styles.sub, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
            One Protocol.{"  "}Total Transformation.
          </Text>
          <View style={[styles.titleRule, { backgroundColor: GOLD + "30" }]} />
        </View>

        {/* ── Wheel ──────────────────────────────────────────────────────── */}
        <View style={styles.wheelWrapper}>
          <View
            style={[
              styles.wheelGlow,
              {
                width: WHEEL_SIZE + 60,
                height: WHEEL_SIZE + 60,
                borderRadius: (WHEEL_SIZE + 60) / 2,
                backgroundColor: GOLD + "06",
              },
            ]}
          />

          <View style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
            {/* Decorative rings */}
            <View style={[styles.ring, {
              width: WHEEL_SIZE,
              height: WHEEL_SIZE,
              borderRadius: WHEEL_SIZE / 2,
              borderColor: GOLD + "22",
              borderWidth: 0.5,
            }]} />
            <View style={[styles.ring, {
              width: WHEEL_SIZE - 20,
              height: WHEEL_SIZE - 20,
              top: 10, left: 10,
              borderRadius: (WHEEL_SIZE - 20) / 2,
              borderColor: colors.border,
              borderWidth: 0.5,
              opacity: 0.5,
            }]} />
            <View style={[styles.ring, {
              width: HUB_SIZE + 32,
              height: HUB_SIZE + 32,
              top: WHEEL_RADIUS - (HUB_SIZE + 32) / 2,
              left: WHEEL_RADIUS - (HUB_SIZE + 32) / 2,
              borderRadius: (HUB_SIZE + 32) / 2,
              borderColor: GOLD + "30",
              borderWidth: 0.5,
            }]} />

            {/* Spokes */}
            {protocols.map((p, i) => (
              <Spoke
                key={p.id}
                index={i}
                total={protocols.length}
                color={p.color}
                active={selected === p.id}
              />
            ))}

            {/* Hub */}
            <View
              style={[
                styles.hubRing,
                {
                  width: HUB_SIZE + 12,
                  height: HUB_SIZE + 12,
                  top: WHEEL_RADIUS - (HUB_SIZE + 12) / 2,
                  left: WHEEL_RADIUS - (HUB_SIZE + 12) / 2,
                  borderColor: selectedProtocol ? selectedProtocol.color + "60" : GOLD + "45",
                },
              ]}
            />
            <View
              style={[
                styles.hub,
                {
                  width: HUB_SIZE,
                  height: HUB_SIZE,
                  top: WHEEL_RADIUS - HUB_SIZE / 2,
                  left: WHEEL_RADIUS - HUB_SIZE / 2,
                  backgroundColor: selectedProtocol ? selectedProtocol.color : "#111111",
                  shadowColor: selectedProtocol ? selectedProtocol.color : GOLD,
                  shadowOpacity: selectedProtocol ? 0.4 : 0.15,
                  shadowRadius: selectedProtocol ? 20 : 8,
                  elevation: selectedProtocol ? 14 : 4,
                },
              ]}
            >
              {selectedProtocol ? (
                <>
                  <Feather name={selectedProtocol.icon as any} size={22} color="#fff" />
                  <Text style={[styles.hubAreaText, { fontFamily: "Lato_700Bold" }]}>
                    {selectedProtocol.area.toUpperCase()}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.hubGlyph, { fontFamily: "Cormorant_700Bold" }]}>✦</Text>
                  <Text style={[styles.hubHint, { fontFamily: "Lato_300Light" }]}>Select</Text>
                </>
              )}
            </View>

            {/* Protocol nodes — true circles */}
            {protocols.map((p, i) => {
              const pos = getNodePosition(i, protocols.length);
              const isActive = selected === p.id;
              const bgColor = glowAnims[i].interpolate({
                inputRange: [0, 1],
                outputRange: [colors.card, p.color],
              });
              const borderColor = glowAnims[i].interpolate({
                inputRange: [0, 1],
                outputRange: [GOLD + "40", p.color],
              });
              const iconColor = isActive ? "#fff" : p.color;
              const labelColor = glowAnims[i].interpolate({
                inputRange: [0, 1],
                outputRange: [colors.foreground, "#fff"],
              });

              return (
                <Animated.View
                  key={p.id}
                  style={[
                    styles.node,
                    {
                      width: NODE_SIZE,
                      height: NODE_SIZE,
                      borderRadius: NODE_RADIUS,
                      left: pos.x,
                      top: pos.y,
                      backgroundColor: bgColor,
                      borderColor: borderColor,
                      transform: [{ scale: scaleAnims[i] }],
                      shadowColor: isActive ? p.color : "#000",
                      shadowOpacity: isActive ? 0.55 : 0.07,
                      shadowRadius: isActive ? 18 : 6,
                      shadowOffset: { width: 0, height: isActive ? 6 : 2 },
                      elevation: isActive ? 14 : 2,
                    },
                  ]}
                >
                  <Pressable onPress={() => handleSelect(p.id)} style={styles.nodeInner}>
                    <Feather name={p.icon as any} size={18} color={iconColor} />
                    <Animated.Text
                      style={[
                        styles.nodeText,
                        { color: labelColor, fontFamily: "Lato_700Bold" },
                      ]}
                      numberOfLines={2}
                    >
                      {p.area}
                    </Animated.Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          <Text style={[styles.tapHint, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>
            Tap any area to reveal your protocol
          </Text>
        </View>

        {/* ── Protocol Preview Card ───────────────────────────────────────── */}
        {selectedProtocol && (
          <Animated.View
            style={[
              styles.previewCard,
              {
                backgroundColor: colors.card,
                borderColor: selectedProtocol.color + "30",
                opacity: cardAnim,
                transform: [
                  {
                    translateY: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Gradient header strip */}
            <View style={[styles.previewStrip, { backgroundColor: selectedProtocol.color }]}>
              <View style={[styles.previewStripInner, { backgroundColor: "rgba(0,0,0,0.18)" }]}>
                <Text style={[styles.previewStripBadge, { fontFamily: "Lato_700Bold" }]}>
                  {selectedProtocol.badge.toUpperCase()}
                </Text>
                <Text style={[styles.previewStripPrice, { fontFamily: "Cormorant_700Bold" }]}>
                  {selectedProtocol.price}
                </Text>
              </View>
            </View>

            <View style={styles.previewContent}>
              <Text style={[styles.previewTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
                {selectedProtocol.packageName}
              </Text>

              <Text style={[styles.previewTagline, { color: selectedProtocol.color, fontFamily: "Cormorant_600SemiBold" }]}>
                "{selectedProtocol.tagline.replace("\n", " ")}"
              </Text>

              <Text style={[styles.previewDesc, { color: colors.warmGray, fontFamily: "Lato_300Light" }]} numberOfLines={3}>
                {selectedProtocol.description}
              </Text>

              {/* What's included chips */}
              <View style={[styles.includesHeader, { borderTopColor: colors.border }]}>
                <View style={[styles.includesDot, { backgroundColor: selectedProtocol.color }]} />
                <Text style={[styles.includesLabel, { color: colors.foreground, fontFamily: "Lato_700Bold" }]}>
                  WHAT'S INCLUDED
                </Text>
              </View>
              <View style={styles.chipRow}>
                {selectedProtocol.includes.map((item, i) => (
                  <View
                    key={i}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: `${selectedProtocol.color}10`,
                        borderColor: `${selectedProtocol.color}30`,
                      },
                    ]}
                  >
                    <Feather
                      name={item.type === "iv" ? "droplet" : "activity"}
                      size={10}
                      color={selectedProtocol.color}
                    />
                    <Text style={[styles.chipText, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}>
                      {item.name}
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.previewNote, { color: colors.mutedForeground, fontFamily: "Lato_300Light" }]}>
                {selectedProtocol.priceNote}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* ── Default info ────────────────────────────────────────────────── */}
        {!selectedProtocol && (
          <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: GOLD + "20" }]}>
            {[
              { icon: "award",      label: "All protocols",       value: "AED 2,880" },
              { icon: "user-check", label: "Free consultation",   value: "every session" },
              { icon: "activity",   label: "Peptide + IV combo",  value: "7 protocols" },
            ].map((item, i) => (
              <View
                key={i}
                style={[
                  styles.infoRow,
                  i > 0 && { borderTopWidth: 0.5, borderTopColor: GOLD + "20" },
                ]}
              >
                <View style={[styles.infoIconWrap, { backgroundColor: GOLD + "12", borderColor: GOLD + "25" }]}>
                  <Feather name={item.icon as any} size={15} color={GOLD} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.infoLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.foreground, fontFamily: "Lato_700Bold" }]}>
                    {item.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Proceed floating button ─────────────────────────────────────── */}
      <Animated.View
        pointerEvents={selected ? "auto" : "none"}
        style={[
          styles.proceedOuter,
          {
            bottom: 86 + bottomPad,
            opacity: proceedAnim,
            transform: [
              {
                translateY: proceedAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [80, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Pressable
          onPress={() => {
            if (selected) router.push(`/protocol/${selected}` as any);
          }}
          style={({ pressed }) => [
            styles.proceedBtn,
            {
              backgroundColor: selectedProtocol?.color ?? "#111",
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <View style={[styles.proceedIconWrap, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Feather name={selectedProtocol?.icon as any ?? "arrow-right"} size={16} color="#fff" />
          </View>
          <Text style={[styles.proceedBtnText, { fontFamily: "Lato_700Bold" }]}>
            Explore {selectedProtocol?.area} Protocol
          </Text>
          <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.6)" />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Header
  header: {
    paddingHorizontal: 28,
    paddingBottom: 16,
    gap: 6,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  eyebrowDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GOLD,
    opacity: 0.7,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2.5,
  },
  title: {
    fontSize: 44,
    lineHeight: 48,
  },
  sub: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
  titleRule: {
    height: 1,
    marginTop: 10,
    borderRadius: 1,
  },

  // ── Wheel
  wheelWrapper: {
    alignItems: "center",
    paddingVertical: 8,
    paddingBottom: 16,
    position: "relative",
  },
  wheelGlow: {
    position: "absolute",
    top: -12,
  },
  ring: {
    position: "absolute",
  },
  hubRing: {
    position: "absolute",
    borderRadius: (HUB_SIZE + 12) / 2,
    borderWidth: 1,
    opacity: 0.8,
  },
  hub: {
    position: "absolute",
    borderRadius: HUB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    shadowOffset: { width: 0, height: 6 },
  },
  hubGlyph: {
    fontSize: 20,
    color: GOLD,
    opacity: 0.85,
  },
  hubHint: {
    fontSize: 9,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  hubAreaText: {
    fontSize: 9,
    color: "#fff",
    textAlign: "center",
    letterSpacing: 1.5,
    opacity: 0.9,
  },
  spoke: {
    position: "absolute",
    borderTopWidth: 0.5,
    transformOrigin: "left center",
  },
  node: {
    position: "absolute",
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
  },
  nodeInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    padding: 8,
  },
  nodeText: {
    fontSize: 9,
    textAlign: "center",
    lineHeight: 12,
    letterSpacing: 0.3,
  },
  tapHint: {
    fontSize: 11,
    marginTop: 12,
    letterSpacing: 0.3,
  },

  // ── Preview card
  previewCard: {
    marginHorizontal: 20,
    marginTop: 4,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  previewStrip: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
  },
  previewStripInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewStripBadge: {
    fontSize: 9,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1.5,
  },
  previewStripPrice: {
    fontSize: 30,
    color: "#fff",
  },
  previewContent: {
    padding: 20,
    gap: 10,
  },
  previewTitle: {
    fontSize: 30,
    lineHeight: 32,
  },
  previewTagline: {
    fontSize: 17,
    lineHeight: 22,
  },
  previewDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  includesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 0.5,
    marginTop: 2,
  },
  includesDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  includesLabel: {
    fontSize: 9,
    letterSpacing: 2,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 50,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
  },
  previewNote: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
    letterSpacing: 0.2,
  },

  // ── Info box
  infoBox: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  infoLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 15,
    marginTop: 1,
  },

  // ── Proceed button
  proceedOuter: {
    position: "absolute",
    left: 20,
    right: 20,
  },
  proceedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    bottom: -30,
    gap: 12,
    paddingVertical: 17,
    paddingHorizontal: 24,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 14,
  },
  proceedIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  proceedBtnText: {
    color: "#fff",
    fontSize: 15,
    flex: 1,
    textAlign: "center",
    letterSpacing: 0.3,
  },
});
