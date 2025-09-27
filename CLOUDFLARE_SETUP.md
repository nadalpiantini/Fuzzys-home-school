# Cloudflare Pages Setup for fuzzyandfriends.com

## Setup Complete ✅

La configuración de Cloudflare Pages para tu sitio **fuzzyandfriends.com** está lista. Aquí está todo lo que necesitas saber:

## Archivos Configurados

1. **`wrangler.toml`** - Configuración principal de Cloudflare
2. **`next.config.js`** - Optimizado para Cloudflare Pages con edge runtime
3. **`package.json`** - Scripts de deployment añadidos
4. **`.github/workflows/deploy.yml`** - CI/CD automático con GitHub Actions

## Scripts Disponibles

```bash
# Deployment manual a producción
npm run deploy

# Deployment a preview/staging
npm run deploy:preview

# Comandos de utilidad
npm run cf:login     # Login a Cloudflare
npm run cf:logout    # Logout de Cloudflare
npm run cf:whoami    # Ver cuenta actual
```

## Configuración en Cloudflare Dashboard

### 1. Variables de Entorno Requeridas

Ve a tu [Cloudflare Dashboard](https://dash.cloudflare.com) y configura estas variables en tu proyecto:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL=https://fuzzyandfriends.com`

### 2. Configuración de GitHub Actions

En tu repositorio de GitHub, ve a **Settings → Secrets and variables → Actions** y añade:

- `CLOUDFLARE_API_TOKEN` - [Crear token aquí](https://dash.cloudflare.com/profile/api-tokens)
  - Permisos necesarios: Cloudflare Pages:Edit
- `CLOUDFLARE_ACCOUNT_ID` - Lo encuentras en tu dashboard de Cloudflare

### 3. Configuración del Dominio

1. En Cloudflare Dashboard, ve a **Pages → tu-proyecto → Custom domains**
2. Añade `fuzzyandfriends.com` y `www.fuzzyandfriends.com`
3. Sigue las instrucciones para configurar los DNS records

## Primer Deployment

### Opción 1: Manual (Recomendado para el primer deployment)

```bash
# 1. Build el proyecto
npm run build

# 2. Deploy a Cloudflare Pages
npm run deploy
```

### Opción 2: Via GitHub Actions

1. Haz commit de todos los cambios:
```bash
git add .
git commit -m "feat: Add Cloudflare Pages deployment configuration"
git push origin main
```

2. El deployment se ejecutará automáticamente

## Estructura del Build

El proyecto está configurado como:
- **Framework**: Next.js 14 con App Router
- **Output**: Standalone build optimizado para edge
- **Monorepo**: Turborepo con build path correcto (`apps/web/.next`)

## Notas Importantes

1. **Edge Runtime**: Configurado para mejor compatibilidad con Cloudflare Workers
2. **Imágenes**: Configuradas como `unoptimized` para Cloudflare Pages
3. **Node Compatibility**: Habilitado en `wrangler.toml` para APIs de Next.js
4. **Build Output**: El directorio `.next` se genera en `apps/web/`

## Troubleshooting

### Si el build falla:
1. Verifica que todas las dependencias estén instaladas: `npm ci`
2. Limpia cache: `npm run clean && npm install`
3. Verifica las variables de entorno

### Si el deployment falla:
1. Verifica tu autenticación: `npm run cf:whoami`
2. Verifica el nombre del proyecto en Cloudflare Dashboard
3. Revisa los logs: `npx wrangler pages deployment tail`

## Comandos Útiles

```bash
# Ver logs del deployment
npx wrangler pages deployment tail

# Ver proyectos de Pages
npx wrangler pages project list

# Ver deployments anteriores
npx wrangler pages deployment list --project-name=fuzzys-home-school
```

## Siguientes Pasos

1. ✅ Configura las variables de entorno en Cloudflare Dashboard
2. ✅ Configura los secrets de GitHub Actions
3. ✅ Haz el primer deployment con `npm run deploy`
4. ✅ Configura el dominio personalizado en Cloudflare Pages

¡Tu sitio estará disponible en https://fuzzyandfriends.com una vez completados estos pasos!