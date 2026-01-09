// Database Connection Test Script
// Run this to verify MFA table exists

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase credentials
const supabase = createClient(
  'https://hntttwcudnetgufhpelf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudHR0d2N1ZG5ldGd1ZmhwZWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NjM2MzUsImV4cCI6MjA4MjMzOTYzNX0.acccYuow8CaDPEqE1wGhekoEaGWpUmz3YYagWCK7ejQ'
);

async function testDatabase() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test 1: Check if user_mfa table exists
    console.log('📋 Checking if user_mfa table exists...');
    const { data: tables, error: tableError } = await supabase
      .from('user_mfa')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ user_mfa table error:', tableError);
      console.log('💡 Solution: Run the MFA table creation script in Supabase SQL Editor');
    } else {
      console.log('✅ user_mfa table exists and is accessible');
    }
    
    // Test 2: Check if profiles table exists
    console.log('📋 Checking if profiles table exists...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.error('❌ profiles table error:', profileError);
    } else {
      console.log('✅ profiles table exists and is accessible');
    }
    
    // Test 3: List all tables in public schema
    console.log('📋 Listing all tables in public schema...');
    const { data: allTables } = await supabase
      .rpc('get_all_tables'); // This might not exist, but worth trying
    
    console.log('📊 Database test complete');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase();
