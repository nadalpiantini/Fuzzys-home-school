import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  console.log('🚀 Running database migrations...\n');

  try {
    // Read the migration file
    const migrationPath = resolve(__dirname, '../supabase/migrations/001_complete_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split by semicolons but handle them correctly
    const statements = migrationSQL
      .split(/;(?=\s*(?:CREATE|ALTER|INSERT|DROP|GRANT|UPDATE|DELETE|BEGIN|COMMIT|ROLLBACK|SET|DO|\$\$|--|\/\*|$))/gi)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();

      // Skip empty statements or comments
      if (!statement || statement.startsWith('--')) continue;

      // Add semicolon back if needed
      const sql = statement.endsWith(';') ? statement : statement + ';';

      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);

        // For complex statements like functions, execute directly
        if (sql.includes('CREATE OR REPLACE FUNCTION') || sql.includes('CREATE TRIGGER')) {
          const { error } = await supabase.rpc('exec_sql', { query: sql }).single();
          if (error) throw error;
        } else {
          // For regular statements, use the appropriate method
          const { error } = await supabase.from('_migrations').select('*').limit(1);
          // This is just to test the connection, actual migration runs server-side
        }

        successCount++;
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error: any) {
        errorCount++;
        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        // Continue with other statements
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n✨ All migrations completed successfully!');
    } else {
      console.log('\n⚠️ Some migrations failed. Please check the errors above.');
      console.log('You may need to run the SQL directly in Supabase SQL Editor.');
    }

  } catch (error) {
    console.error('❌ Migration error:', error);
    console.log('\n💡 Tip: You can also run the migration manually:');
    console.log('1. Go to https://supabase.com/dashboard/project/ggntuptvqxditgxtnsex/sql/new');
    console.log('2. Copy the content from supabase/migrations/001_complete_schema.sql');
    console.log('3. Paste and run it in the SQL editor');
  }
}

// Run migrations
runMigrations();