import { createClient } from "@supabase/supabase-js";

// Retrieve saved configuration from localStorage to allow custom runtime integration
export const getSupabaseConfig = () => {
  const customUrl = localStorage.getItem("pm_supabase_url") || "";
  const customKey = localStorage.getItem("pm_supabase_anon_key") || "";
  const customSchema = localStorage.getItem("pm_supabase_schema") || "public";

  // Check Vite environment variables first
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";
  const envSchema = (import.meta as any).env?.VITE_SUPABASE_SCHEMA || "public";

  return {
    url: customUrl || envUrl,
    key: customKey || envKey,
    schema: customSchema || envSchema,
    isCustom: !!customUrl && !!customKey,
    isEnv: !customUrl && !!envUrl,
  };
};

export const saveSupabaseConfig = (url: string, key: string, schema: string = "public") => {
  if (url && key) {
    localStorage.setItem("pm_supabase_url", url);
    localStorage.setItem("pm_supabase_anon_key", key);
    localStorage.setItem("pm_supabase_schema", schema);
  } else {
    localStorage.removeItem("pm_supabase_url");
    localStorage.removeItem("pm_supabase_anon_key");
    localStorage.removeItem("pm_supabase_schema");
  }
};

export const initSupabaseClient = () => {
  const { url, key, schema } = getSupabaseConfig();
  if (!url || !key) return null;
  try {
    const options = schema && schema !== "public" ? { db: { schema } } : undefined;
    return createClient(url, key, options);
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    return null;
  }
};
