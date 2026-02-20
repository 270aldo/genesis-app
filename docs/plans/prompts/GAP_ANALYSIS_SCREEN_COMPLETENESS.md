# GENESIS App — Screen Completeness Gap Analysis

**Date**: 2026-02-16
**Auditor**: Claude (Architect)
**Purpose**: Identify every missing section, feature, and UI element per screen before generating the definitive Claude Code execution prompt.
**Context**: Aldo wants "each section fully developed" before Sprint 5.

---

## Audit Summary

| Screen | Current State | Completeness | Priority |
|--------|---------------|-------------|----------|
| **FUEL** | Basic calories + flat meal list + water | 35% | 🔴 CRITICAL |
| **SETTINGS/PROFILE** | Name + email + notifications | 30% | 🔴 CRITICAL |
| **TRAIN** | Good workout display, no camera | 70% | 🟡 HIGH |
| **MIND** | Mood fixed, static meditations | 65% | 🟡 HIGH |
| **TRACK** | Photos + PRs + chart + stats | 75% | 🟢 MODERATE |
| **HOME** | Rich dashboard, fully wired | 85% | 🟢 MINOR |
| **ACTIVE WORKOUT** | Full exercise flow + PR detection | 80% | 🟢 MINOR |

---

## 🔴 FUEL TAB (fuel.tsx) — Currently 35%

### What exists:
- SeasonHeader + ScreenHeader
- Phase nutrition banner (surplus/deficit indicator)
- Calorie ring (AnimatedProgressRing, 48px hero number)
- 3 MacroCards (protein/carbs/fat with progress bars)
- Flat meal list (GlassCard per meal: name, time, calories, P:C:F)
- Hydration tracker (AnimatedWaterTracker)
- Camera FAB (bottom-right, links to camera-scanner modal)
- Loading skeletons + error banner + empty state illustration

### What's MISSING:

**1. Meal Type Sections (breakfast/lunch/dinner/snack)**
- Currently: Flat list of all meals with no grouping
- Needed: Collapsible sections per meal type with subtotals
- Each section header: meal type icon + label + total kcal for that meal
- Empty meal types show "+" add button

**2. Meal Images**
- `Meal.imageUrl` exists in types but NEVER rendered
- `IMAGES` has breakfast/lunch/dinner/snack Unsplash URLs
- Needed: Thumbnail image on left side of each meal card (40×40 rounded)
- If no image, show meal-type icon (Egg for breakfast, etc.)

**3. Add Meal Button / Manual Entry**
- Currently: Only camera FAB to add food
- Needed: "+" button in each meal section header for manual add
- Quick-add bar at top of meals section (search/scan/manual)
- Recent foods horizontal scroll for quick re-logging

**4. Meal Detail Expansion**
- Currently: Tapping a meal does nothing
- Needed: Expandable meal card showing individual food items
- Food items with individual calories and macros

**5. Snack Tracking**
- Currently: No dedicated snack section
- Needed: Snack section between lunch and dinner
- Quick snack buttons (common snacks: protein bar, fruit, nuts, shake)

**6. Daily Nutrition Timeline**
- Visual timeline showing meals plotted on a time axis
- Shows meal spacing (important for nutrient timing)

**7. Camera Integration In-Context**
- Currently: Camera only via FAB at bottom
- Needed: "Scan food" CTA inside the meals section (more discoverable)
- Camera icon on each meal section header

**8. Nutrition Insight Card**
- GENESIS tip about today's nutrition status
- "You're 400 kcal short — consider a protein shake" type insight

**9. Language Consistency**
- "Water Intake" label in English, rest is Spanish
- Standardize all labels to Spanish

---

## 🔴 SETTINGS / PROFILE (settings.tsx) — Currently 30%

### What exists:
- Back button + title
- Profile card (User icon, name TextInput, email display, save button)
- Notification toggles (master + 4 categories)
- Quiet hours editor (horizontal hour picker)
- App info (version, build, motor IA)
- Support email link
- Logout button with confirmation alert

### What's MISSING:

**1. Profile Photo / Avatar**
- Currently: Generic User icon in violet circle
- Needed: Tappable avatar with camera/gallery option
- Upload to Supabase Storage (similar to progress photos)
- Display user's photo throughout app (home greeting, chat, etc.)

**2. Body Stats Section**
- Weight (kg/lbs), Height (cm), Age
- Body fat % (optional)
- These feed into calorie calculations (already used in initializeTargets)
- Editable with save button

**3. Fitness Goal Selection**
- Goal: Build muscle / Lose fat / Maintain / Recomp / Peak performance
- This affects the calorie multiplier in useNutritionStore
- Visual selector with icons

**4. Season Info Section**
- Current season number, phase, week
- Season start date
- Total workouts completed this season
- Link to season history

**5. Units Preference**
- kg / lbs toggle for weights
- km / miles for distances
- Persisted to profile

**6. Connected Apps**
- HealthKit connection status (connected/disconnected)
- Link to reconnect

**7. Account Section Enhancement**
- Subscription status (if applicable)
- Plan type (hybrid/ascend)
- "Delete account" option (settings standard)

---

## 🟡 TRAIN TAB (train.tsx) — Currently 70%

### What exists:
- SeasonHeader
- Workout Hero ImageCard (muscle group image, day label, phase, muscle group pills, duration)
- Phase info card (reps, sets, rest seconds)
- Exercise list with ListItemCard (muscle group image, name, sets×reps, weight, chevron)
- GENESIS Tip (phase-specific advice)
- Exercise count + duration summary
- Start Workout gradient button
- Rest day state, error state, loading skeletons
- GenesisGuide for rest days

### What's MISSING:

**1. Camera / Form Check CTA**
- Aldo specifically requested camera in Train
- Needed: "Check your form" button that opens camera-scanner in equipment mode
- Or: Small camera icon on each exercise card → opens camera for form analysis

**2. Workout History Section**
- "Previous workouts" collapsible section below exercises
- Shows last 3-5 completed sessions with date, name, duration
- Tappable to see session details

**3. Per-Exercise Muscle Group Images**
- Currently: All exercises use same muscle group image (from workout, not exercise)
- Needed: Exercise-specific thumbnails based on individual muscle groups

**4. Warm-up / Cool-down Suggestion**
- Brief warm-up routine suggestion at top
- Cool-down stretch suggestion at bottom

---

## 🟡 MIND TAB (mind.tsx) — Currently 65%

### What exists:
- SeasonHeader + ScreenHeader ("Mind & Recovery")
- Mood check-in with MoodSelector (pendingMood + CTA button)
- Recovery Heatmap (6 muscle groups, fatigue status)
- Wellness Score (52px number + progress bar + recommendations)
- Meditation cards (3 static entries with ImageCard + play button)
- Sleep section (hours, quality pill, progress bar)
- Loading skeletons

### What's MISSING:

**1. Mood CTA Button Styling**
- Current "Continuar check-in" button uses NativeWind className
- Should use inline styles for consistency with rest of app

**2. Breathing Exercises Section**
- Common in wellness/fitness apps
- 2-3 breathing patterns (Box breathing, 4-7-8, Wim Hof)
- Animated circle that expands/contracts with breath timing

**3. Journal / Reflection**
- Quick text input: "How are you feeling today?"
- Persisted with check-in data
- Optional, collapsible section

**4. Meditation Timer (Not Just Cards)**
- Current meditations are static cards with play buttons that do nothing
- Needed: At minimum, a simple countdown timer for self-guided meditation
- Or link to external meditation resources

**5. Stress Management Tips**
- Phase-aware stress tips (deload week = extra recovery, strength = CNS fatigue management)

**6. HRV / Readiness Score (Future)**
- Placeholder for HealthKit HRV data when available
- "Coming soon" card to tease future feature

---

## 🟢 TRACK TAB (track.tsx) — Currently 75%

### What exists:
- SeasonHeader + ScreenHeader
- Season Overview Hero ImageCard (% completed, progress bar)
- Stats row (workouts, PRs, adherence ScoreCards)
- Strength trend chart (SimpleBarChart)
- Personal Records list
- Progress Photos (take photo + gallery + horizontal scroll with delete)
- Phase Insight (GENESIS tip based on adherence)
- Loading skeletons, empty states, error banner

### What's MISSING:

**1. Body Measurements Section**
- `Measurement` type exists with weight, bodyFat, chest, waist, hips
- No UI to input or display measurements
- Needed: "Body Stats" section with last measurement + trend

**2. Progress Photo Categories**
- Camera always defaults to category 'front'
- Needed: Category selector (front/side/back) before taking photo
- Before/after comparison view (side-by-side)

**3. Weekly/Monthly Volume Chart**
- Total sets/volume per week trend chart
- Complements the strength trend already shown

---

## 🟢 HOME TAB (home.tsx) — Currently 85%

### What exists:
- Greeting + settings button
- SeasonHeader
- Getting Started Card (3 tasks: check-in, workout, meal)
- WellnessIndicator
- GENESIS Daily Briefing card (tappable → chat)
- Proactive insight (sleep, streak, hydration warnings)
- Coach Notes
- Weekly Wrap (Sunday/Monday)
- Quick Metrics Row (kcal, sleep, water, steps)
- Mission Cards (Train, Fuel, Check-in horizontal scroll)
- Education recommendation (phase-ranked articles)
- Week Progress (7-day dots + progress bar)
- Streak section

### What's MISSING:

**1. Profile Avatar in Header**
- Currently: Settings gear icon only
- Needed: Small avatar (32px circle) on left side of greeting
- Tappable → settings

**2. Today's Workout Summary Card**
- Currently shown in Mission Cards but could be a dedicated hero card
- Show workout name, muscle groups, estimated duration more prominently

---

## 🟢 ACTIVE WORKOUT — Currently 80%

### What exists:
- Header with timer (animated glow), pause/play, back button
- Current exercise info card
- EnhancedRestTimer
- ExerciseForm (set logging with reps/weight/RPE)
- FormCues (exercise tips from catalog)
- ExerciseTransition overlay
- PRCelebration overlay
- PostWorkoutSummary
- Finish button (green when all done, violet for "finish early")

### What's MISSING:

**1. Exercise Demo Link**
- exercise-video modal exists but not linked from active workout
- Needed: "Watch demo" button in current exercise info card
- Opens exercise video modal with the exercise's videoUrl

**2. Camera Form Check**
- Button to open camera for form analysis during exercise
- Uses existing camera-scanner in equipment mode

---

## Cross-Cutting Gaps

### Image/Video Usage (Aldo's explicit request)
| Location | Current | Needed |
|----------|---------|--------|
| Meal cards | No images | Thumbnail from imageUrl or meal-type default |
| Exercise list (Train) | Same image for all | Per-exercise muscle group image |
| Profile | User icon | Actual avatar photo |
| Home greeting | No avatar | 32px avatar circle |
| Active workout | No demo video link | "Watch demo" button |

### Language Consistency
- "Water Intake" in fuel.tsx → "Ingesta de Agua" or "Hidratación"
- "Overall" in mind.tsx → "General"
- Mix of English section labels and Spanish descriptions

### Remaining Color Issues
- All cyan/aqua fully eliminated ✅
- `#F97316` used only for semantic (flame/warning/fat macro) ✅
- `PHASE_CONFIG` all unified to `#6D00FF` ✅

---

## Execution Priority Order

1. **FUEL TAB overhaul** — Meal type sections, images, add meal flow, snack tracking, camera CTA
2. **SETTINGS/PROFILE** — Avatar, body stats, goals, units, connected apps
3. **TRAIN** — Camera CTA, workout history, per-exercise images
4. **MIND** — Breathing exercises, meditation timer, mood CTA fix
5. **TRACK** — Body measurements, photo categories
6. **HOME + ACTIVE WORKOUT** — Avatar in header, exercise demo link
7. **Language normalization** — Standardize to Spanish throughout
