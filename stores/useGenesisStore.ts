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

function getMockResponse(content: string): { text: string; widgets: WidgetPayload[] } {
  const lower = content.toLowerCase();

  if (lower.includes('entreno') || lower.includes('workout') || lower.includes('ejercicio')) {
    return {
      text: 'Hoy te toca Push Day: pecho, hombros y tríceps. Estás en fase de Strength, así que ve con cargas al 80-85% de tu 1RM. Recuerda respetar los descansos de 2-3 minutos entre series pesadas. Tu recovery está en 82% — verde para darle.',
      widgets: [{
        id: `w-${Date.now()}`,
        type: 'metric-card',
        title: 'Recovery Score',
        value: '82%',
        data: { status: 'good', trend: 'stable' },
      }],
    };
  }

  if (lower.includes('comida') || lower.includes('macro') || lower.includes('nutrición') || lower.includes('comer')) {
    return {
      text: 'Según tu log de hoy, te faltan 45g de proteína y 30g de carbs para llegar a tu target. Te sugiero: pechuga de pollo a la plancha con arroz integral y brócoli (~450 kcal, 42g proteína). Otra opción: batido de whey con avena y plátano.',
      widgets: [{
        id: `w-${Date.now()}`,
        type: 'metric-card',
        title: 'Macros Remaining',
        value: '45g P / 30g C',
        data: { protein: 45, carbs: 30, fat: 8 },
      }],
    };
  }

  if (lower.includes('recovery') || lower.includes('sleep') || lower.includes('dormir') || lower.includes('descanso')) {
    return {
      text: 'Tu recovery general está bien esta semana. Pecho y hombros están en recuperación moderada (entrenados ayer), espalda y piernas están recovered. Tips: hidratación mínima 3L hoy, intenta dormir 7.5h+, y considera 10 min de stretching antes de dormir.',
      widgets: [{
        id: `w-${Date.now()}`,
        type: 'coach-message',
        title: 'Recovery Protocol',
        subtitle: 'Based on your training load',
        data: { priority: 'hydration', sleepTarget: 7.5 },
      }],
    };
  }

  if (lower.includes('season') || lower.includes('fase') || lower.includes('progreso') || lower.includes('semana')) {
    return {
      text: 'Estás en Season 1, Semana 3 de 12 — fase de Strength. Llevas un 18% del season completado. Los primeros 2 semanas de hipertrofia fueron sólidas. Ahora enfócate en cargas pesadas con reps bajas (4-6). Tu adherencia esta semana va al 100%.',
      widgets: [{
        id: `w-${Date.now()}`,
        type: 'progress-dashboard',
        title: 'Season Progress',
        value: '18%',
        data: { week: 3, totalWeeks: 12, phase: 'strength' },
      }],
    };
  }

  return {
    text: 'Estoy aquí para ayudarte con tu entrenamiento, nutrición, recovery o cualquier duda sobre tu Season. Pregúntame lo que necesites — puedo analizar tu progreso, sugerirte comidas, explicarte tu fase actual, o darte tips de recuperación.',
    widgets: [],
  };
}

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
        isLoading: false,
      }));

      // Persist conversation to Supabase
      persistConversation(get);
    } catch {
      // Fall back to mock responses when BFF is unavailable
      const mock = getMockResponse(content);
      const assistantMessage: ChatMessage = {
        id: `mock-${Date.now()}`,
        role: 'assistant',
        content: mock.text,
        timestamp: Date.now(),
        widgets: mock.widgets.length > 0 ? mock.widgets : undefined,
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        widgetQueue: mock.widgets.length > 0 ? [...state.widgetQueue, ...mock.widgets] : state.widgetQueue,
        isLoading: false,
      }));

      // Still persist even mock conversations
      persistConversation(get);
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
