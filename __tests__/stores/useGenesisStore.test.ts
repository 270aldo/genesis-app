import { useGenesisStore } from '../../stores/useGenesisStore';
import type { ChatMessage, WidgetPayload } from '../../types/models';

const initialState = {
  messages: [],
  isLoading: false,
  voiceState: 'idle' as const,
  widgetQueue: [],
  conversationId: null,
};

beforeEach(() => {
  useGenesisStore.setState(initialState);
});

describe('useGenesisStore', () => {
  it('has correct initial state (empty messages, isLoading false, widgetQueue empty)', () => {
    const state = useGenesisStore.getState();
    expect(state.messages).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.widgetQueue).toEqual([]);
    expect(state.conversationId).toBeNull();
  });

  it('addMessage() appends message to array', () => {
    const msg: ChatMessage = {
      id: 'msg-1',
      role: 'user',
      content: 'Hello Genesis',
      timestamp: Date.now(),
    };
    useGenesisStore.getState().addMessage(msg);

    const state = useGenesisStore.getState();
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].content).toBe('Hello Genesis');
  });

  it('clearMessages() empties messages and resets conversationId', () => {
    // Add some messages first
    useGenesisStore.setState({
      messages: [
        { id: 'msg-1', role: 'user', content: 'Hello', timestamp: Date.now() },
        { id: 'msg-2', role: 'assistant', content: 'Hi!', timestamp: Date.now() },
      ],
      conversationId: 'conv-123',
    });

    useGenesisStore.getState().clearMessages();
    const state = useGenesisStore.getState();
    expect(state.messages).toEqual([]);
    expect(state.conversationId).toBeNull();
  });

  it('queueWidget() adds to widgetQueue', () => {
    const widget: WidgetPayload = {
      id: 'widget-1',
      type: 'metric_card',
      title: 'Recovery',
      value: '85%',
    };
    useGenesisStore.getState().queueWidget(widget);

    const state = useGenesisStore.getState();
    expect(state.widgetQueue).toHaveLength(1);
    expect(state.widgetQueue[0].title).toBe('Recovery');
  });

  it('clearWidgetQueue() empties widgetQueue', () => {
    useGenesisStore.setState({
      widgetQueue: [
        { id: 'w-1', type: 'metric_card', title: 'Test' },
        { id: 'w-2', type: 'recommendation', title: 'Test 2' },
      ],
    });

    useGenesisStore.getState().clearWidgetQueue();
    expect(useGenesisStore.getState().widgetQueue).toEqual([]);
  });

  it('sendMessage() adds user message, then assistant message', async () => {
    await useGenesisStore.getState().sendMessage('What is my workout today?');

    const state = useGenesisStore.getState();
    expect(state.messages.length).toBeGreaterThanOrEqual(2);
    expect(state.messages[0].role).toBe('user');
    expect(state.messages[0].content).toBe('What is my workout today?');
    expect(state.messages[1].role).toBe('assistant');
    expect(state.isLoading).toBe(false);
  });
});
