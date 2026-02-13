# NGX GENESIS — Phase 2+3: Knowledge Store Evidence Enrichment

## Fecha: 2026-02-13 | Autor: Research Agent | Status: PROPUESTA

---

## SITUACIÓN ACTUAL

### Lo que tenemos:
- **3 Evidence Digests** completados (Phase 1 = 100%): 1,369 líneas, 47 queries, ~123 papers con PMIDs
- **12 Knowledge Store documents** en `bff/knowledge/` (1,835 líneas, ~31K tokens) — contenido basado en línea editorial
- **MANIFEST.md** con instrucciones de upload a Gemini File Search API
- **File Search wrapper** (`knowledge_tools.py`) funcional pero stores vacíos (Sprint 4 Track B pendiente)

### Lo que falta (según el protocolo):
- **Phase 2**: Síntesis por dominio — mapear hallazgos a documentos/secciones específicos
- **Phase 3**: Enriquecer cada documento con bloques `### Evidencia Científica`
- **Phase 4**: Crear documentos nuevos si la evidencia lo justifica
- **6 correcciones urgentes** donde la evidencia contradice posiciones actuales

---

## PROPUESTA: TAREA SIGUIENTE

### Nombre: "Evidence Integration Sprint"
### Objetivo: Transformar los 12 Knowledge Stores de opinión curada a evidencia citeable

---

## PLAN DE EJECUCIÓN (3 fases secuenciales)

### PASO 1: Mapping Matrix (Phase 2 del protocolo)
**Qué:** Crear una matriz de mapeo que conecte cada hallazgo de los 3 digests con el documento y sección exacta donde se integra.

**Output:** Tabla por documento con:

| Documento | Query | Hallazgo | Tipo | Acción |
|-----------|-------|----------|------|--------|
| `periodization_progression.md` §1 | T4 | Lengthened position +72% triceps hypertrophy | CONFIRMA | Reforzar con cita |
| `periodization_progression.md` §1 | T5 | Tempo irrelevante para hipertrofia | CONTRADICE | Reclasificar de "principio innegociable" a "preferencia práctica" |
| `periodization_progression.md` §5 | T7 | 1-week deload HURTS strength | CONTRADICE | Cambiar de 1 semana deload a reducción gradual |
| `nutrition_protocols.md` §4.1 | F8 | Seed oils NO causan inflamación (15 RCTs) | CONTRADICE | Reescribir sección completa |
| `supplementation.md` Tier S | F12 | Vitamina D efecto pequeño (SMD 0.17) | MATIZA | Reclasificar a Tier A |
| `assessment_protocols.md` §2 | K6 | FMS sensibilidad solo 24.7% | MATIZA | Agregar limitaciones + complementar con otros tests |

**Categorías de acción:**
- **CONFIRMA** → Agregar bloque `### Evidencia Científica` debajo de la recomendación existente
- **CONTRADICE** → Reescribir la recomendación + agregar evidencia del cambio
- **MATIZA** → Mantener recomendación pero agregar nota de limitación/contexto
- **NUEVO** → Hallazgo que no tiene sección existente → evaluar para Phase 4

---

### PASO 2: Document Enrichment (Phase 3 del protocolo)
**Qué:** Editar cada uno de los 12 documentos insertando bloques de evidencia estandarizados.

**Formato por bloque:**
```markdown
### Evidencia Científica
- **Hallazgo:** [Descripción clara del hallazgo]
- **Dato:** [Cifra específica con n= y contexto]
- **Fuente:** [Autor et al., Año, Journal]
- **Nivel:** [A = Meta/SR | B = RCT | C = Cohorte]
- **DOI:** [link]
```

**Formato para footer de documento:**
```markdown
---
## Notas de Evidencia
| Recomendación | Nivel | Fuente(s) |
|---------------|-------|-----------|
| Proteína 1.6-2.2g/kg | A | Morton 2018, Stokes 2018 |
| Full ROM > Parcial | A | Pedrosa 2022 (lengthened) |
| Excéntrica controlada 2-3s | C | Sin meta-análisis. Opinión experta. |
```

**6 correcciones activas a ejecutar:**

| # | Documento | Sección | Cambio |
|---|-----------|---------|--------|
| 1 | `nutrition_protocols.md` | §4.1 "Evitar Aceites de Semillas" | Reescribir: de "pro-inflamatorios" a "la evidencia de 15 RCTs no muestra efecto inflamatorio del ácido linoleico. Recomendación práctica: priorizar aceite de oliva por perfil nutriente superior, sin demonizar seed oils" |
| 2 | `periodization_progression.md` | §5 Fase 4 Deload | Cambiar de "Semana 12: DELOAD 50% volumen" a "Semanas 10-12: reducción gradual de volumen 30-40%. Nota: deloads de 1 semana completa pueden reducir fuerza (Pritchard 2015)" |
| 3 | `periodization_progression.md` | §1 "Control del Tempo" | Reclasificar de "Principio Innegociable" a "Preferencia Práctica". Mantener recomendación por seguridad, pero agregar: "Nota: el tempo excéntrico no muestra ventaja significativa para hipertrofia vs. tempo autoseleccionado (Schoenfeld 2015)" |
| 4 | `supplementation.md` | Tier S | Mover Vitamina D de Tier S a Tier A con nota: "Efecto músculo-esquelético pequeño (SMD 0.17). Relevante en deficiencia, menos impactante en niveles suficientes" |
| 5 | `assessment_protocols.md` | §2 | Agregar limitaciones de FMS: "Sensibilidad predictiva de solo 24.7% (Dorrel 2015). Usar como screen inicial, NO como predictor de lesión. Complementar con historial, carga de entrenamiento y biofeedback" |
| 6 | `tracking_system.md` | §2 | Agregar muscle power como métrica: "Potencia muscular (standing long jump, stair climb power) predice mortalidad HR 5.88-6.90, potencialmente más fuerte que fuerza sola (Araújo 2021)" |

---

### PASO 3: New Documents Assessment (Phase 4 del protocolo)
**Qué:** Evaluar si la evidencia justifica crear 1-4 documentos nuevos.

**Documentos candidatos:**

| Documento propuesto | Evidencia que lo soporta | Veredicto |
|---------------------|--------------------------|-----------|
| `muscle_endocrine_function.md` | G4 (glucosa 80% disposal), G5 (RT cognición SMD 0.55), miokinas | **SÍ** — Material suficiente para standalone |
| `aging_and_anabolic_resistance.md` | G1-G3 (sarcopenia HR 2.00, grip HR 1.16), proteína y envejecimiento | **QUIZÁ** — Podría ser sección nueva en `ngx_philosophy_expanded.md` |
| `hormonal_optimization.md` | M1 (sueño→T -22%), M7 (CWI→dopamina), sauna | **NO POR AHORA** — Fragmentado, mejor integrar en docs existentes |
| `injury_prevention_biomechanics.md` | K6 (FMS limitaciones), datos EMG | **NO POR AHORA** — Insuficiente evidencia primaria recolectada |

**Recomendación:** Crear solo `muscle_endocrine_function.md` como documento nuevo. Los demás se cubren mejor enriqueciendo los existentes.

---

## MAPEO COMPLETO: EVIDENCIA → DOCUMENTOS

### `ngx_philosophy_expanded.md` (8 inserciones)
- G1: Masa muscular y mortalidad (Srikanthan 2014, Li 2018)
- G2: Sarcopenia HR 2.00 (Zhang 2021)
- G3: Grip strength HR 1.16/5kg (Leong 2015 Lancet)
- G4: Músculo = 80% glucose disposal (DeFronzo 1981, confirmado Pesta 2017)
- G5: RT y cognición SMD 0.55 (Landrigan 2020)
- G6: RT ~60 min/week óptimo longevidad (Zhao 2020)
- K1: Fuerza y mortalidad (García-Hermoso 2018)
- K3: Composición corporal > peso (Prado 2018)

### `periodization_progression.md` (7 inserciones + 2 correcciones)
- T1: 10+ sets/week confirmado (Schoenfeld 2017)
- T2: RIR 1-2 = failure para hipertrofia (Refalo 2023)
- T4: Lengthened position +72% (Maeo 2023, Pedrosa 2022)
- T5: **CORRECCIÓN** — Tempo irrelevante (Schoenfeld 2015)
- T6: Progressive overload (Plotkin 2022)
- T7: **CORRECCIÓN** — Deload 1 semana reduce fuerza (Pritchard 2015)
- K5: Overload longitudinal como métrica (Peterson 2011)

### `training_splits.md` (2 inserciones)
- T3: 2x/week > 1x/week (Schoenfeld 2016)
- T8: EMG compuestos validado (Contreras 2020)

### `protein_guidelines.md` (4 inserciones)
- F1: Dosis óptima 1.62 g/kg/d plateau (Morton 2018)
- F2: Leucina 2.5-3g/comida (Churchward-Venne 2012)
- F3: Distribución 4 comidas > 2 (Mamerow 2014)
- F4: Seguridad renal confirmada (Devries 2018, 28 RCTs)

### `nutrition_protocols.md` (4 inserciones + 1 corrección)
- F5: Proteína en déficit 2.3-3.1 g/kg FFM (Helms 2014)
- F8: **CORRECCIÓN** — Seed oils NO inflamatorios (Jandacek 2017, 15 RCTs)
- F9: IF+RT preserva FFM (Moro 2016)
- F10: Post-meal walk -10-20% glucosa (Buffey 2022)
- F11: Mifflin-St Jeor 82% accuracy (Frankenfield 2005)

### `supplementation.md` (3 inserciones + 1 corrección)
- F6: Creatina muscular + cognitiva (Avgerinos 2018, Forbes 2022)
- F7: Omega-3 CRP ES -0.40 (Guo 2022)
- F12: **CORRECCIÓN** — Vitamina D efecto pequeño, mover a Tier A

### `sleep_architecture.md` (5 inserciones)
- M1: Sueño↓ → -18% MPS, -22% testosterone (Leproult 2011, Lamon 2021)
- M2: Sleep<6h = +29% injury risk (Milewski 2014)
- M3: Glymphatic clearance 60% más eficiente en sueño (Xie 2013)
- M4: Luz matutina ≥10,000 lux adelanta fase circadiana (Duffy 2009)
- M5: Luz azul -30min melatonina onset (Chang 2015)
- M12: Magnesio -17 min sleep onset (Abbasi 2012)

### `stress_recovery.md` (6 inserciones)
- M6: Sauna 4-7x/week = -63% SCD (Laukkanen 2015 JAMA)
- M7: CWI → +250% dopamine (Šrámek 2000)
- M8: CWI post-RT = -87% hypertrophy blunting (Roberts 2015)
- M9: HRV rMSSD como readiness predictor (Plews 2013)
- M10: NSDR (Yoga Nidra) → dopamine +65% (Kjaer 2002)
- M11: Cyclic sighing > box breathing (Balban 2023 Stanford)

### `tracking_system.md` (4 inserciones + 1 adición)
- K1: Fuerza y mortalidad (García-Hermoso 2018)
- K2: Cintura >102cm hombres = riesgo CV (Ross 2020 WHO)
- K3: Composición corporal > peso (Prado 2018)
- K4: Autonomía + social support predicen adherencia (Teixeira 2012)
- K5: **ADICIÓN** — Agregar muscle power como métrica (Araújo 2021)

### `assessment_protocols.md` (1 inserción + 1 corrección)
- K6: **CORRECCIÓN** — FMS sensibilidad 24.7% + limitaciones

### `exercise_database.md` (1 inserción)
- T8: EMG validation de ejercicios Tier S (Contreras 2020)

---

## CÓMO FUNCIONARÁ EN EL SISTEMA

### Flujo actual (Sprint 4 Track A):
```
User pregunta → BFF → Agent Router → L1/L2 cache check →
ADK Runner → Sub-agent (con build_system_prompt = ngx_philosophy + agent_prompt) →
search_knowledge(query, domain) → [FILE SEARCH STORES VACÍOS] → fallback
```

### Flujo después de este sprint:
```
User pregunta → BFF → Agent Router → L1/L2 cache check →
ADK Runner → Sub-agent (con build_system_prompt = ngx_philosophy + agent_prompt) →
search_knowledge(query, domain) →
Gemini File Search API consulta store enriquecido →
Devuelve chunks con EVIDENCIA CITEABLE →
Agent formula respuesta CON citas reales
```

### Ejemplo concreto:
**User:** "¿Cuánta proteína necesito para perder grasa?"
**Antes:** "Necesitas 1.6-2.2g/kg." (opinión curada sin fuente)
**Después:** "El consenso científico es 1.6g/kg como mínimo (Morton et al., 2018, meta-análisis de 49 estudios). En fase de déficit calórico, la evidencia apunta a subir a 2.3-3.1g/kg de masa libre de grasa para maximizar preservación muscular (Helms et al., 2014). Dato clave: el plateau de síntesis proteica muscular ocurre alrededor de 1.62g/kg/día — más proteína no genera más síntesis, pero sí ayuda en saciedad y termogénesis."

### Impacto en tokens:
| Componente | Antes | Después |
|-----------|-------|---------|
| Knowledge Stores | ~31,100 tokens (12 docs) | ~52,000-58,000 tokens (12-13 docs) |
| Evidence blocks | 0 | ~50-60 bloques de evidencia |
| Notas de Evidencia (footers) | 0 | 12 tablas de clasificación A/B/C |
| Papers referenciables | 0 | ~123 con DOI |

---

## ORDEN DE EJECUCIÓN PROPUESTO

| # | Tarea | Complejidad | Prioridad |
|---|-------|-------------|-----------|
| 1 | Mapeo detallado por documento (este doc es el mapa macro) | Baja — ya está arriba | ✅ HECHO |
| 2 | Enriquecer `ngx_philosophy_expanded.md` (8 inserciones) | Media | P1 — Es la tesis central |
| 3 | Enriquecer `protein_guidelines.md` (4) + `nutrition_protocols.md` (4+1 corrección) | Media-Alta | P1 — Incluye corrección seed oils |
| 4 | Enriquecer `periodization_progression.md` (7+2 correcciones) | Alta | P1 — 2 correcciones activas |
| 5 | Enriquecer `sleep_architecture.md` (5) + `stress_recovery.md` (6) | Media | P2 |
| 6 | Enriquecer `supplementation.md` (3+1) + `tracking_system.md` (4+1) | Media | P2 |
| 7 | Enriquecer `training_splits.md` (2) + `exercise_database.md` (1) + `assessment_protocols.md` (1+1) | Baja | P3 |
| 8 | Crear `muscle_endocrine_function.md` (nuevo) | Media | P3 |
| 9 | Actualizar `MANIFEST.md` con totales nuevos | Baja | P3 |
| 10 | Verificar consistencia cross-document | Baja | FINAL |

**Tiempo estimado total: 3-4 horas de edición asistida.**

---

## DECISIÓN REQUERIDA

¿Procedemos con la ejecución de los pasos 2-10 en orden?

La propuesta es ejecutar como "parallel agents" donde sea posible:
- **Batch 1 (P1):** `ngx_philosophy_expanded.md` + `protein_guidelines.md` + `nutrition_protocols.md` + `periodization_progression.md`
- **Batch 2 (P2):** `sleep_architecture.md` + `stress_recovery.md` + `supplementation.md` + `tracking_system.md`
- **Batch 3 (P3):** `training_splits.md` + `exercise_database.md` + `assessment_protocols.md` + nuevo `muscle_endocrine_function.md` + MANIFEST update
- **Batch 4 (FINAL):** Verificación de consistencia cross-document
