# GENESIS App — Project Context

## Documentation Navigation (READ THIS FIRST)

### For Coding Agents (Claude Code, Codex, Gemini CLI)

| Priority | File | Purpose |
|----------|------|---------|
| 1 | **THIS FILE (`CLAUDE.md`)** | Source of truth — project state, tech stack, patterns, commands |
| 2 | `GENESIS.md` | Architecture master — 7 agents, target infra, business model |
| 3 | `docs/active/` | **CURRENT work** — PRD + Master Prompt for active phase |

### Active Phase: Visual Refinement Pass — Home ✅, Train ✅ (merged PR #11), Fuel next.

### Active Documents
- `docs/active/MASTER_PROMPT_HOME_REFINEMENT.md` — Home visual refinement prompt
- `docs/active/SESSION_CONTEXT_UI_REFINEMENT.md` — Current UI refinement session context
- `docs/plans/2026-02-17-train-visual-polish.md` — Train visual polish plan (completed)
- `docs/plans/2026-02-18-set-logging-overhaul.md` — Set logging overhaul design

### Reference Only (DO NOT EXECUTE)
- `docs/completed/ui-phase5/` — UI Phase 5 "First Mile" (Sprints N/O/P) — Done
- `docs/completed/ui-phase4/` — UI Phase 4 "Core Experience" (Sprints K/L/M) — Done
- `docs/completed/ui-phase3/` — UI Phase 3 "HYBRID Ceremony" (Sprints H/I/J) — Done
- `docs/completed/ui-phase2/` — UI Phase 2 "Visual Density" (Sprints D/E/F/G) — Done
- `docs/completed/ui-phase1/` — Sprints A/B/C (onboarding, FAB, animations) — Done
- `docs/completed/phase9-adk/` — ADK agents, A2UI, intelligence, knowledge — Done
- `docs/completed/phase8-steel/` — Testing, hardening, offline-first — Done
- `docs/research/` — UI research, benchmarks, design specs, audits
- `docs/plans/prompts/` — Claude Code execution prompts (historical)

### Deprecated (IGNORE)
- `docs/deprecated/` — Obsolete prompts with exposed credentials. Never use.

---

## What is this?

GENESIS is a premium AI-powered fitness coaching app built with Expo (React Native) and a FastAPI BFF (Backend for Frontend). It currently runs 5 ADK agents (genesis orchestrator + train, fuel, mind, track sub-agents) powered by Gemini, with 2 more planned (vision, coach_bridge). The app features 12-week periodized training seasons and comprehensive wellness tracking. A companion coach web app (GENESIS BRAIN, Next.js) is planned for Sprint 6.

## Current Status (Visual Refinement Pass — Feb 2026)

### Completed Phases
- **Phase 1-4**: Core screens, navigation, chat, UI polish
- **Phase 5**: Supabase integration, workout flow, chat backend
- **UI Phase 5 "First Mile" (Sprints N/O/P)**: Welcome briefing, Getting Started card, settings screen (editable profile, logout alert, master notification toggle, quiet hours, support email), smart context-aware notifications with streak gating, coach notification deep-link
- **Phase 5.5**: UI refinement, color system overhaul, auth redesign
- **Phase 6 Sprint 1**: Color fixes, DB migrations, training data pipeline
- **Phase 6 Sprint 2**: Wire Home, Track, Mind tabs to real data
- **Phase 6 Sprint 3**: Wire GENESIS AI chat and Fuel tab to real data
- **Phase 6 Sprint 4**: Exercise library, education content, loading states
- **Phase 7**: HealthKit integration, camera scanner, voice call audio pipeline, Zustand fix
- **Phase 8 STEEL**: Env/BFF hardening, PR detection, progress photos, nutrition validation, offline queue, push notifications, auth refresh, Jest + Pytest testing, EAS build config, performance optimizations
- **Phase 9 Sprint 1**: ADK multi-agent system (genesis + train/fuel/mind/track sub-agents), 16 Supabase-backed tools, ADK Runner-based routing, InMemorySessionService
- **Phase 9 Sprint 2**: A2UI widget pipeline, unified GENESIS voice (agent identity fix), widget extraction from agent responses, 20 A2UI widget types on mobile
- **Phase 9 Sprint 3**: Real Gemini AI intelligence, DatabaseSessionService (persistent conversations), user memory system, input/output guardrails, health check fix, 122 BFF tests
- **Phase 9 Sprint 4 Track A**: Intelligence infrastructure — 3-level response cache (L1 in-memory + L2 pgvector semantic), Gemini text-embedding-004 embeddings, NGX Philosophy context cache, Gemini File Search API wrapper (knowledge_tools), GoogleSearch grounding for FUEL/MIND agents, refined per-agent prompts with build_system_prompt()
- **Phase 9 Sprint 4 Track B**: Knowledge deployment + Cloud Run — 15 knowledge docs (51K tokens, 147 evidence blocks) across 5 File Search stores, batch upload automation (upload_knowledge_stores.py), production Dockerfile (non-root user, PORT env), Cloud Run deploy script, smoke test suite, .env.example for BFF + mobile
- **Visual Refinement Pass (in progress)**: Premium UI polish across all tabs. Home done (adaptive briefing, streak badge, training chips). Train done (image-rich cards, contextual form cues, phase prescriptions, enhanced rest timer, post-workout summary — merged PR #11). Fuel next.

### What works right now
- 5 main tabs: Home, Train, Fuel, Mind, Track
- AI chat with Gemini via BFF — GENESIS speaks as ONE unified entity (never reveals sub-agents)
- ADK multi-agent orchestration: genesis root + train/fuel/mind/track sub-agents via ADK Runner
- 16 Supabase-backed tools across 5 tool modules, all returning `suggested_widgets`
- A2UI widget pipeline: tools → agent response → `_extract_widgets()` → mobile renderer
- 20 A2UI widget types rendered on mobile (8 priority with full UI, 12 with GlassCard fallback)
- Widget extraction from ```widget JSON blocks in agent responses, with heuristic fallback
- Camera scanner for food/equipment recognition
- Voice call audio pipeline (ElevenLabs)
- HealthKit integration (steps, sleep, heart rate)
- Supabase auth + data persistence
- 12-week season/training plan system
- Nutrition tracking with meal logging + water
- Wellness check-ins
- Exercise library with video modals
- Education content system
- Offline queue (AsyncStorage-based, auto-retry with FIFO processing)
- Push notifications (Expo Notifications with permission handling)
- Auth token refresh (auto-refresh on 401 responses)
- Personal Record (PR) detection on workout completion
- Progress photos (upload to Supabase Storage with thumbnails)
- Nutrition validation (macro sanity checks)
- Jest unit tests (~45 test cases across 8 stores + 1 service)
- DatabaseSessionService for persistent conversations (psycopg2 + Supabase PostgreSQL, fallback to InMemory)
- User memory system (get_user_memories + store_user_memory via user_memory table)
- Input guardrails (injection blocking, empty/length validation)
- Output guardrails (agent identity leak sanitization)
- BFF Pytest tests (~122 test cases across 14 test modules)
- EAS build configuration (development/preview/production profiles)
- Performance optimizations (useMemo for nutrition totals, useCallback for workout handlers)
- 3-level response cache: L1 in-memory exact-match (TTLCache, 5min TTL) + L2 pgvector semantic similarity (cosine ≥ 0.92, 1hr TTL via HNSW index)
- Gemini text-embedding-004 embeddings (768-dim) for semantic cache
- NGX Philosophy context cache (build_system_prompt() prepends coaching philosophy to all agents)
- Gemini File Search API wrapper (knowledge_tools.py) with per-domain stores + graceful fallback
- GoogleSearch grounding for FUEL and MIND agents (real-time food/research data)
- search_knowledge tool wired into all 5 agents
- Refined per-agent prompts with domain expertise (periodization, macros, HRV, scoring)
- Health endpoint with cache stats and knowledge store status
- response_cache table with pgvector HNSW index + pg_cron hourly cleanup
- File Search store manager CLI (scripts/manage_stores.py)
- 15 knowledge documents (51K tokens, 147 evidence blocks) across 5 domains — ready for File Search upload
- Batch upload automation (scripts/upload_knowledge_stores.py) — creates stores, uploads docs, verifies with test queries
- Production Dockerfile (non-root user, PORT env var, selective COPY, .dockerignore)
- Cloud Run deploy script (scripts/deploy_cloud_run.sh) — Artifact Registry + gcloud run deploy
- End-to-end smoke test script (scripts/smoke_test.py) — health, chat, knowledge retrieval validation
- .env.example for BFF (all env vars documented) + root .env.example for mobile
- Settings screen: editable profile name (persists via `upsertProfile` to Supabase), logout confirmation alert, master notification toggle, quiet hours editor, support email link (`soporte@ngx.com`)
- Smart notifications: context-aware (check-in, training, streak risk, hydration), streak notification gated on streak >= 3, streak persisted to AsyncStorage for non-React access
- Notification deep-links: check_in → check-in modal, training → train tab, nutrition → fuel tab, coach → genesis-chat modal
- Welcome briefing + Getting Started card on home screen
- Premium visual polish: Home (adaptive briefing, streak badge, training param chips), Train (image-rich exercise cards, contextual form cue icons, phase prescriptions, sticky CTA, enhanced rest timer with readable tips, post-workout summary redesign)

### Known issues
- `react-native-svg` version mismatch warning (15.15.2 installed, 15.12.1 expected)
- `expo-av` deprecated warning (migrate to `expo-audio` + `expo-video` in future)
- EAS `projectId` and Apple Team ID need to be filled after `npx eas init`

### Not yet deployed (requires GCP credentials — Sprint 4 Track B execution)
- File Search stores need `GOOGLE_API_KEY` + `python scripts/upload_knowledge_stores.py --step all` to populate
- BFF Cloud Run deploy needs `./scripts/deploy_cloud_run.sh <PROJECT_ID>` with GCP access
- Mobile `EXPO_PUBLIC_BFF_URL` needs update to Cloud Run URL after deploy

### Not yet implemented (Sprint 5+ targets)
- Agents run inside BFF process, not on Vertex AI Agent Engine (Sprint 5)
- VISION is not an ADK agent — `vision.py` calls Gemini directly (Sprint 5: VISION ADK agent)
- COACH_BRIDGE agent not built — no A2A protocol (Sprint 5)
- GENESIS BRAIN coach app not started (Sprint 6)

## Tech Stack

### Mobile
- **Expo SDK 54** (`expo@~54.0.33`)
- **React Native 0.81.5** (New Architecture enabled)
- **TypeScript 5.9**
- **NativeWind v4** (Tailwind CSS for React Native)
- **Zustand 5** for state management
- **expo-router v6** for navigation
- **React 19.1.0**

### BFF (Backend for Frontend)
- **FastAPI 0.115.6**
- **Python 3.12**
- **Pydantic v2** (2.10.4)
- **Supabase Python SDK** (2.11.0)
- **Google ADK** (1.25.0) — Agent Development Kit for multi-agent orchestration
- **Google GenAI** (1.1.0) — Gemini 2.0 Flash (vision service) + text-embedding-004 (embeddings)
- **cachetools** (5.5.0) — L1 in-memory TTL cache
- **python-jose** for JWT auth
- **httpx** for HTTP client

### Infrastructure
- **Database**: Supabase (PostgreSQL + Auth + RLS + pgvector + pg_cron)
- **AI Agents**: Google ADK multi-agent system (5 agents) → `gemini-2.5-flash` via ADK Runner
- **Embeddings**: Gemini `text-embedding-004` (768-dim) for semantic cache
- **Response Cache**: L1 in-memory (cachetools TTLCache) + L2 pgvector (Supabase, HNSW cosine)
- **Knowledge**: Gemini File Search API wrapper (per-domain stores, graceful fallback)
- **Grounding**: GoogleSearch (ADK built-in) for FUEL and MIND agents
- **Vision**: `gemini-2.0-flash` multimodal via google-genai SDK (separate from ADK, will become ADK agent in Sprint 5)
- **Voice**: ElevenLabs for conversational voice
- **Health**: HealthKit (iOS) / Health Connect (Android)
- **Storage**: Supabase Storage (`progress-photos` bucket) for progress photo uploads

### Design System
- Dark theme (`#0D0D2B` backgrounds)
- Glass morphism cards
- JetBrains Mono + Inter fonts
- Gradient accents

## Project Structure

```
genesis-app/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout
│   ├── index.tsx                 # Entry redirect
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── home.tsx              # Dashboard — season, nutrition, wellness, HealthKit
│   │   ├── train.tsx             # Training plans, today's workout
│   │   ├── fuel.tsx              # Nutrition logging, meals, water, macros
│   │   ├── mind.tsx              # Meditation, wellness, mental health
│   │   └── track.tsx             # Progress tracking, metrics, photos
│   ├── (modals)/                 # Modal screens
│   │   ├── genesis-chat.tsx      # AI chat with agent personas
│   │   ├── check-in.tsx          # Daily wellness check-in
│   │   ├── camera-scanner.tsx    # Food/equipment camera recognition
│   │   ├── voice-call.tsx        # Voice call with AI coach
│   │   └── exercise-video.tsx    # Exercise demo video player
│   └── (screens)/                # Full screens
│       ├── settings.tsx          # Settings: profile, notifications, quiet hours, support
│       ├── active-workout.tsx    # Live workout tracking
│       ├── library.tsx           # Exercise library browser
│       ├── exercise-detail.tsx   # Single exercise detail
│       ├── education.tsx         # Education content list
│       └── education-detail.tsx  # Single education article
├── bff/                          # FastAPI Backend for Frontend
│   ├── main.py                   # App entry, CORS, routes
│   ├── conftest.py               # Pytest fixtures + mock Supabase
│   ├── agents/                   # ADK agent definitions
│   │   ├── genesis_agent.py      # Root agent — orchestrates sub-agents
│   │   ├── train_agent.py        # Training sub-agent
│   │   ├── fuel_agent.py         # Nutrition sub-agent
│   │   ├── mind_agent.py         # Wellness sub-agent
│   │   ├── track_agent.py        # Progress tracking sub-agent
│   │   └── tools/                # Supabase-backed tools for agents
│   │       ├── profile_tools.py  # get_user_profile, get_current_season, get_today_checkin
│   │       ├── training_tools.py # get_today_workout, get_exercise_catalog, get_personal_records, log_exercise_set
│   │       ├── nutrition_tools.py # get_today_meals, log_meal, get_water_intake, log_water
│   │       ├── wellness_tools.py # get_wellness_trends, submit_check_in
│   │       ├── tracking_tools.py # get_progress_stats, get_strength_progress, compare_periods
│   │       └── knowledge_tools.py # search_knowledge (Gemini File Search API wrapper)
│   ├── data/
│   │   └── ngx_philosophy.md     # NGX coaching philosophy (used by context cache)
│   ├── knowledge/                # 15 knowledge docs for File Search stores
│   │   ├── genesis/              # 3 docs: identity, philosophy, muscle endocrine
│   │   ├── train/                # 4 docs: splits, exercises, periodization, corrective
│   │   ├── fuel/                 # 3 docs: nutrition, protein, supplementation
│   │   ├── mind/                 # 3 docs: sleep, stress, brain fitness
│   │   ├── track/                # 2 docs: assessment, tracking system
│   │   └── MANIFEST.md           # Complete inventory (15 docs, 51K tokens, 147 evidence)
│   ├── scripts/
│   │   ├── manage_stores.py      # CLI for Gemini File Search store management
│   │   ├── upload_knowledge_stores.py # Batch upload: create stores + upload 15 docs + verify
│   │   ├── deploy_cloud_run.sh   # Cloud Run deployment script
│   │   └── smoke_test.py         # E2E smoke test (health, chat, knowledge retrieval)
│   ├── Dockerfile                # Production Docker (non-root, PORT env, selective COPY)
│   ├── .dockerignore             # Excludes tests, scripts, knowledge from image
│   ├── .env.example              # All env vars documented
│   ├── routers/
│   │   ├── mobile.py             # Mobile-specific endpoints (/mobile/chat, etc.)
│   │   └── agents.py             # Agent management endpoints
│   ├── services/
│   │   ├── agent_router.py       # ADK Runner routing + widget extraction + L1/L2 cache
│   │   ├── cache.py              # CacheLayer: L1 in-memory + L2 pgvector semantic
│   │   ├── embeddings.py         # Gemini text-embedding-004 (768-dim)
│   │   ├── context_cache.py      # NGX Philosophy loader + build_system_prompt()
│   │   ├── gemini_client.py      # Gemini API integration
│   │   ├── auth.py               # JWT validation with Supabase
│   │   ├── supabase.py           # Supabase client for BFF
│   │   └── vision.py             # Image analysis for camera scanner
│   └── tests/                    # Pytest test suite
│       ├── test_health.py        # Health endpoint tests
│       ├── test_mobile_chat.py   # Chat endpoint tests
│       ├── test_mobile_training.py # Training endpoint tests
│       ├── test_mobile_nutrition.py # Nutrition endpoint tests
│       ├── test_mobile_wellness.py  # Wellness endpoint tests
│       ├── test_auth.py          # JWT auth tests
│       ├── test_vision.py        # Vision endpoint tests
│       ├── test_agents.py        # Agent structure + instruction + Sprint 4 tests
│       ├── test_agent_router_adk.py # ADK routing + widget extraction tests
│       ├── test_tools.py         # Tool unit tests + widget presence tests
│       ├── test_cache.py         # L1/L2 cache tests (12 tests)
│       ├── test_embeddings.py    # Embedding generation tests (3 tests)
│       ├── test_knowledge_tools.py # File Search wrapper tests (5 tests)
│       └── test_context_cache.py # Context cache tests (5 tests)
├── __tests__/                    # Jest test suite
│   ├── stores/                   # Zustand store unit tests
│   │   ├── useAuthStore.test.ts
│   │   ├── useNutritionStore.test.ts
│   │   ├── useTrainingStore.test.ts
│   │   ├── useWellnessStore.test.ts
│   │   ├── useSeasonStore.test.ts
│   │   ├── useTrackStore.test.ts
│   │   └── useGenesisStore.test.ts
│   └── services/                 # Service unit tests
│       └── offlineQueue.test.ts
├── components/                   # Reusable React Native components
│   ├── ui/                       # Design system (GlassCard, Pill, ProgressBar, etc.)
│   └── tracking/                 # Tracking-specific components (ProgressPhotos, etc.)
├── stores/                       # Zustand state stores
│   ├── useAuthStore.ts           # Auth state + Supabase session
│   ├── useSeasonStore.ts         # 12-week training season
│   ├── useTrainingStore.ts       # Daily training plans + workouts
│   ├── useNutritionStore.ts      # Meals, water, macros tracking
│   ├── useWellnessStore.ts       # Check-ins, mood, sleep
│   ├── useTrackStore.ts          # Progress metrics + photos
│   ├── useGenesisStore.ts        # AI chat state
│   ├── useEducationStore.ts      # Education content
│   └── useCacheStore.ts          # Data caching layer
├── services/                     # API clients and business logic
│   ├── genesisAgentApi.ts        # BFF API client
│   ├── supabaseClient.ts         # Supabase JS client init
│   ├── supabaseQueries.ts        # Direct Supabase queries
│   ├── seasonGenerator.ts        # Local season plan generation
│   ├── healthKitIntegration.ts   # HealthKit/Health Connect bridge
│   ├── visionApi.ts              # Camera scanner API client
│   ├── elevenLabsApi.ts          # ElevenLabs TTS API
│   ├── elevenLabsConversation.ts # ElevenLabs conversational voice
│   ├── offlineQueue.ts           # Offline operation queue (AsyncStorage-based)
│   ├── pushNotifications.ts      # Push notification registration + handling
│   └── smartNotifications.ts     # Context-aware notification scheduler (streak >= 3 gating)
├── hooks/                        # Custom React hooks
│   ├── useGenesisChat.ts         # Chat message handling
│   ├── useHealthKit.ts           # HealthKit data hook
│   ├── useVoiceCall.ts           # Voice call lifecycle hook
│   ├── useAuth.ts                # Auth flow hook
│   └── useOfflineSupport.ts      # Offline-first patterns + queue sync
├── utils/                        # Utility functions
│   └── prDetection.ts            # Personal Record detection logic
├── types/                        # TypeScript type definitions
├── data/                         # Static/mock data
├── constants/                    # Theme colors, config values
├── .env.example                  # Mobile env vars (EXPO_PUBLIC_BFF_URL, Supabase, ElevenLabs)
├── eas.json                      # EAS Build configuration
├── jest.config.js                # Jest configuration
└── jest.setup.js                 # Jest mock setup
```

## Key Commands

```bash
# Mobile
npm start                 # Start Expo dev server
npm run ios               # Start with iOS simulator
npm run android           # Start with Android emulator
npm test                  # Run Jest tests
npm run test:coverage     # Jest with coverage report

# BFF
cd bff && uvicorn main:app --reload    # Start BFF server (port 8000)
cd bff && python -m pytest tests/ -v   # Run BFF tests
cd bff && ruff check .                 # Lint BFF

# Knowledge Stores
cd bff && python scripts/upload_knowledge_stores.py --step all   # Create 5 stores + upload 15 docs + verify
cd bff && python scripts/manage_stores.py list                   # List all File Search stores
cd bff && python scripts/manage_stores.py query --domain train --query "periodization"  # Test query

# Cloud Run Deployment
cd bff && ./scripts/deploy_cloud_run.sh <PROJECT_ID>   # Build + push + deploy to Cloud Run
cd bff && python scripts/smoke_test.py --url <CLOUD_RUN_URL>  # E2E smoke test

# EAS Build
npx eas init                           # Initialize EAS project (fills projectId)
npx eas build --profile development    # Dev build (simulator)
npx eas build --profile preview        # Internal distribution
npx eas build --profile production     # Production build
npx eas submit --platform ios          # Submit to TestFlight
```

## Architecture Patterns

- **State**: Zustand stores in `stores/` — each store handles its own data fetching. IMPORTANT: Never call store methods (getDailyTotals, etc.) inside Zustand selectors — read primitives and compute inline to avoid infinite re-render loops.
- **API calls**: BFF endpoints via `services/genesisAgentApi.ts`, direct Supabase via `services/supabaseQueries.ts`
- **Styling**: NativeWind (Tailwind) for simple styles, inline `style` objects for complex layouts
- **AI chat**: User message -> BFF `/mobile/chat` -> agent_router (L1 cache check → L2 semantic check → ADK Runner) -> genesis root agent delegates to sub-agents -> ChatResponse with extracted widgets -> cache store (L1 + L2)
- **GENESIS identity**: GENESIS is ONE unified entity. All agents (root + sub) present themselves as "GENESIS". No instruction reveals internal sub-agents, transfers, or delegation. Tests enforce this.
- **A2UI widgets**: Tools return `suggested_widgets` in responses. Agents embed widgets as ```widget JSON blocks. `_extract_widgets()` parses them into WidgetPayload objects. Mobile renders 20 A2UI widget types. All widgets use `#6D00FF` accent. No per-chip color variations.
- **Auth**: Supabase Auth -> JWT -> BFF validates with python-jose. Auto-refresh on 401 via interceptor in `genesisAgentApi.ts`.
- **Error handling**: Graceful degradation — BFF falls back to AGENT_STUBS, mobile falls back to mock responses
- **Offline-first**: `hasSupabaseConfig` guard in services prevents crashes when env vars aren't set. Failed writes are queued in `offlineQueue.ts` (AsyncStorage) and replayed when connectivity returns via `useOfflineSupport.ts`.
- **Push notifications**: Registered via `pushNotifications.ts` using Expo Notifications. Token stored in Supabase `push_tokens` table.
- **Progress photos**: Uploaded to Supabase Storage `progress-photos` bucket via `supabaseQueries.ts`. Displayed in `components/tracking/ProgressPhotos.tsx` with category-based filtering.
- **PR detection**: `utils/prDetection.ts` compares workout sets against stored personal records and surfaces new PRs on workout completion.
- **Response cache**: 3-level: L1 = cachetools TTLCache (SHA256 key, 5min), L2 = pgvector (cosine ≥ 0.92, 1hr, HNSW index), L3 = Gemini Context Caching (NGX Philosophy via `build_system_prompt()`). L2 hits are promoted to L1. All cache ops are try/except for graceful degradation.
- **Knowledge tools**: `search_knowledge(query, domain)` wraps Gemini File Search API. 5 domains (genesis/train/fuel/mind/track) mapped to stores via env vars. Graceful fallback when stores aren't configured.
- **Agent prompts**: All 5 agents use `build_system_prompt()` which prepends NGX Philosophy to agent instructions. FUEL/MIND also have GoogleSearch for real-time grounding.

## Important Notes

- Season = 12-week training plan with 4 phases, each with weekly plans
- Exercise data includes `muscle_groups` array from DB
- HealthKit requires iOS entitlements (configured in app.json)
- Camera scanner sends images to BFF vision service -> Gemini multimodal
- Voice call uses ElevenLabs conversational API for real-time audio
- The app uses React 19 + New Architecture (Fabric renderer)
- EAS build requires running `npx eas init` first to set `projectId` in app.json
- Supabase Storage bucket `progress-photos` must exist with appropriate RLS policies
- A2UI widget types (20): `metric-card`, `workout-card`, `meal-plan`, `hydration-tracker`, `progress-dashboard`, `insight-card`, `season-timeline`, `today-card`, `exercise-row`, `workout-history`, `body-stats`, `max-rep-calculator`, `rest-timer`, `heart-rate`, `supplement-stack`, `streak-counter`, `achievement`, `coach-message`, `sleep-tracker`, `alert-banner`

## Target Architecture (from GENESIS.md)

```
[GENESIS App (Expo)] → [FastAPI BFF (Cloud Run)] → [ADK Agents (Vertex AI Agent Engine)]
                                                  → [Supabase (DB + Auth + Realtime)]
                                                  → [Upstash Redis (Cache)]

[GENESIS BRAIN (Next.js)] → [Same FastAPI BFF] → [Same agents + Supabase]

[ElevenLabs] ← direct WebRTC from GENESIS App (bypasses BFF)
```

Currently: BFF has Dockerfile + deploy script ready for Cloud Run (pending GCP credentials). Agents run inside BFF process via ADK Runner (not yet on Agent Engine). Sprint 4B-6 progressively moves toward the target architecture.

## Roadmap — Phase 9 Sprints

| Sprint | Name | Focus | Deploys? |
|--------|------|-------|----------|
| Sprint 1 ✅ | ADK Multi-Agent | 5 ADK agents, 16 Supabase tools, Runner routing | No |
| Sprint 2 ✅ | A2UI Pipeline | 20 widget types, unified GENESIS voice, widget extraction | No |
| Sprint 3 ✅ | Encender GENESIS | Real Gemini AI, DatabaseSessionService, user memory, guardrails | No |
| Sprint 4 Track A ✅ | Cerebro (Intelligence) | 3-level cache, embeddings, File Search wrapper, GoogleSearch, prompt refinement | No |
| Sprint 4 Track B ✅ | Cerebro (Knowledge) | 15 docs uploaded, batch automation, Dockerfile + deploy script, smoke tests | Yes (Cloud Run) |
| Sprint 5 | Visión + A2A | All agents to AE, VISION ADK agent, COACH_BRIDGE, A2A protocol | Yes (full AE) |
| Sprint 6 | BRAIN + Alpha | Next.js BRAIN app, A2A bidirectional, TestFlight | Yes (full stack) |

## 7 Target Agents (GENESIS.md)

| Agent | Model | Status | Notes |
|-------|-------|--------|-------|
| GENESIS | Gemini 3 Pro | ✅ Sprint 1 (as gemini-2.5-flash) | Orchestrator, routes to sub-agents |
| TRAIN | Gemini 3 Flash | ✅ Sprint 1 | 4 training tools |
| FUEL | Gemini 3 Flash | ✅ Sprint 1 | 4 nutrition tools |
| MIND | Gemini 3 Flash | ✅ Sprint 1 | 2 wellness tools |
| TRACK | Gemini 3 Flash | ✅ Sprint 1 | 3 tracking tools |
| VISION | Gemini 3 Flash Multimodal | ❌ Sprint 5 | Currently vision.py (non-ADK) |
| COACH_BRIDGE | Gemini 3 Flash | ❌ Sprint 5 | Needs BRAIN app + A2A |
