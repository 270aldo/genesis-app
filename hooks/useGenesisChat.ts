import { useCallback } from 'react';
import { useGenesisStore } from '../stores';

/**
 * Convenience hook for the GENESIS chat interface.
 * Wraps store actions with stable callbacks.
 */
export function useGenesisChat() {
  const messages = useGenesisStore((s) => s.messages);
  const isLoading = useGenesisStore((s) => s.isLoading);
  const voiceState = useGenesisStore((s) => s.voiceState);
  const widgetQueue = useGenesisStore((s) => s.widgetQueue);
  const sendMessage = useGenesisStore((s) => s.sendMessage);
  const setVoiceState = useGenesisStore((s) => s.setVoiceState);
  const clearMessages = useGenesisStore((s) => s.clearMessages);
  const clearWidgetQueue = useGenesisStore((s) => s.clearWidgetQueue);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      await sendMessage(text.trim());
    },
    [sendMessage],
  );

  return {
    messages,
    isLoading,
    voiceState,
    widgetQueue,
    send,
    setVoiceState,
    clearMessages,
    clearWidgetQueue,
  } as const;
}
