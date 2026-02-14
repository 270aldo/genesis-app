import { useEffect } from 'react';
import { useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { ANIMATION_EASING } from '../constants/animations';

interface StaggeredEntrance {
  progress: SharedValue<number>;
  delayMs: number;
  itemCount: number;
}

export function useStaggeredEntrance(itemCount: number, delayMs = 150): StaggeredEntrance {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 600 + itemCount * delayMs,
      easing: ANIMATION_EASING.easeOut,
    });
  }, [itemCount, delayMs]);

  return { progress, delayMs, itemCount };
}

/**
 * Use inside useAnimatedStyle to get staggered entry for a specific index:
 * const style = useAnimatedStyle(() => {
 *   const { opacity, translateY } = getStaggeredStyle(entrance.progress.value, index, entrance.delayMs, totalDuration);
 *   return { opacity, transform: [{ translateY }] };
 * });
 */
export function getStaggeredStyle(
  progress: number,
  index: number,
  delayMs: number,
  totalDuration: number,
) {
  'worklet';
  const itemStart = (index * delayMs) / totalDuration;
  const itemEnd = itemStart + 600 / totalDuration;
  const itemProgress = Math.min(Math.max((progress - itemStart) / (itemEnd - itemStart), 0), 1);

  return {
    opacity: itemProgress,
    translateY: 20 * (1 - itemProgress),
  };
}
