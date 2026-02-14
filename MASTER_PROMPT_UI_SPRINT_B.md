# Master Prompt: GENESIS UI/UX Redesign — Sprint B (Tab Screen Polish)

## Context

You are continuing the **UI/UX Redesign Sprint B** for the GENESIS mobile app. Sprint A is COMPLETE (verified): animation foundation, onboarding redesign, GenesisFAB, haptics utility — all working.

**Your Role**: Senior React Native UI engineer polishing the 5 main tab screens. Purely frontend UI work — no backend, no stores, no API changes.

**Project Stage**: Sprint B of 3 (A ✅ → **B** → C)

## What Sprint A Created (available for use)

These tools are ready — USE THEM in this sprint:
- `hooks/useAnimatedCounter.ts` — `useAnimatedCounter(targetValue, duration?)` → animated SharedValue
- `hooks/useStaggeredEntrance.ts` — `useStaggeredEntrance(itemCount, delayMs?)` → stagger styles
- `components/ui/AnimatedProgressRing.tsx` — SVG circular progress with animated fill
- `utils/haptics.ts` — `hapticLight()`, `hapticMedium()`, `hapticHeavy()`, `hapticSelection()`

These exist but are UNUSED (fix that in this sprint):
- `components/loading/ShimmerEffect.tsx` — animated opacity fade shimmer
- `components/loading/SkeletonCard.tsx` — static skeleton placeholder
- `components/ui/EmptyState.tsx` — icon + title + subtitle centered (props: `icon?`, `title?`, `subtitle?`)

## Reference Files

Read these FIRST:
1. `./PRD-UI-REDESIGN.md` — Full specs (§4.2 Sprint B section has all tasks)
2. `./CLAUDE.md` — Project architecture, patterns, gotchas

## Mission

Polish all 5 tab screens with: animated metrics, skeleton loading states, premium empty states, visual upgrades to key cards, and staggered card entrance animations. Make every screen feel alive and premium.

## Immediate Tasks

Execute IN ORDER:

### Task 1: Create EmptyStateIllustration Component
**Goal**: Premium empty state with SVG illustration for Track tab and reusable everywhere
**File**: `components/ui/EmptyStateIllustration.tsx`

**Specs**:
- Props: `{ variant: 'track' | 'fuel' | 'mind' | 'train', title: string, subtitle: string, actionLabel?: string, onAction?: () => void }`
- Each variant has a different abstract SVG icon arrangement:
  - `track`: Trophy icon (lucide) + upward trend lines (3 ascending bars using View)
  - `fuel`: Utensils icon + circular ring outline
  - `mind`: Brain icon + wave pattern (3 sine-like curved Views)
  - `train`: Dumbbell icon + progress bar outline
- Layout: centered, icon area 80x80 with `rgba(109,0,255,0.08)` bg circle, title 15px InterBold white, subtitle 12px Inter `rgba(255,255,255,0.4)`, optional purple gradient action button
- Fade-in animation on mount using `withTiming` opacity 0→1, 600ms
- Export from `components/ui/index.ts`

**Success Criteria**:
- [ ] Component renders 4 variants correctly
- [ ] Fade-in animation works
- [ ] Action button triggers callback + hapticLight

### Task 2: Home Tab Upgrade
**Goal**: Make Home the most visually impressive screen
**File**: `app/(tabs)/home.tsx`

**Modifications** (KEEP all existing functionality, only enhance visuals):

**2a. GENESIS Briefing Card → Hero Visual**:
- Add `LinearGradient` overlay inside the briefing card: `colors={['rgba(109,0,255,0.08)', 'transparent']}` positioned as radial-like effect (absolute, top-right corner, 200x200, borderRadius 100, opacity 0.3)
- Add pulse ring effect to the Sparkles icon (same pattern as GenesisGuide from Sprint A: scale pulse 1.0→1.15→1.0 using withRepeat + withSequence)
- Wrap entire card in `Animated.View` with fade-in on mount

**2b. Quick Metrics → Animated Counters**:
- Import `useAnimatedCounter` from `hooks/useAnimatedCounter`
- For each MetricMini value (calories, sleep hours, water L, steps): wrap the numeric display with animated counter
- Use `Animated.Text` or `ReText` from reanimated to display the animated value
- NOTE: `useAnimatedCounter` returns a SharedValue. Use `useDerivedValue` to format it (e.g., round to integer or 1 decimal) and display via `useAnimatedProps` or reanimated's text capabilities
- If reanimated text is complex, a simpler approach: use `useEffect` + `useState` with `requestAnimationFrame` to count up manually over 1000ms

**2c. Daily Missions → ImageCard Style**:
- Replace the current `MissionCard` local component with cards that use gradient backgrounds
- Each mission card: 130px wide, 150px tall, `borderRadius: 16`
- Background: `LinearGradient` with themed colors:
  - Train: `['rgba(109,0,255,0.15)', 'rgba(109,0,255,0.03)']`
  - Fuel: `['rgba(0,245,170,0.12)', 'rgba(0,229,255,0.03)']`
  - Check-in: `['rgba(139,92,246,0.12)', 'rgba(109,0,255,0.03)']`
- Overlay structure: gradient bg → content at bottom (icon, title, subtitle)
- Keep existing navigation onPress handlers

**2d. Card Entrance Stagger**:
- Import `useStaggeredEntrance` from Sprint A
- Apply staggered entrance to the main content sections (briefing card, metrics row, missions section, week grid)
- Each section gets a delayed fade-in (0ms, 150ms, 300ms, 450ms)

**2e. Replace ActivityIndicator with Skeleton**:
- Import `SkeletonCard` from `components/loading`
- Replace any `ActivityIndicator` in the loading state with 2-3 SkeletonCards
- Keep loading logic from stores unchanged

**Success Criteria**:
- [ ] Briefing card has gradient overlay + pulse icon
- [ ] Metric values animate counting up on screen load
- [ ] Mission cards have gradient backgrounds (not flat gray)
- [ ] Content staggers in on load
- [ ] Loading state uses SkeletonCards not spinner

### Task 3: Track Tab — Empty States & Polish
**Goal**: Transform Track from "zeroes wall" to motivational empty state
**File**: `app/(tabs)/track.tsx`

**Modifications**:

**3a. Empty States → EmptyStateIllustration**:
- Import `EmptyStateIllustration` from `components/ui`
- Replace ALL inline empty state patterns (GlassCard + centered text) with `EmptyStateIllustration`:
  - Strength Trend empty → `variant="track"` title="Sin datos de fuerza aún" subtitle="Completa sesiones para ver tu progresión"
  - Personal Records empty → `variant="track"` title="Sin récords personales" subtitle="Completa sesiones para desbloquear tus PRs" (use Trophy icon from lucide)
  - Progress Photos empty → `variant="track"` title="Sin fotos de progreso" subtitle="Captura tu primera foto para comparar tu transformación" actionLabel="TOMAR FOTO" onAction={handleTakePhoto}
- Each empty state should feel motivational, not like "no data"

**3b. Stats Row → Animated Counters**:
- Wrap ScoreCard values (workouts count, PRs count, adherence %) with animated counting
- Same approach as Home metrics (Task 2b)
- Adherence should animate to the percentage with "%" suffix

**3c. Staggered Card Entrance**:
- Apply `useStaggeredEntrance` to all sections
- Hero card (0ms) → Stats row (150ms) → Strength chart (300ms) → PRs (450ms) → Photos (600ms)

**3d. Loading → Skeleton**:
- Replace `ActivityIndicator` with SkeletonCards (3-4 placeholders matching section layout)

**Success Criteria**:
- [ ] Empty states use EmptyStateIllustration (not inline text)
- [ ] Stats count up on load
- [ ] Cards stagger entrance
- [ ] Loading uses skeletons

### Task 4: Mind Tab — Mood & Visual Upgrade
**Goal**: Make Mind tab feel calming and premium
**File**: `app/(tabs)/mind.tsx`

**Modifications**:

**4a. Mood Selector Visual Upgrade**:
- Find the MoodSelector usage in mind.tsx
- Increase icon size: if configurable via props, set to 40px (currently likely 24px)
- Add haptic feedback: on mood selection, call `hapticSelection()` from utils/haptics
- If MoodSelector doesn't support these props natively, wrap each mood option with additional styling:
  - Selected mood: add a colored glow ring around the icon (using the existing MOOD_COLORS mapping)
  - Scale animation on press: Animated.View with spring scale 0.9→1.0

**4b. Recovery Heatmap Visual Enhancement**:
- The recovery status section shows Chest/Back/Shoulders/Legs/Arms/Core in a grid
- If it's plain text cards, add colored left borders to each card:
  - Recovered: green left border (#00F5AA)
  - Moderate: yellow left border (#FFD93D)
  - Fatigued: red left border (#FF6B6B)
- This is a minimal but impactful visual change

**4c. Meditation Cards Check**:
- Meditation cards already use ImageCard with backgrounds (these look good per the screenshots)
- If they exist: add a play button overlay (white circle with play triangle)
- If loading: add ShimmerEffect placeholders

**4d. Card Entrance Stagger**:
- Apply `useStaggeredEntrance` to sections: Mood (0ms) → Recovery (150ms) → Wellness Score (300ms) → Meditation (450ms) → Sleep (600ms)

**Success Criteria**:
- [ ] Mood selection has haptic feedback
- [ ] Selected mood has visual emphasis (glow or scale)
- [ ] Recovery cards have color-coded borders
- [ ] Content staggers in

### Task 5: Fuel Tab — Animated Ring & Polish
**Goal**: Make Fuel tab's calorie tracking feel dynamic
**File**: `app/(tabs)/fuel.tsx`

**Modifications**:

**5a. Calorie Ring → AnimatedProgressRing**:
- Find the current `CircularProgress` usage for calories
- Replace with `AnimatedProgressRing` from Sprint A (`components/ui/AnimatedProgressRing`)
- Props: `progress={caloriesConsumed / caloriesTarget}`, `size={120}`, `strokeWidth={10}`, `color="#6D00FF"`
- Keep the center content (calorie number + "restantes" text) — render it as children or overlay
- NOTE: AnimatedProgressRing may need a `children` prop for center content. If it doesn't have one, render center content as an absolutely positioned View on top of the ring.

**5b. Macro Bars → Gradient Fill**:
- If macro bars (Protein/Carbs/Fat) use plain ProgressBar, upgrade them:
  - Protein bar: `LinearGradient` fill `['#38bdf8', '#0ea5e9']`
  - Carbs bar: `LinearGradient` fill `['#00F5AA', '#00D4FF']`
  - Fat bar: `LinearGradient` fill `['#F97316', '#EF4444']`
- This may require modifying ProgressBar component or creating a wrapper

**5c. Empty Meal State**:
- If no meals logged: use `EmptyStateIllustration` variant="fuel" title="Sin comidas registradas" subtitle="Registra tu primera comida del día" actionLabel="AGREGAR COMIDA"

**5d. Stagger + Skeleton**:
- Apply `useStaggeredEntrance` to sections
- Replace any ActivityIndicator with SkeletonCards

**Success Criteria**:
- [ ] Calorie ring animates on load (smooth fill)
- [ ] Macro bars have gradient fills (not solid colors)
- [ ] Empty meals state uses EmptyStateIllustration
- [ ] Content staggers in

### Task 6: Train Tab — Quick Visual Polish
**Goal**: Minimal but impactful improvements to Train
**File**: `app/(tabs)/train.tsx`

**Modifications**:

**6a. Rest Day Visual**:
- When it's a rest day, if the screen shows a Moon icon with text:
  - Wrap in a centered container with `EmptyStateIllustration` variant="train" approach
  - Add GENESIS tip card below: GenesisGuide-style glass card with message "Hoy es día de descanso. La recuperación es donde el músculo crece. Hidrátate y descansa bien."

**6b. Stagger + Skeleton**:
- Apply `useStaggeredEntrance` to main sections (hero → phase info → exercise list)
- Replace loading ActivityIndicator with SkeletonCards

**6c. Exercise List Polish**:
- If exercise items are plain ListItemCards, add a subtle left border color based on muscle group (if muscle_groups data available):
  - Chest/Shoulders: `#6D00FF` (purple)
  - Back/Arms: `#00E5FF` (cyan)
  - Legs/Core: `#00F5AA` (mint)
- This is optional if too complex — prioritize stagger + skeleton

**Success Criteria**:
- [ ] Rest day has a premium illustration + GENESIS tip
- [ ] Loading uses skeletons
- [ ] Card entrance is staggered

### Task 7: Verification
**Goal**: Everything works, nothing broken
```bash
# Type check
npx tsc --noEmit

# Run all tests
npm test

# Verify new component exists
ls components/ui/EmptyStateIllustration.tsx

# Check imports are clean
grep -r "ActivityIndicator" app/\(tabs\)/ --include="*.tsx"
# Should show ZERO results (all replaced with skeletons)
```

**Success Criteria**:
- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes (no regressions)
- [ ] EmptyStateIllustration component exists and exported
- [ ] No ActivityIndicator remaining in tab screens (all replaced with SkeletonCard)
- [ ] All 5 tabs have staggered entrance animations
- [ ] Commit: `feat(ui): Sprint B — tab polish, animated metrics, skeleton loaders, premium empty states`

## Constraints

### DO
- ✅ Use Sprint A tools: `useAnimatedCounter`, `useStaggeredEntrance`, `AnimatedProgressRing`, `haptics.ts`
- ✅ Use existing unused components: `ShimmerEffect`, `SkeletonCard`, `EmptyState`
- ✅ Use `react-native-reanimated` for all animations
- ✅ Use existing color tokens from `constants/colors.ts` — especially `GENESIS_COLORS`
- ✅ All text in SPANISH
- ✅ KEEP all existing data fetching, store usage, and navigation logic intact
- ✅ Add haptic feedback to new interactive elements
- ✅ Follow existing inline style patterns (NativeWind for simple, `style` objects for complex)

### DO NOT
- ❌ Do NOT modify `CLAUDE.md`
- ❌ Do NOT modify `bff/` directory
- ❌ Do NOT modify Zustand stores (`stores/`)
- ❌ Do NOT modify services (`services/`)
- ❌ Do NOT change data fetching logic — only change HOW data is DISPLAYED
- ❌ Do NOT install new packages
- ❌ Do NOT modify the onboarding flow (Sprint A, already complete)
- ❌ Do NOT modify GenesisFAB (Sprint A, already complete)
- ❌ Do NOT break existing navigation
- ❌ Do NOT remove any existing functionality — only enhance visuals

### IMPORTANT Implementation Notes
- `useAnimatedCounter` returns a `SharedValue<number>`. To display animated text, either:
  - Use `useAnimatedProps` with `TextInput` (reanimated pattern for animated text)
  - Or use a simpler approach: `useEffect` + `useState` + interpolation over duration
  - Choose whichever works cleanly — the visual result matters more than the technique
- When replacing `CircularProgress` with `AnimatedProgressRing`, check if they have the same props interface. If not, adapt the surrounding JSX.
- `EmptyStateIllustration` should be NEW — different from existing `EmptyState.tsx`. The new one has variant-based icons and a gradient action button. Keep the old `EmptyState` as-is.
- For staggered entrances: wrap each SECTION (not individual cards) in an Animated.View with the stagger style. This gives a cleaner visual than animating every tiny element.

## Session Success Criteria

This session is complete when:
- [ ] EmptyStateIllustration component created with 4 variants
- [ ] Home: briefing glow + animated metrics + gradient missions + stagger
- [ ] Track: premium empty states + animated stats + stagger
- [ ] Mind: haptic mood selector + recovery colors + stagger
- [ ] Fuel: AnimatedProgressRing for calories + gradient macros + stagger
- [ ] Train: rest day illustration + skeleton loading + stagger
- [ ] ALL tabs: SkeletonCard loading (zero ActivityIndicators in tabs)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes
- [ ] Committed with descriptive message
