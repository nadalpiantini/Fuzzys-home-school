# 🚨 GUÍA DE RECUPERACIÓN DE VARIABLES DE ENTORNO

## 📋 Estado Actual
- ✅ Sistema de validación funcionando
- ❌ Archivos .env eliminados
- ⚠️ Variables hardcodeadas en server.ts (CRÍTICO)

## 🔧 PASOS PARA RECUPERAR EL ENTORNO LOCAL

### 1. Crear archivo .env.local en la raíz del proyecto

```bash
# Crear el archivo
touch .env.local
```

### 2. Agregar las variables necesarias al archivo .env.local

```bash
# ===========================================
# SUPABASE CONFIGURATION (REQUERIDO)
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
SUPABASE_JWT_SECRET=tu-jwt-secret-aqui

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:1234

# ===========================================
# EXTERNAL GAMES CONFIGURATION
# ===========================================
NEXT_PUBLIC_EXTERNAL_GAMES_ENABLED=true
NEXT_PUBLIC_PHET_ENABLED=true
NEXT_PUBLIC_BLOCKLY_ENABLED=true
NEXT_PUBLIC_MUSIC_BLOCKS_ENABLED=true
NEXT_PUBLIC_AR_ENABLED=true

# ===========================================
# EXTERNAL GAMES URLS
# ===========================================
NEXT_PUBLIC_AR_MARKER_BASE_URL=/ar-markers
NEXT_PUBLIC_AR_MODELS_BASE_URL=/models
NEXT_PUBLIC_PHET_BASE_URL=https://phet.colorado.edu
NEXT_PUBLIC_PHET_LANGUAGE=es
NEXT_PUBLIC_BLOCKLY_BASE_URL=https://blockly.games
NEXT_PUBLIC_BLOCKLY_LANGUAGE=es
NEXT_PUBLIC_MUSIC_BLOCKS_URL=https://musicblocks.sugarlabs.org

# ===========================================
# AI PROVIDER CONFIGURATION (OPCIONAL)
# ===========================================
# Configura SOLO UNO de estos proveedores:

# Opción 1: DeepSeek (Recomendado)
DEEPSEEK_API_KEY=tu-deepseek-api-key-aqui

# Opción 2: OpenAI (Alternativo)
# OPENAI_API_KEY=tu-openai-api-key-aqui
# OPENAI_BASE_URL=https://api.openai.com/v1

# ===========================================
# DEVELOPMENT SETTINGS
# ===========================================
NODE_ENV=development
```

### 3. Crear archivo .env.local en apps/web/

```bash
# Crear el archivo
touch apps/web/.env.local
```

### 4. Copiar el mismo contenido al archivo apps/web/.env.local

## 🚨 PROBLEMA CRÍTICO: Variables Hardcodeadas

El archivo `apps/web/src/lib/supabase/server.ts` tiene valores hardcodeados que DEBEN ser eliminados:

```typescript
// ❌ PROBLEMA: Valores hardcodeados
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ggnt****nsex.supabase.co';
const supabaseKey = useServiceRole
  ? process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJh****t8'
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJh****t8';
```

## 🔧 PASOS PARA RECUPERAR EL ENTORNO DE PRODUCCIÓN

### 1. Variables de Vercel

Accede a tu proyecto en Vercel:
1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto "fuzzys-home-school"
3. Ve a Settings > Environment Variables
4. Agrega las siguientes variables:

#### Variables Públicas (NEXT_PUBLIC_*):
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
NEXT_PUBLIC_WEBSOCKET_URL=wss://tu-websocket-url
NEXT_PUBLIC_EXTERNAL_GAMES_ENABLED=true
NEXT_PUBLIC_PHET_ENABLED=true
NEXT_PUBLIC_BLOCKLY_ENABLED=true
NEXT_PUBLIC_MUSIC_BLOCKS_ENABLED=true
NEXT_PUBLIC_AR_ENABLED=true
NEXT_PUBLIC_AR_MARKER_BASE_URL=/ar-markers
NEXT_PUBLIC_AR_MODELS_BASE_URL=/models
NEXT_PUBLIC_PHET_BASE_URL=https://phet.colorado.edu
NEXT_PUBLIC_PHET_LANGUAGE=es
NEXT_PUBLIC_BLOCKLY_BASE_URL=https://blockly.games
NEXT_PUBLIC_BLOCKLY_LANGUAGE=es
NEXT_PUBLIC_MUSIC_BLOCKS_URL=https://musicblocks.sugarlabs.org
```

#### Variables Privadas (Server-only):
```
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
SUPABASE_JWT_SECRET=tu-jwt-secret-aqui
DEEPSEEK_API_KEY=tu-deepseek-api-key-aqui
NODE_ENV=production
```

### 2. Verificar configuración

```bash
# Verificar variables locales
npm run prebuild

# Verificar deploy
npm run ship
```

## 🚨 ACCIONES INMEDIATAS REQUERIDAS

1. **ELIMINAR valores hardcodeados** del archivo `server.ts`
2. **Configurar variables** en archivos `.env.local`
3. **Configurar variables** en Vercel para producción
4. **Probar** el deploy local y de producción

## 📞 Obtener Credenciales de Supabase

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a Settings > API
4. Copia:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_ROLE_KEY`
   - JWT Secret → `SUPABASE_JWT_SECRET`

## 🔍 Verificar que todo funciona

```bash
# Desarrollo local
npm run dev

# Build de producción
npm run build

# Deploy
npm run ship
```
