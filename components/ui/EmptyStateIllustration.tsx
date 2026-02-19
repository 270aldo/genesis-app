import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Utensils, Brain, Dumbbell } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const VARIANT_CONFIG = {
  track: { icon: TrendingUp, gradient: ['#6D00FF', '#9D4EDD'] as [string, string] },
  fuel: { icon: Utensils, gradient: ['#00F5AA', '#00BB7D'] as [string, string] },
  mind: { icon: Brain, gradient: ['#9D4EDD', '#7B2FBE'] as [string, string] },
  train: { icon: Dumbbell, gradient: ['#FFD93D', '#E6B800'] as [string, string] },
} as const;

interface EmptyStateIllustrationProps {
  variant: keyof typeof VARIANT_CONFIG;
  title: string;
  subtitle: string;
}

export function EmptyStateIllustration({ variant, title, subtitle }: EmptyStateIllustrationProps) {
  const config = VARIANT_CONFIG[variant];
  const IconComponent = config.icon;
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1250 }),
        withTiming(1, { duration: 1250 }),
      ),
      -1,
      true,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={{ alignItems: 'center', gap: 8, paddingVertical: 24 }}>
      {/* Pulse ring + gradient icon */}
      <View style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 80,
              height: 80,
              borderRadius: 40,
              borderWidth: 1.5,
              borderColor: config.gradient[0] + '4D',
            },
            pulseStyle,
          ]}
        />
        <LinearGradient
          colors={config.gradient}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#6D00FF',
            shadowOpacity: 0.3,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 0 },
          }}
        >
          <IconComponent size={28} color="#FFFFFF" />
        </LinearGradient>
      </View>

      <Text style={{ fontSize: 14, fontFamily: 'InterBold', color: '#FFFFFF', marginTop: 16 }}>
        {title}
      </Text>
      <Text
        style={{
          fontSize: 12,
          fontFamily: 'Inter',
          color: 'rgba(255, 255, 255, 0.60)',
          maxWidth: 250,
          lineHeight: 18,
          textAlign: 'center',
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}
