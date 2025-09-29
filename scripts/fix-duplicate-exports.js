#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Rutas API que tienen exports duplicados
const apiRoutes = [
  'apps/web/src/app/api/brain/configure/route.ts',
  'apps/web/src/app/api/brain/schedulers/generate-weekly/route.ts',
  'apps/web/src/app/api/brain/status/route.ts',
  'apps/web/src/app/api/brain/worker/route.ts',
  'apps/web/src/app/api/games/[id]/metrics/route.ts',
];

function fixDuplicateExports(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Buscar y eliminar exports duplicados
    const lines = content.split('\n');
    const cleanedLines = [];
    const seenExports = new Set();
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Si es un export que ya hemos visto, saltarlo
      if (trimmedLine.startsWith('export const runtime =') && seenExports.has('runtime')) {
        console.log(`  🔧 Removing duplicate: ${trimmedLine}`);
        continue;
      }
      
      // Si es un export, marcarlo como visto
      if (trimmedLine.startsWith('export const runtime =')) {
        seenExports.add('runtime');
      }
      if (trimmedLine.startsWith('export const dynamic =')) {
        seenExports.add('dynamic');
      }
      if (trimmedLine.startsWith('export const revalidate =')) {
        seenExports.add('revalidate');
      }
      
      cleanedLines.push(line);
    }
    
    const newContent = cleanedLines.join('\n');
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Fixed duplicates in: ${filePath}`);
      return true;
    } else {
      console.log(`✅ No duplicates found in: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Fixing duplicate exports in API routes...\n');
  
  let successCount = 0;
  let totalCount = apiRoutes.length;
  
  apiRoutes.forEach(route => {
    if (fixDuplicateExports(route)) {
      successCount++;
    }
  });
  
  console.log(`\n📊 Results: ${successCount}/${totalCount} files processed successfully`);
  
  if (successCount === totalCount) {
    console.log('🎉 All duplicate exports fixed!');
  } else {
    console.log('⚠️  Some files could not be processed. Check the errors above.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixDuplicateExports };
