# Prompt para siguiente sesión — Claude Code

Copia y pega esto en Claude Code desde el directorio `genesis-app/`:

---

```
Lee CLAUDE.md y docs/active/SESSION_NEXT_STEPS.md para contexto completo.

## Situación
Estamos en branch `feat/visual-refinement-v2` (3 commits sin push). La app GENESIS migró de tabs a chat-first UI con LiquidGlass design system. Todo el frontend del chat está construido pero NUNCA se ha probado con el BFF real — hasta ahora usábamos mock responses que ya eliminamos.

## Lo que necesito AHORA (en este orden)

### 1. Push pendiente
Push `feat/visual-refinement-v2` a origin.

### 2. Arrancar BFF y verificar health
```bash
cd bff && uvicorn main:app --reload --port 8000
curl http://localhost:8000/health
```

### 3. Probar el chat flow completo
Arranca Expo (`npx expo start`), abre la app en simulator, y verifica:
- Chat envía a `/mobile/chat` y recibe respuesta real de Gemini
- AgentThinkingBlock aparece durante el procesamiento
- Widgets se renderizan desde respuestas reales del agente
- StarterActions envían prompts que los agentes entienden

### 4. Fixear lo que falle
El chat NO ha sido testeado con el BFF real. Espero bugs en:
- Parsing de respuestas del BFF (formato, widgets, metadata)
- Auth flow (JWT token, refresh)
- Error handling (timeouts, network errors)
- Widget rendering con datos reales vs hardcodeados

### 5. Conectar BriefingCard a datos reales
La BriefingCard en el chat muestra datos hardcodeados. Necesita:
- Fetch del season/week actual del usuario
- Training plan del día
- Nutrition summary
- Usar los endpoints existentes del BFF

## Reglas
- NO mock responses — todo real contra BFF + Supabase + Gemini
- Si algo falla, debuguea y arregla — no simules
- Commits organizados con mensajes descriptivos
- Reporta exactamente qué funciona y qué no después de cada fix
```

---

## Alternativa: Prompt para Cowork (si prefieres seguir aquí)

Si decides seguir en Cowork en vez de Claude Code, usa este prompt en una nueva conversación:

```
Lee CLAUDE.md y docs/active/SESSION_NEXT_STEPS.md.

Estamos en branch `feat/visual-refinement-v2`. La app GENESIS tiene chat-first UI con LiquidGlass pero NUNCA se ha probado con BFF real. Los mocks fueron eliminados.

Necesito:
1. Push del branch a origin
2. Revisar que el BFF arranca correctamente (tengo Supabase + Gemini API key configurados)
3. Auditar el chat flow: app/(chat)/index.tsx → stores/useGenesisStore.ts → services/genesisAgentApi.ts → BFF /mobile/chat — identificar posibles puntos de fallo ANTES de correr
4. Fixear problemas encontrados en la auditoría
5. Conectar BriefingCard a datos reales

Reglas: NO mocks, todo real. Si algo está roto, arréglalo.
```
