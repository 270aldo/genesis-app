# GENESIS UI Premium Refinement — Claude Code Execution Prompt

> **Copy this entire prompt into Claude Code.** Branch `refine/ui-premium-pass` is already created.
> Read `CLAUDE.md` first for full project context.

---

## MISSION

You are executing a **visual-only refinement pass** on the GENESIS app (Expo SDK 54 / React Native). NO new functionality — only color, typography, spacing, interaction, and demo data changes. The goal is to make the app feel premium and ready for TestFlight.

## BRANCH

```bash
git checkout refine/ui-premium-pass
```

## DESIGN DECISIONS (already approved by CEO)

1. **Violet-only palette**: All accents use `#6D00FF` → `#9D4EDD` → `#B388FF`. NO cyan, aqua, sky blue anywhere.
2. **Phase colors eliminated**: All 4 training phases (hypertrophy/strength/power/deload) use the SAME violet. Phases are differentiated by labels/text, never by color.
3. **Semantic colors preserved**: Green (`#00F5AA`) for success states, yellow (`#FFD93D`) for warnings, red (`#FF6B6B`) for errors. These are the ONLY non-violet colors allowed, and ONLY for state indication.
4. **Modern & minimalist**: Use color with purpose and restraint. When in doubt, use white with opacity variations for hierarchy.

## EXECUTION ORDER

Execute in this exact order. After each tier, run `npm start` and verify in Expo Go.

---

### TIER 1: Color System Overhaul

#### 1.1 — `constants/colors.ts`

```typescript
// REMOVE these:
cyan: '#00E5FF',        // DELETE
cyanDeep: '#00BBD4',    // DELETE
info: '#00D4FF',        // DELETE (or alias to primary)

// CHANGE info to alias violet:
info: '#9D4EDD',  // was '#00D4FF' — now violet light for backward compat

// CHANGE MACRO_COLORS:
protein: '#B388FF',  // was '#38bdf8'
// carbs stays '#00F5AA' (semantic: macro achieved)
// fat stays '#F97316' (semantic: macro warning zone)

// CHANGE SEASON_PHASE_COLORS — all violet spectrum:
hypertrophy: '#6D00FF',
strength: '#9D4EDD',
power: '#B388FF',
deload: '#7C3AED',

// CHANGE MUSCLE_GRADIENTS — all violet variations:
chest: ['#6D00FF', '#9D4EDD'],
back: ['#9D4EDD', '#B388FF'],
shoulders: ['#7C3AED', '#9D4EDD'],
legs: ['#6D00FF', '#B388FF'],
arms: ['#9D4EDD', '#7C3AED'],
core: ['#B388FF', '#6D00FF'],
full_body: ['#6D00FF', '#9D4EDD'],

// MOOD_COLORS stay semantic (these are states, not accents):
// excellent: '#00F5AA', good: '#9D4EDD', neutral: '#808080', poor: '#FFD93D', terrible: '#FF6B6B'
// NOTE: change 'good' from '#00D4FF' to '#9D4EDD'

// BODY_MAP_COLORS stay semantic (recovered=green, soreness=red, active=violet)
```

#### 1.2 — `data/mockData.ts` → `PHASE_CONFIG`

ALL four phases get identical violet colors:

```typescript
hypertrophy: { color: '#6D00FF', accentColor: '#9D4EDD', ... },
strength:    { color: '#6D00FF', accentColor: '#9D4EDD', ... },
power:       { color: '#6D00FF', accentColor: '#9D4EDD', ... },
deload:      { color: '#6D00FF', accentColor: '#9D4EDD', ... },
```

Keep all other fields (label, restSeconds, repRange, etc.) unchanged.

#### 1.3 — `app/(tabs)/train.tsx` → `MUSCLE_GROUP_STYLES`

Replace all muscle group colors with violet spectrum:

```typescript
const MUSCLE_GROUP_STYLES = {
  chest:     { colors: ['#6D00FF', '#4A00B0'], Icon: Layers },
  back:      { colors: ['#9D4EDD', '#6D00FF'], Icon: Layers },
  shoulders: { colors: ['#7C3AED', '#5B21B6'], Icon: Target },
  legs:      { colors: ['#B388FF', '#9D4EDD'], Icon: Footprints },
  arms:      { colors: ['#9D4EDD', '#7C3AED'], Icon: Zap },
  core:      { colors: ['#7C3AED', '#6D00FF'], Icon: Grip },
  default:   { colors: ['#6D00FF', '#4A00B0'], Icon: Dumbbell },
};
```

#### 1.4 — `app/(tabs)/home.tsx`

- Line ~511: `Moon` icon color → `GENESIS_COLORS.primary` (was `GENESIS_COLORS.info`)
- Line ~512: `Droplets` icon color → `GENESIS_COLORS.primary` (was `GENESIS_COLORS.cyan`)
- Line ~549-555: MissionCard "Check-in" → replace all `GENESIS_COLORS.info` with `GENESIS_COLORS.primary`
- Line ~428-431: `Sparkles` icon and "GENESIS" text → already uses `phaseConfig.accentColor` which is now violet ✓

#### 1.5 — `app/(tabs)/fuel.tsx`

- Line ~138: MacroCard PROTEIN → `color={GENESIS_COLORS.primary}` and `gradientColors={['#9D4EDD', '#6D00FF']}`
- Line ~139: MacroCard CARBS → `gradientColors={['#00F5AA', '#10B981']}` (remove `#00D4FF`, keep green semantic)
- Line ~184: Droplets icon → `color={GENESIS_COLORS.primary}` (was `GENESIS_COLORS.cyan`)

#### 1.6 — `app/(tabs)/mind.tsx`

- Line ~55: Meditation "Focus Flow" → `color: GENESIS_COLORS.primaryLight` (was `GENESIS_COLORS.info`)
- All `phaseConfig.accentColor` usages are now automatically violet ✓

#### 1.7 — `app/(tabs)/track.tsx`

- Line ~140: "SEASON {seasonNumber}" text → uses `phaseConfig.accentColor` ✓ (now violet)
- Line ~269: "GALLERY" button text → `color: GENESIS_COLORS.primary`

#### 1.8 — `components/ui/GlassCard.tsx`

- Line 11: `info` shadow → change from `'#00D4FF'` to `'#9D4EDD'`

#### 1.9 — `components/ui/AnimatedWaterTracker.tsx`

Replace all hardcoded sky-blue colors with violet:

- Line 48: filled bg → `'rgba(109,0,255,0.2)'` (was `'rgba(56,189,248,0.2)'`)
- Line 50: filled border → `'rgba(109,0,255,0.4)'` (was `'rgba(56,189,248,0.4)'`)
- Line 55: filled icon color → `'#9D4EDD'` (was `'#38bdf8'`)

#### 1.10 — `components/ui/MoodSelector.tsx`

- Line 6: 'okay' mood color → `'#808080'` stays (neutral)
- Line 5: 'good' mood color → `'#9D4EDD'` (was `'#6D00FF'` — shift to lighter violet so it differs from 'great')

Wait — actually the MoodSelector uses its own color set. The moods should stay **semantic** (each face = different feel). Keep them as-is EXCEPT:
- `okay` uses `#00D4FF` → change to `#808080` (neutral gray)

Actually, let me re-check: current MoodSelector colors are:
```
great: '#00F5AA' (green) ← keep
good: '#6D00FF' (violet) ← keep
okay: '#00D4FF' (cyan) ← CHANGE to '#808080' or '#9D4EDD'
low: '#FFD93D' (yellow) ← keep
bad: '#FF6B6B' (red) ← keep
```

Change `okay` to `'#9D4EDD'` (lighter violet — "meh" but within brand).

#### 1.11 — Global grep verification

After all changes, run:
```bash
grep -rn "#00E5FF\|#00BBD4\|#00D4FF\|#38bdf8\|cyan" --include="*.tsx" --include="*.ts" app/ components/ constants/ data/
```
There should be ZERO results except possibly in comments. Fix any remaining instances.

---

### TIER 1B: Mood Selector Bug Fix

File: `app/(tabs)/mind.tsx` → `handleMoodSelect` function (line ~76)

**Current behavior (broken):**
- If no check-in: any mood tap → immediately navigates to check-in modal
- If check-in exists: selector disabled with opacity 0.5

**New behavior:**
1. If no check-in: tap face → visually selects it (local state) → shows a CTA button "Continuar check-in →" below the faces → button navigates to check-in modal
2. If check-in exists: show selected mood at **full opacity** (remove `disabled` prop). The faces are read-only but clearly visible.

Implementation:

```typescript
// Add local state for pre-check-in mood selection
const [pendingMood, setPendingMood] = useState<string | undefined>(undefined);

const displayedMood = selectedMood ?? pendingMood;

const handleMoodSelect = (mood: string) => {
  hapticSelection();
  if (!todayCheckIn) {
    setPendingMood(mood);
    // DON'T navigate yet — let user see their selection
  }
};

// In JSX — MoodSelector:
<MoodSelector
  selected={displayedMood}
  onSelect={handleMoodSelect}
  disabled={false}  // Always interactive visually
/>

// After MoodSelector, show CTA if pending:
{!todayCheckIn && pendingMood && (
  <Pressable
    onPress={() => router.push('/(modals)/check-in')}
    style={{
      backgroundColor: 'rgba(109,0,255,0.15)',
      borderWidth: 1,
      borderColor: 'rgba(109,0,255,0.3)',
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: 'center',
      marginTop: 8,
    }}
  >
    <Text style={{ color: GENESIS_COLORS.primary, fontSize: 12, fontFamily: 'JetBrainsMonoSemiBold' }}>
      Continuar check-in →
    </Text>
  </Pressable>
)}

// When check-in done — show confirmation clearly:
{todayCheckIn && (
  <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
    Check-in completado · {moodLabels[selectedMood ?? ''] ?? ''}
  </Text>
)}
```

Also update MoodSelector component to NOT reduce opacity when disabled — instead just prevent onPress:

In `components/ui/MoodSelector.tsx`:
- Remove `style={disabled ? { opacity: 0.5 } : undefined}` from the container
- Keep `disabled={disabled}` on Pressable but full visual appearance

---

### TIER 1C: Demo Profile (Week 6 Mid-Season)

Create file: `data/demoProfile.ts`

```typescript
import type { Meal, WorkoutPlan, PersonalRecord } from '../types';

export const DEMO_ENABLED = __DEV__; // Only in development

export const DEMO_USER = {
  id: 'demo-user-001',
  name: 'Marco Reyes',
  email: 'marco@demo.ngx.com',
  age: 38,
};

export const DEMO_SEASON = {
  seasonNumber: 2,
  currentWeek: 6,
  currentPhase: 'strength' as const,
  progressPercent: 50,
  totalWeeks: 12,
};

export const DEMO_STATS = {
  completedWorkouts: 24,
  totalPlanned: 28,
  adherence: 87,
  streak: 8,
};

export const DEMO_CHECKIN = {
  id: 'demo-checkin-001',
  date: new Date().toISOString().split('T')[0],
  mood: 'good' as const,
  sleepHours: 7,
  sleepQuality: 'good' as const,
  energyLevel: 7,
  stressLevel: 3,
  soreness: 4,
  notes: '',
};

export const DEMO_MEALS: Meal[] = [
  {
    id: 'demo-meal-1',
    name: 'Avena con proteína y frutos rojos',
    calories: 520,
    protein: 38,
    carbs: 62,
    fat: 14,
    time: '7:30 AM',
  },
  {
    id: 'demo-meal-2',
    name: 'Pollo a la plancha con arroz integral',
    calories: 680,
    protein: 52,
    carbs: 65,
    fat: 18,
    time: '1:00 PM',
  },
  {
    id: 'demo-meal-3',
    name: 'Salmón con verduras asadas',
    calories: 650,
    protein: 45,
    carbs: 30,
    fat: 35,
    time: '7:30 PM',
  },
];

export const DEMO_WATER = 6;

export const DEMO_WORKOUT: WorkoutPlan = {
  id: 'demo-workout-001',
  name: 'Push Day — Strength',
  phase: 'strength',
  dayOfWeek: new Date().getDay(),
  estimatedDuration: 55,
  exercises: [
    { id: 'ex1', name: 'Barbell Bench Press', sets: 5, reps: 5, restSeconds: 150, muscleGroups: ['chest', 'triceps'], videoUrl: '' },
    { id: 'ex2', name: 'Overhead Press', sets: 4, reps: 6, restSeconds: 120, muscleGroups: ['shoulders'], videoUrl: '' },
    { id: 'ex3', name: 'Incline Dumbbell Press', sets: 3, reps: 8, restSeconds: 90, muscleGroups: ['chest'], videoUrl: '' },
    { id: 'ex4', name: 'Lateral Raises', sets: 3, reps: 12, restSeconds: 60, muscleGroups: ['shoulders'], videoUrl: '' },
    { id: 'ex5', name: 'Tricep Pushdowns', sets: 3, reps: 10, restSeconds: 60, muscleGroups: ['triceps'], videoUrl: '' },
  ],
};

export const DEMO_PERSONAL_RECORDS: PersonalRecord[] = [
  { exerciseId: 'bp', exerciseName: 'Bench Press', type: 'weight', value: 100, achievedAt: '2026-02-10T00:00:00Z' },
  { exerciseId: 'sq', exerciseName: 'Squat', type: 'weight', value: 140, achievedAt: '2026-02-08T00:00:00Z' },
  { exerciseId: 'dl', exerciseName: 'Deadlift', type: 'weight', value: 170, achievedAt: '2026-02-05T00:00:00Z' },
];

export const DEMO_PREVIOUS_SESSIONS = [
  { id: 's1', date: '2026-02-15', name: 'Pull Day', completed: true, exercises: [{ name: 'Barbell Row', sets: [] }, { name: 'Pull-ups', sets: [] }, { name: 'Bicep Curls', sets: [] }] },
  { id: 's2', date: '2026-02-14', name: 'Leg Day', completed: true, exercises: [{ name: 'Squat', sets: [] }, { name: 'Leg Press', sets: [] }, { name: 'Calf Raises', sets: [] }] },
  { id: 's3', date: '2026-02-13', name: 'Push Day', completed: true, exercises: [{ name: 'Bench Press', sets: [] }, { name: 'Shoulder Press', sets: [] }, { name: 'Tricep Dips', sets: [] }] },
  { id: 's4', date: '2026-02-12', name: 'Rest', completed: false, exercises: [] },
  { id: 's5', date: '2026-02-11', name: 'Pull Day', completed: true, exercises: [{ name: 'Deadlift', sets: [] }, { name: 'Lat Pulldown', sets: [] }] },
];

export const DEMO_STRENGTH_PROGRESS = {
  exerciseName: 'Bench Press',
  changePercent: 12,
  dataPoints: [
    { label: 'S1', value: 80 },
    { label: 'S2', value: 82.5 },
    { label: 'S3', value: 85 },
    { label: 'S4', value: 90 },
    { label: 'S5', value: 95 },
    { label: 'S6', value: 100 },
  ],
};
```

Then update each store to check `DEMO_ENABLED` and fall back to demo data when Supabase isn't configured. Check `services/supabaseClient.ts` for the existing `hasSupabaseConfig` pattern and follow it:

- `useSeasonStore` → if no Supabase, use `DEMO_SEASON`
- `useTrainingStore` → if no todayPlan and no Supabase, use `DEMO_WORKOUT`
- `useNutritionStore` → if no meals and no Supabase, use `DEMO_MEALS` + `DEMO_WATER`
- `useWellnessStore` → if no checkIn and no Supabase, use `DEMO_CHECKIN`
- `useTrackStore` → if no data and no Supabase, use `DEMO_STATS`, `DEMO_PERSONAL_RECORDS`, `DEMO_STRENGTH_PROGRESS`
- `useAuthStore` → if no auth and no Supabase, use `DEMO_USER`

**IMPORTANT**: Guard with `if (!hasSupabaseConfig)` so this NEVER activates in production.

---

### TIER 2: Premium Polish

#### 2.1 Typography Hierarchy

In `app/(tabs)/fuel.tsx`:
- Calorie number (line ~121): `fontSize: 28` → `fontSize: 48`
- "/ {target}" label below: `fontSize: 10` → stays 10 but add `marginTop: -4` for tighter spacing

In `app/(tabs)/mind.tsx`:
- Wellness score (line ~217): `fontSize: 36` → `fontSize: 52`

In `app/(tabs)/track.tsx`:
- Season progress "XX% Completado" (line ~144): `fontSize: 20` → `fontSize: 36`

#### 2.2 Card System

In `components/ui/GlassCard.tsx`:
- The card already has `border-[#FFFFFF14]` ✓
- Change padding: `p-4` → `p-5` (16px → 20px)

In `app/(tabs)/home.tsx`:
- MissionCard width: `width: 140` → `width: 160` (line ~706)

#### 2.3 Specific Fixes

In `app/(tabs)/fuel.tsx`:
- Meal card calories (line ~166): `color: GENESIS_COLORS.success` → `color: '#FFFFFF'`

In `app/(tabs)/track.tsx`:
- "GALLERY" button (line ~269): `color: phaseConfig.accentColor` → `color: GENESIS_COLORS.primary`

---

### TIER 3: Nice-to-have

#### 3.1 Spanish Labels

Replace English section labels with Spanish:

| File | Current | New |
|------|---------|-----|
| mind.tsx | `"CHECK-IN"` | `"CHECK-IN"` (keep — universal) |
| mind.tsx | `"RECOVERY STATUS"` | `"ESTADO DE RECOVERY"` |
| mind.tsx | `"WELLNESS SCORE"` | `"BIENESTAR"` |
| mind.tsx | `"SLEEP"` | `"SUEÑO"` |
| track.tsx | `"STATS"` | `"ESTADÍSTICAS"` |
| track.tsx | `"PERSONAL RECORDS"` | `"RECORDS PERSONALES"` |
| track.tsx | `"PROGRESS PHOTOS"` | `"FOTOS DE PROGRESO"` |
| fuel.tsx | `"MACROS"` | `"MACROS"` (keep — universal) |

#### 3.2 Empty State Violet Glow

In `components/ui/EmptyStateIllustration.tsx` (if exists), add a subtle violet glow behind the icon:

```typescript
<View style={{
  shadowColor: '#6D00FF',
  shadowOpacity: 0.2,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 0 },
}}>
  {/* existing icon */}
</View>
```

#### 3.3 Haptic Audit

Verify these files have `hapticSelection()` or `hapticLight()` on main action presses:
- `app/(screens)/active-workout.tsx` → "Complete Set" button
- `fuel.tsx` → "Log Meal" / scan FAB
- `AnimatedWaterTracker.tsx` → already has haptics ✓
- `track.tsx` → "Take Photo" / "Gallery" buttons

Add `import { hapticSelection } from '../../utils/haptics'` and call on press if missing.

---

## VERIFICATION

After ALL tiers are complete:

1. `grep -rn "#00E5FF\|#00BBD4\|#00D4FF\|#38bdf8" --include="*.tsx" --include="*.ts" app/ components/ constants/ data/` → should return ZERO
2. `grep -rn "cyan" --include="*.tsx" --include="*.ts" app/ components/ constants/` → should return ZERO (except maybe CSS class names or comments)
3. `npm start` → open in Expo Go → navigate ALL 5 tabs and verify:
   - Everything is violet/white/semantic-only
   - No cyan/aqua anywhere
   - Demo data shows in all tabs (Marco Reyes, Week 6)
   - Mood selector lets you tap a face without immediate navigation
   - Hero numbers (calories, wellness, progress) are visibly larger
   - Cards have consistent spacing and borders
4. `npm test` → ensure no regressions in existing tests

## COMMIT

```bash
git add -A
git commit -m "refine(ui): Premium visual pass — violet-only palette, typography hierarchy, mood fix, demo profile

- Replace all cyan/aqua/info colors with violet spectrum (#6D00FF → #9D4EDD → #B388FF)
- Unify all phase colors to violet (phases differentiated by labels only)
- Fix MoodSelector: allow visual selection before check-in navigation
- Add demo profile (Marco Reyes, Week 6 mid-season) for development
- Increase hero metric typography (48-56px for primary numbers)
- Polish GlassCard padding and MissionCard sizing
- Translate section labels to Spanish
- Audit haptics on primary actions

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## FILES TOUCHED (complete list)

```
constants/colors.ts
data/mockData.ts
data/demoProfile.ts (NEW)
app/(tabs)/home.tsx
app/(tabs)/train.tsx
app/(tabs)/fuel.tsx
app/(tabs)/mind.tsx
app/(tabs)/track.tsx
components/ui/GlassCard.tsx
components/ui/MoodSelector.tsx
components/ui/AnimatedWaterTracker.tsx
components/ui/EmptyStateIllustration.tsx
stores/useSeasonStore.ts
stores/useTrainingStore.ts
stores/useNutritionStore.ts
stores/useWellnessStore.ts
stores/useTrackStore.ts
stores/useAuthStore.ts
```

## CONSTRAINTS

- **NO new npm packages**
- **NO new screens or navigation routes**
- **NO API/BFF changes**
- **NO Supabase schema changes**
- **TypeScript strict — no `any` types**
- **Follow existing patterns** — check how other stores use `hasSupabaseConfig` before adding demo fallbacks
