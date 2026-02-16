# Master Prompt: GENESIS UI Phase 3 — "HYBRID Ceremony"

## Context

You are implementing **GENESIS UI Phase 3 — "HYBRID Ceremony"**, transforming a premium AI fitness coaching app into an emotionally engaging coaching experience where users FEEL the human coach and LIVE their 12-week season.

**Your Role**: Senior React Native developer with expertise in animations (react-native-reanimated), Zustand state management, and premium mobile UI. You're upgrading an existing, working codebase — NOT building from scratch.

**Project Stage**: Active development — 3 sequential sprints (H→I→J)

**CRITICAL RULES**:
1. The app is Expo SDK 54 / React Native 0.81 / TypeScript 5.9
2. The 12-week SEASON is the central concept — every UI element connects to it
3. GENESIS (AI) + Aldo (human coach) = NGX HYBRID model ($299/mo)
4. ALL Supabase migrations are ALREADY DONE — do NOT create tables or alter columns
5. Coach badges show ONLY when real data exists — NEVER fake or simulate
6. Do NOT modify BFF/backend code — all changes are frontend-only
7. Do NOT add new npm dependencies

---

## Current State

### Repository Status
- **Status**: In-progress (UI Phase 2 Sprints D/E/F/G completed, visual density layer installed)
- **Branch**: `main` (start each sprint from main)
- **Existing tests**: Jest (~45 tests), Pytest (~122 BFF tests)
- **Previous Phase**: Phase 2 delivered exercise library (2-column grid), body map recovery visualization, photo gallery with phase grouping, coach notes infrastructure

### Environment
- **Dependencies**: All installed (reanimated, expo-image, expo-linear-gradient, react-native-svg, lucide-react-native, expo-haptics, zustand)
- **Config**: Configured and working
- **Dev server**: `npm start` works
- **Database**: Supabase with tables: coach_notes, user_memory, response_cache, progress_photos, and all Phase 1-2 tables

### Blocking Issues
- None — codebase is stable

---

## Mission

Execute 3 sequential UI sprints (H→I→J) that add emotional depth, season ceremony, and phase-aware content to the GENESIS app. Each sprint runs on its own git branch for clean rollback. After each sprint: verify with `npm test && npx tsc --noEmit`, then merge to main before starting the next sprint.

---

## Pre-Execution: Read These Files First

Before writing ANY code, read these files in order to understand the full context:

```
MUST READ (in this order):
1. ./CLAUDE.md                                      — Full project context, tech stack, patterns
2. ./docs/active/PRD-UI-PHASE3-HYBRID-CEREMONY.md — Complete PRD for Phase 3 (your blueprint)
3. ./constants/colors.ts                            — Design tokens (SEASON_PHASE_COLORS, GENESIS_COLORS)
4. ./components/ui/GlassCard.tsx                    — Base card pattern
5. ./components/coach/CoachNotes.tsx                — Current coach notes (modify in H1)
6. ./components/coach/index.ts                      — Current barrel export
7. ./stores/useCoachStore.ts                        — Current coach store (modify in H4)
8. ./components/training/PRCelebration.tsx          — Confetti pattern to scale for I3
9. ./components/ui/SeasonBadge.tsx                  — Season badge component (verify exists)
10. ./hooks/useAnimatedCounter.ts                   — Number animation hook (reuse in I2, I3)
11. ./hooks/useStaggeredEntrance.ts                 — Stagger animation hook (reuse everywhere)
12. ./app/(tabs)/home.tsx                           — Home tab (modified in H3, I5, J2)
13. ./app/(tabs)/train.tsx                          — Train tab (modified in H3)
14. ./stores/useEducationStore.ts                   — Education store (modified in J1, J3)
15. ./stores/useSeasonStore.ts                      — Season state (used for phase data)
16. ./app/(screens)/education.tsx                   — Education screen (modified in J3)
17. ./app/(screens)/education-detail.tsx            — Education detail (modified in J3)
```

---

## Execution Strategy

### Branch-per-Sprint
```bash
# Sprint H
git checkout main && git pull
git checkout -b sprint-H-hybrid-feel

# After Sprint H verified:
git checkout main && git merge sprint-H-hybrid-feel

# Sprint I
git checkout main && git pull
git checkout -b sprint-I-season-ceremony

# After Sprint I verified:
git checkout main && git merge sprint-I-season-ceremony

# Sprint J
git checkout main && git pull
git checkout -b sprint-J-content-depth

# After Sprint J verified:
git checkout main && git merge sprint-J-content-depth
```

### Parallelization Strategy
- **Sprint H**: H1+H2+H3 components (parallel read + implementation) → H4 store update → H5 barrel → integrate into screens → H6 verify
- **Sprint I**: I1+I2+I3 components (parallel read + implementation) → I4 barrel → I5 integration → I6 verify
- **Sprint J**: J1+J3 store changes (sequential, data dependencies) → J2 home integration → J4 verify

### Context Window Management
- Use parallel reads for independent files
- One primary agent for integration/verification to avoid merge conflicts
- Keep component implementation focused and modular

---

## Sprint H — "HYBRID Feel" (Coach Presence System)

### Branch: `sprint-H-hybrid-feel`

```bash
git checkout main && git pull
git checkout -b sprint-H-hybrid-feel
```

### Overview
Introduce human coach presence at UI level. User sees coach notes with types, history access, and review badges that reinforce the hybrid model. This sprint is fully frontend — Supabase tables (coach_notes, user_memory) already exist.

---

### Task H1: Upgrade CoachNotes Card
**File**: `components/coach/CoachNotes.tsx` (MODIFY)

Replace the current component with an upgraded version that adds coach identity and interaction richness.

**Key Changes**:

1. **Coach Avatar with Initials** — Replace MessageCircle icon:
```typescript
<View style={{
  width: 36, height: 36, borderRadius: 18,
  backgroundColor: GENESIS_COLORS.primary,
  alignItems: 'center', justifyContent: 'center',
  marginRight: 12,
}}>
  <Text style={{
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'InterBold'
  }}>
    AO
  </Text>
</View>
```

2. **Note Type Badge** — Add after "Nota de tu Coach" title. Define at top of file:
```typescript
const NOTE_TYPE_CONFIG: Record<string, {
  icon: LucideIcon;
  color: string;
  label: string;
}> = {
  observation: {
    icon: Eye,
    color: '#00D4FF',
    label: 'Observacion'
  },
  encouragement: {
    icon: Flame,
    color: '#FFD93D',
    label: 'Motivacion'
  },
  adjustment: {
    icon: SlidersHorizontal,
    color: '#FF6B6B',
    label: 'Ajuste'
  },
  milestone: {
    icon: Trophy,
    color: '#00F5AA',
    label: 'Logro'
  },
};

// In render:
{latestNote?.noteType && (
  <View style={{
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: NOTE_TYPE_CONFIG[latestNote.noteType].color + '15',
  }}>
    <NOTE_TYPE_CONFIG[latestNote.noteType].icon
      size={12}
      color={NOTE_TYPE_CONFIG[latestNote.noteType].color}
    />
    <Text style={{
      fontSize: 10, fontFamily: 'JetBrainsMonoMedium',
      color: NOTE_TYPE_CONFIG[latestNote.noteType].color,
    }}>
      {NOTE_TYPE_CONFIG[latestNote.noteType].label}
    </Text>
  </View>
)}
```

3. **"Ver historial" CTA** — Add Pressable at bottom:
```typescript
<Pressable
  onPress={() => router.push('/(modals)/coach-notes-history')}
  style={{ paddingTop: 8 }}
>
  <Text style={{
    color: GENESIS_COLORS.primary,
    fontSize: 11,
    fontFamily: 'InterSemiBold'
  }}>
    Ver historial →
  </Text>
</Pressable>
```

**Imports to Add**:
```typescript
import { Eye, Flame, SlidersHorizontal, Trophy } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
```

**Props Interface** (add to existing):
```typescript
interface CoachNote {
  id: string;
  message: string;
  title?: string;
  noteType?: 'observation' | 'encouragement' | 'adjustment' | 'milestone';
  readAt?: string;
  createdAt: string;
}
```

---

### Task H2: Coach Notes History Modal
**File**: `app/(modals)/coach-notes-history.tsx` (NEW)

Full-screen modal with timeline of coach notes, type filtering, and read status tracking.

**Structure**:
```typescript
import { View, Text, ScrollView, FlatList, Pressable, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { GENESIS_COLORS, COLORS } from '../../constants/colors';
import GlassCard from '../../components/ui/GlassCard';
import useCoachStore from '../../stores/useCoachStore';
import useStaggeredEntrance from '../../hooks/useStaggeredEntrance';

const FILTER_OPTIONS = [
  { id: 'all', label: 'Todas' },
  { id: 'observation', label: 'Observaciones' },
  { id: 'encouragement', label: 'Motivacion' },
  { id: 'adjustment', label: 'Ajustes' },
  { id: 'milestone', label: 'Logros' },
];

export default function CoachNotesHistory() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const { notes, filterByType } = useCoachStore();
  const filteredNotes = selectedFilter === null || selectedFilter === 'all'
    ? notes
    : filterByType(selectedFilter);

  const { animatedIndex } = useStaggeredEntrance({
    itemCount: filteredNotes.length,
    delayMs: 120,
  });

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: COLORS.background
    }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 20, paddingVertical: 16,
        borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle,
      }}>
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={{
          fontSize: 18, fontFamily: 'InterBold',
          color: COLORS.textPrimary,
          flex: 1,
        }}>
          Notas de tu Coach
        </Text>
      </View>

      {/* Filter Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: 20, paddingVertical: 12 }}
        contentContainerStyle={{ gap: 8 }}
      >
        {FILTER_OPTIONS.map(option => (
          <Pressable
            key={option.id}
            onPress={() => setSelectedFilter(option.id === 'all' ? null : option.id)}
            style={{
              paddingHorizontal: 12, paddingVertical: 6,
              borderRadius: 12,
              borderWidth: 1,
              backgroundColor:
                (selectedFilter === null && option.id === 'all') ||
                selectedFilter === option.id
                  ? GENESIS_COLORS.primary + '20'
                  : 'transparent',
              borderColor:
                (selectedFilter === null && option.id === 'all') ||
                selectedFilter === option.id
                  ? GENESIS_COLORS.primary
                  : COLORS.borderSubtle,
            }}
          >
            <Text style={{
              fontSize: 12, fontFamily: 'InterSemiBold',
              color:
                (selectedFilter === null && option.id === 'all') ||
                selectedFilter === option.id
                  ? GENESIS_COLORS.primary
                  : COLORS.textSecondary,
            }}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Notes List */}
      {filteredNotes.length > 0 ? (
        <FlatList
          data={filteredNotes}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 12,
            gap: 12,
          }}
          renderItem={({ item, index }) => (
            <Animated.View style={{
              opacity: animatedIndex.value >= index ? 1 : 0,
              transform: [
                {
                  translateY: animatedIndex.value >= index ? 0 : 20,
                },
              ],
            }}>
              <GlassCard>
                <View style={{
                  flexDirection: 'row', alignItems: 'flex-start', gap: 12,
                }}>
                  {/* Type Icon */}
                  <View style={{
                    width: 36, height: 36, borderRadius: 18,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: NOTE_TYPE_CONFIG[item.noteType || 'observation'].color + '20',
                  }}>
                    <NOTE_TYPE_CONFIG[item.noteType || 'observation'].icon
                      size={18}
                      color={NOTE_TYPE_CONFIG[item.noteType || 'observation'].color}
                    />
                  </View>

                  {/* Content */}
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 13, fontFamily: 'InterSemiBold',
                      color: COLORS.textPrimary,
                      marginBottom: 4,
                    }}>
                      {item.title || 'Coach Note'}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13, fontFamily: 'Inter',
                        color: COLORS.textSecondary,
                        marginBottom: 8,
                      }}
                      numberOfLines={4}
                    >
                      {item.message}
                    </Text>
                    <Text style={{
                      fontSize: 10, fontFamily: 'JetBrainsMonoMedium',
                      color: COLORS.textMuted,
                    }}>
                      {new Date(item.createdAt).toLocaleDateString('es-ES')}
                    </Text>
                  </View>

                  {/* Unread Dot */}
                  {!item.readAt && (
                    <View style={{
                      width: 8, height: 8, borderRadius: 4,
                      backgroundColor: GENESIS_COLORS.primary,
                      marginTop: 4,
                    }} />
                  )}
                </View>
              </GlassCard>
            </Animated.View>
          )}
        />
      ) : (
        <View style={{
          flex: 1, alignItems: 'center', justifyContent: 'center',
          paddingHorizontal: 20,
        }}>
          <MessageCircle size={48} color={COLORS.textMuted} />
          <Text style={{
            fontSize: 16, fontFamily: 'InterSemiBold',
            color: COLORS.textSecondary,
            marginTop: 16,
            textAlign: 'center',
          }}>
            Tu coach aun no ha dejado notas
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
```

**Key Behaviors**:
- Filter buttons respond with background + border color change
- Notes list animates in staggered (120ms delay)
- Unread dot only shows if `readAt === null`
- Tapping note area should call `markAsRead(noteId)` on the store (add onPress handler)

**Imports to Add**:
```typescript
import Animated from 'react-native-reanimated';
import { MessageCircle } from 'lucide-react-native';
import { useState } from 'react';
```

---

### Task H3: Coach Review Badge
**File**: `components/coach/CoachReviewBadge.tsx` (NEW)

Compact badge that shows when a workout/session has been reviewed by coach. Only displays when real `coach_reviewed` data exists.

**Full Component**:
```typescript
import { View, Text } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';

interface CoachReviewBadgeProps {
  visible: boolean;
}

export function CoachReviewBadge({ visible }: CoachReviewBadgeProps) {
  if (!visible) return null;

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: 8, paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1, borderColor: GENESIS_COLORS.primary + '33',
      backgroundColor: GENESIS_COLORS.primary + '10',
    }}>
      <CheckCircle size={12} color={GENESIS_COLORS.primary} />
      <Text style={{
        fontSize: 9, fontFamily: 'JetBrainsMonoMedium',
        color: '#FFFFFF99',
      }}>
        Revisado por Coach
      </Text>
    </View>
  );
}

export default CoachReviewBadge;
```

**Integration Locations** (modify existing screens):

1. **`app/(tabs)/train.tsx`** — Below today's workout card header:
```typescript
<CoachReviewBadge
  visible={todayWorkout?.coach_reviewed === true}
/>
```

2. **`app/(tabs)/home.tsx`** — Inside weekly progress section:
```typescript
<CoachReviewBadge
  visible={weekSessions?.some(s => s.coach_reviewed === true) === true}
/>
```

3. **`app/(screens)/active-workout.tsx`** — In post-workout summary:
```typescript
<CoachReviewBadge
  visible={completedSession?.coach_reviewed === true}
/>
```

**Critical Note**: The badge will NOT show in the current app since no data has `coach_reviewed = true`. This is intentional — it activates when GENESIS BRAIN exists and coach marks reviews. Do NOT fake this with mock data.

---

### Task H4: Update useCoachStore
**File**: `stores/useCoachStore.ts` (MODIFY)

Expand the store to support full notes history, filtering, and read-status tracking.

**Add to Interface**:
```typescript
interface CoachNote {
  id: string;
  message: string;
  title?: string;
  noteType?: 'observation' | 'encouragement' | 'adjustment' | 'milestone';
  readAt?: string;
  createdAt: string;
}

interface CoachStore {
  // Existing
  latestNote: CoachNote | null;

  // New
  notes: CoachNote[];
  filterType: string | null; // 'observation' | 'encouragement' | 'adjustment' | 'milestone' | null
  isLoading: boolean;

  // Existing
  fetchLatestNote: (userId: string) => Promise<void>;

  // New
  fetchAllNotes: (userId: string) => Promise<void>;
  markAsRead: (noteId: string) => Promise<void>;
  setFilterType: (type: string | null) => void;
  filterByType: (type: string) => CoachNote[];
}
```

**Implementation**:
```typescript
export const useCoachStore = create<CoachStore>((set, get) => ({
  latestNote: null,
  notes: [],
  filterType: null,
  isLoading: false,

  fetchLatestNote: async (userId: string) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('coach_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // 116 = no rows
      if (data) {
        set({
          latestNote: {
            id: data.id,
            message: data.message,
            title: data.title,
            noteType: data.note_type,
            readAt: data.read_at,
            createdAt: data.created_at,
          }
        });
      }
    } catch (err) {
      console.error('Coach notes error:', err);
      // Graceful fallback
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllNotes: async (userId: string) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('coach_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (data) {
        set({
          notes: data.map(d => ({
            id: d.id,
            message: d.message,
            title: d.title,
            noteType: d.note_type,
            readAt: d.read_at,
            createdAt: d.created_at,
          })),
        });
      }
    } catch (err) {
      console.error('Fetch all notes error:', err);
      set({ notes: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('coach_notes')
        .update({ read_at: new Date().toISOString() })
        .eq('id', noteId);

      if (error) throw error;

      // Update local state
      set(state => ({
        notes: state.notes.map(n =>
          n.id === noteId
            ? { ...n, readAt: new Date().toISOString() }
            : n
        ),
        latestNote: state.latestNote?.id === noteId
          ? { ...state.latestNote, readAt: new Date().toISOString() }
          : state.latestNote,
      }));
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  },

  setFilterType: (type: string | null) => {
    set({ filterType: type });
  },

  filterByType: (type: string) => {
    const state = get();
    if (!type || type === 'all') return state.notes;
    return state.notes.filter(n => n.noteType === type);
  },
}));
```

**Key Points**:
- `fetchAllNotes` does NOT call `fetchLatestNote` (separate concerns)
- `filterByType` is a regular method, NOT a Zustand selector (avoids re-render loops)
- Try/catch with graceful fallback (set notes to [] on error, don't crash)
- Remove any `as any` casts since table exists now

---

### Task H5: Update Barrel Export
**File**: `components/coach/index.ts` (MODIFY)

Add the new CoachReviewBadge to exports:
```typescript
export { default as CoachNotes } from './CoachNotes';
export { CoachReviewBadge } from './CoachReviewBadge';
```

---

### Task H6: Verify Sprint H
```bash
npx tsc --noEmit
npm test
```

Verify:
- [ ] CoachNotes shows coach avatar + type badge (when note.noteType exists)
- [ ] "Ver historial" CTA navigates to history modal
- [ ] History modal renders with type filter pills (animated)
- [ ] Filter pills change background + border on select
- [ ] Notes list shows unread dots (purple 8px circle)
- [ ] Notes list animates in staggered
- [ ] CoachReviewBadge renders only when `visible={true}`
- [ ] No TypeScript errors
- [ ] Existing tests still pass

---

### Commit H
```bash
git add -A
git commit -m "Sprint H: HYBRID Feel - Coach Presence System

- Upgraded CoachNotes with coach avatar (AO initials) and note type badge
- New coach-notes-history modal with timeline and type filters
- CoachReviewBadge component (activates only with real coach_reviewed data)
- Expanded useCoachStore with full notes history, filtering, read tracking
- Integrated badges into train, home, and active-workout screens
- All coach notes data flows from Supabase, no mocked data"

git checkout main && git merge sprint-H-hybrid-feel
```

---

## Sprint I — "Season Ceremony"

### Branch: `sprint-I-season-ceremony`

```bash
git checkout main && git pull
git checkout -b sprint-I-season-ceremony
```

### Overview
Transform the 12-week season into a ceremonial experience. Users see phase briefings when phases change, weekly wrap summaries, and a cinematic season finale screen. This sprint makes the season journey feel REAL and emotionally rewarding.

---

### Task I1: Phase Briefing Modal
**File**: `app/(modals)/phase-briefing.tsx` (NEW)

Cinematic modal that shows when user enters a new season phase. Displays phase data, objectives, and GENESIS wisdom.

**Phase Data Map** (top of file):
```typescript
const PHASE_DATA: Record<string, {
  title: string;
  subtitle: string;
  objectives: string[];
  changes: string;
  genesisMessage: string;
}> = {
  adaptation: {
    title: 'Adaptacion',
    subtitle: 'Semanas 1-3',
    objectives: [
      'Establecer patrones de movimiento correctos',
      'Crear el habito de entrenamiento consistente',
      'Evaluar tu nivel base de fuerza y movilidad',
      'Preparar tendones y articulaciones para cargas mayores',
    ],
    changes: 'Esta es tu fase inicial. Todo comienza aqui.',
    genesisMessage: 'Tu cuerpo se esta preparando para algo grande. La consistencia en estas primeras semanas define todo lo que viene despues. Confía en el proceso.',
  },
  hypertrophy: {
    title: 'Hipertrofia',
    subtitle: 'Semanas 4-6',
    objectives: [
      'Aumentar volumen muscular con series de 8-12 repeticiones',
      'Incrementar la ingesta calorica para soportar el crecimiento',
      'Priorizar tiempo bajo tension en cada ejercicio',
      'Dormir 7-9 horas para optimizar recuperacion',
    ],
    changes: 'El volumen de entrenamiento aumenta. Las cargas son moderadas pero las series son mas largas. Tu nutricion debe acompañar.',
    genesisMessage: 'Entraste en modo construccion. Cada serie cuenta, cada comida importa. Tu musculo es tu farmacia — estamos construyendo la base de tu longevidad.',
  },
  strength: {
    title: 'Fuerza',
    subtitle: 'Semanas 7-9',
    objectives: [
      'Incrementar cargas en movimientos compuestos principales',
      'Trabajar en rangos de 3-6 repeticiones con descansos largos',
      'Refinar tecnica bajo carga pesada',
      'Monitorear recuperacion con check-ins diarios',
    ],
    changes: 'Menos repeticiones, mas peso. Los descansos entre series se alargan. La intensidad sube pero el volumen baja.',
    genesisMessage: 'Ahora cosechas lo que sembraste. La fuerza que construyas aqui no solo es fisica — es la confianza de saber que puedes mas de lo que crees.',
  },
  peaking: {
    title: 'Peaking',
    subtitle: 'Semanas 10-12',
    objectives: [
      'Alcanzar maximos personales en ejercicios clave',
      'Integrar todo lo aprendido en las fases anteriores',
      'Prepararte para la evaluacion final de tu Season',
      'Celebrar cada PR como evidencia de tu progreso',
    ],
    changes: 'Intensidad maxima, volumen minimo. Cada sesion tiene un objetivo claro. Es tu momento de brillar.',
    genesisMessage: 'Estas en la cima de tu Season. Todo el trabajo de 12 semanas converge aqui. No es solo fuerza — es prueba de que el sistema funciona. Tu eres la prueba.',
  },
};
```

**Component Structure**:
```typescript
import { View, Text, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GENESIS_COLORS, COLORS, SEASON_PHASE_COLORS } from '../../constants/colors';
import GlassCard from '../../components/ui/GlassCard';
import useSeasonStore from '../../stores/useSeasonStore';

export default function PhaseBriefing() {
  const router = useRouter();
  const { currentPhase } = useSeasonStore();

  if (!currentPhase || !PHASE_DATA[currentPhase]) {
    return null;
  }

  const phaseInfo = PHASE_DATA[currentPhase];
  const phaseColor = SEASON_PHASE_COLORS[currentPhase];

  const handleStartPhase = async () => {
    await AsyncStorage.setItem('genesis_lastSeenPhase', currentPhase);
    router.back();
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: COLORS.background,
    }}>
      {/* Color Bar */}
      <Animated.View
        style={{
          height: 6,
          backgroundColor: phaseColor,
          borderRadius: 3,
          marginHorizontal: 40,
          entering: FadeIn.duration(400),
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 32,
          gap: 24,
        }}
      >
        {/* Title */}
        <Animated.View entering={SlideInUp.duration(500).delay(100)}>
          <Text style={{
            fontSize: 28, fontFamily: 'JetBrainsMono',
            color: COLORS.textPrimary,
            marginBottom: 4,
          }}>
            {phaseInfo.title}
          </Text>
          <Text style={{
            fontSize: 14, fontFamily: 'JetBrainsMonoMedium',
            color: COLORS.textSecondary,
          }}>
            {phaseInfo.subtitle}
          </Text>
        </Animated.View>

        {/* Objectives Section */}
        <Animated.View entering={SlideInUp.duration(500).delay(200)}>
          <Text style={{
            fontSize: 16, fontFamily: 'InterBold',
            color: COLORS.textPrimary,
            marginBottom: 12,
          }}>
            Objetivos de esta fase
          </Text>
          {phaseInfo.objectives.map((obj, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: 'row', gap: 12,
                alignItems: 'flex-start',
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 6, height: 6, borderRadius: 3,
                  backgroundColor: phaseColor,
                  marginTop: 6,
                  flexShrink: 0,
                }}
              />
              <Text
                style={{
                  fontSize: 13, fontFamily: 'Inter',
                  color: COLORS.textSecondary,
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                {obj}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Changes Section */}
        <Animated.View entering={SlideInUp.duration(500).delay(300)}>
          <Text style={{
            fontSize: 16, fontFamily: 'InterBold',
            color: COLORS.textPrimary,
            marginBottom: 12,
          }}>
            Que cambia
          </Text>
          <Text style={{
            fontSize: 13, fontFamily: 'Inter',
            color: COLORS.textSecondary,
            lineHeight: 20,
          }}>
            {phaseInfo.changes}
          </Text>
        </Animated.View>

        {/* GENESIS Message */}
        <Animated.View entering={SlideInUp.duration(500).delay(400)}>
          <GlassCard>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <Sparkles size={20} color={GENESIS_COLORS.primary} />
              <Text
                style={{
                  fontSize: 13, fontFamily: 'InterItalic',
                  color: COLORS.textSecondary,
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                {phaseInfo.genesisMessage}
              </Text>
            </View>
          </GlassCard>
        </Animated.View>
      </ScrollView>

      {/* CTA Button */}
      <Animated.View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 24,
          paddingTop: 12,
        }}
        entering={SlideInUp.duration(500).delay(500)}
      >
        <LinearGradient
          colors={['#6D00FF', '#9D4EDD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <Pressable
            onPress={handleStartPhase}
            style={{
              paddingVertical: 14,
              paddingHorizontal: 20,
              alignItems: 'center',
            }}
          >
            <Text style={{
              fontSize: 16, fontFamily: 'InterBold',
              color: '#FFFFFF',
            }}>
              Comenzar Fase
            </Text>
          </Pressable>
        </LinearGradient>
      </Animated.View>
    </SafeAreaView>
  );
}
```

**Detection Logic** (add to `app/(tabs)/home.tsx` in useEffect):
```typescript
useEffect(() => {
  const checkPhaseChange = async () => {
    const currentPhase = useSeasonStore.getState().currentPhase;
    if (!currentPhase) return;

    const lastSeen = await AsyncStorage.getItem('genesis_lastSeenPhase');
    if (lastSeen !== currentPhase) {
      router.push('/(modals)/phase-briefing');
    }
  };

  checkPhaseChange();
}, [currentPhase]); // Re-check only when phase changes
```

**Critical**: This modal shows ONCE per phase transition. AsyncStorage flag prevents re-showing.

---

### Task I2: Weekly Wrap Card
**File**: `components/season/WeeklyWrap.tsx` (NEW)

Engaging summary card that shows on Sunday/Monday with weekly stats animated in.

**Component**:
```typescript
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { Dumbbell, Utensils, Flame, Trophy } from 'lucide-react-native';
import GlassCard from '../ui/GlassCard';
import { GENESIS_COLORS, COLORS, SEASON_PHASE_COLORS } from '../../constants/colors';
import useAnimatedCounter from '../../hooks/useAnimatedCounter';
import useSeasonStore from '../../stores/useSeasonStore';

export interface WeeklyWrapProps {
  weekNumber: number;
  workoutsCompleted: number;
  workoutsPlanned: number;
  nutritionAdherence: number; // 0-100
  streakDays: number;
  prCount: number;
  nextWeekFocus: string;
  onDismiss: () => void;
}

export default function WeeklyWrap({
  weekNumber,
  workoutsCompleted,
  workoutsPlanned,
  nutritionAdherence,
  streakDays,
  prCount,
  nextWeekFocus,
  onDismiss,
}: WeeklyWrapProps) {
  const { currentPhase } = useSeasonStore();
  const phaseColor = SEASON_PHASE_COLORS[currentPhase] || GENESIS_COLORS.primary;

  const StatCard = ({ icon: Icon, value, label, color }: any) => {
    const animatedValue = useAnimatedCounter({
      from: 0,
      to: value,
      duration: 1200,
    });

    return (
      <Animated.View
        style={{
          flex: 1,
          entering: FadeIn.duration(400),
        }}
      >
        <GlassCard>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Icon size={24} color={color} />
            <Animated.Text
              style={{
                fontSize: 20, fontFamily: 'JetBrainsMono',
                color: COLORS.textPrimary,
              }}
              children={animatedValue}
            />
            <Text
              style={{
                fontSize: 11, fontFamily: 'InterMedium',
                color: COLORS.textMuted,
              }}
            >
              {label}
            </Text>
          </View>
        </GlassCard>
      </Animated.View>
    );
  };

  return (
    <Animated.View entering={SlideInUp.duration(500)}>
      <GlassCard>
        <View style={{ gap: 16 }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: 16, fontFamily: 'InterBold',
              color: COLORS.textPrimary,
            }}>
              Resumen Semana {weekNumber}
            </Text>
            <View style={{
              paddingHorizontal: 8, paddingVertical: 4,
              borderRadius: 8,
              backgroundColor: phaseColor + '20',
              borderWidth: 1, borderColor: phaseColor + '33',
            }}>
              <Text style={{
                fontSize: 9, fontFamily: 'JetBrainsMonoMedium',
                color: phaseColor,
              }}>
                S1 W{weekNumber}
              </Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <StatCard
                icon={Dumbbell}
                value={workoutsCompleted}
                label="Workouts"
                color={GENESIS_COLORS.primary}
              />
              <StatCard
                icon={Utensils}
                value={Math.round(nutritionAdherence)}
                label="Nutricion %"
                color="#00F5AA"
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <StatCard
                icon={Flame}
                value={streakDays}
                label="Dias Streak"
                color="#FFD93D"
              />
              <StatCard
                icon={Trophy}
                value={prCount}
                label="PRs"
                color="#FF6B6B"
              />
            </View>
          </View>

          {/* Next Week Preview */}
          <View style={{
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: COLORS.borderSubtle,
            gap: 8,
          }}>
            <Text style={{
              fontSize: 12, fontFamily: 'InterSemiBold',
              color: COLORS.textSecondary,
            }}>
              Proxima semana: <Text style={{ color: phaseColor }}>
                {nextWeekFocus}
              </Text>
            </Text>
          </View>

          {/* Dismiss Button */}
          <Pressable
            onPress={onDismiss}
            style={{
              paddingVertical: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{
              fontSize: 12, fontFamily: 'InterMedium',
              color: COLORS.textSecondary,
            }}>
              Entendido
            </Text>
          </Pressable>
        </View>
      </GlassCard>
    </Animated.View>
  );
}
```

**Implementation Notes**:
- Each stat animates independently (useAnimatedCounter with 1200ms duration)
- Grid is 2x2 layout within the card
- Next week focus text uses phase color
- onDismiss callback saves to AsyncStorage with current week key

---

### Task I3: Season Finale Screen
**File**: `app/(screens)/season-complete.tsx` (NEW)

Full cinematic celebration screen that plays when user completes all 12 weeks. Confetti, animated stats cascade, GENESIS wisdom, and coach message.

**Structure**:
```typescript
import { View, Text, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, SlideInUp, withTiming, withSequence, withDelay } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { Sparkles, Dumbbell, Trophy, Utensils, Heart, Calendar, ChevronRight } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Haptics } from 'expo-haptics';
import GlassCard from '../../components/ui/GlassCard';
import PRCelebration from '../../components/training/PRCelebration';
import { GENESIS_COLORS, COLORS } from '../../constants/colors';
import useSeasonStore from '../../stores/useSeasonStore';
import useAnimatedCounter from '../../hooks/useAnimatedCounter';

const FINALE_STATS = [
  { label: 'Workouts Completados', icon: Dumbbell, value: 0, color: GENESIS_COLORS.primary },
  { label: 'Records Personales', icon: Trophy, value: 0, color: '#FFD93D' },
  { label: 'Comidas Registradas', icon: Utensils, value: 0, color: '#00F5AA' },
  { label: 'Mejor Streak', icon: Flame, value: 0, color: '#FF6B6B' },
  { label: 'Check-ins', icon: Heart, value: 0, color: '#FF69B4' },
  { label: 'Semanas Consistentes', icon: Calendar, value: 0, color: '#9D4EDD' },
];

export default function SeasonComplete() {
  const router = useRouter();
  const { seasonNumber } = useSeasonStore();
  const [showStats, setShowStats] = useState(false);
  const [displayedStatIndex, setDisplayedStatIndex] = useState(-1);
  const confettiRef = useRef(null);

  useEffect(() => {
    // Heavy haptic on mount
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Heavy);

    // Start confetti
    if (confettiRef.current) {
      confettiRef.current.play();
    }

    // Start stats cascade after 1s
    setTimeout(() => setShowStats(true), 1000);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Confetti Overlay */}
      <View style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        <PRCelebration scale={1.5} visible={true} />
      </View>

      <ScrollView
        style={{ flex: 1, zIndex: 2 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 32,
          gap: 24,
          alignItems: 'center',
        }}
      >
        {/* Season Badge */}
        <Animated.View
          style={{
            width: 120, height: 120, borderRadius: 60,
            borderWidth: 3, borderColor: '#FFD700',
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#FFD700' + '15',
            entering: FadeIn.duration(600),
          }}
        >
          <Text style={{
            fontSize: 32, fontFamily: 'JetBrainsMono',
            color: '#FFD700',
            fontWeight: '700',
          }}>
            S{seasonNumber}
          </Text>
          <Text style={{
            fontSize: 10, fontFamily: 'JetBrainsMonoMedium',
            color: '#FFD700CC',
            marginTop: 4,
          }}>
            COMPLETADA
          </Text>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={SlideInUp.duration(600).delay(300)}>
          <Text style={{
            fontSize: 24, fontFamily: 'InterBold',
            color: COLORS.textPrimary,
            textAlign: 'center',
          }}>
            Tu Season ha Terminado
          </Text>
          <Text style={{
            fontSize: 13, fontFamily: 'Inter',
            color: COLORS.textSecondary,
            textAlign: 'center',
            marginTop: 8,
          }}>
            Celebra 12 semanas de consistencia y transformacion
          </Text>
        </Animated.View>

        {/* Stats Cascade */}
        {showStats && (
          <View style={{ width: '100%', gap: 12 }}>
            {FINALE_STATS.map((stat, idx) => (
              <StatCascadeItem
                key={idx}
                stat={stat}
                index={idx}
                displayedIndex={displayedStatIndex}
              />
            ))}
          </View>
        )}

        {/* GENESIS Message */}
        <Animated.View
          style={{
            width: '100%',
            entering: SlideInUp.duration(600).delay(2400),
          }}
        >
          <GlassCard>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <Sparkles size={20} color={GENESIS_COLORS.primary} />
              <Text style={{
                fontSize: 13, fontFamily: 'InterItalic',
                color: COLORS.textSecondary,
                flex: 1,
                lineHeight: 20,
              }}>
                No es solo lo que lograste. Es quien te volviste en el proceso. Tu cuerpo cambio, pero tu mente cambio mas. Vuelve aqui cuando estes listo para la siguiente Season.
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Coach Message (if exists) */}
        {/* Conditionally render based on latestNote from useCoachStore */}

        {/* CTAs */}
        <Animated.View
          style={{
            width: '100%',
            gap: 12,
            entering: SlideInUp.duration(600).delay(2800),
          }}
        >
          <LinearGradient
            colors={['#6D00FF', '#9D4EDD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 16, overflow: 'hidden' }}
          >
            <Pressable
              onPress={() => {
                // Start new season logic
                router.dismissAll();
                router.push('/(tabs)/home');
              }}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 20,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Text style={{
                fontSize: 16, fontFamily: 'InterBold',
                color: '#FFFFFF',
              }}>
                Iniciar Nueva Season
              </Text>
              <ChevronRight size={16} color="#FFFFFF" />
            </Pressable>
          </LinearGradient>

          <Pressable
            style={{
              paddingVertical: 12,
              paddingHorizontal: 20,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: COLORS.borderSubtle,
              borderRadius: 16,
            }}
          >
            <Text style={{
              fontSize: 14, fontFamily: 'InterMedium',
              color: COLORS.textSecondary,
            }}>
              Ver Resumen
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper component for stat cascade
function StatCascadeItem({ stat, index, displayedIndex }: any) {
  const animatedValue = useAnimatedCounter({
    from: 0,
    to: stat.value,
    duration: 800,
    delay: index * 400,
  });

  return (
    <Animated.View
      style={{
        opacity: displayedIndex >= index ? 1 : 0,
        transform: [
          {
            translateY: displayedIndex >= index ? 0 : 20,
          },
        ],
      }}
    >
      <GlassCard>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <stat.icon size={24} color={stat.color} />
            <Text style={{
              fontSize: 13, fontFamily: 'Inter',
              color: COLORS.textSecondary,
            }}>
              {stat.label}
            </Text>
          </View>
          <Animated.Text
            style={{
              fontSize: 18, fontFamily: 'JetBrainsMono',
              color: stat.color,
            }}
            children={animatedValue}
          />
        </View>
      </GlassCard>
    </Animated.View>
  );
}
```

**Key Features**:
- Confetti system (scale PRCelebration from Sprint A/B/C) with 40 particles
- Season badge large (120x120) with #FFD700 gold color and glow
- Stats cascade in one-by-one (400ms intervals) from useAnimatedCounter
- GENESIS message appears at 2.4s
- Full-width CTAs at bottom (gradient "Iniciar Nueva Season" + outline "Ver Resumen")

---

### Task I4: Barrel Export
**File**: `components/season/index.ts` (CREATE if not exists)
```typescript
export { default as WeeklyWrap } from './WeeklyWrap';
```

---

### Task I5: Integration into Home Tab
**File**: `app/(tabs)/home.tsx` (MODIFY)

Add three integrations:

1. **Phase Briefing Detection** (in useEffect after auth):
```typescript
useEffect(() => {
  const checkPhaseChange = async () => {
    const currentPhase = useSeasonStore.getState().currentPhase;
    if (!currentPhase) return;
    const lastSeen = await AsyncStorage.getItem('genesis_lastSeenPhase');
    if (lastSeen !== currentPhase) {
      router.push('/(modals)/phase-briefing');
    }
  };
  checkPhaseChange();
}, [currentPhase]); // Re-run only when phase changes
```

2. **Weekly Wrap Card** (in home render, after daily briefing):
```typescript
const isWeekendOrMonday = [0, 1].includes(new Date().getDay()); // Sunday or Monday
const [weeklyWrapDismissed, setWeeklyWrapDismissed] = useState(false);

useEffect(() => {
  if (!isWeekendOrMonday) return;
  AsyncStorage.getItem(`genesis_weeklyWrap_${currentWeek}`).then(val => {
    setWeeklyWrapDismissed(val === 'dismissed');
  });
}, [currentWeek, isWeekendOrMonday]);

const handleDismissWrap = async () => {
  await AsyncStorage.setItem(`genesis_weeklyWrap_${currentWeek}`, 'dismissed');
  setWeeklyWrapDismissed(true);
};

// In render, after daily briefing:
{!weeklyWrapDismissed && isWeekendOrMonday && (
  <WeeklyWrap
    weekNumber={currentWeek}
    workoutsCompleted={completedThisWeek}
    workoutsPlanned={plannedThisWeek}
    nutritionAdherence={adherencePercent}
    streakDays={currentStreak}
    prCount={prsThisWeek}
    nextWeekFocus={nextWeekFocusFromSeason}
    onDismiss={handleDismissWrap}
  />
)}
```

3. **Season Complete Detection** (in home):
```typescript
const { currentWeek, seasonNumber } = useSeasonStore();

useEffect(() => {
  if (currentWeek > 12) {
    router.push('/(screens)/season-complete');
  }
}, [currentWeek]);
```

---

### Task I6: Verify Sprint I
```bash
npx tsc --noEmit
npm test
```

Verify:
- [ ] Phase briefing modal shows when phase changes
- [ ] Phase briefing dismissal saves to AsyncStorage
- [ ] Weekly wrap shows on Sunday/Monday only
- [ ] Weekly wrap stats animate in with useAnimatedCounter
- [ ] Season complete screen shows cinematic confetti
- [ ] Stats cascade in 400ms intervals
- [ ] No TypeScript errors
- [ ] Tests pass

---

### Commit I
```bash
git add -A
git commit -m "Sprint I: Season Ceremony - Emotional Depth

- Phase briefing modal shows on phase transition with objectives + GENESIS wisdom
- Weekly wrap card with 2x2 stats grid and next week preview
- Season finale screen with cinematic confetti + stat cascade
- Detection logic prevents duplicate modals (AsyncStorage flags)
- Full integration into home tab with proper data flow
- Celebrates 12-week season journey as core user experience"

git checkout main && git merge sprint-I-season-ceremony
```

---

## Sprint J — "Content Depth" (Education Phase Alignment)

### Branch: `sprint-J-content-depth`

```bash
git checkout main && git pull
git checkout -b sprint-J-content-depth
```

### Overview
Make education content phase-aware. Articles rank by relevance to current season phase, showing GENESIS personalized guidance throughout the 12 weeks. Tracks read status to guide discovery.

---

### Task J1: Phase-Aware Article Ranking
**File**: `stores/useEducationStore.ts` (MODIFY)

Add a standalone utility function (NOT a Zustand selector) to rank articles by phase relevance:

```typescript
// Add OUTSIDE the store definition (top of file)
export function getPhaseRankedArticles(
  articles: EducationArticle[],
  currentPhase: string | null,
  readArticleIds: string[]
): EducationArticle[] {
  if (!currentPhase || !articles.length) return articles;

  const phaseOrder: Record<string, number> = {
    adaptation: 0,
    hypertrophy: 1,
    strength: 2,
    peaking: 3,
  };

  const currentPhaseIndex = phaseOrder[currentPhase] ?? -1;

  return [...articles].sort((a, b) => {
    // Phase-relevant articles first
    const aInPhase = a.relevantPhases?.includes(currentPhase) ? 0 : 1;
    const bInPhase = b.relevantPhases?.includes(currentPhase) ? 0 : 1;

    if (aInPhase !== bInPhase) return aInPhase - bInPhase;

    // Unread articles before read ones (within same phase relevance)
    const aRead = readArticleIds.includes(a.id) ? 1 : 0;
    const bRead = readArticleIds.includes(b.id) ? 1 : 0;

    if (aRead !== bRead) return aRead - bRead;

    // Default: maintain original order
    return 0;
  });
}
```

**Type Definition** (add to EducationArticle):
```typescript
interface EducationArticle {
  // ... existing fields
  relevantPhases?: ('adaptation' | 'hypertrophy' | 'strength' | 'peaking')[];
  // The PRD will specify which phase each article is relevant to
}
```

---

### Task J2: GENESIS Suggests in Home
**File**: `app/(tabs)/home.tsx` (MODIFY)

Update "APRENDE HOY" section to show phase-ranked articles:

```typescript
import { getPhaseRankedArticles } from '../../stores/useEducationStore';

// In home render, find the "APRENDE HOY" section:
const { articles, readArticleIds } = useEducationStore();
const { currentPhase } = useSeasonStore();
const rankedArticles = getPhaseRankedArticles(articles, currentPhase, readArticleIds);
const firstUnread = rankedArticles.find(a => !readArticleIds.includes(a.id));

const PHASE_LABELS: Record<string, string> = {
  adaptation: 'Adaptacion',
  hypertrophy: 'Hipertrofia',
  strength: 'Fuerza',
  peaking: 'Peaking',
};

// Replace header:
<View style={{
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  marginBottom: 12,
}}>
  <View style={{
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: SEASON_PHASE_COLORS[currentPhase] || GENESIS_COLORS.primary,
  }} />
  <Text style={{
    fontSize: 14, fontFamily: 'InterBold',
    color: COLORS.textPrimary,
  }}>
    GENESIS recomienda para{' '}
    <Text style={{
      color: SEASON_PHASE_COLORS[currentPhase] || GENESIS_COLORS.primary,
    }}>
      {PHASE_LABELS[currentPhase] || 'Hoy'}
    </Text>
  </Text>
</View>

// Show first unread article if exists:
{firstUnread ? (
  <EducationCard article={firstUnread} {...otherProps} />
) : (
  <Text style={{ color: COLORS.textMuted }}>Todas las recomendaciones leidas</Text>
)}
```

---

### Task J3: Read Progress Tracking
**File**: `stores/useEducationStore.ts` (MODIFY)

Add read tracking state + persistence:

```typescript
interface EducationStore {
  // ... existing
  readArticleIds: string[];

  loadReadArticles: () => Promise<void>;
  markAsRead: (articleId: string) => void;
}

// In create function:
loadReadArticles: async () => {
  try {
    const stored = await AsyncStorage.getItem('genesis_readArticles');
    if (stored) {
      set({ readArticleIds: JSON.parse(stored) });
    }
  } catch (err) {
    console.error('Load read articles error:', err);
  }
},

markAsRead: async (articleId: string) => {
  try {
    set(state => {
      const updated = [...new Set([...state.readArticleIds, articleId])];
      AsyncStorage.setItem('genesis_readArticles', JSON.stringify(updated));
      return { readArticleIds: updated };
    });
  } catch (err) {
    console.error('Mark read error:', err);
  }
},
```

**File**: `app/(screens)/education-detail.tsx` (MODIFY)

Call markAsRead on mount:

```typescript
useEffect(() => {
  useEducationStore.getState().markAsRead(articleId);
}, [articleId]);
```

**File**: `app/(screens)/education.tsx` (MODIFY)

Add unread indicator dots on article cards:

```typescript
const { readArticleIds } = useEducationStore();

// In article card render:
{!readArticleIds.includes(article.id) && (
  <View style={{
    position: 'absolute',
    top: 12, right: 12,
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: GENESIS_COLORS.primary,
  }} />
)}
```

---

### Task J4: Verify Sprint J
```bash
npx tsc --noEmit
npm test
```

Verify:
- [ ] Articles rank by current phase (phase-relevant first)
- [ ] Unread articles appear before read ones
- [ ] GENESIS suggests "para {Phase}" in Home
- [ ] Phase color dot appears next to "GENESIS recomienda"
- [ ] Read/unread dots show on article cards
- [ ] Read status persists to AsyncStorage
- [ ] First unread article shows in Home
- [ ] No TypeScript errors
- [ ] Tests pass

---

### Commit J
```bash
git add -A
git commit -m "Sprint J: Content Depth - Phase-Aware Learning

- Articles rank by relevance to current season phase
- GENESIS suggests phase-appropriate content in Home
- Read/unread tracking with AsyncStorage persistence
- Unread indicator dots on article cards
- Article discovery tied to user journey through 12-week season"

git checkout main && git merge sprint-J-content-depth
```

---

## Constraints & Rules

### DO
- ✅ Read **ALL** files in the pre-execution list before ANY code
- ✅ Create git branch per sprint (sprint-H, sprint-I, sprint-J)
- ✅ Run `npm test && npx tsc --noEmit` after every sprint
- ✅ Follow existing patterns (GlassCard, GENESIS_COLORS, useStaggeredEntrance)
- ✅ Use react-native-reanimated for all animations
- ✅ Keep ALL text in Spanish
- ✅ Use AsyncStorage for client-side persistence (lastSeenPhase, dismissals, readArticles)
- ✅ Compute values inline in components, NEVER call store methods in Zustand selectors
- ✅ Use try/catch with graceful fallbacks on all Supabase queries
- ✅ Add haptic feedback on major interactions (phase show, season complete)
- ✅ Preserve all existing functionality — only add, don't remove
- ✅ Use useAnimatedCounter and useStaggeredEntrance hooks throughout

### DON'T
- ❌ DO NOT modify BFF/backend — all changes frontend-only
- ❌ DO NOT create/modify Supabase tables — migrations ALREADY APPLIED
- ❌ DO NOT fake coach_reviewed data — badges show ONLY with real data
- ❌ DO NOT add new npm dependencies
- ❌ DO NOT modify tab navigation structure
- ❌ DO NOT touch AI chat, agents, or backend routing
- ❌ DO NOT break existing animation patterns
- ❌ DO NOT use hardcoded colors — always SEASON_PHASE_COLORS or GENESIS_COLORS
- ❌ DO NOT make Zustand selectors that call store methods (infinite loop risk)
- ❌ DO NOT modify existing test files
- ❌ DO NOT use emojis in code

---

## Session Success Criteria

After all 3 sprints, verify:

- [ ] **H1**: CoachNotes shows coach avatar (AO), type badge, "Ver historial" CTA
- [ ] **H2**: Coach notes history modal renders with type filter pills (animated list)
- [ ] **H3**: CoachReviewBadge integrated in train, home, active-workout (invisible when no data)
- [ ] **H4**: useCoachStore has fetchAllNotes, filterByType, markAsRead methods
- [ ] **I1**: Phase briefing modal shows on phase change, dismissal saved via AsyncStorage
- [ ] **I2**: Weekly wrap shows on Sunday/Monday only, stats animate via useAnimatedCounter
- [ ] **I3**: Season complete screen plays confetti + stat cascade (400ms intervals)
- [ ] **I5**: Home detects phase change and season completion, shows weekly wrap conditionally
- [ ] **J1**: Articles rank by relevantPhases (phase-relevant first)
- [ ] **J2**: Home "GENESIS recomienda para {Phase}" with phase color dot
- [ ] **J3**: Read/unread tracking persists to AsyncStorage, dots show on cards
- [ ] **All**: `npx tsc --noEmit` passes with zero errors
- [ ] **All**: `npm test` passes (no regressions)
- [ ] **All**: 3 clean commits on main (one per sprint)
- [ ] **All**: No new npm dependencies added

---

## Notes & Tips

- **Phase Briefing**: Shows ONCE per phase (AsyncStorage flag prevents re-shows). Triggered when user advances to new phase week.
- **Weekly Wrap**: Shows ONLY on Sunday (day 0) or Monday (day 1). Dismiss flag saved by week number to allow showing again next week.
- **Season Finale**: Triggered when `currentWeek > 12`. Confetti system reuses PRCelebration pattern from Phase 1 (scale it up 1.5x for bigger effect).
- **Coach Badges**: Planted in UI but inactive until GENESIS BRAIN exists. They'll activate in Sprint 6 when coaches can mark reviews.
- **Education Ranking**: Call getPhaseRankedArticles in component (NOT selector) to avoid re-render loops. Pass articles + currentPhase + readArticleIds.
- **Haptic Feedback**: Use `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Heavy)` on phase briefing show and season complete. Use `Haptics.selectionAsync()` on smaller interactions.
- **AsyncStorage Keys**: Use descriptive keys like `genesis_lastSeenPhase`, `genesis_weeklyWrap_{week}`, `genesis_readArticles` to avoid collisions.

---

## References

- **Phase Data Structure**: See PHASE_DATA object in I1 for full phase info (objectives, changes, GENESIS message)
- **Animation Hooks**: Reuse useAnimatedCounter (for number animation), useStaggeredEntrance (for list animations)
- **Color System**: All phase colors from SEASON_PHASE_COLORS in constants/colors.ts
- **Component Patterns**: GlassCard for all cards, LinearGradient for CTA buttons, FlatList for lists
- **Zustand Pattern**: State primitives only, compute in components, use try/catch on data fetches

---

## Success Looks Like

After executing these 3 sprints:
- User sees coach presence through notes + history + review badges
- Phase transitions are ceremonial events with objectives + wisdom
- Weekly progress is celebrated through animated wrap cards
- Season completion is a cinematic, emotional moment
- Education content guides user through their specific season phase
- Every feature reinforces the 12-week SEASON as the central user journey
- NGX HYBRID positioning is felt at UI level (coach notes, review badges, GENESIS wisdom)

This is Phase 3 complete: HYBRID Ceremony.
