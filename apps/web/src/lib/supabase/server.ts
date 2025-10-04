import { createClient } from '@supabase/supabase-js';

// Helper function to get required environment variable
function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Server-side Supabase client using service role key
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Factory lazy - se crea solo cuando se llama
export function getSupabaseServer(useServiceRole = false) {
  const url = required('NEXT_PUBLIC_SUPABASE_URL');
  const key = useServiceRole
    ? required('SUPABASE_SERVICE_ROLE_KEY')
    : required('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  return createClient(url, key, {
    auth: { persistSession: false },
    global: { headers: { 'X-Client-Info': 'fuzzys-web@1.0.0' } },
  });
}