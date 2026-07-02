import {
  Cormorant_400Regular,
  Cormorant_600SemiBold,
  Cormorant_700Bold,
} from "@expo-google-fonts/cormorant";
import {
  Lato_300Light,
  Lato_400Regular,
  Lato_700Bold,
} from "@expo-google-fonts/lato";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  View,
  StatusBar
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
// import { StatusBar } from 'expo-status-bar'

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { I18nProvider } from "@/context/I18nContext";


if (__DEV__) {
  require("../ReactotronConfig");
}


SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const nativeDriver = Platform.OS !== "web";

function LogoSplash({ onDone }: { onDone: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: nativeDriver,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: nativeDriver,
        }),
      ]),
      Animated.delay(1400),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: nativeDriver,
      }),
    ]).start(() => onDone());
  }, []);

  return (
    <Animated.View style={[styles.splash, { opacity }]}>
      <Animated.View style={{ transform: [{ scale }], alignItems: "center" }}>
        <Image
          source={require("@/assets/images/drypskin-logo.jpeg")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </Animated.View>
  );
}

function AuthEventRouter() {
  const { authEvent, user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Wait until the initial session check is complete
    if (loading) return;

    const onTabs = segments[0] === "(tabs)";
    const onResetPw = segments[0] === "reset-password";
    // "Public-only" pages that should redirect once logged in
    const onPublicPage = segments[0] === "login" || segments[0] === "index" || segments.length === 0;

    switch (authEvent) {
      // ── User clicked password-reset link ──────────────────────────────────
      case "PASSWORD_RECOVERY":
        if (!onResetPw) router.push("/reset-password");
        break;

      // ── Signed in: normal login, email confirmation, magic link ───────────
      // Only redirect to dashboard from login/public pages, not from inside the app
      case "SIGNED_IN":
        if (onPublicPage || segments[0] === "login") router.replace("/dashboard");
        break;

      // ── Initial session restored (app re-opened with active session) ──────
      // Only redirect to dashboard if user is on login/root, not a specific deep screen
      case "INITIAL_SESSION":
        if (user && onPublicPage) router.replace("/dashboard");
        break;

      // ── Signed out ────────────────────────────────────────────────────────
      case "SIGNED_OUT":
        if (onTabs) router.replace("/login");
        break;

      default:
        break;
    }
  }, [authEvent, user, loading]);

  return null;
}

function RootLayoutNav() {
  return (
    <>
      {/* <StatusBar style="dark" animated backgroundColor="#fff" /> */}
      <StatusBar
        backgroundColor="#fff"
        barStyle="light-content"
      />
      <AuthEventRouter />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="service/[id]"
          options={{
            headerShown: true,
            headerTransparent: true,
            headerTitle: "",
            headerTintColor: "#8B9B8A",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="offers"
          options={{
            headerShown: true,
            headerTitle: "Special Offers",
            headerTintColor: "#8B9B8A",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#F5F0EB" },
          }}
        />
        <Stack.Screen
          name="programs"
          options={{
            headerShown: true,
            headerTitle: "Wellness Programs",
            headerTintColor: "#8B9B8A",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#F5F0EB" },
          }}
        />
        
        <Stack.Screen name="program/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="peptide/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="protocol/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="facials" options={{ headerShown: false }} />


        <Stack.Screen name="extras/bmi" options={{ headerShown: false }} />
        <Stack.Screen name="extras/calorie" options={{ headerShown: false }} />
        <Stack.Screen name="extras/health" options={{ headerShown: false }} />
        <Stack.Screen name="extras/scan" options={{ headerShown: false }} />
        <Stack.Screen name="extras/skin-score" options={{ headerShown: false }} />
        <Stack.Screen name="extras/burnout" options={{ headerShown: false }} />
        <Stack.Screen name="extras/profile" options={{ headerShown: false }} />
        <Stack.Screen name="extras/ai-coach" options={{ headerShown: false }} />
        <Stack.Screen name="extras/journey" options={{ headerShown: false }} />
        <Stack.Screen name="extras/lab-results" options={{ headerShown: false }} />
        <Stack.Screen name="extras/body-metrics" options={{ headerShown: false }} />
        <Stack.Screen name="extras/supplements" options={{ headerShown: false }} />
        <Stack.Screen name="extras/fasting" options={{ headerShown: false }} />
        <Stack.Screen name="extras/sleep" options={{ headerShown: false }} />
        <Stack.Screen name="extras/sleep-tracker" options={{ headerShown: false }} />
        <Stack.Screen name="extras/caffeine" options={{ headerShown: false }} />
        <Stack.Screen name="extras/integrations" options={{ headerShown: false }} />
        <Stack.Screen name="extras/package-builder" options={{ headerShown: false }} />
        <Stack.Screen name="extras/video-library" options={{ headerShown: false }} />
        <Stack.Screen name="extras/appointments" options={{ headerShown: false }} />
        <Stack.Screen name="extras/rewards" options={{ headerShown: false }} />
        <Stack.Screen name="extras/account" options={{ headerShown: false }} />
        <Stack.Screen name="extras/account-favourites" options={{ headerShown: false }} />
        <Stack.Screen name="extras/account-addresses" options={{ headerShown: false }} />
        <Stack.Screen name="extras/account-payments" options={{ headerShown: false }} />
        <Stack.Screen name="extras/account-referral" options={{ headerShown: false }} />
        <Stack.Screen name="extras/account-giftcard" options={{ headerShown: false }} />
        <Stack.Screen name="extras/buy-gift-voucher" options={{ headerShown: false }} />
        <Stack.Screen name="extras/account-help" options={{ headerShown: false }} />
        <Stack.Screen name="extras/account-settings" options={{ headerShown: false }} />
        <Stack.Screen name="extras/account-contact" options={{ headerShown: false }} />
        <Stack.Screen name="extras/symptom-checker" options={{ headerShown: false }} />
        <Stack.Screen name="extras/symptom-mode" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Cormorant_400Regular,
    Cormorant_600SemiBold,
    Cormorant_700Bold,
    Lato_300Light,
    Lato_400Regular,
    Lato_700Bold,
  });

  const [splashDone, setSplashDone] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <I18nProvider>
                <AuthProvider>
                  <View style={{ flex: 1 }}>
                    <RootLayoutNav />
                    {showSplash && (
                      <LogoSplash
                        onDone={() => {
                          setSplashDone(true);
                          setShowSplash(false);
                        }}
                      />
                    )}
                  </View>
                </AuthProvider>
              </I18nProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const SPLASH_SIZE = Platform.OS === "web" ? 280 : 260;

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  logo: {
    width: SPLASH_SIZE,
    height: SPLASH_SIZE,
  },
});
