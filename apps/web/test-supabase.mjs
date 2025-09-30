import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
  try {
    // Test database connection
    const { error: testError } = await supabase
      .from('classes')
      .select('count(*)', { count: 'exact', head: true });
      
    if (testError) {
      console.log('❌ Database connection failed:', JSON.stringify(testError, null, 2));
      
      // Try to create the classes table if it doesn't exist
      if (testError.message.includes('relation') || testError.message.includes('does not exist')) {
        console.log('⚠️  Classes table might not exist. Migrations may need to be run.');
      }
      return;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📊 Classes table exists and is accessible');
    
    // Check enrollments table
    const { error: enrollError } = await supabase
      .from('enrollments')
      .select('count(*)', { count: 'exact', head: true });
      
    if (!enrollError) {
      console.log('✅ Enrollments table exists');
    } else {
      console.log('⚠️  Enrollments table not found');
    }
    
    // Check assignments table  
    const { error: assignError } = await supabase
      .from('assignments')
      .select('count(*)', { count: 'exact', head: true });
      
    if (!assignError) {
      console.log('✅ Assignments table exists');
    } else {
      console.log('⚠️  Assignments table not found');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

testConnection();
