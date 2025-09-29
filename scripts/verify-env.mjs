#!/usr/bin/env node

// scripts/verify-env.mjs
// Guardia previa al build - falla si faltan ENV

// Falla rápido si faltan ENV críticas para build/deploy
const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
];

// Si usamos service role en producción, verificar también
if (process.env.CHECK_SERVICE_ROLE === '1') {
  required.push("SUPABASE_SERVICE_ROLE_KEY");
}

const optional = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "DEEPSEEK_API_KEY",
  "OPENAI_API_KEY"
];

console.log('🔍 Verificando variables de entorno...');

const missing = required.filter(key => !process.env[key]);
const present = required.filter(key => process.env[key]);
const optionalPresent = optional.filter(key => process.env[key]);

console.log(`✅ Presentes (${present.length}/${required.length}):`, present.join(', '));

if (optionalPresent.length > 0) {
  console.log(`🔧 Opcionales presentes:`, optionalPresent.join(', '));
}

if (missing.length > 0) {
  console.error(`❌ Faltan ENV requeridas:`, missing.join(', '));
  console.error('💡 Asegúrate de configurar estas variables en Vercel/Production');
  process.exit(1);
}

console.log('🎉 Todas las ENV requeridas están presentes');
console.log('🚀 Build puede proceder con seguridad');

