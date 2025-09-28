# Fuzzy's Home School — README_OPERATIONS.md

Guía corta de **operaciones en producción**: monitoreo, incidentes, rollback, rotación de claves y verificaciones rápidas.

---

## 1) On‑call checklist (5 minutos)

1. **Health**: `GET /api/env/health` → `{ ok: true }`
2. **Sentry**: nuevos issues? picos de error? (client/server/edge)
3. **Latencia**: en Vercel Analytics y Sentry Performance
4. **Supabase Logs**: Auth / DB / PostgREST sin errores
5. **Cron**: job `/api/cron/health` ejecutándose y sin alertas

---

## 2) Runbooks de incidentes

### A) 500 en dev o prod por `client-reference-manifest` / `not-found`

**Síntomas:** 500 con mensaje de `not-found_client-reference-manifest.js`
**Fix:**

```bash
rm -rf apps/web/.next apps/web/.turbo node_modules/.cache
# Asegura que app/not-found.tsx NO tenga "use client"
npm run -w apps/web dev   # dev
```

### B) Tailwind no aplica / `@tailwind` sin procesar

**Síntomas:** las utilidades no aparecen; CSS contiene `@tailwind base;`
**Fix:**

* Usar **solo** `apps/web/postcss.config.cjs` (CommonJS)
* No usar `postcss.config.js` ni `.mjs` con `type:"module"`
* `layout.tsx` debe importar `./globals.css`
* Limpia cachés y reconstruye

```bash
rm -rf apps/web/.next apps/web/.turbo node_modules/.cache
npm run -w apps/web dev
```

### C) Error `module is not defined in ES module scope` (PostCSS)

**Fix:** cambiar a `postcss.config.cjs` y borrar variantes `.js/.mjs`.

### D) Validación de ENV falla (IA duplicada)

**Síntomas:** build aborta; mensaje: DeepSeek + OpenAI a la vez
**Fix:** mantener **solo un proveedor**: `DEEPSEEK_API_KEY` **o** `OPENAI_API_KEY` (si DeepSeek, agregar `OPENAI_BASE_URL=https://api.deepseek.com`).

### E) Auth no retorna a la app / sesiones cortadas

**Fix:** Supabase → **Authentication → URL Configuration** → *Site URL* = dominio real de prod.

### F) Dominio no resuelve / SSL pendiente

**Fix:** Cloudflare DNS: `CNAME homeschool → <cname.vercel-dns.com>` con **Proxy: DNS only**. En Vercel Domains: **Refresh**.

### G) WebSockets rotos detrás de Cloudflare (si Proxy ON)

**Fix:** probar con **DNS only**; si necesitas proxy, habilitar WebSocket/WS en Cloudflare y revisar CORS/headers.

---

## 3) Smoke tests (producción)

```bash
# Health
curl -s https://homeschool.fuzzyandfriends.com/api/env/health | jq

# Status público
curl -s -X POST https://homeschool.fuzzyandfriends.com/api/quiz \
  -H 'Content-Type: application/json' -d '{"op":"status"}' | jq

# Caché de estáticos
curl -I https://homeschool.fuzzyandfriends.com/_next/static/chunks/main.js | grep -i cache-control

# Caché API pública (si configurada)
curl -I -X POST https://homeschool.fuzzyandfriends.com/api/quiz \
  -H 'Content-Type: application/json' --data '{"op":"status"}' | grep -i cache-control
```

**OK esperado**: health `{ ok: true }`, status 200, `immutable` en estáticos.

---

## 4) Rollback en segundos

```bash
vercel list
vercel rollback <deployment-url>
```

---

## 5) Rotación de claves (segura y ordenada)

1. **Genera nuevas** en Supabase (anon, service_role, JWT secret) y en proveedor IA.
2. **Actualiza Vercel → Environment Variables (Production)** (no dupliques nombres).
3. **Redeploy**: `vercel --prod --force`.
4. **Smoke tests**.
5. **Revoca** las claves antiguas.

---

## 6) Monitoreo (SLA/SLO recomendados)

* **Uptime**: 99.9% mensual
* **P90 API pública**: < 300ms
* **Error rate**: < 0.5%
* Alertas: Webhook Slack/Discord en cron de health; Sentry alerts por release.

---

## 7) Seguridad (recordatorios)

* RLS en tablas sensibles activo (lecturas públicas solo donde aplica)
* `SUPABASE_SERVICE_ROLE_KEY`: uso exclusivo en server routes/actions
* **Nunca** secretos en cliente; solo `NEXT_PUBLIC_*`

---

## 8) Apéndice (comandos útiles)

```bash
# Build & deploy fresco
vercel pull --yes --environment=production
npm run -w apps/web build
vercel --prod --force

# DNS dig
dig +short homeschool.fuzzyandfriends.com CNAME

# Limpiar caché local
rm -rf apps/web/.next apps/web/.turbo node_modules/.cache

# Ver logs deployment
vercel inspect <deployment-url> --logs
```

---

**Owner:** Alan Nadal Piantini
**Stack:** Vercel + Supabase + Cloudflare + Sentry
**Última actualización:** {{añade fecha}}
