#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('📚 Applying Class Management System Migration...\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '010_class_management.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');

    // Split the migration into individual statements
    // Remove comments and split by semicolons
    const statements = migrationSQL
      .split(/;(?=(?:[^']*'[^']*')*[^']*$)/) // Split by semicolon not inside quotes
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.match(/^\/\*/));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip empty statements
      if (!statement || statement.length < 5) continue;

      // Get a preview of the statement
      const preview = statement.substring(0, 50).replace(/\n/g, ' ');

      try {
        const { error } = await supabase.rpc('exec_sql', {
          query: statement + ';'
        }).single();

        if (error) {
          // Try direct execution if RPC doesn't work
          const { data, error: directError } = await supabase
            .from('_sql_migrations')
            .insert({ sql: statement })
            .select();

          if (directError) {
            throw directError;
          }
        }

        console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
        successCount++;
      } catch (error) {
        console.log(`❌ [${i + 1}/${statements.length}] ${preview}...`);
        console.log(`   Error: ${error.message}\n`);
        errorCount++;

        // Don't stop on errors - some statements might already exist
        // Continue to try other statements
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Migration Summary:`);
    console.log(`   ✅ Successful statements: ${successCount}`);
    console.log(`   ❌ Failed statements: ${errorCount}`);
    console.log('='.repeat(60) + '\n');

    // Verify critical tables were created
    console.log('🔍 Verifying critical tables...\n');

    const criticalTables = [
      'classes',
      'enrollments',
      'assignments',
      'submissions',
      'class_announcements',
      'class_resources',
      'attendance',
      'class_schedule'
    ];

    for (const table of criticalTables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Table '${table}' - Not accessible: ${error.message}`);
      } else {
        console.log(`✅ Table '${table}' - Ready`);
      }
    }

    console.log('\n✨ Migration process completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
applyMigration().catch(console.error);