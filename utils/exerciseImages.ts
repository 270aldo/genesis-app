/**
 * Exercise Image Fallback System
 *
 * The exercises table in Supabase does NOT have an image_url column.
 * This utility provides curated, high-quality Unsplash images mapped
 * by exercise name keywords and muscle group as fallback.
 *
 * Priority:
 * 1. Direct image_url from API (if it ever gets populated)
 * 2. Exercise name keyword match → specific curated image
 * 3. Muscle group fallback → category image
 * 4. Default gym image
 */

// ── Curated exercise-specific images (Unsplash, high quality, fitness-focused) ──
const EXERCISE_IMAGES: Record<string, string> = {
  // Chest exercises
  'bench press': 'https://images.unsplash.com/photo-1534368786749-b63e05c92717?w=800&q=80',
  'incline press': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
  'decline press': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
  'chest fly': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
  'push up': 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&q=80',
  'pushup': 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&q=80',
  'dips': 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=800&q=80',
  'cable crossover': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',

  // Back exercises
  'deadlift': 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&q=80',
  'pull up': 'https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800&q=80',
  'pullup': 'https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800&q=80',
  'chin up': 'https://images.unsplash.com/photo-1598266663439-2056e6900339?w=800&q=80',
  'barbell row': 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=800&q=80',
  'bent over row': 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=800&q=80',
  'lat pulldown': 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=80',
  'seated row': 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=800&q=80',
  'cable row': 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=800&q=80',
  't-bar row': 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=800&q=80',

  // Shoulders
  'overhead press': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  'shoulder press': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  'military press': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  'lateral raise': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  'front raise': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  'face pull': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  'arnold press': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  'upright row': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  'rear delt': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',

  // Legs
  'squat': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
  'leg press': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&q=80',
  'lunge': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&q=80',
  'leg extension': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&q=80',
  'leg curl': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&q=80',
  'romanian deadlift': 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&q=80',
  'hip thrust': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
  'calf raise': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&q=80',
  'bulgarian split': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&q=80',
  'step up': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&q=80',
  'hack squat': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',

  // Arms
  'bicep curl': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
  'hammer curl': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
  'preacher curl': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
  'tricep': 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=800&q=80',
  'skull crusher': 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=800&q=80',
  'cable curl': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
  'concentration curl': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',

  // Core
  'plank': 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=800&q=80',
  'crunch': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  'sit up': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  'russian twist': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  'hanging leg raise': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  'ab wheel': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  'mountain climber': 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=800&q=80',
  'wood chop': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',

  // Compound / Full body
  'clean': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  'snatch': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  'thruster': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  'burpee': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  'kettlebell': 'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=800&q=80',
  'farmer': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
};

// ── Muscle group category images ──
const MUSCLE_GROUP_IMAGES: Record<string, string> = {
  chest: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
  back: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=800&q=80',
  shoulders: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  legs: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
  arms: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
  core: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  full_body: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  compound: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
};

// Default fallback
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80';

/**
 * Get the best image URL for an exercise.
 *
 * @param exerciseName - The name of the exercise (e.g., "Bench Press")
 * @param muscleGroup - The primary muscle group (e.g., "chest")
 * @param existingUrl - Any existing image_url from the API (used if non-empty)
 * @returns A valid Unsplash image URL
 */
export function getExerciseImage(
  exerciseName: string,
  muscleGroup?: string,
  existingUrl?: string,
): string {
  // 1. Use existing URL if provided and non-empty
  if (existingUrl && existingUrl.trim().length > 0) {
    return existingUrl;
  }

  // 2. Try exercise name keyword match
  const nameLower = exerciseName.toLowerCase();
  for (const [keyword, url] of Object.entries(EXERCISE_IMAGES)) {
    if (nameLower.includes(keyword)) {
      return url;
    }
  }

  // 3. Try muscle group fallback
  if (muscleGroup) {
    const mgLower = muscleGroup.toLowerCase().replace(/[_\s]+/g, '_');
    // Direct match
    if (MUSCLE_GROUP_IMAGES[mgLower]) {
      return MUSCLE_GROUP_IMAGES[mgLower];
    }
    // Partial match
    for (const [key, url] of Object.entries(MUSCLE_GROUP_IMAGES)) {
      if (mgLower.includes(key) || key.includes(mgLower)) {
        return url;
      }
    }
  }

  // 4. Default
  return DEFAULT_IMAGE;
}

/**
 * Get an image URL for a muscle group (used for workout hero cards, etc.)
 */
export function getMuscleGroupImage(muscleGroups: string[]): string {
  const primary = (muscleGroups[0] || '').toLowerCase().replace(/[_\s]+/g, '_');

  if (primary.includes('chest') || primary.includes('pec')) return MUSCLE_GROUP_IMAGES.chest;
  if (primary.includes('back') || primary.includes('lat')) return MUSCLE_GROUP_IMAGES.back;
  if (primary.includes('shoulder') || primary.includes('delt')) return MUSCLE_GROUP_IMAGES.shoulders;
  if (primary.includes('quad') || primary.includes('ham') || primary.includes('glute') || primary.includes('leg') || primary.includes('calf')) return MUSCLE_GROUP_IMAGES.legs;
  if (primary.includes('bicep') || primary.includes('tricep') || primary.includes('arm') || primary.includes('curl')) return MUSCLE_GROUP_IMAGES.arms;
  if (primary.includes('core') || primary.includes('ab')) return MUSCLE_GROUP_IMAGES.core;

  return DEFAULT_IMAGE;
}
