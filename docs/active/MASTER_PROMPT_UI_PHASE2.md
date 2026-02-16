# Master Prompt: GENESIS UI Phase 2 — "Visual Density"

## Context

You are implementing **GENESIS UI Phase 2 — "Visual Density"**, upgrading a premium AI fitness coaching app from a functional dark-mode prototype to a visually rich, media-dense experience comparable to Hevy, Muscle Booster, and WHOOP.

**Your Role**: Senior React Native developer with expertise in SVG, animations (react-native-reanimated), and premium mobile UI. You're upgrading an existing, working codebase — NOT building from scratch.

**Project Stage**: Active development — 4 sequential sprints (D→E→F→G)

**CRITICAL RULE**: The app is an Expo SDK 54 / React Native 0.81 project. The 12-week training SEASON is the central concept — every UI element must connect to the user's season journey (phase, week, progress). GENESIS (AI) + Aldo (human coach) = NGX HYBRID model. The app must reflect this at all times.

---

## Current State

### Repository Status
- **Status**: In-progress (UI Phase 1 Sprints A/B/C completed, core app fully functional)
- **Branch**: `main` (start each sprint from main)
- **Existing tests**: Jest (~45 tests), Pytest (~122 BFF tests)

### Environment
- **Dependencies**: All installed (reanimated, expo-image, expo-linear-gradient, react-native-svg, lucide-react-native, expo-haptics, zustand)
- **Config**: Configured and working
- **Dev server**: `npm start` works

### Blocking Issues
- None — codebase is stable

---

## Mission

Execute 4 sequential UI sprints (D→E→F→G) that add visual media density to the GENESIS app. Each sprint runs on its own git branch for clean rollback. After each sprint: verify with `npm test && npx tsc --noEmit`, then merge to main before starting the next sprint.

---

## Pre-Execution: Read These Files First

Before writing ANY code, read these files to understand the project:

```
MUST READ (in this order):
1. ./CLAUDE.md                              — Full project context, architecture, patterns
2. ./docs/active/PRD-UI-PHASE2-VISUAL-DENSITY.md — Complete PRD for this phase (your blueprint)
3. ./constants/colors.ts               — Design tokens (you'll extend this)
4. ./constants/theme.ts                — Spacing/sizing tokens
5. ./components/ui/GlassCard.tsx       — Base card pattern to follow
6. ./components/cards/ImageCard.tsx     — Image card pattern
7. ./app/(tabs)/train.tsx              — Train tab (modified in D, G)
8. ./app/(tabs)/mind.tsx               — Mind tab (modified in E)
9. ./app/(tabs)/track.tsx              — Track tab (modified in F, G)
10. ./app/(tabs)/home.tsx              — Home tab (modified in F, G)
11. ./app/(tabs)/fuel.tsx              — Fuel tab (modified in G)
12. ./app/(screens)/library.tsx        — Exercise library (redesigned in D)
13. ./stores/useTrainingStore.ts       — Training data store
14. ./stores/useWellnessStore.ts       — Wellness data store
15. ./stores/useTrackStore.ts          — Track/progress store
16. ./components/tracking/ProgressPhotos.tsx — Current progress photos (refactored in F)
```

---

## Execution Strategy

### Use Agents and Parallel Work

You have access to subagents (Task tool) and parallel execution. Use them strategically:

**Per Sprint Pattern:**
1. **Read phase**: Read all relevant files for the sprint (use parallel reads)
2. **Implement phase**: Create new components first (can be parallel if independent), then integrate into screens (sequential)
3. **Verify phase**: Run `npm test && npx tsc --noEmit` and fix any issues
4. **Commit phase**: Git add, commit with descriptive message, merge to main

**Parallelizable within sprints:**
- Sprint D: D1+D2+D3+D4 (independent components) → D5+D6 (integration) → D7+D8 (config) → D9 (verify)
- Sprint E: E1+E2 (SVG paths, independent) → E3+E4 (wrappers) → E5 (store) → E6+E7 (integration) → E9 (verify)
- Sprint F: F1+F2+F3 (photo components, independent) + F5+F6 (backend, independent) → F4+F7+F8 (integration) → F10 (verify)
- Sprint G: G1+G2+G3+G5+G6+G7+G8+G9 (many independent tasks) → G4+G10+G11+G12 (integration) → G13 (verify)

### Context Window Management

Each sprint should be a focused session. If context grows large:
- Use subagents for component creation (they get fresh context)
- Keep the main thread for integration and verification
- Don't re-read files you've already read unless modifying them

---

## Sprint D — Exercise Library + Media System

### Branch: `ui-phase2-sprint-D`

```bash
git checkout main && git checkout -b ui-phase2-sprint-D
```

### Task D1: MuscleGroupIcon Component
**Goal**: Create 7 SVG mini-icons for muscle groups
**File**: `components/exercise/MuscleGroupIcon.tsx`
**Details**:
- Props: `group: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio'`, `size?: number` (default 24), `color?: string` (default white)
- Each icon: simplified muscle silhouette, stroke style, strokeWidth 1.5
- Use `react-native-svg` (Svg, Path, Circle, etc.)
- Keep paths simple — geometric/minimal, NOT anatomically detailed
- Export a `MUSCLE_GROUPS` array with `{ id, label, icon }` for reuse

### Task D2: MuscleGroupFilter Component
**Goal**: Horizontal scrollable filter chips
**File**: `components/exercise/MuscleGroupFilter.tsx`
**Details**:
- Horizontal `ScrollView` with `showsHorizontalScrollIndicator={false}`
- First chip: "Todos" (always present)
- Each chip: `MuscleGroupIcon` (16px) + label text (Inter 13)
- Selected: `#6D00FF` background (15% opacity), white text, violet border
- Unselected: `surfaceGlass` background, `textSecondary` color
- Props: `selected: string | null`, `onSelect: (group: string | null) => void`
- Gap between chips: 8px, padding horizontal: 20px (screenPad)
- Haptic feedback on selection (`Haptics.selectionAsync()`)

### Task D3: ExerciseMediaCard Component
**Goal**: Media-rich exercise card with gradient background
**File**: `components/exercise/ExerciseMediaCard.tsx`
**Details**:
- Aspect ratio 4:3 (use `aspectRatio: 4/3` style)
- Background: `LinearGradient` using `muscleGradients[exercise.muscleGroup]` from colors.ts
- Center: `MuscleGroupIcon` at 48px, white, 60% opacity
- Play icon overlay: triangle (Lucide `Play` icon), top-right, 30% opacity white, 24px — indicates future video support
- Bottom overlay: dark gradient (`transparent` → `rgba(0,0,0,0.7)`)
  - Exercise name: Inter Bold 14, white
  - Muscle group: `Pill` component with muscle group label
- Border radius: 16px, overflow hidden
- Props: `exercise: Exercise`, `onPress: () => void`
- onPress → navigate to exercise-detail screen
- `Pressable` with scale animation (0.97 on press)

### Task D4: ExerciseSearchBar Component
**Goal**: Glassmorphic search input
**File**: `components/exercise/ExerciseSearchBar.tsx`
**Details**:
- Glass background (`surfaceGlass`), border (`borderSubtle`), borderRadius 12
- Left icon: `Search` from lucide (20px, `textMuted`)
- TextInput: Inter 14, `textPrimary`, placeholder "Buscar ejercicios..." in `textMuted`
- Focus state: border color → `borderActive` (#6D00FF glow)
- Right icon: `X` from lucide (clear button, only visible when text exists)
- Props: `value: string`, `onChangeText: (text: string) => void`
- Height: 44px

### Task D5: Redesign Library Screen
**Goal**: Transform basic list into premium 2-column grid
**File**: `app/(screens)/library.tsx`
**Details**:
- Redesign, NOT rewrite — preserve existing navigation and data fetching
- Layout (top to bottom):
  1. `ScreenHeader` with "Librería de Ejercicios" title
  2. `ExerciseSearchBar`
  3. `MuscleGroupFilter`
  4. Results count: "{n} ejercicios" (Inter 12, textMuted, left-aligned)
  5. `FlatList` with `numColumns={2}`, columnWrapperStyle gap 12
  6. `EmptyState` when filtered results = 0
- Data: from `useTrainingStore` → `exerciseCatalog`
- Filtering: combine search text + muscle group filter
- Item separator/gap: 12px
- contentContainerStyle: paddingHorizontal 20 (screenPad)

### Task D6: Library Access in Train Tab
**Goal**: Add navigation link to library
**File**: `app/(tabs)/train.tsx`
**Details**:
- Add after today's workout section (or after exercise list)
- Text: "Ver Librería Completa →"
- Style: Inter Medium 14, `textSecondary`, center-aligned
- onPress: `router.push('/library')`
- Wrapped in `Pressable` with opacity feedback

### Task D7: Add New Color Constants
**Goal**: Extend design tokens
**File**: `constants/colors.ts`
**Details**:
- Add `muscleGradients` object (7 gradient pairs as specified in PRD section 3.2)
- Add `bodyMap` object (4 states: inactive, recovered, active, soreness)
- Add `seasonPhase` object (4 phases: adaptation, hypertrophy, strength, peaking)
- DO NOT modify any existing values — only ADD new ones

### Task D8: Barrel Export
**File**: `components/exercise/index.ts`
```typescript
export { default as MuscleGroupIcon, MUSCLE_GROUPS } from './MuscleGroupIcon';
export { default as MuscleGroupFilter } from './MuscleGroupFilter';
export { default as ExerciseMediaCard } from './ExerciseMediaCard';
export { default as ExerciseSearchBar } from './ExerciseSearchBar';
```

### Task D9: Verify
```bash
npx tsc --noEmit
npm test
# Visual: library screen shows 2-column grid, filters work, search works
```

### Commit
```bash
git add -A
git commit -m "feat(ui): Sprint D — Exercise Library + Media System

- ExerciseMediaCard with muscle group gradients and play overlay
- MuscleGroupIcon SVG set (7 groups)
- MuscleGroupFilter horizontal chips
- ExerciseSearchBar glassmorphic input
- Library screen redesigned to 2-column grid
- New color constants: muscleGradients, bodyMap, seasonPhase
- Library access link in Train tab"

git checkout main && git merge ui-phase2-sprint-D
```

---

## Sprint E — Body Map + Recovery Dashboard

### Branch: `ui-phase2-sprint-E`

```bash
git checkout main && git checkout -b ui-phase2-sprint-E
```

### Task E1: BodyMapAnterior SVG
**File**: `components/bodymap/BodyMapAnterior.tsx`
**Details**:
- SVG component with viewBox "0 0 300 500"
- Muscle group paths: chest, front_deltoids, biceps, abs, quads, hip_flexors
- Each path accepts fill color from `colorMap` prop
- Props: `colorMap: Record<string, string>`, `onMusclePress: (group: string) => void`
- Each `<Path>` wrapped in `<Pressable>` for touch handling
- Default fill: `bodyMap.inactive` (#2A2A3E)
- Style: clean geometric outlines, NOT photo-realistic
- Include a subtle body outline (stroke only, very light gray) as background reference

### Task E2: BodyMapPosterior SVG
**File**: `components/bodymap/BodyMapPosterior.tsx`
**Details**:
- Same pattern as Anterior
- Muscle groups: upper_back, lats, triceps, glutes, hamstrings, calves, rear_deltoids
- Same props interface, same colorMap pattern

### Task E3: BodyMapSVG Wrapper
**File**: `components/bodymap/BodyMapSVG.tsx`
**Details**:
- Horizontal `ScrollView` with `pagingEnabled` (or FlatList with horizontal paging)
- Two pages: BodyMapAnterior, BodyMapPosterior
- Dot indicators below (2 dots, active = `#6D00FF`, inactive = `borderSubtle`)
- Props: `muscleData: Record<string, MuscleStatus>`, `onMusclePress: (group: string) => void`
- Computes `colorMap` from `muscleData` using `bodyMap` color constants
- MuscleStatus type: `'inactive' | 'recovered' | 'active' | 'soreness'`
- Width: screen width - 2 * screenPad
- Center the SVG horizontally

### Task E4: MuscleDetailPanel
**File**: `components/bodymap/MuscleDetailPanel.tsx`
**Details**:
- Animated bottom panel (not full sheet — just a card that slides up from below the body map)
- Animation: `withSpring` slide up, 200ms feel
- Content inside GlassCard:
  - Muscle name (Inter Bold 16, white)
  - Last trained: "Hace 2 días" or "Sin actividad" (Inter 13, textSecondary)
  - Weekly volume: "12 sets esta semana" (Inter 13, textSecondary)
  - Recovery status: emoji + text ("✅ Recuperado", "🔥 Activo", "⚡ Sin actividad", "🔴 Soreness")
  - Next workout: "Próximo: Martes — Upper Pull" (data from season plan)
- Close: tap outside or swipe down
- Props: `muscle: string | null`, `onClose: () => void`, `trainingData`, `seasonData`

### Task E5: Muscle Recovery Map in Store
**File**: `stores/useWellnessStore.ts`
**Details**:
- Add method `getMuscleRecoveryMap()` — but call it from component, NOT from selector
- Logic:
  1. Get workout sessions from last 7 days (from useTrainingStore)
  2. For each session, extract which muscle groups were trained and when
  3. Cross-reference with check-in data for soreness
  4. Return status per group:
     - No training in 7 days → `inactive`
     - Trained 48h+ ago, no soreness → `recovered`
     - Trained within 48h → `active`
     - Soreness reported in latest check-in → `soreness`
- NOTE: This is a utility function, not a Zustand action. Could be a standalone function in `utils/muscleRecovery.ts` that takes training data + wellness data as params. This is SAFER for avoiding re-render loops.

### Task E6: Recovery Dashboard in Mind Tab
**File**: `app/(tabs)/mind.tsx`
**Details**:
- Find existing recovery section and upgrade it (don't remove other Mind content)
- Add new section:
  1. SectionLabel: "Recovery Status" with Activity icon (lucide)
  2. BodyMapSVG component with muscleData from recovery map utility
  3. Below body map: 3 mini-metric row in horizontal layout:
     - "Grupos activos" (count of active/recovered groups)
     - "Recovery Score" (% of recovered vs total trained)
     - "Próximo descanso" (days until next rest day from season plan)
  4. Each metric: GlassCard, number (Inter Bold 20, primary), label (Inter 12, textSecondary)
- MuscleDetailPanel renders when a muscle is tapped (overlay, absolute positioned)

### Task E7: Fix Mood Selector Bug
**Files**: `app/(tabs)/mind.tsx` + locate MoodSelector component (check `components/wellness/MoodSelector.tsx` or `components/ui/MoodSelector.tsx`)
**Details**:
- Bug: Mood popup opens but selection doesn't register
- Debug: Check if onSelect callback properly updates state, check if state persistence works
- Fix: Ensure selected mood persists in useWellnessStore
- Enhancement: Add `Haptics.selectionAsync()` on each mood tap
- Enhancement: Selected mood gets colored circular background (use mood colors from colors.ts) + subtle glow shadow

### Task E8: Barrel Export
**File**: `components/bodymap/index.ts`

### Task E9: Verify
```bash
npx tsc --noEmit
npm test
# Visual: body map renders, swipe works, tap shows detail, mood selector works
```

### Commit
```bash
git add -A
git commit -m "feat(ui): Sprint E — Body Map + Recovery Dashboard

- BodyMapSVG with anterior/posterior views and swipe navigation
- Dynamic color-mapping from training data (active/recovered/soreness)
- MuscleDetailPanel bottom sheet with season-contextual stats
- Recovery dashboard with 3 mini-metrics in Mind tab
- Muscle recovery utility function
- Fixed mood selector bug + added haptic feedback"

git checkout main && git merge ui-phase2-sprint-E
```

---

## Sprint F — Progress Photos + Coach Notes

### Branch: `ui-phase2-sprint-F`

```bash
git checkout main && git checkout -b ui-phase2-sprint-F
```

### Task F1: PhotoGallery Component
**File**: `components/photos/PhotoGallery.tsx`
**Details**:
- FlatList with `numColumns={3}`
- Each photo: aspect ratio 3:4, borderRadius 12, overflow hidden
- Date overlay: absolute bottom-left, JetBrains Mono 10, white with dark shadow
- Section headers: season phase name ("Fase 1: Adaptación") — use SectionList or custom headers
- Category filter chips at top: "Todas", "Frente", "Lateral", "Espalda" — use same chip pattern as MuscleGroupFilter
- Props: `photos: Photo[]`, `seasonPhases: Phase[]`, `onPhotoPress`, `onComparePress`
- Gap between photos: 4px (tight grid)
- Padding: screenPad horizontal

### Task F2: PhotoCaptureButton
**File**: `components/photos/PhotoCaptureButton.tsx`
**Details**:
- 44px circle, absolute bottom-right (bottom: 20, right: 20)
- LinearGradient background (`#6D00FF` → `#8B5CF6`)
- Camera icon (lucide, 20px, white)
- Shadow: `0 0 20px rgba(109,0,255,0.4)`
- onPress → trigger image picker (reuse existing logic from Track tab)
- Pressable with scale animation

### Task F3: PhotoComparator Component
**File**: `components/photos/PhotoComparator.tsx`
**Details**:
- Full-screen modal or overlay
- Selection mode: user taps 2 photos in gallery (check icon overlay, violet border)
- Comparison view:
  - Two photos side-by-side, equal width
  - Vertical divider line in center (2px, white, with handle circle 24px)
  - PanGestureHandler on divider — dragging left/right changes width ratio
  - Left photo clips from left, right photo clips from right
- Below photos:
  - "Semana 2 → Semana 9" with arrow (Inter 14, textSecondary)
  - Phase labels for each photo
- Header: "Comparar Progreso" + close (X) button
- KEEP IT SIMPLE: If gesture handling is complex, start with a static 50/50 split and iterate

### Task F4: Integrate in Track Tab
**File**: `app/(tabs)/track.tsx`
**Details**:
- Replace current ProgressPhotos usage with PhotoGallery
- Add "Comparar" button in section header (right-aligned, text button, violet)
- Preserve existing photo upload and delete functionality
- Capture button floats over gallery

### Task F5: Supabase Migration for coach_notes
**Details**:
- Create migration (use Supabase MCP `apply_migration` if available, otherwise create SQL file)
- Table definition from PRD section 3.4:
```sql
CREATE TABLE IF NOT EXISTS public.coach_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID DEFAULT NULL,
  message TEXT NOT NULL,
  title VARCHAR(100) DEFAULT NULL,
  phase_context VARCHAR(50) DEFAULT NULL,
  read_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.coach_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notes" ON public.coach_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own notes read_at" ON public.coach_notes
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_coach_notes_user_unread
  ON public.coach_notes(user_id, created_at DESC)
  WHERE read_at IS NULL;
```
- Insert a test note for development:
```sql
-- Only if you have a test user_id available
-- INSERT INTO public.coach_notes (user_id, message, title, phase_context)
-- VALUES ('TEST_USER_UUID', 'Excelente trabajo esta semana. Tu volumen de entrenamiento subió 12%. Mantén el ritmo en la Fase 2.', 'Progreso Semanal', 'Fase 2: Hipertrofia');
```

### Task F6: Create useCoachStore
**File**: `stores/useCoachStore.ts`
**Details**:
- Follow exact same Zustand patterns as other stores in the project
- Interface:
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
  isLoading: boolean;
  error: string | null;
  fetchLatestNote: (userId: string) => Promise<void>;
  fetchAllNotes: (userId: string) => Promise<void>;
  markAsRead: (noteId: string) => Promise<void>;
}
```
- Use supabase client from `services/supabaseClient.ts`
- Graceful degradation: if table doesn't exist or query fails → set latestNote to null, no crash
- Use `hasSupabaseConfig` guard pattern from other stores

### Task F7: CoachNotes Component
**File**: `components/coach/CoachNotes.tsx`
**Details**:
- GlassCard container
- Left: Avatar circle (44px) with gradient background (#6D00FF → #8B5CF6), initials "AO" (Inter Bold 16, white)
  - If `hasUnread`: pulsing violet dot (8px) at top-right of avatar (animated opacity loop)
- Right of avatar:
  - "Nota de tu Coach" (Inter Bold 14, textPrimary)
  - Timestamp: "hace 2 horas" (JetBrains Mono 11, textMuted) — use relative time
- Below header: message text (Inter 14, textSecondary), maxLines 3
- If message exceeds 3 lines: "Ver más" link (violet, Inter 12)
- onPress → expand to full message + call `markAsRead(noteId)`
- Animated expand: `withTiming` height change

### Task F8: Add CoachNotes to Home
**File**: `app/(tabs)/home.tsx`
**Details**:
- Place BELOW GENESIS briefing card, ABOVE "Hoy" section
- Conditional render: only when `latestNote !== null`
- Fetch on mount: call `fetchLatestNote(userId)` in useEffect
- When no notes → nothing renders (no empty state for this section)

### Task F9: Barrel Exports
**Files**: `components/photos/index.ts`, `components/coach/index.ts`

### Task F10: Verify
```bash
npx tsc --noEmit
npm test
# Visual: photo gallery in Track, coach notes in Home
```

### Commit
```bash
git add -A
git commit -m "feat(ui): Sprint F — Progress Photos + Coach Notes

- PhotoGallery 3-column grid with phase grouping
- PhotoComparator before/after slider comparison
- PhotoCaptureButton floating camera button
- coach_notes Supabase table with RLS
- useCoachStore for coach notes state
- CoachNotes component in Home tab
- Reinforces NGX HYBRID positioning (AI + human coach)"

git checkout main && git merge ui-phase2-sprint-F
```

---

## Sprint G — Visual Media Layer + Polish Final

### Branch: `ui-phase2-sprint-G`

```bash
git checkout main && git checkout -b ui-phase2-sprint-G
```

### Task G1: Workout Cards Gradient Accent
**File**: `app/(tabs)/train.tsx`
**Details**:
- Each exercise row in today's workout gets a subtle gradient left-border (3px wide) based on session type
- Map: Upper Push → chest gradient, Lower → legs gradient, Upper Pull → back gradient, Full Body → fullbody gradient
- Add `MuscleGroupIcon` (16px, textSecondary) to left of exercise name
- Keep existing layout — only ADD visual accents, don't restructure

### Task G2: Season Context in Train
**File**: `app/(tabs)/train.tsx`
**Details**:
- Add text below SeasonHeader: "Semana {n} de 12 · Fase {n}: {name}"
- Use `seasonPhase` color for the phase name portion
- Inter 13, textSecondary for "Semana X de 12 ·", then phase color for phase name

### Task G3: SeasonBadge Component
**File**: `components/ui/SeasonBadge.tsx`
**Details**:
- Compact pill: "S{n} · Sem {week} · {PhaseName}"
- Background: seasonPhase color at 12% opacity
- Text: seasonPhase color, JetBrains Mono 11, fontWeight 600
- Border: seasonPhase color at 25% opacity, 1px
- BorderRadius: 8px, paddingHorizontal 10, paddingVertical 4
- Props: `seasonNumber: number`, `week: number`, `phaseName: string`, `phaseKey: string`

### Task G4: Add SeasonBadge to Tabs
**Files**: `app/(tabs)/train.tsx`, `app/(tabs)/track.tsx`, `app/(tabs)/mind.tsx`
**Details**:
- Place in header area of each tab (near ScreenHeader or SeasonHeader)
- Consistent positioning — top-right or below title
- Data from useSeasonStore

### Task G5: GENESIS Branding Fix
**File**: `app/(tabs)/home.tsx`
**Details**:
- Find "GENESIS" text in the main briefing card
- Change color from cyan/aqua to white (#FFFFFF) or primary (#6D00FF)
- Font: JetBrains Mono Bold with letterSpacing 1.5
- Keep rest of card structure intact

### Task G6: Season Progress Bar
**File**: `app/(tabs)/home.tsx`
**Details**:
- New component inline or separate: horizontal bar with 12 segments
- Each segment: rounded rectangle (flex: 1, height: 6, borderRadius: 3)
- Completed weeks: solid `primaryLight` (#9D4EDD)
- Current week: solid `primary` (#6D00FF) with subtle pulse animation (opacity 0.7 ↔ 1.0, 2s loop)
- Future weeks: `borderSubtle` (rgba(255,255,255,0.08))
- Gap between segments: 3px
- Place near top of Home, below greeting, above other content
- Label below: "Semana {n} de 12" (JetBrains Mono 11, textMuted, center)

### Task G7: Meal Category Icons
**File**: `app/(tabs)/fuel.tsx`
**Details**:
- Each logged meal card gets a category icon to the left of meal name:
  - Desayuno → `Sun` (lucide)
  - Almuerzo → `Clock` (lucide)
  - Cena → `Moon` (lucide)
  - Snack → `Zap` (lucide)
- Icon: 20px, textSecondary color
- Determine category from meal time or meal.category field

### Task G8: Macro Mini-Bars
**File**: `app/(tabs)/fuel.tsx`
**Details**:
- Below each macro number (protein/carbs/fat), add thin progress bar
- Height: 4px, borderRadius: 2
- Width: fills available space (same width as the number area)
- Color: protein=#38bdf8, carbs=#00F5AA, fat=#F97316 (from existing macro colors)
- Fill: percentage of daily target
- Background: borderSubtle
- Animate fill on mount with `withTiming`

### Task G9: MicroSparkline Component
**File**: `components/ui/MicroSparkline.tsx`
**Details**:
- SVG polyline chart: 80px wide, 24px tall
- Props: `data: number[]` (expects 7 values), `color?: string` (default primary)
- Normalize data to 0-24 range (min→max)
- Draw `<Polyline>` with points calculated from normalized data
- Stroke: 1.5px, color prop
- Optional: `<Defs><LinearGradient>` fill below polyline at 10% opacity
- No axes, no labels, no grid — just the trend shape
- If data.length < 2, render nothing

### Task G10: Sparklines in Track Metrics
**File**: `app/(tabs)/track.tsx`
**Details**:
- Each ScoreCard or metric display gets a MicroSparkline below its number
- Data source: last 7 data points from the respective metric
- If not enough data points → don't render sparkline
- Position: below the number, center-aligned

### Task G11: "Aprende Hoy" Gradient Refinement
**File**: `app/(tabs)/home.tsx`
**Details**:
- Ensure education cards in "Aprende Hoy" use themed gradient placeholders
- Map content categories to gradients (similar to muscleGradients pattern)
- **DO NOT** add background images to "Hoy" section cards (Train, Fuel, Check-in) — these stay CLEAN

### Task G12: Camera Button in Fuel
**File**: `app/(tabs)/fuel.tsx`
**Details**:
- Camera button for food scanning: same visual hierarchy as manual log button
- Both buttons visible together (side-by-side or stacked)
- Camera button: Camera icon (lucide) + small "IA" badge (PillBadge, violet, 9px)
- onPress → navigate to camera-scanner modal

### Task G13: Verify
```bash
npx tsc --noEmit
npm test
# Visual: all tabs enhanced, season badge visible, sparklines render, GENESIS branding fixed
```

### Commit
```bash
git add -A
git commit -m "feat(ui): Sprint G — Visual Media Layer + Polish Final

- SeasonBadge component on Train, Track, Mind tabs
- GENESIS branding fixed (violet/white, not cyan)
- 12-week season progress bar in Home
- Workout cards with muscle group icons and gradient accents
- Meal category icons in Fuel
- Macro mini-bars with animated fill
- MicroSparkline trend lines in Track metrics
- Camera button prominence in Fuel
- Aprende Hoy gradient refinement
- Complete Visual Density Phase 2"

git checkout main && git merge ui-phase2-sprint-G
```

---

## Constraints

### DO
- ✅ Read `CLAUDE.md` and `PRD-UI-PHASE2-VISUAL-DENSITY.md` before ANY code
- ✅ Create git branch per sprint
- ✅ Run `npm test && npx tsc --noEmit` after every sprint
- ✅ Follow existing component patterns (GlassCard, ImageCard, store patterns)
- ✅ Use `react-native-reanimated` for all animations
- ✅ Use `react-native-svg` for body map and icons
- ✅ Keep ALL text in Spanish
- ✅ Use existing color tokens and theme constants
- ✅ Use barrel exports (index.ts) for new component directories
- ✅ Add haptic feedback on interactive elements
- ✅ Compute values inline in components, never in Zustand selectors
- ✅ Use subagents for parallel component creation within each sprint
- ✅ Preserve all existing functionality

### DO NOT
- ❌ DO NOT modify `CLAUDE.md`
- ❌ DO NOT modify existing components unless explicitly specified
- ❌ DO NOT change BFF, agents, or backend (except coach_notes table in Sprint F)
- ❌ DO NOT use CSS animations or the old `Animated` API
- ❌ DO NOT add Lottie or any new animation libraries
- ❌ DO NOT use 3D/Three.js — SVG only
- ❌ DO NOT add background images to Home "Hoy" cards (Train, Fuel, Check-in)
- ❌ DO NOT change auth flow, chat logic, or agent routing
- ❌ DO NOT remove existing features or components
- ❌ DO NOT install new npm packages unless absolutely necessary (check existing deps first)
- ❌ DO NOT use hardcoded colors — always reference constants/colors.ts

### VERIFY Before Each Sprint
- [ ] On correct branch
- [ ] Previous sprint merged to main
- [ ] `npm test` passing
- [ ] `npx tsc --noEmit` clean

---

## Session Success Criteria

This session is complete when:
- [ ] Sprint D: Exercise library screen with 2-column media grid, filters, search — MERGED
- [ ] Sprint E: Interactive body map with recovery color-mapping in Mind tab, mood bug fixed — MERGED
- [ ] Sprint F: Photo gallery with phase grouping + comparator, coach notes in Home — MERGED
- [ ] Sprint G: Season badge, sparklines, macro bars, GENESIS branding fix, visual polish — MERGED
- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] All 4 sprint branches merged to main
- [ ] No regressions in existing functionality

---

## Notes

- If SVG body map paths are complex, use a simplified geometric style (not anatomical accuracy). Performance > visual fidelity for v1.
- The PhotoComparator slider is ambitious. If gesture handling proves too complex, ship a static 50/50 split first and iterate.
- Coach notes table will be empty until populated manually or via GENESIS BRAIN (Sprint 6). The component must handle empty state gracefully.
- Season data may not always be available (new users). All season-dependent UI must have fallbacks.
- MuscleGroupIcon SVGs don't need to be pixel-perfect — clean, minimal, consistent.
