# GENESIS App — Screen Completeness Buildout

## CONTEXT
You are working on the GENESIS app (Expo SDK 54, React Native 0.81, TypeScript). Read `CLAUDE.md` first for full project context. This prompt addresses the gap analysis in `docs/plans/GAP_ANALYSIS_SCREEN_COMPLETENESS.md`.

**Design system**: Dark theme, single-accent `#6D00FF` (deep electric violet). Gradients go DARKER (`#6D00FF` → `#4A00B0` → `#3D0099`), NEVER lighter. NO lavender (#9D4EDD), NO pastel purples. GlassCard UI, JetBrains Mono + Inter fonts, semantic colors only for states (green=success, yellow=warning, red=error, orange=fat/flame). **IMPORTANT**: Run `CLAUDE_CODE_PROMPT_NUKE_LAVENDER.md` FIRST before this prompt.

**Language**: All user-facing text in SPANISH. Labels, titles, subtitles, placeholders, empty states — all Spanish.

**Rule**: Do NOT create new files unless absolutely necessary. Modify existing files. Use existing components from `components/ui/index.ts`. Use existing stores and types.

---

## SPRINT A: FUEL TAB OVERHAUL (fuel.tsx)

### A1. Meal Type Sections
Replace the flat meal list with grouped sections by meal type.

In `fuel.tsx`, after the MACROS section, replace the current COMIDAS section:

```
Current: flat list of all meals
Target: 4 collapsible sections — DESAYUNO, ALMUERZO, CENA, SNACKS
```

**Implementation**:
- Group meals by type: `meal.name` is currently the meal_type from DB (breakfast, lunch, dinner, snack)
- Create a local `MEAL_SECTIONS` constant:
```typescript
const MEAL_SECTIONS = [
  { key: 'breakfast', label: 'DESAYUNO', icon: Coffee, defaultImage: IMAGES.breakfast },
  { key: 'lunch', label: 'ALMUERZO', icon: Utensils, defaultImage: IMAGES.lunch },
  { key: 'dinner', label: 'CENA', icon: Moon, defaultImage: IMAGES.dinner },
  { key: 'snack', label: 'SNACKS', icon: Apple, defaultImage: IMAGES.snack },
] as const;
```
- Import `Coffee, Moon, Apple` from `lucide-react-native` (Utensils already imported). If `Coffee` or `Apple` don't exist in lucide, use `Egg` and `Cookie` or `Candy` instead.
- For each section:
  - Section header: icon + label + total kcal for that type + "+" add button on right
  - Filter `meals.filter(m => m.name.toLowerCase() === section.key)`
  - If section has meals, render them. If empty, show subtle placeholder text: "Toca + para agregar"
  - Each meal card shows: thumbnail image (40×40 rounded) on left, name/time in middle, calories + macros on right

### A2. Meal Card with Image
Update each meal card to include a thumbnail:

```tsx
<GlassCard key={meal.id}>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
    {/* Thumbnail */}
    <Image
      source={{ uri: meal.imageUrl || sectionDefaultImage }}
      style={{ width: 44, height: 44, borderRadius: 12 }}
      contentFit="cover"
    />
    {/* Info */}
    <View style={{ flex: 1, gap: 2 }}>
      <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>
        {meal.name.charAt(0).toUpperCase() + meal.name.slice(1)}
      </Text>
      <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'Inter' }}>
        {meal.time}
      </Text>
    </View>
    {/* Macros */}
    <View style={{ alignItems: 'flex-end', gap: 2 }}>
      <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>{meal.calories} cal</Text>
      <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 9, fontFamily: 'JetBrainsMonoMedium' }}>
        P:{meal.protein}g · C:{meal.carbs}g · F:{meal.fat}g
      </Text>
    </View>
  </View>
</GlassCard>
```

Import `Image` from `expo-image` (already available in the project, see train.tsx for reference).

### A3. Quick Add Bar
Add a "quick actions" row between MACROS and the meal sections:

```tsx
{/* Quick Actions */}
<View style={{ flexDirection: 'row', gap: 10 }}>
  <Pressable
    onPress={() => router.push('/(modals)/camera-scanner')}
    style={{
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
      paddingVertical: 12, borderRadius: 12,
      backgroundColor: `${GENESIS_COLORS.primary}15`,
      borderWidth: 1, borderColor: `${GENESIS_COLORS.primary}30`,
    }}
  >
    <Camera size={16} color={GENESIS_COLORS.primary} />
    <Text style={{ color: GENESIS_COLORS.primary, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>ESCANEAR</Text>
  </Pressable>
  <Pressable
    onPress={() => {/* future: manual add modal */}}
    style={{
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
      paddingVertical: 12, borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderWidth: 1, borderColor: GENESIS_COLORS.borderSubtle,
    }}
  >
    <Plus size={16} color={GENESIS_COLORS.textSecondary} />
    <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>AGREGAR</Text>
  </Pressable>
</View>
```

Import `Plus` from `lucide-react-native`.

### A4. Nutrition Insight Card
Add after the meal sections, before hydration:

```tsx
<GlassCard shine>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
    <Sparkle size={14} color={phaseConfig.accentColor} />
    <Text style={{ color: phaseConfig.accentColor, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>GENESIS INSIGHT</Text>
  </View>
  <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter', lineHeight: 18 }}>
    {remaining > 500
      ? `Te faltan ${remaining} kcal hoy. Considera una comida rica en proteína para alcanzar tu meta.`
      : remaining > 0
        ? `Vas bien — solo ${remaining} kcal restantes. Mantén el ritmo.`
        : '¡Meta calórica alcanzada! Revisa tus macros para asegurar balance.'}
  </Text>
</GlassCard>
```

Import `Sparkle` from `lucide-react-native`.

### A5. Language Fix
- Change `"Water Intake"` → `"Ingesta de Agua"` in the hydration section header
- Change `"+ AGUA"` → already in Spanish ✅
- Change any remaining English labels in fuel.tsx to Spanish

### A6. Remove Camera FAB (replaced by Quick Actions bar)
The camera FAB at bottom-right is now redundant since we have the "ESCANEAR" button in the quick actions bar. Remove the FAB Pressable at the end of fuel.tsx (lines 194-216).

---

## SPRINT B: SETTINGS / PROFILE OVERHAUL (settings.tsx)

### B1. Profile Photo / Avatar
Replace the User icon with a tappable avatar:

```tsx
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
```

Add state for avatar:
```typescript
const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar || null);
```

Replace the User icon View with:
```tsx
<Pressable onPress={handlePickAvatar}>
  {avatarUri ? (
    <Image
      source={{ uri: avatarUri }}
      style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: phaseColor + '40' }}
      contentFit="cover"
    />
  ) : (
    <View style={{
      width: 56, height: 56, borderRadius: 28,
      backgroundColor: phaseColor + '20',
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: phaseColor + '40',
    }}>
      <User size={24} color={phaseColor} />
    </View>
  )}
  {/* Camera badge */}
  <View style={{
    position: 'absolute', bottom: -2, right: -2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: GENESIS_COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: GENESIS_COLORS.bgGradientEnd,
  }}>
    <Camera size={10} color="#FFFFFF" />
  </View>
</Pressable>
```

Add handler:
```typescript
const handlePickAvatar = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  });
  if (!result.canceled && result.assets[0]) {
    setAvatarUri(result.assets[0].uri);
    // TODO: Upload to Supabase Storage in future sprint
  }
};
```

Import `Camera` from `lucide-react-native`.

### B2. Body Stats Section
Add after profile card, before notifications:

```tsx
<SectionTitle label="DATOS FÍSICOS" />
<GlassCard shine>
  <View style={{ gap: 14 }}>
    <StatRow label="Peso" value={weight} unit="kg" onEdit={setWeight} />
    <View style={{ height: 1, backgroundColor: GENESIS_COLORS.borderSubtle }} />
    <StatRow label="Altura" value={height} unit="cm" onEdit={setHeight} />
    <View style={{ height: 1, backgroundColor: GENESIS_COLORS.borderSubtle }} />
    <StatRow label="Edad" value={age} unit="años" onEdit={setAge} />
  </View>
  {hasBodyChanges && (
    <Pressable onPress={handleSaveBodyStats} style={{
      marginTop: 12, alignSelf: 'flex-end',
      paddingVertical: 8, paddingHorizontal: 16,
      borderRadius: 10, backgroundColor: GENESIS_COLORS.primary,
    }}>
      <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'InterBold' }}>Guardar</Text>
    </Pressable>
  )}
</GlassCard>
```

Create `StatRow` inline component:
```tsx
function StatRow({ label, value, unit, onEdit }: { label: string; value: string; unit: string; onEdit: (v: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter' }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <TextInput
          value={value}
          onChangeText={onEdit}
          keyboardType="numeric"
          style={{
            color: '#FFFFFF', fontSize: 15, fontFamily: 'JetBrainsMonoBold',
            textAlign: 'right', minWidth: 50,
            borderBottomWidth: 1, borderBottomColor: GENESIS_COLORS.borderSubtle,
            paddingVertical: 2,
          }}
        />
        <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>{unit}</Text>
      </View>
    </View>
  );
}
```

Add state:
```typescript
const [weight, setWeight] = useState('');
const [height, setHeight] = useState('');
const [age, setAge] = useState('');
const [hasBodyChanges, setHasBodyChanges] = useState(false);
```

For now, these are local state. The save handler is a no-op placeholder:
```typescript
const handleSaveBodyStats = async () => {
  // TODO: Save to Supabase profiles table in Sprint 5
  setHasBodyChanges(false);
};
```

Track changes:
```typescript
useEffect(() => {
  setHasBodyChanges(weight !== '' || height !== '' || age !== '');
}, [weight, height, age]);
```

### B3. Fitness Goal Section
Add after body stats:

```tsx
<SectionTitle label="OBJETIVO" />
<GlassCard shine>
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
    {GOALS.map((goal) => {
      const isSelected = selectedGoal === goal.key;
      return (
        <Pressable
          key={goal.key}
          onPress={() => setSelectedGoal(goal.key)}
          style={{
            paddingVertical: 8, paddingHorizontal: 14,
            borderRadius: 10,
            backgroundColor: isSelected ? GENESIS_COLORS.primary + '25' : 'rgba(255,255,255,0.04)',
            borderWidth: 1,
            borderColor: isSelected ? GENESIS_COLORS.primary : GENESIS_COLORS.borderSubtle,
          }}
        >
          <Text style={{
            color: isSelected ? '#FFFFFF' : GENESIS_COLORS.textSecondary,
            fontSize: 12, fontFamily: isSelected ? 'InterBold' : 'Inter',
          }}>
            {goal.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
</GlassCard>
```

Add constants and state:
```typescript
const GOALS = [
  { key: 'build', label: 'Ganar músculo' },
  { key: 'cut', label: 'Perder grasa' },
  { key: 'maintain', label: 'Mantener' },
  { key: 'recomp', label: 'Recomposición' },
  { key: 'peak', label: 'Rendimiento' },
];

const [selectedGoal, setSelectedGoal] = useState<string>('maintain');
```

### B4. Season Info Section
Add after fitness goal:

```tsx
<SectionTitle label="TEMPORADA ACTUAL" />
<GlassCard>
  <View style={{ gap: 10 }}>
    <InfoRow label="Season" value={`#${seasonNumber}`} />
    <InfoRow label="Fase" value={phaseConfig.label} />
    <InfoRow label="Semana" value={`${currentWeek} / 12`} />
    <InfoRow label="Progreso" value={`${progressPercent}%`} />
  </View>
</GlassCard>
```

Import from stores:
```typescript
const { seasonNumber, currentWeek, currentPhase, progressPercent } = useSeasonStore();
const phase = (currentPhase || 'hypertrophy') as PhaseType;
const phaseConfig = PHASE_CONFIG[phase];
```

Import `useSeasonStore` from `../../stores` and `PHASE_CONFIG` from `../../data`, `PhaseType` from `../../types`.

### B5. Connected Apps Section
Add before App Info:

```tsx
<SectionTitle label="APPS CONECTADAS" />
<GlassCard>
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Heart size={16} color={GENESIS_COLORS.success} />
      <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Inter' }}>Apple Health</Text>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: GENESIS_COLORS.success }} />
      <Text style={{ color: GENESIS_COLORS.success, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>Conectado</Text>
    </View>
  </View>
</GlassCard>
```

Import `Heart` from `lucide-react-native`.

---

## SPRINT C: TRAIN TAB ENHANCEMENTS (train.tsx)

### C1. Camera Form Check CTA
Add after the exercise list, before GENESIS Tip:

```tsx
{/* Form Check */}
<GlassCard>
  <Pressable
    onPress={() => router.push('/(modals)/camera-scanner')}
    style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
  >
    <View style={{
      width: 40, height: 40, borderRadius: 12,
      backgroundColor: `${GENESIS_COLORS.primary}15`,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Camera size={18} color={GENESIS_COLORS.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'InterBold' }}>Verificar forma</Text>
      <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'Inter' }}>
        Usa la cámara para analizar tu técnica
      </Text>
    </View>
    <ChevronRight size={16} color={GENESIS_COLORS.textTertiary} />
  </Pressable>
</GlassCard>
```

Import `Camera` from `lucide-react-native`.

### C2. Workout History (Collapsible)
Add after the Start Workout button:

```tsx
import { CollapsibleSection } from '../../components/ui';
```

```tsx
{/* Recent Sessions */}
<CollapsibleSection title="SESIONES RECIENTES" defaultExpanded={false} storageKey="genesis_section_recentSessions">
  {previousSessions.length > 0 ? (
    <View style={{ gap: 10 }}>
      {previousSessions.slice(0, 5).map((session, idx) => (
        <GlassCard key={session.id || idx}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ gap: 2 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'InterBold' }}>
                {session.exercises[0]?.name ?? 'Sesión'}
              </Text>
              <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>
                {new Date(session.date).toLocaleDateString('es', { weekday: 'short', month: 'short', day: 'numeric' })}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'JetBrainsMonoMedium' }}>
                {session.exercises.length} ejercicios
              </Text>
              <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>
                {session.duration ? `${Math.round(session.duration / 60)} min` : '—'}
              </Text>
            </View>
          </View>
        </GlassCard>
      ))}
    </View>
  ) : (
    <GlassCard>
      <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 12, fontFamily: 'Inter', textAlign: 'center' }}>
        Sin sesiones anteriores aún
      </Text>
    </GlassCard>
  )}
</CollapsibleSection>
```

Get `previousSessions` from store:
```typescript
const previousSessions = useTrainingStore((s) => s.previousSessions);
```

Make sure `fetchPreviousSessions` is called in useEffect (add if not present):
```typescript
useEffect(() => {
  fetchTodayPlan();
  useTrainingStore.getState().fetchPreviousSessions();
}, []);
```

---

## SPRINT D: MIND TAB FIXES (mind.tsx)

### D1. Fix Mood CTA Button Styling
Replace the NativeWind className button with inline styles:

```tsx
{/* Replace this: */}
<Pressable onPress={() => router.push('/(modals)/check-in')} className="mt-3 bg-[#6D00FF] rounded-xl py-3 px-6 self-center">
  <Text className="text-white font-semibold text-sm">Continuar check-in →</Text>
</Pressable>

{/* With this: */}
<Pressable
  onPress={() => router.push('/(modals)/check-in')}
  style={{
    marginTop: 12,
    backgroundColor: GENESIS_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
  }}
>
  <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'InterBold' }}>
    Continuar check-in →
  </Text>
</Pressable>
```

### D2. Breathing Exercise Section
Add after Sleep section:

```tsx
<StaggeredSection index={5} entrance={entrance} totalDuration={totalDuration}>
  <SectionLabel title="RESPIRACIÓN">
    <View style={{ gap: 10 }}>
      {BREATHING_EXERCISES.map((exercise) => (
        <GlassCard key={exercise.id}>
          <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: `${exercise.color}15`,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Wind size={18} color={exercise.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'InterBold' }}>{exercise.name}</Text>
              <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'Inter' }}>
                {exercise.pattern} · {exercise.duration}
              </Text>
            </View>
            <Play size={16} color={GENESIS_COLORS.textTertiary} />
          </Pressable>
        </GlassCard>
      ))}
    </View>
  </SectionLabel>
</StaggeredSection>
```

Add constants:
```typescript
import { Wind } from 'lucide-react-native';

const BREATHING_EXERCISES = [
  { id: 'box', name: 'Box Breathing', pattern: '4-4-4-4', duration: '5 min', color: GENESIS_COLORS.primary },
  { id: '478', name: 'Relajación 4-7-8', pattern: '4-7-8', duration: '3 min', color: GENESIS_COLORS.success },
  { id: 'energize', name: 'Respiración Energizante', pattern: '2-1-4-1', duration: '3 min', color: '#F97316' },
];
```

Update `useStaggeredEntrance(6, 120)` to `useStaggeredEntrance(7, 120)` to accommodate the new section.

### D3. Language Fixes
- Change `"Overall"` → `"General"` in the wellness score section
- Ensure all meditation labels stay as-is (English names are OK for meditation brands)

---

## SPRINT E: TRACK TAB + MINOR ENHANCEMENTS

### E1. Body Measurements Section (track.tsx)
Add after Personal Records, before Progress Photos:

```tsx
<StaggeredSection index={3.5} entrance={entrance} totalDuration={totalDuration}>
  <SectionLabel title="MEDIDAS CORPORALES">
    <GlassCard shine>
      <View style={{ gap: 12 }}>
        <MeasurementRow label="Peso" value="--" unit="kg" trend={null} />
        <View style={{ height: 1, backgroundColor: GENESIS_COLORS.borderSubtle }} />
        <MeasurementRow label="Grasa corporal" value="--" unit="%" trend={null} />
        <View style={{ height: 1, backgroundColor: GENESIS_COLORS.borderSubtle }} />
        <MeasurementRow label="Cintura" value="--" unit="cm" trend={null} />
      </View>
      <Pressable style={{
        marginTop: 12, alignSelf: 'center',
        paddingVertical: 8, paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: `${GENESIS_COLORS.primary}15`,
        borderWidth: 1, borderColor: `${GENESIS_COLORS.primary}30`,
      }}>
        <Text style={{ color: GENESIS_COLORS.primary, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>
          REGISTRAR MEDIDAS
        </Text>
      </Pressable>
    </GlassCard>
  </SectionLabel>
</StaggeredSection>
```

Inline component:
```tsx
function MeasurementRow({ label, value, unit, trend }: { label: string; value: string; unit: string; trend: number | null }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter' }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'JetBrainsMonoBold' }}>{value}</Text>
        <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>{unit}</Text>
        {trend !== null && (
          <Text style={{ color: trend < 0 ? GENESIS_COLORS.success : GENESIS_COLORS.warning, fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>
            {trend > 0 ? '+' : ''}{trend}
          </Text>
        )}
      </View>
    </View>
  );
}
```

NOTE: Since this section uses index 3.5, you'll need to renumber the remaining sections. Change Progress Photos from index 4 to 4, Phase Insight from 5 to 5. Insert the new section between PRs (index 3) and Photos (index 4) by adding it as a new StaggeredSection with a unique index. Actually, just insert it as a regular View without stagger between the two existing staggered sections.

### E2. Exercise Demo Link (active-workout.tsx)
In the current exercise info card, add a "Ver demo" link:

After the subtitle line (`Set X of Y · weightkg`), add:
```tsx
{currentExercise.videoUrl && (
  <Pressable
    onPress={() => router.push(`/(modals)/exercise-video?url=${encodeURIComponent(currentExercise.videoUrl!)}`)}
    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}
  >
    <Play size={12} color={GENESIS_COLORS.primary} />
    <Text style={{ color: GENESIS_COLORS.primary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
      Ver demo
    </Text>
  </Pressable>
)}
```

Import `Play` from `lucide-react-native` (already imported as `Play` and `Pause`).

### E3. Home Avatar (home.tsx)
In the header greeting area, replace the left side with:

```tsx
<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
  <Pressable onPress={() => router.push('/(screens)/settings')}>
    <View style={{
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: GENESIS_COLORS.primary + '20',
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: GENESIS_COLORS.primary + '30',
    }}>
      <User size={16} color={GENESIS_COLORS.primary} />
    </View>
  </Pressable>
  <Text style={{ fontSize: 16, fontFamily: 'JetBrainsMonoSemiBold', color: '#FFF' }}>
    {greeting}
  </Text>
</View>
```

Import `User` from `lucide-react-native`. Remove the existing settings button on the right side since the avatar now links to settings. Or keep the settings gear AND add the avatar — your choice, but don't have two settings entry points. Best: avatar on left links to settings, remove the gear on the right.

---

## VERIFICATION CHECKLIST

After all changes, verify:

1. `npx expo start` — app compiles without errors
2. All 5 tabs render correctly
3. Fuel tab shows meal type sections (even if empty with demo data)
4. Settings shows avatar placeholder, body stats, goal selector, season info
5. Train tab has camera CTA and workout history section
6. Mind tab has inline-styled mood CTA button and breathing section
7. Track tab has body measurements section
8. Active workout shows "Ver demo" link when videoUrl present
9. Home has avatar in greeting header
10. No English labels remaining (except brand names like "GENESIS", "HealthKit")
11. No cyan/aqua colors anywhere
12. All violet accents use `#6D00FF` ONLY — zero `#9D4EDD`, zero `#B388FF`, zero `#a866ff`, zero `#7C3AED`

---

## FILES TO MODIFY (in order)

1. `app/(tabs)/fuel.tsx` — Sprints A1-A6
2. `app/(screens)/settings.tsx` — Sprints B1-B5
3. `app/(tabs)/train.tsx` — Sprints C1-C2
4. `app/(tabs)/mind.tsx` — Sprints D1-D3
5. `app/(tabs)/track.tsx` — Sprint E1
6. `app/(screens)/active-workout.tsx` — Sprint E2
7. `app/(tabs)/home.tsx` — Sprint E3

**DO NOT create new files. All changes go into existing files.**
