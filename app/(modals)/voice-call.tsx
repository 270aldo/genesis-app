import { useState, useEffect, useRef } from 'react';
import { Pressable, Text, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PhoneOff, Mic, MicOff, Volume2, Sparkles } from 'lucide-react-native';
import { GlassCard } from '../../components/ui';

export default function VoiceCallScreen() {
  const router = useRouter();
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [callActive, setCallActive] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Call timer
  useEffect(() => {
    if (!callActive) return;
    const interval = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [callActive]);

  // Pulse animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndCall = () => {
    setCallActive(false);
    // TODO: Disconnect ElevenLabs voice agent
    router.back();
  };

  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 40 }}>
        {/* Top Info */}
        <View className="items-center gap-2">
          <Text className="font-jetbrains-medium text-[11px] tracking-[1px] text-[#827a89]">
            GENESIS AI
          </Text>
          <Text className="font-inter-bold text-[14px] text-[#22ff73]">
            {callActive ? 'Connected' : 'Call Ended'}
          </Text>
        </View>

        {/* Avatar + Pulse */}
        <View className="items-center gap-6">
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: '#6D00FF15',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              className="h-[100px] w-[100px] items-center justify-center rounded-full"
              style={{
                backgroundColor: '#6D00FF30',
                shadowColor: '#6D00FF',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 20,
              }}
            >
              <Sparkles size={40} color="#b39aff" />
            </View>
          </Animated.View>

          <Text className="font-jetbrains-bold text-[32px] text-white">{formatTime(callSeconds)}</Text>

          {/* Status */}
          <GlassCard className="px-6 py-2">
            <Text className="font-inter text-[12px] text-[#827a89]">
              {muted ? 'Microphone muted' : 'Listening...'}
            </Text>
          </GlassCard>
        </View>

        {/* Controls */}
        <View className="w-full items-center gap-6 px-8">
          <View className="flex-row items-center justify-center gap-8">
            {/* Mute */}
            <Pressable
              onPress={() => setMuted(!muted)}
              className="h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: muted ? '#ff6b6b30' : '#FFFFFF0A' }}
            >
              {muted ? <MicOff size={22} color="#ff6b6b" /> : <Mic size={22} color="#FFFFFF" />}
            </Pressable>

            {/* End Call */}
            <Pressable
              onPress={handleEndCall}
              className="h-16 w-16 items-center justify-center rounded-full bg-[#ff4444]"
              style={{
                shadowColor: '#ff4444',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
              }}
            >
              <PhoneOff size={24} color="#FFFFFF" />
            </Pressable>

            {/* Speaker */}
            <Pressable
              onPress={() => setSpeakerOn(!speakerOn)}
              className="h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: speakerOn ? '#b39aff30' : '#FFFFFF0A' }}
            >
              <Volume2 size={22} color={speakerOn ? '#b39aff' : '#FFFFFF'} />
            </Pressable>
          </View>

          <Text className="font-inter text-[11px] text-[#6b6b7b]">
            Powered by GENESIS + ElevenLabs
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
