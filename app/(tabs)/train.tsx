import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ScrollView, Swipeable } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dumbbell, ChevronRight, Moon, Camera, ArrowLeftRight } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { GlassCard, GradientCard, ListItemCard, SeasonHeader, ErrorBanner, CollapsibleSection, GenesisIcon } from '../../components/ui';
import { SwapExerciseSheet } from '../../components/training';
import { ImageCard } from '../../components/cards';
import { GENESIS_COLORS, getMuscleGroupColor } from '../../constants/colors';
import { useSeasonStore, useTrainingStore } from '../../stores';
import { hasSupabaseConfig } from '../../services/supabaseClient';
import { MOCK_WORKOUT_PLANS, PHASE_CONFIG, IMAGES, GENESIS_TIPS } from '../../data';
import type { PhaseType } from '../../types';
import { useStaggeredEntrance, getStaggeredStyle } from '../../hooks/useStaggeredEntrance';
import { SkeletonCard } from '../../components/loading/SkeletonCard';
import { GenesisGuide } from '../../components/onboarding';
import { hapticSelection } from '../../utils/haptics';

function getMuscleGroupImage(muscleGroups: string[]): string {
  const primary = (muscleGroups[0] || '').toLowerCase();
  if (primary.includes('chest') || primary.includes('pec')) return IMAGES.chest;
  if (primary.includes('back') || primary.includes('lat') || primary.includes('row')) return IMAGES.back;
  if (primary.includes('shoulder') || primary.includes('delt')) return IMAGES.shoulders;
  if (primary.includes('quad') || primary.includes('ham') || primary.includes('glute') || primary.includes('leg') || primary.includes('calf')) return IMAGES.legs;
  if (primary.includes('bicep') || primary.includes('tricep') || primary.includes('arm') || primary.includes('curl')) return IMAGES.arms;
  if (primary.includes('core') || primary.includes('ab')) return IMAGES.core;
  return IMAGES.chest;
}

export default function TrainScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 48 + Math.max(insets.bottom, 16);
  const { seasonNumber, currentWeek, currentPhase, weeks } = useSeasonStore();
  const { todayPlan, isTodayPlanLoading, error: trainError, fetchTodayPlan, previousSessions, exerciseCatalog, swapExercise } = useTrainingStore();

  const [swapTarget, setSwapTarget] = useState<{ id: string; name: string; muscleGroup: string } | null>(null);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    fetchTodayPlan();
    useTrainingStore.getState().fetchPreviousSessions();
    // Pre-fetch exercise catalog for swap alternatives
    if (exerciseCatalog.length === 0) {
      useTrainingStore.getState().fetchExerciseCatalog();
    }
  }, []);

  // Use real plan from BFF, fall back to mock only in demo mode (no Supabase config)
  const workout = todayPlan ?? (!hasSupabaseConfig ? MOCK_WORKOUT_PLANS.push_hyp : null);
  const exercises = workout?.exercises ?? [];
  const phase = ((todayPlan?.phase || currentPhase || 'hypertrophy') as PhaseType);
  const phaseConfig = PHASE_CONFIG[phase];

  // Rotate tips every 8 seconds
  const tips = useMemo(() => GENESIS_TIPS[phase] ?? [''], [phase]);
  useEffect(() => {
    if (tips.length <= 1) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [tips.length]);

  // Breathing animation for tip icon
  const tipGlow = useSharedValue(0.6);
  useEffect(() => {
    tipGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.6, { duration: 1000 }),
      ),
      -1,
      false,
    );
  }, []);
  const tipGlowStyle = useAnimatedStyle(() => ({
    opacity: tipGlow.value,
  }));

  const entrance = useStaggeredEntrance(6, 120);
  const totalDuration = 600 + 6 * 120;

  const handleSwap = useCallback((newEx: { id: string; name: string; imageUrl: string }) => {
    if (!swapTarget) return;
    swapExercise(swapTarget.id, newEx);
    setSwapTarget(null);
  }, [swapTarget, swapExercise]);

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
            <GlassCard style={{ backgroundColor: '#000000', borderColor: GENESIS_COLORS.primary, borderWidth: 1 }}>
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
    const completedCount = previousSessions.filter((s) => s.completed).length;
    const lastSession = previousSessions[0];
    const lastSessionDate = lastSession
      ? new Date(lastSession.date).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })
      : null;

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
            <GlassCard style={{ backgroundColor: '#000000', borderColor: GENESIS_COLORS.primary, borderWidth: 1 }}>
              <View style={{ alignItems: 'center', gap: 16, paddingVertical: 24 }}>
                {/* Moon icon with glow */}
                <View style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: GENESIS_COLORS.success + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: GENESIS_COLORS.success,
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 0 },
                }}>
                  <Moon size={36} color={GENESIS_COLORS.success} />
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 20, fontFamily: 'InterBold' }}>
                  Hoy es dia de descanso
                </Text>
                <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter', textAlign: 'center', lineHeight: 20 }}>
                  Tu cuerpo se recupera y crece mientras descansas. Enfocate en nutricion, hidratacion y dormir bien.
                </Text>

                {/* Recovery stats */}
                <View style={{ flexDirection: 'row', gap: 24, marginTop: 8 }}>
                  <View style={{ alignItems: 'center', gap: 4 }}>
                    <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 1 }}>RACHA</Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 20, fontFamily: 'JetBrainsMonoBold' }}>{completedCount}</Text>
                    <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 10, fontFamily: 'Inter' }}>sesiones</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: GENESIS_COLORS.borderSubtle }} />
                  <View style={{ alignItems: 'center', gap: 4 }}>
                    <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 1 }}>ULTIMO</Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'JetBrainsMonoBold' }}>
                      {lastSessionDate ?? '—'}
                    </Text>
                    <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 10, fontFamily: 'Inter' }} numberOfLines={1}>
                      {lastSession?.workoutName ?? lastSession?.exercises[0]?.name ?? '—'}
                    </Text>
                  </View>
                </View>
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
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 + tabBarHeight, gap: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Season Header */}
          <SeasonHeader
            seasonNumber={seasonNumber}
            currentWeek={currentWeek}
            currentPhase={phase}
            weeks={weeks}
          />

          {/* Workout Hero Card — gradient tinted by phase */}
          <StaggeredSection index={0} entrance={entrance} totalDuration={totalDuration}>
            {workout && <ImageCard
              imageUrl={workout.imageUrl}
              height={200}
              overlayColors={['transparent', 'rgba(0,0,0,0.5)', phaseConfig.accentColor + '99']}
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
                    <View key={mg} style={{ backgroundColor: getMuscleGroupColor(mg), borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>{mg}</Text>
                    </View>
                  ))}
                  <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>{workout.estimatedDuration} min</Text>
                  </View>
                </View>
              </View>
            </ImageCard>}
          </StaggeredSection>

          {/* Compact Phase Bar */}
          <StaggeredSection index={1} entrance={entrance} totalDuration={totalDuration}>
            <View style={{
              backgroundColor: phaseConfig.accentColor + '10',
              borderRadius: 10,
              paddingVertical: 8,
              paddingHorizontal: 14,
            }}>
              <Text style={{ color: phaseConfig.accentColor, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                {phaseConfig.label.toUpperCase()} · {phaseConfig.repRange} reps · {phaseConfig.setsRange} sets · {phaseConfig.restSeconds}s rest
              </Text>
            </View>
          </StaggeredSection>

          {/* Exercises — swipeable for swap */}
          <StaggeredSection index={2} entrance={entrance} totalDuration={totalDuration}>
            <View style={{ gap: 12 }}>
              <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1.5 }}>
                EJERCICIOS
              </Text>
              <View style={{ gap: 12 }}>
                {exercises.map((ex) => {
                  const catalogMatch = exerciseCatalog.find((c) => c.name.toLowerCase() === ex.name.toLowerCase());
                  const imageUri = catalogMatch?.imageUrl || getMuscleGroupImage(workout?.muscleGroups ?? []);
                  const muscleGroup = catalogMatch?.muscleGroup ?? (workout?.muscleGroups[0] ?? 'full_body').toLowerCase();

                  return (
                    <Swipeable
                      key={ex.id}
                      renderRightActions={() => (
                        <Pressable
                          onPress={() => {
                            hapticSelection();
                            setSwapTarget({ id: ex.id, name: ex.name, muscleGroup });
                          }}
                          style={{
                            backgroundColor: GENESIS_COLORS.primary + '20',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 72,
                            borderRadius: 14,
                            marginLeft: 8,
                          }}
                        >
                          <ArrowLeftRight size={20} color={GENESIS_COLORS.primary} />
                          <Text style={{ color: GENESIS_COLORS.primary, fontSize: 9, fontFamily: 'JetBrainsMonoSemiBold', marginTop: 4 }}>
                            SWAP
                          </Text>
                        </Pressable>
                      )}
                      overshootRight={false}
                    >
                      <ListItemCard
                        icon={
                          <Image
                            source={{ uri: imageUri }}
                            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                            contentFit="cover"
                            style={{ width: 36, height: 36, borderRadius: 10 }}
                            transition={200}
                          />
                        }
                        title={ex.name}
                        subtitle={
                          <Text style={{ color: 'rgba(192, 192, 192, 0.60)', fontSize: 11, fontFamily: 'Inter' }}>
                            {ex.sets} × {ex.reps} reps{ex.weight ? <Text> · <Text style={{ color: phaseConfig.accentColor }}>{ex.weight} {ex.unit}</Text></Text> : null}
                          </Text>
                        }
                        variant="purple"
                        onPress={() => {
                          router.push(`/(screens)/exercise-detail?id=${ex.id}`);
                        }}
                        right={<ChevronRight size={16} color={GENESIS_COLORS.textTertiary} />}
                      />
                    </Swipeable>
                  );
                })}
              </View>
            </View>
          </StaggeredSection>

          {/* GENESIS Tip — rotative with breathing icon */}
          <StaggeredSection index={3} entrance={entrance} totalDuration={totalDuration}>
            <GlassCard shine style={{ backgroundColor: '#000000', borderColor: GENESIS_COLORS.primary, borderWidth: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Animated.View style={tipGlowStyle}>
                  <GenesisIcon size={14} color={phaseConfig.accentColor} />
                </Animated.View>
                <Text style={{ color: phaseConfig.accentColor, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>GENESIS TIP</Text>
              </View>
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter', lineHeight: 18 }}>
                {tips[tipIndex]}
              </Text>
            </GlassCard>
          </StaggeredSection>

          {/* Camera Form Check CTA */}
          <StaggeredSection index={4} entrance={entrance} totalDuration={totalDuration}>
            <Pressable onPress={() => router.push('/(modals)/camera-scanner')}>
              <GlassCard style={{ backgroundColor: '#000000', borderColor: GENESIS_COLORS.primary, borderWidth: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: GENESIS_COLORS.primary + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Camera size={20} color={GENESIS_COLORS.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>Verificar forma</Text>
                    <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter' }}>
                      Usa la cámara para analizar tu técnica
                    </Text>
                  </View>
                  <ChevronRight size={18} color={GENESIS_COLORS.textTertiary} />
                </View>
              </GlassCard>
            </Pressable>
          </StaggeredSection>

          {/* Recent Sessions */}
          <StaggeredSection index={5} entrance={entrance} totalDuration={totalDuration}>
            <CollapsibleSection title="SESIONES RECIENTES" defaultExpanded={false} storageKey="genesis_section_recentSessions">
              {previousSessions.length === 0 ? (
                <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 12, fontFamily: 'Inter', textAlign: 'center', paddingVertical: 16 }}>
                  Sin sesiones anteriores aún
                </Text>
              ) : (
                <View style={{ gap: 10 }}>
                  {previousSessions.slice(0, 5).map((session) => (
                    <GlassCard key={session.id} style={{ backgroundColor: '#000000', borderColor: GENESIS_COLORS.primary, borderWidth: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ gap: 2 }}>
                          <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>
                            {session.workoutName ?? session.exercises[0]?.name ?? 'Sesion'}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            {session.completed && (
                              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: GENESIS_COLORS.success }} />
                            )}
                            <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                              {new Date(session.date).toLocaleDateString('es', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </Text>
                          </View>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 2 }}>
                          <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                            {session.exercises.length} ejercicios
                          </Text>
                          {session.duration > 0 && (
                            <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>
                              {Math.round(session.duration / 60)} min
                            </Text>
                          )}
                        </View>
                      </View>
                    </GlassCard>
                  ))}
                </View>
              )}
            </CollapsibleSection>
          </StaggeredSection>
        </ScrollView>

        {/* Sticky Start CTA */}
        <View style={{ position: 'absolute', bottom: tabBarHeight, left: 0, right: 0 }}>
          <LinearGradient
            colors={['transparent', GENESIS_COLORS.bgGradientEnd]}
            style={{ height: 40 }}
          />
          <View style={{ backgroundColor: GENESIS_COLORS.bgGradientEnd, paddingHorizontal: 20, paddingBottom: 12 }}>
            <Pressable
              disabled={!workout}
              style={{
                alignItems: 'center',
                paddingVertical: 16,
                borderRadius: 14,
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderWidth: 1.5,
                borderColor: GENESIS_COLORS.primary,
                shadowColor: GENESIS_COLORS.primary,
                shadowOpacity: 0.4,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 0 },
                elevation: 6,
                opacity: workout ? 1 : 0.5,
              }}
              onPress={() => {
                if (!workout) return;
                const session = {
                  id: `session-${Date.now()}`,
                  date: new Date().toISOString(),
                  exercises: workout.exercises.map((ex) => ({ ...ex, completed: false })),
                  duration: 0,
                  completed: false,
                  workoutName: workout.name,
                };
                useTrainingStore.getState().startWorkout(session);
                router.push('/(screens)/active-workout');
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 1 }}>INICIAR SESION</Text>
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', marginTop: 4 }}>
                {exercises.length} ejercicios · ~{workout?.estimatedDuration ?? 0} min
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Swap Exercise Sheet */}
        <SwapExerciseSheet
          visible={swapTarget !== null}
          exerciseId={swapTarget?.id ?? ''}
          exerciseName={swapTarget?.name ?? ''}
          muscleGroup={swapTarget?.muscleGroup ?? ''}
          onSelect={handleSwap}
          onClose={() => setSwapTarget(null)}
        />
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
