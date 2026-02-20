import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Cpu, Zap, Activity, Brain, Utensils, TrendingUp, Dumbbell } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import type { AgentType } from './AgentContribution';

type Contribution = { agent: AgentType; text: string };

type Props = {
  isActive: boolean;
  contributions: Contribution[];
  elapsedSeconds: number;
};

const AGENT_CONFIG: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  train: { color: GENESIS_COLORS.agentTrain, icon: Dumbbell, label: 'TRAIN' },
  fuel: { color: GENESIS_COLORS.agentFuel, icon: Utensils, label: 'FUEL' },
  mind: { color: GENESIS_COLORS.agentMind, icon: Brain, label: 'MIND' },
  track: { color: GENESIS_COLORS.agentTrack, icon: TrendingUp, label: 'TRACK' },
  vision: { color: GENESIS_COLORS.agentVision, icon: Activity, label: 'VISION' },
};

function PulsingDot({ delay, color }: { delay: number; color?: string }) {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 600 }), withTiming(0.3, { duration: 600 })), -1));
    scale.value = withDelay(delay, withRepeat(withSequence(withTiming(1.2, { duration: 600 }), withTiming(0.8, { duration: 600 })), -1));
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[{ width: 4, height: 4, borderRadius: 2, backgroundColor: color ?? GENESIS_COLORS.primary }, style]} />
  );
}

/** Animated progress bar that fills over time */
function ThinkingProgress({ seconds }: { seconds: number }) {
  // Asymptotic: fast at first, slows down — never reaches 100%
  const pct = Math.min(95, 40 + (seconds / (seconds + 4)) * 55);
  return (
    <View style={{ height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
      <Animated.View
        entering={FadeIn.duration(300)}
        style={{
          height: 2,
          borderRadius: 1,
          width: `${pct}%`,
          backgroundColor: GENESIS_COLORS.primary,
          opacity: 0.5,
        }}
      />
    </View>
  );
}

export function AgentThinkingBlock({ isActive, contributions, elapsedSeconds }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => { if (isActive) setIsExpanded(true); }, [isActive]);

  const uniqueAgents = [...new Set(contributions.map((c) => c.agent))];

  // ── COLLAPSED (after response) ──
  if (!isActive && !isExpanded) {
    return (
      <Pressable onPress={() => setIsExpanded(true)} style={{ paddingLeft: 42, paddingVertical: 4, marginTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Zap size={12} color={GENESIS_COLORS.textGhost} />
          <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 10, color: GENESIS_COLORS.textGhost, letterSpacing: 0.5 }}>
            {elapsedSeconds}s · {uniqueAgents.length} agente{uniqueAgents.length !== 1 ? 's' : ''}
          </Text>
          {/* Mini colored dots for agents used */}
          {uniqueAgents.map((agent) => (
            <View
              key={agent}
              style={{
                width: 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: AGENT_CONFIG[agent]?.color ?? GENESIS_COLORS.primary,
              }}
            />
          ))}
        </View>
      </Pressable>
    );
  }

  // ── ACTIVE / EXPANDED — Grok-style agent visibility ──
  return (
    <Animated.View entering={FadeIn.duration(200)} style={{ paddingLeft: 42, marginTop: 10 }}>
      <LiquidGlassCard effect="regular" borderRadius={14}>
        <View style={{ padding: 12, paddingHorizontal: 14, gap: 10 }}>
          {/* Header: GENESIS thinking + pulsing dots + timer */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Cpu size={13} color={GENESIS_COLORS.primary} style={{ opacity: 0.8 }} />
              <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 11, fontWeight: '600', color: GENESIS_COLORS.textSecondary, letterSpacing: 0.5 }}>
                Procesando
              </Text>
              <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                <PulsingDot delay={0} />
                <PulsingDot delay={150} />
                <PulsingDot delay={300} />
              </View>
            </View>
            <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 10, color: GENESIS_COLORS.textGhost, letterSpacing: 0.3 }}>
              {elapsedSeconds}s
            </Text>
          </View>

          {/* Progress bar */}
          {isActive && <ThinkingProgress seconds={elapsedSeconds} />}

          {/* Agent contributions — each agent row appears with stagger */}
          {contributions.length > 0 && (
            <View style={{ gap: 6 }}>
              {contributions.map((contrib, i) => {
                const config = AGENT_CONFIG[contrib.agent];
                if (!config) return null;
                const AgentIcon = config.icon;
                return (
                  <Animated.View
                    key={contrib.agent}
                    entering={FadeInDown.delay(i * 200).duration(250)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                  >
                    {/* Agent colored dot */}
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: `${config.color}15`,
                      borderWidth: 1,
                      borderColor: `${config.color}30`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <AgentIcon size={10} color={config.color} />
                    </View>
                    {/* Agent label */}
                    <Text style={{
                      fontFamily: 'JetBrainsMono',
                      fontSize: 10,
                      fontWeight: '600',
                      letterSpacing: 0.8,
                      color: config.color,
                      width: 40,
                    }}>
                      {config.label}
                    </Text>
                    {/* Agent task text */}
                    <Text
                      numberOfLines={1}
                      style={{
                        flex: 1,
                        fontFamily: 'Inter',
                        fontSize: 11,
                        color: GENESIS_COLORS.textTertiary,
                      }}
                    >
                      {contrib.text}
                    </Text>
                    {/* Active indicator */}
                    {isActive && <PulsingDot delay={i * 100} color={config.color} />}
                  </Animated.View>
                );
              })}
            </View>
          )}
        </View>
      </LiquidGlassCard>

      {/* Collapse button after response */}
      {!isActive && (
        <Pressable onPress={() => setIsExpanded(false)} style={{ paddingTop: 4, alignItems: 'flex-start' }}>
          <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 10, color: GENESIS_COLORS.textGhost }}>
            ▲ Colapsar
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
}
