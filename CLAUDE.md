# GENESIS App — Project Context

## What is this?

GENESIS is a premium AI-powered fitness coaching app built with Expo (React Native) and a FastAPI BFF (Backend for Frontend). It features 7 AI agent personas (genesis, train, fuel, mind, track, vision, coach_bridge) powered by Gemini, 12-week periodized training seasons, and comprehensive wellness tracking.

## Current Status (Phase 9 Sprint 2 complete — Feb 2026)

### Completed Phases
- **Phase 1-4**: Core screens, navigation, chat, UI polish
- **Phase 5**: Supabase integration, workout flow, chat backend
- **Phase 5.5**: UI refinement, color system overhaul, auth redesign
- **Phase 6 Sprint 1**: Color fixes, DB migrations, training data pipeline
- **Phase 6 Sprint 2**: Wire Home, Track, Mind tabs to real data
- **Phase 6 Sprint 3**: Wire GENESIS AI chat and Fuel tab to real data
- **Phase 6 Sprint 4**: Exercise library, education content, loading states
- **Phase 7**: HealthKit integration, camera scanner, voice call audio pipeline, Zustand fix
- **Phase 8 STEEL**: Env/BFF hardening, PR detection, progress photos, nutrition validation, offline queue, push notifications, auth refresh, Jest + Pytest testing, EAS build config, performance optimizations
- **Phase 9 Sprint 1**: ADK multi-agent system (genesis + train/fuel/mind/track sub-agents), 16 Supabase-backed tools, ADK Runner-based routing, InMemorySessionService
- **Phase 9 Sprint 2**: A2UI widget pipeline, unified GENESIS voice (agent identity fix), widget extraction from agent responses, 20 A2UI widget types on mobile

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
- BFF Pytest tests (~86 test cases across 10 test modules)
- EAS build configuration (development/preview/production profiles)
- Performance optimizations (useMemo for nutrition totals, useCallback for workout handlers)

### Known issues
- `react-native-svg` version mismatch warning (15.15.2 installed, 15.12.1 expected)
- `expo-av` deprecated warning (migrate to `expo-audio` + `expo-video` in future)
- EAS `projectId` and Apple Team ID need to be filled after `npx eas init`

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
- **Google GenAI** (1.1.0) — Gemini 2.0 Flash
- **python-jose** for JWT auth
- **httpx** for HTTP client

### Infrastructure
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **AI**: Google Gemini 2.0 Flash via google-genai SDK
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
│   │       └── tracking_tools.py # get_progress_stats, get_strength_progress, compare_periods
│   ├── routers/
│   │   ├── mobile.py             # Mobile-specific endpoints (/mobile/chat, etc.)
│   │   └── agents.py             # Agent management endpoints
│   ├── services/
│   │   ├── agent_router.py       # ADK Runner routing + widget extraction
│   │   ├── gemini_client.py      # Gemini API integration
│   │   ├── auth.py               # JWT validation with Supabase
│   │   ├── supabase.py           # Supabase client for BFF
│   │   └── vision.py             # Image analysis for camera scanner
│   └── tests/                    # Pytest test suite (86 tests)
│       ├── test_health.py        # Health endpoint tests
│       ├── test_mobile_chat.py   # Chat endpoint tests
│       ├── test_mobile_training.py # Training endpoint tests
│       ├── test_mobile_nutrition.py # Nutrition endpoint tests
│       ├── test_mobile_wellness.py  # Wellness endpoint tests
│       ├── test_auth.py          # JWT auth tests
│       ├── test_vision.py        # Vision endpoint tests
│       ├── test_agents.py        # Agent structure + instruction tests
│       ├── test_agent_router_adk.py # ADK routing + widget extraction tests
│       └── test_tools.py         # Tool unit tests + widget presence tests
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
│   └── pushNotifications.ts      # Push notification registration + handling
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
- **AI chat**: User message -> BFF `/mobile/chat` -> agent_router -> ADK Runner (genesis root agent delegates to sub-agents) -> ChatResponse with extracted widgets
- **GENESIS identity**: GENESIS is ONE unified entity. All agents (root + sub) present themselves as "GENESIS". No instruction reveals internal sub-agents, transfers, or delegation. Tests enforce this.
- **A2UI widgets**: Tools return `suggested_widgets` in responses. Agents embed widgets as ```widget JSON blocks. `_extract_widgets()` parses them into WidgetPayload objects. Mobile renders 20 A2UI widget types. All widgets use `#6D00FF` accent. No per-chip color variations.
- **Auth**: Supabase Auth -> JWT -> BFF validates with python-jose. Auto-refresh on 401 via interceptor in `genesisAgentApi.ts`.
- **Error handling**: Graceful degradation — BFF falls back to AGENT_STUBS, mobile falls back to mock responses
- **Offline-first**: `hasSupabaseConfig` guard in services prevents crashes when env vars aren't set. Failed writes are queued in `offlineQueue.ts` (AsyncStorage) and replayed when connectivity returns via `useOfflineSupport.ts`.
- **Push notifications**: Registered via `pushNotifications.ts` using Expo Notifications. Token stored in Supabase `push_tokens` table.
- **Progress photos**: Uploaded to Supabase Storage `progress-photos` bucket via `supabaseQueries.ts`. Displayed in `components/tracking/ProgressPhotos.tsx` with category-based filtering.
- **PR detection**: `utils/prDetection.ts` compares workout sets against stored personal records and surfaces new PRs on workout completion.

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
- Phase 9 Sprint 3 target: Full TestFlight submission, end-to-end agent testing with real Gemini, production session persistence
