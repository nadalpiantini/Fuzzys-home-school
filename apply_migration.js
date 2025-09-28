const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuración de Supabase
const supabaseUrl = 'https://ggntuptvqxditgxtnsex.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbnR1cHR2cXhkaXRneHRuc2V4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTAxMDExNiwiZXhwIjoyMDc0NTg2MTE2fQ.3mNh9vlcJOwrK1IciLrtQa7HEUUps4rA_hjWoPzA0vQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Aplicando migración de Brain Engine...\n');

  try {
    // Leer el archivo de migración
    const migrationSQL = fs.readFileSync('APPLY_MIGRATION.sql', 'utf-8');
    
    console.log('📄 Contenido de la migración:');
    console.log(migrationSQL.substring(0, 200) + '...\n');

    // Ejecutar la migración usando RPC
    const { data, error } = await supabase.rpc('exec_sql', { 
      query: migrationSQL 
    });

    if (error) {
      console.error('❌ Error ejecutando migración:', error);
      return;
    }

    console.log('✅ Migración aplicada exitosamente!');
    console.log('📊 Resultado:', data);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Alternativa: Aplicar manualmente en Supabase SQL Editor:');
    console.log('1. Ve a https://supabase.com/dashboard/project/ggntuptvqxditgxtnsex/sql/new');
    console.log('2. Copia el contenido de APPLY_MIGRATION.sql');
    console.log('3. Pégalo y ejecuta en el SQL Editor');
  }
}

applyMigration();
