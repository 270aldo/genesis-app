import { useState, useEffect, useRef } from 'react';
import { Pressable, Text, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PhoneOff, Mic, MicOff, Volume2, Sparkles, WifiOff } from 'lucide-react-native';
import { GlassCard } from '../../components/ui';
import { GENESIS_COLORS } from '../../constants/colors';
import { useVoiceCall } from '../../hooks/useVoiceCall';

export default function VoiceCallScreen() {
  const router = useRouter();
  const {
    callState, muted, speakerOn, error, statusText,
    startCall, endCall, toggleMute, toggleSpeaker,
  } = useVoiceCall();

  const [callSeconds, setCallSeconds] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Auto-start call on mount
  useEffect(() => {
    startCall();
    return () => { endCall(); };
  }, []);

  // Call timer — only counts when connected, resets on disconnect
  useEffect(() => {
    if (callState !== 'connected') {
      setCallSeconds(0);
      return;
    }
    const interval = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [callState]);

  // Pulse animation — only when connected
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    if (callState === 'connected') loop.start();
    return () => loop.stop();
  }, [pulseAnim, callState]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndCall = () => {
    endCall();
    router.back();
  };

  const statusColor =
    callState === 'connected' ? GENESIS_COLORS.success
    : callState === 'connecting' ? GENESIS_COLORS.warning
    : callState === 'error' ? GENESIS_COLORS.error
    : GENESIS_COLORS.textMuted;

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 40 }}>
        {/* Top Info */}
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1 }}>
            GENESIS AI
          </Text>
          <Text style={{ color: statusColor, fontSize: 14, fontFamily: 'InterBold' }}>
            {statusText}
          </Text>
          {error && (
            <Text style={{ color: GENESIS_COLORS.error, fontSize: 12, fontFamily: 'Inter', textAlign: 'center', paddingHorizontal: 32 }}>
              {error}
            </Text>
          )}
        </View>

        {/* Avatar + Pulse */}
        <View style={{ alignItems: 'center', gap: 24 }}>
          <Animated.View
            style={{
              transform: [{ scale: callState === 'connected' ? pulseAnim : 1 }],
              width: 140, height: 140, borderRadius: 70,
              backgroundColor: callState === 'error' ? GENESIS_COLORS.error + '15' : GENESIS_COLORS.primary + '15',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <View
              style={{
                height: 100, width: 100, alignItems: 'center', justifyContent: 'center',
                borderRadius: 50,
                backgroundColor: callState === 'error' ? GENESIS_COLORS.error + '30' : GENESIS_COLORS.primary + '30',
                shadowColor: callState === 'error' ? GENESIS_COLORS.error : GENESIS_COLORS.primary,
                shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20,
              }}
            >
              {callState === 'error' ? (
                <WifiOff size={40} color={GENESIS_COLORS.error} />
              ) : (
                <Sparkles size={40} color={GENESIS_COLORS.primaryLight} />
              )}
            </View>
          </Animated.View>

          <Text style={{ color: '#FFFFFF', fontSize: 32, fontFamily: 'JetBrainsMonoBold' }}>
            {callState === 'connected' ? formatTime(callSeconds) : '--:--'}
          </Text>

          {/* Status */}
          <GlassCard className="px-6 py-2">
            <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 12, fontFamily: 'Inter' }}>
              {muted ? 'Micrófono silenciado' : callState === 'connected' ? 'Escuchando...' : callState === 'connecting' ? 'Estableciendo conexión...' : 'Desconectado'}
            </Text>
          </GlassCard>
        </View>

        {/* Controls */}
        <View style={{ width: '100%', alignItems: 'center', gap: 24, paddingHorizontal: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
            {/* Mute */}
            <Pressable
              onPress={toggleMute}
              disabled={callState !== 'connected'}
              style={{
                height: 56, width: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 28,
                backgroundColor: muted ? GENESIS_COLORS.error + '30' : 'rgba(255,255,255,0.04)',
                opacity: callState !== 'connected' ? 0.4 : 1,
              }}
            >
              {muted ? <MicOff size={22} color={GENESIS_COLORS.error} /> : <Mic size={22} color="#FFFFFF" />}
            </Pressable>

            {/* End Call */}
            <Pressable
              onPress={handleEndCall}
              style={{
                height: 64, width: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 32,
                backgroundColor: '#ff4444',
                shadowColor: '#ff4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
              }}
            >
              <PhoneOff size={24} color="#FFFFFF" />
            </Pressable>

            {/* Speaker */}
            <Pressable
              onPress={toggleSpeaker}
              disabled={callState !== 'connected'}
              style={{
                height: 56, width: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 28,
                backgroundColor: speakerOn ? GENESIS_COLORS.primary + '30' : 'rgba(255,255,255,0.04)',
                opacity: callState !== 'connected' ? 0.4 : 1,
              }}
            >
              <Volume2 size={22} color={speakerOn ? GENESIS_COLORS.primaryLight : '#FFFFFF'} />
            </Pressable>
          </View>

          <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 11, fontFamily: 'Inter' }}>
            Powered by GENESIS + ElevenLabs
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
