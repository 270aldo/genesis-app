import { Slot } from 'expo-router';
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout';
import { DrawerProvider, useDrawer } from '../../contexts/DrawerContext';
import { PanelProvider } from '../../contexts/PanelContext';
import { SpaceDrawer } from '../../components/chat/SpaceDrawer';

const DRAWER_WIDTH = 300;

function ChatDrawerLayout() {
  const { drawerRef } = useDrawer();

  return (
    <DrawerLayout
      ref={drawerRef as any}
      drawerWidth={DRAWER_WIDTH}
      drawerPosition="left"
      drawerType="front"
      overlayColor="rgba(0, 0, 0, 0.6)"
      drawerBackgroundColor="#0D0D2B"
      renderNavigationView={() => <SpaceDrawer />}
    >
      <Slot />
    </DrawerLayout>
  );
}

export default function ChatLayout() {
  return (
    <DrawerProvider>
      <PanelProvider>
        <ChatDrawerLayout />
      </PanelProvider>
    </DrawerProvider>
  );
}
