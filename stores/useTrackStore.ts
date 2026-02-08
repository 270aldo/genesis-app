import { create } from 'zustand';
import type { Measurement, ProgressPhoto } from '../types';

type TrackingState = {
  measurements: Measurement[];
  photos: ProgressPhoto[];
  strengthMetrics: Record<string, number>;
  streak: number;
  addMeasurement: (measurement: Measurement) => void;
  addPhoto: (photo: ProgressPhoto) => void;
  updateStrengthMetric: (exercise: string, value: number) => void;
  setStreak: (days: number) => void;
  calculateProgressPercent: () => number;
};

export const useTrackStore = create<TrackingState>((set, get) => ({
  measurements: [],
  photos: [],
  strengthMetrics: {},
  streak: 0,
  addMeasurement: (measurement) => set((state) => ({ measurements: [...state.measurements, measurement] })),
  addPhoto: (photo) => set((state) => ({ photos: [...state.photos, photo] })),
  updateStrengthMetric: (exercise, value) =>
    set((state) => ({ strengthMetrics: { ...state.strengthMetrics, [exercise]: value } })),
  setStreak: (streak) => set({ streak }),
  calculateProgressPercent: () => {
    const state = get();
    const measured = state.measurements.length > 0 ? 40 : 0;
    const photos = state.photos.length > 0 ? 30 : 0;
    const strength = Object.keys(state.strengthMetrics).length > 0 ? 30 : 0;
    return measured + photos + strength;
  },
}));
