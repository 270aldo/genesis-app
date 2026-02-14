import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { hapticSelection } from '../../utils/haptics';

interface SelectionCardProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}

export function SelectionCard({ icon, title, subtitle, selected, onPress }: SelectionCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = () => {
    hapticSelection();
    onPress();
  };

  return (
    <Pressable onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            backgroundColor: selected ? 'rgba(109,0,255,0.12)' : GENESIS_COLORS.surfaceCard,
            borderColor: selected ? 'rgba(109,0,255,0.3)' : GENESIS_COLORS.borderSubtle,
          },
          selected && {
            shadowColor: '#6D00FF',
            shadowOpacity: 0.25,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
            elevation: 4,
          },
          animatedStyle,
        ]}
      >
        {/* Icon area */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: selected ? 'rgba(109,0,255,0.15)' : 'rgba(255,255,255,0.05)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>

        {/* Text */}
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 15,
              fontFamily: 'InterBold',
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                color: GENESIS_COLORS.textSecondary,
                fontSize: 12,
                fontFamily: 'Inter',
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Check circle */}
        {selected && (
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: '#6D00FF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={14} color="#FFFFFF" strokeWidth={3} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}
