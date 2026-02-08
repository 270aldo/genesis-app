# NGX GENESIS APP — AUDIT REPORT & PHASE 4 PLAN

**Fecha:** 2026-02-08
**Auditor:** GENESIS Command Center
**Scope:** Tasks 1-14 del plan `2026-02-08-genesis-app-experience.md`

---

## 1. RESUMEN EJECUTIVO

**14 de 14 tareas completadas.** La app pasó de un prototipo estático a una experiencia season-aware con media rica, contenido educativo real (en español), biblioteca de ejercicios completa, y chat mejorado con quick actions.

**Veredicto: SOLID FOUNDATION — 3 issues menores de navegación requieren fix antes de Phase 4.**

---

## 2. AUDIT POR FASE

### PHASE 1 — Foundation (Tasks 1-4) ✅

| Task | File | Status | Notes |
|------|------|--------|-------|
| 1. Type Definitions | `types/models.ts` | ✅ PASS | 9 nuevos tipos: PhaseType, ExerciseLibraryItem, EducationContent, CourseEpisode, DailyBriefing, WorkoutPlan, MuscleRecovery, QuickAction, WeekExtended |
| 2. Mock Data | `data/mockData.ts` + `data/index.ts` | ✅ PASS | PHASE_CONFIG (4 fases), 19 URLs Unsplash, 16 ejercicios con formCues en español, 6 education items, 6 muscle recovery, 6 quick actions, 4 meals |
| 3. ImageCard | `components/cards/ImageCard.tsx` | ✅ PASS | expo-image + LinearGradient overlay + blurhash placeholder + children slot |
| 4. SeasonHeader | `components/ui/SeasonHeader.tsx` | ✅ PASS | Phase dot + label + 12-week progress bar coloreado por fase |

**Fonts:** Todos los archivos usan los nombres custom correctos (`'Inter'`, `'InterBold'`, `'JetBrainsMono'`, `'JetBrainsMonoMedium'`, `'JetBrainsMonoSemiBold'`, `'JetBrainsMonoBold'`).

### PHASE 2 — Tab Screens (Tasks 5-9) ✅

| Task | File | Status | Notes |
|------|------|--------|-------|
| 5. Home | `app/(tabs)/home.tsx` (210 líneas) | ✅ PASS | SeasonHeader + briefing hero + MissionCards horizontales + micro-lesson + week progress (L-D) + streak |
| 6. Train | `app/(tabs)/train.tsx` (126 líneas) | ⚠️ PASS* | Workout hero + phase info card + exercise list + GENESIS tip + START button. **Issue: exercises no navegan a exercise-detail** |
| 7. Fuel | `app/(tabs)/fuel.tsx` (161 líneas) | ✅ PASS | Phase nutrition banner + CircularProgress + macro cards + meal ImageCards + water tracking |
| 8. Mind | `app/(tabs)/mind.tsx` (149 líneas) | ✅ PASS | MoodSelector español + RecoveryHeatmap + wellness score + meditation cards + sleep tracking |
| 9. Track | `app/(tabs)/track.tsx` (157 líneas) | ✅ PASS | Season overview hero + stats ScoreCards + bench trend chart + PRs + GENESIS insight |

**RecoveryHeatmap:** `components/wellness/RecoveryHeatmap.tsx` (56 líneas) — Color-coded muscle cards con labels en español. ✅

### PHASE 3 — New Screens (Tasks 10-14) ✅

| Task | File | Status | Notes |
|------|------|--------|-------|
| 10. Library | `app/(screens)/library.tsx` (147 líneas) | ✅ PASS | Search + 7 muscle filter pills + FlatList 2-col grid + ImageCards + nav a exercise-detail |
| 11. Exercise Detail | `app/(screens)/exercise-detail.tsx` (152 líneas) | ✅ PASS | Hero 260px + back btn + pills + Form Cues numerados + Recommended Phases + Alternatives scroll |
| 12. Education | `app/(screens)/education.tsx` (197 líneas) | ✅ PASS | "GENESIS Academy" + search + 5 category pills phase-aware + featured hero + rest list + TYPE_LABELS |
| 13. Education Detail | `app/(screens)/education-detail.tsx` (169 líneas) | ✅ PASS | Hero 240px + meta pills + ARTICLE_BODY (4 párrafos × 6 artículos en español) + GENESIS INSIGHT tip |
| 14. Genesis Chat | `app/(modals)/genesis-chat.tsx` (66 líneas) | ✅ PASS | QUICK_ACTIONS chips horizontales (6 prompts español) + VoiceCallUI + auto-hide on message |

**Routing:** `app/(screens)/_layout.tsx` existe con Stack headerShown: false. `app/_layout.tsx` ya tiene `<Stack.Screen name="(screens)" />` en línea 72. ✅

---

## 3. DESIGN CONSISTENCY AUDIT

| Pattern | Compliance | Details |
|---------|------------|---------|
| Background gradient | ✅ 100% | `['#0D0D2B', '#1A0A30']` en todas las screens |
| SafeAreaView | ✅ 100% | `edges={['top']}` en todas las screens |
| ScrollView padding | ✅ 100% | `paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100, gap: 24` |
| Surface color | ✅ 100% | `rgba(255,255,255,0.06)` con border `rgba(255,255,255,0.08)` |
| Phase colors | ✅ 100% | Todas las screens usan `PHASE_CONFIG[phase]` para colores dinámicos |
| Typography | ✅ 100% | Inter/JetBrainsMono con nombres custom correctos |
| Icons | ✅ 100% | Solo lucide-react-native, cero emojis |
| Difficulty colors | ✅ 100% | beginner=#22ff73, intermediate=#F97316, advanced=#ff6b6b — consistente |

---

## 4. ISSUES ENCONTRADOS (3 menores)

### 🔴 ISSUE 1: Train → Exercise Detail (sin navegación)
**Archivo:** `app/(tabs)/train.tsx` línea ~85-95
**Problema:** Los ejercicios del workout se renderizan con `ListItemCard` y `ChevronRight` icon, pero **no tienen `onPress` que navegue a `/(screens)/exercise-detail?id=`**.
**Fix:** Agregar `onPress={() => router.push('/(screens)/exercise-detail?id=${exercise.id}')}` a cada ListItemCard del workout.

### 🟡 ISSUE 2: Home → Education Detail (sin navegación)
**Archivo:** `app/(tabs)/home.tsx` línea ~140-160
**Problema:** La micro-lesson ImageCard en home se renderiza pero **no tiene `onPress`** para navegar a `/(screens)/education-detail?id=`.
**Fix:** Agregar `onPress={() => router.push('/(screens)/education-detail?id=${lesson.id}')}` al ImageCard de la micro-lesson.

### 🟡 ISSUE 3: Train → Library (sin link visible)
**Archivo:** `app/(tabs)/train.tsx`
**Problema:** No hay botón/link visible desde Train tab hacia la Exercise Library screen. El usuario no tiene forma de descubrir la biblioteca desde el flujo de entrenamiento.
**Fix:** Agregar un botón "Exercise Library →" (o SectionHeader con onPress) arriba de la lista de ejercicios o como acción en el header.

---

## 5. PHASE 4 — EXECUTION PLAN (Para Claude Code)

### Pre-requisito: Fix los 3 issues de navegación

Estos fixes son rápidos (5-10 min en Claude Code) y deben hacerse ANTES de Phase 4.

### Task 15: Navigation Verification

**Objetivo:** Verificar que TODAS las rutas funcionan end-to-end.

**Rutas a verificar:**
```
(tabs)/home → (modals)/genesis-chat     ← FAB button
(tabs)/home → (screens)/education-detail ← micro-lesson card (NEEDS FIX)
(tabs)/train → (screens)/exercise-detail ← exercise list items (NEEDS FIX)
(tabs)/train → (screens)/library         ← new button (NEEDS FIX)
(screens)/library → (screens)/exercise-detail ← grid items ✅ already wired
(screens)/exercise-detail → (screens)/exercise-detail ← alternatives ✅ already wired
(screens)/education → (screens)/education-detail ← featured + list ✅ already wired
All screens → router.back()              ← back buttons ✅ already wired
```

**Acción:** Después de los 3 fixes, hacer `npx expo start` y probar cada ruta en simulador.

### Task 16: Visual Consistency Pass

**Objetivo:** Asegurar que no hay inconsistencias visuales en runtime.

**Checklist:**
- [ ] Todas las ImageCards cargan imágenes (URLs Unsplash accesibles)
- [ ] Phase colors cambian correctamente al modificar `currentPhase` en store
- [ ] RecoveryHeatmap muestra colores correctos por status
- [ ] CircularProgress en fuel renderiza correctamente el arco
- [ ] SimpleBarChart en track renderiza las barras
- [ ] Quick Actions en genesis-chat se ocultan al enviar mensaje
- [ ] SeasonHeader muestra la semana actual highlighted
- [ ] Gradient backgrounds sin banding visible
- [ ] Typography legible en todos los tamaños de pantalla

### Task 17: Build & Type Check

**Objetivo:** Verificar que el proyecto compila sin errores.

**Comandos:**
```bash
# Type check
npx tsc --noEmit

# Lint (si está configurado)
npx eslint app/ components/ --ext .ts,.tsx

# Start dev server
npx expo start

# Si hay errores de tipos, son probablemente:
# - Imports faltantes de tipos nuevos
# - Props que cambiaron en ImageCard/ListItemCard
# - Stores que no exponen los selectors esperados
```

---

## 6. COPY-PASTE PROMPT PARA CLAUDE CODE

```
Estoy continuando la implementación del NGX GENESIS app.

PLAN COMPLETO: docs/plans/2026-02-08-genesis-app-experience.md
AUDIT: docs/plans/2026-02-08-audit-phase4.md

ESTADO ACTUAL: Tasks 1-14 completadas. Phase 4 pendiente.

ANTES DE PHASE 4, necesito que fixes estos 3 issues de navegación:

1. app/(tabs)/train.tsx — Los ejercicios del workout (ListItemCard) necesitan onPress que navegue a /(screens)/exercise-detail?id=${exercise.id}

2. app/(tabs)/home.tsx — La micro-lesson ImageCard (~línea 140-160) necesita onPress que navegue a /(screens)/education-detail?id=${lesson.id}

3. app/(tabs)/train.tsx — Agregar un botón/link "Exercise Library" que navegue a /(screens)/library. Puede ser un SectionHeader con onPress o un botón debajo del título del workout.

DESPUÉS de los fixes, ejecuta Phase 4:
- Task 15: Verificar que todas las rutas funcionan (npx expo start)
- Task 16: Visual consistency check
- Task 17: npx tsc --noEmit para type check

FONTS IMPORTANTES — Usa estos nombres custom (NO los nombres raw de expo-font):
- 'Inter' (regular), 'InterBold' (bold)
- 'JetBrainsMono', 'JetBrainsMonoMedium', 'JetBrainsMonoSemiBold', 'JetBrainsMonoBold'

El diseño sigue: LinearGradient ['#0D0D2B', '#1A0A30'], surface rgba(255,255,255,0.06), border rgba(255,255,255,0.08), phase colors from PHASE_CONFIG.
```

---

## 7. POST-PHASE 4: WHAT'S NEXT

Una vez Phase 4 esté completa, las prioridades naturales serían:

1. **Conectar stores reales** — Reemplazar mock data con Zustand stores + Supabase queries
2. **Workout flow interactivo** — Timer, rest countdown, set logging, exercise swap
3. **GENESIS chat con backend** — Conectar a Vertex AI agent via BFF
4. **Animaciones** — Transiciones entre screens, micro-interactions en cards
5. **Onboarding flow** — Season setup wizard, assessment, goals

---

*NGX GENESIS — "La base está sólida. Ahora a conectar."*
