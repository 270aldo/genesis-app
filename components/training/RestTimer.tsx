import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import { useTrainingStore } from '../../stores';

type RestTimerProps = {
  defaultDuration?: number;
  onComplete?: () => void;
};

export function RestTimer({ defaultDuration = 90, onComplete }: RestTimerProps) {
  const { isRestTimerActive, restTimeRemaining, startRestTimer, pauseRestTimer, tickRestTimer } = useTrainingStore();

  useEffect(() => {
    if (!isRestTimerActive) return;
    const handle = setInterval(() => tickRestTimer(), 1000);
    return () => clearInterval(handle);
  }, [isRestTimerActive, tickRestTimer]);

  // Fire onComplete when timer reaches 0
  useEffect(() => {
    if (restTimeRemaining === 0 && !isRestTimerActive && onComplete) {
      onComplete();
    }
  }, [restTimeRemaining, isRestTimerActive, onComplete]);

  const minutes = Math.floor(restTimeRemaining / 60);
  const seconds = restTimeRemaining % 60;
  const progress = defaultDuration > 0 ? restTimeRemaining / defaultDuration : 0;
  const circumference = 2 * Math.PI * 45;
  const strokeOffset = circumference * (1 - progress);

  return (
    <View style={{ borderRadius: 16, backgroundColor: theme.colors.surface, padding: 16, alignItems: 'center', gap: 12 }}>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1.5 }}>
        REST TIMER
      </Text>

      {/* Circular countdown */}
      <View style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center' }}>
        {/* Background circle (SVG-like using View borders) */}
        <View
          style={{
            position: 'absolute',
            width: 100,
            height: 100,
            borderRadius: 50,
            borderWidth: 4,
            borderColor: `${theme.colors.primary}22`,
          }}
        />
        {/* Progress indicator */}
        <View
          style={{
            position: 'absolute',
            width: 100,
            height: 100,
            borderRadius: 50,
            borderWidth: 4,
            borderColor: isRestTimerActive ? theme.colors.primary : `${theme.colors.primary}44`,
            borderTopColor: progress > 0.75 ? (isRestTimerActive ? theme.colors.primary : `${theme.colors.primary}44`) : 'transparent',
            borderRightColor: progress > 0.5 ? (isRestTimerActive ? theme.colors.primary : `${theme.colors.primary}44`) : 'transparent',
            borderBottomColor: progress > 0.25 ? (isRestTimerActive ? theme.colors.primary : `${theme.colors.primary}44`) : 'transparent',
            borderLeftColor: progress > 0 ? (isRestTimerActive ? theme.colors.primary : `${theme.colors.primary}44`) : 'transparent',
            transform: [{ rotate: '-90deg' }],
          }}
        />
        <Text style={{ color: theme.colors.textPrimary, fontSize: 28, fontFamily: 'JetBrainsMonoBold' }}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </Text>
      </View>

      {/* Controls */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {!isRestTimerActive && restTimeRemaining === 0 ? (
          <Pressable
            onPress={() => startRestTimer(defaultDuration)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 10,
              backgroundColor: `${theme.colors.primary}22`,
            }}
          >
            <Text style={{ color: theme.colors.primary, fontWeight: '600', fontSize: 13 }}>
              Start {defaultDuration}s
            </Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={() => startRestTimer(restTimeRemaining + 30)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 10,
                backgroundColor: `${theme.colors.info}22`,
              }}
            >
              <Text style={{ color: theme.colors.info, fontWeight: '600', fontSize: 13 }}>+30s</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                pauseRestTimer();
                // Also reset to 0 so it's treated as skipped
                useTrainingStore.setState({ restTimeRemaining: 0, isRestTimerActive: false });
              }}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 10,
                backgroundColor: `${theme.colors.warning}22`,
              }}
            >
              <Text style={{ color: theme.colors.warning, fontWeight: '600', fontSize: 13 }}>Skip Rest</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
