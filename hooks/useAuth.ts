import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores';

/**
 * Convenience hook wrapping auth store with navigation side-effects.
 */
export function useAuth() {
  const router = useRouter();
  const { session, user, setSession, setUser, logout } = useAuthStore();

  const signOut = useCallback(() => {
    logout();
    router.replace('/(auth)/login');
  }, [logout, router]);

  return {
    isAuthenticated: !!session,
    session,
    user,
    setSession,
    setUser,
    signOut,
  } as const;
}
