'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Helper function to check if user has profile and create one if not
  const ensureUserProfile = async (user: User) => {
    try {
      const supabase = createClient();
      
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Profile doesn't exist, create one
        console.log('Profile not found, creating new profile for user:', user.id);
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            first_name: '',
            last_name: '',
            avatar_url: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          console.log('Profile created successfully for user:', user.id);
        }
      } else if (fetchError) {
        console.error('Error checking profile:', fetchError);
      } else if (existingProfile) {
        console.log('Profile already exists for user:', user.id);
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const supabase = createClient();

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          const sessionUser = session?.user ?? null;
          setUser(sessionUser);
          
          // Check/create profile if user is authenticated (non-blocking)
          if (sessionUser) {
            ensureUserProfile(sessionUser).catch(err => {
              console.error('Failed to ensure user profile:', err);
            });
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        // Always set loading to false, regardless of profile creation success/failure
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
        setLoading(false);

        // Check/create profile when user signs in (non-blocking)
        if (sessionUser && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          ensureUserProfile(sessionUser).catch(err => {
            console.error('Failed to ensure user profile during auth change:', err);
          });
        }

        // Handle session refresh
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [mounted]);

  const signOut = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      setUser(null);
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  };

  const value = {
    user: mounted ? user : null,
    loading: mounted ? loading : true,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 