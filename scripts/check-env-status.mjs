#!/usr/bin/env node

console.log('🔍 FUZZY\'S HOME SCHOOL - ENVIRONMENT STATUS CHECK');
console.log('================================================\n');

// Variables críticas requeridas
const criticalVars = {
  // Supabase (Requeridas)
  'NEXT_PUBLIC_SUPABASE_URL': 'URL de tu proyecto Supabase',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Clave anónima de Supabase',
  'SUPABASE_SERVICE_ROLE_KEY': 'Clave de servicio de Supabase',
  'SUPABASE_JWT_SECRET': 'Secreto JWT de Supabase',
  
  // Aplicación
  'NEXT_PUBLIC_APP_URL': 'URL de la aplicación',
  'NEXT_PUBLIC_WEBSOCKET_URL': 'URL del WebSocket',
  
  // IA (Al menos una)
  'DEEPSEEK_API_KEY': 'Clave API de DeepSeek (opcional)',
  'OPENAI_API_KEY': 'Clave API de OpenAI (opcional)',
};

// Variables opcionales
const optionalVars = {
  'NEXT_PUBLIC_EXTERNAL_GAMES_ENABLED': 'Habilitar juegos externos',
  'NEXT_PUBLIC_PHET_ENABLED': 'Habilitar PhET',
  'NEXT_PUBLIC_BLOCKLY_ENABLED': 'Habilitar Blockly',
  'NEXT_PUBLIC_MUSIC_BLOCKS_ENABLED': 'Habilitar Music Blocks',
  'NEXT_PUBLIC_AR_ENABLED': 'Habilitar AR',
  'DATABASE_URL': 'URL de base de datos',
};

let status = {
  critical: { configured: 0, missing: 0, total: 0 },
  optional: { configured: 0, missing: 0, total: 0 },
  ai: { configured: 0, missing: 0, total: 0 }
};

console.log('📊 ESTADO DE VARIABLES CRÍTICAS:');
console.log('================================');

// Verificar variables críticas
Object.entries(criticalVars).forEach(([key, description]) => {
  status.critical.total++;
  const value = process.env[key];
  const isConfigured = value && !value.includes('tu-') && !value.includes('placeholder');
  
  if (isConfigured) {
    status.critical.configured++;
    console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
  } else {
    status.critical.missing++;
    console.log(`❌ ${key}: ${description}`);
  }
});

console.log('\n📊 ESTADO DE VARIABLES OPCIONALES:');
console.log('==================================');

// Verificar variables opcionales
Object.entries(optionalVars).forEach(([key, description]) => {
  status.optional.total++;
  const value = process.env[key];
  const isConfigured = value && !value.includes('tu-') && !value.includes('placeholder');
  
  if (isConfigured) {
    status.optional.configured++;
    console.log(`✅ ${key}: ${value}`);
  } else {
    status.optional.missing++;
    console.log(`⚠️  ${key}: ${description} (opcional)`);
  }
});

console.log('\n🤖 ESTADO DE PROVEEDORES DE IA:');
console.log('===============================');

// Verificar proveedores de IA
const aiProviders = ['DEEPSEEK_API_KEY', 'OPENAI_API_KEY'];
aiProviders.forEach(key => {
  status.ai.total++;
  const value = process.env[key];
  const isConfigured = value && !value.includes('tu-') && !value.includes('placeholder');
  
  if (isConfigured) {
    status.ai.configured++;
    console.log(`✅ ${key}: Configurado`);
  } else {
    status.ai.missing++;
    console.log(`❌ ${key}: No configurado`);
  }
});

// Resumen
console.log('\n📈 RESUMEN:');
console.log('===========');
console.log(`Variables críticas: ${status.critical.configured}/${status.critical.total} configuradas`);
console.log(`Variables opcionales: ${status.optional.configured}/${status.optional.total} configuradas`);
console.log(`Proveedores de IA: ${status.ai.configured}/${status.ai.total} configurados`);

// Determinar estado general
const criticalComplete = status.critical.missing === 0;
const aiConfigured = status.ai.configured > 0;
const overallStatus = criticalComplete && aiConfigured;

console.log('\n🎯 ESTADO GENERAL:');
console.log('=================');

if (overallStatus) {
  console.log('✅ ¡CONFIGURACIÓN COMPLETA!');
  console.log('   El proyecto está listo para desarrollo y producción.');
} else {
  console.log('⚠️  CONFIGURACIÓN INCOMPLETA');
  
  if (!criticalComplete) {
    console.log('\n❌ Variables críticas faltantes:');
    Object.entries(criticalVars).forEach(([key, description]) => {
      const value = process.env[key];
      const isConfigured = value && !value.includes('tu-') && !value.includes('placeholder');
      if (!isConfigured) {
        console.log(`   - ${key}: ${description}`);
      }
    });
  }
  
  if (!aiConfigured) {
    console.log('\n❌ Proveedor de IA no configurado:');
    console.log('   - Configura DEEPSEEK_API_KEY o OPENAI_API_KEY');
  }
}

console.log('\n🔧 PRÓXIMOS PASOS:');
console.log('==================');

if (!criticalComplete) {
  console.log('1. 📝 Edita los archivos .env.local');
  console.log('2. 🔑 Obtén las credenciales de Supabase');
  console.log('3. 🤖 Configura un proveedor de IA');
} else {
  console.log('1. 🧪 Prueba el desarrollo: npm run dev');
  console.log('2. 🏗️  Verifica el build: npm run build');
  console.log('3. 🚀 Deploy a producción: npm run ship');
}

console.log('\n🔗 ENLACES ÚTILES:');
console.log('==================');
console.log('- Supabase Dashboard: https://app.supabase.com');
console.log('- Vercel Dashboard: https://vercel.com/dashboard');
console.log('- DeepSeek API: https://platform.deepseek.com');
console.log('- OpenAI API: https://platform.openai.com');

console.log('\n✨ ¡Verificación completada!');
