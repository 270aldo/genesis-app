import { Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Coffee, Utensils, Apple, UtensilsCrossed, Droplets, Info, Sparkles } from 'lucide-react-native';
import {
  GlassCard,
  MacroCard,
  ScreenHeader,
  SectionLabel,
  ProgressBar,
  WaterDots,
  CircularProgress,
  SeasonHeader,
} from '../../components/ui';
import { ImageCard } from '../../components/cards';
import { useSeasonStore, useNutritionStore } from '../../stores';
import { MOCK_MEALS, PHASE_CONFIG, getPhaseNutritionTargets } from '../../data';
import type { PhaseType } from '../../types';

const mealIcons: Record<string, typeof Coffee> = {
  Breakfast: Coffee,
  Lunch: Utensils,
  Snack: Apple,
  Dinner: UtensilsCrossed,
};

export default function FuelScreen() {
  const { seasonNumber, currentWeek, currentPhase, weeks } = useSeasonStore();
  const { water, targetWater, addWater } = useNutritionStore();
  const phase = (currentPhase || 'hypertrophy') as PhaseType;
  const phaseConfig = PHASE_CONFIG[phase];

  // Phase-aware targets
  const targets = getPhaseNutritionTargets(phase);

  // Sum consumed from mock meals (exclude unlogged)
  const loggedMeals = MOCK_MEALS.filter((m) => m.calories > 0);
  const consumed = loggedMeals.reduce((sum, m) => sum + m.calories, 0);
  const proteinConsumed = loggedMeals.reduce((sum, m) => sum + m.protein, 0);
  const carbsConsumed = loggedMeals.reduce((sum, m) => sum + m.carbs, 0);
  const fatConsumed = loggedMeals.reduce((sum, m) => sum + m.fat, 0);
  const remaining = Math.max(0, targets.calories - consumed);
  const progress = Math.min(100, (consumed / targets.calories) * 100);

  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
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

          <ScreenHeader title="Nutrition" subtitle={new Date().toLocaleDateString('es-MX', { weekday: 'long', month: 'short', day: 'numeric' })} />

          {/* Phase Nutrition Banner */}
          <GlassCard>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Info size={16} color={phaseConfig.accentColor} />
              <Text style={{ color: phaseConfig.accentColor, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>
                {phaseConfig.label.toUpperCase()} · NUTRICIÓN
              </Text>
            </View>
            <Text style={{ color: '#c4bfcc', fontSize: 12, fontFamily: 'Inter', lineHeight: 18 }}>
              {phaseConfig.nutritionNote}
            </Text>
            {targets.surplus !== 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: targets.surplus > 0 ? '#22ff73' : '#F97316' }} />
                <Text style={{ color: '#827a89', fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>
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
                  <Text style={{ color: '#827a89', fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>
                    / {targets.calories.toLocaleString()}
                  </Text>
                </CircularProgress>
                <Text style={{ color: '#827a89', fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>{remaining} restantes</Text>
              </View>
            </GlassCard>
          </SectionLabel>

          {/* Macros */}
          <SectionLabel title="MACROS">
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <MacroCard label="PROTEIN" value={proteinConsumed} unit="g" progress={Math.min(100, (proteinConsumed / targets.protein) * 100)} color="#38bdf8" />
              <MacroCard label="CARBS" value={carbsConsumed} unit="g" progress={Math.min(100, (carbsConsumed / targets.carbs) * 100)} color="#22ff73" />
              <MacroCard label="FAT" value={fatConsumed} unit="g" progress={Math.min(100, (fatConsumed / targets.fat) * 100)} color="#F97316" />
            </View>
          </SectionLabel>

          {/* Meals with Images */}
          <SectionLabel title="COMIDAS">
            <View style={{ gap: 12 }}>
              {MOCK_MEALS.map((meal) => {
                const isLogged = meal.calories > 0;
                return (
                  <ImageCard
                    key={meal.id}
                    imageUrl={meal.imageUrl ?? ''}
                    height={100}
                    overlayColors={['transparent', 'rgba(13, 13, 43, 0.6)', 'rgba(13, 13, 43, 0.92)']}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ gap: 2 }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>{meal.name}</Text>
                        <Text style={{ color: '#827a89', fontSize: 11, fontFamily: 'Inter' }}>{meal.time}</Text>
                      </View>
                      {isLogged ? (
                        <View style={{ alignItems: 'flex-end', gap: 2 }}>
                          <Text style={{ color: '#22ff73', fontSize: 14, fontFamily: 'InterBold' }}>{meal.calories} cal</Text>
                          <Text style={{ color: '#827a89', fontSize: 9, fontFamily: 'JetBrainsMonoMedium' }}>
                            P:{meal.protein}g · C:{meal.carbs}g · F:{meal.fat}g
                          </Text>
                        </View>
                      ) : (
                        <View style={{ backgroundColor: 'rgba(255,107,107,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                          <Text style={{ color: '#ff6b6b', fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>Sin registrar</Text>
                        </View>
                      )}
                    </View>
                  </ImageCard>
                );
              })}
            </View>
          </SectionLabel>

          {/* Hydration */}
          <SectionLabel title="HIDRATACIÓN">
            <GlassCard>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Droplets size={18} color="#38bdf8" />
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
