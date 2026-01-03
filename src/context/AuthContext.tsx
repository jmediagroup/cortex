'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
/**
 * Using the '@/' alias to ensure consistent resolution across the project.
 * This points to src/lib/supabase.ts as defined in your tsconfig.json.
 */
import { supabase } from '@/lib/supabase';

type Profile = {
  id?: string;
  tier?: string | null;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * useAuth Hook
 * Allows any component to access the user and their subscription tier.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/**
 * AUTH PROVIDER
 * Wraps the entire application in layout.tsx
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch the user's custom profile/tier data
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as Profile);
      } else {
        // Fallback for new users who don't have a profile record yet
        setProfile({ tier: 'free' });
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // 1. Check for an existing session on initial load
    const initSession = async () => {
      try {
        // Add a timeout to prevent hanging if Supabase is unreachable
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );

        const { data: { session } } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;

        if (!mounted) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) await fetchProfile(currentUser.id);
      } catch (e) {
        console.error('Session init error:', e);
        if (!mounted) return;
        // On error, assume no user (will redirect to login)
        setUser(null);
        setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    /**
     * Listen for auth state changes using the correct Supabase method.
     */
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });

      return () => {
        mounted = false;
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    } catch (e) {
      console.error('Auth listener error:', e);
      if (mounted) setLoading(false);
      return () => {
        mounted = false;
      };
    }
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}