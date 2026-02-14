import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Cpu } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface GenesisGuideProps {
  message: string;
}

export function GenesisGuide({ message }: GenesisGuideProps) {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1250 }),
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
    <View
      style={{
        flexDirection: 'row',
        gap: 14,
        backgroundColor: 'rgba(109,0,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(109,0,255,0.2)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'flex-start',
      }}
    >
      {/* Avatar with pulse ring */}
      <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 44,
              height: 44,
              borderRadius: 22,
              borderWidth: 1.5,
              borderColor: 'rgba(109,0,255,0.3)',
            },
            pulseStyle,
          ]}
        />
        <LinearGradient
          colors={['#6D00FF', '#a866ff']}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Cpu size={22} color="#FFFFFF" />
        </LinearGradient>
      </View>

      {/* Text content */}
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{
            fontFamily: 'JetBrainsMonoMedium',
            fontSize: 10,
            color: '#a866ff',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          GENESIS
        </Text>
        <Text
          style={{
            fontFamily: 'Inter',
            fontSize: 14,
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 20,
          }}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}
