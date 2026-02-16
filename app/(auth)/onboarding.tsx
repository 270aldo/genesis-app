import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Dumbbell, Timer, Ruler, Target, Zap, Calendar, User, ChevronRight } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { useAuth } from '../../hooks';
import { generateDefaultSeason } from '../../services/seasonGenerator';
import { StepIndicator, GenesisGuide, SelectionCard, SchedulePill } from '../../components/onboarding';
import { hapticMedium } from '../../utils/haptics';

type Step = 'goal' | 'experience' | 'schedule' | 'body' | 'review';

const STEPS: Step[] = ['goal', 'experience', 'schedule', 'body', 'review'];

const GOALS = [
  { id: 'strength', label: 'Fuerza', subtitle: 'Construcción de fuerza máxima y potencia', icon: Dumbbell, color: GENESIS_COLORS.primary },
  { id: 'endurance', label: 'Resistencia', subtitle: 'Capacidad cardiovascular y muscular', icon: Timer, color: GENESIS_COLORS.success },
  { id: 'aesthetics', label: 'Estética', subtitle: 'Composición corporal y definición', icon: Ruler, color: '#00E5FF' },
  { id: 'longevity', label: 'Longevidad', subtitle: 'Salud funcional a largo plazo', icon: Target, color: GENESIS_COLORS.warning },
];

const LEVELS = [
  { id: 'beginner', label: 'Principiante', subtitle: 'Menos de 1 año entrenando' },
  { id: 'intermediate', label: 'Intermedio', subtitle: '1-3 años de entrenamiento consistente' },
  { id: 'advanced', label: 'Avanzado', subtitle: '3+ años de entrenamiento consistente' },
];

const SCHEDULES = [
  { value: '3', label: '3 días' },
  { value: '4', label: '4 días' },
  { value: '5', label: '5 días' },
  { value: '6', label: '6 días' },
];

const GUIDE_MESSAGES: Record<Step, string> = {
  goal: '¿Cuál es tu norte? Esto define cómo diseño tu temporada de 12 semanas.',
  experience: 'Tu nivel de experiencia define la intensidad y complejidad de tu plan.',
  schedule: '¿Cuántos días puedes dedicar? Consistencia > volumen.',
  body: 'Necesito tus métricas base para personalizar nutrición y cargas.',
  review: 'He diseñado tu temporada personalizada. Esto es lo que te espera.',
};

const PHASE_COLORS = ['#6D00FF', '#00E5FF', '#00F5AA', '#FFD93D'];
const PHASE_NAMES = ['Hipertrofia', 'Fuerza', 'Potencia', 'Deload'];

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
      hapticMedium();
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
        generateDefaultSeason(profileId, goal, schedule, level).catch((err) => {
          console.warn('Season generation failed (non-blocking):', err?.message);
        });
        router.replace('/(screens)/welcome-briefing');
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

  const getButtonLabel = () => {
    if (saving) return 'GUARDANDO...';
    if (currentStep === 'review') return 'COMENZAR MI JOURNEY';
    return 'SIGUIENTE';
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
              <View style={{ flex: 1 }} />
            </View>

            <StepIndicator currentStep={stepIndex} totalSteps={STEPS.length} />
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40, gap: 16 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* GenesisGuide — shown on every step */}
            <GenesisGuide message={GUIDE_MESSAGES[currentStep]} />

            {/* Step 1: Goal */}
            {currentStep === 'goal' && (
              <View style={{ gap: 12 }}>
                {GOALS.map((g) => {
                  const Icon = g.icon;
                  return (
                    <SelectionCard
                      key={g.id}
                      icon={<Icon size={22} color={g.color} />}
                      title={g.label}
                      subtitle={g.subtitle}
                      selected={goal === g.id}
                      onPress={() => setGoal(g.id)}
                    />
                  );
                })}
              </View>
            )}

            {/* Step 2: Experience */}
            {currentStep === 'experience' && (
              <View style={{ gap: 12 }}>
                {LEVELS.map((l) => (
                  <SelectionCard
                    key={l.id}
                    icon={<Zap size={22} color={level === l.id ? GENESIS_COLORS.primary : GENESIS_COLORS.textMuted} />}
                    title={l.label}
                    subtitle={l.subtitle}
                    selected={level === l.id}
                    onPress={() => setLevel(l.id)}
                  />
                ))}
              </View>
            )}

            {/* Step 3: Schedule */}
            {currentStep === 'schedule' && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                {SCHEDULES.map((s) => (
                  <SchedulePill
                    key={s.value}
                    value={s.value}
                    label={s.label}
                    selected={schedule === s.value}
                    onPress={() => setSchedule(s.value)}
                  />
                ))}
              </View>
            )}

            {/* Step 4: Body Metrics */}
            {currentStep === 'body' && (
              <View style={{
                backgroundColor: GENESIS_COLORS.surfaceCard,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: GENESIS_COLORS.borderSubtle,
                padding: 20,
                gap: 18,
              }}>
                {[
                  { key: 'weight', label: 'PESO (KG)', value: weight, setter: setWeight, placeholder: '75' },
                  { key: 'height', label: 'ALTURA (CM)', value: height, setter: setHeight, placeholder: '178' },
                  { key: 'age', label: 'EDAD', value: age, setter: setAge, placeholder: '35' },
                ].map((field) => (
                  <View key={field.key} style={{ gap: 6 }}>
                    <Text style={{
                      color: GENESIS_COLORS.textTertiary,
                      fontSize: 10,
                      fontFamily: 'JetBrainsMonoMedium',
                      letterSpacing: 1.5,
                      textTransform: 'uppercase',
                    }}>
                      {field.label}
                    </Text>
                    <TextInput
                      value={field.value}
                      onChangeText={field.setter}
                      onFocus={() => setFocused(field.key)}
                      onBlur={() => setFocused(null)}
                      placeholder={field.placeholder}
                      placeholderTextColor={GENESIS_COLORS.textMuted}
                      keyboardType="numeric"
                      style={{
                        borderWidth: 1,
                        borderColor: focused === field.key ? GENESIS_COLORS.borderActive : GENESIS_COLORS.borderSubtle,
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
                ))}
              </View>
            )}

            {/* Step 5: Review — "Tu Plan Está Listo" */}
            {currentStep === 'review' && (
              <View style={{ gap: 20 }}>
                {/* Heading */}
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 24,
                  fontFamily: 'InterBold',
                  textAlign: 'center',
                }}>
                  Tu plan está listo
                </Text>

                {/* Season Preview Card */}
                <View style={{
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: 'rgba(109,0,255,0.3)',
                  backgroundColor: GENESIS_COLORS.surfaceCard,
                  padding: 20,
                  gap: 16,
                }}>
                  <Text style={{
                    color: GENESIS_COLORS.primary,
                    fontSize: 10,
                    fontFamily: 'JetBrainsMonoBold',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                  }}>
                    TEMPORADA 12 SEMANAS
                  </Text>

                  {/* Phase bars */}
                  <View style={{ flexDirection: 'row', gap: 4, height: 8, borderRadius: 4, overflow: 'hidden' }}>
                    {PHASE_COLORS.map((color, i) => (
                      <View
                        key={i}
                        style={{
                          flex: i === 3 ? 0.5 : 1,
                          backgroundColor: color,
                          borderRadius: 4,
                        }}
                      />
                    ))}
                  </View>

                  {/* Phase labels */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {PHASE_NAMES.map((name, i) => (
                      <Text key={i} style={{
                        color: PHASE_COLORS[i],
                        fontSize: 10,
                        fontFamily: 'JetBrainsMonoMedium',
                        letterSpacing: 0.5,
                      }}>
                        {name}
                      </Text>
                    ))}
                  </View>
                </View>

                {/* 3-metric row */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {[
                    { value: `${schedule || '4'}`, label: 'días/semana' },
                    { value: '4', label: 'fases' },
                    { value: '~60', label: 'ejercicios' },
                  ].map((metric, i) => (
                    <View key={i} style={{
                      flex: 1,
                      backgroundColor: GENESIS_COLORS.surfaceCard,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: GENESIS_COLORS.borderSubtle,
                      padding: 14,
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <Text style={{
                        color: '#FFFFFF',
                        fontSize: 22,
                        fontFamily: 'InterBold',
                      }}>
                        {metric.value}
                      </Text>
                      <Text style={{
                        color: GENESIS_COLORS.textTertiary,
                        fontSize: 10,
                        fontFamily: 'JetBrainsMonoMedium',
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                      }}>
                        {metric.label}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Profile summary mini-card */}
                <View style={{
                  backgroundColor: GENESIS_COLORS.surfaceCard,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: GENESIS_COLORS.borderSubtle,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(109,0,255,0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <User size={20} color={GENESIS_COLORS.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>
                      {GOALS.find((g) => g.id === goal)?.label ?? '—'} · {LEVELS.find((l) => l.id === level)?.label ?? '—'}
                    </Text>
                    <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter' }}>
                      {weight ? `${weight} kg` : '—'} · {height ? `${height} cm` : '—'} · {age ? `${age} años` : '—'}
                    </Text>
                  </View>
                </View>
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

          {/* CTA Button — fixed at bottom */}
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
                  shadowOpacity: currentStep === 'review' ? 0.6 : 0.4,
                  shadowRadius: currentStep === 'review' ? 20 : 12,
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
                  {getButtonLabel()}
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
