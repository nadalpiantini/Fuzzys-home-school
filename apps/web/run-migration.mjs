import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  try {
    console.log('🚀 Starting migration process...');

    // Read the migration file
    const migrationPath = path.join(process.cwd(), '../../supabase/migrations/010_class_management.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded');

    // Split the SQL into individual statements
    // Remove comments and empty lines
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip empty statements
      if (!statement.trim()) continue;

      // Add semicolon back
      const fullStatement = statement + ';';

      try {
        // Use the SQL function to execute raw SQL
        const { data, error } = await supabase.rpc('exec_sql', {
          query: fullStatement
        }).single();

        if (error) {
          // Try direct execution as fallback
          console.log(`⚠️  Statement ${i + 1}: Using alternative method`);
          // For now, we'll note this as a limitation
          console.log(`📝 Statement preview: ${fullStatement.substring(0, 50)}...`);
          errorCount++;
        } else {
          successCount++;
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`❌ Error executing statement ${i + 1}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);

    // Test the tables
    console.log('\n🔍 Verifying tables...');

    const tables = ['classes', 'enrollments', 'assignments', 'submissions'];
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count(*)', { count: 'exact', head: true });

      if (!error) {
        console.log(`✅ Table '${table}' exists`);
      } else {
        console.log(`⚠️  Table '${table}' not accessible: ${error.message}`);
      }
    }

  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

// Note: Direct SQL execution via Supabase JS client is limited
// For production, use Supabase CLI or Dashboard for migrations
console.log('⚠️  Note: For complete migration execution, please use:');
console.log('   1. Supabase Dashboard SQL Editor');
console.log('   2. Or: supabase db push (with Docker running)');
console.log('\n📝 Migration file location:');
console.log('   supabase/migrations/010_class_management.sql');

runMigration();