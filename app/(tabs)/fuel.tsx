import { useEffect, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera, Droplets, Info } from 'lucide-react-native';
import {
  GlassCard,
  MacroCard,
  ScreenHeader,
  SectionLabel,
  WaterDots,
  AnimatedProgressRing,
  SeasonHeader,
  ErrorBanner,
  EmptyStateIllustration,
} from '../../components/ui';
import { GENESIS_COLORS } from '../../constants/colors';
import { useSeasonStore, useNutritionStore } from '../../stores';
import { PHASE_CONFIG, getPhaseNutritionTargets } from '../../data';
import type { PhaseType } from '../../types';
import { useStaggeredEntrance, getStaggeredStyle } from '../../hooks/useStaggeredEntrance';
import { SkeletonCard } from '../../components/loading/SkeletonCard';

export default function FuelScreen() {
  const router = useRouter();
  const { seasonNumber, currentWeek, currentPhase, weeks } = useSeasonStore();
  const { meals, water, targetWater, addWater, isLoading, error: nutritionError } = useNutritionStore();
  const phase = (currentPhase || 'hypertrophy') as PhaseType;
  const phaseConfig = PHASE_CONFIG[phase];

  // Fetch real data on mount
  useEffect(() => {
    useNutritionStore.getState().initializeTargets();
    useNutritionStore.getState().fetchMeals();
    useNutritionStore.getState().fetchWater();
  }, []);

  // Phase-aware targets
  const targets = getPhaseNutritionTargets(phase);

  // Daily totals from real store data — memoized to avoid recalc on every render
  const { consumed, proteinConsumed, carbsConsumed, fatConsumed, remaining, progress } = useMemo(() => {
    const cal = meals.reduce((sum, m) => sum + m.calories, 0);
    const prot = meals.reduce((sum, m) => sum + m.protein, 0);
    const carb = meals.reduce((sum, m) => sum + m.carbs, 0);
    const f = meals.reduce((sum, m) => sum + m.fat, 0);
    return {
      consumed: cal,
      proteinConsumed: prot,
      carbsConsumed: carb,
      fatConsumed: f,
      remaining: Math.max(0, targets.calories - cal),
      progress: Math.min(100, (cal / targets.calories) * 100),
    };
  }, [meals, targets.calories]);

  const entrance = useStaggeredEntrance(5, 120);
  const totalDuration = 600 + 5 * 120;

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120, gap: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Season Header */}
          <SeasonHeader
            seasonNumber={seasonNumber}
            currentWeek={currentWeek}
            currentPhase={phase}
            weeks={weeks}
          />

          <ScreenHeader title="Nutrition" subtitle={new Date().toLocaleDateString('es-MX', { weekday: 'long', month: 'short', day: 'numeric' })} />

          {nutritionError && <ErrorBanner message={nutritionError} />}

          {isLoading && (
            <View style={{ gap: 12 }}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          )}

          {/* Phase Nutrition Banner */}
          <StaggeredSection index={0} entrance={entrance} totalDuration={totalDuration}>
            <GlassCard>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Info size={16} color={phaseConfig.accentColor} />
                <Text style={{ color: phaseConfig.accentColor, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>
                  {phaseConfig.label.toUpperCase()} · NUTRICIÓN
                </Text>
              </View>
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter', lineHeight: 18 }}>
                {phaseConfig.nutritionNote}
              </Text>
              {targets.surplus !== 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: targets.surplus > 0 ? GENESIS_COLORS.success : GENESIS_COLORS.warning }} />
                  <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>
                    {targets.surplus > 0 ? '+' : ''}{targets.surplus} kcal ajuste de fase
                  </Text>
                </View>
              )}
            </GlassCard>
          </StaggeredSection>

          {/* Calories — Circular Display */}
          <StaggeredSection index={1} entrance={entrance} totalDuration={totalDuration}>
            <SectionLabel title="CALORÍAS">
              <GlassCard shine>
                <View style={{ alignItems: 'center', gap: 12 }}>
                  <View style={{ alignItems: 'center', justifyContent: 'center', width: 120, height: 120 }}>
                    <AnimatedProgressRing progress={progress / 100} size={120} strokeWidth={10} color={phaseConfig.color} />
                    <View style={{ position: 'absolute', alignItems: 'center' }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 28, fontFamily: 'InterBold' }}>
                        {consumed.toLocaleString()}
                      </Text>
                      <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>
                        / {targets.calories.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>{remaining} restantes</Text>
                </View>
              </GlassCard>
            </SectionLabel>
          </StaggeredSection>

          {/* Macros */}
          <StaggeredSection index={2} entrance={entrance} totalDuration={totalDuration}>
            <SectionLabel title="MACROS">
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <MacroCard label="PROTEIN" value={proteinConsumed} unit="g" progress={Math.min(100, (proteinConsumed / targets.protein) * 100)} color={GENESIS_COLORS.info} gradientColors={['#38bdf8', '#0ea5e9']} />
                <MacroCard label="CARBS" value={carbsConsumed} unit="g" progress={Math.min(100, (carbsConsumed / targets.carbs) * 100)} color={GENESIS_COLORS.success} gradientColors={['#00F5AA', '#00D4FF']} />
                <MacroCard label="FAT" value={fatConsumed} unit="g" progress={Math.min(100, (fatConsumed / targets.fat) * 100)} color={GENESIS_COLORS.warning} gradientColors={['#F97316', '#EF4444']} />
              </View>
            </SectionLabel>
          </StaggeredSection>

          {/* Meals */}
          <StaggeredSection index={3} entrance={entrance} totalDuration={totalDuration}>
            <SectionLabel title="COMIDAS">
              <View style={{ gap: 12 }}>
                {meals.length === 0 ? (
                  isLoading ? (
                    <SkeletonCard />
                  ) : (
                    <EmptyStateIllustration variant="fuel" title="Sin comidas registradas" subtitle="Registra tu primera comida del dia." />
                  )
                ) : (
                  meals.map((meal) => (
                    <GlassCard key={meal.id}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ gap: 2 }}>
                          <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>
                            {meal.name.charAt(0).toUpperCase() + meal.name.slice(1)}
                          </Text>
                          <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'Inter' }}>{meal.time}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 2 }}>
                          <Text style={{ color: GENESIS_COLORS.success, fontSize: 14, fontFamily: 'InterBold' }}>{meal.calories} cal</Text>
                          <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 9, fontFamily: 'JetBrainsMonoMedium' }}>
                            P:{meal.protein}g · C:{meal.carbs}g · F:{meal.fat}g
                          </Text>
                        </View>
                      </View>
                    </GlassCard>
                  ))
                )}
              </View>
            </SectionLabel>
          </StaggeredSection>

          {/* Hydration */}
          <StaggeredSection index={4} entrance={entrance} totalDuration={totalDuration}>
            <SectionLabel title="HIDRATACIÓN">
              <GlassCard>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Droplets size={18} color={GENESIS_COLORS.cyan} />
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'JetBrainsMonoBold' }}>Water Intake</Text>
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: 'InterBold' }}>{water}/{targetWater} vasos</Text>
                <WaterDots filled={water} total={targetWater} />
              </GlassCard>
            </SectionLabel>
          </StaggeredSection>
        </ScrollView>
      </SafeAreaView>

      {/* Scan FAB */}
      <Pressable
        onPress={() => router.push('/(modals)/camera-scanner')}
        style={{ position: 'absolute', bottom: 24, right: 24 }}
      >
        <LinearGradient
          colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: GENESIS_COLORS.primary,
            shadowOpacity: 0.5,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
          }}
        >
          <Camera size={24} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>
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
