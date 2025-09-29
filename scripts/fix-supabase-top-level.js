#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Archivos que necesitan ser arreglados
const filesToFix = [
  'apps/web/src/lib/cultural-context/CulturalContextService.ts',
  'apps/web/src/lib/auth/server-auth.ts',
  'apps/web/src/app/api/jobs/run/route.ts',
  'apps/web/src/app/api/games/next/route.ts',
  'apps/web/src/app/api/pool/ensure/route.ts',
  'apps/web/src/app/api/pool/category/route.ts',
  'apps/web/src/app/api/pool/usage/route.ts',
];

function fixSupabaseTopLevel(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar si ya está arreglado
    if (content.includes('getSupabaseServer(') && !content.includes('const supabase = createClient(')) {
      console.log(`✅ Already fixed: ${filePath}`);
      return true;
    }

    let newContent = content;
    
    // Reemplazar imports de createClient
    newContent = newContent.replace(
      /import { createClient } from '@supabase\/supabase-js';/g,
      "import { getSupabaseServer } from '@/lib/supabase/server';"
    );
    
    // Reemplazar instancias top-level de createClient
    newContent = newContent.replace(
      /const supabase = createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL!,\s*process\.env\.SUPABASE_SERVICE_KEY!,\s*\);?/g,
      ''
    );
    
    newContent = newContent.replace(
      /const supabase = createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL!,\s*process\.env\.SUPABASE_SERVICE_ROLE_KEY!,\s*\);?/g,
      ''
    );
    
    newContent = newContent.replace(
      /const supabase = createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL!,\s*process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY!,\s*\);?/g,
      ''
    );

    // Agregar factory call en funciones que usan supabase
    const lines = newContent.split('\n');
    const fixedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Si encontramos una función que usa supabase, agregar la factory call
      if (line.includes('async ') && line.includes('(') && 
          (lines[i + 1]?.includes('await supabase') || lines[i + 2]?.includes('await supabase'))) {
        fixedLines.push(line);
        
        // Buscar la siguiente línea que no sea comentario o vacía
        let nextLine = i + 1;
        while (nextLine < lines.length && (lines[nextLine].trim() === '' || lines[nextLine].trim().startsWith('//') || lines[nextLine].trim().startsWith('/*'))) {
          fixedLines.push(lines[nextLine]);
          nextLine++;
        }
        
        // Agregar la factory call
        fixedLines.push('    const supabase = getSupabaseServer(true); // useServiceRole = true');
        fixedLines.push('');
        
        // Continuar con el resto
        for (let j = nextLine; j < lines.length; j++) {
          fixedLines.push(lines[j]);
        }
        break;
      } else {
        fixedLines.push(line);
      }
    }
    
    const finalContent = fixedLines.join('\n');
    
    if (finalContent !== content) {
      fs.writeFileSync(filePath, finalContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`✅ No changes needed: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Fixing Supabase top-level instances...\n');
  
  let successCount = 0;
  let totalCount = filesToFix.length;
  
  filesToFix.forEach(file => {
    if (fixSupabaseTopLevel(file)) {
      successCount++;
    }
  });
  
  console.log(`\n📊 Results: ${successCount}/${totalCount} files processed successfully`);
  
  if (successCount === totalCount) {
    console.log('🎉 All Supabase top-level instances fixed!');
  } else {
    console.log('⚠️  Some files could not be processed. Check the errors above.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixSupabaseTopLevel };
