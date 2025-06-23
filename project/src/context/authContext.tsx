import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

const AuthContext = createContext<{
  user: any | null;
  userRoles: string[];
  loading: boolean;
}>({
  user: null,
  userRoles: [],
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, setUser, userRoles, setUserRoles, fetchUserRoles } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setUser(null);
          setLoading(false);
          return;
        }

        console.log('Initial session:', session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch roles from database
          await fetchUserRoles(session.user.id);
        }

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          try {
            console.log('Auth state changed:', session);
            setUser(session?.user ?? null);

            if (session?.user) {
              // Fetch roles from database
              await fetchUserRoles(session.user.id);
            }
          } catch (error) {
            console.error('Error handling auth state change:', error);
          }
        });

        setLoading(false);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setUser, setUserRoles, fetchUserRoles]);

  return (
    <AuthContext.Provider value={{ user, userRoles, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
