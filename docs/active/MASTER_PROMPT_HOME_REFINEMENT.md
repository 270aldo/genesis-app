# MASTER PROMPT — HOME Tab Visual Refinement

## Context

You are refining the HOME tab (`app/(tabs)/home.tsx`) of the GENESIS fitness app — a premium AI-powered coaching app built with Expo SDK 54, React Native 0.81, TypeScript, NativeWind v4.

The TRAIN tab was already refined with a unified design language. Now HOME needs the same treatment.

**Read `CLAUDE.md` at project root first** — it has the full project structure, tech stack, and architecture patterns.

---

## Design Language (ESTABLISHED — match exactly)

All cards in the app follow this pattern:

```
backgroundColor: '#000000'
borderWidth: 1
borderColor: '#6D00FF'    // GENESIS_COLORS.primary
borderRadius: 16-20
text: '#FFFFFF'
headers: fontFamily 'JetBrainsMonoBold' or 'JetBrainsMonoSemiBold'
body: fontFamily 'Inter'
accent: '#6D00FF' (violet)
```

**Key constants** (from `constants/colors.ts`):
- `GENESIS_COLORS.primary` = `#6D00FF`
- `GENESIS_COLORS.surfaceCard` = `rgba(10, 10, 10, 0.85)` ← OLD, replace with `#000000`
- `GENESIS_COLORS.borderSubtle` = `rgba(255, 255, 255, 0.08)` ← OLD, replace with `GENESIS_COLORS.primary`
- `GENESIS_COLORS.textSecondary` = `rgba(255, 255, 255, 0.60)`
- `GENESIS_COLORS.textTertiary` = `rgba(192, 192, 192, 0.60)`
- `GENESIS_COLORS.textMuted` = `rgba(255, 255, 255, 0.40)`

**The rule**: Every card/surface that currently uses `GENESIS_COLORS.surfaceCard` bg + `GENESIS_COLORS.borderSubtle` border should become `backgroundColor: '#000000'` + `borderColor: GENESIS_COLORS.primary`.

Icons that had multiple colors (red flame, blue moon, teal drops, orange steps) should become **white or violet** — the only color accents allowed are `#6D00FF` (violet) and functional status indicators (green for success/recovered, orange for warnings).

---

## TRAIN Tab Reference (what "done" looks like)

The TRAIN tab (`app/(tabs)/train.tsx`) has already been refined with:

1. **Phase Bar**: `backgroundColor: '#000000'`, `borderWidth: 1`, `borderColor: GENESIS_COLORS.primary`, white text
2. **GENESIS TIP Carousel**: Interactive carousel with arrows, dots, 5 tips per phase, black bg + violet border
3. **Exercise Cards**: `ListItemCard` component with `backgroundColor: '#000000'`, `borderWidth: 1`, `borderColor: colors.border` (violet), swap icons
4. **Camera CTA**: Black bg, violet border, white icon, minimal text
5. **Hero ImageCard**: Full-width image with gradient overlay

The key file for card styling: `components/ui/ListItemCard.tsx` — already uses black bg + violet border.

---

## HOME Tab — Current State & What to Change

The file is `app/(tabs)/home.tsx` (755 lines). Here are the specific sections and changes:

### 1. GENESIS Daily Briefing Card (lines ~406-458)

**Current**: Uses `GENESIS_COLORS.surfaceCard` bg, `GENESIS_COLORS.borderSubtle` border, has a `LinearGradient` overlay with purple tint, shadow glow.

**Change to**:
- `backgroundColor: '#000000'`
- `borderColor: GENESIS_COLORS.primary`
- Keep the phase badge pill (already has violet border, transparent bg — good)
- Keep GENESIS sparkle icon
- Remove the `LinearGradient` overlay (unnecessary with solid black bg)
- Remove `shadowColor/shadowOpacity/shadowRadius/shadowOffset/elevation` (no glow needed)

### 2. Quick Metrics Row — MetricMini (lines ~526-533, component at ~684-701)

**Current**: Each metric (kcal, sleep, cups, steps) uses `GENESIS_COLORS.surfaceCard` bg, `GENESIS_COLORS.borderSubtle` border. Icons are colored: red flame, blue moon, teal drops, orange footprints.

**Change to**:
- `backgroundColor: '#000000'`
- `borderColor: GENESIS_COLORS.primary`
- **Icons**: Change ALL icon colors to `'#FFFFFF'` (white). No more red/blue/teal/orange per-icon colors.
- Value text stays white `#FFFFFF`
- Label text stays `GENESIS_COLORS.textTertiary`

### 3. Mission Cards "HOY" (lines ~536-578, component at ~703-741)

**Current**: Three horizontal scroll cards (Train, Fuel, Check-in) use `LinearGradient` backgrounds with phase-colored tints (purple for Train, green for Fuel, blue for Check-in). Each has a colored icon background.

**Change to**:
- Remove `LinearGradient` entirely
- `backgroundColor: '#000000'`
- `borderColor: GENESIS_COLORS.primary` (instead of `rgba(255,255,255,0.08)`)
- **Icon backgrounds**: Change `iconBg` from colored to `'rgba(109, 0, 255, 0.1)'` (violet dim) for ALL cards
- **Icon colors**: Change ALL to `GENESIS_COLORS.primary` (#6D00FF) — no more green/blue per-card
- Keep title, subtitle, detail text as-is (white + tertiary)
- Remove `gradientColors` prop from MissionCard calls

### 4. GENESIS Proactive Insight (lines ~462-505)

**Current**: Uses `GENESIS_COLORS.surfaceCard` bg, `GENESIS_COLORS.borderSubtle` border, has a purple left accent bar.

**Change to**:
- `backgroundColor: '#000000'`
- `borderColor: GENESIS_COLORS.primary`
- Remove the left accent bar `View` (the full violet border replaces it)
- Icon color stays `'#a866ff'` or change to `GENESIS_COLORS.primary`

### 5. GENESIS RECOMIENDA section (lines ~580-618)

**Current**: Uses `ImageCard` for education content (fine), but the "all read" empty state uses `GENESIS_COLORS.surfaceCard` + `GENESIS_COLORS.borderSubtle`.

**Change to** (empty state only):
- `backgroundColor: '#000000'`
- `borderColor: GENESIS_COLORS.primary`

### 6. Week Progress "ESTA SEMANA" (lines ~620-662)

**Current**: Uses `GlassCard` component which has `bg-[#0A0A0AD9]` (NativeWind class) and `border-[#FFFFFF14]`.

**Change to**: Pass style override to GlassCard:
```tsx
<GlassCard shine style={{ backgroundColor: '#000000', borderColor: GENESIS_COLORS.primary, borderWidth: 1 }}>
```

### 7. Streak "RACHA" (lines ~664-677)

**Current**: Uses `GlassCard` with default styling.

**Change to**: Same style override:
```tsx
<GlassCard style={{ backgroundColor: '#000000', borderColor: GENESIS_COLORS.primary, borderWidth: 1 }}>
```
- Change Flame icon color from `"#F97316"` (orange) to `GENESIS_COLORS.primary` (#6D00FF)

### 8. Wellness Indicator (component: `components/ui/WellnessIndicator.tsx`)

**Current**: Uses `GENESIS_COLORS.surfaceCard` bg, variable border color based on score.

**Change to**:
- `backgroundColor: '#000000'`
- `borderColor: GENESIS_COLORS.primary` (always violet, regardless of score)
- Keep the score color indicator for the text/icon color (green/yellow/red based on score) — that's functional

### 9. Getting Started Card (lines ~27-119)

**Current**: Uses `GlassCard` with `borderColor: GENESIS_COLORS.primary + '33'` (very faint violet).

**Change to**: Override to full violet:
```tsx
<GlassCard shine style={{ backgroundColor: '#000000', borderColor: GENESIS_COLORS.primary, borderWidth: 1 }}>
```

---

## Additional Functional Improvement: HOME GENESIS TIP Carousel

Add a GENESIS TIP carousel to HOME (like the one in TRAIN) positioned **after the Quick Metrics row and before the "HOY" section**. This carousel should show **general daily tips** covering all domains:

```typescript
const HOME_GENESIS_TIPS: Record<string, string[]> = {
  general: [
    'La consistencia supera a la intensidad. Pequeñas acciones diarias construyen grandes resultados.',
    'Hidrátate antes de entrenar — tu rendimiento mejora hasta un 15% con hidratación adecuada.',
    'El sueño es tu herramienta de recuperación #1. Prioriza 7-8 horas cada noche.',
    'Tu check-in diario entrena a GENESIS para darte mejores recomendaciones.',
    'La nutrición post-entrenamiento es tan importante como el entrenamiento mismo.',
  ],
};
```

Use the same carousel component pattern from TRAIN (arrows, dots, counter). The carousel card should be: black bg, violet border, "GENESIS TIP" header with Cpu icon.

---

## Files to Modify

1. **`app/(tabs)/home.tsx`** — Main changes (all 9 sections above + add tip carousel)
2. **`components/ui/WellnessIndicator.tsx`** — Black bg + violet border
3. **`components/ui/GlassCard.tsx`** — Optional: update default styles to black+violet (BUT be careful — GlassCard is used everywhere, so prefer per-instance style overrides in home.tsx instead)

**DO NOT modify** `GlassCard.tsx` defaults — use `style` prop overrides in `home.tsx` to avoid breaking other screens.

---

## Execution Checklist

- [ ] Briefing card: black bg, violet border, remove gradient overlay + shadow
- [ ] MetricMini: black bg, violet border, ALL white icons
- [ ] MissionCards: black bg, violet border, remove LinearGradient, violet icons
- [ ] Proactive Insight: black bg, violet border, remove left accent bar
- [ ] GENESIS RECOMIENDA empty state: black bg, violet border
- [ ] ESTA SEMANA GlassCard: style override black+violet
- [ ] RACHA GlassCard: style override black+violet, violet flame icon
- [ ] WellnessIndicator: black bg, violet border always
- [ ] Getting Started card: full violet border (not faint)
- [ ] Add HOME GENESIS TIP carousel after metrics row
- [ ] Verify TypeScript compiles: `npx tsc --noEmit`
- [ ] Visual check: all cards should look unified with black+violet+white

---

## Important Technical Notes

- **Zustand anti-pattern**: NEVER call store methods inside selectors. Read primitives and compute inline with `useMemo`.
- **Staggered animations**: HOME uses `useStaggeredEntrance` hook — keep all `StaggeredSection` wrappers intact.
- **GenesisFAB**: Already present via `(tabs)/_layout.tsx` — don't add it again.
- **ScrollView**: Uses `react-native-gesture-handler` ScrollView, not RN's built-in.
- **PHASE_CONFIG**: Colors per phase are in `data/mockData.ts` — `phaseConfig.color`, `phaseConfig.accentColor`, `phaseConfig.label`.
- **MissionCard component**: Defined at bottom of home.tsx (not imported) — modify it in-place.
- **MetricMini component**: Also defined at bottom of home.tsx — modify in-place.

---

## What NOT to Change

- Header (avatar + greeting + settings gear) — already clean
- SeasonHeader component — works across all tabs, don't touch
- CoachNotes component — keep as-is for now
- WeeklyWrap component — keep as-is (only shown Sunday/Monday)
- CollapsibleSection wrapper — just change the inner GlassCard styles
- SectionLabel — keep as-is
- Any store logic, data fetching, or business logic
