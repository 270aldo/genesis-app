import { useCallback, useRef, useState } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { BodyMapAnterior } from './BodyMapAnterior';
import { BodyMapPosterior } from './BodyMapPosterior';
import { GENESIS_COLORS } from '../../constants/colors';
import type { MuscleZone, RecoveryStatus } from '../../utils/muscleRecovery';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAP_WIDTH = SCREEN_WIDTH - 40; // 20px padding each side

interface BodyMapSVGProps {
  colorMap: Partial<Record<MuscleZone, RecoveryStatus>>;
  onZonePress?: (zone: MuscleZone) => void;
}

export function BodyMapSVG({ colorMap, onZonePress }: BodyMapSVGProps) {
  const [activePage, setActivePage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / MAP_WIDTH);
    setActivePage(page);
  }, []);

  return (
    <View style={{ alignItems: 'center', gap: 12 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ width: MAP_WIDTH }}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <View style={{ width: MAP_WIDTH, alignItems: 'center', paddingVertical: 8 }}>
          <BodyMapAnterior
            colorMap={colorMap}
            onZonePress={onZonePress}
            width={180}
            height={310}
          />
        </View>
        <View style={{ width: MAP_WIDTH, alignItems: 'center', paddingVertical: 8 }}>
          <BodyMapPosterior
            colorMap={colorMap}
            onZonePress={onZonePress}
            width={180}
            height={310}
          />
        </View>
      </ScrollView>

      {/* Dot indicators */}
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        {['Anterior', 'Posterior'].map((label, i) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View
              style={{
                width: activePage === i ? 20 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: activePage === i ? GENESIS_COLORS.primary : GENESIS_COLORS.borderSubtle,
              }}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
