import { useEffect, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera, Droplets, Info, Plus, Sparkle, Coffee, Utensils, Moon, Apple } from 'lucide-react-native';
import { Image } from 'expo-image';
import {
  GlassCard,
  MacroCard,
  ScreenHeader,
  SectionLabel,
  AnimatedWaterTracker,
  AnimatedProgressRing,
  SeasonHeader,
  ErrorBanner,
  EmptyStateIllustration,
  CollapsibleSection,
} from '../../components/ui';
import { GENESIS_COLORS } from '../../constants/colors';
import { useSeasonStore, useNutritionStore } from '../../stores';
import { PHASE_CONFIG, getPhaseNutritionTargets } from '../../data';
import type { PhaseType } from '../../types';
import { useStaggeredEntrance, getStaggeredStyle } from '../../hooks/useStaggeredEntrance';
import { SkeletonCard } from '../../components/loading/SkeletonCard';

const MEAL_SECTIONS = [
  { key: 'breakfast', label: 'DESAYUNO', icon: Coffee },
  { key: 'lunch', label: 'ALMUERZO', icon: Utensils },
  { key: 'dinner', label: 'CENA', icon: Moon },
  { key: 'snack', label: 'SNACKS', icon: Apple },
] as const;

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

  // Group meals by type
  const mealsByType = useMemo(() => {
    const groups: Record<string, typeof meals> = { breakfast: [], lunch: [], dinner: [], snack: [] };
    meals.forEach((meal) => {
      const type = meal.name.toLowerCase();
      if (type.includes('breakfast') || type === 'desayuno') groups.breakfast.push(meal);
      else if (type.includes('lunch') || type === 'almuerzo') groups.lunch.push(meal);
      else if (type.includes('dinner') || type === 'cena') groups.dinner.push(meal);
      else groups.snack.push(meal);
    });
    return groups;
  }, [meals]);

  const entrance = useStaggeredEntrance(7, 120);
  const totalDuration = 600 + 7 * 120;

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
                      <Text style={{ color: '#FFFFFF', fontSize: 48, fontFamily: 'InterBold' }}>
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
                <MacroCard label="PROTEIN" value={proteinConsumed} unit="g" progress={Math.min(100, (proteinConsumed / targets.protein) * 100)} color={GENESIS_COLORS.info} gradientColors={['#6D00FF', '#9D4EDD']} />
                <MacroCard label="CARBS" value={carbsConsumed} unit="g" progress={Math.min(100, (carbsConsumed / targets.carbs) * 100)} color={GENESIS_COLORS.success} gradientColors={['#00F5AA', '#10B981']} />
                <MacroCard label="FAT" value={fatConsumed} unit="g" progress={Math.min(100, (fatConsumed / targets.fat) * 100)} color={GENESIS_COLORS.warning} gradientColors={['#F97316', '#EF4444']} />
              </View>
            </SectionLabel>
          </StaggeredSection>

          {/* Quick Actions */}
          <StaggeredSection index={3} entrance={entrance} totalDuration={totalDuration}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => router.push('/(modals)/camera-scanner')}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  borderWidth: 1.5,
                  borderColor: GENESIS_COLORS.primary,
                  shadowColor: GENESIS_COLORS.primary,
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 4,
                }}
              >
                <Camera size={16} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 0.5 }}>ESCANEAR</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/(modals)/camera-scanner')}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.15)',
                }}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 0.5 }}>AGREGAR</Text>
              </Pressable>
            </View>
          </StaggeredSection>

          {/* Meals — Grouped by Type */}
          <StaggeredSection index={4} entrance={entrance} totalDuration={totalDuration}>
            <SectionLabel title="COMIDAS">
              <View style={{ gap: 8 }}>
                {meals.length === 0 && !isLoading ? (
                  <EmptyStateIllustration variant="fuel" title="Sin comidas registradas" subtitle="Registra tu primera comida del dia." />
                ) : (
                  MEAL_SECTIONS.map((section) => {
                    const sectionMeals = mealsByType[section.key] ?? [];
                    const sectionCal = sectionMeals.reduce((sum, m) => sum + m.calories, 0);
                    const Icon = section.icon;
                    return (
                      <CollapsibleSection
                        key={section.key}
                        title={section.label}
                        defaultExpanded={sectionMeals.length > 0}
                        storageKey={`genesis_meals_${section.key}`}
                        headerRight={
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {sectionCal > 0 && (
                              <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>
                                {sectionCal} kcal
                              </Text>
                            )}
                            <Pressable
                              onPress={() => {}}
                              hitSlop={8}
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 11,
                                backgroundColor: GENESIS_COLORS.primary + '20',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Plus size={12} color={GENESIS_COLORS.primary} />
                            </Pressable>
                          </View>
                        }
                      >
                        {sectionMeals.length === 0 ? (
                          <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 12, fontFamily: 'Inter', textAlign: 'center', paddingVertical: 12 }}>
                            Toca + para agregar
                          </Text>
                        ) : (
                          <View style={{ gap: 8 }}>
                            {sectionMeals.map((meal) => (
                              <GlassCard key={meal.id}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                  <View style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    backgroundColor: phaseConfig.accentColor + '15',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                    <Icon size={20} color={phaseConfig.accentColor} />
                                  </View>
                                  <View style={{ flex: 1, gap: 2 }}>
                                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>
                                      {meal.name.charAt(0).toUpperCase() + meal.name.slice(1)}
                                    </Text>
                                    <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'Inter' }}>{meal.time}</Text>
                                  </View>
                                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>{meal.calories} cal</Text>
                                    <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 9, fontFamily: 'JetBrainsMonoMedium' }}>
                                      P:{meal.protein}g · C:{meal.carbs}g · F:{meal.fat}g
                                    </Text>
                                  </View>
                                </View>
                              </GlassCard>
                            ))}
                          </View>
                        )}
                      </CollapsibleSection>
                    );
                  })
                )}
              </View>
            </SectionLabel>
          </StaggeredSection>

          {/* Nutrition Insight */}
          <StaggeredSection index={5} entrance={entrance} totalDuration={totalDuration}>
            <GlassCard shine>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Sparkle size={14} color={phaseConfig.accentColor} />
                <Text style={{ color: phaseConfig.accentColor, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>INSIGHT</Text>
              </View>
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter', lineHeight: 18 }}>
                {remaining > 500
                  ? `Te faltan ${remaining.toLocaleString()} kcal. Asegúrate de completar tus comidas para alcanzar tu meta de ${phaseConfig.label.toLowerCase()}.`
                  : remaining > 0
                    ? `Casi llegas a tu meta — solo ${remaining} kcal más. ¡Buen trabajo!`
                    : 'Meta calórica alcanzada. Mantén tu ingesta balanceada el resto del día.'}
              </Text>
            </GlassCard>
          </StaggeredSection>

          {/* Hydration */}
          <StaggeredSection index={6} entrance={entrance} totalDuration={totalDuration}>
            <SectionLabel title="HIDRATACIÓN">
              <GlassCard>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Droplets size={18} color={GENESIS_COLORS.cyan} />
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'JetBrainsMonoBold' }}>Ingesta de Agua</Text>
                </View>
                <AnimatedWaterTracker current={water} target={targetWater} onAdd={addWater} />
              </GlassCard>
            </SectionLabel>
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
