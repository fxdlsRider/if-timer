// src/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext({});

/**
 * Generate fantasy name for anonymous users
 * Same logic as leaderboardService.js anonymizeUserId()
 */
function generateFantasyName(userId) {
  const adjectives = [
    'Fast', 'Quick', 'Swift', 'Zen', 'Strong', 'Mindful', 'Wise', 'Calm',
    'Focused', 'Balanced', 'Health', 'Wellness', 'Fit', 'Active', 'Clean'
  ];

  const nouns = [
    'Master', 'Warrior', 'Champion', 'Seeker', 'Journey', 'Path', 'Guide',
    'Spirit', 'Soul', 'Mind', 'Body', 'Guru', 'Sage', 'Hero', 'Legend'
  ];

  // Use userId to generate consistent but anonymous name
  const hashCode = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const adjIndex = Math.abs(hashCode) % adjectives.length;
  const nounIndex = Math.abs(hashCode >> 4) % nouns.length;
  const number = Math.abs(hashCode % 100);

  return `${adjectives[adjIndex]}${nouns[nounIndex]}${number}`;
}

/**
 * Create profile with fantasy name for anonymous user
 */
async function createAnonymousProfile(user) {
  try {
    const fantasyName = generateFantasyName(user.id);
    console.log(`🎭 Creating profile with fantasy name: "${fantasyName}"`);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        nickname: fantasyName,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('❌ Failed to create anonymous profile:', error);
    } else {
      console.log(`✅ Anonymous profile created: ${fantasyName}`);
    }
  } catch (error) {
    console.error('❌ Exception during profile creation:', error);
  }
}

/**
 * Ensure anonymous user has a profile (creates one if missing)
 * Fixes issue where old anonymous users don't have profiles (created before RLS fix)
 */
async function ensureAnonymousProfileExists(user) {
  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (expected if profile doesn't exist)
      console.error('❌ Error checking for existing profile:', fetchError);
      return;
    }

    if (!existingProfile) {
      // Profile doesn't exist → Create it
      console.log(`🔧 Profile missing for anonymous user ${user.id.slice(0, 8)}... → Creating now`);
      await createAnonymousProfile(user);
    } else {
      console.log(`✅ Profile exists for anonymous user ${user.id.slice(0, 8)}...`);
    }
  } catch (error) {
    console.error('❌ Exception during profile check:', error);
  }
}

/**
 * Migrate localStorage timer state to Supabase when anonymous user is created
 * This ensures timer state is preserved when transitioning from localStorage to Supabase
 */
async function migrateLocalStorageToSupabase(user) {
  try {
    const saved = localStorage.getItem('ifTimerState');
    if (!saved) {
      console.log('📦 No localStorage state to migrate');
      return;
    }

    const state = JSON.parse(saved);
    console.log('📦 Migrating localStorage state to Supabase...', state);

    // Save to Supabase timer_states table
    const { error } = await supabase
      .from('timer_states')
      .upsert({
        user_id: user.id,
        hours: state.hours || 16,
        angle: state.angle || 0,
        is_running: state.isRunning || false,
        target_time: state.targetTime ? new Date(state.targetTime).toISOString() : null,
        is_extended: false,
        original_goal_time: null
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('❌ Failed to migrate localStorage to Supabase:', error);
    } else {
      console.log('✅ localStorage state migrated to Supabase successfully');
      // Keep localStorage for now as backup (will be overwritten by Supabase sync)
    }
  } catch (error) {
    console.error('❌ Exception during migration:', error);
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check for auth errors in URL hash (expired magic link, etc.)
    const checkForAuthErrors = () => {
      if (typeof window === 'undefined') return;
      
      const hash = window.location.hash;
      if (hash.includes('error=')) {
        const params = new URLSearchParams(hash.substring(1));
        const error = params.get('error');
        const errorDescription = params.get('error_description');
        
        if (error) {
          console.log('Auth error detected:', error, errorDescription);
          setAuthError({
            type: error,
            description: errorDescription ? errorDescription.replace(/\+/g, ' ') : ''
          });
          
          // Clean URL
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };
    
    checkForAuthErrors();

    // Check active session
    // NOTE: Supabase automatically handles refresh tokens
    // Sessions last 1 hour, refresh tokens last 4 weeks (2,419,200 seconds)
    // User stays logged in for 4 weeks without re-authentication!
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // User already has a session (email or anonymous)
        setUser(session.user);
        setLoading(false);
      } else {
        // No session → Auto-signin anonymously
        console.log('🔐 No active session → Creating anonymous user...');
        try {
          const { data, error } = await supabase.auth.signInAnonymously();

          if (error) {
            console.error('Failed to create anonymous user:', error);
            setUser(null);
          } else {
            console.log('✅ Anonymous user created:', data.user.id);
            setUser(data.user);

            // Create profile with fantasy name
            await createAnonymousProfile(data.user);

            // Migrate localStorage timer state to Supabase
            await migrateLocalStorageToSupabase(data.user);
          }
        } catch (err) {
          console.error('Exception during anonymous signin:', err);
          setUser(null);
        }
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Clear error on successful auth
      if (session?.user) {
        setAuthError(null);

        // Ensure anonymous users have profiles (fixes missing profiles from before RLS fix)
        if (session.user.is_anonymous) {
          await ensureAnonymousProfileExists(session.user);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });

    if (error) throw error;
    return { success: true };
  };

  const signInAnonymously = async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error('Error signing in anonymously:', error);
        throw error;
      }

      console.log('✅ Anonymous user created:', data.user.id);
      return data.user;
    } catch (error) {
      console.error('Failed to create anonymous user:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    authError,
    signInWithEmail,
    signInAnonymously,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};