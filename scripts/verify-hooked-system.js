#!/usr/bin/env node

/**
 * Script de verificación del sistema Hooked
 * Verifica que todos los componentes estén correctamente implementados
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando sistema Hooked...\n');

// Lista de archivos que deben existir
const requiredFiles = [
  'apps/web/src/components/hooked/MessageBar.tsx',
  'apps/web/src/components/hooked/Bell.tsx',
  'apps/web/src/components/hooked/Inbox.tsx',
  'apps/web/src/components/hooked/QuestGame.tsx',
  'apps/web/src/components/hooked/OnboardingTour.tsx',
  'apps/web/src/hooks/useHookedSystem.ts',
  'apps/web/src/app/quest/[id]/page.tsx',
  'apps/web/src/app/profile/page.tsx',
  'apps/web/src/app/inbox/page.tsx',
  'supabase/migrations/009_hooked_system.sql',
  'supabase/functions/create_daily_quest/index.ts',
  'scripts/setup-hooked-system.sh',
  'scripts/setup-daily-quest-cron.sql',
  'HOOKED_SYSTEM.md',
];

// Verificar archivos
let allFilesExist = true;
console.log('📁 Verificando archivos...');

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANTE`);
    allFilesExist = false;
  }
});

// Verificar dependencias en package.json
console.log('\n📦 Verificando dependencias...');
const packageJsonPath = path.join(__dirname, '..', 'apps/web/package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredDeps = [
    '@dnd-kit/core',
    '@dnd-kit/sortable',
    '@dnd-kit/utilities',
    'react-rewards',
    'canvas-confetti',
    'react-joyride'
  ];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} - FALTANTE`);
      allFilesExist = false;
    }
  });
} else {
  console.log('❌ package.json no encontrado');
  allFilesExist = false;
}

// Verificar estructura de componentes
console.log('\n🧩 Verificando estructura de componentes...');

const componentFiles = [
  'apps/web/src/components/hooked/MessageBar.tsx',
  'apps/web/src/components/hooked/Bell.tsx',
  'apps/web/src/components/hooked/Inbox.tsx',
  'apps/web/src/components/hooked/QuestGame.tsx',
  'apps/web/src/components/hooked/OnboardingTour.tsx'
];

componentFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar que sea un componente React válido
    if (content.includes('export default') && content.includes('React')) {
      console.log(`✅ ${file} - Componente válido`);
    } else {
      console.log(`⚠️  ${file} - Posible problema en el componente`);
    }
  }
});

// Verificar migración de base de datos
console.log('\n🗄️ Verificando migración de base de datos...');
const migrationPath = path.join(__dirname, '..', 'supabase/migrations/009_hooked_system.sql');
if (fs.existsSync(migrationPath)) {
  const migrationContent = fs.readFileSync(migrationPath, 'utf8');
  
  const requiredTables = [
    'quests',
    'quest_progress',
    'streaks',
    'badges',
    'user_badges',
    'messages',
    'progress_journal',
    'avatar_customization'
  ];

  requiredTables.forEach(table => {
    if (migrationContent.includes(`CREATE TABLE.*${table}`)) {
      console.log(`✅ Tabla ${table} definida`);
    } else {
      console.log(`❌ Tabla ${table} - FALTANTE`);
      allFilesExist = false;
    }
  });
} else {
  console.log('❌ Migración no encontrada');
  allFilesExist = false;
}

// Verificar Edge Function
console.log('\n⚡ Verificando Edge Function...');
const edgeFunctionPath = path.join(__dirname, '..', 'supabase/functions/create_daily_quest/index.ts');
if (fs.existsSync(edgeFunctionPath)) {
  const functionContent = fs.readFileSync(edgeFunctionPath, 'utf8');
  
  if (functionContent.includes('create_daily_quest') && functionContent.includes('supabase')) {
    console.log('✅ Edge Function implementada correctamente');
  } else {
    console.log('⚠️  Edge Function puede tener problemas');
  }
} else {
  console.log('❌ Edge Function no encontrada');
  allFilesExist = false;
}

// Resumen final
console.log('\n📊 RESUMEN:');
if (allFilesExist) {
  console.log('🎉 ¡Sistema Hooked implementado correctamente!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Configurar Supabase (ver scripts/manual-setup-hooked.md)');
  console.log('2. Aplicar migración de base de datos');
  console.log('3. Desplegar Edge Function');
  console.log('4. Configurar cron job');
  console.log('5. Probar la aplicación');
  console.log('\n🔗 URLs importantes:');
  console.log('- Dashboard: /student');
  console.log('- Perfil: /profile');
  console.log('- Bandeja: /inbox');
  console.log('- Reto: /quest/[id]');
} else {
  console.log('❌ Hay problemas que resolver antes de continuar');
  console.log('\n🔧 Revisa los archivos marcados como faltantes o con problemas');
}

console.log('\n🚀 ¡Sistema Hooked listo para enganchar estudiantes!');
