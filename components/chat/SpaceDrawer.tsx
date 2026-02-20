import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  MessageCircle,
  Settings,
  Clock,
  Cpu,
  BookOpen,
  Calendar,
  FlaskConical,
} from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { useAuthStore, useSeasonStore } from '../../stores';
import { useDrawer } from '../../contexts/DrawerContext';
import { TokenCounter } from './TokenCounter';
import { hapticSelection } from '../../utils/haptics';
import { useSpaceManager, type SpaceId } from '../../hooks/useSpaceManager';

type SpaceItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
};

const SPACES: SpaceItem[] = [
  { id: 'logos', label: 'LOGOS', icon: BookOpen, description: 'Educación y conocimiento' },
  { id: 'season-hub', label: 'Season Hub', icon: Calendar, description: 'Tu temporada actual' },
  { id: 'labs', label: 'Labs', icon: FlaskConical, description: 'Análisis profundo' },
];

type SpaceDrawerProps = {
  activeSpace?: SpaceId;
  onSwitchSpace?: (spaceId: SpaceId) => void;
};

export function SpaceDrawer({ activeSpace = 'daily', onSwitchSpace }: SpaceDrawerProps) {
  const router = useRouter();
  const { closeDrawer } = useDrawer();
  const userName = useAuthStore((s) => s.user?.name ?? 'Athlete');
  const currentWeek = useSeasonStore((s) => s.currentWeek);
  const totalWeeks = useSeasonStore((s) => s.weeks.length || 12);
  const progressPercent = useSeasonStore((s) => s.progressPercent);

  const handleSettings = () => {
    hapticSelection();
    closeDrawer();
    router.push('/(screens)/settings');
  };

  const handleSpace = (spaceId: SpaceId) => {
    hapticSelection();
    onSwitchSpace?.(spaceId);
    closeDrawer();
  };

  return (
    <View style={{ flex: 1, backgroundColor: GENESIS_COLORS.void }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User profile */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <LiquidGlassCard
            effect="clear"
            borderRadius={22}
            style={{
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={22} color="#FFFFFF" />
          </LiquidGlassCard>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: GENESIS_COLORS.textPrimary,
                fontSize: 14,
                fontFamily: 'JetBrainsMonoSemiBold',
              }}
              numberOfLines={1}
            >
              {userName}
            </Text>
            <Text
              style={{
                color: GENESIS_COLORS.primary,
                fontSize: 10,
                fontFamily: 'JetBrainsMonoMedium',
                textTransform: 'uppercase',
              }}
            >
              GENESIS PRO
            </Text>
          </View>
        </View>

        {/* Season progress */}
        <View
          style={{
            backgroundColor: GENESIS_COLORS.voidElevated,
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: GENESIS_COLORS.borderSubtle,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              color: GENESIS_COLORS.textSecondary,
              fontSize: 11,
              fontFamily: 'JetBrainsMonoMedium',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Season Pass · Semana {currentWeek}/{totalWeeks}
          </Text>
          <View
            style={{
              height: 4,
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 2,
              marginTop: 10,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${Math.min(progressPercent, 100)}%`,
                height: '100%',
                backgroundColor: GENESIS_COLORS.primary,
                borderRadius: 2,
              }}
            />
          </View>
        </View>

        {/* Token counter */}
        <View style={{ marginBottom: 24 }}>
          <TokenCounter />
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: GENESIS_COLORS.borderSubtle, marginBottom: 16 }} />

        {/* Hoy — active thread */}
        <Pressable
          onPress={() => handleSpace('daily')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 12,
            paddingHorizontal: 12,
            backgroundColor: activeSpace === 'daily' ? 'rgba(109, 0, 255, 0.12)' : 'transparent',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: activeSpace === 'daily' ? GENESIS_COLORS.borderActive : 'transparent',
            marginBottom: 20,
          }}
        >
          <MessageCircle size={18} color={GENESIS_COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: GENESIS_COLORS.textPrimary, fontSize: 14, fontFamily: 'InterBold' }}>
              Hoy
            </Text>
            <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'Inter' }}>
              Thread diario activo
            </Text>
          </View>
        </Pressable>

        {/* Spaces section */}
        <Text
          style={{
            color: GENESIS_COLORS.textMuted,
            fontSize: 10,
            fontFamily: 'JetBrainsMonoMedium',
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 12,
          }}
        >
          Spaces
        </Text>

        <View style={{ gap: 6, marginBottom: 20 }}>
          {SPACES.map((space) => {
            const Icon = space.icon;
            return (
              <Pressable
                key={space.id}
                onPress={() => handleSpace(space.id as SpaceId)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  backgroundColor: activeSpace === space.id ? 'rgba(109, 0, 255, 0.08)' : 'transparent',
                }}
              >
                <Icon size={18} color={GENESIS_COLORS.iconDefault} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: GENESIS_COLORS.textPrimary, fontSize: 14, fontFamily: 'Inter' }}>
                    {space.label}
                  </Text>
                  <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'Inter' }}>
                    {space.description}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: GENESIS_COLORS.borderSubtle, marginBottom: 16 }} />

        {/* History */}
        <Text
          style={{
            color: GENESIS_COLORS.textMuted,
            fontSize: 10,
            fontFamily: 'JetBrainsMonoMedium',
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 12,
          }}
        >
          Historial
        </Text>

        <View style={{ gap: 8, marginBottom: 24 }}>
          {['Ayer', 'Lunes', 'Domingo'].map((day) => (
            <Pressable
              key={day}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 8,
                paddingHorizontal: 12,
              }}
            >
              <Clock size={14} color={GENESIS_COLORS.textMuted} />
              <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 13, fontFamily: 'Inter' }}>
                {day}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: GENESIS_COLORS.borderSubtle, marginBottom: 16 }} />

        {/* Settings */}
        <Pressable
          onPress={handleSettings}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 12,
            paddingHorizontal: 12,
          }}
        >
          <Settings size={18} color={GENESIS_COLORS.textTertiary} />
          <Text
            style={{
              color: GENESIS_COLORS.textSecondary,
              fontSize: 12,
              fontFamily: 'JetBrainsMonoMedium',
              textTransform: 'uppercase',
            }}
          >
            CONFIGURACIÓN
          </Text>
        </Pressable>

        {/* Genesis branding */}
        <View style={{ alignItems: 'center', marginTop: 32, gap: 4 }}>
          <Cpu size={16} color={GENESIS_COLORS.primary} />
          <Text
            style={{
              color: GENESIS_COLORS.textMuted,
              fontSize: 10,
              fontFamily: 'JetBrainsMonoMedium',
              letterSpacing: 2,
            }}
          >
            GENESIS v2.1
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
