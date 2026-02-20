import { useCallback, useState } from 'react';
import { Pressable, Text, TextInput, View, ScrollView } from 'react-native';
import { BookOpen, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../ui/GlassCard';
import { GENESIS_COLORS } from '../../../constants/colors';
import { hapticLight, hapticNotificationSuccess } from '../../../utils/haptics';
import type { WidgetPayload } from '../../../types';

const MOOD_TAGS = [
  'Motivado',
  'Cansado',
  'Enfocado',
  'Estresado',
  'Relajado',
] as const;

type MoodTag = (typeof MOOD_TAGS)[number];

export function JournalWidget({ widget }: { widget: WidgetPayload }) {
  const [entry, setEntry] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<MoodTag>>(new Set());
  const [saved, setSaved] = useState(false);

  const toggleTag = useCallback((tag: MoodTag) => {
    hapticLight();
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    hapticNotificationSuccess();
    setSaved(true);
    // In a real implementation this would persist via BFF/Supabase
  }, []);

  const handleReset = useCallback(() => {
    hapticLight();
    setSaved(false);
    setEntry('');
    setSelectedTags(new Set());
  }, []);

  return (
    <GlassCard>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <BookOpen size={18} color={GENESIS_COLORS.primary} />
        <Text style={{ color: GENESIS_COLORS.textPrimary, fontSize: 16, fontWeight: '700', flex: 1 }}>
          {widget.title ?? 'Diario'}
        </Text>
        {saved && <Check size={18} color={GENESIS_COLORS.success} />}
      </View>

      {saved ? (
        // Saved confirmation
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: `${GENESIS_COLORS.success}22`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Check size={24} color={GENESIS_COLORS.success} />
          </View>
          <Text style={{ color: GENESIS_COLORS.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 4 }}>
            Entrada guardada
          </Text>
          <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 12, textAlign: 'center' }}>
            Tu reflexion ha sido registrada.
          </Text>
          <Pressable onPress={handleReset} style={{ marginTop: 16 }}>
            <Text style={{ color: GENESIS_COLORS.primary, fontSize: 13, fontWeight: '600' }}>
              Escribir otra entrada
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Text input */}
          <TextInput
            value={entry}
            onChangeText={setEntry}
            placeholder="Como te sientes hoy?"
            placeholderTextColor={GENESIS_COLORS.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: GENESIS_COLORS.borderSubtle,
              color: GENESIS_COLORS.textPrimary,
              fontSize: 14,
              fontFamily: 'Inter',
              padding: 14,
              minHeight: 100,
              marginBottom: 16,
            }}
          />

          {/* Mood tag selector */}
          <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', marginBottom: 8 }}>
            ESTADO DE ANIMO
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
            style={{ marginBottom: 16 }}
          >
            {MOOD_TAGS.map((tag) => {
              const isSelected = selectedTags.has(tag);
              return (
                <Pressable
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={{
                    backgroundColor: isSelected ? GENESIS_COLORS.primary : 'rgba(255,255,255,0.06)',
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: isSelected ? GENESIS_COLORS.primary : GENESIS_COLORS.borderSubtle,
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? '#FFFFFF' : GENESIS_COLORS.textSecondary,
                      fontSize: 13,
                      fontWeight: isSelected ? '600' : '400',
                    }}
                  >
                    {tag}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Save button */}
          <Pressable
            onPress={handleSave}
            disabled={entry.trim().length === 0 && selectedTags.size === 0}
            style={{ opacity: entry.trim().length === 0 && selectedTags.size === 0 ? 0.4 : 1 }}
          >
            <LinearGradient
              colors={[GENESIS_COLORS.primaryLight, GENESIS_COLORS.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Guardar</Text>
            </LinearGradient>
          </Pressable>
        </>
      )}

      {/* GENESIS badge */}
      <Text
        style={{
          color: GENESIS_COLORS.primary,
          fontSize: 9,
          fontFamily: 'JetBrainsMonoMedium',
          marginTop: 12,
          opacity: 0.7,
        }}
      >
        GENERATED BY GENESIS
      </Text>
    </GlassCard>
  );
}
