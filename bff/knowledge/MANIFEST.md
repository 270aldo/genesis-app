# NGX Knowledge Store Manifest

## Versión: 1.0 | Última actualización: 2026-02-12

---

## Estructura de Knowledge Stores para Gemini File Search API

Este directorio contiene los documentos base para poblar los 5 Knowledge Stores del sistema GENESIS. Cada subdirectorio corresponde a un dominio de agente.

---

## Stores y Documentos

### 1. GENESIS Store (`genesis/`)
Documentos sobre la identidad, filosofía y voz de GENESIS.

| Archivo | Descripción | Tokens Est. | Para |
|---------|-------------|-------------|------|
| `ngx_philosophy_expanded.md` | Filosofía completa NGX, principios, anti-patrones, línea editorial | ~2,500 | Root agent + todos |
| `genesis_identity.md` | Voz, tono, protocolo de respuesta, frases | ~1,800 | Root agent |

### 2. TRAIN Store (`train/`)
Documentos sobre entrenamiento, ejercicios y periodización.

| Archivo | Descripción | Tokens Est. | Para |
|---------|-------------|-------------|------|
| `training_splits.md` | 3 splits completos (FB, UL, PPL), protocolos especiales, periodización por temporada | ~3,500 | Train agent |
| `exercise_database.md` | Base de datos Tier S/A con cues técnicos, SFR, correctivos | ~3,200 | Train agent |
| `periodization_progression.md` | Doble progresión, RIR/RPE, gestión de volumen, regla de estancamiento | ~2,800 | Train agent |

### 3. FUEL Store (`fuel/`)
Documentos sobre nutrición, proteína y suplementación.

| Archivo | Descripción | Tokens Est. | Para |
|---------|-------------|-------------|------|
| `protein_guidelines.md` | Guías de proteína, umbral de leucina, distribución, fuentes, mitos | ~2,200 | Fuel agent |
| `nutrition_protocols.md` | TDEE, macros, anti-inflamación, hidratación, anti-patrones | ~2,800 | Fuel agent |
| `supplementation.md` | Tier S/A/B, lo que sí y no recomendar | ~2,000 | Fuel agent |

### 4. MIND Store (`mind/`)
Documentos sobre sueño, estrés y recuperación.

| Archivo | Descripción | Tokens Est. | Para |
|---------|-------------|-------------|------|
| `sleep_architecture.md` | Ciencia del sueño, Regla 3-2-1, protocolos de luz, ambiente, suplementación | ~2,500 | Mind agent |
| `stress_recovery.md` | Jerarquía de recuperación, herramientas de estrés, termoterapia, biofeedback | ~2,400 | Mind agent |

### 5. TRACK Store (`track/`)
Documentos sobre evaluación, tracking y métricas.

| Archivo | Descripción | Tokens Est. | Para |
|---------|-------------|-------------|------|
| `assessment_protocols.md` | Clasificación de nivel, tests de movilidad/capacidad, perfil genético | ~2,600 | Track agent |
| `tracking_system.md` | Adherencia, PRs, composición corporal, biofeedback, dashboard | ~2,800 | Track agent |

---

## Totales

| Dominio | Archivos | Tokens Est. Total |
|---------|----------|-------------------|
| GENESIS | 2 | ~4,300 |
| TRAIN | 3 | ~9,500 |
| FUEL | 3 | ~7,000 |
| MIND | 2 | ~4,900 |
| TRACK | 2 | ~5,400 |
| **TOTAL** | **12** | **~31,100** |

---

## Línea Editorial

GENESIS tiene una posición editorial definida que guía todo el contenido:

- **Hipertrofia:** Mike Israetel / RP Strength (ciencia del volumen, RIR, periodización)
- **Longevidad:** Gabrielle Lyon / Peter Attia (músculo como órgano endocrino, Medicine 3.0)
- **Biomecánica:** Jeff Cavaliere / Squat University (seguridad articular, ROM completo)
- **Nutrición:** Gabrielle Lyon + Thomas DeLauer (proteína primero, anti-inflamación)
- **Neurociencia:** Andrew Huberman (protocolos basados en neurociencia, ritmo circadiano)

---

## Configuración de File Search API

### Chunking:
- Tokens por chunk: 512
- Overlap: 50 tokens
- Formato: Markdown con headers como delimitadores naturales

### Comandos de Upload (via manage_stores.py):

```bash
# Crear stores
python scripts/manage_stores.py create --domain genesis
python scripts/manage_stores.py create --domain train
python scripts/manage_stores.py create --domain fuel
python scripts/manage_stores.py create --domain mind
python scripts/manage_stores.py create --domain track

# Upload documentos
python scripts/manage_stores.py upload --domain genesis --file knowledge/genesis/ngx_philosophy_expanded.md
python scripts/manage_stores.py upload --domain genesis --file knowledge/genesis/genesis_identity.md

python scripts/manage_stores.py upload --domain train --file knowledge/train/training_splits.md
python scripts/manage_stores.py upload --domain train --file knowledge/train/exercise_database.md
python scripts/manage_stores.py upload --domain train --file knowledge/train/periodization_progression.md

python scripts/manage_stores.py upload --domain fuel --file knowledge/fuel/protein_guidelines.md
python scripts/manage_stores.py upload --domain fuel --file knowledge/fuel/nutrition_protocols.md
python scripts/manage_stores.py upload --domain fuel --file knowledge/fuel/supplementation.md

python scripts/manage_stores.py upload --domain mind --file knowledge/mind/sleep_architecture.md
python scripts/manage_stores.py upload --domain mind --file knowledge/mind/stress_recovery.md

python scripts/manage_stores.py upload --domain track --file knowledge/track/assessment_protocols.md
python scripts/manage_stores.py upload --domain track --file knowledge/track/tracking_system.md
```

### Verificación:
```bash
# Listar todos los stores
python scripts/manage_stores.py list

# Test queries por dominio
python scripts/manage_stores.py query --domain train --query "¿Cuál es el split recomendado para un intermedio?"
python scripts/manage_stores.py query --domain fuel --query "¿Cuánta proteína necesito para perder grasa?"
python scripts/manage_stores.py query --domain mind --query "¿Cuál es la Regla 3-2-1 del sueño?"
python scripts/manage_stores.py query --domain track --query "¿Cómo clasificar el nivel de un usuario nuevo?"
python scripts/manage_stores.py query --domain genesis --query "¿Cuál es el tono de voz de GENESIS?"
```
