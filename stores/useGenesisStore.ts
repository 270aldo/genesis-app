import { create } from 'zustand';
import { genesisAgentApi } from '../services';
import { hasSupabaseConfig } from '../services/supabaseClient';
import type { ChatMessage, WidgetPayload } from '../types';
import type { Json } from '../types/supabase';

type VoiceState = 'idle' | 'listening' | 'speaking';

type GenesisState = {
  messages: ChatMessage[];
  isLoading: boolean;
  voiceState: VoiceState;
  widgetQueue: WidgetPayload[];
  conversationId: string | null;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setVoiceState: (state: VoiceState) => void;
  queueWidget: (widget: WidgetPayload) => void;
  clearWidgetQueue: () => void;
  clearMessages: () => void;
  sendMessage: (content: string) => Promise<void>;
  loadConversation: (agentId?: 'genesis' | 'train' | 'fuel' | 'mind' | 'track' | 'vision' | 'coach_bridge') => Promise<void>;
};

export const useGenesisStore = create<GenesisState>((set, get) => ({
  messages: [],
  isLoading: false,
  voiceState: 'idle',
  widgetQueue: [],
  conversationId: null,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (isLoading) => set({ isLoading }),
  setVoiceState: (voiceState) => set({ voiceState }),
  queueWidget: (widget) => set((state) => ({ widgetQueue: [...state.widgetQueue, widget] })),
  clearWidgetQueue: () => set({ widgetQueue: [] }),

  clearMessages: () => {
    set({ messages: [], conversationId: null });
    // Create a new conversation row in Supabase
    if (hasSupabaseConfig) {
      (async () => {
        try {
          const { upsertConversation, getCurrentUserId } = await import('../services/supabaseQueries');
          const userId = getCurrentUserId();
          if (!userId) return;
          const result = await upsertConversation(userId, 'genesis', null, [] as Json);
          if (result) {
            set({ conversationId: result.id });
          }
        } catch (err: any) {
          console.warn('clearMessages new conversation failed:', err?.message);
        }
      })();
    }
  },

  loadConversation: async (agentId = 'genesis') => {
    if (!hasSupabaseConfig) return;
    try {
      const { fetchConversation, getCurrentUserId } = await import('../services/supabaseQueries');
      const userId = getCurrentUserId();
      if (!userId) return;
      const conv = await fetchConversation(userId, agentId);
      if (conv) {
        const msgs = Array.isArray(conv.messages) ? conv.messages : [];
        set({
          conversationId: conv.id,
          messages: msgs as unknown as ChatMessage[],
        });
      }
    } catch (err: any) {
      console.warn('loadConversation failed:', err?.message);
    }
  },

  sendMessage: async (content) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    set((state) => ({ messages: [...state.messages, userMessage], isLoading: true }));

    try {
      const { conversationId } = get();
      const response = await genesisAgentApi.sendMessage({
        message: content,
        agentId: 'genesis',
        conversationId,
      });
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
        conversationId: response.conversation_id ?? state.conversationId,
        isLoading: false,
      }));

      // Persist conversation to Supabase
      persistConversation(get);
    } catch (err: any) {
      // BFF unavailable — show error, no fake mocks
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'No pude conectar con el servidor. Verifica que el BFF esté corriendo (`cd bff && uvicorn main:app --reload`) y que `EXPO_PUBLIC_BFF_URL` apunte a la dirección correcta.',
        timestamp: Date.now(),
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        isLoading: false,
      }));
    }
  },
}));

async function persistConversation(get: () => GenesisState) {
  if (!hasSupabaseConfig) return;
  try {
    const { upsertConversation, getCurrentUserId } = await import('../services/supabaseQueries');
    const userId = getCurrentUserId();
    if (!userId) return;
    const { conversationId, messages } = get();
    const result = await upsertConversation(userId, 'genesis', conversationId, messages as unknown as Json);
    if (result && !get().conversationId) {
      useGenesisStore.setState({ conversationId: result.id });
    }
  } catch (err: any) {
    console.warn('persistConversation failed:', err?.message);
  }
}
