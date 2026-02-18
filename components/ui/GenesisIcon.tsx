import Svg, { Path, Circle } from 'react-native-svg';

type GenesisIconProps = {
  size?: number;
  color?: string;
};

export function GenesisIcon({ size = 24, color = '#FFFFFF' }: GenesisIconProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  const dotR = size * 0.08;

  // Build hexagon path (6-point polygon, flat-top)
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const px = cx + r * Math.cos(angle);
    const py = cy + r * Math.sin(angle);
    return `${px},${py}`;
  });
  const d = `M${points.join('L')}Z`;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path d={d} stroke={color} strokeWidth={size * 0.06} fill="none" strokeLinejoin="round" />
      <Circle cx={cx} cy={cy} r={dotR} fill={color} />
    </Svg>
  );
}
