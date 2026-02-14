import { useEffect } from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Cpu } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { hapticMedium, hapticHeavy } from '../../utils/haptics';

export function GenesisFAB() {
  const router = useRouter();
  const pulseScale = useSharedValue(1);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1.0, { duration: 1500 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value * pressScale.value }],
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1.0, { damping: 15, stiffness: 200 });
  };

  const handlePress = () => {
    hapticMedium();
    router.push('/(modals)/genesis-chat');
  };

  const handleLongPress = () => {
    hapticHeavy();
    router.push('/(modals)/voice-call');
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 90,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          shadowColor: '#6D00FF',
          shadowOpacity: 0.4,
          shadowRadius: 15,
          shadowOffset: { width: 0, height: 4 },
          elevation: 10,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel="Open GENESIS AI chat"
        accessibilityHint="Long press for voice call"
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={['#6D00FF', '#8B5CF6']}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Cpu size={22} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}
