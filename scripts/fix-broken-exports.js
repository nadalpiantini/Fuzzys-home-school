#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Archivos con exports mal insertados
const brokenFiles = [
  'apps/web/src/app/api/games/next/route.ts',
  'apps/web/src/app/api/jobs/run/route.ts',
  'apps/web/src/app/api/pool/category/route.ts',
  'apps/web/src/app/api/pool/ensure/route.ts',
  'apps/web/src/app/api/pool/usage/route.ts',
];

function fixBrokenExports(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Buscar el patrón problemático y arreglarlo
    const lines = content.split('\n');
    const fixedLines = [];
    let inCreateClient = false;
    let createClientStart = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detectar inicio de createClient
      if (line.includes('const supabase = createClient(') || line.includes('const supabase = createClient(')) {
        inCreateClient = true;
        createClientStart = i;
        fixedLines.push(line);
        continue;
      }
      
      // Si estamos en createClient y encontramos exports, moverlos al final
      if (inCreateClient && line.includes('export const')) {
        // Saltar esta línea por ahora, la agregaremos después
        continue;
      }
      
      // Si encontramos el cierre de createClient
      if (inCreateClient && line.includes(');')) {
        fixedLines.push(line);
        // Agregar los exports después del cierre
        fixedLines.push('');
        fixedLines.push('// Evitar ejecución en build time');
        fixedLines.push('export const dynamic = \'force-dynamic\';');
        fixedLines.push('export const revalidate = 0;');
        fixedLines.push('export const runtime = \'nodejs\';');
        inCreateClient = false;
        continue;
      }
      
      fixedLines.push(line);
    }
    
    const newContent = fixedLines.join('\n');
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Fixed broken exports in: ${filePath}`);
      return true;
    } else {
      console.log(`✅ No issues found in: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Fixing broken exports in API routes...\n');
  
  let successCount = 0;
  let totalCount = brokenFiles.length;
  
  brokenFiles.forEach(route => {
    if (fixBrokenExports(route)) {
      successCount++;
    }
  });
  
  console.log(`\n📊 Results: ${successCount}/${totalCount} files processed successfully`);
  
  if (successCount === totalCount) {
    console.log('🎉 All broken exports fixed!');
  } else {
    console.log('⚠️  Some files could not be processed. Check the errors above.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixBrokenExports };
