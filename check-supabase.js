// Quick Supabase check script
const SUPABASE_URL = 'https://kadskpttrlbdzywhxcdj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZHNrcHR0cmxiZHp5d2h4Y2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDgzOTEsImV4cCI6MjA3Njc4NDM5MX0.JDLYxGz0gDDZbAI5S5fmIgIyGxb6eHMB2hp5E4pkUfI';

async function checkTimerStates() {
  console.log('Checking ALL timer states...');
  const response = await fetch(`${SUPABASE_URL}/rest/v1/timer_states`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  const data = await response.json();
  console.log('All timer states:', JSON.stringify(data, null, 2));
  console.log('\nTotal timer states:', data.length);
  
  const activeCount = data.filter(t => t.is_running).length;
  console.log('Active timers (is_running=true):', activeCount);
}

checkTimerStates().catch(console.error);
