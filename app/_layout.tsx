import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import { useAuthStore } from '../stores';
import { supabaseClient, hasSupabaseConfig } from '../services/supabaseClient';
import { registerForPushNotifications, scheduleDailyReminders } from '../services/pushNotifications';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: Inter_400Regular,
    InterBold: Inter_700Bold,
    JetBrainsMono: JetBrainsMono_400Regular,
    JetBrainsMonoMedium: JetBrainsMono_500Medium,
    JetBrainsMonoSemiBold: JetBrainsMono_600SemiBold,
    JetBrainsMonoBold: JetBrainsMono_700Bold,
  });

  const isInitialized = useAuthStore((s) => s.isInitialized);
  const initialize = useAuthStore((s) => s.initialize);
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!hasSupabaseConfig) return;

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          useAuthStore.setState({ user: null });
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [setSession]);

  // Register push notifications after auth is initialized
  useEffect(() => {
    if (!isInitialized) return;
    (async () => {
      await registerForPushNotifications();
      await scheduleDailyReminders();
    })();
  }, [isInitialized]);

  useEffect(() => {
    if (fontsLoaded && isInitialized) SplashScreen.hideAsync();
  }, [fontsLoaded, isInitialized]);

  if (!fontsLoaded || !isInitialized) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
          <Stack.Screen name="(screens)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
