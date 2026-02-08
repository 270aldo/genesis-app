import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores';

/**
 * Convenience hook wrapping auth store with navigation side-effects.
 */
export function useAuth() {
  const router = useRouter();
  const store = useAuthStore();

  const signIn = useCallback(
    async (email: string, password: string) => {
      await store.signIn(email, password);
      router.replace('/(tabs)/home');
    },
    [store.signIn, router],
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      return store.signUp(email, password, fullName);
    },
    [store.signUp],
  );

  const signOut = useCallback(async () => {
    await store.signOut();
    router.replace('/(auth)/login');
  }, [store.signOut, router]);

  const resetPassword = useCallback(
    async (email: string) => {
      await store.resetPassword(email);
    },
    [store.resetPassword],
  );

  const upsertProfile = useCallback(
    async (userId: string, data: Record<string, unknown>) => {
      await store.upsertProfile(userId, data);
    },
    [store.upsertProfile],
  );

  return {
    isAuthenticated: !!store.session,
    session: store.session,
    user: store.user,
    isInitialized: store.isInitialized,
    isLoading: store.isLoading,
    error: store.error,
    clearError: store.clearError,
    signIn,
    signUp,
    signOut,
    resetPassword,
    upsertProfile,
  } as const;
}
