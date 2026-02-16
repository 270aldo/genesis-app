import Svg, { Path, G } from 'react-native-svg';
import { BODY_MAP_COLORS } from '../../constants/colors';
import type { MuscleZone, RecoveryStatus } from '../../utils/muscleRecovery';

interface BodyMapPosteriorProps {
  colorMap: Partial<Record<MuscleZone, RecoveryStatus>>;
  onZonePress?: (zone: MuscleZone) => void;
  width?: number;
  height?: number;
}

function getColor(status: RecoveryStatus | undefined): string {
  if (!status) return BODY_MAP_COLORS.inactive;
  return BODY_MAP_COLORS[status];
}

export function BodyMapPosterior({ colorMap, onZonePress, width = 200, height = 340 }: BodyMapPosteriorProps) {
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

      {/* Upper Back */}
      <G onPress={() => onZonePress?.('upper_back')}>
        <Path
          d="M72 55 Q86 52 100 52 Q114 52 128 55 L128 80 Q114 83 100 83 Q86 83 72 80Z"
          fill={getColor(colorMap.upper_back)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
      </G>

      {/* Rear Deltoids */}
      <G onPress={() => onZonePress?.('rear_deltoids')}>
        <Path
          d="M60 52 Q72 48 72 55 L72 75 Q60 73 55 65Z"
          fill={getColor(colorMap.rear_deltoids)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
        <Path
          d="M140 52 Q128 48 128 55 L128 75 Q140 73 145 65Z"
          fill={getColor(colorMap.rear_deltoids)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
      </G>

      {/* Triceps */}
      <G onPress={() => onZonePress?.('triceps')}>
        <Path
          d="M55 75 L60 75 L62 120 L52 120Z"
          fill={getColor(colorMap.triceps)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
        <Path
          d="M140 75 L145 75 L148 120 L138 120Z"
          fill={getColor(colorMap.triceps)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
      </G>

      {/* Lats */}
      <G onPress={() => onZonePress?.('lats')}>
        <Path
          d="M72 80 L90 85 L88 130 L72 125Z"
          fill={getColor(colorMap.lats)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
        <Path
          d="M128 80 L110 85 L112 130 L128 125Z"
          fill={getColor(colorMap.lats)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
      </G>

      {/* Lower back (non-interactive, decorative) */}
      <Path
        d="M88 130 L112 130 L115 155 Q100 160 85 155Z"
        fill={BODY_MAP_COLORS.inactive}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={0.5}
      />

      {/* Glutes */}
      <G onPress={() => onZonePress?.('glutes')}>
        <Path
          d="M78 155 L100 160 L100 185 L75 180Z"
          fill={getColor(colorMap.glutes)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
        <Path
          d="M100 160 L122 155 L125 180 L100 185Z"
          fill={getColor(colorMap.glutes)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
      </G>

      {/* Hamstrings */}
      <G onPress={() => onZonePress?.('hamstrings')}>
        <Path
          d="M75 185 L95 188 L92 265 L75 265Z"
          fill={getColor(colorMap.hamstrings)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
        <Path
          d="M105 188 L125 185 L125 265 L108 265Z"
          fill={getColor(colorMap.hamstrings)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
      </G>

      {/* Calves */}
      <G onPress={() => onZonePress?.('calves')}>
        <Path
          d="M75 268 L92 268 L88 330 L78 330Z"
          fill={getColor(colorMap.calves)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />
        <Path
          d="M108 268 L125 268 L122 330 L112 330Z"
          fill={getColor(colorMap.calves)}
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
    </Svg>
  );
}
