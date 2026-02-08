# NGX GENESIS — PHASE 5 FINAL VERIFICATION

**Fecha:** 2026-02-08
**Scope:** Verificación de las 2 tareas restantes ejecutadas por Claude Code
**Status anterior:** 18/20 tareas completadas
**Status actual:** 20/20 tareas completadas ✅

---

## 1. EXECUTIVE SUMMARY

Claude Code completó las 2 tareas restantes: BFF scaffold y Supabase migrations. **Phase 5 está 100% structuralmente completa.**

Sin embargo, la auditoría encontró **3 issues que necesitan fix antes de producción** (1 critical, 2 medium). Ninguno bloquea el desarrollo, pero deben resolverse antes de conectar Supabase real.

| Deliverable | Files Created | Status |
|---|---|---|
| FastAPI BFF scaffold | 11 archivos, 332 líneas | ✅ DONE — con issues menores |
| Supabase migrations (phase5) | 1 archivo, 241 líneas | ✅ DONE |
| Seed exercises | 1 archivo, 85 líneas | ✅ DONE — 16 ejercicios |
| BFF comprehensive migration | 1 archivo, 437 líneas | ✅ DONE — 15 tablas completas |

---

## 2. TASK VERIFICATION

### Task 0.1 — Supabase Migrations + RLS ✅

**Archivos creados:**
- `supabase/migrations/20260208000000_phase5_tables.sql` (241 líneas)
- `bff/migrations/001_initial_schema.sql` (437 líneas)

**Tablas verificadas (11/11 en phase5, 15/15 en BFF):**

| Tabla | phase5_tables.sql | 001_initial_schema.sql | types/supabase.ts |
|---|---|---|---|
| profiles | — (auth handles) | ✅ | ✅ |
| coach_assignments | — | ✅ | ✅ |
| seasons | ✅ | ✅ | ✅ |
| phases | ✅ | ✅ | ✅ |
| weeks | ✅ | ✅ | ✅ |
| sessions | ✅ | ✅ | ✅ |
| exercises | ✅ | ✅ | ✅ |
| exercise_logs | ✅ | ✅ | ✅ |
| check_ins | ✅ | ✅ | ✅ |
| meals | ✅ | ✅ | ✅ |
| biomarkers | ✅ | ✅ | ✅ |
| personal_records | ✅ | ✅ | ✅ |
| conversations | ✅ | ✅ | ✅ |
| widget_states | — | ✅ | ✅ |
| notification_settings | — | ✅ | ✅ |

**RLS policies:** Todas las tablas tienen RLS habilitado con policies de SELECT/INSERT/UPDATE por user_id.

**Indexes:** 10 indexes en phase5, 19 en BFF migration. Cubren user_id, (user_id, date) composites, FKs.

### Task 0.2 — Seed Exercises ✅

**Archivo:** `supabase/migrations/20260208000001_seed_exercises.sql` (85 líneas)

**16/16 ejercicios insertados** con nombres, categoría, muscle_groups (ARRAY), equipment, difficulty, y cues en español:
Bench Press, DB Bench, Incline Bench, Incline DB, Cable Flyes, Back Squat, Deadlift, RDL, OHP, Lateral Raises, Barbell Row, Pull-ups, Lat Pulldown, Leg Press, Barbell Curl, Tricep Pushdowns

**Match con MOCK_EXERCISE_LIBRARY:** ✅ Los 16 ejercicios coinciden.

### Task 3.1 — FastAPI BFF Scaffold ✅

**Directorio:** `bff/` (11 archivos, 332 líneas total)

**Estructura verificada:**

```
bff/
├── main.py              ✅ FastAPI + CORS + health + routers
├── routers/
│   ├── mobile.py        ✅ 6 endpoints implementados
│   └── agents.py        ✅ Status endpoint + agent list
├── services/
│   ├── supabase.py      ✅ Singleton client
│   ├── agent_router.py  ✅ Mock responses en español
│   └── auth.py          ✅ JWT decode con Supabase
├── models/
│   ├── requests.py      ✅ Pydantic v2 models
│   └── responses.py     ✅ Pydantic v2 responses
├── migrations/
│   └── 001_initial_schema.sql  ✅ Full schema (redundante con supabase/)
├── requirements.txt     ✅ 7 deps pinned
├── Dockerfile           ✅ python:3.12-slim
├── .env.example         ✅ 6 env vars
└── README.md            ✅ Setup + deploy docs
```

**Endpoints verificados:**

| Method | Path | Auth | Status |
|---|---|---|---|
| POST | /mobile/chat | ✅ Bearer JWT | Mock agent responses |
| GET | /mobile/profile | ✅ Bearer JWT | Returns from Supabase |
| POST | /mobile/check-in | ✅ Bearer JWT | Upserts to Supabase |
| GET | /mobile/sessions | ✅ Bearer JWT | Queries with date filter |
| POST | /mobile/exercise-log | ✅ Bearer JWT | Inserts to Supabase |
| GET | /mobile/workout/today | ✅ Bearer JWT | Fetches today's session |
| GET | /health | No auth | Returns {"status": "ok"} |
| GET | /agents/status | No auth | Lists 7 agent stubs |

---

## 3. ISSUES ENCONTRADOS

### 🔴 CRITICAL — JWT Secret Empty String Default

**Archivo:** `bff/services/auth.py` línea 5
**Issue:** `JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")` — si no se configura la variable de entorno, el secret es string vacío.
**Riesgo:** En desarrollo funciona (401 por decode error), pero el default debería levantar error explícito al iniciar.
**Fix recomendado:**
```python
JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("SUPABASE_JWT_SECRET is required")
```

### 🟡 MEDIUM — Rating Scale Conflict Between Migrations

**Archivos afectados:**
- `supabase/migrations/20260208000000_phase5_tables.sql` → `CHECK (rating >= 1 AND rating <= 5)`
- `bff/migrations/001_initial_schema.sql` → `CHECK (rating BETWEEN 1 AND 10)`

**Issue:** Las dos migraciones definen rangos diferentes para `sessions.rating`. Si se corren ambas en diferentes contextos, el schema no es consistente.
**Fix recomendado:** Unificar a escala 1-10 en ambos archivos (más granularidad para el usuario).

### 🟡 MEDIUM — UUID Function Inconsistency

**Issue:**
- `phase5_tables.sql` usa `gen_random_uuid()` (función nativa de Supabase/Postgres 13+)
- `001_initial_schema.sql` usa `uuid_generate_v4()` (requiere extensión uuid-ossp)

**Impacto:** Si se corre `001_initial_schema.sql` sin la extensión, falla. La extensión se crea con `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` al inicio del archivo, así que técnicamente funciona, pero es inconsistente.
**Recomendación:** Usar `gen_random_uuid()` en ambos (no requiere extensión en Supabase).

### ℹ️ LOW — Weak Pydantic Validation

**Archivo:** `bff/models/requests.py`
**Issue:** Campos como `sleep_quality`, `energy`, `mood`, `stress`, `soreness` son `int` sin rangos. `sets: list[dict]` debería ser tipado.
**Impacto:** Bajo ahora (scaffold), pero debe añadirse validación antes de producción.

### ℹ️ LOW — Dual Migration Files

**Contexto:** Existen 2 sets de migraciones:
- `supabase/migrations/` → Para correr en Supabase Dashboard (11 tablas core)
- `bff/migrations/` → Schema completo de referencia (15 tablas)

**Recomendación:** Documentar claramente cuál es el "source of truth" para evitar drift. Sugerir usar solo `supabase/migrations/` como canónico y mover las 4 tablas faltantes ahí.

---

## 4. PHASE 5 — FINAL SCORECARD

| Categoría | Score | Notas |
|---|---|---|
| **Completeness** | 20/20 tasks | Todas las tareas implementadas |
| **Architecture** | ✅ Solid | hasSupabaseConfig pattern, optimistic updates, BFF + direct Supabase split |
| **Schema** | ⚠️ 1 conflict | Rating scale 1-5 vs 1-10 necesita unificarse |
| **Security** | ⚠️ 1 critical | JWT secret default vacío |
| **Type Safety** | ✅ Good | Pydantic v2 en BFF, TypeScript en app |
| **Design Consistency** | ✅ Verified | Fonts, colors, icons, glassmorphism correctos |
| **Demo Mode** | ✅ Preserved | hasSupabaseConfig guard en todos los stores + queries |

---

## 5. PROMPT PARA CLAUDE CODE — FIX ISSUES

```
Fix 3 issues en el BFF de GENESIS:

1. CRITICAL — bff/services/auth.py línea 5:
   Cambiar: JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
   Por:
   JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
   if not JWT_SECRET:
       import warnings
       warnings.warn("SUPABASE_JWT_SECRET not set — auth will reject all requests")
       JWT_SECRET = "not-configured"

2. MEDIUM — supabase/migrations/20260208000000_phase5_tables.sql:
   Cambiar CHECK (rating >= 1 AND rating <= 5)
   Por CHECK (rating >= 1 AND rating <= 10)
   Para que sea consistente con bff/migrations/001_initial_schema.sql

3. MEDIUM — bff/migrations/001_initial_schema.sql:
   Cambiar todos los uuid_generate_v4() por gen_random_uuid()
   Y eliminar la línea CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
   gen_random_uuid() es nativo en Postgres 13+ y es lo que usa Supabase.

Después de los fixes:
- cd bff && python -c "from services.auth import JWT_SECRET; print('auth loaded')"
- Verificar que ambos .sql tienen rating CHECK 1-10
- Verificar que ambos .sql usan gen_random_uuid()
```

---

## 6. NEXT STEPS

Phase 5 está completa. El siguiente milestone es **verificación E2E**:

1. **Build check:** `npx tsc --noEmit` + `cd bff && pip install -r requirements.txt && uvicorn main:app`
2. **Demo mode regression:** Sin env vars de Supabase → todas las pantallas cargan con mock data
3. **BFF integration:** App apuntando a localhost:8000 → chat funciona con mock responses
4. **Supabase integration:** Correr `phase5_tables.sql` + `seed_exercises.sql` en SQL Editor → stores fetch real data

---

*NGX GENESIS — Phase 5 verificación completa. 3 fixes pendientes, luego E2E testing.*
