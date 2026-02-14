# GENESIS App UI/UX Redesign — Product Requirements Document

## TL;DR

Redesign the GENESIS mobile app (Expo SDK 54 / React Native 0.81) from a functional prototype to a premium fitness experience. The app's backend, state management, and AI integration are solid (Phase 9 Sprint 4 complete). The visual layer needs: (1) complete onboarding overhaul with GENESIS AI guidance, (2) GENESIS FAB for omnipresent AI access, (3) animated components (counters, progress rings, card entrances), (4) image placeholder system for cards, (5) empty state illustrations, and (6) consistent visual polish across all 5 tabs. No backend changes — purely frontend/UI work.

---

## 1. Problem Statement

### The Problem
The GENESIS app has a solid technical foundation (5 ADK agents, 16 tools, A2UI widgets, persistent sessions) but the visual experience doesn't match the premium positioning of NGX. The onboarding feels like a form, not a guided experience. Assets folder is empty (no images, no Lottie, no illustrations). Empty states show raw zeros. No micro-interactions or animations. GENESIS AI coach is hidden in a modal with no prominent access.

### Current State
- Onboarding: 5 plain dark screens (Your Goal, Experience, Schedule, Body Metrics, Review) with text + icons only
- Assets: Only app icons exist (`assets/icon.png`, `adaptive-icon.png`, `splash-icon.png`, `favicon.png`)
- Empty states: Track tab shows "0, 0, —" with generic text prompts
- Animations: None beyond basic widget slide-in in chat
- GENESIS access: Only via modal trigger from Home briefing card or tab-specific buttons
- Visual density: Home is rich, Mind/Track feel empty, Fuel is functional but flat

### Target Users
Adults 30-60 seeking evidence-based performance and longevity training. They expect premium app quality comparable to Hevy, WHOOP, or Apple Fitness+.

---

## 2. Solution Overview

### Approach
Three implementation sprints (A → B → C) prioritized by visual impact. Sprint A targets onboarding + global GENESIS access + animation foundation. Sprint B upgrades tab screens. Sprint C adds premium details. All work is frontend-only — no BFF or backend changes.

### Key Components
1. **Onboarding Redesign**: 5 screens with GENESIS conversational guidance, step progress dots, rich option cards, "Tu Plan Está Listo" finale
2. **GENESIS FAB**: Floating action button on ALL tabs for instant AI chat access
3. **Animation System**: Reusable hooks/components for counters, progress rings, card entrance stagger, haptics
4. **Visual Enhancement System**: Gradient image placeholders, SVG empty states, ImageCard upgrades
5. **Tab Screen Polish**: Consistent visual density and premium feel across Home, Train, Fuel, Mind, Track

---

## 3. Technical Specification

### 3.1 Tech Stack (existing — do NOT change)

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Expo SDK | 54 (`expo@~54.0.33`) |
| UI | React Native | 0.81.5 (New Architecture) |
| Language | TypeScript | 5.9 |
| Styling | NativeWind v4 | Tailwind for RN |
| State | Zustand 5 | Stores in `stores/` |
| Navigation | expo-router v6 | File-based routing |
| Animations | react-native-reanimated | Already installed |
| Images | expo-image | Already installed |
| Gradients | expo-linear-gradient | Already installed |
| Icons | lucide-react-native | Already installed |
| Haptics | expo-haptics | Already installed |

### 3.2 Design System Tokens (existing — preserve these)

```typescript
// constants/colors.ts — KEEP ALL EXISTING VALUES
GENESIS_COLORS = {
  primary: '#6D00FF',      // Main accent
  primaryLight: '#9D4EDD',
  primaryDark: '#4A00B0',
  accent: { cyan: '#00E5FF', mint: '#00F5AA' },
  background: { start: '#151226', mid: '#050507', end: '#000000' },
  surface: { card: 'rgba(10, 10, 10, 0.85)', elevated: 'rgba(20, 20, 25, 0.6)', glass: 'rgba(20, 20, 25, 0.4)' },
  text: { primary: '#FFFFFF', secondary: 'rgba(255, 255, 255, 0.60)', muted: 'rgba(192, 192, 192, 0.60)' }
}
```

### 3.3 Component Architecture

All new components go in existing directories:
- `components/ui/` — reusable design system components
- `components/onboarding/` — NEW directory for onboarding screens
- `components/genesis/` — GENESIS-specific (FAB goes here)
- `hooks/` — animation hooks

### 3.4 File Naming Convention (existing)
- Components: `PascalCase.tsx` (e.g., `GenesiFAB.tsx`)
- Hooks: `use[Name].ts` (e.g., `useAnimatedCounter.ts`)
- Constants: `camelCase.ts`

---

## 4. Scope Definition

### 4.1 Sprint A — Foundation & Onboarding (MUST HAVE — DO FIRST)

| ID | Task | Files | Acceptance Criteria |
|----|------|-------|---------------------|
| A1 | Create `useAnimatedCounter` hook | `hooks/useAnimatedCounter.ts` | Hook takes `(targetValue, duration)`, returns animated value using `react-native-reanimated`. Counts from 0 to target on mount. |
| A2 | Create `useStaggeredEntrance` hook | `hooks/useStaggeredEntrance.ts` | Hook takes `(itemCount, delayMs)`, returns array of animated styles. Each item fades in + slides up with staggered delay. |
| A3 | Create `AnimatedProgressRing` component | `components/ui/AnimatedProgressRing.tsx` | SVG-based circular progress with animated fill. Props: `progress (0-1)`, `size`, `strokeWidth`, `color`. Uses reanimated for animation. |
| A4 | Create `StepIndicator` component | `components/onboarding/StepIndicator.tsx` | Horizontal dots: active = wide pill (#6D00FF with glow), completed = green (#00F5AA), pending = dim. Props: `currentStep`, `totalSteps`. Animated transitions. |
| A5 | Create `GenesisGuide` component | `components/onboarding/GenesisGuide.tsx` | Glass card with GENESIS avatar (cpu icon in gradient circle with pulse ring), "GENESIS" label in JetBrains Mono, and message text. Props: `message: string`. Used at top of each onboarding step. |
| A6 | Create `SelectionCard` component | `components/onboarding/SelectionCard.tsx` | Option card for onboarding selections. Props: `icon`, `title`, `subtitle`, `selected`, `onPress`. Selected state: purple border + glow + check icon + radial gradient background. Unselected: glass-sm. 12px icon thumbnails. |
| A7 | Redesign onboarding Step 1 (Goal) | Locate existing onboarding screen for goal selection | Replace plain cards with `SelectionCard`. Add `StepIndicator` at top. Add `GenesisGuide` with message "¿Cuál es tu norte? Esto define cómo diseño tu temporada de 12 semanas." Options: Fuerza, Resistencia, Estética, Longevidad (with subtitles). Spanish text. Gradient CTA button "SIGUIENTE →". |
| A8 | Redesign onboarding Step 2 (Experience) | Locate existing experience level screen | Same pattern: `StepIndicator` step 2, `GenesisGuide` with "Tu nivel de experiencia define la intensidad y complejidad de tu plan.", `SelectionCard` for Principiante/Intermedio/Avanzado (each with 1-line description). |
| A9 | Redesign onboarding Step 3 (Schedule) | Locate existing schedule screen | `StepIndicator` step 3, `GenesisGuide` with "¿Cuántos días puedes dedicar? Consistencia > volumen.", selectable day chips (3/4/5/6 days) as horizontal row of pressable pills. Selected = purple fill. |
| A10 | Redesign onboarding Step 4 (Body Metrics) | Locate existing body metrics screen | `StepIndicator` step 4, `GenesisGuide` with "Necesito tus métricas base para personalizar nutrición y cargas." Improved input fields with labels in Spanish (Peso kg, Altura cm, Edad). Glassmorphic input styling with focus border (#6D00FF). |
| A11 | Redesign onboarding Step 5 (Review → "Tu Plan") | Locate existing review screen | COMPLETE REDESIGN. No more plain table. Instead: (1) All step dots green/complete, (2) GENESIS celebration avatar (larger, gradient bg), (3) "Tu plan está listo" heading, (4) Season Preview card (gradient border, phase timeline with 4 colored bars, phase names), (5) 3-metric row (días/sem, fases, ejercicios), (6) Profile summary mini-card with edit icon, (7) CTA "COMENZAR MI JOURNEY →" with gradient + glow shadow. |
| A12 | Create `GenesisFAB` component | `components/genesis/GenesisFAB.tsx` | Floating action button: 56x56 circle, `bg-gradient-to-br from-[#6D00FF] to-[#8B5CF6]`, cpu icon (lucide), positioned bottom-right above tab bar (bottom: 90, right: 20). Shadow glow `0 0 30px rgba(109,0,255,0.4)`. Pulse animation on idle. `onPress` → navigate to genesis-chat modal. `onLongPress` → navigate to voice-call modal. Uses `Pressable` with scale animation on press. |
| A13 | Add GenesisFAB to root layout | `app/(tabs)/_layout.tsx` | Import and render `<GenesisFAB />` inside the tab layout so it appears on ALL tabs. Position absolute, z-index above content but below modals. |
| A14 | Add haptic feedback utility | `utils/haptics.ts` | Wrapper around `expo-haptics`: `hapticLight()`, `hapticMedium()`, `hapticHeavy()`, `hapticSelection()`. Used for button presses, completions, selections. |
| A15 | Verify Sprint A | — | Run `npm test`. Visually verify: onboarding flows correctly with new UI, GenesisFAB visible on all tabs, animations work, haptics fire on press events. |

### 4.2 Sprint B — Tab Screen Polish (AFTER Sprint A)

| ID | Task | Files | Acceptance Criteria |
|----|------|-------|---------------------|
| B1 | Home: Upgrade GENESIS briefing card | `app/(tabs)/home.tsx` | Add radial gradient bg overlay to GENESIS card. Add pulse ring to avatar icon. Ensure `GenesisGuide` style consistency. |
| B2 | Home: Daily missions → ImageCards | `app/(tabs)/home.tsx` | Replace flat mission cards with ImageCard component using gradient placeholder backgrounds (Train=purple, Fuel=mint, Mind=violet). Add overlay gradient. Each card 130px wide, 150px tall in horizontal scroll. |
| B3 | Home: Animated quick metrics | `app/(tabs)/home.tsx` | Wrap metric values with `useAnimatedCounter`. Numbers count up on screen focus. |
| B4 | Track: Empty state illustration | `app/(tabs)/track.tsx`, `components/ui/EmptyStateIllustration.tsx` | Create SVG-based empty state component (abstract chart lines + trophy icon + "Completa tu primer workout" message). Replace raw "0, 0, —" with motivated empty state when no data. |
| B5 | Mind: Mood selector upgrade | `app/(tabs)/mind.tsx` | Larger mood icons (40x40), animated scale on selection, haptic feedback per tap. Selected mood gets colored circle background + glow. |
| B6 | Fuel: Animated calorie ring | `app/(tabs)/fuel.tsx` | Replace static `CircularProgress` with `AnimatedProgressRing`. Gradient stroke from `#6D00FF` to `#00E5FF`. Animate on mount. |
| B7 | Add skeleton loaders globally | All tab screens | Ensure `ShimmerEffect` / `SkeletonCard` (already exist in `components/loading/`) are used as loading states in ALL tabs. Replace plain `ActivityIndicator` usage. |
| B8 | Card entrance animations | All tab screens | Wrap main content sections with `useStaggeredEntrance`. Cards fade in with 150ms stagger when screen loads or data arrives. |

### 4.3 Sprint C — Premium Details (AFTER Sprint B)

| ID | Task | Acceptance Criteria |
|----|------|---------------------|
| C1 | Train: Exercise row thumbnails | Add small gradient placeholder thumbnails (32x32) to exercise list items. Each muscle group gets a themed gradient (chest=red, back=blue, legs=green, shoulders=orange). |
| C2 | Track: PR celebration | When PR detected, show animated overlay: trophy icon scales up + confetti particles (simple animated dots) + haptic heavy. |
| C3 | GENESIS contextual suggestions | Quick action pills in chat modal adapt based on which tab user came from. Train→exercise questions, Fuel→nutrition questions, Mind→recovery questions. |
| C4 | Active workout timer animation | Animate the MM:SS timer with a pulsing glow effect in phase accent color. |
| C5 | Water tracker animation | Replace WaterDots with animated fill: each glass "fills" with a rising blue animation when tapped. |
| C6 | Rest day illustration | When Train tab shows rest day, display motivational illustration (moon + stars SVG) + GENESIS tip card. |

### 4.4 Out of Scope
- ❌ No BFF/backend changes
- ❌ No new Supabase tables or migrations
- ❌ No new API endpoints
- ❌ No changes to ADK agents or tools
- ❌ No real image assets (use gradient placeholders until photo assets are sourced)
- ❌ No Lottie animations (use reanimated for everything)
- ❌ No changes to chat logic, widget rendering, or agent routing
- ❌ No changes to auth flow
- ❌ No changes to data stores (Zustand) beyond UI consumption patterns

### 4.5 Constraints
- **Preserve existing CLAUDE.md** — do NOT modify or delete it. It contains critical project context.
- **No breaking changes** — all existing functionality must continue working
- **React Native specific** — animations must use `react-native-reanimated`, NOT CSS animations or `Animated` API
- **Spanish UI** — all user-facing text in Spanish
- **JetBrains Mono** for labels/badges/monospace, **Inter** for body text
- **#6D00FF** as primary accent everywhere — no deviations
- **NativeWind** for simple styles, **inline `style` objects** for complex/animated layouts (existing pattern)

---

## 5. Implementation Guide

### Critical Patterns to Follow

#### GlassCard pattern (existing — follow this)
```typescript
// components/ui/GlassCard.tsx — EXISTING, do NOT modify
// Use as base for all card surfaces
<GlassCard shadow="primary" shine>
  {children}
</GlassCard>
```

#### ImageCard pattern (existing — use for mission cards)
```typescript
// components/cards/ImageCard.tsx — EXISTING
// Uses expo-image with blurhash, overlay gradient, badge support
<ImageCard
  imageUrl="https://..."
  title="Train"
  subtitle="Upper Push · 45min"
  badge="HOY"
  badgeColor="#6D00FF"
  onPress={() => {}}
/>
```

#### Animation pattern (use this for all new animations)
```typescript
// Use react-native-reanimated v3 patterns
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing
} from 'react-native-reanimated';

// Duration presets (from constants/animations.ts)
const DURATIONS = { micro: 150, short: 300, medium: 600, long: 1000 };
```

#### Haptics pattern
```typescript
import * as Haptics from 'expo-haptics';
// Light: selection, toggle
// Medium: complete action
// Heavy: milestone (PR, season complete)
```

### Finding Onboarding Screens

The onboarding screens may be in one of these locations (SEARCH for them):
- `app/(screens)/onboarding/` or `app/onboarding/`
- `app/(auth)/` directory
- A single file with step state management
- Look for components with "Goal", "Experience", "Schedule", "Body Metrics", "Review" text
- Search for `"Your Goal"`, `"Build Strength"`, `"START YOUR JOURNEY"` strings
- Search for `"CONTINUE"` button text in screen files

### Color Usage Reference

| Context | Color | Usage |
|---------|-------|-------|
| Primary actions, borders, glows | `#6D00FF` | Buttons, selected states, FAB |
| Selected state background | `rgba(109,0,255,0.12)` | SelectionCard active bg |
| Selected state border | `rgba(109,0,255,0.3)` | SelectionCard active border |
| Completed/success | `#00F5AA` | Step dots done, streaks |
| GENESIS avatar gradient | `from-[#6D00FF] to-[#a866ff]` | GenesisGuide, FAB |
| CTA button gradient | `from-[#6D00FF] to-[#8B5CF6]` | Main action buttons |
| CTA shadow | `0 0 30px rgba(109,0,255,0.3)` | Button glow |
| Glass surface | `rgba(10, 10, 10, 0.85)` | Card backgrounds |
| Subtle border | `rgba(255, 255, 255, 0.08)` | Card borders |
| Muted text | `rgba(255, 255, 255, 0.40)` | Subtitles, descriptions |

---

## 6. Validation

### After Each Sprint
```bash
# Run tests
npm test

# Type check
npx tsc --noEmit

# Start dev server and verify visually
npm start
```

### Visual Verification Checklist
- [ ] Onboarding: GENESIS speaks on each step
- [ ] Onboarding: Step dots animate correctly
- [ ] Onboarding: Selection cards show selected state with glow
- [ ] Onboarding: Review is a "wow" moment, not a table
- [ ] GenesisFAB: Visible on all 5 tabs
- [ ] GenesisFAB: Opens chat on tap, voice on long press
- [ ] GenesisFAB: Doesn't overlap tab bar icons
- [ ] Animations: Counters count up smoothly
- [ ] Animations: Cards stagger entrance
- [ ] Animations: Progress ring fills
- [ ] Haptics: Fire on selections and completions
- [ ] All text in Spanish
- [ ] No visual regressions on existing screens

---

## Appendix

### A. Existing Component Inventory (DO NOT recreate these)
- `GlassCard` — glass morphism card
- `GradientCard` — gradient border card
- `ImageCard` — background image card
- `MetricCard` — metric display card
- `CircularProgress` — circular progress ring (STATIC — Sprint B replaces with animated version in Fuel)
- `ProgressBar` — linear progress
- `SeasonHeader` — season/week/phase header
- `ScreenHeader` — title + subtitle
- `SectionLabel` — section divider
- `Pill` / `PillBadge` — badges
- `Button` — primary button
- `WaterDots` — hydration display
- `ScoreCard` — icon + value + label
- `SimpleBarChart` — bar chart
- `StreakCounter` — flame + streak
- `ShimmerEffect` / `SkeletonCard` — loading states
- `ErrorBanner` / `ErrorState` / `EmptyState` — error/empty
- `TypingIndicator` — chat typing dots

### B. Design Proposal Reference
See `GENESIS-UI-REDESIGN-PROPOSAL.html` in project root for visual mockups of before/after states.
