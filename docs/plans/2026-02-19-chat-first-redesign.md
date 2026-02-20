# GENESIS Chat-First Redesign — Design Document

**Date:** 2026-02-19
**Author:** Aldo Olivas (CEO NGX) + Claude (AI Architecture)
**Status:** Approved — Ready for Implementation
**Branch:** `feat/chat-first-ui`

---

## 1. Vision

Transform GENESIS from a traditional tab-based fitness app into a **chat-first AI interface** — the Claude/Gemini/ChatGPT of fitness. The conversation IS the app. No tabs, no traditional navigation. Everything happens through dialogue with GENESIS and its visible team of specialized agents.

**One-liner:** "Imagine Claude, but it's an expert fitness coach with a team of AI specialists, connected to your Apple Watch, that knows your body and your 12-week plan."

**What dies:** 5-tab navigation (Home, Train, Fuel, Mind, Track), all tab-specific screens.
**What lives:** BFF (100%), Zustand stores, services, hooks, types, agents, tools, cache, knowledge.
**What's born:** Chat screen, Briefing Card, Agent Thinking UI, Spaces, expanded A2UI widgets, tool bar.

---

## 2. Architecture — 3 Screens, Not 5 Tabs

### 2.1 Chat Screen (primary — 90% of user time)

The main screen. Everything happens here.

**Layout (top to bottom):**
- **Header:** GENESIS logo + Season badge (Semana 8/12) + drawer hamburger
- **Briefing Card** (collapsible): Auto-generated morning brief with today's training, nutrition status, Watch metrics, streak, recovery score
- **Chat area:** Messages + inline A2UI widgets + agent thinking blocks
- **Quick Actions Bar:** Context-aware pills that change by time of day and user state
- **Input Bar:** Text field + tool icons (📷 🎤 📎 ⏱ 🔍 ⌚)

### 2.2 Panel / Bottom Sheet (overlay — contextual)

Opens FROM the chat for sustained interactions. Not a separate screen.

**Triggers:**
- Active workout (logging sets, rest timer, HR, video demos)
- Expanded meal plan (multiple meals, full macro breakdown)
- Progress charts and comparisons (graphs that need full width)
- Season Hub (12-week timeline, phase detail, adherence)
- Photo comparison (before/after progress photos)

**Behavior:** Full-screen bottom sheet on mobile. Swipe down to minimize. Chat remains accessible underneath. Panel content is context-synced with the conversation.

**Rule:** If an action requires > 2 taps of sustained interaction → Panel. If informational or 1 tap → Inline widget.

### 2.3 Sidebar / Drawer (navigation — left swipe)

**Contents (top to bottom):**
- User avatar + name + Season Pass status
- "Season Pass · Semana 8/12" progress bar
- "Créditos Premium: 47/60" (token counter)
- **Daily Thread** (today's conversation — default)
- **Spaces:**
  - 📚 LOGOS — Education & knowledge deep-dives
  - 🗓 Season Hub — Season overview, weekly progress
  - 🔬 Labs — Deep analysis (photos, lab results, Watch trends)
- **History:** Previous daily threads by date
- **Settings** (profile, notifications, quiet hours, support)

---

## 3. Visible Agents — Adapted from Grok 4.2

### 3.1 Agent Identity

| Agent | Icon | Color | Domain |
|-------|------|-------|--------|
| GENESIS | ⚡ | White | Orchestrator, unified response |
| TRAIN | 🏋️ | #6D00FF (Violet) | Training, exercises, periodization |
| FUEL | 🍽️ | #00C853 (Green) | Nutrition, macros, hydration, supplements |
| MIND | 🧠 | #2196F3 (Blue) | Wellness, sleep, stress, recovery, breathwork |
| TRACK | 📊 | #FF6D00 (Orange) | Metrics, progress, PRs, comparisons |
| VISION | 📷 | #E91E63 (Pink) | Image analysis (food, equipment, progress photos) |

### 3.2 Agent Thinking UX

**For complex queries (multiple agents involved):**

```
⚡ GENESIS coordinando · 8s
┌─────────────────────────────────┐
│ 🧠 MIND                         │
│ Sleep score: 52/100. HRV bajo.  │
│ Recovery comprometido.          │
│                                 │
│ 🏋️ TRAIN                        │
│ Reducir volumen 30%, RPE 6-7.   │
│ Mantenemos Push day ajustado.   │
│                                 │
│ 🍽️ FUEL                         │
│ Priorizar magnesio. Carbos      │
│ complejos en cena para sueño.   │
└──────── Colapsar ▲ ─────────────┘
```

**Behavior:**
- Shows animated indicator + timer ("GENESIS coordinando · Xs")
- Each agent shows ONE direct contribution (no inter-agent conversation)
- Block is collapsible after response is delivered
- Collapsed state: "⚡ GENESIS pensó por 8s" (clickable to expand)

**For simple queries (single agent):**
- No thinking block visible. Direct response. Fast.

### 3.3 Differentiation from Grok 4.2

- Grok: Generic agents (Agent 1, Agent 2, Agent 3). No personality, no domain expertise.
- GENESIS: Named specialists with clear domains. The user sees TRAIN adjusted their workout, MIND analyzed their sleep, FUEL changed their nutrition. **It's a team of experts, not numbered bots.**

---

## 4. Tools — Complete Catalog

### 4.1 Input Bar Tools (user-initiated, visible icons)

| Icon | Tool | Function |
|------|------|----------|
| 📷 | Camera | Scan food (macros), progress photo, equipment ID, lab results |
| 🎤 | Voice | Hands-free voice conversation with GENESIS (ElevenLabs) |
| 📎 | Attach | Upload photos from gallery, PDFs, screenshots |
| ⏱️ | Workout | Quick-start today's training session (opens workout panel) |
| 🔍 | DeepSearch | Deep search across web + knowledge stores for complex questions |
| ⌚ | Watch Sync | Manual pull of Apple Watch data (sleep, steps, HR, HRV) |

### 4.2 Quick Actions Bar (context-aware pills)

**Morning (6am-10am):**
- "☀️ Mi briefing" | "🫁 Breathwork" | "📋 Check-in" | "🏋️ ¿Qué entreno hoy?"

**Pre-workout:**
- "⏱ Empezar workout" | "🔥 Calentamiento" | "🍌 ¿Qué como antes?"

**Post-workout:**
- "📊 Resumen del workout" | "🍽 ¿Qué como ahora?" | "🧊 Recovery tips"

**Midday (12pm-3pm):**
- "🍽 Loggear comida" | "💧 Registrar agua" | "📷 Escanear comida"

**Evening (8pm-11pm):**
- "📊 Resumen del día" | "🧘 Meditación" | "🌙 Rutina de sueño"

**Always available (scrollable):**
- "📈 ¿Cómo voy?" | "🏆 Mis PRs" | "📚 LOGOS" | "⚙️ Settings"

### 4.3 Agent Tools (backend, invoked by GENESIS)

**TRAIN Agent Tools:**
| Tool | Trigger | Widget Output |
|------|---------|---------------|
| get_today_workout | "¿Qué entreno hoy?" | workout-card |
| get_exercise_catalog | "Ejercicios para espalda" | exercise-row list |
| log_exercise_set | During active workout | metric-card (set logged) |
| get_personal_records | "Mis records de bench" | metric-card (PRs) |
| video_demo | "¿Cómo se hace hip thrust?" | video-embed |
| exercise_swap | "Alternativa sin banco" | exercise-row alternatives |
| warmup_generator | "Dame un calentamiento" | workout-card (warmup) |

**FUEL Agent Tools:**
| Tool | Trigger | Widget Output |
|------|---------|---------------|
| get_today_meals | "¿Qué he comido?" | meal-plan |
| log_meal | "Comí pollo con arroz" / photo | meal-card + confirm |
| get_water_intake | "¿Cuánta agua llevo?" | hydration-tracker |
| log_water | "Tomé 2 vasos" | hydration-tracker updated |
| recipe_suggest | "Sugiéreme cena" | recipe-card |
| supplement_stack | "¿Qué suplementos?" | supplement-stack |
| hydration_reminder | Auto / "Recordar agua" | hydration-tracker + push |

**MIND Agent Tools:**
| Tool | Trigger | Widget Output |
|------|---------|---------------|
| submit_check_in | Morning check-in | quick-checkin → today-card |
| get_wellness_trends | "¿Cómo van mis trends?" | metric-card (trends) |
| breathwork | "Necesito relajarme" | breathwork (animated) |
| meditation_timer | "Quiero meditar 10min" | meditation (timer) |
| mood_journal | "Quiero escribir cómo me siento" | journal-entry |
| sleep_analysis | "¿Cómo dormí?" / Watch auto | sleep-tracker expanded |
| stress_check | "Estoy estresado" | HRV + breathwork suggestion |

**TRACK Agent Tools:**
| Tool | Trigger | Widget Output |
|------|---------|---------------|
| get_progress_stats | "¿Cómo voy?" | progress-dashboard |
| get_strength_progress | "¿Cuánto levanto en bench?" | metric-card + chart |
| compare_periods | "Compara esta semana con la pasada" | metric-cards comparative |
| photo_progress | "Tomar foto de progreso" | photo-comparison |

**Cross-Agent Tools:**
| Tool | Agent | Trigger | Widget Output |
|------|-------|---------|---------------|
| search_knowledge | All | Educational questions | insight-card |
| get_user_profile | GENESIS | Context loading | (internal) |
| get_current_season | GENESIS | "¿En qué fase estoy?" | season-timeline |
| get_user_memories | GENESIS | Context loading | (internal) |
| store_user_memory | GENESIS | New preference detected | (internal) |

### 4.4 Automatic Tools (GENESIS-initiated, no user trigger)

| Tool | When | Widget |
|------|------|--------|
| PR Detection | Set logged that beats previous record | achievement |
| Streak Counter | Daily action completed | streak-counter |
| Smart Notification | Context: time to train, eat, hydrate | push notification |
| Season Progress | Week completed | season-timeline update |
| Recovery Alert | Watch data: low HRV/sleep | alert-banner |
| Nutrition Alert | Hours without meal log | coach-message |
| Achievement | Milestone reached | achievement |
| Weekly Summary | Every Sunday | progress-dashboard + insight-card |

---

## 5. A2UI Widgets — 28 Total

### 5.1 Existing Widgets (20 — from current app)

`metric-card` · `workout-card` · `meal-plan` · `hydration-tracker` · `progress-dashboard` · `insight-card` · `season-timeline` · `today-card` · `exercise-row` · `workout-history` · `body-stats` · `max-rep-calculator` · `rest-timer` · `heart-rate` · `supplement-stack` · `streak-counter` · `achievement` · `coach-message` · `sleep-tracker` · `alert-banner`

### 5.2 New Widgets (8 — for chat-first)

| Widget | Type | Description |
|--------|------|-------------|
| `breathwork` | Interactive | Animated breathing guide (circle expand/contract) + timer + HR from Watch |
| `meditation` | Interactive | Timer with ambient sound control + HR tracking |
| `journal-entry` | Input | Text field with mood tags, saves to wellness |
| `video-embed` | Media | Inline video player for exercise demos |
| `recipe-card` | Display | Recipe with ingredients, prep time, macros |
| `quick-checkin` | Input | Visual emoji/slider check-in (mood, energy, sleep, stress, pain) |
| `onboarding-form` | Input | Conversational onboarding data capture |
| `photo-comparison` | Media | Before/after progress photo comparison |

### 5.3 Widget Rendering Rules

- **Inline:** metric-card, insight-card, meal-plan (single), hydration-tracker, today-card, exercise-row, streak-counter, achievement, coach-message, alert-banner, quick-checkin, recipe-card, video-embed, breathwork, meditation, journal-entry, onboarding-form
- **Panel:** workout-card (active workout), meal-plan (full day), progress-dashboard (expanded), season-timeline (full), workout-history, body-stats, heart-rate (live), photo-comparison, strength charts

---

## 6. User Experience Flows

### 6.1 Login & Onboarding

Login: Dedicated pre-chat screen (Supabase Auth). Unchanged.

Onboarding: **Conversational.** GENESIS asks questions, user responds via text or inline widgets. Data captured through `onboarding-form` widget. At the end, agents present their contributions (TRAIN designed season, FUEL set macros, MIND configured baseline). Season starts.

### 6.2 Morning Flow

1. User opens app → Chat screen with Briefing Card
2. Briefing Card shows: today's workout, kcal status, Watch sleep data, streak, recovery score
3. Quick actions: "Check-in" → `quick-checkin` widget inline → submit
4. GENESIS: morning message with context-aware suggestions

### 6.3 Workout Flow

1. User taps ⏱ or "Empezar workout" pill
2. GENESIS shows workout-card inline → user taps "Iniciar"
3. **Panel opens** (full-screen bottom sheet):
   - Current exercise with video demo (tap to play)
   - Set logging (weight × reps input, RPE)
   - Rest timer with Watch HR in real-time
   - Mini-chat: user can ask GENESIS questions mid-workout
   - "Next exercise" button
4. On completion: panel closes, GENESIS shows post-workout summary inline with PRs detected
5. Achievement widgets appear if milestones hit

### 6.4 Nutrition Flow

**Text/voice:** "Comí 200g de pollo con arroz" → GENESIS estimates macros → `meal-card` widget inline → confirm → logged.

**Camera:** Tap 📷 → photo → VISION analyzes → FUEL estimates macros → `meal-card` with confirm/edit → logged.

**Quick:** "💧 Registrar agua" → "¿Cuántos vasos?" → hydration-tracker updated inline.

### 6.5 Breathwork / Meditation Flow

1. User: "Necesito relajarme" OR GENESIS suggests based on stress/HRV
2. GENESIS recommends technique (Box Breathing, 4-7-8, etc.)
3. `breathwork` widget appears inline with animated guide
4. User taps "Iniciar" — animation starts, timer counts
5. Watch HR displayed in real-time, showing drop as user relaxes
6. On completion: GENESIS shows HR delta and encouragement

### 6.6 Education Flow (LOGOS Space)

1. User taps "📚 LOGOS" from quick actions or drawer
2. Enters LOGOS space (persistent thread)
3. Asks questions: "¿Por qué es importante el sueño profundo?"
4. GENESIS uses knowledge stores + web search
5. Responds with `insight-card` widgets + references + video links
6. Conversation persists — user can return and continue

### 6.7 Check-in Flow

1. GENESIS prompts in morning: "¿Cómo dormiste?"
2. `quick-checkin` widget appears inline (emoji sliders: sleep, energy, mood, stress, pain)
3. User adjusts sliders, taps submit
4. MIND processes, GENESIS responds with context: "Tu energía está baja. Ajustaré la intensidad hoy."

---

## 7. Monetization — Season Pass + Token Economy

### 7.1 Model

- **7-day free trial:** Full access, no restrictions. User experiences complete GENESIS power.
- **Season Pass:** Single payment per 12-week Season (~$79-149 USD). Unlocks everything: all agents, all tools, Watch integration, personalized seasons.
- **Premium Credits:** Each Season includes X credits/month for generative tools (image generation, doc export, advanced vision analysis). When depleted, buy more or wait for monthly refresh.
- **Auto-renewal:** Season Pass auto-renews with continuity discount.

### 7.2 UI Representation

- **Drawer:** "Season Pass · Semana 8/12" with progress bar + "Créditos: 47/60"
- **Input bar:** Credit icon appears when invoking premium tool (user knows before spending)
- **Premium tools:** Image generation, doc export, advanced lab analysis

### 7.3 Why Season-Based

Aligns payment with results. 12 weeks is the minimum for visible body composition changes. Reduces churn by requiring commitment. Creates data-rich feedback loop (user can analyze why they did/didn't see changes). Connected to GENESIS Brain (coach app) for hybrid AI+human coaching.

---

## 8. Spaces — Specialized Threads

### 8.1 LOGOS (Education)

**Purpose:** Deep-dive learning about fitness, nutrition, longevity, NGX philosophy.
**Persistence:** Conversation history persists indefinitely.
**Tools:** Knowledge search (15 docs, 51K tokens), web search, video embeds.
**Agent focus:** All agents contribute, heavy use of knowledge_tools.

### 8.2 Season Hub

**Purpose:** Overview of the current 12-week Season.
**Content:** Visual timeline, phase detail, weekly adherence, accumulated PRs, strength trends.
**Format:** More visual than conversational — widgets + contextual chat.
**Panel:** Season timeline opens in panel for full view.

### 8.3 Labs

**Purpose:** Deep analysis of user data.
**Content:** Progress photo analysis + comparison, lab result interpretation, Watch trend analysis (sleep patterns, HRV trends, resting HR over time), period comparisons.
**Agent focus:** TRACK + VISION agents dominate.
**Tools:** photo_progress, compare_periods, sleep_analysis, stress_check.

---

## 9. Streaming & Real-Time

### 9.1 Response Streaming

BFF must support Server-Sent Events (SSE) for streaming responses to feel real-time like Claude/ChatGPT. Current implementation returns full response — needs upgrade to stream tokens.

### 9.2 Agent Thinking Animation

During agent processing:
1. Animated dots indicator (similar to Grok's colored dots)
2. Timer counting seconds
3. Agent contributions appear one by one as each agent completes
4. Final response streams in after all agents contribute

### 9.3 Watch Data

Apple Watch data (HR, HRV, steps, sleep) feeds into the conversation context. During workout panel, HR updates in real-time via HealthKit observer.

---

## 10. Code Migration Strategy

### 10.1 Git Strategy

```
main (current tab-based app — preserved as fallback)
  └── feat/chat-first-ui
       ├── REWRITE: app/ (all screens)
       ├── REWRITE: components/genesis/ (chat components)
       ├── NEW: components/chat/ (new chat-first components)
       ├── NEW: components/panels/ (workout, meal, progress panels)
       ├── NEW: components/spaces/ (LOGOS, Season Hub, Labs)
       ├── KEEP: stores/ (all Zustand stores)
       ├── KEEP: services/ (all API clients)
       ├── KEEP: hooks/ (all custom hooks)
       ├── KEEP: types/ (all TypeScript types)
       ├── KEEP: utils/ (all utilities)
       ├── KEEP: bff/ (entire backend)
       ├── EVOLVE: components/ui/ (reuse GlassCard, Pill, etc.)
       └── EVOLVE: components/genesis/WidgetRenderer.tsx
```

### 10.2 What's Kept (60%)

| Component | Path | Notes |
|-----------|------|-------|
| BFF (entire) | bff/ | Zero changes. Agents, tools, cache, knowledge — all intact |
| Auth store | stores/useAuthStore.ts | Auth flow unchanged |
| Training store | stores/useTrainingStore.ts | Data fetching logic reused |
| Nutrition store | stores/useNutritionStore.ts | Meal/water logic reused |
| Wellness store | stores/useWellnessStore.ts | Check-in logic reused |
| Season store | stores/useSeasonStore.ts | Season data reused |
| Track store | stores/useTrackStore.ts | Progress data reused |
| Genesis store | stores/useGenesisStore.ts | Chat state — evolve for spaces |
| Education store | stores/useEducationStore.ts | LOGOS content |
| Cache store | stores/useCacheStore.ts | Caching layer |
| API client | services/genesisAgentApi.ts | BFF client — add SSE support |
| Supabase client | services/supabaseClient.ts | Unchanged |
| Supabase queries | services/supabaseQueries.ts | Unchanged |
| HealthKit | services/healthKitIntegration.ts | Watch data bridge |
| Vision API | services/visionApi.ts | Camera scanner |
| ElevenLabs | services/elevenLabsApi.ts | Voice |
| Offline queue | services/offlineQueue.ts | Offline support |
| Push notifications | services/pushNotifications.ts | Notification handling |
| Smart notifications | services/smartNotifications.ts | Context-aware scheduling |
| Chat hook | hooks/useGenesisChat.ts | Evolve for spaces |
| HealthKit hook | hooks/useHealthKit.ts | Watch data |
| Voice call hook | hooks/useVoiceCall.ts | Voice conversations |
| Auth hook | hooks/useAuth.ts | Auth flow |
| Offline hook | hooks/useOfflineSupport.ts | Offline patterns |
| PR detection | utils/prDetection.ts | PR logic |
| All types | types/ | TypeScript interfaces |
| UI components | components/ui/ | GlassCard, Pill, ProgressBar, etc. |

### 10.3 What's Rewritten (40%)

| Component | Old | New |
|-----------|-----|-----|
| Root layout | app/_layout.tsx | Drawer + Chat (no tabs) |
| Main screen | app/(tabs)/*.tsx (5 files) | app/chat.tsx (1 file) |
| Chat modal | app/(modals)/genesis-chat.tsx | Becomes the main screen |
| Active workout | app/(screens)/active-workout.tsx | components/panels/WorkoutPanel.tsx |
| Settings | app/(screens)/settings.tsx | Drawer section |
| Library | app/(screens)/library.tsx | Tool response (exercise catalog) |
| Education | app/(screens)/education*.tsx | LOGOS space |
| Widget renderer | components/genesis/WidgetRenderer.tsx | Evolve for 28 widgets |
| Tab bar | components/CustomTabBar.tsx | Deleted |
| Genesis FAB | components/GenesisFAB.tsx | Deleted (chat IS the app) |

### 10.4 New Components to Create

| Component | Purpose |
|-----------|---------|
| BriefingCard | Auto-generated morning brief (collapsible) |
| AgentThinking | Animated thinking indicator with timer |
| AgentContribution | Single agent's contribution card |
| ChatInput | Input bar with tool icons |
| QuickActionsBar | Context-aware action pills |
| ToolIcon | Individual tool button (camera, voice, etc.) |
| WorkoutPanel | Full-screen bottom sheet for active workouts |
| MealPanel | Expanded meal plan view |
| ProgressPanel | Expanded charts and comparisons |
| SpaceDrawer | Sidebar with spaces, history, settings |
| BreathworkWidget | Animated breathing guide |
| MeditationWidget | Meditation timer with ambient sounds |
| JournalWidget | Mood journal text input |
| VideoEmbed | Inline video player |
| RecipeCard | Recipe display with macros |
| QuickCheckin | Visual emoji/slider check-in |
| OnboardingForm | Conversational onboarding data capture |
| PhotoComparison | Before/after photo compare |
| TokenCounter | Premium credits display |
| SeasonBadge | Season progress mini-display |

---

## 11. BFF Changes Required

### 11.1 SSE Streaming (Priority)

Current: POST /mobile/chat returns full ChatResponse.
Needed: POST /mobile/chat/stream returns SSE stream with:
- `event: thinking` — agent thinking status updates
- `event: agent` — individual agent contribution
- `event: token` — response text tokens (streamed)
- `event: widget` — widget payload
- `event: done` — response complete

### 11.2 Briefing Endpoint (New)

`GET /mobile/briefing` — generates daily briefing:
- Today's workout summary
- Nutrition status (kcal consumed/target, protein)
- Watch data (sleep score, steps, recovery)
- Streak count
- Context-aware suggestion

### 11.3 Spaces Support

`POST /mobile/chat` already supports `conversation_id`. Spaces use dedicated conversation IDs:
- `daily-{date}` for daily threads
- `logos-{user_id}` for LOGOS space
- `season-{season_id}` for Season Hub
- `labs-{user_id}` for Labs

### 11.4 Token Economy (New)

`GET /mobile/credits` — returns remaining premium credits.
`POST /mobile/credits/use` — deducts credits for premium tool use.
New Supabase table: `premium_credits` (user_id, season_id, credits_remaining, credits_used, last_refresh).

---

## 12. Implementation Phases

### Phase 1: Foundation (1-2 weeks)
- Create branch `feat/chat-first-ui`
- Rewrite app/ layout (drawer + chat, no tabs)
- Implement Chat screen with existing GenesisChat logic
- Implement SpaceDrawer (sidebar)
- Wire existing stores/services/hooks

### Phase 2: Agent Thinking UI (1 week)
- Implement AgentThinking component
- Implement AgentContribution component
- BFF: Add SSE streaming endpoint
- Mobile: SSE client for streaming responses

### Phase 3: Panels (1-2 weeks)
- Implement WorkoutPanel (bottom sheet with set logging, rest timer, video, mini-chat)
- Implement MealPanel (expanded meal view)
- Implement ProgressPanel (charts, comparisons)

### Phase 4: New Widgets (1-2 weeks)
- Implement 8 new A2UI widgets (breathwork, meditation, journal, video-embed, recipe, checkin, onboarding, photo-comparison)
- Evolve WidgetRenderer for 28 total widgets

### Phase 5: Briefing & Spaces (1 week)
- Implement BriefingCard with auto-generation
- Implement LOGOS, Season Hub, Labs spaces
- BFF: Add briefing endpoint

### Phase 6: Quick Actions & Context (1 week)
- Implement QuickActionsBar with time-of-day context
- Implement ToolBar with all 6 input tools
- Context-aware pill rotation logic

### Phase 7: Token Economy & Polish (1 week)
- Implement TokenCounter
- BFF: credits endpoints
- Supabase: premium_credits table
- Visual polish, animations, transitions

**Total estimated: 7-10 weeks**

---

## 13. References & Inspiration

| Source | What to adapt |
|--------|--------------|
| **Grok 4.2** | Visible agents thinking, collaboration indicator, timer |
| **Claude** | Clean chat UI, artifacts/panels, thinking indicator |
| **Gemini** | Tool icons in input bar, extensions model, briefing card |
| **ChatGPT** | Thread sidebar, canvas panel, voice mode |
| **Apple Health** | Watch data visualization, health metrics display |

---

## 14. Success Metrics

- **Engagement:** Average messages per session > 5 (vs current ~2 with tabs)
- **Retention:** 12-week Season completion rate > 60%
- **NPS:** > 50 (chat-first UX satisfaction)
- **Tool adoption:** > 80% of users use 3+ tools per week
- **Agent awareness:** > 70% of users can name at least 2 agents
- **Premium conversion:** > 15% trial → Season Pass

---

*This document is the source of truth for the GENESIS Chat-First Redesign. All implementation should reference this document. The BFF backend requires minimal changes (SSE streaming, briefing endpoint, credits). The frontend is a complete rewrite of the presentation layer.*
