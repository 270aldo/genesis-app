import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Play, Pause, SkipForward, SkipBack, Target, Repeat, Clock } from 'lucide-react-native';
import { GlassCard, Pill } from '../../components/ui';

export default function ExerciseVideoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; muscle?: string; sets?: string; reps?: string }>();
  const [playing, setPlaying] = useState(false);

  const exerciseName = params.name ?? 'Bench Press';
  const muscleGroup = params.muscle ?? 'Chest';
  const sets = params.sets ?? '4';
  const reps = params.reps ?? '8-10';

  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40, gap: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Video Area */}
          <View className="relative aspect-video w-full items-center justify-center bg-[#0A0A1E]">
            {/* Close Button */}
            <Pressable
              onPress={() => router.back()}
              className="absolute left-4 top-4 z-10 h-10 w-10 items-center justify-center rounded-full bg-[#00000080]"
            >
              <X size={20} color="#FFFFFF" />
            </Pressable>

            {/* Placeholder Video */}
            <View className="items-center gap-3">
              <Pressable
                onPress={() => setPlaying(!playing)}
                className="h-16 w-16 items-center justify-center rounded-full"
                style={{
                  backgroundColor: '#6D00FF40',
                  shadowColor: '#6D00FF',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                }}
              >
                {playing ? <Pause size={28} color="#FFFFFF" /> : <Play size={28} color="#FFFFFF" />}
              </Pressable>
              <Text className="font-inter text-[12px] text-[#6b6b7b]">
                {playing ? 'Playing demo...' : 'Tap to play'}
              </Text>
            </View>

            {/* Video Controls Bar */}
            <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-center gap-6 bg-[#00000060] py-3">
              <Pressable>
                <SkipBack size={18} color="#FFFFFF" />
              </Pressable>
              <Pressable onPress={() => setPlaying(!playing)}>
                {playing ? <Pause size={22} color="#FFFFFF" /> : <Play size={22} color="#FFFFFF" />}
              </Pressable>
              <Pressable>
                <SkipForward size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          {/* Exercise Info */}
          <View className="gap-4 px-5">
            <View className="gap-2">
              <Text className="font-inter-bold text-[22px] text-white">{exerciseName}</Text>
              <View className="flex-row gap-2">
                <Pill label={muscleGroup} />
                <Pill label={`${sets} sets`} variant="success" />
                <Pill label={`${reps} reps`} variant="info" />
              </View>
            </View>

            {/* Quick Stats */}
            <View className="flex-row gap-3">
              <GlassCard className="flex-1 items-center gap-1 py-3">
                <Repeat size={16} color="#b39aff" />
                <Text className="font-jetbrains-bold text-[16px] text-white">{sets}</Text>
                <Text className="font-inter text-[10px] text-[#827a89]">Sets</Text>
              </GlassCard>
              <GlassCard className="flex-1 items-center gap-1 py-3">
                <Target size={16} color="#22ff73" />
                <Text className="font-jetbrains-bold text-[16px] text-white">{reps}</Text>
                <Text className="font-inter text-[10px] text-[#827a89]">Reps</Text>
              </GlassCard>
              <GlassCard className="flex-1 items-center gap-1 py-3">
                <Clock size={16} color="#38bdf8" />
                <Text className="font-jetbrains-bold text-[16px] text-white">90s</Text>
                <Text className="font-inter text-[10px] text-[#827a89]">Rest</Text>
              </GlassCard>
            </View>

            {/* Instructions */}
            <GlassCard shine className="gap-3">
              <Text className="font-jetbrains-medium text-[11px] tracking-[1px] text-[#827a89]">
                FORM CUES
              </Text>
              <View className="gap-2">
                <CueRow number={1} text="Retract shoulder blades and arch slightly on the bench" />
                <CueRow number={2} text="Grip the bar slightly wider than shoulder width" />
                <CueRow number={3} text="Lower the bar to mid-chest with control" />
                <CueRow number={4} text="Press up and slightly back, locking out at the top" />
              </View>
            </GlassCard>

            {/* Start Set Button */}
            <Pressable>
              <LinearGradient
                colors={['#6D00FF', '#5B21B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Play size={18} color="#FFFFFF" />
                <Text className="font-jetbrains-semibold text-[14px] text-white">
                  START SET 1
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function CueRow({ number, text }: { number: number; text: string }) {
  return (
    <View className="flex-row gap-3">
      <View className="h-6 w-6 items-center justify-center rounded-full bg-[#6D00FF20]">
        <Text className="font-jetbrains-bold text-[11px] text-[#b39aff]">{number}</Text>
      </View>
      <Text className="flex-1 font-inter text-[13px] leading-[18px] text-[#c4c0cc]">{text}</Text>
    </View>
  );
}
