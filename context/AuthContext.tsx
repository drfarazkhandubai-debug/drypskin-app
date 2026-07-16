import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const API_BASE = `https://${process.env.EXPO_PUBLIC_API_URL}/api`;
const TOKEN_KEY = "auth_token";

// Bump STORAGE_VERSION to trigger a one-time full AsyncStorage wipe on every
// device that still has stale Supabase session data cached locally.
const STORAGE_VERSION_KEY = "app_auth_version";
const STORAGE_VERSION = "v3-local-auth";

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  phone: string;
  address: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  referral_code?: string;
}

interface ScanData {
  scan_type: string;
  answers: Record<string, any>;
  score: number;
  recommendations: string[];
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (data: RegisterData) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error?: string }>;
  saveHealthScan: (scanData: ScanData) => Promise<void>;
  forgot: (email: string) => Promise<{ error?: string }>;
  resetPassword: (email: string, newPassword: string, code: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchMe(token: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { "x-auth-token": token },
    });
    if (res.ok) {
      const data = await res.json();
      return data.user as UserProfile;
    }
  } catch { }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: true });

  useEffect(() => {
    (async () => {
      // One-time migration: wipe ALL AsyncStorage on devices that haven't
      // run the new local-auth build yet. This clears any stale Supabase
      // recovery session that causes the reset-password screen on startup.
      const version = await AsyncStorage.getItem(STORAGE_VERSION_KEY).catch(() => null);
      if (version !== STORAGE_VERSION) {
        await AsyncStorage.clear().catch(() => { });
        await AsyncStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION).catch(() => { });
      }

      const stored = await AsyncStorage.getItem(TOKEN_KEY).catch(() => null);
      if (stored) {
        const user = await fetchMe(stored);
        if (user) {
          setState({ user, token: stored, loading: false });
        } else {
          await AsyncStorage.removeItem(TOKEN_KEY).catch(() => { });
          setState({ user: null, token: null, loading: false });
        }
      } else {
        setState({ user: null, token: null, loading: false });
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error ?? "Login failed." };
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      setState({ user: data.user, token: data.token, loading: false });
      return {};
    } catch {
      return { error: "Connection error. Please try again." };
    }
  }, []);

  const forgot = useCallback(async (email: string) => {
    try {
      const res = await fetch(`${API_BASE}/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();


      return {};
    } catch {
      return { error: "Connection error. Please try again." };
    }
  }, []);

  const register = useCallback(async (regData: RegisterData) => {
    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error ?? "Registration failed." };
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      setState({ user: data.user, token: data.token, loading: false });
      return {};
    } catch {
      return { error: "Connection error. Please try again." };
    }
  }, []);

  const logout = useCallback(async () => {
    const token = (await AsyncStorage.getItem(TOKEN_KEY).catch(() => null)) ?? state.token;
    if (token) {
      fetch(`${API_BASE}/users/logout`, {
        method: "POST",
        headers: { "x-auth-token": token },
      }).catch(() => { });
    }
    await AsyncStorage.removeItem(TOKEN_KEY).catch(() => { });
    setState({ user: null, token: null, loading: false });
  }, [state.token]);

  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    if (!state.token) return { error: "Not logged in." };
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-auth-token": state.token },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Update failed." };
      setState((s) => ({ ...s, user: data.user }));
      return {};
    } catch {
      return { error: "Connection error." };
    }
  }, [state.token]);

  const saveHealthScan = useCallback(async (scanData: ScanData) => {
    if (!state.token) return;
    try {
      await fetch(`${API_BASE}/health-scans`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": state.token },
        body: JSON.stringify(scanData),
      });
    } catch { }
  }, [state.token]);

  const resetPassword = useCallback(async (email: string, newPassword: string, code: string) => {
    try {
      const res = await fetch(`${API_BASE}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), newPassword, code }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Reset password failed." };
      return {};
    } catch {
      return { error: "Connection error." };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, forgot, updateProfile, resetPassword, saveHealthScan }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

