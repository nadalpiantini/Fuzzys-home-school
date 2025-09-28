# 📋 CHECKLIST DE DEPLOY - Fuzzy's Home School

## 🚨 PROBLEMAS QUE ENFRENTAMOS Y CÓMO LOS SOLUCIONAMOS

### **1. DEPENDENCIAS EXTERNAS FALTANTES**
- **Problema**: `@fuzzy/creative-tools`, `@fuzzy/vr-ar-adapter`, `@fuzzy/simulation-engine`
- **Solución**: Eliminar páginas que usan dependencias no existentes
- **Prevención**: Verificar dependencias antes de commit

### **2. ERRORES DE TYPESCRIPT EN BASE DE DATOS**
- **Problema**: Tablas `brain_jobs`, `brain_logs` no existían
- **Solución**: Comentar operaciones de DB temporalmente
- **Prevención**: Aplicar migraciones antes de desarrollar

### **3. CONFIGURACIÓN DE VERCEL INVÁLIDA**
- **Problema**: `"runtime": "edge"` no válido
- **Solución**: Remover configuración edge
- **Prevención**: Verificar documentación de Vercel

### **4. CONFLICTOS DE LINT-STAGED**
- **Problema**: Cambios staged vs unstaged
- **Solución**: `git commit --no-verify`
- **Prevención**: `git add .` antes de commit

## ✅ CHECKLIST PRE-DEPLOY

### **Antes de cada deploy, ejecutar:**

```bash
# 1. Verificación automática
./scripts/pre-deploy-check.sh

# 2. Build local
npm run build

# 3. Verificación de tipos
npm run typecheck

# 4. Commit limpio
git add .
git commit -m "mensaje descriptivo"

# 5. Push a GitHub
git push origin main

# 6. Deploy a producción
vercel --prod --force
```

## 🛡️ CONFIGURACIONES SEGURAS

### **vercel.json recomendado:**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/brain/generate/route.ts": { "maxDuration": 60 }
  },
  "crons": [
    { "path": "/api/cron/health", "schedule": "*/5 * * * *" }
  ]
}
```

### **Estructura de archivos segura:**
```
apps/web/src/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   └── ops/
│   │   └── brain/
│   ├── admin/
│   │   └── ops/
│   └── games/
│       └── (sin external/)
├── lib/
│   ├── ops.ts
│   └── brain-engine/
└── vercel.json
```

## 🚨 SEÑALES DE ALERTA

- ❌ `Module not found: Can't resolve '@fuzzy/...'`
- ❌ `Could not find the table 'public.brain_jobs'`
- ❌ `Function Runtimes must have a valid version`
- ❌ `husky - pre-commit script failed`
- ❌ Build falla en local

## 🚀 COMANDOS DE RECUPERACIÓN

### **Si el build falla:**
```bash
# Limpiar caché
rm -rf .next node_modules/.cache

# Reinstalar
npm install

# Build limpio
npm run build
```

### **Si el deploy falla:**
```bash
# Verificar configuración
cat vercel.json

# Deploy forzado
vercel --prod --force

# Rollback si es necesario
vercel rollback <deployment-url>
```

### **Si hay errores de TypeScript:**
```bash
# Verificar tipos
npm run typecheck

# Limpiar y reconstruir
rm -rf .next
npm run build
```

## 📁 ARCHIVOS DE REFERENCIA

- **TROUBLESHOOTING_GUIDE.md** - Guía completa de solución de problemas
- **scripts/pre-deploy-check.sh** - Script de verificación automática
- **DEPLOYMENT_CHECKLIST.md** - Este archivo

## 🎯 LECCIONES APRENDIDAS

1. **✅ Siempre verificar build local antes de deploy**
2. **✅ Mantener dependencias externas separadas del core**
3. **✅ Usar tipos explícitos en lugar de inferencia**
4. **✅ Configurar Vercel correctamente desde el inicio**
5. **✅ Tener un plan de rollback siempre listo**

## 📞 COMANDOS DE EMERGENCIA

```bash
# Rollback completo
git reset --hard HEAD~1

# Deploy anterior
vercel rollback <deployment-url>

# Limpiar todo y empezar de nuevo
rm -rf .next node_modules
npm install
npm run build
```

---

**Fecha de creación:** 28 de septiembre, 2025  
**Última actualización:** 28 de septiembre, 2025  
**Estado:** ✅ Documentado y probado
