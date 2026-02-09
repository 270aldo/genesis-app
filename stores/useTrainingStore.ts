import { create } from 'zustand';
import type { Exercise, ExerciseLibraryItem, ExerciseSet, WorkoutPlan, WorkoutSession } from '../types';
import type { Json } from '../types/supabase';
import { hasSupabaseConfig } from '../services/supabaseClient';

type WorkoutStatus = 'idle' | 'active' | 'paused' | 'completing' | 'completed';

type TrainingState = {
  currentSession: WorkoutSession | null;
  previousSessions: WorkoutSession[];
  isLoading: boolean;
  isRestTimerActive: boolean;
  restTimeRemaining: number;
  error: string | null;

  // Today's plan from BFF
  todayPlan: WorkoutPlan | null;
  isTodayPlanLoading: boolean;

  // Exercise catalog
  exerciseCatalog: ExerciseLibraryItem[];
  isCatalogLoading: boolean;

  // Workout state machine
  workoutStatus: WorkoutStatus;
  startTime: number | null;
  elapsedSeconds: number;
  currentExerciseIndex: number;
  currentSetIndex: number;

  setCurrentSession: (session: WorkoutSession) => void;
  completeExercise: (exerciseId: string) => void;
  updateExercise: (exerciseId: string, updates: Partial<Exercise>) => void;
  completeSession: () => void;
  startRestTimer: (seconds: number) => void;
  tickRestTimer: () => void;
  pauseRestTimer: () => void;
  fetchPreviousSessions: () => Promise<void>;
  fetchTodaySession: () => Promise<void>;
  fetchTodayPlan: () => Promise<void>;
  fetchExerciseCatalog: (muscleGroup?: string, search?: string) => Promise<void>;
  getExerciseById: (id: string) => ExerciseLibraryItem | undefined;

  // Workout state machine actions
  startWorkout: (session: WorkoutSession) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  logSet: (exerciseId: string, setNumber: number, data: { actualReps: number; actualWeight: number; rpe?: number }) => void;
  skipSet: (exerciseId: string, setNumber: number) => void;
  advanceToNextExercise: () => void;
  finishWorkout: () => Promise<void>;
  tickElapsed: () => void;
  resetWorkout: () => void;
};

export const useTrainingStore = create<TrainingState>((set, get) => ({
  currentSession: null,
  previousSessions: [],
  isLoading: false,
  isRestTimerActive: false,
  restTimeRemaining: 0,
  error: null,

  todayPlan: null,
  isTodayPlanLoading: false,

  exerciseCatalog: [],
  isCatalogLoading: false,

  workoutStatus: 'idle',
  startTime: null,
  elapsedSeconds: 0,
  currentExerciseIndex: 0,
  currentSetIndex: 0,

  setCurrentSession: (currentSession) => set({ currentSession }),

  completeExercise: (exerciseId) =>
    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            exercises: state.currentSession.exercises.map((exercise) =>
              exercise.id === exerciseId ? { ...exercise, completed: true } : exercise,
            ),
          }
        : null,
    })),

  updateExercise: (exerciseId, updates) =>
    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            exercises: state.currentSession.exercises.map((exercise) =>
              exercise.id === exerciseId ? { ...exercise, ...updates } : exercise,
            ),
          }
        : null,
    })),

  completeSession: () =>
    set((state) => ({
      currentSession: state.currentSession ? { ...state.currentSession, completed: true } : null,
    })),

  startRestTimer: (seconds) => set({ isRestTimerActive: true, restTimeRemaining: seconds }),

  tickRestTimer: () =>
    set((state) => ({
      restTimeRemaining: Math.max(0, state.restTimeRemaining - 1),
      isRestTimerActive: Math.max(0, state.restTimeRemaining - 1) > 0,
    })),

  pauseRestTimer: () => set({ isRestTimerActive: false }),

  fetchPreviousSessions: async () => {
    set({ isLoading: true });
    try {
      if (hasSupabaseConfig) {
        const { fetchPreviousSessions: fetchPrev } = await import('../services/supabaseQueries');
        const { getCurrentUserId } = await import('../services/supabaseQueries');
        const userId = getCurrentUserId();
        if (userId) {
          const data = await fetchPrev(userId) as any[] | null;
          if (data) {
            const sessions: WorkoutSession[] = data.map((s: any) => ({
              id: s.id,
              date: s.scheduled_date,
              duration: s.completed_at
                ? Math.round((new Date(s.completed_at).getTime() - new Date(s.created_at).getTime()) / 60000)
                : 0,
              completed: !!s.completed_at,
              exercises: (s.exercise_logs ?? []).map((log: any) => ({
                id: log.exercise_id,
                name: log.exercises?.name ?? 'Exercise',
                sets: Array.isArray(log.sets) ? log.sets.length : 0,
                reps: 0,
                weight: 0,
                unit: 'kg' as const,
                completed: true,
              })),
            }));
            set({ previousSessions: sessions, isLoading: false });
            return;
          }
        }
      }

      // Fallback mock
      const mock: WorkoutSession[] = [
        {
          id: 's-prev-1',
          date: new Date(Date.now() - 86400000).toISOString(),
          duration: 52,
          completed: true,
          exercises: [
            { id: 'e1', name: 'Back Squat', sets: 4, reps: 6, weight: 100, unit: 'kg', completed: true },
            { id: 'e2', name: 'Romanian Deadlift', sets: 3, reps: 8, weight: 80, unit: 'kg', completed: true },
          ],
        },
      ];
      set({ previousSessions: mock });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTodaySession: async () => {
    if (!hasSupabaseConfig) return;
    set({ isLoading: true });
    try {
      const { fetchTodaySession: fetchToday, getCurrentUserId } = await import('../services/supabaseQueries');
      const userId = getCurrentUserId();
      if (!userId) return;
      const data = await fetchToday(userId) as any | null;
      if (data) {
        const session: WorkoutSession = {
          id: data.id,
          date: data.scheduled_date,
          duration: 0,
          completed: false,
          exercises: (data.exercise_logs ?? []).map((log: any) => ({
            id: log.exercise_id,
            name: log.exercises?.name ?? 'Exercise',
            sets: Array.isArray(log.sets) ? log.sets.length : 0,
            reps: 0,
            weight: 0,
            unit: 'kg' as const,
            completed: false,
          })),
        };
        set({ currentSession: session });
      }
    } catch (err: any) {
      console.warn('fetchTodaySession failed:', err?.message);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTodayPlan: async () => {
    set({ isTodayPlanLoading: true, error: null });
    try {
      const { genesisAgentApi } = await import('../services/genesisAgentApi');
      const response = await genesisAgentApi.getTodayPlan();
      if (response.plan) {
        const plan: WorkoutPlan = {
          id: `plan-${Date.now()}`,
          name: response.plan.name,
          dayLabel: new Date().toLocaleDateString('es', { weekday: 'long' }),
          muscleGroups: response.plan.muscle_groups,
          estimatedDuration: response.plan.estimated_duration,
          phase: (response.plan.phase_focus as any) ?? 'hypertrophy',
          imageUrl: '',
          exercises: response.plan.exercises.map((ex) => ({
            id: ex.exercise_id,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: 0,
            unit: 'kg' as const,
            completed: false,
          })),
        };
        set({ todayPlan: plan });
      }
    } catch (err: any) {
      console.warn('fetchTodayPlan failed, using fallback:', err?.message);
      set({ error: err?.message ?? 'Error al cargar el plan de hoy' });
      // Fallback handled in the component
    } finally {
      set({ isTodayPlanLoading: false });
    }
  },

  fetchExerciseCatalog: async (muscleGroup?: string, search?: string) => {
    set({ isCatalogLoading: true });
    try {
      const { genesisAgentApi } = await import('../services/genesisAgentApi');
      const response = await genesisAgentApi.getExercises({ muscleGroup, search });
      const items: ExerciseLibraryItem[] = (response.exercises || []).map((row: any) => ({
        id: row.id,
        name: row.name ?? '',
        muscleGroup: (row.muscle_groups?.[0] ?? row.category ?? 'full_body') as ExerciseLibraryItem['muscleGroup'],
        secondaryMuscles: (row.muscle_groups ?? []).slice(1) as string[],
        equipment: (row.equipment?.[0] ?? 'bodyweight') as ExerciseLibraryItem['equipment'],
        difficulty: (row.difficulty ?? 'intermediate') as ExerciseLibraryItem['difficulty'],
        imageUrl: row.image_url ?? '',
        videoUrl: row.video_url ?? '',
        formCues: row.cues ?? [],
        alternatives: [],
        recommendedPhases: [],
      }));
      set({ exerciseCatalog: items });
    } catch (err: any) {
      console.warn('fetchExerciseCatalog failed:', err?.message);
      set({ exerciseCatalog: [] });
    } finally {
      set({ isCatalogLoading: false });
    }
  },

  getExerciseById: (id: string) => {
    return get().exerciseCatalog.find((e) => e.id === id);
  },

  // ── Workout State Machine ──

  startWorkout: (session) => {
    // Initialize exerciseSets on each exercise from sets count
    const exercises = session.exercises.map((ex) => {
      const exerciseSets: ExerciseSet[] = Array.from({ length: ex.sets }, (_, i) => ({
        setNumber: i + 1,
        targetReps: ex.reps,
        targetWeight: ex.weight,
        completed: false,
      }));
      return { ...ex, completed: false, exerciseSets };
    });

    set({
      currentSession: { ...session, exercises, completed: false },
      workoutStatus: 'active',
      startTime: Date.now(),
      elapsedSeconds: 0,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
    });
  },

  pauseWorkout: () => set({ workoutStatus: 'paused' }),

  resumeWorkout: () => set({ workoutStatus: 'active' }),

  logSet: (exerciseId, setNumber, data) =>
    set((state) => {
      if (!state.currentSession) return state;

      const exercises = state.currentSession.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const exerciseSets = (ex.exerciseSets ?? []).map((s) =>
          s.setNumber === setNumber
            ? { ...s, actualReps: data.actualReps, actualWeight: data.actualWeight, rpe: data.rpe, completed: true }
            : s,
        );
        const allDone = exerciseSets.every((s) => s.completed);
        return { ...ex, exerciseSets, completed: allDone };
      });

      return { currentSession: { ...state.currentSession, exercises } };
    }),

  skipSet: (exerciseId, setNumber) =>
    set((state) => {
      if (!state.currentSession) return state;

      const exercises = state.currentSession.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const exerciseSets = (ex.exerciseSets ?? []).map((s) =>
          s.setNumber === setNumber ? { ...s, completed: true, actualReps: 0, actualWeight: 0 } : s,
        );
        const allDone = exerciseSets.every((s) => s.completed);
        return { ...ex, exerciseSets, completed: allDone };
      });

      return { currentSession: { ...state.currentSession, exercises } };
    }),

  advanceToNextExercise: () =>
    set((state) => {
      const nextIndex = state.currentExerciseIndex + 1;
      const total = state.currentSession?.exercises.length ?? 0;
      if (nextIndex >= total) return state;
      return { currentExerciseIndex: nextIndex, currentSetIndex: 0 };
    }),

  finishWorkout: async () => {
    const state = get();
    if (!state.currentSession) return;

    set({ workoutStatus: 'completing' });

    const duration = Math.round(state.elapsedSeconds / 60);
    const completedSession: WorkoutSession = {
      ...state.currentSession,
      completed: true,
      duration,
    };

    // Optimistic local update
    set((s) => ({
      currentSession: completedSession,
      previousSessions: [completedSession, ...s.previousSessions],
      workoutStatus: 'completed',
    }));

    // Persist to Supabase
    if (hasSupabaseConfig) {
      try {
        const { completeSession: completeSesh, insertExerciseLogs } = await import('../services/supabaseQueries');
        await completeSesh(state.currentSession.id);

        const logs = state.currentSession.exercises
          .filter((ex) => ex.exerciseSets?.some((s) => s.completed))
          .map((ex) => ({
            exercise_id: ex.id,
            sets: (ex.exerciseSets ?? [])
              .filter((s) => s.completed)
              .map((s) => ({
                set_number: s.setNumber,
                reps: s.actualReps ?? s.targetReps,
                weight: s.actualWeight ?? s.targetWeight,
                rpe: s.rpe ?? null,
              })) as Json,
            rpe: Math.round(
              (ex.exerciseSets ?? []).reduce((sum, s) => sum + (s.rpe ?? 0), 0) /
              Math.max(1, (ex.exerciseSets ?? []).filter((s) => s.rpe).length),
            ),
          }));

        if (logs.length > 0) {
          await insertExerciseLogs(state.currentSession.id, logs);
        }
      } catch (err: any) {
        console.warn('finishWorkout persist failed:', err?.message);
      }
    }
  },

  tickElapsed: () =>
    set((state) => ({
      elapsedSeconds: state.workoutStatus === 'active' ? state.elapsedSeconds + 1 : state.elapsedSeconds,
    })),

  resetWorkout: () =>
    set({
      workoutStatus: 'idle',
      startTime: null,
      elapsedSeconds: 0,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      currentSession: null,
    }),
}));
