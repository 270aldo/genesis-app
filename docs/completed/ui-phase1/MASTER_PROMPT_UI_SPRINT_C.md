# Master Prompt: GENESIS UI/UX Redesign — Sprint C (Premium Details)

## Context

You are executing **Sprint C (final sprint)** of the GENESIS UI/UX Redesign. Sprints A and B are COMPLETE:
- Sprint A ✅: Onboarding redesign, GenesisFAB, animation hooks, haptics
- Sprint B ✅: All 5 tabs polished with staggered entrances, animated counters, skeleton loaders, EmptyStateIllustration, AnimatedProgressRing, haptic mood selector, color-coded recovery heatmap

**Your Role**: Senior React Native UI engineer adding premium differentiators. This is the finishing polish that separates a good app from a premium one.

**Project Stage**: Sprint C of 3 (A ✅ → B ✅ → **C**)

## Reference Files

Read these FIRST:
1. `./PRD-UI-REDESIGN.md` — §4.3 Sprint C has all task specs
2. `./CLAUDE.md` — Project architecture, patterns, gotchas

## Available Tools From Previous Sprints

Already created and working — use them freely:
- `hooks/useAnimatedCounter.ts` / `hooks/useCountUpDisplay.ts` — animated number display
- `hooks/useStaggeredEntrance.ts` — `useStaggeredEntrance(count, delay)` + `getStaggeredStyle(progress, index)` (has 'worklet' directive)
- `components/ui/AnimatedProgressRing.tsx` — SVG circle with animated fill
- `components/ui/EmptyStateIllustration.tsx` — 4 variant empty states
- `components/onboarding/GenesisGuide.tsx` — GENESIS glass card with pulse avatar
- `components/genesis/GenesisFAB.tsx` — floating action button
- `components/loading/SkeletonCard.tsx` + `ShimmerEffect.tsx` — loading states
- `utils/haptics.ts` — `hapticLight()`, `hapticMedium()`, `hapticHeavy()`, `hapticSelection()`

## Mission

Add the premium details that make GENESIS feel world-class: PR celebration animations, contextual GENESIS chat suggestions, animated water tracker, exercise thumbnails, active workout polish, and a rest day GENESIS coaching card upgrade.

## Immediate Tasks

Execute IN ORDER:

### Task 1: PR Celebration Animation
**Goal**: When a personal record is detected, show a celebration overlay
**Files**:
- Create: `components/training/PRCelebration.tsx`
- Modify: `app/(screens)/active-workout.tsx` (or wherever WorkoutComplete overlay is rendered)

**Specs**:
- Full-screen semi-transparent overlay (`rgba(0,0,0,0.85)`)
- Center content:
  - Trophy icon (lucide `Trophy`, 48px, `#FFD700` gold) with scale-up animation: `withSpring` from 0 → 1.2 → 1.0 (bounce effect)
  - "¡NUEVO RÉCORD!" text, 24px InterBold, white
  - Exercise name + weight/reps text, 16px Inter, `rgba(255,255,255,0.7)`
  - Subtle gold glow: `shadowColor: '#FFD700', shadowOpacity: 0.3, shadowRadius: 20`
- Confetti particles: 20 small colored dots (Views, 6-10px) that animate from center outward with `withTiming` + random offsets (x: ±150, y: ±200) over 1200ms, opacity fading 1→0
  - Colors: cycle through `['#FFD700', '#6D00FF', '#00F5AA', '#00E5FF', '#FF6B6B']`
  - Use `Array.from({length: 20})` to create particles, each with random angle + distance
- Haptic: `hapticHeavy()` on mount
- Auto-dismiss after 3 seconds OR tap to dismiss
- Props: `{ visible: boolean, exerciseName: string, record: string, onDismiss: () => void }`

**Integration**:
- Find where PRs are detected in active-workout.tsx (look for `prDetection` import or `WorkoutComplete` component)
- When PR is found, show PRCelebration overlay before/on top of the existing completion screen
- If WorkoutComplete already handles PRs, add the celebration as an enhancement layer

**Success Criteria**:
- [ ] Trophy scales up with bounce
- [ ] 20 confetti particles scatter outward
- [ ] Gold glow effect visible
- [ ] Haptic fires on PR detection
- [ ] Auto-dismisses after 3s
- [ ] Text shows exercise name + record value

### Task 2: GENESIS Contextual Chat Suggestions
**Goal**: Quick action pills in genesis-chat adapt to which tab the user came from
**File**: `app/(modals)/genesis-chat.tsx`

**Specs**:
- Find the existing quick action pills (horizontal scrollable buttons at top of chat)
- Add logic to detect which tab/screen the user navigated FROM (use `useLocalSearchParams()` or `router.params` or a simple global state/context)
- Define contextual pill sets:

```typescript
const CONTEXTUAL_PILLS: Record<string, Array<{label: string, message: string}>> = {
  home: [
    { label: '📊 MI BRIEFING', message: '¿Cuál es mi resumen del día?' },
    { label: '🎯 MI PROGRESO', message: '¿Cómo voy en mi temporada?' },
    { label: '💡 CONSEJO', message: 'Dame un consejo para hoy' },
  ],
  train: [
    { label: '🔄 SUSTITUIR', message: '¿Puedo sustituir este ejercicio?' },
    { label: '📈 PROGRESIÓN', message: '¿Cómo progresar en este ejercicio?' },
    { label: '⏱ DESCANSO', message: '¿Cuánto descanso entre series?' },
  ],
  fuel: [
    { label: '🍽 EVALUAR', message: '¿Estoy comiendo suficiente hoy?' },
    { label: '🥤 HIDRATACIÓN', message: '¿Cuánta agua debería tomar?' },
    { label: '💊 SUPLEMENTOS', message: '¿Qué suplementos me recomiendas?' },
  ],
  mind: [
    { label: '😴 SUEÑO', message: '¿Cómo puedo mejorar mi sueño?' },
    { label: '🧘 RECOVERY', message: '¿Qué puedo hacer para recuperarme mejor?' },
    { label: '🧠 ESTRÉS', message: '¿Cómo manejar el estrés hoy?' },
  ],
  track: [
    { label: '📊 ANÁLISIS', message: 'Analiza mi progreso de esta semana' },
    { label: '🏆 PRs', message: '¿Cuáles son mis últimos récords?' },
    { label: '📸 FOTOS', message: '¿Cómo comparar mi progreso visual?' },
  ],
  default: [
    { label: '👋 HOLA', message: 'Hola GENESIS, ¿cómo estoy hoy?' },
    { label: '📋 MI PLAN', message: '¿Qué tengo que hacer hoy?' },
    { label: '💪 MOTIVACIÓN', message: 'Necesito motivación' },
  ],
};
```

- When GenesisFAB opens chat: pass source tab as param (modify GenesisFAB to include `router.push({pathname: '/(modals)/genesis-chat', params: {source: currentTab}})`)
  - To detect current tab in GenesisFAB: use `usePathname()` from expo-router and extract tab name
- In genesis-chat.tsx: read `source` param and select appropriate pill set
- If no source param, use `default` pills
- Pill styling: keep existing style (JetBrains Mono, purple dim background)

**Success Criteria**:
- [ ] Pills change based on source tab
- [ ] Train-context shows exercise pills, Fuel shows nutrition pills, etc.
- [ ] Default pills show when opened without context
- [ ] GenesisFAB passes source param
- [ ] Pressing a pill sends the corresponding message

### Task 3: Animated Water Tracker
**Goal**: Replace WaterDots with an animated fill effect
**Files**:
- Create: `components/ui/AnimatedWaterTracker.tsx`
- Modify: `app/(tabs)/fuel.tsx` — replace WaterDots with new component

**Specs**:
- Props: `{ current: number, target: number, onAdd: () => void }`
- Display: Row of 8 glass circles (target number of glasses, default 8)
- Each glass: 36x36 circle, `borderRadius: 18`
  - Empty: `rgba(255,255,255,0.06)` bg, `rgba(255,255,255,0.1)` border
  - Filled: `rgba(56,189,248,0.2)` bg, `rgba(56,189,248,0.4)` border (uses water/cyan color)
  - Fill animation: when a glass becomes filled, animate with `withSpring` scale 0.8→1.1→1.0
  - Droplet icon (lucide `Droplets`, 16px) inside each circle — filled=`#38bdf8`, empty=`rgba(255,255,255,0.2)`
- Below glasses: `"{current} / {target} vasos"` text, 12px Inter, `rgba(255,255,255,0.4)`
- "+" button: small purple pill below the glasses: `+ AGUA`, `hapticLight()` on press, calls `onAdd()`
- Tap on any empty glass to fill it (calls onAdd for each tap)
- When reaching target: brief green glow flash on all glasses + `hapticMedium()`

**Success Criteria**:
- [ ] Glasses show fill animation on add
- [ ] Current/target counter updates
- [ ] Tap on glass or + button adds water
- [ ] Reaching target triggers celebration feedback
- [ ] Replaces old WaterDots in fuel.tsx

### Task 4: Exercise List Gradient Thumbnails
**Goal**: Add visual thumbnails to exercise rows in Train tab
**Files**:
- Modify: `app/(tabs)/train.tsx` or the exercise list component used there
- May need to modify: `components/ui/ListItemCard.tsx` if exercises use it

**Specs**:
- For each exercise in today's workout list, add a small gradient thumbnail (36x36, borderRadius: 10) on the left side
- Gradient colors based on primary muscle group:
  - Chest: `['rgba(109,0,255,0.3)', 'rgba(109,0,255,0.1)']` + Dumbbell icon
  - Back: `['rgba(0,229,255,0.3)', 'rgba(0,229,255,0.1)']` + ArrowUpDown icon
  - Shoulders: `['rgba(249,115,22,0.3)', 'rgba(249,115,22,0.1)']` + SquareStack icon
  - Legs: `['rgba(0,245,170,0.3)', 'rgba(0,245,170,0.1)']` + TrendingUp icon
  - Arms: `['rgba(139,92,246,0.3)', 'rgba(139,92,246,0.1)']` + Zap icon
  - Core: `['rgba(255,217,61,0.3)', 'rgba(255,217,61,0.1)']` + Target icon
  - Default (unknown): `['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']` + Activity icon
- Icon size: 18px, white at 60% opacity
- This replaces any plain icon or adds a thumbnail where none exists
- Map muscle group from exercise data (check exercise object structure in training store for `muscle_groups` array — use first element)

**Success Criteria**:
- [ ] Each exercise row has a colored gradient thumbnail
- [ ] Colors match the muscle group
- [ ] Icons are relevant to the muscle group
- [ ] Doesn't break existing exercise list functionality

### Task 5: Active Workout Timer Polish
**Goal**: Make the workout timer feel more alive
**File**: `app/(screens)/active-workout.tsx`

**Specs**:
- Find the MM:SS timer display
- Add a pulsing glow effect in the phase accent color:
  - `textShadowColor: phaseColor` (get from current phase config)
  - `textShadowRadius: 10`
  - Animate textShadowRadius from 5→15→5 using `withRepeat` + `withSequence` (2s cycle)
  - OR simpler: wrap timer text in a View with animated opacity glow (0.3→0.8→0.3) behind it
- If there's a play/pause button: add `hapticLight()` on tap
- If there's a RestTimer countdown: add `hapticMedium()` when timer reaches 0 (rest complete)

**Success Criteria**:
- [ ] Timer has visible glow/pulse effect
- [ ] Glow color matches current phase
- [ ] Haptic on play/pause and rest complete

### Task 6: GENESIS Proactive Insight on Home
**Goal**: Add a "nudge" card that GENESIS shows proactively on Home
**File**: `app/(tabs)/home.tsx`

**Specs**:
- Below the GENESIS briefing card, add a conditional insight card:
- Component: small glass card (similar to GenesisGuide but more compact)
- Layout: Left purple accent bar (3px, full height, borderRadius 2) + content
- Content: small CPU icon (14px, `#a866ff`) + insight text (12px Inter, `rgba(255,255,255,0.6)`)
- Show ONLY when there's actionable data:
  - If sleep < 6 hours (from wellness store): "Tu sueño fue corto anoche. Prioriza descanso hoy."
  - If adherence < 70% (from track store): "Tu adherencia va bajando. ¿Necesitas ajustar tu plan?"
  - If water < 4 glasses (from nutrition store): "Llevas poca agua hoy. Hidrátate antes de entrenar."
  - If none of these conditions: don't show the card
- Dismissible: small X button top-right, hides card for current session (local state, not persisted)
- Entrance: fade-in with 200ms delay after briefing card

**Success Criteria**:
- [ ] Card appears only when conditions are met
- [ ] Shows relevant insight based on actual store data
- [ ] Dismissible with X button
- [ ] Purple accent bar on left side
- [ ] Fade-in animation

### Task 7: Final Verification & Cleanup
**Goal**: Everything works, polish is complete
```bash
# Type check
npx tsc --noEmit

# Run all tests
npm test

# Verify new files exist
ls components/training/PRCelebration.tsx
ls components/ui/AnimatedWaterTracker.tsx

# Check for any console.log left behind
grep -r "console.log" app/ components/ hooks/ utils/ --include="*.tsx" --include="*.ts" -l

# Verify no obvious issues
grep -r "TODO\|FIXME\|HACK" app/ components/ --include="*.tsx" -l
```

**Success Criteria**:
- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes
- [ ] No console.log statements left in production code (remove any debugging logs)
- [ ] PRCelebration component exists
- [ ] AnimatedWaterTracker component exists
- [ ] Contextual pills work in chat
- [ ] Exercise thumbnails visible in Train
- [ ] Timer glow in active workout
- [ ] Proactive insight on Home
- [ ] Commit: `feat(ui): Sprint C — PR celebration, contextual chat, water animation, exercise thumbnails, premium polish`

## Constraints

### DO
- ✅ Use all Sprint A/B tools (reanimated, haptics, staggered entrance, etc.)
- ✅ Use existing color tokens from `constants/colors.ts`
- ✅ Read actual data from Zustand stores for conditional logic (Home insight card)
- ✅ All text in SPANISH
- ✅ Keep all existing functionality intact
- ✅ Add haptic feedback on all new interactive elements
- ✅ Clean up any console.log debugging statements

### DO NOT
- ❌ Do NOT modify `CLAUDE.md`
- ❌ Do NOT modify `bff/` directory
- ❌ Do NOT modify Zustand store logic — only READ from stores for display
- ❌ Do NOT install new packages
- ❌ Do NOT modify onboarding (Sprint A) or tab entrance animations (Sprint B)
- ❌ Do NOT break existing navigation or data flow
- ❌ Do NOT add real image assets — gradient placeholders only

### Implementation Priority
If time is limited, prioritize in this order:
1. PRCelebration (Task 1) — highest wow factor
2. Contextual Chat Pills (Task 2) — makes GENESIS feel intelligent
3. Animated Water Tracker (Task 3) — replaces boring component
4. Proactive Insight (Task 6) — makes GENESIS feel alive
5. Exercise Thumbnails (Task 4) — visual density
6. Timer Polish (Task 5) — nice but lowest impact

## Session Success Criteria

This session is complete when:
- [ ] PRCelebration with confetti + trophy + haptic
- [ ] Contextual chat pills per source tab
- [ ] AnimatedWaterTracker replacing WaterDots
- [ ] Exercise gradient thumbnails in Train
- [ ] Timer glow in active workout
- [ ] Proactive GENESIS insight on Home
- [ ] Zero console.logs in production code
- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes
- [ ] Committed with descriptive message

## 🎯 After This Sprint

With Sprint C complete, the GENESIS UI/UX Redesign is DONE. The next step is sourcing REAL image assets (exercise photos, onboarding illustrations) to replace gradient placeholders. That's a design/asset task, not a code task.
