import { useEffect, useState, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { SkipForward } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { hapticLight } from '../../utils/haptics';
import type { PhaseType } from '../../types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 45;
const STROKE_WIDTH = 6;
const SIZE = (RADIUS + STROKE_WIDTH) * 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const PHASE_TIPS: Record<PhaseType, string> = {
  hypertrophy: 'Tensión metabólica — descanso corto para máximo pump',
  strength: 'Recupera tu sistema nervioso antes del siguiente set pesado',
  power: 'Recuperación completa para máxima velocidad de ejecución',
  deload: 'Descanso breve — mantén el ritmo ligero y controlado',
};

type EnhancedRestTimerProps = {
  seconds: number;
  onComplete: () => void;
  onSkip: () => void;
  phaseColor: string;
  phaseLabel: PhaseType;
};

export function EnhancedRestTimer({
  seconds,
  onComplete,
  onSkip,
  phaseColor,
  phaseLabel,
}: EnhancedRestTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: seconds * 1000 });
  }, [seconds]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  useEffect(() => {
    const handle = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(handle);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(handle);
  }, []);

  useEffect(() => {
    if (remaining === 0) onComplete();
  }, [remaining, onComplete]);

  const handleSkip = useCallback(() => {
    hapticLight();
    onSkip();
  }, [onSkip]);

  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const tip = PHASE_TIPS[phaseLabel] ?? '';

  return (
    <View style={{
      backgroundColor: GENESIS_COLORS.surfaceCard,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: GENESIS_COLORS.borderSubtle,
      padding: 20,
      alignItems: 'center',
      gap: 16,
    }}>
      <Text style={{
        color: GENESIS_COLORS.textSecondary,
        fontSize: 10,
        fontFamily: 'JetBrainsMonoSemiBold',
        letterSpacing: 1.5,
      }}>
        DESCANSO
      </Text>

      {/* Circular SVG timer */}
      <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
          {/* Background circle */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={`${phaseColor}22`}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {/* Progress circle */}
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={phaseColor}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedProps}
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        <Text style={{
          color: '#FFFFFF',
          fontSize: 28,
          fontFamily: 'JetBrainsMonoBold',
        }}>
          {minutes}:{secs.toString().padStart(2, '0')}
        </Text>
      </View>

      {/* Phase tip */}
      {tip ? (
        <Text style={{
          color: GENESIS_COLORS.textMuted,
          fontSize: 11,
          fontFamily: 'Inter',
          textAlign: 'center',
          lineHeight: 16,
          paddingHorizontal: 8,
        }}>
          {tip}
        </Text>
      ) : null}

      {/* Skip button */}
      <Pressable
        onPress={handleSkip}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 10,
          backgroundColor: `${phaseColor}15`,
        }}
      >
        <SkipForward size={14} color={phaseColor} />
        <Text style={{ color: phaseColor, fontSize: 13, fontFamily: 'JetBrainsMonoSemiBold' }}>
          Saltar descanso
        </Text>
      </Pressable>
    </View>
  );
}
