import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const FALLBACK_URL = "https://placeholder.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const valid = url.startsWith("https://") && !url.includes("placeholder") && !url.includes("your_");
  return { url: valid ? url : FALLBACK_URL, key: valid ? key : FALLBACK_KEY };
}

export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getConfig();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server component — cookies set in proxy
        }
      },
    },
  });
}
