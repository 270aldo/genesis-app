import { useEffect, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { Trophy } from 'lucide-react-native';
import { hapticHeavy } from '../../utils/haptics';
import type { DetectedPR } from '../../utils/prDetection';

const CONFETTI_COLORS = ['#FFD700', '#6D00FF', '#00F5AA', '#9D4EDD', '#FF6B6B'];

type ConfettiPiece = {
  id: number;
  color: string;
  size: number;
  targetX: number;
  targetY: number;
};

function generateConfetti(): ConfettiPiece[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + Math.random() * 4,
    targetX: (Math.random() - 0.5) * 300,
    targetY: (Math.random() - 0.5) * 400,
  }));
}

function ConfettiParticle({ piece }: { piece: ConfettiPiece }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(100, withTiming(piece.targetX, { duration: 1200 }));
    translateY.value = withDelay(100, withTiming(piece.targetY, { duration: 1200 }));
    opacity.value = withDelay(600, withTiming(0, { duration: 600 }));
    rotate.value = withTiming(360 * (Math.random() > 0.5 ? 1 : -1), { duration: 1200 });
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: piece.size,
          height: piece.size,
          borderRadius: piece.size / 4,
          backgroundColor: piece.color,
        },
        style,
      ]}
    />
  );
}

type PRCelebrationProps = {
  visible: boolean;
  exerciseName: string;
  record: DetectedPR;
  onDismiss: () => void;
};

export function PRCelebration({ visible, exerciseName, record, onDismiss }: PRCelebrationProps) {
  const trophyScale = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const confetti = generateConfetti();

  const triggerDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    if (!visible) return;

    hapticHeavy();
    overlayOpacity.value = withTiming(1, { duration: 300 });
    trophyScale.value = withSpring(1, { damping: 8, stiffness: 120 });

    const timeout = setTimeout(() => {
      triggerDismiss();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: trophyScale.value }],
  }));

  if (!visible) return null;

  const recordDetail = record.type === 'weight'
    ? `${record.newValue} kg`
    : `${record.newValue} reps`;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        },
        overlayStyle,
      ]}
    >
      <Pressable
        onPress={triggerDismiss}
        style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}
      >
        {/* Confetti */}
        <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
          {confetti.map((piece) => (
            <ConfettiParticle key={piece.id} piece={piece} />
          ))}
        </View>

        {/* Trophy */}
        <Animated.View
          style={[
            {
              alignItems: 'center',
              gap: 16,
              shadowColor: '#FFD700',
              shadowOpacity: 0.3,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 0 },
            },
            trophyStyle,
          ]}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(255,215,0,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Trophy size={48} color="#FFD700" />
          </View>

          <Text style={{
            color: '#FFFFFF',
            fontSize: 24,
            fontFamily: 'InterBold',
            textAlign: 'center',
            textShadowColor: '#FFD700',
            textShadowRadius: 12,
          }}>
            ¡NUEVO RÉCORD!
          </Text>

          <Text style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 16,
            fontFamily: 'Inter',
            textAlign: 'center',
          }}>
            {exerciseName}
          </Text>

          <Text style={{
            color: '#FFD700',
            fontSize: 20,
            fontFamily: 'JetBrainsMonoBold',
            textAlign: 'center',
          }}>
            {recordDetail}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
