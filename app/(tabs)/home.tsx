import { useEffect, useMemo, useState, useCallback, memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, Utensils, Brain, Sparkles, Flame, BookOpen, ChevronRight, Moon, Droplets, Footprints, Cpu, X, Heart, Check, Settings } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { GlassCard, GradientCard, ScreenHeader, SectionLabel, ProgressBar, SeasonHeader, ErrorBanner } from '../../components/ui';
import { ImageCard } from '../../components/cards';
import { GENESIS_COLORS } from '../../constants/colors';
import { useSeasonStore, useWellnessStore, useTrainingStore, useNutritionStore, useTrackStore } from '../../stores';
import { useAuthStore } from '../../stores/useAuthStore';
import { useHealthKit } from '../../hooks/useHealthKit';
import { MOCK_EDUCATION, PHASE_CONFIG } from '../../data';
import type { PhaseType } from '../../types';
import { useCountUpDisplay } from '../../hooks/useCountUpDisplay';
import { useStaggeredEntrance, getStaggeredStyle } from '../../hooks/useStaggeredEntrance';
import { SkeletonCard } from '../../components/loading/SkeletonCard';

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const GettingStartedCard = memo(function GettingStartedCard({
  completedCheckIn,
  completedWorkout,
  completedMeal,
  onCheckIn,
  onTrain,
  onFuel,
  onDismiss,
}: {
  completedCheckIn: boolean;
  completedWorkout: boolean;
  completedMeal: boolean;
  onCheckIn: () => void;
  onTrain: () => void;
  onFuel: () => void;
  onDismiss: () => void;
}) {
  const allComplete = completedCheckIn && completedWorkout && completedMeal;

  const rows = [
    { label: 'Registra tu check-in', done: completedCheckIn, icon: Heart, onPress: onCheckIn },
    { label: 'Completa un entrenamiento', done: completedWorkout, icon: Dumbbell, onPress: onTrain },
    { label: 'Registra una comida', done: completedMeal, icon: Utensils, onPress: onFuel },
  ];

  return (
    <GlassCard shine style={{ borderColor: GENESIS_COLORS.primary + '33', borderWidth: 1 }}>
      <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold', marginBottom: 4 }}>
        Primeros pasos
      </Text>
      <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter', marginBottom: 12 }}>
        Completa estas acciones para personalizar tu experiencia.
      </Text>
      <View style={{ gap: 10 }}>
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <Pressable
              key={row.label}
              onPress={row.done ? undefined : row.onPress}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                opacity: row.done ? 0.5 : 1,
              }}
            >
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: row.done ? GENESIS_COLORS.success + '20' : 'rgba(255,255,255,0.06)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={16} color={row.done ? GENESIS_COLORS.success : GENESIS_COLORS.textMuted} />
              </View>
              <Text style={{
                flex: 1,
                color: row.done ? GENESIS_COLORS.textMuted : '#FFFFFF',
                fontSize: 13,
                fontFamily: 'Inter',
                textDecorationLine: row.done ? 'line-through' : 'none',
              }}>
                {row.label}
              </Text>
              {row.done
                ? <Check size={16} color={GENESIS_COLORS.success} />
                : <ChevronRight size={16} color={GENESIS_COLORS.textMuted} />}
            </Pressable>
          );
        })}
      </View>
      {allComplete && (
        <Pressable
          onPress={onDismiss}
          style={{
            marginTop: 12,
            alignSelf: 'center',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 10,
            backgroundColor: 'rgba(255,255,255,0.06)',
          }}
        >
          <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter' }}>
            Ocultar
          </Text>
        </Pressable>
      )}
    </GlassCard>
  );
});

export default function HomeScreen() {
  const router = useRouter();

  // Store data
  const { seasonNumber, currentWeek, currentPhase, weeks, progressPercent, fetchSeasonPlan } = useSeasonStore();
  const todayCheckIn = useWellnessStore((s) => s.todayCheckIn);

  // HealthKit data
  const { snapshot: healthSnapshot, status: healthStatus } = useHealthKit();

  // Auth & greeting
  const userName = useAuthStore((s) => s.user?.name);
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';
  const greeting = timeGreeting + (userName ? `, ${userName}` : '');

  // Today's training plan
  const todayPlan = useTrainingStore((s) => s.todayPlan);
  const isTodayPlanLoading = useTrainingStore((s) => s.isTodayPlanLoading);
  const isTrainingLoading = useTrainingStore((s) => s.isLoading);

  // Nutrition data
  const meals = useNutritionStore((s) => s.meals);
  const dailyGoal = useNutritionStore((s) => s.dailyGoal);
  const nutritionError = useNutritionStore((s) => s.error);
  const trainingError = useTrainingStore((s) => s.error);
  const water = useNutritionStore((s) => s.water);
  const { nutritionTotals, kcalValue, remaining, waterValue } = useMemo(() => {
    const totals = {
      calories: meals.reduce((sum, meal) => sum + meal.calories, 0),
      protein: meals.reduce((sum, meal) => sum + meal.protein, 0),
      carbs: meals.reduce((sum, meal) => sum + meal.carbs, 0),
      fat: meals.reduce((sum, meal) => sum + meal.fat, 0),
    };
    return {
      nutritionTotals: totals,
      kcalValue: totals.calories > 0 ? totals.calories.toLocaleString() : '--',
      remaining: Math.max(0, dailyGoal - totals.calories),
      waterValue: water > 0 ? `${water}` : '--',
    };
  }, [meals, dailyGoal, water]);

  // Sleep — prefer HealthKit data, fall back to check-in
  const sleepValue = healthSnapshot?.sleepHours
    ? `${healthSnapshot.sleepHours}h`
    : todayCheckIn?.sleepHours
      ? `${todayCheckIn.sleepHours}h`
      : '--';

  // Steps — from HealthKit
  const stepsValue = healthStatus === 'loading'
    ? '...'
    : healthSnapshot?.steps
      ? healthSnapshot.steps.toLocaleString()
      : '--';

  // Completed days this week (training sessions completed since Monday)
  const previousSessions = useTrainingStore((s) => s.previousSessions);
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7)); // Monday
  startOfWeek.setHours(0, 0, 0, 0);
  const completedDays = previousSessions.filter(
    (s) => s.completed && new Date(s.date) >= startOfWeek,
  ).length;

  // Streak from track store
  const streak = useTrackStore((s) => s.streak);

  // Getting Started card state
  const [gettingStartedDismissed, setGettingStartedDismissed] = useState(true);
  useEffect(() => {
    AsyncStorage.getItem('genesis_gettingStartedDismissed').then((v) => {
      if (!v) setGettingStartedDismissed(false);
    });
  }, []);

  const completedCheckIn = !!todayCheckIn;
  const todayStr = new Date().toISOString().split('T')[0];
  const completedWorkout = previousSessions.some(
    (s) => s.completed && s.date.startsWith(todayStr),
  );
  const completedMeal = meals.length > 0;
  const showGettingStarted = !gettingStartedDismissed;

  const handleDismissGettingStarted = useCallback(async () => {
    setGettingStartedDismissed(true);
    await AsyncStorage.setItem('genesis_gettingStartedDismissed', 'true');
  }, []);
  const handleCheckInPress = useCallback(() => router.push('/(modals)/check-in'), [router]);
  const handleTrainPress = useCallback(() => router.push('/(tabs)/train'), [router]);
  const handleFuelPress = useCallback(() => router.push('/(tabs)/fuel'), [router]);

  useEffect(() => {
    if (weeks.length === 0) fetchSeasonPlan();
    useTrainingStore.getState().fetchTodayPlan();
    useNutritionStore.getState().initializeTargets();
    useNutritionStore.getState().fetchMeals();
    useTrainingStore.getState().fetchPreviousSessions();
    useTrackStore.getState().fetchStreak();
    useWellnessStore.getState().fetchTodayCheckIn();
  }, []);

  const phase = (currentPhase || 'hypertrophy') as PhaseType;
  const phaseConfig = PHASE_CONFIG[phase];
  const currentDayIndex = new Date().getDay();

  // Build briefing from real data
  const briefingMessage = todayPlan
    ? `Semana ${currentWeek} de ${phaseConfig.label}. Hoy toca ${todayPlan.name} — ${todayPlan.exercises.length} ejercicios, ~${todayPlan.estimatedDuration} min.`
    : `Semana ${currentWeek} de ${phaseConfig.label}. Hoy es día de descanso. Enfócate en recovery y nutrición.`;

  // Loading flag
  const isDataLoading = isTodayPlanLoading || isTrainingLoading;

  const kcalDisplay = useCountUpDisplay(nutritionTotals.calories);
  const waterDisplay = useCountUpDisplay(water);
  const stepsDisplay = useCountUpDisplay(healthSnapshot?.steps ?? 0);

  // Proactive insight
  const [insightDismissed, setInsightDismissed] = useState(false);
  const insightMessage = useMemo(() => {
    if (insightDismissed) return null;
    const sleepHours = todayCheckIn?.sleepHours ?? (healthSnapshot?.sleepHours ?? null);
    if (sleepHours !== null && sleepHours < 6) return 'Tu sueño fue corto anoche. Prioriza descanso hoy.';
    if (streak > 0 && streak < 3) return 'Tu adherencia va bajando. ¿Necesitas ajustar tu plan?';
    if (water > 0 && water < 4) return 'Llevas poca agua hoy. Hidrátate antes de entrenar.';
    return null;
  }, [todayCheckIn, healthSnapshot, streak, water, insightDismissed]);

  const insightOpacity = useSharedValue(0);
  useEffect(() => {
    if (insightMessage) {
      insightOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    }
  }, [insightMessage]);
  const insightStyle = useAnimatedStyle(() => ({ opacity: insightOpacity.value }));

  const entrance = useStaggeredEntrance(6, 120);
  const totalDuration = 600 + 6 * 120;

  // Filter education by current phase
  const phaseEducation = MOCK_EDUCATION.filter((e) => e.relevantPhases.includes(phase));
  const todayLesson = phaseEducation[0];

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100, gap: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with greeting + settings */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16, fontFamily: 'JetBrainsMonoSemiBold', color: '#FFF' }}>
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

          {/* Season Header */}
          <SeasonHeader
            seasonNumber={seasonNumber}
            currentWeek={currentWeek}
            currentPhase={phase}
            weeks={weeks}
          />

          {/* Getting Started Card (new users) */}
          {showGettingStarted && (
            <GettingStartedCard
              completedCheckIn={completedCheckIn}
              completedWorkout={completedWorkout}
              completedMeal={completedMeal}
              onCheckIn={handleCheckInPress}
              onTrain={handleTrainPress}
              onFuel={handleFuelPress}
              onDismiss={handleDismissGettingStarted}
            />
          )}

          {(trainingError || nutritionError) && (
            <ErrorBanner message={trainingError || nutritionError || 'Error al cargar datos'} />
          )}

          {/* GENESIS Daily Briefing — Glass Card */}
          <StaggeredSection index={0} entrance={entrance} totalDuration={totalDuration}>
            <Pressable onPress={() => router.push('/(modals)/genesis-chat')}>
              <View style={{
                backgroundColor: GENESIS_COLORS.surfaceCard,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: GENESIS_COLORS.borderSubtle,
                padding: 20,
                gap: 12,
                shadowColor: '#6D00FF',
                shadowOpacity: 0.25,
                shadowRadius: 15,
                shadowOffset: { width: 0, height: 0 },
                elevation: 8,
              }}>
                <LinearGradient
                  colors={['rgba(109,0,255,0.06)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 }}
                />
                {/* Phase Badge */}
                <View style={{
                  alignSelf: 'flex-start',
                  backgroundColor: GENESIS_COLORS.primaryDim,
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderColor: GENESIS_COLORS.borderActive,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}>
                  <Text style={{
                    color: GENESIS_COLORS.primary,
                    fontSize: 10,
                    fontFamily: 'JetBrainsMonoSemiBold',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}>{phaseConfig.label}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} color={phaseConfig.accentColor} />
                  <Text style={{ color: phaseConfig.accentColor, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>
                    GENESIS
                  </Text>
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold', lineHeight: 20 }}>
                  {greeting}
                </Text>
                <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter', lineHeight: 19 }}>
                  {briefingMessage}
                </Text>
              </View>
            </Pressable>
          </StaggeredSection>

          {/* GENESIS Proactive Insight */}
          {insightMessage && (
            <Animated.View style={insightStyle}>
              <View style={{
                backgroundColor: GENESIS_COLORS.surfaceCard,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: GENESIS_COLORS.borderSubtle,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                overflow: 'hidden',
              }}>
                {/* Purple accent bar */}
                <View style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  backgroundColor: '#a866ff',
                  borderRadius: 2,
                }} />
                <Cpu size={14} color="#a866ff" />
                <Text style={{
                  flex: 1,
                  color: GENESIS_COLORS.textSecondary,
                  fontSize: 12,
                  fontFamily: 'Inter',
                  lineHeight: 17,
                  marginLeft: 2,
                }}>
                  {insightMessage}
                </Text>
                <Pressable
                  onPress={() => setInsightDismissed(true)}
                  hitSlop={8}
                  style={{ padding: 2 }}
                >
                  <X size={14} color={GENESIS_COLORS.textMuted} />
                </Pressable>
              </View>
            </Animated.View>
          )}

          {/* Quick Metrics Row */}
          <StaggeredSection index={1} entrance={entrance} totalDuration={totalDuration}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <MetricMini icon={<Flame size={14} color="#FF6B6B" />} value={nutritionTotals.calories > 0 ? kcalDisplay : '--'} label="kcal" />
              <MetricMini icon={<Moon size={14} color={GENESIS_COLORS.info} />} value={sleepValue} label="sleep" />
              <MetricMini icon={<Droplets size={14} color={GENESIS_COLORS.cyan} />} value={water > 0 ? waterDisplay : '--'} label="cups" />
              <MetricMini icon={<Footprints size={14} color={GENESIS_COLORS.warning} />} value={healthSnapshot?.steps ? stepsDisplay : '--'} label="steps" />
            </View>
          </StaggeredSection>

          {/* Daily Missions */}
          <StaggeredSection index={2} entrance={entrance} totalDuration={totalDuration}>
          <SectionLabel title="HOY">
            {isDataLoading ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={{ width: 140, height: 150 }}>
                    <SkeletonCard />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                <MissionCard
                  icon={<Dumbbell size={18} color={phaseConfig.color} />}
                  iconBg={phaseConfig.color + '20'}
                  title="Train"
                  subtitle={todayPlan ? todayPlan.name : 'Día de descanso'}
                  detail={todayPlan ? `${todayPlan.exercises.length} ejercicios · ${todayPlan.estimatedDuration} min` : 'Recovery activo'}
                  onPress={() => router.push('/(tabs)/train')}
                  gradientColors={[phaseConfig.color + '15', 'rgba(20,18,26,0.85)']}
                />
                <MissionCard
                  icon={<Utensils size={18} color={GENESIS_COLORS.success} />}
                  iconBg={GENESIS_COLORS.success + '20'}
                  title="Fuel"
                  subtitle={`${kcalValue} / ${dailyGoal.toLocaleString()}`}
                  detail={remaining > 0 ? `Faltan ${remaining.toLocaleString()} kcal` : 'Meta alcanzada'}
                  onPress={() => router.push('/(tabs)/fuel')}
                  gradientColors={[GENESIS_COLORS.success + '15', 'rgba(20,18,26,0.85)']}
                />
                <MissionCard
                  icon={<Brain size={18} color={GENESIS_COLORS.info} />}
                  iconBg={GENESIS_COLORS.info + '20'}
                  title="Check-in"
                  subtitle={todayCheckIn ? 'Completado' : 'Pendiente'}
                  detail={todayCheckIn ? todayCheckIn.mood : 'Registra tu día'}
                  onPress={() => router.push('/(modals)/check-in')}
                  gradientColors={[GENESIS_COLORS.info + '15', 'rgba(20,18,26,0.85)']}
                />
              </ScrollView>
            )}
          </SectionLabel>
          </StaggeredSection>

          {/* Micro-Lesson */}
          <StaggeredSection index={3} entrance={entrance} totalDuration={totalDuration}>
          {todayLesson && (
            <SectionLabel title="APRENDE HOY">
              <ImageCard
                imageUrl={todayLesson.imageUrl}
                height={140}
                badge={todayLesson.duration}
                badgeColor={phaseConfig.color}
                onPress={() => router.push(`/(screens)/education-detail?id=${todayLesson.id}`)}
              >
                <View style={{ gap: 4 }}>
                  <Text style={{ color: phaseConfig.accentColor, fontSize: 10, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1 }}>
                    {todayLesson.category.toUpperCase()}
                  </Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>
                    {todayLesson.title}
                  </Text>
                </View>
              </ImageCard>
            </SectionLabel>
          )}
          </StaggeredSection>

          {/* Week Progress */}
          <StaggeredSection index={4} entrance={entrance} totalDuration={totalDuration}>
          <SectionLabel title="ESTA SEMANA">
            <GlassCard shine>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'JetBrainsMonoBold' }}>Progreso Semanal</Text>
                <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>{completedDays}/7 días</Text>
              </View>
              <ProgressBar progress={(completedDays / 7) * 100} gradient />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 }}>
                {DAYS.map((day, i) => {
                  const dayIndex = i + 1;
                  const isCompleted = dayIndex <= completedDays;
                  const isToday = dayIndex === currentDayIndex;
                  return (
                    <View
                      key={`${day}-${i}`}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isCompleted ? phaseConfig.color : isToday ? 'transparent' : 'rgba(255,255,255,0.08)',
                        borderWidth: isToday && !isCompleted ? 1 : 0,
                        borderColor: phaseConfig.accentColor,
                      }}
                    >
                      <Text style={{
                        color: isCompleted || isToday ? '#FFFFFF' : GENESIS_COLORS.textMuted,
                        fontSize: 10,
                        fontFamily: 'JetBrainsMono',
                      }}>
                        {day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </GlassCard>
          </SectionLabel>
          </StaggeredSection>

          {/* Streak */}
          <StaggeredSection index={5} entrance={entrance} totalDuration={totalDuration}>
          <GlassCard>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Flame size={22} color="#F97316" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: 'InterBold' }}>{streak} {streak === 1 ? 'día' : 'días'} de racha</Text>
                <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'Inter' }}>{streak > 0 ? '¡Sigue así!' : 'Completa tu check-in para iniciar tu racha.'}</Text>
              </View>
            </View>
          </GlassCard>
          </StaggeredSection>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MetricMini({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: GENESIS_COLORS.surfaceCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: GENESIS_COLORS.borderSubtle,
      padding: 10,
      alignItems: 'center',
      gap: 4,
    }}>
      {icon}
      <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'JetBrainsMonoBold' }}>{value}</Text>
      <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 9, fontFamily: 'JetBrainsMonoMedium' }}>{label}</Text>
    </View>
  );
}

function MissionCard({
  icon, iconBg, title, subtitle, detail, onPress, gradientColors,
}: {
  icon: React.ReactNode; iconBg: string; title: string; subtitle: string; detail: string; onPress?: () => void;
  gradientColors?: [string, string];
}) {
  const content = (
    <>
      <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: iconBg }}>
        {icon}
      </View>
      <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'JetBrainsMonoBold' }}>{title}</Text>
      <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'Inter' }}>{subtitle}</Text>
      <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'Inter' }}>{detail}</Text>
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 140,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={gradientColors ?? ['rgba(20,18,26,0.7)', 'rgba(20,18,26,0.7)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ gap: 8, padding: 16 }}
      >
        {content}
      </LinearGradient>
    </Pressable>
  );
}

function StaggeredSection({ index, entrance, totalDuration, children }: {
  index: number;
  entrance: { progress: { value: number }; delayMs: number };
  totalDuration: number;
  children: React.ReactNode;
}) {
  const style = useAnimatedStyle(() => {
    const { opacity, translateY } = getStaggeredStyle(entrance.progress.value, index, entrance.delayMs, totalDuration);
    return { opacity, transform: [{ translateY }] };
  });
  return <Animated.View style={style}>{children}</Animated.View>;
}
