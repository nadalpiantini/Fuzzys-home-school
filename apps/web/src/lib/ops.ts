// apps/web/src/lib/ops.ts
import 'server-only';
import { ENV } from '@/lib/env';

const BASE = (
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

export async function getHealth() {
  const url = process.env.HEALTH_URL || `${BASE}/api/env/health`;
  const r = await fetch(url, { cache: 'no-store' });
  const body = await r.json().catch(() => ({}));
  return { ok: r.ok && !!body?.ok, body };
}

export async function getCacheHeader() {
  const paths = [
    '/_next/static/chunks/main.js',
    '/_next/static/chunks/webpack.js',
  ];
  for (const p of paths) {
    const r = await fetch(`${BASE}${p}`, { method: 'HEAD', cache: 'no-store' });
    if (r.ok) return r.headers.get('cache-control');
  }
  return null;
}

export async function getSupabasePing() {
  try {
    if (!ENV.NEXT_PUBLIC_SUPABASE_URL || !ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return false;
    }

    const r = await fetch(`${ENV.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        'apikey': ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      cache: 'no-store',
    });
    return r.ok;
  } catch {
    return false;
  }
}

export async function getSentryIssues(limit = 5) {
  const {
    SENTRY_ORG: org,
    SENTRY_PROJECT: proj,
    SENTRY_TOKEN: token,
  } = process.env;
  if (!org || !proj || !token) return [];
  const r = await fetch(
    `https://sentry.io/api/0/projects/${org}/${proj}/issues/?limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    },
  );
  if (!r.ok) return [];
  const arr = await r.json().catch(() => []);
  return (arr as any[]).map((i) => ({
    id: i.id,
    title: i.title,
    culprit: i.culprit,
    lastSeen: i.lastSeen,
    level: i.level,
  }));
}

export async function aggregateOps() {
  const [health, cacheControl, supabaseOK, sentryIssues] = await Promise.all([
    getHealth(),
    getCacheHeader(),
    getSupabasePing(),
    getSentryIssues(5),
  ]);
  return {
    ok: !!health.ok,
    health: health.body,
    cacheControl,
    supabaseOK,
    sentryIssues,
    ts: Date.now(),
  };
}
