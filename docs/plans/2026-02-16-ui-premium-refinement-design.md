# UI Premium Refinement — Pre-TestFlight Pass

**Date:** 2026-02-16
**Branch:** `refine/ui-premium-pass`
**Scope:** Visual polish only — no new functionality

## Decisions

- **Color system:** Violet-only palette (`#6D00FF` → `#9D4EDD` → `#B388FF`). Semantic colors (green/yellow/red) only for states.
- **Phase colors:** All phases use violet. Differentiated by labels/dots, never by dominant accent color.
- **Cyan/aqua removal:** All instances of `#00E5FF`, `#00D4FF`, `#38bdf8`, `GENESIS_COLORS.cyan`, `GENESIS_COLORS.info` replaced with violet spectrum.
- **Demo profile:** Mid-season Week 6 user "Marco Reyes" for visual validation.

## Tier 1 — Critical

### 1.1 Color System Overhaul
- `PHASE_CONFIG`: all phases → `color: '#6D00FF'`, `accentColor: '#9D4EDD'`
- `MUSCLE_GROUP_STYLES` in train.tsx: shoulders `#00E5FF` → violet
- `MACRO_COLORS`: protein `#38bdf8` → `#B388FF`
- `SEASON_PHASE_COLORS`: all → violet spectrum
- Home MetricMini: sleep/water icons → violet
- Home MissionCard Check-in: `info` → violet
- Fuel: hydration icon → violet
- Fuel: MacroCard protein gradient → violet
- Fuel: Carbs gradient `#00D4FF` → remove cyan
- Mind: meditation card colors → violet
- Mind: `phaseConfig.accentColor` usages → violet
- MoodSelector: keep semantic mood colors but review
- `BODY_MAP_COLORS`: keep semantic (recovered=green, soreness=red)
- `MUSCLE_GRADIENTS`: simplify to violet spectrum

### 1.2 Mood Selector Bug Fix
- Allow visual selection before navigating to check-in
- Show "Continuar check-in →" CTA after mood tap
- When check-in done: show selected mood at full opacity (not 0.5)

### 1.3 Demo Profile (Week 6)
- Seed data provider with realistic mid-season data
- User: "Marco Reyes", 38, Season 2, Week 6/12, Strength phase
- Stats: 24 workouts, 87% adherence, 8-day streak, 3 PRs
- Today: check-in done (mood: good, sleep: 7h, energy: 7, stress: 3)
- Nutrition: 3 meals logged (1,850 kcal), 6 cups water
- Training: Push Day plan with 5 exercises

## Tier 2 — Premium Polish

### 2.1 Typography Hierarchy
- Hero metrics: 28-36px → 48-56px (Fuel calories, Mind wellness, Track progress)
- Secondary labels: consistent 10px JetBrains Mono

### 2.2 Card System
- GlassCard: add `borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'`
- GlassCard: padding 16 → 20px
- MissionCard: width 140 → 160px

### 2.3 Specific Fixes
- Meal card calories: `success` green → `#FFFFFF` bold (neutral data, not state)
- AnimatedWaterTracker: audit internal colors for cyan remnants
- Track: "GALLERY" button text → match violet scheme

## Tier 3 — Nice-to-have

### 3.1 Section Labels i18n
- Unify to Spanish: STATS→ESTADÍSTICAS, SLEEP→SUEÑO, etc.

### 3.2 Empty State Polish
- Add subtle violet glow behind empty state icons

### 3.3 Haptic Audit
- Verify haptics on: Start Workout, Log Meal, Add Water, Take Photo, Tab switches
