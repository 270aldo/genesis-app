export interface TtsOptions {
  text: string;
  voiceId: string;
}

const elevenLabsApiUrl = process.env.EXPO_PUBLIC_ELEVENLABS_API_URL ?? '';
const elevenLabsKey = process.env.ELEVENLABS_API_KEY ?? '';

export const elevenLabsApi = {
  async textToSpeech(options: TtsOptions): Promise<ArrayBuffer | null> {
    if (!elevenLabsApiUrl || !elevenLabsKey) return null;

    const response = await fetch(`${elevenLabsApiUrl}/text-to-speech/${options.voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: options.text }),
    });

    if (!response.ok) throw new Error('ElevenLabs TTS failed');
    return response.arrayBuffer();
  },
};
