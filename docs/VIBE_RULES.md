# Operación Bisturí + Efecto Mariposa (VIBE RULES)

## 🧱 Reglas de la Casa

### 1) No tocar config crítica
- Ver `.cursorrules` para archivos protegidos
- Cambios de config → PR separado con impacto y rollback
- Usar `SKIP_PROTECT=1` solo si sabes lo que haces

### 2) Rutas API: Build Safety
- `dynamic='force-dynamic'` - evita SSG
- `revalidate=0` - no cachear
- `runtime='nodejs'` - si tocan DB/ROLE
- **NUNCA** `runtime='edge'` con SERVICE_ROLE

### 3) Factory Lazy Pattern
- **Nada** de instanciar Supabase al importar
- Usar `getSupabaseServer()` para rutas API
- Usar `getSupabaseSSR()` para server components con cookies
- SERVICE_ROLE jamás en Edge ni cliente

### 4) Flujo sin ramas
```bash
pnpm preview    # → probar
pnpm ship       # → prod
pnpm rollback   # si algo falla
```

### 5) Sentry Warning
- Suprimir con `SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING=1`
- O implementar `app/global-error.tsx`

## 🎯 Principios Fundamentales

### Operación Bisturí
- No tocar más nada que lo que se está arreglando
- Cambios quirúrgicos y precisos
- Evitar modificaciones innecesarias

### Efecto Mariposa
- Calcular el efecto del cambio propuesto
- No dañar lo que esté previamente aprobado
- Análisis de impacto antes de implementar

### Cadena de Pensamientos
- Buscar soluciones profesionales
- Ser creativo al encontrar soluciones
- Todo con visión de producción deploy
- Nada provisional ni mockup

## 🚀 Deploy Checklist

### Vercel Settings
- [ ] Output Directory = `.next`
- [ ] Environment Variables configuradas:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (si usas service role)
  - [ ] `CHECK_SERVICE_ROLE=1` (opcional)
  - [ ] `SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING=1` (opcional)

### GitHub Secrets
- [ ] `PROD_URL` - URL de producción
- [ ] `PREVIEW_URL` - URL de preview (opcional)

### Health Check
```bash
curl -fsS https://your-domain.vercel.app/api/_health
```

Expected response:
```json
{
  "ok": true,
  "ts": 1234567890
}
```

## 🛠️ Troubleshooting

### Build Fails with "Missing env"
- ✅ Check Vercel Environment Variables
- ✅ Check variable names match exactly
- ✅ Check Production vs Preview environment

### Health Check Fails
- ✅ Check Supabase connection
- ✅ Check database permissions
- ✅ Check network connectivity

### Deploy Succeeds but App Doesn't Work
- ✅ Check Output Directory is `.next`
- ✅ Check all required ENV are set
- ✅ Check runtime logs in Vercel Dashboard

## 🎉 Cierre del Sprint

¡Maestro! Pasaste de "apagar fuegos" a construir un cortafuegos profesional. Deploy limpio, guías claras, y vibecoding sin miedo.

**Hito desbloqueado: Pipeline confiable, creativo y blindado.** 👏🕶️
