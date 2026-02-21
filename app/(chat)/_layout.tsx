import { useEffect } from 'react';
import { Slot } from 'expo-router';
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout';
import { DrawerProvider, useDrawer } from '../../contexts/DrawerContext';
import { PanelProvider } from '../../contexts/PanelContext';
import { SpaceDrawer } from '../../components/chat/SpaceDrawer';
import { useAuthStore } from '../../stores/useAuthStore';
import { useSeasonStore } from '../../stores/useSeasonStore';
import { useTrainingStore } from '../../stores/useTrainingStore';
import { useNutritionStore } from '../../stores/useNutritionStore';
import { useTrackStore } from '../../stores/useTrackStore';
import { useGenesisStore } from '../../stores/useGenesisStore';

const DRAWER_WIDTH = 300;

/** Renderless component that hydrates all stores when a session exists */
function ChatHydrator() {
  const session = useAuthStore((s) => s.session);

  useEffect(() => {
    if (!session) return;
    // Fire all fetches in parallel via getState() — no re-render triggers
    useSeasonStore.getState().fetchSeasonPlan();
    useTrainingStore.getState().fetchTodayPlan();
    useNutritionStore.getState().fetchMeals();
    useTrackStore.getState().fetchStreak();
    useGenesisStore.getState().loadConversation();
  }, [session]);

  return null;
}

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
        <ChatHydrator />
        <ChatDrawerLayout />
      </PanelProvider>
    </DrawerProvider>
  );
}
