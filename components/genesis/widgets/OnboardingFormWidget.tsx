import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { UserCheck, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../ui/GlassCard';
import { GENESIS_COLORS } from '../../../constants/colors';
import { hapticLight, hapticNotificationSuccess } from '../../../utils/haptics';
import type { WidgetPayload } from '../../../types';

const TOTAL_STEPS = 3;

interface StepConfig {
  title: string;
  subtitle: string;
  options: string[];
}

const STEPS: StepConfig[] = [
  {
    title: 'Nivel de experiencia',
    subtitle: 'Selecciona tu nivel actual de entrenamiento',
    options: ['Principiante', 'Intermedio', 'Avanzado'],
  },
  {
    title: 'Objetivo principal',
    subtitle: 'Que quieres lograr con tu entrenamiento?',
    options: ['Fuerza', 'Hipertrofia', 'Perdida de grasa', 'Salud general'],
  },
  {
    title: 'Dias por semana',
    subtitle: 'Cuantos dias puedes entrenar?',
    options: ['3', '4', '5', '6'],
  },
];

export function OnboardingFormWidget({ widget }: { widget: WidgetPayload }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<(string | null)[]>(
    Array.from({ length: TOTAL_STEPS }, () => null),
  );
  const [completed, setCompleted] = useState(false);

  const step = STEPS[currentStep];
  const currentSelection = selections[currentStep];
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  const selectOption = useCallback(
    (option: string) => {
      hapticLight();
      setSelections((prev) => {
        const next = [...prev];
        next[currentStep] = option;
        return next;
      });
    },
    [currentStep],
  );

  const handleContinue = useCallback(() => {
    hapticLight();
    if (isLastStep) {
      hapticNotificationSuccess();
      setCompleted(true);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep]);

  const handleBack = useCallback(() => {
    hapticLight();
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const handleReset = useCallback(() => {
    hapticLight();
    setCompleted(false);
    setCurrentStep(0);
    setSelections(Array.from({ length: TOTAL_STEPS }, () => null));
  }, []);

  return (
    <GlassCard>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <UserCheck size={18} color={GENESIS_COLORS.primary} />
        <Text style={{ color: GENESIS_COLORS.textPrimary, fontSize: 16, fontWeight: '700', flex: 1 }}>
          {widget.title ?? 'Configuracion inicial'}
        </Text>
      </View>

      {completed ? (
        // Completed state
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: `${GENESIS_COLORS.success}22`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Check size={24} color={GENESIS_COLORS.success} />
          </View>
          <Text style={{ color: GENESIS_COLORS.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 4 }}>
            Configuracion completada
          </Text>
          <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, textAlign: 'center', marginBottom: 8 }}>
            GENESIS ya tiene lo necesario para personalizar tu plan.
          </Text>

          {/* Summary of selections */}
          <View
            style={{
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              padding: 14,
              gap: 6,
              marginTop: 8,
            }}
          >
            {STEPS.map((s, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 11 }}>{s.title}</Text>
                <Text style={{ color: GENESIS_COLORS.textPrimary, fontSize: 11, fontWeight: '600' }}>
                  {selections[i]}
                </Text>
              </View>
            ))}
          </View>

          <Pressable onPress={handleReset} style={{ marginTop: 16 }}>
            <Text style={{ color: GENESIS_COLORS.primary, fontSize: 13, fontWeight: '600' }}>
              Volver a configurar
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Progress dots */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === currentStep ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    i < currentStep
                      ? GENESIS_COLORS.success
                      : i === currentStep
                        ? GENESIS_COLORS.primary
                        : GENESIS_COLORS.borderSubtle,
                }}
              />
            ))}
          </View>

          {/* Step content */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: GENESIS_COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 4 }}>
              {step.title}
            </Text>
            <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, marginBottom: 16 }}>
              {step.subtitle}
            </Text>

            {/* Option pills */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {step.options.map((option) => {
                const isSelected = currentSelection === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => selectOption(option)}
                    style={{
                      backgroundColor: isSelected ? GENESIS_COLORS.primary : 'rgba(255,255,255,0.06)',
                      borderRadius: 12,
                      paddingHorizontal: 18,
                      paddingVertical: 10,
                      borderWidth: 1,
                      borderColor: isSelected ? GENESIS_COLORS.primary : GENESIS_COLORS.borderSubtle,
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={{
                        color: isSelected ? '#FFFFFF' : GENESIS_COLORS.textSecondary,
                        fontSize: 14,
                        fontWeight: isSelected ? '700' : '400',
                      }}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Navigation buttons */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {currentStep > 0 && (
              <Pressable onPress={handleBack} style={{ flex: 1 }}>
                <View
                  style={{
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderWidth: 1,
                    borderColor: GENESIS_COLORS.borderSubtle,
                  }}
                >
                  <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 14, fontWeight: '600' }}>
                    Atras
                  </Text>
                </View>
              </Pressable>
            )}
            <Pressable
              onPress={handleContinue}
              disabled={currentSelection === null}
              style={{ flex: 1, opacity: currentSelection === null ? 0.4 : 1 }}
            >
              <LinearGradient
                colors={[GENESIS_COLORS.primaryLight, GENESIS_COLORS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                  {isLastStep ? 'Completar' : 'Continuar'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </>
      )}

      {/* GENESIS badge */}
      <Text
        style={{
          color: GENESIS_COLORS.primary,
          fontSize: 9,
          fontFamily: 'JetBrainsMonoMedium',
          marginTop: 12,
          opacity: 0.7,
        }}
      >
        GENERATED BY GENESIS
      </Text>
    </GlassCard>
  );
}
