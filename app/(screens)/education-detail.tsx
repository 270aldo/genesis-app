import { Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ImageCard } from '../../components/cards';
import { GlassCard } from '../../components/ui';
import { GENESIS_COLORS } from '../../constants/colors';
import { MOCK_EDUCATION, PHASE_CONFIG } from '../../data';
import { useSeasonStore } from '../../stores';
import type { PhaseType } from '../../types';

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: GENESIS_COLORS.success,
  intermediate: GENESIS_COLORS.warning,
  advanced: GENESIS_COLORS.error,
};

const ARTICLE_BODY: Record<string, string[]> = {
  edu1: [
    'El tempo training consiste en controlar la velocidad de cada fase del movimiento: excéntrica, pausa, concéntrica y pausa superior. Un tempo típico de hipertrofia es 3-1-2-0.',
    'La fase excéntrica (bajada) es donde ocurre el mayor daño muscular, que es el estímulo principal para el crecimiento. Alargar esta fase a 3-4 segundos maximiza el tiempo bajo tensión sin necesidad de aumentar el peso.',
    'Estudios recientes muestran que el tiempo bajo tensión total de 40-60 segundos por serie es óptimo para hipertrofia. Con un tempo 3-1-2-0 y 10 reps, alcanzas 60 segundos perfectos.',
    'Para implementarlo: empieza con un 60-70% de tu peso habitual. Te sorprenderá lo difícil que se siente. Aumenta progresivamente manteniendo el tempo estricto.',
  ],
  edu2: [
    'La periodización es la organización sistemática del entrenamiento en bloques con objetivos específicos. En GENESIS, usamos un modelo de periodización ondulante por bloques dentro de cada Season.',
    'Cada Season de 12 semanas incluye fases de hipertrofia, fuerza, potencia y deload. Esta estructura permite desarrollar todas las cualidades físicas mientras previenes el sobreentrenamiento.',
    'La fase de hipertrofia (semanas 1-4) se enfoca en volumen alto con cargas moderadas. La fase de fuerza (semanas 5-8) reduce volumen pero aumenta intensidad. La fase de potencia (semanas 9-11) trabaja velocidad y explosividad.',
    'La semana de deload es estratégica: reduce volumen e intensidad para permitir la supercompensación. No es perder tiempo, es invertir en tu próximo ciclo de progreso.',
  ],
  edu3: [
    'La "ventana anabólica" post-entrenamiento ha sido uno de los mitos más persistentes en nutrición deportiva. La evidencia actual muestra que es mucho más amplia de lo que se creía: 4-6 horas.',
    'Lo que realmente importa es la distribución total de proteína a lo largo del día. Consumir 0.4-0.5g/kg en cada comida, distribuidas en 4-5 tomas, optimiza la síntesis proteica muscular.',
    'El timing pre-entrenamiento es más importante que el post. Una comida rica en proteína 2-3 horas antes del entrenamiento asegura aminoácidos circulantes durante y después del ejercicio.',
    'Para maximizar resultados: 1.6-2.2g/kg/día de proteína total, distribuida uniformemente. No necesitas un shake inmediatamente después — tu comida post-entreno puede esperar 1-2 horas.',
  ],
  edu4: [
    'Durante el sueño profundo (fase N3), tu cuerpo libera el 70% de la hormona de crecimiento diaria. Esta hormona es esencial para la reparación muscular, la síntesis de colágeno y la recuperación del sistema nervioso.',
    'La privación de sueño reduce la síntesis proteica muscular hasta un 18% y aumenta el cortisol un 37%. Esto significa que dormir mal puede anular gran parte del trabajo que haces en el gym.',
    'Para optimizar tu sueño: mantén un horario consistente (±30 min), enfría tu habitación a 18-20°C, elimina luz azul 1 hora antes de dormir, y evita cafeína después de las 2pm.',
    'GENESIS monitorea tu sueño y ajusta automáticamente la intensidad de tus entrenamientos. Si detectamos sueño pobre consistente, activamos protocolos de recuperación antes de que afecte tu rendimiento.',
  ],
  edu5: [
    'Progressive overload es el principio fundamental del entrenamiento: para seguir adaptándose, el cuerpo necesita estímulos progresivamente más desafiantes. Sin overload, no hay progreso.',
    'No solo se trata de agregar peso. Puedes progresar aumentando reps, series, frecuencia, reduciendo descanso, mejorando rango de movimiento, o controlando mejor el tempo.',
    'La clave es la consistencia en la progresión, no la magnitud. Añadir 1-2kg por semana en compuestos o 1-2 reps por serie es suficiente. Los micro-incrementos generan macro-resultados a largo plazo.',
    'GENESIS trackea tu progresión automáticamente y te sugiere cuándo y cómo aumentar. Si llevas 2 semanas sin progresión en un ejercicio, evaluamos si necesitas un ajuste de estrategia.',
  ],
  edu6: [
    'El deload es una reducción planificada del volumen y/o intensidad del entrenamiento. Típicamente dura 1 semana y se programa cada 4-6 semanas de entrenamiento progresivo.',
    'Durante un entrenamiento intenso, acumulas fatiga que tu cuerpo no puede compensar completamente entre sesiones. El deload permite la supercompensación: tu cuerpo no solo se recupera, sino que se adapta por encima del nivel inicial.',
    'Un deload efectivo reduce el volumen un 40-50% manteniendo la intensidad al 60-70%. Esto mantiene el patrón de movimiento sin agregar estrés significativo. También es buen momento para trabajar movilidad y técnica.',
    'En GENESIS, el deload está integrado en cada Season. No lo saltes. Los atletas que respetan los deloads progresan más rápido a largo plazo que los que entrenan sin parar.',
  ],
};

const GENESIS_TIPS: Record<string, string> = {
  edu1: 'Prueba esto hoy: en tu próximo set de bench press, cuenta 3 segundos bajando y 2 subiendo. Compara cómo se siente vs tu tempo normal.',
  edu2: 'Tu Season actual está diseñado con periodización ondulante. Cada semana tiene un objetivo específico — confía en el proceso.',
  edu3: 'Basado en tus comidas loggeadas, tu distribución de proteína podría mejorar en la mañana. Intenta agregar 10g más al desayuno.',
  edu4: 'Tu promedio de sueño esta semana es bueno. Mantén tu rutina nocturna consistente para optimizar la fase N3 de sueño profundo.',
  edu5: 'Revisa tu historial de ejercicios — identifica dónde has progresado y dónde estás estancado. GENESIS puede ayudarte a ajustar.',
  edu6: 'Estás en la fase correcta de tu Season. Aprovecha el deload para trabajar en movilidad y revisar tu técnica sin presión de peso.',
};

export default function EducationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentPhase } = useSeasonStore();
  const phase = (currentPhase || 'hypertrophy') as PhaseType;
  const phaseConfig = PHASE_CONFIG[phase];

  const content = MOCK_EDUCATION.find((e) => e.id === id);

  if (!content) {
    return (
      <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: GENESIS_COLORS.textTertiary, fontFamily: 'Inter', fontSize: 16 }}>Content not found</Text>
      </LinearGradient>
    );
  }

  const paragraphs = ARTICLE_BODY[content.id] ?? [
    'This educational content provides in-depth coverage of the topic. Check back for the full article.',
  ];
  const genesisTip = GENESIS_TIPS[content.id] ?? 'Stay consistent and trust the process. GENESIS is adapting your plan in real time.';

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View>
            <ImageCard imageUrl={content.imageUrl} height={240} />
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={{
                position: 'absolute',
                top: 12,
                left: 16,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(0,0,0,0.7)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 24 }}>
            {/* Title + meta */}
            <View style={{ gap: 10 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontFamily: 'InterBold' }}>
                {content.title}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <View style={{ backgroundColor: phaseConfig.color + '20', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ color: phaseConfig.accentColor, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                    {content.category}
                  </Text>
                </View>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                    {content.duration}
                  </Text>
                </View>
                <View style={{ backgroundColor: DIFFICULTY_COLORS[content.difficulty] + '20', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ color: DIFFICULTY_COLORS[content.difficulty], fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                    {content.difficulty}
                  </Text>
                </View>
              </View>
            </View>

            {/* Body */}
            <View style={{ gap: 16 }}>
              {paragraphs.map((p, i) => (
                <Text key={i} style={{ color: GENESIS_COLORS.textSecondary, fontSize: 14, fontFamily: 'Inter', lineHeight: 22 }}>
                  {p}
                </Text>
              ))}
            </View>

            {/* GENESIS Tip */}
            <GlassCard shine>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Sparkles size={14} color={phaseConfig.accentColor} />
                <Text style={{ color: phaseConfig.accentColor, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>
                  GENESIS INSIGHT
                </Text>
              </View>
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter', lineHeight: 19 }}>
                {genesisTip}
              </Text>
            </GlassCard>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
