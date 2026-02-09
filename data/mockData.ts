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
    color: '#6D00FF',
    accentColor: '#9D4EDD',
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
    color: '#00F5AA',
    accentColor: '#00F5AA',
    restSeconds: 60,
    repRange: '8-10',
    setsRange: '2-3',
    nutritionNote: 'Ligero déficit permitido. Prioriza recovery.',
    calorieAdjustment: -200,
  },
};

// ── Image URLs (Unsplash fitness) ──
export const IMAGES = {
  chest: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
  back: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=800&q=80',
  shoulders: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  legs: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&q=80',
  arms: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
  core: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  breakfast: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80',
  lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  dinner: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80',
  snack: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
  morning: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
  focus: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&q=80',
  night: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&q=80',
  recovery: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
  periodization: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
  nutrition_science: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80',
  sleep_science: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&q=80',
  muscle_growth: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=400&q=80',
  hero_gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  hero_nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  hero_track: 'https://images.unsplash.com/photo-1461896836934-bd45ba8020c5?w=800&q=80',
};

// ── Daily Briefing ──
export function getMockBriefing(phase: PhaseType, week: number): DailyBriefing {
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
  push_hyp: {
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
  pull_hyp: {
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
  legs_hyp: {
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

// ── Exercise Library ──
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
    alternatives: [], recommendedPhases: ['hypertrophy', 'deload'],
  },
  {
    id: 'lib_squat', name: 'Back Squat', muscleGroup: 'legs', secondaryMuscles: ['glutes', 'core'],
    equipment: 'barbell', difficulty: 'intermediate', imageUrl: IMAGES.legs, videoUrl: '',
    formCues: ['Pies al ancho de hombros', 'Baja hasta que cadera pase rodilla', 'Empuja con talones', 'Mantén pecho arriba y core tenso'],
    alternatives: ['lib_leg_press'], recommendedPhases: ['hypertrophy', 'strength', 'power'],
  },
  {
    id: 'lib_deadlift', name: 'Conventional Deadlift', muscleGroup: 'back', secondaryMuscles: ['hamstrings', 'glutes', 'core'],
    equipment: 'barbell', difficulty: 'advanced', imageUrl: IMAGES.back, videoUrl: '',
    formCues: ['Barra pegada al cuerpo siempre', 'Empuja el piso con los pies', 'Bloquea cadera y rodilla al mismo tiempo', 'Espalda neutra — nunca redondear'],
    alternatives: ['lib_rdl'], recommendedPhases: ['strength', 'power'],
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
    alternatives: [], recommendedPhases: ['strength', 'power'],
  },
  {
    id: 'lib_lat_raise', name: 'Lateral Raises', muscleGroup: 'shoulders', secondaryMuscles: ['traps'],
    equipment: 'dumbbell', difficulty: 'beginner', imageUrl: IMAGES.shoulders, videoUrl: '',
    formCues: ['Sube hasta paralelo al piso', 'Ligera inclinación hacia adelante', 'Codos ligeramente flexionados', 'Controla la bajada — no dejes caer'],
    alternatives: [], recommendedPhases: ['hypertrophy', 'deload'],
  },
  {
    id: 'lib_barbell_row', name: 'Barbell Row', muscleGroup: 'back', secondaryMuscles: ['biceps', 'rear delts'],
    equipment: 'barbell', difficulty: 'intermediate', imageUrl: IMAGES.back, videoUrl: '',
    formCues: ['Torso a 45 grados', 'Jala hacia el ombligo', 'Aprieta escápulas arriba 1 segundo', 'No uses momentum del torso'],
    alternatives: ['lib_lat_pulldown'], recommendedPhases: ['hypertrophy', 'strength'],
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
    alternatives: [], recommendedPhases: ['hypertrophy'],
  },
  {
    id: 'lib_tricep_pushdown', name: 'Tricep Pushdowns', muscleGroup: 'arms', secondaryMuscles: [],
    equipment: 'cable', difficulty: 'beginner', imageUrl: IMAGES.arms, videoUrl: '',
    formCues: ['Codos fijos a los costados', 'Extiende completamente abajo', 'No dejes que el peso jale los brazos arriba rápido'],
    alternatives: [], recommendedPhases: ['hypertrophy', 'deload'],
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
    protein: Math.round(total * 0.3 / 4),
    carbs: Math.round(total * 0.45 / 4),
    fat: Math.round(total * 0.25 / 9),
    surplus: adjustment,
  };
}
