# GENESIS — Next Session Plan

## Current State (Feb 20, 2026)

### Branch: `feat/visual-refinement-v2`
3 clean commits ready to push:
1. `feat(chat): LiquidGlass UI system + chat-first refinements` — UI components, crash fixes, StarterActions
2. `refactor(store): remove mock response engine, show real BFF errors` — No more fake responses
3. `docs: update V2 master prompt with chat-first refinement progress`

### What's done
- Chat-first UI architecture (tabs → single chat screen)
- LiquidGlassCard component system
- AgentThinkingBlock (Grok-style thinking with contributions)
- StarterActions (3-col toolbar, time-contextual)
- ToolsPopover (safe positioning)
- Memory crash fixed (no Animated.View in FlatList)
- Mock responses REMOVED — real BFF errors shown

### What's NOT working yet
- **Chat has NOT been tested with real BFF** — this is priority #1
- StarterActions send text prompts but haven't been tested against real agent routing
- ToolsPopover actions (camera, voice, spaces) need real integration testing
- BriefingCard shows hardcoded data (needs real API)
- No error boundary for chat failures beyond the basic message

---

## Pre-Session Checklist (Do Before Starting)

### 1. Push the branch
```bash
cd genesis-app
git push -u origin feat/visual-refinement-v2
```

### 2. Start the BFF
```bash
cd bff
pip install -r requirements.txt  # if not done
uvicorn main:app --reload --port 8000
```

### 3. Verify BFF health
```bash
curl http://localhost:8000/health
```

### 4. Start Expo
```bash
npx expo start
```

### 5. Test real chat
- Open app → type "Hola" → should get real Gemini response
- If you see "No pude conectar con el servidor" → BFF isn't running

---

## Proposed Session: "Real Experience Polish"

### Priority 1: Fix Real Chat Flow
Test the full pipeline: User → BFF → ADK agents → Gemini → Response with widgets
- [ ] Verify chat sends to `/mobile/chat` endpoint
- [ ] Verify AgentThinkingBlock shows during real agent processing
- [ ] Verify widgets render from real agent responses
- [ ] Fix any routing/response parsing bugs found during testing
- [ ] Test StarterActions prompts against real agent routing

### Priority 2: Wire Remaining UI to Real Data
- [ ] BriefingCard → pull from user's actual season/training/nutrition data
- [ ] StarterActions that navigate (check-in, camera, education) → verify navigation works
- [ ] ToolsPopover actions → camera scanner, voice call, spaces

### Priority 3: Chat UX Bugs
Based on real testing, fix whatever interaction issues come up:
- [ ] Message rendering edge cases
- [ ] Keyboard behavior
- [ ] Scroll position after new messages
- [ ] Error recovery (network drops, slow responses)

### Priority 4: Visual Polish Pass
- [ ] Verify LiquidGlass effects look correct on device
- [ ] Test dark theme contrast/readability
- [ ] Ensure fonts load properly (JetBrains Mono + Inter)

---

## Key Files for Next Session

| File | Purpose |
|------|---------|
| `app/(chat)/index.tsx` | Main chat screen |
| `stores/useGenesisStore.ts` | Chat state + sendMessage (now real-only) |
| `services/genesisAgentApi.ts` | BFF API client |
| `bff/services/agent_router.py` | ADK routing + cache + widget extraction |
| `bff/routers/mobile.py` | `/mobile/chat` endpoint |
| `components/chat/StarterActions.tsx` | Action grid |
| `components/chat/AgentThinkingBlock.tsx` | Thinking UI |
| `components/chat/BriefingCard.tsx` | Briefing card (needs real data) |

## Environment Ready
- ✅ Supabase URL + keys configured
- ✅ Gemini API key configured
- ✅ Knowledge stores configured (5 domains)
- ✅ BFF .env complete
- ✅ Mobile .env points to localhost:8000
