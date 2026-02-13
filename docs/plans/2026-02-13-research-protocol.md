# NGX GENESIS — Research Protocol: Evidence-Based Knowledge Enrichment

## Versión: 1.0 | Fecha: 2026-02-13
## Objetivo: Transformar los Knowledge Stores de "opinión curada de expertos" a "sistema respaldado por evidencia científica primaria"

---

## 1. VISIÓN ESTRATÉGICA

### El Problema
Los 12 documentos de conocimiento actuales (~2,000 líneas) están basados en la "línea editorial" de NGX: Israetel, Lyon, Attia, Huberman, DeLauer. Esta es una base excelente, pero:
- Son interpretaciones de terceros (divulgadores), no evidencia primaria.
- GENESIS no puede citar estudios específicos cuando un usuario cuestiona una recomendación.
- Competidores con IA pueden recitar las mismas recomendaciones genéricas.

### La Solución
Enriquecer cada documento con **evidencia primaria de PubMed** — meta-análisis, ensayos controlados, revisiones sistemáticas — para que GENESIS pueda:
1. Citar estudios específicos cuando responde ("Un meta-análisis de 2023 con 1,800 participantes encontró que...").
2. Dar dosis-respuesta precisas basadas en datos reales.
3. Diferenciar entre "consenso fuerte", "evidencia moderada" y "recomendación práctica sin evidencia sólida".
4. Posicionar NGX como la plataforma de fitness con el mayor rigor científico del mercado hispanohablante.

### El Resultado Esperado
De cada búsqueda extraemos:
- **Hallazgo clave** (1-2 frases).
- **Cifra/dato duro** (ej. "reducción del 23% en mortalidad por todas las causas").
- **Referencia citeable** (Autor, Año, Journal, DOI).
- **Nivel de evidencia** (Meta-análisis > RCT > Cohorte > Opinión experta).

---

## 2. LÍNEAS DE INVESTIGACIÓN POR DOMINIO

### 2.1 DOMINIO GENESIS — Muscle-Centric Medicine & Longevity

**Tesis a respaldar:** "El músculo esquelético es el órgano de la longevidad."

| # | Query PubMed | Tipo de evidencia buscada | Integración |
|---|-------------|--------------------------|-------------|
| G1 | `skeletal muscle mass[Title] AND mortality[Title] AND meta-analysis[Publication Type]` | Meta-análisis: masa muscular como predictor de mortalidad | `ngx_philosophy_expanded.md` — Sección 2 |
| G2 | `sarcopenia AND all-cause mortality AND systematic review[Publication Type]` | Revisiones sistemáticas sobre sarcopenia y mortalidad | `ngx_philosophy_expanded.md` — Sección 2 |
| G3 | `grip strength AND mortality AND prospective cohort` | Estudios de cohorte: fuerza de agarre como predictor | `ngx_philosophy_expanded.md` — Sección 2 |
| G4 | `muscle mass AND insulin sensitivity AND glucose disposal` | Músculo como sumidero de glucosa | `ngx_philosophy_expanded.md` — Sección 2 |
| G5 | `resistance training AND cognitive function AND aging AND meta-analysis` | Entrenamiento de fuerza y función cognitiva | `ngx_philosophy_expanded.md` — Sección 2 |
| G6 | `exercise AND longevity AND dose-response AND prospective` | Dosis-respuesta de ejercicio en longevidad | `ngx_philosophy_expanded.md` — Sección 8 |

**Estudios clave que probablemente encontraremos:**
- Srikanthan & Karlamangla (2014) — Muscle mass index and mortality in older adults.
- Leong et al. (2015, Lancet) — Grip strength as mortality predictor across 17 countries.
- Li et al. (2018) — Meta-analysis of sarcopenia and mortality.

---

### 2.2 DOMINIO TRAIN — Hipertrofia, Volumen y Periodización

**Tesis a respaldar:** "RIR 2-3, doble progresión, Full ROM, 10-20 sets/muscle/week."

| # | Query PubMed | Tipo de evidencia buscada | Integración |
|---|-------------|--------------------------|-------------|
| T1 | `resistance training volume AND hypertrophy AND dose-response AND meta-analysis` | Meta-análisis: relación volumen-hipertrofia | `periodization_progression.md` — Sección 4 |
| T2 | `training to failure AND hypertrophy AND repetitions in reserve` | RIR vs. fallo muscular en hipertrofia | `periodization_progression.md` — Sección 3 |
| T3 | `muscle training frequency AND hypertrophy AND meta-analysis` | Frecuencia óptima (2x/semana vs. 1x) | `training_splits.md` — Sección 1 |
| T4 | `range of motion AND muscle hypertrophy AND lengthened position` | Full ROM y posición estirada en hipertrofia | `periodization_progression.md` — Sección 1 |
| T5 | `eccentric tempo AND muscle growth AND controlled` | Tempo excéntrico controlado y crecimiento | `periodization_progression.md` — Sección 1 |
| T6 | `progressive overload AND long-term AND strength gains` | Sobrecarga progresiva a largo plazo | `periodization_progression.md` — Sección 2 |
| T7 | `deload week AND performance AND supercompensation` | Evidencia del deload | `periodization_progression.md` — Sección 5 |
| T8 | `compound exercises AND muscle activation AND electromyography` | EMG de ejercicios compuestos (validar Tier S) | `exercise_database.md` |

**Estudios clave esperados:**
- Schoenfeld et al. (2017) — Dose-response relationship between weekly RT volume and muscle hypertrophy.
- Schoenfeld et al. (2016) — Effects of training frequency on muscle hypertrophy.
- Refalo et al. (2023) — Proximity to failure and hypertrophy.
- Pedrosa et al. (2022) — Training at long muscle lengths for hypertrophy.

---

### 2.3 DOMINIO FUEL — Proteína, Nutrición y Metabolismo

**Tesis a respaldar:** "1.6-2.2g/kg proteína, umbral de leucina 30-50g/comida, proteína > todo."

| # | Query PubMed | Tipo de evidencia buscada | Integración |
|---|-------------|--------------------------|-------------|
| F1 | `protein intake AND muscle protein synthesis AND dose-response AND meta-analysis` | Meta-análisis: dosis óptima de proteína | `protein_guidelines.md` — Sección 2 |
| F2 | `leucine threshold AND muscle protein synthesis AND meal` | Umbral de leucina por comida | `protein_guidelines.md` — Sección 3 |
| F3 | `protein distribution AND muscle protein synthesis AND per meal` | Distribución de proteína a lo largo del día | `protein_guidelines.md` — Sección 4 |
| F4 | `high protein diet AND kidney function AND healthy adults AND meta-analysis` | Seguridad renal de proteína alta | `protein_guidelines.md` — Sección 6 |
| F5 | `protein AND caloric deficit AND lean mass preservation` | Proteína alta durante déficit calórico | `nutrition_protocols.md` — Sección 2 |
| F6 | `creatine monohydrate AND muscle AND cognitive AND meta-analysis` | Meta-análisis de creatina (muscular + cognitiva) | `supplementation.md` — Sección Tier S |
| F7 | `omega-3 AND inflammation AND systematic review` | Omega-3 y reducción de inflamación sistémica | `supplementation.md` — Sección Tier S |
| F8 | `seed oils AND inflammation AND oxidized linoleic acid` | Aceites de semillas e inflamación (evidencia real) | `nutrition_protocols.md` — Sección 4 |
| F9 | `intermittent fasting AND muscle mass AND resistance training` | Ayuno intermitente y masa muscular con entrenamiento | `nutrition_protocols.md` — Sección 4 |
| F10 | `post-meal walking AND glucose AND glycemic control` | Caminata post-comida y control glucémico | `nutrition_protocols.md` — Sección 4 |
| F11 | `Mifflin-St Jeor AND resting metabolic rate AND accuracy` | Validación de fórmula Mifflin-St Jeor | `nutrition_protocols.md` — Sección 2 |
| F12 | `vitamin D AND muscle function AND supplementation AND meta-analysis` | Vitamina D y función muscular | `supplementation.md` — Sección Tier S |

**Estudios clave esperados:**
- Morton et al. (2018, BJSM) — Systematic review of protein and muscle hypertrophy.
- Moore et al. (2009) — Ingested protein dose response of MPS.
- Devries & Phillips (2015) — Supplemental protein in support of muscle mass.
- Rawson & Venezia (2011) — Creatine and cognitive function.

---

### 2.4 DOMINIO MIND — Sueño, Estrés y Recuperación

**Tesis a respaldar:** "El sueño es el esteroide natural. 7-9 horas. Regla 3-2-1."

| # | Query PubMed | Tipo de evidencia buscada | Integración |
|---|-------------|--------------------------|-------------|
| M1 | `sleep deprivation AND testosterone AND growth hormone` | Privación de sueño y hormonas anabólicas | `sleep_architecture.md` — Sección 1 |
| M2 | `sleep duration AND muscle recovery AND resistance training` | Sueño y recuperación muscular post-entreno | `sleep_architecture.md` — Sección 1 |
| M3 | `glymphatic system AND sleep AND brain clearance` | Sistema glinfático y limpieza cerebral durante sueño | `sleep_architecture.md` — Sección 1 |
| M4 | `morning light exposure AND circadian rhythm AND cortisol` | Luz matutina y ritmo circadiano | `sleep_architecture.md` — Sección 3 |
| M5 | `blue light AND melatonin suppression AND sleep quality` | Luz azul y supresión de melatonina | `sleep_architecture.md` — Sección 3 |
| M6 | `sauna AND cardiovascular AND mortality AND Finnish` | Sauna y riesgo cardiovascular (estudio finlandés) | `stress_recovery.md` — Sección 4 |
| M7 | `cold water immersion AND dopamine AND norepinephrine` | Exposición al frío y neurotransmisores | `stress_recovery.md` — Sección 4 |
| M8 | `cold water immersion AND hypertrophy AND blunting AND post-exercise` | Frío post-entreno y blunting de hipertrofia | `stress_recovery.md` — Sección 4 |
| M9 | `heart rate variability AND training readiness AND recovery` | HRV como indicador de recuperación | `stress_recovery.md` — Sección 5 |
| M10 | `non-sleep deep rest AND dopamine AND yoga nidra` | NSDR y restauración de dopamina | `stress_recovery.md` — Sección 3 |
| M11 | `physiological sigh AND stress reduction AND breathing` | Suspiro fisiológico y estrés | `stress_recovery.md` — Sección 3 |
| M12 | `magnesium supplementation AND sleep quality AND meta-analysis` | Magnesio y calidad de sueño | `sleep_architecture.md` — Sección 5 |

**Estudios clave esperados:**
- Leproult & Van Cauter (2011, JAMA) — Sleep loss and testosterone.
- Laukkanen et al. (2015, JAMA Internal Medicine) — Sauna bathing and mortality.
- Šrámek et al. (2000) — Cold water immersion and catecholamines.
- Roberts et al. (2015) — Cold water immersion attenuates muscle hypertrophy.

---

### 2.5 DOMINIO TRACK — Métricas, Assessment y Biofeedback

**Tesis a respaldar:** "Adherencia > todo. Fuerza relativa predice longevidad."

| # | Query PubMed | Tipo de evidencia buscada | Integración |
|---|-------------|--------------------------|-------------|
| K1 | `muscular strength AND mortality AND meta-analysis` | Fuerza muscular como predictor de mortalidad | `tracking_system.md` — Sección 2 |
| K2 | `waist circumference AND visceral fat AND cardiovascular risk` | Cintura como indicador de riesgo | `tracking_system.md` — Sección 4 |
| K3 | `body composition AND body weight AND health outcomes` | Composición corporal vs. peso en báscula | `tracking_system.md` — Sección 4 |
| K4 | `exercise adherence AND long-term AND predictors` | Factores que predicen adherencia al ejercicio | `tracking_system.md` — Sección 1 |
| K5 | `progressive overload AND muscle adaptation AND longitudinal` | Sobrecarga progresiva como indicador de adaptación | `tracking_system.md` — Sección 2 |
| K6 | `functional movement screen AND injury prediction` | Evaluación funcional y predicción de lesiones | `assessment_protocols.md` — Sección 2 |

---

## 3. PROTOCOLO DE EJECUCIÓN

### Fase 1: Búsqueda Sistemática (PubMed)
**Tiempo estimado:** 2-3 horas.

Para cada query (48 total):
1. Ejecutar búsqueda en PubMed con filtros: Meta-analysis, Systematic Review, RCT (prioridad en ese orden).
2. Seleccionar los 2-3 artículos más relevantes por query.
3. Obtener metadata (título, autores, año, journal, DOI, PMID).
4. Extraer hallazgo clave + dato duro.
5. Clasificar nivel de evidencia (A = Meta/SR, B = RCT, C = Cohorte/Observacional).

### Fase 2: Síntesis por Dominio
**Tiempo estimado:** 2-3 horas.

1. Crear un archivo `evidence_digest.md` por dominio con todos los hallazgos.
2. Mapear cada hallazgo al documento y sección donde se integra.
3. Identificar: ¿Alguna de nuestras recomendaciones actuales NO tiene evidencia sólida? → Marcar como "Recomendación práctica / Opinión experta".

### Fase 3: Enriquecimiento de Documentos
**Tiempo estimado:** 2-3 horas.

1. Insertar secciones de "Evidencia" en cada documento de conocimiento.
2. Agregar formato estándar:
```
### Evidencia Científica
- **Hallazgo:** [Descripción del hallazgo]
- **Dato:** [Cifra específica]
- **Fuente:** [Autor et al., Año, Journal]
- **Nivel:** [A/B/C]
- **DOI:** [link]
```
3. Agregar sección "Notas de Evidencia" al final de cada documento indicando qué recomendaciones tienen nivel A vs. C.

### Fase 4: Documentos Nuevos (Si la evidencia lo justifica)
Posibles documentos adicionales que la investigación podría generar:
- `muscle_endocrine_function.md` — El músculo como órgano endocrino (miokinas, BDNF, IL-6).
- `aging_and_anabolic_resistance.md` — Por qué los adultos mayores necesitan más proteína.
- `hormonal_optimization.md` — Testosterona, cortisol, GH: lo que funciona y lo que no.
- `injury_prevention_biomechanics.md` — Evidencia de patrones seguros de movimiento.

---

## 4. CRITERIOS DE CALIDAD

### Incluimos:
- Meta-análisis y revisiones sistemáticas publicadas en journals indexados (impacto > 3.0).
- RCTs con grupo control, doble ciego preferido.
- Estudios de cohorte prospectivos (>1,000 participantes).
- Papers publicados después de 2010 (preferencia por 2018+).

### Excluimos:
- Estudios en animales (excepto para mecanismos que no tienen evidencia humana).
- Estudios con <20 participantes.
- Pre-prints no revisados por pares.
- Estudios financiados por la industria de suplementos sin replicación independiente.

### Manejo de Contradicciones:
Si la evidencia contradice nuestra recomendación actual:
1. Documentar la contradicción honestamente.
2. Revisar si el balance de evidencia favorece nuestra posición o la contraria.
3. Ajustar la recomendación si la evidencia es fuerte.
4. Si es ambiguo, marcar como "Evidencia mixta — NGX recomienda [X] basado en [razón]".

---

## 5. PRIORIZACIÓN

### Tier 1 — Investigar PRIMERO (Fundamentos de la tesis NGX)
Estos respaldan las afirmaciones centrales que todo lo demás depende:
- G1-G3: Músculo y mortalidad (la tesis entera)
- F1-F3: Proteína y síntesis muscular (la prioridad nutricional)
- M1-M2: Sueño y hormonas (el pilar de recuperación)
- T1-T3: Volumen, frecuencia y RIR (la metodología de entrenamiento)

### Tier 2 — Investigar DESPUÉS (Optimización)
- T4-T8: ROM, tempo, ejercicios específicos
- F4-F7: Seguridad renal, creatina, omega-3
- M3-M8: Glinfático, luz, sauna, frío
- K1-K3: Métricas de tracking

### Tier 3 — Si hay tiempo (Diferenciadores)
- F8-F12: Aceites, ayuno, caminata, Mifflin, vitamina D
- M9-M12: HRV, NSDR, physiological sigh, magnesio
- K4-K6: Adherencia, progressive overload, FMS
- G4-G6: Insulina, cognición, dosis-respuesta

---

## 6. ENTREGABLES FINALES

Al completar este protocolo, cada Knowledge Store tendrá:

| Componente | Antes | Después |
|-----------|-------|---------|
| Base | Opinión curada de expertos | Opinión + evidencia primaria citada |
| Citas | 0 papers | ~80-100 papers referenciados |
| Datos duros | Generales ("1.6-2.2g/kg") | Con fuente ("Morton et al., 2018, BJSM") |
| Nivel de confianza | Implícito | Explícito (A/B/C por recomendación) |
| Documentos | 12 | 12-16 (posibles adiciones) |
| Líneas totales | ~2,000 | ~4,000-5,000 |

### Lo que GENESIS podrá hacer después:
1. "Según un meta-análisis de 2018 con 49 estudios y 1,863 participantes, la dosis óptima de proteína para hipertrofia es..."
2. "La evidencia de nivel A muestra que entrenar cada músculo 2x/semana es superior a 1x/semana para hipertrofia."
3. "La recomendación de evitar frío post-entreno se basa en un RCT de Roberts et al. (2015) que mostró..."
4. Distinguir entre: "Esto tiene evidencia sólida" vs. "Esto es una recomendación práctica basada en experiencia clínica."

---

## 7. HERRAMIENTAS DISPONIBLES

| Herramienta | Uso | Acceso |
|-------------|-----|--------|
| **PubMed Search** | Búsqueda de artículos por query | MCP connector (search_articles) |
| **PubMed Metadata** | Títulos, autores, DOI, abstracts | MCP connector (get_article_metadata) |
| **PubMed Full Text** | Texto completo (si disponible en PMC) | MCP connector (get_full_text_article) |
| **PubMed Related** | Artículos relacionados a un PMID | MCP connector (find_related_articles) |
| **PubMed ID Convert** | Convertir PMID → DOI → PMCID | MCP connector (convert_article_ids) |
| **Web Search** | Papers que no están en PubMed (sports science journals) | WebSearch tool |

---

## 8. TIMELINE PROPUESTO

| Sesión | Foco | Queries | Tiempo Est. |
|--------|------|---------|-------------|
| Sesión A | Tier 1: Fundamentos (G1-G3, F1-F3, M1-M2, T1-T3) | 12 queries | 3-4 hrs |
| Sesión B | Tier 2: Optimización (T4-T8, F4-F7, M3-M8, K1-K3) | 19 queries | 3-4 hrs |
| Sesión C | Tier 3: Diferenciadores + Enriquecimiento de docs | 17 queries + edición | 3-4 hrs |
| Sesión D | Validación + Upload a File Search Stores | Verificación + deploy | 2-3 hrs |

**Total: 4 sesiones, ~12-15 horas de trabajo asistido.**

---

## 9. NOTA SOBRE LA LÍNEA EDITORIAL

Este protocolo de investigación sigue la línea editorial de NGX:

- **Hipertrofia:** Buscamos evidencia que respalde la línea RP Strength (Israetel). Si la evidencia contradice, lo documentamos honestamente.
- **Longevidad:** Buscamos evidencia que respalde la línea Lyon/Attia. El músculo como órgano endocrino.
- **Biomecánica:** Buscamos evidencia EMG y biomecánica que respalde la selección Tier S.
- **Nutrición:** Buscamos evidencia que respalde proteína alta y anti-inflamación.
- **Neurociencia:** Buscamos evidencia que respalde protocolos Huberman.

**Principio:** No buscamos confirmar lo que creemos. Buscamos la mejor evidencia disponible y ajustamos si es necesario. Eso ES verdad directa.
