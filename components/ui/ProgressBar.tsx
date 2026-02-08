import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ProgressBarProps = {
  progress?: number; // 0-100 (preferred)
  value?: number;    // backward compat: raw value
  max?: number;      // backward compat: max value
  color?: string;
  gradient?: boolean;
  gradientColors?: [string, string];
};

export function ProgressBar({
  progress,
  value,
  max = 100,
  color,
  gradient = false,
  gradientColors = ['#6c3bff', '#b39aff'],
}: ProgressBarProps) {
  const pct = progress ?? (value != null ? (value / max) * 100 : 0);
  const clampedProgress = Math.min(Math.max(pct, 0), 100);

  return (
    <View className="h-[6px] w-full rounded-[6px] bg-[#FFFFFF14]">
      {gradient ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 6, borderRadius: 6, width: `${clampedProgress}%` }}
        />
      ) : (
        <View
          className="h-[6px] rounded-[6px]"
          style={{ width: `${clampedProgress}%`, backgroundColor: color ?? '#b39aff' }}
        />
      )}
    </View>
  );
}
