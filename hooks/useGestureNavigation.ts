import { useCallback, useRef } from 'react';
import { type GestureResponderEvent, PanResponder } from 'react-native';

type Direction = 'left' | 'right' | 'up' | 'down';
type GestureCallback = (direction: Direction) => void;

const SWIPE_THRESHOLD = 50;

/**
 * Provides a PanResponder that fires onSwipe when the user swipes
 * beyond SWIPE_THRESHOLD in any cardinal direction.
 */
export function useGestureNavigation(onSwipe: GestureCallback) {
  const startRef = useRef({ x: 0, y: 0 });

  const handleStart = useCallback((_e: GestureResponderEvent) => {
    startRef.current = { x: 0, y: 0 };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_e, gesture) =>
        Math.abs(gesture.dx) > 10 || Math.abs(gesture.dy) > 10,
      onPanResponderGrant: handleStart,
      onPanResponderRelease: (_e, gesture) => {
        const { dx, dy } = gesture;
        if (Math.abs(dx) > Math.abs(dy)) {
          if (Math.abs(dx) > SWIPE_THRESHOLD) {
            onSwipe(dx > 0 ? 'right' : 'left');
          }
        } else if (Math.abs(dy) > SWIPE_THRESHOLD) {
          onSwipe(dy > 0 ? 'down' : 'up');
        }
      },
    }),
  ).current;

  return panResponder.panHandlers;
}
