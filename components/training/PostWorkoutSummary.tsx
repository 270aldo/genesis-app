import { Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { SlideInUp } from 'react-native-reanimated';
import { Clock, Dumbbell, TrendingUp, Layers, Trophy, Sparkles } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { CoachReviewBadge } from '../coach/CoachReviewBadge';
import { useCountUpDisplay } from '../../hooks/useCountUpDisplay';
import type { DetectedPR } from '../../utils/prDetection';

type PostWorkoutSummaryProps = {
  workoutName: string;
  duration: number;
  exercisesCompleted: number;
  totalSets: number;
  totalVolume: number;
  prs: DetectedPR[];
  phaseColor: string;
  coachReviewed: boolean;
  onClose: () => void;
};

export function PostWorkoutSummary({
  workoutName,
  duration,
  exercisesCompleted,
  totalSets,
  totalVolume,
  prs,
  phaseColor,
  coachReviewed,
  onClose,
}: PostWorkoutSummaryProps) {
  const exercisesDisplay = useCountUpDisplay(exercisesCompleted);
  const setsDisplay = useCountUpDisplay(totalSets);
  const volumeDisplay = useCountUpDisplay(totalVolume);
  const durationDisplay = useCountUpDisplay(duration);

  const stats = [
    { icon: <Dumbbell size={18} color={phaseColor} />, label: 'Ejercicios', value: exercisesDisplay, color: phaseColor },
    { icon: <Layers size={18} color={GENESIS_COLORS.info} />, label: 'Sets', value: setsDisplay, color: GENESIS_COLORS.info },
    { icon: <TrendingUp size={18} color={GENESIS_COLORS.success} />, label: 'Volumen (kg)', value: volumeDisplay, color: GENESIS_COLORS.success },
    { icon: <Clock size={18} color={GENESIS_COLORS.cyan} />, label: 'Minutos', value: durationDisplay, color: GENESIS_COLORS.cyan },
  ];

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 120, gap: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ alignItems: 'center', gap: 8 }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: `${GENESIS_COLORS.success}22`,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: `${GENESIS_COLORS.success}44`,
            }}>
              <Trophy size={32} color={GENESIS_COLORS.success} />
            </View>
            <Text style={{ color: '#FFFFFF', fontSize: 22, fontFamily: 'InterBold' }}>
              Workout Complete
            </Text>
            <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter' }}>
              {workoutName}
            </Text>
          </View>

          {/* Stats cascade */}
          <View style={{ gap: 10 }}>
            {stats.map((stat, index) => (
              <Animated.View
                key={stat.label}
                entering={SlideInUp.duration(400).delay(index * 300)}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: `${stat.color}10`,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: `${stat.color}22`,
                  padding: 16,
                  gap: 14,
                }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: `${stat.color}20`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {stat.icon}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 10, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1 }}>
                      {stat.label.toUpperCase()}
                    </Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 22, fontFamily: 'JetBrainsMonoBold' }}>
                      {stat.value}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* PRs section */}
          {prs.length > 0 && (
            <View style={{ gap: 10 }}>
              <Text style={{ color: '#FFD700', fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 1.5 }}>
                NUEVOS RÉCORDS PERSONALES
              </Text>
              {prs.map((pr, i) => (
                <View
                  key={`${pr.exerciseId}-${pr.type}-${i}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    backgroundColor: 'rgba(255, 215, 0, 0.08)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 215, 0, 0.2)',
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  <Trophy size={16} color="#FFD700" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'InterBold' }}>
                      {pr.exerciseName}
                    </Text>
                    <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 11, fontFamily: 'Inter' }}>
                      {pr.type === 'weight' ? `${pr.newValue}kg` : `${pr.newValue} reps`}
                      {pr.previousValue ? ` (prev: ${pr.previousValue}${pr.type === 'weight' ? 'kg' : ''})` : ' (first!)'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Coach Review Badge */}
          <CoachReviewBadge visible={coachReviewed} />

          {/* GENESIS motivational message */}
          <View style={{
            backgroundColor: GENESIS_COLORS.surfaceCard,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: GENESIS_COLORS.borderSubtle,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 10,
          }}>
            <Sparkles size={16} color={phaseColor} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: phaseColor, fontSize: 10, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 1 }}>
                GENESIS
              </Text>
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter', lineHeight: 19, marginTop: 4 }}>
                Gran sesión. Cada repetición cuenta — tu cuerpo está adaptándose. Descansa bien y alimenta tu progreso.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer CTA */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 24,
          paddingBottom: 34,
          paddingTop: 12,
        }}>
          <Pressable onPress={onClose}>
            <LinearGradient
              colors={[phaseColor, `${phaseColor}CC`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'JetBrainsMonoSemiBold' }}>
                CERRAR
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
