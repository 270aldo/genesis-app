import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ClipboardCheck, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../ui/GlassCard';
import { GENESIS_COLORS } from '../../../constants/colors';
import { hapticLight, hapticNotificationSuccess } from '../../../utils/haptics';
import type { WidgetPayload } from '../../../types';

type CheckinCategory = 'sleep' | 'energy' | 'mood' | 'stress' | 'soreness';

interface CategoryConfig {
  key: CheckinCategory;
  label: string;
  lowLabel: string;
  highLabel: string;
}

const CATEGORIES: CategoryConfig[] = [
  { key: 'sleep', label: 'Sueño', lowLabel: 'Mal', highLabel: 'Excelente' },
  { key: 'energy', label: 'Energía', lowLabel: 'Baja', highLabel: 'Alta' },
  { key: 'mood', label: 'Ánimo', lowLabel: 'Bajo', highLabel: 'Alto' },
  { key: 'stress', label: 'Estrés', lowLabel: 'Alto', highLabel: 'Bajo' },
  { key: 'soreness', label: 'Dolor muscular', lowLabel: 'Mucho', highLabel: 'Nada' },
];

// Scale colors from poor (1) to great (5)
const SCALE_COLORS = [
  '#FF6B6B', // 1 - poor / red
  '#F97316', // 2 - below average / orange
  '#FFD93D', // 3 - average / yellow
  '#00D68F', // 4 - good / teal-green
  '#00F5AA', // 5 - great / mint-green
];

type Ratings = Record<CheckinCategory, number | null>;

export function QuickCheckinWidget({ widget }: { widget: WidgetPayload }) {
  const [ratings, setRatings] = useState<Ratings>({
    sleep: null,
    energy: null,
    mood: null,
    stress: null,
    soreness: null,
  });
  const [submitted, setSubmitted] = useState(false);

  const setRating = useCallback((category: CheckinCategory, value: number) => {
    hapticLight();
    setRatings((prev) => ({ ...prev, [category]: value }));
  }, []);

  const allRated = Object.values(ratings).every((v) => v !== null);

  const handleSubmit = useCallback(() => {
    hapticNotificationSuccess();
    setSubmitted(true);
    // In a real implementation this would persist via BFF/Supabase
  }, []);

  const handleReset = useCallback(() => {
    hapticLight();
    setSubmitted(false);
    setRatings({ sleep: null, energy: null, mood: null, stress: null, soreness: null });
  }, []);

  return (
    <GlassCard>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <ClipboardCheck size={18} color={GENESIS_COLORS.primary} />
        <Text style={{ color: GENESIS_COLORS.textPrimary, fontSize: 16, fontWeight: '700', flex: 1 }}>
          {widget.title ?? 'Check-in rapido'}
        </Text>
      </View>

      {submitted ? (
        // Submitted confirmation
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
            Check-in enviado
          </Text>
          <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, textAlign: 'center' }}>
            GENESIS ha registrado tu estado.
          </Text>
          <Pressable onPress={handleReset} style={{ marginTop: 16 }}>
            <Text style={{ color: GENESIS_COLORS.primary, fontSize: 13, fontWeight: '600' }}>
              Hacer otro check-in
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Rating rows */}
          <View style={{ gap: 14, marginBottom: 20 }}>
            {CATEGORIES.map((cat) => (
              <View key={cat.key}>
                {/* Category label + scale endpoints */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: GENESIS_COLORS.textPrimary, fontSize: 13, fontWeight: '600' }}>
                    {cat.label}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 10 }}>{cat.lowLabel}</Text>
                    <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 10 }}>{cat.highLabel}</Text>
                  </View>
                </View>
                {/* 5-point scale */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
                  {[1, 2, 3, 4, 5].map((value) => {
                    const isSelected = ratings[cat.key] === value;
                    const scaleColor = SCALE_COLORS[value - 1];
                    return (
                      <Pressable
                        key={value}
                        onPress={() => setRating(cat.key, value)}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: isSelected ? scaleColor : 'transparent',
                          borderWidth: 2,
                          borderColor: isSelected ? scaleColor : GENESIS_COLORS.borderSubtle,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                        accessibilityLabel={`${cat.label} ${value} de 5`}
                      >
                        <Text
                          style={{
                            color: isSelected ? '#000000' : GENESIS_COLORS.textMuted,
                            fontSize: 14,
                            fontFamily: 'JetBrainsMonoBold',
                            fontWeight: '700',
                          }}
                        >
                          {value}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          {/* Submit button */}
          <Pressable
            onPress={handleSubmit}
            disabled={!allRated}
            style={{ opacity: allRated ? 1 : 0.4 }}
          >
            <LinearGradient
              colors={[GENESIS_COLORS.primaryLight, GENESIS_COLORS.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                Enviar check-in
              </Text>
            </LinearGradient>
          </Pressable>
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
