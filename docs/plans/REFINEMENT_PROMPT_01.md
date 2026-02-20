# Refinement Prompt #1: Chat-First UI Polish Pass

## Context

You are continuing work on `feat/chat-first-ui` branch of the GENESIS app. The initial 7-phase implementation is complete. This prompt addresses 6 specific refinements identified during visual review against the design document (`docs/plans/2026-02-19-chat-first-redesign.md`).

**Read first:** `CLAUDE.md`, then `docs/plans/2026-02-19-chat-first-redesign.md` (Section 4.2 — Quick Actions Bar).

## Refinements — Execute in Order

---

### R1: Quick Action Pills — Context-Awareness Fix

**File:** `components/chat/QuickActionsBar.tsx`

**Problem:** Pills only use time of day. They don't cross-reference the user's training state. Example: at 5-7pm on a REST DAY, the pills show "Post-entreno, Recovery" — which makes no sense if the user didn't train. The logic must check BOTH time AND training status.

**Fix:** Import `useTrainingStore` to read `todayPlan`. Use it to determine if today is a rest day or training day, and whether a workout was completed.

Replace the `getTimePills()` function with a new `getContextualPills()` that receives `{ todayPlan, hasCompletedWorkout }` as params:

```typescript
import { useTrainingStore } from '../../stores';

type PillContext = {
  todayPlan: any | null;       // null = rest day
  hasCompletedWorkout: boolean; // true if today's workout was logged
};

function getContextualPills(ctx: PillContext): string[] {
  const hour = new Date().getHours();
  const isRestDay = !ctx.todayPlan;
  const didTrain = ctx.hasCompletedWorkout;

  // Morning (6-10)
  if (hour >= 6 && hour < 11) {
    const base = ['☀️ Mi briefing', '📋 Check-in'];
    if (isRestDay) return [...base, '🫁 Breathwork', '📚 LOGOS'];
    return [...base, '🏋️ ¿Qué entreno hoy?', '🫁 Breathwork'];
  }

  // Pre-workout window (11-13) — only if training day & not yet trained
  if (hour >= 11 && hour < 13 && !isRestDay && !didTrain) {
    return ['⏱ Empezar workout', '🔥 Calentamiento', '🍌 ¿Qué como antes?'];
  }

  // Midday (11-15) — rest day or already trained
  if (hour >= 11 && hour < 15) {
    if (didTrain) return ['📊 Resumen del workout', '🍽 ¿Qué como ahora?', '🧊 Recovery tips'];
    return ['🍽 Loggear comida', '💧 Registrar agua', '📷 Escanear comida'];
  }

  // Afternoon (15-17) — general
  if (hour >= 15 && hour < 17) {
    return ['🍽 Loggear comida', '💧 Registrar agua', '📷 Escanear comida'];
  }

  // Late afternoon/Evening (17-20) — post-workout IF trained, else general
  if (hour >= 17 && hour < 20) {
    if (didTrain) return ['📊 Resumen del workout', '🍽 ¿Qué como ahora?', '🧊 Recovery tips'];
    if (!isRestDay && !didTrain) return ['⏱ Empezar workout', '🍽 Loggear comida', '💧 Registrar agua'];
    return ['📈 ¿Cómo voy?', '🍽 Loggear comida', '💧 Registrar agua'];
  }

  // Evening (20-23)
  if (hour >= 20 && hour < 23) {
    return ['📊 Resumen del día', '🧘 Meditación', '🌙 Rutina de sueño'];
  }

  // Late night (23-6)
  return ['🌙 Rutina de sueño', '🧘 Meditación', '📊 Resumen del día'];
}
```

Update the ALWAYS_PILLS to also include emojis:

```typescript
const ALWAYS_PILLS = ['📈 ¿Cómo voy?', '🏆 PRs', '📚 LOGOS'] as const;
```

Update the component to read from the store:

```typescript
export function QuickActionsBar({ onSend }: QuickActionsBarProps) {
  const todayPlan = useTrainingStore((s) => s.todayPlan);
  // If your store tracks workout completion, use it. Otherwise default to false.
  const hasCompletedWorkout = false; // TODO: wire to real state when available

  const pills = useMemo(
    () => [...getContextualPills({ todayPlan, hasCompletedWorkout }), ...ALWAYS_PILLS],
    [todayPlan, hasCompletedWorkout],
  );
  // ... rest unchanged
}
```

**Important:** The `useMemo` dependency array MUST include `todayPlan` and `hasCompletedWorkout` so pills recalculate when state changes.

---

### R2: Quick Action Pills — Glassmorphism Chip Style

**File:** `components/chat/QuickActionsBar.tsx`

**Problem:** Pills look like flat monospace text on a plain background. The design doc specifies "glassmorphism chips with subtle `#6D00FF` border" — they should match the GlassCard visual language.

**Fix:** Update the Pressable style to add glassmorphism effect:

```typescript
style={({ pressed }) => ({
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 20,               // more rounded, pill shape
  backgroundColor: pressed
    ? 'rgba(109, 0, 255, 0.15)'
    : 'rgba(255, 255, 255, 0.04)', // more subtle base
  borderWidth: 1,
  borderColor: pressed
    ? 'rgba(109, 0, 255, 0.5)'
    : 'rgba(109, 0, 255, 0.2)',    // softer default border
  // Glassmorphism: if BlurView is available, use it. Otherwise this backdrop approximation:
  shadowColor: '#6D00FF',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: pressed ? 0.2 : 0.05,
  shadowRadius: 8,
  elevation: pressed ? 3 : 1,
})}
```

Also update the Text style — remove `textTransform: 'uppercase'` since the pills now have emojis (uppercase removes emoji readability and looks aggressive). Use mixed case:

```typescript
<Text
  style={{
    fontFamily: 'Inter_500Medium',   // Switch from JetBrainsMono to Inter for pills
    fontSize: 13,                     // slightly larger for readability
    color: pressed ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.2,
  }}
>
  {pill}
</Text>
```

---

### R3: BriefingCard — Wire Real Data + Add Missing Fields

**File:** `components/chat/BriefingCard.tsx`

**Problem:** Kcal and recovery are hardcoded strings. Missing: Watch metrics (sleep, steps), streak counter. The design doc specifies 5 data points: training, nutrition, Watch, streak, recovery.

**Fix:** Import additional stores and compute values:

```typescript
import { useNutritionStore } from '../../stores/useNutritionStore';
import { useTrackStore } from '../../stores/useTrackStore';
// If useHealthKit hook is available:
// import { useHealthKit } from '../../hooks/useHealthKit';
```

Replace hardcoded values:

```typescript
// Nutrition — read primitives, compute inline (Zustand pattern)
const meals = useNutritionStore((s) => s.meals);
const nutritionTargets = useNutritionStore((s) => s.targets);
const consumedKcal = useMemo(() => {
  return meals.reduce((sum, m) => sum + (m.calories || 0), 0);
}, [meals]);
const targetKcal = nutritionTargets?.calories ?? 2400;
const kcalLabel = `${consumedKcal.toLocaleString()}/${targetKcal.toLocaleString()} kcal`;

// Streak
const streak = useTrackStore((s) => s.streak);

// Watch / HealthKit (graceful fallback if not available)
// const { sleepScore, steps } = useHealthKit();
// For now, use placeholders that indicate "no data" rather than fake numbers:
const sleepLabel = null; // Will become: `${sleepScore}/100 sueño`
const stepsLabel = null; // Will become: `${steps.toLocaleString()} pasos`

// Recovery — derive from real data when available, show "—" otherwise
const recoveryLabel = '— Recovery'; // TODO: derive from sleep + HRV when Watch is connected
```

Add the missing rows to the expanded view (after the existing Recovery row):

```tsx
{/* Streak row — only show if streak >= 1 */}
{streak > 0 && (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
    <Text style={{ fontSize: ICON_SIZE }}>🔥</Text>
    <Text
      style={{
        fontFamily: 'Inter_500Medium',
        fontSize: 14,
        color: GENESIS_COLORS.primary,
      }}
    >
      {streak} días de racha
    </Text>
  </View>
)}

{/* Watch metrics — only show if data available */}
{sleepLabel && (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
    <Text style={{ fontSize: ICON_SIZE }}>⌚</Text>
    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: GENESIS_COLORS.textSecondary }}>
      {sleepLabel} · {stepsLabel}
    </Text>
  </View>
)}
```

Also update the collapsed summary to include streak:

```tsx
Semana {currentWeek} · {workoutLabel} · {kcalLabel}{streak > 0 ? ` · 🔥${streak}` : ''}
```

---

### R4: Spanish Accent Marks & Orthography

**Files to fix (multiple):**

**`components/chat/BriefingCard.tsx`:**
- `'Buenos dias'` → `'Buenos días'`
- `'Dia de descanso'` → `'Día de descanso'`

**`app/(chat)/index.tsx`:**
- `'En que puedo ayudarte?'` → `'¿En qué puedo ayudarte?'`
- `'Preguntame sobre entrenamiento, nutricion, recuperacion o bienestar.'` → `'Pregúntame sobre entrenamiento, nutrición, recuperación o bienestar.'`

**`components/chat/QuickActionsBar.tsx`** (after R1 fix, verify these too):
- `'Que entreno?'` → `'¿Qué entreno hoy?'`
- `'Resumen del dia'` → `'Resumen del día'`
- `'Meditacion'` → `'Meditación'`
- `'Rutina sueno'` → `'Rutina de sueño'`
- `'Como voy?'` → `'¿Cómo voy?'`

**Global search:** Run `grep -rn "dia\b\|dias\b\|nutricion\b\|recuperacion\b\|meditacion\b\|sueno\b" --include="*.tsx" --include="*.ts" components/ app/` and fix ALL missing accents in user-facing strings. This is a premium Spanish-language app — orthography must be perfect.

---

### R5: Drawer — Verify Space Emoji Icons

**File:** `components/chat/SpaceDrawer.tsx`

**Verify** that the 3 Spaces use the exact emojis from the design doc:
- LOGOS: `📚` (open book)
- Season Hub: `🗓` (calendar pad / spiral calendar)
- Labs: `🔬` (microscope)

If different emojis are being used, update them. Also verify "Hoy" uses a distinct visual indicator (e.g., a pulsing dot or a subtle violet left border) to show it's the active thread.

---

### R6: Empty State — Accent & Visual Polish

**File:** `app/(chat)/index.tsx`

**Problem:** The empty state text has no opening question mark (`¿`) and missing accents.

Already addressed in R4 for the text. Additionally:

- **Add a subtle gradient text effect** to "¿En qué puedo ayudarte?" if possible (or at minimum, make it `GENESIS_COLORS.textPrimary` which should be white).
- **Description text** should use `GENESIS_COLORS.textMuted` (more subtle than secondary) to create hierarchy.
- **Verify** the pulse animation ring border color is `rgba(109, 0, 255, 0.3)` — matches the plan.

---

## Verification

After all 6 refinements:

```bash
# 1. App compiles
npm start

# 2. Tests pass (no store/service changes)
npm test

# 3. Manual check:
# - Open app on rest day evening → pills should show "📊 Resumen del día", "🧘 Meditación", "🌙 Rutina de sueño" (NOT post-entreno)
# - Pills have glassmorphism chip style with violet border glow
# - BriefingCard shows real kcal from nutrition store
# - BriefingCard shows streak if > 0
# - All Spanish text has correct accents (días, qué, nutrición, etc.)
# - Drawer spaces show 📚 🗓 🔬 emojis
# - Empty state: "¿En qué puedo ayudarte?" with ¿ and accent
```

## Constraints

- ✅ DO import from existing stores — `useTrainingStore`, `useNutritionStore`, `useTrackStore`
- ✅ DO read primitives from selectors (Zustand pattern — never call methods inside selectors)
- ✅ DO compute derived values inline with `useMemo`
- ❌ DO NOT modify any store files
- ❌ DO NOT modify BFF
- ❌ DO NOT add new dependencies
- ❌ DO NOT change component APIs or props (only internal implementation)

## Commit

After all refinements pass verification:

```bash
git add -A
git commit -m "refine: context-aware pills, glassmorphism chips, real briefing data, Spanish orthography, drawer emojis"
```
