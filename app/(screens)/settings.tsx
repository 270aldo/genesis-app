import { useEffect, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, BellOff, Moon, User, Info, LogOut } from 'lucide-react-native';
import { GlassCard } from '../../components/ui';
import { GENESIS_COLORS } from '../../constants/colors';
import { useAuthStore } from '../../stores/useAuthStore';
import { useSettingsStore } from '../../stores/useSettingsStore';

const CATEGORY_LABELS: Record<string, string> = {
  training: 'Entrenamiento',
  nutrition: 'Nutrición',
  check_in: 'Check-in diario',
  coach: 'Coach IA',
};

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const phaseColor = GENESIS_COLORS.primary;

  const {
    notifications,
    quietHoursStart,
    quietHoursEnd,
    fetchNotificationPreferences,
    updateNotificationPreference,
    updateQuietHours,
  } = useSettingsStore();

  useEffect(() => {
    fetchNotificationPreferences();
  }, []);

  const [editingQuietHours, setEditingQuietHours] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.06)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </Pressable>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: 'InterBold' }}>
              Configuración
            </Text>
          </View>

          {/* Profile Section */}
          <SectionTitle label="PERFIL" />
          <GlassCard shine>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: phaseColor + '20',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: phaseColor + '40',
              }}>
                <User size={22} color={phaseColor} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'InterBold' }}>
                  {user?.name || 'Atleta'}
                </Text>
                <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter' }}>
                  {user?.email || '—'}
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Notifications Section */}
          <SectionTitle label="NOTIFICACIONES" />
          <GlassCard shine>
            <View style={{ gap: 16 }}>
              {notifications.map((pref) => (
                <View
                  key={pref.category}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {pref.enabled ? (
                      <Bell size={16} color={GENESIS_COLORS.primary} />
                    ) : (
                      <BellOff size={16} color={GENESIS_COLORS.textMuted} />
                    )}
                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Inter' }}>
                      {CATEGORY_LABELS[pref.category] ?? pref.category}
                    </Text>
                  </View>
                  <Switch
                    value={pref.enabled}
                    onValueChange={(v) => updateNotificationPreference(pref.category as any, v)}
                    trackColor={{ false: 'rgba(255,255,255,0.1)', true: GENESIS_COLORS.primary + '60' }}
                    thumbColor={pref.enabled ? GENESIS_COLORS.primary : '#808080'}
                  />
                </View>
              ))}
            </View>
          </GlassCard>

          {/* Quiet Hours Section */}
          <SectionTitle label="HORAS DE SILENCIO" />
          <GlassCard shine>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Moon size={16} color={GENESIS_COLORS.info} />
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Inter', flex: 1 }}>
                No molestar
              </Text>
              <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'JetBrainsMonoMedium' }}>
                {String(quietHoursStart).padStart(2, '0')}:00 – {String(quietHoursEnd).padStart(2, '0')}:00
              </Text>
            </View>
            {!editingQuietHours ? (
              <Pressable
                onPress={() => setEditingQuietHours(true)}
                style={{
                  alignSelf: 'flex-start',
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                }}
              >
                <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 11, fontFamily: 'Inter' }}>
                  Editar
                </Text>
              </Pressable>
            ) : (
              <View style={{ gap: 12 }}>
                <QuietHourPicker
                  label="Inicio"
                  value={quietHoursStart}
                  onChange={(v) => updateQuietHours(v, quietHoursEnd)}
                />
                <QuietHourPicker
                  label="Fin"
                  value={quietHoursEnd}
                  onChange={(v) => updateQuietHours(quietHoursStart, v)}
                />
                <Pressable
                  onPress={() => setEditingQuietHours(false)}
                  style={{
                    alignSelf: 'flex-start',
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: GENESIS_COLORS.primary + '20',
                  }}
                >
                  <Text style={{ color: GENESIS_COLORS.primary, fontSize: 11, fontFamily: 'Inter' }}>
                    Listo
                  </Text>
                </Pressable>
              </View>
            )}
          </GlassCard>

          {/* App Info */}
          <SectionTitle label="INFORMACIÓN" />
          <GlassCard>
            <View style={{ gap: 10 }}>
              <InfoRow label="Versión" value="1.0.0" />
              <InfoRow label="Build" value="Phase 5" />
              <InfoRow label="Motor IA" value="GENESIS ADK" />
            </View>
          </GlassCard>

          {/* Account */}
          <SectionTitle label="CUENTA" />
          <Pressable
            onPress={handleSignOut}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: GENESIS_COLORS.error + '10',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: GENESIS_COLORS.error + '20',
              padding: 16,
            }}
          >
            <LogOut size={18} color={GENESIS_COLORS.error} />
            <Text style={{ color: GENESIS_COLORS.error, fontSize: 14, fontFamily: 'InterBold' }}>
              Cerrar sesión
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <Text style={{
      color: GENESIS_COLORS.textTertiary,
      fontSize: 10,
      fontFamily: 'JetBrainsMonoSemiBold',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    }}>
      {label}
    </Text>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter' }}>{label}</Text>
      <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'JetBrainsMonoMedium' }}>{value}</Text>
    </View>
  );
}

function QuietHourPicker({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 11, fontFamily: 'Inter' }}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {hours.map((h) => {
          const selected = h === value;
          return (
            <Pressable
              key={h}
              onPress={() => onChange(h)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 8,
                backgroundColor: selected ? GENESIS_COLORS.primary + '30' : 'rgba(255,255,255,0.04)',
                borderWidth: selected ? 1 : 0.5,
                borderColor: selected ? GENESIS_COLORS.primary : GENESIS_COLORS.borderSubtle,
              }}
            >
              <Text style={{
                color: selected ? '#FFFFFF' : GENESIS_COLORS.textTertiary,
                fontSize: 11,
                fontFamily: 'JetBrainsMonoMedium',
              }}>
                {String(h).padStart(2, '0')}:00
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
