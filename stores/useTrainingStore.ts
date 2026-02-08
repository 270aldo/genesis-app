import { create } from 'zustand';
import type { Exercise, WorkoutSession } from '../types';

type TrainingState = {
  currentSession: WorkoutSession | null;
  previousSessions: WorkoutSession[];
  isRestTimerActive: boolean;
  restTimeRemaining: number;
  setCurrentSession: (session: WorkoutSession) => void;
  completeExercise: (exerciseId: string) => void;
  updateExercise: (exerciseId: string, updates: Partial<Exercise>) => void;
  completeSession: () => void;
  startRestTimer: (seconds: number) => void;
  tickRestTimer: () => void;
  pauseRestTimer: () => void;
  fetchPreviousSessions: () => Promise<void>;
};

export const useTrainingStore = create<TrainingState>((set) => ({
  currentSession: null,
  previousSessions: [],
  isRestTimerActive: false,
  restTimeRemaining: 0,
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
  },
}));
