// apps/web/src/app/api/env/health/route.ts
import { NextResponse } from 'next/server';
import { ENV } from '@/lib/env'; // ya valida y explota si algo crítico falta

export const dynamic = 'force-dynamic'; // evitar cache en build
export const revalidate = 0;

export async function GET() {
  try {
    // Nunca retornamos valores de env, solo banderas seguras.
    // Extra: un heartbeat timestamp y versión mínima.
    const payload = {
      ok: true,
      service: 'env-health',
      ts: Date.now(),
      publicConfig: {
        supabaseUrl: Boolean(ENV.NEXT_PUBLIC_SUPABASE_URL),
        anonKey: Boolean(ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        websocketConfigured: Boolean(ENV.NEXT_PUBLIC_WEBSOCKET_URL),
        features: {
          externalGames: ENV.NEXT_PUBLIC_EXTERNAL_GAMES_ENABLED === 'true',
          phet: ENV.NEXT_PUBLIC_PHET_ENABLED === 'true',
          blockly: ENV.NEXT_PUBLIC_BLOCKLY_ENABLED === 'true',
          music: ENV.NEXT_PUBLIC_MUSIC_BLOCKS_ENABLED === 'true',
          ar: ENV.NEXT_PUBLIC_AR_ENABLED === 'true',
        },
      },
      // Solo banderas, sin secretos:
      serverGuards: {
        hasServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? true : false,
        hasJwtSecret: process.env.SUPABASE_JWT_SECRET ? true : false,
        iaProvider: process.env.DEEPSEEK_API_KEY
          ? 'deepseek'
          : process.env.OPENAI_API_KEY
            ? 'openai'
            : 'none',
      },
      version: {
        app: process.env.NEXT_PUBLIC_APP_VERSION ?? '0.1.0',
        nodeEnv: process.env.NODE_ENV ?? 'development',
      },
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (e: any) {
    // Si el validador de ENV lanzó error, cae aquí
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Env validation failed' },
      { status: 500 },
    );
  }
}
