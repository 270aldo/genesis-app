# PROMPT PARA NUEVA SESIÓN: Research Protocol — Tier 1 Fundamentals

Copia y pega esto en una nueva conversación de Cowork con la carpeta genesis-app montada:

---

## CONTEXTO

Soy Aldo, CEO de NGX. Estamos en Sprint 4 "Cerebro" de GENESIS, nuestra app de Performance & Longevity.

**Lo que ya existe:**
- 12 documentos de conocimiento en `bff/knowledge/` organizados en 5 dominios (genesis, train, fuel, mind, track) — ~2,000 líneas de contenido curado basado en nuestra línea editorial (Israetel, Lyon, Attia, Huberman, DeLauer).
- Un Research Protocol completo en `docs/plans/2026-02-13-research-protocol.md` con 48 queries PubMed priorizadas en 3 tiers.
- Un MANIFEST.md en `bff/knowledge/MANIFEST.md` con la estructura y comandos de upload.

**Lo que necesito en esta sesión:**
Ejecutar la **Fase de Investigación Tier 1** — los 12 queries fundamentales que respaldan las tesis centrales de NGX.

## QUERIES TIER 1 (Ejecutar con PubMed)

### GENESIS — Músculo y Longevidad (3 queries)
1. `skeletal muscle mass AND mortality AND meta-analysis[Publication Type]`
2. `sarcopenia AND all-cause mortality AND systematic review[Publication Type]`
3. `grip strength AND mortality AND prospective cohort`

### FUEL — Proteína y Síntesis Muscular (3 queries)
4. `protein intake AND muscle protein synthesis AND dose-response AND meta-analysis`
5. `leucine threshold AND muscle protein synthesis AND meal`
6. `protein distribution AND muscle protein synthesis AND per meal`

### MIND — Sueño y Hormonas (2 queries)
7. `sleep deprivation AND testosterone AND growth hormone`
8. `sleep duration AND muscle recovery AND resistance training`

### TRAIN — Volumen, Frecuencia y RIR (4 queries)
9. `resistance training volume AND hypertrophy AND dose-response AND meta-analysis`
10. `training to failure AND hypertrophy AND repetitions in reserve`
11. `muscle training frequency AND hypertrophy AND meta-analysis`
12. `range of motion AND muscle hypertrophy AND lengthened position`

## INSTRUCCIONES DE EJECUCIÓN

Para cada query:
1. Buscar en PubMed (priorizar: Meta-análisis > Systematic Review > RCT > Cohorte).
2. Seleccionar los 2-3 papers más relevantes.
3. Obtener metadata completa (título, autores, año, journal, DOI, PMID).
4. Extraer: hallazgo clave + dato duro + nivel de evidencia (A/B/C).
5. Cuando sea posible, obtener el full text de PMC para extraer datos específicos.

## ENTREGABLE

Crear un archivo `bff/knowledge/evidence/tier1_evidence_digest.md` con:
- Cada query documentada con sus papers encontrados.
- Formato estándar por hallazgo:
```
### [Tema]
- **Hallazgo:** [1-2 frases]
- **Dato:** [cifra específica]
- **Fuente:** Autor et al., Año, Journal
- **PMID:** [número]
- **DOI:** [link]
- **Nivel:** A (Meta-análisis) / B (RCT) / C (Cohorte)
```

Después de completar el digest, **integrar los hallazgos en los 12 documentos de conocimiento existentes** en `bff/knowledge/`. Agregar secciones de "Evidencia Científica" donde corresponda dentro del contenido existente, NO como apéndice separado — que fluya naturalmente.

## REGLA IMPORTANTE SOBRE CITAS EN GENESIS

GENESIS NO cita estudios en cada respuesta. La evidencia se usa estratégicamente:
- **Sí citar** cuando: el usuario cuestiona una recomendación, pide "por qué", quiere datos específicos, o es una afirmación contraintuitiva.
- **No citar** cuando: da una recomendación rutinaria, responde una pregunta simple, o el contexto es conversacional.
- **Formato natural:** "La evidencia muestra que..." o "Un meta-análisis de 2018 con 49 estudios encontró que..." — nunca formato académico con paréntesis tipo "(Morton et al., 2018)".

La evidencia está ahí para respaldar, no para exhibir. Verdad directa, no clase universitaria.

## LÍNEA EDITORIAL (Recordatorio)
- Hipertrofia: Mike Israetel / RP Strength
- Longevidad: Gabrielle Lyon / Peter Attia
- Biomecánica: Jeff Cavaliere / Squat University
- Nutrición: Lyon + Thomas DeLauer
- Neurociencia: Andrew Huberman

Si la evidencia contradice nuestra línea, lo documentamos honestamente y ajustamos si es necesario.
