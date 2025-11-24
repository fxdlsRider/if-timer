// Test script for cleanup_expired_timers SQL function
// This tests Layer 3 (Server-side Cleanup)

const SUPABASE_URL = 'https://kadskpttrlbdzywhxcdj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZHNrcHR0cmxiZHp5d2h4Y2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDgzOTEsImV4cCI6MjA3Njc4NDM5MX0.JDLYxGz0gDDZbAI5S5fmIgIyGxb6eHMB2hp5E4pkUfI';

async function testCleanupFunction() {
  console.log('\n========================================');
  console.log('  TESTING CLEANUP FUNCTION (Layer 3)');
  console.log('========================================\n');

  // Step 1: Check current active timers BEFORE cleanup
  console.log('STEP 1: Checking active timers BEFORE cleanup...\n');

  const beforeResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/timer_states?is_running=eq.true&select=user_id,hours,target_time,updated_at`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    }
  );

  const beforeData = await beforeResponse.json();
  console.log(`Found ${beforeData.length} active timer(s):`);

  beforeData.forEach((timer, i) => {
    const targetDate = new Date(timer.target_time);
    const now = new Date();
    const isExpired = targetDate < now;

    console.log(`\n${i + 1}. User ID: ${timer.user_id}`);
    console.log(`   Hours: ${timer.hours}h`);
    console.log(`   Target Time: ${timer.target_time}`);
    console.log(`   Status: ${isExpired ? '🔴 EXPIRED (should be cleaned)' : '🟢 Active (OK)'}`);

    if (isExpired) {
      const diff = Math.round((now - targetDate) / 1000 / 60);
      console.log(`   Expired ${diff} minutes ago`);
    }
  });

  // Step 2: Call cleanup function
  console.log('\n\nSTEP 2: Calling cleanup_expired_timers()...\n');

  try {
    const cleanupResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/cleanup_expired_timers`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!cleanupResponse.ok) {
      const errorText = await cleanupResponse.text();
      console.error('❌ Cleanup function call failed!');
      console.error('Status:', cleanupResponse.status);
      console.error('Error:', errorText);

      if (cleanupResponse.status === 404) {
        console.error('\n⚠️  FUNCTION NOT FOUND!');
        console.error('You need to create the SQL function first.');
        console.error('Run this in Supabase SQL Editor:');
        console.error('   database/functions/cleanup_expired_timers.sql');
      }

      return;
    }

    const cleanupData = await cleanupResponse.json();
    const result = cleanupData[0] || { cleaned_count: 0, cleaned_user_ids: [] };

    console.log('✅ Cleanup function executed successfully!');
    console.log(`\nCleaned: ${result.cleaned_count} timer(s)`);

    if (result.cleaned_count > 0) {
      console.log('User IDs cleaned:');
      result.cleaned_user_ids.forEach((id, i) => {
        console.log(`  ${i + 1}. ${id}`);
      });
    }
  } catch (error) {
    console.error('❌ Exception during cleanup:', error.message);
    return;
  }

  // Step 3: Check active timers AFTER cleanup
  console.log('\n\nSTEP 3: Checking active timers AFTER cleanup...\n');

  await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms

  const afterResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/timer_states?is_running=eq.true&select=user_id,hours,target_time,updated_at`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    }
  );

  const afterData = await afterResponse.json();
  console.log(`Found ${afterData.length} active timer(s):`);

  if (afterData.length === 0) {
    console.log('  (none - all expired timers cleaned! ✅)');
  } else {
    afterData.forEach((timer, i) => {
      const targetDate = new Date(timer.target_time);
      const now = new Date();
      const isExpired = targetDate < now;

      console.log(`\n${i + 1}. User ID: ${timer.user_id}`);
      console.log(`   Hours: ${timer.hours}h`);
      console.log(`   Target Time: ${timer.target_time}`);
      console.log(`   Status: ${isExpired ? '🔴 STILL EXPIRED (!)' : '🟢 Active (OK)'}`);
    });
  }

  // Summary
  console.log('\n========================================');
  console.log('  SUMMARY');
  console.log('========================================\n');
  console.log(`Before: ${beforeData.length} active timers`);
  console.log(`After:  ${afterData.length} active timers`);
  console.log(`Change: ${beforeData.length - afterData.length} timer(s) cleaned`);
  console.log();
}

// Run test
testCleanupFunction().catch(console.error);
