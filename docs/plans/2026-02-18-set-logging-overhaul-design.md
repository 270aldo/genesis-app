# Design: Set Logging Overhaul (Sprint A)

**Date:** 2026-02-18
**Status:** Approved
**Branch:** `ui/train-visual-polish`

## Context

The set logging experience in `active-workout.tsx` / `ExerciseForm.tsx` is the most repeated interaction in the app (~20+ taps per session). Current UX has high friction: empty inputs, no auto-fill, no steppers, no feedback.

## Design Decisions

### 1. Set Row — Horizontal Table with Steppers

Layout per row: `[SET#] [PREV] [-KG+] [-REPS+] [LOG/CHECK]`

- **PREV column**: show `weight×reps` from last session (gray muted, `textTertiary`)
- **Steppers +/-**: flank KG (2.5kg step) and REPS (1 step). Touch target 44pt min
- **RPE hidden by default**: collapsible, not shown unless user enables it
- **One-tap LOG**: accepts pre-filled values without touching inputs
- **"+ Agregar set"**: appends new ExerciseSet with same targets as previous set

### 2. Swipe Gestures

- **Swipe-right**: auto-complete set with current values (same as LOG)
- **Swipe-left**: skip set (marks as skipped, opacity 0.3, no rest timer)
- Use `react-native-gesture-handler` Swipeable

### 3. Feedback Sequence (on LOG or swipe-right)

1. Haptic: `notificationAsync(NotificationFeedbackType.Success)`
2. Check icon: scale 0→1.2→1 via `withSpring` (200ms)
3. Row background: flash `success+'30'` → fade to `success+'10'` (300ms)
4. Row collapses: hides steppers, shows `80kg × 5 ✓` one-liner
5. Rest timer slides in as floating bar

### 4. Floating Rest Timer

- Moves OUTSIDE ScrollView, anchored at bottom (above tab bar)
- Shows: circular mini countdown + SKIP + "+30s" buttons
- Always visible even when scrolling other exercises
- Pauses when workout is paused

### 5. Real-time PR Detection

- After each logSet, compare actualWeight×actualReps against personalRecords
- If PR: gold `"NEW PR"` badge on row, haptic heavy, glow border animation
- Full-screen celebration reserved for post-workout summary

### 6. FINISH EARLY Confirmation

- Add `Alert.alert()` with "Terminar sesion?" / "Cancel" / "Terminar"
- Only when not all exercises are done

### 7. Visual Coherence (Genesis Design System)

- `backgroundColor: '#000000'`
- `borderColor: GENESIS_COLORS.primary` (#6D00FF)
- `borderWidth: 1`, `borderRadius: 12-16`
- Fonts: JetBrainsMonoBold for values, Inter for labels
- Icons: lucide-react-native, colored with `GENESIS_COLORS.primary`
- Chips: `backgroundColor: phaseConfig.color + '15'`, borderRadius 8
- Success: `#00F5AA`, Error: `#FF6B6B`

## Files to Modify

| File | Changes |
|------|---------|
| `components/training/ExerciseForm.tsx` | Complete rewrite of SetRow, add steppers, swipe, PREV column, + Add Set |
| `app/(screens)/active-workout.tsx` | Floating rest timer, FINISH EARLY confirmation, real-time PR detection |
| `components/training/EnhancedRestTimer.tsx` | Compact floating variant, +30s button, pause-aware |
| `stores/useTrainingStore.ts` | addSet action, previous session lookup helper |

## Not in Scope (Sprint B)

- Exercise detail redesign
- Chat-based logging (A2UI Sprint C)
- Video inline looping
