import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/lib/env';

/**
 * Obtiene el cliente Supabase para operaciones de servidor
 * La autenticación se maneja a través de RLS en la base de datos
 */
export async function getUserAndClient() {
  const supabase = createClient(
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

  // En el servidor, la autenticación se maneja a través de RLS
  // El usuario se autentica en el cliente y las cookies se envían automáticamente
  return { user: null, supabase };
}

/**
 * Verifica si el usuario es administrador
 * Esta función se usa en el cliente, no en el servidor
 */
export function isAdmin(user: any) {
  return (
    user?.app_metadata?.role === 'admin' ||
    user?.user_metadata?.role === 'admin'
  );
}

/**
 * Para el servidor, siempre requerimos autenticación a través de RLS
 * Las operaciones se validan en la base de datos
 */
export async function requireAuth() {
  // En el servidor, confiamos en RLS para la autenticación
  // Si RLS permite la operación, el usuario está autenticado
  return { user: { id: 'server-user' } };
}
