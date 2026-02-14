import { useTrainingStore } from '../../stores/useTrainingStore';
import type { WorkoutSession } from '../../types/models';

const mockSession: WorkoutSession = {
  id: 'session-1',
  date: '2026-02-11',
  duration: 0,
  completed: false,
  exercises: [
    { id: 'ex-1', name: 'Bench Press', sets: 3, reps: 8, weight: 80, unit: 'kg' as const, completed: false },
    { id: 'ex-2', name: 'Overhead Press', sets: 3, reps: 10, weight: 40, unit: 'kg' as const, completed: false },
  ],
};

const initialState = {
  currentSession: null,
  previousSessions: [],
  isLoading: false,
  isRestTimerActive: false,
  restTimeRemaining: 0,
  error: null,
  todayPlan: null,
  isTodayPlanLoading: false,
  exerciseCatalog: [],
  isCatalogLoading: false,
  workoutStatus: 'idle' as const,
  startTime: null,
  elapsedSeconds: 0,
  currentExerciseIndex: 0,
  currentSetIndex: 0,
};

beforeEach(() => {
  useTrainingStore.setState(initialState);
});

describe('useTrainingStore', () => {
  it('has correct initial state (workoutStatus=idle, no session)', () => {
    const state = useTrainingStore.getState();
    expect(state.workoutStatus).toBe('idle');
    expect(state.currentSession).toBeNull();
    expect(state.previousSessions).toEqual([]);
    expect(state.elapsedSeconds).toBe(0);
  });

  it('startWorkout() sets status=active and creates exerciseSets from session exercises', () => {
    useTrainingStore.getState().startWorkout(mockSession);
    const state = useTrainingStore.getState();

    expect(state.workoutStatus).toBe('active');
    expect(state.currentSession).not.toBeNull();
    expect(state.startTime).not.toBeNull();
    expect(state.currentExerciseIndex).toBe(0);

    // Check exerciseSets were created for first exercise (3 sets)
    const ex1 = state.currentSession!.exercises[0];
    expect(ex1.exerciseSets).toHaveLength(3);
    expect(ex1.exerciseSets![0].setNumber).toBe(1);
    expect(ex1.exerciseSets![0].targetReps).toBe(8);
    expect(ex1.exerciseSets![0].targetWeight).toBe(80);
    expect(ex1.exerciseSets![0].completed).toBe(false);

    // Second exercise (3 sets of 10 reps)
    const ex2 = state.currentSession!.exercises[1];
    expect(ex2.exerciseSets).toHaveLength(3);
    expect(ex2.exerciseSets![0].targetReps).toBe(10);
  });

  it('logSet() updates the correct set with actual data and marks completed', () => {
    useTrainingStore.getState().startWorkout(mockSession);
    useTrainingStore.getState().logSet('ex-1', 1, { actualReps: 8, actualWeight: 85, rpe: 8 });

    const state = useTrainingStore.getState();
    const ex1 = state.currentSession!.exercises[0];
    const set1 = ex1.exerciseSets![0];

    expect(set1.completed).toBe(true);
    expect(set1.actualReps).toBe(8);
    expect(set1.actualWeight).toBe(85);
    expect(set1.rpe).toBe(8);

    // Other sets should remain incomplete
    expect(ex1.exerciseSets![1].completed).toBe(false);
  });

  it('pauseWorkout()/resumeWorkout() toggle status', () => {
    useTrainingStore.getState().startWorkout(mockSession);
    expect(useTrainingStore.getState().workoutStatus).toBe('active');

    useTrainingStore.getState().pauseWorkout();
    expect(useTrainingStore.getState().workoutStatus).toBe('paused');

    useTrainingStore.getState().resumeWorkout();
    expect(useTrainingStore.getState().workoutStatus).toBe('active');
  });

  it('advanceToNextExercise() increments index', () => {
    useTrainingStore.getState().startWorkout(mockSession);
    expect(useTrainingStore.getState().currentExerciseIndex).toBe(0);

    useTrainingStore.getState().advanceToNextExercise();
    expect(useTrainingStore.getState().currentExerciseIndex).toBe(1);

    // Should not go beyond exercises length
    useTrainingStore.getState().advanceToNextExercise();
    expect(useTrainingStore.getState().currentExerciseIndex).toBe(1);
  });

  it('finishWorkout() sets status=completed and creates completedSession in previousSessions', async () => {
    useTrainingStore.getState().startWorkout(mockSession);
    useTrainingStore.setState({ elapsedSeconds: 3600 }); // 60 minutes

    await useTrainingStore.getState().finishWorkout();

    const state = useTrainingStore.getState();
    expect(state.workoutStatus).toBe('completed');
    expect(state.currentSession!.completed).toBe(true);
    expect(state.currentSession!.duration).toBe(60);
    expect(state.previousSessions).toHaveLength(1);
    expect(state.previousSessions[0].completed).toBe(true);
  });

  it('resetWorkout() clears everything back to idle', () => {
    useTrainingStore.getState().startWorkout(mockSession);
    expect(useTrainingStore.getState().workoutStatus).toBe('active');

    useTrainingStore.getState().resetWorkout();
    const state = useTrainingStore.getState();

    expect(state.workoutStatus).toBe('idle');
    expect(state.currentSession).toBeNull();
    expect(state.startTime).toBeNull();
    expect(state.elapsedSeconds).toBe(0);
    expect(state.currentExerciseIndex).toBe(0);
    expect(state.currentSetIndex).toBe(0);
  });
});
