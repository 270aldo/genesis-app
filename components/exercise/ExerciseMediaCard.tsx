import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Dumbbell } from 'lucide-react-native';
import { GENESIS_COLORS, MUSCLE_GRADIENTS } from '../../constants/colors';
import { MuscleGroupIcon, type MuscleGroup } from './MuscleGroupIcon';
import { hapticSelection } from '../../utils/haptics';

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: GENESIS_COLORS.success,
  intermediate: GENESIS_COLORS.warning,
  advanced: GENESIS_COLORS.error,
};

const MUSCLE_GROUP_TO_ICON: Record<string, MuscleGroup> = {
  chest: 'chest',
  back: 'back',
  legs: 'legs',
  shoulders: 'shoulders',
  arms: 'arms',
  core: 'core',
};

interface ExerciseMediaCardProps {
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  hasVideo: boolean;
  onPress: () => void;
}

export function ExerciseMediaCard({
  name,
  muscleGroup,
  equipment,
  difficulty,
  hasVideo,
  onPress,
}: ExerciseMediaCardProps) {
  const gradientColors = MUSCLE_GRADIENTS[muscleGroup as keyof typeof MUSCLE_GRADIENTS] ?? MUSCLE_GRADIENTS.full_body;
  const iconGroup = MUSCLE_GROUP_TO_ICON[muscleGroup];
  const difficultyColor = DIFFICULTY_COLORS[difficulty] ?? GENESIS_COLORS.textMuted;

  return (
    <Pressable
      onPress={() => {
        hapticSelection();
        onPress();
      }}
      style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}
    >
      <LinearGradient
        colors={[gradientColors[0] + '30', gradientColors[1] + '15', GENESIS_COLORS.surfaceCard]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          aspectRatio: 4 / 3,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: GENESIS_COLORS.borderSubtle,
          padding: 12,
          justifyContent: 'space-between',
        }}
      >
        {/* Top: Muscle icon + play overlay */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: gradientColors[0] + '30',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {iconGroup ? (
              <MuscleGroupIcon group={iconGroup} size={18} color={gradientColors[0]} />
            ) : (
              <Dumbbell size={18} color={gradientColors[0]} />
            )}
          </View>

          {hasVideo && (
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Bottom: Info */}
        <View style={{ gap: 4 }}>
          <Text
            numberOfLines={2}
            style={{
              color: '#FFFFFF',
              fontSize: 13,
              fontFamily: 'InterSemiBold',
              lineHeight: 17,
            }}
          >
            {name}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {/* Muscle group pill */}
            <View
              style={{
                backgroundColor: gradientColors[0] + '25',
                borderRadius: 6,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  color: gradientColors[0],
                  fontSize: 9,
                  fontFamily: 'JetBrainsMonoMedium',
                  textTransform: 'uppercase',
                }}
              >
                {muscleGroup.replace('_', ' ')}
              </Text>
            </View>

            {/* Equipment */}
            <Text
              style={{
                color: GENESIS_COLORS.textTertiary,
                fontSize: 9,
                fontFamily: 'JetBrainsMonoMedium',
              }}
            >
              {equipment}
            </Text>

            {/* Difficulty dot */}
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: difficultyColor,
              }}
            />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
