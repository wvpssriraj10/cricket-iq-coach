import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase client for browser and server (API routes).
 * Use NEXT_PUBLIC_* env vars so the same client works in both.
 * For MVP we mainly call Supabase from API routes; client can use this for optional real-time.
 */
export const supabase =
  typeof supabaseUrl === "string" && typeof supabaseAnonKey === "string"
    ? createClient(supabaseUrl, supabaseAnonKey)
    : (null as ReturnType<typeof createClient> | null);
