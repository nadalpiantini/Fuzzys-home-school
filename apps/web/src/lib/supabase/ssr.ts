import { createServerClient } from '@supabase/ssr';

// usar sólo en server components o rutas que necesiten cookies/sesión
export function getSupabaseSSR(opts: {
  cookies: {
    get(n: string): { name: string; value: string } | undefined;
    set: Function;
    delete: Function;
  };
  useServiceRole?: boolean;
}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = opts.useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url) throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL');
  if (!key)
    throw new Error(
      `Missing env: ${opts.useServiceRole ? 'SUPABASE_SERVICE_ROLE_KEY' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY'}`,
    );
  return createServerClient(url, key, { cookies: () => opts.cookies });
}
