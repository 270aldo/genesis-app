import { Tabs } from 'expo-router';
import { CustomTabBar } from '../../components/navigation';
import { theme } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.bgStart },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'HOME' }} />
      <Tabs.Screen name="train" options={{ title: 'TRAIN' }} />
      <Tabs.Screen name="fuel" options={{ title: 'FUEL' }} />
      <Tabs.Screen name="mind" options={{ title: 'MIND' }} />
      <Tabs.Screen name="track" options={{ title: 'TRACK' }} />
    </Tabs>
  );
}
