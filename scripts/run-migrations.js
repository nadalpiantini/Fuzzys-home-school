const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  console.log('Running database migrations...');

  const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    console.log(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    try {
      // Note: Supabase doesn't directly support running raw SQL via the JS client
      // You should run these migrations through the Supabase SQL editor
      console.log(`Please run the following migration in Supabase SQL editor:`);
      console.log(`File: ${file}`);
      console.log('---');
      console.log(sql.substring(0, 500) + '...');
      console.log('---');
    } catch (error) {
      console.error(`Error running migration ${file}:`, error);
    }
  }

  console.log('\nTo run migrations:');
  console.log('1. Go to https://ggntuptvqxditgxtnsex.supabase.co');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste the contents of db/migrations/001_initial_schema.sql');
  console.log('4. Run the SQL');
}

runMigrations();