# GENESIS App UI Phase 2 — "Visual Density" — Product Requirements Document

## TL;DR

Evolve GENESIS from a functional dark-mode fitness app into a visually rich, media-dense premium experience. Four sequential mini-sprints (D→E→F→G) add: (1) a complete exercise library with video-ready media cards, (2) an interactive SVG body map with recovery color-mapping, (3) upgraded progress photos with before/after comparator + coach notes section, and (4) a visual media layer with gradient overlays, sparklines, and season-awareness across all tabs. All work is frontend-only except one Supabase migration for `coach_notes`. Each sprint is isolated on its own git branch for clean rollback.

---

## 1. Problem Statement

### The Problem
GENESIS completed UI Phase 1 (Sprints A/B/C: onboarding, FAB, animations, tab polish) but remains text-heavy. The app lacks: visual media in cards (images, video placeholders, muscle group iconography), an exercise library (the #1 feature gap), interactive body visualization for recovery, and a coach notes channel that makes the HYBRID positioning (AI + human coach) tangible. Users comparing GENESIS to Hevy, WHOOP, or Muscle Booster will perceive a quality gap.

### Current State
- Exercise library (`app/(screens)/library.tsx`) exists but is basic — list view, no media, no thumbnails
- Progress photos in Track are functional but buttons need modernization (per Aldo's observations)
- MIND tab has recovery cards but no visual body map
- No coach notes system — the human coach (Aldo) has no direct communication channel
- Home "Hoy" cards are clean and functional — these stay as-is (no background images)
- "Aprende Hoy" section already has ImageCards — this pattern extends to other areas

### Target Users
Adults 30-60 in NGX's 12-week season program. They work with GENESIS (AI) + Aldo (human coach). They expect the app to match premium competitors visually while reflecting the season-based journey they're living.

---

## 2. Solution Overview

### Approach
Four mini-sprints, each on its own git branch, each independently testeable and revertible. Sprint D is the largest (new components). E/F/G build on D progressively.

### Key Components
1. **Exercise Library + Media System** (Sprint D): Full exercise library with search, muscle group filters, gradient-mapped media cards, play icon overlay for future video
2. **Body Map + Recovery Dashboard** (Sprint E): Dual-view SVG body map (anterior/posterior), dynamic color-mapping from season data, tap-to-detail panels, mood bug fix
3. **Progress Photos + Coach Notes** (Sprint F): Photo gallery with phase grouping, before/after slider comparator, coach notes in Home with new Supabase table
4. **Visual Media Layer** (Sprint G): Gradient overlays on workout cards, macro mini-bars, sparklines in Track metrics, SeasonBadge component, season awareness everywhere

### Season-First Design Principle
Every visual element connects to the user's 12-week season. Photos group by phase. Body map shows muscles trained this season. Workout cards show "Semana 7 de 12 · Fase 3". Coach notes contextualize the current phase. Nothing is generic — everything reinforces the journey.

---

## 3. Technical Specification

### 3.1 Tech Stack (existing — DO NOT change)

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
| SVG | react-native-svg | Already installed (15.15.2) |
| Haptics | expo-haptics | Already installed |

### 3.2 Design System Tokens (existing — preserve)

```typescript
// constants/colors.ts — ALL EXISTING VALUES STAY
// Key colors for this phase:
primary: '#6D00FF'        // Main accent, selected states, FAB, SeasonBadge
primaryLight: '#9D4EDD'   // Lighter accent variant
success: '#00F5AA'        // Completed, recovered muscles
warning: '#FFD93D'        // Caution states
error: '#FF6B6B'          // Soreness, alerts
info: '#00D4FF'           // Info states, cyan accent

// Muscle group gradient map (NEW — add to colors.ts):
muscleGradients: {
  chest:     ['#FF4444', '#6D00FF'],  // red → violet
  back:      ['#3B82F6', '#6D00FF'],  // blue → violet
  legs:      ['#10B981', '#059669'],   // emerald
  shoulders: ['#F97316', '#EF4444'],   // orange → red
  arms:      ['#00D4FF', '#6D00FF'],   // cyan → violet
  core:      ['#00F5AA', '#10B981'],   // mint → emerald
  cardio:    ['#FFD93D', '#F97316'],   // gold → orange
  glutes:    ['#8B5CF6', '#6D00FF'],   // purple → violet
  fullbody:  ['#6D00FF', '#9D4EDD'],   // violet spectrum
}

// Body map states (NEW — add to colors.ts):
bodyMap: {
  inactive:  '#2A2A3E',                    // no activity this week
  recovered: 'rgba(109, 0, 255, 0.3)',     // trained 48h+ ago
  active:    'rgba(109, 0, 255, 0.7)',     // trained today/yesterday
  soreness:  'rgba(255, 68, 68, 0.5)',     // soreness reported
}

// Season phase colors (NEW — add to colors.ts):
seasonPhase: {
  adaptation:  '#00F5AA',  // mint
  hypertrophy: '#00D4FF',  // cyan
  strength:    '#6D00FF',  // violet
  peaking:     '#FFD93D',  // gold
}
```

### 3.3 New Component Architecture

All new components go in existing directories:

```
components/
├── ui/
│   ├── SeasonBadge.tsx          # Sprint G — "S1 · Sem 7 · Fuerza" pill
│   └── MicroSparkline.tsx       # Sprint G — 7-point trend line
├── exercise/                    # NEW directory — Sprint D
│   ├── ExerciseMediaCard.tsx    # 4:3 media card with gradient + icon + play overlay
│   ├── MuscleGroupIcon.tsx      # 7 SVG muscle group mini-icons
│   ├── MuscleGroupFilter.tsx    # Horizontal scrollable filter chips
│   └── ExerciseSearchBar.tsx    # Glassmorphic search input
├── bodymap/                     # NEW directory — Sprint E
│   ├── BodyMapSVG.tsx           # Dual-view anterior/posterior SVG
│   ├── BodyMapAnterior.tsx      # Front body SVG paths
│   ├── BodyMapPosterior.tsx     # Back body SVG paths
│   └── MuscleDetailPanel.tsx    # Bottom sheet with muscle stats
├── photos/                      # NEW directory — Sprint F
│   ├── PhotoGallery.tsx         # 3-column grid with phase grouping
│   ├── PhotoComparator.tsx      # Before/after slider comparison
│   └── PhotoCaptureButton.tsx   # Mini-FAB camera button
├── coach/                       # NEW directory — Sprint F
│   └── CoachNotes.tsx           # Coach notes card for Home
└── tracking/
    └── ProgressPhotos.tsx       # EXISTING — will be refactored in Sprint F
```

### 3.4 Data Model Changes

#### NEW Table: `coach_notes` (Sprint F only backend change)

```sql
CREATE TABLE coach_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID DEFAULT NULL,
  message TEXT NOT NULL,
  title VARCHAR(100) DEFAULT NULL,
  phase_context VARCHAR(50) DEFAULT NULL,
  read_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS: users can only read their own notes
ALTER TABLE coach_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notes" ON coach_notes
  FOR SELECT USING (auth.uid() = user_id);

-- Index for quick latest-unread query
CREATE INDEX idx_coach_notes_user_unread
  ON coach_notes(user_id, created_at DESC)
  WHERE read_at IS NULL;
```

### 3.5 Store Changes

#### `useTrackStore.ts` — Add photo phase grouping
```typescript
// New selector (compute inline, never in selector):
// Group photos by season phase based on created_at vs phase dates
```

#### `useWellnessStore.ts` — Add muscle recovery data
```typescript
// New method: getMuscleRecoveryMap()
// Returns: Record<MuscleGroup, { lastTrained: Date, status: 'inactive'|'recovered'|'active'|'soreness' }>
// Sources: training sessions (last 7 days) + check-in soreness data
```

#### NEW `useCoachStore.ts` — Coach notes state
```typescript
interface CoachNote {
  id: string;
  message: string;
  title?: string;
  phaseContext?: string;
  readAt?: string;
  createdAt: string;
}

interface CoachStore {
  latestNote: CoachNote | null;
  allNotes: CoachNote[];
  hasUnread: boolean;
  fetchLatestNote: () => Promise<void>;
  fetchAllNotes: () => Promise<void>;
  markAsRead: (noteId: string) => Promise<void>;
}
```

---

## 4. Scope Definition

### 4.1 Sprint D — Exercise Library + Media System

| ID | Task | Files | Acceptance Criteria |
|----|------|-------|---------------------|
| D1 | Create `MuscleGroupIcon` component | `components/exercise/MuscleGroupIcon.tsx` | 7 SVG icons (chest, back, legs, shoulders, arms, core, cardio). Props: `group: MuscleGroup`, `size`, `color`. Line-style, stroke 1.5, white default. |
| D2 | Create `MuscleGroupFilter` component | `components/exercise/MuscleGroupFilter.tsx` | Horizontal ScrollView of filter chips. Each chip: MuscleGroupIcon + label. Selected = purple fill + glow. Props: `selected`, `onSelect`. "Todos" option as first chip. |
| D3 | Create `ExerciseMediaCard` component | `components/exercise/ExerciseMediaCard.tsx` | 4:3 aspect ratio card. Background: LinearGradient from muscleGradients map. Center: MuscleGroupIcon (48px, white). Bottom overlay: exercise name (Inter Bold 14) + muscle group Pill. Play icon overlay (triangle, 30% opacity white) positioned top-right. Props: `exercise`, `onPress`. Border radius 16px. |
| D4 | Create `ExerciseSearchBar` component | `components/exercise/ExerciseSearchBar.tsx` | Glassmorphic text input with search icon (lucide). Props: `value`, `onChangeText`, `placeholder`. Background: surfaceGlass. Border: borderSubtle. Focus state: borderActive (#6D00FF). |
| D5 | Redesign `library.tsx` screen | `app/(screens)/library.tsx` | Complete redesign: (1) ExerciseSearchBar at top, (2) MuscleGroupFilter below, (3) FlatList 2-column grid of ExerciseMediaCards, (4) Results count text, (5) Empty state when no results. Data from useTrainingStore.exerciseCatalog. |
| D6 | Add library access in Train tab | `app/(tabs)/train.tsx` | Add "Ver Librería Completa →" button below today's workout section. Navigates to library screen. Styled as subtle text link with arrow, Inter Medium 14, textSecondary color. |
| D7 | Add muscle group gradients to colors | `constants/colors.ts` | Add `muscleGradients` and `bodyMap` and `seasonPhase` color maps as specified in section 3.2. |
| D8 | Create barrel export | `components/exercise/index.ts` | Export all exercise components. |
| D9 | Verify Sprint D | — | `npm test` passes. `npx tsc --noEmit` passes. Library screen renders with 2-column grid. Filters work. Search filters results. Cards show correct gradients per muscle group. No regressions. |

### 4.2 Sprint E — Body Map + Recovery Dashboard

| ID | Task | Files | Acceptance Criteria |
|----|------|-------|---------------------|
| E1 | Create `BodyMapAnterior` SVG | `components/bodymap/BodyMapAnterior.tsx` | SVG paths for front body muscle groups: chest, deltoids (front), biceps, abs, quads, hip flexors. Each path has `id` matching MuscleGroup enum. Accepts `colorMap: Record<string, string>` prop. Viewbox fits mobile width (300x500). |
| E2 | Create `BodyMapPosterior` SVG | `components/bodymap/BodyMapPosterior.tsx` | SVG paths for back body: upper back, lats, triceps, glutes, hamstrings, calves, rear delts. Same colorMap pattern as Anterior. |
| E3 | Create `BodyMapSVG` wrapper | `components/bodymap/BodyMapSVG.tsx` | Swipeable container (horizontal PagerView or ScrollView with paging). Shows Anterior/Posterior with dot indicators below. Props: `muscleData: Record<MuscleGroup, MuscleStatus>`. Computes colorMap from muscleData using bodyMap color constants. Each muscle group `<Path>` wrapped in `<Pressable>` → calls `onMusclePress(group)`. |
| E4 | Create `MuscleDetailPanel` | `components/bodymap/MuscleDetailPanel.tsx` | Animated bottom sheet (slide up 200ms, spring). Shows: muscle name, last trained date, weekly volume (sets), recovery status (emoji + text), next scheduled workout from season plan. GlassCard styling. Close on swipe down or tap outside. |
| E5 | Add `getMuscleRecoveryMap` to wellness store | `stores/useWellnessStore.ts` | New method that cross-references `useTrainingStore` workout history (last 7 days) with wellness check-in soreness data. Returns recovery status per muscle group: inactive/recovered/active/soreness. Compute inline, not in selector. |
| E6 | Build Recovery Dashboard in Mind tab | `app/(tabs)/mind.tsx` | Replace or upgrade existing recovery section with: (1) "Recovery Status" header with pulse icon, (2) BodyMapSVG component, (3) Below: 3 mini-metrics row — "Grupos activos" / "Recovery score" / "Próximo descanso". All data contextualized to current season phase. |
| E7 | Fix Mood Selector bug | `app/(tabs)/mind.tsx` + `components/ui/MoodSelector.tsx` or `components/wellness/MoodSelector.tsx` | Diagnose why popup opens but doesn't register selection. Fix the state update. Add haptic feedback on mood selection. Selected mood persists visually with colored circle + glow. |
| E8 | Create barrel export | `components/bodymap/index.ts` | Export all bodymap components. |
| E9 | Verify Sprint E | — | `npm test` passes. `npx tsc --noEmit`. Body map renders both views. Swipe between anterior/posterior works. Tap muscle → detail panel slides up. Color mapping reflects training data. Mood selector works. No regressions. |

### 4.3 Sprint F — Progress Photos + Coach Notes

| ID | Task | Files | Acceptance Criteria |
|----|------|-------|---------------------|
| F1 | Create `PhotoGallery` component | `components/photos/PhotoGallery.tsx` | 3-column grid (FlatList, numColumns=3). Aspect ratio 3:4. Rounded 12px. Date overlay (JetBrains Mono, 10px) bottom-left on each photo. Category filter chips (Frente, Lateral, Espalda, Todas). Photos grouped by season phase with section headers ("Fase 1: Adaptación", etc.). |
| F2 | Create `PhotoCaptureButton` | `components/photos/PhotoCaptureButton.tsx` | Mini-FAB (44px circle, camera icon, violet gradient). Positioned bottom-right of gallery. onPress → image picker (camera or library, same as current). |
| F3 | Create `PhotoComparator` | `components/photos/PhotoComparator.tsx` | Activated from "Comparar" button in gallery. User taps 2 photos (check overlay on selection). Comparison view: both photos side-by-side. Vertical slider in center (PanResponder or gesture handler). Dragging reveals more of left or right photo. Below: time delta + season phase of each ("Semana 2 → Semana 9"). Optional: save comparison as composited image. |
| F4 | Integrate PhotoGallery in Track tab | `app/(tabs)/track.tsx` | Replace current ProgressPhotos component usage with new PhotoGallery. Maintain all existing photo upload/delete functionality. Add "Comparar" button in header. |
| F5 | Create Supabase migration for coach_notes | `bff/` (Supabase migration) | Create `coach_notes` table as specified in section 3.4. Apply via Supabase MCP or manual migration. Include RLS policy and index. |
| F6 | Create `useCoachStore` | `stores/useCoachStore.ts` | Zustand store as specified in 3.5. Fetches from `coach_notes` table. Methods: fetchLatestNote, fetchAllNotes, markAsRead. |
| F7 | Create `CoachNotes` component | `components/coach/CoachNotes.tsx` | GlassCard with: Aldo avatar (circular, initials "AO" or gradient placeholder), "Nota de tu Coach" header + timestamp, message text (max 3 lines, expandable), unread indicator (pulsing violet dot on avatar). onPress → expand full note + mark read. |
| F8 | Add CoachNotes to Home tab | `app/(tabs)/home.tsx` | Place CoachNotes section below GENESIS briefing card, above "Hoy" section. Only renders when `latestNote` exists. When no notes → section doesn't render (no empty state). |
| F9 | Create barrel exports | `components/photos/index.ts`, `components/coach/index.ts` | Export all new components. |
| F10 | Verify Sprint F | — | `npm test` passes. `npx tsc --noEmit`. Photo gallery renders in 3-col grid. Phase grouping works. Comparator slider works. Coach note card renders in Home. Marking read works. No regressions. |

### 4.4 Sprint G — Visual Media Layer + Polish Final

| ID | Task | Files | Acceptance Criteria |
|----|------|-------|---------------------|
| G1 | Workout cards gradient overlay in Train | `app/(tabs)/train.tsx` | Each workout exercise row gains gradient accent based on session type: Upper Push → red-violet, Lower → emerald, Upper Pull → blue-violet, Full Body → gold-violet. Subtle left-border or icon tint — not full background. MuscleGroupIcon (from D1) appears left of exercise name. |
| G2 | Season context header in Train | `app/(tabs)/train.tsx` | Add "Semana X de 12 · Fase N: [Name]" header below SeasonHeader. Always visible. Uses seasonPhase color for the phase name. |
| G3 | Create `SeasonBadge` component | `components/ui/SeasonBadge.tsx` | Compact pill: "S1 · Sem 7 · Fuerza". Background tinted with seasonPhase color at 15% opacity. Text in seasonPhase color. JetBrains Mono 11px. Props: `season`, `week`, `phase`. |
| G4 | Add SeasonBadge to Train, Track, Mind headers | `app/(tabs)/train.tsx`, `app/(tabs)/track.tsx`, `app/(tabs)/mind.tsx` | SeasonBadge appears in each tab's header area. Consistent positioning across all three. |
| G5 | GENESIS branding fix in Home | `app/(tabs)/home.tsx` | Change "GENESIS" text color from cyan to white or violet. Apply JetBrains Mono with subtle letter-spacing (1.5px). Keep card structure, only fix brand color. |
| G6 | Season progress bar in Home | `app/(tabs)/home.tsx` | Horizontal bar with 12 segments (one per week). Completed weeks = solid primaryLight. Current week = primary with subtle pulse animation. Future weeks = borderSubtle. Positioned near top of Home, below greeting. |
| G7 | Meal category icons in Fuel | `app/(tabs)/fuel.tsx` | Logged meals gain category icon left of meal name: desayuno (Sun), almuerzo (Clock), cena (Moon), snack (Zap). Use lucide icons. Subtle, 20px, textSecondary color. |
| G8 | Macro mini-bars in Fuel | `app/(tabs)/fuel.tsx` | Below each macro number (protein/carbs/fat), add thin horizontal progress bar (4px height) using macro colors from design tokens. Shows % of daily target. |
| G9 | Create `MicroSparkline` component | `components/ui/MicroSparkline.tsx` | Tiny SVG line chart (80x24px). Takes `data: number[]` (7 values). Draws polyline with stroke in primary color. Optional: gradient fill below line at 10% opacity. No axes, no labels — just the trend shape. |
| G10 | Add sparklines to Track metrics | `app/(tabs)/track.tsx` | Each metric ScoreCard gains a MicroSparkline below its number. Data source: last 7 data points from the metric's history. Shows directional trend at a glance. |
| G11 | "Aprende Hoy" gradient refinement | `app/(tabs)/home.tsx` | Ensure education cards in "Aprende Hoy" section use ImageCard with themed gradient placeholders per content category. Do NOT add images to "Hoy" section cards (Train, Fuel, Check-in). |
| G12 | Camera button prominence in Fuel | `app/(tabs)/fuel.tsx` | Camera button (for food scanning) placed at same hierarchy as manual log button. Icon + "IA" badge. Both buttons visible without scrolling. |
| G13 | Verify Sprint G | — | `npm test` passes. `npx tsc --noEmit`. Season badge visible on 3 tabs. Sparklines render. Macro bars show progress. GENESIS branding is violet/white. 12-week progress bar renders. No regressions. |

### 4.5 Out of Scope

- ❌ No real image/video assets (gradient placeholders until media is sourced)
- ❌ No Lottie animations (use reanimated for everything)
- ❌ No BFF endpoint changes (except coach_notes table + query)
- ❌ No ADK agent changes
- ❌ No changes to chat logic, widget rendering, or agent routing
- ❌ No changes to auth flow
- ❌ No 3D models or Three.js (SVG body map only)
- ❌ No light mode support
- ❌ No changes to onboarding (completed in Phase 1)

### 4.6 Constraints

- **Preserve existing CLAUDE.md** — do NOT modify or delete it
- **No breaking changes** — all existing functionality must continue working
- **React Native specific** — animations use `react-native-reanimated`, NOT CSS or `Animated` API
- **Spanish UI** — all user-facing text in Spanish
- **JetBrains Mono** for labels/badges/monospace, **Inter** for body text
- **#6D00FF** as primary accent everywhere — no deviations
- **NativeWind** for simple styles, **inline `style` objects** for complex/animated layouts
- **Zustand pattern** — never call store methods inside selectors, read primitives and compute inline
- **Git branch per sprint** — `ui-phase2-sprint-D`, `ui-phase2-sprint-E`, etc.
- **Test after every sprint** — `npm test && npx tsc --noEmit`

---

## 5. Implementation Guide

### Git Strategy

```bash
# Before starting each sprint:
git checkout main
git pull
git checkout -b ui-phase2-sprint-[D|E|F|G]

# After completing and verifying each sprint:
git add -A
git commit -m "feat(ui): Sprint [D|E|F|G] — [description]"
git checkout main
git merge ui-phase2-sprint-[D|E|F|G]

# If sprint breaks something — clean rollback:
git checkout main
git branch -D ui-phase2-sprint-[X]  # delete failed branch
```

### Existing Component Patterns (FOLLOW THESE)

#### GlassCard pattern
```typescript
// components/ui/GlassCard.tsx — EXISTING, do NOT modify
<GlassCard shadow="primary" shine>
  {children}
</GlassCard>
```

#### ImageCard pattern
```typescript
// components/cards/ImageCard.tsx — EXISTING
<ImageCard
  imageUrl="https://..."
  title="Train"
  subtitle="Upper Push · 45min"
  badge="HOY"
  badgeColor="#6D00FF"
  onPress={() => {}}
/>
```

#### Animation pattern
```typescript
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withDelay, Easing
} from 'react-native-reanimated';

const DURATIONS = { micro: 150, short: 300, medium: 600, long: 1000 };
```

#### Store pattern
```typescript
// CORRECT: read primitives, compute inline
const meals = useNutritionStore(s => s.todayMeals);
const totalProtein = useMemo(() => meals.reduce((sum, m) => sum + m.protein, 0), [meals]);

// WRONG: never call methods in selectors
// const totals = useNutritionStore(s => s.getDailyTotals()); ← INFINITE LOOP
```

### SVG Body Map Implementation Notes

Use `react-native-svg` (already installed). Each muscle group is a `<Path>` with:
```typescript
import Svg, { Path, G } from 'react-native-svg';

<Svg viewBox="0 0 300 500">
  <G>
    <Path
      d="M..." // SVG path data for chest
      fill={colorMap.chest || '#2A2A3E'}
      onPress={() => onMusclePress('chest')}
    />
  </G>
</Svg>
```

SVG path data for human body silhouette: use simplified anatomical paths (not photo-realistic). 12-15 paths per view. Clean, geometric style matching the app's minimal aesthetic.

### Coach Notes Query Pattern

```typescript
// In useCoachStore.ts
const fetchLatestNote = async () => {
  const { data } = await supabase
    .from('coach_notes')
    .select('*')
    .eq('user_id', userId)
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  // ...
};
```

---

## 6. Validation

### After Each Sprint

```bash
# Type check
npx tsc --noEmit

# Run tests
npm test

# Start dev server and verify visually
npm start
```

### Sprint D Checklist
- [ ] Library screen renders 2-column grid of ExerciseMediaCards
- [ ] MuscleGroupFilter shows 7 groups + "Todos"
- [ ] Search filters results in real-time
- [ ] Each card shows correct gradient per muscle group
- [ ] Play icon overlay visible on all cards
- [ ] "Ver Librería Completa" button visible in Train tab
- [ ] No regressions in existing screens

### Sprint E Checklist
- [ ] Body map renders anterior view by default
- [ ] Swipe to posterior view works
- [ ] Muscles colored correctly based on training data
- [ ] Tap muscle → detail panel slides up
- [ ] Detail panel shows season-contextual data
- [ ] Mood selector popup registers selection correctly (BUG FIX)
- [ ] Haptic feedback on mood selection
- [ ] Recovery metrics row shows 3 metrics

### Sprint F Checklist
- [ ] Photo gallery renders 3-column grid
- [ ] Photos grouped by season phase with headers
- [ ] Category filter chips work (Frente, Lateral, Espalda, Todas)
- [ ] PhotoComparator: select 2 photos, slider comparison works
- [ ] coach_notes table created in Supabase
- [ ] Coach note card renders in Home when note exists
- [ ] Unread indicator pulses on avatar
- [ ] Tap note → expand + mark read

### Sprint G Checklist
- [ ] SeasonBadge visible on Train, Track, Mind tabs
- [ ] GENESIS branding in Home is violet/white (not cyan)
- [ ] 12-week progress bar renders correctly
- [ ] Workout cards have muscle group icons + gradient accent
- [ ] Meal category icons appear in Fuel
- [ ] Macro mini-bars show below numbers
- [ ] MicroSparkline renders trends in Track metrics
- [ ] Camera button prominent in Fuel
- [ ] "Hoy" cards in Home have NO background images
- [ ] "Aprende Hoy" cards have gradient placeholders

---

## 7. Existing Component Inventory (DO NOT recreate)

These already exist and should be reused:

| Component | Location | Usage in this phase |
|-----------|----------|---------------------|
| GlassCard | `components/ui/` | Base for all new cards |
| ImageCard | `components/cards/` | "Aprende Hoy", education |
| Pill / PillBadge | `components/ui/` | Muscle group tags, SeasonBadge base |
| ProgressBar | `components/ui/` | Extend pattern for macro bars |
| AnimatedProgressRing | `components/ui/` | Keep in Fuel |
| SeasonHeader | `components/ui/` | Keep existing, add SeasonBadge alongside |
| ScreenHeader | `components/ui/` | Keep as-is |
| ScoreCard | `components/ui/` | Add sparkline below value |
| EmptyState | `components/ui/` | Use for empty library results |
| ShimmerEffect / SkeletonCard | `components/loading/` | Loading states for new sections |
| MoodSelector | `components/wellness/` or `components/ui/` | Fix bug, add haptics |
| ProgressPhotos | `components/tracking/` | Refactor into PhotoGallery |
| PRCelebration | `components/training/` | Keep as-is |
| GenesisFAB | `components/genesis/` | Keep as-is |

---

## Appendix

### A. Reference Images
Screenshots of Hevy, Muscle Booster, JEFIT, and modern Dribbble fitness app concepts were analyzed. Key patterns extracted: 2-column exercise grids with gradient overlays, SVG body maps with color-coding, before/after photo sliders, season/program progress indicators, coach communication channels.

### B. Dependencies from observations file
- GENESIS branding color fix (cyan → violet) ✅ Sprint G
- Exercise library — INDISPENSABLE ✅ Sprint D
- Camera in TRAIN for equipment ✅ Already exists, visibility improved Sprint D
- Camera in FUEL for food ✅ Sprint G
- Coach notes ✅ Sprint F
- Recovery muscle clickeable ✅ Sprint E
- Mood selector bug ✅ Sprint E
- Progress photos buttons modernization ✅ Sprint F

### C. Changelog
| Date | Author | Changes |
|------|--------|---------|
| 2026-02-15 | Aldo + Claude | Initial version from brainstorming session |
