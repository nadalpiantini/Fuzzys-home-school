# DO NOT CHANGE - Decisiones Intencionales de Arquitectura

Este archivo documenta configuraciones y decisiones arquitectónicas que **NO DEBEN MODIFICARSE** porque fueron implementadas intencionalmente para resolver problemas específicos o son requisitos funcionales del sistema.

## 🚫 Configuraciones Críticas que NO Modificar

### 1. styled-jsx Mock (next.config.js)
**Archivo:** `apps/web/next.config.js` (líneas 52-55)
```javascript
config.resolve.alias['styled-jsx'] = path.resolve(__dirname, './styled-jsx-mock.js');
```
**Razón:** Solución intencional para error de build en Vercel con React context
**NO cambiar:** El mock debe permanecer para evitar errores de SSR

---

### 2. CSP 'unsafe-eval' para Blockly
**Archivo:** `apps/web/next.config.js` (línea 127)
```javascript
script-src 'self' 'unsafe-eval' 'unsafe-inline'
```
**Razón:** Blockly REQUIERE 'unsafe-eval' para ejecutar código generado dinámicamente
**NO cambiar:** Remover 'unsafe-eval' rompería todos los juegos de Blockly
**Sí mejorar:** 'unsafe-inline' puede cambiarse a nonces/hashes

---

### 3. Output Mode Comentado
**Archivo:** `apps/web/next.config.js` (línea 71)
```javascript
// output: 'standalone', // Commented out for Vercel deployment
```
**Razón:** 'standalone' es para Docker, causa problemas en Vercel
**NO cambiar:** Debe permanecer comentado para deployments en Vercel

---

### 4. X-Frame-Options: DENY
**Archivo:** `apps/web/next.config.js` (línea 106)
```javascript
{ key: 'X-Frame-Options', value: 'DENY' }
```
**Razón:** Seguridad contra clickjacking
**Considerar cambiar a:** 'SAMEORIGIN' si necesitamos permitir nuestros propios iframes

---

### 5. Estructura de Archivos Blockly en public/games
**Ubicación:** `apps/web/public/games/blockly/*`
**Total:** 1,682 archivos (26MB)
**Razón:** Blockly necesita estos archivos estáticos para funcionar
**NO cambiar:**
- No mover de public/games
- No renombrar archivos
- No cambiar estructura de carpetas
- Las rutas están hardcodeadas en los HTML de Blockly

---

### 6. allowedOrigins Vacío en gameConfigs
**Archivo:** `packages/external-games/src/utils/gameConfigs.ts`
```typescript
allowedOrigins: [], // Ya no necesario (mismo origen)
```
**Razón:** Los juegos de Blockly se sirven desde el mismo origen
**NO cambiar:** No necesitamos dominios externos para Blockly

---

### 7. Transpiled Packages en next.config.js
**Archivo:** `apps/web/next.config.js` (líneas 15-26)
```javascript
transpilePackages: [
  '@fuzzy/adaptive-engine',
  '@fuzzy/external-games',
  // ... todos los paquetes del monorepo
]
```
**Razón:** Next.js necesita transpilar los paquetes del monorepo
**NO cambiar:** Remover cualquier paquete causaría errores de import

---

### 8. Webpack Fallbacks Deshabilitados
**Archivo:** `apps/web/next.config.js` (webpack config)
**Razón:** Compatibilidad con Cloudflare Pages y edge runtime
**NO cambiar:** Los módulos de Node.js deben permanecer deshabilitados para el browser

---

### 9. Images Unoptimized: false
**Archivo:** `apps/web/next.config.js` (línea 29)
```javascript
unoptimized: false, // Enable optimization for Vercel
```
**Razón:** Optimización de imágenes habilitada para Vercel
**NO cambiar:** La optimización mejora el performance

---

### 10. Cache Headers Immutable (1 año)
**Archivo:** `apps/web/next.config.js` (líneas 74-93)
```javascript
'Cache-Control': 'public,max-age=31536000,immutable'
```
**Razón:** Assets estáticos con hash en nombre pueden cachearse indefinidamente
**NO cambiar:** Mejora significativamente el performance

---

## 🎯 Decisiones de Diseño Intencionales

### Arquitectura de Iframes para Juegos Externos
**Razón:** Aislamiento de seguridad y compatibilidad con juegos de terceros
**Mantener:**
- Sandbox con permisos específicos
- Comunicación vía postMessage
- ExternalGameWrapper como abstracción

### Sistema de Tracking Educativo
**Razón:** Seguimiento del progreso del estudiante
**Mantener:**
- useExternalGameTracking hook
- Objetivos por juego en gameConfigs
- Sistema de puntos y completitud

### Personalización Fuzzy en Blockly
**Archivos:** `apps/web/public/games/blockly/media/sprites_fuzzy_*.png`
**Razón:** Branding coherente y experiencia personalizada
**Mantener:**
- 4 sprites de Fuzzy personalizados
- Mensajes en español con temática Fuzzy
- Header y footer temáticos en BlocklyGamePlayer

### Monorepo con Turbo
**Razón:** Compartir código entre paquetes y optimizar builds
**Mantener:**
- Estructura de workspaces
- Scripts en raíz vs apps/web
- Build pipeline con dependencias

---

## ⚠️ Áreas que SÍ Pueden Mejorarse

1. **CSP 'unsafe-inline'** → Cambiar a nonces o hashes
2. **X-Frame-Options** → Considerar SAMEORIGIN para nuestros iframes
3. **Service Worker** → Añadir para cache offline
4. **Bundle de Blockly** → Optimizar 737 archivos JS
5. **Performance Monitoring** → Añadir métricas Web Vitals
6. **Error Telemetry** → Mejorar tracking de errores en iframes

---

## 📝 Cómo Actualizar este Documento

Cuando se tome una decisión arquitectónica que podría parecer "incorrecta" pero es intencional:

1. Añadir entrada en la sección correspondiente
2. Incluir:
   - Archivo y líneas afectadas
   - Razón de la decisión
   - Qué pasaría si se cambia
   - Si hay alternativas mejores a futuro
3. Commitear con mensaje descriptivo

---

*Última actualización: [Fecha actual]*
*Este archivo es referenciado automáticamente por CLAUDE.md*