import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Droplets, Info } from 'lucide-react-native';
import {
  GlassCard,
  MacroCard,
  ScreenHeader,
  SectionLabel,
  WaterDots,
  CircularProgress,
  SeasonHeader,
} from '../../components/ui';
import { GENESIS_COLORS } from '../../constants/colors';
import { useSeasonStore, useNutritionStore } from '../../stores';
import { PHASE_CONFIG, getPhaseNutritionTargets } from '../../data';
import type { PhaseType } from '../../types';

export default function FuelScreen() {
  const { seasonNumber, currentWeek, currentPhase, weeks } = useSeasonStore();
  const { meals, water, targetWater, addWater, getDailyTotals, isLoading } = useNutritionStore();
  const phase = (currentPhase || 'hypertrophy') as PhaseType;
  const phaseConfig = PHASE_CONFIG[phase];

  // Fetch real data on mount
  useEffect(() => {
    useNutritionStore.getState().fetchMeals();
    useNutritionStore.getState().fetchWater();
  }, []);

  // Phase-aware targets
  const targets = getPhaseNutritionTargets(phase);

  // Daily totals from real store data
  const totals = getDailyTotals();
  const consumed = totals.calories;
  const proteinConsumed = totals.protein;
  const carbsConsumed = totals.carbs;
  const fatConsumed = totals.fat;
  const remaining = Math.max(0, targets.calories - consumed);
  const progress = Math.min(100, (consumed / targets.calories) * 100);

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

          {isLoading && (
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <ActivityIndicator size="small" color={GENESIS_COLORS.primary} />
            </View>
          )}

          {/* Phase Nutrition Banner */}
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

          {/* Calories — Circular Display */}
          <SectionLabel title="CALORÍAS">
            <GlassCard shine>
              <View style={{ alignItems: 'center', gap: 12 }}>
                <CircularProgress progress={progress} size={120} strokeWidth={10} color={phaseConfig.color}>
                  <Text style={{ color: '#FFFFFF', fontSize: 28, fontFamily: 'InterBold' }}>
                    {consumed.toLocaleString()}
                  </Text>
                  <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>
                    / {targets.calories.toLocaleString()}
                  </Text>
                </CircularProgress>
                <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>{remaining} restantes</Text>
              </View>
            </GlassCard>
          </SectionLabel>

          {/* Macros */}
          <SectionLabel title="MACROS">
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <MacroCard label="PROTEIN" value={proteinConsumed} unit="g" progress={Math.min(100, (proteinConsumed / targets.protein) * 100)} color={GENESIS_COLORS.info} />
              <MacroCard label="CARBS" value={carbsConsumed} unit="g" progress={Math.min(100, (carbsConsumed / targets.carbs) * 100)} color={GENESIS_COLORS.success} />
              <MacroCard label="FAT" value={fatConsumed} unit="g" progress={Math.min(100, (fatConsumed / targets.fat) * 100)} color={GENESIS_COLORS.warning} />
            </View>
          </SectionLabel>

          {/* Meals */}
          <SectionLabel title="COMIDAS">
            <View style={{ gap: 12 }}>
              {meals.length === 0 ? (
                <GlassCard>
                  <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter', textAlign: 'center' }}>
                    {isLoading ? 'Cargando comidas...' : 'Registra tu primera comida del día.'}
                  </Text>
                </GlassCard>
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

          {/* Hydration */}
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
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
