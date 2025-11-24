// Check all fasts in database
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkAllFasts() {
  console.log('📊 Checking all fasts in database...\n');

  const { data: allFasts, error } = await supabase
    .from('fasts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!allFasts || allFasts.length === 0) {
    console.log('✅ Database is clean - no fasts found!');
    return;
  }

  console.log(`Found ${allFasts.length} fast(s):\n`);
  console.table(allFasts.map(f => ({
    id: f.id.substring(0, 8) + '...',
    duration: f.duration,
    unit: f.unit,
    original_goal: f.original_goal,
    cancelled: f.cancelled,
    created_at: new Date(f.created_at).toLocaleString()
  })));

  // Summary by unit
  const byUnit = allFasts.reduce((acc, f) => {
    acc[f.unit] = (acc[f.unit] || 0) + 1;
    return acc;
  }, {});

  console.log('\n📈 Summary by unit:');
  console.table(byUnit);
}

checkAllFasts();
