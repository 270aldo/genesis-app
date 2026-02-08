import type { Exercise, ExerciseSet } from '../types';

export interface DetectedPR {
  exerciseId: string;
  exerciseName: string;
  type: 'weight' | 'reps';
  newValue: number;
  previousValue: number | null;
}

/**
 * Compare logged set data against existing personal records.
 * Returns array of newly detected PRs.
 */
export function detectPersonalRecords(
  exercises: Exercise[],
  existingRecords: Record<string, { weight?: number; reps?: number }>,
): DetectedPR[] {
  const prs: DetectedPR[] = [];

  for (const exercise of exercises) {
    if (!exercise.exerciseSets) continue;

    const completedSets = exercise.exerciseSets.filter((s) => s.completed && s.actualWeight);
    if (completedSets.length === 0) continue;

    const existing = existingRecords[exercise.id];

    // Check max weight PR
    const maxWeight = Math.max(...completedSets.map((s) => s.actualWeight ?? 0));
    if (maxWeight > 0 && (!existing?.weight || maxWeight > existing.weight)) {
      prs.push({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        type: 'weight',
        newValue: maxWeight,
        previousValue: existing?.weight ?? null,
      });
    }

    // Check max reps at highest weight PR
    const heaviestSets = completedSets.filter((s) => s.actualWeight === maxWeight);
    const maxReps = Math.max(...heaviestSets.map((s) => s.actualReps ?? 0));
    if (maxReps > 0 && (!existing?.reps || maxReps > existing.reps)) {
      prs.push({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        type: 'reps',
        newValue: maxReps,
        previousValue: existing?.reps ?? null,
      });
    }
  }

  return prs;
}
