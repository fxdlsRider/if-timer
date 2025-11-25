// Check timer_states for current user
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkTimerStates() {
  console.log('🔍 Checking timer_states table...\n');

  const { data: states, error } = await supabase
    .from('timer_states')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!states || states.length === 0) {
    console.log('📭 No timer states found');
    return;
  }

  console.log(`Found ${states.length} timer state(s):\n`);

  states.forEach((s, i) => {
    console.log(`\n--- Timer State #${i + 1} ---`);
    console.log('User ID:', s.user_id);
    console.log('Hours:', s.hours);
    console.log('Angle:', s.angle);
    console.log('Is Running:', s.is_running);
    console.log('Is Extended:', s.is_extended);
    console.log('Target Time:', s.target_time ? new Date(s.target_time).toLocaleString() : 'null');
    console.log('Original Goal Time:', s.original_goal_time ? new Date(s.original_goal_time).toLocaleString() : 'null');
    console.log('Created:', new Date(s.created_at).toLocaleString());
    console.log('Updated:', new Date(s.updated_at).toLocaleString());
  });
}

checkTimerStates();
