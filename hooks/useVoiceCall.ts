import { useEffect, useRef, useState, useCallback } from 'react';
import { Audio } from 'expo-av';
import { ElevenLabsConversation } from '../services/elevenLabsConversation';
import { File } from 'expo-file-system';

const PCM_RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: false,
  android: {
    extension: '.wav',
    outputFormat: Audio.AndroidOutputFormat.DEFAULT,
    audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
  },
  ios: {
    extension: '.wav',
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    audioQuality: Audio.IOSAudioQuality.LOW,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/wav',
    bitsPerSecond: 256000,
  },
};

type CallState = 'idle' | 'connecting' | 'connected' | 'error';

export function useVoiceCall() {
  const [callState, setCallState] = useState<CallState>('idle');
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Idle');

  const conversationRef = useRef<ElevenLabsConversation | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const chunkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCall = useCallback(async () => {
    setCallState('connecting');
    setStatusText('Conectando...');
    setError(null);

    // Request microphone permission
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      setCallState('error');
      setError('Permiso de micrófono denegado');
      return;
    }

    // Configure audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    // Create conversation
    const conversation = new ElevenLabsConversation({
      onConnected: () => {
        setCallState('connected');
        setStatusText('Escuchando...');
        startRecording();
      },
      onDisconnected: () => {
        setCallState('idle');
        setStatusText('Llamada terminada');
        stopRecording();
      },
      onError: (err) => {
        setCallState('error');
        setError(err);
        setStatusText('Error de conexión');
      },
      onAgentSpeaking: async (audioBase64: string) => {
        setStatusText('GENESIS habla...');
        await playAudioChunk(audioBase64);
      },
      onAgentText: () => {
        // Could display transcript if desired
      },
      onUserTranscript: () => {
        setStatusText('Escuchando...');
      },
    });

    conversationRef.current = conversation;
    await conversation.connect();
  }, []);

  const endCall = useCallback(async () => {
    conversationRef.current?.disconnect();
    await stopRecording();
    setCallState('idle');
    setStatusText('Llamada terminada');
  }, []);

  const toggleMute = useCallback(async () => {
    const next = !muted;
    setMuted(next);

    if (next) {
      await stopRecording();
      setStatusText('Micrófono silenciado');
    } else {
      await startRecording();
      setStatusText('Escuchando...');
    }
  }, [muted]);

  const toggleSpeaker = useCallback(async () => {
    const next = !speakerOn;
    setSpeakerOn(next);
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: !muted,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: !next,
    });
  }, [speakerOn, muted]);

  async function startRecording() {
    try {
      const { recording } = await Audio.Recording.createAsync(
        PCM_RECORDING_OPTIONS,
      );
      recordingRef.current = recording;

      // Send audio chunks on a reliable interval
      chunkIntervalRef.current = setInterval(sendAudioChunk, 500);
    } catch {
      // Recording may fail on simulator
    }
  }

  async function stopRecording() {
    if (chunkIntervalRef.current) {
      clearInterval(chunkIntervalRef.current);
      chunkIntervalRef.current = null;
    }
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
    } catch {
      // Ignore stop errors
    }
  }

  async function sendAudioChunk() {
    if (!conversationRef.current || !recordingRef.current) return;

    try {
      // Stop current recording to flush audio to file
      const currentRecording = recordingRef.current;
      recordingRef.current = null;

      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();

      if (uri) {
        // Read the audio file as base64 using the new File API
        const audioFile = new File(uri);
        const base64 = await audioFile.base64();

        // Only send if we have actual audio data (not just headers)
        if (base64.length > 100) {
          conversationRef.current.sendAudio(base64);
        }

        // Clean up the temp file
        audioFile.delete();
      }

      // Start a new recording for the next chunk
      const { recording: newRecording } = await Audio.Recording.createAsync(
        PCM_RECORDING_OPTIONS,
      );
      recordingRef.current = newRecording;
    } catch (err) {
      console.warn('[VoiceCall] sendAudioChunk error:', err);
    }
  }

  async function playAudioChunk(base64Audio: string) {
    try {
      const oldSound = soundRef.current;
      soundRef.current = null;

      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${base64Audio}` },
        { shouldPlay: true },
      );
      soundRef.current = sound;

      // Unload old sound after new one starts playing
      if (oldSound) {
        await oldSound.unloadAsync();
      }
    } catch {
      // Audio playback may fail
    }
  }

  // Cleanup on unmount — directly release resources without state updates
  useEffect(() => {
    return () => {
      conversationRef.current?.disconnect();
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
        chunkIntervalRef.current = null;
      }
      (async () => {
        try {
          if (recordingRef.current) {
            await recordingRef.current.stopAndUnloadAsync();
            recordingRef.current = null;
          }
          await soundRef.current?.unloadAsync();
        } catch {
          // Ignore cleanup errors on unmount
        }
      })();
    };
  }, []);

  return {
    callState,
    muted,
    speakerOn,
    error,
    statusText,
    startCall,
    endCall,
    toggleMute,
    toggleSpeaker,
  };
}
