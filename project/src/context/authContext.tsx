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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch roles from database
        fetchUserRoles(session.user.id);
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch roles from database
        fetchUserRoles(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
