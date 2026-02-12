import { useEffect, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { processQueue, getQueueSize } from '../services/offlineQueue';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const wasOffline = useRef(false);

  // Listen to connectivity changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);

      if (!online) {
        wasOffline.current = true;
      }
    });

    // Initial check
    NetInfo.fetch().then((state) => {
      setIsOnline(!!(state.isConnected && state.isInternetReachable !== false));
    });

    return () => unsubscribe();
  }, []);

  // When coming back online, process the queue
  useEffect(() => {
    if (isOnline && wasOffline.current) {
      wasOffline.current = false;
      (async () => {
        const count = await getQueueSize();
        if (count === 0) return;
        setPendingCount(count);
        setSyncStatus('syncing');
        try {
          const result = await processQueue();
          setPendingCount(result.failed);
          setSyncStatus(result.failed > 0 ? 'error' : 'synced');
          // Reset synced status after 3 seconds
          if (result.failed === 0) {
            setTimeout(() => setSyncStatus('idle'), 3000);
          }
        } catch {
          setSyncStatus('error');
        }
      })();
    }
  }, [isOnline]);

  // Periodically refresh pending count
  useEffect(() => {
    const interval = setInterval(async () => {
      const count = await getQueueSize();
      setPendingCount(count);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return { isOnline, pendingCount, syncStatus } as const;
}
