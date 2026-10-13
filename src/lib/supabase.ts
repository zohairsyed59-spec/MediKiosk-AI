import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True only when real Supabase credentials are present in .env. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// The client is created with inert fallbacks so a missing .env file never
// crashes the whole app at import time (which caused a blank page).
// When isSupabaseConfigured is false, API calls will fail fast with a
// clear error instead of taking down the UI. With real credentials in .env
// the client behaves exactly as before.
export const supabase = createClient(
  supabaseUrl ?? 'https://supabase-not-configured.invalid',
  supabaseAnonKey ?? 'not-configured',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
