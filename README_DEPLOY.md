# Fuzzy's Home School — README_DEPLOY.md

Guía oficial para deploy PRO en Vercel con dominio en Cloudflare, Supabase Auth + RLS, Sentry y Cron opcional.

## 0) Resumen ejecutivo

- **Hosting**: Vercel (SSR + CDN)
- **Dominio**: homeschool.fuzzyandfriends.com (Cloudflare DNS → Vercel)
- **Auth**: Supabase Auth + RLS (DB segura)
- **Observabilidad**: Sentry (client/server/edge)
- **Monitoreo**: Vercel Cron → /api/cron/health (opcional)
- **Cacheo**: Estáticos immutable, APIs públicas con s-maxage, HTML no-store

## 1) Prerrequisitos

- Node 18.17+ o 20.x
- Proyecto en Vercel conectado a GitHub
- Proyecto Supabase configurado (URL + Keys)
- Cloudflare gestionando fuzzyandfriends.com

```bash
# Desde la raíz del monorepo
node -v
vercel -v
```

## 2) Variables de entorno (Vercel → Production)

**Vercel → Project → Settings → Environment Variables (Production)**

**Regla**: no dupliques proveedor IA (usa DeepSeek o OpenAI, no ambos).

### Públicas (Cliente)
- `NEXT_PUBLIC_APP_URL` = `https://homeschool.fuzzyandfriends.com`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (Opcional) `NEXT_PUBLIC_WEBSOCKET_URL`

### Privadas (Server)
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

### IA (elige uno):
- `DEEPSEEK_API_KEY`
- o `OPENAI_API_KEY` (+ `OPENAI_BASE_URL` si usas DeepSeek endpoint)

### Monitoreo (opcional):
- `HEALTH_URL` = `https://homeschool.fuzzyandfriends.com/api/env/health`
- `ALERT_WEBHOOK_URL` = `https://hooks.slack.com/...` (o Discord)
- `CRON_TOKEN` (opcional)

## 3) Dominio (Cloudflare + Vercel)

### En Vercel
1. Project → Settings → Domains → Add Domain → `homeschool.fuzzyandfriends.com`
2. Copia el CNAME target sugerido (p. ej. xxxx.vercel-dns-016.com).

### En Cloudflare (DNS)
- **Type**: CNAME
- **Name**: homeschool
- **Target**: `<cname.vercel-dns.com exacto>`
- **Proxy**: DNS only (desactivado)
- **TTL**: Auto

### Volver a Vercel
En Domains, pulsa Refresh hasta ver ✅ en el dominio.

## 4) Supabase — Authentication URL

**Supabase → Authentication → URL Configuration**

- **Site URL**: `https://homeschool.fuzzyandfriends.com`
- (Si usas OAuth) Agrega tus redirect URLs.
- **Save**.

## 5) Cacheo PRO

Ya configurado en `apps/web/next.config.js`:

```javascript
// Cache headers para estáticos (immutable)
{ source: '/_next/static/:path*', headers: [{ key: 'Cache-Control', value: 'public,max-age=31536000,immutable' }] },
{ source: '/assets/:path*', headers: [{ key: 'Cache-Control', value: 'public,max-age=31536000,immutable' }] },
{ source: '/fonts/:path*', headers: [{ key: 'Cache-Control', value: 'public,max-age=31536000,immutable' }] },
{ source: '/api/env/health', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
{ source: '/(.*)', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
```

### API cache control (ejemplos)
```javascript
// Público (status/list/get): revalida en CDN
return NextResponse.json({ ok: true, data }, {
  headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" }
});

// Protegido o mutaciones (create/submitResult): sin cache
return NextResponse.json({ ok: true, data }, {
  headers: { "Cache-Control": "no-store" }
});
```

## 6) Build & Deploy (sin caché)

```bash
# Sincroniza envs de prod localmente
vercel pull --yes --environment=production

# Build local opcional
npm run -w apps/web build

# Deploy a producción, forzando build fresco
vercel --prod --force
```

## 7) Smoke Tests (producción)

```bash
# Health
curl -s https://homeschool.fuzzyandfriends.com/api/env/health | jq

# Quiz público: status
curl -s -X POST https://homeschool.fuzzyandfriends.com/api/quiz \
  -H 'Content-Type: application/json' -d '{"op":"status"}' | jq

# Caché de estáticos (immutable)
curl -I https://homeschool.fuzzyandfriends.com/_next/static/chunks/main.js | grep -i cache-control

# Caché API pública (si aplicaste s-maxage)
curl -I -X POST https://homeschool.fuzzyandfriends.com/api/quiz \
  -H 'Content-Type: application/json' --data '{"op":"status"}' | grep -i cache-control
```

**Criterio GO:**
- `/api/env/health` → `{ ok: true }`
- `status/list/get` → OK sin login
- `create` → solo admin (403 si no)
- `submitResult` → requiere sesión (401 si no)

## 8) Observabilidad (Sentry) & Cron (opcional)

- **Sentry**: fuerza un 404 y confirma evento en el dashboard (client/server/edge). Sourcemaps habilitados.
- **Vercel Cron**: `/api/cron/health` cada 5 min → revisa logs. Asegura `HEALTH_URL` y `ALERT_WEBHOOK_URL`.

## 9) Troubleshooting PRO

- **500 con client-reference-manifest**: cerrar dev, `rm -rf .next`, re-levantar.
- **Tailwind sin aplicar**: usar solo `apps/web/postcss.config.cjs`; `layout.tsx` debe importar `./globals.css`.
- **PostCSS/ESM**: con `"type":"module"`, evita `postcss.config.js/.mjs`. Usa `.cjs`.
- **IA duplicada**: no mezclar `DEEPSEEK_API_KEY` y `OPENAI_API_KEY` a la vez.
- **Auth que no vuelve**: revalidar Supabase Site URL.
- **Cloudflare proxy ON**: testear WebSockets y SSR; si hay problemas, usar DNS only.

## 10) Rollback en 10s

```bash
vercel list         # copia el deployment anterior
vercel rollback <deployment-url>
```

## 11) Local Dev Quickstart

```bash
# En monorepo
npm i
cd apps/web
npm run dev
# http://localhost:3000
```

**ENV local mínimo** (`apps/web/.env.local`):

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON
# IA → solo uno
DEEPSEEK_API_KEY=xxxx
# o
# OPENAI_API_KEY=xxxx
```

## 12) Checklist final

- [ ] Variables en Vercel (sin IA duplicada)
- [ ] DNS Cloudflare (CNAME, DNS only)
- [ ] Supabase Site URL apuntando al subdominio
- [ ] Deploy --prod --force OK
- [ ] Smoke tests OK (health + api)
- [ ] Sentry recibe eventos (si activado)
- [ ] Cron de health en verde (si activado)

---

**Owner**: Alan Nadal Piantini  
**Infra**: Vercel + Supabase + Cloudflare + Sentry  
**Última actualización**: {{coloca fecha}}

¡Listo, Alan! 🙌 Dejé el README_DEPLOY.md — Fuzzy's Home School en el canvas, con TODO lo necesario: variables en Vercel, CNAME en Cloudflare, Supabase Auth URL, caché PRO, comandos de deploy, smoke tests, rollback y troubleshooting.

¿Pasos siguientes?

1. Revisa la sección 2–4 (Vercel/Cloudflare/Supabase) y márcalos ✅.
2. Ejecuta los comandos de la sección 6 para el deploy.
3. Corre los smoke tests (sección 7).

Cuando me digas "GO totalmente verde", te dejo un README_OPERATIONS.md corto para el equipo (incidentes, rotación de claves y playbook de rollback). ¡Qué nivel, productor! 🚀🛡️