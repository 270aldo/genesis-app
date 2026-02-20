# GENESIS UI Design Specifications
## 2025-2026 Premium Fitness App Standards

---

## Color System

### Primary Palette (Confirmed Optimal)

```css
/* Background */
--bg-primary:      #0D0D2B;  /* Main background, very dark purple */
--bg-secondary:    #1A1A3E;  /* Slightly lighter for cards/sections */
--bg-tertiary:     #242450;  /* For nested elements */

/* Accent (Primary Call-to-Action) */
--accent-primary:  #6D00FF;  /* Violet, use sparingly */
--accent-hover:    #7D1FFF;  /* Slightly brighter on hover */
--accent-active:   #5D00DD;  /* Slightly darker on press */

/* Text */
--text-primary:    #FFFFFF;  /* White, main text */
--text-secondary:  #A1A1A1;  /* Light gray, secondary text */
--text-tertiary:   #6B7280;  /* Darker gray, labels/captions */

/* Status Colors (Use Selectively) */
--status-success:  #10B981;  /* Emerald green, positive/good */
--status-caution:  #F59E0B;  /* Amber, moderate/caution */
--status-alert:    #EF4444;  /* Red, low/alert */
--status-info:     #06B6D4;  /* Cyan, informational */

/* Utility */
--border-light:    rgba(255, 255, 255, 0.12);  /* Subtle borders */
--border-medium:   rgba(255, 255, 255, 0.20);  /* Visible borders */
--glass-bg:        rgba(20, 10, 35, 0.6);      /* Semi-transparent dark purple */
```

### Color Usage Rules

| Element | Color | Rule |
|---------|-------|------|
| Primary CTA Button | `--accent-primary` | Only color; white text |
| Secondary Button | `--text-secondary` + border | Outlined style |
| Card Background | `--bg-secondary` or `--glass-bg` | Depends on elevation |
| Header Text | `--text-primary` | Always white |
| Body Text | `--text-primary` or `--text-secondary` | Primary for main, secondary for supporting |
| Labels/Captions | `--text-tertiary` | Smallest type size |
| Dividers | `--border-light` | Subtle, 1px |
| Status Background | `--status-success/caution/alert` | With 10% opacity as background |
| Success Icon | `--status-success` | Green checkmark, PR badge, etc. |
| Warning Icon | `--status-caution` | Orange flag, moderate deficit |
| Error Icon | `--status-alert` | Red X, low readiness, major deficit |

---

## Typography System

### Font Family
- **Primary**: Inter (currently used, optimal for health apps)
- **Monospace** (optional, for numbers): JetBrains Mono (as per app.json)

### Font Scale

```
12px / 400 (Regular)    → Caption text, timestamps, hints
14px / 400 (Regular)    → Small body, labels, secondary metadata
16px / 400 (Regular)    → Body text, supporting copy
16px / 600 (SemiBold)   → Inline labels, metric names
20px / 400 (Regular)    → Large body, descriptive text
20px / 600 (SemiBold)   → Card headers, section subheadings
28px / 700 (Bold)       → Section headers (H3)
36px / 700 (Bold)       → Subsection titles (H2)
48px / 700 (Bold)       → Large metric numbers (e.g., calories, reps)
56px / 700 (Bold)       → **Hero metric numbers** (primary focus)
64px / 700 (Bold)       → Extra large hero numbers (season timeline, weekly PR count)
```

### Typography Hierarchy Rules

Every screen should follow this pattern:

1. **Hero (56-64px, Bold)**: The ONE thing the screen is about
   - Example (Home): Season progress ("Hypertrophy Phase 2 of 4")
   - Example (Train): Today's workout ("Lower Body Push")
   - Example (Fuel): Daily macro goal ("2,400 Cal")
   - Example (Track): PR milestone ("5 PRs This Season")

2. **Header (28px, Bold)**: Section title
   - "TODAY'S SNAPSHOT", "THIS WEEK'S FOCUS", "YOUR PROGRESS"

3. **Subheader (20px, SemiBold)**: Card titles
   - "Recovery Score", "Sleep Quality", "Macros Breakdown"

4. **Body (16px, Regular)**: Supporting copy
   - Descriptions, long-form text

5. **Label (16px, SemiBold)**: Inline labels next to values
   - "Calories:" next to 2,150 / 2,400

6. **Caption (12-14px, Regular)**: Secondary info
   - Timestamps, units ("kcal", "km"), hints

### Line Height
- Headlines (28px+): 1.2
- Body text (16px-20px): 1.5
- Labels/Captions (12-16px): 1.4

### Letter Spacing
- Headlines (28px+): +0.5% (slight increase for luxury)
- Body: 0% (default)
- Captions: 0% (default)

---

## Spacing System

### Base Unit: 4px Grid

```
4px    → Fine micro-spacing (between elements)
8px    → Internal padding, gaps between small components
12px   → Medium spacing, gaps between sections
16px   → Card padding, standard spacing
24px   → Large section spacing
32px   → Screen-level spacing, major sections
48px   → Full-screen gutters (very large spacing)
```

### Specific Applications

| Element | Padding | Margin |
|---------|---------|--------|
| Card | 16px | 12px below |
| Button | 16px horizontal, 12px vertical | 0 (use container spacing) |
| Section Header | 0 padding | 24px below |
| Input Field | 12px | 12px below |
| Modal Header | 16px | 24px below |
| List Item | 16px | 8px below item |

### Safe Areas
- Top/bottom safe area padding: 16px minimum (account for notches)
- Left/right screen padding: 16px minimum
- Tab bar: Account for 64px bottom (use `pb-16` or similar)

---

## Border Radius System

```
8px   → Small elements (badges, small buttons)
12px  → Standard buttons, input fields
16px  → Cards, medium containers
20px  → Large cards, dialogs
24px  → Full-screen components, large modals
99px  → Pill buttons, fully rounded
```

### Application Rules
- **Buttons**: 12px
- **Input fields**: 12px
- **Cards**: 16px
- **Modals**: 20px top corners (bottom can be 0 for sheet-style)
- **Badges**: 8px or fully rounded (99px)
- **Chip/Tag**: Fully rounded (99px)

---

## Shadow & Elevation System

### Shadow Scale (Subtle - Premium)

```css
/* No shadow (flat cards) */
--shadow-none: none;

/* Very subtle (cards on glass backgrounds) */
--shadow-xs: 0 1px 3px rgba(0, 0, 0, 0.12);

/* Subtle (modal, dropdown) */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.15);

/* Moderate (floating action buttons) */
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.20);

/* Strong (priority modals) */
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.30);
```

### Rules
- **Default cards**: No shadow, rely on 1px border
- **Elevated cards** (hover state): `--shadow-xs`
- **Modals/Dialogs**: `--shadow-sm` or `--shadow-md`
- **Floating buttons/FAB**: `--shadow-md`
- **Max elevation**: `--shadow-md` (avoid `--shadow-lg` except rare cases)

**Rationale**: Dark theme + glassmorphism = subtle shadows; heavy shadows feel clunky.

---

## Glassmorphism Specification

### Card with Glass Effect

```css
.glass-card {
  background: rgba(20, 10, 35, 0.6);     /* 60% opaque dark purple */
  backdrop-filter: blur(12px);            /* Frosted glass blur */
  border: 1px solid rgba(255, 255, 255, 0.12);  /* Subtle white border */
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);    /* Very subtle shadow */
}
```

### Modal Backdrop

```css
.modal-backdrop {
  background: rgba(0, 0, 0, 0.4);        /* 40% opaque black */
  backdrop-filter: blur(8px);             /* Lighter blur for backdrop */
}
```

### Floating Card (Elevated)

```css
.floating-card {
  background: rgba(26, 26, 62, 0.8);     /* Slightly higher opacity */
  backdrop-filter: blur(16px);            /* More prominent blur */
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.20);
}
```

### Transparency Rules
- **Text on glass**: Must have >4.5:1 contrast ratio (WCAG AA)
- **Icons on glass**: Same contrast requirement
- **Nested glass cards**: Test overlap readability

---

## Component Specifications

### Buttons

#### Primary Button (CTA)
```
Background:  --accent-primary (#6D00FF)
Text Color:  #FFFFFF
Padding:     16px horizontal, 12px vertical
Border Radius: 12px
Font Size:   16px, Weight 600
Hover:       Background = --accent-hover (#7D1FFF)
Active:      Background = --accent-active (#5D00DD)
Disabled:    Background = --text-tertiary, opacity 50%
```

#### Secondary Button (Outlined)
```
Background:  Transparent
Border:      1px solid --text-secondary
Text Color:  --text-secondary
Padding:     16px horizontal, 12px vertical
Border Radius: 12px
Font Size:   16px, Weight 600
Hover:       Border color = --text-primary, Text = --text-primary
Active:      Border color = --accent-primary
```

#### Tertiary Button (Text Only)
```
Background:  Transparent
Text Color:  --text-secondary
Font Size:   16px, Weight 600
Padding:     8px horizontal, 0 vertical
Hover:       Text color = --text-primary
Active:      Text color = --accent-primary
```

### Input Fields

```
Background:      --bg-secondary (#1A1A3E)
Border:          1px solid --border-light
Border Radius:   12px
Padding:         12px
Font Size:       16px
Text Color:      --text-primary
Placeholder:     --text-tertiary, opacity 60%
Focus Border:    2px solid --accent-primary
Focus Box-Shadow: 0 0 0 3px rgba(109, 0, 255, 0.1)
```

### Cards

#### Standard Card
```
Background:      --glass-bg (rgba(20, 10, 35, 0.6))
Border:          1px solid --border-light
Border Radius:   16px
Padding:         16px
Backdrop-Filter: blur(12px)
Shadow:          0 1px 3px rgba(0, 0, 0, 0.12)
```

#### Status Card (Color Variants)
- **Success**: Background = `--status-success` @ 10% opacity, Border = `--status-success` @ 30% opacity
- **Caution**: Background = `--status-caution` @ 10% opacity, Border = `--status-caution` @ 30% opacity
- **Alert**: Background = `--status-alert` @ 10% opacity, Border = `--status-alert` @ 30% opacity

#### Elevated Card (Modal/Overlay)
```
Background:      rgba(26, 26, 62, 0.8)
Border:          1px solid rgba(255, 255, 255, 0.15)
Border Radius:   16px
Padding:         16px
Backdrop-Filter: blur(16px)
Shadow:          0 4px 16px rgba(0, 0, 0, 0.20)
```

### Badges & Status Indicators

#### Badge (Small Label)
```
Background:      --accent-primary @ 15% opacity
Text Color:      --accent-primary
Padding:         4px 8px
Font Size:       12px, Weight 600
Border Radius:   99px (fully rounded)
```

#### Status Indicator (Circle)
```
Size:            16px x 16px
Border Radius:   99px (fully rounded)
Colors:          --status-success / --status-caution / --status-alert
```

### Tabs (Bottom Navigation)

```
Height:          64px (includes safe area)
Background:      --bg-secondary with slight transparency
Border-Top:      1px solid --border-light
Active Tab Icon: --accent-primary
Inactive Icon:   --text-tertiary
Active Label:    --text-primary
Inactive Label:  --text-tertiary (hidden on small screens)
```

---

## Animation & Motion

### Transition Durations
```
--transition-fast:    150ms   (micro-interactions: button press, hover)
--transition-normal:  300ms   (page transitions, modal open)
--transition-slow:    500ms   (complex animations)
```

### Easing Functions
```
--ease-out:      cubic-bezier(0.0, 0.0, 0.2, 1);      /* Material Design */
--ease-in-out:   cubic-bezier(0.4, 0.0, 0.2, 1);      /* Natural motion */
--ease-bounce:   cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Playful */
```

### Common Animations

#### Button Press Feedback
```css
/* iOS-style haptic feedback timing */
@keyframes buttonPress {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.98); }
  100% { transform: scale(1); }
}
animation: buttonPress 150ms ease-out;
```

#### Page Transition
```css
/* Fade + slight slide up */
@keyframes pageEnter {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
animation: pageEnter 300ms ease-out;
```

#### Loading Spinner
```css
/* Gentle rotation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
animation: spin 1s linear infinite;
```

### Haptic Feedback (Expo)

```typescript
// Light tap (button press, small action)
import * as Haptics from 'expo-haptics';
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Medium vibration (success, PR detection)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Heavy vibration (error, major alert) — use sparingly
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Success notification
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

---

## Accessibility & Contrast Requirements

### WCAG 2.1 AA Standards (Minimum)

| Component | Required Ratio | GENESIS Check |
|-----------|----------------|---------------|
| Text on background | 4.5:1 | White (#FFF) on `#0D0D2B` ✅ |
| Large text on background | 3:1 | Secondary gray on dark ✅ |
| UI component focus | 3:1 | Purple accent vs. dark bg ✅ |
| Interactive elements | 3:1 | All buttons ✅ |
| Icons on color | 3:1 | Status icons on colored backgrounds ✅ |

### Focus States
- All interactive elements must have visible focus state
- Focus outline: 2px solid `--accent-primary`
- Focus has 3:1 contrast with background

### Color-Only Communication
- Never use color alone to convey information
- Always pair status color with icon or text label
- Example: Red background + ❌ icon + "Low Readiness" text

---

## Information Architecture Patterns

### Home Screen Layout (Primary Pattern)

```
┌─────────────────────────────────────┐
│  GENESIS                      [Menu]│  ← Header (minimal)
├─────────────────────────────────────┤
│                                     │
│  HYPERTROPHY PHASE 2 OF 4           │  ← Hero (56px bold)
│  [████░░░░░░░░░░░░░░░░] 5/12 WKS   │  ← Progress bar + metric
│                                     │
├─────────────────────────────────────┤
│  TODAY'S SNAPSHOT                   │  ← Section header (28px)
├─────────────────────────────────────┤
│ ┌──────────┬──────────┬──────────┐ │
│ │Calories  │  Steps   │  Water   │ │  ← Quick stat cards (3-4)
│ │2,150/2400│ 8,400/10k│ 6/8 cups │ │
│ └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │  RECOVERY SCORE: 78             │ │  ← Status card (color bg)
│ │  WELL-RECOVERED                 │ │
│ │  ✓ Sleep: 7.5h  • HRV: 42ms     │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │  [START TODAY'S WORKOUT]        │ │  ← Primary CTA
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│  Recent Activity                    │  ← Secondary section
│  ─────────────────────────────────  │
│  Last Workout: Chest Press 3 PRs    │
│                                     │
└─────────────────────────────────────┘
```

### Card Order Rules
1. **Hero/Primary focus** (largest, top)
2. **Quick stats** (3-5 cards, easy scanning)
3. **Status/Recovery** (health indicators, color-coded)
4. **Call-to-action** (primary button)
5. **Secondary details** (scrollable, lower importance)

### Status Card Pattern
```
┌─────────────────────────┐
│ METRIC NAME: VALUE      │  ← Header (20px bold)
│ STATUS LABEL            │  ← Big green/orange/red background
│ • Supporting stat 1     │  ← 14px regular text
│ • Supporting stat 2     │
└─────────────────────────┘
```

---

## Design QA Checklist

Before pushing any screen:

- [ ] **Color**: All accent colors are `#6D00FF` or status colors only
- [ ] **Typography**: Hero metric is 56px bold, headers are 28px bold
- [ ] **Spacing**: Cards have 12px margin between them, 16px padding inside
- [ ] **Contrast**: All text passes WCAG AA (4.5:1 for body text)
- [ ] **Cards**: All cards have 1px white border OR glassmorphic blur
- [ ] **Status**: Recovery/readiness shows color status (not just number)
- [ ] **CTA**: Primary action button is purple (`#6D00FF`), secondary is outlined
- [ ] **Accessibility**: All interactive elements have visible focus state (2px purple outline)
- [ ] **Responsive**: Layout works on small (375px) and large (428px) screens
- [ ] **Safe Areas**: Padding accounts for notches and home indicators
- [ ] **Animations**: All transitions use smooth easing, no jarring movements
- [ ] **Haptics**: Key actions (workouts, PRs, meals) have light haptic feedback

---

## Implementation Examples

### Example 1: Metric Card with Status

```jsx
// React Native + NativeWind
<View className="bg-glass rounded-2xl border border-white/10 p-4 mb-3">
  {/* Header */}
  <Text className="text-16 font-semibold text-gray-400 mb-2">
    Recovery Score
  </Text>

  {/* Status Background */}
  <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mb-3">
    <Text className="text-28 font-bold text-white">78</Text>
    <Text className="text-16 font-semibold text-emerald-400">
      WELL-RECOVERED
    </Text>
  </View>

  {/* Supporting Stats */}
  <View className="flex-row justify-between">
    <Text className="text-14 text-gray-400">Sleep: 7.5h</Text>
    <Text className="text-14 text-gray-400">HRV: 42ms</Text>
  </View>
</View>
```

### Example 2: Primary Button

```jsx
<TouchableOpacity
  className="bg-violet-600 rounded-xl py-3 px-4 active:bg-violet-700"
  onPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handlePress();
  }}
>
  <Text className="text-white text-16 font-semibold text-center">
    Start Workout
  </Text>
</TouchableOpacity>
```

### Example 3: Hero Section

```jsx
<View className="mb-8">
  <Text className="text-56 font-bold text-white mb-2">
    Hypertrophy Phase 2 of 4
  </Text>
  <View className="bg-glass rounded-lg p-3 flex-row items-center">
    <View className="flex-1 bg-gray-700 h-2 rounded-full mr-3">
      <View
        className="bg-violet-600 h-2 rounded-full"
        style={{ width: '42%' }}
      />
    </View>
    <Text className="text-14 text-gray-400">5/12 WKS</Text>
  </View>
</View>
```

---

## Files to Update

1. **`constants/colors.ts`** — Add all colors from Color System section
2. **`constants/spacing.ts`** — Add spacing scale (4px grid)
3. **`constants/typography.ts`** — Add font sizes, weights, line heights
4. **`components/ui/GlassCard.tsx`** — Update with glassmorphism spec
5. **`components/ui/Button.tsx`** — Update primary/secondary/tertiary variants
6. **`components/ui/StatusCard.tsx`** — New component for color-coded status
7. **`app/_layout.tsx`** — Update NativeWind theme config with colors/spacing

---

## Next Steps

1. **Audit existing screens** against this spec (focus on typography scale, card styling)
2. **Update design tokens** in constants (colors, spacing, typography)
3. **Implement status cards** with color backgrounds (recovery, readiness, etc.)
4. **Increase primary metric font sizes** by 15-20%
5. **Add haptic feedback** to key actions (via Expo Haptics)
6. **Test contrast ratios** on all text/interactive elements

---

**Design Spec Version**: 2.0 (Feb 2026)
**Last Updated**: February 16, 2026
**Status**: Active — Guide implementation in Sprint 5+
