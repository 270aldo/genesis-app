# GENESIS UI/UX — Observaciones para Fase de Refinamiento

> Documento de handoff: Sprints A/B/C completados. Estas son las observaciones de Aldo para el siguiente ciclo.

## Estado actual
- Sprint A ✅ (Onboarding + Animation Foundation + GenesisFAB)
- Sprint B ✅ (5 tabs polish — empty states, stagger, skeletons, animated counters)
- Sprint C ✅ (PR Celebration, Contextual Chat Pills, Water Tracker, Exercise Thumbnails, Timer Polish, Proactive Insight)

---

## Observaciones por pantalla

### 1. HOME (positivo — refinar)
- **GENESIS branding en card principal**: Cambiar color cyan/aqua de "GENESIS" → violeta o blanco. Cambiar tipografía o agregar efecto premium. Cambiar ícono actual por un agente/robot/androide (Aldo proporcionará SVG del androide original más adelante).
- **Notas del entrenador**: Agregar sección donde el coach Aldo pueda dejar notas o mensajes al usuario. Evaluar si HOME es el lugar correcto o si merece su propia sección.

### 2. TRAIN (mejora mayor necesaria)
- **Librería de ejercicios**: Desarrollar sección completa de librería — es INDISPENSABLE. Debe ser moderna, minimalista, con iconografía coherente y buena organización.
- **Inspiración**: Mejores fitness apps del mercado, pero alineado con el objetivo NGX: acompañar al usuario a completar su season junto con el entrenador Aldo (NGX HYBRID = IA + coach humano).
- **Cámara para equipamiento**: Recordar la funcionalidad de escanear máquinas de gym o equipamiento casero para recomendaciones en tiempo real (ya existe camera-scanner, pero necesita integración visible en Train).

### 3. FUEL (muy positivo — ajustes menores)
- **Botón de cámara**: Agregar acceso directo a cámara para registrar comidas (foto → reconocimiento IA) junto con opción de registro manual.
- **Animación**: La animación actual se ve buena pero puede ser aún mejor — refinar.

### 4. MIND (muy bueno — funcionalidad + visual)
- **Recovery Status**: Aclarar la mecánica — ¿cómo se monitorea? ¿Manual o automático? Cada área muscular debe ser clickeable → mini-sección con dashboard o visualización detallada por grupo muscular. Agregar iconografía que mejore la visualización.
- **BUG — Mood de Hoy**: Al dar clic en mood de hoy se abre un popup (bueno), pero NO permite agregar/seleccionar el nivel de mood. Verificar y corregir este bug.

### 5. TRACK (buen inicio — refinar)
- **Progress Photos / Gallery**: Los botones actuales necesitan ser más minimalistas y modernos. La iconografía y tipografía están bien, pero los botones de acción necesitan upgrade.

---

## Temas transversales

| Tema | Detalle |
|------|---------|
| **NGX HYBRID** | La app debe reflejar constantemente que es IA + Coach humano (Aldo). No es solo un bot. |
| **Librería de ejercicios** | Prioridad alta — sección de video moderna, minimalista, organizada |
| **Cámara dual-purpose** | En FUEL para comidas, en TRAIN para equipamiento |
| **Notas del coach** | Sección nueva para comunicación coach → usuario |
| **GENESIS androide** | SVG del androide original pendiente de Aldo |
| **Bug mood selector** | El popup se abre pero no registra la selección |

---

## Archivos de referencia existentes
- `PRD-UI-REDESIGN.md` — PRD original de Sprints A/B/C
- `GENESIS-UI-REDESIGN-PROPOSAL.html` — Propuesta visual interactiva
- `CLAUDE.md` — Contexto completo del proyecto
- `MASTER_PROMPT_UI_SPRINT_*.md` — Prompts de ejecución A/B/C (ya completados)

## Próximo paso
Abrir nueva conversación → cargar este archivo + screenshots → brainstorming con superpowers skill → nuevo PRD → ejecución
