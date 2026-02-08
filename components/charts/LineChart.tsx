import { View } from 'react-native';
import { theme } from '../../constants/theme';

type LineChartProps = {
  data: number[];
};

export function LineChart({ data }: LineChartProps) {
  const max = Math.max(...data, 1);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 72 }}>
      {data.map((value, index) => (
        <View
          key={`line-${index}`}
          style={{
            flex: 1,
            height: Math.max(4, (value / max) * 72),
            borderRadius: 4,
            backgroundColor: `${theme.colors.info}AA`,
          }}
        />
      ))}
    </View>
  );
}
