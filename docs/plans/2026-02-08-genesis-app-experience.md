# GENESIS App Complete Experience — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the GENESIS app from static UI prototype into a fully functional, season-aware, media-rich experience across all 5 tabs + chat + library + education screens.

**Architecture:** All screens read from Zustand stores fed by mock data providers (simulating BFF responses). Each screen reflects the current Season/Phase/Week. New screens (Library, Education) are stack screens accessed from tabs — no new tabs added. Rich media via expo-image with gradient overlays on cards.

**Tech Stack:** Expo 54, React Native 0.81, Expo Router v6, Zustand 5, NativeWind/Tailwind 3, expo-image, expo-av, expo-linear-gradient, Lucide icons, TypeScript.

**Existing Assets:**
- 5 tab screens (home, train, fuel, mind, track) — UI complete, hardcoded data
- 5 modals (genesis-chat, voice-call, check-in, camera-scanner, exercise-video)
- 65+ components across ui/, cards/, genesis/, tracking/, navigation/
- 8 Zustand stores (auth, season, training, nutrition, wellness, track, genesis, cache)
- Design system: GENESIS_COLORS, GLASS_SHADOWS, GlassCard, GradientCard, Pill, etc.

---

## PHASE 1: Data Foundation & Season System
*Goal: Replace all hardcoded data with store-driven reactive data. Make every screen season-aware.*

---

### Task 1: Expand Type Definitions

**Files:**
- Modify: `types/models.ts`

**Step 1: Add missing types for Library and Education**

```typescript
// Add after existing types in models.ts

export type PhaseType = 'hypertrophy' | 'strength' | 'power' | 'deload';

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  muscleGroup: 'chest' | 'back' | 'shoulders' | 'legs' | 'arms' | 'core' | 'full_body';
  secondaryMuscles: string[];
  equipment: 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'band';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl: string;
  videoUrl: string;
  formCues: string[];
  alternatives: string[]; // IDs of alternative exercises
  recommendedPhases: PhaseType[];
}

export interface EducationContent {
  id: string;
  title: string;
  subtitle: string;
  type: 'micro_lesson' | 'video_course' | 'deep_dive' | 'genesis_explains';
  category: 'training' | 'nutrition' | 'recovery' | 'mindset' | 'science';
  imageUrl: string;
  duration: string; // "3 min read", "8 min video"
  relevantPhases: PhaseType[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed?: boolean;
  progress?: number; // 0-100 for courses
}

export interface CourseEpisode {
  id: string;
  courseId: string;
  title: string;
  duration: string;
  videoUrl: string;
  order: number;
  completed: boolean;
}

export interface DailyBriefing {
  greeting: string;
  message: string;
  imageUrl: string;
  phase: PhaseType;
  weekNumber: number;
  seasonNumber: number;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  dayLabel: string; // "Day 3"
  muscleGroups: string[];
  exercises: Exercise[];
  estimatedDuration: number;
  phase: PhaseType;
  imageUrl: string;
}

export interface MuscleRecovery {
  muscleGroup: string;
  status: 'recovered' | 'moderate' | 'fatigued';
  lastTrained: string; // ISO date
  daysSinceTraining: number;
}

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
}

// Extend existing Week type
export interface WeekExtended extends Week {
  workoutPlans: WorkoutPlan[];
  nutritionTargets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    surplus: number; // positive = surplus, negative = deficit
  };
}
```

**Step 2: Export new types from barrel**

Add to `types/index.ts`:
```typescript
export type { ExerciseLibraryItem, EducationContent, CourseEpisode, DailyBriefing, WorkoutPlan, MuscleRecovery, QuickAction, WeekExtended, PhaseType } from './models';
```

**Step 3: Verify TypeScript compiles**

Run: `cd /sessions/peaceful-upbeat-heisenberg/mnt/genesis-app && npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors from type additions

---

### Task 2: Create Mock Data Provider

**Files:**
- Create: `data/mockData.ts`
- Create: `data/index.ts`

**Step 1: Create comprehensive mock data file**

```typescript
// data/mockData.ts
import type {
  DailyBriefing,
  EducationContent,
  Exercise,
  ExerciseLibraryItem,
  Meal,
  MuscleRecovery,
  PhaseType,
  QuickAction,
  WorkoutPlan,
} from '../types';

// ── Phase-aware config ──
export const PHASE_CONFIG: Record<PhaseType, {
  label: string;
  color: string;
  accentColor: string;
  restSeconds: number;
  repRange: string;
  setsRange: string;
  nutritionNote: string;
  calorieAdjustment: number;
}> = {
  hypertrophy: {
    label: 'Hypertrophy',
    color: '#6c3bff',
    accentColor: '#b39aff',
    restSeconds: 75,
    repRange: '10-12',
    setsRange: '3-4',
    nutritionNote: 'Surplus calórico +300 kcal para crecimiento muscular',
    calorieAdjustment: 300,
  },
  strength: {
    label: 'Strength',
    color: '#38bdf8',
    accentColor: '#7dd3fc',
    restSeconds: 150,
    repRange: '4-6',
    setsRange: '4-5',
    nutritionNote: 'Mantenimiento calórico con proteína alta',
    calorieAdjustment: 0,
  },
  power: {
    label: 'Power',
    color: '#F97316',
    accentColor: '#fb923c',
    restSeconds: 120,
    repRange: '3-5',
    setsRange: '3-4',
    nutritionNote: 'Mantenimiento con énfasis en timing pre-workout',
    calorieAdjustment: 100,
  },
  deload: {
    label: 'Deload',
    color: '#22ff73',
    accentColor: '#86efac',
    restSeconds: 60,
    repRange: '8-10',
    setsRange: '2-3',
    nutritionNote: 'Ligero déficit permitido. Prioriza recovery.',
    calorieAdjustment: -200,
  },
};

// ── Image URLs (Unsplash fitness) ──
export const IMAGES = {
  // Muscle group workout images
  chest: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
  back: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=800&q=80',
  shoulders: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  legs: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&q=80',
  arms: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
  core: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  // Meal images
  breakfast: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80',
  lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  dinner: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80',
  snack: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
  // Mind/Meditation images
  morning: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
  focus: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&q=80',
  night: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&q=80',
  recovery: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
  // Education images
  periodization: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
  nutrition_science: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80',
  sleep_science: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&q=80',
  muscle_growth: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=400&q=80',
  // Hero/briefing images
  hero_gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  hero_nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  hero_track: 'https://images.unsplash.com/photo-1461896836934-bd45ba8020c5?w=800&q=80',
};

// ── Daily Briefing ──
export function getMockBriefing(phase: PhaseType, week: number): DailyBriefing {
  const phaseConfig = PHASE_CONFIG[phase];
  const briefings: Record<PhaseType, string> = {
    hypertrophy: `Semana ${week} de Hypertrophy. Hoy toca pecho y hombros. Tu recovery está en 82% — vas bien para meter volumen. Enfócate en tempo controlado y rango completo.`,
    strength: `Semana ${week} de Strength. Día de sentadilla pesada. Sleep de anoche fue 7h 40m — suficiente para cargas altas. Calienta bien y respeta los descansos largos.`,
    power: `Semana ${week} de Power. Hoy trabajamos explosividad. Mantén las reps bajas y la velocidad alta. Tu volumen acumulado esta semana va perfecto.`,
    deload: `Semana ${week} — Deload. Baja el volumen un 40% y enfócate en movilidad y técnica. Tu cuerpo necesita esto para seguir progresando. No es retroceso, es estrategia.`,
  };

  return {
    greeting: getTimeGreeting(),
    message: briefings[phase],
    imageUrl: IMAGES.hero_gym,
    phase,
    weekNumber: week,
    seasonNumber: 1,
  };
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

// ── Workout Plans (phase-dependent) ──
export const MOCK_WORKOUT_PLANS: Record<string, WorkoutPlan> = {
  'push_hyp': {
    id: 'push_hyp',
    name: 'Push Day',
    dayLabel: 'Day 3',
    muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
    estimatedDuration: 55,
    phase: 'hypertrophy',
    imageUrl: IMAGES.chest,
    exercises: [
      { id: 'ex1', name: 'Bench Press', sets: 4, reps: 10, weight: 80, unit: 'kg', completed: false, videoUrl: '' },
      { id: 'ex2', name: 'Incline DB Press', sets: 3, reps: 12, weight: 30, unit: 'kg', completed: false, videoUrl: '' },
      { id: 'ex3', name: 'Cable Flyes', sets: 3, reps: 15, weight: 15, unit: 'kg', completed: false, videoUrl: '' },
      { id: 'ex4', name: 'OHP', sets: 4, reps: 10, weight: 50, unit: 'kg', completed: false, videoUrl: '' },
      { id: 'ex5', name: 'Lateral Raises', sets: 4, reps: 15, weight: 10, unit: 'kg', completed: false, videoUrl: '' },
      { id: 'ex6', name: 'Tricep Pushdowns', sets: 3, reps: 12, weight: 25, unit: 'kg', completed: false, videoUrl: '' },
    ],
  },
  'pull_hyp': {
    id: 'pull_hyp',
    name: 'Pull Day',
    dayLabel: 'Day 4',
    muscleGroups: ['Back', 'Biceps', 'Rear Delts'],
    estimatedDuration: 50,
    phase: 'hypertrophy',
    imageUrl: IMAGES.back,
    exercises: [
      { id: 'ex7', name: 'Barbell Row', sets: 4, reps: 10, weight: 70, unit: 'kg', completed: false, videoUrl: '' },
      { id: 'ex8', name: 'Lat Pulldown', sets: 3, reps: 12, weight: 60, unit: 'kg', completed: false, videoUrl: '' },
      { id: 'ex9', name: 'Seated Cable Row', sets: 3, reps: 12, weight: 55, unit: 'kg', completed: false, videoUrl: '' },
      { id: 'ex10', name: 'Face Pulls', sets: 3, reps: 15, weight: 20, unit: 'kg', completed: false, videoUrl: '' },
      { id: 'ex11', name: 'Barbell Curl', sets: 3, reps: 12, weight: 30, unit: 'kg', completed: false, videoUrl: '' },
      { id: 'ex12', name: 'Hammer Curls', sets: 3, reps: 12, weight: 14, unit: 'kg', completed: false, videoUrl: '' },
    ],
  },
  'legs_hyp': {
    id: 'legs_hyp',
    name: 'Leg Day',
    dayLabel: 'Day 5',
    muscleGroups: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
    estimatedDuration: 60,
    phase: 'hypertrophy',
    imageUrl: IMAGES.legs,
    exercises: [
      { id: 'ex13', name: 'Squat', sets: 4, reps: 10, weight: 100, unit: 'kg', completed: false, videoUrl: '' },
      { id: 'ex14', name: 'Romanian Deadlift', sets: 3, reps: 12, weight: 80, unit: 'kg', completed: false, videoUrl: '' },
      { id: 'ex15', name: 'Leg Press', sets: 3, reps: 12, weight: 180, unit: 'kg', completed: false, videoUrl: '' },
      { id: 'ex16', name: 'Leg Curl', sets: 3, reps: 12, weight: 45, unit: 'kg', completed: false, videoUrl: '' },
      { id: 'ex17', name: 'Calf Raises', sets: 4, reps: 15, weight: 60, unit: 'kg', completed: false, videoUrl: '' },
    ],
  },
};

// ── Exercise Library (30 exercises to start) ──
export const MOCK_EXERCISE_LIBRARY: ExerciseLibraryItem[] = [
  {
    id: 'lib_bench', name: 'Bench Press', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'front delts'],
    equipment: 'barbell', difficulty: 'intermediate', imageUrl: IMAGES.chest, videoUrl: '',
    formCues: ['Retrae escápulas antes de bajar', 'Baja la barra al pecho medio', 'Empuja en arco hacia atrás', 'No bloquees codos completamente arriba'],
    alternatives: ['lib_db_bench', 'lib_incline_bench'], recommendedPhases: ['hypertrophy', 'strength', 'power'],
  },
  {
    id: 'lib_db_bench', name: 'Dumbbell Bench Press', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'front delts'],
    equipment: 'dumbbell', difficulty: 'beginner', imageUrl: IMAGES.chest, videoUrl: '',
    formCues: ['Mayor rango de movimiento que barra', 'Baja hasta sentir estiramiento en pecho', 'Mantén muñecas neutras'],
    alternatives: ['lib_bench', 'lib_incline_db'], recommendedPhases: ['hypertrophy'],
  },
  {
    id: 'lib_incline_bench', name: 'Incline Bench Press', muscleGroup: 'chest', secondaryMuscles: ['front delts', 'triceps'],
    equipment: 'barbell', difficulty: 'intermediate', imageUrl: IMAGES.chest, videoUrl: '',
    formCues: ['Banco a 30-45 grados', 'Baja al pecho superior', 'Enfócate en la contracción del pecho superior'],
    alternatives: ['lib_incline_db'], recommendedPhases: ['hypertrophy', 'strength'],
  },
  {
    id: 'lib_incline_db', name: 'Incline DB Press', muscleGroup: 'chest', secondaryMuscles: ['front delts'],
    equipment: 'dumbbell', difficulty: 'beginner', imageUrl: IMAGES.chest, videoUrl: '',
    formCues: ['30 grados de inclinación', 'Baja controlado 3 segundos', 'Junta las mancuernas arriba sin chocarlas'],
    alternatives: ['lib_incline_bench'], recommendedPhases: ['hypertrophy'],
  },
  {
    id: 'lib_cable_fly', name: 'Cable Flyes', muscleGroup: 'chest', secondaryMuscles: ['front delts'],
    equipment: 'cable', difficulty: 'beginner', imageUrl: IMAGES.chest, videoUrl: '',
    formCues: ['Ligera flexión de codos constante', 'Siente el estiramiento al abrir', 'Aprieta al centro como abrazando'],
    alternatives: ['lib_pec_deck'], recommendedPhases: ['hypertrophy', 'deload'],
  },
  {
    id: 'lib_squat', name: 'Back Squat', muscleGroup: 'legs', secondaryMuscles: ['glutes', 'core'],
    equipment: 'barbell', difficulty: 'intermediate', imageUrl: IMAGES.legs, videoUrl: '',
    formCues: ['Pies al ancho de hombros', 'Baja hasta que cadera pase rodilla', 'Empuja con talones', 'Mantén pecho arriba y core tenso'],
    alternatives: ['lib_front_squat', 'lib_leg_press'], recommendedPhases: ['hypertrophy', 'strength', 'power'],
  },
  {
    id: 'lib_deadlift', name: 'Conventional Deadlift', muscleGroup: 'back', secondaryMuscles: ['hamstrings', 'glutes', 'core'],
    equipment: 'barbell', difficulty: 'advanced', imageUrl: IMAGES.back, videoUrl: '',
    formCues: ['Barra pegada al cuerpo siempre', 'Empuja el piso con los pies', 'Bloquea cadera y rodilla al mismo tiempo', 'Espalda neutra — nunca redondear'],
    alternatives: ['lib_rdl', 'lib_trap_bar'], recommendedPhases: ['strength', 'power'],
  },
  {
    id: 'lib_rdl', name: 'Romanian Deadlift', muscleGroup: 'legs', secondaryMuscles: ['hamstrings', 'glutes', 'lower back'],
    equipment: 'barbell', difficulty: 'intermediate', imageUrl: IMAGES.legs, videoUrl: '',
    formCues: ['Rodillas semi-flexionadas fijas', 'Baja deslizando barra por los muslos', 'Siente estiramiento en isquios', 'No bajes más allá de media espinilla'],
    alternatives: ['lib_deadlift'], recommendedPhases: ['hypertrophy', 'strength'],
  },
  {
    id: 'lib_ohp', name: 'Overhead Press', muscleGroup: 'shoulders', secondaryMuscles: ['triceps', 'core'],
    equipment: 'barbell', difficulty: 'intermediate', imageUrl: IMAGES.shoulders, videoUrl: '',
    formCues: ['Empieza desde clavícula', 'Empuja recto hacia arriba', 'Mete la cabeza al pasar la barra', 'Core apretado — no arquees espalda'],
    alternatives: ['lib_db_ohp'], recommendedPhases: ['strength', 'power'],
  },
  {
    id: 'lib_lat_raise', name: 'Lateral Raises', muscleGroup: 'shoulders', secondaryMuscles: ['traps'],
    equipment: 'dumbbell', difficulty: 'beginner', imageUrl: IMAGES.shoulders, videoUrl: '',
    formCues: ['Sube hasta paralelo al piso', 'Ligera inclinación hacia adelante', 'Codos ligeramente flexionados', 'Controla la bajada — no dejes caer'],
    alternatives: ['lib_cable_lat_raise'], recommendedPhases: ['hypertrophy', 'deload'],
  },
  {
    id: 'lib_barbell_row', name: 'Barbell Row', muscleGroup: 'back', secondaryMuscles: ['biceps', 'rear delts'],
    equipment: 'barbell', difficulty: 'intermediate', imageUrl: IMAGES.back, videoUrl: '',
    formCues: ['Torso a 45 grados', 'Jala hacia el ombligo', 'Aprieta escápulas arriba 1 segundo', 'No uses momentum del torso'],
    alternatives: ['lib_db_row', 'lib_cable_row'], recommendedPhases: ['hypertrophy', 'strength'],
  },
  {
    id: 'lib_pullup', name: 'Pull-ups', muscleGroup: 'back', secondaryMuscles: ['biceps', 'core'],
    equipment: 'bodyweight', difficulty: 'intermediate', imageUrl: IMAGES.back, videoUrl: '',
    formCues: ['Agarre prono al ancho de hombros', 'Jala codos hacia la cadera', 'Sube hasta mentón sobre barra', 'Baja controlado — extensión completa'],
    alternatives: ['lib_lat_pulldown'], recommendedPhases: ['hypertrophy', 'strength', 'power'],
  },
  {
    id: 'lib_lat_pulldown', name: 'Lat Pulldown', muscleGroup: 'back', secondaryMuscles: ['biceps'],
    equipment: 'cable', difficulty: 'beginner', imageUrl: IMAGES.back, videoUrl: '',
    formCues: ['Inclina torso ligeramente atrás', 'Jala al pecho superior', 'Aprieta escápulas abajo y atrás', 'Extensión completa arriba'],
    alternatives: ['lib_pullup'], recommendedPhases: ['hypertrophy', 'deload'],
  },
  {
    id: 'lib_leg_press', name: 'Leg Press', muscleGroup: 'legs', secondaryMuscles: ['glutes'],
    equipment: 'machine', difficulty: 'beginner', imageUrl: IMAGES.legs, videoUrl: '',
    formCues: ['Pies al ancho de hombros en la plataforma', 'Baja hasta 90 grados de rodilla', 'No bloquees rodillas arriba', 'Mantén espalda baja pegada al respaldo'],
    alternatives: ['lib_squat'], recommendedPhases: ['hypertrophy', 'deload'],
  },
  {
    id: 'lib_barbell_curl', name: 'Barbell Curl', muscleGroup: 'arms', secondaryMuscles: ['forearms'],
    equipment: 'barbell', difficulty: 'beginner', imageUrl: IMAGES.arms, videoUrl: '',
    formCues: ['Codos pegados al cuerpo', 'Sube sin balancear el torso', 'Aprieta bíceps arriba 1 segundo', 'Baja controlado'],
    alternatives: ['lib_db_curl'], recommendedPhases: ['hypertrophy'],
  },
  {
    id: 'lib_tricep_pushdown', name: 'Tricep Pushdowns', muscleGroup: 'arms', secondaryMuscles: [],
    equipment: 'cable', difficulty: 'beginner', imageUrl: IMAGES.arms, videoUrl: '',
    formCues: ['Codos fijos a los costados', 'Extiende completamente abajo', 'No dejes que el peso jale los brazos arriba rápido'],
    alternatives: ['lib_skull_crusher'], recommendedPhases: ['hypertrophy', 'deload'],
  },
];

// ── Meals (mock logged meals) ──
export const MOCK_MEALS: Meal[] = [
  { id: 'm1', name: 'Breakfast', calories: 520, protein: 35, carbs: 55, fat: 18, time: '07:30', imageUrl: IMAGES.breakfast },
  { id: 'm2', name: 'Lunch', calories: 680, protein: 45, carbs: 65, fat: 22, time: '13:00', imageUrl: IMAGES.lunch },
  { id: 'm3', name: 'Snack', calories: 247, protein: 20, carbs: 15, fat: 12, time: '16:00', imageUrl: IMAGES.snack },
  { id: 'm4', name: 'Dinner', calories: 0, protein: 0, carbs: 0, fat: 0, time: '20:00', imageUrl: IMAGES.dinner },
];

// ── Education Content ──
export const MOCK_EDUCATION: EducationContent[] = [
  {
    id: 'edu1', title: 'Tempo Training: Por qué los segundos importan más que los kilos',
    subtitle: 'El secreto de la hipertrofia que casi nadie aplica', type: 'micro_lesson', category: 'training',
    imageUrl: IMAGES.muscle_growth, duration: '4 min', relevantPhases: ['hypertrophy'], difficulty: 'beginner',
  },
  {
    id: 'edu2', title: 'Fundamentos de Periodización',
    subtitle: 'Cómo estructurar semanas para progresar sin estancarte', type: 'video_course', category: 'training',
    imageUrl: IMAGES.periodization, duration: '8 episodios', relevantPhases: ['hypertrophy', 'strength', 'power', 'deload'], difficulty: 'intermediate',
  },
  {
    id: 'edu3', title: 'Protein Timing: Lo que dice la evidencia actual',
    subtitle: 'Más allá de la ventana anabólica', type: 'deep_dive', category: 'nutrition',
    imageUrl: IMAGES.nutrition_science, duration: '12 min', relevantPhases: ['hypertrophy', 'strength'], difficulty: 'advanced',
  },
  {
    id: 'edu4', title: 'GENESIS te explica: Por qué el sleep es tu mejor suplemento',
    subtitle: 'La ciencia del recovery nocturno', type: 'genesis_explains', category: 'recovery',
    imageUrl: IMAGES.sleep_science, duration: '5 min', relevantPhases: ['hypertrophy', 'strength', 'power', 'deload'], difficulty: 'beginner',
  },
  {
    id: 'edu5', title: 'Progressive Overload: El único principio que importa',
    subtitle: 'Cómo aplicarlo correctamente sin lesionarte', type: 'micro_lesson', category: 'training',
    imageUrl: IMAGES.muscle_growth, duration: '3 min', relevantPhases: ['hypertrophy', 'strength'], difficulty: 'beginner',
  },
  {
    id: 'edu6', title: 'Deload: No es debilidad, es estrategia',
    subtitle: 'Cuándo, cómo y por qué bajar el volumen', type: 'genesis_explains', category: 'recovery',
    imageUrl: IMAGES.recovery, duration: '4 min', relevantPhases: ['deload'], difficulty: 'beginner',
  },
];

// ── Recovery Heatmap ──
export const MOCK_RECOVERY: MuscleRecovery[] = [
  { muscleGroup: 'Chest', status: 'moderate', lastTrained: new Date(Date.now() - 86400000).toISOString(), daysSinceTraining: 1 },
  { muscleGroup: 'Back', status: 'recovered', lastTrained: new Date(Date.now() - 172800000).toISOString(), daysSinceTraining: 2 },
  { muscleGroup: 'Shoulders', status: 'moderate', lastTrained: new Date(Date.now() - 86400000).toISOString(), daysSinceTraining: 1 },
  { muscleGroup: 'Legs', status: 'recovered', lastTrained: new Date(Date.now() - 259200000).toISOString(), daysSinceTraining: 3 },
  { muscleGroup: 'Arms', status: 'fatigued', lastTrained: new Date(Date.now() - 43200000).toISOString(), daysSinceTraining: 0 },
  { muscleGroup: 'Core', status: 'recovered', lastTrained: new Date(Date.now() - 172800000).toISOString(), daysSinceTraining: 2 },
];

// ── Quick Actions for Chat ──
export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'qa1', label: '¿Qué entreno hoy?', prompt: '¿Qué entreno hoy según mi plan?' },
  { id: 'qa2', label: 'Analiza mi semana', prompt: 'Analiza cómo va mi semana de entrenamiento y nutrición' },
  { id: 'qa3', label: 'Sugiéreme comida', prompt: 'Sugiéreme opciones de comida para cubrir mis macros restantes' },
  { id: 'qa4', label: '¿Cómo va mi season?', prompt: '¿Cómo va mi progreso en este season?' },
  { id: 'qa5', label: 'Explícame mi fase', prompt: 'Explícame qué significa la fase actual y cómo debo entrenar' },
  { id: 'qa6', label: 'Tips de recovery', prompt: 'Dame tips de recovery basados en mi estado actual' },
];

// ── Nutrition Targets by Phase ──
export function getPhaseNutritionTargets(phase: PhaseType, baseCalories: number = 2400) {
  const adjustment = PHASE_CONFIG[phase].calorieAdjustment;
  const total = baseCalories + adjustment;
  return {
    calories: total,
    protein: Math.round(total * 0.3 / 4),  // 30% protein
    carbs: Math.round(total * 0.45 / 4),    // 45% carbs
    fat: Math.round(total * 0.25 / 9),      // 25% fat
    surplus: adjustment,
  };
}
```

**Step 2: Create barrel export**

```typescript
// data/index.ts
export * from './mockData';
```

---

### Task 3: Create ImageCard Component with Gradient Overlay

**Files:**
- Modify: `components/cards/ImageCard.tsx`
- Modify: `components/cards/index.ts`

**Step 1: Rewrite ImageCard with gradient overlay support**

```typescript
// components/cards/ImageCard.tsx
import type { PropsWithChildren } from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

type ImageCardProps = PropsWithChildren<{
  imageUrl: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  height?: number;
  onPress?: () => void;
  style?: ViewStyle;
  overlayColors?: string[];
}>;

const blurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

export function ImageCard({
  imageUrl,
  title,
  subtitle,
  badge,
  badgeColor = '#6c3bff',
  height = 180,
  onPress,
  style,
  overlayColors = ['transparent', 'rgba(13, 13, 43, 0.7)', 'rgba(13, 13, 43, 0.95)'],
  children,
}: ImageCardProps) {
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      style={[
        {
          borderRadius: 16,
          overflow: 'hidden',
          height,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.08)',
        },
        style,
      ]}
    >
      <Image
        source={{ uri: imageUrl }}
        placeholder={{ blurhash }}
        contentFit="cover"
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        transition={300}
      />
      <LinearGradient
        colors={overlayColors}
        style={{ flex: 1, justifyContent: 'flex-end', padding: 16 }}
      >
        {badge && (
          <View
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: badgeColor + '30',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: badgeColor, fontSize: 10, fontFamily: 'JetBrainsMono_500Medium' }}>
              {badge}
            </Text>
          </View>
        )}
        {children || (
          <View style={{ gap: 4 }}>
            {title && (
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold' }}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={{ color: '#827a89', fontSize: 12, fontFamily: 'Inter_400Regular' }}>
                {subtitle}
              </Text>
            )}
          </View>
        )}
      </LinearGradient>
    </Wrapper>
  );
}
```

**Step 2: Ensure export in barrel**

Verify `components/cards/index.ts` exports ImageCard.

---

### Task 4: Create SeasonHeader Component

**Files:**
- Create: `components/ui/SeasonHeader.tsx`
- Modify: `components/ui/index.ts`

**Step 1: Build the season header with phase indicator**

```typescript
// components/ui/SeasonHeader.tsx
import { Pressable, Text, View } from 'react-native';
import { PHASE_CONFIG } from '../../data';
import type { PhaseType, Week } from '../../types';

type SeasonHeaderProps = {
  seasonNumber: number;
  currentWeek: number;
  currentPhase: PhaseType;
  weeks: Week[];
  totalWeeks?: number;
  onPress?: () => void;
};

export function SeasonHeader({
  seasonNumber,
  currentWeek,
  currentPhase,
  weeks,
  totalWeeks = 12,
  onPress,
}: SeasonHeaderProps) {
  const config = PHASE_CONFIG[currentPhase];

  return (
    <Pressable onPress={onPress} style={{ gap: 10 }}>
      {/* Phase Label */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: config.color }} />
        <Text style={{ color: '#FFFFFF', fontSize: 11, fontFamily: 'JetBrainsMono_600SemiBold', letterSpacing: 1.5 }}>
          SEASON {seasonNumber} · SEMANA {currentWeek} · {config.label.toUpperCase()}
        </Text>
      </View>

      {/* Week Progress Bar */}
      <View style={{ flexDirection: 'row', gap: 3 }}>
        {Array.from({ length: totalWeeks }).map((_, i) => {
          const weekNum = i + 1;
          const week = weeks[i];
          const isCurrent = weekNum === currentWeek;
          const isCompleted = week?.completed ?? false;
          const weekPhase = week?.phase as PhaseType | undefined;
          const weekColor = weekPhase ? PHASE_CONFIG[weekPhase]?.color ?? '#FFFFFF14' : '#FFFFFF14';

          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: isCurrent ? 6 : 4,
                borderRadius: 3,
                backgroundColor: isCompleted
                  ? weekColor
                  : isCurrent
                    ? config.color
                    : 'rgba(255, 255, 255, 0.08)',
                opacity: isCompleted || isCurrent ? 1 : 0.4,
              }}
            />
          );
        })}
      </View>
    </Pressable>
  );
}
```

**Step 2: Add export to `components/ui/index.ts`**

Add: `export { SeasonHeader } from './SeasonHeader';`

---

## PHASE 2: Screen Rewrites — Store-Driven + Rich Media
*Goal: Rewrite each tab screen to pull from stores and display rich media.*

---

### Task 5: Rewrite HOME Screen

**Files:**
- Modify: `app/(tabs)/home.tsx`

**Step 1: Replace entire home.tsx with store-driven, media-rich version**

```typescript
// app/(tabs)/home.tsx
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Dumbbell, Utensils, Brain, Sparkles, Flame, BookOpen, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { GlassCard, GradientCard, ScreenHeader, SectionLabel, ProgressBar, SeasonHeader } from '../../components/ui';
import { ImageCard } from '../../components/cards';
import { useSeasonStore, useWellnessStore, useTrainingStore, useNutritionStore } from '../../stores';
import { getMockBriefing, MOCK_EDUCATION, PHASE_CONFIG } from '../../data';
import type { PhaseType } from '../../types';

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function HomeScreen() {
  const router = useRouter();

  // Store data
  const { seasonNumber, currentWeek, currentPhase, weeks, progressPercent, fetchSeasonPlan } = useSeasonStore();
  const todayCheckIn = useWellnessStore((s) => s.todayCheckIn);

  useEffect(() => {
    if (weeks.length === 0) fetchSeasonPlan();
  }, []);

  const phase = (currentPhase || 'hypertrophy') as PhaseType;
  const briefing = getMockBriefing(phase, currentWeek);
  const phaseConfig = PHASE_CONFIG[phase];
  const completedDays = 5; // TODO: derive from store
  const currentDayIndex = new Date().getDay(); // 0=Sun
  const streak = 12; // TODO: derive from store

  // Filter education by current phase
  const phaseEducation = MOCK_EDUCATION.filter((e) => e.relevantPhases.includes(phase));
  const todayLesson = phaseEducation[0];

  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100, gap: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Season Header */}
          <SeasonHeader
            seasonNumber={seasonNumber}
            currentWeek={currentWeek}
            currentPhase={phase}
            weeks={weeks}
          />

          {/* GENESIS Daily Briefing — Hero Card with Image */}
          <ImageCard
            imageUrl={briefing.imageUrl}
            height={200}
            onPress={() => router.push('/(modals)/genesis-chat')}
            overlayColors={['transparent', 'rgba(13, 13, 43, 0.6)', 'rgba(13, 13, 43, 0.95)']}
          >
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color={phaseConfig.accentColor} />
                <Text style={{ color: phaseConfig.accentColor, fontSize: 11, fontFamily: 'JetBrainsMono_600SemiBold' }}>
                  GENESIS
                </Text>
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_700Bold', lineHeight: 20 }}>
                {briefing.greeting}
              </Text>
              <Text style={{ color: '#c4bfcc', fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 }}>
                {briefing.message}
              </Text>
            </View>
          </ImageCard>

          {/* Daily Missions */}
          <SectionLabel title="HOY">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              <MissionCard
                icon={<Dumbbell size={18} color={phaseConfig.color} />}
                iconBg={phaseConfig.color + '20'}
                title="Train"
                subtitle="Push Day"
                detail="6 ejercicios · 55 min"
                onPress={() => router.push('/(tabs)/train')}
              />
              <MissionCard
                icon={<Utensils size={18} color="#22ff73" />}
                iconBg="#22ff7320"
                title="Fuel"
                subtitle="1,847 / 2,400"
                detail="Faltan 2 comidas"
                onPress={() => router.push('/(tabs)/fuel')}
              />
              <MissionCard
                icon={<Brain size={18} color="#38bdf8" />}
                iconBg="#38bdf820"
                title="Check-in"
                subtitle={todayCheckIn ? 'Completado' : 'Pendiente'}
                detail={todayCheckIn ? todayCheckIn.mood : 'Registra tu día'}
                onPress={() => router.push('/(modals)/check-in')}
              />
            </ScrollView>
          </SectionLabel>

          {/* Micro-Lesson */}
          {todayLesson && (
            <SectionLabel title="APRENDE HOY">
              <ImageCard
                imageUrl={todayLesson.imageUrl}
                height={140}
                badge={todayLesson.duration}
                badgeColor={phaseConfig.color}
                onPress={() => router.push({ pathname: '/(screens)/education-detail', params: { id: todayLesson.id } })}
              >
                <View style={{ gap: 4 }}>
                  <Text style={{ color: phaseConfig.accentColor, fontSize: 10, fontFamily: 'JetBrainsMono_500Medium', letterSpacing: 1 }}>
                    {todayLesson.category.toUpperCase()}
                  </Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_700Bold' }}>
                    {todayLesson.title}
                  </Text>
                </View>
              </ImageCard>
            </SectionLabel>
          )}

          {/* Week Progress */}
          <SectionLabel title="ESTA SEMANA">
            <GlassCard shine>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'JetBrainsMono_700Bold' }}>Progreso Semanal</Text>
                <Text style={{ color: '#827a89', fontSize: 11, fontFamily: 'JetBrainsMono_500Medium' }}>{completedDays}/7 días</Text>
              </View>
              <ProgressBar progress={(completedDays / 7) * 100} gradient />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 }}>
                {DAYS.map((day, i) => {
                  const dayIndex = i + 1; // 1=Mon
                  const isCompleted = dayIndex <= completedDays;
                  const isToday = dayIndex === currentDayIndex;
                  return (
                    <View
                      key={`${day}-${i}`}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isCompleted ? phaseConfig.color : isToday ? 'transparent' : 'rgba(255,255,255,0.08)',
                        borderWidth: isToday && !isCompleted ? 1 : 0,
                        borderColor: phaseConfig.accentColor,
                      }}
                    >
                      <Text style={{
                        color: isCompleted || isToday ? '#FFFFFF' : '#6b6b7b',
                        fontSize: 10,
                        fontFamily: 'JetBrainsMono_400Regular',
                      }}>
                        {day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </GlassCard>
          </SectionLabel>

          {/* Streak */}
          <GlassCard>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Flame size={22} color="#F97316" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter_700Bold' }}>{streak} Day Streak</Text>
                <Text style={{ color: '#827a89', fontSize: 11, fontFamily: 'Inter_400Regular' }}>Personal best! Keep going.</Text>
              </View>
            </View>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MissionCard({
  icon, iconBg, title, subtitle, detail, onPress,
}: {
  icon: React.ReactNode; iconBg: string; title: string; subtitle: string; detail: string; onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 140,
        gap: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(20,18,26,0.7)',
        padding: 16,
      }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: iconBg }}>
        {icon}
      </View>
      <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'JetBrainsMono_700Bold' }}>{title}</Text>
      <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'Inter_400Regular' }}>{subtitle}</Text>
      <Text style={{ color: '#827a89', fontSize: 10, fontFamily: 'Inter_400Regular' }}>{detail}</Text>
    </Pressable>
  );
}
```

---

### Task 6: Rewrite TRAIN Screen with Workout Flow

**Files:**
- Modify: `app/(tabs)/train.tsx`

**Step 1: Replace with phase-aware, image-rich train screen**

This task replaces the static exercise list with:
- Workout hero card with muscle group image
- Phase badge and rep/set ranges from PHASE_CONFIG
- Exercise list with previous history
- "Start Workout" flow prep
- GENESIS tip card
- Link to Library for exercise details

*(Full code: same pattern as Task 5 — reads from useSeasonStore + useTrainingStore + MOCK_WORKOUT_PLANS, renders ImageCard hero with workout image, exercises from today's plan, GENESIS tip from PHASE_CONFIG)*

---

### Task 7: Rewrite FUEL Screen with Meal Images

**Files:**
- Modify: `app/(tabs)/fuel.tsx`

**Step 1: Replace with phase-aware nutrition screen**

Key changes:
- Circular calorie ring instead of linear progress
- Meal cards with food images (ImageCard)
- Phase nutrition banner from PHASE_CONFIG
- Macro targets adjust per phase via getPhaseNutritionTargets()

---

### Task 8: Rewrite MIND Screen with Recovery Heatmap

**Files:**
- Modify: `app/(tabs)/mind.tsx`
- Create: `components/wellness/RecoveryHeatmap.tsx`

**Step 1: Create RecoveryHeatmap component**

Visual body silhouette (simplified as labeled muscle group cards with color indicators):
- Green = recovered, Yellow = moderate, Red = fatigued
- Data from MOCK_RECOVERY

**Step 2: Rewrite Mind with integrated check-in + recovery dashboard + meditation with images**

---

### Task 9: Rewrite TRACK Screen with Season Overview

**Files:**
- Modify: `app/(tabs)/track.tsx`

**Step 1: Replace with season-aware progress screen**

Key changes:
- SeasonTimeline hero section showing 12-week progress
- Strength progression charts (mock data)
- PR highlights with gold accent
- Season stats: workouts completed, PRs, adherence %

---

## PHASE 3: New Screens — Library, Education, Chat Enhancement
*Goal: Build the 3 missing experiences.*

---

### Task 10: Create Exercise Library Screen

**Files:**
- Create: `app/(screens)/library.tsx`
- Create: `app/(screens)/_layout.tsx`
- Modify: `app/_layout.tsx` (add screens stack group)

**Step 1: Create screens layout**

```typescript
// app/(screens)/_layout.tsx
import { Stack } from 'expo-router';
import { theme } from '../../constants/theme';

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.bgStart },
      }}
    />
  );
}
```

**Step 2: Add (screens) to root layout**

Add `<Stack.Screen name="(screens)" options={{ headerShown: false }} />` to root `_layout.tsx`.

**Step 3: Build Library screen**

- Search bar with filter pills (muscle group, equipment, difficulty)
- Grid of ExerciseLibraryItem cards with thumbnails
- Tap → exercise-detail screen

---

### Task 11: Create Exercise Detail Screen

**Files:**
- Create: `app/(screens)/exercise-detail.tsx`

Features:
- Full-width image/video at top
- Exercise name + muscle groups + equipment badges
- Form Cues list with numbered items
- Alternatives as horizontal scroll of ImageCards
- Personal history chart (mock data)
- "Add to Session" button

---

### Task 12: Create Education Hub Screen

**Files:**
- Create: `app/(screens)/education.tsx`

Features:
- "GENESIS Library" header with search
- Category pills: Training, Nutrition, Recovery, Mindset, Science
- Featured content ImageCard (phase-filtered)
- Content list: each item as ImageCard with type badge, duration, title

---

### Task 13: Create Education Detail Screen

**Files:**
- Create: `app/(screens)/education-detail.tsx`

Features:
- Hero image at top
- Title, category badge, duration, difficulty
- Article body (rendered as formatted Text components)
- For video courses: episode list with play buttons
- "GENESIS tip" card at bottom with related insight

---

### Task 14: Enhance GENESIS Chat with Quick Actions + Widgets

**Files:**
- Modify: `app/(modals)/genesis-chat.tsx`
- Modify: `components/genesis/GenesisChat.tsx`

**Step 1: Add Quick Actions chips above input**

Horizontal ScrollView of Pressable pills from QUICK_ACTIONS. Tap sends the prompt as a message.

**Step 2: Wire WidgetRenderer into chat messages**

When a ChatMessage has `widgets[]`, render WidgetRenderer for each widget below the text bubble.

**Step 3: Add mock responses**

Since BFF isn't deployed, create a local mock responder in useGenesisStore that returns appropriate text + widgets based on keyword matching in the user's message. This lets the full chat experience work without a backend.

---

## PHASE 4: Polish & Verification
*Goal: Ensure visual consistency, navigation works, no crashes.*

---

### Task 15: Navigation Verification

**Step 1: Verify all routes**

Test each navigation path:
- Home → Train, Fuel, Mind, Track (tabs)
- Home → GENESIS Chat (modal)
- Home → Check-in (modal)
- Home → Education detail (screen)
- Train → Exercise detail (screen)
- Train → Library (screen)
- Any tab → FloatingGenesisButton → Chat

**Step 2: Ensure back navigation works from all screens**

---

### Task 16: Visual Consistency Pass

**Step 1: Verify every screen follows the pattern**

- LinearGradient `['#0D0D2B', '#1A0A30']` as background
- SafeAreaView with `edges={['top']}`
- ScrollView with `paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100, gap: 24`
- All cards use GlassCard or ImageCard with border `#FFFFFF14`
- All text uses Inter or JetBrains Mono
- All icons are Lucide (no emojis)
- Phase color from PHASE_CONFIG used consistently

---

### Task 17: Build and Test

**Step 1: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 2: Start dev server**

Run: `npx expo start`
Expected: App loads, all tabs render, navigation works

**Step 3: Verify on iOS Simulator (if available)**

Run: `npx expo run:ios`
Check: All screens render correctly, images load, scrolling smooth

---

## Task Dependency Graph

```
Task 1 (Types) ──┐
                  ├── Task 2 (Mock Data) ──┐
Task 3 (ImageCard)┘                        │
Task 4 (SeasonHeader) ────────────────────┤
                                           ├── Task 5 (Home) ──┐
                                           ├── Task 6 (Train)   │
                                           ├── Task 7 (Fuel)    ├── Task 15 (Nav verify)
                                           ├── Task 8 (Mind)    │   Task 16 (Visual pass)
                                           ├── Task 9 (Track)   │   Task 17 (Build+Test)
                                           ├── Task 10 (Library)│
                                           ├── Task 11 (Ex Detail)
                                           ├── Task 12 (Education)
                                           ├── Task 13 (Edu Detail)
                                           └── Task 14 (Chat enhance)
```

**Parallel execution possible:** Tasks 5-14 can all run in parallel after Tasks 1-4 are complete (they share mock data and new components but don't modify each other's files).

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| **1: Data Foundation** | 1-4 | Types, mock data, ImageCard, SeasonHeader |
| **2: Screen Rewrites** | 5-9 | All 5 tabs: store-driven + rich media |
| **3: New Screens** | 10-14 | Library, Exercise Detail, Education Hub, Education Detail, Chat |
| **4: Polish** | 15-17 | Navigation, visual consistency, build verification |

**Total: 17 tasks across 4 phases.**
