import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  Easing,
} from 'react-native-reanimated';
import { Cpu, ChevronDown } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { AgentThinking } from './AgentThinking';
import { AgentContribution } from './AgentContribution';
import type { AgentType } from './AgentContribution';

type Contribution = {
  agent: AgentType;
  text: string;
};

type AgentThinkingBlockProps = {
  isActive: boolean;
  contributions: Contribution[];
  elapsedSeconds: number;
};

export function AgentThinkingBlock({
  isActive,
  contributions,
  elapsedSeconds,
}: AgentThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand when active (thinking in progress)
  useEffect(() => {
    if (isActive) {
      setIsExpanded(true);
    }
  }, [isActive]);

  // Chevron rotation
  const chevronRotation = useSharedValue(0);

  useEffect(() => {
    chevronRotation.value = withTiming(isExpanded ? 180 : 0, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [isExpanded, chevronRotation]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  // --- Active state: full expanded view ---
  if (isActive) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={{
          gap: 8,
          paddingVertical: 4,
        }}
        accessibilityRole="timer"
        accessibilityLabel={`GENESIS pensando, ${elapsedSeconds} segundos, ${contributions.length} agentes contribuyendo`}
      >
        {/* Thinking header with pulsing dots + timer */}
        <AgentThinking elapsedSeconds={elapsedSeconds} />

        {/* Agent contribution list */}
        {contributions.length > 0 && (
          <View
            style={{
              paddingLeft: 8,
              paddingTop: 4,
              gap: 2,
            }}
          >
            {contributions.map((c, i) => (
              <AgentContribution
                key={`${c.agent}-${i}`}
                agent={c.agent}
                contribution={c.text}
                isActive={true}
                index={i}
              />
            ))}
          </View>
        )}
      </Animated.View>
    );
  }

  // --- Collapsed state: single-line summary (tappable) ---
  if (!isExpanded) {
    return (
      <Pressable
        onPress={() => setIsExpanded(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: 'rgba(109, 0, 255, 0.06)',
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
        accessibilityRole="button"
        accessibilityLabel={`GENESIS penso por ${elapsedSeconds} segundos. Toca para expandir.`}
        accessibilityHint="Toca para ver los detalles del pensamiento"
      >
        <Cpu size={14} color={GENESIS_COLORS.primary} />
        <Text
          style={{
            flex: 1,
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: 11,
            fontFamily: 'JetBrainsMonoMedium',
            letterSpacing: 0.3,
          }}
        >
          GENESIS penso por {elapsedSeconds}s
        </Text>
        <Animated.View style={chevronStyle}>
          <ChevronDown size={14} color={GENESIS_COLORS.textMuted} />
        </Animated.View>
      </Pressable>
    );
  }

  // --- Expanded state (after thinking completed): header + contributions ---
  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      style={{ gap: 6 }}
    >
      {/* Collapsed header row — tappable to collapse */}
      <Pressable
        onPress={() => setIsExpanded(false)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: 'rgba(109, 0, 255, 0.06)',
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
        accessibilityRole="button"
        accessibilityLabel={`GENESIS penso por ${elapsedSeconds} segundos. Toca para colapsar.`}
      >
        <Cpu size={14} color={GENESIS_COLORS.primary} />
        <Text
          style={{
            flex: 1,
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: 11,
            fontFamily: 'JetBrainsMonoMedium',
            letterSpacing: 0.3,
          }}
        >
          GENESIS penso por {elapsedSeconds}s
        </Text>
        <Animated.View style={chevronStyle}>
          <ChevronDown size={14} color={GENESIS_COLORS.textMuted} />
        </Animated.View>
      </Pressable>

      {/* Expanded contribution list */}
      {contributions.length > 0 && (
        <View
          style={{
            paddingLeft: 8,
            paddingTop: 2,
            gap: 2,
          }}
        >
          {contributions.map((c, i) => (
            <AgentContribution
              key={`${c.agent}-${i}`}
              agent={c.agent}
              contribution={c.text}
              isActive={false}
              index={i}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}
