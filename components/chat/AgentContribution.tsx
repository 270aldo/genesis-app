import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { GENESIS_COLORS } from '../../constants/colors';

type AgentType = 'train' | 'fuel' | 'mind' | 'track' | 'vision';

const AGENT_MAP: Record<AgentType, { label: string; color: string }> = {
  train: { label: 'TRAIN', color: GENESIS_COLORS.agentTrain },
  fuel: { label: 'FUEL', color: GENESIS_COLORS.agentFuel },
  mind: { label: 'MIND', color: GENESIS_COLORS.agentMind },
  track: { label: 'TRACK', color: GENESIS_COLORS.agentTrack },
  vision: { label: 'VISION', color: GENESIS_COLORS.agentVision },
};

type AgentContributionProps = {
  agent: AgentType;
  contribution: string;
  isActive: boolean;
  index?: number;
};

export function AgentContribution({
  agent,
  contribution,
  isActive,
  index = 0,
}: AgentContributionProps) {
  const identity = AGENT_MAP[agent];
  if (!identity) return null;

  const { label, color } = identity;

  return (
    <Animated.View
      entering={FadeIn.delay(index * 150).duration(350)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 4,
        opacity: isActive ? 1 : 0.6,
      }}
      accessibilityLabel={`${label}: ${contribution}`}
    >
      {/* 6px colored dot */}
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
        }}
      />

      {/* Agent name */}
      <Text
        style={{
          fontFamily: 'JetBrainsMonoMedium',
          fontSize: 10,
          color,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        {label}
      </Text>

      {/* Contribution text — inline */}
      <Text
        style={{
          fontFamily: 'Inter',
          fontSize: 13,
          color: 'rgba(255, 255, 255, 0.8)',
          lineHeight: 18,
          flex: 1,
        }}
        numberOfLines={1}
      >
        {contribution}
      </Text>
    </Animated.View>
  );
}

export type { AgentType };
