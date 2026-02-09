import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Target, Dumbbell, Timer, Ruler, ChevronRight, Check } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { useAuth } from '../../hooks';

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
  { id: 'strength', label: 'Build Strength', icon: Dumbbell, color: GENESIS_COLORS.primary },
  { id: 'endurance', label: 'Improve Endurance', icon: Timer, color: GENESIS_COLORS.success },
  { id: 'aesthetics', label: 'Aesthetics', icon: Ruler, color: GENESIS_COLORS.cyan },
  { id: 'longevity', label: 'Longevity', icon: Target, color: GENESIS_COLORS.warning },
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
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { upsertProfile, user } = useAuth();

  const [stepIndex, setStepIndex] = useState(0);
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('');
  const [schedule, setSchedule] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const currentStep = STEPS[stepIndex];
  const progress = (stepIndex + 1) / STEPS.length;

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

  const handleNext = async () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setSaving(true);
      setSaveError('');
      try {
        const profileId = userId ?? user?.id;
        if (!profileId) throw new Error('No user ID available');
        await upsertProfile(profileId, {
          full_name: user?.name ?? '',
          age: parseInt(age, 10) || null,
          weight_kg: parseFloat(weight) || null,
          height_cm: parseFloat(height) || null,
          goal: goal || null,
          experience_level: level || null,
        });
        router.replace('/(tabs)/home');
      } catch (err: any) {
        setSaveError(err?.message ?? 'Failed to save profile');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
    else router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <LinearGradient
        colors={[GENESIS_COLORS.bgGradientStart, '#000000']}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 12, gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Pressable
                onPress={handleBack}
                hitSlop={12}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowLeft size={20} color="#FFFFFF" />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: GENESIS_COLORS.textTertiary,
                  fontSize: 10,
                  fontFamily: 'JetBrainsMonoMedium',
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                }}>
                  STEP {stepIndex + 1} OF {STEPS.length}
                </Text>
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 20,
                  fontFamily: 'InterBold',
                  marginTop: 2,
                }}>
                  {STEP_LABELS[currentStep]}
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={{
              height: 3,
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 2,
              overflow: 'hidden',
            }}>
              <LinearGradient
                colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: '100%',
                  width: `${progress * 100}%`,
                  borderRadius: 2,
                }}
              />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, gap: 12 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Step: Goal */}
            {currentStep === 'goal' && GOALS.map((g) => {
              const Icon = g.icon;
              const selected = goal === g.id;
              return (
                <Pressable key={g.id} onPress={() => setGoal(g.id)}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    backgroundColor: selected ? GENESIS_COLORS.primary + '12' : GENESIS_COLORS.surfaceCard,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: selected ? GENESIS_COLORS.borderActive : GENESIS_COLORS.borderSubtle,
                    padding: 16,
                    ...(selected ? {
                      shadowColor: GENESIS_COLORS.primary,
                      shadowOpacity: 0.25,
                      shadowRadius: 10,
                      shadowOffset: { width: 0, height: 0 },
                      elevation: 4,
                    } : {}),
                  }}>
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: g.color + '18',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icon size={22} color={g.color} />
                    </View>
                    <Text style={{
                      flex: 1,
                      color: '#FFFFFF',
                      fontSize: 15,
                      fontFamily: 'InterBold',
                    }}>
                      {g.label}
                    </Text>
                    {selected && (
                      <View style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: GENESIS_COLORS.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}

            {/* Step: Experience */}
            {currentStep === 'experience' && LEVELS.map((l) => {
              const selected = level === l.id;
              return (
                <Pressable key={l.id} onPress={() => setLevel(l.id)}>
                  <View style={{
                    backgroundColor: selected ? GENESIS_COLORS.primary + '12' : GENESIS_COLORS.surfaceCard,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: selected ? GENESIS_COLORS.borderActive : GENESIS_COLORS.borderSubtle,
                    padding: 16,
                    gap: 4,
                    ...(selected ? {
                      shadowColor: GENESIS_COLORS.primary,
                      shadowOpacity: 0.25,
                      shadowRadius: 10,
                      shadowOffset: { width: 0, height: 0 },
                      elevation: 4,
                    } : {}),
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{
                        color: '#FFFFFF',
                        fontSize: 15,
                        fontFamily: 'InterBold',
                      }}>
                        {l.label}
                      </Text>
                      {selected && (
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: GENESIS_COLORS.primary,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      )}
                    </View>
                    <Text style={{
                      color: GENESIS_COLORS.textSecondary,
                      fontSize: 13,
                      fontFamily: 'Inter',
                    }}>
                      {l.desc}
                    </Text>
                  </View>
                </Pressable>
              );
            })}

            {/* Step: Schedule */}
            {currentStep === 'schedule' && SCHEDULES.map((s) => {
              const selected = schedule === s.id;
              return (
                <Pressable key={s.id} onPress={() => setSchedule(s.id)}>
                  <View style={{
                    backgroundColor: selected ? GENESIS_COLORS.primary + '12' : GENESIS_COLORS.surfaceCard,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: selected ? GENESIS_COLORS.borderActive : GENESIS_COLORS.borderSubtle,
                    padding: 16,
                    gap: 4,
                    ...(selected ? {
                      shadowColor: GENESIS_COLORS.primary,
                      shadowOpacity: 0.25,
                      shadowRadius: 10,
                      shadowOffset: { width: 0, height: 0 },
                      elevation: 4,
                    } : {}),
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{
                        color: '#FFFFFF',
                        fontSize: 15,
                        fontFamily: 'InterBold',
                      }}>
                        {s.label}
                      </Text>
                      {selected && (
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: GENESIS_COLORS.primary,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      )}
                    </View>
                    <Text style={{
                      color: GENESIS_COLORS.textSecondary,
                      fontSize: 13,
                      fontFamily: 'Inter',
                    }}>
                      {s.desc}
                    </Text>
                  </View>
                </Pressable>
              );
            })}

            {/* Step: Body */}
            {currentStep === 'body' && (
              <View style={{
                backgroundColor: GENESIS_COLORS.surfaceCard,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: GENESIS_COLORS.borderSubtle,
                padding: 20,
                gap: 18,
              }}>
                {/* Weight */}
                <View style={{ gap: 6 }}>
                  <Text style={{
                    color: GENESIS_COLORS.textTertiary,
                    fontSize: 10,
                    fontFamily: 'JetBrainsMonoMedium',
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                  }}>
                    Weight (kg)
                  </Text>
                  <TextInput
                    value={weight}
                    onChangeText={setWeight}
                    onFocus={() => setFocused('weight')}
                    onBlur={() => setFocused(null)}
                    placeholder="75"
                    placeholderTextColor={GENESIS_COLORS.textMuted}
                    keyboardType="numeric"
                    style={{
                      borderWidth: 1,
                      borderColor: focused === 'weight' ? GENESIS_COLORS.borderActive : GENESIS_COLORS.borderSubtle,
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      color: '#FFFFFF',
                      fontFamily: 'Inter',
                      fontSize: 15,
                      backgroundColor: 'rgba(255,255,255,0.04)',
                    }}
                  />
                </View>

                {/* Height */}
                <View style={{ gap: 6 }}>
                  <Text style={{
                    color: GENESIS_COLORS.textTertiary,
                    fontSize: 10,
                    fontFamily: 'JetBrainsMonoMedium',
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                  }}>
                    Height (cm)
                  </Text>
                  <TextInput
                    value={height}
                    onChangeText={setHeight}
                    onFocus={() => setFocused('height')}
                    onBlur={() => setFocused(null)}
                    placeholder="178"
                    placeholderTextColor={GENESIS_COLORS.textMuted}
                    keyboardType="numeric"
                    style={{
                      borderWidth: 1,
                      borderColor: focused === 'height' ? GENESIS_COLORS.borderActive : GENESIS_COLORS.borderSubtle,
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      color: '#FFFFFF',
                      fontFamily: 'Inter',
                      fontSize: 15,
                      backgroundColor: 'rgba(255,255,255,0.04)',
                    }}
                  />
                </View>

                {/* Age */}
                <View style={{ gap: 6 }}>
                  <Text style={{
                    color: GENESIS_COLORS.textTertiary,
                    fontSize: 10,
                    fontFamily: 'JetBrainsMonoMedium',
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                  }}>
                    Age
                  </Text>
                  <TextInput
                    value={age}
                    onChangeText={setAge}
                    onFocus={() => setFocused('age')}
                    onBlur={() => setFocused(null)}
                    placeholder="35"
                    placeholderTextColor={GENESIS_COLORS.textMuted}
                    keyboardType="numeric"
                    style={{
                      borderWidth: 1,
                      borderColor: focused === 'age' ? GENESIS_COLORS.borderActive : GENESIS_COLORS.borderSubtle,
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      color: '#FFFFFF',
                      fontFamily: 'Inter',
                      fontSize: 15,
                      backgroundColor: 'rgba(255,255,255,0.04)',
                    }}
                  />
                </View>
              </View>
            )}

            {/* Step: Review */}
            {currentStep === 'review' && (
              <View style={{
                backgroundColor: GENESIS_COLORS.surfaceCard,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: GENESIS_COLORS.borderSubtle,
                padding: 20,
                gap: 4,
              }}>
                <Text style={{
                  color: GENESIS_COLORS.primary,
                  fontSize: 10,
                  fontFamily: 'JetBrainsMonoBold',
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}>
                  Your Profile
                </Text>
                <ReviewRow label="Goal" value={GOALS.find((g) => g.id === goal)?.label ?? '—'} />
                <ReviewRow label="Experience" value={LEVELS.find((l) => l.id === level)?.label ?? '—'} />
                <ReviewRow label="Schedule" value={SCHEDULES.find((s) => s.id === schedule)?.label ?? '—'} />
                <ReviewRow label="Weight" value={weight ? `${weight} kg` : '—'} />
                <ReviewRow label="Height" value={height ? `${height} cm` : '—'} />
                <ReviewRow label="Age" value={age ? `${age} years` : '—'} last />
              </View>
            )}

            {/* Save Error */}
            {saveError ? (
              <View style={{
                backgroundColor: GENESIS_COLORS.error + '15',
                borderRadius: 10,
                padding: 12,
                borderWidth: 1,
                borderColor: GENESIS_COLORS.error + '30',
              }}>
                <Text style={{ color: GENESIS_COLORS.error, fontSize: 12, fontFamily: 'Inter' }}>{saveError}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Next Button — fixed at bottom */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 }}>
            <Pressable
              onPress={handleNext}
              disabled={!canAdvance() || saving}
              style={{ opacity: canAdvance() && !saving ? 1 : 0.4 }}
            >
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
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontFamily: 'JetBrainsMonoSemiBold',
                  letterSpacing: 1,
                }}>
                  {saving
                    ? 'SAVING...'
                    : currentStep === 'review'
                      ? 'START YOUR JOURNEY'
                      : 'CONTINUE'}
                </Text>
                {!saving && <ChevronRight size={18} color="#FFFFFF" />}
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function ReviewRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: GENESIS_COLORS.borderSubtle,
    }}>
      <Text style={{
        color: GENESIS_COLORS.textTertiary,
        fontSize: 11,
        fontFamily: 'JetBrainsMonoMedium',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
      }}>
        {label}
      </Text>
      <Text style={{
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'InterBold',
      }}>
        {value}
      </Text>
    </View>
  );
}
