import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, Trophy, Dumbbell, Utensils, Brain, Flame, TrendingUp, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { GlassCard } from '../../components/ui';
import { GENESIS_COLORS } from '../../constants/colors';
import { useSeasonStore, useTrainingStore, useTrackStore } from '../../stores';
import { useCountUpDisplay } from '../../hooks/useCountUpDisplay';
import { hapticHeavy } from '../../utils/haptics';

const CONFETTI_COLORS = ['#FFD700', '#6D00FF', '#00F5AA', '#9D4EDD', '#FF6B6B'];

function ConfettiParticle({ index }: { index: number }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  const targetX = (Math.random() - 0.5) * 300;
  const targetY = (Math.random() - 0.5) * 400;
  const size = 6 + Math.random() * 4;

  useEffect(() => {
    translateX.value = withDelay(100, withTiming(targetX, { duration: 1200 }));
    translateY.value = withDelay(100, withTiming(targetY, { duration: 1200 }));
    opacity.value = withDelay(600, withTiming(0, { duration: 600 }));
    rotate.value = withTiming(360 * (Math.random() > 0.5 ? 1 : -1), { duration: 1200 });
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 4,
          backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        },
        style,
      ]}
    />
  );
}

const STATS_CONFIG = [
  { icon: Dumbbell, color: GENESIS_COLORS.primary, label: 'Sesiones completadas' },
  { icon: Utensils, color: GENESIS_COLORS.success, label: 'Días con nutrición on track' },
  { icon: Brain, color: GENESIS_COLORS.info, label: 'Check-ins completados' },
  { icon: Flame, color: '#F97316', label: 'Racha máxima' },
  { icon: Trophy, color: '#FFD700', label: 'Récords personales' },
  { icon: TrendingUp, color: GENESIS_COLORS.cyan, label: 'Semanas completadas' },
];

export default function SeasonCompleteScreen() {
  const router = useRouter();
  const { seasonNumber, currentWeek } = useSeasonStore();
  const streak = useTrackStore((s) => s.streak);
  const previousSessions = useTrainingStore((s) => s.previousSessions);
  const completedSessions = previousSessions.filter((s) => s.completed).length;

  const badgeScale = useSharedValue(0);

  useEffect(() => {
    hapticHeavy();
    badgeScale.value = withSpring(1, { damping: 8, stiffness: 100 });
  }, []);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  // Stat values — some are placeholders since we don't have full season history
  const statValues = [
    useCountUpDisplay(completedSessions),
    useCountUpDisplay(0),
    useCountUpDisplay(0),
    useCountUpDisplay(streak),
    useCountUpDisplay(0),
    useCountUpDisplay(Math.min(currentWeek, 12)),
  ];

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollViewWrapper>
          {/* Back */}
          <Pressable onPress={() => router.back()} hitSlop={12} style={{ marginBottom: 12 }}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </Pressable>

          {/* Confetti burst */}
          <View style={{ alignItems: 'center', justifyContent: 'center', height: 160 }}>
            <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
              {Array.from({ length: 20 }, (_, i) => (
                <ConfettiParticle key={i} index={i} />
              ))}
            </View>

            {/* Season badge */}
            <Animated.View style={[badgeStyle, {
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: 'rgba(255,215,0,0.15)',
              borderWidth: 2,
              borderColor: '#FFD700',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#FFD700',
              shadowOpacity: 0.4,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 0 },
            }]}>
              <Text style={{ color: '#FFD700', fontSize: 28, fontFamily: 'JetBrainsMonoBold' }}>
                S{seasonNumber}
              </Text>
              <Text style={{ color: '#FFD700', fontSize: 10, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1 }}>
                COMPLETADA
              </Text>
            </Animated.View>
          </View>

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={{ alignItems: 'center', gap: 8 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 24, fontFamily: 'InterBold', textAlign: 'center' }}>
              Tu Season ha Terminado
            </Text>
            <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 14, fontFamily: 'Inter', textAlign: 'center', lineHeight: 20 }}>
              12 semanas de evolución. Esto es lo que lograste.
            </Text>
          </Animated.View>

          {/* Stats cascade */}
          <Animated.View entering={FadeInDown.delay(600).duration(500)} style={{ gap: 8 }}>
            {STATS_CONFIG.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: GENESIS_COLORS.surfaceCard,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: GENESIS_COLORS.borderSubtle,
                    padding: 14,
                  }}
                >
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: stat.color + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={18} color={stat.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'Inter' }}>
                      {stat.label}
                    </Text>
                  </View>
                  <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: 'JetBrainsMonoBold' }}>
                    {statValues[i]}
                  </Text>
                </View>
              );
            })}
          </Animated.View>

          {/* GENESIS wisdom */}
          <Animated.View entering={FadeInDown.delay(900).duration(500)}>
            <GlassCard shine>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Sparkles size={14} color={GENESIS_COLORS.primary} />
                <Text style={{ color: GENESIS_COLORS.primary, fontSize: 11, fontFamily: 'JetBrainsMonoSemiBold' }}>GENESIS</Text>
              </View>
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter', lineHeight: 19, fontStyle: 'italic' }}>
                "Cada season te transforma. No eres la misma persona que empezó hace 12 semanas — eres más fuerte, más disciplinado, más consciente. El siguiente ciclo empieza desde un nivel superior."
              </Text>
            </GlassCard>
          </Animated.View>

          {/* CTAs */}
          <View style={{ gap: 12 }}>
            <Pressable onPress={() => {
              hapticHeavy();
              router.replace('/(tabs)/home');
            }}>
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
                  INICIAR NUEVA SEASON
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(tabs)/track')}
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: GENESIS_COLORS.borderSubtle,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'JetBrainsMonoMedium' }}>
                Ver Resumen
              </Text>
            </Pressable>
          </View>
        </ScrollViewWrapper>
      </SafeAreaView>
    </LinearGradient>
  );
}

function ScrollViewWrapper({ children }: { children: React.ReactNode }) {
  const { ScrollView } = require('react-native-gesture-handler');
  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
