// Check fasts for user schedefi
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkSchedefiFasts() {
  const userId = '27c1dea8-3376-46d8-94af-ae9f900d0843';

  console.log('🔍 Checking fasts for user schedefi...\n');
  console.log(`User ID: ${userId}\n`);

  // Try to get fasts (will likely fail due to RLS)
  const { data: fasts, error } = await supabase
    .from('fasts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.log('❌ Cannot read fasts from database (RLS is blocking)');
    console.log(`Error: ${error.message}\n`);
    console.log('ℹ️  This is expected - we need to be authenticated as schedefi to see the data.');
    console.log('ℹ️  The data EXISTS in the database, but RLS prevents anonymous access.\n');
    console.log('Options to verify:');
    console.log('1. Ask schedefi to check their "My Journey" in the Dashboard');
    console.log('2. Check Supabase Dashboard directly (with admin access)');
    console.log('3. Use SERVICE_ROLE_KEY (bypasses RLS - but not in .env)');
    return;
  }

  if (!fasts || fasts.length === 0) {
    console.log('No fasts found for schedefi');
    return;
  }

  console.log(`✅ Found ${fasts.length} fast(s) for schedefi:\n`);
  console.log('='.repeat(80));

  fasts.forEach((fast, index) => {
    const durationInHours = fast.unit === 'seconds' ? fast.duration / 3600 : fast.duration;
    const startDate = new Date(fast.start_time);
    const endDate = new Date(fast.end_time);

    console.log(`\n📊 Fast #${index + 1}:`);
    console.log('─'.repeat(80));
    console.log(`ID:       ${fast.id}`);
    console.log(`Started:  ${startDate.toLocaleString('de-DE', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`);
    console.log(`Stopped:  ${endDate.toLocaleString('de-DE', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`);
    console.log(`Duration: ${durationInHours.toFixed(2)}h`);
    console.log(`Goal:     ${fast.original_goal}${fast.unit}`);
    console.log(`Status:   ${fast.cancelled ? '❌ Cancelled' : '✅ Completed'}`);
    console.log(`Created:  ${new Date(fast.created_at).toLocaleString('de-DE')}`);
  });

  console.log('\n' + '='.repeat(80));
}

checkSchedefiFasts().catch(console.error);
