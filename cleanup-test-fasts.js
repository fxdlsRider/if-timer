// Cleanup Test Fasts Script
// Purpose: Remove all test fasts created during UI testing
// Usage: node cleanup-test-fasts.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function cleanupTestFasts() {
  console.log('🧹 Starting cleanup of test fasts...\n');

  // Step 1: Preview what will be deleted
  console.log('📋 Preview: Fasts that will be deleted:');
  const { data: previewFasts, error: previewError } = await supabase
    .from('fasts')
    .select('id, duration, unit, original_goal, cancelled, created_at')
    .or('unit.eq.seconds,and(duration.lt.1,unit.eq.hours)')
    .order('created_at', { ascending: false });

  if (previewError) {
    console.error('❌ Error fetching preview:', previewError);
    return;
  }

  if (!previewFasts || previewFasts.length === 0) {
    console.log('✅ No test fasts found. Nothing to delete!');
    return;
  }

  console.table(previewFasts);
  console.log(`\n⚠️  Found ${previewFasts.length} test fast(s) to delete.\n`);

  // Step 2: Delete test fasts
  const { data: deletedFasts, error: deleteError } = await supabase
    .from('fasts')
    .delete()
    .or('unit.eq.seconds,and(duration.lt.1,unit.eq.hours)')
    .select();

  if (deleteError) {
    console.error('❌ Error deleting fasts:', deleteError);
    return;
  }

  console.log(`✅ Successfully deleted ${deletedFasts?.length || 0} test fast(s)!\n`);

  // Step 3: Show summary
  const { data: summary, error: summaryError } = await supabase
    .from('fasts')
    .select('unit');

  if (summaryError) {
    console.error('❌ Error fetching summary:', summaryError);
    return;
  }

  const productionFasts = summary?.filter(f => f.unit === 'hours').length || 0;
  const testFasts = summary?.filter(f => f.unit === 'seconds').length || 0;

  console.log('📊 Summary after cleanup:');
  console.log(`   - Production fasts (hours): ${productionFasts}`);
  console.log(`   - Test fasts (seconds): ${testFasts}`);
  console.log(`   - Total fasts: ${summary?.length || 0}\n`);
}

cleanupTestFasts();
