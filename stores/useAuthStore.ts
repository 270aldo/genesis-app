import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { User } from '../types';

type AuthState = {
  user: User | null;
  session: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  setSession: (session: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  clearError: () => void;
};

const secureStorage = createJSONStorage(() => ({
  getItem: async (name: string) => SecureStore.getItemAsync(name),
  setItem: async (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: async (name: string) => SecureStore.deleteItemAsync(name),
}));

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, session: null, error: null }),
      updateProfile: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'genesis-auth',
      storage: secureStorage,
      partialize: (state) => ({ user: state.user, session: state.session }),
    },
  ),
);
