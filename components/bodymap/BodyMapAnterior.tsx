import Svg, { Path, G } from 'react-native-svg';
import { BODY_MAP_COLORS } from '../../constants/colors';
import type { MuscleZone, RecoveryStatus } from '../../utils/muscleRecovery';

interface BodyMapAnteriorProps {
  colorMap: Partial<Record<MuscleZone, RecoveryStatus>>;
  onZonePress?: (zone: MuscleZone) => void;
  width?: number;
  height?: number;
}

function getColor(status: RecoveryStatus | undefined): string {
  if (!status) return BODY_MAP_COLORS.inactive;
  return BODY_MAP_COLORS[status];
}

export function BodyMapAnterior({ colorMap, onZonePress, width = 200, height = 340 }: BodyMapAnteriorProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 200 340" fill="none">
      {/* Head */}
      <Path
        d="M90 30 Q90 10 100 10 Q110 10 110 30 Q110 45 100 45 Q90 45 90 30Z"
        fill={BODY_MAP_COLORS.inactive}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={0.5}
      />
      {/* Neck */}
      <Path
        d="M95 45 L105 45 L105 55 L95 55Z"
        fill={BODY_MAP_COLORS.inactive}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={0.5}
      />

      {/* Chest */}
      <G onPress={() => onZonePress?.('chest')}>
        <Path
          d="M72 60 Q86 55 100 55 Q114 55 128 60 L128 90 Q114 95 100 95 Q86 95 72 90Z"
          fill={getColor(colorMap.chest)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
      </G>

      {/* Front Deltoids */}
      <G onPress={() => onZonePress?.('front_deltoids')}>
        <Path
          d="M60 55 Q72 50 72 60 L72 80 Q60 78 55 70Z"
          fill={getColor(colorMap.front_deltoids)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
        <Path
          d="M140 55 Q128 50 128 60 L128 80 Q140 78 145 70Z"
          fill={getColor(colorMap.front_deltoids)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
      </G>

      {/* Biceps */}
      <G onPress={() => onZonePress?.('biceps')}>
        <Path
          d="M55 75 L60 75 L62 120 L52 120Z"
          fill={getColor(colorMap.biceps)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
        <Path
          d="M140 75 L145 75 L148 120 L138 120Z"
          fill={getColor(colorMap.biceps)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
      </G>

      {/* Abs */}
      <G onPress={() => onZonePress?.('abs')}>
        <Path
          d="M80 95 L120 95 L118 155 Q100 160 82 155Z"
          fill={getColor(colorMap.abs)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
      </G>

      {/* Hip Flexors */}
      <G onPress={() => onZonePress?.('hip_flexors')}>
        <Path
          d="M82 155 L98 155 L92 175 L78 170Z"
          fill={getColor(colorMap.hip_flexors)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
        <Path
          d="M102 155 L118 155 L122 170 L108 175Z"
          fill={getColor(colorMap.hip_flexors)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
      </G>

      {/* Quads */}
      <G onPress={() => onZonePress?.('quads')}>
        <Path
          d="M78 170 L92 175 L90 260 L75 260Z"
          fill={getColor(colorMap.quads)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
        <Path
          d="M108 175 L122 170 L125 260 L110 260Z"
          fill={getColor(colorMap.quads)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
      </G>

      {/* Forearms (non-interactive, decorative) */}
      <Path
        d="M50 125 L58 125 L56 170 L48 170Z"
        fill={BODY_MAP_COLORS.inactive}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={0.5}
      />
      <Path
        d="M142 125 L150 125 L152 170 L144 170Z"
        fill={BODY_MAP_COLORS.inactive}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={0.5}
      />

      {/* Shins (non-interactive, decorative) */}
      <Path
        d="M75 265 L90 265 L88 330 L78 330Z"
        fill={BODY_MAP_COLORS.inactive}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={0.5}
      />
      <Path
        d="M110 265 L125 265 L122 330 L112 330Z"
        fill={BODY_MAP_COLORS.inactive}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={0.5}
      />
    </Svg>
  );
}
