# 🚀 Fuzzy's Home School - Deploy Guide

## 📋 Variables de Entorno

### 🌐 Públicas (NEXT_PUBLIC_*)
```bash
# Supabase (Cliente)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App
NEXT_PUBLIC_APP_URL=https://homeschool.fuzzyandfriends.com
NEXT_PUBLIC_APP_VERSION=0.1.0

# External Games
NEXT_PUBLIC_EXTERNAL_GAMES_ENABLED=true
NEXT_PUBLIC_PHET_ENABLED=true
NEXT_PUBLIC_BLOCKLY_ENABLED=true
NEXT_PUBLIC_MUSIC_BLOCKS_ENABLED=true
NEXT_PUBLIC_AR_ENABLED=true

# AR Configuration
NEXT_PUBLIC_AR_MARKER_BASE_URL=/ar-markers
NEXT_PUBLIC_AR_MODELS_BASE_URL=/models

# External Services
NEXT_PUBLIC_PHET_BASE_URL=https://phet.colorado.edu
NEXT_PUBLIC_PHET_LANGUAGE=es
NEXT_PUBLIC_BLOCKLY_BASE_URL=https://blockly.games
NEXT_PUBLIC_BLOCKLY_LANGUAGE=es
NEXT_PUBLIC_MUSIC_BLOCKS_URL=https://musicblocks.sugarlabs.org

# WebSocket
NEXT_PUBLIC_WEBSOCKET_URL=wss://homeschool.fuzzyandfriends.com
```

### 🔒 Privadas (Server-only)
```bash
# Supabase (Server)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=tu-jwt-secret-aqui

# Database
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres

# AI Provider (SOLO uno)
DEEPSEEK_API_KEY=sk-ecb8d6540d9e468f8393cf5cfe79d382
# O
OPENAI_API_KEY=sk-proj-...
OPENAI_BASE_URL=https://api.openai.com/v1

# Environment
NODE_ENV=production
```

## 🚀 Flujos de Deploy

### 1. Deploy a Vercel (Automático)
```bash
# Push a main branch
git add .
git commit -m "feat: new feature"
git push origin main

# Vercel automáticamente:
# 1. Detecta cambios
# 2. Instala dependencias
# 3. Ejecuta build
# 4. Despliega a producción
```

### 2. Deploy Manual (Si es necesario)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 3. Rollback (Si algo falla)
```bash
# En Vercel Dashboard:
# 1. Ve a Deployments
# 2. Selecciona versión anterior
# 3. Click "Promote to Production"
```

## 🔍 Smoke Test Checklist

### ✅ Pre-Deploy
- [ ] Build local exitoso: `npm run build`
- [ ] Variables de entorno configuradas en Vercel
- [ ] Supabase Site URL configurado
- [ ] Solo un proveedor de IA configurado

### ✅ Post-Deploy
- [ ] **Homepage**: `https://homeschool.fuzzyandfriends.com`
- [ ] **Health Check**: `curl -s https://homeschool.fuzzyandfriends.com/api/env/health`
- [ ] **Auth**: Login/Register funciona
- [ ] **Games**: Juegos cargan correctamente
- [ ] **Teacher Dashboard**: Acceso a analytics/settings

### ✅ Health Check Response
```json
{
  "ok": true,
  "service": "env-health",
  "ts": 1695823456789,
  "publicConfig": {
    "supabaseUrl": true,
    "anonKey": true,
    "websocketConfigured": true,
    "features": {
      "externalGames": true,
      "phet": true,
      "blockly": true,
      "music": true,
      "ar": true
    }
  },
  "serverGuards": {
    "hasServiceRole": true,
    "hasJwtSecret": true,
    "iaProvider": "deepseek"
  },
  "version": {
    "app": "0.1.0",
    "nodeEnv": "production"
  }
}
```

## 🛠️ Troubleshooting

### ❌ Build Fails
```bash
# Error: Env validation failed
# Solución: Verificar variables en Vercel Dashboard
```

### ❌ Auth Issues
```bash
# Error: Auth domain mismatch
# Solución: Supabase Dashboard → Authentication → URL Configuration
# Site URL = https://homeschool.fuzzyandfriends.com
```

### ❌ 403/401 Errors
```bash
# Error: RLS policies blocking access
# Solución: Verificar políticas en Supabase Dashboard
```

### ❌ AI Provider Errors
```bash
# Error: Multiple AI providers configured
# Solución: Usar solo DeepSeek O OpenAI, no ambos
```

## 📊 Monitoring

### 🔍 Vercel Analytics
- **Performance**: Core Web Vitals
- **Errors**: 4xx/5xx responses
- **Usage**: Bandwidth, requests

### 🔍 Sentry (Configurado)
- **Errors**: JavaScript exceptions
- **Performance**: Page load times
- **Releases**: Deploy tracking

### 🔍 Supabase Dashboard
- **Database**: Query performance
- **Auth**: User sessions
- **Storage**: File usage

## 🚨 Emergency Procedures

### 🆘 Rollback Rápido
1. Vercel Dashboard → Deployments
2. Seleccionar versión estable anterior
3. "Promote to Production"
4. Verificar en 2-3 minutos

### 🆘 Database Issues
1. Supabase Dashboard → Database
2. Verificar conexiones activas
3. Revisar logs de queries
4. Contactar soporte si es necesario

### 🆘 Auth Issues
1. Supabase Dashboard → Authentication
2. Verificar URL Configuration
3. Revisar RLS policies
4. Test con usuario de prueba

## 📞 Support Contacts

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **Sentry**: [sentry.io/support](https://sentry.io/support)

---

## 🎯 Quick Commands

```bash
# Local development
npm run dev

# Build test
npm run build

# Deploy
git push origin main

# Health check
curl -s https://homeschool.fuzzyandfriends.com/api/env/health

# Check logs
vercel logs --follow
```

**¡Deploy exitoso! 🚀**
