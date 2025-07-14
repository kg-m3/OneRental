import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  userRoles: string[];
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setUserRoles: (roles: string[]) => void;
  setIsLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, roles: string[]) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUserRoles: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userRoles: [],
  isLoading: false,
  setUser: (user) => set({ user }),
  setUserRoles: (roles) => set({ userRoles: roles }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  fetchUserRoles: async (userId: string) => {
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) throw error;
      set({ userRoles: roles?.map(r => r.role) || [] });
    } catch (error) {
      console.error('Error fetching user roles:', error);
      set({ userRoles: [] });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Sign in failed');

      set({ user: data.user });
      await get().fetchUserRoles(data.user.id);
    } catch (error) {
      set({ user: null, userRoles: [] });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password, roles) => {
    try {
      set({ isLoading: true });
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('Sign up failed');

      // Create basic profile - verification fields will be added later if needed
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{ 
          user_id: data.user.id,
          email,
          background_check_status: 'pending',
          terms_accepted: true,
          privacy_policy_accepted: true,
          background_check_consent: true,
        }]);

      if (profileError) throw profileError;

      const rolePromises = roles.map(role => 
        supabase
          .from('user_roles')
          .insert([{
            user_id: data.user.id,
            role,
            created_at: new Date().toISOString()
          }])
      );

      await Promise.all(rolePromises);
      set({ user: data.user, userRoles: roles });
    } catch (error) {
      set({ user: null, userRoles: [] });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      await supabase.auth.signOut();
      set({ user: null, userRoles: [] });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));