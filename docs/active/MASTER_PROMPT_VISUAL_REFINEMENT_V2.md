# GENESIS Visual Refinement V2.1 — Implementation Prompt

**Date:** 2026-02-20
**Status:** Ready for execution
**Reference:** `docs/plans/chat-ui-mockup-v2.html` (visual mockup)
**Philosophy:** Apple Intelligence × JetBrains — DEPTH over FLAT, TYPOGRAPHY as INTERFACE
**Branch:** `feat/visual-refinement-v2`

---

## CONTEXT

You are refining the GENESIS chat-first UI. The app already works — it has a chat screen with messages, agent thinking, briefing card, quick actions, drawer, and widget rendering. This prompt upgrades the VISUAL LAYER to match the approved V2.1 mockup.

**DO NOT** break existing functionality. Every change is visual/UX — no business logic, no API changes, no store changes.

**READ FIRST:**
- `docs/plans/chat-ui-mockup-v2.html` — The approved visual mockup (open in browser)
- `CLAUDE.md` — Project structure and patterns
- This file — Implementation spec

**USE THE EXPO MCP** for Expo/React Native API reference when needed.

---

## PHASE 0: Dependencies & Design Tokens

### 0.1 Install LiquidGlass

```bash
npx expo install @callstack/liquid-glass
```

### 0.2 Create LiquidGlass Wrapper

**New file:** `components/ui/LiquidGlassCard.tsx`

```tsx
import { View, type ViewProps } from 'react-native';
import {
  LiquidGlassView,
  isLiquidGlassSupported,
} from '@callstack/liquid-glass';

type LiquidGlassCardProps = ViewProps & {
  effect?: 'clear' | 'regular' | 'none';
  interactive?: boolean;
  tintColor?: string;
  borderRadius?: number;
};

export function LiquidGlassCard({
  effect = 'regular',
  interactive = false,
  tintColor,
  borderRadius = 16,
  style,
  children,
  ...rest
}: LiquidGlassCardProps) {
  if (isLiquidGlassSupported) {
    return (
      <LiquidGlassView
        effect={effect}
        interactive={interactive}
        tintColor={tintColor}
        style={[{ borderRadius, overflow: 'hidden' }, style]}
        {...rest}
      >
        {children}
      </LiquidGlassView>
    );
  }

  // Fallback for non-iOS 26
  return (
    <View
      style={[
        {
          borderRadius,
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
```

### 0.3 Update Color Tokens

**File:** `constants/colors.ts`

Add these tokens to `GENESIS_COLORS` (keep all existing ones intact):

```ts
// V2.1 Void System
void: '#050508',
voidElevated: '#0A0A10',

// V2.1 Glass System
glassBg: 'rgba(255, 255, 255, 0.04)',
glassBgHover: 'rgba(255, 255, 255, 0.07)',
glassBorder: 'rgba(255, 255, 255, 0.06)',
glassBorderActive: 'rgba(255, 255, 255, 0.10)',
violetSubtle: 'rgba(109, 0, 255, 0.08)',
violetTint: 'rgba(109, 0, 255, 0.12)',
violetGlow: 'rgba(109, 0, 255, 0.25)',

// V2.1 Text System
textGhost: 'rgba(255, 255, 255, 0.15)',

// Agent Colors (for thinking dots)
agentTrain: '#6D00FF',
agentFuel: '#00C853',
agentMind: '#2196F3',
agentTrack: '#FF6D00',
agentVision: '#E91E63',
```

### 0.4 Install Lucide Icons (if not at latest)

Ensure `lucide-react-native` is installed. All iconography in the V2.1 spec uses Lucide monochrome at `rgba(255,255,255,0.4)`. The emojis in the mockup are placeholders — replace with Lucide equivalents.

---

## PHASE 1: MessageBubble Redesign

**File:** `components/genesis/MessageBubble.tsx`

### What changes:
- **User messages:** LiquidGlass bubble with `effect="clear"`, iMessage-style corner radius (20px with 6px bottom-right). Glass-simulated background for fallback.
- **GENESIS messages:** NO bubble. Instead: avatar row + name + timestamp → text body with violet gradient vertical line on the left. Text starts at `paddingLeft: 38` with a 2px violet gradient line at `left: 13`.

### Implementation:

```tsx
import { Text, View } from 'react-native';
import { Layers } from 'lucide-react-native'; // GENESIS icon
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { GENESIS_COLORS } from '../../constants/colors';
import type { ChatMessage } from '../../types';

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const timeString = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  if (isUser) {
    return (
      <View style={{ alignItems: 'flex-end' }}>
        <LiquidGlassCard
          effect="clear"
          interactive
          borderRadius={20}
          style={{
            maxWidth: '78%',
            borderBottomRightRadius: 6,
            padding: 12,
            paddingHorizontal: 16,
          }}
        >
          <Text
            style={{
              color: GENESIS_COLORS.textPrimary,
              fontSize: 14,
              fontFamily: 'Inter',
              lineHeight: 21,
            }}
          >
            {message.content}
          </Text>
          {timeString && (
            <Text
              style={{
                color: GENESIS_COLORS.textGhost,
                fontSize: 10,
                fontFamily: 'JetBrainsMono',
                textAlign: 'right',
                marginTop: 6,
              }}
            >
              {timeString}
            </Text>
          )}
        </LiquidGlassCard>
      </View>
    );
  }

  // GENESIS message — no bubble
  return (
    <View style={{ alignItems: 'flex-start' }}>
      {/* Avatar row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: GENESIS_COLORS.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Layers size={14} color="#FFFFFF" strokeWidth={2} />
        </View>
        <Text
          style={{
            fontFamily: 'JetBrainsMono',
            fontSize: 12,
            fontWeight: '600',
            letterSpacing: 1,
            color: GENESIS_COLORS.textSecondary,
          }}
        >
          GENESIS
        </Text>
        {timeString && (
          <Text
            style={{
              fontFamily: 'JetBrainsMono',
              fontSize: 10,
              color: GENESIS_COLORS.textGhost,
            }}
          >
            {timeString}
          </Text>
        )}
      </View>

      {/* Text area with violet line */}
      <View style={{ paddingLeft: 38, position: 'relative' }}>
        {/* Violet gradient line */}
        <View
          style={{
            position: 'absolute',
            left: 13,
            top: 0,
            bottom: 0,
            width: 2,
            borderRadius: 1,
            opacity: 0.3,
            backgroundColor: GENESIS_COLORS.primary,
          }}
        />
        <Text
          style={{
            color: GENESIS_COLORS.textPrimary,
            fontSize: 14,
            fontFamily: 'Inter',
            lineHeight: 23,
          }}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}
```

**NOTE:** For the violet gradient line, use `LinearGradient` from `expo-linear-gradient` if you want the gradient-to-transparent effect. The above uses a simpler opacity approach. Prefer the LinearGradient approach:

```tsx
<LinearGradient
  colors={[GENESIS_COLORS.primary, 'transparent']}
  style={{
    position: 'absolute',
    left: 13,
    top: 0,
    bottom: 0,
    width: 2,
    borderRadius: 1,
    opacity: 0.3,
  }}
/>
```

---

## PHASE 2: ChatInput — Clean Input + Tools Popover

**File:** `components/chat/ChatInput.tsx`

### What changes:
- Remove ALL inline tool icons from the input bar
- Input bar now: `[+ button]` `[text input]` `[mic OR send]`
- `+` button opens a Tools Popover (animated bottom sheet/popover)
- When text is entered: mic hides → send button fades in (violet circle with `ArrowUp`)
- When `+` is tapped: button rotates to `×`, popover slides up
- All tools move into the popover with icon + name + description

### Input Bar Layout:

```
┌─────────────────────────────────────┐
│  [+]  │  Pregunta a GENESIS...  │ 🎤 │   ← empty state
│  [+]  │  Mi texto aquí...       │ [↑] │   ← has text (send visible, mic hidden)
│  [×]  │  Pregunta a GENESIS...  │ 🎤 │   ← popover open (+ becomes ×)
└─────────────────────────────────────┘
```

### Tools Popover Items:

| Icon (Lucide) | Name | Description | Action |
|---|---|---|---|
| `Camera` | Escanear alimento | Cámara · Identifica y registra | → `/(modals)/camera-scanner` |
| `Phone` | Llamada de voz | Habla con GENESIS en tiempo real | → `/(modals)/voice-call` |
| `ClipboardCheck` | Check-in diario | Registra energía, sueño, estado | → `/(modals)/check-in` |
| `TrendingUp` | Mi progreso | Métricas, fotos, tendencias | → `/(screens)/track-panel` or panel |
| `BookOpen` | LOGOS | Biblioteca de conocimiento | → Space switch or `/(screens)/education` |

### Popover Component:

**New file:** `components/chat/ToolsPopover.tsx`

- Position: absolute, bottom above input bar, left/right 16px
- Background: `rgba(18, 18, 28, 0.97)` with `backdropFilter: blur(40px)` (or LiquidGlassCard with `effect="regular"`)
- Border: `rgba(255,255,255,0.08)`, borderRadius 18
- Shadow: `0 -8px 40px rgba(0,0,0,0.5)`
- Animation: slide up + fade in (Reanimated `FadeInUp.duration(250)`)
- Each tool item: 36×36 rounded icon container + name (Inter 14px 500) + description (JetBrains Mono 10px tertiary uppercase)
- Divider between camera/voice tools and check-in/progress/logos
- Tapping any item: close popover + execute action
- Tapping outside: close popover

### Plus Button:
- Size: 34×34, borderRadius 50%
- Default: `rgba(255,255,255,0.06)` bg, `rgba(255,255,255,0.08)` border
- Active (popover open): `violetSubtle` bg, `rgba(109,0,255,0.20)` border, icon color violet
- Icon: `Plus` from Lucide (rotates 45° to become `×` when active, via Reanimated rotation)

### Send Button:
- Size: 34×34, borderRadius 50%
- Background: `#6D00FF` (violet)
- Icon: `ArrowUp` from Lucide, white, 16px
- Appears with `FadeIn + scale` animation when `value.trim().length > 0`
- Disappears (and mic reappears) when text is empty

### Mic Button:
- Size: 34×34
- Icon: `Mic` from Lucide at `rgba(255,255,255,0.30)`
- Visible when no text, hidden when text exists
- Tap → navigate to voice call

---

## PHASE 3: AgentThinkingBlock Redesign

**File:** `components/chat/AgentThinkingBlock.tsx`

### What changes:
- **Active state:** LiquidGlassCard with `effect="regular"`, compact single-line layout
  - `⬡ (Cpu icon)` + 3 pulsing dots + `"GENESIS · {elapsed}s"` timer
  - Below: agent dots as 6px colored circles + agent name in JetBrains Mono 10px uppercase
  - Margin-left 38px (aligned with GENESIS text area)
- **Collapsed state:** No background. Single tappable line: `⚡ {time}s · {count} agentes`
  - JetBrains Mono 10px, color `textGhost`
  - Margin-left 38px

### Agent Dots (NOT 28px circles):
Replace the `AgentContribution` 28px avatar circles with small 6px dots:

```tsx
<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
  {uniqueAgents.map((agent) => (
    <View key={agent} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: GENESIS_COLORS[`agent${capitalize(agent)}`],
        }}
      />
      <Text
        style={{
          fontFamily: 'JetBrainsMono',
          fontSize: 10,
          fontWeight: '500',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: GENESIS_COLORS.textTertiary,
        }}
      >
        {agent}
      </Text>
    </View>
  ))}
</View>
```

### Pulsing Dots Animation:
Three 4px violet dots with staggered pulse animation using Reanimated:

```tsx
// Each dot uses a withRepeat + withSequence animation
// Stagger: dot1 = 0ms, dot2 = 200ms, dot3 = 400ms
// Scale: 0.8 → 1.2, Opacity: 0.3 → 1.0
```

---

## PHASE 4: BriefingCard Redesign

**File:** `components/chat/BriefingCard.tsx`

### What changes:
- Wrap entire card in `LiquidGlassCard` with `effect="regular"`, `interactive`
- **Collapsed state** (empty chat): Single row with greeting + stats + chevron
  - Greeting: Inter 14px 500 primary
  - Stats: JetBrains Mono 11px secondary (`1,450 kcal · 🔵 12`)
  - Streak: 6px pulsing violet dot + streak number in JetBrains Mono 11px 600 violet
  - Chevron: `›` in textGhost
- **Expanded state** (in conversation): Full card with:
  - Header: sun icon + "Buenos días" (JetBrains Mono 11px 600 uppercase) + time
  - Body text: Inter 14px secondary, training summary
  - 3 metric boxes: value in JetBrains Mono 18px 600, label in Inter 10px tertiary
  - Metrics wrap in LiquidGlassCard `effect="clear"` or simple glass-bg boxes

### Metric Numbers Typography:
All numbers MUST use JetBrains Mono. This is the core of "Typography as Interface."

---

## PHASE 5: QuickActionsBar — Pills as LiquidGlass

**File:** `components/chat/QuickActionsBar.tsx`

### What changes:
- Each pill wraps in `LiquidGlassCard` with `effect="clear"`, `interactive`
- Typography: JetBrains Mono 11px 500, letter-spacing 0.5, uppercase
- Emojis REMAIN in pills (pills are the ONE place where emojis are allowed)
- Press animation: `Reanimated scale spring` via the `interactive` prop on LiquidGlass
- Color: textSecondary default. On hover/press: textPrimary + violet border tint

---

## PHASE 6: Empty State

**File:** `app/(chat)/index.tsx` — within the chat screen, when `messages.length === 0`

### Layout:
1. **GENESIS logo** in circular LiquidGlass container (80×80)
   - `LiquidGlassCard` circular, `effect="regular"`, `interactive`
   - Inside: Lucide `Layers` icon, 32px, stroke violet, strokeWidth 1.5
2. **Title:** "GENESIS" — JetBrains Mono 18px 600, letterSpacing 2
3. **Subtitle:** "Tu copiloto de rendimiento y longevidad" — Inter 14px textTertiary
4. **BriefingCard** (collapsed state)
5. **QuickActionsBar** (pills) centered

---

## PHASE 7: SpaceDrawer Redesign

**File:** `components/chat/SpaceDrawer.tsx`

### What changes:
- Background: `void` (#050508) — pure dark, NO gradient
- **User section:** LiquidGlass avatar (40×40 circular, initials) + name (JetBrains Mono 14px 600) + plan badge (JetBrains Mono 10px violet uppercase)
- **Season card:** LiquidGlassCard `effect="regular"` with season label + phase + 3px progress bar (violet gradient fill)
- **Spaces section:** Lucide icons monochrome at `rgba(255,255,255,0.30)`, names in JetBrains Mono 12px uppercase
  - Replace emoji icons with Lucide: `BookOpen` (LOGOS), `Calendar` (Calendario), `FlaskConical` (Lab)
- **History:** Inter 13px for titles, JetBrains Mono 10px for dates. Clean list, no decorations.
- **Settings:** Bottom bar with `Settings` Lucide icon + "CONFIGURACIÓN" label

---

## PHASE 8: Widget Inline Styling

**File:** `components/genesis/WidgetRenderer.tsx` (and individual widget files)

### What changes:
- All inline widgets use `LiquidGlassCard` with `effect="clear"`, `interactive`
- Widget alignment: `marginLeft: 38` (aligned with GENESIS text body, under the violet line)
- Top accent: 2px violet gradient line at top of widget
- Widget header: Lucide icon + title in JetBrains Mono 11px 600 uppercase
- CTA button: Violet fill (#6D00FF), JetBrains Mono 12px 600 uppercase, borderRadius 10
- Numbers inside widgets: ALWAYS JetBrains Mono

---

## PHASE 9: Motion & Animations

### Animation Inventory:
| Element | Animation | Library |
|---|---|---|
| Messages appearing | `FadeInUp.duration(300)` | Reanimated |
| Pills press | Spring scale via `interactive` | LiquidGlass native |
| Send button appear | `FadeIn + withSpring(scale)` | Reanimated |
| Send button disappear | `FadeOut + withTiming(scale: 0.8)` | Reanimated |
| Tools popover open | `FadeInUp.duration(250)` or `SlideInUp` | Reanimated |
| Tools popover close | `FadeOutDown.duration(200)` | Reanimated |
| Plus → × rotation | `withTiming(rotate: 45deg, 200ms)` | Reanimated |
| Thinking dots | `withRepeat + withSequence` (scale + opacity) | Reanimated |
| Streak dot pulse | `withRepeat + withSequence` (scale + opacity, 2s) | Reanimated |
| Briefing expand/collapse | `withTiming(height)` or `Layout` transition | Reanimated |
| LiquidGlass grow-on-touch | Native via `interactive` prop | LiquidGlass |

### Rules:
- All entering animations: `FadeInUp` or `FadeInDown`, 200-300ms
- All exiting: `FadeOut`, 150-200ms
- Spring for interactive elements (pills, buttons)
- No animation on scroll — only on appear and interact

---

## PHASE 10: Iconography Migration — Lucide Monochrome

### Global Rule:
- **ALL icons** use Lucide React Native, monochrome
- Default icon color: `rgba(255, 255, 255, 0.40)` (textMuted)
- Active icon color: `#6D00FF` (violet) or `rgba(255, 255, 255, 0.92)` (textPrimary)
- Size: 20px default, 16px for inline/small contexts, 14px for avatar badges
- StrokeWidth: 1.5 default, 2 for emphasis

### Key Icon Mappings:
| Context | Icon | Lucide Name |
|---|---|---|
| GENESIS avatar | Layers | `Layers` |
| Menu (drawer) | Menu | `Menu` |
| New chat | Sparkles | `Sparkles` |
| Plus (tools) | Plus → X | `Plus` / `X` |
| Send | ArrowUp | `ArrowUp` |
| Mic | Mic | `Mic` |
| Camera/Scan | Camera | `Camera` |
| Voice call | Phone | `Phone` |
| Check-in | ClipboardCheck | `ClipboardCheck` |
| Progress | TrendingUp | `TrendingUp` |
| LOGOS/Books | BookOpen | `BookOpen` |
| Calendar | Calendar | `Calendar` |
| Lab | FlaskConical | `FlaskConical` |
| Settings | Settings | `Settings` |
| Thinking/CPU | Cpu | `Cpu` |
| Workout | Dumbbell | `Dumbbell` |
| Briefing sun | Sun | `Sun` |
| Chevron | ChevronRight | `ChevronRight` |

### Where emojis ARE allowed:
- Quick Action pills (e.g., "🏋️ Entreno de hoy", "🥗 ¿Qué como?")
- NOWHERE else

---

## PHASE 11: Typography Audit

### Rule: Two Fonts, Strict Roles

| Font | Use | Weight | Size Range |
|---|---|---|---|
| **JetBrains Mono** | System: labels, timestamps, badges, pills, headers, metrics, tool descriptions, agent names, season info | 300-700 | 10-18px |
| **Inter** | Conversation: message text, briefing body, descriptions, tool names in popover | 300-600 | 13-16px |

### Critical: Numbers = JetBrains Mono
Every number in the app (metrics, timestamps, streak count, calories, weight, reps, sets, percentages, progress bars labels) MUST use JetBrains Mono. This is the visual identity signature.

---

## EXECUTION ORDER

1. **Phase 0** — Dependencies + tokens (5 min)
2. **Phase 1** — MessageBubble (critical — most visible change)
3. **Phase 2** — ChatInput + ToolsPopover (biggest structural change)
4. **Phase 3** — AgentThinkingBlock
5. **Phase 4** — BriefingCard
6. **Phase 5** — QuickActionsBar pills
7. **Phase 6** — Empty State
8. **Phase 7** — SpaceDrawer
9. **Phase 8** — Widget inline styling
10. **Phase 10** — Iconography audit (can be done incrementally with each phase)
11. **Phase 11** — Typography audit (can be done incrementally with each phase)
12. **Phase 9** — Motion polish (final pass)

---

## VALIDATION CHECKLIST

After each phase, verify:

- [ ] App compiles without errors (`npx expo start`)
- [ ] No TypeScript errors
- [ ] No infinite re-render loops (watch for Zustand selector patterns)
- [ ] LiquidGlass fallback works (test with `isLiquidGlassSupported = false`)
- [ ] All fonts render correctly (JetBrains Mono + Inter loaded)
- [ ] Lucide icons display (not broken squares)
- [ ] Input bar works: type text → send appears, clear text → mic returns
- [ ] Tools popover opens/closes correctly
- [ ] Agent thinking animates (dots pulse, timer counts)
- [ ] Messages alternate correctly (user = glass bubble right, GENESIS = no bubble left)
- [ ] Widgets align at paddingLeft 38 under violet line
- [ ] Drawer opens/closes, spaces navigate
- [ ] Quick action pills are tappable and send messages
- [ ] Empty state shows when no messages

---

## FILES THAT CHANGE

| File | Change Type |
|---|---|
| `components/ui/LiquidGlassCard.tsx` | **NEW** |
| `components/chat/ToolsPopover.tsx` | **NEW** |
| `constants/colors.ts` | MODIFY (add V2.1 tokens) |
| `components/genesis/MessageBubble.tsx` | REWRITE |
| `components/chat/ChatInput.tsx` | REWRITE |
| `components/chat/AgentThinkingBlock.tsx` | MODIFY (redesign) |
| `components/chat/AgentContribution.tsx` | MODIFY (6px dots) |
| `components/chat/AgentThinking.tsx` | MODIFY (dot animation) |
| `components/chat/BriefingCard.tsx` | MODIFY (LiquidGlass + typography) |
| `components/chat/QuickActionsBar.tsx` | MODIFY (LiquidGlass pills) |
| `components/chat/SpaceDrawer.tsx` | MODIFY (Lucide icons + typography) |
| `components/genesis/WidgetRenderer.tsx` | MODIFY (alignment + LiquidGlass) |
| `app/(chat)/index.tsx` | MODIFY (empty state + animation) |
| `package.json` | MODIFY (add @callstack/liquid-glass) |

---

## WHAT NOT TO TOUCH

- `bff/` — No backend changes
- `stores/` — No state logic changes
- `services/` — No API changes
- `hooks/` — No hook logic changes (only consume new visual components)
- `types/` — No type changes
- Business logic in any component — only visual layer
- A2UI widget data flow — only widget rendering styles

---

## GIT & DELIVERY — Final Steps

After ALL phases are complete and the validation checklist passes:

### 1. Commit on this branch

```bash
git add -A
git commit -m "polish(chat-ui): V2.1 visual refinement — LiquidGlass, Claude input pattern, typography system

- Rewrite MessageBubble: user glass bubble, GENESIS no-bubble with violet line
- Replace inline tool icons with Claude/Gemini + button → ToolsPopover
- Redesign AgentThinkingBlock: 6px agent dots, pulsing animation, compact layout
- Upgrade BriefingCard, QuickActionsBar, SpaceDrawer with LiquidGlass
- Add LiquidGlassCard wrapper with iOS 26 fallback
- Migrate all icons to Lucide monochrome (emojis only in pills)
- Enforce JetBrains Mono for system/numbers, Inter for conversation
- Add Reanimated v4 motion: FadeInUp messages, spring pills, popover slide

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### 2. Push branch to remote

```bash
git push -u origin feat/visual-refinement-v2
```

### 3. Create Pull Request

```bash
gh pr create \
  --base feat/chat-first-ui \
  --head feat/visual-refinement-v2 \
  --title "polish(chat-ui): V2.1 visual refinement — LiquidGlass + Claude input pattern" \
  --body "## Summary
- MessageBubble: user = LiquidGlass bubble, GENESIS = no bubble + violet line
- ChatInput: clean input with + button → animated ToolsPopover (5 tools)
- AgentThinkingBlock: compact 6px dots, pulsing animation
- BriefingCard, pills, drawer, widgets upgraded with LiquidGlass
- Full Lucide monochrome iconography migration
- JetBrains Mono / Inter typography system enforced
- Reanimated v4 motion across all components

## Visual Reference
See \`docs/plans/chat-ui-mockup-v2.html\` for the approved mockup.

## Test plan
- [ ] App compiles (\`npx expo start\`)
- [ ] LiquidGlass fallback renders correctly
- [ ] Input bar: type → send appears, clear → mic returns
- [ ] Tools popover opens/closes with animation
- [ ] Messages: user = glass bubble right, GENESIS = no bubble left
- [ ] Agent thinking dots pulse with staggered animation
- [ ] Quick action pills tappable
- [ ] Drawer opens with Lucide icons
- [ ] Empty state displays correctly

🤖 Generated with Claude Code"
```

### 4. After PR review → Merge into `feat/chat-first-ui`

Once approved, merge into the parent branch. Then `feat/chat-first-ui` will eventually merge into `main` when the entire chat-first feature is production-ready.
