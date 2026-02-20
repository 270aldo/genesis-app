import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Cpu } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';

const DOT_COUNT = 3;
const DOT_SIZE = 6;

function PulsingDot({ index }: { index: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      index * 200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0.3, { duration: 600 }),
        ),
        -1,
        true,
      ),
    );
  }, [index, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: DOT_SIZE,
          height: DOT_SIZE,
          borderRadius: DOT_SIZE / 2,
          backgroundColor: GENESIS_COLORS.primary,
        },
        animatedStyle,
      ]}
    />
  );
}

type AgentThinkingProps = {
  elapsedSeconds: number;
};

export function AgentThinking({ elapsedSeconds }: AgentThinkingProps) {
  return (
    <View
      style={{
        backgroundColor: 'rgba(109, 0, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(109, 0, 255, 0.2)',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        // Subtle glow shadow
        shadowColor: GENESIS_COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      }}
      accessibilityLabel={`GENESIS coordinando, ${elapsedSeconds} segundos`}
      accessibilityRole="progressbar"
    >
      {/* CPU icon */}
      <Cpu size={14} color={GENESIS_COLORS.primary} />

      {/* Pulsing dots */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {Array.from({ length: DOT_COUNT }).map((_, i) => (
          <PulsingDot key={i} index={i} />
        ))}
      </View>

      {/* Label with timer */}
      <Text
        style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 11,
          fontFamily: 'JetBrainsMonoMedium',
          letterSpacing: 0.5,
        }}
      >
        GENESIS coordinando · {elapsedSeconds}s
      </Text>
    </View>
  );
}
