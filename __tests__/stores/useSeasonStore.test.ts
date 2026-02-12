import { useSeasonStore } from '../../stores/useSeasonStore';

const initialState = {
  seasonNumber: 1,
  currentWeek: 1,
  currentPhase: 'strength',
  weeks: [],
  startDate: '',
  endDate: '',
  progressPercent: 0,
  isLoading: false,
};

beforeEach(() => {
  useSeasonStore.setState(initialState);
});

describe('useSeasonStore', () => {
  it('has correct initial state (seasonNumber=1, currentWeek=1, empty weeks)', () => {
    const state = useSeasonStore.getState();
    expect(state.seasonNumber).toBe(1);
    expect(state.currentWeek).toBe(1);
    expect(state.weeks).toEqual([]);
    expect(state.progressPercent).toBe(0);
  });

  it('setCurrentWeek() updates currentWeek', () => {
    useSeasonStore.getState().setCurrentWeek(5);
    expect(useSeasonStore.getState().currentWeek).toBe(5);
  });

  it('completeWeek() marks specific week as completed', () => {
    // Set up some weeks
    useSeasonStore.setState({
      weeks: [
        { number: 1, phase: 'hypertrophy', startDate: '2026-01-01', endDate: '2026-01-07', completed: false },
        { number: 2, phase: 'hypertrophy', startDate: '2026-01-08', endDate: '2026-01-14', completed: false },
        { number: 3, phase: 'strength', startDate: '2026-01-15', endDate: '2026-01-21', completed: false },
      ],
    });

    useSeasonStore.getState().completeWeek(2);

    const state = useSeasonStore.getState();
    expect(state.weeks[0].completed).toBe(false);
    expect(state.weeks[1].completed).toBe(true);
    expect(state.weeks[2].completed).toBe(false);
  });

  it('setProgressPercent() updates progressPercent', () => {
    useSeasonStore.getState().setProgressPercent(42);
    expect(useSeasonStore.getState().progressPercent).toBe(42);
  });

  it('fetchSeasonPlan() in demo mode generates 12 weeks', async () => {
    await useSeasonStore.getState().fetchSeasonPlan();
    const state = useSeasonStore.getState();

    expect(state.weeks).toHaveLength(12);
    expect(state.isLoading).toBe(false);
    expect(state.startDate).not.toBe('');
    expect(state.endDate).not.toBe('');

    // First 4 weeks should be hypertrophy, next 4 strength, last 4 power
    expect(state.weeks[0].phase).toBe('hypertrophy');
    expect(state.weeks[4].phase).toBe('strength');
    expect(state.weeks[8].phase).toBe('power');
  });
});
