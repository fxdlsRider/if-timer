// hooks/useTimerStorage.js
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Custom hook for managing timer state persistence
 * Handles both localStorage (for non-logged-in users) and Supabase (for logged-in users)
 *
 * @param {object} user - Authenticated user object (null if not logged in)
 * @param {object} timerState - Current timer state to sync
 * @param {function} onStateLoaded - Callback when state is loaded from storage
 * @returns {object} Storage state and functions
 */
export function useTimerStorage(user, timerState, onStateLoaded) {
  const [syncing, setSyncing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load from localStorage (if not logged in)
  useEffect(() => {
    if (user) return; // Skip if logged in

    const saved = localStorage.getItem('ifTimerState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (onStateLoaded) {
          onStateLoaded(state);
        }
      } catch (e) {
        console.error('Error loading state from localStorage:', e);
      }
    }
  }, [user, onStateLoaded]);

  // Save to localStorage (if not logged in)
  useEffect(() => {
    if (user) return; // Skip if logged in

    const state = {
      hours: timerState.hours,
      angle: timerState.angle,
      isRunning: timerState.isRunning,
      targetTime: timerState.targetTime
    };
    localStorage.setItem('ifTimerState', JSON.stringify(state));
  }, [user, timerState.hours, timerState.angle, timerState.isRunning, timerState.targetTime]);

  // Load from Supabase (if logged in)
  useEffect(() => {
    if (!user) return;

    const loadFromSupabase = async () => {
      const { data, error } = await supabase
        .from('timer_states')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading from Supabase:', error);
        setIsInitialLoad(false);
        return;
      }

      if (data) {
        // Convert Supabase data to app state format
        const targetTimeMs = data.target_time ? new Date(data.target_time).getTime() : null;
        const originalGoalMs = data.original_goal_time ? new Date(data.original_goal_time).getTime() : null;

        // GHOST TIMER PREVENTION: Don't restore expired timers
        // If timer is running but target time is in the past, clean it up instead of restoring
        if (data.is_running && targetTimeMs && targetTimeMs < Date.now()) {
          console.warn('⚠️ Expired timer detected during state load - cleaning up instead of restoring');
          console.log(`   Target time: ${new Date(targetTimeMs).toISOString()}`);
          console.log(`   Current time: ${new Date().toISOString()}`);

          // Clean up the expired timer in the database immediately
          await forceSyncToSupabase(user, {
            hours: data.hours,
            angle: data.angle,
            isRunning: false,
            targetTime: null,
            isExtended: false,
            originalGoalTime: null
          });

          setIsInitialLoad(false);
          return; // Don't restore the expired state
        }

        const loadedState = {
          hours: data.hours,
          angle: data.angle,
          isRunning: data.is_running && targetTimeMs !== null,
          targetTime: targetTimeMs,
          isExtended: data.is_extended,
          originalGoalTime: originalGoalMs,
        };

        if (onStateLoaded) {
          onStateLoaded(loadedState);
        }
      }

      setIsInitialLoad(false);
    };

    loadFromSupabase();
  }, [user, onStateLoaded]);

  // Real-time sync (if logged in)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('timer_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timer_states',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new) {
            const data = payload.new;

            // Convert Supabase data to app state format
            const targetTimeMs = data.target_time ? new Date(data.target_time).getTime() : null;
            const originalGoalMs = data.original_goal_time ? new Date(data.original_goal_time).getTime() : null;

            // GHOST TIMER PREVENTION: Don't sync expired timers from other devices
            if (data.is_running && targetTimeMs && targetTimeMs < Date.now()) {
              console.warn('⚠️ Expired timer detected in real-time sync - ignoring');
              return; // Don't sync the expired state
            }

            const syncedState = {
              hours: data.hours,
              angle: data.angle,
              isRunning: data.is_running && targetTimeMs !== null,
              targetTime: targetTimeMs,
              isExtended: data.is_extended,
              originalGoalTime: originalGoalMs,
            };

            if (onStateLoaded) {
              onStateLoaded(syncedState);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onStateLoaded]);

  // Auto-save to Supabase on state changes (if logged in)
  useEffect(() => {
    if (!user) return;

    // Skip saving on initial load
    if (isInitialLoad) return;

    // Skip if already syncing
    if (syncing) return;

    // LAYER 2: Retry logic with exponential backoff
    const saveToSupabaseWithRetry = async (retryCount = 0, maxRetries = 3) => {
      setSyncing(true);

      try {
        const { error } = await supabase
          .from('timer_states')
          .upsert({
            user_id: user.id,
            hours: timerState.hours,
            angle: timerState.angle,
            is_running: timerState.isRunning,
            target_time: timerState.targetTime ? new Date(timerState.targetTime).toISOString() : null,
            is_extended: timerState.isExtended || false,
            original_goal_time: timerState.originalGoalTime ? new Date(timerState.originalGoalTime).toISOString() : null
          }, {
            onConflict: 'user_id'
          });

        if (error) throw error;

        // Success - log if it was a retry
        if (retryCount > 0) {
          console.log(`✓ Supabase sync succeeded after ${retryCount} retries`);
        }

        setSyncing(false);
      } catch (error) {
        console.error(`Supabase sync attempt ${retryCount + 1}/${maxRetries + 1} failed:`, error);

        // Retry if not exceeded max attempts
        if (retryCount < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delayMs = 1000 * Math.pow(2, retryCount);
          console.log(`⟳ Retrying in ${delayMs}ms...`);

          setTimeout(() => {
            saveToSupabaseWithRetry(retryCount + 1, maxRetries);
          }, delayMs);
        } else {
          console.error('✗ All Supabase sync attempts failed. Timer state may be out of sync.');
          setSyncing(false);
          // TODO: Show user notification? Store for offline sync?
        }
      }
    };

    saveToSupabaseWithRetry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    isInitialLoad,
    timerState.hours,
    timerState.angle,
    timerState.isRunning,
    timerState.targetTime,
    timerState.isExtended,
    timerState.originalGoalTime,
    // Note: syncing NOT in deps to prevent loop
  ]);

  return {
    syncing,
    isInitialLoad,
  };
}

/**
 * Force immediate sync to Supabase (bypasses useEffect checks)
 * Used for critical state changes like stopFasting() and cancelTimer()
 *
 * @param {object} user - Authenticated user object
 * @param {object} timerState - Timer state to sync
 * @returns {Promise<boolean>} Success status
 */
export async function forceSyncToSupabase(user, timerState) {
  if (!user) {
    console.warn('forceSyncToSupabase: No user provided, skipping sync');
    return false;
  }

  try {
    console.log('forceSyncToSupabase: Syncing state to database...', {
      user_id: user.id,
      is_running: timerState.isRunning,
      hours: timerState.hours
    });

    const { error } = await supabase
      .from('timer_states')
      .upsert({
        user_id: user.id,
        hours: timerState.hours,
        angle: timerState.angle,
        is_running: timerState.isRunning,
        target_time: timerState.targetTime ? new Date(timerState.targetTime).toISOString() : null,
        is_extended: timerState.isExtended || false,
        original_goal_time: timerState.originalGoalTime ? new Date(timerState.originalGoalTime).toISOString() : null
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('forceSyncToSupabase: Failed to sync', error);
      throw error;
    }

    console.log('forceSyncToSupabase: Sync successful ✓');
    return true;
  } catch (error) {
    console.error('forceSyncToSupabase: Exception during sync', error);
    return false;
  }
}
