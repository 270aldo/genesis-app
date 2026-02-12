import { Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { CustomTabBar } from '../../components/navigation';
import { theme } from '../../constants/theme';
import { useOfflineSupport } from '../../hooks/useOfflineSupport';
import { GENESIS_COLORS } from '../../constants/colors';

export default function TabsLayout() {
  const { isOnline, pendingCount, syncStatus } = useOfflineSupport();

  return (
    <View style={{ flex: 1 }}>
      {/* Offline banner */}
      {(!isOnline || syncStatus === 'syncing') && (
        <View
          style={{
            backgroundColor: !isOnline ? '#EF4444' : GENESIS_COLORS.primary,
            paddingVertical: 4,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 11, fontFamily: 'JetBrainsMonoMedium' }}>
            {!isOnline
              ? `OFFLINE${pendingCount > 0 ? ` · ${pendingCount} pending` : ''}`
              : `SYNCING ${pendingCount} operations...`}
          </Text>
        </View>
      )}
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
    </View>
  );
}
