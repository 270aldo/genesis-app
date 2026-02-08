import { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';

type NavigationAnimationProps = {
  style?: ViewStyle;
  children: React.ReactNode;
};

export function NavigationAnimation({ style, children }: NavigationAnimationProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}> 
      {children}
    </Animated.View>
  );
}
