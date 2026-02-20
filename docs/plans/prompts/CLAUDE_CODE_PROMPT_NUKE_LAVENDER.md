# GENESIS App — PURGE ALL LAVENDER

## DIRECTIVE
Eliminate EVERY instance of lavender, light purple, and pastel violet from the entire codebase. The following hex values are BANNED and must be replaced:

```
BANNED COLORS (kill all of these):
#9D4EDD  — lavender (the main offender)
#B388FF  — light lavender
#a866ff  — soft violet
#7C3AED  — medium lavender
#7B2FBE  — blue-violet
```

## REPLACEMENT PALETTE

The app uses ONE accent color: `#6D00FF` (deep electric violet). When you need variation, go DARKER or use opacity — NEVER lighter.

```
PRIMARY:     #6D00FF  (the only accent)
DARK:        #4A00B0  (for gradients, pressed states)
DEEPER:      #3D0099  (for secondary gradient stops)
OPACITY:     rgba(109, 0, 255, 0.X)  (for tints, backgrounds, borders)
```

For things that previously used lavender for "softer" purposes:
- Use `#6D00FF` directly
- Or use `#FFFFFF` (white) for contrast
- Or use `rgba(109, 0, 255, 0.5)` for a muted version
- NEVER use a lighter hex purple

For mood "good": use `#6D00FF`
For mood "okay": use `#808080` (gray — neutral, not purple)

---

## FILE-BY-FILE CHANGES

### 1. `constants/colors.ts` — THE SOURCE OF TRUTH

Replace the entire file with:

```typescript
export const GENESIS_COLORS = {
  // Brand Core
  primary: '#6D00FF',
  primaryLight: '#6D00FF',       // NO LAVENDER — same as primary
  primaryDark: '#4A00B0',
  primaryDim: 'rgba(109, 0, 255, 0.1)',
  primaryGlass: 'rgba(109, 0, 255, 0.25)',

  // Chrome Metallic
  chrome: '#C0C0C0',
  chromeLight: '#E8E8E8',
  chromeDark: '#808080',
  chromeDarker: '#404040',

  // Accents
  cyan: '#6D00FF',               // was #9D4EDD — now primary
  cyanDeep: '#4A00B0',           // was #7B2FBE — now primaryDark
  mint: '#00F5AA',

  // Status Semantic
  success: '#00F5AA',
  warning: '#FFD93D',
  error: '#FF6B6B',
  info: '#6D00FF',               // was #9D4EDD — now primary

  // Backgrounds
  bgGradientStart: '#151226',
  bgGradientMid: '#050507',
  bgGradientEnd: '#000000',
  bgVoid: '#050505',

  // Surfaces
  surfaceCard: 'rgba(10, 10, 10, 0.85)',
  surfaceElevated: 'rgba(20, 20, 25, 0.6)',
  surfaceGlass: 'rgba(20, 20, 25, 0.4)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.60)',
  textTertiary: 'rgba(192, 192, 192, 0.60)',
  textMuted: 'rgba(255, 255, 255, 0.40)',

  // Borders
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderActive: 'rgba(109, 0, 255, 0.4)',
} as const;

export const MACRO_COLORS = {
  protein: '#FFFFFF',
  carbs: '#00F5AA',
  fat: '#F97316',
} as const;

export const MOOD_COLORS = {
  excellent: '#00F5AA',
  good: '#6D00FF',               // was #9D4EDD
  neutral: '#808080',
  poor: '#FFD93D',
  terrible: '#FF6B6B',
} as const;

export type GenesisColor = keyof typeof GENESIS_COLORS;

export const SEASON_PHASE_COLORS = {
  hypertrophy: '#6D00FF',
  strength: '#6D00FF',
  power: '#6D00FF',              // was #9D4EDD
  deload: '#6D00FF',             // was #7C3AED
} as const;

export const BODY_MAP_COLORS: Record<string, string> = {
  inactive: '#2A2A3E',
  recovered: '#00F5AA',
  active: '#6D00FF',
  soreness: '#FF6B6B',
} as const;

export const MUSCLE_GRADIENTS: Record<string, [string, string]> = {
  chest: ['#6D00FF', '#4A00B0'],
  back: ['#4A00B0', '#6D00FF'],
  shoulders: ['#6D00FF', '#3D0099'],
  legs: ['#3D0099', '#6D00FF'],
  arms: ['#6D00FF', '#4A00B0'],
  core: ['#4A00B0', '#3D0099'],
  full_body: ['#6D00FF', '#4A00B0'],
} as const;
```

### 2. `constants/shadows.ts`
Find `#9D4EDD` and replace with `#6D00FF`.

### 3. `tailwind.config.js`
Find `info: '#9D4EDD'` and replace with `info: '#6D00FF'`.

### 4. `services/pushNotifications.ts`
Find `lightColor: '#7C3AED'` and replace with `lightColor: '#6D00FF'`.

### 5. `app/(tabs)/fuel.tsx`
Line 138: Replace `gradientColors={['#6D00FF', '#9D4EDD']}` with `gradientColors={['#6D00FF', '#4A00B0']}`.

### 6. `app/(tabs)/home.tsx`
Line 464: Replace `backgroundColor: '#a866ff'` with `backgroundColor: '#6D00FF'`.
Line 467: Replace `color="#a866ff"` with `color="#6D00FF"`.

### 7. `app/(modals)/genesis-chat.tsx`
Line 100: Replace `colors={['#6D00FF', '#a866ff']}` with `colors={['#6D00FF', '#4A00B0']}`.
Line 167: Replace `colors={['#6D00FF', '#a866ff']}` with `colors={['#6D00FF', '#4A00B0']}`.

### 8. `app/(auth)/onboarding.tsx`
Line 21: Replace `color: '#9D4EDD'` with `color: '#6D00FF'`.
Line 46: Replace `const PHASE_COLORS = ['#6D00FF', '#9D4EDD', '#7C3AED', '#5B21B6']` with `const PHASE_COLORS = ['#6D00FF', '#4A00B0', '#3D0099', '#2D0075']`.

### 9. `app/(screens)/season-complete.tsx`
Line 21: Replace `'#9D4EDD'` in CONFETTI_COLORS with `'#4A00B0'`.

### 10. `components/onboarding/GenesisGuide.tsx`
Line 64: Replace `colors={['#6D00FF', '#a866ff']}` with `colors={['#6D00FF', '#4A00B0']}`.
Line 83: Replace `color: '#a866ff'` with `color: '#6D00FF'`.

### 11. `components/training/PRCelebration.tsx`
Line 15: Replace `'#9D4EDD'` in CONFETTI_COLORS with `'#4A00B0'`.

### 12. `components/ui/GradientCard.tsx`
Line 13: Replace `colors={['#9D4EDD', '#6D00FF']}` with `colors={['#6D00FF', '#4A00B0']}`.

### 13. `components/ui/AnimatedWaterTracker.tsx`
Line 55: Replace `'#9D4EDD'` with `'#6D00FF'`.
Also check for any `rgba(157,78,221,...)` and replace with `rgba(109,0,255,...)` at same opacity.

### 14. `components/ui/ListItemCard.tsx`
Line 11: Replace entire `blue` variant:
```typescript
blue: { border: '#6D00FF', shadow: '#6D00FF', iconBg: '#6D00FF20', iconColor: '#6D00FF' },
```

### 15. `components/ui/WaterDots.tsx`
Line 14: Replace `bg-[#9D4EDD]` with `bg-[#6D00FF]`.

### 16. `components/ui/ProgressBar.tsx`
Line 19: Replace `gradientColors = ['#6D00FF', '#9D4EDD']` with `gradientColors = ['#6D00FF', '#4A00B0']`.

### 17. `components/ui/EmptyStateIllustration.tsx`
Line 14: Replace `gradient: ['#6D00FF', '#9D4EDD']` with `gradient: ['#6D00FF', '#4A00B0']`.
Line 16: Replace `gradient: ['#9D4EDD', '#7B2FBE']` with `gradient: ['#6D00FF', '#3D0099']`.

### 18. `components/ui/GlassCard.tsx`
Line 11: Replace `shadowColor: '#9D4EDD'` with `shadowColor: '#6D00FF'`.

### 19. `components/ui/MoodSelector.tsx`
Line 7: Replace `color: '#9D4EDD'` with `color: '#808080'` for the 'okay' mood (gray = truly neutral, not purple).

### 20. `data/mockData.ts`
Check if PHASE_CONFIG still has any `accentColor` with lavender values. If so, replace ALL `accentColor` values with `'#6D00FF'`.

---

## VERIFICATION

After all changes, run this grep to confirm ZERO lavender remains in source code:

```bash
grep -rn --include="*.ts" --include="*.tsx" --include="*.js" "#9D4EDD\|#B388FF\|#a866ff\|#7C3AED\|#7B2FBE" . | grep -v node_modules | grep -v docs/ | grep -v .claude/
```

Expected result: **ZERO matches**.

Also run `npx expo start` to verify the app compiles.

---

## COLOR PHILOSOPHY GOING FORWARD

```
#6D00FF   — THE accent. Period.
#4A00B0   — Gradient dark stop, pressed states
#3D0099   — Deep gradient, secondary depth
#FFFFFF   — Contrast accent (protein macro, text)
#808080   — Neutral (mood "okay", inactive states)

Semantic only:
#00F5AA   — Success, green states
#FFD93D   — Warning
#FF6B6B   — Error, danger
#F97316   — Fat macro, flame/streak icon

Background:
rgba(109, 0, 255, 0.10)  — Subtle violet tint
rgba(109, 0, 255, 0.25)  — Glass violet
rgba(109, 0, 255, 0.40)  — Active border
```

No pastels. No lavender. No soft purples. Dark, electric, aggressive.
