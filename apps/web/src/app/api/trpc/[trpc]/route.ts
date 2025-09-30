import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/lib/trpc/router';
import { getSupabaseServer } from '@/lib/supabase/server';

// Required for tRPC API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => {
      // Create context with Supabase client
      const supabase = getSupabaseServer(false);
      return {
        supabase,
      };
    },
  });

export { handler as GET, handler as POST };
