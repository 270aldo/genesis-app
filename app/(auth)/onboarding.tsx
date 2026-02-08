import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Target, Dumbbell, Timer, Ruler, ChevronRight } from 'lucide-react-native';
import { GlassCard, ProgressBar } from '../../components/ui';

type Step = 'goal' | 'experience' | 'schedule' | 'body' | 'review';

const STEPS: Step[] = ['goal', 'experience', 'schedule', 'body', 'review'];
const STEP_LABELS: Record<Step, string> = {
  goal: 'Your Goal',
  experience: 'Experience Level',
  schedule: 'Training Schedule',
  body: 'Body Metrics',
  review: 'Review',
};

const GOALS = [
  { id: 'strength', label: 'Build Strength', icon: Dumbbell, color: '#6c3bff' },
  { id: 'endurance', label: 'Improve Endurance', icon: Timer, color: '#22ff73' },
  { id: 'aesthetics', label: 'Aesthetics', icon: Ruler, color: '#38bdf8' },
  { id: 'longevity', label: 'Longevity', icon: Target, color: '#F97316' },
];

const LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'Less than 1 year training' },
  { id: 'intermediate', label: 'Intermediate', desc: '1-3 years consistent training' },
  { id: 'advanced', label: 'Advanced', desc: '3+ years consistent training' },
];

const SCHEDULES = [
  { id: '3', label: '3 days/week', desc: 'Full body focus' },
  { id: '4', label: '4 days/week', desc: 'Upper/Lower split' },
  { id: '5', label: '5 days/week', desc: 'Push/Pull/Legs' },
  { id: '6', label: '6 days/week', desc: 'PPL x2' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('');
  const [schedule, setSchedule] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');

  const currentStep = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const canAdvance = () => {
    switch (currentStep) {
      case 'goal':
        return goal !== '';
      case 'experience':
        return level !== '';
      case 'schedule':
        return schedule !== '';
      case 'body':
        return weight !== '' && height !== '' && age !== '';
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      // TODO: Save profile to Supabase
      router.replace('/(tabs)/home');
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
    else router.back();
  };

  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 40,
            gap: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={handleBack}
              className="h-10 w-10 items-center justify-center rounded-full bg-[#FFFFFF0A]"
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </Pressable>
            <View className="flex-1">
              <Text className="font-jetbrains-medium text-[11px] tracking-[1px] text-[#827a89]">
                STEP {stepIndex + 1} OF {STEPS.length}
              </Text>
              <Text className="font-inter-bold text-[18px] text-white">
                {STEP_LABELS[currentStep]}
              </Text>
            </View>
          </View>

          <ProgressBar progress={progress} gradient />

          {/* Step: Goal */}
          {currentStep === 'goal' && (
            <View className="gap-3">
              {GOALS.map((g) => {
                const Icon = g.icon;
                const selected = goal === g.id;
                return (
                  <Pressable key={g.id} onPress={() => setGoal(g.id)}>
                    <GlassCard
                      className={`flex-row items-center gap-4 ${selected ? 'border-[#b39aff]' : ''}`}
                      shadow={selected ? 'primary' : undefined}
                    >
                      <View
                        className="h-10 w-10 items-center justify-center rounded-[12px]"
                        style={{ backgroundColor: `${g.color}20` }}
                      >
                        <Icon size={20} color={g.color} />
                      </View>
                      <Text className="flex-1 font-inter-bold text-[15px] text-white">{g.label}</Text>
                      {selected && <View className="h-3 w-3 rounded-full bg-[#b39aff]" />}
                    </GlassCard>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Step: Experience */}
          {currentStep === 'experience' && (
            <View className="gap-3">
              {LEVELS.map((l) => {
                const selected = level === l.id;
                return (
                  <Pressable key={l.id} onPress={() => setLevel(l.id)}>
                    <GlassCard
                      className={selected ? 'border-[#b39aff]' : ''}
                      shadow={selected ? 'primary' : undefined}
                    >
                      <Text className="font-inter-bold text-[15px] text-white">{l.label}</Text>
                      <Text className="font-inter text-[13px] text-[#827a89]">{l.desc}</Text>
                    </GlassCard>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Step: Schedule */}
          {currentStep === 'schedule' && (
            <View className="gap-3">
              {SCHEDULES.map((s) => {
                const selected = schedule === s.id;
                return (
                  <Pressable key={s.id} onPress={() => setSchedule(s.id)}>
                    <GlassCard
                      className={selected ? 'border-[#b39aff]' : ''}
                      shadow={selected ? 'primary' : undefined}
                    >
                      <Text className="font-inter-bold text-[15px] text-white">{s.label}</Text>
                      <Text className="font-inter text-[13px] text-[#827a89]">{s.desc}</Text>
                    </GlassCard>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Step: Body */}
          {currentStep === 'body' && (
            <GlassCard shine className="gap-4">
              <View className="gap-2">
                <Text className="font-jetbrains-medium text-[11px] tracking-[1px] text-[#827a89]">
                  WEIGHT (KG)
                </Text>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="75"
                  placeholderTextColor="#6b6b7b"
                  keyboardType="numeric"
                  className="rounded-[12px] border border-[#FFFFFF14] bg-[#0D0D2B] px-4 py-3 font-inter text-[14px] text-white"
                />
              </View>
              <View className="gap-2">
                <Text className="font-jetbrains-medium text-[11px] tracking-[1px] text-[#827a89]">
                  HEIGHT (CM)
                </Text>
                <TextInput
                  value={height}
                  onChangeText={setHeight}
                  placeholder="178"
                  placeholderTextColor="#6b6b7b"
                  keyboardType="numeric"
                  className="rounded-[12px] border border-[#FFFFFF14] bg-[#0D0D2B] px-4 py-3 font-inter text-[14px] text-white"
                />
              </View>
              <View className="gap-2">
                <Text className="font-jetbrains-medium text-[11px] tracking-[1px] text-[#827a89]">
                  AGE
                </Text>
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  placeholder="35"
                  placeholderTextColor="#6b6b7b"
                  keyboardType="numeric"
                  className="rounded-[12px] border border-[#FFFFFF14] bg-[#0D0D2B] px-4 py-3 font-inter text-[14px] text-white"
                />
              </View>
            </GlassCard>
          )}

          {/* Step: Review */}
          {currentStep === 'review' && (
            <GlassCard shine className="gap-4">
              <Text className="font-jetbrains-bold text-[13px] text-white">Your Profile</Text>
              <ReviewRow label="Goal" value={GOALS.find((g) => g.id === goal)?.label ?? '—'} />
              <ReviewRow label="Experience" value={LEVELS.find((l) => l.id === level)?.label ?? '—'} />
              <ReviewRow label="Schedule" value={SCHEDULES.find((s) => s.id === schedule)?.label ?? '—'} />
              <ReviewRow label="Weight" value={weight ? `${weight} kg` : '—'} />
              <ReviewRow label="Height" value={height ? `${height} cm` : '—'} />
              <ReviewRow label="Age" value={age ? `${age} years` : '—'} />
            </GlassCard>
          )}

          {/* Next Button */}
          <Pressable
            onPress={handleNext}
            disabled={!canAdvance()}
            style={{ opacity: canAdvance() ? 1 : 0.4 }}
          >
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
              <Text className="font-jetbrains-semibold text-[14px] text-white">
                {currentStep === 'review' ? 'START YOUR JOURNEY' : 'CONTINUE'}
              </Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-[#FFFFFF0A] pb-3">
      <Text className="font-jetbrains-medium text-[11px] text-[#827a89]">{label}</Text>
      <Text className="font-inter-bold text-[13px] text-white">{value}</Text>
    </View>
  );
}
