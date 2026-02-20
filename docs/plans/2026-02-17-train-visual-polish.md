# TRAIN Section — Visual Polish Plan

**Date**: 2026-02-17
**Author**: Aldo + Claude (brainstorm)
**Scope**: Polish visual — mejorar lo existente sin cambiar arquitectura
**Language rule**: Híbrido estratégico — labels UI en español, terminología fitness en inglés (RPE, sets, reps, PR)

---

## CRITICAL: Safety First

Before ANY code changes:

```bash
cd /path/to/genesis-app
git checkout -b ui/train-visual-polish
git add -A && git commit -m "checkpoint: pre-train-visual-polish — stable baseline"
```

All work happens on `ui/train-visual-polish` branch. If anything breaks or doesn't look right: `git checkout main` and we're back to stable.

---

## Files to Modify

| File | Changes |
|------|---------|
| `app/(tabs)/train.tsx` | Sticky CTA, phase bar, exercise images, icon swap, reorder sections |
| `app/(screens)/active-workout.tsx` | Dynamic title, progress bar, set counter styling |
| `app/(screens)/library.tsx` | Search pill shape, filter pill sizing, empty state, badge fix |
| `app/(screens)/exercise-detail.tsx` | Back button visibility, movement type subtitle, alternatives size, video CTA |
| `components/training/ExerciseForm.tsx` | Input sizing, LOG button, completed strikethrough, RPE placeholder |
| `components/training/EnhancedRestTimer.tsx` | Tip text size, skip button copy |
| `components/training/ExerciseTransition.tsx` | Add set info to next exercise preview |
| `components/training/PostWorkoutSummary.tsx` | Title i18n, 2×2 grid stats, button copy, icon swap |

---

## Changes by Screen

### 1. train.tsx — Train Tab

#### 1A. Sticky "Start Workout" CTA
- **Move** the Start Workout button OUT of the ScrollView
- Place it as `position: 'absolute', bottom: 0, left: 0, right: 0` with padding
- Add a fade gradient overlay above the button (transparent → bgGradientEnd) so content fades under it
- Change text from `"START WORKOUT"` to `"INICIAR SESIÓN"`
- Add subtitle below button text: `"{exercises.length} ejercicios · ~{duration} min"` in JetBrainsMonoMedium, fontSize 11, textSecondary color
- Keep existing styling (border, glow, shadow) — just relocate
- Increase ScrollView `paddingBottom` to ~160 to account for sticky button area

#### 1B. Phase Info — Compact Bar
- **Replace** the standalone GlassCard Phase Info section with a compact inline bar
- Place it directly below the hero ImageCard (inside the same StaggeredSection or immediately after)
- Single line: `"{phaseConfig.label.toUpperCase()} · {phaseConfig.repRange} reps · {phaseConfig.setsRange} sets · {phaseConfig.restSeconds}s rest"`
- Style: `fontSize: 11, fontFamily: 'JetBrainsMonoMedium', color: phaseConfig.accentColor`
- Background: `backgroundColor: phaseConfig.accentColor + '10'`, `borderRadius: 10`, `paddingVertical: 8, paddingHorizontal: 14`
- No GlassCard wrapper, no Info icon — just a clean tinted bar

#### 1C. Exercise List — Individual Images
- In the exercises `.map()`, change `getMuscleGroupImage(workout?.muscleGroups ?? [])` to use the exercise's own image
- Lookup: find the exercise in `exerciseCatalog` by name or id, use its `imageUrl`
- Fallback: if not found in catalog, use current `getMuscleGroupImage(ex.muscleGroups || workout?.muscleGroups || [])`
- Need to fetch `exerciseCatalog` in train.tsx: `const { exerciseCatalog } = useTrainingStore();` (already available from store)
- Subtitle weight value in accent color: split the subtitle into parts, render weight portion with `color: GENESIS_COLORS.primary`

#### 1D. Reorder Sections
Current order: Hero → Phase Info → Camera CTA → Exercises → GENESIS Tip → Divider + Summary + Start Button → Recent Sessions
New order: Hero → Phase Bar (compact) → Exercises → GENESIS Tip → Camera CTA → Recent Sessions → [Sticky Start Button at bottom]
- Camera CTA moves AFTER exercises (secondary action, not primary)
- Remove Divider and Summary row (info now lives in sticky button subtitle)
- GENESIS Tip stays between exercises and Camera CTA

#### 1E. GENESIS Icon Swap
- Replace `Sparkle` import with a new `<GenesisIcon />` component (SVG custom — see Component Creation section)
- In the GENESIS Tip card: replace `<Sparkle size={14} .../>` with `<GenesisIcon size={14} color={phaseConfig.accentColor} />`

#### 1F. Muscle Group Pills — Full Pill Shape
- In hero card muscle group pills: change `borderRadius: 8` to `borderRadius: 9999`

#### 1G. Recent Sessions — Better Titles
- Change session title from `session.exercises[0]?.name ?? 'Sesión'` to `session.workoutName ?? session.exercises[0]?.name ?? 'Sesión'`
- Add completion indicator: if `session.completed` is true, show a small green dot (View with backgroundColor success, width/height 8, borderRadius 4) before the date text

### 2. active-workout.tsx — Active Workout

#### 2A. Dynamic Title
- Change header title from `currentSession.exercises[0]?.name ? 'Active Workout' : 'Workout'` to the actual workout name
- Use `currentSession.workoutName ?? 'Sesión Activa'`
- This requires `workoutName` to be set when `startWorkout()` is called in train.tsx — pass it from the workout plan

#### 2B. Exercise Progress Bar
- Inside the "CURRENT EXERCISE" info card, add a mini progress bar below the subtitle
- Height: 3px, borderRadius: 2
- Background track: `phaseConfig.color + '22'`
- Fill: `phaseConfig.accentColor`, width = `(completedSets / totalSets) * 100%`
- Use a simple View with width percentage, no animation needed for polish phase

#### 2C. Set Counter Emphasis
- In the subtitle `"Set {n} of {total} · {weight}{unit}"`:
  - Render the set number (`completedSets + 1`) in `fontFamily: 'JetBrainsMonoBold'` with `color: phaseConfig.accentColor`
  - Keep the rest in current secondary style
  - This means splitting the Text into multiple Text components inside a parent View with flexDirection row

### 3. ExerciseForm.tsx — Set Logging

#### 3A. Input Field Sizing
- Change all three TextInput styles: `padding: 8` → `padding: 12`
- This targets ~48px total height (12 + 12 padding + 14 fontSize + borders ≈ 48-50px)
- Change KG/REPS/RPE label fontSize from `9` to `11`

#### 3B. LOG Button Enhancement
- Change confirm button from fixed `width: 40, height: 40` to `flex: 0.6, height: 48`
- Add row layout inside: `<Check size={16} /> <Text>"LOG"</Text>` with flexDirection row, gap 4
- Text style: `fontSize: 12, fontFamily: 'JetBrainsMonoSemiBold', color: '#FFFFFF'`
- borderRadius stays 8

#### 3C. Completed Set Strikethrough
- In the completed SetRow, add `textDecorationLine: 'line-through'` to the weight × reps Text
- Keep existing opacity 0.6 and green checkmark

#### 3D. RPE Placeholder
- Change RPE TextInput placeholder from `"—"` to `"7"`
- Keep placeholderTextColor as textTertiary

### 4. EnhancedRestTimer.tsx

#### 4A. Tip Text Readability
- Change phase tip Text: `fontSize: 11` → `fontSize: 12`
- Change color from `GENESIS_COLORS.textMuted` to `GENESIS_COLORS.textSecondary`

#### 4B. Skip Button Copy
- Change `"Saltar descanso"` to `"SKIP"`
- Change fontSize from 13 to 12
- Keep fontFamily JetBrainsMonoSemiBold and SkipForward icon

### 5. ExerciseTransition.tsx

#### 5A. Next Exercise Context
- When showing the next exercise name, add set info below: `"Set 1 de {totalSets}"`
- Style: fontSize 12, JetBrainsMonoMedium, textSecondary color

### 6. library.tsx — Exercise Library

#### 6A. Search Bar Pill Shape
- Change search container `borderRadius: 16` to `borderRadius: 9999`

#### 6B. Filter Pill Sizing
- Change filter pills: `paddingVertical: 7` → `paddingVertical: 9`, `paddingHorizontal: 14` → `paddingHorizontal: 16`

#### 6C. Badge Semantic Fix
- In the grid renderItem, change `badgeColor={DIFFICULTY_COLORS[item.difficulty]}` to a neutral color: `badgeColor={GENESIS_COLORS.textSecondary}`
- Equipment badge should not carry difficulty color — it's confusing
- Difficulty is already implied by the exercise detail screen pills

#### 6D. Empty State Enhancement
- In ListEmptyComponent (non-loading state), add a Dumbbell icon (size 32, color textMuted) above the "No exercises found" text
- Change text to `"No se encontraron ejercicios"`

### 7. exercise-detail.tsx — Exercise Detail

#### 7A. Back Button Visibility
- Add to the back button Pressable: `borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)'`
- This ensures visibility over any image brightness

#### 7B. Movement Type Subtitle
- Below the exercise name (fontSize 24), add a subtitle line
- Content: `"{COMPOUND|ISOLATION} · {EQUIPMENT}"` — derive compound/isolation from exercise data or muscleGroup heuristic
- Style: `fontSize: 11, fontFamily: 'JetBrainsMonoMedium', color: GENESIS_COLORS.textTertiary, letterSpacing: 1.5, textTransform: 'uppercase'`
- NOTE: If exercise type data isn't available, use a simple heuristic: exercises targeting multiple muscle groups = COMPOUND, single = ISOLATION. Or skip this and just show equipment in monospace as subtitle.

#### 7C. Alternatives Size
- Change alternatives cards: `width: 150` → `width: 170`, `height: 120` → `height: 140`

#### 7D. Video Demo Button
- If `exercise.videoUrl` exists, render a prominent button below the hero image (before the name)
- Style: Row with Play icon + `"VER DEMO"` text, backgroundColor `GENESIS_COLORS.primary + '15'`, borderRadius 10, padding 10
- onPress: `router.push('/(modals)/exercise-video?url=...')`

### 8. PostWorkoutSummary.tsx

#### 8A. Title Localization
- Change `"Workout Complete"` to `"Sesión Completa"`
- Change subtitle to use actual workout name (same workoutName prop improvement)

#### 8B. Stats 2×2 Grid
- Replace vertical column layout with 2×2 grid using `flexDirection: 'row', flexWrap: 'wrap'`
- Each stat card: `width: '48%'` (with gap between)
- Maintain existing entering animation but adjust delays for 2×2 flow (index 0,1 top row, 2,3 bottom row)
- Keep all existing colors and icon assignments

#### 8C. Button Copy
- Change `"CERRAR"` to `"VOLVER AL INICIO"`
- Add below the main button: a text link `"Ver resumen detallado →"` in textSecondary, fontSize 13, centered
- The text link does nothing for now (no onPress) — placeholder for future analytics screen

#### 8D. GENESIS Icon Swap
- Replace `<Sparkles>` with `<GenesisIcon />` in the motivational message section

---

## New Component: GenesisIcon

Create `components/ui/GenesisIcon.tsx`:

```tsx
// Minimal SVG icon representing GENESIS identity
// Used wherever GENESIS "speaks" — tips, messages, coach insights
// Accepts size and color props like Lucide icons
// PLACEHOLDER: Start with a simple geometric mark (hexagon or abstract "G")
// TODO: Replace with final GENESIS brand icon when design is finalized
```

- For now, use a simple distinctive shape (NOT Sparkles, NOT Brain)
- Suggestion: A minimal hexagon outline with a dot in center — represents the "neural core" of GENESIS
- Or: A stylized "G" letterform in monospace weight
- Export from `components/ui/index.ts`

---

## Implementation Order

Execute in this sequence to minimize risk and allow incremental testing:

1. **GenesisIcon component** — create first since multiple files reference it
2. **train.tsx** — biggest file, most changes (sticky CTA, reorder, phase bar, exercise images)
3. **ExerciseForm.tsx** — critical UX improvement (input sizing, LOG button)
4. **active-workout.tsx** — dynamic title, progress bar, set counter
5. **EnhancedRestTimer.tsx** — quick wins (text size, skip copy)
6. **ExerciseTransition.tsx** — quick win (set info)
7. **library.tsx** — search pill, filter sizing, badge fix, empty state
8. **exercise-detail.tsx** — back button, subtitle, alternatives, video CTA
9. **PostWorkoutSummary.tsx** — title, grid, button copy, icon swap

---

## Testing Checklist

After implementation, verify:

- [ ] Train tab loads without errors
- [ ] Sticky Start button visible without scrolling
- [ ] Phase bar shows correct phase info
- [ ] Each exercise shows its own image (or fallback)
- [ ] Camera CTA appears after exercises
- [ ] GenesisIcon renders in tip card
- [ ] Active workout shows workout name in header
- [ ] Progress bar fills correctly per completed set
- [ ] ExerciseForm inputs are comfortably sized
- [ ] LOG button is wider with text label
- [ ] Completed sets show strikethrough
- [ ] Rest timer tip text is readable
- [ ] Skip button says "SKIP"
- [ ] Exercise transition shows set info
- [ ] Library search bar is full pill shape
- [ ] Filter pills have comfortable tap targets
- [ ] Equipment badges are neutral color
- [ ] Empty state has Dumbbell icon
- [ ] Exercise detail back button has border
- [ ] Alternatives cards are larger
- [ ] Video demo button appears when videoUrl exists
- [ ] Post-workout title says "Sesión Completa"
- [ ] Stats render in 2×2 grid
- [ ] Button says "VOLVER AL INICIO"
- [ ] All text follows hybrid language rule (Spanish UI labels, English fitness terms)
- [ ] `npm test` passes (no broken imports/types)
- [ ] App compiles and runs on simulator without crashes
