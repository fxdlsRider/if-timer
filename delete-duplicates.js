const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kadskpttrlbdzywhxcdj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZHNrcHR0cmxiZHp5d2h4Y2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDgzOTEsImV4cCI6MjA3Njc4NDM5MX0.JDLYxGz0gDDZbAI5S5fmIgIyGxb6eHMB2hp5E4pkUfI'
);

(async () => {
  try {
    // Get all fasts
    const { data: allFasts, error } = await supabase
      .from('fasts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    console.log('📊 Total Fasts:', allFasts.length);
    console.log('');

    // Find duplicates (same user_id, start_time, duration)
    const duplicates = [];
    const seen = new Map();

    for (const fast of allFasts) {
      const key = `${fast.user_id}_${fast.start_time}_${fast.duration}`;

      if (seen.has(key)) {
        // This is a duplicate
        duplicates.push({
          keep: seen.get(key),
          delete: fast
        });
      } else {
        seen.set(key, fast);
      }
    }

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }

    console.log(`⚠️  Found ${duplicates.length} duplicate(s):`);
    console.log('');

    for (let i = 0; i < duplicates.length; i++) {
      const dup = duplicates[i];
      console.log(`Duplicate ${i + 1}:`);
      console.log(`  KEEP:   ID=${dup.keep.id.substring(0, 8)}..., duration=${dup.keep.duration}h, end=${dup.keep.end_time}`);
      console.log(`  DELETE: ID=${dup.delete.id.substring(0, 8)}..., duration=${dup.delete.duration}h, end=${dup.delete.end_time}`);
      console.log('');
    }

    // Ask for confirmation (in production, you'd want manual confirmation)
    console.log('🗑️  Deleting duplicates...');

    for (const dup of duplicates) {
      const { error: deleteError } = await supabase
        .from('fasts')
        .delete()
        .eq('id', dup.delete.id);

      if (deleteError) {
        console.error(`❌ Failed to delete ${dup.delete.id}:`, deleteError.message);
      } else {
        console.log(`✅ Deleted duplicate: ${dup.delete.id.substring(0, 8)}...`);
      }
    }

    console.log('');
    console.log('✅ Cleanup complete!');

  } catch (err) {
    console.error('Error:', err.message);
  }
})();
