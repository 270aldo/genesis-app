# GENESIS Widget Intelligence & Functionality — Master Plan

**Date**: 2026-02-21
**Branch**: `feat/visual-refinement-v2` (will continue here or new branch)
**Author**: Aldo + Claude (brainstorming session)
**Status**: Ready for execution

---

## The Problem

GENESIS has 28 widget types registered, a full chat-first UI, and a working BFF→ADK→Gemini pipeline. The visual design is premium. But the widget system has three critical failures:

1. **Dumb heuristic fallback** — `_generate_widgets()` in `agent_router.py` generates empty widgets (Recovery Score: `--`) based on keyword matching when the agent doesn't include a widget block. This fires on almost every response because fitness keywords appear everywhere.

2. **Zero agent intelligence about WHEN to use widgets** — All 5 agent prompts say "Cuando la información se preste para visualización, incluye un widget" with no rules about when NOT to. No context awareness (onboarding = no widgets, no data = no widgets).

3. **Zero widget persistence** — 0 of 28 widgets call the BFF or Supabase. The 6 interactive widgets (breathwork, meditation, journal, recipe-card, quick-checkin, onboarding-form) have full UI with haptics and state, but every single one has a comment: `"In a real implementation this would persist via BFF/Supabase"`. User actions in widgets are lost on app close.

**Why this matters**: This IS the product differentiator. NGX GENESIS is not another chat-with-GPT app — it's a coach that gives you functional tools inside the conversation. If you ask "¿Qué entreno hoy?" and get a workout-card you can START from, that's magic. If you get a static text card with `--`, that's a broken promise.

---

## Architecture Decision: Why Not Google A2UI Protocol

**Investigated Feb 21, 2026.** The real A2UI protocol (v0.8) has NO React Native renderer. Only Web (Lit) and Flutter are supported. A community member opened [GitHub issue #428](https://github.com/google/A2UI/issues/428) to build one — not published. AG-UI (CopilotKit) also has no RN support ([issue #1892](https://github.com/CopilotKit/CopilotKit/issues/1892)).

**Decision**: Continue with custom widget JSON protocol (agent → ```widget JSON → BFF extraction → mobile rendering). This is architecturally equivalent to A2UI (declarative JSON, client-side catalog, agent generates UI intent) — just without the formal spec wrapper. When A2UI ships a React Native renderer (est. mid-2026), we can adopt it as a transport format without changing the widget components.

---

## Execution Plan — 3 Phases

### Phase 1: Widget Intelligence (BFF — agent prompts + router fix)
**Goal**: Widgets appear ONLY when contextually correct, with real data, never empty.
**Effort**: ~2-3 hours
**No mobile changes needed.**

### Phase 2: Widget Functionality (Mobile — persistence + actions)
**Goal**: Every interactive widget calls the BFF/Supabase. User actions persist.
**Effort**: ~4-6 hours
**No BFF prompt changes needed.**

### Phase 3: Widget Completeness (Mobile — upgrade fallback widgets)
**Goal**: All 20 core widget types have custom renderers with appropriate interactivity.
**Effort**: ~4-6 hours

---

## Phase 1: Widget Intelligence (BFF)

### Task 1.1 — Kill the heuristic fallback

**File**: `bff/services/agent_router.py`

**Action**: Delete the entire `_generate_widgets()` function (lines 108-145) and update the call site in `route_to_agent()` to return empty widgets when the agent doesn't include any.

**Current code** (lines 292-298):
```python
clean_text, extracted_widgets = _extract_widgets(response_text)
if extracted_widgets:
    response_text = clean_text
    widgets = extracted_widgets
else:
    widgets = _generate_widgets(message, response_text)  # ← DELETE THIS
```

**New code**:
```python
clean_text, extracted_widgets = _extract_widgets(response_text)
if extracted_widgets:
    response_text = clean_text
    widgets = extracted_widgets
else:
    widgets = []  # No widgets is better than wrong widgets
```

**Why**: A widget with `--` data is worse than no widget. The agent should be the ONLY entity deciding when to include a widget. If it doesn't include one, the response is text-only — and that's fine.

### Task 1.2 — Rewrite agent widget instructions

Replace the vague "Cuando la información se preste para visualización" with explicit rules. Every agent gets the same core rules + domain-specific widget guidance.

#### Core widget rules (shared by ALL agents via `build_system_prompt()`):

```
WIDGETS — Reglas estrictas:

CUÁNDO SÍ incluir un widget:
- El usuario pidió datos concretos y los tienes (entrenamientos, macros, progreso, métricas)
- Acabas de ejecutar una herramienta que retornó datos numéricos o estructurados
- El usuario necesita hacer una ACCIÓN (loguear comida, registrar check-in, iniciar workout)
- Estás mostrando un plan o resumen con múltiples items

CUÁNDO NO incluir un widget:
- Conversación casual, saludo, onboarding, preguntas sobre preferencias
- No tienes datos reales (nunca uses value: "--" o datos vacíos)
- La respuesta es una explicación, consejo o motivación (texto puro es mejor)
- El usuario está haciendo una pregunta abierta ("¿Qué opinas de...?")
- Ya incluiste un widget en esta respuesta (máximo 1-2 por respuesta, nunca más)

FORMATO — Solo usa este formato exacto:
```widget
{"type": "TIPO", "title": "...", "value": "...", "data": {...}}
```

NUNCA incluyas un widget solo "porque puedes". Un widget sin datos reales o sin acción útil DEGRADA la experiencia.
```

#### GENESIS root agent — additional widget rules:

```
Widgets específicos para ti:
- today-card: SOLO cuando el usuario pregunta "¿cómo va mi día?" y tienes datos del check-in
- season-timeline: SOLO cuando preguntan sobre su temporada/season y tienes datos de get_current_season()
- coach-message: Para mensajes motivacionales importantes, NO para cada respuesta
- onboarding-form: SOLO cuando detectas que el usuario es nuevo y no tiene perfil completo
- quick-checkin: SOLO cuando el usuario quiere hacer check-in o tú se lo sugieres proactivamente
```

#### TRAIN agent — additional widget rules:

```
Widgets específicos para entrenamiento:
- workout-card: SOLO cuando tienes un workout real de get_today_workout() con ejercicios listados
- exercise-row: SOLO dentro de contexto de un workout activo, nunca suelto
- rest-timer: SOLO cuando el usuario está en un workout activo y necesita descanso
- max-rep-calculator: SOLO cuando el usuario pregunta "¿cuánto debería levantar?" o similar
- workout-history: SOLO cuando preguntan por historial y tienes datos reales
- achievement: SOLO cuando detectas un PR real o milestone (no inventes logros)
```

#### FUEL agent — additional widget rules:

```
Widgets específicos para nutrición:
- meal-plan: SOLO cuando tienes comidas reales de get_today_meals() o recomiendas un plan concreto
- hydration-tracker: SOLO cuando el usuario pregunta por hidratación y tienes datos de get_water_intake()
- recipe-card: SOLO cuando recomiendas una receta concreta con macros calculados
- supplement-stack: SOLO cuando el usuario pregunta por suplementos y tienes recomendación fundamentada
```

#### MIND agent — additional widget rules:

```
Widgets específicos para bienestar:
- sleep-tracker: SOLO cuando tienes datos reales de sueño (de check-in o HealthKit)
- heart-rate: SOLO cuando tienes datos reales de HRV/FC
- breathwork: Cuando el usuario necesita una técnica de respiración — este widget es INTERACTIVO
- meditation: Cuando el usuario quiere meditar — este widget es INTERACTIVO con timer
- journal: Cuando sugieres journaling — este widget es INTERACTIVO con input de texto
- streak-counter: SOLO cuando el streak es >= 3 y hay dato real
- alert-banner: SOLO para alertas genuinas (recovery baja, sueño pobre consistente)
```

#### TRACK agent — additional widget rules:

```
Widgets específicos para progreso:
- progress-dashboard: SOLO cuando tienes datos reales de get_progress_stats()
- body-stats: SOLO cuando el usuario pregunta por medidas corporales y tienes datos
- photo-comparison: SOLO cuando el usuario pregunta por progreso visual y tiene fotos subidas
- insight-card: Para insights basados en datos reales de compare_periods() o tendencias
```

### Task 1.3 — Add widget validation in `_extract_widgets()`

**File**: `bff/services/agent_router.py`

After extracting widgets from agent response, validate before returning:

```python
def _validate_widget(widget: WidgetPayload) -> bool:
    """Reject widgets with empty or placeholder data."""
    if widget.value in ("--", "", None, "N/A", "0"):
        # Allow value=None for interactive widgets that don't need a value
        if widget.type not in INTERACTIVE_WIDGET_TYPES:
            return False
    if widget.type not in KNOWN_WIDGET_TYPES:
        return False
    return True

INTERACTIVE_WIDGET_TYPES = {
    "breathwork", "meditation", "journal", "recipe-card",
    "quick-checkin", "onboarding-form", "photo-comparison",
}

KNOWN_WIDGET_TYPES = {
    "metric-card", "workout-card", "meal-plan", "hydration-tracker",
    "progress-dashboard", "insight-card", "season-timeline", "today-card",
    "exercise-row", "workout-history", "body-stats", "max-rep-calculator",
    "rest-timer", "heart-rate", "supplement-stack", "streak-counter",
    "achievement", "coach-message", "sleep-tracker", "alert-banner",
    "breathwork", "meditation", "journal", "video-embed", "recipe-card",
    "quick-checkin", "onboarding-form", "photo-comparison",
}
```

### Task 1.4 — Update BFF tests

**File**: `bff/tests/test_agent_router_adk.py`

Add tests:
- `test_no_heuristic_fallback_widgets` — verify empty widgets when agent returns text-only
- `test_widget_validation_rejects_empty_value` — verify `--` values are rejected for non-interactive types
- `test_widget_extraction_preserves_interactive_types` — verify breathwork etc. pass validation without value

---

## Phase 2: Widget Functionality (Mobile)

**Goal**: Every interactive widget actually DOES something. Actions persist to Supabase via existing store methods.

### Task 2.1 — quick-checkin → useWellnessStore.submitCheckIn()

**File**: `components/genesis/widgets/QuickCheckinWidget.tsx`

**Current**: `handleSubmit()` sets local state to "submitted", does nothing else.

**Fix**: Import `useWellnessStore` and call `submitCheckIn()` with the 5 ratings:

```typescript
const handleSubmit = async () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setSubmitted(true);

  try {
    await useWellnessStore.getState().submitCheckIn({
      mood: ratings.mood,
      energy: ratings.energy,
      sleep_hours: ratings.sleep, // map 1-5 scale to hours or keep as rating
      stress: ratings.stress,
      soreness: ratings.soreness,
    });
  } catch (err) {
    console.warn('Check-in submit failed:', err);
    // Widget stays in "submitted" state — user sees confirmation
    // Error is non-blocking to preserve UX
  }
};
```

### Task 2.2 — recipe-card → useNutritionStore.logMeal()

**File**: `components/genesis/widgets/RecipeCardWidget.tsx`

**Current**: `handleLog()` sets local state to "logged", does nothing else.

**Fix**: Call `useNutritionStore.getState().logMeal()` with recipe macros:

```typescript
const handleLog = async () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setLogged(true);

  try {
    await useNutritionStore.getState().logMeal({
      name: widget.title || 'Recipe',
      meal_type: 'snack', // or derive from context
      calories: widget.data?.calories || 0,
      protein: widget.data?.protein || 0,
      carbs: widget.data?.carbs || 0,
      fat: widget.data?.fat || 0,
    });
  } catch (err) {
    console.warn('Meal log failed:', err);
  }
};
```

### Task 2.3 — journal → BFF persist (new endpoint or existing)

**File**: `components/genesis/widgets/JournalWidget.tsx`

**Current**: `handleSave()` sets local state, data is lost.

**Fix**: Two options:
- **Option A**: Call `useWellnessStore.getState().submitCheckIn()` with notes field
- **Option B**: Call `useGenesisStore.getState().sendMessage()` with the journal entry as a message to GENESIS (so the agent sees it and can store as memory via `store_user_memory`)

**Recommended: Option B** — this makes the journal entry part of the conversation context AND triggers memory storage:

```typescript
const handleSave = async () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setSaved(true);

  const tagsStr = Array.from(selectedTags).join(', ');
  const journalMessage = `[Journal] Me siento: ${tagsStr}. ${entry}`;

  // Send as message to GENESIS — agent will store as memory
  try {
    await useGenesisStore.getState().sendMessage(journalMessage);
  } catch (err) {
    console.warn('Journal persist failed:', err);
  }
};
```

### Task 2.4 — onboarding-form → Profile save

**File**: `components/genesis/widgets/OnboardingFormWidget.tsx`

**Current**: Shows summary of 3 selections, does nothing with them.

**Fix**: On completion, update user profile AND send to GENESIS as context:

```typescript
const handleComplete = async () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setCompleted(true);

  const profile = {
    experience_level: selections.experience,
    training_goal: selections.goal,
    days_per_week: selections.days,
  };

  // Option 1: Update profile directly
  try {
    const { upsertProfile, getCurrentUserId } = await import('../../services/supabaseQueries');
    const userId = getCurrentUserId();
    if (userId) {
      await upsertProfile(userId, profile);
    }
  } catch (err) {
    console.warn('Profile save failed:', err);
  }

  // Option 2: Also tell GENESIS so it stores as memory
  const msg = `Mi nivel es ${selections.experience}, mi objetivo es ${selections.goal}, entreno ${selections.days} días/semana.`;
  useGenesisStore.getState().sendMessage(msg).catch(() => {});
};
```

### Task 2.5 — breathwork + meditation → Log session

**Files**: `BreathworkWidget.tsx`, `MeditationWidget.tsx`

**Current**: Timer/animation runs, completion state shown, nothing persisted.

**Fix**: On completion, log as wellness activity. Since there's no dedicated breathwork/meditation endpoint, use the check-in or send as chat message for memory:

```typescript
// On completion:
const msg = `[Breathwork completado] ${cycles} ciclos de ${technique}. Duración: ${duration}s.`;
useGenesisStore.getState().sendMessage(msg).catch(() => {});
```

### Task 2.6 — workout-card → Navigate to active workout

**File**: `components/genesis/WidgetRenderer.tsx` (workout-card renderer, lines 81-109)

**Current**: Display-only card with exercises listed.

**Fix**: Add `onPress` that navigates to active-workout screen:

```typescript
import { router } from 'expo-router';

// In workout-card renderer:
<Pressable onPress={() => {
  if (widget.data?.session_id) {
    router.push({ pathname: '/(screens)/active-workout', params: { sessionId: widget.data.session_id } });
  }
}}>
  {/* existing card content */}
  <View style={styles.startButton}>
    <Text style={styles.startButtonText}>INICIAR WORKOUT</Text>
  </View>
</Pressable>
```

### Task 2.7 — hydration-tracker → Quick add water

**File**: `components/genesis/WidgetRenderer.tsx` (hydration-tracker renderer, lines 132-151)

**Current**: Static progress bar showing glasses/goal.

**Fix**: Add "+1 vaso" button:

```typescript
import { useNutritionStore } from '../../stores/useNutritionStore';

// In hydration-tracker renderer:
<Pressable
  onPress={() => {
    useNutritionStore.getState().logWater(1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }}
  style={styles.addWaterButton}
>
  <Text style={styles.addWaterText}>+ 1 vaso</Text>
</Pressable>
```

---

## Phase 3: Widget Completeness (Mobile)

**Goal**: Upgrade the 12 "SimpleWidget" fallbacks to proper renderers.

### Priority Tier (widgets with clear UX value in chat-first):

| Widget | Upgrade | Interactivity |
|--------|---------|---------------|
| **rest-timer** | Full countdown timer with sound/haptic | START/PAUSE/SKIP buttons |
| **streak-counter** | Animated fire icon + count + mini calendar | Display with motivational tap |
| **coach-message** | Styled message bubble with GENESIS branding | Dismissible |
| **achievement** | Trophy animation + unlock description | Shareable (future) |
| **alert-banner** | Colored banner (warning/info/success) | Dismissible + action CTA |

### Secondary Tier (useful but lower priority):

| Widget | Upgrade | Interactivity |
|--------|---------|---------------|
| **exercise-row** | Compact row with sets×reps, load, muscle tag | Tap to see detail |
| **workout-history** | Mini timeline of recent sessions | Tap to expand |
| **sleep-tracker** | Sleep hours bar + quality indicator | Display |
| **heart-rate** | BPM display + zone indicator | Display |
| **supplement-stack** | Checklist of supplements with toggle | Toggle taken/not taken |
| **body-stats** | Key measurements in grid | Display |
| **max-rep-calculator** | Input weight/reps → calculate 1RM | Calculator with inputs |

### Implementation pattern for each:

Each upgraded widget follows the same pattern:
1. Create file in `components/genesis/widgets/[Name]Widget.tsx`
2. LiquidGlassCard wrapper with WidgetAccent gradient line
3. GenesisBadge at bottom
4. FadeInUp animation via `staggerIndex`
5. Any action calls existing store methods (no new BFF endpoints needed)
6. Register in `WidgetRenderer.tsx` switch statement
7. Add to `constants/widgetRegistry.ts` if not already there

---

## Files Modified (Summary)

### Phase 1 (BFF — no mobile changes):
| File | Change |
|------|--------|
| `bff/services/agent_router.py` | Delete `_generate_widgets()`, add `_validate_widget()` |
| `bff/agents/genesis_agent.py` | Rewrite widget section of instruction prompt |
| `bff/agents/train_agent.py` | Rewrite widget section of instruction prompt |
| `bff/agents/fuel_agent.py` | Rewrite widget section of instruction prompt |
| `bff/agents/mind_agent.py` | Rewrite widget section of instruction prompt |
| `bff/agents/track_agent.py` | Rewrite widget section of instruction prompt |
| `bff/services/context_cache.py` | Add shared widget rules to `build_system_prompt()` |
| `bff/tests/test_agent_router_adk.py` | New tests for validation + no-fallback |

### Phase 2 (Mobile — widget actions):
| File | Change |
|------|--------|
| `components/genesis/widgets/QuickCheckinWidget.tsx` | Add `useWellnessStore.submitCheckIn()` call |
| `components/genesis/widgets/RecipeCardWidget.tsx` | Add `useNutritionStore.logMeal()` call |
| `components/genesis/widgets/JournalWidget.tsx` | Add `useGenesisStore.sendMessage()` call |
| `components/genesis/widgets/OnboardingFormWidget.tsx` | Add `upsertProfile()` + memory store call |
| `components/genesis/widgets/BreathworkWidget.tsx` | Add session log via chat message |
| `components/genesis/widgets/MeditationWidget.tsx` | Add session log via chat message |
| `components/genesis/WidgetRenderer.tsx` | Add onPress to workout-card, +1 to hydration |

### Phase 3 (Mobile — new widget components):
| File | Change |
|------|--------|
| `components/genesis/widgets/RestTimerWidget.tsx` | NEW — countdown timer |
| `components/genesis/widgets/StreakCounterWidget.tsx` | NEW — animated streak |
| `components/genesis/widgets/CoachMessageWidget.tsx` | NEW — styled message |
| `components/genesis/widgets/AchievementWidget.tsx` | NEW — trophy unlock |
| `components/genesis/widgets/AlertBannerWidget.tsx` | NEW — colored banner |
| `components/genesis/widgets/ExerciseRowWidget.tsx` | NEW — compact exercise |
| `components/genesis/widgets/SleepTrackerWidget.tsx` | NEW — sleep display |
| `components/genesis/widgets/HeartRateWidget.tsx` | NEW — BPM display |
| `components/genesis/widgets/SupplementStackWidget.tsx` | NEW — checklist |
| `components/genesis/widgets/MaxRepCalcWidget.tsx` | NEW — calculator |
| `components/genesis/widgets/WorkoutHistoryWidget.tsx` | NEW — mini timeline |
| `components/genesis/widgets/BodyStatsWidget.tsx` | NEW — measurements grid |
| `components/genesis/WidgetRenderer.tsx` | Import + route all new widgets |

---

## Pending from Previous Session (Commit First)

Before starting this plan, commit the 4 uncommitted files on `feat/visual-refinement-v2`:
- `app/(chat)/_layout.tsx` — ChatHydrator fix
- `components/genesis/WidgetRenderer.tsx` — WidgetCard recursion fix
- `stores/useGenesisStore.ts` — loadConversation added
- `types/api.ts` — conversation_id field added

```bash
git add app/(chat)/_layout.tsx components/genesis/WidgetRenderer.tsx stores/useGenesisStore.ts types/api.ts
git commit -m "fix: ChatHydrator, WidgetCard recursion, conversation_id, loadConversation"
```

Also commit the two new docs:
```bash
git add docs/active/SESSION_NEXT_STEPS.md docs/active/PROMPT_NEXT_SESSION.md
git commit -m "docs: add session next steps and prompt for next session"
```

---

## Success Criteria

After all 3 phases are complete:

1. **Onboarding flow**: User says "Hola" → GENESIS responds with text greeting + questions → NO widget attached. Only after profile is incomplete, GENESIS sends an `onboarding-form` widget.

2. **Training query**: "¿Qué entreno hoy?" → GENESIS calls `get_today_workout()` → Returns `workout-card` with real exercises → User can tap "INICIAR WORKOUT" → Navigates to active workout screen.

3. **Nutrition logging**: GENESIS recommends a recipe → Sends `recipe-card` with macros → User taps "Log this meal" → Meal appears in nutrition tracking with correct calories/macros.

4. **Check-in flow**: GENESIS suggests a check-in → Sends `quick-checkin` widget → User rates 5 categories → Data persists to Supabase → GENESIS acknowledges in next response.

5. **Hydration**: "¿Cuánta agua llevo?" → `hydration-tracker` with real data → User taps "+1 vaso" → Counter updates, persists.

6. **Wellness**: User says "estoy estresado" → GENESIS sends `breathwork` widget → User completes 4 breathing cycles → Session logged.

7. **No garbage widgets**: Conversational responses ("Hola", "¿Qué opinas?", "Explícame X") → Text only, zero widgets.

8. **No empty widgets**: No widget ever shows `--`, `0`, or `N/A` as its primary value (except interactive widgets that don't need a value).

---

## Execution Order for Coding Agent

```
1. Commit pending changes (see above)
2. Phase 1.1 — Delete _generate_widgets()
3. Phase 1.3 — Add _validate_widget()
4. Phase 1.2 — Rewrite all 5 agent prompts + build_system_prompt()
5. Phase 1.4 — Add BFF tests
6. Run: cd bff && python -m pytest tests/ -v (verify all pass)
7. Commit: "feat(bff): widget intelligence — kill heuristic, validate, smart prompts"
8. Phase 2.1-2.5 — Wire interactive widgets to stores
9. Phase 2.6-2.7 — Add actions to display widgets
10. Commit: "feat(widgets): wire all interactive widgets to real persistence"
11. Phase 3 — Build new widget components (priority tier first)
12. Commit: "feat(widgets): upgrade 12 fallback widgets to custom renderers"
13. Manual test: Start BFF + Expo, test all 8 success criteria
```
