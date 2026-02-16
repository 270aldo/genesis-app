# Master Prompt: GENESIS UI/UX Redesign — Sprint A

## Context

You are implementing the **UI/UX Redesign Sprint A** for the GENESIS mobile app (Expo SDK 54 / React Native 0.81). This is a premium AI-powered fitness coaching app built for NGX.

**Your Role**: Senior React Native UI engineer executing a visual overhaul. You are NOT modifying backend, API, state management, or AI logic. Purely frontend UI work.

**Project Stage**: Feature implementation on existing codebase (Phase 9 Sprint 4 complete, app is functional)

## Current State

### Repository Status
- **Status**: Fully functional app with 5 tabs, AI chat, 16 tools, A2UI widgets
- **Branch**: Check current branch with `git branch`
- **Dependencies**: All installed — reanimated, expo-haptics, expo-image, expo-linear-gradient, lucide-react-native all available

### What Exists
- 24 UI components in `components/ui/`
- 5 tab screens in `app/(tabs)/`
- 5 modal screens in `app/(modals)/`
- Full color system in `constants/colors.ts`
- Animation constants in `constants/animations.ts`
- Shadow system in `constants/shadows.ts`

### What's Missing (you're building this)
- No onboarding redesign
- No GENESIS FAB
- No animated components (counters, progress rings, stagger)
- No haptic feedback integration
- Empty `assets/` folder (only app icons)
- Generic empty states

## Mission

Execute Sprint A of the UI/UX Redesign: create foundational animation hooks, redesign the 5-step onboarding with GENESIS AI guidance, add a global GENESIS floating action button, and integrate haptic feedback. This sprint has the highest visual impact.

## Reference Files

Read these files FIRST before writing any code:

1. **PRD**: `./PRD-UI-REDESIGN.md` — Full requirements with exact specs for every component
2. **Project Context**: `./CLAUDE.md` — Architecture patterns, project structure, tech stack details
3. **Visual Proposal**: `./GENESIS-UI-REDESIGN-PROPOSAL.html` — Visual mockups (open in browser to see)

## Immediate Tasks

Execute these tasks IN ORDER:

### Task 1: Create Animation Foundation
**Goal**: Build reusable animation hooks used across the entire redesign
**Files to create**:
- `hooks/useAnimatedCounter.ts`
- `hooks/useStaggeredEntrance.ts`
- `components/ui/AnimatedProgressRing.tsx`
- `utils/haptics.ts`

**Specifications**:
- `useAnimatedCounter(targetValue: number, duration?: number)` → returns `Animated.SharedValue<number>`. Uses `withTiming` from reanimated. Default duration 1000ms. Triggers on mount.
- `useStaggeredEntrance(itemCount: number, delayMs?: number)` → returns `AnimatedStyle[]`. Each item: opacity 0→1 + translateY 20→0 with staggered delay (default 150ms between items).
- `AnimatedProgressRing` → SVG circle with animated stroke-dashoffset. Props: `progress: number (0-1)`, `size?: number`, `strokeWidth?: number`, `color?: string`, `bgColor?: string`. Uses reanimated to animate fill.
- `haptics.ts` → exports `hapticLight()`, `hapticMedium()`, `hapticHeavy()`, `hapticSelection()` wrapping `expo-haptics`.

**Success Criteria**:
- [ ] All 4 files created with TypeScript types
- [ ] `npx tsc --noEmit` passes
- [ ] Hooks follow existing patterns in `hooks/` directory

### Task 2: Create Onboarding Components
**Goal**: Build the 4 shared components used across onboarding steps
**Files to create**:
- `components/onboarding/StepIndicator.tsx`
- `components/onboarding/GenesisGuide.tsx`
- `components/onboarding/SelectionCard.tsx`
- `components/onboarding/SchedulePill.tsx`

**Specifications** (see PRD-UI-REDESIGN.md §4.1 tasks A4-A6 for exact specs):
- StepIndicator: horizontal dots, active=wide purple pill with glow, done=green, pending=dim gray
- GenesisGuide: glass card (`rgba(109,0,255,0.08)` bg, `rgba(109,0,255,0.2)` border), GENESIS gradient avatar with pulse, "GENESIS" label in JetBrains Mono `#a866ff`, message text in `rgba(255,255,255,0.7)`
- SelectionCard: pressable card with icon area (48x48 rounded-xl gradient placeholder), title, subtitle. Selected: purple bg/border/glow + check circle. Includes hapticSelection on press.
- SchedulePill: small pressable pill for day count (3/4/5/6). Selected = purple fill.

**Success Criteria**:
- [ ] 4 components created in `components/onboarding/`
- [ ] All use existing design tokens from `constants/colors.ts`
- [ ] TypeScript types for all props
- [ ] Haptic feedback on selection events

### Task 3: Redesign Onboarding Screens
**Goal**: Find and completely redesign the 5 onboarding screens
**FIRST**: Search the codebase to locate existing onboarding screens:
```bash
# Try these searches to find onboarding code
grep -r "Your Goal\|Build Strength\|Improve Endurance\|Aesthetics\|Longevity" app/ --include="*.tsx" -l
grep -r "Experience\|Beginner\|Intermediate\|Advanced" app/ --include="*.tsx" -l
grep -r "CONTINUE\|START YOUR JOURNEY\|Schedule\|Body Metrics\|Review" app/ --include="*.tsx" -l
grep -r "onboarding\|step\|wizard" app/ --include="*.tsx" -l
```

**Then**: Redesign each screen using the new components:
- Step 1 (Goal): StepIndicator + GenesisGuide("¿Cuál es tu norte?...") + 4 SelectionCards (Fuerza/Resistencia/Estética/Longevidad with Spanish subtitles)
- Step 2 (Experience): GenesisGuide("Tu nivel define la intensidad...") + 3 SelectionCards (Principiante/Intermedio/Avanzado)
- Step 3 (Schedule): GenesisGuide("¿Cuántos días puedes dedicar?...") + SchedulePills (3-6 días)
- Step 4 (Body Metrics): GenesisGuide("Necesito tus métricas base...") + styled inputs (Peso kg, Altura cm, Edad)
- Step 5 (Review → "Tu Plan"): COMPLETE REDESIGN — GENESIS celebration avatar, "Tu plan está listo", Season Preview card with 4-phase timeline bars, 3-metric grid (días/fases/ejercicios), profile summary mini-card, gradient CTA "COMENZAR MI JOURNEY →"

**All screens**: Purple gradient CTA at bottom, Spanish text, consistent 16px padding

**Success Criteria**:
- [ ] All 5 screens redesigned
- [ ] GENESIS guide appears on every step
- [ ] StepIndicator shows correct progress
- [ ] Selection states work with haptic feedback
- [ ] Review is a "wow" moment, not a data table
- [ ] Navigation between steps works correctly
- [ ] Gradient CTA buttons on all screens

### Task 4: Create & Integrate GenesisFAB
**Goal**: Add a floating GENESIS button visible on all tabs
**Files**:
- Create: `components/genesis/GenesisFAB.tsx`
- Modify: `app/(tabs)/_layout.tsx`

**Specifications**:
- 56x56 circle, `LinearGradient` from `#6D00FF` to `#8B5CF6`
- CPU icon from lucide-react-native (22px, white)
- Position: absolute, bottom: 90 (above tab bar), right: 20
- Shadow: `shadowColor: '#6D00FF', shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.4, shadowRadius: 15`
- Idle: subtle pulse animation (scale 1.0 → 1.05 → 1.0, 3s loop)
- Press: scale down to 0.9 with spring animation
- `onPress` → `router.push('/(modals)/genesis-chat')`
- `onLongPress` → `router.push('/(modals)/voice-call')` + hapticHeavy()
- Add to `_layout.tsx` AFTER the `<Tabs>` component, inside the same fragment/view

**Success Criteria**:
- [ ] FAB visible on Home, Train, Fuel, Mind, Track tabs
- [ ] Tap opens GENESIS chat modal
- [ ] Long press opens voice call modal
- [ ] Doesn't overlap or interfere with tab bar
- [ ] Pulse animation runs when idle
- [ ] Press scale animation works
- [ ] Haptic feedback on interactions

### Task 5: Verification
**Goal**: Ensure everything works together
```bash
# Type check
npx tsc --noEmit

# Run tests (should not break existing tests)
npm test

# Verify file count
ls components/onboarding/
ls hooks/useAnimated*
ls hooks/useStaggered*
ls components/genesis/GenesisFAB.tsx
ls utils/haptics.ts
```

**Success Criteria**:
- [ ] TypeScript compiles with no errors
- [ ] All existing tests pass (no regressions)
- [ ] 4 new onboarding components exist
- [ ] 2 new hooks exist
- [ ] 1 new UI component (AnimatedProgressRing) exists
- [ ] GenesisFAB exists and is integrated in tab layout
- [ ] haptics utility exists

## Constraints

### DO
- ✅ Use `react-native-reanimated` for ALL animations
- ✅ Use existing color tokens from `constants/colors.ts`
- ✅ Use `expo-haptics` for tactile feedback
- ✅ Use `expo-linear-gradient` for gradients
- ✅ Use `lucide-react-native` for icons
- ✅ Write TypeScript with proper types for all props
- ✅ All user-facing text in SPANISH
- ✅ Follow existing component patterns (check `components/ui/GlassCard.tsx` for style)
- ✅ Use JetBrains Mono for labels/badges, Inter for body text
- ✅ Add haptic feedback to all interactive elements in new code

### DO NOT
- ❌ Do NOT modify `CLAUDE.md` — it contains critical project context
- ❌ Do NOT modify any BFF files (`bff/` directory)
- ❌ Do NOT modify Zustand stores (`stores/` directory)
- ❌ Do NOT modify API services (`services/` directory) unless adding a simple import
- ❌ Do NOT install new npm packages — everything needed is already installed
- ❌ Do NOT use the old `Animated` API from React Native — use `react-native-reanimated` only
- ❌ Do NOT use CSS-in-JS libraries — use NativeWind or inline `style` objects
- ❌ Do NOT create real image assets — use gradient placeholders for now
- ❌ Do NOT change navigation structure — only add GenesisFAB overlay
- ❌ Do NOT change the tab bar design — it's already good

### VERIFY Before Each File
- [ ] Import paths are correct (check existing imports in nearby files)
- [ ] Color values match `constants/colors.ts`
- [ ] Component follows existing pattern from `components/ui/`

## Session Success Criteria

This session is complete when:
- [ ] Animation foundation created (2 hooks + 1 component + 1 utility)
- [ ] 4 onboarding components created
- [ ] 5 onboarding screens redesigned with GENESIS guidance
- [ ] GenesisFAB created and visible on all tabs
- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes (no regressions)
- [ ] Commit with message: `feat(ui): Sprint A — onboarding redesign, GenesisFAB, animation foundation`

## Notes

- The onboarding screens location is UNKNOWN — you must search for them first (Task 3 provides grep commands)
- If onboarding screens don't exist yet, CREATE them in `app/(screens)/onboarding/` with proper expo-router navigation
- The `expo-router` navigation for onboarding may need a `_layout.tsx` — check how existing screen groups work in `app/(screens)/_layout.tsx`
- For the Season Preview card in the Review step, use mock data (Season 1, 12 weeks, 4 phases) — it will be wired to real data later
- If any dependency is missing (unlikely), install it but note which one
