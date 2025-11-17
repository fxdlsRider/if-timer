const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kadskpttrlbdzywhxcdj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZHNrcHR0cmxiZHp5d2h4Y2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDgzOTEsImV4cCI6MjA3Njc4NDM5MX0.JDLYxGz0gDDZbAI5S5fmIgIyGxb6eHMB2hp5E4pkUfI'
);

(async () => {
  try {
    // Get all fasts from all users
    const { data, error } = await supabase
      .from('fasts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('📊 All Fasts in Production Database:');
    console.log('Total records:', data.length);
    console.log('');

    // Group by user
    const byUser = data.reduce((acc, fast) => {
      if (!acc[fast.user_id]) acc[fast.user_id] = [];
      acc[fast.user_id].push(fast);
      return acc;
    }, {});

    Object.entries(byUser).forEach(([userId, fasts]) => {
      console.log(`User: ${userId.substring(0, 8)}... (${fasts.length} fasts)`);

      fasts.forEach((f, i) => {
        console.log(`  ${i+1}. Duration: ${f.duration}h, Start: ${new Date(f.start_time).toLocaleString()}, Cancelled: ${f.cancelled}`);
      });

      const totalHours = fasts.reduce((sum, f) => sum + parseFloat(f.duration || 0), 0);
      const longestFast = Math.max(...fasts.map(f => parseFloat(f.duration || 0)));
      const averageFast = totalHours / fasts.length;

      console.log(`  → Total Hours: ${totalHours.toFixed(1)}h`);
      console.log(`  → Longest: ${longestFast.toFixed(1)}h`);
      console.log(`  → Average: ${averageFast.toFixed(1)}h`);
      console.log(`  → Longest + Average = ${(longestFast + averageFast).toFixed(1)}h`);
      console.log('');
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
