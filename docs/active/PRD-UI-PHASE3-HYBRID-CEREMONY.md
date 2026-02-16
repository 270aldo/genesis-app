# GENESIS App UI Phase 3 — "HYBRID Ceremony" — Product Requirements Document

## TL;DR

Transform GENESIS from a data-driven fitness app into an emotionally engaging coaching experience. Three sequential mini-sprints (H→I→J) add: (1) a Coach Presence System making the human coach (Aldo) visible throughout the app, (2) Season Ceremonies that turn the 12-week journey into a narrative experience, and (3) Phase-Aware Content that makes GENESIS Academy intelligent. All Supabase migrations are ALREADY APPLIED (`coach_notes` table with `type` column, `coach_reviewed` + `coach_reviewed_at` columns on `sessions` and `check_ins` tables). Each sprint is isolated on its own git branch for clean rollback.

---

## 1. Problem Statement

### The Problem
GENESIS completed UI Phase 2 (Sprints D/E/F/G: exercise library, body map, progress photos, visual media layer) but the $299/mo HYBRID model (AI + human coach) isn't tangible in the UI. Users cannot see evidence that a real coach reviews their work. The 12-week season feels like a counter, not a journey. Education content is static, not aware of the user's current phase. Competitors like Future ($199/mo) and Caliber ($300/mo) make coach interaction central to their UX — visibility of human feedback is a key retention lever.

### Current State
- `coach_notes` table exists with `type` column (`observation`, `encouragement`, `adjustment`, `milestone`)
- `sessions` table has `coach_reviewed` + `coach_reviewed_at` columns (migrations applied)
- `check_ins` table has `coach_reviewed` + `coach_reviewed_at` columns (migrations applied)
- `SeasonBadge` exists showing phase/week in Phase 2
- `PRCelebration` exists for personal records (confetti + haptic pattern, reusable)
- Education has 6 articles with `phase_tags`, `category`, `difficulty`
- Home tab has 11 sections with staggered entrance animations
- `useAnimatedCounter` hook exists for number animations

### Target Users
Adults 30-60 paying $299/mo for NGX HYBRID. They need to FEEL that their investment includes a real human coach who reviews their progress, and that their 12-week season is a meaningful journey — not just a workout tracker. They want to see evidence of coaching and celebrate milestones narratively.

---

## 2. Solution Overview

### Approach
Three mini-sprints, each on its own git branch, each independently testable and revertible. Sprint H is foundational (coach presence), I adds narrative (season ceremonies), J makes education smart.

### Key Components
1. **Coach Presence System** (Sprint H): Coach avatar + note badges, history modal, review badges on workouts/check-ins, visual proof of coaching
2. **Season Ceremonies** (Sprint I): Phase briefing on phase change, weekly wrap cards, season finale cinematic screen with confetti + cascade animations
3. **Phase-Aware Content** (Sprint J): Education articles reranked by current phase, read/unread tracking, Home suggests relevant content, visual indicators

### Human-First Design Principle
Every element in Phase 3 reinforces the human coaching relationship. Coach notes are prominent and typed (observation/encouragement/adjustment/milestone). Seasons are marked with ceremonies. Content adapts to the user's phase. Nothing is generic — everything says "your coach is watching and adapting for you."

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
| AsyncStorage | expo-async-storage | For client state persistence |
| Icons | lucide-react-native | Already installed |
| Haptics | expo-haptics | Already installed |

### 3.2 Design System Tokens (reuse from Phase 2)

```typescript
// constants/colors.ts — EXISTING VALUES REUSED
primary: '#6D00FF'              // Coach badge, review indicators
success: '#00F5AA'              // Season complete, milestones
warning: '#FFD93D'              // Phase transitions
info: '#00D4FF'                 // Coach observations
error: '#FF6B6B'                // Coach adjustments
textSecondary: '#FFFFFF99'      // Dimmed text

// Season phase colors (from Phase 2)
seasonPhase: {
  adaptation:  '#00F5AA',       // mint
  hypertrophy: '#00D4FF',       // cyan
  strength:    '#6D00FF',       // violet
  peaking:     '#FFD93D',       // gold
}

// Coach note type colors (NEW — add to colors.ts)
coachNoteTypes: {
  observation:     '#00D4FF',   // info cyan
  encouragement:   '#FFD93D',   // warning gold
  adjustment:      '#FF6B6B',   // error red
  milestone:       '#00F5AA',   // success mint
}
```

### 3.3 New Component Architecture

All new components go in existing/new directories:

```
components/
├── coach/                       # NEW directory — Sprint H
│   ├── CoachNotes.tsx           # Coach notes card for Home (MODIFY)
│   ├── CoachNotesHistory.tsx    # History modal + filter
│   └── CoachReviewBadge.tsx     # Badge for workouts/check-ins
├── season/                      # NEW directory — Sprint I
│   ├── PhaseBriefing.tsx        # Modal on phase change
│   ├── WeeklyWrap.tsx           # Weekly summary card
│   └── SeasonComplete.tsx       # Finale cinematic screen
├── education/                   # NEW directory — Sprint J
│   └── ReadIndicator.tsx        # Unread dot on articles
├── coaching/                    # NEW directory — Celebrations
│   └── ConfettiSystem.tsx       # Reuse from PRCelebration pattern
└── [existing ui/, tracking/, etc.]
```

### 3.4 Data Model Changes

#### ALREADY MIGRATED (DO NOT RECREATE)

```sql
-- coach_notes table — ALREADY EXISTS
-- columns: id, user_id, coach_id, message, type, reference_type, reference_id, read, created_at
-- type values: 'observation', 'encouragement', 'adjustment', 'milestone'

-- sessions table — ALREADY MODIFIED
-- added: coach_reviewed (boolean, default false)
-- added: coach_reviewed_at (timestamptz)

-- check_ins table — ALREADY MODIFIED
-- added: coach_reviewed (boolean, default false)
-- added: coach_reviewed_at (timestamptz)
```

#### Client-Side Persistence (NEW)

AsyncStorage keys for dismissals and read tracking:
- `genesis_lastSeenPhase` — phase number (triggers phase briefing)
- `genesis_weeklyWrap_{weekNum}` — boolean (dismisses weekly wrap)
- `genesis_readArticles` — JSON array of article IDs
- `genesis_seasonComplete_{seasonNum}` — boolean (marks season complete seen)

### 3.5 Store Changes

#### `useCoachStore.ts` (NEW — full definition)

```typescript
interface CoachNote {
  id: string;
  message: string;
  type: 'observation' | 'encouragement' | 'adjustment' | 'milestone';
  referenceType?: string;
  referenceId?: string;
  read: boolean;
  createdAt: string;
}

interface CoachStore {
  // Latest note (displayed in Home)
  latestNote: CoachNote | null;

  // All notes (displayed in history modal)
  allNotes: CoachNote[];

  // Filter state for history modal
  filterType: 'all' | 'observation' | 'encouragement' | 'adjustment' | 'milestone';

  // Methods
  fetchLatestNote: () => Promise<void>;
  fetchAllNotes: () => Promise<void>;
  markAsRead: (noteId: string) => Promise<void>;
  setFilterType: (type: typeof filterType) => void;
}
```

#### `useSeasonStore.ts` (MODIFY)

```typescript
// Add new method (compute inline, never in selector):
// getCurrentPhase(): 'adaptation' | 'hypertrophy' | 'strength' | 'peaking'
// Returns phase based on currentWeek (e.g., weeks 1-3 = adaptation, etc.)

// This is NOT a Zustand selector — it's a helper function
export const getCurrentPhase = (week: number): Season['phase'] => {
  if (week <= 3) return 'adaptation';
  if (week <= 6) return 'hypertrophy';
  if (week <= 9) return 'strength';
  return 'peaking';
};
```

#### `useEducationStore.ts` (MODIFY)

```typescript
interface EducationStore {
  // Existing
  articles: EducationArticle[];

  // NEW
  readArticleIds: string[];

  // NEW methods
  getPhaseRankedArticles: () => Promise<EducationArticle[]>;
    // Ranks by: currentPhase match, adjacent phase, rest
    // Within each group: by difficulty match to user level
    // NOT a selector — computed function

  markAsRead: (articleId: string) => Promise<void>;
  isRead: (articleId: string) => boolean;
}
```

---

## 4. Scope Definition

### 4.1 Sprint H — Coach Presence System

| ID | Task | Files | Acceptance Criteria |
|----|------|-------|---------------------|
| H1 | Upgrade CoachNotes card | `components/coach/CoachNotes.tsx` (MODIFY from Phase 2) | Replace MessageCircle icon with coach avatar (circular 36px, "AO" initials, background #6D00FF). Add type badge next to "Nota del Coach" label: observation (Eye icon #00D4FF), encouragement (Flame #FFD93D), adjustment (SlidersHorizontal #FF6B6B), milestone (Trophy #00F5AA). Add "Ver historial →" CTA at bottom (Pressable, primary color, fontSize 11). |
| H2 | Create CoachNotesHistory modal | `app/(modals)/coach-notes-history.tsx` (NEW) | Header "Notas de tu Coach" + back button. Filter pills: horizontal scroll (Todas, Observaciones, Ajustes, Logros, Motivación) with icons. Timeline FlatList of notes as GlassCards with left icon, center message+date, right unread dot. Empty state illustration. Animations: useStaggeredEntrance (120ms delay). |
| H3 | Create CoachReviewBadge component | `components/coach/CoachReviewBadge.tsx` (NEW) | Compact pill (height 22px, paddingHorizontal 8px): CheckCircle icon (12px, #6D00FF) + "Revisado por Coach" text (fontSize 9, JetBrainsMono, #FFFFFF99). Border 1px #6D00FF33. Background #6D00FF10. Props: `visible: boolean` (only renders when true). |
| H4 | Plant CoachReviewBadge in 3 locations | `app/(tabs)/train.tsx`, `app/(tabs)/home.tsx`, `app/(screens)/active-workout.tsx` (MODIFY) | H4a: Below today's workout card header (only shows if coach_reviewed === true). H4b: Inside weekly progress section in Home (only shows if applicable). H4c: In post-workout summary in active-workout screen (only shows if applicable). CRITICAL: Only render when real data present (coach_reviewed from DB). |
| H5 | Create useCoachStore | `stores/useCoachStore.ts` (NEW) | Zustand store per 3.5 spec. Methods: fetchLatestNote (single latest unread note), fetchAllNotes (all notes ordered by date), markAsRead (updates read column via Supabase). Include graceful error handling (no throw on network error). |
| H6 | Integrate CoachNotes in Home | `app/(tabs)/home.tsx` (MODIFY) | Add CoachNotes section below GENESIS briefing, above "Hoy" section. Only renders when useCoachStore.latestNote exists. On press, navigate to coach-notes-history modal. |
| H7 | Create barrel export | `components/coach/index.ts` (NEW) | Export: CoachNotes, CoachNotesHistory, CoachReviewBadge. |
| H8 | Verify Sprint H | — | `npm test` passes. `npx tsc --noEmit` passes. CoachNotes card renders with type badge (if notes exist in DB). CoachReviewBadge shows ONLY when coach_reviewed === true. History modal filters work. No regressions to existing screens. |

### 4.2 Sprint I — Season Ceremony

| ID | Task | Files | Acceptance Criteria |
|----|------|-------|---------------------|
| I1 | Create PhaseBriefing modal | `app/(modals)/phase-briefing.tsx` (NEW) | Fullscreen modal. Phase color bar (8px top, SEASON_PHASE_COLORS[phase]). Phase name large (fontSize 28, JetBrainsMono, white): "Fase 2: Hypertrophy". Duration: "Semanas 4-6" (fontSize 14, textSecondary). Objectives: 3-4 bullet points (data from static PHASE_DATA constant). "¿Qué cambia?" section. GENESIS motivational message. CTA: "Comenzar Fase" gradient button. Animation: fade in 300ms, slide up from 50px, spring CTA. |
| I2 | Create PHASE_DATA constant | `constants/phaseData.ts` (NEW) | Static mapping of phases to objectives, changes text, and GENESIS messages. Example structure: `{ adaptation: { objectives: [...], changes: "...", genesisMessage: "..." }, hypertrophy: {...}, strength: {...}, peaking: {...} }`. |
| I3 | Add phase briefing trigger in Home | `app/(tabs)/home.tsx` (MODIFY) | useEffect checks: if currentPhase !== lastSeenPhase (from AsyncStorage 'genesis_lastSeenPhase'), navigate to phase-briefing modal. After briefing closed, update AsyncStorage with new phase. Only triggers once per phase change. |
| I4 | Create WeeklyWrap component | `components/season/WeeklyWrap.tsx` (NEW) | GlassCard with special glow border. Header: "Resumen Semana {N}" + SeasonBadge. Stats grid 2x2: Workouts (completed/planned with useAnimatedCounter), Adherencia (% with counter), Streak (days + flame icon), PRs (count + trophy icon). Preview: "Próxima semana: {focus}" with arrow. Dismiss CTA: "Entendido" (marks as seen in AsyncStorage 'genesis_weeklyWrap_{weekNum}'). Animation: useStaggeredEntrance for stats (120ms intervals). |
| I5 | Calculate WeeklyWrap data | `stores/useSeasonStore.ts`, `stores/useTrainingStore.ts`, `stores/useWellnessStore.ts` (MODIFY) | Add computed helpers: getWeeklyStats() returns { completed, planned, adherence%, streak, prs }. Pulls from training (this week's workouts), nutrition (today's logging), wellness (streak from check-ins). Compute inline, never in selector. |
| I6 | Add WeeklyWrap to Home | `app/(tabs)/home.tsx` (MODIFY) | Show WeeklyWrap as position 3 in staggered sections (after briefing, before daily briefing). Only shows on Sunday/Monday (check day of week). Only shows if not dismissed (check AsyncStorage). Auto-dismiss after 5 days (if today > dismiss_date + 5 days). |
| I7 | Create SeasonComplete screen | `app/(screens)/season-complete.tsx` (NEW) | Fullscreen, dark background #050505. Confetti system: 40 particles, premium colors (#FFD700, #6D00FF, #00F5AA, #00E5FF, #FF6B6B), 2s duration, scale from 50px. Badge: circular gradient (120px) with season number + "COMPLETADA" text. Stats cascade (animate one-by-one, 400ms intervals, each with useAnimatedCounter): Total workouts, PRs broken, Meals logged, Longest streak, Check-ins, Weeks consistent. GENESIS message: "Has completado tu Season {N}. {personalized}". Coach message (if coach_notes exist with type=milestone and reference_type=season). CTAs: "Iniciar Nueva Season →" (gradient), "Ver Resumen Completo" (outline). Haptic on mount (heavy). |
| I8 | Add navigation trigger to season-complete | `app/(tabs)/track.tsx`, `app/(tabs)/home.tsx` (MODIFY) | Check in useEffect: if currentWeek > 12 and not seen (AsyncStorage 'genesis_seasonComplete_{seasonNum}'), navigate to season-complete screen. Triggered once per season. Can also navigate manually from Track tab via "Ver Resumen" button. |
| I9 | Create season/ barrel export | `components/season/index.ts` (NEW) | Export: WeeklyWrap (PhaseBriefing and SeasonComplete are screens, not exported here). |
| I10 | Verify Sprint I | — | `npm test` passes. `npx tsc --noEmit` passes. Phase briefing shows on phase change. Weekly wrap shows Sunday/Monday. Season complete screen renders with confetti + cascade animations. All AsyncStorage dismissals work. No regressions. |

### 4.3 Sprint J — Phase-Aware Content

| ID | Task | Files | Acceptance Criteria |
|----|------|-------|---------------------|
| J1 | Add phase-aware ranking to education store | `stores/useEducationStore.ts` (MODIFY) | New method getPhaseRankedArticles(): Promise<EducationArticle[]>. (1) Get currentPhase from getCurrentPhase(currentWeek). (2) Sort articles: phase_tags includes currentPhase → first, adjacent phases → second, rest → last. Within each group, sort by difficulty (match to user.experience_level). Returns Promise. Implement as regular function, NOT selector. |
| J2 | Add read tracking to education store | `stores/useEducationStore.ts` (MODIFY) | New state: readArticleIds: string[] (persisted in AsyncStorage 'genesis_readArticles'). New methods: markAsRead(articleId: string) (adds to array, persists), isRead(articleId: string): boolean (checks membership). Load readArticleIds on store init from AsyncStorage. |
| J3 | Update education detail screen | `app/(screens)/education-detail.tsx` (MODIFY) | On mount, call useEducationStore.markAsRead(article.id). Ensures article marked read as user views it. |
| J4 | Add read indicator to education list | `app/(screens)/education.tsx` (MODIFY) | Show small unread dot (6px circle, #6D00FF) top-right of unread article cards. Use isRead() to determine visibility. Dot has subtle pulse animation (use reanimated). |
| J5 | Update "Aprende Hoy" in Home | `app/(tabs)/home.tsx` (MODIFY) | Change header from static "APRENDE HOY" to "GENESIS recomienda para {phaseName}". Use phase color dot next to text. Articles displayed are top result from getPhaseRankedArticles() (first unread). Clicking card navigates to education-detail. |
| J6 | Create ReadIndicator component | `components/education/ReadIndicator.tsx` (NEW) | Simple component: 6px circle positioned absolute top-right. Props: `visible: boolean`. Animation: subtle pulse (opacity 0.5 → 1, 1.5s loop). Used in article cards. |
| J7 | Create education/ barrel export | `components/education/index.ts` (NEW) | Export: ReadIndicator. |
| J8 | Verify Sprint J | — | `npm test` passes. `npx tsc --noEmit` passes. Articles reorder by current phase in lists. Home "GENESIS recomienda" shows phase name + color. Read/unread indicators toggle on navigation. Read state persists across sessions (AsyncStorage). No regressions. |

### 4.4 Out of Scope

- ❌ No new Supabase tables (all migrations pre-applied)
- ❌ No BFF endpoint changes
- ❌ No ADK agent changes
- ❌ No changes to chat logic, widget rendering, agent routing
- ❌ No Lottie animations (reanimated only)
- ❌ No new npm dependencies
- ❌ No changes to tab layout or navigation structure
- ❌ No changes to onboarding or auth flow
- ❌ No breaking changes to Phase 2 work

### 4.5 Constraints

- **Preserve CLAUDE.md** — do NOT modify or delete
- **No breaking changes** — all Phase 2 functionality must continue working
- **React Native specific** — animations use `react-native-reanimated`
- **Spanish UI** — all user-facing text in Spanish
- **JetBrains Mono** for labels/badges, **Inter** for body text
- **#6D00FF** as primary accent — consistency with Phase 1/2
- **NativeWind** for simple styles, **inline `style` objects** for complex/animated layouts
- **Zustand pattern** — never call store methods inside selectors, read primitives and compute inline
- **AsyncStorage for client state** — `genesis_` prefix for all keys
- **Git branch per sprint** — `ui-phase3-sprint-H`, `ui-phase3-sprint-I`, `ui-phase3-sprint-J`
- **Test after every sprint** — `npm test && npx tsc --noEmit`
- **Real data only** — CoachReviewBadge only renders when `coach_reviewed === true` in DB. No fakes or simulated data.

---

## 5. Implementation Guide

### Git Strategy

```bash
# Before starting each sprint:
git checkout main
git pull
git checkout -b ui-phase3-sprint-[H|I|J]

# After completing and verifying each sprint:
git add -A
git commit -m "feat(ui): Sprint [H|I|J] — [description]"
git checkout main
git merge ui-phase3-sprint-[H|I|J]

# If sprint breaks something — clean rollback:
git checkout main
git branch -D ui-phase3-sprint-[X]
```

### Existing Component Patterns (FOLLOW THESE)

#### GlassCard pattern
```typescript
import { GlassCard } from '@/components/ui';

<GlassCard shadow="primary" shine>
  {children}
</GlassCard>
```

#### Animation pattern (Sprint I confetti + cascade)
```typescript
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withDelay, Easing,
  FadeIn, SlideInUp
} from 'react-native-reanimated';

// Confetti particle:
// useSharedValue for scale, opacity
// withTiming(spring) for smooth fall
// Stagger via withDelay
```

#### Store pattern (CRITICAL)
```typescript
// CORRECT: read primitives, compute inline
const currentWeek = useSeasonStore(s => s.currentWeek);
const phase = useMemo(() => getCurrentPhase(currentWeek), [currentWeek]);

// WRONG: never call methods in selectors
// const phase = useSeasonStore(s => s.getCurrentPhase()); ← INFINITE LOOP
```

#### AsyncStorage persistence pattern
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const loadReadArticles = async () => {
  const stored = await AsyncStorage.getItem('genesis_readArticles');
  return stored ? JSON.parse(stored) : [];
};

const saveReadArticles = async (ids: string[]) => {
  await AsyncStorage.setItem('genesis_readArticles', JSON.stringify(ids));
};
```

### Coach Notes Query Pattern

```typescript
// In useCoachStore.ts — fetchLatestNote
const { data, error } = await supabase
  .from('coach_notes')
  .select('*')
  .eq('user_id', userId)
  .eq('read', false)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
return data as CoachNote | null;
```

### Phase Data Constant Structure

```typescript
// constants/phaseData.ts
export const PHASE_DATA = {
  adaptation: {
    objectives: [
      'Establecer bases de movimiento',
      'Activar patrones neuromusculares',
      'Incrementar capacidad de trabajo'
    ],
    changes: 'Nueva estructura de volumen y frecuencia',
    genesisMessage: 'Esta fase establece los cimientos. Enfócate en la técnica limpia.'
  },
  hypertrophy: {
    objectives: [
      'Maximizar crecimiento muscular',
      'Incrementar tiempo bajo tensión',
      'Mejorar conexión mente-músculo'
    ],
    changes: 'Mayor volumen, menos intensidad relativa',
    genesisMessage: 'Es hora de crecer. Cada rep cuenta.'
  },
  strength: {
    objectives: [
      'Aumentar maximal strength',
      'Mejorar patrones compuestos',
      'Preparar para fase de pico'
    ],
    changes: 'Menor volumen, mayor intensidad',
    genesisMessage: 'Ahora es momento de potencia. Cada serie es precisión.'
  },
  peaking: {
    objectives: [
      'Expresar máxima fuerza',
      'Validar ganancia de la season',
      'Recuperar antes de nuevo ciclo'
    ],
    changes: 'Baja densidad, máxima intensidad',
    genesisMessage: 'Último esfuerzo. Demuestra todo lo que ganaste.'
  }
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

### Sprint H Checklist
- [ ] CoachNotes card renders with type badge (observation/encouragement/adjustment/milestone icons + colors)
- [ ] Coach avatar shows "AO" initials in 36px circle
- [ ] "Ver historial →" CTA navigates to history modal
- [ ] History modal displays all notes in timeline format
- [ ] Filter pills (Todas, Observaciones, etc.) work and update list
- [ ] CoachReviewBadge shows ONLY when coach_reviewed === true in DB
- [ ] CoachReviewBadge visible in 3 locations (train, home, active-workout)
- [ ] useCoachStore fetches notes without errors
- [ ] No regressions to existing Home sections

### Sprint I Checklist
- [ ] Phase briefing modal shows on phase change (not on every app open)
- [ ] Phase name, objectives, and GENESIS message display correctly
- [ ] "Comenzar Fase" button dismisses modal + updates AsyncStorage
- [ ] WeeklyWrap card shows Sunday/Monday with stats
- [ ] Stats animate with useAnimatedCounter
- [ ] "Entendido" dismisses WeeklyWrap + marks in AsyncStorage
- [ ] Weekly wrap reappears after 5 days (re-trigger for next week)
- [ ] Season complete screen shows confetti animation (2s)
- [ ] Season complete stats cascade (400ms intervals, each animates from 0)
- [ ] Season complete triggered when currentWeek > 12
- [ ] All AsyncStorage checks work (no double-triggering)

### Sprint J Checklist
- [ ] Articles reorder by current phase in education list
- [ ] "GENESIS recomienda para {phaseName}" header in Home
- [ ] Phase color dot appears next to header text
- [ ] Read/unread dots visible on article cards
- [ ] Articles marked read on navigation to detail screen
- [ ] Read state persists across app close/reopen (AsyncStorage)
- [ ] educationStore.getPhaseRankedArticles() returns phase-sorted array
- [ ] No regressions to education navigation

---

## 7. Existing Component Inventory (DO NOT recreate)

These already exist and should be reused:

| Component | Location | Usage in Phase 3 |
|-----------|----------|------------------|
| GlassCard | `components/ui/` | Coach notes card, weekly wrap, phase briefing |
| SeasonBadge | `components/ui/` | Weekly wrap header, season complete badge |
| ScreenHeader | `components/ui/` | Modal headers |
| PRCelebration | `components/training/` | Confetti pattern (adapt for season complete) |
| useAnimatedCounter | `hooks/` | Weekly stats, season complete stats |
| useStaggeredEntrance | `hooks/` | Coach notes history, weekly wrap stats |
| Pill / PillBadge | `components/ui/` | Filter chips, type badges |
| EmptyState | `components/ui/` | Coach notes history empty state |

---

## 8. Data Dependencies & Ordering

### Sprint H requires
- Existing `useTrainingStore`, `useNutritionStore`, `useWellnessStore`
- Supabase `coach_notes` table (migrations pre-applied ✅)
- Supabase `sessions.coach_reviewed` column (migrations pre-applied ✅)

### Sprint I requires
- Sprint H complete (useCoachStore exists)
- Existing `useSeasonStore`, `useTrainingStore`
- PHASE_DATA constant (no backend dependency)
- AsyncStorage (built-in)

### Sprint J requires
- Sprint H + I complete (phase logic established)
- Existing `useEducationStore`
- Phase-aware ranking algorithm

---

## 9. Success Metrics

- **Coach Presence**: Coach notes card visible when notes exist; CoachReviewBadge only on real coach_reviewed data
- **Season Journey**: Phase briefing triggers once per phase; weekly wrap shows on schedule; season complete plays cinematic animation
- **Content Intelligence**: Articles rerank based on current phase; read/unread state persists; Home recommends phase-relevant content
- **Polish**: Zero TypeScript errors, all existing tests pass, animations smooth (60fps target)
- **Revertibility**: Each sprint independently revertible via git branch cleanup
- **No Data Fabrication**: All "coach reviewed" indicators tied to real coach_reviewed column in DB — no fakes

---

## 10. Appendix

### A. Confetti Particle System (Reuse PRCelebration pattern)

The PRCelebration component from Phase 2 has confetti logic. Adapt it:

```typescript
// Particle data: { id, initialX, initialY, scale, color, duration }
// useSharedValue for scale, opacity, translateY
// Animate fall via withTiming (spring for bounce at bottom)
// useAnimatedStyle to apply transforms
// FlatList or View array to render 40 particles
```

### B. CoachNoteType Icon Mapping

```typescript
const NOTE_TYPE_ICONS = {
  observation:   Eye,        // #00D4FF
  encouragement: Flame,      // #FFD93D
  adjustment:    SlidersHorizontal, // #FF6B6B
  milestone:     Trophy,     // #00F5AA
};
```

### C. Phase-to-Week Mapping

```typescript
export const getCurrentPhase = (week: number) => {
  if (week >= 1 && week <= 3) return 'adaptation';
  if (week >= 4 && week <= 6) return 'hypertrophy';
  if (week >= 7 && week <= 9) return 'strength';
  if (week >= 10 && week <= 12) return 'peaking';
  return 'adaptation'; // default/fallback
};
```

### D. Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2026-02-15 | Claude Code | Initial version — Phase 3 "HYBRID Ceremony" PRD |

---

## Conclusion

Phase 3 transforms GENESIS from a functional fitness app into an emotionally engaging coaching experience. By making the human coach tangible, marking seasons with ceremonies, and personalizing education, we justify the $299/mo HYBRID positioning and improve retention. All work is frontend-only, all Supabase migrations are pre-applied, and each sprint is independently testable and revertible.

