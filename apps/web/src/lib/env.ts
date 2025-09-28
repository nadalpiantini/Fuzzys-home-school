// apps/web/src/lib/env.ts
import { z } from 'zod';

const isServer = typeof window === 'undefined';

// Reglas comunes
const Url = z.string().url();
const BoolStr = z.enum(['true', 'false']);

// Public (se inyectan al cliente)
const PublicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: Url.refine(
    (u) => u.includes('supabase.co'),
    'Debe ser un URL de Supabase',
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10, 'Anon key inválida'),
  NEXT_PUBLIC_APP_URL: Url,
  NEXT_PUBLIC_EXTERNAL_GAMES_ENABLED: BoolStr,
  NEXT_PUBLIC_PHET_ENABLED: BoolStr,
  NEXT_PUBLIC_BLOCKLY_ENABLED: BoolStr,
  NEXT_PUBLIC_MUSIC_BLOCKS_ENABLED: BoolStr,
  NEXT_PUBLIC_AR_ENABLED: BoolStr,
  NEXT_PUBLIC_AR_MARKER_BASE_URL: z.string().min(1),
  NEXT_PUBLIC_AR_MODELS_BASE_URL: z.string().min(1),
  NEXT_PUBLIC_PHET_BASE_URL: Url,
  NEXT_PUBLIC_PHET_LANGUAGE: z.string().min(2),
  NEXT_PUBLIC_BLOCKLY_BASE_URL: Url,
  NEXT_PUBLIC_BLOCKLY_LANGUAGE: z.string().min(2),
  NEXT_PUBLIC_MUSIC_BLOCKS_URL: Url,

  // Validación específica de WebSocket:
  NEXT_PUBLIC_WEBSOCKET_URL: z
    .string()
    .regex(
      /^wss?:\/\/[-a-zA-Z0-9@:%._+~#=]{2,256}/,
      'Debe empezar con ws:// o wss://',
    ),
});

// Server-only (no se exponen en cliente)
const ServerEnvSchema = z
  .object({
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
    SUPABASE_JWT_SECRET: z.string().min(20),
    DATABASE_URL: z.string().optional(),
    // IA provider: DeepSeek O OpenAI (uno u otro)
    DEEPSEEK_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_BASE_URL: z.string().optional(),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  })
  .refine((e) => !(e.DEEPSEEK_API_KEY && e.OPENAI_API_KEY), {
    message: 'Configura SOLO un proveedor IA: DeepSeek o OpenAI (no ambos).',
  });

const parsedPublic = PublicEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_EXTERNAL_GAMES_ENABLED:
    process.env.NEXT_PUBLIC_EXTERNAL_GAMES_ENABLED ?? 'false',
  NEXT_PUBLIC_PHET_ENABLED: process.env.NEXT_PUBLIC_PHET_ENABLED ?? 'false',
  NEXT_PUBLIC_BLOCKLY_ENABLED:
    process.env.NEXT_PUBLIC_BLOCKLY_ENABLED ?? 'false',
  NEXT_PUBLIC_MUSIC_BLOCKS_ENABLED:
    process.env.NEXT_PUBLIC_MUSIC_BLOCKS_ENABLED ?? 'false',
  NEXT_PUBLIC_AR_ENABLED: process.env.NEXT_PUBLIC_AR_ENABLED ?? 'false',
  NEXT_PUBLIC_AR_MARKER_BASE_URL:
    process.env.NEXT_PUBLIC_AR_MARKER_BASE_URL ?? '/ar-markers',
  NEXT_PUBLIC_AR_MODELS_BASE_URL:
    process.env.NEXT_PUBLIC_AR_MODELS_BASE_URL ?? '/models',
  NEXT_PUBLIC_PHET_BASE_URL:
    process.env.NEXT_PUBLIC_PHET_BASE_URL ?? 'https://phet.colorado.edu',
  NEXT_PUBLIC_PHET_LANGUAGE: process.env.NEXT_PUBLIC_PHET_LANGUAGE ?? 'es',
  NEXT_PUBLIC_BLOCKLY_BASE_URL:
    process.env.NEXT_PUBLIC_BLOCKLY_BASE_URL ?? 'https://blockly.games',
  NEXT_PUBLIC_BLOCKLY_LANGUAGE:
    process.env.NEXT_PUBLIC_BLOCKLY_LANGUAGE ?? 'es',
  NEXT_PUBLIC_MUSIC_BLOCKS_URL:
    process.env.NEXT_PUBLIC_MUSIC_BLOCKS_URL ??
    'https://musicblocks.sugarlabs.org',
  NEXT_PUBLIC_WEBSOCKET_URL:
    process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? 'ws://localhost:1234',
});

if (!parsedPublic.success) {
  const msg = parsedPublic.error.errors
    .map((e) => `PUBLIC ${e.path.join('.')}: ${e.message}`)
    .join(' | ');
  throw new Error(`Env validation (public) failed: ${msg}`);
}

let parsedServer: z.infer<typeof ServerEnvSchema> | null = null;
if (isServer) {
  const result = ServerEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
  if (!result.success) {
    const msg = result.error.errors
      .map((e) => `SERVER ${e.path.join('.')}: ${e.message}`)
      .join(' | ');
    throw new Error(`Env validation (server) failed: ${msg}`);
  }
  parsedServer = result.data;
}

export const ENV = {
  ...parsedPublic.data,
  // Solo llena server si estás en server
  ...(isServer ? parsedServer! : {}),
  __isServer: isServer,
};
