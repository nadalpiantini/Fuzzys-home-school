import { createClient } from '@supabase/supabase-js';

let _client: ReturnType<typeof createClient> | null = null;

// Factory function con lazy loading para brain engine
export function sb() {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase env vars missing at runtime');
  }

  _client = createClient(url, key, {
    auth: { persistSession: false },
  });

  return _client;
}

// Factory function alternativa para casos específicos
export function getBrainSupabaseClient() {
  return sb();
}
