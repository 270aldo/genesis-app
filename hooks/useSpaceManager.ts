import { useCallback, useRef, useState } from 'react';

import type { ChatMessage } from '../types';
import { useGenesisStore } from '../stores';

// ── Types ──

export type SpaceId = 'daily' | 'logos' | 'season-hub' | 'labs';

export interface SpaceManager {
  /** The currently active space. */
  activeSpace: SpaceId;
  /** Switch to a different space, persisting and restoring messages. */
  switchSpace: (spaceId: SpaceId) => void;
}

// ── Hook ──

/**
 * Manages chat space navigation without modifying useGenesisStore internals.
 *
 * Each space maintains its own message cache. When switching spaces the
 * current messages are saved and the target space's cached messages are
 * restored into the store.
 */
export function useSpaceManager(): SpaceManager {
  const [activeSpace, setActiveSpace] = useState<SpaceId>('daily');

  // Per-space message cache — survives re-renders without triggering them.
  const messageCacheRef = useRef<Map<SpaceId, ChatMessage[]>>(new Map());

  const switchSpace = useCallback(
    (spaceId: SpaceId) => {
      if (spaceId === activeSpace) return;

      const store = useGenesisStore.getState();

      // 1. Save current messages to cache
      messageCacheRef.current.set(activeSpace, [...store.messages]);

      // 2. Clear store messages
      store.clearMessages();

      // 3. Load cached messages for target space
      const cached = messageCacheRef.current.get(spaceId) ?? [];
      for (const msg of cached) {
        useGenesisStore.getState().addMessage(msg);
      }

      // 4. Update active space
      setActiveSpace(spaceId);
    },
    [activeSpace],
  );

  return { activeSpace, switchSpace };
}
