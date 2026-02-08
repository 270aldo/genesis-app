import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { theme } from '../../constants/theme';

export function ShimmerEffect() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }}>
      <View style={{ height: 8, borderRadius: 6, backgroundColor: theme.colors.shine }} />
    </Animated.View>
  );
}
