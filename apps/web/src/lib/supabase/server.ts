import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/lib/env';

export const supabaseServer = createClient(
  ENV.NEXT_PUBLIC_SUPABASE_URL,
  ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);

export function getServiceRoleClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // evitar tree-shake accidental
  if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return createClient(ENV.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
