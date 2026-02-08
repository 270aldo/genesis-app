import { Text, View } from 'react-native';
import type { MuscleRecovery } from '../../types';

const statusColors: Record<MuscleRecovery['status'], string> = {
  recovered: '#22ff73',
  moderate: '#F97316',
  fatigued: '#ff6b6b',
};

const statusLabels: Record<MuscleRecovery['status'], string> = {
  recovered: 'Recuperado',
  moderate: 'Moderado',
  fatigued: 'Fatigado',
};

type RecoveryHeatmapProps = {
  data: MuscleRecovery[];
};

export function RecoveryHeatmap({ data }: RecoveryHeatmapProps) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {data.map((muscle) => {
        const color = statusColors[muscle.status];
        return (
          <View
            key={muscle.muscleGroup}
            style={{
              flex: 1,
              minWidth: '45%',
              backgroundColor: color + '15',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: color + '30',
              padding: 12,
              gap: 4,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'InterBold' }}>
              {muscle.muscleGroup}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
              <Text style={{ color, fontSize: 10, fontFamily: 'JetBrainsMonoMedium' }}>
                {statusLabels[muscle.status]}
              </Text>
            </View>
            <Text style={{ color: '#827a89', fontSize: 9, fontFamily: 'JetBrainsMono' }}>
              {muscle.daysSinceTraining === 0 ? 'Hoy' : `Hace ${muscle.daysSinceTraining}d`}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
