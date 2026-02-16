import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Eye, Flame, SlidersHorizontal, Trophy } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { GlassCard } from '../ui';
import { GENESIS_COLORS } from '../../constants/colors';
import { useCoachStore } from '../../stores/useCoachStore';
import { hapticLight } from '../../utils/haptics';

export const NOTE_TYPE_CONFIG: Record<string, { icon: typeof Eye; color: string; label: string }> = {
  observation: { icon: Eye, color: GENESIS_COLORS.info, label: 'Observación' },
  encouragement: { icon: Flame, color: GENESIS_COLORS.success, label: 'Motivación' },
  adjustment: { icon: SlidersHorizontal, color: GENESIS_COLORS.warning, label: 'Ajuste' },
  milestone: { icon: Trophy, color: '#FFD700', label: 'Logro' },
};

export function CoachNotes() {
  const router = useRouter();
  const { latestNote, isRead, fetchLatestNote, markAsRead } = useCoachStore();

  useEffect(() => {
    fetchLatestNote();
  }, []);

  if (!latestNote) return null;

  const typeConfig = latestNote.type ? NOTE_TYPE_CONFIG[latestNote.type] : null;
  const TypeIcon = typeConfig?.icon;

  return (
    <GlassCard shine>
      <View style={{ gap: 10 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* Coach initials avatar */}
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: GENESIS_COLORS.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'JetBrainsMonoBold' }}>AO</Text>
            </View>
            <View style={{ gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'InterBold' }}>Nota del Coach</Text>
                {typeConfig && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 3,
                    backgroundColor: typeConfig.color + '20',
                    borderRadius: 6,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                  }}>
                    {TypeIcon && <TypeIcon size={10} color={typeConfig.color} />}
                    <Text style={{ color: typeConfig.color, fontSize: 9, fontFamily: 'JetBrainsMonoMedium' }}>
                      {typeConfig.label}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 9, fontFamily: 'JetBrainsMonoMedium' }}>
                {new Date(latestNote.created_at).toLocaleDateString('es', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </View>

          {/* Unread indicator */}
          {!isRead && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: GENESIS_COLORS.primary,
              }}
            />
          )}
        </View>

        {/* Message */}
        <Text
          style={{
            color: GENESIS_COLORS.textSecondary,
            fontSize: 12,
            fontFamily: 'Inter',
            lineHeight: 18,
          }}
          numberOfLines={3}
        >
          {latestNote.message}
        </Text>

        {/* Actions row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {!isRead && (
            <Pressable
              onPress={() => {
                hapticLight();
                markAsRead(latestNote.id);
              }}
            >
              <Text style={{ color: GENESIS_COLORS.primary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
                Marcar como leída
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              hapticLight();
              router.push('/(modals)/coach-notes-history');
            }}
            style={{ marginLeft: 'auto' }}
          >
            <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
              Ver historial →
            </Text>
          </Pressable>
        </View>
      </View>
    </GlassCard>
  );
}
