# Master Prompt: GENESIS UI Phase 5 — "First Mile"

## Context

You are implementing **GENESIS UI Phase 5 — "First Mile"**, completing the user lifecycle: what happens when someone opens GENESIS for the first time, how they manage their profile and preferences, and how notifications become intelligent instead of hardcoded.

**Your Role**: Senior React Native developer with expertise in Expo SDK 54, Zustand state management, and user lifecycle design. You're enhancing an existing, working codebase — NOT building from scratch.

**Project Stage**: Active development — 3 sequential sprints (N→O→P)

**CRITICAL RULES**:
1. Expo SDK 54 / React Native 0.81 / TypeScript 5.9
2. SEASON is the central concept
3. Do NOT modify BFF/backend — all changes frontend-only
4. Do NOT add new npm dependencies
5. ALL Supabase tables exist — do NOT create/alter tables
6. Preserve ALL existing tests (45/45 must pass)
7. `notification_settings` table EXISTS in Supabase — use it
8. The onboarding flow (5 steps) WORKS — enhance it, don't rebuild it

---

## Current State

### What Exists
- **Auth flow**: login → onboarding (5 steps: goal, experience, schedule, body metrics, review) → home
- **Onboarding components**: GenesisGuide, StepIndicator, SelectionCard, SchedulePill (in components/onboarding/)
- **Push notifications**: 3 hardcoded types (check-in 8AM, hydration every 2hrs, training 5PM) in pushNotifications.ts
- **notification_settings table**: EXISTS in Supabase with columns: id, user_id, channel, category, enabled, quiet_hours_start, quiet_hours_end, updated_at
- **No welcome experience**: After onboarding completion, user lands on empty Home with no guidance
- **No settings screen**: Users cannot edit profile after onboarding
- **No profile screen**: No way to view or change weight, goal, experience level after initial setup
- **Season mock fallback**: When no real season exists, useSeasonStore generates fake 12-week data with no indication it's mock

### What's Missing
- Welcome briefing screen shown ONCE after onboarding
- Getting started card on Home to guide first actions
- Settings/Profile screen accessible from Home
- Notification preferences UI (table exists but nothing reads/writes it)
- Smart notifications (respect quiet hours, respect user preferences)

---

## Pre-Execution: Read These Files First

```
MUST READ (in this order):
1. ./CLAUDE.md                                      — Full project context
2. ./app/(auth)/onboarding.tsx                      — Current 5-step onboarding (MODIFY in N3)
3. ./app/index.tsx                                  — Entry routing
4. ./components/onboarding/                         — Existing components (reference patterns)
5. ./services/pushNotifications.ts                  — Current notifications (MODIFY in O4, P2)
6. ./stores/useAuthStore.ts                         — Auth store (MODIFY in O2)
7. ./stores/useSeasonStore.ts                       — Season store (check mock fallback)
8. ./app/(tabs)/home.tsx                            — Home (add welcome state in N2)
9. ./app/(tabs)/_layout.tsx                         — Tab layout (add settings access in O3)
10. ./constants/colors.ts                           — Design tokens
11. ./components/ui/GlassCard.tsx                   — Card pattern
12. ./hooks/useStaggeredEntrance.ts                 — Entrance animation hook (reuse)
13. ./utils/haptics.ts                              — Haptic feedback patterns
14. ./types/index.ts                                — Type definitions
15. ./data/index.ts                                 — PHASE_CONFIG, mock data
```

---

## Mission

Execute 3 sequential UI sprints (N→O→P) that create a premium first-time user experience, add profile management, and make notifications intelligent. Each sprint runs on its own git branch for clean rollback. After each sprint: verify with `npm test && npx tsc --noEmit`, then merge to main before starting the next sprint.

---

## Execution Strategy

### Branch-per-Sprint
```bash
# Sprint N
git checkout main && git pull
git checkout -b sprint-N-welcome-experience

# After verified: merge to main
# Sprint O
git checkout -b sprint-O-settings-profile

# After verified: merge to main
# Sprint P
git checkout -b sprint-P-smart-notifications
```

### Parallelization
- **Sprint N**: N1+N2 (independent screens) → N3+N4 (integration) → N5 (verify)
- **Sprint O**: O1+O2 (independent components) → O3+O4 (integration) → O5 (verify)
- **Sprint P**: P1+P2+P3 (independent services) → P4+P5 (integration) → P6 (verify)

### Context Window Management
- Use parallel reads for independent files
- One primary agent for integration/verification
- Keep component implementation focused and modular

---

## Sprint N — "Welcome Experience"

### Branch: `sprint-N-welcome-experience`

```bash
git checkout main && git pull
git checkout -b sprint-N-welcome-experience
```

### Overview
After a new user completes the 5-step onboarding, they land on an empty Home. This sprint adds a welcome flow that makes the first experience feel premium and guides them through their first actions.

---

### Task N1: Welcome Briefing Screen
**File**: `app/(screens)/welcome-briefing.tsx` (NEW)

A cinematic fullscreen screen shown ONCE after the very first onboarding completion. Not a modal — a full screen the user is navigated to before reaching Home.

**Structure**:
```typescript
import { useState, useEffect } from 'react';
import { View, Text, Pressable, SafeAreaView } from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sparkles, Users, Target } from 'lucide-react-native';
import { ScrollView } from 'react-native-gesture-handler';
import GlassCard from '../../components/ui/GlassCard';
import { GENESIS_COLORS } from '../../constants/colors';
import { hapticMedium } from '../../utils/haptics';
import { useAuthStore } from '../../stores/useAuthStore';

interface BriefingCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  delay: number;
  accentColor: string;
}

function BriefingCard({ icon, title, subtitle, delay, accentColor }: BriefingCardProps) {
  return (
    <Animated.View
      entering={SlideInUp.duration(400).delay(delay)}
      style={{ marginBottom: 12 }}
    >
      <GlassCard>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: accentColor + '20',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'InterBold',
                color: '#FFFFFF',
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: 'Inter',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 18,
              }}
            >
              {subtitle}
            </Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export default function WelcomeBriefingScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    // Check if already seen
    AsyncStorage.getItem('genesis_welcomeSeen').then((val) => {
      if (val === 'true') {
        router.replace('/(tabs)/home');
      }
    });
  }, [router]);

  const handleBegin = async () => {
    hapticMedium();
    await AsyncStorage.setItem('genesis_welcomeSeen', 'true');
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: GENESIS_COLORS.bgVoid }}>
      <LinearGradient
        colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgVoid]}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 40,
          gap: 24,
          flexGrow: 1,
          justifyContent: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={{
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* Icon */}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: GENESIS_COLORS.primary + '15',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
            }}
          >
            <Sparkles size={32} color={GENESIS_COLORS.primary} />
          </View>

          {/* Heading */}
          <Text
            style={{
              fontSize: 28,
              fontFamily: 'JetBrainsMono',
              color: '#FFFFFF',
              textAlign: 'center',
              fontWeight: '700',
            }}
          >
            Bienvenido a GENESIS
          </Text>

          {/* Greeting */}
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'Inter',
              color: GENESIS_COLORS.textSecondary,
              textAlign: 'center',
            }}
          >
            Hola, {user?.name || 'atleta'}
          </Text>
        </Animated.View>

        {/* Info Cards */}
        <View>
          <BriefingCard
            icon={<Target size={20} color={GENESIS_COLORS.primary} />}
            title="Tu Season"
            subtitle="12 semanas de entrenamiento personalizado basado en tu objetivo"
            delay={120}
            accentColor={GENESIS_COLORS.primary}
          />
          <BriefingCard
            icon={<Users size={20} color={GENESIS_COLORS.success} />}
            title="Tu Coach"
            subtitle="GENESIS (IA) + Aldo (coach humano) te guian en cada paso"
            delay={240}
            accentColor={GENESIS_COLORS.success}
          />
          <BriefingCard
            icon={<Sparkles size={20} color={GENESIS_COLORS.warning} />}
            title="Tu Primer Paso"
            subtitle="Completa tu check-in matutino y tu primer entrenamiento"
            delay={360}
            accentColor={GENESIS_COLORS.warning}
          />
        </View>
      </ScrollView>

      {/* CTA Button */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
      >
        <Animated.View entering={SlideInUp.duration(400).delay(500)}>
          <LinearGradient
            colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <Pressable
              onPress={handleBegin}
              style={{
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'JetBrainsMonoSemiBold',
                  color: '#FFFFFF',
                  letterSpacing: 1,
                }}
              >
                COMENZAR MI SEASON
              </Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
```

**Triggered**: From onboarding.tsx after successful profile save:
```typescript
// In onboarding.tsx, line 105, change:
// router.replace('/(tabs)/home');
// To:
router.replace('/(screens)/welcome-briefing');
```

**Styling**: Dark background, glass morphism cards, phase-colored icons, JetBrainsMono + Inter typography.

---

### Task N2: First-Time Home State
**File**: `app/(tabs)/home.tsx` (MODIFY)

Add a "Getting Started" card that shows ONLY when all conditions are true:
- No workouts completed today
- No meals logged today
- No check-in done today
- `genesis_gettingStartedDismissed` NOT in AsyncStorage

**Component** (add to home.tsx):
```typescript
// Add after imports
const GettingStartedCard = memo(function GettingStartedCard({
  onDismiss,
  onCheckInPress,
  onTrainPress,
  onFuelPress,
  completedCheckIn,
  completedWorkout,
  completedMeal,
}: {
  onDismiss: () => void;
  onCheckInPress: () => void;
  onTrainPress: () => void;
  onFuelPress: () => void;
  completedCheckIn: boolean;
  completedWorkout: boolean;
  completedMeal: boolean;
}) {
  const actions = [
    { icon: Heart, label: 'Registra tu check-in matutino', done: completedCheckIn, onPress: onCheckInPress },
    { icon: Dumbbell, label: 'Completa tu primer entrenamiento', done: completedWorkout, onPress: onTrainPress },
    { icon: Utensils, label: 'Registra tu primera comida', done: completedMeal, onPress: onFuelPress },
  ];

  const allDone = completedCheckIn && completedWorkout && completedMeal;

  return (
    <Animated.View
      entering={SlideInUp.duration(400).delay(120)}
      style={{ marginBottom: 16 }}
    >
      <GlassCard shine borderColor={GENESIS_COLORS.primary + '33'}>
        <View style={{ gap: 2 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'InterBold',
                color: '#FFFFFF',
              }}
            >
              {allDone ? 'Excelente primer dia' : 'Tu primer dia con GENESIS'}
            </Text>
            {allDone && (
              <Text style={{ fontSize: 20 }}>✨</Text>
            )}
          </View>

          {/* Actions */}
          {!allDone && (
            <View style={{ gap: 10 }}>
              {actions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <Pressable
                    key={i}
                    onPress={action.onPress}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 10,
                      paddingHorizontal: 10,
                      borderRadius: 10,
                      backgroundColor: action.done ? 'rgba(0, 245, 170, 0.08)' : undefined,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <Icon
                        size={18}
                        color={action.done ? GENESIS_COLORS.success : GENESIS_COLORS.textSecondary}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: 'Inter',
                          color: action.done ? GENESIS_COLORS.success : 'rgba(255,255,255,0.6)',
                          flex: 1,
                        }}
                      >
                        {action.label}
                      </Text>
                    </View>
                    {action.done ? (
                      <Check size={16} color={GENESIS_COLORS.success} />
                    ) : (
                      <ChevronRight size={16} color={GENESIS_COLORS.primary} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Congratulation + Dismiss */}
          {allDone && (
            <View style={{ gap: 12 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: 'Inter',
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 18,
                }}
              >
                GENESIS ya esta aprendiendo de ti. Recuperate bien y prepárate para el proximo entrenamiento.
              </Text>
              <Pressable
                onPress={onDismiss}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: 'rgba(109,0,255,0.1)',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: GENESIS_COLORS.primary + '33',
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: 'InterMedium',
                    color: GENESIS_COLORS.primary,
                    textAlign: 'center',
                  }}
                >
                  Ocultar guia
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </GlassCard>
    </Animated.View>
  );
});
```

**Integration into HomeScreen** (add state and render):
```typescript
// Add to HomeScreen function body
const [gettingStartedDismissed, setGettingStartedDismissed] = useState(false);

useEffect(() => {
  AsyncStorage.getItem('genesis_gettingStartedDismissed').then((val) => {
    setGettingStartedDismissed(val === 'true');
  });
}, []);

const handleDismissGettingStarted = async () => {
  await AsyncStorage.setItem('genesis_gettingStartedDismissed', 'true');
  setGettingStartedDismissed(true);
};

const handleCheckInPress = useCallback(() => {
  router.push('/(modals)/check-in');
}, [router]);

const handleTrainPress = useCallback(() => {
  router.push('/(tabs)/train');
}, [router]);

const handleFuelPress = useCallback(() => {
  router.push('/(tabs)/fuel');
}, [router]);

// Determine completion states
const completedCheckIn = !!todayCheckIn;
const completedWorkout = previousSessions.some((s) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sessionDate = new Date(s.date);
  sessionDate.setHours(0, 0, 0, 0);
  return s.completed && sessionDate.getTime() === today.getTime();
});
const completedMeal = meals.length > 0;
const showGettingStarted =
  !gettingStartedDismissed && !completedCheckIn && !completedWorkout && !completedMeal;

// In render, after SeasonHeader:
{showGettingStarted && (
  <GettingStartedCard
    onDismiss={handleDismissGettingStarted}
    onCheckInPress={handleCheckInPress}
    onTrainPress={handleTrainPress}
    onFuelPress={handleFuelPress}
    completedCheckIn={completedCheckIn}
    completedWorkout={completedWorkout}
    completedMeal={completedMeal}
  />
)}
```

---

### Task N3: Improve Onboarding Completion
**File**: `app/(auth)/onboarding.tsx` (MODIFY)

Change the navigation on onboarding completion to route to welcome-briefing instead of home:

```typescript
// Around line 105, change:
router.replace('/(tabs)/home');

// To:
router.replace('/(screens)/welcome-briefing');
```

The welcome-briefing screen then navigates to home when user taps CTA.

---

### Task N4: Verify Route Registration
Ensure `(screens)` folder has a layout that properly registers welcome-briefing. Check if `app/(screens)/_layout.tsx` exists. If it doesn't, create it:

```typescript
import { Stack } from 'expo-router';
import { GENESIS_COLORS } from '../../constants/colors';

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyleInterpolator: ({ current, next, inverted, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
            overlayStyle: {
              opacity: inverted.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          };
        },
      }}
    >
      <Stack.Screen
        name="welcome-briefing"
        options={{
          title: 'Welcome',
          animationEnabled: true,
        }}
      />
    </Stack>
  );
}
```

---

### Task N5: Verify Sprint N
```bash
npx tsc --noEmit
npm test
```

**Checklist**:
- [ ] Welcome briefing screen appears ONCE after first onboarding (checked with `genesis_welcomeSeen` flag)
- [ ] Welcome briefing shows user greeting with name
- [ ] Getting started card appears on Home when new user has no check-in, workout, meal
- [ ] Getting started card shows 3 action rows with icons and status (→ or checkmark)
- [ ] Tapping action rows navigates to correct screens
- [ ] When all 3 complete, card shows congratulation message
- [ ] "Ocultar guia" button dismisses card and sets `genesis_gettingStartedDismissed`
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] `npm test` passes (45/45)

---

### Commit N
```bash
git add -A
git commit -m "Sprint N: Welcome Experience — Premium First-Time User Flow

- Welcome briefing screen (shown once after onboarding)
- Getting started card on Home with 3 action items (check-in, workout, meal)
- Getting started card state management with AsyncStorage flags
- Smooth animations on briefing and card (FadeIn, SlideInUp)
- Navigation to welcome-briefing from onboarding completion
- Haptic feedback on begin CTA"

git checkout main && git merge sprint-N-welcome-experience
```

---

## Sprint O — "Settings & Profile"

### Branch: `sprint-O-settings-profile`

```bash
git checkout main && git pull
git checkout -b sprint-O-settings-profile
```

### Overview
Users currently CANNOT edit their profile after onboarding. This sprint adds a Settings screen accessible from Home where users can manage their profile, preferences, and notifications.

---

### Task O1: Settings Screen
**File**: `app/(screens)/settings.tsx` (NEW)

A comprehensive settings screen with sections for profile, notifications, quiet hours, and account.

**Structure**:
```typescript
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, SafeAreaView, Alert } from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Settings as SettingsIcon, Bell, LogOut, Info, Mail } from 'lucide-react-native';
import GlassCard from '../../components/ui/GlassCard';
import { GENESIS_COLORS, SEASON_PHASE_COLORS } from '../../constants/colors';
import { hapticMedium, hapticLight } from '../../utils/haptics';
import { useAuthStore } from '../../stores/useAuthStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useSeasonStore } from '../../stores/useSeasonStore';
import { Switch } from 'react-native';

function TimePickerSection({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: string;
  onValueChange: (val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(value);

  const handleConfirm = () => {
    onValueChange(temp);
    setEditing(false);
  };

  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 10, fontFamily: 'JetBrainsMonoMedium', color: GENESIS_COLORS.textTertiary, letterSpacing: 1 }}>
        {label}
      </Text>
      {!editing ? (
        <Pressable
          onPress={() => setEditing(true)}
          style={{
            borderWidth: 1,
            borderColor: GENESIS_COLORS.borderSubtle,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: 'rgba(255,255,255,0.04)',
          }}
        >
          <Text style={{ fontSize: 14, fontFamily: 'Inter', color: '#FFFFFF' }}>
            {value}
          </Text>
        </Pressable>
      ) : (
        <View style={{ gap: 8 }}>
          <TextInput
            value={temp}
            onChangeText={setTemp}
            placeholder="HH:MM"
            placeholderTextColor={GENESIS_COLORS.textMuted}
            keyboardType="decimal-pad"
            style={{
              borderWidth: 1,
              borderColor: GENESIS_COLORS.borderActive,
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: '#FFFFFF',
              fontFamily: 'Inter',
              fontSize: 14,
            }}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => setEditing(false)}
              style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: GENESIS_COLORS.borderSubtle }}
            >
              <Text style={{ fontSize: 12, fontFamily: 'InterMedium', color: GENESIS_COLORS.textSecondary }}>
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: GENESIS_COLORS.primary }}
            >
              <Text style={{ fontSize: 12, fontFamily: 'InterMedium', color: '#FFFFFF' }}>
                Confirmar
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, upsertProfile, signOut } = useAuthStore();
  const { notifications, quietHoursStart, quietHoursEnd, fetchNotificationPreferences, updateNotificationPreference, updateQuietHours } = useSettingsStore();
  const { currentPhase } = useSeasonStore();

  const [fullName, setFullName] = useState(user?.name || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [tempStart, setTempStart] = useState(quietHoursStart || '22:00');
  const [tempEnd, setTempEnd] = useState(quietHoursEnd || '07:00');

  useEffect(() => {
    fetchNotificationPreferences();
  }, []);

  useEffect(() => {
    setHasChanges(fullName !== user?.name);
  }, [fullName, user?.name]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    try {
      await upsertProfile(user.id, { full_name: fullName });
      setHasChanges(false);
    } catch (err) {
      console.warn('Failed to save profile:', err);
    }
  };

  const handleNotificationToggle = async (category: string, enabled: boolean) => {
    hapticLight();
    await updateNotificationPreference(category, enabled);
  };

  const handleQuietHoursUpdate = async () => {
    hapticMedium();
    await updateQuietHours(tempStart, tempEnd);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesion',
      'Estas seguro que deseas salir de GENESIS?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Salir',
          onPress: async () => {
            hapticMedium();
            await signOut();
            router.replace('/(auth)/login');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const phaseColor = SEASON_PHASE_COLORS[currentPhase as keyof typeof SEASON_PHASE_COLORS] || GENESIS_COLORS.primary;
  const isNotificationEnabled = notifications.some((n) => n.enabled);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: GENESIS_COLORS.bgVoid }}>
      <LinearGradient
        colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgVoid]}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: GENESIS_COLORS.borderSubtle,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(255,255,255,0.06)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={18} color="#FFFFFF" />
        </Pressable>
        <Text style={{ fontSize: 16, fontFamily: 'InterBold', color: '#FFFFFF' }}>
          Configuracion
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 20,
          gap: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Profile */}
        <Animated.View entering={FadeIn.duration(300).delay(0)}>
          <Text style={{ fontSize: 10, fontFamily: 'JetBrainsMonoMedium', color: GENESIS_COLORS.textTertiary, letterSpacing: 2, marginBottom: 12 }}>
            PERFIL
          </Text>
          <GlassCard>
            <View style={{ gap: 12 }}>
              {/* Name */}
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 10, fontFamily: 'JetBrainsMonoMedium', color: GENESIS_COLORS.textTertiary, letterSpacing: 1 }}>
                  NOMBRE COMPLETO
                </Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Tu nombre"
                  placeholderTextColor={GENESIS_COLORS.textMuted}
                  style={{
                    borderWidth: 1,
                    borderColor: hasChanges ? GENESIS_COLORS.borderActive : GENESIS_COLORS.borderSubtle,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: '#FFFFFF',
                    fontFamily: 'Inter',
                    fontSize: 14,
                  }}
                />
              </View>

              {/* Email */}
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 10, fontFamily: 'JetBrainsMonoMedium', color: GENESIS_COLORS.textTertiary, letterSpacing: 1 }}>
                  EMAIL
                </Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: GENESIS_COLORS.borderSubtle,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    backgroundColor: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <Text style={{ fontSize: 14, fontFamily: 'Inter', color: GENESIS_COLORS.textSecondary }}>
                    {user?.email || '—'}
                  </Text>
                </View>
              </View>

              {/* Save Button */}
              {hasChanges && (
                <Pressable
                  onPress={handleSaveProfile}
                  style={{
                    paddingVertical: 10,
                    alignItems: 'center',
                    borderRadius: 10,
                    backgroundColor: GENESIS_COLORS.primary,
                    marginTop: 4,
                  }}
                >
                  <Text style={{ fontSize: 12, fontFamily: 'InterBold', color: '#FFFFFF' }}>
                    Guardar cambios
                  </Text>
                </Pressable>
              )}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Section 2: Notifications */}
        <Animated.View entering={FadeIn.duration(300).delay(100)}>
          <Text style={{ fontSize: 10, fontFamily: 'JetBrainsMonoMedium', color: GENESIS_COLORS.textTertiary, letterSpacing: 2, marginBottom: 12 }}>
            NOTIFICACIONES
          </Text>
          <GlassCard>
            <View style={{ gap: 14 }}>
              {/* Master toggle */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Bell size={16} color={GENESIS_COLORS.primary} />
                  <Text style={{ fontSize: 13, fontFamily: 'InterMedium', color: '#FFFFFF' }}>
                    Notificaciones habilitadas
                  </Text>
                </View>
                <Switch
                  value={isNotificationEnabled}
                  onValueChange={(val) => {
                    hapticLight();
                    // TODO: implement master toggle
                  }}
                  trackColor={{ true: GENESIS_COLORS.primary + '50', false: 'rgba(255,255,255,0.1)' }}
                />
              </View>

              <View style={{ height: 1, backgroundColor: GENESIS_COLORS.borderSubtle }} />

              {/* Category toggles */}
              {notifications.map((notif) => (
                <View key={notif.category} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontSize: 12, fontFamily: 'InterMedium', color: '#FFFFFF' }}>
                      {notif.category === 'training' && 'Entrenamiento'}
                      {notif.category === 'nutrition' && 'Nutricion'}
                      {notif.category === 'check_in' && 'Check-in'}
                      {notif.category === 'coach' && 'Coach'}
                    </Text>
                    <Text style={{ fontSize: 10, fontFamily: 'Inter', color: GENESIS_COLORS.textTertiary }}>
                      {notif.category === 'training' && 'Recordatorios de entrenamiento'}
                      {notif.category === 'nutrition' && 'Recordatorios de agua y comidas'}
                      {notif.category === 'check_in' && 'Check-in matutino'}
                      {notif.category === 'coach' && 'Mensajes de tu coach'}
                    </Text>
                  </View>
                  <Switch
                    value={notif.enabled}
                    onValueChange={(val) => handleNotificationToggle(notif.category, val)}
                    trackColor={{ true: GENESIS_COLORS.primary + '50', false: 'rgba(255,255,255,0.1)' }}
                  />
                </View>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Section 3: Quiet Hours */}
        <Animated.View entering={FadeIn.duration(300).delay(200)}>
          <Text style={{ fontSize: 10, fontFamily: 'JetBrainsMonoMedium', color: GENESIS_COLORS.textTertiary, letterSpacing: 2, marginBottom: 12 }}>
            HORAS DE SILENCIO
          </Text>
          <GlassCard>
            <View style={{ gap: 12 }}>
              <TimePickerSection label="Inicio" value={tempStart} onValueChange={setTempStart} />
              <TimePickerSection label="Fin" value={tempEnd} onValueChange={setTempEnd} />
              <Pressable
                onPress={handleQuietHoursUpdate}
                style={{
                  paddingVertical: 10,
                  alignItems: 'center',
                  borderRadius: 10,
                  backgroundColor: phaseColor + '20',
                  borderWidth: 1,
                  borderColor: phaseColor + '50',
                  marginTop: 4,
                }}
              >
                <Text style={{ fontSize: 12, fontFamily: 'InterBold', color: phaseColor }}>
                  Actualizar horas
                </Text>
              </Pressable>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Section 4: App Info */}
        <Animated.View entering={FadeIn.duration(300).delay(300)}>
          <Text style={{ fontSize: 10, fontFamily: 'JetBrainsMonoMedium', color: GENESIS_COLORS.textTertiary, letterSpacing: 2, marginBottom: 12 }}>
            INFORMACION
          </Text>
          <GlassCard>
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, fontFamily: 'Inter', color: GENESIS_COLORS.textSecondary }}>
                  Version
                </Text>
                <Text style={{ fontSize: 12, fontFamily: 'JetBrainsMono', color: '#FFFFFF' }}>
                  1.0.0
                </Text>
              </View>
              <View style={{ height: 1, backgroundColor: GENESIS_COLORS.borderSubtle }} />
              <Pressable
                onPress={() => {
                  // TODO: launch email client
                }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}
              >
                <Mail size={14} color={GENESIS_COLORS.primary} />
                <Text style={{ fontSize: 12, fontFamily: 'Inter', color: GENESIS_COLORS.primary }}>
                  soporte@ngx.com
                </Text>
              </Pressable>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Section 5: Account */}
        <Animated.View entering={FadeIn.duration(300).delay(400)}>
          <Pressable
            onPress={handleLogout}
            style={{
              paddingVertical: 12,
              alignItems: 'center',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: GENESIS_COLORS.error + '50',
              backgroundColor: GENESIS_COLORS.error + '10',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <LogOut size={14} color={GENESIS_COLORS.error} />
              <Text style={{ fontSize: 12, fontFamily: 'InterBold', color: GENESIS_COLORS.error }}>
                Cerrar sesion
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

### Task O2: Settings Store
**File**: `stores/useSettingsStore.ts` (NEW)

```typescript
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseClient, hasSupabaseConfig } from '../services/supabaseClient';

interface NotificationPreference {
  category: 'training' | 'nutrition' | 'check_in' | 'coach';
  enabled: boolean;
}

interface SettingsState {
  notifications: NotificationPreference[];
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  isLoading: boolean;
  fetchNotificationPreferences: () => Promise<void>;
  updateNotificationPreference: (category: string, enabled: boolean) => Promise<void>;
  updateQuietHours: (start: string | null, end: string | null) => Promise<void>;
}

const DEFAULT_PREFERENCES: NotificationPreference[] = [
  { category: 'training', enabled: true },
  { category: 'nutrition', enabled: true },
  { category: 'check_in', enabled: true },
  { category: 'coach', enabled: true },
];

export const useSettingsStore = create<SettingsState>((set, get) => ({
  notifications: DEFAULT_PREFERENCES,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  isLoading: false,

  fetchNotificationPreferences: async () => {
    if (!hasSupabaseConfig) {
      set({
        notifications: DEFAULT_PREFERENCES,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
      });
      return;
    }

    set({ isLoading: true });
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { data, error } = await supabaseClient
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('channel', 'push');

      if (error) throw error;

      if (!data || data.length === 0) {
        // Create defaults for new user
        for (const pref of DEFAULT_PREFERENCES) {
          await supabaseClient.from('notification_settings').insert({
            user_id: user.id,
            channel: 'push',
            category: pref.category,
            enabled: pref.enabled,
            quiet_hours_start: '22:00',
            quiet_hours_end: '07:00',
          });
        }
        set({
          notifications: DEFAULT_PREFERENCES,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00',
        });
        return;
      }

      const prefs = data.map((row: any) => ({
        category: row.category,
        enabled: row.enabled,
      }));

      set({
        notifications: prefs,
        quietHoursStart: data[0]?.quiet_hours_start || '22:00',
        quietHoursEnd: data[0]?.quiet_hours_end || '07:00',
      });
    } catch (err: any) {
      console.warn('fetchNotificationPreferences failed:', err?.message);
    } finally {
      set({ isLoading: false });
    }
  },

  updateNotificationPreference: async (category, enabled) => {
    if (!hasSupabaseConfig) {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.category === category ? { ...n, enabled } : n
        ),
      }));
      return;
    }

    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      await supabaseClient
        .from('notification_settings')
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('category', category)
        .eq('channel', 'push');

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.category === category ? { ...n, enabled } : n
        ),
      }));
    } catch (err: any) {
      console.warn('updateNotificationPreference failed:', err?.message);
    }
  },

  updateQuietHours: async (start, end) => {
    if (!hasSupabaseConfig) {
      set({ quietHoursStart: start, quietHoursEnd: end });
      return;
    }

    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      await supabaseClient
        .from('notification_settings')
        .update({
          quiet_hours_start: start,
          quiet_hours_end: end,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('channel', 'push');

      set({ quietHoursStart: start, quietHoursEnd: end });
    } catch (err: any) {
      console.warn('updateQuietHours failed:', err?.message);
    }
  },
}));
```

---

### Task O3: Settings Access Point
**File**: `app/(tabs)/home.tsx` (MODIFY)

Add a settings gear icon to the Home header:

```typescript
// In HomeScreen render, modify the header section:
<View
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  }}
>
  <Text
    style={{
      fontSize: 20,
      fontFamily: 'JetBrainsMono',
      color: '#FFFFFF',
      fontWeight: '700',
    }}
  >
    {greeting}
  </Text>

  <Pressable
    onPress={() => router.push('/(screens)/settings')}
    hitSlop={8}
    style={{
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.06)',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Settings size={18} color="#FFFFFF" />
  </Pressable>
</View>
```

Also import Settings icon at top:
```typescript
import { ..., Settings } from 'lucide-react-native';
```

---

### Task O4: Update useAuthStore
**File**: `stores/useAuthStore.ts` (MODIFY)

Add `fetchProfile` action to reload profile data after editing:

```typescript
// The fetchProfile method already exists — ensure it's called after upsertProfile
```

---

### Task O5: Verify Sprint O
```bash
npx tsc --noEmit
npm test
```

**Checklist**:
- [ ] Settings icon visible in Home header (top right, gear icon)
- [ ] Tapping settings icon navigates to /(screens)/settings
- [ ] Settings screen has 5 sections: Profile, Notifications, Quiet Hours, App Info, Account
- [ ] Profile section has editable name and read-only email
- [ ] "Guardar cambios" button only shows when name changed
- [ ] Notification toggles for 4 categories (training, nutrition, check_in, coach)
- [ ] Quiet hours section has start/end time inputs
- [ ] Logout button shows confirmation alert before clearing session
- [ ] All preferences saved to Supabase notification_settings table
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] `npm test` passes (45/45)

---

### Commit O
```bash
git add -A
git commit -m "Sprint O: Settings & Profile — User Control & Preferences

- Settings screen accessible from Home gear icon
- Profile section: editable name, read-only email
- Notification toggles per category (training, nutrition, check-in, coach)
- Quiet hours configuration (start/end time pickers)
- App info section with version and support email
- Logout with confirmation alert
- useSettingsStore for notification preference management
- All preferences persisted to Supabase notification_settings table
- Smooth animations on settings sections"

git checkout main && git merge sprint-O-settings-profile
```

---

## Sprint P — "Smart Notifications"

### Branch: `sprint-P-smart-notifications`

```bash
git checkout main && git pull
git checkout -b sprint-P-smart-notifications
```

### Overview
Currently all 3 notification types fire on fixed schedules. This sprint makes them context-aware: check-in only if not done today, training only on training days, streak alerts if at risk, etc.

---

### Task P1: Smart Notifications Service
**File**: `services/smartNotifications.ts` (NEW)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NotificationTriggerInput } from 'expo-notifications';
import * as Notifications from 'expo-notifications';

export interface SmartNotification {
  id: string;
  title: string;
  body: string;
  category: 'training' | 'nutrition' | 'check_in' | 'coach' | 'system';
  trigger: NotificationTriggerInput;
}

/**
 * Generate smart notifications based on user state
 * Only includes notifications that should fire based on current context
 */
export async function getSmartNotifications(): Promise<SmartNotification[]> {
  const notifications: SmartNotification[] = [];

  // 1. Check-in reminder — only if not done today
  const today = new Date().toISOString().split('T')[0];
  const checkinKey = `genesis_checkin_${today}`;
  const checkinDone = await AsyncStorage.getItem(checkinKey);

  if (!checkinDone) {
    notifications.push({
      id: 'checkin_morning',
      title: 'Buenos dias, atleta',
      body: 'Registra tu check-in para que GENESIS calibre tu dia.',
      category: 'check_in',
      trigger: {
        type: 'daily' as const,
        hour: 8,
        minute: 0,
      } as NotificationTriggerInput,
    });
  }

  // 2. Training reminder — only on training days
  const isTrainingDay = await isScheduledTrainingDay();
  if (isTrainingDay) {
    notifications.push({
      id: 'training_afternoon',
      title: 'Tu sesion te espera',
      body: 'Es dia de entrenamiento. GENESIS tiene tu plan listo.',
      category: 'training',
      trigger: {
        type: 'daily' as const,
        hour: 17,
        minute: 0,
      } as NotificationTriggerInput,
    });
  }

  // 3. Streak at risk — if streak >= 3 and no workout today by 6PM
  const streakKey = 'genesis_currentStreak';
  const streakStr = await AsyncStorage.getItem(streakKey);
  const streak = parseInt(streakStr || '0', 10);
  const workoutDoneKey = `genesis_workoutDone_${today}`;
  const workoutDone = await AsyncStorage.getItem(workoutDoneKey);

  if (streak >= 3 && !workoutDone) {
    notifications.push({
      id: 'streak_risk',
      title: 'Tu racha esta en juego',
      body: `Llevas ${streak} dias consecutivos. No pierdas el ritmo hoy.`,
      category: 'training',
      trigger: {
        type: 'daily' as const,
        hour: 18,
        minute: 0,
      } as NotificationTriggerInput,
    });
  }

  // 4. Hydration — every 2 hours from 10AM to 8PM
  // (kept from current implementation)
  for (let hour = 10; hour <= 20; hour += 2) {
    notifications.push({
      id: `hydration_${hour}`,
      title: 'Hidratacion',
      body: 'Toma un vaso de agua para mantener tu rendimiento.',
      category: 'nutrition',
      trigger: {
        type: 'daily' as const,
        hour,
        minute: 0,
      } as NotificationTriggerInput,
    });
  }

  return notifications;
}

/**
 * Determine if today is a scheduled training day
 * Defaults to Mon-Fri (hardcoded, can be extended with profile data)
 */
async function isScheduledTrainingDay(): Promise<boolean> {
  const today = new Date().getDay(); // 0=Sun, 1=Mon...
  // Training Mon-Fri by default
  return today >= 1 && today <= 5;
}

/**
 * Helper to check if hour is within quiet hours
 */
export function isInQuietHours(
  hour: number,
  quietStart: string | null,
  quietEnd: string | null
): boolean {
  if (!quietStart || !quietEnd) return false;

  const startHour = parseInt(quietStart.split(':')[0], 10);
  const endHour = parseInt(quietEnd.split(':')[0], 10);

  if (startHour > endHour) {
    // Quiet hours span midnight (e.g., 22:00 - 07:00)
    return hour >= startHour || hour < endHour;
  }

  return hour >= startHour && hour < endHour;
}
```

---

### Task P2: Update pushNotifications.ts
**File**: `services/pushNotifications.ts` (MODIFY)

Integrate smartNotifications and respect user preferences:

```typescript
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { hasSupabaseConfig } from './supabaseClient';
import { getSmartNotifications, isInQuietHours } from './smartNotifications';
import { useSettingsStore } from '../stores/useSettingsStore';

// ... existing code ...

export async function scheduleDailyReminders(): Promise<void> {
  // Cancel existing scheduled notifications before re-scheduling
  await cancelAllScheduled();

  try {
    // Get user preferences
    const { notifications: prefs, quietHoursStart, quietHoursEnd } = useSettingsStore.getState();

    // Get smart notifications based on current state
    const smartNotifs = await getSmartNotifications();

    // Filter by preferences + quiet hours
    for (const notif of smartNotifs) {
      const pref = prefs.find((p) => p.category === notif.category);
      const isEnabled = pref ? pref.enabled : true; // default enabled

      // Safely extract hour from trigger
      const triggerObj = notif.trigger as any;
      const hour = typeof triggerObj === 'object' && 'hour' in triggerObj ? triggerObj.hour : null;

      if (
        isEnabled &&
        (hour === null || !isInQuietHours(hour, quietHoursStart, quietHoursEnd))
      ) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notif.title,
            body: notif.body,
            sound: 'default',
            data: { category: notif.category },
          },
          trigger: notif.trigger,
        });
      }
    }
  } catch (err: any) {
    console.warn('scheduleDailyReminders failed:', err?.message);
  }
}

// Rest of existing functions...
```

Also add a call to `scheduleDailyReminders()` when notification preferences are updated. In useSettingsStore methods:
```typescript
// After updateNotificationPreference and updateQuietHours succeed:
const { scheduleDailyReminders } = await import('../services/pushNotifications');
await scheduleDailyReminders();
```

---

### Task P3: Re-schedule on App Foreground
**File**: `app/_layout.tsx` (MODIFY)

Add AppState listener to re-schedule notifications when app comes to foreground:

```typescript
import { AppState, AppStateStatus } from 'react-native';
import { useEffect, useRef } from 'react';

export default function RootLayout() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App has come to foreground — re-evaluate smart notifications
      const { scheduleDailyReminders } = await import('../services/pushNotifications');
      await scheduleDailyReminders();
    }
    appState.current = nextAppState;
  };

  // ... rest of layout ...
}
```

---

### Task P4: Notification Deep Links
**File**: `app/_layout.tsx` (MODIFY)

Update the notification response listener to navigate to correct screens:

```typescript
useEffect(() => {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const category = response.notification.request.content.data?.category;
    const router = useRouter(); // Get router in effect

    switch (category) {
      case 'check_in':
        router.push('/(modals)/check-in');
        break;
      case 'training':
        router.push('/(tabs)/train');
        break;
      case 'nutrition':
        router.push('/(tabs)/fuel');
        break;
      case 'coach':
        router.push('/(modals)/coach-notes-history');
        break;
      default:
        router.push('/(tabs)/home');
    }
  });

  return () => subscription.remove();
}, []);
```

---

### Task P5: Track Completion States
**File**: `services/pushNotifications.ts` (MODIFY)

When user completes actions (check-in, workout), mark them in AsyncStorage so smart notifications update:

In relevant screens (check-in modal, workout complete, etc.), add:
```typescript
// After check-in completion:
const today = new Date().toISOString().split('T')[0];
await AsyncStorage.setItem(`genesis_checkin_${today}`, 'true');

// After workout completion:
await AsyncStorage.setItem(`genesis_workoutDone_${today}`, 'true');

// After new PR or personal best:
// Update streak if applicable
```

These flags are already used by smartNotifications to filter out irrelevant notifications.

---

### Task P6: Verify Sprint P
```bash
npx tsc --noEmit
npm test
```

**Checklist**:
- [ ] Check-in reminder NOT scheduled if already checked in today
- [ ] Training reminder ONLY scheduled on Mon-Fri
- [ ] Streak alert shows if streak >= 3 and no workout done
- [ ] Hydration reminders every 2 hours (10AM-8PM)
- [ ] All notifications respect quiet hours setting
- [ ] Notifications respect user preference toggles
- [ ] Tapping notification deep-links to correct screen
- [ ] Notification preferences trigger re-schedule
- [ ] AppState listener re-schedules on foreground
- [ ] AsyncStorage flags prevent duplicate notifications
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] `npm test` passes (45/45)

---

### Commit P
```bash
git add -A
git commit -m "Sprint P: Smart Notifications — Context-Aware Alerts

- getSmartNotifications() generates notifications based on user state
- Check-in reminder only if not done today
- Training reminder only on scheduled training days (Mon-Fri)
- Streak-at-risk alert when streak >= 3 and no workout by 6PM
- Hydration reminders 10AM-8PM (respects quiet hours)
- isInQuietHours() prevents notifications during sleep time
- Notification preferences determine which categories fire
- AppState listener re-schedules when app comes to foreground
- Deep links on notification tap navigate to correct screens
- AsyncStorage flags (genesis_checkin_DATE, genesis_workoutDone_DATE) prevent duplicates"

git checkout main && git merge sprint-P-smart-notifications
```

---

## DO / DON'T Constraints

### DO
- Read ALL files in pre-execution list before ANY code
- Create git branch per sprint (sprint-N, sprint-O, sprint-P)
- Run `npm test && npx tsc --noEmit` after every sprint
- Follow existing patterns (GlassCard, GENESIS_COLORS, useStaggeredEntrance)
- Use react-native-reanimated for animations
- Keep ALL text in Spanish
- Use AsyncStorage for client-side flags
- Use Supabase notification_settings table (it EXISTS)
- Use hapticMedium() on major interactions, hapticLight() on toggles
- Preserve ALL existing tests (45/45)
- Branch per sprint with clean merges
- Add imports at top (Settings icon, Switch component, etc.)
- Use useCallback for callbacks passed as props
- Use useMemo for expensive computations

### DON'T
- Don't modify BFF/backend — all frontend-only
- Don't create/alter Supabase tables (notification_settings EXISTS)
- Don't add npm dependencies
- Don't break existing navigation or tab structure
- Don't remove existing functionality
- Don't modify existing test files
- Don't use hardcoded colors — use GENESIS_COLORS or SEASON_PHASE_COLORS
- Don't use emojis in code
- Don't skip git branches — branch per sprint
- Don't forget to set AsyncStorage flags at appropriate points
- Don't schedule notifications without checking quiet hours

---

## Session Success Criteria

After all 3 sprints:
- [ ] Welcome briefing screen shows ONCE after first onboarding completion
- [ ] Getting started card guides new user through first check-in, workout, meal
- [ ] Getting started card disappears after all 3 actions or manual dismiss
- [ ] Settings icon visible in Home header (gear icon)
- [ ] Settings screen has Profile, Notifications, Quiet Hours, App Info, Account sections
- [ ] Profile editable: name (email read-only)
- [ ] Notification toggles per category (training, nutrition, check_in, coach)
- [ ] Quiet hours configurable (start/end times)
- [ ] All preferences saved to Supabase notification_settings
- [ ] Smart notifications respect user state (no check-in if done)
- [ ] Notifications respect quiet hours
- [ ] Notification taps deep-link to correct screens
- [ ] Logout confirms and clears session
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] `npm test` passes (45/45)
- [ ] 3 clean commits on main (one per sprint)
- [ ] No new npm dependencies

---

## Notes & Tips

- **AsyncStorage Keys**: Use descriptive keys: `genesis_welcomeSeen`, `genesis_gettingStartedDismissed`, `genesis_checkin_YYYY-MM-DD`
- **Supabase table**: notification_settings has id, user_id, channel ('push'), category, enabled, quiet_hours_start, quiet_hours_end, updated_at
- **Phase Colors**: Use SEASON_PHASE_COLORS[phase] for settings save button color
- **Haptic Feedback**: hapticMedium() on major actions (save, logout), hapticLight() on toggles
- **Performance**: Use React.memo on modal/card components, useCallback on all event handlers
- **Testing**: Run `npm test` after each task to catch regressions early
- **Deep Linking**: Category field in notification data drives router.push() navigation

---

## References

- **Onboarding existing code**: See `app/(auth)/onboarding.tsx` for patterns (5 steps, STEPS array, GOALS/LEVELS/SCHEDULES)
- **Home structure**: See `app/(tabs)/home.tsx` for staggered sections and memoized computations
- **Notification patterns**: Current pushNotifications.ts has scheduleDailyReminders() as starting point
- **Store patterns**: useAuthStore, useSeasonStore show Zustand + Supabase patterns
- **Animation hooks**: useStaggeredEntrance, getStaggeredStyle for FadeIn/SlideInUp
- **Color system**: GENESIS_COLORS + SEASON_PHASE_COLORS from constants/colors.ts

---

## Success Looks Like

After executing these 3 sprints:
- New users see a cinematic welcome experience that makes first impressions count
- Users can manage their profile and notification preferences from a settings screen
- Notifications become intelligent and respect user preferences and schedule
- All existing features continue working (training, nutrition, wellness, education)
- Code is clean, tests pass, no breaking changes
- Users feel in control of their GENESIS experience

This is Phase 5 complete: First Mile.
