import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useI18n } from "@/context/I18nContext";
import { useAuth } from "@/context/AuthContext";
import { services } from "@/data/services";
import { GoldButton } from "@/components/GoldButton";

const timeSlots = [
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM",
  "2:00 PM", "2:30 PM", "3:00 PM",
  "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
  "5:30 PM", "6:00 PM",
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getDates() {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export default function BookScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState(auth.user?.name ?? "");
  const [phone, setPhone] = useState(auth.user?.phone ?? "");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  // Sync when profile loads after mount (auth resolves async)
  useEffect(() => {
    if (auth.user?.name && !name) setName(auth.user.name);
    if (auth.user?.phone && !phone) setPhone(auth.user.phone);
  }, [auth.user]);

  const dates = getDates();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const selectedSvc = services.find((s) => s.id === selectedService);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const send = () => {
    if (!name || !phone || !selectedService || !selectedDate || !selectedTime) {
      Alert.alert(t("missing_info_title"), t("missing_info_msg"));
      return;
    }
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const msg =
      `Hello Drypskin! I'd like to book an appointment.\n\n` +
      `Name: ${name}\nPhone: ${phone}\n` +
      `Service: ${selectedSvc?.name}\n` +
      `Date: ${formatDate(selectedDate)}\nTime: ${selectedTime}` +
      (note ? `\nNotes: ${note}` : "");
    Linking.openURL(`https://wa.me/971586078532?text=${encodeURIComponent(msg)}`).finally(() =>
      setLoading(false)
    );
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 120 + bottomPad, paddingTop: topPad + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
          {t("book_title")}
        </Text>
        <Text style={[styles.pageSub, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
          {t("book_sub")}
        </Text>
      </View>

      {/* Your Details */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20 }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{t("your_details")}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground, fontFamily: "Lato_400Regular" }]}
          placeholder={t("full_name_ph")}
          placeholderTextColor={colors.mutedForeground}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground, fontFamily: "Lato_400Regular" }]}
          placeholder={t("phone_ph")}
          placeholderTextColor={colors.mutedForeground}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      {/* Select Service */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20, marginTop: 14 }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{t("choose_treatment")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }}>
          <View style={{ flexDirection: "row", paddingHorizontal: 16, gap: 8 }}>
            {services.slice(0, 8).map((s) => (
              <Pressable
                key={s.id}
                onPress={() => setSelectedService(s.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selectedService === s.id ? colors.primary : colors.secondary,
                    borderColor: selectedService === s.id ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: selectedService === s.id ? "#fff" : colors.foreground, fontFamily: "Lato_400Regular" }]}>
                  {s.name}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => Linking.openURL("https://wa.me/971586078532")}
              style={[styles.chip, { backgroundColor: colors.muted, borderColor: colors.border }]}
            >
              <Text style={[styles.chipText, { color: colors.sage, fontFamily: "Lato_700Bold" }]}>Other...</Text>
            </Pressable>
          </View>
        </ScrollView>
        {selectedSvc && (
          <View style={[styles.selectedInfo, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="check-circle" size={14} color={colors.sage} />
            <Text style={[{ color: colors.foreground, fontSize: 13, flex: 1, fontFamily: "Lato_400Regular" }]}>
              {selectedSvc.name} · {selectedSvc.duration} · {selectedSvc.price}
            </Text>
          </View>
        )}
      </View>

      {/* Date */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20, marginTop: 14 }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{t("select_date")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }}>
          <View style={{ flexDirection: "row", paddingHorizontal: 16, gap: 10 }}>
            {dates.map((date, i) => {
              const sel = selectedDate?.toDateString() === date.toDateString();
              return (
                <Pressable
                  key={i}
                  onPress={() => setSelectedDate(date)}
                  style={[styles.dateChip, { backgroundColor: sel ? colors.primary : colors.secondary, borderColor: sel ? colors.primary : colors.border }]}
                >
                  <Text style={[styles.dateDay, { color: sel ? "rgba(255,255,255,0.7)" : colors.warmGray, fontFamily: "Lato_300Light" }]}>
                    {days[date.getDay() === 0 ? 6 : date.getDay() - 1]}
                  </Text>
                  <Text style={[styles.dateNum, { color: sel ? "#fff" : colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
                    {date.getDate()}
                  </Text>
                  <Text style={[styles.dateMon, { color: sel ? "rgba(255,255,255,0.7)" : colors.warmGray, fontFamily: "Lato_300Light" }]}>
                    {date.toLocaleString("default", { month: "short" })}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Time */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20, marginTop: 14 }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{t("select_time")}</Text>
        <View style={styles.timeGrid}>
          {timeSlots.map((slot) => (
            <Pressable
              key={slot}
              onPress={() => setSelectedTime(slot)}
              style={[styles.chip, { backgroundColor: selectedTime === slot ? colors.primary : colors.secondary, borderColor: selectedTime === slot ? colors.primary : colors.border }]}
            >
              <Text style={[styles.chipText, { color: selectedTime === slot ? "#fff" : colors.foreground, fontFamily: "Lato_400Regular" }]}>
                {slot}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Notes */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20, marginTop: 14 }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>{t("notes_section")}</Text>
        <TextInput
          style={[styles.input, styles.textarea, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground, fontFamily: "Lato_400Regular" }]}
          placeholder={t("notes_ph")}
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={3}
          value={note}
          onChangeText={setNote}
        />
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <GoldButton title={t("send_whatsapp_btn")} onPress={send} loading={loading} fullWidth style={{ paddingVertical: 18, backgroundColor: colors.primary }} />
        <Text style={[styles.hint, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
          {t("confirm_30min")}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 42, lineHeight: 46, marginBottom: 6 },
  pageSub: { fontSize: 15 },
  card: { padding: 16, borderRadius: 20, borderWidth: 1, gap: 12 },
  cardTitle: { fontSize: 22 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textarea: { height: 80, textAlignVertical: "top" },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 50, borderWidth: 1 },
  chipText: { fontSize: 14 },
  selectedInfo: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dateChip: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 2, minWidth: 58 },
  dateDay: { fontSize: 11, letterSpacing: 0.5 },
  dateNum: { fontSize: 22, lineHeight: 26 },
  dateMon: { fontSize: 11 },
  hint: { fontSize: 13, textAlign: "center", marginTop: 12, lineHeight: 18 },
});
