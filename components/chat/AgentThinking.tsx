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
import { LiquidGlassCard } from '../ui/LiquidGlassCard';

const DOT_COUNT = 3;
const DOT_SIZE = 4;

function PulsingDot({ index }: { index: number }) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    const stagger = index * 180;
    scale.value = withDelay(
      stagger,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 500 }),
          withTiming(0.8, { duration: 500 }),
        ),
        -1,
        true,
      ),
    );
    opacity.value = withDelay(
      stagger,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.3, { duration: 500 }),
        ),
        -1,
        true,
      ),
    );
  }, [index, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
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

function ThinkingRow({ elapsedSeconds }: { elapsedSeconds: number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
      accessibilityLabel={`GENESIS coordinando, ${elapsedSeconds} segundos`}
      accessibilityRole="progressbar"
    >
      <Cpu size={14} color={GENESIS_COLORS.primary} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {Array.from({ length: DOT_COUNT }).map((_, i) => (
          <PulsingDot key={i} index={i} />
        ))}
      </View>
      <Text
        style={{
          color: GENESIS_COLORS.textGhost,
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

type AgentThinkingProps = {
  elapsedSeconds: number;
  bare?: boolean;
};

export function AgentThinking({ elapsedSeconds, bare = false }: AgentThinkingProps) {
  if (bare) {
    return <ThinkingRow elapsedSeconds={elapsedSeconds} />;
  }

  return (
    <LiquidGlassCard effect="regular" borderRadius={16}>
      <View style={{ padding: 12 }}>
        <ThinkingRow elapsedSeconds={elapsedSeconds} />
      </View>
    </LiquidGlassCard>
  );
}
