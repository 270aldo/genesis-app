import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Dumbbell } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { hapticMedium } from '../../utils/haptics';

type ExerciseTransitionProps = {
  exerciseName: string;
  exerciseNumber: number;
  totalExercises: number;
  muscleGroup?: string;
  phaseColor: string;
  onComplete: () => void;
};

export function ExerciseTransition({
  exerciseName,
  exerciseNumber,
  totalExercises,
  phaseColor,
  onComplete,
}: ExerciseTransitionProps) {
  useEffect(() => {
    hapticMedium();
    const timer = setTimeout(onComplete, 500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <View style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: `${phaseColor}22`,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Dumbbell size={28} color={phaseColor} />
      </View>

      <Text style={{
        color: GENESIS_COLORS.textSecondary,
        fontSize: 12,
        fontFamily: 'JetBrainsMonoMedium',
        letterSpacing: 1.5,
      }}>
        {exerciseNumber} / {totalExercises}
      </Text>

      <Text style={{
        color: '#FFFFFF',
        fontSize: 20,
        fontFamily: 'InterBold',
        textAlign: 'center',
        paddingHorizontal: 32,
      }}>
        {exerciseName}
      </Text>
    </Animated.View>
  );
}
