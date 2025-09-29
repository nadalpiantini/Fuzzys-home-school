'use client';
import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/lib/env';

// Fallback to placeholder values if env vars are not set (for development)
const SUPABASE_URL = ENV.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabaseBrowser = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

// Export createClient function for convenience
export const createSupabaseClient = () => supabaseBrowser;
