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

function getMockResponse(content: string): { text: string; widgets: WidgetPayload[] } {
  const lower = content.toLowerCase();

  if (lower.includes('entreno') || lower.includes('workout') || lower.includes('ejercicio')) {
    return {
      text: 'Hoy te toca Push Day: pecho, hombros y tríceps. Estás en fase de Strength, así que ve con cargas al 80-85% de tu 1RM. Recuerda respetar los descansos de 2-3 minutos entre series pesadas. Tu recovery está en 82% — verde para darle.',
      widgets: [{
        id: `w-${Date.now()}`,
        type: 'metric_card',
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
        type: 'metric_card',
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
        type: 'recommendation',
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
        type: 'progress_indicator',
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
    }
  },
}));
