import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useReducedMotion } from './useReducedMotion';

type AnimationConfig = {
  toValue?: number;
  duration?: number;
  delay?: number;
  useNativeDriver?: boolean;
};

/**
 * Simple fade-in / slide-up entrance animation.
 * Respects reduced-motion preferences.
 */
export function useFadeIn(config: AnimationConfig = {}) {
  const { toValue = 1, duration = 400, delay = 0, useNativeDriver = true } = config;
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(reduced ? toValue : 0)).current;

  useEffect(() => {
    if (reduced) {
      opacity.setValue(toValue);
      return;
    }
    Animated.timing(opacity, { toValue, duration, delay, useNativeDriver }).start();
  }, [delay, duration, opacity, reduced, toValue]);

  return opacity;
}

/**
 * Slide-up entrance with fade.
 */
export function useSlideUp(config: AnimationConfig & { distance?: number } = {}) {
  const { distance = 20, duration = 400, delay = 0, useNativeDriver = true } = config;
  const reduced = useReducedMotion();
  const translateY = useRef(new Animated.Value(reduced ? 0 : distance)).current;
  const opacity = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) {
      translateY.setValue(0);
      opacity.setValue(1);
      return;
    }
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration, delay, useNativeDriver }),
      Animated.timing(opacity, { toValue: 1, duration, delay, useNativeDriver }),
    ]).start();
  }, [delay, distance, duration, opacity, reduced, translateY]);

  return { translateY, opacity };
}
