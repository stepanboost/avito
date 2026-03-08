import { createBrowserClient } from "@supabase/ssr";

const FALLBACK_URL = "https://placeholder.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const valid = url.startsWith("https://") && !url.includes("placeholder") && !url.includes("your_");
  return { url: valid ? url : FALLBACK_URL, key: valid ? key : FALLBACK_KEY };
}

export function createClient() {
  const { url, key } = getConfig();
  return createBrowserClient(url, key);
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return url.startsWith("https://") && !url.includes("placeholder") && !url.includes("your_");
}
