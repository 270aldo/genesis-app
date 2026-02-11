import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HealthSnapshot {
  steps: number;
  restingHeartRate: number | null;
  sleepHours: number | null;
}

const EMPTY_SNAPSHOT: HealthSnapshot = {
  steps: 0,
  restingHeartRate: null,
  sleepHours: null,
};

// Type guards for dynamically-imported HealthConnect record shapes.
// Because the module is loaded via `import()`, TypeScript cannot always narrow
// the generic `RecordResult<T>` correctly.  These explicit shapes match the
// library's declared result types and provide safe property access.

type StepsRecordShape = { count?: number };
type RestingHeartRateRecordShape = { beatsPerMinute?: number };
type SleepSessionRecordShape = {
  startTime?: string;
  endTime?: string;
};

// ---------------------------------------------------------------------------
// Dynamic import — prevents crash on web / simulator without native module.
// expo-health-connect is the config plugin; react-native-health-connect is
// the runtime library that provides the actual HealthConnect JS API.
// ---------------------------------------------------------------------------

let HealthConnect: typeof import('react-native-health-connect') | null = null;

async function loadHealthConnect() {
  if (HealthConnect) return HealthConnect;
  if (Platform.OS === 'web') return null;
  try {
    HealthConnect = await import('react-native-health-connect');
    return HealthConnect;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Start of today (midnight) as ISO string */
function todayStart(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Start of yesterday at 8 PM — a reasonable "bedtime" window start */
function lastNightStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(20, 0, 0, 0);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const healthKitIntegration = {
  /**
   * Check whether health data is available on this device/platform.
   * Initializes the SDK and verifies its availability status.
   */
  async isAvailable(): Promise<boolean> {
    const hc = await loadHealthConnect();
    if (!hc) return false;
    try {
      const initialized = await hc.initialize();
      if (!initialized) return false;

      // SDK_AVAILABLE = 3
      const status = await hc.getSdkStatus();
      return status === 3;
    } catch {
      return false;
    }
  },

  /**
   * Request read-access permissions for Steps, HeartRate, and SleepSession.
   * Returns `true` if permissions were granted (or already granted).
   */
  async requestPermissions(): Promise<boolean> {
    const hc = await loadHealthConnect();
    if (!hc) return false;
    try {
      const granted = await hc.requestPermission([
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'RestingHeartRate' },
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'SleepSession' },
      ]);
      return granted.length > 0;
    } catch {
      return false;
    }
  },

  /**
   * Fetch today's health snapshot: steps, resting heart rate, and last night's
   * sleep hours. Uses `Promise.allSettled` so one failing query does not block
   * the others.
   */
  async getDailySnapshot(): Promise<HealthSnapshot> {
    const hc = await loadHealthConnect();
    if (!hc) return EMPTY_SNAPSHOT;

    const now = new Date().toISOString();
    const dayStart = todayStart();
    const bedtimeStart = lastNightStart();

    const timeRangeToday = {
      operator: 'between' as const,
      startTime: dayStart,
      endTime: now,
    };

    const [stepsResult, restingHrResult, heartRateResult, sleepResult] =
      await Promise.allSettled([
        // Steps — sum of all records today
        hc.readRecords('Steps', { timeRangeFilter: timeRangeToday }),

        // Resting heart rate — dedicated record type provided by Health Connect
        hc.readRecords('RestingHeartRate', { timeRangeFilter: timeRangeToday }),

        // Heart rate — all readings today (fallback for resting HR)
        hc.readRecords('HeartRate', { timeRangeFilter: timeRangeToday }),

        // Sleep — total duration from last night's bedtime window to now
        hc.readRecords('SleepSession', {
          timeRangeFilter: {
            operator: 'between' as const,
            startTime: bedtimeStart,
            endTime: now,
          },
        }),
      ]);

    // --- Steps ---
    let steps = 0;
    if (stepsResult.status === 'fulfilled' && stepsResult.value.records) {
      for (const record of stepsResult.value.records) {
        const typed = record as StepsRecordShape;
        if (typed.count != null) {
          steps += typed.count;
        }
      }
    }

    // --- Resting heart rate ---
    // Prefer the dedicated RestingHeartRate record type (written by wearables
    // that compute resting HR). If unavailable, fall back to the minimum BPM
    // from all HeartRate samples as an approximation.
    let restingHeartRate: number | null = null;

    if (restingHrResult.status === 'fulfilled' && restingHrResult.value.records) {
      const bpmValues: number[] = [];
      for (const record of restingHrResult.value.records) {
        const typed = record as RestingHeartRateRecordShape;
        if (typed.beatsPerMinute != null && typed.beatsPerMinute > 0) {
          bpmValues.push(typed.beatsPerMinute);
        }
      }
      if (bpmValues.length > 0) {
        // Average of dedicated resting HR readings for the day
        restingHeartRate = Math.round(
          bpmValues.reduce((sum, bpm) => sum + bpm, 0) / bpmValues.length,
        );
      }
    }

    // Fallback: use the minimum BPM from general HeartRate samples.
    // This approximates resting HR better than an average which would include
    // exercise readings.
    if (
      restingHeartRate === null &&
      heartRateResult.status === 'fulfilled' &&
      heartRateResult.value.records
    ) {
      let minBpm = Infinity;
      for (const record of heartRateResult.value.records) {
        const samples = (record as { samples?: Array<{ beatsPerMinute?: number }> }).samples;
        if (samples) {
          for (const sample of samples) {
            if (sample.beatsPerMinute != null && sample.beatsPerMinute > 0) {
              minBpm = Math.min(minBpm, sample.beatsPerMinute);
            }
          }
        }
      }
      if (minBpm !== Infinity) {
        restingHeartRate = Math.round(minBpm);
      }
    }

    // --- Sleep (total hours) ---
    let sleepHours: number | null = null;
    if (sleepResult.status === 'fulfilled' && sleepResult.value.records) {
      let totalMs = 0;
      for (const record of sleepResult.value.records) {
        const typed = record as SleepSessionRecordShape;
        if (typed.startTime && typed.endTime) {
          totalMs +=
            new Date(typed.endTime).getTime() - new Date(typed.startTime).getTime();
        }
      }
      if (totalMs > 0) {
        sleepHours = Math.round((totalMs / (1000 * 60 * 60)) * 10) / 10; // 1 decimal
      }
    }

    return { steps, restingHeartRate, sleepHours };
  },
};
