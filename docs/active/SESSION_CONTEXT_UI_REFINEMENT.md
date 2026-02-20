# SESSION CONTEXT — GENESIS UI/UX Visual Refinement

> **Purpose**: This document preserves the complete context of the UI/UX refinement work so any new conversation can continue seamlessly.
> **Last updated**: Feb 18, 2026
> **Status**: TRAIN tab first page ✅ complete. HOME, FUEL, MIND, TRACK pending.

---

## 1. What We're Doing

Aldo (CEO/founder of NGX) is conducting a **section-by-section visual refinement** of the GENESIS fitness app — going through every tab and every sub-page to elevate the UI/UX to a premium, cohesive level before public release. The approach is methodical: one tab at a time, page by page, with Aldo providing screenshots and specific feedback at each step.

**Read `CLAUDE.md` first** — it has the full project structure, tech stack, and architecture.

---

## 2. Design Language (ESTABLISHED — The "Law")

After iterating on the TRAIN tab, we established this universal design language for **every card/surface** in the app:

### Card Pattern
```
backgroundColor: '#000000'        // Solid black, NOT transparent/glass
borderWidth: 1
borderColor: '#6D00FF'            // GENESIS_COLORS.primary (violet)
borderRadius: 16                  // or 20 for larger cards
padding: 14-20
```

### Typography
- **Headers/Labels**: `fontFamily: 'JetBrainsMonoBold'` or `'JetBrainsMonoSemiBold'`, color `#FFFFFF`
- **Body text**: `fontFamily: 'Inter'`, color `GENESIS_COLORS.textSecondary` (rgba 60% white)
- **Tertiary**: `fontFamily: 'JetBrainsMonoMedium'`, color `GENESIS_COLORS.textTertiary`
- **Section labels**: ALL CAPS, `JetBrainsMonoMedium`, `letterSpacing: 1.5`, tertiary color

### Color Rules
- **Only accent color**: `#6D00FF` (violet) — used for borders, icons, active states, badges
- **No multi-color icons**: ALL icons should be white (`#FFFFFF`) or violet (`#6D00FF`). NO red, blue, teal, orange, green icons for decoration.
- **Exception**: Functional status indicators (green `#00F5AA` for "recovered/success", orange `#F97316` for warnings, red `#FF6B6B` for errors) — these communicate state, not decoration.

### What to Replace
| Old Pattern | New Pattern |
|---|---|
| `GENESIS_COLORS.surfaceCard` bg | `'#000000'` |
| `GENESIS_COLORS.borderSubtle` border | `GENESIS_COLORS.primary` |
| Colored icons (red flame, blue moon, teal drops) | White `#FFFFFF` icons |
| `LinearGradient` colored card backgrounds | Solid `#000000` + violet border |
| `GlassCard` with default styling | `GlassCard` + `style={{ backgroundColor: '#000000', borderColor: GENESIS_COLORS.primary, borderWidth: 1 }}` |
| Left accent bars | Full violet border (the border IS the accent) |
| Phase-specific card colors | Always `#6D00FF` violet border |

### Key File: `constants/colors.ts`
```typescript
GENESIS_COLORS.primary = '#6D00FF'
GENESIS_COLORS.surfaceCard = 'rgba(10, 10, 10, 0.85)'  // ← OLD, replace with #000000
GENESIS_COLORS.borderSubtle = 'rgba(255, 255, 255, 0.08)'  // ← OLD, replace with primary
```

---

## 3. Completed Work — TRAIN Tab First Page

### Problem Solved: Missing Exercise Images
**Root cause**: The `exercises` table in Supabase has NO `image_url` column. The BFF returns `select("*")` which never includes images. The store mapped `row.image_url ?? ''` → always empty string → broken images everywhere.

**Solution**: Created `utils/exerciseImages.ts` — a fallback system with curated Unsplash images mapped by exercise name keywords and muscle groups. Priority: API URL → name match → muscle group → default.

### Files Created
- **`utils/exerciseImages.ts`** — Exercise image fallback system (165 lines). Exports `getExerciseImage()` and `getMuscleGroupImage()`.

### Files Modified

#### `stores/useTrainingStore.ts` (~line 248)
- Changed `fetchExerciseCatalog` to use `getExerciseImage()` when mapping API responses
- Before: `imageUrl: row.image_url ?? ''` (always empty)
- After: `imageUrl: getExerciseImage(name, mg, row.image_url)` (always valid URL)

#### `app/(tabs)/train.tsx` (complete rewrite of visual sections)
- **Phase Bar**: `backgroundColor: '#000000'`, `borderWidth: 1`, `borderColor: GENESIS_COLORS.primary`, white text showing phase · reps · sets · rest
- **Exercises section**: Header "TU RUTINA" (replaced "EJERCICIOS" + "Ver librería →"). Each exercise has a swap button (`ArrowLeftRight` icon) that navigates to exercise-detail with `?swap=true` param
- **GENESIS TIP Carousel**: New `GenesisTipCarousel` component with 25 tips (5 per phase: hypertrophy, strength, power, deload). Black bg + violet border. Arrow navigation, dot indicators, counter "1/5"
- **Camera CTA**: Black bg, violet border, white Camera icon, minimal text "Analiza tu técnica con IA"
- **Hero ImageCard**: Uses `getMuscleGroupImage()` fallback for workout hero
- Removed old library link ("Ver librería →")

#### `app/(screens)/_layout.tsx`
- Added `GenesisFAB` component so the GENESIS chat button appears on ALL screen routes (exercise-detail, library, active-workout, etc.), not just tabs

#### `app/(screens)/library.tsx`
- Added `getExerciseImage` import for image fallbacks

#### `app/(screens)/exercise-detail.tsx`
- Added `getExerciseImage` import for hero image and alternatives fallbacks

#### `components/cards/ImageCard.tsx`
- Added empty URL handling: checks `hasImage = imageUrl && imageUrl.trim().length > 0`
- Shows gradient placeholder when no valid image URL

#### `components/ui/ListItemCard.tsx`
- Complete style overhaul: solid `backgroundColor: '#000000'` + `borderWidth: 1` + `borderColor: colors.border` (violet for purple variant)
- Removed old NativeWind classes, left border accent, and shadows
- Clean inline styles throughout

### TypeScript Status
All changes compile clean with `npx tsc --noEmit`. One known non-blocking issue: web export fails with lightningcss native binary error (NativeWind/lightningcss known issue, doesn't affect mobile).

---

## 4. Pending Work — Section by Section

### 4A. HOME Tab (NEXT — Master Prompt ready)
**File**: `docs/active/MASTER_PROMPT_HOME_REFINEMENT.md`

Full detailed prompt with 9 specific sections to modify:
1. GENESIS Daily Briefing card → black bg, violet border, remove gradient overlay
2. Quick Metrics row (MetricMini) → black bg, violet border, ALL white icons
3. Mission Cards "HOY" → black bg, violet border, remove LinearGradient, violet icons
4. Proactive Insight → black bg, violet border, remove left accent bar
5. GENESIS RECOMIENDA empty state → black bg, violet border
6. ESTA SEMANA GlassCard → style override
7. RACHA GlassCard → style override, violet flame
8. WellnessIndicator → black bg, violet border always
9. Getting Started card → full violet border
10. ADD: HOME GENESIS TIP carousel (general daily tips)

### 4B. Exercise Detail Page (HIGH PRIORITY)
**File**: `app/(screens)/exercise-detail.tsx`
**Status**: Aldo explicitly said "es muy sencillo, podemos mejorarlo pero por muchisimo, esta seccion tambien es muy importante"
**Needs**:
- Full visual redesign to match black+violet language
- More content/sections (currently too simple)
- The swap feature (`?swap=true` param) should show alternatives prominently
- GenesisFAB already added via screens layout

### 4C. FUEL Tab
**File**: `app/(tabs)/fuel.tsx`
**Needs** (from Aldo's screenshots):
- Tip card → black bg, violet border
- Calorie ring → black bg card + violet progress arc
- Macros row → black bg, violet border
- ESCANEAR/AGREGAR buttons → both black bg + violet border (currently inconsistent)
- Interactive calorie ring (tap for breakdown)

### 4D. MIND Tab
**File**: `app/(tabs)/mind.tsx`
**Needs** (from screenshots):
- Check-in card → black bg, violet border, Spanish mood labels
- ESTADO DE RECOVERY grid → black bg + violet border (currently teal/green cards that clash)
- Bienestar card → same treatment
- Add GENESIS TIP carousel for recovery/mindset

### 4E. TRACK Tab
**File**: `app/(tabs)/track.tsx`
**Needs** (from screenshots):
- Season completion card → black bg + violet border (currently has white/light gradient that breaks dark theme)
- ESTADÍSTICAS row → black bg, violet border
- Progresion card → black bg, violet border
- Better empty states with PR/session cards

### 4F. Active Workout Screen
**File**: `app/(screens)/active-workout.tsx`
**Status**: Not yet reviewed, part of TRAIN section flow

### 4G. Library Screen
**File**: `app/(screens)/library.tsx`
**Status**: Images now work (fallback system). Visual style not yet updated to match black+violet.

---

## 5. Key Patterns & Technical Notes

### GlassCard Override Pattern
Don't modify `GlassCard.tsx` defaults (used everywhere). Use per-instance overrides:
```tsx
<GlassCard style={{ backgroundColor: '#000000', borderColor: GENESIS_COLORS.primary, borderWidth: 1 }}>
```

### GENESIS TIP Carousel Pattern
Reusable pattern from `train.tsx`:
```tsx
function GenesisTipCarousel({ tips, accentColor }: { tips: string[]; accentColor: string }) {
  // arrows, dots, counter, black bg, violet border
  // See train.tsx lines 417-486 for full implementation
}
```

### Zustand Anti-Pattern (CRITICAL)
NEVER call store methods inside Zustand selectors:
```tsx
// BAD - infinite re-render loop
const totals = useNutritionStore((s) => s.getDailyTotals());

// GOOD - read primitives, compute inline
const meals = useNutritionStore((s) => s.meals);
const totals = useMemo(() => meals.reduce(...), [meals]);
```

### Image Fallback Pattern
```tsx
import { getExerciseImage, getMuscleGroupImage } from '../../utils/exerciseImages';
// For exercises: getExerciseImage(name, muscleGroup?, existingUrl?)
// For muscle group cards: getMuscleGroupImage(muscleGroups[])
```

### GenesisFAB
- Already in `(tabs)/_layout.tsx` (covers all tab screens)
- Already in `(screens)/_layout.tsx` (covers all screen routes)
- Do NOT add it again — it's already everywhere

### File Structure Quick Reference
```
app/(tabs)/          # 5 main tabs: home, train, fuel, mind, track
app/(screens)/       # Full screens: settings, active-workout, library, exercise-detail, education
app/(modals)/        # Modals: genesis-chat, check-in, camera-scanner, voice-call
components/ui/       # Design system: GlassCard, ListItemCard, ProgressBar, WellnessIndicator, etc.
components/cards/    # ImageCard
components/genesis/  # GenesisFAB
constants/colors.ts  # GENESIS_COLORS
utils/exerciseImages.ts  # Image fallback system
stores/              # Zustand stores
```

---

## 6. Aldo's Communication Style

- Communicates in Spanish (respond in Spanish for proposals, English for code comments)
- Provides screenshots with numbered annotations for specific changes
- Prefers direct proposals: "qué propones?" — give concrete suggestions, not vague options
- Values speed and momentum: "vamos bien vamos avanzando"
- Wants premium feel, not "fitness app generic" — dark, minimal, violet accent
- Frustrated by broken images and incomplete polish — always verify TypeScript compiles
- Key phrase: "me cachas?" = "you get me?" / "are you following?"

---

## 7. How to Continue

1. Read `CLAUDE.md` at project root
2. Read THIS document for full context
3. For HOME tab specifically: read `docs/active/MASTER_PROMPT_HOME_REFINEMENT.md`
4. Execute changes one section at a time
5. Run `npx tsc --noEmit` after each batch of changes
6. Ask Aldo for screenshots when moving to a new tab/page
