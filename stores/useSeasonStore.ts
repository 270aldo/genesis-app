import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Week } from '../types';

type SeasonState = {
  seasonNumber: number;
  currentWeek: number;
  currentPhase: string;
  weeks: Week[];
  startDate: string;
  endDate: string;
  progressPercent: number;
  setCurrentWeek: (week: number) => void;
  setProgressPercent: (percent: number) => void;
  completeWeek: (week: number) => void;
  setWeeks: (weeks: Week[]) => void;
  fetchSeasonPlan: () => Promise<void>;
};

export const useSeasonStore = create<SeasonState>()(
  persist(
    (set) => ({
      seasonNumber: 1,
      currentWeek: 1,
      currentPhase: 'strength',
      weeks: [],
      startDate: '',
      endDate: '',
      progressPercent: 0,
      setCurrentWeek: (currentWeek) => set({ currentWeek }),
      setProgressPercent: (progressPercent) => set({ progressPercent }),
      setWeeks: (weeks) => set({ weeks }),
      completeWeek: (week) =>
        set((state) => ({
          weeks: state.weeks.map((item) =>
            item.number === week ? { ...item, completed: true } : item,
          ),
        })),
      fetchSeasonPlan: async () => {
        const now = new Date();
        const sampleWeeks: Week[] = Array.from({ length: 12 }).map((_, index) => ({
          number: index + 1,
          phase: index < 4 ? 'hypertrophy' : index < 8 ? 'strength' : 'power',
          startDate: new Date(now.getTime() + index * 7 * 86400000).toISOString(),
          endDate: new Date(now.getTime() + (index * 7 + 6) * 86400000).toISOString(),
          completed: index + 1 < 3,
        }));

        set({
          weeks: sampleWeeks,
          startDate: sampleWeeks[0]?.startDate ?? '',
          endDate: sampleWeeks[sampleWeeks.length - 1]?.endDate ?? '',
          progressPercent: 18,
          currentWeek: 3,
          currentPhase: 'strength',
        });
      },
    }),
    {
      name: 'genesis-season',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
