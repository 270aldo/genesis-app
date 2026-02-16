import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sparkles, Users, Target } from 'lucide-react-native';
import { GlassCard } from '../../components/ui';
import { GENESIS_COLORS } from '../../constants/colors';
import { useAuthStore } from '../../stores/useAuthStore';
import { hapticMedium } from '../../utils/haptics';

const WELCOME_KEY = 'genesis_welcomeSeen';

export default function WelcomeBriefingScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const seen = await AsyncStorage.getItem(WELCOME_KEY);
      if (seen) {
        router.replace('/(tabs)/home');
      } else {
        setReady(true);
      }
    })();
  }, []);

  const handleStart = async () => {
    hapticMedium();
    await AsyncStorage.setItem(WELCOME_KEY, 'true');
    router.replace('/(tabs)/home');
  };

  if (!ready) return null;

  return (
    <View style={{ flex: 1, backgroundColor: GENESIS_COLORS.bgVoid }}>
      <LinearGradient
        colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgVoid]}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      <SafeAreaView style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 32 }}>
        {/* Title */}
        <Animated.View entering={FadeIn.duration(600)} style={{ alignItems: 'center', gap: 12 }}>
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: GENESIS_COLORS.primaryDim,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: GENESIS_COLORS.borderActive,
          }}>
            <Sparkles size={28} color={GENESIS_COLORS.primary} />
          </View>
          <Text style={{
            color: '#FFFFFF',
            fontSize: 28,
            fontFamily: 'InterBold',
            textAlign: 'center',
          }}>
            Bienvenido{user?.name ? `, ${user.name}` : ''}
          </Text>
          <Text style={{
            color: GENESIS_COLORS.textSecondary,
            fontSize: 15,
            fontFamily: 'Inter',
            textAlign: 'center',
            lineHeight: 22,
            maxWidth: 300,
          }}>
            GENESIS ha diseñado tu primera temporada. Esto es lo que te espera.
          </Text>
        </Animated.View>

        {/* Feature cards */}
        <Animated.View entering={SlideInUp.delay(200).duration(500)} style={{ gap: 12 }}>
          <GlassCard shine style={{ borderColor: GENESIS_COLORS.primary + '33', borderWidth: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: GENESIS_COLORS.primaryDim,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Target size={22} color={GENESIS_COLORS.primary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'InterBold' }}>
                  Plan personalizado
                </Text>
                <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter' }}>
                  12 semanas de entrenamiento adaptado a tu nivel y objetivos
                </Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard shine style={{ borderColor: GENESIS_COLORS.cyan + '33', borderWidth: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: GENESIS_COLORS.cyan + '15',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles size={22} color={GENESIS_COLORS.cyan} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'InterBold' }}>
                  Coach IA integrado
                </Text>
                <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter' }}>
                  GENESIS te guía en nutrición, entrenamiento y bienestar
                </Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard shine style={{ borderColor: GENESIS_COLORS.success + '33', borderWidth: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: GENESIS_COLORS.success + '15',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Users size={22} color={GENESIS_COLORS.success} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'InterBold' }}>
                  Tracking completo
                </Text>
                <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter' }}>
                  Nutrición, sueño, estrés y progreso — todo en un lugar
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* CTA Button */}
        <Animated.View entering={SlideInUp.delay(400).duration(500)}>
          <Pressable onPress={handleStart}>
            <LinearGradient
              colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                shadowColor: GENESIS_COLORS.primary,
                shadowOpacity: 0.6,
                shadowRadius: 20,
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
                COMENZAR MI SEASON
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
