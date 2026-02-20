# Master Prompt: GENESIS UI Phase 4 — "Core Experience"

## Context

You are implementing **GENESIS UI Phase 4 — "Core Experience"**, elevating the active workout flow, optimizing Home tab intelligence, and resolving technical debt. This phase focuses on **WHERE USERS SPEND THE MOST TIME** — the workout itself — and making the Home tab smarter instead of denser.

**Your Role**: Senior React Native developer with expertise in animations (react-native-reanimated), performance optimization, and premium mobile UI. You're upgrading an existing, working codebase — NOT building from scratch.

**Project Stage**: Active development — 3 sequential sprints (K→L→M)

**CRITICAL RULES**:
1. Expo SDK 54 / React Native 0.81 / TypeScript 5.9
2. SEASON is the central concept — workout flow must reflect current phase
3. Do NOT modify BFF/backend — all changes frontend-only
4. Do NOT add new npm dependencies
5. ALL Supabase migrations are done — do NOT create/alter tables
6. Preserve ALL existing tests (45/45 must pass)
7. Fix pre-existing TS errors, don't create new ones

---

## Current State

### Repository Status
- **Status**: In-progress (UI Phase 3 complete with HYBRID Ceremony)
- **Branch**: `main` (start each sprint from main)
- **Existing tests**: Jest (~45 tests), Pytest (~122 BFF tests)
- **Previous Phase**: Phase 3 delivered coach presence system, season ceremony, phase-aware content

### What Works Right Now
- 5 main tabs: Home, Train, Fuel, Mind, Track
- Active workout screen with ExerciseForm, RestTimer, WorkoutComplete
- Phase briefing modal on phase transitions
- Weekly wrap card (Sunday/Monday only)
- Season finale screen with confetti + stat cascade
- Coach notes history with type filtering
- Phase-ranked education content
- Full Supabase integration with auth, workout/nutrition/wellness data
- Personal Record (PR) detection with celebration overlay
- AllExisting animation hooks (useAnimatedCounter, useStaggeredEntrance)
- All design system colors (SEASON_PHASE_COLORS, GENESIS_COLORS) defined

### Environment
- **Dependencies**: All installed (reanimated, expo-image, expo-linear-gradient, react-native-svg, lucide-react-native, expo-haptics, zustand)
- **Config**: Configured and working
- **Dev server**: `npm start` works
- **Database**: Supabase with all Phase 1-3 tables

### Blocking Issues
- Pre-existing TypeScript errors (6 total) — will fix in Sprint M
- Some `as any` casts in useCoachStore — will fix in Sprint M
- Active workout could be more premium/cinematic
- Home tab has too many collapsible sections but needs smarter organization

---

## Mission

Execute 3 sequential UI sprints (K→L→M) that enhance the active workout experience, optimize Home tab intelligence, and clean up technical debt. Each sprint runs on its own git branch for clean rollback. After each sprint: verify with `npm test && npx tsc --noEmit`, then merge to main before starting the next sprint.

---

## Pre-Execution: Read These Files First

Before writing ANY code, read these files in order to understand the full context:

```
MUST READ (in this order):
1. ./CLAUDE.md                                      — Full project context, tech stack, patterns
2. ./docs/active/MASTER_PROMPT_UI_PHASE3.md       — What Phase 3 delivered (context for Phase 4)
3. ./app/(screens)/active-workout.tsx              — Current workout screen (MAIN TARGET FOR K)
4. ./app/(tabs)/home.tsx                           — Home tab with 10+ sections (TARGET FOR L)
5. ./components/training/PRCelebration.tsx         — Animation pattern reference
6. ./components/training/RestTimer.tsx             — Current rest timer (if exists)
7. ./components/ui/GlassCard.tsx                   — Card pattern
8. ./constants/colors.ts                           — Design tokens (SEASON_PHASE_COLORS, GENESIS_COLORS)
9. ./stores/useTrainingStore.ts                    — Training data + session state
10. ./stores/useCoachStore.ts                      — Has `as any` casts to fix in M1
11. ./stores/useWellnessStore.ts                   — Wellness score for Home (L2)
12. ./hooks/useStaggeredEntrance.ts                — Stagger animation hook (reuse in L)
13. ./hooks/useAnimatedCounter.ts                  — Counter hook (reuse in K3)
14. ./types/index.ts                               — Type definitions (PhaseType, etc.)
15. ./data/index.ts                                — PHASE_CONFIG, MOCK_EDUCATION
```

---

## Execution Strategy

### Branch-per-Sprint
```bash
# Sprint K
git checkout main && git pull
git checkout -b sprint-K-workout-flow

# After verified: merge to main
# Sprint L
git checkout -b sprint-L-home-intelligence

# After verified: merge to main
# Sprint M
git checkout -b sprint-M-technical-polish
```

### Parallelization
- **Sprint K**: K1+K2+K3 (independent components) → K4+K5 (integration) → K6 (verify)
- **Sprint L**: L1+L2 (independent components) → L3 (integration) → L4 (verify)
- **Sprint M**: M1+M2+M3 (independent fixes, parallel) → M4 (verify)

### Context Window Management
- Use parallel reads for independent files
- One primary agent for integration/verification
- Keep component implementation focused and modular

---

## Sprint K — "Workout Flow"

### Branch: `sprint-K-workout-flow`

```bash
git checkout main && git pull
git checkout -b sprint-K-workout-flow
```

### Overview
The active workout is where users spend 30-60 minutes per session. It needs to feel as premium as the rest of the app. This sprint enhances the workout experience with exercise transitions, enhanced rest timer, rich post-workout summary, and visible form cues.

---

### Task K1: Exercise Transition Overlay
**File**: `components/training/ExerciseTransition.tsx` (NEW)

When user completes all sets of an exercise and moves to the next, show a brief transition overlay (500ms).

**Structure**:
```typescript
import { View, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useEffect } from 'react';
import { Dumbbell } from 'lucide-react-native';
import { hapticMedium } from '../../utils/haptics';
import { GENESIS_COLORS, SEASON_PHASE_COLORS } from '../../constants/colors';

interface ExerciseTransitionProps {
  exerciseName: string;
  exerciseNumber: number;
  totalExercises: number;
  muscleGroup?: string;
  phaseColor: string;
  onComplete: () => void;
}

export function ExerciseTransition({
  exerciseName,
  exerciseNumber,
  totalExercises,
  muscleGroup,
  phaseColor,
  onComplete,
}: ExerciseTransitionProps) {
  useEffect(() => {
    hapticMedium();
    const timer = setTimeout(onComplete, 500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 5, 5, 0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
    >
      <View style={{ alignItems: 'center', gap: 16 }}>
        {/* Muscle group icon or generic dumbbell */}
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: phaseColor + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Dumbbell size={32} color={phaseColor} />
        </View>

        {/* "Siguiente ejercicio" label */}
        <Text
          style={{
            fontSize: 11,
            fontFamily: 'JetBrainsMonoMedium',
            color: GENESIS_COLORS.textTertiary,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          Siguiente Ejercicio
        </Text>

        {/* Exercise name */}
        <Text
          style={{
            fontSize: 22,
            fontFamily: 'InterBold',
            color: '#FFFFFF',
            textAlign: 'center',
          }}
        >
          {exerciseName}
        </Text>

        {/* Progress indicator */}
        <Text
          style={{
            fontSize: 12,
            fontFamily: 'JetBrainsMonoMedium',
            color: phaseColor,
            letterSpacing: 0.5,
          }}
        >
          {exerciseNumber} de {totalExercises}
        </Text>
      </View>
    </Animated.View>
  );
}

export default ExerciseTransition;
```

**Integration**: In `app/(screens)/active-workout.tsx`, add state + trigger:
```typescript
const [showTransition, setShowTransition] = useState(false);
const [nextExerciseName, setNextExerciseName] = useState('');

// When advancing to next exercise:
const handleAdvanceExercise = () => {
  const nextEx = currentSession.exercises[currentExerciseIndex + 1];
  if (nextEx) {
    setNextExerciseName(nextEx.name);
    setShowTransition(true);
  }
};

// In render, before main content:
{showTransition && (
  <ExerciseTransition
    exerciseName={nextExerciseName}
    exerciseNumber={currentExerciseIndex + 2}
    totalExercises={currentSession.exercises.length}
    phaseColor={phaseConfig.accentColor}
    onComplete={() => {
      setShowTransition(false);
      advanceToNextExercise();
    }}
  />
)}
```

---

### Task K2: Enhanced Rest Timer
**File**: `components/training/EnhancedRestTimer.tsx` (NEW)

Replace or enhance the current rest timer with a circular animated SVG timer.

**Structure**:
```typescript
import { View, Text, Pressable } from 'react-native';
import { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { SkipForward } from 'lucide-react-native';
import { hapticMedium } from '../../utils/haptics';

interface EnhancedRestTimerProps {
  seconds: number; // total rest time
  onComplete: () => void;
  onSkip: () => void;
  phaseColor: string;
  phaseLabel: string; // 'hypertrophy', 'strength', 'power', 'adaptation', 'deload'
}

export function EnhancedRestTimer({
  seconds,
  onComplete,
  onSkip,
  phaseColor,
  phaseLabel,
}: EnhancedRestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const strokeDashoffsetValue = useSharedValue(0);

  // Phase-specific rest tips
  const REST_TIPS: Record<string, string> = {
    hypertrophy: '60-90s para hipertrofia optima',
    strength: '2-3 min para recuperar fuerza',
    power: '3-5 min para maxima potencia',
    adaptation: '60s para mantener ritmo',
    deload: 'Descansa lo que necesites',
  };

  // SVG circle dimensions
  const RADIUS = 75;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  // Timer animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          hapticMedium();
          runOnJS(onComplete)();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Animate stroke dash
  useEffect(() => {
    const progress = (timeLeft / seconds) * 100;
    const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;
    strokeDashoffsetValue.value = withTiming(offset, { duration: 500 });
  }, [timeLeft, seconds, CIRCUMFERENCE]);

  const strokeStyle = useAnimatedStyle(() => ({
    strokeDashoffset: strokeDashoffsetValue.value,
  }));

  return (
    <View
      style={{
        alignItems: 'center',
        gap: 16,
        paddingVertical: 20,
      }}
    >
      {/* Circular SVG Timer */}
      <View style={{ position: 'relative', width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }}>
        <svg width={200} height={200}>
          {/* Background ring */}
          <circle
            cx={100}
            cy={100}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={6}
          />
          {/* Progress ring (animated) */}
          <Animated.View style={[{ position: 'absolute', top: 0, left: 0 }, strokeStyle]}>
            <circle
              cx={100}
              cy={100}
              r={RADIUS}
              fill="none"
              stroke={phaseColor}
              strokeWidth={6}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={0}
              strokeLinecap="round"
            />
          </Animated.View>
        </svg>

        {/* Center time text */}
        <Text
          style={{
            position: 'absolute',
            fontSize: 48,
            fontFamily: 'JetBrainsMono',
            color: '#FFFFFF',
            fontWeight: '700',
          }}
        >
          {timeLeft.toString().padStart(2, '0')}
        </Text>
      </View>

      {/* "Descansando..." label */}
      <Text
        style={{
          fontSize: 12,
          fontFamily: 'Inter',
          color: 'rgba(255,255,255,0.6)',
        }}
      >
        Descansando...
      </Text>

      {/* Skip button */}
      <Pressable
        onPress={() => {
          hapticMedium();
          onSkip();
        }}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: phaseColor + '33',
          backgroundColor: phaseColor + '10',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <SkipForward size={12} color={phaseColor} />
        <Text
          style={{
            fontSize: 12,
            fontFamily: 'InterMedium',
            color: phaseColor,
          }}
        >
          Saltar descanso
        </Text>
      </Pressable>

      {/* Phase-specific tip */}
      <Text
        style={{
          fontSize: 10,
          fontFamily: 'JetBrainsMonoMedium',
          color: 'rgba(255,255,255,0.5)',
          textAlign: 'center',
          maxWidth: 200,
        }}
      >
        {REST_TIPS[phaseLabel] || REST_TIPS.adaptation}
      </Text>
    </View>
  );
}

export default EnhancedRestTimer;
```

**Important Note**: The SVG animation requires proper ref binding in react-native-svg. If using react-native-svg's Animated integration, apply the Animated.View wrapper carefully. Alternatively, use a pure JavaScript animation approach with Reanimated's built-in SVG support.

---

### Task K3: Post-Workout Summary Redesign
**File**: `components/training/WorkoutSummary.tsx` (NEW)

After workout completion, show a rich summary with animated stats cascade.

**Structure**:
```typescript
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { SlideInUp, FadeIn } from 'react-native-reanimated';
import { Dumbbell, Layers, Weight, Clock, Trophy, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';
import GlassCard from '../ui/GlassCard';
import { CoachReviewBadge } from '../coach';
import { GENESIS_COLORS, SEASON_PHASE_COLORS } from '../../constants/colors';
import type { DetectedPR } from '../../utils/prDetection';

interface WorkoutSummaryProps {
  workoutName: string;
  duration: number; // minutes
  exercisesCompleted: number;
  totalSets: number;
  totalVolume: number; // kg
  prs: DetectedPR[];
  phaseColor: string;
  coachReviewed: boolean;
  onClose: () => void;
}

export function WorkoutSummary({
  workoutName,
  duration,
  exercisesCompleted,
  totalSets,
  totalVolume,
  prs,
  phaseColor,
  coachReviewed,
  onClose,
}: WorkoutSummaryProps) {
  const router = useRouter();

  const StatRow = ({ icon: Icon, label, value, color, index }: any) => {
    const animatedValue = useAnimatedCounter({
      from: 0,
      to: value,
      duration: 800,
      delay: index * 300,
    });

    return (
      <Animated.View
        style={{
          marginBottom: 12,
        }}
        entering={SlideInUp.duration(400).delay(index * 300)}
      >
        <GlassCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: color + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={20} color={color} />
              </View>
              <Text style={{ fontSize: 13, fontFamily: 'Inter', color: 'rgba(255,255,255,0.6)' }}>
                {label}
              </Text>
            </View>
            <Animated.Text
              style={{
                fontSize: 18,
                fontFamily: 'JetBrainsMono',
                color: color,
                fontWeight: '700',
              }}
            >
              {animatedValue}
            </Animated.Text>
          </View>
        </GlassCard>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: GENESIS_COLORS.bgVoid }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 24,
          gap: 16,
          paddingBottom: 120,
        }}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)}>
          <View style={{ alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: GENESIS_COLORS.success + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle size={32} color={GENESIS_COLORS.success} />
            </View>
            <Text style={{ fontSize: 20, fontFamily: 'InterBold', color: '#FFFFFF', textAlign: 'center' }}>
              Entrenamiento Completado
            </Text>
            <Text style={{ fontSize: 13, fontFamily: 'Inter', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
              {workoutName} • {duration} min
            </Text>
          </View>
        </Animated.View>

        {/* Stats Cascade */}
        <View>
          <StatRow icon={Dumbbell} label="Ejercicios" value={exercisesCompleted} color={phaseColor} index={0} />
          <StatRow icon={Layers} label="Series" value={totalSets} color={GENESIS_COLORS.info} index={1} />
          <StatRow icon={Weight} label="Volumen" value={totalVolume} color={GENESIS_COLORS.warning} index={2} />
          <StatRow icon={Clock} label="Duracion" value={duration} color={GENESIS_COLORS.cyan} index={3} />
        </View>

        {/* PRs Section */}
        {prs.length > 0 && (
          <Animated.View entering={SlideInUp.duration(400).delay(1200)}>
            <GlassCard>
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Trophy size={18} color="#FFD700" />
                  <Text style={{ fontSize: 14, fontFamily: 'InterBold', color: '#FFFFFF' }}>
                    Nuevos Records
                  </Text>
                </View>
                {prs.map((pr, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingVertical: 8,
                      borderTopWidth: i === 0 ? 0 : 1,
                      borderTopColor: 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <Text style={{ fontSize: 12, fontFamily: 'Inter', color: 'rgba(255,255,255,0.7)' }}>
                      {pr.exerciseName}
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: 'JetBrainsMono', color: '#FFD700', fontWeight: '700' }}>
                      {pr.newValue} {pr.type === 'weight' ? 'kg' : 'reps'}
                    </Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Coach Review Badge */}
        {coachReviewed && (
          <Animated.View entering={SlideInUp.duration(400).delay(1500)}>
            <CoachReviewBadge visible={true} />
          </Animated.View>
        )}

        {/* GENESIS Message */}
        <Animated.View entering={SlideInUp.duration(400).delay(1800)}>
          <GlassCard>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 20, color: GENESIS_COLORS.primary }}>✨</Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: 'InterItalic',
                  color: 'rgba(255,255,255,0.6)',
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                Excelente sesion. Recuperate bien y prepárate para el proximo entrenamiento.
              </Text>
            </View>
          </GlassCard>
        </Animated.View>
      </ScrollView>

      {/* Close Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingVertical: 24,
        }}
      >
        <LinearGradient
          colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 14, overflow: 'hidden' }}
        >
          <Pressable
            onPress={onClose}
            style={{
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, fontFamily: 'InterBold', color: '#FFFFFF' }}>Cerrar</Text>
          </Pressable>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

export default WorkoutSummary;
```

---

### Task K4: Form Cues Display
**File**: `components/training/FormCues.tsx` (NEW)

Show exercise form cues during the active set.

**Structure**:
```typescript
import { View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import { GENESIS_COLORS } from '../../constants/colors';

interface FormCuesProps {
  cues: string[];
  visible: boolean;
}

export function FormCues({ cues, visible }: FormCuesProps) {
  const [expanded, setExpanded] = useState(false);
  const heightValue = useSharedValue(0);

  const toggleCues = () => {
    setExpanded(!expanded);
    heightValue.value = withTiming(expanded ? 0 : 200, { duration: 250 });
  };

  const heightStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
  }));

  if (!visible || cues.length === 0) return null;

  return (
    <View style={{ marginVertical: 12 }}>
      <Pressable
        onPress={toggleCues}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderBottomWidth: expanded ? 1 : 0,
          borderBottomColor: GENESIS_COLORS.borderSubtle,
        }}
      >
        <Text style={{ fontSize: 12, fontFamily: 'InterMedium', color: GENESIS_COLORS.primary }}>
          Ver indicaciones
        </Text>
        {expanded ? (
          <ChevronUp size={16} color={GENESIS_COLORS.primary} />
        ) : (
          <ChevronDown size={16} color={GENESIS_COLORS.primary} />
        )}
      </Pressable>

      {expanded && (
        <GlassCard>
          <View style={{ gap: 8 }}>
            {cues.map((cue, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                <View
                  style={{
                    width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: GENESIS_COLORS.primary,
                  marginTop: 5,
                  flexShrink: 0,
                }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'Inter',
                    color: 'rgba(255,255,255,0.6)',
                    flex: 1,
                    lineHeight: 18,
                  }}
                >
                  {cue}
                </Text>
              </View>
            ))}
          </View>
        </GlassCard>
      )}
    </View>
  );
}

export default FormCues;
```

---

### Task K5: Integration into active-workout.tsx
**File**: `app/(screens)/active-workout.tsx` (MODIFY)

Integrate K1-K4 components:

1. **Import new components**:
```typescript
import { ExerciseTransition } from '../../components/training/ExerciseTransition';
import { EnhancedRestTimer } from '../../components/training/EnhancedRestTimer';
import { WorkoutSummary } from '../../components/training/WorkoutSummary';
import { FormCues } from '../../components/training/FormCues';
```

2. **Add state for transitions**:
```typescript
const [showTransition, setShowTransition] = useState(false);
const [nextExerciseName, setNextExerciseName] = useState('');
```

3. **Replace ExerciseForm render with FormCues**:
```typescript
{currentExercise && (
  <View>
    <ExerciseForm {...props} />
    <FormCues
      cues={currentExercise.formCues || []}
      visible={true}
    />
  </View>
)}
```

4. **Replace RestTimer**:
```typescript
{(isRestTimerActive || restTimeRemaining > 0) && (
  <EnhancedRestTimer
    seconds={phaseConfig.restSeconds}
    onComplete={() => {
      hapticMedium();
      // timer complete logic
    }}
    onSkip={() => {
      // skip timer logic
    }}
    phaseColor={phaseConfig.accentColor}
    phaseLabel={phase}
  />
)}
```

5. **Replace WorkoutComplete with WorkoutSummary**:
```typescript
if (showComplete) {
  return (
    <WorkoutSummary
      workoutName={currentSession.exercises[0]?.name || 'Workout'}
      duration={Math.floor(elapsedSeconds / 60)}
      exercisesCompleted={currentSession.exercises.filter(e => e.completed).length}
      totalSets={currentSession.exercises.reduce((sum, e) => sum + (e.exerciseSets?.length ?? 0), 0)}
      totalVolume={calculateTotalVolume(currentSession.exercises)}
      prs={detectedPRs}
      phaseColor={phaseConfig.accentColor}
      coachReviewed={false} // TODO: get from session data
      onClose={handleDismiss}
    />
  );
}
```

---

### Task K6: Verify Sprint K
```bash
npx tsc --noEmit
npm test
```

**Checklist**:
- [ ] Exercise transitions show smooth overlay between exercises (500ms)
- [ ] Enhanced rest timer displays circular SVG animation with phase tips
- [ ] Rest timer has "Saltar descanso" button with haptic
- [ ] Post-workout summary shows stats cascade with useAnimatedCounter
- [ ] PRs display with gold text if detected
- [ ] CoachReviewBadge appears only when visible={true}
- [ ] Form cues show collapsible card with bullet points
- [ ] All animations use react-native-reanimated
- [ ] No TypeScript errors (should match pre-existing count)
- [ ] Tests still pass (45/45)

---

### Commit K
```bash
git add -A
git commit -m "Sprint K: Workout Flow — Premium Active Workout Experience

- Exercise transition overlay (500ms) with phase-colored icon
- Enhanced rest timer with circular SVG animation and phase-specific tips
- Post-workout summary with stat cascade (useAnimatedCounter) + PR section
- Form cues collapsible card during active sets
- Full integration into active-workout.tsx
- All animations use react-native-reanimated
- Haptic feedback on transitions and timer complete"

git checkout main && git merge sprint-K-workout-flow
```

---

## Sprint L — "Home Intelligence"

### Branch: `sprint-L-home-intelligence`

```bash
git checkout main && git pull
git checkout -b sprint-L-home-intelligence
```

### Overview
Home has 10+ sections. Instead of adding more, make it smarter. This sprint adds a collapsible section wrapper and a daily wellness indicator at the top, reducing default scroll length by ~30% while keeping all content accessible.

---

### Task L1: Collapsible Section Wrapper
**File**: `components/ui/CollapsibleSection.tsx` (NEW)

A reusable wrapper that makes any Home section collapsible.

**Structure**:
```typescript
import { View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { GENESIS_COLORS } from '../../constants/colors';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  accentColor?: string;
  storageKey?: string;
}

export function CollapsibleSection({
  title,
  subtitle,
  defaultExpanded = false,
  children,
  accentColor = GENESIS_COLORS.primary,
  storageKey,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const chevronRotate = useSharedValue(defaultExpanded ? 0 : 180);

  // Load persisted state
  useEffect(() => {
    if (storageKey) {
      AsyncStorage.getItem(storageKey).then((val) => {
        if (val !== null) {
          const isExpanded = val === 'true';
          setExpanded(isExpanded);
          chevronRotate.value = isExpanded ? 0 : 180;
        }
      });
    }
  }, [storageKey]);

  const toggleExpand = async () => {
    const newState = !expanded;
    setExpanded(newState);
    chevronRotate.value = withTiming(newState ? 0 : 180, { duration: 250 });
    if (storageKey) {
      await AsyncStorage.setItem(storageKey, newState ? 'true' : 'false');
    }
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotate.value}deg` }],
  }));

  const contentHeight = useSharedValue(expanded ? 1 : 0);
  const contentStyle = useAnimatedStyle(() => ({
    height: contentHeight.value === 0 ? 0 : 'auto',
    opacity: contentHeight.value,
  }));

  return (
    <View>
      {/* Header */}
      <Pressable
        onPress={toggleExpand}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontFamily: 'InterBold', color: GENESIS_COLORS.textPrimary }}>
            {title}
          </Text>
          {subtitle && (
            <Text style={{ fontSize: 10, fontFamily: 'Inter', color: GENESIS_COLORS.textTertiary, marginTop: 2 }}>
              {subtitle}
            </Text>
          )}
        </View>

        <Animated.View style={chevronStyle}>
          <ChevronDown size={18} color={accentColor} />
        </Animated.View>
      </Pressable>

      {/* Content */}
      {expanded && (
        <View style={{ gap: 12, marginBottom: 12 }}>
          {children}
        </View>
      )}
    </View>
  );
}

export default CollapsibleSection;
```

---

### Task L2: Daily Wellness Indicator
**File**: `components/ui/WellnessIndicator.tsx` (NEW)

Compact indicator at the top of Home showing wellness state.

**Structure**:
```typescript
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Plus } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';

interface WellnessIndicatorProps {
  score: number; // 0-100
  mood: string | null;
  hasCheckedIn: boolean;
  onCheckInPress?: () => void;
}

const SCORE_COLORS = {
  high: '#00F5AA', // 80-100
  good: '#00D4FF', // 60-79
  moderate: '#FFD93D', // 40-59
  low: '#FF6B6B', // 0-39
};

function getColorByScore(score: number): string {
  if (score >= 80) return SCORE_COLORS.high;
  if (score >= 60) return SCORE_COLORS.good;
  if (score >= 40) return SCORE_COLORS.moderate;
  return SCORE_COLORS.low;
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bien';
  if (score >= 40) return 'Normal';
  return 'Bajo';
}

export function WellnessIndicator({
  score,
  mood,
  hasCheckedIn,
  onCheckInPress,
}: WellnessIndicatorProps) {
  const router = useRouter();
  const color = getColorByScore(score);
  const label = hasCheckedIn ? getScoreLabel(score) : 'Sin check-in';

  const handlePress = () => {
    if (!hasCheckedIn) {
      router.push('/(modals)/check-in');
    }
  };

  return (
    <View
      style={{
        height: 48,
        borderRadius: 12,
        backgroundColor: color + '10',
        borderWidth: 1,
        borderColor: color + '33',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
        justifyContent: 'space-between',
      }}
    >
      {/* Left: Score number */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'JetBrainsMono',
            color: color,
            fontWeight: '700',
          }}
        >
          {hasCheckedIn ? `${Math.round(score)}` : '--'}
        </Text>

        {/* Center: Label */}
        <Text
          style={{
            fontSize: 12,
            fontFamily: 'Inter',
            color: GENESIS_COLORS.textSecondary,
          }}
        >
          {label}
        </Text>
      </View>

      {/* Right: Check-in CTA or checkmark */}
      {hasCheckedIn ? (
        <Check size={16} color={color} />
      ) : (
        <Pressable
          onPress={handlePress}
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Plus size={12} color={GENESIS_COLORS.primary} />
          <Text
            style={{
              fontSize: 11,
              fontFamily: 'InterMedium',
              color: GENESIS_COLORS.primary,
            }}
          >
            Check-in
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export default WellnessIndicator;
```

---

### Task L3: Integration into Home Tab
**File**: `app/(tabs)/home.tsx` (MODIFY)

1. **Import new components**:
```typescript
import { CollapsibleSection } from '../../components/ui/CollapsibleSection';
import { WellnessIndicator } from '../../components/ui/WellnessIndicator';
```

2. **Get wellness data**:
```typescript
const { score: wellnessScore, todayCheckIn } = useWellnessStore((s) => ({
  score: s.wellnessScore || 0,
  todayCheckIn: s.todayCheckIn,
}));
```

3. **Add WellnessIndicator after SeasonHeader**:
```typescript
{/* Season Header */}
<SeasonHeader ... />

{/* Wellness Indicator — NEW */}
<WellnessIndicator
  score={wellnessScore}
  mood={todayCheckIn?.mood || null}
  hasCheckedIn={!!todayCheckIn}
/>
```

4. **Wrap lower-priority sections with CollapsibleSection**:
```typescript
{/* This Week Progress — Collapsible */}
<CollapsibleSection
  title="ESTA SEMANA"
  subtitle={`${completedDays}/7 dias completados`}
  defaultExpanded={false}
  storageKey="genesis_section_thisWeek"
  accentColor={phaseConfig.accentColor}
>
  <GlassCard shine>
    {/* existing progress bar + days */}
  </GlassCard>
  <CoachReviewBadge visible={false} />
</CollapsibleSection>

{/* Season Progress — Collapsible */}
<CollapsibleSection
  title="SEASON"
  subtitle={`Semana ${currentWeek} de 12`}
  defaultExpanded={false}
  storageKey="genesis_section_season"
  accentColor={phaseConfig.accentColor}
>
  {/* existing season progress content */}
</CollapsibleSection>

{/* Streak — Collapsible */}
<CollapsibleSection
  title="RACHA"
  defaultExpanded={false}
  storageKey="genesis_section_streak"
  accentColor={GENESIS_COLORS.warning}
>
  <GlassCard>
    {/* existing streak content */}
  </GlassCard>
</CollapsibleSection>
```

5. **Keep these sections always visible** (no wrapper):
- SeasonHeader
- WellnessIndicator (new)
- GENESIS Daily Briefing
- Proactive Insight
- CoachNotes
- WeeklyWrap
- Quick Metrics
- HOY (Daily Missions)
- GENESIS Recommends

---

### Task L4: Verify Sprint L
```bash
npx tsc --noEmit
npm test
```

**Checklist**:
- [ ] WellnessIndicator shows at top of Home (after SeasonHeader)
- [ ] WellnessIndicator color changes by score (red/yellow/cyan/green)
- [ ] WellnessIndicator shows "Check-in" CTA if not checked in
- [ ] WellnessIndicator shows checkmark if already checked in
- [ ] CollapsibleSection toggles smoothly (ChevronDown rotates)
- [ ] Collapsed state persists to AsyncStorage
- [ ] "ESTA SEMANA", "SEASON", "RACHA" sections are collapsible
- [ ] Default collapsed (reduce scroll by ~30%)
- [ ] High-priority sections always visible
- [ ] No TypeScript errors
- [ ] Tests still pass (45/45)

---

### Commit L
```bash
git add -A
git commit -m "Sprint L: Home Intelligence — Wellness-First Design

- WellnessIndicator at top of Home (score, mood, check-in CTA)
- CollapsibleSection wrapper for lower-priority sections
- ESTA SEMANA, SEASON, RACHA now collapsible with state persistence
- Default collapsed to reduce scroll length ~30%
- All high-priority sections always visible
- Wellness score indicator colors (red/yellow/cyan/green by score)"

git checkout main && git merge sprint-L-home-intelligence
```

---

## Sprint M — "Technical Polish"

### Branch: `sprint-M-technical-polish`

```bash
git checkout main && git pull
git checkout -b sprint-M-technical-polish
```

### Overview
Fix pre-existing technical debt and prepare for production. This sprint removes `as any` casts, resolves TypeScript errors, and optimizes performance with React.memo and useMemo/useCallback patterns.

---

### Task M1: Fix useCoachStore `as any` Casts
**File**: `stores/useCoachStore.ts` (MODIFY)

Replace unsafe `as any` casts with proper typing:

```typescript
// Add at top of file
interface CoachNoteRow {
  id: string;
  user_id: string;
  message: string;
  type: 'observation' | 'encouragement' | 'adjustment' | 'milestone';
  read: boolean;
  created_at: string;
}

// Replace fetchLatestNote:
fetchLatestNote: async () => {
  if (!hasSupabaseConfig) return;
  set({ isLoading: true });
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const { data, error } = await supabaseClient
      .from('coach_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      set({ latestNote: null, isRead: true });
      return;
    }

    const note = data as CoachNoteRow;
    set({
      latestNote: {
        id: note.id,
        user_id: note.user_id,
        message: note.message,
        type: note.type,
        read: note.read,
        created_at: note.created_at,
      },
      isRead: note.read
    });
  } catch (e) {
    console.warn('Failed to fetch coach note:', e);
  } finally {
    set({ isLoading: false });
  }
},

// Replace fetchAllNotes:
fetchAllNotes: async () => {
  if (!hasSupabaseConfig) return;
  set({ isLoading: true });
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const { data, error } = await supabaseClient
      .from('coach_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) {
      set({ notes: [] });
      return;
    }

    set({ notes: data as CoachNoteRow[] });
  } catch (e) {
    console.warn('Failed to fetch coach notes:', e);
    set({ notes: [] });
  } finally {
    set({ isLoading: false });
  }
},

// Replace markAsRead:
markAsRead: async (noteId: string) => {
  if (!hasSupabaseConfig) return;
  try {
    const { error } = await supabaseClient
      .from('coach_notes')
      .update({ read: true })
      .eq('id', noteId);

    if (error) throw error;

    set((state) => ({
      isRead: state.latestNote?.id === noteId ? true : state.isRead,
      notes: state.notes.map((n) =>
        n.id === noteId ? { ...n, read: true } : n
      ),
    }));
  } catch (e) {
    console.warn('Failed to mark note as read:', e);
  }
},
```

---

### Task M2: Fix Pre-existing TypeScript Errors
**File**: Various (MODIFY)

Run `npx tsc --noEmit 2>&1 | head -100` to identify all errors. For each:

**Common patterns**:
1. Implicit `any` on function parameters → Add type annotation
2. Unused variables → Remove or prefix with `_`
3. Type mismatches → Check parameter vs expected type
4. Optional chaining without null guard → Add guard or use `?.`

**Example fixes**:
```typescript
// Before
const handleLogSet = (exerciseId, setNumber, data) => { ... }

// After
const handleLogSet = (exerciseId: string, setNumber: number, data: { actualReps: number; actualWeight: number; rpe?: number }) => { ... }

// Before
const { value } = useSharedValue(0);

// After
const animatedValue = useSharedValue(0);
```

For each fix, note it in the commit message.

---

### Task M3: Performance Audit
**File**: home.tsx, active-workout.tsx, all stores (MODIFY)

1. **home.tsx** — Check for:
   - [ ] Inline functions in render wrapped with useCallback
   - [ ] Object literals in styles extracted or moved outside
   - [ ] Heavy children wrapped with React.memo

Example:
```typescript
// Before
<MissionCard onPress={() => router.push('/(tabs)/train')} />

// After
const handleTrainPress = useCallback(() => {
  router.push('/(tabs)/train');
}, [router]);

<MissionCard onPress={handleTrainPress} />
```

2. **active-workout.tsx** — Check for:
   - [ ] Timer intervals cleaned up on unmount
   - [ ] Expensive computations wrapped in useMemo
   - [ ] State updates batched (not multiple setState calls)

Example:
```typescript
// Before
useEffect(() => {
  const handle = setInterval(() => tickElapsed(), 1000);
  // missing cleanup!
}, []);

// After
useEffect(() => {
  const handle = setInterval(() => tickElapsed(), 1000);
  return () => clearInterval(handle); // cleanup!
}, [tickElapsed]);
```

3. **Memoize heavy components**:
```typescript
const MissionCard = React.memo(function MissionCard({ ... }: MissionCardProps) {
  // component code
});

const MetricMini = React.memo(function MetricMini({ ... }: MetricMiniProps) {
  // component code
});
```

---

### Task M4: Verify Sprint M
```bash
npx tsc --noEmit  # Should show 0 errors (or same pre-existing count)
npm test          # Should be 45/45
```

**Final checklist**:
- [ ] Zero `as any` casts in useCoachStore
- [ ] All pre-existing TypeScript errors fixed
- [ ] No new TypeScript errors introduced
- [ ] useCallback on all inline functions passed as props
- [ ] useMemo on expensive computations (object literals, array maps)
- [ ] React.memo on heavy components (WorkoutSummary, MissionCard, MetricMini)
- [ ] useEffect cleanup functions on all intervals/subscriptions
- [ ] No console.log statements (use error handling)
- [ ] No new npm dependencies
- [ ] Tests pass (45/45)
- [ ] No regressions in Phase 3 features (phase briefing, weekly wrap, season complete)

---

### Commit M
```bash
git add -A
git commit -m "Sprint M: Technical Polish — Debt Resolution & Performance

- Fixed all 'as any' casts in useCoachStore with proper CoachNoteRow typing
- Resolved 6 pre-existing TypeScript errors (implicit any, unused vars, type mismatches)
- Added useCallback wrappers for inline functions in home.tsx and active-workout.tsx
- Memoized heavy components (WorkoutSummary, MissionCard, MetricMini, etc.)
- Added useMemo for expensive computations (nutrition totals, wellness calcs)
- Added cleanup on timer intervals in active-workout.tsx
- Zero breaking changes to Phase 3 features
- All tests pass (45/45), TypeScript clean"

git checkout main && git merge sprint-M-technical-polish
```

---

## Constraints & Rules

### DO
- ✅ Read ALL files in pre-execution list before ANY code
- ✅ Create git branch per sprint (sprint-K, sprint-L, sprint-M)
- ✅ Run `npm test && npx tsc --noEmit` after every sprint
- ✅ Follow existing patterns (GlassCard, GENESIS_COLORS, useStaggeredEntrance)
- ✅ Use react-native-reanimated for all animations
- ✅ Keep ALL text in Spanish
- ✅ Use AsyncStorage for client-side persistence
- ✅ Compute values inline in components, NEVER call store methods in Zustand selectors
- ✅ Use try/catch with graceful fallbacks on all Supabase queries
- ✅ Add haptic feedback on major interactions
- ✅ Preserve all existing functionality — only add, don't remove
- ✅ Use useAnimatedCounter and useStaggeredEntrance hooks throughout
- ✅ Use React.memo for heavy components
- ✅ Use useCallback for inline function props
- ✅ Use useMemo for expensive computations

### DON'T
- ❌ DO NOT modify BFF/backend — all changes frontend-only
- ❌ DO NOT create/alter Supabase tables
- ❌ DO NOT add npm dependencies
- ❌ DO NOT modify tab navigation structure
- ❌ DO NOT break existing animation patterns
- ❌ DO NOT use hardcoded colors — always SEASON_PHASE_COLORS or GENESIS_COLORS
- ❌ DO NOT make Zustand selectors that call store methods
- ❌ DO NOT modify existing test files
- ❌ DO NOT use emojis in code
- ❌ DO NOT create new TypeScript errors
- ❌ DO NOT use `as any` casts without justification

---

## Session Success Criteria

After all 3 sprints:
- [ ] **K1**: Exercise transitions show smooth overlay between exercises (500ms)
- [ ] **K2**: Enhanced rest timer with circular SVG animation and phase tips
- [ ] **K3**: Post-workout summary with stats cascade and PR celebration
- [ ] **K4**: Form cues visible and collapsible during active sets
- [ ] **K5**: All components integrated into active-workout.tsx
- [ ] **L1**: CollapsibleSection wrapper with state persistence
- [ ] **L2**: WellnessIndicator at top of Home with score-based colors
- [ ] **L3**: Home sections properly collapsed (reduce scroll ~30%)
- [ ] **M1**: Zero `as any` casts in useCoachStore
- [ ] **M2**: All pre-existing TypeScript errors fixed
- [ ] **M3**: Performance optimizations (React.memo, useCallback, useMemo) applied
- [ ] **M4**: `npx tsc --noEmit` passes with 0 errors
- [ ] **All**: `npm test` passes (45/45)
- [ ] **All**: 3 clean commits on main (one per sprint)
- [ ] **All**: No new npm dependencies

---

## Notes & Tips

- **Phase Colors**: Always use SEASON_PHASE_COLORS[phase] or phaseConfig.accentColor for phase-aware coloring
- **Haptics**: Use hapticMedium() for transitions, hapticHeavy() for celebrations
- **AsyncStorage Keys**: Use descriptive keys: `genesis_section_{title}`, `genesis_lastSeenPhase`, etc.
- **SVG Animation**: Carefully test circular progress ring with react-native-svg's Animated integration
- **Collapsible State**: Persist to AsyncStorage with key format `genesis_section_{TITLE}`
- **WellnessIndicator**: Score colors follow pattern: red < 40, yellow 40-59, cyan 60-79, green 80-100
- **Performance**: Profile with React DevTools before/after memoization changes
- **Testing**: Run `npm test` after each component to catch regressions early

---

## References

- **Active Workout Structure**: See `app/(screens)/active-workout.tsx` for current integration points
- **Home Tab Structure**: See `app/(tabs)/home.tsx` for staggered sections and ordering
- **Animation Hooks**: Reuse useAnimatedCounter, useStaggeredEntrance from existing hooks
- **Color System**: All colors from GENESIS_COLORS and SEASON_PHASE_COLORS in constants/colors.ts
- **Component Patterns**: GlassCard, LinearGradient CTAs, SafeAreaView layouts
- **Zustand**: State primitives only, compute inline, use try/catch on data fetches

---

## Success Looks Like

After executing these 3 sprints:
- Active workout experience feels cinematic and premium (transitions, enhanced timer, rich summary)
- Home tab is intelligent and less dense (collapsible sections, wellness indicator)
- Zero TypeScript errors and clean code (no `as any`, performance optimized)
- All existing features still work (Phase 3 ceremony, education, coach notes)
- Users perceive the app as faster and more polished
- Code is maintainable and follows established patterns

This is Phase 4 complete: Core Experience.
