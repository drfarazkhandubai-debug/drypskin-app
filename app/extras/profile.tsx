import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { sendPasswordReset } from "@/services/authService";
import AlertComponent from "@/components/AlertComponent";

const GOLD = "#C4956A";

type Mode = "login" | "register";

export default function ProfileScreen() {
  
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const auth = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Password reset flow: 0=hidden, 1=enter email, 2=link sent confirmation
  const [resetStep, setResetStep] = useState(0);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // Edit state
  const [editName, setEditName] = useState(auth.user?.name ?? "");
  const [editPhone, setEditPhone] = useState(auth.user?.phone ?? "");
  const [editAddress, setEditAddress] = useState(auth.user?.address ?? "");


  const handleShowAlert = () => {
    setShowAlert(prev => !prev);
  }

  const initials = (auth.user?.name || auth.user?.email || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleAuth = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    if (mode === "login") {
      const res = await auth.login(email.trim(), password);
      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setLoading(false);
        router.back();
      }
    } else {
      if (!name.trim()) { setError("Please enter your name."); setLoading(false); return; }
      const res = await auth.register({ email: email.trim(), password, name, phone, address, referral_code: referralCode.trim() || undefined });
      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setLoading(false);
        router.back();
      }
    }
  };

  const handleUpdate = async () => {
    setError("");
    setLoading(true);
    const res = await auth.updateProfile({ name: editName, phone: editPhone, address: editAddress });
    if (res.error) setError(res.error);
    else setEditing(false);
    setLoading(false);
  };

  const handleForgotSendCode = async () => {
    if (!resetEmail.trim()) { setResetMsg("Please enter your email address."); return; }
    setResetLoading(true);
    setResetMsg("");
    try {
      await sendPasswordReset(resetEmail.trim().toLowerCase());
      setResetStep(2);
      setResetMsg("");
    } catch (err: any) {
      setResetMsg(err?.message ?? "Something went wrong. Please try again.");
    }
    setResetLoading(false);
  };

  const handleLogout = async () => {
    await auth.logout();
    handleLogout()
  };

  // ── Auth loading guard ───────────────────────────────────────────────────
  if (auth.loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#1a1a1a", alignItems: "center", justifyContent: "center" }}>
        <View style={{ alignItems: "center", gap: 16 }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: GOLD + "20", alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color={GOLD} />
          </View>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, letterSpacing: 0.5, fontFamily: "Lato_300Light" }}>
            Checking your session…
          </Text>
        </View>
      </View>
    );
  }

  // ── Logged-in view ──────────────────────────────────────────────────────
  if (auth.user) {
    return (
      <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 + bottomPad }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={15}
      >
          {/* Hero */}
          <View style={[styles.hero, { paddingTop: topPad + 16, backgroundColor: "#1a1a1a" }]}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
              <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Extras</Text>
            </Pressable>
            <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>MY ACCOUNT</Text>
            <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>Profile</Text>
          </View>

          <View style={styles.content}>
            {/* Avatar card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.avatarRow}>
                <View style={[styles.avatar, { backgroundColor: "#C4956A" }]}>
                  <Text style={[styles.avatarText, { fontFamily: "Cormorant_700Bold" }]}>{initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.userName, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
                    {auth.user.name || "Member"}
                  </Text>
                  <Text style={[styles.userEmail, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
                    {auth.user.email}
                  </Text>
                  <View style={[styles.memberBadge, { backgroundColor: "#C4956A18", borderColor: "#C4956A40" }]}>
                    <Feather name="star" size={10} color="#C4956A" />
                    <Text style={[styles.memberText, { color: "#C4956A", fontFamily: "Lato_700Bold" }]}>
                      Wellness Member
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Bio data card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
                  Personal Details
                </Text>
                <Pressable
                  onPress={() => {
                    if (!editing) {
                      setEditName(auth.user?.name ?? "");
                      setEditPhone(auth.user?.phone ?? "");
                      setEditAddress(auth.user?.address ?? "");
                    }
                    setEditing(!editing);
                    setError("");
                  }}
                  style={[styles.editBtn, { borderColor: colors.border }]}
                >
                  <Feather name={editing ? "x" : "edit-2"} size={13} color={colors.warmGray} />
                  <Text style={[styles.editBtnText, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                    {editing ? "Cancel" : "Edit"}
                  </Text>
                </Pressable>
              </View>

              {editing ? (
                <>
                  {[
                    { label: "Full Name", value: editName, setter: setEditName, placeholder: "Your name", keyboard: "default" as const },
                    { label: "Phone Number", value: editPhone, setter: setEditPhone, placeholder: "+971 50 000 0000", keyboard: "phone-pad" as const },
                    { label: "Address", value: editAddress, setter: setEditAddress, placeholder: "Your address", keyboard: "default" as const },
                  ].map((field) => (
                    <View key={field.label} style={{ gap: 6 }}>
                      <Text style={[styles.fieldLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                        {field.label}
                      </Text>
                      <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                        <TextInput
                          value={field.value}
                          onChangeText={field.setter}
                          placeholder={field.placeholder}
                          keyboardType={field.keyboard}
                          placeholderTextColor={colors.mutedForeground}
                          style={[styles.textInput, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}
                        />
                      </View>
                    </View>
                  ))}

                  {!!error && (
                    <View style={[styles.errorBox, { backgroundColor: colors.destructive + "12", borderColor: colors.destructive + "35" }]}>
                      <Feather name="alert-circle" size={14} color={colors.destructive} />
                      <Text style={{ color: colors.destructive, fontSize: 13, fontFamily: "Lato_400Regular", flex: 1, lineHeight: 18 }}>
                        {error}
                      </Text>
                    </View>
                  )}

                  <Pressable
                    onPress={handleUpdate}
                    style={({ pressed }) => [styles.saveBtn, { backgroundColor: "#1a1a1a", opacity: pressed ? 0.85 : 1 }]}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Feather name="check" size={16} color="#fff" />
                        <Text style={[styles.saveBtnText, { fontFamily: "Lato_700Bold" }]}>Save Changes</Text>
                      </>
                    )}
                  </Pressable>
                </>
              ) : (
                <>
                  {[
                    { label: "Full Name", value: auth.user.name, icon: "user" },
                    { label: "Email", value: auth.user.email, icon: "mail" },
                    { label: "Phone", value: auth.user.phone, icon: "phone" },
                    { label: "Address", value: auth.user.address, icon: "map-pin" },
                  ].map((field, i) => (
                    <View key={field.label} style={[styles.profileRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }]}>
                      <View style={[styles.profileIconWrap, { backgroundColor: colors.secondary }]}>
                        <Feather name={field.icon as any} size={13} color={colors.warmGray} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>
                          {field.label}
                        </Text>
                        <Text style={[styles.fieldValue, { color: field.value ? colors.foreground : colors.mutedForeground, fontFamily: "Lato_400Regular" }]}>
                          {field.value || "Not set"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>

            {/* Logout */}
            <Pressable
              onPress={handleShowAlert}
              style={({ pressed }) => [styles.logoutBtn, { borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
            >
              <Feather name="log-out" size={16} color={colors.destructive} />
              <Text style={[styles.logoutText, { color: colors.destructive, fontFamily: "Lato_400Regular" }]}>
                Sign Out
              </Text>
            </Pressable>

            <AlertComponent
              visible={showAlert}
              onConfirm={handleLogout}
              icon={<Feather name="log-out" size={30} color={colors.destructive} />}
              onCancel={handleShowAlert}
              message="Are you sure you want to sign out?"
              confirmStyles={{ backgroundColor: colors.destructive }}
              label="Confirm"
            />

            <View style={[styles.note, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Feather name="shield" size={13} color={colors.sage} />
              <Text style={[styles.noteText, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
                Your data is encrypted and stored securely. We never share your personal information.
              </Text>
            </View>
          </View>
        </KeyboardAwareScrollView>
    );
  }

  // ── Auth form ───────────────────────────────────────────────────────────
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 60 + bottomPad }}
      keyboardShouldPersistTaps="handled"
      bottomOffset={24}
    >
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: topPad + 16, backgroundColor: "#1a1a1a" }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
            <Text style={[styles.backText, { fontFamily: "Lato_400Regular" }]}>Extras</Text>
          </Pressable>
          <Text style={[styles.heroLabel, { fontFamily: "Lato_400Regular" }]}>PRIVATE WELLNESS CLUB</Text>
          <Text style={[styles.heroTitle, { fontFamily: "Cormorant_700Bold" }]}>
            {mode === "login" ? "Welcome Back" : "Join the Club"}
          </Text>
          <Text style={[styles.heroSub, { fontFamily: "Lato_300Light" }]}>
            {mode === "login"
              ? "Sign in to access your personalised wellness journey"
              : "Create your profile to unlock personalised care"}
          </Text>
        </View>

        <View style={styles.content}>
          {/* Tab switcher */}
          <View style={[styles.modeTabs, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            {(["login", "register"] as Mode[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => { setMode(m); setError(""); }}
                style={[styles.modeTab, mode === m && { backgroundColor: colors.card }]}
              >
                <Text style={[styles.modeTabText, {
                  color: mode === m ? colors.foreground : colors.warmGray,
                  fontFamily: mode === m ? "Lato_700Bold" : "Lato_400Regular",
                }]}>
                  {m === "login" ? "Sign In" : "Create Account"}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {mode === "register" && (
              <>
                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
                  Your Details
                </Text>
                {[
                  { label: "Full Name *", value: name, setter: setName, placeholder: "Dr. Sara Al Mansoori", keyboard: "default" as const },
                  { label: "Phone Number", value: phone, setter: setPhone, placeholder: "+971 50 000 0000", keyboard: "phone-pad" as const },
                  { label: "Address", value: address, setter: setAddress, placeholder: "Dubai Marina, UAE", keyboard: "default" as const },
                ].map((field) => (
                  <View key={field.label} style={{ gap: 6 }}>
                    <Text style={[styles.fieldLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                      {field.label}
                    </Text>
                    <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                      <TextInput
                        value={field.value}
                        onChangeText={(v) => { field.setter(v); setError(""); }}
                        placeholder={field.placeholder}
                        keyboardType={field.keyboard}
                        returnKeyType="next"
                        placeholderTextColor={colors.mutedForeground}
                        style={[styles.textInput, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}
                      />
                    </View>
                  </View>
                ))}
                <View style={{ gap: 6 }}>
                  <Text style={[styles.fieldLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                    Referral Code (optional)
                  </Text>
                  <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                    <TextInput
                      value={referralCode}
                      onChangeText={(v) => { setReferralCode(v.toUpperCase()); setError(""); }}
                      placeholder="e.g. DRY1A2B3C"
                      autoCapitalize="characters"
                      returnKeyType="next"
                      placeholderTextColor={colors.mutedForeground}
                      style={[styles.textInput, { color: colors.foreground, fontFamily: "Lato_400Regular", letterSpacing: 1.5 }]}
                    />
                  </View>
                  <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Lato_300Light", paddingLeft: 2 }}>
                    Have a friend's code? Enter it here — they earn AED 50 credit when you join.
                  </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </>
            )}

            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Cormorant_700Bold" }]}>
              {mode === "register" ? "Login Credentials" : "Sign In"}
            </Text>

            {[
              { label: "Email Address *", value: email, setter: setEmail, placeholder: "your@email.com", keyboard: "email-address" as const, secure: false },
              { label: "Password *", value: password, setter: setPassword, placeholder: "••••••••", keyboard: "default" as const, secure: true },
            ].map((field) => (
              <View key={field.label} style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>
                  {field.label}
                </Text>
                <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border, flexDirection: "row", alignItems: "center" }]}>
                  <TextInput
                    value={field.value}
                    onChangeText={(v) => { field.setter(v); setError(""); }}
                    placeholder={field.placeholder}
                    keyboardType={field.keyboard}
                    secureTextEntry={field.secure && !showPassword}
                    autoCapitalize="none"
                    returnKeyType={field.secure ? "done" : "next"}
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.textInput, { color: colors.foreground, fontFamily: "Lato_400Regular", flex: 1 }]}
                  />
                  {field.secure && (
                    <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10} style={{ paddingHorizontal: 10 }}>
                      <Feather
                        name={showPassword ? "eye-off" : "eye"}
                        size={18}
                        color={colors.mutedForeground}
                      />
                    </Pressable>
                  )}
                </View>
              </View>
            ))}

            {!!error && (
              <View style={[styles.errorBox, { backgroundColor: colors.destructive + "12", borderColor: colors.destructive + "35" }]}>
                <Feather name="alert-circle" size={14} color={colors.destructive} />
                <Text style={{ color: colors.destructive, fontSize: 13, fontFamily: "Lato_400Regular", flex: 1, lineHeight: 18 }}>
                  {error}
                </Text>
              </View>
            )}

            {/* Forgot password trigger */}
            {mode === "login" && resetStep === 0 && (
              <Pressable
                onPress={() => { setResetStep(1); setResetEmail(email); setResetMsg(""); }}
                style={{ alignSelf: "center", paddingVertical: 4 }}
              >
                <Text style={{ color: GOLD, fontFamily: "Lato_400Regular", fontSize: 13 }}>
                  Forgot your password?
                </Text>
              </Pressable>
            )}

            {/* ── Password reset panel ───────────────────────── */}
            {resetStep > 0 && (
              <View style={[styles.card, { backgroundColor: colors.secondary, borderColor: colors.border, gap: 12 }]}>
                {/* Header row */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ color: colors.foreground, fontFamily: "Cormorant_700Bold", fontSize: 20 }}>
                    Reset Password
                  </Text>
                  <Pressable
                    onPress={() => { setResetStep(0); setResetMsg(""); setResetEmail(""); }}
                    hitSlop={10}
                  >
                    <Feather name="x" size={18} color={colors.mutedForeground} />
                  </Pressable>
                </View>

                {/* Step 1 — enter email */}
                {resetStep === 1 && (
                  <>
                    <Text style={{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 13, lineHeight: 19 }}>
                      Enter your account email. We'll send a secure reset link to your inbox.
                    </Text>
                    <View style={{ gap: 6 }}>
                      <Text style={[styles.fieldLabel, { color: colors.warmGray, fontFamily: "Lato_400Regular" }]}>Email Address</Text>
                      <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <TextInput
                          value={resetEmail}
                          onChangeText={(v) => { setResetEmail(v); setResetMsg(""); }}
                          placeholder="your@email.com"
                          placeholderTextColor={colors.mutedForeground}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          style={[styles.textInput, { color: colors.foreground, fontFamily: "Lato_400Regular" }]}
                        />
                      </View>
                    </View>
                    {!!resetMsg && (
                      <Text style={{ color: colors.destructive, fontSize: 12, fontFamily: "Lato_400Regular" }}>{resetMsg}</Text>
                    )}
                    <Pressable
                      onPress={handleForgotSendCode}
                      disabled={resetLoading}
                      style={[styles.saveBtn, { backgroundColor: GOLD, opacity: resetLoading ? 0.75 : 1 }]}
                    >
                      {resetLoading
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <><Feather name="send" size={15} color="#fff" /><Text style={[styles.saveBtnText, { fontFamily: "Lato_700Bold" }]}>Send Reset Link</Text></>
                      }
                    </Pressable>
                  </>
                )}

                {/* Step 2 — link sent confirmation */}
                {resetStep === 2 && (
                  <View style={{ alignItems: "center", gap: 14, paddingVertical: 8 }}>
                    <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#5C7A6B20", alignItems: "center", justifyContent: "center" }}>
                      <Feather name="mail" size={26} color="#5C7A6B" />
                    </View>
                    <Text style={{ color: colors.foreground, fontFamily: "Lato_700Bold", fontSize: 15, textAlign: "center" }}>
                      Reset link sent!
                    </Text>
                    <Text style={{ color: colors.warmGray, fontFamily: "Lato_300Light", fontSize: 13, textAlign: "center", lineHeight: 20 }}>
                      Check your inbox at{"\n"}
                      <Text style={{ fontFamily: "Lato_700Bold", color: colors.foreground }}>{resetEmail}</Text>
                      {"\n"}and click the link to create a new password.
                    </Text>
                    <Pressable onPress={() => { setResetStep(1); setResetMsg(""); }} style={{ alignSelf: "center", marginTop: 4 }}>
                      <Text style={{ color: colors.mutedForeground, fontFamily: "Lato_300Light", fontSize: 12 }}>
                        Wrong email? Try again
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}

            <Pressable
              onPress={handleAuth}
              disabled={loading}
              style={({ pressed }) => [styles.saveBtn, { backgroundColor: GOLD, opacity: pressed || loading ? 0.85 : 1, marginTop: 6 }]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Feather name={mode === "login" ? "log-in" : "user-plus"} size={16} color="#fff" />
                  <Text style={[styles.saveBtnText, { fontFamily: "Lato_700Bold" }]}>
                    {mode === "login" ? "Sign In" : "Create Account"}
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          <View style={[styles.note, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="shield" size={13} color={colors.sage} />
            <Text style={[styles.noteText, { color: colors.warmGray, fontFamily: "Lato_300Light" }]}>
              Your data is encrypted and stored securely. We never share your personal information with third parties.
            </Text>
          </View>
        </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 24, paddingBottom: 28 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  backText: { color: "rgba(255,255,255,0.7)", fontSize: 15 },
  heroLabel: { color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 2.5, marginBottom: 4 },
  heroTitle: { color: "#fff", fontSize: 42, lineHeight: 44 },
  heroSub: { color: "rgba(255,255,255,0.65)", fontSize: 14, marginTop: 6 },
  content: { padding: 20, gap: 16 },
  card: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 14 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontSize: 26 },
  modeTabs: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  modeTab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  modeTabText: { fontSize: 14 },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 26 },
  userName: { fontSize: 24, lineHeight: 26 },
  userEmail: { fontSize: 13 },
  memberBadge: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, marginTop: 6 },
  memberText: { fontSize: 11 },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  editBtnText: { fontSize: 12 },
  fieldLabel: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 },
  fieldValue: { fontSize: 15, marginTop: 2 },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  profileIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  inputRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  textInput: { flex: 1, fontSize: 16 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 50 },
  saveBtnText: { color: "#fff", fontSize: 15 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50, borderWidth: 1 },
  logoutText: { fontSize: 15 },
  divider: { height: 1, marginVertical: 4 },
  note: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  noteText: { flex: 1, fontSize: 12, lineHeight: 18 },
  errorBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
});
