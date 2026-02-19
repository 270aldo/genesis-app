import { useEffect, useState, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ChevronDown } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GENESIS_COLORS } from '../../constants/colors';

type CollapsibleSectionProps = {
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  accentColor?: string;
  storageKey?: string;
  headerRight?: React.ReactNode;
};

export function CollapsibleSection({
  title,
  subtitle,
  defaultExpanded = true,
  children,
  accentColor = GENESIS_COLORS.textSecondary,
  storageKey,
  headerRight,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const chevronRotation = useSharedValue(defaultExpanded ? 180 : 0);

  // Load persisted state
  useEffect(() => {
    if (!storageKey) return;
    (async () => {
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored !== null) {
        const isExpanded = stored === 'true';
        setExpanded(isExpanded);
        chevronRotation.value = isExpanded ? 180 : 0;
      }
    })();
  }, [storageKey]);

  const toggle = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      chevronRotation.value = withTiming(next ? 180 : 0, { duration: 250 });
      if (storageKey) {
        AsyncStorage.setItem(storageKey, String(next));
      }
      return next;
    });
  }, [storageKey, chevronRotation]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  return (
    <View>
      <Pressable
        onPress={toggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 8,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{
            color: accentColor,
            fontSize: 11,
            fontFamily: 'JetBrainsMonoSemiBold',
            letterSpacing: 1.5,
          }}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={{
              color: GENESIS_COLORS.textMuted,
              fontSize: 10,
              fontFamily: 'Inter',
              marginTop: 2,
            }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {headerRight}
          <Animated.View style={chevronStyle}>
            <ChevronDown size={16} color={GENESIS_COLORS.textMuted} />
          </Animated.View>
        </View>
      </Pressable>

      {expanded && children}
    </View>
  );
}
