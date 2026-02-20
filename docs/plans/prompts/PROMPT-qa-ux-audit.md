# GENESIS Pre-Production QA + UX Audit — Claude Code Prompt

## INSTRUCCIÓN: Copia todo el contenido debajo de la línea hasta el final del archivo y pégalo como prompt en Claude Code.

---

## CONTEXTO
Soy Aldo, CEO de NGX. GENESIS es nuestra app de Performance & Longevity (Expo + FastAPI BFF + ADK agents). Estamos en Sprint 4 Track B cerrado — 20 pantallas, 5 agentes ADK, 15 docs en knowledge store, todo el stack funcionando.

Necesito ejecutar un QA + UX Audit completo ANTES de ir a producción. El plan detallado está en `docs/plans/2026-02-13-pre-production-qa-ux-audit.md` — LÉELO PRIMERO.

## LEE PRIMERO (en este orden)
1. `CLAUDE.md` — contexto completo del proyecto, tech stack, estructura
2. `docs/plans/2026-02-13-pre-production-qa-ux-audit.md` — el plan de 3 capas que vas a ejecutar

## ESTRATEGIA DE EJECUCIÓN

### Fase -1: Prerequisitos (OBLIGATORIO antes de todo)
Antes de cualquier testing, verifica y ejecuta en orden:
1. **BFF corriendo**: `cd bff && uvicorn main:app --reload` (debe responder en localhost:8000/health)
2. **Knowledge Stores poblados**: Ejecuta `cd bff && python scripts/upload_knowledge_stores.py --step all` — esto crea 5 Gemini File Search stores, sube 15 docs, y verifica con queries de prueba. Los store IDs se guardan en `.env.stores`. Copia esos IDs a tu `.env` del BFF (variables FILESEARCH_STORE_GENESIS, FILESEARCH_STORE_TRAIN, etc.)
3. **Reinicia el BFF** después de actualizar `.env` para que tome los nuevos store IDs
4. **Verifica**: `curl localhost:8000/health` — el campo `knowledge_stores` debe mostrar TODOS los dominios en `true`
5. **App Expo corriendo en simulador**: `npm start` → presiona 'i' para iOS

Si los knowledge stores ya están poblados (health muestra todos en true), salta al paso 3.

### Fase 0: Setup (paralelo)
Usa 3 subagentes en paralelo:
- **Agente 1**: Instalar Maestro CLI + crear directorio `e2e/flows/` + escribir los 8 flujos YAML + el helper de login. Los flujos están definidos en el plan — créalos tal cual.
- **Agente 2**: Crear la estructura `docs/qa/` con los templates vacíos: `ux-audit-scorecard.md`, `intelligence-audit-results.md`, `bug-report.md`, `pre-production-verdict.md`
- **Agente 3**: Verificar que la app compila (`npm start`), que el BFF arranca (`cd bff && uvicorn main:app --reload`), y que el simulador iOS está disponible

### Fase 1: Maestro E2E (secuencial)
1. Asegúrate de que la app está corriendo en el simulador iOS
2. Ejecuta `maestro test e2e/flows/ --format junit` para correr los 8 flujos
3. Si algún flujo falla, documenta el error EXACTO en `docs/qa/bug-report.md` con:
   - Flujo que falló
   - Screenshot del punto de fallo
   - Error message
   - Severidad estimada (P0 = blocker, P1 = critical, P2 = major, P3 = minor)
4. No intentes fixear bugs — solo documenta

### Fase 2: UX Audit (guiado, interactivo)
Esto lo hago YO (Aldo) con tu guía. Tu rol:
1. Dame las instrucciones pantalla por pantalla usando la plantilla de heurísticas del plan
2. Yo navego en el simulador y te doy mis scores + observaciones
3. Tú registras todo en `docs/qa/ux-audit-scorecard.md`
4. Después de cada pantalla, calcula el promedio parcial

Orden de evaluación:
1. Login → Onboarding (auth flow)
2. Home (dashboard)
3. Train (plan + workout activo)
4. Fuel (nutrition + water)
5. Mind (wellness + check-in)
6. Track (stats + photos + strength)
7. GENESIS Chat (AI conversation)
8. Camera Scanner
9. Voice Call
10. Exercise Library + Education

### Fase 3: Intelligence Audit (secuencial)
Las 15 preguntas están en el plan. Para cada una:
1. Envía la pregunta al BFF via curl o directamente desde la app
2. Evalúa la respuesta contra los criterios ✅/❌ del plan
3. Registra en `docs/qa/intelligence-audit-results.md`:
   - Pregunta
   - Respuesta recibida (resumida)
   - Veredicto: PASS / FAIL / PARTIAL
   - Notas

### Fase 4: Consolidación (1 agente)
1. Cuenta los resultados de las 3 capas
2. Aplica los criterios de Go/No-Go del plan
3. Escribe el veredicto final en `docs/qa/pre-production-verdict.md`
4. Lista de bugs priorizados en `docs/qa/bug-report.md`
5. Commit todo a git con message: "QA: Pre-production audit — [GO/NO-GO]"

## REGLAS DE CONTEXTO
- NO leas archivos de código fuente a menos que un bug lo requiera
- Usa subagentes para tareas paralelas (setup, creación de archivos)
- Mantén el foco en TESTING, no en development
- Si necesitas ver el código de una pantalla específica para entender un bug, lee SOLO ese archivo
- El CLAUDE.md tiene toda la arquitectura — no necesitas explorar
- Si Maestro no está disponible o falla la instalación, haz fallback a una checklist manual interactiva

## VARIABLES DE ENTORNO NECESARIAS
```bash
# Para Maestro
export TEST_EMAIL="aldo@ngx.com"
export TEST_PASSWORD="tu-password-de-test"

# Para BFF (si no está ya corriendo)
export EXPO_PUBLIC_BFF_URL="http://localhost:8000"
```

## RESULTADO ESPERADO
Al terminar tendremos:
- 8 flujos Maestro E2E escritos y ejecutados
- Scorecard de UX por pantalla con promedio general
- 15 preguntas de inteligencia evaluadas
- Lista de bugs priorizada
- Veredicto GO/NO-GO para TestFlight
- Todo commiteado en `docs/qa/`
