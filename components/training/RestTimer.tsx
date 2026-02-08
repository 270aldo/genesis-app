import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import { useTrainingStore } from '../../stores';

export function RestTimer() {
  const { isRestTimerActive, restTimeRemaining, startRestTimer, pauseRestTimer, tickRestTimer } = useTrainingStore();

  useEffect(() => {
    if (!isRestTimerActive) return;
    const handle = setInterval(() => tickRestTimer(), 1000);
    return () => clearInterval(handle);
  }, [isRestTimerActive, tickRestTimer]);

  return (
    <View style={{ borderRadius: 12, backgroundColor: theme.colors.surface, padding: 12, gap: 8 }}>
      <Text style={{ color: theme.colors.textSecondary }}>Rest Timer</Text>
      <Text style={{ color: theme.colors.textPrimary, fontSize: 24, fontWeight: '700' }}>{restTimeRemaining}s</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable onPress={() => startRestTimer(90)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: `${theme.colors.primary}22` }}>
          <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Start 90s</Text>
        </Pressable>
        <Pressable onPress={pauseRestTimer} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: `${theme.colors.error}22` }}>
          <Text style={{ color: theme.colors.error, fontWeight: '600' }}>Pause</Text>
        </Pressable>
      </View>
    </View>
  );
}
