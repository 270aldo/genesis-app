import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Cpu, X } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GenesisChat } from '../../components/genesis';
import { GENESIS_COLORS } from '../../constants/colors';
import { useGenesisStore } from '../../stores';
import { hapticLight, hapticSelection } from '../../utils/haptics';

type ContextPill = { id: string; label: string; prompt: string };

const CONTEXTUAL_PILLS: Record<string, ContextPill[]> = {
  home: [
    { id: 'h1', label: '¿Qué entreno hoy?', prompt: '¿Qué entreno hoy según mi plan?' },
    { id: 'h2', label: 'Resumen del día', prompt: 'Dame un resumen de cómo va mi día: entrenamiento, nutrición y bienestar.' },
    { id: 'h3', label: '¿Cómo va mi season?', prompt: '¿Cómo va mi progreso en este season?' },
    { id: 'h4', label: 'Explícame mi fase', prompt: 'Explícame qué significa la fase actual y cómo debo entrenar.' },
  ],
  train: [
    { id: 't1', label: 'Técnica del ejercicio', prompt: '¿Cuál es la técnica correcta para los ejercicios de hoy?' },
    { id: 't2', label: 'Alternativas', prompt: 'Dame alternativas para los ejercicios de hoy si no tengo equipo.' },
    { id: 't3', label: 'Calentamiento ideal', prompt: '¿Cuál es el calentamiento ideal para mi entrenamiento de hoy?' },
    { id: 't4', label: 'Peso correcto', prompt: '¿Cómo sé si estoy usando el peso correcto en mis ejercicios?' },
  ],
  fuel: [
    { id: 'f1', label: 'Sugiéreme comida', prompt: 'Sugiéreme opciones de comida para cubrir mis macros restantes.' },
    { id: 'f2', label: 'Snack saludable', prompt: 'Recomiéndame un snack saludable según mis macros pendientes.' },
    { id: 'f3', label: 'Pre-entreno ideal', prompt: '¿Qué debería comer antes de entrenar hoy?' },
    { id: 'f4', label: 'Post-entreno ideal', prompt: '¿Qué debería comer después de entrenar para optimizar mi recuperación?' },
  ],
  mind: [
    { id: 'm1', label: 'Tips de recovery', prompt: 'Dame tips de recovery basados en mi estado actual.' },
    { id: 'm2', label: 'Mejorar sueño', prompt: '¿Qué puedo hacer para mejorar mi calidad de sueño?' },
    { id: 'm3', label: 'Manejar estrés', prompt: 'Dame técnicas para manejar el estrés que afecta mi entrenamiento.' },
    { id: 'm4', label: 'Motivación', prompt: 'Necesito motivación. Ayúdame a reconectar con mis metas.' },
  ],
  track: [
    { id: 'tr1', label: 'Analiza mi progreso', prompt: 'Analiza mi progreso de las últimas semanas.' },
    { id: 'tr2', label: 'Mis récords', prompt: '¿Cuáles son mis récords personales más recientes?' },
    { id: 'tr3', label: 'Proyección', prompt: 'Basándote en mi progreso, ¿qué puedo esperar este mes?' },
    { id: 'tr4', label: '¿Voy bien?', prompt: '¿Estoy progresando adecuadamente con mi plan actual?' },
  ],
  default: [
    { id: 'd1', label: '¿Qué entreno hoy?', prompt: '¿Qué entreno hoy según mi plan?' },
    { id: 'd2', label: 'Analiza mi semana', prompt: 'Analiza cómo va mi semana de entrenamiento y nutrición.' },
    { id: 'd3', label: 'Sugiéreme comida', prompt: 'Sugiéreme opciones de comida para cubrir mis macros restantes.' },
    { id: 'd4', label: 'Tips de recovery', prompt: 'Dame tips de recovery basados en mi estado actual.' },
  ],
};

export default function GenesisChatModal() {
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const sendMessage = useGenesisStore((state) => state.sendMessage);
  const messages = useGenesisStore((state) => state.messages);

  const pills = CONTEXTUAL_PILLS[source || 'default'] ?? CONTEXTUAL_PILLS.default;

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (messages.length === 0) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1250 }),
          withTiming(1, { duration: 1250 }),
        ),
        -1,
        true,
      );
    }
  }, [messages.length]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleQuickAction = (prompt: string) => {
    hapticSelection();
    sendMessage(prompt);
  };

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, '#000000']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 20, gap: 12 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <LinearGradient
                colors={['#6D00FF', '#a866ff']}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Cpu size={18} color="#FFFFFF" />
              </LinearGradient>
              <View style={{ gap: 1 }}>
                <Text style={{
                  color: GENESIS_COLORS.primary,
                  fontSize: 12,
                  fontFamily: 'JetBrainsMonoBold',
                  letterSpacing: 2,
                }}>
                  GENESIS
                </Text>
                <Text style={{
                  color: GENESIS_COLORS.textTertiary,
                  fontSize: 11,
                  fontFamily: 'Inter',
                }}>
                  Tu coach de IA
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => {
                hapticLight();
                router.back();
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.06)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Content */}
          {messages.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
              {/* Pulsing Avatar */}
              <View style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }}>
                <Animated.View
                  style={[
                    {
                      position: 'absolute',
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      borderWidth: 1.5,
                      borderColor: 'rgba(109,0,255,0.3)',
                    },
                    pulseStyle,
                  ]}
                />
                <LinearGradient
                  colors={['#6D00FF', '#a866ff']}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Cpu size={28} color="#FFFFFF" />
                </LinearGradient>
              </View>

              {/* Heading */}
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 20,
                  fontFamily: 'InterBold',
                  textAlign: 'center',
                }}>
                  ¿En qué puedo ayudarte?
                </Text>
                <Text style={{
                  color: GENESIS_COLORS.textSecondary,
                  fontSize: 14,
                  fontFamily: 'Inter',
                  textAlign: 'center',
                  maxWidth: 280,
                  lineHeight: 20,
                }}>
                  Pregúntame sobre entrenamiento, nutrición, recuperación o bienestar.
                </Text>
              </View>

              {/* Quick Action Pills */}
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 10,
                justifyContent: 'center',
                paddingHorizontal: 8,
              }}>
                {pills.map((pill) => (
                  <Pressable
                    key={pill.id}
                    onPress={() => handleQuickAction(pill.prompt)}
                    style={{
                      backgroundColor: GENESIS_COLORS.surfaceElevated,
                      borderWidth: 1,
                      borderColor: GENESIS_COLORS.borderSubtle,
                      borderRadius: 20,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                    }}
                  >
                    <Text style={{
                      color: GENESIS_COLORS.textSecondary,
                      fontSize: 11,
                      fontFamily: 'JetBrainsMonoMedium',
                      textTransform: 'uppercase',
                    }}>
                      {pill.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <GenesisChat />
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
