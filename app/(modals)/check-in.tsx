import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Sun, CloudRain, Zap, Moon, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { GlassCard } from '../../components/ui';

const MOODS = [
  { id: 'great', label: 'Great', icon: Sun, color: '#22ff73' },
  { id: 'good', label: 'Good', icon: Zap, color: '#38bdf8' },
  { id: 'okay', label: 'Okay', icon: CloudRain, color: '#F97316' },
  { id: 'tired', label: 'Tired', icon: Moon, color: '#827a89' },
  { id: 'bad', label: 'Bad', icon: AlertTriangle, color: '#ff6b6b' },
];

const SLEEP_OPTIONS = ['< 5h', '5-6h', '6-7h', '7-8h', '8h+'];
const ENERGY_LEVELS = [1, 2, 3, 4, 5];

export default function CheckInScreen() {
  const router = useRouter();
  const [mood, setMood] = useState('');
  const [sleep, setSleep] = useState('');
  const [energy, setEnergy] = useState(0);
  const [soreness, setSoreness] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = mood !== '' && sleep !== '' && energy > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    // TODO: Save check-in to Supabase
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 20 }}>
          <CheckCircle size={64} color="#22ff73" />
          <Text className="font-inter-bold text-[22px] text-white">Check-in Complete</Text>
          <Text className="text-center font-inter text-[14px] text-[#827a89]">
            GENESIS will use this data to optimize your training and recovery today.
          </Text>
          <Pressable onPress={() => router.back()}>
            <LinearGradient
              colors={['#6D00FF', '#5B21B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center' }}
            >
              <Text className="font-jetbrains-semibold text-[14px] text-white">DONE</Text>
            </LinearGradient>
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-[#FFFFFF0A]"
            >
              <X size={20} color="#FFFFFF" />
            </Pressable>
            <Text className="font-inter-bold text-[18px] text-white">Daily Check-in</Text>
            <View className="h-10 w-10" />
          </View>

          {/* Mood */}
          <GlassCard shine className="gap-3">
            <Text className="font-jetbrains-medium text-[11px] tracking-[1px] text-[#827a89]">
              HOW ARE YOU FEELING?
            </Text>
            <View className="flex-row justify-between">
              {MOODS.map((m) => {
                const Icon = m.icon;
                const selected = mood === m.id;
                return (
                  <Pressable key={m.id} onPress={() => setMood(m.id)} className="items-center gap-1">
                    <View
                      className="h-12 w-12 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: selected ? `${m.color}30` : '#FFFFFF0A',
                        borderWidth: selected ? 1.5 : 0,
                        borderColor: selected ? m.color : 'transparent',
                      }}
                    >
                      <Icon size={20} color={selected ? m.color : '#6b6b7b'} />
                    </View>
                    <Text
                      className={`font-inter text-[10px] ${selected ? 'text-white' : 'text-[#6b6b7b]'}`}
                    >
                      {m.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Sleep */}
          <GlassCard shine className="gap-3">
            <Text className="font-jetbrains-medium text-[11px] tracking-[1px] text-[#827a89]">
              SLEEP LAST NIGHT
            </Text>
            <View className="flex-row gap-2">
              {SLEEP_OPTIONS.map((s) => {
                const selected = sleep === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => setSleep(s)}
                    className="flex-1 items-center rounded-[10px] py-2"
                    style={{
                      backgroundColor: selected ? '#6D00FF30' : '#FFFFFF0A',
                      borderWidth: selected ? 1 : 0.5,
                      borderColor: selected ? '#b39aff' : '#FFFFFF14',
                    }}
                  >
                    <Text
                      className={`font-jetbrains-medium text-[11px] ${selected ? 'text-white' : 'text-[#827a89]'}`}
                    >
                      {s}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Energy Level */}
          <GlassCard shine className="gap-3">
            <Text className="font-jetbrains-medium text-[11px] tracking-[1px] text-[#827a89]">
              ENERGY LEVEL
            </Text>
            <View className="flex-row justify-between px-2">
              {ENERGY_LEVELS.map((lvl) => {
                const selected = energy >= lvl;
                return (
                  <Pressable key={lvl} onPress={() => setEnergy(lvl)}>
                    <View
                      className="h-10 w-10 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: selected ? '#22ff7340' : '#FFFFFF0A',
                        borderWidth: selected ? 1 : 0,
                        borderColor: selected ? '#22ff73' : 'transparent',
                      }}
                    >
                      <Zap size={16} color={selected ? '#22ff73' : '#6b6b7b'} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Text className="text-center font-inter text-[11px] text-[#6b6b7b]">
              {energy === 0 ? 'Tap to rate' : `${energy}/5`}
            </Text>
          </GlassCard>

          {/* Soreness */}
          <GlassCard shine className="gap-3">
            <Text className="font-jetbrains-medium text-[11px] tracking-[1px] text-[#827a89]">
              SORENESS / PAIN (OPTIONAL)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {['None', 'Shoulders', 'Back', 'Knees', 'Wrists', 'Full body'].map((area) => {
                const selected = soreness === area;
                return (
                  <Pressable
                    key={area}
                    onPress={() => setSoreness(selected ? '' : area)}
                    className="rounded-[10px] px-3 py-2"
                    style={{
                      backgroundColor: selected ? '#ff6b6b20' : '#FFFFFF0A',
                      borderWidth: selected ? 1 : 0.5,
                      borderColor: selected ? '#ff6b6b' : '#FFFFFF14',
                    }}
                  >
                    <Text
                      className={`font-inter text-[12px] ${selected ? 'text-[#ff6b6b]' : 'text-[#827a89]'}`}
                    >
                      {area}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Notes */}
          <GlassCard shine className="gap-2">
            <Text className="font-jetbrains-medium text-[11px] tracking-[1px] text-[#827a89]">
              NOTES (OPTIONAL)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything GENESIS should know today..."
              placeholderTextColor="#6b6b7b"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="rounded-[12px] border border-[#FFFFFF14] bg-[#0D0D2B] px-4 py-3 font-inter text-[13px] text-white"
              style={{ minHeight: 80 }}
            />
          </GlassCard>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={{ opacity: canSubmit ? 1 : 0.4 }}
          >
            <LinearGradient
              colors={['#6D00FF', '#5B21B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text className="font-jetbrains-semibold text-[14px] text-white">
                SUBMIT CHECK-IN
              </Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
