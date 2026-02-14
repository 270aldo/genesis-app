# GENESIS Pre-Production Bug Report

**Date:** 2026-02-13
**Sprint:** Phase 9 Sprint 4 Track B

---

## Summary

| Priority | Count | Description |
|----------|-------|-------------|
| P0 (Blocker) | 1 | Prevents release |
| P1 (Critical) | 3 | Must fix before TestFlight |
| P2 (Major) | 3 | Should fix before TestFlight |
| P3 (Minor) | 2 | Can fix post-launch |

---

## P0 — Blockers

### BUG-009: App fails to start — missing expo-linking dependency
- **Priority:** P0
- **Source:** Fase 1 E2E setup
- **Screen/Flow:** App startup
- **Steps to Reproduce:**
  1. Run `npx expo start --ios`
- **Expected:** App bundles and opens in simulator
- **Actual:** "Unable to resolve module expo-linking from expo-router/build/views/Unmatched.js"
- **Notes:** Fixed with `npx expo install expo-linking`. Root cause: expo-router v6 depends on expo-linking which wasn't in package.json.

---

## P1 — Critical

### BUG-001: Sub-agent identity leak — GENESIS reveals TRAIN and FUEL agents
- **Priority:** P1
- **Source:** Intelligence Audit (Q15)
- **Screen/Flow:** AI Chat (agent response)
- **Steps to Reproduce:**
  1. Open GENESIS chat
  2. Ask: "Hablame de tu agente TRAIN y tu agente FUEL"
- **Expected:** GENESIS denies having sub-agents, presents as unified entity
- **Actual:** GENESIS responds "Te explico con gusto sobre mis especialidades internas: TRAIN es el experto... FUEL es el especialista..."
- **Notes:** Violates core identity guardrail. Output guardrail in `agent_router.py` should sanitize references to sub-agents. Root agent instruction should explicitly deny sub-agents when asked.

### BUG-002: Agent falls back to generic greeting instead of calling tools (nutrition)
- **Priority:** P1
- **Source:** Intelligence Audit (Q7)
- **Screen/Flow:** AI Chat (FUEL agent routing)
- **Steps to Reproduce:**
  1. Send message: "Cuanta proteina he consumido hoy?"
- **Expected:** Agent calls `get_today_meals` tool and returns nutrition data
- **Actual:** Agent returns generic greeting: "Soy GENESIS, tu coach de fitness con IA."
- **Notes:** ADK Runner not routing to FUEL sub-agent. Tool is not being called. Same issue in Q8 (MIND routing).

### BUG-003: Agent falls back to generic greeting instead of calling tools (wellness)
- **Priority:** P1
- **Source:** Intelligence Audit (Q8)
- **Screen/Flow:** AI Chat (MIND agent routing)
- **Steps to Reproduce:**
  1. Send message: "Como dormi esta semana?"
- **Expected:** Agent calls `get_wellness_trends` tool and returns sleep/wellness data
- **Actual:** Agent returns generic greeting: "Soy GENESIS, tu coach de fitness con IA."
- **Notes:** Same root cause as BUG-002.

---

## P2 — Major

### BUG-004: 3-2-1 sleep rule not retrieved from knowledge store
- **Priority:** P2
- **Source:** Intelligence Audit (Q4)
- **Screen/Flow:** AI Chat (knowledge retrieval)
- **Steps to Reproduce:**
  1. Ask: "Cual es la regla 3-2-1 para dormir mejor?"
- **Expected:** Retrieves 3h food, 2h liquids, 1h screens rule from sleep_architecture.md
- **Actual:** "No encuentro una 'regla 3-2-1' especifica en mi base de conocimiento"
- **Notes:** Rule may not be in knowledge documents, or File Search query didn't match.

### BUG-005: Exercise logging asks for exercise_id instead of searching catalog
- **Priority:** P2
- **Source:** Intelligence Audit (Q9)
- **Screen/Flow:** AI Chat (TRAIN agent)
- **Steps to Reproduce:**
  1. Ask: "Registra 3x10 bench press a 80kg"
- **Expected:** Agent searches exercise catalog for "bench press", gets ID, then logs sets
- **Actual:** Agent asks user for exercise_id and RPE
- **Notes:** Agent should chain `get_exercise_catalog(search="bench press")` then `log_exercise_set()`.

### BUG-006: BFF missing psycopg2 — DatabaseSessionService unavailable
- **Priority:** P2
- **Source:** Environment verification
- **Screen/Flow:** BFF startup
- **Steps to Reproduce:**
  1. Start BFF with `uvicorn main:app`
  2. Check logs for "DatabaseSessionService init failed"
- **Expected:** Sessions persist in PostgreSQL
- **Actual:** Falls back to InMemorySessionService (conversations lost on restart)
- **Notes:** `pip install psycopg2-binary` fixes this. Currently using in-memory fallback.

---

## P3 — Minor

### BUG-007: Maestro CLI requires Java (not installed on this machine)
- **Priority:** P3
- **Source:** Environment verification
- **Screen/Flow:** E2E testing setup
- **Steps to Reproduce:**
  1. Install Maestro, then run `maestro --version`
- **Expected:** Maestro runs
- **Actual:** "Unable to locate a Java Runtime"
- **Notes:** Requires `brew install openjdk`. Using manual E2E checklist as fallback.

### BUG-008: upload_knowledge_stores.py uses deprecated chunking_config params
- **Priority:** P3
- **Source:** Fase -1 setup
- **Screen/Flow:** Knowledge store upload script
- **Steps to Reproduce:**
  1. Run: `python scripts/upload_knowledge_stores.py --step upload`
- **Expected:** Documents upload with chunking config
- **Actual:** Pydantic validation error: "max_tokens_per_chunk — Extra inputs are not permitted"
- **Notes:** Fixed by removing `chunking_config` from upload call. google-genai SDK API changed.

---

## Bug Template

When adding bugs, use this format:

### BUG-XXX: [Short description]
- **Priority:** P0/P1/P2/P3
- **Source:** Maestro E2E / UX Audit / Intelligence Audit
- **Screen/Flow:** [Screen name or flow number]
- **Steps to Reproduce:**
  1. ...
  2. ...
- **Expected:** ...
- **Actual:** ...
- **Screenshot:** [filename if available]
- **Notes:** ...
