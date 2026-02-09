import { Text, View } from 'react-native';
import { GENESIS_COLORS } from '../../constants/colors';

type BarData = {
  label: string;
  value: number; // 0-100 (percentage of max height)
  active?: boolean;
};

type SimpleBarChartProps = {
  data: BarData[];
  maxHeight?: number;
};

export function SimpleBarChart({ data, maxHeight = 100 }: SimpleBarChartProps) {
  return (
    <View className="flex-row items-end justify-between">
      {data.map((day, index) => (
        <View key={`${day.label}-${index}`} className="items-center gap-1">
          <View className="w-6 rounded-t-[4px] bg-[#FFFFFF14]" style={{ height: maxHeight }}>
            {day.value > 0 && (
              <View
                className="absolute bottom-0 w-6 rounded-t-[4px] bg-[#6D00FF]"
                style={{ height: (day.value / 100) * maxHeight }}
              />
            )}
          </View>
          <Text
            className={`font-jetbrains text-[9px] ${day.active ? 'text-white' : ''}`}
            style={!day.active ? { color: GENESIS_COLORS.textMuted } : undefined}
          >
            {day.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
