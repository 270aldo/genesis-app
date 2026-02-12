export type PlanMode = 'hybrid' | 'ascend';
export type SubscriptionStatus = 'active' | 'expired' | 'none';
export type AgentId = 'genesis' | 'train' | 'fuel' | 'mind' | 'track' | 'vision' | 'coach_bridge';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: PlanMode;
  subscriptionStatus: SubscriptionStatus;
}

export interface Week {
  number: number;
  phase: 'strength' | 'hypertrophy' | 'endurance' | 'power';
  startDate: string;
  endDate: string;
  completed: boolean;
}

export interface Season {
  seasonNumber: number;
  currentWeek: number;
  currentPhase: string;
  weeks: Week[];
  startDate: string;
  endDate: string;
  progressPercent: number;
}

export interface ExerciseSet {
  setNumber: number;
  targetReps: number;
  targetWeight: number;
  actualReps?: number;
  actualWeight?: number;
  rpe?: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  unit: 'kg' | 'lbs';
  completed: boolean;
  notes?: string;
  videoUrl?: string;
  exerciseSets?: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  date: string;
  exercises: Exercise[];
  duration: number;
  completed: boolean;
  notes?: string;
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
  time: string;
}

export interface WellnessCheckIn {
  date: string;
  mood: 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible';
  sleepHours: number;
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  stressLevel: number;
  energyLevel: number;
}

export interface Measurement {
  date: string;
  weight: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
}

export interface ProgressPhoto {
  id?: string;
  date: string;
  category: 'front' | 'side' | 'back' | 'other';
  storagePath: string;
  thumbnailPath?: string | null;
  notes?: string | null;
  uri?: string; // Local display URL (signed or public)
}

export type WidgetType =
  | 'metric_card'
  | 'chart_line'
  | 'recommendation'
  | 'form_field'
  | 'insight_card'
  | 'progress_indicator'
  | 'action_button'
  | 'fallback';

export interface WidgetPayload {
  id: string;
  type: WidgetType;
  title?: string;
  subtitle?: string;
  value?: string | number;
  data?: Record<string, string | number | boolean | null>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  widgets?: WidgetPayload[];
}

export interface DateRange {
  from?: string;
  to?: string;
}

// ── Phase & Season Types ──

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
  alternatives: string[];
  recommendedPhases: PhaseType[];
}

export interface EducationContent {
  id: string;
  title: string;
  subtitle: string;
  type: 'micro_lesson' | 'video_course' | 'deep_dive' | 'genesis_explains';
  category: 'training' | 'nutrition' | 'recovery' | 'mindset' | 'science';
  imageUrl: string;
  duration: string;
  relevantPhases: PhaseType[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed?: boolean;
  progress?: number;
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
  dayLabel: string;
  muscleGroups: string[];
  exercises: Exercise[];
  estimatedDuration: number;
  phase: PhaseType;
  imageUrl: string;
}

export interface MuscleRecovery {
  muscleGroup: string;
  status: 'recovered' | 'moderate' | 'fatigued';
  lastTrained: string;
  daysSinceTraining: number;
}

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
}

export interface WeekExtended extends Week {
  workoutPlans: WorkoutPlan[];
  nutritionTargets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    surplus: number;
  };
}
