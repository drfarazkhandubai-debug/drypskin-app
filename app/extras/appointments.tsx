import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, Linking, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { subscribeToAppointments, unsubscribe } from "@/services/realtimeService";

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
const ACCENT = "#8B9B8A";

const SERVICES_LIST = [
  "HydraFacial MD", "Profhilo® Bio-Remodelling", "Botox", "Dermal Fillers", "PRP Treatment",
  "Salmon DNA", "IV Energy Drip", "IV Glow Drip", "NAD+ IV", "Myers' Cocktail",
  "IV Immunity Boost", "PicoSure Pro Laser", "IPL Photofacial", "Laser Hair Removal",
  "BPC-157 Protocol", "Semaglutide Protocol", "Microneedling", "Chemical Peel", "LED Therapy", "Meso Booster",
];

const STATUS_CONFIG: Record<string, { color: string; icon: string; bg: string }> = {
  planned: { color: "#C4956A", icon: "calendar", bg: "#C4956A18" },
  completed: { color: "#5C7A6B", icon: "check-circle", bg: "#5C7A6B18" },
  cancelled: { color: "#B05A3A", icon: "x-circle", bg: "#B05A3A18" },
};

function StarRating({ rating, onRate }: { rating: number; onRate?: (r: number) => void }) {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Pressable key={s} onPress={() => onRate?.(s)}>
          <Feather name="star" size={18} color={s <= rating ? "#C4956A" : "#C4956A40"} />
        </Pressable>
      ))}
    </View>
  );
}

export default function AppointmentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [serviceName, setServiceName] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("planned");
  const [notes, setNotes] = useState("");
  const [showServices, setShowServices] = useState(false);

  useEffect(() => { if (auth.token) load(); else setLoading(false); }, [auth.token]);

  // Real-time: refresh whenever any appointment is booked or status changes
  useEffect(() => {
    const channel = subscribeToAppointments(() => {
      if (auth.token) load();
    });
    return () => { unsubscribe(channel); };
  }, [auth.token]);

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/appointments`, { headers: { "x-auth-token": auth.token! } });
      if (res.ok) { const d = await res.json(); setAppointments(d.appointments); }
    } catch {}
    setLoading(false);
  };

  const save = async () => {
    if (!serviceName.trim()) { Alert.alert("Required", "Please select a service."); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": auth.token! },
        body: JSON.stringify({ service_name: serviceName.trim(), appointment_date: date || null, status, outcome_notes: notes }),
      });
      if (res.ok) {
        const d = await res.json();
        setAppointments((prev) => [d.appointment, ...prev]);
        setServiceName(""); setDate(""); setStatus("planned"); setNotes("");
        setShowForm(false);
        if (status !== "cancelled") {
          await fetch(`${API_BASE}/rewards`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-auth-token": auth.token!, Authorization: `Bearer ${token}` },
            body: JSON.stringify({ action: "plan_appointment", description: `Planned: ${serviceName}` }),
          });
        }
      }
    } catch {}
    setSaving(false);
  };

  const rateAppointment = async (id: number, rating: number) => {
    try {
      const res = await fetch(`${API_BASE}/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-auth-token": auth.token! },
        body: JSON.stringify({ rating, status: "completed" }),
      });
      if (res.ok) {
        setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, rating, status: "completed" } : a)));
        await fetch(`${API_BASE}/rewards`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-auth-token": auth.token! },
          body: JSON.stringify({ action: "rate_appointment", description: `Rated: ${rating} stars` }),
        });
      }
    } catch {}
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-auth-token": auth.token! },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    } catch {}
  };

  const deleteAppt = async (id: number) => {
    await fetch(`${API_BASE}/appointments/${id}`, { method: "DELETE", headers: { "x-auth-token": auth.token! } });
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const svcSuggestions = SERVICES_LIST.filter((s) => s.toLowerCase().includes(serviceName.toLowerCase())).slice(0, 5);

  const planned = appointments.filter((a) => a.status === "planned");
  const past = appointments.filter((a) => a.status !== "planned");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: "#1a1a1a" }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
          <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Extras</Text>
        </Pressable>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <View>
            <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>TREATMENT HISTORY</Text>
            <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>Appointments</Text>
          </View>
          {auth.user && (
            <Pressable onPress={() => setShowForm(!showForm)} style={[styles.addBtn, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
              <Feather name={showForm ? "x" : "plus"} size={18} color="#fff" />
              <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 13 }]}>{showForm ? "Cancel" : "Log"}</Text>
            </Pressable>
          )}
        </View>
      </View>

      {!auth.token ? (
        <View style={styles.center}>
          <Feather name="lock" size={40} color={colors.mutedForeground} />
          <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", marginTop: 12, textAlign: "center" }]}>Sign in to track your appointments</Text>
          <Pressable onPress={() => router.push("/extras/profile" as any)} style={[styles.cta, { backgroundColor: "#1a1a1a", marginTop: 16 }]}>
            <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold" }]}>Sign In</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 60 + bottomPad, gap: 16 }} keyboardShouldPersistTaps="handled">
          {/* Book via WhatsApp banner */}
          <Pressable onPress={() => Linking.openURL("https://wa.me/971586078532?text=" + encodeURIComponent("Hello Drypskin! I'd like to book a treatment."))}
            style={({ pressed }) => [styles.waBanner, { backgroundColor: "#1a1a1a", opacity: pressed ? 0.9 : 1 }]}>
            <View style={[styles.waIcon, { backgroundColor: "#25D366" }]}>
              <Feather name="message-circle" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 14 }]}>Book via WhatsApp</Text>
              <Text style={[{ color: "rgba(255,255,255,0.55)", fontFamily: "Lato_300Light", fontSize: 12 }]}>Chat with our team — +971 56 607 8532</Text>
            </View>
            <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.4)" />
          </Pressable>

          {/* Add form */}
          {showForm && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>Log Appointment</Text>

              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>Service *</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <TextInput value={serviceName} onChangeText={(t) => { setServiceName(t); setShowServices(true); }}
                    placeholder="Select or type a service" placeholderTextColor={colors.mutedForeground}
                    style={[styles.input, { color: colors.foreground, fontFamily: "Lato_400Regular" }]} />
                </View>
                {showServices && serviceName.length > 0 && svcSuggestions.length > 0 && (
                  <View style={[{ borderRadius: 10, borderWidth: 1, overflow: "hidden" }, { borderColor: colors.border, backgroundColor: colors.card }]}>
                    {svcSuggestions.map((s) => (
                      <Pressable key={s} onPress={() => { setServiceName(s); setShowServices(false); }}
                        style={[{ padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                        <Text style={[{ color: colors.foreground, fontFamily: "Lato_400Regular" }]}>{s}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>Date (YYYY-MM-DD)</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <TextInput value={date} onChangeText={setDate} placeholder="e.g. 2026-04-25"
                    placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, fontFamily: "Lato_400Regular" }]} />
                </View>
              </View>

              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>Status</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {["planned", "completed", "cancelled"].map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    return (
                      <Pressable key={s} onPress={() => setStatus(s)}
                        style={[styles.statusChip, { backgroundColor: status === s ? cfg.color : colors.secondary, borderColor: status === s ? cfg.color : colors.border }]}>
                        <Feather name={cfg.icon as any} size={12} color={status === s ? "#fff" : colors.warmGray} />
                        <Text style={[{ color: status === s ? "#fff" : colors.warmGray, fontSize: 12, fontFamily: "Lato_700Bold", textTransform: "capitalize" }]}>{s}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>Notes / Outcome</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border, minHeight: 70 }]}>
                  <TextInput value={notes} onChangeText={setNotes} multiline placeholder="How did it go? Any results?"
                    placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, fontFamily: "Lato_400Regular", textAlignVertical: "top" }]} />
                </View>
              </View>

              <Pressable onPress={save} disabled={saving} style={[styles.saveBtn, { backgroundColor: "#1a1a1a" }]}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : (
                  <><Feather name="check" size={16} color="#fff" /><Text style={[{ color: "#fff", fontFamily: "Lato_700Bold", fontSize: 15 }]}>Save Appointment</Text></>
                )}
              </Pressable>
            </View>
          )}

          {/* Upcoming */}
          {planned.length > 0 && (
            <View style={{ gap: 10 }}>
              <Text style={[{ color: colors.warmGray, fontSize: 11, fontFamily: "Lato_700Bold", letterSpacing: 1.5 }]}>UPCOMING</Text>
              {planned.map((a) => (
                <View key={a.id} style={[styles.apptCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: "#C4956A", borderLeftWidth: 3 }]}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.foreground, fontFamily: "Lato_700Bold", fontSize: 16 }}>{a.service_name}</Text>
                      {a.appointment_date && <Text style={{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 12 }}>{a.appointment_date}</Text>}
                    </View>
                    <View style={{ flexDirection: "row", gap: 6 }}>
                      <Pressable onPress={() => updateStatus(a.id, "completed")} style={[styles.miniBtn, { backgroundColor: "#5C7A6B18" }]}>
                        <Feather name="check" size={14} color="#5C7A6B" />
                      </Pressable>
                      <Pressable onPress={() => deleteAppt(a.id)} style={[styles.miniBtn, { backgroundColor: colors.secondary }]}>
                        <Feather name="trash-2" size={14} color={colors.mutedForeground} />
                      </Pressable>
                    </View>
                  </View>
                  {a.outcome_notes ? <Text style={{ color: colors.warmGray, fontSize: 12, fontFamily: "Lato_300Light" }}>{a.outcome_notes}</Text> : null}
                </View>
              ))}
            </View>
          )}

          {/* Past */}
          {loading ? <ActivityIndicator color="#1a1a1a" /> : past.length > 0 ? (
            <View style={{ gap: 10 }}>
              <Text style={[{ color: colors.warmGray, fontSize: 11, fontFamily: "Lato_700Bold", letterSpacing: 1.5 }]}>PAST TREATMENTS</Text>
              {past.map((a) => {
                const cfg = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.completed;
                return (
                  <View key={a.id} style={[styles.apptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={{ color: colors.foreground, fontFamily: "Lato_700Bold", fontSize: 15 }}>{a.service_name}</Text>
                        {a.appointment_date && <Text style={{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 11 }}>{a.appointment_date}</Text>}
                        <View style={[{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: "flex-start" }, { backgroundColor: cfg.bg }]}>
                          <Text style={[{ color: cfg.color, fontSize: 10, fontFamily: "Lato_700Bold", textTransform: "capitalize" }]}>{a.status}</Text>
                        </View>
                      </View>
                      <Pressable onPress={() => deleteAppt(a.id)} style={{ padding: 4 }}>
                        <Feather name="trash-2" size={14} color={colors.mutedForeground} />
                      </Pressable>
                    </View>
                    {a.outcome_notes ? <Text style={{ color: colors.warmGray, fontSize: 12, fontFamily: "Lato_300Light" }}>{a.outcome_notes}</Text> : null}
                    <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }}>
                      <Text style={{ color: colors.warmGray, fontSize: 12, fontFamily: "Lato_300Light", marginBottom: 6 }}>
                        {a.rating ? "Your rating:" : "How was your experience?"}
                      </Text>
                      <StarRating rating={a.rating || 0} onRate={!a.rating ? (r) => rateAppointment(a.id, r) : undefined} />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : !showForm && planned.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Feather name="calendar" size={28} color={colors.mutedForeground} />
              <Text style={[{ color: colors.warmGray, fontFamily: "Lato_300Light", textAlign: "center" }]}>
                No appointments logged yet. Book via WhatsApp above and then log your visit.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  heroLabel: { color: "rgba(255,255,255,0.45)", fontSize: 10, letterSpacing: 2.5 },
  heroTitle: { color: "#fff", fontSize: 38, lineHeight: 40 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  cta: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 50 },
  waBanner: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 18 },
  waIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  card: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 14 },
  cardTitle: { fontSize: 26 },
  fieldLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 },
  inputRow: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11 },
  input: { fontSize: 15 },
  statusChip: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50 },
  apptCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  miniBtn: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  empty: { borderRadius: 18, borderWidth: 1, padding: 28, alignItems: "center", gap: 12 },
});
