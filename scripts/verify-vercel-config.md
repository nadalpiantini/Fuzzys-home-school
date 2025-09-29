# Verificación de Configuración Vercel

## ✅ Checklist Pre-Deploy

### 1. Output Directory
- [ ] **Output Directory = `.next`** (no `apps/web/.next`)
- [ ] Verificar en Vercel Dashboard → Project Settings → Build & Development Settings

### 2. Environment Variables en Vercel
Configurar en Vercel Dashboard → Project Settings → Environment Variables:

#### Production Environment:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `your-service-role-key` (si usas admin operations)

#### Preview Environment (opcional):
- [ ] Mismas variables que Production
- [ ] O variables de staging/development

### 3. GitHub Secrets (para Post-Deploy Check)
Configurar en GitHub → Repository Settings → Secrets and variables → Actions:

- [ ] `PROD_URL` = `https://your-production-domain.vercel.app`
- [ ] `PREVIEW_URL` = `https://your-preview-domain.vercel.app` (opcional)

### 4. Sentry (Opcional - Silenciar Warning)
En Vercel Environment Variables:
- [ ] `SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING=1`

## 🚀 Deploy Process

1. **Push to main branch**
2. **Vercel auto-deploy triggers**
3. **prebuild script runs** → verifica ENV
4. **Build succeeds** → deploy to production
5. **Manual health check** → GitHub Actions → Post-Deploy Check

## 🔍 Post-Deploy Verification

### Health Endpoint
```bash
curl -fsS https://your-domain.vercel.app/api/_health
```

Expected response:
```json
{
  "ok": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GitHub Actions
1. Go to GitHub → Actions
2. Select "Postdeploy Health Check"
3. Click "Run workflow"
4. Select environment (production/preview)
5. Verify green checkmark

## 🛠️ Troubleshooting

### Build Fails with "Missing env"
- ✅ Check Vercel Environment Variables are set
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

