import { supabaseBrowser as supabase } from '@/lib/supabase/client';

export async function createContext() {
  return {
    supabase,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
