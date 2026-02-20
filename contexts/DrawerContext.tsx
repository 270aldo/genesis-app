import { createContext, useContext, useRef, useCallback, type PropsWithChildren } from 'react';
import type DrawerLayout from 'react-native-gesture-handler/DrawerLayout';

type DrawerContextValue = {
  openDrawer: () => void;
  closeDrawer: () => void;
  drawerRef: React.RefObject<DrawerLayout | null>;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function DrawerProvider({ children }: PropsWithChildren) {
  const drawerRef = useRef<DrawerLayout | null>(null);

  const openDrawer = useCallback(() => {
    drawerRef.current?.openDrawer();
  }, []);

  const closeDrawer = useCallback(() => {
    drawerRef.current?.closeDrawer();
  }, []);

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer, drawerRef }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useDrawer must be used within DrawerProvider');
  return ctx;
}
