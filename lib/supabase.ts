import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseUrl = "https://hnzecymlujcoisajtocs.supabase.co";
// const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseAnonKey = "sb_publishable_c8l_8S_CMAJVJgOdCUaqIg_PE7GclXy";

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    storage: Platform.OS !== "web" ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
