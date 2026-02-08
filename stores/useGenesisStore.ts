import { create } from 'zustand';
import { genesisAgentApi } from '../services';
import type { ChatMessage, WidgetPayload } from '../types';

type VoiceState = 'idle' | 'listening' | 'speaking';

type GenesisState = {
  messages: ChatMessage[];
  isLoading: boolean;
  voiceState: VoiceState;
  widgetQueue: WidgetPayload[];
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setVoiceState: (state: VoiceState) => void;
  queueWidget: (widget: WidgetPayload) => void;
  clearWidgetQueue: () => void;
  clearMessages: () => void;
  sendMessage: (content: string) => Promise<void>;
};

export const useGenesisStore = create<GenesisState>((set) => ({
  messages: [],
  isLoading: false,
  voiceState: 'idle',
  widgetQueue: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (isLoading) => set({ isLoading }),
  setVoiceState: (voiceState) => set({ voiceState }),
  queueWidget: (widget) => set((state) => ({ widgetQueue: [...state.widgetQueue, widget] })),
  clearWidgetQueue: () => set({ widgetQueue: [] }),
  clearMessages: () => set({ messages: [] }),
  sendMessage: async (content) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    set((state) => ({ messages: [...state.messages, userMessage], isLoading: true }));

    try {
      const response = await genesisAgentApi.sendMessage({ message: content, agentId: 'genesis' });
      const assistantMessage: ChatMessage = {
        id: response.id,
        role: 'assistant',
        content: response.response,
        timestamp: Date.now(),
        widgets: response.widgets,
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        widgetQueue: response.widgets ? [...state.widgetQueue, ...response.widgets] : state.widgetQueue,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `Error: ${message}`,
            timestamp: Date.now(),
          },
        ],
        isLoading: false,
      }));
    }
  },
}));
