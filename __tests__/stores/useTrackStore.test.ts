import { useTrackStore } from '../../stores/useTrackStore';
import type { Measurement } from '../../types/models';

const initialState = {
  measurements: [],
  photos: [],
  strengthMetrics: {},
  streak: 0,
  personalRecords: [],
  isLoading: false,
  error: null,
  completedWorkouts: 0,
  totalPlanned: 0,
  strengthProgress: { exerciseName: '', dataPoints: [], changePercent: 0 },
};

beforeEach(() => {
  useTrackStore.setState(initialState);
});

describe('useTrackStore', () => {
  it('has correct initial state (empty measurements, photos, streak=0)', () => {
    const state = useTrackStore.getState();
    expect(state.measurements).toEqual([]);
    expect(state.photos).toEqual([]);
    expect(state.streak).toBe(0);
    expect(state.strengthMetrics).toEqual({});
  });

  it('addMeasurement() appends to measurements', () => {
    const measurement: Measurement = {
      date: '2026-02-11',
      weight: 82.5,
      bodyFat: 14.2,
    };
    useTrackStore.getState().addMeasurement(measurement);
    const state = useTrackStore.getState();
    expect(state.measurements).toHaveLength(1);
    expect(state.measurements[0].weight).toBe(82.5);
    expect(state.measurements[0].bodyFat).toBe(14.2);
  });

  it('setStreak() sets streak value', () => {
    useTrackStore.getState().setStreak(7);
    expect(useTrackStore.getState().streak).toBe(7);
  });

  it('calculateProgressPercent() returns 0 when all empty, 40 with measurements, 100 with all', () => {
    // All empty
    expect(useTrackStore.getState().calculateProgressPercent()).toBe(0);

    // Only measurements
    useTrackStore.setState({ measurements: [{ date: '2026-02-11', weight: 80 }] });
    expect(useTrackStore.getState().calculateProgressPercent()).toBe(40);

    // Add photos (30%) + strength metrics (30%)
    useTrackStore.setState({
      photos: [{ date: '2026-02-11', category: 'front', storagePath: '/path' }],
      strengthMetrics: { 'Bench Press': 100 },
    });
    expect(useTrackStore.getState().calculateProgressPercent()).toBe(100);
  });

  it('updateStrengthMetric() updates a specific metric', () => {
    useTrackStore.getState().updateStrengthMetric('Bench Press', 100);
    expect(useTrackStore.getState().strengthMetrics['Bench Press']).toBe(100);

    useTrackStore.getState().updateStrengthMetric('Squat', 140);
    const metrics = useTrackStore.getState().strengthMetrics;
    expect(metrics['Bench Press']).toBe(100);
    expect(metrics['Squat']).toBe(140);
  });
});
