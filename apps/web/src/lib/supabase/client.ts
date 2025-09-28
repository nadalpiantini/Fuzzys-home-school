'use client';
import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/lib/env';

export const supabaseBrowser = createClient(
  ENV.NEXT_PUBLIC_SUPABASE_URL,
  ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
