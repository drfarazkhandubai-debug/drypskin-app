import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { updatePassword } from "@/services/authService";

const GOLD = "#C4956A";

export default function ResetPasswordScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    setError("");
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Failed to update password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / header */}
        <View style={{ alignItems: "center", marginBottom: 36 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: GOLD + "18", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Feather name="lock" size={24} color={GOLD} />
          </View>
          <Text style={{ fontFamily: "Cormorant_700Bold", fontSize: 28, color: colors.foreground, letterSpacing: 0.5 }}>
            New Password
          </Text>
          <Text style={{ fontFamily: "Lato_300Light", fontSize: 13, color: colors.warmGray, textAlign: "center", marginTop: 8, lineHeight: 20 }}>
            Choose a strong password to protect your account.
          </Text>
        </View>

        {success ? (
          <View style={[styles.card, { backgroundColor: colors.secondary, borderColor: colors.border, alignItems: "center", gap: 14 }]}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#5C7A6B18", alignItems: "center", justifyContent: "center" }}>
              <Feather name="check-circle" size={28} color="#5C7A6B" />
            </View>
            <Text style={{ fontFamily: "Lato_700Bold", fontSize: 16, color: colors.foreground, textAlign: "center" }}>
              Password Updated!
            </Text>
            <Text style={{ fontFamily: "Lato_300Light", fontSize: 13, color: colors.warmGray, textAlign: "center", lineHeight: 20 }}>
              Your password has been changed successfully. You're now signed in.
            </Text>
            <Pressable
              onPress={() => router.replace("/(tabs)")}
              style={[styles.btn, { backgroundColor: GOLD, marginTop: 4 }]}
            >
              <Text style={styles.btnText}>Go to Home</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.secondary, borderColor: colors.border, gap: 14 }]}>
            {/* Password field */}
            <View style={{ gap: 6 }}>
              <Text style={[styles.label, { color: colors.warmGray }]}>New Password</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  value={password}
                  onChangeText={(v) => { setPassword(v); setError(""); }}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                  style={[styles.input, { color: colors.foreground, flex: 1 }]}
                />
                <Pressable onPress={() => setShowPw((v) => !v)} hitSlop={10} style={{ paddingHorizontal: 12 }}>
                  <Feather name={showPw ? "eye-off" : "eye"} size={17} color={colors.mutedForeground} />
                </Pressable>
              </View>
            </View>

            {/* Confirm password field */}
            <View style={{ gap: 6 }}>
              <Text style={[styles.label, { color: colors.warmGray }]}>Confirm Password</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={(v) => { setConfirmPassword(v); setError(""); }}
                  placeholder="Repeat your password"
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  style={[styles.input, { color: colors.foreground, flex: 1 }]}
                />
                <Pressable onPress={() => setShowConfirm((v) => !v)} hitSlop={10} style={{ paddingHorizontal: 12 }}>
                  <Feather name={showConfirm ? "eye-off" : "eye"} size={17} color={colors.mutedForeground} />
                </Pressable>
              </View>
            </View>

            {!!error && (
              <Text style={{ color: "#C0392B", fontFamily: "Lato_400Regular", fontSize: 12 }}>{error}</Text>
            )}

            <Pressable
              onPress={handleUpdate}
              disabled={loading}
              style={[styles.btn, { backgroundColor: GOLD, opacity: loading ? 0.78 : 1, marginTop: 4 }]}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <><Feather name="lock" size={15} color="#fff" /><Text style={styles.btnText}>Set New Password</Text></>
              }
            </Pressable>

            <Pressable onPress={() => router.back()} style={{ alignSelf: "center" }}>
              <Text style={{ fontFamily: "Lato_300Light", fontSize: 12, color: colors.mutedForeground }}>
                Cancel
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },
  label: {
    fontFamily: "Lato_400Regular",
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontFamily: "Lato_400Regular",
    fontSize: 15,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnText: {
    color: "#fff",
    fontFamily: "Lato_700Bold",
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
