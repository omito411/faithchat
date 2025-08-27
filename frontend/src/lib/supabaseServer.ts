// src/lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";

export function createSupabaseServerClient() {
  // Prefer server-only vars. If you haven't added them yet,
  // this gracefully falls back to the NEXT_PUBLIC ones.
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a runtime error (doesn't crash the build)
    throw new Error("Supabase env vars missing (URL/key).");
  }

  return createClient(url, key);
}
