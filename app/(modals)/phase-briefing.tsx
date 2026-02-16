import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, SlideInUp } from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Sparkles, Target, TrendingUp, Zap, Leaf } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlassCard } from '../../components/ui';
import { GENESIS_COLORS, SEASON_PHASE_COLORS } from '../../constants/colors';
import { useSeasonStore } from '../../stores';
import { PHASE_CONFIG } from '../../data';
import type { PhaseType } from '../../types';
import { hapticHeavy } from '../../utils/haptics';

const PHASE_ICONS: Record<string, typeof Target> = {
  hypertrophy: TrendingUp,
  strength: Target,
  power: Zap,
  deload: Leaf,
};

const PHASE_DATA: Record<string, {
  title: string;
  subtitle: string;
  objectives: string[];
  changes: string;
  genesisMessage: string;
}> = {
  hypertrophy: {
    title: 'Fase de Hipertrofia',
    subtitle: 'Construye masa muscular con volumen progresivo',
    objectives: [
      'Maximizar el tiempo bajo tensión en cada serie',
      'Alcanzar volumen semanal óptimo por grupo muscular',
      'Mantener RPE entre 7-8 en ejercicios principales',
      'Priorizar nutrición con superávit calórico moderado',
    ],
    changes: 'Series de 8-12 reps con descansos de 60-90s. Mayor volumen total por sesión. Enfoque en conexión mente-músculo y tempo controlado.',
    genesisMessage: 'Esta fase es la base de todo. Cada rep cuenta, cada serie construye. Confía en el proceso — el crecimiento viene de la consistencia, no de la intensidad extrema.',
  },
  strength: {
    title: 'Fase de Fuerza',
    subtitle: 'Maximiza tu potencial de fuerza',
    objectives: [
      'Incrementar cargas progresivamente en movimientos compuestos',
      'Dominar la técnica con pesos más cercanos al máximo',
      'Optimizar recuperación entre sesiones pesadas',
      'Adaptar nutrición para soportar demandas nerviosas',
    ],
    changes: 'Series de 3-6 reps con descansos de 3-5 min. Menor volumen, mayor intensidad. Foco en los "big lifts" con accesorios de soporte.',
    genesisMessage: 'Tu sistema nervioso es la clave ahora. Cada rep pesada enseña a tu cuerpo a reclutar más fibras. Respeta los descansos — la fuerza se construye en la recuperación.',
  },
  power: {
    title: 'Fase de Potencia',
    subtitle: 'Convierte fuerza en explosividad',
    objectives: [
      'Desarrollar velocidad de ejecución en movimientos principales',
      'Integrar trabajo pliométrico y balístico',
      'Mantener base de fuerza con series de mantenimiento',
      'Optimizar timing nutricional para rendimiento',
    ],
    changes: 'Series de 1-5 reps explosivas con descansos completos. Velocidad > peso. Se incorporan movimientos olímpicos adaptados y pliometría.',
    genesisMessage: 'Todo el trabajo previo culmina aquí. Mueve el peso con INTENCIÓN. La potencia es fuerza multiplicada por velocidad — no levantes pesado, levanta RÁPIDO.',
  },
  deload: {
    title: 'Semana de Descarga',
    subtitle: 'Recupera, adapta y prepárate para el siguiente ciclo',
    objectives: [
      'Reducir volumen e intensidad un 40-50%',
      'Permitir recuperación completa del SNC',
      'Trabajar movilidad y técnica',
      'Evaluar progreso y ajustar plan futuro',
    ],
    changes: 'Mismos ejercicios con 50-60% de las cargas habituales. Sin series al fallo. Enfoque en calidad de movimiento y activación muscular.',
    genesisMessage: 'El descanso inteligente es parte del entrenamiento. Tu cuerpo supera-compensa cuando le das espacio. Usa esta semana para volver más fuerte que nunca.',
  },
};

export default function PhaseBriefingScreen() {
  const router = useRouter();
  const { currentPhase } = useSeasonStore();
  const phase = (currentPhase || 'hypertrophy') as PhaseType;
  const phaseConfig = PHASE_CONFIG[phase];
  const phaseData = PHASE_DATA[phase] ?? PHASE_DATA.hypertrophy;
  const phaseColor = SEASON_PHASE_COLORS[phase] ?? GENESIS_COLORS.primary;
  const PhaseIcon = PHASE_ICONS[phase] ?? Target;

  const handleStart = async () => {
    hapticHeavy();
    await AsyncStorage.setItem('genesis_lastSeenPhase', phase);
    router.back();
  };

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </Pressable>

          {/* Phase color bar */}
          <View style={{ height: 4, borderRadius: 2, backgroundColor: phaseColor }} />

          {/* Title */}
          <Animated.View entering={SlideInUp.duration(500)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <PhaseIcon size={24} color={phaseColor} />
              <Text style={{ color: phaseColor, fontSize: 12, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 1.5 }}>
                NUEVA FASE
              </Text>
            </View>
            <Text style={{ color: '#FFFFFF', fontSize: 26, fontFamily: 'InterBold', lineHeight: 32 }}>
              {phaseData.title}
            </Text>
            <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 14, fontFamily: 'Inter', marginTop: 6 }}>
              {phaseData.subtitle}
            </Text>
          </Animated.View>

          {/* Objectives */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <GlassCard shine>
              <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 1, marginBottom: 10 }}>
                OBJETIVOS
              </Text>
              <View style={{ gap: 10 }}>
                {phaseData.objectives.map((obj, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: phaseColor, marginTop: 6 }} />
                    <Text style={{ flex: 1, color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter', lineHeight: 19 }}>
                      {obj}
                    </Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          {/* What changes */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <GlassCard>
              <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 1, marginBottom: 8 }}>
                QUÉ CAMBIA
              </Text>
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter', lineHeight: 19 }}>
                {phaseData.changes}
              </Text>
            </GlassCard>
          </Animated.View>

          {/* GENESIS message */}
          <Animated.View entering={FadeInDown.delay(600).duration(400)}>
            <GlassCard shine>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Sparkles size={14} color={GENESIS_COLORS.primary} />
                <Text style={{ color: GENESIS_COLORS.primary, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>GENESIS</Text>
              </View>
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter', lineHeight: 19, fontStyle: 'italic' }}>
                "{phaseData.genesisMessage}"
              </Text>
            </GlassCard>
          </Animated.View>

          {/* CTA */}
          <Pressable onPress={handleStart} style={{ marginTop: 8 }}>
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
                COMENZAR FASE
              </Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
