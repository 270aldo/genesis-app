/**
 * Input validation utilities.
 */

/** Basic email validation */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Password must be at least 8 characters with one number */
export function isValidPassword(password: string): boolean {
  return password.length >= 8 && /\d/.test(password);
}

/** Validate weight is within reasonable range */
export function isValidWeight(kg: number): boolean {
  return kg > 20 && kg < 500;
}

/** Validate height is within reasonable range (cm) */
export function isValidHeight(cm: number): boolean {
  return cm > 50 && cm < 300;
}

/** Validate RPE is 1–10 */
export function isValidRPE(rpe: number): boolean {
  return Number.isInteger(rpe) && rpe >= 1 && rpe <= 10;
}

/** Validate sleep hours (0–24) */
export function isValidSleepHours(hours: number): boolean {
  return hours >= 0 && hours <= 24;
}

/** Validate mood/energy/stress scale (1–5) */
export function isValidScale(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

/** Check that a string is non-empty after trimming */
export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}
