import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  Dumbbell,
  Utensils,
  Brain,
  BarChart3,
  Camera,
  type LucideIcon,
} from 'lucide-react-native';

type AgentType = 'train' | 'fuel' | 'mind' | 'track' | 'vision';

type AgentIdentity = {
  label: string;
  color: string;
  Icon: LucideIcon;
};

const AGENT_MAP: Record<AgentType, AgentIdentity> = {
  train: {
    label: 'TRAIN',
    color: '#6D00FF',
    Icon: Dumbbell,
  },
  fuel: {
    label: 'FUEL',
    color: '#00C853',
    Icon: Utensils,
  },
  mind: {
    label: 'MIND',
    color: '#2196F3',
    Icon: Brain,
  },
  track: {
    label: 'TRACK',
    color: '#FF6D00',
    Icon: BarChart3,
  },
  vision: {
    label: 'VISION',
    color: '#E91E63',
    Icon: Camera,
  },
};

type AgentContributionProps = {
  agent: AgentType;
  contribution: string;
  isActive: boolean;
  /** Zero-based index used for staggered entrance delay. */
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

  const { label, color, Icon } = identity;

  return (
    <Animated.View
      entering={FadeIn.delay(index * 150).duration(350)}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        paddingVertical: 6,
        opacity: isActive ? 1 : 0.6,
      }}
      accessibilityLabel={`${label}: ${contribution}`}
    >
      {/* Agent icon circle */}
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: `${color}1A`,
          borderWidth: 1,
          borderColor: `${color}33`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={14} color={color} />
      </View>

      {/* Text column */}
      <View style={{ flex: 1, gap: 2 }}>
        {/* Agent name pill */}
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

        {/* Contribution text */}
        <Text
          style={{
            fontFamily: 'Inter',
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: 18,
          }}
          numberOfLines={3}
        >
          {contribution}
        </Text>
      </View>
    </Animated.View>
  );
}

export type { AgentType };
