type ConversationCallbacks = {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
  onAgentSpeaking?: (audioBase64: string) => void;
  onAgentText?: (text: string) => void;
  onUserTranscript?: (text: string) => void;
};

type ConversationState = 'idle' | 'connecting' | 'connected' | 'error';

const ELEVENLABS_AGENT_ID = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID ?? '';

export class ElevenLabsConversation {
  private ws: WebSocket | null = null;
  private state: ConversationState = 'idle';
  private callbacks: ConversationCallbacks;

  constructor(callbacks: ConversationCallbacks) {
    this.callbacks = callbacks;
  }

  getState(): ConversationState {
    return this.state;
  }

  async connect(): Promise<void> {
    if (!ELEVENLABS_AGENT_ID) {
      this.callbacks.onError?.('ElevenLabs Agent ID not configured');
      return;
    }

    this.state = 'connecting';

    try {
      const url = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${ELEVENLABS_AGENT_ID}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.state = 'connected';
        this.callbacks.onConnected?.();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case 'audio':
              this.callbacks.onAgentSpeaking?.(data.audio_event?.audio_base_64 ?? '');
              break;
            case 'agent_response':
              this.callbacks.onAgentText?.(data.agent_response_event?.agent_response ?? '');
              break;
            case 'user_transcript':
              this.callbacks.onUserTranscript?.(data.user_transcription_event?.user_transcript ?? '');
              break;
          }
        } catch {
          // ignore malformed messages
        }
      };

      this.ws.onerror = () => {
        this.state = 'error';
        this.callbacks.onError?.('WebSocket connection failed');
      };

      this.ws.onclose = () => {
        this.state = 'idle';
        this.callbacks.onDisconnected?.();
      };
    } catch (err: any) {
      this.state = 'error';
      this.callbacks.onError?.(err?.message ?? 'Connection failed');
    }
  }

  sendAudio(base64Audio: string): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({
      user_audio_chunk: base64Audio,
    }));
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.state = 'idle';
  }
}
