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

    const saveToSupabase = async () => {
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
      } catch (error) {
        console.error('Error saving to Supabase:', error);
      } finally {
        setSyncing(false);
      }
    };

    saveToSupabase();
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
