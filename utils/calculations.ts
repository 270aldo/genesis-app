/**
 * Fitness and nutrition calculation utilities.
 */

/** Estimated 1RM using Epley formula: weight × (1 + reps / 30) */
export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0) return weight;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/** Total session volume: sum of sets × reps × weight */
export function calculateVolume(exercises: { sets: number; reps: number; weight: number }[]): number {
  return exercises.reduce((sum, ex) => sum + ex.sets * ex.reps * ex.weight, 0);
}

/** BMR using Mifflin-St Jeor equation */
export function calculateBMR(weightKg: number, heightCm: number, age: number, sex: 'male' | 'female'): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === 'male' ? base + 5 : base - 161);
}

/** TDEE from BMR and activity multiplier */
export function calculateTDEE(bmr: number, activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * (multipliers[activityLevel] ?? 1.55));
}

/** Wellness score (0–100) from check-in fields (each 1–5 scale mapped to 0–20) */
export function calculateWellnessScore(params: {
  mood: number;
  energy: number;
  sleep: number;
  stress: number;
  soreness: number;
}): number {
  const { mood, energy, sleep, stress, soreness } = params;
  // Stress and soreness are inverted (lower is better)
  const raw = (mood + energy + sleep + (6 - stress) + (6 - soreness)) / 25;
  return Math.round(raw * 100);
}

/** Water intake progress as a percentage (0–1) */
export function waterProgress(currentMl: number, targetMl: number): number {
  if (targetMl <= 0) return 0;
  return Math.min(currentMl / targetMl, 1);
}

/** Convert kg to lbs */
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

/** Convert lbs to kg */
export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.20462 * 10) / 10;
}
