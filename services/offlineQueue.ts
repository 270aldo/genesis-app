import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@genesis_offline_queue';

export type OfflineOperationType =
  | 'meal_log'
  | 'check_in'
  | 'workout_complete'
  | 'water_log'
  | 'measurement';

export interface OfflineOperation {
  id: string;
  type: OfflineOperationType;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

const MAX_RETRIES = 3;

async function readQueue(): Promise<OfflineOperation[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as OfflineOperation[]) : [];
  } catch {
    return [];
  }
}

async function writeQueue(queue: OfflineOperation[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function addToQueue(
  type: OfflineOperationType,
  payload: Record<string, unknown>,
): Promise<void> {
  const queue = await readQueue();
  queue.push({
    id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    payload,
    timestamp: Date.now(),
    retryCount: 0,
  });
  await writeQueue(queue);
}

export async function getQueueSize(): Promise<number> {
  const queue = await readQueue();
  return queue.length;
}

export async function processQueue(): Promise<{ processed: number; failed: number }> {
  const queue = await readQueue();
  if (queue.length === 0) return { processed: 0, failed: 0 };

  let processed = 0;
  const remaining: OfflineOperation[] = [];

  for (const op of queue) {
    try {
      await executeOperation(op);
      processed++;
    } catch (err: any) {
      console.warn(`offlineQueue: failed to process ${op.type}:`, err?.message);
      if (op.retryCount < MAX_RETRIES) {
        remaining.push({ ...op, retryCount: op.retryCount + 1 });
      }
      // Operations that exceed MAX_RETRIES are dropped
    }
  }

  await writeQueue(remaining);
  return { processed, failed: remaining.length };
}

export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

async function executeOperation(op: OfflineOperation): Promise<void> {
  const { hasSupabaseConfig } = await import('./supabaseClient');
  if (!hasSupabaseConfig) return;

  const {
    insertMeal,
    upsertCheckIn,
    completeSession,
    insertExerciseLogs,
    upsertWaterLog,
    insertBiomarker,
    getCurrentUserId,
  } = await import('./supabaseQueries');

  const userId = getCurrentUserId();
  if (!userId) throw new Error('No authenticated user');

  switch (op.type) {
    case 'meal_log': {
      const p = op.payload as {
        date: string;
        meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
        food_items: unknown;
        total_macros: unknown;
      };
      await insertMeal(userId, {
        date: p.date,
        meal_type: p.meal_type,
        food_items: p.food_items as any,
        total_macros: p.total_macros as any,
      });
      break;
    }
    case 'check_in': {
      const p = op.payload as {
        date: string;
        sleep_hours: number;
        sleep_quality: number;
        energy: number;
        mood: number;
        stress: number;
        soreness: number;
        notes?: string | null;
      };
      await upsertCheckIn(userId, p);
      break;
    }
    case 'workout_complete': {
      const p = op.payload as { sessionId: string; logs: any[] };
      await completeSession(p.sessionId);
      if (p.logs.length > 0) {
        await insertExerciseLogs(p.sessionId, p.logs);
      }
      break;
    }
    case 'water_log': {
      const p = op.payload as { date: string; glasses: number };
      await upsertWaterLog(userId, p.date, p.glasses);
      break;
    }
    case 'measurement': {
      const p = op.payload as {
        date: string;
        type: 'weight' | 'body_fat' | 'hrv' | 'resting_hr' | 'blood_pressure' | 'vo2max';
        value: number;
        unit: string;
      };
      await insertBiomarker(userId, { ...p, source: 'manual' });
      break;
    }
  }
}
