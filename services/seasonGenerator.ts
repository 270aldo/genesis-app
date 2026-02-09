import { supabaseClient, hasSupabaseConfig } from './supabaseClient';

type GoalType = 'strength' | 'endurance' | 'aesthetics' | 'longevity';
type ScheduleDays = '3' | '4' | '5' | '6';
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

type PhaseTemplate = {
  name: string;
  focus: 'hypertrophy' | 'strength' | 'power' | 'endurance' | 'deload';
  weeks: number;
};

// Maps user goal → phase sequence (12 weeks total)
const GOAL_TO_PHASES: Record<GoalType, PhaseTemplate[]> = {
  aesthetics: [
    { name: 'Volumen', focus: 'hypertrophy', weeks: 4 },
    { name: 'Fuerza Base', focus: 'strength', weeks: 4 },
    { name: 'Pico Estético', focus: 'hypertrophy', weeks: 3 },
    { name: 'Deload', focus: 'deload', weeks: 1 },
  ],
  strength: [
    { name: 'Fuerza Máxima', focus: 'strength', weeks: 4 },
    { name: 'Potencia', focus: 'power', weeks: 4 },
    { name: 'Pico de Fuerza', focus: 'strength', weeks: 3 },
    { name: 'Deload', focus: 'deload', weeks: 1 },
  ],
  endurance: [
    { name: 'Base Aeróbica', focus: 'endurance', weeks: 4 },
    { name: 'Fuerza-Resistencia', focus: 'hypertrophy', weeks: 4 },
    { name: 'Pico Endurance', focus: 'endurance', weeks: 3 },
    { name: 'Deload', focus: 'deload', weeks: 1 },
  ],
  longevity: [
    { name: 'Funcionalidad', focus: 'hypertrophy', weeks: 4 },
    { name: 'Fuerza Saludable', focus: 'strength', weeks: 4 },
    { name: 'Movilidad Activa', focus: 'endurance', weeks: 3 },
    { name: 'Deload', focus: 'deload', weeks: 1 },
  ],
};

// Maps schedule days → training day_of_week (0=Mon...6=Sun)
const SCHEDULE_TO_DAYS: Record<ScheduleDays, number[]> = {
  '3': [0, 2, 4],           // Mon, Wed, Fri
  '4': [0, 1, 3, 4],        // Mon, Tue, Thu, Fri
  '5': [0, 1, 2, 3, 4],     // Mon-Fri
  '6': [0, 1, 2, 3, 4, 5],  // Mon-Sat
};

// Muscle group templates per schedule configuration
type DayTemplate = {
  name: string;
  muscleGroups: string[];
};

const DAY_TEMPLATES: Record<ScheduleDays, DayTemplate[]> = {
  '3': [
    { name: 'Full Body A', muscleGroups: ['chest', 'back', 'legs'] },
    { name: 'Full Body B', muscleGroups: ['shoulders', 'legs', 'arms'] },
    { name: 'Full Body C', muscleGroups: ['back', 'chest', 'core'] },
  ],
  '4': [
    { name: 'Upper Push', muscleGroups: ['chest', 'shoulders', 'triceps'] },
    { name: 'Lower A', muscleGroups: ['legs', 'glutes', 'core'] },
    { name: 'Upper Pull', muscleGroups: ['back', 'biceps', 'rear delts'] },
    { name: 'Lower B', muscleGroups: ['legs', 'hamstrings', 'glutes'] },
  ],
  '5': [
    { name: 'Push', muscleGroups: ['chest', 'shoulders', 'triceps'] },
    { name: 'Pull', muscleGroups: ['back', 'biceps', 'rear delts'] },
    { name: 'Legs', muscleGroups: ['legs', 'glutes', 'hamstrings'] },
    { name: 'Upper', muscleGroups: ['chest', 'back', 'shoulders'] },
    { name: 'Lower + Core', muscleGroups: ['legs', 'glutes', 'core'] },
  ],
  '6': [
    { name: 'Push A', muscleGroups: ['chest', 'shoulders', 'triceps'] },
    { name: 'Pull A', muscleGroups: ['back', 'biceps', 'rear delts'] },
    { name: 'Legs A', muscleGroups: ['legs', 'glutes', 'hamstrings'] },
    { name: 'Push B', muscleGroups: ['chest', 'front delts', 'triceps'] },
    { name: 'Pull B', muscleGroups: ['back', 'biceps', 'traps'] },
    { name: 'Legs B', muscleGroups: ['legs', 'glutes', 'core'] },
  ],
};

// Phase focus → rep/set config
const PHASE_EXERCISE_CONFIG: Record<string, { sets: number; reps: number; rest_seconds: number }> = {
  hypertrophy: { sets: 4, reps: 10, rest_seconds: 75 },
  strength: { sets: 5, reps: 5, rest_seconds: 150 },
  power: { sets: 4, reps: 4, rest_seconds: 120 },
  endurance: { sets: 3, reps: 15, rest_seconds: 45 },
  deload: { sets: 2, reps: 10, rest_seconds: 60 },
};

async function fetchExercisesByMuscleGroups(groups: string[]): Promise<Array<{ id: string; name: string }>> {
  if (!hasSupabaseConfig) return [];
  const { data, error } = await supabaseClient
    .from('exercises')
    .select('id, name, muscle_groups')
    .overlaps('muscle_groups', groups)
    .limit(8);
  if (error) {
    console.warn('fetchExercisesByMuscleGroups:', error.message);
    return [];
  }
  return data ?? [];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function generateDefaultSeason(
  userId: string,
  goal: string,
  schedule: string,
  _experienceLevel: string,
): Promise<string | null> {
  if (!hasSupabaseConfig) return null;

  const goalKey = (goal || 'aesthetics') as GoalType;
  const scheduleKey = (schedule || '4') as ScheduleDays;
  const phaseTemplates = GOAL_TO_PHASES[goalKey] ?? GOAL_TO_PHASES.aesthetics;
  const trainingDays = SCHEDULE_TO_DAYS[scheduleKey] ?? SCHEDULE_TO_DAYS['4'];
  const dayTemplates = DAY_TEMPLATES[scheduleKey] ?? DAY_TEMPLATES['4'];

  const startDate = new Date();
  const endDate = addDays(startDate, 12 * 7);

  // 1. Create season
  const goalMap: Record<GoalType, 'build' | 'cut' | 'maintain' | 'peak'> = {
    aesthetics: 'build',
    strength: 'peak',
    endurance: 'maintain',
    longevity: 'maintain',
  };
  const { data: season, error: seasonError } = await supabaseClient
    .from('seasons')
    .insert({
      user_id: userId,
      name: 'Season 1',
      goal: goalMap[goalKey] ?? ('maintain' as const),
      start_date: toISODate(startDate),
      end_date: toISODate(endDate),
      status: 'active' as const,
    })
    .select()
    .single();

  if (seasonError || !season) {
    console.warn('generateDefaultSeason — season creation failed:', seasonError?.message);
    return null;
  }

  // 2. Create phases
  let phaseStart = new Date(startDate);
  for (let i = 0; i < phaseTemplates.length; i++) {
    const template = phaseTemplates[i];
    const phaseEnd = addDays(phaseStart, template.weeks * 7 - 1);

    const { data: phase, error: phaseError } = await supabaseClient
      .from('phases')
      .insert({
        season_id: season.id,
        name: template.name,
        focus: template.focus as 'hypertrophy' | 'strength' | 'power' | 'endurance' | 'deload',
        order_index: i,
        start_date: toISODate(phaseStart),
        end_date: toISODate(phaseEnd),
      })
      .select()
      .single();

    if (phaseError || !phase) {
      console.warn(`generateDefaultSeason — phase ${i} failed:`, phaseError?.message);
      phaseStart = addDays(phaseEnd, 1);
      continue;
    }

    // 3. Create weekly_plans for this phase
    const config = PHASE_EXERCISE_CONFIG[template.focus] ?? PHASE_EXERCISE_CONFIG.hypertrophy;

    for (let d = 0; d < trainingDays.length; d++) {
      const dayTemplate = dayTemplates[d % dayTemplates.length];
      const exercises = await fetchExercisesByMuscleGroups(dayTemplate.muscleGroups);

      const exerciseEntries = exercises.slice(0, 6).map((ex, order) => ({
        exercise_id: ex.id,
        sets: config.sets,
        reps: config.reps,
        rest_seconds: config.rest_seconds,
        order: order + 1,
      }));

      await supabaseClient
        .from('weekly_plans')
        .insert({
          phase_id: phase.id,
          day_of_week: trainingDays[d],
          name: dayTemplate.name,
          muscle_groups: dayTemplate.muscleGroups,
          exercises: exerciseEntries,
          estimated_duration: Math.max(30, exercises.length * 8),
        });
    }

    phaseStart = addDays(phaseEnd, 1);
  }

  return season.id;
}
