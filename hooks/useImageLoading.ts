import { useCallback, useState } from 'react';

type ImageLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Tracks image loading state for progressive reveal / skeleton shimmer.
 */
export function useImageLoading() {
  const [state, setState] = useState<ImageLoadingState>('idle');

  const onLoadStart = useCallback(() => setState('loading'), []);
  const onLoad = useCallback(() => setState('loaded'), []);
  const onError = useCallback(() => setState('error'), []);

  return {
    state,
    isLoading: state === 'loading',
    hasLoaded: state === 'loaded',
    hasError: state === 'error',
    handlers: { onLoadStart, onLoad, onError },
  } as const;
}
