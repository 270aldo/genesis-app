# GENESIS UI Design Quick Reference
## Implementation Checklist for 2025-2026 Premium Fitness Standards

---

## Color System (Copy-Paste Ready)

```typescript
// constants/colors.ts
export const COLORS = {
  // Background
  bg_primary: '#0D0D2B',      // Dark purple, main background
  bg_secondary: '#1A1A3E',    // Slightly lighter for cards
  bg_tertiary: '#242450',     // Nested elements

  // Accent (SPARSE USE ONLY)
  accent_primary: '#6D00FF',  // Violet, CTAs
  accent_hover: '#7D1FFF',    // Hover state
  accent_active: '#5D00DD',   // Press state

  // Text
  text_primary: '#FFFFFF',    // White
  text_secondary: '#A1A1A1',  // Light gray
  text_tertiary: '#6B7280',   // Dark gray

  // Status (For color-coded cards)
  status_success: '#10B981',  // Green
  status_caution: '#F59E0B',  // Orange
  status_alert: '#EF4444',    // Red
  status_info: '#06B6D4',     // Cyan

  // Utility
  border_light: 'rgba(255, 255, 255, 0.12)',
  glass_bg: 'rgba(20, 10, 35, 0.6)',
};
```

---

## Typography Cheat Sheet

### Sizes & Weights (Quick Reference)

```typescript
// constants/typography.ts
export const TYPOGRAPHY = {
  // Caption: 12px / 400
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },

  // Small Body: 14px / 400
  small_body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },

  // Body: 16px / 400
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },

  // Inline Labels: 16px / 600
  label: { fontSize: 16, fontWeight: '600', lineHeight: 24 },

  // Large Body: 20px / 400
  large_body: { fontSize: 20, fontWeight: '400', lineHeight: 30 },

  // Subheader: 20px / 600
  subheader: { fontSize: 20, fontWeight: '600', lineHeight: 30 },

  // H3: 28px / 700
  h3: { fontSize: 28, fontWeight: '700', lineHeight: 36 },

  // H2: 36px / 700
  h2: { fontSize: 36, fontWeight: '700', lineHeight: 44 },

  // H1 HERO: 56px / 700 ← PRIMARY METRICS
  h1_hero: { fontSize: 56, fontWeight: '700', lineHeight: 64 },

  // H1 EXTRA: 64px / 700 ← SEASON TIMELINE
  h1_extra: { fontSize: 64, fontWeight: '700', lineHeight: 72 },
};
```

### When to Use Each Size

| Size | Use Case | Example |
|------|----------|---------|
| 12px (caption) | Timestamps, hints, secondary metadata | "Updated 2h ago" |
| 14px (small body) | Labels, secondary info | "Total calories" |
| 16px (body) | Supporting text, descriptions | "You're in hypertrophy phase..." |
| 16px bold (label) | Inline metric labels | "Calories:" next to number |
| 20px (large body) | Larger descriptions | "Deload week helps CNS recover..." |
| 20px bold (subheader) | Card titles | "Recovery Score" |
| 28px bold (H3) | Section headers | "TODAY'S SNAPSHOT" |
| 36px bold (H2) | Subsection titles | (Less common in mobile) |
| **56px bold (H1)** | **PRIMARY METRICS** | **"2,150 / 2,400" (calories)** |
| **64px bold (H1)** | **SEASON/HERO** | **"Hypertrophy Phase 2 of 4"** |

---

## Spacing Quick Reference

```typescript
// constants/spacing.ts
export const SPACING = {
  xs: 4,      // Fine micro-spacing
  sm: 8,      // Internal padding
  md: 12,     // Medium gaps
  lg: 16,     // Standard padding, card padding
  xl: 24,     // Large section gaps
  xxl: 32,    // Major section gaps
  xxxl: 48,   // Full-screen gutters
};
```

### Common Layouts

```
Card Padding:           16px (lg)
Spacing Between Cards:  12px (md)
Section Header Margin:  0 top, 24px (xl) bottom
Button Height:          48px (12px + 24px text + 12px)
Tab Bar Height:         64px (includes safe area)
Safe Area Padding:      16px (lg) or more
```

---

## Component Quick Reference

### Primary Button (CTA)

```jsx
<TouchableOpacity
  className="bg-violet-600 rounded-xl py-3 px-4 active:bg-violet-700"
  onPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleAction();
  }}
>
  <Text className="text-white text-16 font-semibold text-center">
    Start Workout
  </Text>
</TouchableOpacity>
```

**Key**: Purple bg, light haptic on press, smooth transition

### Status Card (Color-Coded)

```jsx
<View
  className={`
    rounded-2xl border p-4 mb-3
    ${isGood ? 'bg-emerald-500/10 border-emerald-500/30' :
      isCaution ? 'bg-amber-500/10 border-amber-500/30' :
      'bg-red-500/10 border-red-500/30'}
  `}
>
  <Text className="text-28 font-bold text-white mb-1">
    {value}
  </Text>
  <Text className={`text-16 font-semibold ${
    isGood ? 'text-emerald-400' :
    isCaution ? 'text-amber-400' :
    'text-red-400'
  }`}>
    {status}
  </Text>
</View>
```

**Key**: Color background (low opacity) + colored text + status label

### Glass Card

```jsx
<View className="bg-glass rounded-2xl border border-white/10 p-4 mb-3">
  {/* Content */}
</View>
```

**CSS Needed**:
```css
.bg-glass {
  background: rgba(20, 10, 35, 0.6);
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}
```

### Hero Section (Large Number + Label)

```jsx
<View className="mb-8">
  {/* Hero Metric */}
  <Text className="text-64 font-bold text-white mb-2">
    Hypertrophy Phase 2 of 4
  </Text>

  {/* Progress */}
  <View className="bg-glass rounded-lg p-3 flex-row items-center gap-3">
    <View className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
      <View
        className="h-2 bg-violet-600 rounded-full"
        style={{ width: '42%' }}
      />
    </View>
    <Text className="text-14 text-gray-400 whitespace-nowrap">5/12 WKS</Text>
  </View>
</View>
```

**Key**: 64px hero number + progress bar below + supporting text

---

## Layout Patterns

### "One Big Thing" Home Screen Pattern

```
┌────────────────────────────────┐
│        GENESIS Home            │ ← Header (minimal)
├────────────────────────────────┤
│                                │
│  HYPERTROPHY PHASE 2 OF 4      │ ← H1 Hero (64px bold)
│  [████░░░░░░░░░░░░] 5/12 WKS   │ ← Progress bar
│                                │
├────────────────────────────────┤
│  TODAY'S SNAPSHOT              │ ← H3 Header (28px bold)
├────────────────────────────────┤
│ ┌──────┬──────┬────────┐      │
│ │Cal   │Steps │ Water  │      │ ← Quick stat cards (3-4)
│ │2150  │ 8400 │ 6/8c   │      │   16px label, 24px number
│ │/2400 │ /10k │        │      │
│ └──────┴──────┴────────┘      │
├────────────────────────────────┤
│ ┌──────────────────────────────┐│
│ │ RECOVERY SCORE: 78           ││ ← Status card (color bg)
│ │ WELL-RECOVERED (green)       ││ ← Status label (color text)
│ │ • Sleep: 7.5h  • HRV: 42ms   ││ ← Supporting text (14px)
│ └──────────────────────────────┘│
├────────────────────────────────┤
│ [START TODAY'S WORKOUT]         │ ← Primary CTA (purple)
├────────────────────────────────┤
│  Recent Activity               │ ← Secondary section (lower)
│  Last: Chest Press - 3 PRs     │
└────────────────────────────────┘
```

### Status Card Pattern (Repeatable)

```
┌─────────────────────────────────┐
│ METRIC NAME: VALUE              │ ← 20px bold (card header)
├─────────────────────────────────┤
│ [Green/Orange/Red Background]   │
│ ✓ STATUS LABEL                  │ ← Color-coded (icon + text)
│ • Supporting: X                 │ ← 14px regular
│ • Trend: Y                      │
└─────────────────────────────────┘
```

---

## Implementation Checklist (Copy-Paste)

### This Week (High Priority)

- [ ] **Home Tab Redesign**
  - [ ] Create hero section with season timeline (64px bold)
  - [ ] Add progress bar showing weeks completed
  - [ ] Add "Today's Snapshot" section with 3-4 quick stat cards
  - [ ] Remove information overload, keep max 5 card sections

- [ ] **Typography Audit**
  - [ ] Audit all primary metrics, target 56px bold
  - [ ] Audit section headers, ensure 28px bold
  - [ ] Update font weights (700 for headers, 600 for large numbers, 400 for body)

- [ ] **Card Polish**
  - [ ] Add 1px white border (12% opacity) to all glass cards
  - [ ] Increase padding to 16px inside cards
  - [ ] Ensure spacing between cards is 12px
  - [ ] Update shadows to be subtle (0 1px 3px rgba(0,0,0,0.12))

### Next Sprint (Medium Priority)

- [ ] **Status Colors Implementation**
  - [ ] Recovery score card: green/orange/red background
  - [ ] Training readiness card: color-coded status
  - [ ] Macro completion card: color-coded progress
  - [ ] Use pattern: colored background (10% opacity) + colored text + icon

- [ ] **Haptic Feedback**
  - [ ] Add light haptic on button press (all CTAs)
  - [ ] Add light haptic on workout set completion
  - [ ] Add medium haptic on PR detection
  - [ ] Add light haptic on meal/water logged

- [ ] **Season Timeline Visualization**
  - [ ] Create phase progress cards (4 phases, each with progress bar)
  - [ ] Show current phase highlighted
  - [ ] Add phase names + duration ("Hypertrophy Phase 1 - 4 weeks")
  - [ ] Mark completed phases with checkmark

- [ ] **Trend Visualization**
  - [ ] Add 7-day, 14-day, 30-day view toggles
  - [ ] Show rolling averages, not daily obsession
  - [ ] Make trends swipeable (Oura pattern)

### Following Sprint (Polish)

- [ ] **Coaching Messages**
  - [ ] Add weekly message: "This week we're focusing on..."
  - [ ] Add macro adjustment suggestions
  - [ ] Add form/recovery tips based on phase

- [ ] **Achievement Badges**
  - [ ] "5 PRs This Season" badge
  - [ ] "14-Day Consistency Streak"
  - [ ] "Volume Doubled" milestone

- [ ] **Accessibility Audit**
  - [ ] Test all text contrast (WCAG AA: 4.5:1 min)
  - [ ] Test focus states on interactive elements
  - [ ] Ensure colors aren't sole information method

---

## Validation Checklist (Before Shipping)

Before pushing any screen or component:

**Color Check**
- [ ] No unauthorized accent colors (only `#6D00FF` or status colors)
- [ ] All text has 4.5:1 contrast minimum
- [ ] Status colors used only on backgrounds or icons, not text labels

**Typography Check**
- [ ] Primary metrics are 56px or larger, weight 700
- [ ] Section headers are 28px, weight 700
- [ ] Labels are 16px, weight 600
- [ ] Body text is 16px or 20px, weight 400

**Spacing Check**
- [ ] Cards have 16px padding inside
- [ ] Spacing between cards is 12px
- [ ] Section headers have 24px margin below
- [ ] Safe area padding accounts for notches

**Card Check**
- [ ] All cards have glassmorphic blur OR 1px white border
- [ ] Shadows are subtle (0 1px 3px), not heavy
- [ ] Border radius is 16px for standard cards
- [ ] Status cards have colored backgrounds at 10% opacity

**Interaction Check**
- [ ] All buttons have haptic feedback (light tap)
- [ ] All transitions are smooth (300ms easing)
- [ ] Focus states are visible (2px purple outline)
- [ ] Interactive elements have proper hit targets (48px min)

---

## Color Status Reference (Copy-Paste)

### Green (Success/Good)
```
Background: rgba(16, 185, 129, 0.1)   [Emerald @10%]
Border:     rgba(16, 185, 129, 0.3)   [Emerald @30%]
Text:       #10B981                   [Emerald]
Icon:       ✓ Checkmark
Label:      WELL-RECOVERED / OPTIMAL / GOOD
```

### Orange (Caution/Moderate)
```
Background: rgba(245, 158, 11, 0.1)   [Amber @10%]
Border:     rgba(245, 158, 11, 0.3)   [Amber @30%]
Text:       #F59E0B                   [Amber]
Icon:       ⚠ Warning triangle
Label:      MODERATE / CAUTION / NEEDS ATTENTION
```

### Red (Alert/Low)
```
Background: rgba(239, 68, 68, 0.1)    [Red @10%]
Border:     rgba(239, 68, 68, 0.3)    [Red @30%]
Text:       #EF4444                   [Red]
Icon:       ✕ X mark
Label:      LOW / CRITICAL / ACTION NEEDED
```

---

## Haptic Feedback Reference

```typescript
// Light tap (button press, small action)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Medium pulse (success, PR, milestone)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Heavy pulse (error, critical alert) — use sparingly
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Success notification (when action completes)
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Warning notification (caution needed)
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

// Error notification (action failed)
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

---

## Common Questions

**Q: Can I use multiple accent colors?**
A: No. Use `#6D00FF` only for CTAs and highlights. Use status colors (green/orange/red) only for status backgrounds and icons, never as accent throughout.

**Q: My 56px headline doesn't fit on small screens. What do I do?**
A: Reduce to 48px on mobile (<375px), keep 56px on tablet. Use `@media` or responsive font sizing.

**Q: Should I add drop shadows to everything?**
A: No. Use subtle shadows (0 1px 3px) only on cards that need elevation. Most cards should use 1px border instead.

**Q: Is glassmorphism required?**
A: It's recommended for premium feel, but not required on every card. Minimum is 1px white border at 12% opacity.

**Q: How do I make cards feel premium?**
A: Combine: (1) dark background, (2) 1px border, (3) 16px padding, (4) subtle spacing, (5) no heavy shadows. Don't over-decorate.

**Q: Can I use Whoop's dials for GENESIS?**
A: Yes, consider circular progress dials for season phases. But keep overall density low (not as many metrics as Whoop).

---

## File References

After implementing these specs, update:
- `constants/colors.ts` — Color system
- `constants/spacing.ts` — Spacing scale
- `constants/typography.ts` — Font sizes/weights
- `components/ui/GlassCard.tsx` — Card styling
- `components/ui/Button.tsx` — Button variants
- `components/ui/StatusCard.tsx` — NEW status card component
- `app/(tabs)/home.tsx` — Home tab redesign
- All other screens — Apply typography scale

---

**Last Updated**: February 16, 2026
**Status**: Active Implementation Guide
**Version**: 2.0
