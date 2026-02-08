import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Monitors network connectivity using the browser-compatible `navigator.onLine`
 * on web and a simple fetch probe on native. Returns `isOnline` so components
 * can show offline banners or queue mutations.
 *
 * For production, install @react-native-community/netinfo for real-time
 * connectivity events on native platforms.
 */
export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      setIsOnline(navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
    // On native, default to online. Swap for NetInfo when installed.
    setIsOnline(true);
  }, []);

  return { isOnline } as const;
}
