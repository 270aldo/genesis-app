import { Easing } from 'react-native-reanimated';

export const ANIMATION_DURATIONS = {
  micro: 150,
  short: 300,
  medium: 600,
  long: 1000,
} as const;

export const ANIMATION_EASING = {
  easeInOut: Easing.inOut(Easing.ease),
  easeOut: Easing.out(Easing.cubic),
  easeIn: Easing.in(Easing.cubic),
  custom: Easing.bezier(0.4, 0, 0.2, 1),
} as const;
