import { createClient } from '@supabase/supabase-js';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required`);
  return v;
}

export function getSupabaseServer(useServiceRole = false) {
  const supabaseUrl = required('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseKey = useServiceRole
    ? required('SUPABASE_SERVICE_ROLE_KEY')
    : required('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  // No instanciar en top-level; siempre dentro de la función
  const client = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        'x-app-id': 'fuzzys-web',
        'x-runtime': 'server',
      },
    },
    auth: { persistSession: false },
  });

  return client;
}
