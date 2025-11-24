// Check RLS policies for timer_states table
const SUPABASE_URL = 'https://kadskpttrlbdzywhxcdj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZHNrcHR0cmxiZHp5d2h4Y2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDgzOTEsImV4cCI6MjA3Njc4NDM5MX0.JDLYxGz0gDDZbAI5S5fmIgIyGxb6eHMB2hp5E4pkUfI';

async function checkPolicies() {
  console.log('Checking RLS policies for timer_states table...\n');

  const query = `
    SELECT 
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE tablename = 'timer_states'
    ORDER BY policyname;
  `;

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    }
  );

  if (!response.ok) {
    console.error('Cannot query policies directly via REST API');
    console.log('\nPlease check policies in Supabase Dashboard:');
    console.log('https://supabase.com/dashboard/project/kadskpttrlbdzywhxcdj/database/policies');
    return;
  }

  const data = await response.json();
  console.log('Policies:', JSON.stringify(data, null, 2));
}

checkPolicies().catch(console.error);
