# Set Logging Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the set logging experience from high-friction form inputs to a fast, gym-optimized UI with steppers, swipe gestures, visual feedback, and floating rest timer.

**Architecture:** Rewrite `ExerciseForm.tsx` SetRow as a horizontal table row with +/- steppers and PREV column. Move rest timer outside ScrollView into floating position. Add swipe gestures via `react-native-gesture-handler` Swipeable. Add real-time PR detection per set. All following Genesis design system: `#000000` bg, `#6D00FF` borders, JetBrainsMono fonts.

**Tech Stack:** React Native, react-native-reanimated, react-native-gesture-handler (Swipeable), lucide-react-native, Zustand

---

## Task 1: Add `addSet` and `getPreviousExerciseData` to Store

**Files:**
- Modify: `stores/useTrainingStore.ts`

**Step 1: Add `addSet` action**
Add a new action that appends an ExerciseSet to an exercise's `exerciseSets` array. The new set copies `targetWeight` and `targetReps` from the last set.

**Step 2: Add `getPreviousExerciseData` helper**
Add a method that looks up `previousSessions` to find the last time an exercise was performed, returning `{ weight, reps }[]` for each set. This powers the PREV column.

**Step 3: Verify**
Run: `npx tsc --noEmit`

**Step 4: Commit**
```
feat(store): add addSet action and getPreviousExerciseData helper
```

---

## Task 2: Rewrite ExerciseForm.tsx — SetRow with Steppers & PREV

**Files:**
- Rewrite: `components/training/ExerciseForm.tsx`

**Changes to SetRow:**
- New layout: `[SET#] [PREV] [-KG+] [-REPS+] [CHECK]`
- PREV column shows `weight×reps` from previous session data (prop)
- +/- stepper buttons for KG (step 2.5) and REPS (step 1), 44pt touch targets
- RPE hidden (remove the column entirely — simplify)
- LOG button becomes a simple CHECK circle button
- Completed row: green tint bg, check icon, `weight × reps ✓` read-only
- "+ Agregar set" button at bottom of set list

**Changes to ExerciseForm:**
- Accept new prop `previousData?: Record<string, { weight: number; reps: number }[]>`
- Pass previous data per exercise to each SetRow

**Visual style (Genesis Design System):**
- Card: `backgroundColor: '#000000'`, `borderColor: GENESIS_COLORS.primary`, `borderWidth: 1`
- Stepper buttons: `backgroundColor: phaseColor+'15'`, icon color `phaseColor`
- Check button: `backgroundColor: GENESIS_COLORS.primary` when pending, `GENESIS_COLORS.success` when done
- PREV text: `GENESIS_COLORS.textTertiary`, `JetBrainsMonoMedium`, size 11

**Step 1: Rewrite SetRow**
**Step 2: Update ExerciseForm props and rendering**
**Step 3: Add "+ Agregar set" button**
**Step 4: Verify**: `npx tsc --noEmit`
**Step 5: Commit**
```
feat(exercise-form): rewrite SetRow with steppers, PREV column, add-set
```

---

## Task 3: Add Swipe Gestures to SetRow

**Files:**
- Modify: `components/training/ExerciseForm.tsx`

**Changes:**
- Wrap each SetRow in `Swipeable` from `react-native-gesture-handler`
- Swipe RIGHT: auto-complete set (call `onLog` with current values)
- Swipe LEFT: skip set (call `onSkip`)
- Right action: green background with Check icon
- Left action: red/muted background with X icon

**Step 1: Import Swipeable, add gesture wrappers**
**Step 2: Implement renderRightActions (complete) and renderLeftActions (skip)**
**Step 3: Wire swipe actions to callbacks**
**Step 4: Verify**: `npx tsc --noEmit`
**Step 5: Commit**
```
feat(exercise-form): add swipe-right to complete, swipe-left to skip
```

---

## Task 4: Add Feedback Animations on Set Log

**Files:**
- Modify: `components/training/ExerciseForm.tsx`
- Modify: `app/(screens)/active-workout.tsx`

**Changes to SetRow:**
- Add `useSharedValue` for check scale animation (0→1.2→1 withSpring)
- Add `useSharedValue` for row background flash (success+'30' → success+'10')
- Trigger both on LOG/swipe-complete
- Change haptic from `hapticMedium` to `hapticNotification(Success)`

**Changes to active-workout.tsx:**
- Import `hapticNotification` (add to haptics.ts if needed)
- Update `handleLogSet` to use new haptic

**Step 1: Add animation shared values to SetRow**
**Step 2: Trigger animations on log**
**Step 3: Update haptic feedback**
**Step 4: Verify**: `npx tsc --noEmit`
**Step 5: Commit**
```
polish(exercise-form): add check bounce, row flash, success haptic on log
```

---

## Task 5: Floating Rest Timer

**Files:**
- Modify: `app/(screens)/active-workout.tsx`
- Modify: `components/training/EnhancedRestTimer.tsx`

**Changes to EnhancedRestTimer:**
- Add a `compact` prop variant for floating mode
- Compact mode: horizontal bar layout, mini circular timer (30px), SKIP + "+30s" buttons inline
- Respect workout pause state (new `isPaused` prop)
- "+30s" button calls new `onAddTime` callback
- Visual: `backgroundColor: '#000000'`, `borderColor: GENESIS_COLORS.primary`, `borderRadius: 14`

**Changes to active-workout.tsx:**
- Move `EnhancedRestTimer` from inside ScrollView to OUTSIDE (between ScrollView and footer)
- Position it above the FINISH button with `position: 'absolute'`
- Pass `compact={true}` and `isPaused={workoutStatus === 'paused'}`
- Wire `onAddTime` to add 30 seconds to rest timer

**Step 1: Add compact mode to EnhancedRestTimer**
**Step 2: Add +30s button and pause awareness**
**Step 3: Move timer outside ScrollView in active-workout**
**Step 4: Verify**: `npx tsc --noEmit`
**Step 5: Commit**
```
feat(rest-timer): floating compact mode with +30s button, pause-aware
```

---

## Task 6: FINISH EARLY Confirmation + Visual Polish

**Files:**
- Modify: `app/(screens)/active-workout.tsx`

**Changes:**
- Add `Alert.alert()` guard on FINISH EARLY (only when `!allExercisesDone`)
- Update all card styles to Genesis Design System (black bg, purple borders)
- Ensure "CURRENT EXERCISE" card follows same style pattern

**Step 1: Add Alert confirmation**
**Step 2: Update card styles**
**Step 3: Verify**: `npx tsc --noEmit`
**Step 4: Commit**
```
polish(active-workout): FINISH EARLY confirmation, Genesis design consistency
```

---

## Task 7: Real-time PR Detection Per Set

**Files:**
- Modify: `app/(screens)/active-workout.tsx`
- Modify: `components/training/ExerciseForm.tsx`

**Changes:**
- After each `logSet`, check if the set exceeds known personal records
- If PR detected: pass a `prSetNumbers` prop to ExerciseForm
- SetRow renders gold "NEW PR" badge when its set number is in the PR list
- Haptic `heavy` on PR detection

**Step 1: Add PR check logic to handleLogSet**
**Step 2: Pass prSetNumbers prop through to SetRow**
**Step 3: Render gold PR badge**
**Step 4: Verify**: `npx tsc --noEmit`
**Step 5: Commit**
```
feat(active-workout): real-time PR detection with inline badge per set
```

---

## Verification

After all tasks:
- `npx tsc --noEmit` — clean compile
- Visual check: set row has steppers, PREV column, swipe works
- Feedback: haptic + animation on LOG
- Rest timer floats above FINISH button
- FINISH EARLY shows confirmation dialog
- PR badge appears on record-breaking sets
