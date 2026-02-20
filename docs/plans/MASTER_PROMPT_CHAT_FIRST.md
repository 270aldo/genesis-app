# Master Prompt: GENESIS Chat-First UI Redesign

## Context

You are implementing a **complete frontend rewrite** of the GENESIS fitness app — transforming it from a 5-tab traditional fitness app into a **chat-first AI interface** (like Claude/Gemini/ChatGPT but specialized in fitness). The backend (BFF, agents, tools, cache, knowledge) stays 100% intact. Only the presentation layer changes.

**Your Role**: Senior React Native/Expo engineer executing a frontend-only rewrite on a new git branch.

**Project Stage**: Major feature branch — frontend rewrite.

## Critical Context — Read These Files FIRST

Before writing ANY code, read these files in this exact order:

1. `CLAUDE.md` — Project source of truth (tech stack, architecture, patterns, commands)
2. `docs/plans/2026-02-19-chat-first-redesign.md` — **THE DESIGN DOCUMENT** — contains every decision, every widget, every flow, every tool. This is your blueprint.
3. `GENESIS.md` — Architecture master (7 agents, infra, business model)

## Current State

- **Branch**: You are on `main`. Create `feat/chat-first-ui` from `main` before any changes.
- **Dependencies**: All installed. Expo SDK 54, React Native 0.81, NativeWind v4, Zustand 5, expo-router v6.
- **What works**: 5-tab app with working BFF, 5 ADK agents, 16 tools, 20 A2UI widgets, auth, HealthKit, voice, camera, offline queue.
- **What dies**: Everything in `app/(tabs)/`, `app/(modals)/genesis-chat.tsx` as modal, `app/(screens)/`, `components/CustomTabBar.tsx`, `components/GenesisFAB.tsx`.
- **What lives**: ALL of `bff/`, `stores/`, `services/`, `hooks/`, `types/`, `utils/`, `components/ui/`, `data/`, `constants/`.

## Mission

Rewrite the GENESIS mobile app frontend from a tab-based navigation to a chat-first interface. The chat screen becomes the primary (and nearly only) screen. Agent collaboration is visible to the user (Grok 4.2 style but with named fitness specialists). Actions happen through inline A2UI widgets or bottom sheet panels. Navigation is via a drawer sidebar with Spaces (LOGOS, Season Hub, Labs). The BFF backend, Zustand stores, services, hooks, and types are all reused without modification.

## Implementation Phases — Execute in Order

### Phase 1: Foundation — Branch + Layout + Chat Screen

**Goal**: Replace tab navigation with drawer + chat layout. Get a working chat screen.

**Task 1.1: Create branch**
```bash
git checkout -b feat/chat-first-ui
```

**Task 1.2: Rewrite root layout**
- **File**: `app/_layout.tsx`
- Replace `Tabs` navigation with `Drawer` from `expo-router/drawer` (or custom drawer using `react-native-gesture-handler` + `react-native-reanimated`)
- Root layout: Drawer containing a single stack with Chat as the main screen
- Keep auth gate logic (redirect to login if not authenticated)
- Keep offline status banner

**Task 1.3: Create Chat Screen (main screen)**
- **File**: `app/(chat)/index.tsx` — this replaces ALL tabs
- Layout structure (top to bottom):
  1. **Header**: GENESIS logo (left) + Season badge "Semana X/12" (center) + drawer hamburger (right)
  2. **BriefingCard** (collapsible): Shows today's training, kcal status, Watch metrics, streak, recovery. Collapses to a single line on tap.
  3. **Chat messages area**: FlatList of messages + inline A2UI widgets + AgentThinking blocks
  4. **QuickActionsBar**: Horizontal ScrollView of context-aware pill buttons that change by time of day
  5. **ChatInput**: Text input + tool icons (📷 🎤 📎 ⏱ 🔍 ⌚)
- Reuse `useGenesisStore` for chat state (messages, sendMessage, loading)
- Reuse `useGenesisChat` hook for message handling
- Reuse existing `WidgetRenderer` for rendering widgets inline

**Task 1.4: Create Drawer Sidebar**
- **File**: `components/chat/SpaceDrawer.tsx`
- Contents (top to bottom):
  - User avatar + name (from `useAuthStore`)
  - Season Pass badge: "Season Pass · Semana X/12" with progress bar (from `useSeasonStore`)
  - Token counter: "Créditos Premium: X/60"
  - Divider
  - "Hoy" — today's daily thread (active/default)
  - Spaces section header
  - 📚 LOGOS — Education space
  - 🗓 Season Hub — Season overview space
  - 🔬 Labs — Deep analysis space
  - Divider
  - History section — previous daily threads (by date, most recent first)
  - Divider
  - ⚙️ Settings (navigate to settings screen)
- Each space and history item is a conversation with a different `conversationId`
- Tapping a space changes the active conversation in the chat screen
- Style: Dark theme (`#0D0D2B` bg), glassmorphism cards, `#6D00FF` accents

**Task 1.5: Delete old navigation**
- Delete `app/(tabs)/` directory entirely (home.tsx, train.tsx, fuel.tsx, mind.tsx, track.tsx, _layout.tsx)
- Delete `components/CustomTabBar.tsx`
- Delete `components/GenesisFAB.tsx`
- Keep `app/(modals)/` for now (voice-call, camera-scanner, exercise-video, check-in can remain as modals temporarily)
- Keep `app/(screens)/settings.tsx` for now

**Success Criteria Phase 1:**
- [ ] App launches with chat screen as the main screen (no tabs)
- [ ] Drawer opens from left swipe or hamburger tap
- [ ] Chat input works — can send messages to BFF and receive responses
- [ ] Existing widgets render inline in chat messages
- [ ] Drawer shows user info, spaces, and history sections
- [ ] `npm start` runs without errors
- [ ] `npm test` passes (existing tests shouldn't break since stores/services unchanged)

---

### Phase 2: Agent Thinking UI

**Goal**: Show visible agent collaboration when GENESIS processes a query.

**Task 2.1: AgentThinking component**
- **File**: `components/chat/AgentThinking.tsx`
- Shows when GENESIS is processing (isLoading=true in useGenesisStore)
- Animated indicator (pulsing dots or spinning icon) + timer counting seconds
- Text: "⚡ GENESIS coordinando · Xs"
- Dark card with subtle glow effect, glassmorphism style
- Timer starts at 0 and counts up while loading

**Task 2.2: AgentContribution component**
- **File**: `components/chat/AgentContribution.tsx`
- Props: `{ agent: 'train' | 'fuel' | 'mind' | 'track' | 'vision', contribution: string, isActive: boolean }`
- Shows agent icon + name + color badge + contribution text (1-2 lines)
- Agent identity map:
  - TRAIN: 🏋️ icon, `#6D00FF` violet, "TRAIN"
  - FUEL: 🍽️ icon, `#00C853` green, "FUEL"
  - MIND: 🧠 icon, `#2196F3` blue, "MIND"
  - TRACK: 📊 icon, `#FF6D00` orange, "TRACK"
  - VISION: 📷 icon, `#E91E63` pink, "VISION"
- Staggered fade-in animation (one by one)

**Task 2.3: AgentThinkingBlock (combined)**
- **File**: `components/chat/AgentThinkingBlock.tsx`
- Container that holds AgentThinking (header) + multiple AgentContribution items
- Collapsible: after response arrives, collapses to "⚡ GENESIS pensó por Xs" (tappable to expand)
- Initially expanded while loading, auto-collapses when done

**Task 2.4: Integrate into chat message flow**
- Modify chat screen to show AgentThinkingBlock between user message and GENESIS response
- For simple queries (response < 2 seconds): don't show agent contributions, just show quick loading indicator
- For complex queries (response > 2 seconds): show full AgentThinkingBlock
- NOTE: Currently the BFF doesn't return which agents contributed. For now, **simulate** agent contributions based on response content:
  - If response mentions training/workout/exercise → show TRAIN contribution
  - If response mentions nutrition/food/macros/water → show FUEL contribution
  - If response mentions sleep/stress/wellness/breathwork → show MIND contribution
  - If response mentions progress/metrics/PRs/comparison → show TRACK contribution
  - Later (when BFF adds SSE streaming), replace simulation with real agent data

**Success Criteria Phase 2:**
- [ ] AgentThinkingBlock appears between user message and GENESIS response
- [ ] Timer counts up while waiting for response
- [ ] Agent contributions show with correct icons, colors, names
- [ ] Block collapses after response with "GENESIS pensó por Xs"
- [ ] Tapping collapsed block expands it
- [ ] Simple/fast responses don't show the full thinking block

---

### Phase 3: Panels for Complex Actions

**Goal**: Build bottom sheet panels for workout, meals, and progress.

**Task 3.1: Install bottom sheet library**
```bash
npx expo install @gorhom/bottom-sheet
```

**Task 3.2: WorkoutPanel**
- **File**: `components/panels/WorkoutPanel.tsx`
- Full-screen bottom sheet that opens when user starts a workout
- Content:
  - Header: "Push Day · Semana 8" + close button
  - Current exercise card: name, sets×reps prescription, "▶ Ver demo" button (opens video inline)
  - Set logging: weight input + reps input + RPE selector + "Log ✓" button
  - Completed sets shown with checkmarks
  - Rest timer: circular countdown + Watch HR display (from `useHealthKit`)
  - Mini-chat: small text input at bottom for quick questions to GENESIS mid-workout
  - "Siguiente ejercicio →" button
  - Progress: "Ejercicio 2/5" indicator
- Reuse `useTrainingStore` for workout data
- Reuse `prDetection.ts` for PR detection on set completion
- On workout completion: close panel, show post-workout summary as inline widgets in chat (progress-dashboard + achievement if PR)

**Task 3.3: MealPanel**
- **File**: `components/panels/MealPanel.tsx`
- Bottom sheet for expanded meal plan view
- Content: Full day meal breakdown, macro totals, individual meal cards with edit capability
- Reuse `useNutritionStore` for nutrition data

**Task 3.4: ProgressPanel**
- **File**: `components/panels/ProgressPanel.tsx`
- Bottom sheet for expanded charts and comparisons
- Content: Strength progress charts, period comparisons, photo timeline
- Reuse `useTrackStore` for progress data

**Task 3.5: Panel trigger from widgets**
- When a workout-card widget has an "Iniciar" button → opens WorkoutPanel
- When a progress-dashboard widget has "Ver más" → opens ProgressPanel
- When a meal-plan widget has "Plan completo" → opens MealPanel

**Success Criteria Phase 3:**
- [ ] WorkoutPanel opens from workout-card widget "Iniciar" button
- [ ] Sets can be logged in WorkoutPanel (weight, reps, RPE)
- [ ] Rest timer counts down between sets
- [ ] PR detection fires on set completion
- [ ] Panel closes on workout completion, summary widgets appear in chat
- [ ] MealPanel and ProgressPanel open from their respective widgets

---

### Phase 4: New A2UI Widgets (8 new)

**Goal**: Create the 8 new widgets needed for chat-first experience.

**Evolve**: `components/genesis/WidgetRenderer.tsx` to handle 28 total widget types.

**Task 4.1: BreathworkWidget**
- **File**: `components/genesis/widgets/BreathworkWidget.tsx`
- Animated circle that expands (inhale) and contracts (exhale)
- Timer per cycle + total cycles counter
- Technique options: Box Breathing (4-4-4-4), 4-7-8, Wim Hof
- Watch HR display if available (from `useHealthKit`)
- "Iniciar" / "Pausar" / "Completado" states

**Task 4.2: MeditationWidget**
- **File**: `components/genesis/widgets/MeditationWidget.tsx`
- Timer (configurable minutes) with circular progress
- Ambient sound toggle (optional, can be a simple visual for now)
- Watch HR display
- "Iniciar" / "Pausar" / "Completado" states

**Task 4.3: JournalWidget**
- **File**: `components/genesis/widgets/JournalWidget.tsx`
- Text input field for mood journal
- Mood tag selector (happy, sad, stressed, motivated, tired, etc.)
- "Guardar" button that calls `submit_check_in` or stores in wellness store

**Task 4.4: VideoEmbedWidget**
- **File**: `components/genesis/widgets/VideoEmbedWidget.tsx`
- Inline video player using `expo-video` (NOT deprecated `expo-av`)
- Thumbnail preview with play button overlay
- Props: `{ videoUrl, title, keyPoints?: string[] }`
- Below video: key points as bullet list (if provided)

**Task 4.5: RecipeCardWidget**
- **File**: `components/genesis/widgets/RecipeCardWidget.tsx`
- Recipe display: title, prep time, servings
- Ingredients list
- Macro breakdown (kcal, protein, carbs, fat)
- "Loggear esta comida" button (calls meal logging)

**Task 4.6: QuickCheckinWidget**
- **File**: `components/genesis/widgets/QuickCheckinWidget.tsx`
- Visual slider/emoji check-in for: sleep quality, energy, mood, stress, soreness
- Each dimension: 5-level selector (emoji or dots)
- "Enviar check-in" button
- Reuse `useWellnessStore.submitCheckIn()`

**Task 4.7: OnboardingFormWidget**
- **File**: `components/genesis/widgets/OnboardingFormWidget.tsx`
- Multi-step form within a widget: experience level, goal, days/week, age, weight
- Each field as a row with selector or input
- "Continuar" button advances to next step or submits

**Task 4.8: PhotoComparisonWidget**
- **File**: `components/genesis/widgets/PhotoComparisonWidget.tsx`
- Side-by-side photo display (before/after)
- Date labels under each photo
- Swipe to change comparison dates
- Reuse progress photo fetching from `useTrackStore`

**Task 4.9: Update WidgetRenderer**
- **File**: `components/genesis/WidgetRenderer.tsx`
- Add cases for all 8 new widget types
- Total: 28 widget types (20 existing + 8 new)

**Success Criteria Phase 4:**
- [ ] All 8 new widgets render correctly when their type is received
- [ ] BreathworkWidget animation works (circle expand/contract)
- [ ] QuickCheckinWidget submits data to wellness store
- [ ] VideoEmbedWidget plays video inline
- [ ] WidgetRenderer handles all 28 types without errors

---

### Phase 5: Briefing Card + Spaces

**Goal**: Implement the daily briefing and Space navigation.

**Task 5.1: BriefingCard**
- **File**: `components/chat/BriefingCard.tsx`
- Auto-generated morning card at top of chat
- Content (all from existing stores):
  - Today's workout: group + exercise count (from `useTrainingStore`)
  - Nutrition: kcal consumed/target + protein (from `useNutritionStore`)
  - Watch: sleep score + steps (from `useHealthKit`)
  - Streak: current streak count (from AsyncStorage / smartNotifications)
  - Recovery score: derived from sleep + HRV if available
- Collapsible: tap to minimize to single line "Semana 8 · Push Day · 1,200/2,400 kcal"
- Glassmorphism card style with `#0D0D2B` background

**Task 5.2: Space routing**
- Modify chat screen to support multiple conversation contexts
- Each Space has a unique `conversationId`:
  - Daily: `daily-{YYYY-MM-DD}`
  - LOGOS: `logos`
  - Season Hub: `season-hub`
  - Labs: `labs`
- When user taps a Space in drawer, update active `conversationId` in `useGenesisStore`
- Chat screen filters messages by active `conversationId`
- Quick actions bar changes based on active Space:
  - LOGOS: "¿Qué es periodización?", "Ciencia del sueño", "Salud muscular", "Longevidad"
  - Season Hub: "¿Cómo va mi Season?", "Mi fase actual", "Adherencia", "Próxima semana"
  - Labs: "Analizar progreso", "Comparar períodos", "Tendencias de sueño", "Mi HRV"

**Task 5.3: BriefingCard shows only on daily thread**
- BriefingCard visible only when active Space is the daily thread
- Hidden when in LOGOS, Season Hub, or Labs

**Success Criteria Phase 5:**
- [ ] BriefingCard shows at top of daily thread with real data from stores
- [ ] BriefingCard collapses/expands on tap
- [ ] Drawer spaces navigate to different conversation contexts
- [ ] Quick actions change based on active space
- [ ] Messages are filtered per conversation context

---

### Phase 6: Quick Actions + Input Tools

**Goal**: Context-aware quick action pills and input bar tools.

**Task 6.1: QuickActionsBar**
- **File**: `components/chat/QuickActionsBar.tsx`
- Horizontal ScrollView of pill buttons below chat area, above input
- Pills change based on time of day:
  - Morning (6-10): "☀️ Mi briefing", "🫁 Breathwork", "📋 Check-in", "🏋️ ¿Qué entreno?"
  - Pre-workout (detected via training store): "⏱ Empezar workout", "🔥 Calentamiento", "🍌 Pre-entreno"
  - Post-workout (after workout completion): "📊 Resumen", "🍽 Post-entreno", "🧊 Recovery"
  - Midday (12-15): "🍽 Loggear comida", "💧 Agua", "📷 Escanear"
  - Evening (20-23): "📊 Resumen del día", "🧘 Meditación", "🌙 Rutina sueño"
  - Always available (scrollable end): "📈 ¿Cómo voy?", "🏆 PRs", "📚 LOGOS", "⚙️ Settings"
- Tapping a pill sends that text as a message to GENESIS (reuse `sendMessage`)
- Pill style: glassmorphism chips with subtle `#6D00FF` border, Inter font

**Task 6.2: ChatInput with tools**
- **File**: `components/chat/ChatInput.tsx`
- Text input field with send button
- Tool icons row (left side or above input):
  - 📷 Camera: opens camera-scanner modal (existing `app/(modals)/camera-scanner.tsx`)
  - 🎤 Voice: opens voice-call modal (existing `app/(modals)/voice-call.tsx`)
  - 📎 Attach: opens image picker (`expo-image-picker`) for gallery photos, PDFs
  - ⏱ Workout: quick-starts today's workout (opens WorkoutPanel directly)
  - 🔍 Search: prefixes message with "[DeepSearch]" flag for GENESIS
  - ⌚ Watch: triggers manual HealthKit sync (`useHealthKit.refreshData()`)
- Tool icons are small, monochrome icons with subtle animation on press
- Input expands vertically for multiline

**Success Criteria Phase 6:**
- [ ] Quick action pills render and change based on time of day
- [ ] Tapping a pill sends the text as a message
- [ ] All 6 tool icons appear in ChatInput
- [ ] Camera tool opens camera scanner modal
- [ ] Voice tool opens voice call modal
- [ ] Attach opens image picker
- [ ] Workout tool opens WorkoutPanel

---

### Phase 7: Polish + Token Economy

**Goal**: Visual polish, animations, transitions, and token economy UI.

**Task 7.1: Animations**
- Message bubble slide-in from bottom
- Widget staggered fade-in (existing behavior, maintain)
- AgentThinking pulse animation
- BriefingCard collapse/expand with spring animation (Reanimated)
- Panel open/close with smooth gesture-driven animation
- Drawer slide with haptic feedback on open

**Task 7.2: TokenCounter**
- **File**: `components/chat/TokenCounter.tsx`
- Shows in drawer: "Créditos Premium: 47/60"
- Shows in input bar when premium tool invoked (small badge)
- For now: static/mock value (backend token economy comes later)

**Task 7.3: SeasonBadge**
- **File**: `components/chat/SeasonBadge.tsx`
- Mini badge in header: "S8/12" with circular progress
- Reuse `useSeasonStore` for current week/total

**Task 7.4: Empty state (new conversation)**
- When chat has no messages (fresh daily thread):
  - GENESIS logo centered (pulsing subtle animation)
  - "¿En qué puedo ayudarte?" text
  - Quick action pills below
  - Briefing Card above
- When messages exist: logo disappears, normal chat flow

**Task 7.5: Visual consistency audit**
- All components use dark theme: `#0D0D2B` backgrounds
- All accents: `#6D00FF` (GENESIS violet)
- Typography: JetBrains Mono for headers/code, Inter for body
- GlassCard effect on all cards (semi-transparent bg + backdrop blur)
- No remnants of tab-based UI anywhere

**Success Criteria Phase 7:**
- [ ] All animations are smooth (60fps)
- [ ] Token counter displays in drawer
- [ ] Season badge shows in header
- [ ] Empty state looks polished with logo + briefing + pills
- [ ] Visual audit: dark theme consistent, no tab remnants, glass effects working
- [ ] Full user flow works: open app → see briefing → ask question → see agents thinking → get response with widgets → start workout from widget → log sets in panel → complete workout → see summary

---

## Global Constraints

### DO
- ✅ Create branch `feat/chat-first-ui` before ANY changes
- ✅ Reuse ALL existing stores (`stores/*.ts`) — do NOT modify them
- ✅ Reuse ALL existing services (`services/*.ts`) — do NOT modify them
- ✅ Reuse ALL existing hooks (`hooks/*.ts`) — do NOT modify them
- ✅ Reuse ALL existing types (`types/*.ts`) — do NOT modify them
- ✅ Reuse `components/ui/` components (GlassCard, Pill, ProgressBar, etc.)
- ✅ Keep `bff/` completely untouched
- ✅ Use NativeWind v4 (Tailwind) for styling, inline `style` for complex layouts
- ✅ Use expo-router v6 for navigation
- ✅ Use Zustand 5 patterns (read primitives from selectors, compute inline)
- ✅ Keep all text in Spanish for user-facing strings
- ✅ Test after each phase: `npm start` (app runs) + `npm test` (existing tests pass)
- ✅ Commit after each phase with descriptive message

### DO NOT
- ❌ Do NOT modify anything in `bff/` directory
- ❌ Do NOT modify Zustand stores
- ❌ Do NOT modify services, hooks, types, or utils
- ❌ Do NOT create new API endpoints (the BFF already has everything needed)
- ❌ Do NOT install major new dependencies unless specified (use what's already in package.json)
- ❌ Do NOT change the auth flow (Supabase Auth stays the same)
- ❌ Do NOT use deprecated `expo-av` — use `expo-video` for new video components
- ❌ Do NOT call store methods inside Zustand selectors (causes infinite re-render loops)
- ❌ Do NOT use the old tab navigation pattern anywhere
- ❌ Do NOT expose agent architecture to the user (GENESIS speaks as one, agents contribute behind the scenes)
- ❌ Do NOT use English for user-facing text (everything in Spanish)

## Verification

After completing ALL phases, verify the full flow:

```bash
# 1. App compiles and runs
npm start

# 2. Existing tests pass (stores, services unchanged)
npm test

# 3. Manual verification flow:
# - Open app → Chat screen with BriefingCard (no tabs)
# - Drawer opens with spaces and history
# - Send message → AgentThinkingBlock appears → Response with widgets
# - Tap workout widget "Iniciar" → WorkoutPanel opens
# - Log a set → rest timer → complete workout → summary in chat
# - Quick action pills change by time of day
# - Camera/Voice/Attach tools work from input bar
# - Navigate to LOGOS space → different conversation context
# - All dark theme, glassmorphism, #6D00FF accents consistent
```

## Session Success Criteria

This implementation is complete when:
- [ ] No tab navigation exists anywhere in the app
- [ ] Chat screen is the primary and only main screen
- [ ] Drawer sidebar with Spaces (LOGOS, Season Hub, Labs) works
- [ ] AgentThinkingBlock shows agent collaboration visually
- [ ] WorkoutPanel handles full workout flow (sets, timer, PRs)
- [ ] 28 A2UI widgets render correctly (20 existing + 8 new)
- [ ] BriefingCard auto-generates from real store data
- [ ] QuickActionsBar changes by time of day context
- [ ] ChatInput has all 6 tool icons functional
- [ ] Visual polish: dark theme, glassmorphism, animations, no tab remnants
- [ ] `npm start` runs without errors
- [ ] `npm test` passes without regressions
- [ ] All committed to `feat/chat-first-ui` branch with descriptive commits per phase
