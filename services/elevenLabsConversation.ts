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
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private intentionalDisconnect = false;

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

    this.intentionalDisconnect = false;
    this.state = 'connecting';

    try {
      const url = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${ELEVENLABS_AGENT_ID}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.state = 'connected';
        this.reconnectAttempts = 0;
        this.startPing();
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
        this.stopPing();
        const wasConnected = this.state === 'connected';
        this.state = 'idle';

        if (!this.intentionalDisconnect && wasConnected && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * this.reconnectAttempts;
          console.log(`[ElevenLabs] Reconnecting attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
          setTimeout(() => this.connect(), delay);
          return;
        }

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
    this.intentionalDisconnect = true;
    this.stopPing();
    this.ws?.close();
    this.ws = null;
    this.state = 'idle';
  }

  private startPing(): void {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 15000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}
