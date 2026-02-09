import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Dumbbell, Flame, Brain, BarChart3 } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';

const tabs: { name: string; label: string; icon: LucideIcon }[] = [
  { name: 'home', label: 'HOME', icon: Home },
  { name: 'train', label: 'TRAIN', icon: Dumbbell },
  { name: 'fuel', label: 'FUEL', icon: Flame },
  { name: 'mind', label: 'MIND', icon: Brain },
  { name: 'track', label: 'TRACK', icon: BarChart3 },
];

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={20}
      tint="dark"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: '#14121aCC',
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 16),
      }}
    >
      {state.routes.map((route, index) => {
        const tab = tabs.find((t) => t.name === route.name);
        if (!tab) return null;

        const isFocused = state.index === index;
        const IconComponent = tab.icon;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            className="flex-1 items-center gap-1"
          >
            <IconComponent
              size={22}
              color={isFocused ? GENESIS_COLORS.primary : GENESIS_COLORS.chromeDark}
              strokeWidth={1.5}
            />
            <Text
              style={{
                color: isFocused ? GENESIS_COLORS.primary : GENESIS_COLORS.chromeDark,
                fontSize: 9,
                fontFamily: isFocused ? 'JetBrainsMonoSemiBold' : 'JetBrainsMono',
                letterSpacing: 0.5,
              }}
            >
              {tab.label}
            </Text>
            {isFocused && (
              <View style={{ height: 4, width: 4, borderRadius: 2, backgroundColor: GENESIS_COLORS.primary }} />
            )}
          </Pressable>
        );
      })}
    </BlurView>
  );
}
