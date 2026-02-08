import { Text, View } from 'react-native';

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
                className="absolute bottom-0 w-6 rounded-t-[4px] bg-[#b39aff]"
                style={{ height: (day.value / 100) * maxHeight }}
              />
            )}
          </View>
          <Text className={`font-jetbrains text-[9px] ${day.active ? 'text-white' : 'text-[#6b6b7b]'}`}>
            {day.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
