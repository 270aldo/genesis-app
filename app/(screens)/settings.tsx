import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, Switch, Text, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, BellOff, Mail, Moon, User, Info, LogOut, Camera, Heart } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { GlassCard } from '../../components/ui';
import { GENESIS_COLORS } from '../../constants/colors';
import { useAuthStore } from '../../stores/useAuthStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useSeasonStore } from '../../stores/useSeasonStore';
import { PHASE_CONFIG } from '../../data';
import type { PhaseType } from '../../types';

const CATEGORY_LABELS: Record<string, string> = {
  training: 'Entrenamiento',
  nutrition: 'Nutrición',
  check_in: 'Check-in diario',
  coach: 'Coach IA',
};

const GOALS = [
  { key: 'build', label: 'Ganar músculo' },
  { key: 'cut', label: 'Perder grasa' },
  { key: 'maintain', label: 'Mantener' },
  { key: 'recomp', label: 'Recomposición' },
  { key: 'peak', label: 'Rendimiento' },
];

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

  // Editable profile name
  const [fullName, setFullName] = useState(user?.name || '');
  const [hasChanges, setHasChanges] = useState(false);
  useEffect(() => { setHasChanges(fullName !== (user?.name || '')); }, [fullName, user?.name]);

  // Avatar
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Body stats
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [bodyStatsChanged, setBodyStatsChanged] = useState(false);

  // Goals
  const [selectedGoal, setSelectedGoal] = useState<string>('maintain');

  // Season
  const { seasonNumber, currentWeek, currentPhase, progressPercent } = useSeasonStore();
  const phase = (currentPhase || 'hypertrophy') as PhaseType;
  const seasonPhaseConfig = PHASE_CONFIG[phase];

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    try {
      const { upsertProfile } = useAuthStore.getState();
      await upsertProfile(user.id, { full_name: fullName });
      setHasChanges(false);
    } catch (err) {
      console.warn('Failed to save profile:', err);
    }
  };

  // Logout confirmation alert
  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres salir?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ],
    );
  };

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  // Master notification toggle
  const isNotificationEnabled = notifications.some((n) => n.enabled);

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
              <Pressable onPress={handlePickAvatar} style={{ position: 'relative' }}>
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      borderWidth: 2,
                      borderColor: phaseColor + '60',
                    }}
                  />
                ) : (
                  <View style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: phaseColor + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: phaseColor + '40',
                  }}>
                    <User size={24} color={phaseColor} />
                  </View>
                )}
                <View style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: GENESIS_COLORS.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: GENESIS_COLORS.bgGradientStart,
                }}>
                  <Camera size={10} color="#FFFFFF" />
                </View>
              </Pressable>
              <View style={{ flex: 1, gap: 8 }}>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Tu nombre"
                  placeholderTextColor={GENESIS_COLORS.textMuted}
                  style={{
                    color: '#FFFFFF',
                    fontSize: 15,
                    fontFamily: 'InterBold',
                    borderBottomWidth: 1,
                    borderBottomColor: GENESIS_COLORS.borderSubtle,
                    paddingVertical: 4,
                  }}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, fontFamily: 'Inter' }}>
                    {user?.email || '—'}
                  </Text>
                </View>
              </View>
            </View>
            {hasChanges && (
              <Pressable
                onPress={handleSaveProfile}
                style={{
                  marginTop: 12,
                  alignSelf: 'flex-end',
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  backgroundColor: GENESIS_COLORS.primary,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'InterBold' }}>
                  Guardar
                </Text>
              </Pressable>
            )}
          </GlassCard>

          {/* Body Stats */}
          <SectionTitle label="DATOS FÍSICOS" />
          <GlassCard shine>
            <View style={{ gap: 14 }}>
              <StatRow label="Peso" unit="kg" value={weight} onChangeText={(v) => { setWeight(v); setBodyStatsChanged(true); }} />
              <StatRow label="Altura" unit="cm" value={height} onChangeText={(v) => { setHeight(v); setBodyStatsChanged(true); }} />
              <StatRow label="Edad" unit="años" value={age} onChangeText={(v) => { setAge(v); setBodyStatsChanged(true); }} />
              {bodyStatsChanged && (
                <Pressable
                  onPress={() => setBodyStatsChanged(false)}
                  style={{
                    alignSelf: 'flex-end',
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 10,
                    backgroundColor: GENESIS_COLORS.primary,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'InterBold' }}>Guardar</Text>
                </Pressable>
              )}
            </View>
          </GlassCard>

          {/* Goal Selector */}
          <SectionTitle label="OBJETIVO" />
          <GlassCard shine>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {GOALS.map((goal) => {
                const selected = selectedGoal === goal.key;
                return (
                  <Pressable
                    key={goal.key}
                    onPress={() => setSelectedGoal(goal.key)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: 10,
                      backgroundColor: selected ? GENESIS_COLORS.primary + '25' : 'rgba(255,255,255,0.04)',
                      borderWidth: 1,
                      borderColor: selected ? GENESIS_COLORS.primary : GENESIS_COLORS.borderSubtle,
                    }}
                  >
                    <Text style={{
                      color: selected ? '#FFFFFF' : GENESIS_COLORS.textSecondary,
                      fontSize: 12,
                      fontFamily: selected ? 'InterBold' : 'Inter',
                    }}>
                      {goal.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Season Info */}
          <SectionTitle label="TEMPORADA ACTUAL" />
          <GlassCard>
            <View style={{ gap: 10 }}>
              <InfoRow label="Season" value={`#${seasonNumber}`} />
              <InfoRow label="Fase" value={seasonPhaseConfig.label} />
              <InfoRow label="Semana" value={`${currentWeek} / 12`} />
              <InfoRow label="Progreso" value={`${progressPercent}%`} />
            </View>
          </GlassCard>

          {/* Connected Apps */}
          <SectionTitle label="APPS CONECTADAS" />
          <GlassCard>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Heart size={18} color={GENESIS_COLORS.success} />
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Inter' }}>Apple Health</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: GENESIS_COLORS.success }} />
                <Text style={{ color: GENESIS_COLORS.success, fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>Conectado</Text>
              </View>
            </View>
          </GlassCard>

          {/* Notifications Section */}
          <SectionTitle label="NOTIFICACIONES" />
          <GlassCard shine>
            <View style={{ gap: 16 }}>
              {/* Master toggle */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Bell size={16} color={GENESIS_COLORS.primary} />
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'InterBold' }}>
                    Notificaciones habilitadas
                  </Text>
                </View>
                <Switch
                  value={isNotificationEnabled}
                  onValueChange={(val) => {
                    notifications.forEach((n) => updateNotificationPreference(n.category as any, val));
                  }}
                  trackColor={{ false: 'rgba(255,255,255,0.1)', true: GENESIS_COLORS.primary + '60' }}
                  thumbColor={isNotificationEnabled ? GENESIS_COLORS.primary : '#808080'}
                />
              </View>
              <View style={{ height: 1, backgroundColor: GENESIS_COLORS.borderSubtle }} />
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
              <View style={{ height: 1, backgroundColor: GENESIS_COLORS.borderSubtle, marginVertical: 4 }} />
              <Pressable
                onPress={() => Linking.openURL('mailto:soporte@ngx.com')}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <Mail size={14} color={GENESIS_COLORS.primary} />
                <Text style={{ color: GENESIS_COLORS.primary, fontSize: 12, fontFamily: 'Inter' }}>
                  soporte@ngx.com
                </Text>
              </Pressable>
            </View>
          </GlassCard>

          {/* Account */}
          <SectionTitle label="CUENTA" />
          <Pressable
            onPress={handleLogout}
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

function StatRow({ label, unit, value, onChangeText }: { label: string; unit: string; value: string; onChangeText: (v: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, fontFamily: 'Inter' }}>
        {label} <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 10 }}>({unit})</Text>
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder="--"
        placeholderTextColor={GENESIS_COLORS.textMuted}
        style={{
          color: '#FFFFFF',
          fontSize: 14,
          fontFamily: 'JetBrainsMonoBold',
          textAlign: 'right',
          minWidth: 60,
          borderBottomWidth: 1,
          borderBottomColor: GENESIS_COLORS.borderSubtle,
          paddingVertical: 4,
        }}
      />
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
