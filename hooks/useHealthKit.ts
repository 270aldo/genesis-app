import { useEffect, useState } from 'react';
import { healthKitIntegration, type HealthSnapshot } from '../services/healthKitIntegration';

type HealthKitStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable';

/**
 * Hook that requests HealthKit permissions on mount and returns today's
 * health snapshot (steps, heart rate, sleep). Gracefully degrades on
 * web / simulator by returning null snapshot with 'unavailable' status.
 */
export function useHealthKit() {
  const [snapshot, setSnapshot] = useState<HealthSnapshot | null>(null);
  const [status, setStatus] = useState<HealthKitStatus>('idle');

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setStatus('loading');

      // 1. Check availability
      const available = await healthKitIntegration.isAvailable();
      if (cancelled) return;

      if (!available) {
        setStatus('unavailable');
        return;
      }

      // 2. Request permissions
      const granted = await healthKitIntegration.requestPermissions();
      if (cancelled) return;

      if (!granted) {
        setStatus('denied');
        return;
      }

      setStatus('granted');

      // 3. Fetch today's data
      const data = await healthKitIntegration.getDailySnapshot();
      if (cancelled) return;

      setSnapshot(data);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  return { snapshot, status } as const;
}
