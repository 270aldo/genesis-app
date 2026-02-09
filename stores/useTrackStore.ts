import { create } from 'zustand';
import type { Measurement, ProgressPhoto } from '../types';
import { hasSupabaseConfig } from '../services/supabaseClient';

type StrengthProgressData = {
  exerciseName: string;
  dataPoints: Array<{ label: string; value: number; active: boolean }>;
  changePercent: number;
};

type TrackingState = {
  measurements: Measurement[];
  photos: ProgressPhoto[];
  strengthMetrics: Record<string, number>;
  streak: number;
  personalRecords: Array<{ exerciseId: string; exerciseName: string; type: string; value: number; achievedAt: string }>;
  isLoading: boolean;
  completedWorkouts: number;
  totalPlanned: number;
  strengthProgress: StrengthProgressData;
  addMeasurement: (measurement: Measurement) => void;
  addPhoto: (photo: ProgressPhoto) => void;
  updateStrengthMetric: (exercise: string, value: number) => void;
  setStreak: (days: number) => void;
  calculateProgressPercent: () => number;
  fetchMeasurements: () => Promise<void>;
  fetchPersonalRecords: () => Promise<void>;
  fetchStreak: () => Promise<void>;
  fetchTrackStats: () => Promise<void>;
  fetchStrengthProgress: (exerciseName?: string) => Promise<void>;
};

export const useTrackStore = create<TrackingState>((set, get) => ({
  measurements: [],
  photos: [],
  strengthMetrics: {},
  streak: 0,
  personalRecords: [],
  isLoading: false,
  completedWorkouts: 0,
  totalPlanned: 0,
  strengthProgress: { exerciseName: '', dataPoints: [], changePercent: 0 },

  addMeasurement: (measurement) => {
    // Optimistic local update
    set((state) => ({ measurements: [...state.measurements, measurement] }));

    // Persist to Supabase
    if (hasSupabaseConfig) {
      (async () => {
        try {
          const { insertBiomarker, getCurrentUserId } = await import('../services/supabaseQueries');
          const userId = getCurrentUserId();
          if (!userId) return;
          const date = measurement.date.split('T')[0];
          if (measurement.weight) {
            await insertBiomarker(userId, { date, type: 'weight', value: measurement.weight, unit: 'kg', source: 'manual' });
          }
          if (measurement.bodyFat) {
            await insertBiomarker(userId, { date, type: 'body_fat', value: measurement.bodyFat, unit: '%', source: 'manual' });
          }
        } catch (err: any) {
          console.warn('addMeasurement persist failed:', err?.message);
        }
      })();
    }
  },

  addPhoto: (photo) => set((state) => ({ photos: [...state.photos, photo] })),
  updateStrengthMetric: (exercise, value) =>
    set((state) => ({ strengthMetrics: { ...state.strengthMetrics, [exercise]: value } })),
  setStreak: (streak) => set({ streak }),

  calculateProgressPercent: () => {
    const state = get();
    const measured = state.measurements.length > 0 ? 40 : 0;
    const photos = state.photos.length > 0 ? 30 : 0;
    const strength = Object.keys(state.strengthMetrics).length > 0 ? 30 : 0;
    return measured + photos + strength;
  },

  fetchMeasurements: async () => {
    if (!hasSupabaseConfig) return;
    set({ isLoading: true });
    try {
      const { fetchBiomarkers, getCurrentUserId } = await import('../services/supabaseQueries');
      const userId = getCurrentUserId();
      if (!userId) return;
      const data = await fetchBiomarkers(userId);
      if (data) {
        // Group by date and merge weight + body_fat
        const byDate: Record<string, Measurement> = {};
        for (const row of data as any[]) {
          if (!byDate[row.date]) {
            byDate[row.date] = { date: row.date, weight: 0 };
          }
          if (row.type === 'weight') byDate[row.date].weight = row.value;
          if (row.type === 'body_fat') byDate[row.date].bodyFat = row.value;
        }
        set({ measurements: Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date)) });
      }
    } catch (err: any) {
      console.warn('fetchMeasurements failed:', err?.message);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPersonalRecords: async () => {
    if (!hasSupabaseConfig) return;
    set({ isLoading: true });
    try {
      const { fetchPersonalRecords: fetchPRs, getCurrentUserId } = await import('../services/supabaseQueries');
      const userId = getCurrentUserId();
      if (!userId) return;
      const data = await fetchPRs(userId);
      if (data) {
        const records = (data as any[]).map((row) => ({
          exerciseId: row.exercise_id,
          exerciseName: row.exercises?.name ?? 'Unknown',
          type: row.type,
          value: row.value,
          achievedAt: row.achieved_at,
        }));
        set({ personalRecords: records });
      }
    } catch (err: any) {
      console.warn('fetchPersonalRecords failed:', err?.message);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStreak: async () => {
    if (!hasSupabaseConfig) return;
    try {
      const { fetchCheckIns, getCurrentUserId } = await import('../services/supabaseQueries');
      const userId = getCurrentUserId();
      if (!userId) return;
      // Fetch last 30 days of check-ins
      const to = new Date().toISOString().split('T')[0];
      const from = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      const data = await fetchCheckIns(userId, { from, to });
      if (data) {
        // Count consecutive days from today backwards
        const dates = new Set((data as any[]).map((r) => r.date));
        let streak = 0;
        const current = new Date();
        for (let i = 0; i < 30; i++) {
          const dateStr = new Date(current.getTime() - i * 86400000).toISOString().split('T')[0];
          if (dates.has(dateStr)) {
            streak++;
          } else {
            break;
          }
        }
        set({ streak });
      }
    } catch (err: any) {
      console.warn('fetchStreak failed:', err?.message);
    }
  },

  fetchTrackStats: async () => {
    try {
      const { genesisAgentApi } = await import('../services/genesisAgentApi');
      const data = await genesisAgentApi.getTrackStats();
      set({
        completedWorkouts: data.completed_workouts,
        totalPlanned: data.total_planned,
      });
    } catch (err: any) {
      console.warn('fetchTrackStats failed:', err?.message);
    }
  },

  fetchStrengthProgress: async (exerciseName?: string) => {
    try {
      const { genesisAgentApi } = await import('../services/genesisAgentApi');
      const data = await genesisAgentApi.getStrengthProgress(exerciseName);
      set({
        strengthProgress: {
          exerciseName: data.exercise_name,
          dataPoints: data.data_points,
          changePercent: data.change_percent,
        },
      });
    } catch (err: any) {
      console.warn('fetchStrengthProgress failed:', err?.message);
    }
  },
}));
