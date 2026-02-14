import { useEffect } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { ANIMATION_EASING } from '../constants/animations';

export function useAnimatedCounter(targetValue: number, duration = 1000) {
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withTiming(targetValue, {
      duration,
      easing: ANIMATION_EASING.easeOut,
    });
  }, [targetValue, duration]);

  return value;
}
