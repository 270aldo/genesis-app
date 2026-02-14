import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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
import { QUICK_ACTIONS } from '../../data';
import { hapticLight, hapticSelection } from '../../utils/haptics';

export default function GenesisChatModal() {
  const router = useRouter();
  const sendMessage = useGenesisStore((state) => state.sendMessage);
  const messages = useGenesisStore((state) => state.messages);

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
                {QUICK_ACTIONS.map((action) => (
                  <Pressable
                    key={action.id}
                    onPress={() => handleQuickAction(action.prompt)}
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
                      {action.label}
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
