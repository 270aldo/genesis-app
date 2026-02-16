import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { GENESIS_COLORS } from '../../constants/colors';

export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';

interface MuscleGroupIconProps {
  group: MuscleGroup;
  size?: number;
  color?: string;
}

export function MuscleGroupIcon({ group, size = 20, color = GENESIS_COLORS.textPrimary }: MuscleGroupIconProps) {
  switch (group) {
    case 'chest':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 8C4 8 6 4 12 4C18 4 20 8 20 8" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M4 8C4 8 6 14 12 14C18 14 20 8 20 8" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Line x1="12" y1="14" x2="12" y2="20" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );
    case 'back':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 4V20" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M8 6L12 4L16 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M7 10L12 8L17 10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M8 14L12 12L16 14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'legs':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M9 4V12L7 20" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M15 4V12L17 20" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M9 10H15" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );
    case 'shoulders':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="8" r="3" stroke={color} strokeWidth={2} />
          <Path d="M5 14C5 14 7 10 12 10C17 10 19 14 19 14" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M3 16H7" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M17 16H21" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );
    case 'arms':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M6 4L6 10L10 14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="6" cy="7" r="2.5" stroke={color} strokeWidth={2} />
          <Path d="M14 14L18 10L18 4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="18" cy="7" r="2.5" stroke={color} strokeWidth={2} />
        </Svg>
      );
    case 'core':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="7" y="4" width="10" height="16" rx="2" stroke={color} strokeWidth={2} />
          <Line x1="7" y1="8" x2="17" y2="8" stroke={color} strokeWidth={1.5} />
          <Line x1="7" y1="12" x2="17" y2="12" stroke={color} strokeWidth={1.5} />
          <Line x1="7" y1="16" x2="17" y2="16" stroke={color} strokeWidth={1.5} />
          <Line x1="12" y1="4" x2="12" y2="20" stroke={color} strokeWidth={1.5} />
        </Svg>
      );
    case 'cardio':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 20C12 20 4 14 4 9C4 6 6 4 9 4C10.5 4 11.5 5 12 6C12.5 5 13.5 4 15 4C18 4 20 6 20 9C20 14 12 20 12 20Z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M4 12H8L10 9L12 15L14 11L16 12H20" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    default:
      return null;
  }
}
