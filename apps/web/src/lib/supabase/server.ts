import 'server-only';
import { createClient } from '@supabase/supabase-js';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
} from './env';

function required(name: string, v: string) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function getSupabaseServer(useServiceRole = false) {
  const url = required('SUPABASE_URL', SUPABASE_URL);
  const key = useServiceRole
    ? required('SUPABASE_SERVICE_ROLE_KEY', SUPABASE_SERVICE_ROLE_KEY)
    : required('SUPABASE_ANON_KEY', SUPABASE_ANON_KEY);

  return createClient(url, key, {
    auth: { persistSession: false },
    global: { headers: { 'X-Client-Info': 'fuzzys-web@1.0.0' } },
  });
}

// Factory function para cliente con service role (alias)
export function getServiceRoleClient() {
  return getSupabaseServer(true);
}

// Backward compatibility - mantener export para código existente
// DEPRECATED: Usar getSupabaseServer() en su lugar
export const supabaseServer = getSupabaseServer();
