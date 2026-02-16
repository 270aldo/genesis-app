import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, Sparkles, ChevronRight, Info, Moon, Layers, Zap, Target, Footprints, Grip } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { GlassCard, GradientCard, ListItemCard, Divider, SeasonHeader, ErrorBanner } from '../../components/ui';
import { CoachReviewBadge } from '../../components/coach';
import { ImageCard } from '../../components/cards';
import { GENESIS_COLORS } from '../../constants/colors';
import { useSeasonStore, useTrainingStore } from '../../stores';
import { hasSupabaseConfig } from '../../services/supabaseClient';
import { MOCK_WORKOUT_PLANS, PHASE_CONFIG } from '../../data';
import type { PhaseType } from '../../types';
import { useStaggeredEntrance, getStaggeredStyle } from '../../hooks/useStaggeredEntrance';
import { SkeletonCard } from '../../components/loading/SkeletonCard';
import { GenesisGuide } from '../../components/onboarding';

const MUSCLE_GROUP_STYLES: Record<string, { colors: [string, string]; Icon: typeof Dumbbell }> = {
  chest: { colors: ['#FF6B6B', '#D94040'], Icon: Layers },
  back: { colors: ['#6D00FF', '#4A00B0'], Icon: Layers },
  shoulders: { colors: ['#00E5FF', '#0097A7'], Icon: Target },
  legs: { colors: ['#00F5AA', '#00A86B'], Icon: Footprints },
  arms: { colors: ['#F97316', '#D45A00'], Icon: Zap },
  core: { colors: ['#FFD93D', '#D4A800'], Icon: Grip },
  default: { colors: ['#6D00FF', '#4A00B0'], Icon: Dumbbell },
};

function getMuscleGroupStyle(muscleGroups: string[]) {
  const primary = (muscleGroups[0] || '').toLowerCase();
  if (primary.includes('chest') || primary.includes('pec')) return MUSCLE_GROUP_STYLES.chest;
  if (primary.includes('back') || primary.includes('lat') || primary.includes('row')) return MUSCLE_GROUP_STYLES.back;
  if (primary.includes('shoulder') || primary.includes('delt')) return MUSCLE_GROUP_STYLES.shoulders;
  if (primary.includes('quad') || primary.includes('ham') || primary.includes('glute') || primary.includes('leg') || primary.includes('calf')) return MUSCLE_GROUP_STYLES.legs;
  if (primary.includes('bicep') || primary.includes('tricep') || primary.includes('arm') || primary.includes('curl')) return MUSCLE_GROUP_STYLES.arms;
  if (primary.includes('core') || primary.includes('ab')) return MUSCLE_GROUP_STYLES.core;
  return MUSCLE_GROUP_STYLES.default;
}

export default function TrainScreen() {
  const router = useRouter();
  const { seasonNumber, currentWeek, currentPhase, weeks } = useSeasonStore();
  const { todayPlan, isTodayPlanLoading, error: trainError, fetchTodayPlan } = useTrainingStore();

  useEffect(() => {
    fetchTodayPlan();
  }, []);

  // Use real plan from BFF, fall back to mock only in demo mode (no Supabase config)
  const workout = todayPlan ?? (!hasSupabaseConfig ? MOCK_WORKOUT_PLANS.push_hyp : null);
  const exercises = workout?.exercises ?? [];
  const phase = ((todayPlan?.phase || currentPhase || 'hypertrophy') as PhaseType);
  const phaseConfig = PHASE_CONFIG[phase];

  const entrance = useStaggeredEntrance(5, 120);
  const totalDuration = 600 + 5 * 120;

  // Loading state
  if (isTodayPlanLoading) {
    return (
      <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 16 }}>
            <SeasonHeader seasonNumber={seasonNumber} currentWeek={currentWeek} currentPhase={phase} weeks={weeks} />
            <View style={{ height: 200 }}><SkeletonCard /></View>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Error state — BFF failed, show error instead of silent mock fallback
  if (trainError && !workout) {
    return (
      <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100, gap: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <SeasonHeader
              seasonNumber={seasonNumber}
              currentWeek={currentWeek}
              currentPhase={phase}
              weeks={weeks}
            />
            <ErrorBanner message={trainError} />
            <GlassCard>
              <View style={{ alignItems: 'center', gap: 12, paddingVertical: 24 }}>
                <Dumbbell size={40} color={GENESIS_COLORS.textTertiary} />
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: 'InterBold' }}>
                  No se pudo cargar tu plan
                </Text>
                <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter', textAlign: 'center', lineHeight: 20 }}>
                  Verifica tu conexión e intenta de nuevo.
                </Text>
                <Pressable onPress={() => fetchTodayPlan()}>
                  <GradientCard className="px-6 py-3">
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'JetBrainsMonoSemiBold' }}>REINTENTAR</Text>
                  </GradientCard>
                </Pressable>
              </View>
            </GlassCard>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Rest day state (BFF returned plan: null and we have a real season)
  if (todayPlan === null && !isTodayPlanLoading && !trainError && seasonNumber > 0) {
    // Check if fetchTodayPlan has been called (todayPlan starts as null before fetch too)
    // We use a simple heuristic: if the store has attempted the fetch, show rest day
    return (
      <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100, gap: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <SeasonHeader
              seasonNumber={seasonNumber}
              currentWeek={currentWeek}
              currentPhase={phase}
              weeks={weeks}
            />
            <GlassCard>
              <View style={{ alignItems: 'center', gap: 12, paddingVertical: 24 }}>
                <Moon size={40} color={GENESIS_COLORS.success} />
                <Text style={{ color: '#FFFFFF', fontSize: 20, fontFamily: 'InterBold' }}>
                  Hoy es día de descanso
                </Text>
                <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter', textAlign: 'center', lineHeight: 20 }}>
                  Tu cuerpo se recupera y crece mientras descansas. Enfócate en nutrición, hidratación y dormir bien.
                </Text>
              </View>
            </GlassCard>
            <GenesisGuide message="Los dias de descanso son tan importantes como los de entrenamiento. La hipertrofia ocurre durante la recuperacion, no durante el entrenamiento." />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100, gap: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Season Header */}
          <SeasonHeader
            seasonNumber={seasonNumber}
            currentWeek={currentWeek}
            currentPhase={phase}
            weeks={weeks}
          />

          {/* Workout Hero Card */}
          <StaggeredSection index={0} entrance={entrance} totalDuration={totalDuration}>
            {workout && <ImageCard
              imageUrl={workout.imageUrl}
              height={200}
              overlayColors={['transparent', 'rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.95)']}
            >
              <View style={{ gap: 8 }}>
                <Text style={{ color: phaseConfig.accentColor, fontSize: 10, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 1.5 }}>
                  {workout.dayLabel.toUpperCase()} · {phaseConfig.label.toUpperCase()}
                </Text>
                <Text style={{ color: '#FFFFFF', fontSize: 22, fontFamily: 'InterBold' }}>
                  {workout.name}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {workout.muscleGroups.map((mg) => (
                    <View key={mg} style={{ backgroundColor: phaseConfig.color + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ color: phaseConfig.accentColor, fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>{mg}</Text>
                    </View>
                  ))}
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>{workout.estimatedDuration} min</Text>
                  </View>
                </View>
              </View>
            </ImageCard>}
            <CoachReviewBadge visible={false} />
          </StaggeredSection>

          {/* Phase Info */}
          <StaggeredSection index={1} entrance={entrance} totalDuration={totalDuration}>
            <GlassCard>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Info size={16} color={phaseConfig.accentColor} />
                <Text style={{ color: phaseConfig.accentColor, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>
                  {phaseConfig.label.toUpperCase()} PHASE
                </Text>
              </View>
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter', lineHeight: 18 }}>
                Reps: {phaseConfig.repRange} · Sets: {phaseConfig.setsRange} · Descanso: {phaseConfig.restSeconds}s
              </Text>
            </GlassCard>
          </StaggeredSection>

          {/* Exercises */}
          <StaggeredSection index={2} entrance={entrance} totalDuration={totalDuration}>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1.5 }}>
                  EJERCICIOS
                </Text>
                <Pressable onPress={() => router.push('/(screens)/library')}>
                  <Text style={{ color: GENESIS_COLORS.primary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                    Ver librería →
                  </Text>
                </Pressable>
              </View>
              <View style={{ gap: 12 }}>
                {exercises.map((ex) => {
                  const mgStyle = getMuscleGroupStyle(workout?.muscleGroups ?? []);
                  const IconComp = mgStyle.Icon;
                  return (
                    <ListItemCard
                      key={ex.id}
                      icon={
                        <LinearGradient
                          colors={mgStyle.colors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconComp size={18} color="rgba(255,255,255,0.6)" />
                        </LinearGradient>
                      }
                      title={ex.name}
                      subtitle={`${ex.sets} × ${ex.reps} reps${ex.weight ? ` · ${ex.weight} ${ex.unit}` : ''}`}
                      variant="purple"
                      onPress={() => {
                        router.push(`/(screens)/exercise-detail?id=${ex.id}`);
                      }}
                      right={<ChevronRight size={16} color={GENESIS_COLORS.textTertiary} />}
                    />
                  );
                })}
              </View>
            </View>
          </StaggeredSection>

          {/* GENESIS Tip */}
          <StaggeredSection index={3} entrance={entrance} totalDuration={totalDuration}>
            <GlassCard shine>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} color={phaseConfig.accentColor} />
                <Text style={{ color: phaseConfig.accentColor, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>GENESIS TIP</Text>
              </View>
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter', lineHeight: 18 }}>
                {phase === 'hypertrophy' && 'Controla el tempo: 3 segundos bajando, 1 segundo arriba. El tiempo bajo tensión es clave para hipertrofia.'}
                {phase === 'strength' && 'Respeta los descansos largos entre series pesadas. Tu sistema nervioso necesita recuperar para dar el máximo.'}
                {phase === 'power' && 'Velocidad es la clave. Mueve el peso con intención explosiva en cada rep.'}
                {phase === 'deload' && 'Semana de recuperación. Baja el peso un 40% y enfócate en técnica perfecta.'}
              </Text>
            </GlassCard>
          </StaggeredSection>

          {/* Divider + Summary + Start Button */}
          <StaggeredSection index={4} entrance={entrance} totalDuration={totalDuration}>
            <Divider />

            {/* Summary */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
              <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 13, fontFamily: 'JetBrainsMonoMedium' }}>{exercises.length} ejercicios</Text>
              <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 13, fontFamily: 'JetBrainsMonoMedium' }}>~{workout?.estimatedDuration ?? 0} min</Text>
            </View>

            {/* Start Button */}
            <Pressable
              disabled={!workout}
              style={{ marginTop: 24 }}
              onPress={() => {
                if (!workout) return;
                const session = {
                  id: `session-${Date.now()}`,
                  date: new Date().toISOString(),
                  exercises: workout.exercises.map((ex) => ({ ...ex, completed: false })),
                  duration: 0,
                  completed: false,
                };
                useTrainingStore.getState().startWorkout(session);
                router.push('/(screens)/active-workout');
              }}
            >
              <GradientCard className="items-center py-4">
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'JetBrainsMonoSemiBold' }}>START WORKOUT</Text>
              </GradientCard>
            </Pressable>
          </StaggeredSection>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
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
