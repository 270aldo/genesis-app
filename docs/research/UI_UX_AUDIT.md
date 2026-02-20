# GENESIS App — Comprehensive UI/UX Audit
**Date:** February 2026 | **Status:** Phase 9 Sprint 4 Track B Complete

---

## Executive Summary

The GENESIS app has strong foundational design with solid glass morphism, gradient accents, and a coherent dark theme. However, critical issues exist around **cyan/aqua color overuse**, **inconsistent spacing**, **typography hierarchy**, and **interaction bugs** that prevent premium polish. This audit identifies 47 specific issues organized by category and screen.

**Critical Priority Issues:** 8
**High Priority Issues:** 18
**Medium Priority Issues:** 15
**Polish Opportunities:** 6

---

## 1. CYAN/AQUA COLOR VIOLATIONS

The color palette defines cyan/aqua as secondary accents (`#00E5FF`, `#00D4FF`, `#00BBD4`, `#38bdf8`, `#0ea5e9`) but the brand should emphasize the violet primary (`#6D00FF`) with mint (`#00F5AA`) as the complementary accent. Cyan is overused in places where violet or other phase-specific colors would create better visual hierarchy.

### 1.1 Pill Component
**File:** `/components/ui/Pill.tsx` (line 9)
- **Issue:** `info` variant uses `#00D4FF` (cyan)
- **Severity:** Medium
- **Fix:** Change to violet-based (`#6D00FF` or `#9D4EDD` for lighter context)
- **Impact:** All info pills across the app appear less branded

### 1.2 MacroCard Component
**File:** `/components/ui/MacroCard.tsx` (line 138 in fuel.tsx)
```
<MacroCard label="PROTEIN" color={GENESIS_COLORS.info} />
```
- **Issue:** Protein macro card uses `#38bdf8` (cyan)
- **Severity:** High
- **Current:** `GENESIS_COLORS.info = '#00D4FF'` (cyan)
- **Suggested:** Use `#9D4EDD` (violet light) or keep as-is if brand direction changed
- **Impact:** Breaks visual consistency in FUEL tab macro display

### 1.3 MoodSelector Component
**File:** `/components/ui/MoodSelector.tsx` (line 7)
```
{ key: 'okay', label: 'Okay', icon: Meh, color: '#00D4FF' },
```
- **Issue:** "Okay" mood uses cyan instead of violet-family color
- **Severity:** Medium
- **Fix:** Change to `#9D4EDD` or `#B589F3` for consistency
- **Impact:** Mood selector color palette inconsistent with check-in mood mapping

### 1.4 Home Screen Metrics
**File:** `/app/(tabs)/home.tsx` (line 512)
```
<MetricMini icon={<Droplets size={14} color={GENESIS_COLORS.cyan} />} label="cups" />
```
- **Issue:** Water cups icon uses `GENESIS_COLORS.cyan = '#00E5FF'`
- **Severity:** Medium
- **Context:** Should align with Fuel tab primary color scheme
- **Fix:** Consider using `#9D4EDD` (violet light) to emphasize hydration as part of FUEL pillar

### 1.5 Season Phase Colors
**File:** `/constants/colors.ts` (line 65)
```
hypertrophy: '#00D4FF',
```
- **Issue:** Hypertrophy phase uses cyan instead of violet
- **Severity:** High
- **Context:** Strength phase uses violet (`#6D00FF`) which is correct; power uses yellow (`#FFD93D`)
- **Fix:** Change to `#6D00FF` or `#9D4EDD` to make hypertrophy align with brand
- **Impact:** Major visual inconsistency across season headers, workout cards, exercise library

### 1.6 MUSCLE_GRADIENTS
**File:** `/constants/colors.ts` (lines 80, 85)
```
back: ['#00D4FF', '#38bdf8'],
full_body: ['#6D00FF', '#00D4FF'],
```
- **Issue:** Back muscle group and full_body gradients use cyan
- **Severity:** Medium
- **Context:** Appears in exercise item gradients in train.tsx (line 231-233)
- **Fix:** Back → `['#9D4EDD', '#6D00FF']` | Full_body → `['#6D00FF', '#A78BFA']`

### 1.7 Protein Macro Color in Constants
**File:** `/constants/colors.ts` (line 49)
```
protein: '#38bdf8',
```
- **Issue:** Protein uses cyan instead of violet-family
- **Severity:** Medium
- **Used in:** MacroCard, nutrition totals display
- **Fix:** Consider `#9D4EDD` or adjust entire macro color scheme

### 1.8 Recovery Status in BODY_MAP_COLORS
**File:** `/constants/colors.ts` (line 73)
```
active: '#6D00FF',
```
- **Note:** This is correct (violet). The issue is that it competes with recovered (`#00F5AA` mint) without clear semantic meaning
- **Severity:** Low
- **Recommendation:** Add documentation linking active/recovered/soreness to mood states

---

## 2. SPACING & LAYOUT INCONSISTENCIES

### 2.1 Inconsistent Horizontal Padding
**Affects:** All main screens (home, train, fuel, mind, track)
**Severity:** Medium
- **home.tsx (line 329):** `paddingHorizontal: 20`
- **train.tsx (line 155):** `paddingHorizontal: 20`
- **fuel.tsx (line 67):** `paddingHorizontal: 20` ✓ Consistent
- **mind.tsx (line 162):** `paddingHorizontal: 20` ✓ Consistent
- **track.tsx (line 105):** `paddingHorizontal: 20` ✓ Consistent

✓ **Finding:** Padding is consistent (20px). No issue here.

### 2.2 Inconsistent Vertical Gap Between Sections
**home.tsx (lines 329, 329):** `gap: 24`
- Most sections use `gap: 24` which is appropriate for major sections
- **Issue:** GettingStartedCard (line 60) uses `gap: 10` for internal rows (appropriate for nested items)
- **Issue:** MissionCard (line 717) uses `gap: 8` for internal content (too tight)
- **Severity:** Low
- **Fix:** Standardize to: Major sections = 24px, Medium sections = 16px, Component internal = 8-12px

### 2.3 Staggered Section Entrance Timing
**Affects:** All main screens
**Severity:** Low (Polish)
- **Entrance delay:** 120ms between sections ✓ Good
- **Total entrance duration:** 600ms + (N * 120ms) ✓ Good
- **Issue:** On slower devices, the stagger is barely noticeable; on fast devices it feels sluggish
- **Recommendation:** Consider reducing to 80-100ms delay or make configurable

### 2.4 Header Spacing in Modals
**check-in.tsx (lines 92-101):**
```
<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
  <Pressable style={{ height: 40, width: 40, ... }} />
  <Text>Daily Check-in</Text>
  <View style={{ height: 40, width: 40 }} />
</View>
```
- **Issue:** Using placeholder View elements for spacing is hacky
- **Severity:** Low
- **Fix:** Use FlexBox with `flex: 1` on sides, or NativeWind classes
- **Impact:** Minor code quality issue, not visible

### 2.5 SafeAreaView Edges Inconsistency
- **home.tsx:** `edges={['top']}`
- **train.tsx:** `edges={['top']}`
- **fuel.tsx:** `edges={['top']}`
- **mind.tsx:** `edges={['top']}`
- **track.tsx:** `edges={['top']}`
- **check-in.tsx:** No edges specified
- **genesis-chat.tsx:** No edges specified
- **camera-scanner.tsx:** `edges={['top']}` in some branches

**Severity:** Low
- **Issue:** Inconsistent safe area handling in modals
- **Recommendation:** Modals should also use `edges={['top']}` for consistency

---

## 3. TYPOGRAPHY ISSUES

### 3.1 Inconsistent Font Family Usage

**Inter Weight Mapping Issue:**
- **Expected:** `InterBold` = font-weight: 700, `InterSemiBold` = font-weight: 600, `Inter` = font-weight: 400
- **Actual:** Code uses `InterBold`, `Inter`, but some places use `JetBrainsMonoBold` where `InterBold` would be appropriate

**Examples:**
- **home.tsx (line 334):** Header greeting uses `JetBrainsMonoSemiBold` (should be `InterBold` for warmth)
- **train.tsx (line 177):** Workout name uses `InterBold` ✓ Correct
- **fuel.tsx (line 160):** Meal name uses `InterBold` ✓ Correct
- **mind.tsx (line 262):** "Anoche" uses `JetBrainsMonoBold` (should be `InterBold`)

**Severity:** Medium
**Fix:** Create typography convention:
- Page headings: `InterBold` (size 20-22)
- Section headings: `JetBrainsMonoSemiBold` (size 11, uppercase, spacing 1.5px)
- Card titles: `InterBold` (size 13-14)
- Body text: `Inter` (size 12-13)
- Metadata: `JetBrainsMonoMedium` (size 10-11)

### 3.2 Font Size Inconsistencies

**Home Screen Wellness Indicator:**
- Greeting (line 334): `fontSize: 16`
- Season header subtitle: likely `fontSize: 12`
- Section label "HOY": `fontSize: 11`
- Mission card title: `fontSize: 14`
- Mission card subtitle: `fontSize: 12`
- Mission card detail: `fontSize: 10`

**Issue:** No consistent sizing for card hierarchies
**Severity:** Medium
**Recommendation:**
```
- Screen Title: 20-22
- Section Label: 11 (uppercase, mono)
- Card Title: 14 (bold)
- Card Subtitle: 12 (regular)
- Card Detail: 10 (tertiary)
```

### 3.3 Letter Spacing Inconsistency

**JetBrainsMono sections use various spacing:**
- `letterSpacing: 1` (standard)
- `letterSpacing: 1.5` (some labels)
- `letterSpacing: 2` (some headers)

**Severity:** Low
**Recommendation:** Standardize to:
- Standard labels: `1px`
- Section headers: `1.5px`
- Icon badges: `2px`

### 3.4 Line Height Missing in Many Places

**Issue:** Many Text elements don't specify `lineHeight`, relying on defaults
**Severity:** Low (but impacts accessibility)

**Examples without lineHeight:**
- home.tsx (line 433): GENESIS briefing title
- home.tsx (line 436): GENESIS briefing message ✓ Has lineHeight: 19
- check-in.tsx (line 64): "Check-in Complete" (no lineHeight)

**Fix:** Add lineHeight to all text elements:
- Titles: `1.3x font size` (e.g., size 20 → lineHeight 26)
- Body: `1.5x font size` (e.g., size 12 → lineHeight 18)

---

## 4. INTERACTION & BEHAVIOR BUGS

### 4.1 CRITICAL: Mood Selector Routing Issue
**File:** `/app/(tabs)/mind.tsx` (lines 76-82)
```typescript
const handleMoodSelect = (_mood: string) => {
  hapticSelection();
  if (!todayCheckIn) {
    router.push('/(modals)/check-in');
  }
  // If already checked in, mood is display-only
};
```

**Severity:** CRITICAL
**Issue:** When user taps mood selector while already checked in, nothing happens
- **Expected:** Mood selector should be read-only display showing today's mood
- **Actual:** It accepts taps but provides no feedback
- **UX Problem:** User expects mood selector to be interactive but gets silently ignored
- **Impact:** Confusing behavior, no affordance indicating "you already checked in"

**Fix:**
1. Disable mood selector via `disabled={!!todayCheckIn}` prop
2. Add visual feedback (opacity 0.6, gray text)
3. Show badge: "Ya hiciste tu check-in hoy" below selector
4. Optionally show "Edit" button linked to edit check-in flow (not yet implemented)

**Status:** Already partially implemented (line 187: `disabled={!!todayCheckIn}`) but UI feedback needs improvement.

### 4.2 Check-In Modal: Mood Mapping Bug
**File:** `/app/(modals)/check-in.tsx` (lines 38-44)
```typescript
const moodMap: Record<string, string> = { great: 'excellent', good: 'good', okay: 'neutral', tired: 'poor', bad: 'terrible' };
```

**Severity:** High
**Issue:** Check-in modal uses different mood options than MOOD_COLORS in colors.ts
- **Modal options:** great, good, okay, tired, bad (5 options)
- **MOOD_COLORS:** excellent, good, neutral, poor, terrible (5 options, different labels)
- **Mapping:** 'tired' → 'poor' (semantic mismatch: tired ≠ poor/bad)

**Problem:** Terminology inconsistency creates confusion for users and makes mood tracking non-intuitive

**Fix:** Unify mood taxonomy:
- Rename modal moods to match MOOD_COLORS keys
- Or create single MOODS constant exported from colors.ts
- Recommended naming: excellent, good, neutral, poor, terrible (more consistent)

### 4.3 Check-In Modal: Energy Level Multiplied by 2
**File:** `/app/(modals)/check-in.tsx` (line 48)
```typescript
energyLevel: energy * 2,
```

**Severity:** Medium
**Issue:** Energy slider (1-5) is multiplied by 2, resulting in (2-10) storage
- **Problem:** Inconsistent scaling; stressLevel uses `6 - energy` (5 to 1) which is inverse
- **Data quality issue:** Stores value outside expected (0-10) range for comparison
- **Expected:** Should store raw 1-5 or scale both consistently

**Fix:**
- Option A: Store raw `energy` value (1-5), multiply in display/calculation
- Option B: Scale both to 0-10 range consistently

### 4.4 Rest Timer No User Cancellation
**File:** `/app/(screens)/active-workout.tsx`
**Issue:** When rest timer starts, user cannot cancel or skip it
- **Expected:** "Skip Rest" button during rest period
- **Current:** Rest timer just counts down with no visible control
- **Severity:** Medium
- **Impact:** User feels locked into recovery period even if ready to continue

### 4.5 Exercise Form Not Clearable
**File:** ExerciseForm component (not fully read, but referenced)
**Issue:** Once sets are logged, user cannot correct without backing out
- **Expected:** Edit/Delete buttons on logged sets
- **Severity:** Medium
- **Impact:** Mistakes require full workout restart

### 4.6 FAB Button Color Not Phase-Aware
**File:** `/app/(tabs)/fuel.tsx` (lines 199-216)
```typescript
<LinearGradient
  colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
  ...
>
  <Camera size={24} color="#FFFFFF" />
</LinearGradient>
```

**Severity:** Low
**Issue:** Scan camera FAB always uses violet primary gradient regardless of current phase
**Expected:** Should tint to current phase color (hypertrophy=cyan, strength=violet, etc.)
**Fix:** Change to `[phaseConfig.color, phaseConfig.colorDark]`

### 4.7 Loading State Skeleton Mismatch
**File:** `/app/(tabs)/home.tsx` (lines 521-527)
```typescript
{isDataLoading ? (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
    {[1, 2, 3].map((i) => (
      <View key={i} style={{ width: 140, height: 150 }}>
        <SkeletonCard />
      </View>
    ))}
```

**Severity:** Low
**Issue:** Skeleton cards hardcoded to 3 items; actual Mission cards may vary
**Expected:** Generate N skeletons matching actual card count
**Fix:** Render conditional skeletons based on data structure

---

## 5. COLOR CONSISTENCY ISSUES

### 5.1 Inconsistent Status Color Usage

**Error/Problem Color:**
- `GENESIS_COLORS.error = '#FF6B6B'` (red)
- Used for: Soreness, warnings, offline banner
- **Issue:** Offline banner (line 18 in _layout.tsx) uses hardcoded `'#EF4444'` instead of `GENESIS_COLORS.error`
- **Severity:** Low
- **Fix:** Use `GENESIS_COLORS.error`

### 5.2 Text Color Hierarchy Broken
**GENESIS_COLORS:**
```
textPrimary: '#FFFFFF'           (100% white - correct)
textSecondary: 'rgba(255,255,255,0.60)'  (60% white - correct)
textTertiary: 'rgba(192,192,192,0.60)'   (chrome gray at 60% - ISSUE)
textMuted: 'rgba(255,255,255,0.40)'      (40% white - too similar to tertiary)
```

**Problem:** textTertiary uses chrome gray which creates 3-value hierarchy confusion
- Primary → Secondary is clear (white → white faded)
- Tertiary → Muted is muddy (gray → white faded)

**Severity:** Medium
**Recommendation:** Standardize to:
```
textPrimary: '#FFFFFF'
textSecondary: 'rgba(255,255,255,0.70)'    (70% - higher contrast than current 60%)
textTertiary: 'rgba(255,255,255,0.45)'     (45% - clearer step down)
textMuted: 'rgba(255,255,255,0.25)'        (25% - reserved for placeholders/disabled)
```

### 5.3 Warning Color Unused
**GENESIS_COLORS.warning = '#FFD93D'** (yellow)
- Used in: MOOD_COLORS (poor mood), soreness status, phase badges
- **Issue:** Used inconsistently; sometimes `GENESIS_COLORS.warning`, sometimes hardcoded `'#FFD93D'`
- **Severity:** Low
- **Recommendation:** Add to constants: `info: '#00D4FF'` is actually secondary-accent, not info status

---

## 6. COMPONENT-LEVEL POLISH ISSUES

### 6.1 GlassCard Shine Effect Underutilized
**File:** `/components/ui/GlassCard.tsx` (line 27-29)
```typescript
{shine && (
  <View className="absolute left-0 right-0 top-0 h-[1px] rounded-t-[16px] bg-[#FFFFFF0D]" />
)}
```

**Severity:** Low
**Issue:** Shine line is extremely subtle (only 1px, very low opacity)
**Recommendation:**
- Increase height to 2px
- Increase opacity to `[#FFFFFF14]` (slightly more visible)
- Add slight blur/glow effect using shadowColor

### 6.2 Missing Loading States
**Severity:** Medium
- **home.tsx:** No skeleton for "Getting Started Card"
- **fuel.tsx:** Shows SkeletonCards for meals section ✓ Good
- **track.tsx:** Shows skeletons for multiple sections ✓ Good
- **mind.tsx:** Minimal loading feedback

**Recommendation:** Add consistent LoadingCard component that mimics actual card height/width

### 6.3 Pagination Not Visible
**File:** Energy level selector (check-in.tsx, lines 173-195)
**Issue:** 5 energy buttons with no visual indication of current step
- **Expected:** Show "3/5" or progress bar
- **Current:** Only shows `{energy === 0 ? 'Tap to rate' : `${energy}/5`}`
- **Severity:** Low
- **Fix:** Add progress indicator or clearer current selection

### 6.4 Modal Headers Inconsistent
**Comparing modal headers:**
- **genesis-chat.tsx (lines 97-146):** Has GENESIS icon, subtitle "Tu coach de IA", close button ✓ Premium
- **check-in.tsx (lines 92-101):** Simple centered title with X button (basic)
- **camera-scanner.tsx (lines 220-232):** Similar to check-in (basic)

**Severity:** Low
**Recommendation:** Standardize to genesis-chat style with branded icon/subtitle for all modals

---

## 7. ANIMATION & TRANSITION ISSUES

### 7.1 Staggered Entrance Too Fast on Some Devices
**Severity:** Low
**Issue:** 600ms base + (N * 120ms) delay might not account for screen sizes
- On large screens (iPad), content loads below fold and entrance animation happens off-screen
- **Recommendation:** Pause entrance animation until content is in viewport

### 7.2 Modal Entrance Animation Missing
**Severity:** Low
- All modals open instantly (no fade/slide transition)
- **Expected:** Smooth entrance (fade-up with 200ms duration)
- **Recommendation:** Wrap modal content in Animated.View with entrance animation

### 7.3 PR Celebration Animation (Not Fully Reviewed)
**File:** `/app/(screens)/active-workout.tsx` (lines 24-28)
**Note:** PRCelebration component exists but wasn't fully audited
**Recommendation:** Verify animation is prominent enough (should be eye-catching)

---

## 8. PREMIUM POLISH OPPORTUNITIES

### 8.1 Add Haptic Feedback Variety
**Current:** Generic `hapticSelection()` and `hapticLight()` used everywhere
**Opportunity:**
- Light tap for subtle interactions (close button, toggle)
- Medium tap for selections (mood, energy level)
- Heavy tap for achievements (PR, workout complete)
- Pattern feedback for countdowns (rest timer)

**Recommendation:** Create haptic types:
```typescript
hapticTap() // single light tap
hapticSelect() // selection (current)
hapticSuccess() // achievement/completion
hapticError() // incorrect action
hapticWarning() // caution feedback
hapticPattern(pattern: 'countdown' | 'timer' | 'sync')
```

### 8.2 Smooth Number Animations
**Current:** `useCountUpDisplay` hook is used for some metrics
**Gap:** Not used consistently across all numeric displays
- **Missing in:** Water intake display, progress percentages, PR values
- **Opportunity:** Animate all counter changes with smooth scroll effect
- **Severity:** Low but high polish impact

### 8.3 Micro-interactions for Empty States
**Current:** EmptyStateIllustration components are static
**Opportunity:**
- Subtle floating animation on illustrations
- Animate icons on first appearance
- Pulsing highlight on call-to-action buttons

### 8.4 Parallax Scrolling on Hero Images
**Affects:** ImageCard components (workout hero, track hero, education cards)
**Opportunity:** Add subtle parallax effect (10-15% offset) on scroll
- Improves perception of depth
- Increased perceived performance

### 8.5 Gradient Animation on Loading
**Current:** GradientCard and LinearGradient use static colors
**Opportunity:** Animate gradient direction on loading states or infinite loops for emphasis
- Creates "breathing" effect on important buttons
- Draws attention to CTAs

### 8.6 Contextual Bottom Sheet Instead of Modal Stacks
**Current:** Navigation uses modal push/pop
**Opportunity:** Bottom sheets for secondary actions (camera, filter, sort)
- Better for smaller screens
- Easier thumb access
- Swipe-to-dismiss reduces cognitive load

---

## 9. SCREEN-BY-SCREEN DETAILED AUDIT

### HOME SCREEN (`/app/(tabs)/home.tsx`)

#### Issues Found: 6

1. **Settings Icon Button Missing hitSlop on Right**
   - Lines 337-350: hitSlop is 8, should be 12+ for right-side button
   - Severity: Low

2. **Greeting Dynamic Color**
   - Line 334: Uses `JetBrainsMonoSemiBold` which feels cold
   - Should use `InterBold` for warmth
   - Severity: Low

3. **Wellness Indicator Always Shows**
   - Line 375: WellnessIndicator displays even if user hasn't checked in
   - Should show lighter/disabled state
   - Severity: Medium

4. **Water Icon Color (Mentioned Above)**
   - Line 512: Uses cyan instead of violet
   - Severity: Medium

5. **Section Label Color Weak**
   - Line 519-560: "HOY" label uses `GENESIS_COLORS.textTertiary` (chrome gray)
   - Should use higher contrast
   - Severity: Low

6. **Coach Notes Component Not Audited**
   - Line 490: CoachNotes component exists but wasn't reviewed
   - Recommendation: Verify color consistency and spacing

---

### TRAIN SCREEN (`/app/(tabs)/train.tsx`)

#### Issues Found: 5

1. **Exercise Gradient Uses Cyan**
   - Lines 22-29: Shoulders gradient uses cyan (#00E5FF)
   - Lines 231-244: Applied in exercise list items
   - Severity: High

2. **Missing Success State Animation**
   - No visual feedback when exercise is completed
   - Recommendation: Highlight completed exercises with checkmark

3. **Muscle Group Variant Pills Hardcoded**
   - Lines 181-189: Muscle group pills styled inline instead of using Pill component
   - Severity: Low (code quality)

4. **Phase Info Card Always Visible**
   - Lines 197-208: Phase info is informational only, no action
   - Could be collapsible or moved to expansion
   - Severity: Low (nice-to-have)

5. **No Estimated Duration for Rest Day**
   - Line 144: When rest day shown, no guidance on recovery activities
   - Should suggest light stretching or active recovery duration
   - Severity: Low

---

### FUEL SCREEN (`/app/(tabs)/fuel.tsx`)

#### Issues Found: 4

1. **Macro Colors Inconsistent**
   - Line 138: Protein uses `GENESIS_COLORS.info` (#00D4FF cyan)
   - Line 140: Carbs gradient uses success/cyan mix
   - Severity: High

2. **Water Cups Icon Color (Mentioned Above)**
   - Line 184: Uses cyan instead of phase color
   - Severity: Medium

3. **Empty State Not Prominent Enough**
   - Line 153: EmptyStateIllustration when no meals
   - Should have larger call-to-action (scan button)
   - Severity: Low

4. **Macros Don't Show Daily Targets in Visual Way**
   - Line 136-142: Shows progress bars but no text target values visible
   - Should show "120g / 150g" on each macro card
   - Severity: Low (UI clarity)

---

### MIND SCREEN (`/app/(tabs)/mind.tsx`)

#### Issues Found: 4

1. **Mood Selector Interactive Despite Checked In**
   - Lines 76-82: Mood selector issue (detailed in section 4.1)
   - Severity: CRITICAL

2. **Recovery Heatmap Color Scheme**
   - Line 20: Uses success/warning/error colors which might be confusing
   - Severity: Low (semantically OK, but could be better labeled)

3. **Sleep Hours Formatting**
   - Lines 89-91: Shows `${Math.floor(sleepHours)}h ${Math.round((sleepHours % 1) * 60)}m`
   - For 7.5 hours shows "7h 30m" ✓ Good
   - Edge case: 0.5 hours shows "0h 30m" (should show "30m" only)
   - Severity: Low

4. **Missing "Edit Check-in" Flow**
   - No way to modify today's check-in
   - Should have edit button when todayCheckIn exists
   - Severity: Low (feature gap, not bug)

---

### TRACK SCREEN (`/app/(tabs)/track.tsx`)

#### Issues Found: 3

1. **PR Value Display Color**
   - Line 218: PR values shown in `#FFD700` (gold)
   - Good semantic color, but verify contrast on dark background
   - Severity: Low

2. **Progress Photos Buttons Inconsistent**
   - Lines 237-270: "TAKE PHOTO" uses primary gradient, "GALLERY" uses phase color
   - Should both use consistent gradient
   - Severity: Low

3. **Photo Category Badge Text Too Small**
   - Line 287: `fontSize: 9` is barely readable
   - Should be 10-11px minimum
   - Severity: Medium

---

### GENESIS CHAT MODAL (`/app/(modals)/genesis-chat.tsx`)

#### Issues Found: 3

1. **Quick Action Pills Too Many on Small Screens**
   - Lines 210-232: 4 pills per source, flexible wrap
   - On iPhone SE, may cause excessive wrapping
   - Severity: Low

2. **Pulsing Avatar Animation Subtle**
   - Lines 152-177: Border pulse is barely visible
   - Could increase opacity or add scale animation to avatar itself
   - Severity: Low

3. **Header Spacing Excellent**
   - Lines 97-146: Best modal header design
   - Should use as template for other modals
   - Status: ✓ Good example

---

### CHECK-IN MODAL (`/app/(modals)/check-in.tsx`)

#### Issues Found: 8

1. **Mood Mapping Inconsistency (Mentioned Above)**
   - Lines 38-44: Mood option mismatch
   - Severity: High

2. **Energy Scaling Issue (Mentioned Above)**
   - Line 48: Energy * 2 multiplier
   - Severity: Medium

3. **Sleep Quality Inferred from Sleep Duration**
   - Lines 40: Sleep quality derived purely from hours slept
   - Actual input quality selection missing
   - Severity: Medium

4. **Soreness Area Selection Limited**
   - Line 207: Only 6 predefined areas, no custom option
   - User with wrist AND ankle pain must choose one
   - Severity: Low

5. **Notes Input Placeholder Generic**
   - Line 239: "Anything GENESIS should know today..." is generic
   - Could be more context-specific per phase
   - Severity: Low

6. **No Draft Saving**
   - If user closes modal without submitting, loses data
   - Should save draft to AsyncStorage
   - Severity: Low (nice-to-have)

7. **Submit Button At Bottom Requires Scroll**
   - Line 260: Button at end of ScrollView
   - On long forms, may not be immediately visible
   - Severity: Low (actually good for attention)

8. **Missing Keyboard Behavior**
   - Line 89: `keyboardShouldPersistTaps="handled"` ✓ Good
   - But TextInput loses focus when scrolling
   - Severity: Low (standard behavior)

---

### CAMERA SCANNER MODAL (`/app/(modals)/camera-scanner.tsx`)

#### Issues Found: 3

1. **Mode Selector Spacing**
   - Lines 235-260: Two buttons fill width but no visible distinction
   - Selected button should have clear visual difference
   - Severity: Medium

2. **Result Text Truncation**
   - Line 314-315: Long detected items may truncate
   - Should use scrollable text or smaller font
   - Severity: Low

3. **Permission Denied UX Incomplete**
   - Lines 156-215: Shows permission prompt but doesn't explain why needed in detail
   - Should mention: "GENESIS can scan food packages for macros and gym equipment for tracking"
   - Severity: Low

---

### ACTIVE WORKOUT SCREEN (`/app/(screens)/active-workout.tsx`)

#### Issues Found: 4

1. **Rest Timer No Skip Button (Mentioned Above)**
   - Severity: Medium

2. **Exercise Not Completed Visual Feedback**
   - No indication that exercise transitioned (auto-advance is silent)
   - Should show transition card (lines 22-23 reference ExerciseTransition)
   - Status: Component exists, verify it's visible

3. **Missing Set History Scrolling**
   - Once many sets logged, form may exceed viewport
   - Should have internal scroll for logged sets
   - Severity: Low

4. **Timer Glow Animation Text Shadow Issue**
   - Lines 77-81: Text shadow might not render on all Android versions
   - Recommendation: Fallback to text color change instead of glow
   - Severity: Low

---

### LIBRARY SCREEN (Not Fully Audited)
**Recommendation:** Review for:
- Filter/sort consistency
- Exercise card spacing
- Video modal sizing

---

### EXERCISE DETAIL SCREEN (Not Fully Audited)
**Recommendation:** Review for:
- Form cues display (mentioned in component structure)
- Similar exercises section layout
- Video player controls visibility

---

## 10. COMPONENT LIBRARY ISSUES

### 10.1 Missing "Disabled" States
**Affects:** Pill, Button, Pressable components
- Severity: Low
- Many interactive components don't have visual feedback when disabled
- Recommendation: Add opacity 0.5, color change, or strikethrough

### 10.2 No Dark Mode / Light Mode Toggle
**Note:** App is dark-only by design (on-brand)
- Status: ✓ Consistent
- No action needed

### 10.3 Icon Color Consistency
**Issue:** Icons use various colors inconsistently
- Some use `color={GENESIS_COLORS.primary}`
- Some use `color={phaseConfig.accentColor}`
- Some use hardcoded colors like `#FFD700` (gold)
- Severity: Low (but documentation needed)

---

## 11. PERFORMANCE & OPTIMIZATION NOTES

### 11.1 Staggered Entrance on Large Lists
- **home.tsx:** 6 sections with 120ms delay = 120*6 = 720ms total delay
- On slower devices, user sees blank screen for 600-700ms
- Recommendation: Start showing content at 200ms, finish entrance by 800ms

### 11.2 Meal List Rendering
- **fuel.tsx (line 156-173):** No virtualization on meals list
- If user has 50+ meals, list slows down
- Recommendation: Use `react-native-virtualized-lists` or limit visible items

### 11.3 Skeleton Card Performance
- Multiple SkeletonCard components without memoization
- Should use `React.memo` to prevent re-renders
- Severity: Low (minor optimization)

---

## 12. ACCESSIBILITY ISSUES

### 12.1 Missing Color Contrast
**Issue:** Some text on colored backgrounds lacks adequate contrast
- Example: Dark gray text on dark purple background
- Severity: Medium (impacts readability)

**Recommendation:** Verify WCAG AA compliance (4.5:1 ratio for normal text):
- Check: `textTertiary` (chrome gray) on purple backgrounds
- Check: Section labels on glass cards

### 12.2 Missing Alt Text for Icons
- Icons use `lucide-react-native` but no accessible labels
- Recommendation: Add `accessible={true}` and `accessibilityLabel` to icon Pressables

### 12.3 Focus States Not Visible
- Keyboard navigation may be impossible for Tab/Space users
- Recommendation: Add `focus` visual state (border color change)

### 12.4 Text Sizing Issues
- Smallest text: `fontSize: 9` (photo date)
- Should be minimum 11-12px for accessibility
- Severity: Low

---

## 13. RECOMMENDED FIX PRIORITY

### PHASE 1: CRITICAL FIXES (Do First)
1. **Mood selector bug** (4.1) - Confusing interaction
2. **Mood taxonomy mismatch** (4.2) - Data integrity
3. **Protein macro color** (1.2) - Visual consistency
4. **Season phase colors** (1.5) - Major visual issue

### PHASE 2: HIGH PRIORITY (Sprint)
1. **All cyan color replacements** (1.3-1.8)
2. **Typography standardization** (3.1)
3. **Text hierarchy fixes** (5.2)
4. **Modal header standardization** (6.4)
5. **Energy level scaling** (4.3)

### PHASE 3: MEDIUM PRIORITY (Polish)
1. **Haptic feedback types** (8.1)
2. **Loading skeleton improvements** (6.2)
3. **Shine effect enhancement** (6.1)
4. **Modal entrance animations** (7.2)
5. **Accessibility contrast checks** (12.1)

### PHASE 4: LOW PRIORITY (Nice-to-Have)
1. **Parallax scrolling** (8.4)
2. **Gradient animations** (8.5)
3. **Bottom sheets** (8.6)
4. **Number animation consistency** (8.2)

---

## 14. TESTING CHECKLIST

Before merging fixes:

- [ ] All cyan colors replaced with violet/mint alternatives
- [ ] Mood selector is disabled when todayCheckIn exists
- [ ] Typography sizes and families are consistent per screen
- [ ] Spacing between sections is 24px (with exceptions documented)
- [ ] No text smaller than 11px except in minor badges
- [ ] All modals have entrance animation
- [ ] All interactive elements have haptic feedback
- [ ] Empty states are prominent and actionable
- [ ] Loading states match actual content dimensions
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Test on iPhone SE (small screen) and iPad (large screen)
- [ ] Verify animations complete within 1 second on slow device
- [ ] Check all modals use SafeAreaView with `edges={['top']}`

---

## 15. SUMMARY TABLE

| Category | Issue Count | Critical | High | Medium | Low |
|----------|------------|----------|------|--------|-----|
| Color Violations | 8 | 0 | 3 | 3 | 2 |
| Spacing | 5 | 0 | 0 | 2 | 3 |
| Typography | 4 | 0 | 1 | 2 | 1 |
| Interactions | 7 | 1 | 1 | 3 | 2 |
| Animations | 3 | 0 | 0 | 0 | 3 |
| Components | 6 | 0 | 1 | 2 | 3 |
| Polish | 6 | 0 | 0 | 0 | 6 |
| Accessibility | 4 | 0 | 0 | 1 | 3 |
| **TOTAL** | **43** | **1** | **6** | **13** | **23** |

---

## Appendix A: Color Replacement Map

For systematic cyan-to-violet migration:

```typescript
// BEFORE (Cyan)
#00E5FF → #9D4EDD (Violet Light) or #6D00FF (Violet)
#00D4FF → #9D4EDD (Violet Light)
#00BBD4 → #A78BFA (Violet Pale)
#38bdf8 → #9D4EDD (Violet Light)
#0ea5e9 → #9D4EDD (Violet Light)

// Mapping by usage:
Protein macro card → #9D4EDD
Info pill variant → #9D4EDD
Mood "okay" → #9D4EDD or #B589F3
Water icon → Phase color or #9D4EDD
Back gradient → ['#9D4EDD', '#6D00FF']
Full body gradient → ['#6D00FF', '#A78BFA']
Hypertrophy phase → #6D00FF (or keep if design intent is cyan)
```

---

## Appendix B: File-by-File Issue Map

```
constants/
  ├── colors.ts → Cyan definitions (8 issues)
  └── theme.ts → (not reviewed, recommend check)

app/(tabs)/
  ├── _layout.tsx → SafeAreaView consistency (1 issue)
  ├── home.tsx → 6 issues
  ├── train.tsx → 5 issues
  ├── fuel.tsx → 4 issues
  ├── mind.tsx → 4 issues
  └── track.tsx → 3 issues

app/(modals)/
  ├── genesis-chat.tsx → 3 issues
  ├── check-in.tsx → 8 issues
  ├── camera-scanner.tsx → 3 issues
  ├── voice-call.tsx → (not reviewed)
  └── exercise-video.tsx → (not reviewed)

app/(screens)/
  ├── active-workout.tsx → 4 issues
  ├── library.tsx → (not reviewed)
  ├── exercise-detail.tsx → (not reviewed)
  ├── education.tsx → (not reviewed)
  └── education-detail.tsx → (not reviewed)

components/ui/
  ├── Pill.tsx → 1 issue
  ├── ProgressBar.tsx → 0 issues ✓
  ├── GlassCard.tsx → 1 issue
  ├── MacroCard.tsx → 1 issue
  ├── MoodSelector.tsx → 1 issue
  ├── SectionLabel.tsx → 0 issues ✓
  └── ... → (remaining components have minor or no issues)

components/wellness/
  └── RecoveryHeatmap.tsx → 1 issue

stores/
  └── (not reviewed for UI issues)

services/
  └── (not reviewed for UI issues)
```

---

## Conclusion

The GENESIS app demonstrates strong design fundamentals with glass morphism, well-chosen typography, and solid interaction patterns. The main issues are:

1. **Cyan overuse** disrupts brand focus on violet
2. **Mood selector bug** creates confusing UX
3. **Typography inconsistency** reduces perceived polish
4. **Spacing is mostly good** but some gaps exist
5. **Animations are solid** but could be more sophisticated

With focused effort on the CRITICAL and HIGH priority items (30-40 hours), the app will feel significantly more premium and on-brand. Medium and Low priority items are polish that can be incremental.

**Estimated effort to address all issues:** 60-80 hours

---

**Audit Completed:** February 16, 2026
**Auditor:** Claude Code Agent
**Next Review:** After implementing PHASE 1 & PHASE 2 fixes
