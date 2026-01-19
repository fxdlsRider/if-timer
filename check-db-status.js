// Check database status
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkDBStatus() {
  console.log('🔍 Checking database status...\n');

  // Check fasts count
  const { count: fastsCount, error: fastsError } = await supabase
    .from('fasts')
    .select('*', { count: 'exact', head: true });

  console.log('📊 Fasts Table:');
  if (fastsError) {
    console.log(`   ❌ Error: ${fastsError.message}`);
  } else {
    console.log(`   Total fasts: ${fastsCount}`);
  }

  // Check timer states
  const { data: states, error: statesError } = await supabase
    .from('timer_states')
    .select('user_id, is_running, hours, updated_at');

  console.log('\n📊 Timer States:');
  if (statesError) {
    console.log(`   ❌ Error: ${statesError.message}`);
  } else {
    console.log(`   Total states: ${states?.length || 0}`);
    if (states && states.length > 0) {
      const running = states.filter(s => s.is_running);
      console.log(`   Active timers: ${running.length}`);
    }
  }

  // Check profiles
  const { count: profilesCount, error: profilesError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  console.log('\n📊 Profiles:');
  if (profilesError) {
    console.log(`   ❌ Error: ${profilesError.message}`);
  } else {
    console.log(`   Total users: ${profilesCount}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Summary:');
  console.log(`   Users: ${profilesCount || 0}`);
  console.log(`   Fasts: ${fastsCount || 0}`);
  console.log(`   Active Timers: ${states?.filter(s => s.is_running).length || 0}`);
}

checkDBStatus().catch(console.error);
