import type { Exercise, Meal, Season, User, WellnessCheckIn, Week, WorkoutPlan } from '../types';

// Demo user: Marco Reyes, Season 2, Week 6, Strength phase
export const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'marco@genesis.dev',
  name: 'Marco Reyes',
  plan: 'hybrid',
  subscriptionStatus: 'active',
};

// ── Season: Season 2, Week 6 of 12, Strength phase ──

const seasonStart = new Date('2026-01-05');

const DEMO_WEEKS: Week[] = Array.from({ length: 12 }, (_, i) => {
  const weekStart = new Date(seasonStart.getTime() + i * 7 * 86400000);
  const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);
  let phase: Week['phase'];
  if (i < 3) phase = 'hypertrophy';
  else if (i < 6) phase = 'strength';
  else if (i < 9) phase = 'power';
  else phase = 'power';
  return {
    number: i + 1,
    phase,
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString(),
    completed: i < 5, // weeks 1-5 completed
  };
});

export const DEMO_SEASON: Season = {
  seasonNumber: 2,
  currentWeek: 6,
  currentPhase: 'strength',
  weeks: DEMO_WEEKS,
  startDate: DEMO_WEEKS[0].startDate,
  endDate: DEMO_WEEKS[11].endDate,
  progressPercent: 46,
};

// ── Today's Plan: Chest + Triceps ──

const demoExercises: Exercise[] = [
  { id: 'ex-bench', name: 'Bench Press', sets: 4, reps: 6, weight: 90, unit: 'kg', completed: false },
  { id: 'ex-incline-db', name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 32, unit: 'kg', completed: false },
  { id: 'ex-cable-fly', name: 'Cable Fly', sets: 3, reps: 12, weight: 15, unit: 'kg', completed: false },
  { id: 'ex-dips', name: 'Weighted Dips', sets: 3, reps: 8, weight: 20, unit: 'kg', completed: false },
  { id: 'ex-tri-push', name: 'Tricep Pushdown', sets: 3, reps: 12, weight: 25, unit: 'kg', completed: false },
];

export const DEMO_TODAY_PLAN: WorkoutPlan = {
  id: 'demo-plan-001',
  name: 'Chest + Triceps — Strength',
  dayLabel: 'lunes',
  muscleGroups: ['chest', 'triceps'],
  exercises: demoExercises,
  estimatedDuration: 55,
  phase: 'strength',
  imageUrl: '',
};

// ── Meals ──

export const DEMO_MEALS: Meal[] = [
  { id: 'meal-1', name: 'breakfast', calories: 520, protein: 35, carbs: 55, fat: 18, time: '07:30 AM' },
  { id: 'meal-2', name: 'lunch', calories: 680, protein: 45, carbs: 65, fat: 22, time: '01:00 PM' },
  { id: 'meal-3', name: 'snack', calories: 280, protein: 20, carbs: 30, fat: 10, time: '04:30 PM' },
];

// ── Wellness Check-In ──

export const DEMO_CHECKIN: WellnessCheckIn = {
  date: new Date().toISOString().split('T')[0],
  mood: 'good',
  sleepHours: 7.5,
  sleepQuality: 'good',
  stressLevel: 4,
  energyLevel: 7,
};

// ── Personal Records ──

export const DEMO_PERSONAL_RECORDS: Array<{
  exerciseId: string;
  exerciseName: string;
  type: string;
  value: number;
  achievedAt: string;
}> = [
  { exerciseId: 'ex-bench', exerciseName: 'Bench Press', type: '1rm', value: 100, achievedAt: '2026-02-10' },
  { exerciseId: 'ex-squat', exerciseName: 'Back Squat', type: '1rm', value: 140, achievedAt: '2026-02-08' },
  { exerciseId: 'ex-deadlift', exerciseName: 'Deadlift', type: '1rm', value: 180, achievedAt: '2026-02-05' },
  { exerciseId: 'ex-ohp', exerciseName: 'Overhead Press', type: '1rm', value: 60, achievedAt: '2026-02-12' },
];

// ── Track Stats ──

export const DEMO_TRACK_STATS = {
  completedWorkouts: 22,
  totalPlanned: 30,
  streak: 5,
};
