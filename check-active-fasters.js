// Check active fasters with nicknames
const SUPABASE_URL = 'https://kadskpttrlbdzywhxcdj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZHNrcHR0cmxiZHp5d2h4Y2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDgzOTEsImV4cCI6MjA3Njc4NDM5MX0.JDLYxGz0gDDZbAI5S5fmIgIyGxb6eHMB2hp5E4pkUfI';

async function checkActiveFasters() {
  console.log('\n=== CHECKING ACTIVE FASTERS ===\n');

  // Step 1: Get all timer states with is_running = true
  const timerResponse = await fetch(`${SUPABASE_URL}/rest/v1/timer_states?is_running=eq.true&select=*`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  const timerStates = await timerResponse.json();
  console.log(`Found ${timerStates.length} active timer(s):\n`);

  if (timerStates.length === 0) {
    console.log('No active timers found.');
    return;
  }

  // Step 2: Get profiles for these users
  const userIds = timerStates.map(t => t.user_id);
  const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=in.(${userIds.join(',')})&select=user_id,nickname`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  const profiles = await profileResponse.json();

  // Create nickname map
  const nicknameMap = {};
  profiles.forEach(p => {
    nicknameMap[p.user_id] = p.nickname || 'Anonymous';
  });

  // Step 3: Display results
  timerStates.forEach((timer, index) => {
    const nickname = nicknameMap[timer.user_id] || 'Anonymous';
    console.log(`${index + 1}. User: ${nickname}`);
    console.log(`   User ID: ${timer.user_id}`);
    console.log(`   Hours: ${timer.hours}h`);
    console.log(`   Is Running: ${timer.is_running}`);
    console.log(`   Target Time: ${timer.target_time || 'null'}`);
    console.log(`   Is Extended: ${timer.is_extended}`);
    console.log(`   Updated At: ${timer.updated_at}`);
    console.log('');
  });
}

checkActiveFasters().catch(console.error);
