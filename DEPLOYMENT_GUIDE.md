# Deployment Guide for fuzzyandfriends.com

## ✅ Setup Completado

### 1. GitHub Repository
- **Repositorio**: https://github.com/nadalpiantini/Fuzzys-home-school
- **Estado**: ✅ Sincronizado y actualizado

### 2. Vercel Configuration
- **Proyecto creado**: `fuzzys-home-school`
- **Framework**: Next.js 14
- **Build optimizado**: Monorepo con Turborepo

### 3. Archivos de Configuración Creados

#### `.vercelignore`
- ✅ Configurado para ignorar archivos innecesarios

#### `vercel.json`
- ✅ Build command para monorepo
- ✅ Output directory correcto
- ✅ Headers de seguridad
- ✅ Redirects www → non-www

#### `.github/workflows/vercel.yml`
- ✅ CI/CD automático configurado

#### `scripts/deploy-vercel.sh`
- ✅ Script de deployment manual

## 📋 Pasos para Completar el Deployment

### Paso 1: Configurar Vercel desde el Dashboard

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en "Import Project"
3. Selecciona "Import Git Repository"
4. Autoriza acceso a GitHub si es necesario
5. Busca y selecciona: `nadalpiantini/Fuzzys-home-school`
6. Configura el proyecto:
   - **Project Name**: `fuzzys-home-school`
   - **Framework Preset**: Next.js
   - **Root Directory**: `.` (dejar vacío)
   - **Build Command**: `cd apps/web && npm run build`
   - **Output Directory**: `apps/web/.next`

### Paso 2: Configurar Variables de Entorno en Vercel

En el dashboard de Vercel, ve a Settings → Environment Variables y añade:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ggntuptvqxditgxtnsex.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbnR1cHR2cXhkaXRneHRuc2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMTAxMTYsImV4cCI6MjA3NDU4NjExNn0.pVVcvkFYRWb8STJB5OV-EQKSiPqSVO0gjfcbnCcTrt8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbnR1cHR2cXhkaXRneHRuc2V4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTAxMDExNiwiZXhwIjoyMDc0NTg2MTE2fQ.3mNh9vlcJOwrK1IciLrtQa7HEUUps4rA_hjWoPzA0vQ
DEEPSEEK_API_KEY=sk-530e0392af584ca394e5486618a20a3e
OPENAI_API_KEY=sk-530e0392af584ca394e5486618a20a3e
OPENAI_BASE_URL=https://api.deepseek.com
NEXT_PUBLIC_APP_URL=https://fuzzyandfriends.com
```

### Paso 3: Obtener IDs para GitHub Actions

1. En Vercel Dashboard → Settings → General
2. Copia:
   - **VERCEL_ORG_ID**: Tu ID de organización
   - **VERCEL_PROJECT_ID**: El ID del proyecto

3. Genera un token de Vercel:
   - Ve a [Vercel Tokens](https://vercel.com/account/tokens)
   - Crea un nuevo token
   - Guárdalo como **VERCEL_TOKEN**

### Paso 4: Configurar GitHub Secrets

En GitHub → Settings → Secrets and variables → Actions, añade:

- `VERCEL_ORG_ID`: (del paso anterior)
- `VERCEL_PROJECT_ID`: (del paso anterior)
- `VERCEL_TOKEN`: (del paso anterior)

### Paso 5: Configurar Dominio Personalizado

#### En Vercel:
1. Ve a tu proyecto → Settings → Domains
2. Añade `fuzzyandfriends.com`
3. Añade `www.fuzzyandfriends.com`
4. Vercel te dará los registros DNS necesarios

#### En Cloudflare:
1. Ve a tu [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Selecciona el dominio `fuzzyandfriends.com`
3. Ve a DNS → Records
4. Añade los registros que Vercel te proporcionó:

**Registros típicos de Vercel:**
```
Type: A
Name: @
Content: 76.76.21.21
Proxy: OFF (DNS only)

Type: CNAME
Name: www
Content: cname.vercel-dns.com
Proxy: OFF (DNS only)
```

### Paso 6: Verificar SSL en Cloudflare

1. En Cloudflare → SSL/TLS
2. Configura el modo SSL como "Full"
3. Activa "Always Use HTTPS"
4. Activa "Automatic HTTPS Rewrites"

## 🚀 Comandos de Deployment

### Deployment Manual
```bash
# Desde la terminal local
git add .
git commit -m "feat: Update deployment"
git push origin main
```

El deployment se ejecutará automáticamente via GitHub Actions.

### Verificar Estado
```bash
# Ver logs de Vercel
vercel logs

# Ver proyectos
vercel projects ls

# Ver deployments
vercel ls
```

## 🔍 URLs de tu Aplicación

- **Preview**: https://fuzzys-home-school.vercel.app
- **Producción**: https://fuzzyandfriends.com (una vez configurado DNS)

## ⚡ Troubleshooting

### Si el build falla en Vercel:
1. Verifica los logs en Vercel Dashboard
2. Asegúrate que todas las variables de entorno estén configuradas
3. Verifica que el build funcione localmente: `npm run build`

### Si el dominio no funciona:
1. Espera 24-48 horas para propagación DNS completa
2. Verifica en Cloudflare que los registros DNS estén correctos
3. En Vercel, verifica que el dominio esté verificado (checkmark verde)

### Comandos útiles de debugging:
```bash
# Verificar DNS
nslookup fuzzyandfriends.com
dig fuzzyandfriends.com

# Verificar SSL
curl -I https://fuzzyandfriends.com

# Test local build
cd apps/web && npm run build
```

## 📊 Monitoreo

- **Vercel Analytics**: Disponible en el dashboard de Vercel
- **Cloudflare Analytics**: En tu dashboard de Cloudflare
- **GitHub Actions**: Ve el estado en la pestaña Actions de tu repo

## 🎉 ¡Listo!

Una vez completados estos pasos, tu aplicación estará:
1. Deployada automáticamente con cada push a `main`
2. Disponible en https://fuzzyandfriends.com
3. Protegida con SSL de Cloudflare
4. Con CI/CD completamente automatizado

Para cualquier cambio futuro, simplemente:
```bash
git push origin main
```

¡Y el deployment se ejecutará automáticamente!