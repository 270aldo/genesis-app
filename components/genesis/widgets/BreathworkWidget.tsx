import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { Wind } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../ui/GlassCard';
import { GENESIS_COLORS } from '../../../constants/colors';
import { hapticLight, hapticNotificationSuccess } from '../../../utils/haptics';
import type { WidgetPayload } from '../../../types';

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';
type WidgetState = 'idle' | 'active' | 'completed';

const PHASE_LABELS: Record<BreathPhase, string> = {
  inhale: 'Inhala',
  'hold-in': 'Manten',
  exhale: 'Exhala',
  'hold-out': 'Manten',
};

export function BreathworkWidget({ widget }: { widget: WidgetPayload }) {
  const inhale = (widget.data?.inhale as number) ?? 4;
  const holdIn = (widget.data?.holdIn as number) ?? 4;
  const exhale = (widget.data?.exhale as number) ?? 4;
  const holdOut = (widget.data?.holdOut as number) ?? 4;
  const totalTargetCycles = (widget.data?.cycles as number) ?? 4;
  const technique = (widget.data?.technique as string) ?? 'Box Breathing';

  const cycleDuration = inhale + holdIn + exhale + holdOut;

  const [state, setState] = useState<WidgetState>('idle');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [phaseLabel, setPhaseLabel] = useState<string>('');
  const [phaseSeconds, setPhaseSeconds] = useState(0);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);

  // Build the breathing animation sequence for one full cycle
  const startBreathingAnimation = useCallback(() => {
    const inhaleTiming = withTiming(1.4, {
      duration: inhale * 1000,
      easing: Easing.inOut(Easing.ease),
    });
    const holdInTiming = withTiming(1.4, {
      duration: holdIn * 1000,
    });
    const exhaleTiming = withTiming(1.0, {
      duration: exhale * 1000,
      easing: Easing.inOut(Easing.ease),
    });
    const holdOutTiming = withTiming(1.0, {
      duration: holdOut * 1000,
    });

    scale.value = withRepeat(
      withSequence(inhaleTiming, holdInTiming, exhaleTiming, holdOutTiming),
      totalTargetCycles,
      false,
    );

    // Opacity animation mirrors the scale
    const opacityIn = withTiming(0.8, {
      duration: inhale * 1000,
      easing: Easing.inOut(Easing.ease),
    });
    const opacityHoldIn = withTiming(0.8, { duration: holdIn * 1000 });
    const opacityOut = withTiming(0.4, {
      duration: exhale * 1000,
      easing: Easing.inOut(Easing.ease),
    });
    const opacityHoldOut = withTiming(0.4, { duration: holdOut * 1000 });

    opacity.value = withRepeat(
      withSequence(opacityIn, opacityHoldIn, opacityOut, opacityHoldOut),
      totalTargetCycles,
      false,
    );
  }, [inhale, holdIn, exhale, holdOut, totalTargetCycles, scale, opacity]);

  // Phase tracking via JS timer (UI labels + cycle counter)
  useEffect(() => {
    if (state !== 'active') return;

    let elapsed = 0;
    const phases: { phase: BreathPhase; duration: number }[] = [
      { phase: 'inhale', duration: inhale },
      { phase: 'hold-in', duration: holdIn },
      { phase: 'exhale', duration: exhale },
      { phase: 'hold-out', duration: holdOut },
    ];

    const interval = setInterval(() => {
      elapsed += 1;
      const totalElapsed = elapsed % cycleDuration;
      const cycleIndex = Math.floor(elapsed / cycleDuration);

      if (cycleIndex >= totalTargetCycles) {
        clearInterval(interval);
        setState('completed');
        hapticNotificationSuccess();
        return;
      }

      setCurrentCycle(cycleIndex + 1);

      // Determine which phase we are in
      let acc = 0;
      for (const p of phases) {
        acc += p.duration;
        if (totalElapsed < acc) {
          setPhaseLabel(PHASE_LABELS[p.phase]);
          setPhaseSeconds(acc - totalElapsed);
          break;
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state, inhale, holdIn, exhale, holdOut, cycleDuration, totalTargetCycles]);

  const handleStart = useCallback(() => {
    hapticLight();
    setState('active');
    setCurrentCycle(1);
    setPhaseLabel(PHASE_LABELS.inhale);
    setPhaseSeconds(inhale);
    startBreathingAnimation();
  }, [inhale, startBreathingAnimation]);

  const handlePause = useCallback(() => {
    hapticLight();
    cancelAnimation(scale);
    cancelAnimation(opacity);
    setState('idle');
  }, [scale, opacity]);

  const handleReset = useCallback(() => {
    hapticLight();
    setState('idle');
    setCurrentCycle(0);
    setPhaseLabel('');
    setPhaseSeconds(0);
    scale.value = withTiming(1, { duration: 300 });
    opacity.value = withTiming(0.4, { duration: 300 });
  }, [scale, opacity]);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <GlassCard>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Wind size={18} color={GENESIS_COLORS.primary} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: GENESIS_COLORS.textPrimary, fontSize: 16, fontWeight: '700' }}>
            {widget.title ?? 'Respiracion'}
          </Text>
          <Text
            style={{
              color: GENESIS_COLORS.textSecondary,
              fontSize: 11,
              fontFamily: 'JetBrainsMonoMedium',
              marginTop: 2,
            }}
          >
            {technique} ({inhale}-{holdIn}-{exhale}-{holdOut})
          </Text>
        </View>
      </View>

      {/* Breathing circle */}
      <View style={{ alignItems: 'center', justifyContent: 'center', height: 180 }}>
        <Animated.View
          style={[
            {
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: GENESIS_COLORS.primary,
              alignItems: 'center',
              justifyContent: 'center',
            },
            animatedCircleStyle,
          ]}
        >
          {state === 'active' && (
            <>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: '700',
                  textAlign: 'center',
                }}
              >
                {phaseLabel}
              </Text>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 28,
                  fontFamily: 'JetBrainsMonoBold',
                  marginTop: 2,
                }}
              >
                {phaseSeconds}
              </Text>
            </>
          )}
          {state === 'idle' && (
            <Wind size={32} color="rgba(255,255,255,0.8)" />
          )}
          {state === 'completed' && (
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Listo</Text>
          )}
        </Animated.View>
      </View>

      {/* Cycle counter */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'JetBrainsMonoMedium' }}>
          {state === 'completed'
            ? `${totalTargetCycles} ciclos completados`
            : state === 'active'
              ? `Ciclo ${currentCycle} de ${totalTargetCycles}`
              : `${totalTargetCycles} ciclos`}
        </Text>
      </View>

      {/* Action button */}
      {state === 'idle' && (
        <Pressable onPress={handleStart}>
          <LinearGradient
            colors={[GENESIS_COLORS.primaryLight, GENESIS_COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Iniciar</Text>
          </LinearGradient>
        </Pressable>
      )}
      {state === 'active' && (
        <Pressable onPress={handlePause}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
          >
            <Text style={{ color: GENESIS_COLORS.textPrimary, fontSize: 14, fontWeight: '700' }}>Pausar</Text>
          </LinearGradient>
        </Pressable>
      )}
      {state === 'completed' && (
        <Pressable onPress={handleReset}>
          <LinearGradient
            colors={[GENESIS_COLORS.primaryLight, GENESIS_COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Completado</Text>
          </LinearGradient>
        </Pressable>
      )}

      {/* GENESIS badge */}
      <Text
        style={{
          color: GENESIS_COLORS.primary,
          fontSize: 9,
          fontFamily: 'JetBrainsMonoMedium',
          marginTop: 12,
          opacity: 0.7,
        }}
      >
        GENERATED BY GENESIS
      </Text>
    </GlassCard>
  );
}
