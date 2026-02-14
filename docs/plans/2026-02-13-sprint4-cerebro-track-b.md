# Sprint 4 "Cerebro" — Track B: Knowledge Population

> **Fecha:** 13 Feb 2026 | **Prerequisito:** Track A ✅ completo (155 tests, ruff clean)

---

## Objetivo

Poblar los 5 File Search Stores de GENESIS con documentos de conocimiento especializados por dominio. Esto convierte a los agentes de "inteligentes pero sin memoria" a "expertos con base de conocimiento real". También incluye el primer deploy del BFF a Cloud Run.

---

## Lo que ya existe (Track A)

| Componente | Estado | Archivo |
|-----------|--------|---------|
| File Search wrapper tool | ✅ | `bff/agents/tools/knowledge_tools.py` |
| Store manager CLI | ✅ | `bff/scripts/manage_stores.py` |
| `search_knowledge` en 5 agentes | ✅ | Todos los agent files |
| `build_system_prompt()` con NGX Philosophy | ✅ | `bff/services/context_cache.py` |
| Fallback graceful cuando stores vacíos | ✅ | `knowledge_tools.py` |
| Env vars FILESEARCH_STORE_* en .env.example | ✅ | `bff/.env.example` |

---

## Workflow de Upload

```bash
# 1. Crear store por dominio
cd bff
python scripts/manage_stores.py create --domain train --display-name "GENESIS Training KB"
# Output: FILESEARCH_STORE_TRAIN=projects/.../stores/abc123

# 2. Agregar a .env
echo "FILESEARCH_STORE_TRAIN=projects/.../stores/abc123" >> .env

# 3. Subir documento(s)
python scripts/manage_stores.py upload --domain train --file ../docs/knowledge/train/periodization.md

# 4. Verificar con query
python scripts/manage_stores.py query --domain train --query "¿qué es la periodización ondulante?"
```

**Chunking config:** 512 tokens por chunk, 50 tokens overlap (optimizado para File Search API).

---

## 5 Knowledge Stores — Contenido Requerido

### 1. GENESIS Store (Orquestador)

**Propósito:** Filosofía general NGX, diseño de seasons, protocolos de assessment.

| Documento | Contenido | Formato | Quién lo trae |
|-----------|-----------|---------|---------------|
| `ngx_philosophy_expanded.md` | Expansión de `ngx_philosophy.md` actual — principios más profundos, casos de uso, anti-patrones | MD | Aldo + Claude |
| `season_design_templates.md` | Estructura de 12-week season: 4 fases, criterios de progresión, deload triggers, examples | MD | Aldo |
| `assessment_protocols.md` | Protocolo de evaluación inicial: qué preguntar, qué medir, cómo clasificar nivel | MD | Aldo + Claude |
| `genesis_personality.md` | Guía completa de voz GENESIS: tono por contexto, respuestas modelo, do/don't | MD | Aldo + Claude |

**Pregunta para Aldo:** ¿Tienes un documento existente de onboarding o assessment que uses con clientes? ¿Cómo clasificas niveles (principiante/intermedio/avanzado)?

---

### 2. TRAIN Store (Entrenamiento)

**Propósito:** Base de conocimiento de entrenamiento — ejercicios, periodización, programación.

| Documento | Contenido | Formato | Quién lo trae |
|-----------|-----------|---------|---------------|
| `exercise_database.md` | Catálogo completo de ejercicios: nombre, muscle_groups, equipment, difficulty, cues de forma, variaciones | MD/CSV | **Aldo** (tus tipos de entrenamientos) |
| `periodization_science.md` | Periodización lineal, ondulante (DUP), por bloques, conjugada — cuándo usar cada una, evidencia | MD | Claude genera + Aldo valida |
| `rpe_rir_reference.md` | Tablas RPE 1-10, RIR equivalencias, cómo autoregular por RPE, cuándo ajustar volumen | MD | Claude genera + Aldo valida |
| `warmup_protocols.md` | Protocolos de calentamiento por tipo de sesión: upper, lower, full body, mobility | MD | Aldo |
| `deload_protocols.md` | Cuándo hacer deload (biofeedback vs programado), cómo ejecutarlo, duración, intensidad | MD | Aldo + Claude |
| `training_splits.md` | Splits disponibles: PPL, Upper/Lower, Full Body, Bro Split — pros/contras por nivel y frecuencia | MD | **Aldo** (tus splits y metodología) |
| `progression_models.md` | Modelos de progresión: linear, double progression, wave loading, AMRAP-based | MD | Aldo + Claude |

**Pregunta para Aldo:**
- ¿Cuáles son tus splits de entrenamiento favoritos/que más usas?
- ¿Tienes un catálogo de ejercicios existente (Excel, doc, app)?
- ¿Usas algún modelo de progresión específico para tus clientes?
- ¿Cuántos ejercicios aproximadamente maneja tu sistema?

---

### 3. FUEL Store (Nutrición)

**Propósito:** Guías nutricionales, fórmulas de cálculo, timing de comidas.

| Documento | Contenido | Formato | Quién lo trae |
|-----------|-----------|---------|---------------|
| `macro_calculation.md` | Fórmulas: TDEE (Mifflin-St Jeor + multiplicadores), macros por objetivo, ajustes por fase | MD | Claude genera + Aldo valida |
| `protein_guidelines.md` | Recomendaciones de proteína por objetivo, timing, fuentes, aminogramas | MD | Claude genera + Aldo valida |
| `carb_fat_guidelines.md` | Carbos: timing peri-workout, tipos, fibra. Grasas: mínimos, saturadas, omega-3 | MD | Claude genera + Aldo valida |
| `meal_timing_protocols.md` | Pre/intra/post workout nutrition, ayuno intermitente, frecuencia de comidas | MD | Aldo + Claude |
| `hydration_formulas.md` | 0.033L/kg base, ajustes por clima/ejercicio, electrolitos, señales de deshidratación | MD | Claude genera |
| `supplement_evidence.md` | Suplementos con evidencia: creatina, cafeína, proteína whey, omega-3, vitamina D, magnesio — dosis, timing, evidencia | MD | Claude genera + Aldo valida |
| `common_foods_macros.md` | Tabla de macros de alimentos comunes en México/Latam: tortilla, frijoles, arroz, pollo, etc. | MD/CSV | **Aldo** (alimentos que tus clientes comen) |

**Pregunta para Aldo:**
- ¿Tienes tablas de alimentos o macros que uses con clientes?
- ¿Qué fórmula de TDEE prefieres? (Mifflin-St Jeor, Harris-Benedict, otra)
- ¿Hay suplementos que recomiendes específicamente?
- ¿Manejas planes alimenticios por tipo (cutting, bulking, recomp)?

---

### 4. MIND Store (Bienestar y Recovery)

**Propósito:** Ciencia del sueño, HRV, manejo de estrés, recovery activo.

| Documento | Contenido | Formato | Quién lo trae |
|-----------|-----------|---------|---------------|
| `sleep_architecture.md` | Fases del sueño, cronotipos, higiene del sueño, impacto en rendimiento, jet lag | MD | Claude genera + Aldo valida |
| `hrv_interpretation.md` | Qué es HRV, cómo interpretarla, tendencias vs lecturas individuales, readiness scoring | MD | Claude genera + Aldo valida |
| `stress_management.md` | Frameworks de manejo de estrés: respiración, meditación, journaling, naturaleza, social | MD | Claude genera + Aldo valida |
| `active_recovery.md` | Protocolos de recovery activo: foam rolling, movilidad, caminar, yoga, sauna, cold exposure | MD | Aldo + Claude |
| `mental_performance.md` | Mindset de crecimiento, visualización, self-talk, motivación intrínseca, flow states | MD | Claude genera |
| `biofeedback_markers.md` | Marcadores de sobre-entrenamiento: sueño, ánimo, rendimiento, apetito, HRV, RPE trends | MD | Aldo + Claude |

**Pregunta para Aldo:**
- ¿Usas algún protocolo de recovery específico con clientes?
- ¿Qué wearables/apps recomiendas para HRV? (Whoop, Oura, Apple Watch)
- ¿Tienes algún framework de bienestar propio?

---

### 5. TRACK Store (Progreso y Analytics)

**Propósito:** Algoritmos de scoring, métodos de análisis de tendencias, benchmarks.

| Documento | Contenido | Formato | Quién lo trae |
|-----------|-----------|---------|---------------|
| `fitness_scoring.md` | Algoritmo de fitness score: adherencia (40%), consistencia (25%), mejora relativa (20%), PRs (15%) | MD | Aldo + Claude |
| `trend_analysis.md` | Métodos estadísticos: moving averages, z-score anomalías, rate of change, plateau detection | MD | Claude genera |
| `phase_comparison.md` | Cómo comparar fases del season: métricas clave, benchmarks por nivel, expected improvement % | MD | Aldo + Claude |
| `pr_significance.md` | Cuándo un PR es significativo: umbrales por ejercicio, relative strength ratios, novice/intermediate/advanced standards | MD | Claude genera + Aldo valida |
| `body_composition.md` | Tracking de composición corporal: peso, medidas, fotos, DEXA equivalentes, rate of change esperado | MD | Aldo + Claude |

**Pregunta para Aldo:**
- ¿Tienes un sistema de scoring o puntuación para progreso?
- ¿Cómo defines "buen progreso" para tus clientes?
- ¿Qué métricas consideras más importantes para tracking?

---

## Tarea de Aldo (preparar para mañana)

### Lo que necesito de ti:

1. **Tus tipos de entrenamientos / splits** — Los que usas con clientes, su estructura, frecuencia, selección de ejercicios por día

2. **Tu catálogo de ejercicios** — Si tienes un Excel, doc, o lista de ejercicios que manejas. Con muscle groups, equipment necesario, y cualquier nota de técnica

3. **Tus protocolos de nutrición** — Cómo calculas macros, qué fórmulas usas, cómo ajustas por objetivo, alimentos comunes de tus clientes

4. **Tu filosofía de coaching expandida** — Más allá del `ngx_philosophy.md` básico: ¿cuál es tu diferenciador? ¿Qué principios son innegociables? ¿Cuáles son los anti-patrones que evitas?

5. **Criterios de evaluación/assessment** — Cómo evalúas a un nuevo cliente, qué preguntas haces, cómo clasificas nivel

6. **Cualquier documento existente** — PDFs, docs, Excel, notas — lo que tengas ya escrito sobre tu metodología

### Formato ideal:
- **Markdown** (.md) es el mejor formato para File Search chunking
- **PDF** también funciona bien
- **Excel/CSV** para datos tabulares (ejercicios, alimentos)
- No te preocupes por el formato perfecto — yo lo adapto

---

## Plan de Ejecución (mañana)

| # | Tarea | Tiempo est. | Dependencia |
|---|-------|-------------|-------------|
| 1 | Revisar contenido que Aldo traiga | 15 min | Aldo preparó docs |
| 2 | Crear 5 File Search Stores via manage_stores.py | 10 min | GOOGLE_API_KEY |
| 3 | Generar docs TRAIN (con input de Aldo) | 45 min | Store creado |
| 4 | Generar docs FUEL (con input de Aldo) | 30 min | — |
| 5 | Generar docs MIND | 30 min | — |
| 6 | Generar docs TRACK | 20 min | — |
| 7 | Generar docs GENESIS | 20 min | — |
| 8 | Upload todos los docs a sus stores | 15 min | Docs listos |
| 9 | Verificar queries en cada dominio | 15 min | Upload completo |
| 10 | Agregar FILESEARCH_STORE_* a .env | 5 min | Stores creados |
| 11 | Test end-to-end: chat → agent → search_knowledge → respuesta con RAG | 15 min | Todo conectado |
| 12 | (Bonus) Dockerize BFF para Cloud Run | 30 min | Tests pasan |
| 13 | Run full test suite (155+ tests) | 5 min | Final |

**Tiempo total estimado:** ~4 horas (depende de cuánto contenido trae Aldo)

---

## Criterios de Éxito

- [ ] 5 File Search Stores creados y poblados
- [ ] Cada store tiene al menos 2-3 documentos
- [ ] `search_knowledge(query, domain)` devuelve resultados reales (no fallback)
- [ ] Queries de prueba en cada dominio devuelven respuestas relevantes
- [ ] 155+ BFF tests siguen pasando (zero regressions)
- [ ] Chat end-to-end: GENESIS usa RAG para responder preguntas técnicas
- [ ] (Bonus) BFF corriendo en Cloud Run con Dockerfile

---

## Notas Técnicas

### File Search Chunking
- **Max tokens per chunk:** 512
- **Overlap tokens:** 50
- Documentos largos se chunkearan automáticamente
- Markdown headers ayudan al chunking — el API respeta estructura
- Un doc de 5,000 palabras ≈ 15-20 chunks

### Costos
- File Search queries: ~$0.001 por query (negligible)
- Embeddings (text-embedding-004): gratis hasta Nov 2025, después ~$0.0001/1K tokens
- Storage: ~$0.02/GB/mes (negligible para docs de texto)

### Fallback
Si algo falla durante Track B, el sistema sigue funcionando:
- `search_knowledge()` ya tiene fallback graceful
- Los agentes responden con conocimiento general del LLM
- No hay breaking changes posibles

---

## Git Push Pendiente (Track A)

> ⚠️ **El commit de Track A** (SHA `4d1a313`) existe en `/tmp/genesis-commit-tmp` pero NO se pudo pushear a GitHub desde el sandbox (sin credenciales).

**Para pushear manualmente:**
```bash
# Opción 1: Desde tu máquina local con git configurado
cd genesis-app
git add bff/services/cache.py bff/services/embeddings.py bff/services/context_cache.py \
       bff/agents/tools/knowledge_tools.py bff/data/ngx_philosophy.md bff/scripts/manage_stores.py \
       bff/agents/genesis_agent.py bff/agents/train_agent.py bff/agents/fuel_agent.py \
       bff/agents/mind_agent.py bff/agents/track_agent.py bff/services/agent_router.py \
       bff/requirements.txt bff/main.py bff/.env.example CLAUDE.md \
       bff/tests/test_cache.py bff/tests/test_embeddings.py bff/tests/test_context_cache.py \
       bff/tests/test_knowledge_tools.py bff/tests/test_agents.py bff/tests/test_health.py \
       docs/plans/2026-02-12-sprint4-cerebro-track-a.md

git commit -m "feat(bff): Phase 9 Sprint 4 Track A — Cerebro intelligence infrastructure

3-level response cache (L1 in-memory TTLCache + L2 pgvector semantic similarity),
Gemini text-embedding-004 embeddings, NGX Philosophy context cache via
build_system_prompt(), File Search API wrapper with per-domain stores,
GoogleSearch grounding for FUEL/MIND agents, refined per-agent prompts
with domain expertise. 155 BFF tests passing, ruff clean.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

git push origin feat/phase8-steel-and-phase9-sprint1
```

Los 23 archivos están en el workspace y listos para commit.
