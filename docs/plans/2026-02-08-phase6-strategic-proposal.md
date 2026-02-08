# NGX GENESIS APP — STRATEGIC ANALYSIS & PHASE 6 PROPOSAL

**Fecha:** 2026-02-08
**Autor:** Command Center (Strategic Audit)
**Para:** Aldo — CEO & Founder, NGX

---

## 1. DÓNDE ESTAMOS

### Inventario Real del App

| Capa | Qué existe | Líneas |
|---|---|---|
| **Screens** | 5 tabs + 4 auth + 5 modals + 6 screens = **20 pantallas** | ~3,220 |
| **Components** | 53 componentes across 13 categorías | ~2,371 |
| **Stores** | 9 Zustand stores (auth, season, training, nutrition, wellness, track, genesis, cache + index) | ~1,541 |
| **Services** | 7 servicios (Supabase, BFF API, ElevenLabs, Vision, HealthKit, queries) | ~890 |
| **Types** | 4 archivos (models, api, supabase schema 471 líneas) | ~600 |
| **Hooks** | 9 custom hooks (auth, chat, animation, gesture, image, offline, a11y, motion) | ~450 |
| **Utils** | 7 utilities (calculations, formatters, image, storage, validators, PR detection) | ~350 |
| **BFF** | 11 archivos FastAPI (endpoints, auth, models, migrations) | 332 |
| **Constants** | 7 archivos (theme, colors, animations, shadows, config, deeplinks, widgetRegistry) | ~400 |
| **Data** | Mock data con 16 ejercicios, 4 fases, 6 education, 6 recovery, 6 quick actions | 345 |
| **Migrations** | 3 SQL files (phase5 tables, seed exercises, BFF full schema) | ~763 |
| **TOTAL** | **~140 archivos source** | **~51,135** |

### Lo Que Funciona (Phases 1-5 Complete)

**✅ FOUNDATION:** Types, mock data, season system, phase-aware config
**✅ UI SYSTEM:** Glassmorphism, ImageCard, SeasonHeader, 14 base components
**✅ 5 TABS:** Home (briefing + missions), Train (workout + library link), Fuel (macros + meals), Mind (recovery heatmap + wellness), Track (PRs + progress)
**✅ NEW SCREENS:** Library (search + filters), Exercise Detail, Education Hub, Education Detail
**✅ WORKOUT FLOW:** State machine, active workout screen, ExerciseForm (dual-mode), RestTimer, PR detection, completion overlay
**✅ CHAT:** GenesisChat con quick actions, typing indicator, offline mode, widget rendering, conversation persistence
**✅ STORES → SUPABASE:** 16 query functions, all stores with hasSupabaseConfig guard, optimistic updates
**✅ BFF SCAFFOLD:** FastAPI con 6 endpoints, JWT auth, mock agent responses, Dockerfile
**✅ AUTH FLOW:** Login, signup, forgot password, onboarding screens
**✅ MIGRATIONS:** Schema SQL para 15 tablas + RLS + indexes + seed data

### Lo Que NO Funciona Todavía

| Gap | Impacto | Severity |
|---|---|---|
| **Sin onboarding real** — pantalla existe pero no recolecta datos del usuario | Sin personalización = experiencia genérica | 🔴 CRITICAL |
| **Sin assessment inicial** — no hay cuestionario de intake | GENESIS no puede personalizar nada | 🔴 CRITICAL |
| **Agentes son stubs** — BFF retorna mock responses hardcodeados | Chat es decorativo, no funcional | 🔴 CRITICAL |
| **Sin push notifications** — no engagement loops | Usuarios olvidan la app después de día 3 | 🟡 HIGH |
| **Sin animations/transitions** — navegación es instantánea/seca | UX se siente prototype, no premium | 🟡 HIGH |
| **Camera scanner es TODO** — no conecta con Vision API | Feature anunciada pero vacía | 🟡 MEDIUM |
| **Voice call es TODO** — ElevenLabs sin disconnect logic | Feature incompleta | 🟡 MEDIUM |
| **Sin deep links funcionales** — archivo existe pero no wired | No se puede compartir contenido | 🟢 LOW |
| **HealthKit no testado** — integration existe pero sin validación | Feature para iOS only | 🟢 LOW |
| **Sin tests** — 0 test files en el proyecto | Riesgo de regresiones | 🟢 LOW (para MVP) |

---

## 2. HACIA DÓNDE VAMOS

### La Pregunta Estratégica

Tienes un app con 20 pantallas, 53 componentes, y un backend scaffold. Pero necesitas responder una pregunta antes de escribir una línea más de código:

**¿Cuál es el primer milestone que genera revenue o validación real?**

Hay 3 caminos posibles:

### Camino A: "Feature Complete" → Lanzar ASCEND ($99/mes)
- Terminar TODO lo que falta
- 3-4 meses más de desarrollo
- Riesgo: Over-engineering sin validación de mercado

### Camino B: "Functional MVP" → Beta con 10-20 Founding Users
- Solo lo necesario para que un usuario complete una semana de uso real
- 3-4 semanas de sprint intenso
- Riesgo: Scope creep si no se define bien el corte

### Camino C: "Demo Mode" → Validar con Video + Waitlist + 5 Beta Testers
- El app ya funciona en demo mode (mock data)
- Grabar demo, crear waitlist, dar acceso manual a 5 personas
- 1-2 semanas de polish
- Riesgo: No es "real" pero valida interés

**Mi recomendación: Camino B.**

La razón es que tienes demasiado construido para conformarte con C, pero ir a A sin validación es el error clásico de founders técnicos. B te da datos reales con usuarios reales en el menor tiempo posible.

---

## 3. PHASE 6: FUNCTIONAL MVP — "First Real Week"

### Objetivo

**Un usuario puede completar su primera semana completa en GENESIS:**
descargar → onboarding → recibir su plan → entrenar 3 veces → hacer check-in diario → chatear con GENESIS → ver su progreso al final de la semana.

### Qué Necesita Para Eso (Y Solo Eso)

| # | Workstream | Por Qué |
|---|---|---|
| **WS1** | Onboarding + Assessment | Sin datos del usuario, todo es genérico |
| **WS2** | GENESIS Agent Real (no mocks) | El chat es el corazón del producto — sin IA funcional no hay diferenciación |
| **WS3** | Season Creation + First Week | El usuario necesita recibir SU plan, no un mock |
| **WS4** | Notifications + Engagement | Sin reminders, el usuario no vuelve después del día 1 |
| **WS5** | Polish + Demo Mode Fix | Asegurar que no hay crashes y que la experiencia se siente premium |

---

### WS1: Onboarding + Assessment (5 tasks)

**El problema:** El onboarding screen existe pero está vacío. GENESIS necesita saber quién eres para personalizar.

#### Task 1.1 — Assessment Questionnaire Screen
**Archivo:** `app/(auth)/onboarding.tsx` (rewrite)
**Contenido:**
- Step 1: Datos básicos (edad, peso, estatura) — ya están en `profiles` table
- Step 2: Objetivo principal (build muscle / lose fat / energy / longevity / stay functional)
- Step 3: Experiencia (beginner / intermediate / advanced)
- Step 4: Disponibilidad (3/4/5/6 días/semana, duración preferida)
- Step 5: Limitaciones (lesiones, condiciones, equipamiento disponible)
- Step 6: Resumen visual → "GENESIS está creando tu primera Season..."

**UX:** Stepper con progress bar, una pregunta por pantalla, animación entre steps.
**Store:** Escribe a `profiles` table vía Supabase (goal, experience_level, etc.)

#### Task 1.2 — Profile Completion Guard
**Archivo:** `app/_layout.tsx` (modify)
**Lógica:** Si `user.goal === null`, redirigir a onboarding. Si ya completó, ir a tabs.
**Previene:** Usuario llegando a Home sin datos de personalización.

#### Task 1.3 — Season Generation from Assessment
**Archivo:** `services/seasonGenerator.ts` (new)
**Función:** `generateFirstSeason(profile)` → crea Season de 12 semanas con:
- Fases apropiadas al goal (e.g., build muscle → hypertrophy → strength → power → deload)
- Sessions por semana según disponibilidad
- Exercises asignados según experiencia y equipamiento
**Escribe a:** Supabase tables (seasons → phases → weeks → sessions → exercises)
**Fallback:** Si no hay Supabase, genera en memoria y guarda en Zustand

#### Task 1.4 — Loading/Creation Animation
**Archivo:** `components/ui/SeasonCreationLoader.tsx` (new)
**UX:** Pantalla de "GENESIS está diseñando tu programa" con:
- Logo GENESIS animado (pulse/glow)
- Progress steps: "Analizando perfil..." → "Diseñando periodización..." → "Asignando ejercicios..." → "Tu Season está lista"
- 3-5 segundos (real o artificial delay para UX)

#### Task 1.5 — Welcome Screen Post-Assessment
**Archivo:** `app/(screens)/welcome.tsx` (new)
**Contenido:** Resumen visual de tu primera Season:
- "Season 1: [Goal Name]" con hero image
- Timeline visual de 12 semanas con fases coloreadas
- "Semana 1 comienza hoy" CTA → navega a Home
- Tono celebratorio: "Bienvenido al sistema. Esto no es una app de fitness. Es tu plataforma de rendimiento."

---

### WS2: GENESIS Agent Real (4 tasks)

**El problema:** El chat retorna "Soy GENESIS, tu sistema de rendimiento y longevidad" para todo. Necesita IA real.

#### Task 2.1 — Connect BFF to Vertex AI / Anthropic
**Archivo:** `bff/services/agent_router.py` (rewrite)
**Cambio:** Reemplazar stubs con llamada real a LLM:
- Option A: Vertex AI (Gemini) via `google-cloud-aiplatform` SDK
- Option B: Anthropic Claude via `anthropic` SDK
- Option C: OpenAI compatible endpoint
**System prompt:** Usar el GENESIS personality (INTJ, Verdad Directa, CONFRONTA → FUNDAMENTA → RESUELVE) del Master Source of Truth
**Context injection:** Incluir datos del usuario (season actual, última sesión, check-in de hoy) en el prompt

#### Task 2.2 — Context Injection Middleware
**Archivo:** `bff/services/context_builder.py` (new)
**Función:** `build_user_context(user_id)` → consulta Supabase y construye:
```
{current_season, current_phase, current_week, today_session, last_check_in, recent_prs, streak_days}
```
**Se inyecta:** Como system message context antes de cada chat request
**Resultado:** GENESIS sabe en qué fase estás, cómo dormiste, y qué entrenaste ayer

#### Task 2.3 — Widget Response Generation
**Archivo:** `bff/services/widget_generator.py` (new)
**Función:** Parse la respuesta del LLM y generar widgets cuando aplique:
- Si habla de entrenamiento → workout_card widget
- Si habla de nutrición → meal_plan widget
- Si da métricas → progress_chart widget
**Mapping:** Usar widgetRegistry.ts como referencia de tipos disponibles

#### Task 2.4 — Conversation Memory
**Archivo:** `bff/services/memory.py` (new)
**Función:** Mantener historial de conversación:
- Últimos 20 mensajes como context window
- Resumen de conversaciones anteriores (opcional, con LLM summarization)
- Persistencia via `conversations` table en Supabase

---

### WS3: Season + First Week Functional (3 tasks)

**El problema:** Las sessions/exercises en el mock son estáticos. El usuario necesita ver SU plan personalizado.

#### Task 3.1 — Dynamic Session Loading
**Archivo:** `stores/useTrainingStore.ts` (modify)
**Cambio:** `fetchTodaySession()` debe:
1. Buscar la session de hoy basada en (season → phase → week → sessions where date = today)
2. Si no hay session para hoy → mostrar "Día de descanso" o la próxima session
3. Cargar exercises reales de la session, no mock data
**Guard:** Si no hay Supabase, sigue con mock (ya implementado)

#### Task 3.2 — Weekly View in Train Tab
**Archivo:** `app/(tabs)/train.tsx` (modify)
**Adición:** Antes del workout hero, mostrar la semana:
- 7 cards horizontales (L-D)
- Cada día muestra: nombre del workout o "Rest"
- Día actual highlighted con borde phase-color
- Tap en otro día muestra preview de esa session

#### Task 3.3 — Post-Workout Summary → Store Update
**Archivo:** `components/training/WorkoutComplete.tsx` + `stores/useTrainingStore.ts` (modify)
**Cambio:** Cuando el usuario presiona "SAVE & EXIT":
1. `insertExerciseLogs()` persiste todos los sets
2. `completeSession()` marca session como completed
3. `insertPersonalRecord()` para cada PR detectado
4. Navegar a Home donde se refleja el workout completado en Daily Missions
**Actualmente:** La lógica existe en los stores, pero necesita verificar que el flujo end-to-end funciona con Supabase

---

### WS4: Notifications + Engagement (3 tasks)

**El problema:** Sin push notifications, el 70% de los usuarios no abre la app después del día 1.

#### Task 4.1 — Expo Notifications Setup
**Archivo:** `services/notificationService.ts` (new)
**Setup:**
- `expo-notifications` registration
- Token storage en `notification_settings` table
- Permission request en onboarding
- Notification categories: workout_reminder, check_in_reminder, genesis_message, streak_alert

#### Task 4.2 — Daily Check-in Reminder
**Lógica:** Schedule local notification:
- 8:00 AM: "Buenos días. ¿Cómo dormiste? GENESIS necesita tu check-in."
- Si no hay check-in a las 12:00 PM: "Tu check-in de hoy está pendiente."
- Configurable en Settings

#### Task 4.3 — Workout Reminder
**Lógica:** Si hay session programada hoy:
- 1 hora antes de la hora habitual de entrenamiento: "Tu sesión de [Push Day] está lista."
- Si llegan las 9 PM sin workout: "¿Hoy fue día de descanso activo? GENESIS se adapta."

---

### WS5: Polish + Regression Fix (4 tasks)

#### Task 5.1 — Screen Transition Animations
**Archivo:** `app/(screens)/_layout.tsx`, `app/(modals)/_layout.tsx`
**Adición:**
- Stack screens: slide from right (default Expo Router, verificar que funciona)
- Modals: slide from bottom con spring animation
- Tab transitions: crossfade entre tabs
**Objetivo:** Que la navegación se sienta fluida, no "cortada"

#### Task 5.2 — Loading States Everywhere
**Verificación:** Cada pantalla que fetch data muestra:
- SkeletonCard o ShimmerEffect mientras carga
- isLoading check en cada store → render skeleton
- Error state → retry button
**Archivos:** Todos los tabs + screens (10 archivos)

#### Task 5.3 — Demo Mode Regression Test
**Verificación completa:**
- Quitar todas las env vars de Supabase
- `npx expo start` → navegar TODAS las 20 pantallas
- Ninguna crashea, todas muestran mock data
- Chat funciona con mock responses
- Workout flow completo funciona sin Supabase

#### Task 5.4 — TypeScript + Build Verification
**Comandos:**
```bash
npx tsc --noEmit          # 0 errors
npx expo start            # starts clean
cd bff && uvicorn main:app --port 8000  # health check OK
```

---

## 4. SPRINT PLAN

| Sprint | Duración | Workstream | Tasks | Dependencias |
|---|---|---|---|---|
| **Sprint 1** | 3-4 días | WS1: Onboarding | 1.1, 1.2, 1.3, 1.4, 1.5 | Ninguna |
| **Sprint 2** | 3-4 días | WS2: Agent Real | 2.1, 2.2, 2.3, 2.4 | Necesita API key (Vertex/Anthropic/OpenAI) |
| **Sprint 3** | 2-3 días | WS3: Season + Week | 3.1, 3.2, 3.3 | Depende de WS1 (season created from assessment) |
| **Sprint 4** | 2-3 días | WS4: Notifications | 4.1, 4.2, 4.3 | Independiente |
| **Sprint 5** | 2-3 días | WS5: Polish | 5.1, 5.2, 5.3, 5.4 | Después de todo lo demás |

**Total estimado: 13-17 días de desarrollo**

**Paralelización posible:**
- WS1 y WS4 pueden correr en paralelo (Sprint 1 + 4 simultáneos)
- WS2 puede empezar mientras WS1 termina si ya tienes API key

---

## 5. QUÉ NO ENTRA EN PHASE 6 (Y POR QUÉ)

| Feature | Por Qué No Ahora |
|---|---|
| Camera/Vision scanner | Nice-to-have, no core para primera semana |
| Voice call con ElevenLabs | Wow factor pero no necesario para MVP funcional |
| HealthKit integration | Solo iOS, requiere testing en device real |
| Deep links | No necesario si no hay sharing/marketing aún |
| Test suite | Idealmente sí, pero para velocidad de MVP se posterga |
| B2B Dashboard (GENESIS BRAIN) | Producto completamente diferente, otro roadmap |
| Animations avanzadas (Reanimated) | Solo transiciones básicas en Phase 6 |
| Multi-language support | Solo español para MVP |
| Payment/subscription (RevenueCat) | Necesario para ASCEND pero no para beta cerrada |
| Wearable integration | Phase 7+ |

---

## 6. SUCCESS CRITERIA — PHASE 6 COMPLETE

Phase 6 está "done" cuando:

- [ ] Un usuario nuevo puede descargar → completar assessment → ver su primera Season
- [ ] GENESIS responde con IA real, contextualizada a los datos del usuario
- [ ] El usuario puede completar un workout completo (start → log sets → rest → finish → save)
- [ ] El check-in diario funciona y GENESIS puede referenciar los datos
- [ ] El usuario recibe al menos 1 notification diaria (check-in o workout reminder)
- [ ] Todas las pantallas funcionan tanto en demo mode como con Supabase real
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] 5 beta testers pueden usar la app por 7 días sin crashes

---

## 7. DECISIÓN QUE NECESITAS TOMAR

Antes de empezar Phase 6, necesito que definas:

**¿Qué LLM usamos para GENESIS?**

| Opción | Pros | Contras | Costo est./mes |
|---|---|---|---|
| **Vertex AI (Gemini 2.5)** | Ya estás en GCP, ADK ready, escala | Setup más complejo, cold starts | $50-200 (bajo volumen) |
| **Anthropic (Claude)** | Mejor razonamiento, Agent SDK listo | Otro proveedor, sin ADK native | $50-200 |
| **OpenAI (GPT-4o)** | Más rápido, cheaper, ecosystem maduro | Menos diferenciado | $30-150 |
| **Hybrid (Gemini + Claude)** | Lo mejor de ambos mundos | Más complejo de mantener | $80-300 |

Mi recomendación: **Vertex AI (Gemini)** para MVP porque ya tienes la infraestructura GCP en tu roadmap, ADK es tu framework de agentes, y el costo es predecible. Si la calidad de respuestas no satisface, migrar a Claude es trivial porque el BFF abstrae el provider.

---

*NGX GENESIS — Phase 6 proposal. 19 tasks, 5 workstreams, 13-17 días.*
*"El app existe. Ahora necesita funcionar para una persona real."*
