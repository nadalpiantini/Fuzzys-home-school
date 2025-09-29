#!/usr/bin/env node

/**
 * Script de verificación de personalidad de Fuzzy
 * Verifica que todos los componentes estén en su lugar
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando personalidad de Fuzzy...\n');

// Verificar archivos críticos
const criticalFiles = [
  'apps/web/src/lib/tutor/prompt.ts',
  'apps/web/src/lib/tutor/compose.ts',
  'apps/web/src/lib/tutor/prompt.test.ts',
  'apps/web/src/app/api/tutor/route.ts'
];

let allFilesExist = true;

criticalFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANTE`);
    allFilesExist = false;
  }
});

// Verificar contenido del prompt
const promptPath = path.join(process.cwd(), 'apps/web/src/lib/tutor/prompt.ts');
if (fs.existsSync(promptPath)) {
  const content = fs.readFileSync(promptPath, 'utf8');
  const personalityTriggers = [
    '¡Qué genial!',
    '¡Excelente!',
    '¡Vamos a por ello!',
    'MI PERSONALIDAD',
    'súper entusiasta',
    'SIEMPRE mantén tu personalidad'
  ];
  
  console.log('\n🎭 Verificando expresiones de personalidad:');
  personalityTriggers.forEach(trigger => {
    if (content.includes(trigger)) {
      console.log(`✅ "${trigger}"`);
    } else {
      console.log(`❌ "${trigger}" - FALTANTE`);
      allFilesExist = false;
    }
  });
}

// Verificar protecciones
console.log('\n🔒 Verificando protecciones:');

// Verificar .cursorrules
const cursorRulesPath = path.join(process.cwd(), '.cursorrules');
if (fs.existsSync(cursorRulesPath)) {
  const cursorContent = fs.readFileSync(cursorRulesPath, 'utf8');
  if (cursorContent.includes('apps/web/src/lib/tutor/prompt.ts') && 
      cursorContent.includes('apps/web/src/lib/tutor/compose.ts')) {
    console.log('✅ Archivos protegidos en .cursorrules');
  } else {
    console.log('❌ Protecciones faltantes en .cursorrules');
    allFilesExist = false;
  }
} else {
  console.log('❌ .cursorrules no encontrado');
  allFilesExist = false;
}

// Verificar pre-commit hook
const preCommitPath = path.join(process.cwd(), '.git/hooks/pre-commit');
if (fs.existsSync(preCommitPath)) {
  console.log('✅ Pre-commit hook instalado');
} else {
  console.log('❌ Pre-commit hook faltante');
  allFilesExist = false;
}

// Verificar package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageContent = fs.readFileSync(packageJsonPath, 'utf8');
  if (packageContent.includes('test:tutor') && packageContent.includes('npm run test:tutor')) {
    console.log('✅ Scripts de test en package.json');
  } else {
    console.log('❌ Scripts de test faltantes en package.json');
    allFilesExist = false;
  }
} else {
  console.log('❌ package.json no encontrado');
  allFilesExist = false;
}

console.log('\n' + '='.repeat(50));

if (allFilesExist) {
  console.log('🎉 ¡Fuzzy está completamente blindado!');
  console.log('🔒 Personalidad protegida contra regresiones');
  console.log('🧪 Tests automáticos en prebuild');
  console.log('🛡️ Protecciones en Cursor y Git');
  console.log('\n💡 Para probar Fuzzy:');
  console.log('   1. npm run dev');
  console.log('   2. Ve a /tutor');
  console.log('   3. Pregunta: "Explícame fracciones para 3ro en 3 pasos"');
  console.log('   4. Debe responder con "¡Genial!", "¡Qué interesante!", etc.');
} else {
  console.log('❌ Hay problemas que necesitan ser resueltos');
  process.exit(1);
}
