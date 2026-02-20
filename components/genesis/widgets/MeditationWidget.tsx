import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { Brain } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../ui/GlassCard';
import { GENESIS_COLORS } from '../../../constants/colors';
import { hapticLight, hapticNotificationSuccess } from '../../../utils/haptics';
import type { WidgetPayload } from '../../../types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = 160;
const STROKE_WIDTH = 6;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type MeditationState = 'idle' | 'active' | 'paused' | 'completed';

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function MeditationWidget({ widget }: { widget: WidgetPayload }) {
  const totalDuration = (widget.data?.duration as number) ?? 300; // default 5 min
  const sessionName = widget.subtitle ?? 'Meditación guiada';

  const [state, setState] = useState<MeditationState>('idle');
  const [remaining, setRemaining] = useState(totalDuration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = useSharedValue(0);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Tick the countdown when active
  useEffect(() => {
    if (state === 'active') {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearTimer();
            setState('completed');
            hapticNotificationSuccess();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return clearTimer;
  }, [state, clearTimer]);

  // Animate progress ring whenever remaining changes
  useEffect(() => {
    const elapsed = totalDuration - remaining;
    const pct = totalDuration > 0 ? elapsed / totalDuration : 0;
    progress.value = withTiming(pct, { duration: 900 });
  }, [remaining, totalDuration, progress]);

  const handleStart = useCallback(() => {
    hapticLight();
    if (state === 'paused') {
      setState('active');
    } else {
      setRemaining(totalDuration);
      progress.value = 0;
      setState('active');
    }
  }, [state, totalDuration, progress]);

  const handlePause = useCallback(() => {
    hapticLight();
    clearTimer();
    setState('paused');
  }, [clearTimer]);

  const handleReset = useCallback(() => {
    hapticLight();
    clearTimer();
    setState('idle');
    setRemaining(totalDuration);
    progress.value = withTiming(0, { duration: 300 });
  }, [clearTimer, totalDuration, progress]);

  return (
    <GlassCard>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Brain size={18} color={GENESIS_COLORS.primary} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: GENESIS_COLORS.textPrimary, fontSize: 16, fontWeight: '700' }}>
            {widget.title ?? 'Meditación'}
          </Text>
          <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 11, marginTop: 2 }}>
            {sessionName}
          </Text>
        </View>
      </View>

      {/* Circular progress + timer */}
      <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <View style={{ width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={RING_SIZE} height={RING_SIZE} style={{ position: 'absolute' }}>
            {/* Background track */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={GENESIS_COLORS.borderSubtle}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            {/* Animated progress */}
            <AnimatedCircle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={GENESIS_COLORS.primary}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              animatedProps={animatedProps}
              strokeLinecap="round"
              rotation="-90"
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            />
          </Svg>
          {/* Timer text */}
          <Text
            style={{
              color: GENESIS_COLORS.textPrimary,
              fontSize: 32,
              fontFamily: 'JetBrainsMonoBold',
            }}
          >
            {formatTime(remaining)}
          </Text>
          {state === 'active' && (
            <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 10, marginTop: 2 }}>
              Respira...
            </Text>
          )}
        </View>
      </View>

      {/* Duration info */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'JetBrainsMonoMedium' }}>
          {state === 'completed'
            ? 'Sesion completada'
            : `${Math.floor(totalDuration / 60)} min`}
        </Text>
      </View>

      {/* Action buttons */}
      {(state === 'idle' || state === 'paused') && (
        <Pressable onPress={handleStart}>
          <LinearGradient
            colors={[GENESIS_COLORS.primaryLight, GENESIS_COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
              {state === 'paused' ? 'Continuar' : 'Iniciar'}
            </Text>
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
