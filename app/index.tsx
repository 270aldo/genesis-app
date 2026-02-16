import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores';
import { supabaseClient, hasSupabaseConfig } from '../services/supabaseClient';

export default function Index() {
  const session = useAuthStore((state) => state.session);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [profileCheck, setProfileCheck] = useState<'loading' | 'complete' | 'incomplete'>('loading');

  useEffect(() => {
    if (!session || !isInitialized) return;

    if (!hasSupabaseConfig) {
      setProfileCheck('complete');
      return;
    }

    (async () => {
      try {
        const { data } = await supabaseClient
          .from('profiles')
          .select('goal')
          .eq('id', session.user.id)
          .single();
        setProfileCheck(data?.goal ? 'complete' : 'incomplete');
      } catch {
        setProfileCheck('incomplete');
      }
    })();
  }, [session, isInitialized]);

  if (!isInitialized) return null;

  if (!session) return <Redirect href="/(auth)/login" />;

  if (profileCheck === 'loading') return null;

  if (profileCheck === 'incomplete') {
    return <Redirect href={{ pathname: '/(auth)/onboarding', params: { userId: session.user.id } }} />;
  }

  return <Redirect href="/(tabs)/home" />;
}
