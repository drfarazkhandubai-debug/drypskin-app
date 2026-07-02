import { supabase } from "@/lib/supabase";

const APP_REDIRECT = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/reset-password`
  : "drypskin://reset-password";

export const signUp = async (opts: {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  address?: string;
  referral_code?: string;
}) => {
  const { data, error } = await supabase.auth.signUp({
    email: opts.email,
    password: opts.password,
    options: { data: { full_name: opts.full_name, phone: opts.phone ?? "" } },
  });
  if (error) throw error;

  if (data?.user?.id) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      full_name: opts.full_name,
      email: opts.email,
      role: "patient",
    });
  }
  return data;
};

export const signIn = async (opts: { email: string; password: string }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: opts.email,
    password: opts.password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const sendPasswordReset = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: APP_REDIRECT,
  });
  if (error) throw error;
};

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
};

export const getProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
};
