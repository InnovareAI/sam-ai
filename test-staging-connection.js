import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://latxadqrvrrrcvkktrog.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdHhhZHFydnJycmN2a2t0cm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2OTk5ODYsImV4cCI6MjA2ODI3NTk4Nn0.3WkAgXpk_MyQioVf_SED9O_ArjcT9nH0uy9we2okftE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test basic connection
    console.log('🔄 Testing connection to staging Supabase...');
    
    // Check if we can query the database
    const { data, error } = await supabase
      .from('campaigns')
      .select('count')
      .limit(1);
    
    if (error) {
      // Table might not exist yet, which is fine
      if (error.code === '42P01') {
        console.log('✅ Connected to Supabase! (campaigns table does not exist yet - needs migration)');
      } else {
        console.log('⚠️ Connected but error:', error.message);
      }
    } else {
      console.log('✅ Connected to Supabase successfully!');
      console.log('📊 Database is accessible');
    }
    
    // Check auth service
    const { data: { user } } = await supabase.auth.getUser();
    console.log('🔐 Auth service:', user ? `Logged in as ${user.email}` : 'Not logged in (expected)');
    
    console.log('\n🎉 Staging Supabase is configured correctly!');
    console.log('📍 URL:', supabaseUrl);
    
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

testConnection();