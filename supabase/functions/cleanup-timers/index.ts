// Supabase Edge Function: Cleanup Expired Timers
// Purpose: Cron job that runs every 5 minutes to clean up ghost timers
// Deployment: supabase functions deploy cleanup-timers

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cron schedule: Every 5 minutes
Deno.cron('cleanup-expired-timers', '*/5 * * * *', async () => {
  console.log('🕐 [CRON] Running cleanup-expired-timers...');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  try {
    // Call the SQL function
    const { data, error } = await supabase.rpc('cleanup_expired_timers');

    if (error) {
      console.error('❌ [CRON] Cleanup failed:', error);
      return;
    }

    const cleanedCount = data[0]?.cleaned_count || 0;
    const cleanedUserIds = data[0]?.cleaned_user_ids || [];

    if (cleanedCount > 0) {
      console.log(`✅ [CRON] Cleaned ${cleanedCount} expired timer(s)`);
      console.log(`   User IDs: ${cleanedUserIds.join(', ')}`);
    } else {
      console.log('✓ [CRON] No expired timers found');
    }
  } catch (error) {
    console.error('❌ [CRON] Exception:', error);
  }
});

// Manual invocation endpoint (for testing)
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  try {
    console.log('🔧 [MANUAL] Running cleanup-expired-timers...');

    const { data, error } = await supabase.rpc('cleanup_expired_timers');

    if (error) {
      throw error;
    }

    const cleanedCount = data[0]?.cleaned_count || 0;
    const cleanedUserIds = data[0]?.cleaned_user_ids || [];

    const response = {
      success: true,
      cleaned_count: cleanedCount,
      cleaned_user_ids: cleanedUserIds,
      timestamp: new Date().toISOString(),
    };

    console.log('✅ [MANUAL] Cleanup completed:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ [MANUAL] Cleanup failed:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
