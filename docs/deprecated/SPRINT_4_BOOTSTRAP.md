# GENESIS Sprint 4 — Bootstrap Prompt

Copia y pega este texto completo como primer mensaje en una nueva conversación de Cowork o Claude Code.

---

## PROMPT

Soy Aldo, CEO de NGX. Estoy desarrollando GENESIS, una app de AI coaching (Performance & Longevity) para adultos 30-60.

### Contexto del proyecto

Lee estos archivos EN ESTE ORDEN para tener contexto completo:

1. `CLAUDE.md` — Estado actual del proyecto, tech stack, estructura, qué funciona y qué falta
2. `GENESIS.md` — Arquitectura master, los 7 agentes, las 4 capas de inteligencia por agente, el cache de 3 niveles, A2UI, BRAIN app, etc.
3. `bff/agents/genesis_agent.py` — Root agent actual
4. `bff/agents/train_agent.py` — Sub-agente de ejemplo
5. `bff/agents/tools/` — Los 5 módulos de herramientas existentes
6. `bff/services/agent_router.py` — Routing actual (ADK Runner + DatabaseSessionService + guardrails)
7. `bff/.env.example` — Variables de entorno necesarias

### Estado actual (Sprint 3 completado)

- 5 ADK agents corriendo localmente via ADK Runner (genesis + train/fuel/mind/track)
- 16 herramientas de Supabase (tools/)
- DatabaseSessionService para persistencia de sesiones
- User memory system (tabla user_memory + tools)
- Input/Output guardrails (locales, regex-based)
- 122 tests BFF pasando
- 20 A2UI widget types en mobile

### Sprint 4: "Cerebro" — Objetivo

Hacer que cada agente sea REALMENTE inteligente. Ahora mismo son "cajas vacías" con herramientas de Supabase pero sin conocimiento propio. GENESIS.md define 4 capas de inteligencia por agente y 3 niveles de cache — nada de eso existe.

### Las 4 tareas principales de Sprint 4:

**Task 1: Vertex AI RAG Engine — Corpus por agente**
- Crear RAG corpora en Vertex AI (uno por agente) vía API
- Agregar `VertexAiRagRetrieval` tool a cada sub-agente
- Preparar y subir documentos por corpus:
  - GENESIS: NGX philosophy docs, season templates, assessment protocols
  - TRAIN: exercise database export (500+ ejercicios), periodización, RPE tables
  - FUEL: nutrition databases, macro formulas, meal templates
  - MIND: sleep science, recovery protocols, stress management
  - TRACK: scoring algorithms, trend analysis, statistical benchmarks
- Config: chunk_size=512, overlap=50, similarity_top_k=5
- Necesita: GCP project ID, Vertex AI API enabled, service account o API key
- Referencia: GENESIS.md líneas 261-301, ADK tool `VertexAiRagRetrieval`

**Task 2: Gemini Context Caching — Filosofía NGX compartida**
- Crear documento "NGX Philosophy" con: brand voice, training principles, nutrition philosophy, recovery approach
- Cachear como contexto compartido para TODOS los agentes
- 90% ahorro en input tokens (cached tokens a 0.1x)
- TTL: 1 hora, refresh on cache miss
- Cada agente referencia esto como baseline antes de responder
- Referencia: GENESIS.md líneas 277-282

**Task 3: Google Search Grounding — Datos en tiempo real**
- Habilitar `google_search` built-in tool para agentes selectivos:
  - FUEL: datos de comida en tiempo real, menús, suplementos
  - MIND: investigación reciente de sueño/recuperación
- NO habilitar para: TRAIN, TRACK (usan data interna solamente)
- GENESIS orchestrator: habilitar selectivamente
- Las respuestas con grounding incluyen source attribution
- Referencia: GENESIS.md líneas 284-289

**Task 4: Upstash Redis Cache — 3 niveles**
- Crear cuenta Upstash (Redis + Vector)
- Implementar cache wrapper en `bff/services/cache.py`:
  - L1 Exact-Match: SHA256(agent_id + user_id + normalized_prompt), TTL 5min
  - L2 Semantic: text-embedding-004 vectorization, cosine ≥ 0.92, TTL 1hr, Upstash Vector
  - L3 Context Cache: ya cubierto por Task 2 (Gemini Context Caching)
- Integrar en `agent_router.py`: query → L1 check → L2 check → agent processes → store L1+L2
- Variables: UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN, UPSTASH_VECTOR_URL, UPSTASH_VECTOR_TOKEN
- Referencia: GENESIS.md líneas 305-334

### Task 5 (Bonus): Per-agent prompt refinement
- Revisar y expandir las instrucciones de cada sub-agente
- Cada agente debe tener personalidad contextual (no genérica)
- Instrucciones deben referenciar RAG corpus + search grounding donde aplique
- GENESIS orchestrator: instrucciones de routing más sofisticadas

### Reglas de implementación
- Mantener compatibilidad con los 122 tests existentes
- Nuevos tests para cada feature (RAG, cache, grounding)
- El BFF sigue corriendo LOCAL (NO Cloud Run todavía — eso es Sprint 5)
- Los agentes siguen en ADK Runner (NO Agent Engine todavía)
- Ruff clean obligatorio
- No romper el pipeline de A2UI widgets
- No romper la identidad unificada de GENESIS (un solo entity, sin revelar sub-agentes)

### Dependencias externas que necesito configurar antes:
1. **GCP Project** con Vertex AI API habilitado (para RAG Engine)
2. **Service Account** o Application Default Credentials
3. **Upstash** cuenta creada (Redis + Vector)
4. **Documentos de conocimiento** para cada corpus (puedo crearlos durante el sprint)

### Roadmap completo post-Sprint 4:
- Sprint 5 "El Split": BFF → Cloud Run, Agents → Agent Engine, VertexAiSessionService, VertexAiMemoryBankService, ModelArmorPlugin, VISION ADK agent
- Sprint 6 "BRAIN + Alpha": COACH_BRIDGE agent, A2A protocol, BRAIN Next.js app, TestFlight

---

Empieza leyendo CLAUDE.md y GENESIS.md, y luego escríbeme el prompt de implementación completo para Sprint 4 que yo pueda revisar antes de que lo ejecutes.
