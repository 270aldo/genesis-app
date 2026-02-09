import { useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, Sparkles, ChevronRight, Info, Moon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { GlassCard, GradientCard, ListItemCard, Divider, SeasonHeader } from '../../components/ui';
import { ImageCard } from '../../components/cards';
import { GENESIS_COLORS } from '../../constants/colors';
import { useSeasonStore, useTrainingStore } from '../../stores';
import { MOCK_WORKOUT_PLANS, PHASE_CONFIG } from '../../data';
import type { PhaseType } from '../../types';

export default function TrainScreen() {
  const router = useRouter();
  const { seasonNumber, currentWeek, currentPhase, weeks } = useSeasonStore();
  const { todayPlan, isTodayPlanLoading, fetchTodayPlan } = useTrainingStore();

  useEffect(() => {
    fetchTodayPlan();
  }, []);

  // Use real plan from BFF, fall back to mock for demo mode
  const workout = todayPlan ?? MOCK_WORKOUT_PLANS.push_hyp;
  const exercises = workout.exercises;
  const phase = ((todayPlan?.phase || currentPhase || 'hypertrophy') as PhaseType);
  const phaseConfig = PHASE_CONFIG[phase];

  // Loading state
  if (isTodayPlanLoading) {
    return (
      <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} edges={['top']}>
          <ActivityIndicator size="large" color={GENESIS_COLORS.primary} />
          <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 12, fontFamily: 'JetBrainsMonoMedium', marginTop: 12 }}>
            Cargando tu plan...
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Rest day state (BFF returned plan: null and we have a real season)
  if (todayPlan === null && !isTodayPlanLoading && seasonNumber > 0) {
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
            <GlassCard shine>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} color={GENESIS_COLORS.success} />
                <Text style={{ color: GENESIS_COLORS.success, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>GENESIS TIP</Text>
              </View>
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter', lineHeight: 18 }}>
                Los días de descanso son tan importantes como los de entrenamiento. La hipertrofia ocurre durante la recuperación, no durante el entrenamiento.
              </Text>
            </GlassCard>
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
          <ImageCard
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
          </ImageCard>

          {/* Phase Info */}
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

          {/* Exercises */}
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
              {exercises.map((ex) => (
                <ListItemCard
                  key={ex.id}
                  icon={<Dumbbell size={18} color={phaseConfig.accentColor} />}
                  title={ex.name}
                  subtitle={`${ex.sets} × ${ex.reps} reps${ex.weight ? ` · ${ex.weight} ${ex.unit}` : ''}`}
                  variant="purple"
                  onPress={() => {
                    router.push(`/(screens)/exercise-detail?id=${ex.id}`);
                  }}
                  right={<ChevronRight size={16} color={GENESIS_COLORS.textTertiary} />}
                />
              ))}
            </View>
          </View>

          <Divider />

          {/* Summary */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 13, fontFamily: 'JetBrainsMonoMedium' }}>{exercises.length} ejercicios</Text>
            <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 13, fontFamily: 'JetBrainsMonoMedium' }}>~{workout.estimatedDuration} min</Text>
          </View>

          {/* GENESIS Tip */}
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

          {/* Start Button */}
          <Pressable
            onPress={() => {
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
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
