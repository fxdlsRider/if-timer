// src/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext({});

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Clear error on successful auth
      if (session?.user) {
        setAuthError(null);
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

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    authError,
    signInWithEmail,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};