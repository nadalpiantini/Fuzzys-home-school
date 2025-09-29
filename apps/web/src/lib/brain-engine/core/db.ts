import { getSupabaseServer } from '@/lib/supabase/server';

let _client: ReturnType<typeof getSupabaseServer> | null = null;

// Factory function con lazy loading para brain engine
export function sb() {
  if (_client) return _client;

  _client = getSupabaseServer(true); // Usar service role para brain engine

  return _client;
}

// Factory function alternativa para casos específicos
export function getBrainSupabaseClient() {
  return sb();
}
