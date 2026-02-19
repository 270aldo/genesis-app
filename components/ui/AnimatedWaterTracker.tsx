import { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Droplets } from 'lucide-react-native';
import { hapticLight, hapticMedium } from '../../utils/haptics';
import { GENESIS_COLORS } from '../../constants/colors';

type AnimatedWaterTrackerProps = {
  current: number;
  target: number;
  onAdd: () => void;
};

function WaterGlass({ filled, index, onPress }: { filled: boolean; index: number; onPress: () => void }) {
  const scale = useSharedValue(filled ? 1 : 0.95);
  const prevFilled = useRef(filled);

  useEffect(() => {
    if (filled && !prevFilled.current) {
      scale.value = withSequence(
        withSpring(1.15, { damping: 6, stiffness: 180 }),
        withSpring(1, { damping: 10, stiffness: 150 }),
      );
    }
    prevFilled.current = filled;
  }, [filled]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={filled ? undefined : onPress}>
      <Animated.View
        style={[
          {
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: filled ? 'rgba(157,78,221,0.2)' : 'rgba(255,255,255,0.06)',
            borderWidth: 1,
            borderColor: filled ? 'rgba(157,78,221,0.4)' : 'rgba(255,255,255,0.1)',
          },
          animatedStyle,
        ]}
      >
        <Droplets size={16} color={filled ? '#9D4EDD' : 'rgba(255,255,255,0.2)'} />
      </Animated.View>
    </Pressable>
  );
}

export function AnimatedWaterTracker({ current, target, onAdd }: AnimatedWaterTrackerProps) {
  const targetReached = current >= target;
  const glowOpacity = useSharedValue(0);
  const prevCurrent = useRef(current);

  useEffect(() => {
    if (current >= target && prevCurrent.current < target) {
      hapticMedium();
      glowOpacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 600 }),
      );
    }
    prevCurrent.current = current;
  }, [current, target]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleAdd = () => {
    hapticLight();
    onAdd();
  };

  const glasses = Math.max(target, 8);

  return (
    <View style={{ gap: 12 }}>
      {/* Target reached glow */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: -4,
            left: -4,
            right: -4,
            bottom: -4,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: GENESIS_COLORS.success,
            shadowColor: GENESIS_COLORS.success,
            shadowOpacity: 0.4,
            shadowRadius: 12,
          },
          glowStyle,
        ]}
      />

      {/* Glass dots row */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {Array.from({ length: glasses }, (_, i) => (
          <WaterGlass
            key={i}
            index={i}
            filled={i < current}
            onPress={handleAdd}
          />
        ))}
      </View>

      {/* Label + Add button */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{
          color: targetReached ? GENESIS_COLORS.success : GENESIS_COLORS.textTertiary,
          fontSize: 12,
          fontFamily: 'Inter',
        }}>
          {current} / {target} vasos
        </Text>

        <Pressable
          onPress={handleAdd}
          style={{
            backgroundColor: 'rgba(109,0,255,0.15)',
            borderWidth: 1,
            borderColor: 'rgba(109,0,255,0.3)',
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 6,
          }}
        >
          <Text style={{
            color: GENESIS_COLORS.primary,
            fontSize: 11,
            fontFamily: 'JetBrainsMonoSemiBold',
          }}>
            + AGUA
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
