import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Session } from '@supabase/supabase-js';
import { supabaseClient, hasSupabaseConfig } from '../services/supabaseClient';
import type { User } from '../types';

type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  setUser: (user: User) => void;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ userId: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  upsertProfile: (userId: string, data: Record<string, unknown>) => Promise<void>;
};

const secureStorage = createJSONStorage(() => ({
  getItem: async (name: string) => SecureStore.getItemAsync(name),
  setItem: async (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: async (name: string) => SecureStore.deleteItemAsync(name),
}));

const DEMO_USER: User = {
  id: 'demo-user',
  email: 'demo@genesis.app',
  name: 'Demo Athlete',
  plan: 'hybrid',
  subscriptionStatus: 'active',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, session: null, error: null }),
      updateProfile: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      clearError: () => set({ error: null }),

      initialize: async () => {
        if (!hasSupabaseConfig) {
          set({ isInitialized: true });
          return;
        }

        try {
          set({ isLoading: true });
          const { data: { session } } = await supabaseClient.auth.getSession();
          if (session) {
            set({ session });
            await get().fetchProfile(session.user.id);
          }
        } catch (err: any) {
          console.warn('Auth initialization failed:', err?.message);
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },

      signIn: async (email, password) => {
        if (!hasSupabaseConfig) {
          set({
            session: { access_token: 'demo-token' } as Session,
            user: { ...DEMO_USER, email },
            error: null,
          });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
          if (error) throw error;
          set({ session: data.session });
          await get().fetchProfile(data.user.id);
        } catch (err: any) {
          set({ error: err?.message ?? 'Sign in failed' });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (email, password, fullName) => {
        if (!hasSupabaseConfig) {
          const userId = 'demo-' + Date.now();
          set({
            user: { ...DEMO_USER, id: userId, email, name: fullName },
            error: null,
          });
          return { userId };
        }

        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
          });
          if (error) throw error;
          if (!data.user) throw new Error('Sign up failed — no user returned');
          return { userId: data.user.id };
        } catch (err: any) {
          set({ error: err?.message ?? 'Sign up failed' });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        if (hasSupabaseConfig) {
          await supabaseClient.auth.signOut();
        }
        set({ user: null, session: null, error: null });
      },

      resetPassword: async (email) => {
        if (!hasSupabaseConfig) {
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
          if (error) throw error;
        } catch (err: any) {
          set({ error: err?.message ?? 'Password reset failed' });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchProfile: async (userId) => {
        if (!hasSupabaseConfig) return;

        try {
          const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (error && error.code !== 'PGRST116') throw error;

          const authUser = (await supabaseClient.auth.getUser()).data.user;
          set({
            user: {
              id: userId,
              email: authUser?.email ?? '',
              name: data?.full_name ?? authUser?.user_metadata?.full_name ?? '',
              plan: 'hybrid',
              subscriptionStatus: 'active',
            },
          });
        } catch (err: any) {
          console.warn('fetchProfile failed:', err?.message);
        }
      },

      upsertProfile: async (userId, data) => {
        if (!hasSupabaseConfig) {
          set((state) => ({
            user: state.user
              ? { ...state.user, name: (data.full_name as string) ?? state.user.name }
              : null,
          }));
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const { error } = await supabaseClient
            .from('profiles')
            .upsert({ id: userId, ...data, updated_at: new Date().toISOString() });
          if (error) throw error;
          await get().fetchProfile(userId);
        } catch (err: any) {
          set({ error: err?.message ?? 'Profile save failed' });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'genesis-auth',
      storage: secureStorage,
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
