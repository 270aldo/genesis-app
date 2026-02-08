import type { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';
import { theme } from '../../constants/theme';

type CircularProgressProps = PropsWithChildren<{
  /** 0-1 progress value */
  progress?: number;
  /** Legacy 0-100 value */
  value?: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}>;

export function CircularProgress({
  progress,
  value,
  label = 'Progress',
  size = 96,
  strokeWidth = 8,
  color = theme.colors.primary,
  children,
}: CircularProgressProps) {
  // Support both 0-1 progress and 0-100 value
  const pct = progress != null ? Math.round(progress * 100) : value != null ? value : 0;
  const clamped = Math.max(0, Math.min(100, pct));
  const radius = size / 2;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: strokeWidth,
          borderColor: `${color}33`,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: strokeWidth,
          borderTopColor: color,
          borderRightColor: clamped > 25 ? color : `${color}22`,
          borderBottomColor: clamped > 50 ? color : `${color}22`,
          borderLeftColor: clamped > 75 ? color : `${color}22`,
          transform: [{ rotate: '-45deg' }],
        }}
      />
      {children || (
        <>
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 20 }}>{clamped}%</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>{label}</Text>
        </>
      )}
    </View>
  );
}
