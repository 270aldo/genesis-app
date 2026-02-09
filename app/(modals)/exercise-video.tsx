import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Play, Pause, SkipForward, SkipBack, Target, Repeat, Clock } from 'lucide-react-native';
import { GlassCard, Pill } from '../../components/ui';
import { GENESIS_COLORS } from '../../constants/colors';

export default function ExerciseVideoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; muscle?: string; sets?: string; reps?: string }>();
  const [playing, setPlaying] = useState(false);

  const exerciseName = params.name ?? 'Bench Press';
  const muscleGroup = params.muscle ?? 'Chest';
  const sets = params.sets ?? '4';
  const reps = params.reps ?? '8-10';

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40, gap: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Video Area */}
          <View style={{ position: 'relative', aspectRatio: 16 / 9, width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: GENESIS_COLORS.bgVoid }}>
            {/* Close Button */}
            <Pressable
              onPress={() => router.back()}
              style={{ position: 'absolute', left: 16, top: 16, zIndex: 10, height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
              <X size={20} color="#FFFFFF" />
            </Pressable>

            {/* Placeholder Video */}
            <View style={{ alignItems: 'center', gap: 12 }}>
              <Pressable
                onPress={() => setPlaying(!playing)}
                style={{
                  height: 64,
                  width: 64,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 32,
                  backgroundColor: GENESIS_COLORS.primary + '40',
                  shadowColor: GENESIS_COLORS.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                }}
              >
                {playing ? <Pause size={28} color="#FFFFFF" /> : <Play size={28} color="#FFFFFF" />}
              </Pressable>
              <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 12, fontFamily: 'Inter' }}>
                {playing ? 'Playing demo...' : 'Tap to play'}
              </Text>
            </View>

            {/* Video Controls Bar */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, backgroundColor: 'rgba(0,0,0,0.4)', paddingVertical: 12 }}>
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
          <View style={{ gap: 16, paddingHorizontal: 20 }}>
            <View style={{ gap: 8 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontFamily: 'InterBold' }}>{exerciseName}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pill label={muscleGroup} />
                <Pill label={`${sets} sets`} variant="success" />
                <Pill label={`${reps} reps`} variant="info" />
              </View>
            </View>

            {/* Quick Stats */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <GlassCard className="flex-1 items-center gap-1 py-3">
                <Repeat size={16} color={GENESIS_COLORS.primary} />
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'JetBrainsMonoBold' }}>{sets}</Text>
                <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'Inter' }}>Sets</Text>
              </GlassCard>
              <GlassCard className="flex-1 items-center gap-1 py-3">
                <Target size={16} color={GENESIS_COLORS.success} />
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'JetBrainsMonoBold' }}>{reps}</Text>
                <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'Inter' }}>Reps</Text>
              </GlassCard>
              <GlassCard className="flex-1 items-center gap-1 py-3">
                <Clock size={16} color={GENESIS_COLORS.info} />
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'JetBrainsMonoBold' }}>90s</Text>
                <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'Inter' }}>Rest</Text>
              </GlassCard>
            </View>

            {/* Instructions */}
            <GlassCard shine className="gap-3">
              <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1 }}>
                FORM CUES
              </Text>
              <View style={{ gap: 8 }}>
                <CueRow number={1} text="Retract shoulder blades and arch slightly on the bench" />
                <CueRow number={2} text="Grip the bar slightly wider than shoulder width" />
                <CueRow number={3} text="Lower the bar to mid-chest with control" />
                <CueRow number={4} text="Press up and slightly back, locking out at the top" />
              </View>
            </GlassCard>

            {/* Start Set Button */}
            <Pressable>
              <LinearGradient
                colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                  shadowColor: GENESIS_COLORS.primary,
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 8,
                }}
              >
                <Play size={18} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'JetBrainsMonoSemiBold' }}>
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
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={{ height: 24, width: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: GENESIS_COLORS.primaryDim }}>
        <Text style={{ color: GENESIS_COLORS.primary, fontSize: 11, fontFamily: 'JetBrainsMonoBold' }}>{number}</Text>
      </View>
      <Text style={{ flex: 1, color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter', lineHeight: 18 }}>{text}</Text>
    </View>
  );
}
