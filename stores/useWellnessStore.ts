import { create } from 'zustand';
import type { WellnessCheckIn } from '../types';
import { hasSupabaseConfig } from '../services/supabaseClient';

type WellnessState = {
  todayCheckIn: WellnessCheckIn | null;
  weeklyCheckIns: WellnessCheckIn[];
  isLoading: boolean;
  updateCheckIn: (checkIn: Partial<WellnessCheckIn>) => void;
  addWeeklyCheckIn: (checkIn: WellnessCheckIn) => void;
  calculateWellnessScore: () => number;
  getRecoveryRecommendations: () => string[];
  fetchTodayCheckIn: () => Promise<void>;
  submitCheckIn: (data: {
    mood: string;
    sleepHours: number;
    sleepQuality: string;
    stressLevel: number;
    energyLevel: number;
    soreness?: number;
    notes?: string;
  }) => Promise<void>;
  fetchWeeklyCheckIns: () => Promise<void>;
};

const moodToNumber: Record<string, number> = { excellent: 5, good: 4, neutral: 3, poor: 2, terrible: 1 };
const numberToMood: Record<number, WellnessCheckIn['mood']> = { 5: 'excellent', 4: 'good', 3: 'neutral', 2: 'poor', 1: 'terrible' };
const sleepQualityToNumber: Record<string, number> = { excellent: 4, good: 3, fair: 2, poor: 1 };

export const useWellnessStore = create<WellnessState>((set, get) => ({
  todayCheckIn: null,
  weeklyCheckIns: [],
  isLoading: false,

  updateCheckIn: (checkIn) =>
    set((state) => ({
      todayCheckIn: state.todayCheckIn
        ? { ...state.todayCheckIn, ...checkIn }
        : ({
            date: new Date().toISOString(),
            mood: 'neutral',
            sleepHours: 0,
            sleepQuality: 'fair',
            stressLevel: 5,
            energyLevel: 5,
            ...checkIn,
          } as WellnessCheckIn),
    })),

  addWeeklyCheckIn: (checkIn) =>
    set((state) => ({ weeklyCheckIns: [checkIn, ...state.weeklyCheckIns].slice(0, 7) })),

  calculateWellnessScore: () => {
    const checkIn = get().todayCheckIn;
    if (!checkIn) return 0;

    const moodScores: Record<WellnessCheckIn['mood'], number> = {
      excellent: 25, good: 20, neutral: 15, poor: 5, terrible: 0,
    };

    let score = 0;
    score += checkIn.sleepHours >= 7 ? 25 : (checkIn.sleepHours / 7) * 25;
    score += checkIn.stressLevel <= 4 ? 25 : ((10 - checkIn.stressLevel) / 6) * 25;
    score += checkIn.energyLevel >= 7 ? 25 : (checkIn.energyLevel / 7) * 25;
    score += moodScores[checkIn.mood];

    return Math.round(Math.max(0, Math.min(score, 100)));
  },

  getRecoveryRecommendations: () => {
    const checkIn = get().todayCheckIn;
    if (!checkIn) return ['Completa tu check-in para recomendaciones personalizadas.'];

    const recommendations: string[] = [];
    if (checkIn.sleepHours < 6) recommendations.push('Prioriza 7-8 horas de sueño esta noche.');
    if (checkIn.stressLevel > 7) recommendations.push('Haz una sesión breve de respiración guiada.');
    if (checkIn.energyLevel < 4) recommendations.push('Reduce intensidad y programa recuperación activa.');
    if (recommendations.length === 0) recommendations.push('Estado sólido: mantén tu plan y progresión actual.');

    return recommendations;
  },

  fetchTodayCheckIn: async () => {
    if (!hasSupabaseConfig) return;
    set({ isLoading: true });
    try {
      const { fetchCheckIns, getCurrentUserId } = await import('../services/supabaseQueries');
      const userId = getCurrentUserId();
      if (!userId) return;
      const today = new Date().toISOString().split('T')[0];
      const data = await fetchCheckIns(userId, { from: today, to: today });
      if (data && data.length > 0) {
        const row = data[0] as any;
        set({
          todayCheckIn: {
            date: row.date,
            mood: numberToMood[row.mood] ?? 'neutral',
            sleepHours: row.sleep_hours,
            sleepQuality: row.sleep_quality >= 3 ? 'good' : row.sleep_quality >= 2 ? 'fair' : 'poor',
            stressLevel: row.stress,
            energyLevel: row.energy,
          },
        });
      }
    } catch (err: any) {
      console.warn('fetchTodayCheckIn failed:', err?.message);
    } finally {
      set({ isLoading: false });
    }
  },

  submitCheckIn: async (data) => {
    // Optimistic local update
    const checkIn: WellnessCheckIn = {
      date: new Date().toISOString(),
      mood: data.mood as WellnessCheckIn['mood'],
      sleepHours: data.sleepHours,
      sleepQuality: data.sleepQuality as WellnessCheckIn['sleepQuality'],
      stressLevel: data.stressLevel,
      energyLevel: data.energyLevel,
    };
    set({ todayCheckIn: checkIn });
    get().addWeeklyCheckIn(checkIn);

    // Persist to Supabase
    if (hasSupabaseConfig) {
      try {
        const { upsertCheckIn, getCurrentUserId } = await import('../services/supabaseQueries');
        const userId = getCurrentUserId();
        if (!userId) return;
        await upsertCheckIn(userId, {
          date: new Date().toISOString().split('T')[0],
          sleep_hours: data.sleepHours,
          sleep_quality: sleepQualityToNumber[data.sleepQuality] ?? 2,
          energy: data.energyLevel,
          mood: moodToNumber[data.mood] ?? 3,
          stress: data.stressLevel,
          soreness: data.soreness ?? 0,
          notes: data.notes ?? null,
        });
      } catch (err: any) {
        console.warn('submitCheckIn persist failed:', err?.message);
      }
    }
  },

  fetchWeeklyCheckIns: async () => {
    if (!hasSupabaseConfig) return;
    set({ isLoading: true });
    try {
      const { fetchCheckIns, getCurrentUserId } = await import('../services/supabaseQueries');
      const userId = getCurrentUserId();
      if (!userId) return;
      const to = new Date().toISOString().split('T')[0];
      const from = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      const data = await fetchCheckIns(userId, { from, to });
      if (data) {
        const checkIns: WellnessCheckIn[] = data.map((row: any) => ({
          date: row.date,
          mood: numberToMood[row.mood] ?? 'neutral',
          sleepHours: row.sleep_hours,
          sleepQuality: row.sleep_quality >= 3 ? 'good' : row.sleep_quality >= 2 ? 'fair' : 'poor',
          stressLevel: row.stress,
          energyLevel: row.energy,
        }));
        set({ weeklyCheckIns: checkIns });
      }
    } catch (err: any) {
      console.warn('fetchWeeklyCheckIns failed:', err?.message);
    } finally {
      set({ isLoading: false });
    }
  },
}));
