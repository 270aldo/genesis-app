import { Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, Clock, Sparkles, ChevronRight, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { GlassCard, GradientCard, ListItemCard, Pill, ScreenHeader, SectionLabel, Divider, SeasonHeader } from '../../components/ui';
import { ImageCard } from '../../components/cards';
import { useSeasonStore, useTrainingStore } from '../../stores';
import { MOCK_WORKOUT_PLANS, PHASE_CONFIG } from '../../data';
import type { PhaseType } from '../../types';

const EXERCISE_NAME_TO_LIB_ID: Record<string, string> = {
  'Bench Press': 'lib_bench',
  'Incline DB Press': 'lib_incline_db',
  'Cable Flyes': 'lib_cable_fly',
  'OHP': 'lib_ohp',
  'Lateral Raises': 'lib_lat_raise',
  'Tricep Pushdowns': 'lib_tricep_pushdown',
};

export default function TrainScreen() {
  const router = useRouter();
  const { seasonNumber, currentWeek, currentPhase, weeks } = useSeasonStore();
  const phase = (currentPhase || 'hypertrophy') as PhaseType;
  const phaseConfig = PHASE_CONFIG[phase];

  // Get today's workout plan
  const workout = MOCK_WORKOUT_PLANS.push_hyp;
  const exercises = workout.exercises;

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

          {/* Workout Hero Card */}
          <ImageCard
            imageUrl={workout.imageUrl}
            height={200}
            overlayColors={['transparent', 'rgba(13, 13, 43, 0.5)', 'rgba(13, 13, 43, 0.95)']}
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
                  <Text style={{ color: '#827a89', fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>{workout.estimatedDuration} min</Text>
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
            <Text style={{ color: '#c4bfcc', fontSize: 12, fontFamily: 'Inter', lineHeight: 18 }}>
              Reps: {phaseConfig.repRange} · Sets: {phaseConfig.setsRange} · Descanso: {phaseConfig.restSeconds}s
            </Text>
          </GlassCard>

          {/* Exercises */}
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#827a89', fontSize: 11, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1.5 }}>
                EJERCICIOS
              </Text>
              <Pressable onPress={() => router.push('/(screens)/library')}>
                <Text style={{ color: '#b39aff', fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
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
                  subtitle={`${ex.sets} × ${ex.reps} reps · ${ex.weight} ${ex.unit}`}
                  variant="purple"
                  onPress={() => {
                    const libId = EXERCISE_NAME_TO_LIB_ID[ex.name];
                    if (libId) router.push(`/(screens)/exercise-detail?id=${libId}`);
                  }}
                  right={<ChevronRight size={16} color="#827a89" />}
                />
              ))}
            </View>
          </View>

          <Divider />

          {/* Summary */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#827a89', fontSize: 13, fontFamily: 'JetBrainsMonoMedium' }}>{exercises.length} ejercicios</Text>
            <Text style={{ color: '#827a89', fontSize: 13, fontFamily: 'JetBrainsMonoMedium' }}>~{workout.estimatedDuration} min</Text>
          </View>

          {/* GENESIS Tip */}
          <GlassCard shine>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color={phaseConfig.accentColor} />
              <Text style={{ color: phaseConfig.accentColor, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>GENESIS TIP</Text>
            </View>
            <Text style={{ color: '#c4bfcc', fontSize: 12, fontFamily: 'Inter', lineHeight: 18 }}>
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
