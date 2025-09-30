#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  console.log('🔌 Testing Supabase connection...\n');
  console.log('URL:', supabaseUrl);
  console.log('='.repeat(60) + '\n');

  try {
    // Test 1: Check basic connection
    console.log('📋 Fetching existing tables...\n');

    // List of tables we expect to exist
    const expectedTables = [
      'profiles',
      'users',
      'games',
      'classes',
      'enrollments',
      'assignments',
      'submissions',
      'class_announcements',
      'class_resources',
      'attendance',
      'class_schedule',
      'educational_platforms',
      'educational_content',
      'student_content_progress',
      'student_skill_assessments',
      'ai_quizzes',
      'quiz_questions',
      'quiz_attempts',
      'game_sessions',
      'game_participants',
      'srs_cards',
      'srs_review_history',
      'learning_analytics',
      'content_recommendations'
    ];

    const tableStatus = {};

    for (const table of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          if (error.message.includes('does not exist')) {
            tableStatus[table] = '❌ Does not exist';
          } else if (error.message.includes('permission denied')) {
            tableStatus[table] = '🔒 Exists but no permission';
          } else {
            tableStatus[table] = `⚠️ Error: ${error.message.substring(0, 30)}...`;
          }
        } else {
          tableStatus[table] = '✅ Accessible';
        }
      } catch (err) {
        tableStatus[table] = `❌ Error: ${err.message}`;
      }
    }

    // Display results
    console.log('📊 Table Status:\n');

    const coreTablesHeader = '=== CORE TABLES ===';
    console.log(coreTablesHeader);
    console.log('='.repeat(coreTablesHeader.length));

    const coreTables = ['profiles', 'users', 'games'];
    for (const table of coreTables) {
      if (tableStatus[table]) {
        console.log(`  ${table.padEnd(25)} ${tableStatus[table]}`);
      }
    }

    console.log('\n=== CLASS MANAGEMENT TABLES ===');
    console.log('================================');

    const classManagementTables = [
      'classes', 'enrollments', 'assignments', 'submissions',
      'class_announcements', 'class_resources', 'attendance', 'class_schedule'
    ];

    for (const table of classManagementTables) {
      if (tableStatus[table]) {
        console.log(`  ${table.padEnd(25)} ${tableStatus[table]}`);
      }
    }

    console.log('\n=== EDUCATIONAL PLATFORM TABLES ===');
    console.log('====================================');

    const educationalTables = [
      'educational_platforms', 'educational_content', 'student_content_progress',
      'student_skill_assessments', 'ai_quizzes', 'quiz_questions', 'quiz_attempts'
    ];

    for (const table of educationalTables) {
      if (tableStatus[table]) {
        console.log(`  ${table.padEnd(25)} ${tableStatus[table]}`);
      }
    }

    console.log('\n=== GAMING & SRS TABLES ===');
    console.log('===========================');

    const gamingTables = [
      'game_sessions', 'game_participants', 'srs_cards', 'srs_review_history'
    ];

    for (const table of gamingTables) {
      if (tableStatus[table]) {
        console.log(`  ${table.padEnd(25)} ${tableStatus[table]}`);
      }
    }

    console.log('\n=== ANALYTICS TABLES ===');
    console.log('========================');

    const analyticsTables = ['learning_analytics', 'content_recommendations'];

    for (const table of analyticsTables) {
      if (tableStatus[table]) {
        console.log(`  ${table.padEnd(25)} ${tableStatus[table]}`);
      }
    }

    // Summary
    const accessibleCount = Object.values(tableStatus).filter(s => s.includes('✅')).length;
    const missingCount = Object.values(tableStatus).filter(s => s.includes('Does not exist')).length;
    const errorCount = Object.values(tableStatus).filter(s => s.includes('⚠️') || (s.includes('❌') && !s.includes('Does not exist'))).length;

    console.log('\n' + '='.repeat(60));
    console.log('📈 SUMMARY:');
    console.log('='.repeat(60));
    console.log(`  ✅ Accessible tables: ${accessibleCount}/${expectedTables.length}`);
    console.log(`  ❌ Missing tables: ${missingCount}`);
    console.log(`  ⚠️ Tables with errors: ${errorCount}`);
    console.log('='.repeat(60) + '\n');

    if (missingCount > 0) {
      console.log('💡 To create missing tables, you need to:');
      console.log('   1. Go to Supabase Dashboard: ' + supabaseUrl);
      console.log('   2. Navigate to SQL Editor');
      console.log('   3. Run the migration files in supabase/migrations/');
      console.log('   4. Start with 010_class_management.sql');
      console.log('   5. Then run 011_educational_platforms.sql\n');
    }

    // Test write permission
    console.log('🔏 Testing write permissions...\n');

    try {
      const testData = {
        name: 'Test Platform',
        platform_type: 'quiz_ai',
        version: '1.0.0',
        config: {}
      };

      const { data, error } = await supabase
        .from('educational_platforms')
        .insert(testData)
        .select();

      if (error) {
        console.log('  ❌ Cannot write to educational_platforms:', error.message);
      } else {
        console.log('  ✅ Write permission confirmed');

        // Clean up test data
        if (data && data[0]) {
          await supabase
            .from('educational_platforms')
            .delete()
            .eq('id', data[0].id);
        }
      }
    } catch (err) {
      console.log('  ❌ Write test failed:', err.message);
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  }
}

// Run the test
testConnection().catch(console.error);