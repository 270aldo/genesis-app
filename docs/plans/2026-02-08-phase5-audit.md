# NGX GENESIS APP — PHASE 5 AUDIT REPORT

**Fecha:** 2026-02-08
**Scope:** Phase 5 — Connect Stores, Workout Flow, Chat Backend (20 tasks)

---

## 1. EXECUTIVE SUMMARY

**18 de 20 tareas completadas.**

Claude Code ejecutó WS1 (Stores → Supabase), WS2 (Workout Flow), y la mayoría de WS3 (Chat) con calidad alta. Solo faltan 2 tareas: las migraciones de Supabase (WS0) y el BFF scaffold (Task 3.1).

| Workstream | Tasks | Complete | Status |
|---|---|---|---|
| WS0: Database Foundation | 0.1, 0.2 | 0/2 | ❌ PENDING |
| WS1: Connect Stores | 1.1-1.7 | 7/7 | ✅ DONE |
| WS2: Workout Flow | 2.1-2.7 | 7/7 | ✅ DONE |
| WS3: Chat Backend | 3.1-3.5 | 4/5 | ⚠️ BFF scaffold missing |
| **TOTAL** | **20** | **18/20** | **90% complete** |

---

## 2. TASK-BY-TASK VERIFICATION

### WS0: Database Foundation — ❌ PENDING

#### Task 0.1 — Supabase Migrations + RLS
- **Status:** ❌ NOT IMPLEMENTED
- **Evidence:** No migration files exist in project. Tables not creatable from app code — requires Supabase Dashboard or CLI.
- **What's needed:** SQL to create 11 tables (seasons, phases, weeks, sessions, exercises, exercise_logs, check_ins, meals, biomarkers, personal_records, conversations) + RLS policies + indexes
- **Reference:** `types/supabase.ts` (471 lines) has complete schema definition

#### Task 0.2 — Seed Exercises Table
- **Status:** ❌ NOT IMPLEMENTED
- **What's needed:** INSERT the 16 exercises from `MOCK_EXERCISE_LIBRARY` into the `exercises` table. Platform content, not user data.

---

### WS1: Connect Stores to Supabase — ✅ ALL DONE

#### Task 1.1 — supabaseQueries.ts
- **Status:** ✅ COMPLETE
- **File:** `services/supabaseQueries.ts` (362 lines)
- **Functions implemented (16/16):**
  - ✅ getCurrentUserId()
  - ✅ fetchActiveSeason(userId) — with nested phases(*, weeks(*))
  - ✅ fetchTodaySession(userId) — with exercise_logs subquery
  - ✅ fetchPreviousSessions(userId, limit) — with batched logs by session
  - ✅ fetchCheckIns(userId, dateRange)
  - ✅ fetchMealsForDate(userId, date)
  - ✅ fetchBiomarkers(userId)
  - ✅ fetchPersonalRecords(userId) — with exercises(name, muscle_groups) join
  - ✅ upsertCheckIn(userId, data) — with onConflict: 'user_id,date'
  - ✅ insertMeal(userId, data)
  - ✅ insertExerciseLogs(sessionId, logs) — batch insert
  - ✅ completeSession(sessionId)
  - ✅ insertBiomarker(userId, data)
  - ✅ insertPersonalRecord(userId, data)
  - ✅ fetchConversation(userId, agentId)
  - ✅ upsertConversation(userId, agentId, conversationId, messages)
- **Quality:** All functions guard with `if (!hasSupabaseConfig) return null`. Error handling via console.warn. Clean pattern.

#### Task 1.2 — Connect useSeasonStore
- **Status:** ✅ COMPLETE
- **File:** `stores/useSeasonStore.ts` (129 lines)
- **Verified:** isLoading state field ✅, fetchSeasonPlan() with hasSupabaseConfig guard + mock fallback ✅, phase denormalization ✅

#### Task 1.3 — Connect useTrainingStore
- **Status:** ✅ COMPLETE
- **File:** `stores/useTrainingStore.ts` (321 lines)
- **Verified:** isLoading ✅, fetchPreviousSessions() ✅, fetchTodaySession() ✅, completeSession() with Supabase persist ✅, insertExerciseLogs() ✅

#### Task 1.4 — Connect useNutritionStore
- **Status:** ✅ COMPLETE
- **File:** `stores/useNutritionStore.ts` (112 lines)
- **Verified:** isLoading ✅, fetchMeals(date?) with Supabase query ✅, addMeal() optimistic + persist ✅, dailyGoal from PHASE_CONFIG ✅

#### Task 1.5 — Connect useWellnessStore
- **Status:** ✅ COMPLETE
- **File:** `stores/useWellnessStore.ts` (175 lines)
- **Verified:** isLoading ✅, fetchTodayCheckIn() ✅, submitCheckIn() with mood string→number mapping ✅, fetchWeeklyCheckIns() ✅

#### Task 1.6 — Connect useTrackStore
- **Status:** ✅ COMPLETE
- **File:** `stores/useTrackStore.ts` (150 lines)
- **Verified:** isLoading ✅, fetchMeasurements() grouping biomarkers ✅, fetchPersonalRecords() with join ✅, fetchStreak() 30-day window ✅, addMeasurement() optimistic + persist ✅

#### Task 1.7 — Connect useGenesisStore Persistence
- **Status:** ✅ COMPLETE
- **File:** `stores/useGenesisStore.ts` (208 lines)
- **Verified:** conversationId state ✅, loadConversation() from Supabase ✅, sendMessage() persists via upsertConversation() ✅, clearMessages() creates new conversation ✅

---

### WS2: Interactive Workout Flow — ✅ ALL DONE

#### Task 2.1 — ExerciseSet Type
- **Status:** ✅ COMPLETE
- **File:** `types/models.ts` line 32-41
- **Verified:** ExerciseSet interface with setNumber, targetReps, targetWeight, actualReps?, actualWeight?, rpe?, completed ✅. Exercise.exerciseSets? optional field at line 52 ✅. Additive, zero breaking changes ✅.

#### Task 2.2 — Workout State Machine
- **Status:** ✅ COMPLETE
- **File:** `stores/useTrainingStore.ts` (321 lines)
- **State fields verified:** workoutStatus ('idle'|'active'|'paused'|'completing'|'completed') ✅, startTime ✅, elapsedSeconds ✅, currentExerciseIndex ✅, currentSetIndex ✅
- **Actions verified:** startWorkout() ✅, pauseWorkout()/resumeWorkout() ✅, logSet() ✅, skipSet() ✅, advanceToNextExercise() ✅, finishWorkout() with Supabase persist ✅, tickElapsed() ✅, resetWorkout() ✅

#### Task 2.3 — Active Workout Screen
- **Status:** ✅ COMPLETE
- **File:** `app/(screens)/active-workout.tsx` (230 lines)
- **Layout verified:**
  - ✅ Header: back button + "Active Workout" + elapsed timer (mm:ss) + pause/resume toggle
  - ✅ Current exercise card: name, set X of Y, weight targets, phase-colored accent
  - ✅ Rest timer integration: auto-shows when isRestTimerActive, phase-aware duration
  - ✅ ExerciseForm: dual-mode with onLogSet and onSkipSet handlers
  - ✅ Finish button: green gradient when all done, violet "FINISH EARLY" otherwise
  - ✅ Completion overlay: WorkoutComplete with detected PRs
  - ✅ Auto-advance: useEffect advances to next exercise when current completes
  - ✅ Empty state: "No active workout" with back button
- **train.tsx wiring:** Needs verification (START WORKOUT button → startWorkout → router.push)

#### Task 2.4 — PR Detection Utility
- **Status:** ✅ COMPLETE
- **File:** `utils/prDetection.ts` (57 lines)
- **Verified:** Pure function detectPersonalRecords(exercises, existingRecords) ✅, checks max weight PR ✅, checks max reps at heaviest weight ✅, returns DetectedPR[] ✅

#### Task 2.5 — Workout Completion Summary
- **Status:** ✅ COMPLETE
- **File:** `components/training/WorkoutComplete.tsx` (127 lines)
- **Verified:** Duration display ✅, exercises completed/total ✅, total volume calculation ✅, PR display with gold/warning accents ✅, SAVE & EXIT gradient button → onDismiss ✅, StatBox subcomponent ✅

#### Task 2.6 — Enhanced ExerciseForm
- **Status:** ✅ COMPLETE
- **File:** `components/training/ExerciseForm.tsx` (240 lines)
- **Verified:** Dual mode (simple toggle vs enhanced set-by-set) ✅, SetRow subcomponent with weight/reps/RPE inputs ✅, completed sets collapsed with checkmark ✅, calculateVolume helper ✅

#### Task 2.7 — Enhanced RestTimer
- **Status:** ✅ COMPLETE
- **File:** `components/training/RestTimer.tsx` (123 lines)
- **Verified:** defaultDuration prop (from PHASE_CONFIG) ✅, circular progress visualization ✅, auto-start mechanism ✅, "+30s" button ✅, "Skip Rest" button ✅, onComplete callback ✅

---

### WS3: GENESIS Chat Backend — ⚠️ 4/5 DONE

#### Task 3.1 — Scaffold FastAPI BFF
- **Status:** ❌ NOT IMPLEMENTED
- **Evidence:** `bff/` directory does not exist at project root
- **What's needed:** Full directory structure with main.py, routers/, services/, models/, Dockerfile, requirements.txt
- **Note:** This is the only code-level task remaining in Phase 5

#### Task 3.2 — Auth Headers on API Client
- **Status:** ✅ COMPLETE
- **File:** `services/genesisAgentApi.ts` (79 lines)
- **Verified:** getAuthHeaders() reads session.access_token ✅, Authorization: Bearer header ✅, types/api.ts has conversationId + userId on GenesisMessageInput ✅

#### Task 3.3 — Conversation Context in Store
- **Status:** ✅ COMPLETE
- **File:** `stores/useGenesisStore.ts` (208 lines)
- **Verified:** conversationId state field ✅, sendMessage() passes conversationId to BFF ✅, loadConversation() fetches on chat open ✅

#### Task 3.4 — Typing Indicator & Error States
- **Status:** ✅ COMPLETE
- **File:** `components/genesis/GenesisChat.tsx`
- **Verified:** TypingIndicator component imported from ChatMessage ✅, isLoading triggers TypingIndicator as ListFooterComponent ✅, isOffline detection (mock- prefix ID) ✅, "Offline mode" banner ✅, Retry button on failed messages ✅

#### Task 3.5 — Widget Action Handling
- **Status:** ✅ COMPLETE
- **File:** `components/genesis/WidgetRenderer.tsx`
- **Verified:** action_button case with handleAction + onPress ✅, form_field case with TextInput + submit handler ✅, SlideIn animation component (Animated.View translateY + opacity) ✅

---

## 3. QUALITY CHECKS

### Design Consistency ✅
| Pattern | ActiveWorkout | WorkoutComplete | ExerciseForm | RestTimer |
|---|---|---|---|---|
| LinearGradient bg | ✅ | ✅ (overlay) | N/A (child) | N/A (child) |
| Phase colors | ✅ phaseConfig | ✅ theme.colors | ✅ via parent | ✅ via parent |
| Font names | ✅ correct | ✅ correct | ✅ correct | ✅ correct |
| Lucide icons | ✅ | ✅ Trophy, Clock | N/A | N/A |
| Border subtle | ✅ | ✅ | ✅ | ✅ |

### Font Names — All Correct ✅
All Phase 5 files use registered custom names:
- `'Inter'`, `'InterBold'` — used in all text
- `'JetBrainsMono'`, `'JetBrainsMonoMedium'`, `'JetBrainsMonoSemiBold'`, `'JetBrainsMonoBold'` — used in labels, timers, buttons

### hasSupabaseConfig Pattern — Consistent ✅
All 16 functions in supabaseQueries.ts guard with `if (!hasSupabaseConfig) return null`. All 6 stores check hasSupabaseConfig before querying. Mock fallbacks preserved in every store.

---

## 4. REMAINING WORK (2 Tasks)

### Task 0.1 + 0.2: Supabase Migrations + Seed Data

**Cannot be done from Claude Code app-side.** Needs either:
- Supabase Dashboard → SQL Editor
- `supabase db push` via Supabase CLI
- A migration file that runs in CI/CD

**Tables to create (11):** seasons, phases, weeks, sessions, exercises, exercise_logs, check_ins, meals, biomarkers, personal_records, conversations

**Schema reference:** `types/supabase.ts` (471 lines) — definitive source of truth

**Seed data:** 16 exercises from `MOCK_EXERCISE_LIBRARY` in `data/mockData.ts`

### Task 3.1: FastAPI BFF Scaffold

**This CAN be done in Claude Code.** Required structure:

```
bff/
├── main.py              # FastAPI app, CORS, health check
├── routers/
│   ├── mobile.py        # 6 endpoints: chat, profile, check-in, sessions, exercise-log, workout/today
│   └── agents.py        # Agent routing stubs
├── services/
│   ├── supabase.py      # Supabase client (service_role key)
│   ├── agent_router.py  # Mock responses matching GenesisResponse schema
│   └── auth.py          # JWT verification from Supabase
├── models/
│   ├── requests.py      # Pydantic v2 request models
│   └── responses.py     # Pydantic v2 response models
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

**Endpoints:** POST /mobile/chat, GET /mobile/profile, POST /mobile/check-in, GET /mobile/sessions, POST /mobile/exercise-log, GET /mobile/workout/today

---

## 5. CLAUDE CODE PROMPT — COMPLETE REMAINING WORK

```
Estoy completando Phase 5 de GENESIS app. 18/20 tareas done.

QUEDAN 2 TAREAS:

TASK 1: Scaffold FastAPI BFF (Task 3.1)
Crea el directorio bff/ en la raíz del proyecto con esta estructura:

bff/
├── main.py              # FastAPI app, CORS para localhost:8081, health check endpoint
├── routers/
│   ├── mobile.py        # 6 endpoints: POST /mobile/chat, GET /mobile/profile, POST /mobile/check-in, GET /mobile/sessions, POST /mobile/exercise-log, GET /mobile/workout/today
│   └── agents.py        # Agent routing stubs
├── services/
│   ├── supabase.py      # Supabase client con service_role key
│   ├── agent_router.py  # Mock responses que retornan GenesisResponse schema (id, response, widgets[])
│   └── auth.py          # JWT verification — valida Supabase access tokens en headers
├── models/
│   ├── requests.py      # Pydantic v2: ChatRequest(message, agent_id, conversation_id?), CheckInRequest, ExerciseLogRequest
│   └── responses.py     # Pydantic v2: ChatResponse(id, response, widgets), ProfileResponse, SessionsResponse
├── requirements.txt     # fastapi, uvicorn[standard], supabase, pydantic>=2.0, python-dotenv, httpx
├── Dockerfile           # python:3.12-slim, pip install, uvicorn main:app
├── .env.example         # SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CORS_ORIGINS
└── README.md            # Setup (pip install, uvicorn) + deployment (docker build, gcloud run deploy)

Referencia para los tipos: types/api.ts tiene GenesisMessageInput, GenesisResponse, CheckInPayload, etc.
El agent_router.py debe retornar mock responses en español que matcheen el schema existente.
Auth middleware: lee Authorization Bearer token, verifica con Supabase, extrae user_id.

TASK 2: Generar SQL migration para Supabase (Task 0.1 + 0.2)
Crea el archivo bff/migrations/001_initial_schema.sql con:
- CREATE TABLE para las 11 tablas definidas en types/supabase.ts
- RLS policies (user can only read/write own data, exercises public read)
- Indexes en user_id y (user_id, date) composites
- INSERT de los 16 ejercicios de MOCK_EXERCISE_LIBRARY como seed data
- Incluye nota al top: "Run this in Supabase Dashboard > SQL Editor"

FONTS (recordatorio): 'Inter', 'InterBold', 'JetBrainsMono', 'JetBrainsMonoMedium', 'JetBrainsMonoSemiBold', 'JetBrainsMonoBold'

Después de crear todo:
1. cd bff && pip install -r requirements.txt
2. uvicorn main:app --reload --port 8000
3. Verificar que GET /health responde 200
4. npx tsc --noEmit en el root para verificar que nada se rompió
```

---

## 6. VERIFICATION PLAN POST-COMPLETION

After the remaining 2 tasks are done, run these checks:

### Build Verification
```bash
# App type check
npx tsc --noEmit

# BFF starts
cd bff && uvicorn main:app --reload --port 8000

# BFF health
curl http://localhost:8000/health

# BFF chat endpoint (mock)
curl -X POST http://localhost:8000/mobile/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola GENESIS", "agent_id": "genesis"}'
```

### Demo Mode Regression
```bash
# Remove Supabase env vars
# npx expo start → ALL screens should render with mock data
# No crashes, no blank screens
```

### Supabase Integration (after running migration)
```bash
# Set env vars: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
# npx expo start → stores should fetch from Supabase
# Empty tables = empty but no errors
# Insert test data → screens populate
```

### Workout Flow E2E
```
Train tab → START WORKOUT → active-workout.tsx loads
→ Log a set (weight + reps) → rest timer auto-starts
→ Skip rest → log remaining sets → exercise auto-advances
→ Complete all exercises → FINISH WORKOUT → completion overlay
→ PR displayed if detected → SAVE & EXIT → back to train tab
```

### Chat Flow E2E
```
Home → FAB → genesis-chat modal opens
→ Quick actions visible → tap one → message sent
→ Typing indicator while loading → response appears
→ Widget renders with slide-in animation
→ action_button widget → onPress triggers navigation
→ Close chat → reopen → conversation loaded from persistence
```

---

*NGX GENESIS — Phase 5 audit complete. 2 tasks to finish, then the app is functional.*
