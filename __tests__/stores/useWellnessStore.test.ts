import { useWellnessStore } from '../../stores/useWellnessStore';

beforeEach(() => {
  useWellnessStore.setState({
    todayCheckIn: null,
    weeklyCheckIns: [],
    isLoading: false,
  });
});

describe('useWellnessStore', () => {
  it('has correct initial state (todayCheckIn null, empty weeklyCheckIns)', () => {
    const state = useWellnessStore.getState();
    expect(state.todayCheckIn).toBeNull();
    expect(state.weeklyCheckIns).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it('updateCheckIn() creates/updates todayCheckIn', () => {
    // First call creates a new check-in
    useWellnessStore.getState().updateCheckIn({ mood: 'good', sleepHours: 8 });
    let state = useWellnessStore.getState();
    expect(state.todayCheckIn).not.toBeNull();
    expect(state.todayCheckIn!.mood).toBe('good');
    expect(state.todayCheckIn!.sleepHours).toBe(8);

    // Second call merges into existing
    useWellnessStore.getState().updateCheckIn({ stressLevel: 3, energyLevel: 8 });
    state = useWellnessStore.getState();
    expect(state.todayCheckIn!.mood).toBe('good');
    expect(state.todayCheckIn!.stressLevel).toBe(3);
    expect(state.todayCheckIn!.energyLevel).toBe(8);
  });

  it('calculateWellnessScore() with good data returns high score', () => {
    useWellnessStore.setState({
      todayCheckIn: {
        date: new Date().toISOString(),
        mood: 'excellent',
        sleepHours: 8,
        sleepQuality: 'excellent',
        stressLevel: 2,
        energyLevel: 9,
      },
    });

    const score = useWellnessStore.getState().calculateWellnessScore();
    expect(score).toBeGreaterThanOrEqual(90);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('calculateWellnessScore() with no checkIn returns 0', () => {
    const score = useWellnessStore.getState().calculateWellnessScore();
    expect(score).toBe(0);
  });

  it('getRecoveryRecommendations() returns default when no checkIn, specific when data exists', () => {
    // No check-in: default message
    const defaultRecs = useWellnessStore.getState().getRecoveryRecommendations();
    expect(defaultRecs).toHaveLength(1);
    expect(defaultRecs[0]).toContain('check-in');

    // With poor data: specific recommendations
    useWellnessStore.setState({
      todayCheckIn: {
        date: new Date().toISOString(),
        mood: 'poor',
        sleepHours: 4,
        sleepQuality: 'poor',
        stressLevel: 9,
        energyLevel: 2,
      },
    });

    const recs = useWellnessStore.getState().getRecoveryRecommendations();
    expect(recs.length).toBeGreaterThanOrEqual(2);
    // Should mention sleep and stress/energy recommendations
    expect(recs.some((r) => r.toLowerCase().includes('sueño') || r.toLowerCase().includes('sleep'))).toBe(true);
  });
});
