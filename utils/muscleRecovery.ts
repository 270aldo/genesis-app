import type { WorkoutSession, WellnessCheckIn } from '../types';

export type MuscleZone =
  | 'chest' | 'front_deltoids' | 'biceps' | 'abs' | 'quads' | 'hip_flexors'
  | 'upper_back' | 'lats' | 'triceps' | 'glutes' | 'hamstrings' | 'calves' | 'rear_deltoids';

export type RecoveryStatus = 'inactive' | 'recovered' | 'active' | 'soreness';

export interface MuscleRecoveryInfo {
  zone: MuscleZone;
  status: RecoveryStatus;
  daysSinceTraining: number;
  muscleGroupLabel: string;
}

// Map body map zones to broader muscle groups (for matching exercise data)
const ZONE_TO_GROUP: Record<MuscleZone, string> = {
  chest: 'Chest',
  front_deltoids: 'Shoulders',
  biceps: 'Arms',
  abs: 'Core',
  quads: 'Legs',
  hip_flexors: 'Legs',
  upper_back: 'Back',
  lats: 'Back',
  triceps: 'Arms',
  glutes: 'Legs',
  hamstrings: 'Legs',
  calves: 'Legs',
  rear_deltoids: 'Shoulders',
};

const ZONE_LABELS: Record<MuscleZone, string> = {
  chest: 'Pecho',
  front_deltoids: 'Deltoides Ant.',
  biceps: 'Bíceps',
  abs: 'Abdominales',
  quads: 'Cuádriceps',
  hip_flexors: 'Flexores de Cadera',
  upper_back: 'Espalda Superior',
  lats: 'Dorsales',
  triceps: 'Tríceps',
  glutes: 'Glúteos',
  hamstrings: 'Isquiotibiales',
  calves: 'Pantorrillas',
  rear_deltoids: 'Deltoides Post.',
};

// Exercise name pattern → group mapping
function getGroupFromExerciseName(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('bench') || n.includes('chest') || n.includes('fly') || n.includes('push')) return 'Chest';
  if (n.includes('row') || n.includes('pull') || n.includes('lat') || n.includes('deadlift') || n.includes('back')) return 'Back';
  if (n.includes('shoulder') || n.includes('press') || n.includes('lateral') || n.includes('ohp') || n.includes('delt')) return 'Shoulders';
  if (n.includes('squat') || n.includes('leg') || n.includes('lunge') || n.includes('calf') || n.includes('glute') || n.includes('hip')) return 'Legs';
  if (n.includes('curl') || n.includes('tricep') || n.includes('bicep') || n.includes('arm')) return 'Arms';
  if (n.includes('core') || n.includes('plank') || n.includes('ab') || n.includes('crunch')) return 'Core';
  return '';
}

export function getMuscleRecoveryMap(
  sessions: WorkoutSession[],
  todayCheckIn: WellnessCheckIn | null,
): MuscleRecoveryInfo[] {
  const allZones: MuscleZone[] = [
    'chest', 'front_deltoids', 'biceps', 'abs', 'quads', 'hip_flexors',
    'upper_back', 'lats', 'triceps', 'glutes', 'hamstrings', 'calves', 'rear_deltoids',
  ];

  // Build "last trained" per group
  const lastTrained: Record<string, Date> = {};
  const now = new Date();

  for (const session of sessions) {
    if (!session.completed) continue;
    const sessionDate = new Date(session.date);
    for (const ex of session.exercises) {
      const group = getGroupFromExerciseName(ex.name);
      if (group && (!lastTrained[group] || sessionDate > lastTrained[group])) {
        lastTrained[group] = sessionDate;
      }
    }
  }

  const highStress = todayCheckIn !== null && todayCheckIn.stressLevel > 7;

  return allZones.map((zone) => {
    const group = ZONE_TO_GROUP[zone];
    const trained = lastTrained[group];
    const daysSince = trained ? Math.floor((now.getTime() - trained.getTime()) / 86400000) : 99;

    let status: RecoveryStatus;
    if (daysSince > 7) {
      status = 'inactive';
    } else if (daysSince <= 1) {
      status = highStress ? 'soreness' : 'active';
    } else if (daysSince <= 2) {
      status = highStress ? 'soreness' : 'active';
    } else {
      status = 'recovered';
    }

    return {
      zone,
      status,
      daysSinceTraining: Math.min(daysSince, 99),
      muscleGroupLabel: ZONE_LABELS[zone],
    };
  });
}
