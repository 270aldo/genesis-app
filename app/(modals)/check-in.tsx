import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { X, Sun, CloudRain, Zap, Moon, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { GlassCard } from '../../components/ui';
import { GENESIS_COLORS } from '../../constants/colors';
import { useWellnessStore } from '../../stores';

const MOODS = [
  { id: 'great', label: 'Great', icon: Sun, color: GENESIS_COLORS.success },
  { id: 'good', label: 'Good', icon: Zap, color: GENESIS_COLORS.info },
  { id: 'okay', label: 'Okay', icon: CloudRain, color: GENESIS_COLORS.warning },
  { id: 'tired', label: 'Tired', icon: Moon, color: GENESIS_COLORS.chromeDark },
  { id: 'bad', label: 'Bad', icon: AlertTriangle, color: GENESIS_COLORS.error },
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

    const moodMap: Record<string, string> = { great: 'excellent', good: 'good', okay: 'neutral', tired: 'poor', bad: 'terrible' };
    const sleepHoursMap: Record<string, number> = { '< 5h': 4.5, '5-6h': 5.5, '6-7h': 6.5, '7-8h': 7.5, '8h+': 8.5 };
    const sleepQualityMap: Record<string, string> = { '< 5h': 'poor', '5-6h': 'fair', '6-7h': 'fair', '7-8h': 'good', '8h+': 'excellent' };
    const sorenessMap: Record<string, number> = { None: 0, Shoulders: 3, Back: 4, Knees: 4, Wrists: 2, 'Full body': 5 };

    await useWellnessStore.getState().submitCheckIn({
      mood: moodMap[mood] ?? 'neutral',
      sleepHours: sleepHoursMap[sleep] ?? 7,
      sleepQuality: sleepQualityMap[sleep] ?? 'fair',
      stressLevel: Math.max(1, 6 - energy),
      energyLevel: energy * 2,
      soreness: sorenessMap[soreness] ?? 0,
      notes: notes || undefined,
    });

    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(`genesis_checkin_${today}`, 'true');

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 20 }}>
          <CheckCircle size={64} color={GENESIS_COLORS.success} />
          <Text style={{ color: '#FFFFFF', fontSize: 22, fontFamily: 'InterBold' }}>Check-in Complete</Text>
          <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 14, fontFamily: 'Inter', textAlign: 'center' }}>
            GENESIS will use this data to optimize your training and recovery today.
          </Text>
          <Pressable onPress={() => router.back()}>
            <LinearGradient
              colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center' }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'JetBrainsMonoSemiBold' }}>DONE</Text>
            </LinearGradient>
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Pressable
              onPress={() => router.back()}
              style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)' }}
            >
              <X size={20} color="#FFFFFF" />
            </Pressable>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: 'InterBold' }}>Daily Check-in</Text>
            <View style={{ height: 40, width: 40 }} />
          </View>

          {/* Mood */}
          <GlassCard shine className="gap-3">
            <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1 }}>
              HOW ARE YOU FEELING?
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {MOODS.map((m) => {
                const Icon = m.icon;
                const selected = mood === m.id;
                return (
                  <Pressable key={m.id} onPress={() => setMood(m.id)} style={{ alignItems: 'center', gap: 4 }}>
                    <View
                      style={{
                        height: 48,
                        width: 48,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 24,
                        backgroundColor: selected ? `${m.color}30` : 'rgba(255,255,255,0.04)',
                        borderWidth: selected ? 1.5 : 0,
                        borderColor: selected ? m.color : 'transparent',
                      }}
                    >
                      <Icon size={20} color={selected ? m.color : GENESIS_COLORS.textMuted} />
                    </View>
                    <Text style={{ color: selected ? '#FFFFFF' : GENESIS_COLORS.textMuted, fontSize: 10, fontFamily: 'Inter' }}>
                      {m.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Sleep */}
          <GlassCard shine className="gap-3">
            <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1 }}>
              SLEEP LAST NIGHT
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {SLEEP_OPTIONS.map((s) => {
                const selected = sleep === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => setSleep(s)}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      borderRadius: 10,
                      paddingVertical: 8,
                      backgroundColor: selected ? GENESIS_COLORS.primary + '30' : 'rgba(255,255,255,0.04)',
                      borderWidth: selected ? 1 : 0.5,
                      borderColor: selected ? GENESIS_COLORS.primary : GENESIS_COLORS.borderSubtle,
                    }}
                  >
                    <Text style={{ color: selected ? '#FFFFFF' : GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                      {s}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Energy Level */}
          <GlassCard shine className="gap-3">
            <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1 }}>
              ENERGY LEVEL
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 }}>
              {ENERGY_LEVELS.map((lvl) => {
                const selected = energy >= lvl;
                return (
                  <Pressable key={lvl} onPress={() => setEnergy(lvl)}>
                    <View
                      style={{
                        height: 40,
                        width: 40,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 20,
                        backgroundColor: selected ? GENESIS_COLORS.success + '40' : 'rgba(255,255,255,0.04)',
                        borderWidth: selected ? 1 : 0,
                        borderColor: selected ? GENESIS_COLORS.success : 'transparent',
                      }}
                    >
                      <Zap size={16} color={selected ? GENESIS_COLORS.success : GENESIS_COLORS.textMuted} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Text style={{ textAlign: 'center', color: GENESIS_COLORS.textMuted, fontSize: 11, fontFamily: 'Inter' }}>
              {energy === 0 ? 'Tap to rate' : `${energy}/5`}
            </Text>
          </GlassCard>

          {/* Soreness */}
          <GlassCard shine className="gap-3">
            <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1 }}>
              SORENESS / PAIN (OPTIONAL)
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {['None', 'Shoulders', 'Back', 'Knees', 'Wrists', 'Full body'].map((area) => {
                const selected = soreness === area;
                return (
                  <Pressable
                    key={area}
                    onPress={() => setSoreness(selected ? '' : area)}
                    style={{
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      backgroundColor: selected ? GENESIS_COLORS.error + '20' : 'rgba(255,255,255,0.04)',
                      borderWidth: selected ? 1 : 0.5,
                      borderColor: selected ? GENESIS_COLORS.error : GENESIS_COLORS.borderSubtle,
                    }}
                  >
                    <Text style={{ color: selected ? GENESIS_COLORS.error : GENESIS_COLORS.textTertiary, fontSize: 12, fontFamily: 'Inter' }}>
                      {area}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Notes */}
          <GlassCard shine className="gap-2">
            <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1 }}>
              NOTES (OPTIONAL)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything GENESIS should know today..."
              placeholderTextColor={GENESIS_COLORS.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: GENESIS_COLORS.borderSubtle,
                backgroundColor: 'rgba(255,255,255,0.04)',
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: '#FFFFFF',
                fontFamily: 'Inter',
                fontSize: 13,
                minHeight: 80,
              }}
            />
          </GlassCard>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={{ opacity: canSubmit ? 1 : 0.4 }}
          >
            <LinearGradient
              colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                shadowColor: GENESIS_COLORS.primary,
                shadowOpacity: 0.4,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'JetBrainsMonoSemiBold' }}>
                SUBMIT CHECK-IN
              </Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
