import { useEffect, useMemo } from 'react';
import { Modal, Pressable, Text, View, ActivityIndicator } from 'react-native';
import { X } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { GENESIS_COLORS } from '../../constants/colors';
import { useTrainingStore } from '../../stores';

type SwapExerciseSheetProps = {
  visible: boolean;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  onSelect: (newExercise: { id: string; name: string; imageUrl: string }) => void;
  onClose: () => void;
};

export function SwapExerciseSheet({
  visible,
  exerciseId,
  exerciseName,
  muscleGroup,
  onSelect,
  onClose,
}: SwapExerciseSheetProps) {
  const router = useRouter();
  const exerciseCatalog = useTrainingStore((s) => s.exerciseCatalog);
  const isCatalogLoading = useTrainingStore((s) => s.isCatalogLoading);
  const fetchExerciseCatalog = useTrainingStore((s) => s.fetchExerciseCatalog);

  useEffect(() => {
    if (visible && exerciseCatalog.length === 0) {
      fetchExerciseCatalog(muscleGroup);
    }
  }, [visible]);

  const alternatives = useMemo(() => {
    const mgLower = muscleGroup.toLowerCase();
    return exerciseCatalog
      .filter((c) => c.muscleGroup.toLowerCase() === mgLower && c.id !== exerciseId)
      .slice(0, 5);
  }, [exerciseCatalog, muscleGroup, exerciseId]);

  const difficultyColor: Record<string, string> = {
    beginner: GENESIS_COLORS.success,
    intermediate: GENESIS_COLORS.warning,
    advanced: GENESIS_COLORS.error,
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: GENESIS_COLORS.surfaceCard,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 20,
            paddingBottom: 40,
            gap: 16,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 10, fontFamily: 'JetBrainsMonoSemiBold', letterSpacing: 1.5 }}>
                ALTERNATIVAS PARA
              </Text>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'InterBold' }} numberOfLines={1}>
                {exerciseName}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(255,255,255,0.08)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} color={GENESIS_COLORS.textSecondary} />
            </Pressable>
          </View>

          {/* Alternatives list */}
          {isCatalogLoading ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <ActivityIndicator color={GENESIS_COLORS.primary} />
            </View>
          ) : alternatives.length === 0 ? (
            <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 13, fontFamily: 'Inter', textAlign: 'center', paddingVertical: 24 }}>
              No se encontraron alternativas para este grupo muscular.
            </Text>
          ) : (
            <View style={{ gap: 8 }}>
              {alternatives.map((alt) => (
                <Pressable
                  key={alt.id}
                  onPress={() => onSelect({ id: alt.id, name: alt.name, imageUrl: alt.imageUrl })}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: 'rgba(255,255,255,0.04)',
                  }}
                >
                  <Image
                    source={{ uri: alt.imageUrl }}
                    style={{ width: 36, height: 36, borderRadius: 10 }}
                    contentFit="cover"
                    transition={200}
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>{alt.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 9999, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 9, fontFamily: 'JetBrainsMonoMedium' }}>
                          {alt.equipment}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: (difficultyColor[alt.difficulty] ?? GENESIS_COLORS.primary) + '20', borderRadius: 9999, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ color: difficultyColor[alt.difficulty] ?? GENESIS_COLORS.primary, fontSize: 9, fontFamily: 'JetBrainsMonoMedium' }}>
                          {alt.difficulty}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {/* Footer link */}
          <Pressable
            onPress={() => {
              onClose();
              router.push(`/(screens)/library?muscle=${muscleGroup}`);
            }}
            style={{ alignItems: 'center', paddingTop: 4 }}
          >
            <Text style={{ color: GENESIS_COLORS.primary, fontSize: 12, fontFamily: 'JetBrainsMonoSemiBold' }}>
              Ver libreria completa →
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
