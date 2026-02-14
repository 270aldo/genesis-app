# NGX GENESIS — Knowledge Synthesis Execution Plan

## Fecha: 2026-02-13 | Status: LISTO PARA EJECUCIÓN

---

## VISIÓN GENERAL

### El Problema
Los 12 Knowledge Store documents en `bff/knowledge/` contienen **1,835 líneas (~31K tokens)** de opinión curada — buena estructura, pero sin evidencia citada. Los agentes responden con autoridad pero sin respaldo verificable.

### La Solución
Enriquecer cada Knowledge Store con las **12,372 líneas** extraídas de 3 fuentes:
- **PubMed** (1,369 líneas, ~123 papers con PMIDs/DOIs) → Nivel Científico
- **RP Ebooks** (2,869 líneas, 10 ebooks) → Nivel Práctico
- **ISSA Certifications** (7,734 líneas, 9 textbooks) → Nivel Profesional

### El Resultado
Knowledge Stores que permiten a GENESIS citar evidencia específica, dar rangos cuantitativos precisos, y ofrecer protocolos respaldados por triple validación. Token target: **52,000-65,000 tokens** (de ~31K actual).

---

## PIPELINE REVISADO

```
Phase 1    ✅  PubMed Search (123 papers, 47 queries)
Phase 1.5  ✅  RP Ebook Extraction (10 ebooks, 2,869 líneas)
Phase 1.75 ✅  ISSA Cert Extraction (9 textbooks, 7,734 líneas)

FASE A     ⏳  Synthesis Matrix (mapeo fuentes → documentos)      ← ESTA SESIÓN
FASE B     ⏳  Knowledge Store Enrichment (reescribir 12 docs)    ← SESIONES NUEVAS
FASE C     ⏳  New Documents (3 docs nuevos)                      ← CON FASE B
FASE D     ⏳  Corrections (6 correcciones activas)               ← CON FASE B
FASE E     ⏳  Upload to Gemini File Search API                   ← FINAL

Phase 2.5  ⏳  Web Research (40 queries, 5 autores) — POSPUESTO, se agrega post-enrichment
```

---

## FASE A: SYNTHESIS MATRIX

### Objetivo
Crear un mapeo 1:1 de CADA hallazgo extraído → sección específica del Knowledge Store donde debe insertarse.

### Categorías de Acción

| Código | Significado | Acción |
|--------|-------------|--------|
| CONFIRM | La extracción confirma lo que ya dice el doc | Agregar bloque de evidencia que respalda |
| EXPAND | La extracción añade detalle nuevo compatible | Agregar nueva subsección o datos |
| CORRECT | La extracción contradice lo que dice el doc | Reescribir sección con evidencia correcta |
| NEW_DOC | La extracción justifica un documento nuevo | Crear nuevo Knowledge Store |
| NEW_SECTION | La extracción justifica sección nueva en doc existente | Agregar sección completa |

---

## FASE B: KNOWLEDGE STORE ENRICHMENT

### Formato de Evidencia Estándar

Cada Knowledge Store recibirá bloques de evidencia con este formato:

```markdown
> **Evidencia:** [Claim específico con dato cuantitativo]
> **Fuente:** [Autor, Año] | [PubMed/RP/ISSA]
> **Nivel:** [A = meta-análisis/RCT | B = estudios observacionales | C = expert opinion/textbook]
> **DOI:** [si disponible]
```

### Plan por Documento — BATCH 1 (P1: Core Thesis + Nutrition)

#### 1. `ngx_philosophy_expanded.md` (126 → ~280 líneas)
**Fuentes que alimentan:**
- PubMed T1: K1 (muscle mortality risk 3x), K2 (sarcopenia prevalence 10-27%), K3 (grip strength mortality RR 1.36)
- PubMed T1: K5 (cognition SMD +0.55), K6 (volume-response muscle mass)
- RP Mindset: 7 Habits of Success Pyramid, Adherence Science, Identity-First Transformation
- ISSA Modern Warrior: 5 Pillars, Heroic 100, Warrior Identity Blueprint
- **ACCIÓN:** EXPAND con ciencia de músculo como órgano + frameworks de adherencia + filosofía Warrior

#### 2. `protein_guidelines.md` (116 → ~220 líneas)
**Fuentes que alimentan:**
- PubMed T1: K4 (glucose disposal 80% skeletal muscle)
- PubMed T2: K7 (1.62g/kg MPS plateau, Morton 2018, n=1,863)
- RP Dieting: Protein 1.6-2.2g/kg constante en cut/bulk
- ISSA Nutrition: Leucine threshold 1.6-1.8g/meal, TEF protein 20-30%
- ISSA Bodybuilding: mTOR pathway, satellite cells
- ISSA Nutrición 01: 9 essential amino acids, BCAA benefits
- **ACCIÓN:** EXPAND con datos cuantitativos de MPS, leucine, TEF + CONFIRM rangos existentes

#### 3. `nutrition_protocols.md` (155 → ~350 líneas)
**Fuentes que alimentan:**
- PubMed T3: K26-K29 (creatine, omega-3, vitamin D, magnesium)
- RP Dieting: Phase cycling (mini-cut 4-12w, lean bulk 8-16w), caloric adjustment protocol, hand-portion system
- RP Nutrition Science: Food quality hierarchy, metabolic adaptation, meal timing
- ISSA Nutrition: Mifflin-St Jeor BMR, TDEE multipliers 1.2-1.9, peri-workout nutrition, micronutrient RDAs
- ISSA Nutrición 01: GI/GL classification, AMDR (carbs 45-65%, protein 10-35%, fat 20-35%)
- RP Gut-Strong: Fiber 30-40g, resistant starch, probiotics
- **CORRECCIÓN:** Seed oils — 15 RCTs no son pro-inflamatorios → reescribir §4.1
- **ACCIÓN:** MAJOR EXPANSION — phase cycling, peri-workout, micronutrients, gut health, hand-portion system

#### 4. `periodization_progression.md` (148 → ~320 líneas)
**Fuentes que alimentan:**
- PubMed T2: K8-K12 (RIR meta-analysis, volume benchmarks 12-20 sets, lengthened position +72%)
- RP Hypertrophy: MEV/MAV/MRV model, SFR/RSM framework, 8-point troubleshooting
- RP Strength: Strength vs hypertrophy divergence (11 factors), deload protocol
- ISSA S&C: Energy systems (ATP-PC/Glycolytic/Oxidative), periodization models (4 tipos), program design acute variables
- ISSA Bodybuilding: Volume 10-30 sets/muscle/week, TUT 40-60 sec
- **CORRECCIÓN:** Deload timing — no es 1 semana fija, es 3-7 días cada 4-8 semanas
- **CORRECCIÓN:** Tempo — reclasificar de "innegociable" a "preferencia práctica"
- **ACCIÓN:** MAJOR EXPANSION — volume landmarks, energy systems, periodization models, SFR/RSM

---

### Plan por Documento — BATCH 2 (P2: Recovery + Tracking)

#### 5. `sleep_architecture.md` (142 → ~250 líneas)
**Fuentes que alimentan:**
- PubMed T3: K20 (sleep deprivation -18% MPS, -22% testosterone), K21 (injury risk 1.7x), K22 (glymphatic clearance)
- ISSA Brain Fitness: Sleep architecture NREM/REM cycles, glymphatic system detailed
- ISSA Recovery: Sleep 8-10 hrs athletes, Tier 1 recovery modality
- **ACCIÓN:** EXPAND con datos cuantitativos de impacto + arquitectura del sueño + glymphatic

#### 6. `stress_recovery.md` (158 → ~320 líneas)
**Fuentes que alimentan:**
- PubMed T3: K23-K25 (light protocols, melatonin, circadian)
- PubMed T3: K30-K33 (sauna 2-3x/week all-cause mortality -24%, cold 11-15°C 10-15 min, HRV)
- ISSA Recovery: Recovery modality tiers (3 tiers), overtraining 125+ markers, blood markers (IL-6, TNF-α, CRP, CK, T:C ratio), recovery timelines (neural/muscular/metabolic)
- ISSA Brain Fitness: HPA axis, cortisol dysregulation, BDNF + exercise
- **ACCIÓN:** MAJOR EXPANSION — recovery tiers, overtraining markers, blood markers, thermotherapy data

#### 7. `supplementation.md` (107 → ~200 líneas)
**Fuentes que alimentan:**
- PubMed T3: K26 (creatine +8% strength, +14% power), K27 (omega-3 EPA>DHA 2g/day), K28 (vitamin D SMD 0.17), K29 (magnesium sleep quality)
- ISSA Bodybuilding: Supplement Tier System (creatine 5g, caffeine, beta-alanine 5g, citrulline 6-8g)
- **CORRECCIÓN:** Vitamin D — mover de Tier S a Tier A (efecto pequeño, SMD 0.17)
- **ACCIÓN:** EXPAND con dosificaciones exactas + CONFIRM tiers con datos

#### 8. `tracking_system.md` (171 → ~280 líneas)
**Fuentes que alimentan:**
- PubMed T2: Muscle power como predictor de mortalidad
- RP: Rate of change targets (fat loss 0.5-1.5% BW/week, muscle gain 0.25-0.5% BW/week)
- ISSA Recovery: Wearable comparison (WHOOP, Oura, Apple Watch, Garmin), HRV decline 10-20%, RHR +5-10 bpm
- ISSA Recovery: Taper protocols 7-10 days pre-competition
- **CORRECCIÓN:** Agregar muscle power metric
- **ACCIÓN:** EXPAND con wearable comparison, overtraining detection via wearables, rate-of-change targets

---

### Plan por Documento — BATCH 3 (P3: Training + Assessment + New Docs)

#### 9. `training_splits.md` (211 → ~300 líneas)
**Fuentes que alimentan:**
- PubMed T2: K13 (frequency 2x > 1x, Schoenfeld 2016)
- RP Hypertrophy: Frequency framework (beginner 2-3x, intermediate 2-4x, advanced 3-5x)
- ISSA S&C: Special populations (youth, elderly, pregnant)
- ISSA SSF: Senior fitness 60-80% 1RM, 10-15 reps, 2-3x/week
- **ACCIÓN:** EXPAND con frameworks de frecuencia + poblaciones especiales (critical para target 30-60)

#### 10. `exercise_database.md` (230 → ~350 líneas)
**Fuentes que alimentan:**
- PubMed T2: K14-K16 (EMG studies, lengthened position advantage, compound vs isolation)
- RP Hypertrophy: SFR/RSM ratings concept (personalización por individuo)
- ISSA S&C: Strength benchmarks (Squat 2.75× BW, Bench 2.0× BW, Deadlift 3.5× BW)
- ISSA Bodybuilding: Mechanical tension vs metabolic stress
- **ACCIÓN:** EXPAND con SFR/RSM concept + benchmarks + EMG validation

#### 11. `assessment_protocols.md` (157 → ~300 líneas)
**Fuentes que alimentan:**
- PubMed T1: K3 (grip strength mortality)
- ISSA S&C: 1RM testing (Epley formula), VO2max estimation, body comp methods
- ISSA Corrective Exercise: ILAI protocol, movement dysfunctions, joint protocols, return-to-performance
- RP Strength: Injury management 6-step protocol
- **CORRECCIÓN:** FMS sensitivity solo 24.7% — agregar limitaciones
- **ACCIÓN:** MAJOR EXPANSION — ILAI protocol, corrective exercise, assessment battery

#### 12. `genesis_identity.md` (114 → ~180 líneas)
**Fuentes que alimentan:**
- RP Mindset: Psychological barriers (7 identified), identity-first transformation, locus of control
- ISSA Modern Warrior: 5 Pillars, Daily Warrior Scorecard, Purpose Anchoring
- **ACCIÓN:** EXPAND con coaching psychology + motivational frameworks

---

### NEW DOCUMENTS (FASE C)

#### 13. NEW: `corrective_exercise.md` (~250 líneas)
**Justificación:** ISSA Corrective Exercise tiene 1,325 líneas de contenido que no tiene hogar en los docs actuales.
**Contenido:**
- ILAI Protocol (Inhibit → Lengthen → Activate → Integrate)
- Movement Dysfunctions (Upper/Lower Crossed Syndrome, Pronation Distortion)
- Joint-Specific Protocols (shoulder 4-week, hip 6-week, knee, ankle, spine)
- Overactive/Underactive Muscle Tables
- Return-to-Performance 4-Phase Criteria
**Dominio:** TRAIN store
**Agente principal:** TRAIN

#### 14. NEW: `brain_fitness_protocols.md` (~200 líneas)
**Justificación:** ISSA Brain Fitness tiene 753 líneas con protocolos únicos (BDNF, cognitive assessment, dual-task training) que no encajan en sleep_architecture ni stress_recovery.
**Contenido:**
- BDNF & Exercise (neuroplasticity mechanisms)
- Cognitive Domains & Assessment (MMSE, SLUMS, MoCA, PHQ-9, GAD-7, PSQI)
- Exercise Rx for Brain (aerobic 150 min/week, resistance 2-3x, dual-task 3-5x)
- Brain Nutrition (DHA/EPA, antioxidants, gut-brain axis)
- Aging & Cognitive Reserve
- 12-Week Integrated Program Framework
**Dominio:** MIND store
**Agente principal:** MIND

#### 15. NEW: `muscle_endocrine_function.md` (~200 líneas)
**Justificación:** PubMed evidence sobre músculo como órgano endocrino no tiene documento dedicado.
**Contenido:**
- Muscle as Endocrine Organ (myokines: IL-6, irisin, myostatin)
- Glucose Disposal (80% skeletal muscle)
- Muscle-Mortality Relationship (3x risk, grip strength RR 1.36)
- Sarcopenia Prevention (prevalence 10-27%, interventions)
- Muscle-Cognition Link (SMD +0.55)
- Muscle-Centric Medicine Framework (Lyon)
**Dominio:** GENESIS store (core thesis document)
**Agente principal:** GENESIS orchestrator

---

## FASE D: 6 CORRECCIONES ACTIVAS

| # | Corrección | Documento | Sección | Fuente |
|---|-----------|-----------|---------|--------|
| 1 | Seed oils NO son pro-inflamatorios | `nutrition_protocols.md` | §4.1 | PubMed: 15 RCTs linoleic acid |
| 2 | Deload NO es 1 semana fija | `periodization_progression.md` | §5 | RP + ISSA: 3-7 días cada 4-8 semanas |
| 3 | Tempo reclasificar | `periodization_progression.md` | §1 | PubMed: No correlación con hipertrofia |
| 4 | Vitamin D efecto pequeño | `supplementation.md` | Tier S → A | PubMed: SMD 0.17 |
| 5 | FMS sensitivity 24.7% | `assessment_protocols.md` | §2 | PubMed: Baja sensibilidad predictiva |
| 6 | Muscle power mortality | `tracking_system.md` | §2 | PubMed: Agregar como métrica |

---

## ORDEN DE EJECUCIÓN RECOMENDADO

### Sesión 1: BATCH 1 — Core + Nutrition (4 docs)
| Doc | Acción | Líneas estimadas | Fuentes principales |
|-----|--------|------------------|---------------------|
| `ngx_philosophy_expanded.md` | EXPAND | 126 → 280 | PubMed T1 + RP Mindset + ISSA Warrior |
| `protein_guidelines.md` | EXPAND | 116 → 220 | PubMed T2 + RP + ISSA Nutrition |
| `nutrition_protocols.md` | MAJOR EXPAND + CORRECT | 155 → 350 | PubMed T3 + RP + ISSA (3 fuentes nutrición) |
| `periodization_progression.md` | MAJOR EXPAND + CORRECT x2 | 148 → 320 | PubMed T2 + RP Hypertrophy + ISSA S&C |
| **Subtotal** | | **545 → 1,170** | |

### Sesión 2: BATCH 2 — Recovery + Mind + Tracking (4 docs)
| Doc | Acción | Líneas estimadas | Fuentes principales |
|-----|--------|------------------|---------------------|
| `sleep_architecture.md` | EXPAND | 142 → 250 | PubMed T3 + ISSA Brain/Recovery |
| `stress_recovery.md` | MAJOR EXPAND | 158 → 320 | PubMed T3 + ISSA Recovery (1,374 líneas) |
| `supplementation.md` | EXPAND + CORRECT | 107 → 200 | PubMed T3 + ISSA Bodybuilding |
| `tracking_system.md` | EXPAND + CORRECT | 171 → 280 | RP + ISSA Recovery (wearables) |
| **Subtotal** | | **578 → 1,050** | |

### Sesión 3: BATCH 3 — Training + Assessment + New Docs (6 docs)
| Doc | Acción | Líneas estimadas | Fuentes principales |
|-----|--------|------------------|---------------------|
| `training_splits.md` | EXPAND | 211 → 300 | PubMed T2 + RP + ISSA S&C/SSF |
| `exercise_database.md` | EXPAND | 230 → 350 | PubMed T2 + RP + ISSA S&C |
| `assessment_protocols.md` | MAJOR EXPAND + CORRECT | 157 → 300 | ISSA Corrective (1,325 líneas) |
| `genesis_identity.md` | EXPAND | 114 → 180 | RP Mindset + ISSA Warrior |
| NEW: `corrective_exercise.md` | CREATE | 0 → 250 | ISSA Corrective Exercise |
| NEW: `brain_fitness_protocols.md` | CREATE | 0 → 200 | ISSA Brain Fitness |
| NEW: `muscle_endocrine_function.md` | CREATE | 0 → 200 | PubMed T1 + Lyon thesis |
| **Subtotal** | | **712 → 1,780** | |

### Sesión 4: BATCH 4 — Verification + Upload
1. Cross-document consistency check (terms, ranges, recommendations)
2. Token count verification (target: 55-65K)
3. Update MANIFEST.md with new docs
4. Upload ALL docs to Gemini File Search API via `manage_stores.py`
5. Test queries por dominio
6. Update agent prompts if needed

---

## PROYECCIÓN DE IMPACTO

### Antes del Enrichment
| Métrica | Valor |
|---------|-------|
| Knowledge Store docs | 12 |
| Total líneas | 1,835 |
| Total tokens (est.) | ~31,000 |
| Evidencia citada | 0 papers |
| Corrective exercise | No existe |
| Brain fitness protocols | No existe |
| Muscle endocrine science | No existe |

### Después del Enrichment
| Métrica | Valor |
|---------|-------|
| Knowledge Store docs | **15** (+3 nuevos) |
| Total líneas | **~4,000** (+117%) |
| Total tokens (est.) | **~60,000** (+94%) |
| Evidencia citada | **~80-100 citations** |
| Sources coverage | PubMed + RP + ISSA (triple validación) |
| Correcciones aplicadas | 6/6 |
| Corrective exercise | ✅ ILAI + joint protocols |
| Brain fitness protocols | ✅ BDNF + cognitive assessment |
| Muscle endocrine science | ✅ Lyon thesis con ciencia |

### Impacto en Respuestas de Agentes

**ANTES (opinión curada):**
> "Necesitas entre 1.6 y 2.2g de proteína por kilo de peso."

**DESPUÉS (triple evidencia):**
> "La evidencia es clara: el plateau de síntesis de proteína muscular está en **1.62g/kg/día** (Morton 2018, meta-análisis de 49 estudios, n=1,863). En déficit calórico, sube a **2.3-3.1g/kg de masa libre de grasa** (Helms 2014). ISSA recomienda distribuir con al menos **1.6-1.8g de leucina por comida** para activar la vía mTOR. En la práctica, apunta a **2.0g/kg** como tu baseline — es el sweet spot entre la ciencia y la adherencia real."

---

## DEPENDENCIAS Y PRERREQUISITOS

### Para iniciar Sesión 1 (BATCH 1):
- [x] Extracciones completas (11,972 líneas)
- [x] Phase 2+3 plan existe
- [ ] Git commits pushed (usuario debe ejecutar desde terminal)
- [ ] Este plan aprobado por Aldo

### Para Sesión 4 (Upload):
- [ ] Gemini File Search API stores creados
- [ ] Env vars configuradas (GENESIS_STORE_ID, TRAIN_STORE_ID, etc.)
- [ ] BFF desplegado en Cloud Run (o local para testing)

---

## NOTAS SOBRE PHASE 2.5 (WEB RESEARCH)

Phase 2.5 (40 queries: Lyon, Attia, Huberman, Cavaliere) se **pospone** hasta después del enrichment por estas razones:

1. **Ya tenemos masa crítica:** 142 fuentes con triple validación son suficientes para Knowledge Stores de producción
2. **Prioridad es funcionalidad:** Los agentes necesitan Knowledge Stores enriquecidos AHORA
3. **Incremental es mejor:** Web research se puede agregar como "patches" a docs ya enriquecidos
4. **Menor riesgo:** Enriquecer con lo que tenemos es determinístico; web research tiene variabilidad

**Se ejecutará después de FASE E** como actualización incremental.

---

## RESUMEN EJECUTIVO

| Fase | Qué | Sesiones | Prioridad |
|------|-----|----------|-----------|
| A | Synthesis Matrix (este plan) | Esta sesión ✅ | P0 |
| B | Enrichment Batch 1 (4 docs core) | Sesión nueva 1 | P1 |
| B | Enrichment Batch 2 (4 docs recovery) | Sesión nueva 2 | P1 |
| B+C | Enrichment Batch 3 (3 docs + 3 nuevos) | Sesión nueva 3 | P1 |
| D | Correcciones (integradas en B) | Con cada batch | P1 |
| E | Upload + Verification | Sesión nueva 4 | P1 |
| 2.5 | Web Research (Lyon/Attia/Huberman) | Sesión futura | P2 |

**Tiempo estimado total: 4 sesiones de trabajo intensivo.**
**Resultado: GENESIS con el cerebro más completo y basado en evidencia del mercado.**
