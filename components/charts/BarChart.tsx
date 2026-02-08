import { Text, View } from 'react-native';
import { theme } from '../../constants/theme';

type BarDatum = { label: string; value: number; color?: string };

type BarChartProps = {
  data: BarDatum[];
  max?: number;
};

export function BarChart({ data, max }: BarChartProps) {
  const chartMax = max ?? Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={{ gap: 8 }}>
      {data.map((item) => (
        <View key={item.label} style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{item.label}</Text>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 12 }}>{item.value}</Text>
          </View>
          <View style={{ height: 8, backgroundColor: theme.colors.shine, borderRadius: 6 }}>
            <View
              style={{
                height: 8,
                width: `${Math.max(0, Math.min(100, (item.value / chartMax) * 100))}%`,
                backgroundColor: item.color ?? theme.colors.primary,
                borderRadius: 6,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
