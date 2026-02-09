import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Clock, Dumbbell, TrendingUp } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import type { WorkoutSession } from '../../types';
import type { DetectedPR } from '../../utils/prDetection';

type WorkoutCompleteProps = {
  session: WorkoutSession;
  prs: DetectedPR[];
  onDismiss: () => void;
};

export function WorkoutComplete({ session, prs, onDismiss }: WorkoutCompleteProps) {
  const completedExercises = session.exercises.filter((ex) => ex.completed).length;
  const totalExercises = session.exercises.length;

  const totalVolume = session.exercises.reduce((sum, ex) => {
    if (!ex.exerciseSets) return sum + (ex.completed ? ex.sets * ex.reps * ex.weight : 0);
    return sum + ex.exerciseSets
      .filter((s) => s.completed)
      .reduce((setSum, s) => setSum + (s.actualWeight ?? s.targetWeight) * (s.actualReps ?? s.targetReps), 0);
  }, 0);

  const minutes = Math.floor(session.duration / 60);
  const seconds = session.duration % 60;
  const durationStr = session.duration >= 60
    ? `${minutes}h ${seconds}m`
    : `${session.duration}m`;

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.95)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <View style={{ width: '100%', maxWidth: 360, gap: 24, alignItems: 'center' }}>
        {/* Title */}
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View style={{
            width: 64, height: 64, borderRadius: 32,
            backgroundColor: `${theme.colors.success}22`,
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 2, borderColor: `${theme.colors.success}44`,
          }}>
            <Trophy size={32} color={theme.colors.success} />
          </View>
          <Text style={{ color: theme.colors.textPrimary, fontSize: 22, fontFamily: 'InterBold' }}>
            Workout Complete
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
          <StatBox icon={<Clock size={16} color={theme.colors.info} />} label="Duration" value={durationStr} color={theme.colors.info} />
          <StatBox icon={<Dumbbell size={16} color={theme.colors.primary} />} label="Exercises" value={`${completedExercises}/${totalExercises}`} color={theme.colors.primary} />
          <StatBox icon={<TrendingUp size={16} color={theme.colors.success} />} label="Volume" value={`${totalVolume.toLocaleString()}kg`} color={theme.colors.success} />
        </View>

        {/* PRs */}
        {prs.length > 0 && (
          <View style={{ width: '100%', gap: 8 }}>
            <Text style={{ color: theme.colors.warning, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 1.5 }}>
              NEW PERSONAL RECORDS
            </Text>
            {prs.map((pr, i) => (
              <View
                key={`${pr.exerciseId}-${pr.type}-${i}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: `${theme.colors.warning}15`,
                  borderWidth: 1,
                  borderColor: `${theme.colors.warning}33`,
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Trophy size={14} color={theme.colors.warning} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
                    {pr.exerciseName}
                  </Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>
                    {pr.type === 'weight' ? `${pr.newValue}kg` : `${pr.newValue} reps`}
                    {pr.previousValue ? ` (prev: ${pr.previousValue}${pr.type === 'weight' ? 'kg' : ''})` : ' (first!)'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Save & Exit */}
        <Pressable onPress={onDismiss} style={{ width: '100%' }}>
          <LinearGradient
            colors={['#6D00FF', '#5B21B6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'JetBrainsMonoSemiBold' }}>
              SAVE & EXIT
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function StatBox({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: `${color}10`,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      gap: 4,
      borderWidth: 1,
      borderColor: `${color}22`,
    }}>
      {icon}
      <Text style={{ color: theme.colors.textSecondary, fontSize: 9, fontFamily: 'JetBrainsMonoMedium' }}>{label}</Text>
      <Text style={{ color: theme.colors.textPrimary, fontSize: 14, fontFamily: 'JetBrainsMonoBold' }}>{value}</Text>
    </View>
  );
}
