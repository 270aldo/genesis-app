import Svg, { Polyline } from 'react-native-svg';
import { GENESIS_COLORS } from '../../constants/colors';

interface MicroSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function MicroSparkline({ data, width = 80, height = 24, color = GENESIS_COLORS.primary }: MicroSparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data
    .map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
