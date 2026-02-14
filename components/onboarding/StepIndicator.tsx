import { View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center', paddingVertical: 8 }}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <StepDot key={i} index={i} currentStep={currentStep} />
      ))}
    </View>
  );
}

function StepDot({ index, currentStep }: { index: number; currentStep: number }) {
  const isCompleted = index < currentStep;
  const isActive = index === currentStep;

  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(isActive ? 24 : 8, { damping: 15, stiffness: 150 }),
    opacity: withSpring(isCompleted || isActive ? 1 : 0.3, { damping: 15 }),
  }));

  return (
    <Animated.View
      style={[
        {
          height: 8,
          borderRadius: 4,
          backgroundColor: isCompleted ? '#00F5AA' : isActive ? '#6D00FF' : 'rgba(255,255,255,0.15)',
        },
        isActive && {
          shadowColor: '#6D00FF',
          shadowOpacity: 0.6,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
        },
        animatedStyle,
      ]}
    />
  );
}
