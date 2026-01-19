// Check all active timers
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkActiveTimers() {
  console.log('🔍 Checking all active timers...\n');

  // Get all active timer states
  const { data: states, error: statesError } = await supabase
    .from('timer_states')
    .select('*')
    .eq('is_running', true)
    .order('created_at', { ascending: false });

  if (statesError) {
    console.log('❌ Error:', statesError.message);
    return;
  }

  if (!states || states.length === 0) {
    console.log('No active timers found');
    return;
  }

  // Get all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, nickname, name');

  const profileMap = new Map();
  if (profiles) {
    profiles.forEach(p => {
      profileMap.set(p.user_id, p.nickname || p.name || 'Unknown');
    });
  }

  console.log(`✅ Found ${states.length} active timer(s):\n`);
  console.log('='.repeat(80));

  states.forEach((state, index) => {
    const username = profileMap.get(state.user_id) || 'Unknown';
    const now = new Date();
    
    // Calculate start time from target_time and hours
    let startTime = null;
    let elapsedTime = null;
    
    if (state.target_time && state.hours) {
      const targetDate = new Date(state.target_time);
      const hoursInMs = state.hours * 3600 * 1000;
      startTime = new Date(targetDate.getTime() - hoursInMs);
      
      // Calculate elapsed time
      const elapsedMs = now.getTime() - startTime.getTime();
      const elapsedHours = Math.floor(elapsedMs / 3600000);
      const elapsedMinutes = Math.floor((elapsedMs % 3600000) / 60000);
      elapsedTime = `${elapsedHours}h ${elapsedMinutes}m`;
      
      // Check if in extended mode
      const isOverGoal = now.getTime() > targetDate.getTime();
      if (isOverGoal) {
        const overtimeMs = now.getTime() - targetDate.getTime();
        const overtimeHours = Math.floor(overtimeMs / 3600000);
        const overtimeMinutes = Math.floor((overtimeMs % 3600000) / 60000);
        elapsedTime += ` (Extended: +${overtimeHours}h ${overtimeMinutes}m)`;
      }
    }

    console.log(`\n📊 Timer #${index + 1}: ${username}`);
    console.log('─'.repeat(80));
    console.log(`User ID:     ${state.user_id}`);
    console.log(`Goal:        ${state.hours}h`);
    console.log(`Angle:       ${state.angle}°`);
    
    if (startTime) {
      console.log(`Started:     ${startTime.toLocaleString('de-DE', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })}`);
    }
    
    if (state.target_time) {
      const targetDate = new Date(state.target_time);
      console.log(`Target:      ${targetDate.toLocaleString('de-DE', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })}`);
    }
    
    if (elapsedTime) {
      console.log(`Elapsed:     ${elapsedTime}`);
    }
    
    console.log(`Extended:    ${state.is_extended ? '✅ YES' : '❌ NO'}`);
    console.log(`Created:     ${new Date(state.created_at).toLocaleString('de-DE')}`);
    console.log(`Updated:     ${new Date(state.updated_at).toLocaleString('de-DE')}`);
  });

  console.log('\n' + '='.repeat(80));
}

checkActiveTimers().catch(console.error);
