#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Rutas API que necesitan los exports de dynamic
const apiRoutes = [
  'apps/web/src/app/api/adaptive/route.ts',
  'apps/web/src/app/api/admin/ops/route.ts',
  'apps/web/src/app/api/brain/configure/route.ts',
  'apps/web/src/app/api/brain/schedulers/generate-weekly/route.ts',
  'apps/web/src/app/api/brain/status/route.ts',
  'apps/web/src/app/api/brain/train/route.ts',
  'apps/web/src/app/api/brain/worker/route.ts',
  'apps/web/src/app/api/cron/health/route.ts',
  'apps/web/src/app/api/deepseek/route.ts',
  'apps/web/src/app/api/external-games/route.ts',
  'apps/web/src/app/api/games/route.ts',
  'apps/web/src/app/api/games/next/route.ts',
  'apps/web/src/app/api/games/[id]/metrics/route.ts',
  'apps/web/src/app/api/jobs/run/route.ts',
  'apps/web/src/app/api/pool/category/route.ts',
  'apps/web/src/app/api/pool/ensure/route.ts',
  'apps/web/src/app/api/pool/usage/route.ts',
  'apps/web/src/app/api/quiz/generate/route.ts',
  'apps/web/src/app/api/trpc/[trpc]/route.ts',
];

const dynamicExports = `// Evitar ejecución en build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
`;

function addDynamicExports(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar si ya tiene los exports
    if (content.includes('export const dynamic = \'force-dynamic\'')) {
      console.log(`✅ Already has dynamic exports: ${filePath}`);
      return true;
    }

    // Buscar la primera línea de import
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Encontrar el final de los imports
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '' || lines[i].startsWith('//') || lines[i].startsWith('/*')) {
        continue;
      }
      if (lines[i].startsWith('import ') || lines[i].startsWith('const ') || lines[i].startsWith('let ') || lines[i].startsWith('var ')) {
        insertIndex = i + 1;
      } else {
        break;
      }
    }

    // Insertar los exports después de los imports
    lines.splice(insertIndex, 0, '', dynamicExports.trim());
    
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    console.log(`✅ Added dynamic exports to: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Adding dynamic exports to API routes...\n');
  
  let successCount = 0;
  let totalCount = apiRoutes.length;
  
  apiRoutes.forEach(route => {
    if (addDynamicExports(route)) {
      successCount++;
    }
  });
  
  console.log(`\n📊 Results: ${successCount}/${totalCount} files processed successfully`);
  
  if (successCount === totalCount) {
    console.log('🎉 All API routes now have dynamic exports!');
  } else {
    console.log('⚠️  Some files could not be processed. Check the errors above.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { addDynamicExports };
