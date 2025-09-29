#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔧 FUZZY\'S HOME SCHOOL - ENVIRONMENT SETUP');
console.log('==========================================\n');

// Verificar si ya existen archivos .env
const rootEnvPath = '.env.local';
const webEnvPath = 'apps/web/.env.local';

const envTemplate = `# ===========================================
# FUZZY'S HOME SCHOOL - ENVIRONMENT VARIABLES
# ===========================================
# Este archivo contiene las variables de entorno para desarrollo local
# NO COMMITEAR ESTE ARCHIVO - está en .gitignore

# ===========================================
# SUPABASE CONFIGURATION (REQUERIDO)
# ===========================================
# Obtén estos valores de tu proyecto Supabase:
# https://app.supabase.com/project/[tu-proyecto]/settings/api

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
# DATABASE (OPCIONAL)
# ===========================================
# DATABASE_URL=postgresql://usuario:password@localhost:5432/fuzzys_db

# ===========================================
# DEVELOPMENT SETTINGS
# ===========================================
NODE_ENV=development`;

// Función para crear archivo .env si no existe
function createEnvFile(path, name) {
  if (!existsSync(path)) {
    writeFileSync(path, envTemplate);
    console.log(`✅ Creado ${name} en ${path}`);
    console.log(`   📝 Edita el archivo y reemplaza los valores placeholder`);
  } else {
    console.log(`⚠️  ${name} ya existe en ${path}`);
  }
}

// Crear archivos .env
console.log('📁 Creando archivos de entorno...\n');

createEnvFile(rootEnvPath, 'Archivo .env.local raíz');
createEnvFile(webEnvPath, 'Archivo .env.local web app');

console.log('\n🔍 Verificando configuración actual...\n');

// Verificar variables críticas
const criticalVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET'
];

let missingVars = [];
let configuredVars = [];

criticalVars.forEach(varName => {
  if (process.env[varName] && !process.env[varName].includes('tu-')) {
    configuredVars.push(varName);
  } else {
    missingVars.push(varName);
  }
});

console.log('📊 Estado de variables críticas:');
console.log(`✅ Configuradas: ${configuredVars.length}`);
console.log(`❌ Faltantes: ${missingVars.length}`);

if (configuredVars.length > 0) {
  console.log('\n✅ Variables configuradas:');
  configuredVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
}

if (missingVars.length > 0) {
  console.log('\n❌ Variables faltantes:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
}

console.log('\n📋 PRÓXIMOS PASOS:');
console.log('==================');
console.log('1. 📝 Edita los archivos .env.local creados');
console.log('2. 🔑 Obtén las credenciales de Supabase:');
console.log('   https://app.supabase.com/project/[tu-proyecto]/settings/api');
console.log('3. 🤖 Configura tu proveedor de IA (DeepSeek o OpenAI)');
console.log('4. 🧪 Prueba el entorno: npm run dev');
console.log('5. 🚀 Para producción, configura las variables en Vercel');

console.log('\n🔗 Enlaces útiles:');
console.log('- Supabase Dashboard: https://app.supabase.com');
console.log('- Vercel Dashboard: https://vercel.com/dashboard');
console.log('- DeepSeek API: https://platform.deepseek.com');
console.log('- OpenAI API: https://platform.openai.com');

console.log('\n✨ ¡Configuración completada!');
