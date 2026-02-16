import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { GlassCard } from '../../components/ui';
import { NOTE_TYPE_CONFIG } from '../../components/coach/CoachNotes';
import { GENESIS_COLORS } from '../../constants/colors';
import { useCoachStore, filterNotesByType } from '../../stores/useCoachStore';
import type { CoachNote } from '../../stores/useCoachStore';
import { hapticLight, hapticSelection } from '../../utils/haptics';
import { useStaggeredEntrance, getStaggeredStyle } from '../../hooks/useStaggeredEntrance';

const FILTER_OPTIONS = [
  { key: 'all', label: 'Todas' },
  { key: 'observation', label: 'Observaciones' },
  { key: 'encouragement', label: 'Motivación' },
  { key: 'adjustment', label: 'Ajustes' },
  { key: 'milestone', label: 'Logros' },
];

export default function CoachNotesHistoryScreen() {
  const router = useRouter();
  const { notes, isLoading, fetchAllNotes, markAsRead } = useCoachStore();
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchAllNotes();
  }, []);

  const filteredNotes = filterNotesByType(notes, activeFilter);

  const entrance = useStaggeredEntrance(Math.min(filteredNotes.length, 8), 80);
  const totalDuration = 600 + Math.min(filteredNotes.length, 8) * 80;

  const renderNote = ({ item, index }: { item: CoachNote; index: number }) => {
    const typeConfig = item.type ? NOTE_TYPE_CONFIG[item.type] : null;
    const TypeIcon = typeConfig?.icon ?? null;

    return (
      <NoteItem
        item={item}
        index={index}
        typeConfig={typeConfig}
        TypeIcon={TypeIcon}
        entrance={entrance}
        totalDuration={totalDuration}
        onPress={() => {
          if (!item.read) {
            hapticLight();
            markAsRead(item.id);
          }
        }}
      />
    );
  };

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: 'InterBold' }}>
            Notas de tu Coach
          </Text>
        </View>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12 }}
        >
          {FILTER_OPTIONS.map((filter) => {
            const active = activeFilter === filter.key;
            return (
              <Pressable
                key={filter.key}
                onPress={() => {
                  hapticSelection();
                  setActiveFilter(filter.key);
                }}
                style={{
                  backgroundColor: active ? GENESIS_COLORS.primary : 'rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderWidth: 1,
                  borderColor: active ? GENESIS_COLORS.primary : GENESIS_COLORS.borderSubtle,
                }}
              >
                <Text style={{
                  color: active ? '#FFFFFF' : GENESIS_COLORS.textSecondary,
                  fontSize: 12,
                  fontFamily: 'JetBrainsMonoMedium',
                }}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Notes list */}
        {filteredNotes.length === 0 && !isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 }}>
            <MessageCircle size={40} color={GENESIS_COLORS.textMuted} />
            <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 14, fontFamily: 'Inter', textAlign: 'center' }}>
              Tu coach aún no ha dejado notas
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotes}
            keyExtractor={(item) => item.id}
            renderItem={renderNote}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 12 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

function NoteItem({
  item,
  index,
  typeConfig,
  TypeIcon,
  entrance,
  totalDuration,
  onPress,
}: {
  item: CoachNote;
  index: number;
  typeConfig: (typeof NOTE_TYPE_CONFIG)[string] | null;
  TypeIcon: (typeof NOTE_TYPE_CONFIG)[string]['icon'] | null;
  entrance: { progress: { value: number }; delayMs: number };
  totalDuration: number;
  onPress: () => void;
}) {
  const animIndex = Math.min(index, 7);
  const style = useAnimatedStyle(() => {
    const { opacity, translateY } = getStaggeredStyle(entrance.progress.value, animIndex, entrance.delayMs, totalDuration);
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <Animated.View style={style}>
      <Pressable onPress={onPress}>
        <GlassCard>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {typeConfig && TypeIcon && (
                  <View style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: typeConfig.color + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <TypeIcon size={14} color={typeConfig.color} />
                  </View>
                )}
                <Text style={{ color: typeConfig?.color ?? '#FFFFFF', fontSize: 12, fontFamily: 'InterBold' }}>
                  {typeConfig?.label ?? 'Nota'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>
                  {new Date(item.created_at).toLocaleDateString('es', { month: 'short', day: 'numeric' })}
                </Text>
                {!item.read && (
                  <View style={{
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: GENESIS_COLORS.primary,
                  }} />
                )}
              </View>
            </View>
            <Text style={{
              color: GENESIS_COLORS.textSecondary,
              fontSize: 12,
              fontFamily: 'Inter',
              lineHeight: 18,
            }}>
              {item.message}
            </Text>
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}
