import {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
  type PropsWithChildren,
} from 'react';

import { WorkoutPanel } from '../components/panels/WorkoutPanel';
import { MealPanel } from '../components/panels/MealPanel';
import { ProgressPanel } from '../components/panels/ProgressPanel';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PanelType = 'workout' | 'meal' | 'progress';

interface WorkoutData {
  /** Optional workout ID to resume or load */
  id?: string;
  name?: string;
}

interface PanelState {
  activePanel: PanelType | null;
  workoutData?: WorkoutData;
}

interface PanelContextValue {
  /** Current panel state */
  activePanel: PanelType | null;

  /** Open the workout logging panel, optionally passing workout data */
  openWorkoutPanel: (workoutData?: WorkoutData) => void;

  /** Open the meal plan panel */
  openMealPanel: () => void;

  /** Open the progress overview panel */
  openProgressPanel: () => void;

  /** Close whichever panel is currently open */
  closePanel: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const PanelContext = createContext<PanelContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function PanelProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<PanelState>({
    activePanel: null,
    workoutData: undefined,
  });

  const openWorkoutPanel = useCallback((workoutData?: WorkoutData) => {
    setState({ activePanel: 'workout', workoutData });
  }, []);

  const openMealPanel = useCallback(() => {
    setState({ activePanel: 'meal', workoutData: undefined });
  }, []);

  const openProgressPanel = useCallback(() => {
    setState({ activePanel: 'progress', workoutData: undefined });
  }, []);

  const closePanel = useCallback(() => {
    setState({ activePanel: null, workoutData: undefined });
  }, []);

  const value = useMemo<PanelContextValue>(
    () => ({
      activePanel: state.activePanel,
      openWorkoutPanel,
      openMealPanel,
      openProgressPanel,
      closePanel,
    }),
    [state.activePanel, openWorkoutPanel, openMealPanel, openProgressPanel, closePanel],
  );

  return (
    <PanelContext.Provider value={value}>
      {children}

      {/* Render the active panel as an overlay */}
      {state.activePanel === 'workout' && <WorkoutPanel onClose={closePanel} />}
      {state.activePanel === 'meal' && <MealPanel onClose={closePanel} />}
      {state.activePanel === 'progress' && <ProgressPanel onClose={closePanel} />}
    </PanelContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePanels(): PanelContextValue {
  const ctx = useContext(PanelContext);
  if (!ctx) {
    throw new Error('usePanels must be used within a <PanelProvider>');
  }
  return ctx;
}
