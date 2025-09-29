#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🚀 FUZZY\'S HOME SCHOOL - VERCEL PRODUCTION SETUP');
console.log('================================================\n');

// Variables requeridas para producción
const productionVars = {
  // Variables públicas
  'NEXT_PUBLIC_SUPABASE_URL': 'https://tu-proyecto.supabase.co',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'tu-anon-key-aqui',
  'NEXT_PUBLIC_APP_URL': 'https://tu-dominio.vercel.app',
  'NEXT_PUBLIC_WEBSOCKET_URL': 'wss://tu-websocket-url',
  'NEXT_PUBLIC_EXTERNAL_GAMES_ENABLED': 'true',
  'NEXT_PUBLIC_PHET_ENABLED': 'true',
  'NEXT_PUBLIC_BLOCKLY_ENABLED': 'true',
  'NEXT_PUBLIC_MUSIC_BLOCKS_ENABLED': 'true',
  'NEXT_PUBLIC_AR_ENABLED': 'true',
  'NEXT_PUBLIC_AR_MARKER_BASE_URL': '/ar-markers',
  'NEXT_PUBLIC_AR_MODELS_BASE_URL': '/models',
  'NEXT_PUBLIC_PHET_BASE_URL': 'https://phet.colorado.edu',
  'NEXT_PUBLIC_PHET_LANGUAGE': 'es',
  'NEXT_PUBLIC_BLOCKLY_BASE_URL': 'https://blockly.games',
  'NEXT_PUBLIC_BLOCKLY_LANGUAGE': 'es',
  'NEXT_PUBLIC_MUSIC_BLOCKS_URL': 'https://musicblocks.sugarlabs.org',
  
  // Variables privadas
  'SUPABASE_SERVICE_ROLE_KEY': 'tu-service-role-key-aqui',
  'SUPABASE_JWT_SECRET': 'tu-jwt-secret-aqui',
  'DEEPSEEK_API_KEY': 'tu-deepseek-api-key-aqui',
  'NODE_ENV': 'production'
};

console.log('📋 Variables que necesitas configurar en Vercel:\n');

// Mostrar variables públicas
console.log('🌐 VARIABLES PÚBLICAS (NEXT_PUBLIC_*):');
console.log('=====================================');
Object.entries(productionVars)
  .filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
  .forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });

console.log('\n🔒 VARIABLES PRIVADAS (Server-only):');
console.log('===================================');
Object.entries(productionVars)
  .filter(([key]) => !key.startsWith('NEXT_PUBLIC_'))
  .forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });

console.log('\n📝 INSTRUCCIONES PARA CONFIGURAR EN VERCEL:');
console.log('==========================================');
console.log('1. Ve a https://vercel.com/dashboard');
console.log('2. Selecciona tu proyecto "fuzzys-home-school"');
console.log('3. Ve a Settings > Environment Variables');
console.log('4. Agrega cada variable una por una');
console.log('5. Asegúrate de marcar las variables públicas como "Public"');
console.log('6. Las variables privadas deben quedar como "Private"');

console.log('\n🔧 COMANDOS PARA CONFIGURAR AUTOMÁTICAMENTE:');
console.log('==========================================');

// Generar comandos para configurar variables
Object.entries(productionVars).forEach(([key, value]) => {
  const isPublic = key.startsWith('NEXT_PUBLIC_');
  const scope = isPublic ? '--public' : '--private';
  console.log(`vercel env add ${key} ${scope} --scope production`);
});

console.log('\n⚠️  IMPORTANTE:');
console.log('==============');
console.log('- Reemplaza TODOS los valores "tu-*-aqui" con valores reales');
console.log('- Las variables NEXT_PUBLIC_* son visibles en el cliente');
console.log('- Las variables privadas solo están disponibles en el servidor');
console.log('- Después de configurar, haz un nuevo deploy');

console.log('\n🧪 VERIFICAR CONFIGURACIÓN:');
console.log('==========================');
console.log('1. npm run build  # Verificar build local');
console.log('2. npm run ship   # Deploy a producción');
console.log('3. Verificar que la app funcione en producción');

console.log('\n🔗 ENLACES ÚTILES:');
console.log('==================');
console.log('- Vercel Dashboard: https://vercel.com/dashboard');
console.log('- Supabase Dashboard: https://app.supabase.com');
console.log('- DeepSeek API: https://platform.deepseek.com');

console.log('\n✨ ¡Configuración de producción lista!');
