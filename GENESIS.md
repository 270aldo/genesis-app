# GENESIS — NGX Performance & Longevity App

## What Is This

AI-powered coaching platform for adults 30-60. Integrates training, nutrition, cognitive health, and biomarker tracking in one ecosystem. GENESIS is the AI coach that designs personalized 12-week training seasons using real biology, context, and adherence data.

**Two apps, one ecosystem:**
- **GENESIS** (user app) — Expo mobile app for athletes/users
- **GENESIS BRAIN** (coach app) — Next.js web app for Aldo (human coach) to manage athletes, modify plans, review check-ins, approve AI suggestions

**Business model:**
- Phase HYBRID (Year 1): Human coach (Aldo) + AI co-design seasons together. Aldo uses GENESIS BRAIN to manage athletes. Price: $299/month
- Phase ASCEND (Year 2+): AI-only autonomous coaching at $99/month. GENESIS operates independently, Aldo monitors via BRAIN dashboard

**Cross-app communication:** GENESIS ↔ BRAIN via shared Supabase DB + A2A protocol (Agent-to-Agent v0.3)

---

## Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Mobile | Expo + Expo Router | SDK 54, Router v4 |
| Runtime | React Native (New Architecture) | 0.81 |
| Styling | NativeWind | 4.2.1 (Tailwind 3.4.x, NOT v4) |
| State | Zustand | v5 |
| Auth persistence | SecureStore | Expo built-in |
| Data persistence | AsyncStorage | Expo built-in |
| Database | Supabase PostgreSQL + RLS | Postgres 17 |
| AI Agents | Google ADK on Vertex AI Agent Engine | v1.24.0 |
| LLMs | Gemini 3 Pro (orchestrator) / Flash (specialists) | — |
| Cache | Upstash Redis (3-level: exact + semantic + session) | — |
| Voice | ElevenLabs React Native SDK (WebRTC) | v0.5.10 |
| Generative UI | A2UI Protocol | v0.8 |
| Icons | Lucide React Native (NEVER emojis) | — |
| Package manager | npm (NOT pnpm, NOT yarn) | — |
| BFF | FastAPI on Cloud Run | Python 3.12 |
| Coach App | Next.js 15 + App Router | — |
| A2A Protocol | Agent-to-Agent | v0.3 |

**CRITICAL:** flat Expo project, NOT monorepo. monorepo + pnpm BREAKS NativeWind v4.

---

## Project Structure

```
genesis-app/
├── app/
│   ├── (auth)/        login, sign-up, onboarding, forgot-password
│   ├── (tabs)/        home, train, fuel, mind, track
│   ├── (modals)/      genesis-chat, camera-scanner, voice-call, exercise-video, check-in
│   ├── (screens)/     library, exercise-detail, education, education-detail
│   └── _layout.tsx    Root layout
├── components/
│   ├── ui/            GlassCard, Button, Pill, ProgressBar, SectionLabel, etc.
│   ├── navigation/    CustomTabBar
│   ├── genesis/       FloatingGenesisButton, GenesisChat, WidgetRenderer
│   ├── training/      WorkoutCard, ExerciseRow, SetLogger, RestTimer
│   ├── nutrition/     MacroCard, MealCard, WaterTracker, FoodScanner
│   ├── wellness/      MoodSelector, SleepChart, StressGauge
│   └── tracking/      ScoreCard, BarChart, PRCard, ProgressPhoto
├── stores/            7 Zustand stores
├── services/          API clients (supabase, genesis-api, healthKit, vision)
├── hooks/             Custom hooks
├── types/             TypeScript interfaces
├── constants/         Colors, fonts, tokens, config
└── assets/            Fonts (Inter, JetBrains Mono)
```

---

## Design System — Genesis Fusion + Liquid Glass

### Colors

- **Background gradient:** `['#0D0D2B', '#1A0A30']` (LinearGradient on every screen)
- **Glass card:** `bg-[#14121aB3]`, border `#FFFFFF14`
- **Primary accent:** `#6D00FF` / `#b39aff` (violet)
- **Success:** `#22ff73`
- **Info:** `#38bdf8`
- **Error:** `#ff6b6b`
- **Muted text:** `#827a89`
- **Inactive:** `#6b6b7b`

### Typography

NativeWind classes (paired with custom font assets):

- `font-inter-bold` — headings, card titles
- `font-inter` — body text
- `font-jetbrains-bold` — numbers, metrics, scores
- `font-jetbrains-semibold` — buttons, labels
- `font-jetbrains-medium` — section headers, tags

### Component Patterns

- **Every screen:** `<LinearGradient colors={['#0D0D2B', '#1A0A30']}>` → `<SafeAreaView>` → `<ScrollView>`
- **GlassCard:** rounded-[16px], shadow variants (primary/success/warning/error), optional `shine` prop
- **Buttons:** `<LinearGradient colors={['#6D00FF', '#5B21B6']}>` with borderRadius 14
- **TabBar:** BlurView intensity=20 tint="dark", Lucide icons, active dot indicator
- **Icons:** Lucide React Native only. NEVER use emojis.

### Prohibitions

- NO white/light backgrounds anywhere
- NO default system fonts
- NO flat cards without border/shadow
- NO placeholder "Lorem ipsum" text
- NO emoji as icons

---

## Database — 15 Supabase Tables, All with RLS

### Core Tables

**profiles**
- Extends auth.users
- Fields: name, age, goals[], capacity, timezone, subscription_mode (hybrid|ascend)
- RLS: User can only read/write own profile

**seasons**
- 12-week training blocks
- Fields: goal, status (active|completed|paused), created_by (coach|ai|hybrid), start_date, end_date
- RLS: User reads own; coach reads assigned athletes; AI service role writes

**phases**
- Within season: strength, power, endurance, deload
- Fields: season_id, type, week_start, week_end
- RLS: Inherited from season

**weeks**
- Within phase
- Fields: phase_id, week_number (1-12), focus, is_deload
- RLS: Inherited from phase

**sessions**
- Daily workout
- Fields: phase_id, week_num, day_num, exercises (JSONB), source (coach|ai), completed_at
- RLS: User reads own; coach reads assigned athletes

### Training Tables

**exercises**
- Library of all exercises
- Fields: name, muscle_groups[], equipment[], difficulty, video_url, form_cues[]
- RLS: Public read for all users

**exercise_logs**
- User workout data
- Fields: user_id, exercise_id, sets (JSONB: [{reps, weight, rpe}]), fatigue_rating (1-5), pr_detected (boolean)
- RLS: User reads/writes own; coach reads assigned athletes

**personal_records**
- PRs achieved
- Fields: user_id, exercise_id, type (1rm|max_reps|max_weight), value, achieved_at
- RLS: User reads/writes own; coach reads assigned athletes

### Lifestyle Tables

**meals**
- Food log entries
- Fields: user_id, meal_type (breakfast|lunch|dinner|snack), food_items (JSONB), calories, protein, carbs, fat, logged_at
- RLS: User reads/writes own; coach reads assigned athletes

**check_ins**
- Daily wellness snapshot
- Fields: user_id, date, sleep_hours (decimal), sleep_quality (1-5), mood (1-5), energy (1-5), stress (1-5), soreness_areas (text[])
- RLS: User reads/writes own; coach reads assigned athletes

**biomarkers**
- Health metrics
- Fields: user_id, metric_type, value, unit, source (manual|healthkit|wearable), measured_at
- RLS: User reads/writes own; coach reads assigned athletes

### System Tables

**conversations**
- Chat history between user and GENESIS
- Fields: user_id, messages (JSONB), session_state (JSONB), agent_used, created_at, updated_at
- RLS: User reads/writes own; AI service role writes

**coach_assignments**
- Coach-user relationship (for HYBRID mode)
- Fields: coach_id, user_id, mode (hybrid|ascend), status (active|paused), start_date, end_date
- RLS: Coach reads own assignments; user can view coaches assigned to them

**widget_states**
- A2UI persistence across sessions
- Fields: user_id, widget_type, data (JSONB), screen, last_updated
- RLS: User reads/writes own; AI service role writes

**notification_settings**
- User preferences
- Fields: user_id, channel (push|email|sms), category (workout|nutrition|recovery), enabled (boolean), quiet_hours (jsonb: {start_time, end_time})
- RLS: User reads/writes own

### Supabase Realtime Channels

- `check_ins` → BRAIN gets notification when user completes check-in
- `sessions` → live workout progress visible in BRAIN
- `conversations` → cross-device sync for chat history
- `seasons` → coach modifications push to user app instantly

---

## Zustand Stores — 7 Stores

| Store | Persistence | Key State |
|-------|-------------|-----------|
| useAuthStore | SecureStore (encrypted) | user, session, jwt, profile, isAuthenticated |
| useSeasonStore | AsyncStorage | activeSeason, currentPhase, currentWeek, phases[], weeks[] |
| useTrainingStore | AsyncStorage | todayWorkout, exerciseLog[], personalRecords[], activeSet |
| useNutritionStore | AsyncStorage | todayMeals[], macroTotals, waterGlasses, calorieTarget |
| useWellnessStore | AsyncStorage | todayCheckIn, moodHistory[], sleepData, stressLevel |
| useTrackStore | AsyncStorage | fitnessScore, nutritionScore, wellnessScore, weeklyActivity[], prs[] |
| useGenesisStore | AsyncStorage | messages[], isTyping, activeWidgets[], voiceCallActive |

---

## AI Agents — 7 Google ADK Agents on Vertex AI

### Agent Architecture

GENESIS Orchestrator uses ADK sub-agents for internal communication (no network overhead). Cross-app communication with GENESIS BRAIN uses A2A protocol (network, HTTP).

### Agent Table

| Agent | Model | Purpose | Knowledge Corpus |
|-------|-------|---------|-----------------|
| **GENESIS** | Gemini 3 Pro | Orchestrator — routes requests, designs seasons, fitness assessment, personality layer | NGX philosophy, season templates, assessment protocols |
| **TRAIN** | Gemini 3 Flash | Workout generation, periodization, exercise selection, real-time adaptation | Exercise database, periodization science, RPE tables |
| **FUEL** | Gemini 3 Flash | Nutrition plans, macro calculation, meal logging, food scanning analysis | Nutrition databases, macro formulas, meal templates |
| **MIND** | Gemini 3 Flash | Sleep optimization, stress management, recovery protocols, cognitive health | Sleep science, recovery protocols, stress management |
| **TRACK** | Gemini 3 Flash | Progress analytics, trend detection, PR detection, fitness score calculation | Scoring algorithms, trend analysis, statistical methods |
| **VISION** | Gemini 3 Flash | Food scanning (camera), equipment recognition, form analysis, context suggestions | Food image datasets, equipment catalogs, gym layouts |
| **COACH_BRIDGE** | Gemini 3 Flash | Syncs with GENESIS BRAIN (coach app), manages approvals, audit trail, coach notifications | Coach protocols, approval workflows, audit formats |

### GENESIS Orchestrator Personality

- Speaks in first person as "GENESIS"
- Confident but not arrogant
- Data-driven recommendations with reasoning
- Adapts tone: encouraging when fatigued, direct when performing well
- References user's history and patterns
- Never uses generic fitness advice — everything is contextualized

### COACH_BRIDGE Agent (Critical for HYBRID Phase)

The COACH_BRIDGE agent is the communication layer between the user-facing GENESIS app and the coach-facing GENESIS BRAIN app:

- Receives season designs from GENESIS orchestrator → sends to BRAIN for Aldo's approval
- Receives Aldo's modifications from BRAIN → applies to user's active season
- Maintains audit trail of all coach ↔ AI decisions
- Sends real-time notifications to BRAIN when user completes check-ins, workouts, hits PRs
- In ASCEND mode: COACH_BRIDGE becomes monitoring-only (no approval needed)

---

## Knowledge / RAG Strategy — 4 Layers Per Agent

Each of the 7 agents has access to 4 knowledge layers:

**Layer 1: Vertex AI RAG Engine (per-agent corpus)**
- Each agent has its own dedicated corpus in Vertex AI RAG Engine
- Documents uploaded and chunked automatically (chunk size 512, overlap 50)
- GENESIS corpus: NGX philosophy docs, season design templates, assessment protocols
- TRAIN corpus: exercise database (500+ exercises), periodization science papers, RPE/RIR tables
- FUEL corpus: nutrition databases, macro calculation formulas, meal plan templates
- MIND corpus: sleep science research, recovery protocols, stress management frameworks
- TRACK corpus: scoring algorithms, trend analysis methods, statistical benchmarks
- VISION corpus: food image classification guides, equipment catalogs, gym layout patterns
- COACH_BRIDGE corpus: coach protocol docs, approval workflows, audit trail formats
- Agent accesses its corpus via `vertexai_rag_retrieval` tool in ADK

**Layer 2: Gemini Context Caching (shared across agents)**
- Shared "NGX Philosophy" document cached for all agents
- Includes: brand voice, training principles, nutrition philosophy, recovery approach
- 90% cost reduction on input tokens (cached tokens billed at 0.1x)
- TTL: 1 hour, refreshed on cache miss
- All agents reference this as baseline context before any response

**Layer 3: Google Search Grounding (real-time, selective agents)**
- Enabled for FUEL agent: real-time food data, restaurant menus, supplement info
- Enabled for VISION agent: identify unknown equipment, food items
- Enabled for MIND agent: latest sleep/recovery research when relevant
- NOT enabled for TRAIN, TRACK, COACH_BRIDGE (they use internal data only)
- Grounded responses include source attribution

**Layer 4: Supabase (user data via custom tools)**
- Every agent has ADK tools that query Supabase with service role
- `get_user_profile(user_id)` → profiles table
- `get_active_season(user_id)` → seasons + phases + weeks
- `get_recent_workouts(user_id, days)` → exercise_logs
- `get_check_in_history(user_id, days)` → check_ins
- `get_biomarkers(user_id)` → biomarkers table
- `get_nutrition_log(user_id, date)` → meals table
- `save_workout_session(data)` → sessions table
- `save_check_in(data)` → check_ins table
- This is how agents access personalized user data in real-time

---

## Cache Architecture — 3 Levels (Upstash Redis)

**L1: Exact-Match Cache**
- Key: SHA256 hash of (agent_id + user_id + normalized_prompt)
- TTL: 5 minutes
- Expected hit rate: ~15%
- Use case: identical repeat queries (e.g., "what's my workout today?" asked twice)

**L2: Semantic Cache**
- Uses text-embedding-004 to vectorize queries
- Cosine similarity threshold: 0.92+ for cache hit
- TTL: 1 hour
- Expected hit rate: ~25%
- Use case: semantically similar queries ("show my workout" ≈ "what do I train today?")
- Stored in Upstash Vector (companion to Redis)

**L3: Gemini Context Caching**
- System prompts + RAG results cached at Gemini API level
- 90% cost reduction on input tokens
- TTL: 1 hour (auto-refreshed)
- Expected hit rate: ~60%
- This is the biggest cost saver — agent system prompts + philosophy docs cached

**Cache Flow:**
```
User query → L1 check (exact) → miss → L2 check (semantic) → miss → L3 (context cache) → Agent processes → Store L1 + L2
```

**Monthly cost estimate:** Upstash Redis ~$10/month for HYBRID phase usage

---

## A2UI Protocol v0.8 — Generative UI

### How It Works
GENESIS agents return structured JSON responses that include both text and widget definitions. The WidgetRenderer component on the frontend maps widget_type + data to native React Native components.

### 8 Base Widget Types
1. **MetricCard** — single value with label, trend arrow, color
2. **ProgressRing** — circular progress indicator with percentage
3. **ListCard** — ordered/unordered list with optional icons
4. **ChartWidget** — line/bar/area chart with data points
5. **ActionButton** — CTA button that triggers navigation or action
6. **TimerWidget** — countdown/count-up timer with controls
7. **FormWidget** — input form with fields and validation
8. **MediaWidget** — video/image/audio player

### 25 Widget Experiences Mapped to 7 Touchpoints

**Touchpoint 1: Morning Briefing** (Home screen, auto-generated at 6am)
- `today-card` — Today's training focus, phase context, energy recommendation
- `season-progress` — Visual progress through 12-week season (current week highlighted)
- `coach-message` — Message from Aldo (HYBRID) or GENESIS AI (ASCEND)
- `streak-counter` — Consecutive days of completed check-ins/workouts

**Touchpoint 2: During Workout** (Train screen, active session)
- `workout-card` — Full workout plan with exercise list, sets, reps, weights
- `exercise-row` — Single exercise with set tracking, weight input, RPE selector
- `rest-timer` — Countdown timer between sets (configurable per exercise)
- `exercise-video` — Form demonstration video with cues overlay

**Touchpoint 3: Post-Workout** (Train screen, after completion)
- `session-summary` — Workout stats: volume, duration, PRs hit, fatigue rating
- `check-in-form` — Quick mood/energy/soreness check after training

**Touchpoint 4: Daily Check-in** (Check-in modal)
- `sleep-tracker` — Sleep hours + quality input
- `meal-plan` — Today's nutrition targets and meal suggestions
- `food-scan-result` — Camera scan result with macro breakdown

**Touchpoint 5: Chat Libre** (Genesis Chat modal)
- `equipment-guide` — Equipment recognized from camera scan with exercise suggestions
- `context-suggestion` — Proactive suggestions based on time/location/patterns
- `insight-card` — Data insight with explanation and recommendation

**Touchpoint 6: Weekly Review** (Track screen, end of week)
- `body-stats` — Weight, body fat, measurements with trend lines
- `heart-rate` — HRV, resting HR trends from HealthKit/wearable
- `workout-history` — Week's completed sessions with volume comparison
- `weekly-summary` — Composite score across fitness/nutrition/wellness

**Touchpoint 7: Phase Transition** (Auto-triggered at phase boundaries)
- `phase-card` — Current phase summary + upcoming phase preview
- `achievement` — Unlocked achievement with animation
- `progress-comparison` — Before/after metrics for the completed phase
- `alert-banner` — Important notifications (deload reminder, season ending)
- `nutrition-dashboard` — Full macro/calorie dashboard for the phase

### Widget Response Format
```json
{
  "text": "Your workout today focuses on compound movements for strength phase.",
  "widgets": [
    {
      "widget_type": "workout-card",
      "data": {
        "title": "Day 3 — Upper Body Strength",
        "exercises": ["..."],
        "estimated_duration": "55 min"
      },
      "position": "after_text",
      "priority": 1
    }
  ]
}
```

---

## GENESIS BRAIN — Coach App

### Purpose
GENESIS BRAIN is the coach-facing web application where Aldo (human coach) manages athletes during HYBRID phase. In ASCEND phase, BRAIN becomes a monitoring dashboard.

### Tech Stack
- Next.js 15 + App Router
- Supabase (same instance as GENESIS app — shared database)
- A2A protocol for agent-to-agent communication with GENESIS agents
- Real-time Supabase subscriptions for live athlete data

### Key Screens
- **Dashboard** — Overview of all athletes: today's check-ins, workout completions, alerts
- **Athlete Profile** — Individual athlete: current season, phase, metrics, history
- **Season Designer** — Create/modify 12-week seasons with phase builder
- **Workout Editor** — Modify individual sessions, swap exercises, adjust volume
- **Check-in Review** — Review daily check-ins with AI-generated insights
- **Approval Queue** — AI-generated season proposals awaiting Aldo's approval
- **Analytics** — Cross-athlete analytics, trends, retention metrics

### Coach ↔ AI Flow (HYBRID Phase)
```
1. User requests season → GENESIS orchestrator designs season
2. COACH_BRIDGE sends season proposal to BRAIN → Aldo reviews
3. Aldo approves/modifies in BRAIN → COACH_BRIDGE applies to user's app
4. User trains → data flows to Supabase → BRAIN shows real-time progress
5. User check-in → BRAIN notification → Aldo reviews and adjusts if needed
6. GENESIS adapts daily workouts based on check-in + Aldo's modifications
```

### A2A Protocol Usage
- GENESIS app agents → BRAIN via A2A HTTP endpoints
- BRAIN → GENESIS agents via A2A HTTP endpoints
- Both apps share Supabase DB (primary data sync)
- A2A used for: season approvals, workout modifications, real-time notifications, audit logging

---

## Season System (detailed)

### Structure
```
Season (12 weeks)
├── Phase 1: Strength (Weeks 1-4) — 4-6 reps, 3-4 sets, heavy compound
├── Phase 2: Power (Weeks 5-8) — 3-5 reps, 5-6 sets, explosive
├── Phase 3: Hypertrophy (Weeks 9-11) — 6-12 reps, 3-4 sets, volume
└── Phase 4: Deload (Week 12) — 30-50% load, 2-3 sets, recovery
```

Each week has up to 6 daily sessions. Each session has exercises with sets/reps/weight targets.

### Adaptation Logic
- GENESIS orchestrator + TRAIN agent collaborate to generate and adapt
- After each check-in: fatigue/energy/soreness data adjusts next workout
- After each workout: actual vs. planned volume triggers recalibration
- PR detection: TRACK agent flags new personal records → GENESIS adjusts targets
- Biomarker changes: significant HRV/HR changes → MIND agent recommends deload or intensity change
- Coach override: in HYBRID, Aldo can override any AI decision via BRAIN

### Season Lifecycle
1. **Design**: GENESIS designs based on assessment + goals + history
2. **Approval**: COACH_BRIDGE sends to BRAIN → Aldo approves (HYBRID only)
3. **Active**: User follows daily sessions, data collected
4. **Adapt**: Weekly micro-adjustments based on performance data
5. **Phase Transition**: Automatic transition with phase-card widget + achievements
6. **Complete**: Season summary + next season proposal

---

## Camera / Vision Features

### Capabilities (Gemini 3 Flash Multimodal via VISION agent)
1. **Food Scanning** — Point camera at food → VISION identifies items → returns macro breakdown via `food-scan-result` widget
2. **Equipment Recognition** — Scan gym equipment → VISION identifies → suggests exercises via `equipment-guide` widget
3. **Context Suggestions** — Scan fridge contents → FUEL agent generates meal ideas. Scan gym space → TRAIN suggests workout based on available equipment
4. **Form Analysis** (future) — Record exercise → VISION analyzes form → provides form cues

### Camera Flow
```
User opens camera-scanner modal → captures image → image sent to VISION agent
→ VISION processes with Gemini 3 Flash multimodal → returns structured widget response
→ WidgetRenderer displays result (food-scan-result or equipment-guide)
```

---

## ElevenLabs Voice Integration

### Setup
- ElevenLabs React Native SDK v0.5.10 (WebRTC direct)
- Direct connection: GENESIS app → ElevenLabs (bypasses BFF for low latency)
- GENESIS agent persona: custom voice ID already configured

### Voice Call Flow
```
User taps voice button → voice-call modal opens → WebRTC connection to ElevenLabs
→ GENESIS agent processes speech → responds with voice + optional widgets
→ User speaks → real-time transcription → agent response → voice output
```

### Voice Features
- Real-time conversation with GENESIS AI personality
- Can trigger any agent function via voice (log workout, check macros, ask questions)
- Mute/unmute, speaker toggle
- Call timer display
- Status indicators (Connected, Listening, Processing)

---

## FastAPI BFF (Backend for Frontend)

### Purpose
Thin layer between mobile app and backend services. Handles auth verification, request routing, and response formatting.

### Endpoints
```
/mobile/*     — GENESIS app endpoints
  POST /mobile/chat          — Send message to GENESIS orchestrator
  POST /mobile/check-in      — Submit daily check-in
  GET  /mobile/season        — Get active season with phases/weeks
  GET  /mobile/workout/today — Get today's workout session
  POST /mobile/workout/log   — Log completed workout
  POST /mobile/meal/log      — Log meal
  POST /mobile/scan          — Send camera image to VISION agent
  GET  /mobile/scores        — Get fitness/nutrition/wellness scores

/brain/*      — GENESIS BRAIN endpoints
  GET  /brain/athletes       — List coach's athletes
  GET  /brain/athlete/:id    — Get athlete details
  POST /brain/season/approve — Approve season proposal
  PUT  /brain/session/modify — Modify workout session
  GET  /brain/check-ins      — Get pending check-in reviews
  GET  /brain/approvals      — Get pending approval queue

/agents/*     — Internal agent routing
  POST /agents/genesis       — Route to GENESIS orchestrator
  POST /agents/train         — Route to TRAIN agent
  POST /agents/fuel          — Route to FUEL agent
  POST /agents/mind          — Route to MIND agent
  POST /agents/track         — Route to TRACK agent
  POST /agents/vision        — Route to VISION agent
  POST /agents/bridge        — Route to COACH_BRIDGE agent
```

### Deployment
- Cloud Run (serverless, auto-scaling, scale-to-zero)
- Python 3.12 + FastAPI
- JWT verification middleware (Supabase auth tokens)
- Estimated cost: $20-40/month for HYBRID phase

---

## Deployment & Infrastructure

### Architecture
```
[GENESIS App (Expo)] → [FastAPI BFF (Cloud Run)] → [ADK Agents (Vertex AI Agent Engine)]
                                                  → [Supabase (DB + Auth + Realtime)]
                                                  → [Upstash Redis (Cache)]

[GENESIS BRAIN (Next.js)] → [Same FastAPI BFF] → [Same agents + Supabase]

[ElevenLabs] ← direct WebRTC from GENESIS App (bypasses BFF)
```

### Cost Estimates (HYBRID Phase, ~50 users)
| Service | Monthly Cost |
|---------|-------------|
| Vertex AI Agent Engine (7 agents, scale-to-zero) | $50-150 |
| Cloud Run (FastAPI BFF) | $20-40 |
| Upstash Redis + Vector | $10 |
| Supabase Pro | $25 |
| ElevenLabs (voice calls) | $30-50 |
| Gemini API (tokens beyond free tier) | $20-40 |
| **Total** | **~$155-315/month** |

### Scale Strategy
- Agent Engine: scale-to-zero when no traffic, auto-scale on demand
- Cloud Run: 0 to N instances based on request volume
- Supabase: Pro plan handles up to 500 concurrent connections
- Redis: Upstash serverless scales automatically

---

## Screen-by-Screen Functional Flows

### (tabs)/home.tsx — HOME
- **Morning briefing**: GENESIS generates `today-card` + `season-progress` + `coach-message` + `streak-counter`
- **Reads from**: useSeasonStore (activeSeason, currentPhase, currentWeek), useWellnessStore (todayCheckIn), useTrackStore (fitnessScore)
- **Actions**: Tap today-card → navigates to train tab. Tap check-in prompt → opens check-in modal

### (tabs)/train.tsx — TRAIN
- **Active workout**: Shows today's session from useTrainingStore.todayWorkout
- **Reads from**: useTrainingStore (todayWorkout, exerciseLog, personalRecords), useSeasonStore (currentPhase)
- **Actions**: Tap exercise → opens exercise-video modal. Log set → updates useTrainingStore. Complete workout → POST /mobile/workout/log. Rest timer between sets

### (tabs)/fuel.tsx — FUEL
- **Daily nutrition**: Shows macros, meals, water tracking
- **Reads from**: useNutritionStore (todayMeals, macroTotals, waterGlasses, calorieTarget)
- **Actions**: Tap add meal → manual entry or camera scan. Tap water → increment useNutritionStore.waterGlasses. Scan food → opens camera-scanner modal → VISION agent

### (tabs)/mind.tsx — MIND
- **Wellness dashboard**: Sleep, mood, stress, recovery
- **Reads from**: useWellnessStore (todayCheckIn, moodHistory, sleepData, stressLevel)
- **Actions**: Tap check-in → opens check-in modal. View sleep trends → MIND agent insights

### (tabs)/track.tsx — TRACK
- **Progress analytics**: Scores, PRs, body stats, weekly summary
- **Reads from**: useTrackStore (fitnessScore, nutritionScore, wellnessScore, weeklyActivity, prs)
- **Actions**: View detailed stats → TRACK agent generates charts. View PRs → personal records list

### (modals)/genesis-chat.tsx — GENESIS CHAT
- **Free conversation**: Chat with GENESIS AI
- **Reads from**: useGenesisStore (messages, isTyping, activeWidgets)
- **Actions**: Send message → POST /mobile/chat → GENESIS orchestrator routes to appropriate agent → response with text + widgets. Voice button → opens voice-call modal

### (modals)/camera-scanner.tsx — CAMERA SCANNER
- **Scan mode**: Food or Equipment
- **Actions**: Capture photo → POST /mobile/scan → VISION agent → returns food-scan-result or equipment-guide widget

### (modals)/voice-call.tsx — VOICE CALL
- **Live voice**: Real-time conversation with GENESIS
- **Actions**: Speak → ElevenLabs WebRTC → GENESIS processes → voice response. Mute/Speaker toggles

### (modals)/exercise-video.tsx — EXERCISE VIDEO
- **Exercise demo**: Video + form cues + set tracking
- **Reads from**: useTrainingStore (current exercise from todayWorkout)
- **Actions**: Play/pause video. View form cues. Start set → rest timer

### (modals)/check-in.tsx — DAILY CHECK-IN
- **Wellness form**: Mood, sleep, energy, soreness, notes
- **Writes to**: useWellnessStore → POST /mobile/check-in → Supabase check_ins table
- **After submit**: GENESIS adapts today's workout based on responses

---

## Current Implementation Status

### Phase 1-4 Complete (Season-Aware UI with Mock Data)
- 5 tab screens fully rewritten: home, train, fuel, mind, track — season/phase-aware via `useSeasonStore`
- 4 stack screens (new): library, exercise-detail, education, education-detail
- 5 modal screens: genesis-chat (enhanced with quick actions), camera-scanner, voice-call, exercise-video, check-in
- 4 auth screens wired to Supabase: login, sign-up, onboarding, forgot-password
- ImageCard component with expo-image + LinearGradient overlays + blurhash
- SeasonHeader with phase indicator + 12-week progress bar
- RecoveryHeatmap for muscle recovery visualization
- 16 mock exercises with formCues in Spanish, 6 education articles, PHASE_CONFIG for 4 phases
- All navigation routes verified and working end-to-end
- TypeScript compiles with 0 errors, Expo iOS bundle exports clean
- Design system enforced: `['#0D0D2B', '#1A0A30']` gradient, custom fonts, lucide icons, no fontWeight

### NOT functional yet
- Stores use mock data — not connected to Supabase queries
- No interactive workout flow (timer, rest countdown, set logging)
- No real agent communication (GENESIS chat uses mock keyword responder)
- No real meal logging or food scanning
- No A2UI widget rendering from agent responses
- HealthKit and Vision API services are placeholders
- No ElevenLabs voice integration
- No FastAPI BFF deployed
- No agents deployed on Vertex AI
- GENESIS BRAIN app not started
