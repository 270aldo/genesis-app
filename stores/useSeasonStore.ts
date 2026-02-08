import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Week } from '../types';
import { hasSupabaseConfig } from '../services/supabaseClient';

type SeasonState = {
  seasonNumber: number;
  currentWeek: number;
  currentPhase: string;
  weeks: Week[];
  startDate: string;
  endDate: string;
  progressPercent: number;
  isLoading: boolean;
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
      isLoading: false,
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
        set({ isLoading: true });
        try {
          if (hasSupabaseConfig) {
            const { fetchActiveSeason, getCurrentUserId } = await import('../services/supabaseQueries');
            const userId = getCurrentUserId();
            if (userId) {
              const season = await fetchActiveSeason(userId);
              if (season) {
                const now = new Date();
                // Flatten phases[].weeks[] into Week[]
                const allWeeks: Week[] = [];
                const phases = Array.isArray(season.phases) ? season.phases : [];
                // Sort phases by order_index
                const sortedPhases = [...phases].sort((a: any, b: any) => a.order_index - b.order_index);

                for (const phase of sortedPhases) {
                  const phaseWeeks = Array.isArray(phase.weeks) ? phase.weeks : [];
                  const sortedWeeks = [...phaseWeeks].sort((a: any, b: any) => a.week_number - b.week_number);
                  for (const week of sortedWeeks) {
                    allWeeks.push({
                      number: week.week_number,
                      phase: phase.focus as Week['phase'],
                      startDate: phase.start_date,
                      endDate: phase.end_date,
                      completed: false, // Determine from sessions later
                    });
                  }
                }

                // Find current phase (containing today's date)
                const currentPhaseObj = sortedPhases.find((p: any) => {
                  const start = new Date(p.start_date);
                  const end = new Date(p.end_date);
                  return now >= start && now <= end;
                });

                const completedWeeks = allWeeks.filter((w) => w.completed).length;
                const progressPercent = allWeeks.length > 0 ? Math.round((completedWeeks / allWeeks.length) * 100) : 0;

                set({
                  seasonNumber: 1,
                  weeks: allWeeks,
                  startDate: season.start_date,
                  endDate: season.end_date,
                  currentPhase: currentPhaseObj?.focus ?? sortedPhases[0]?.focus ?? 'hypertrophy',
                  currentWeek: allWeeks.length > 0 ? Math.min(completedWeeks + 1, allWeeks.length) : 1,
                  progressPercent,
                  isLoading: false,
                });
                return;
              }
            }
          }

          // Fallback: generate mock 12-week plan
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
        } catch (err: any) {
          console.warn('fetchSeasonPlan failed:', err?.message);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'genesis-season',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
