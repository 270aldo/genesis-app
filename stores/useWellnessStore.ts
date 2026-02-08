import { create } from 'zustand';
import type { WellnessCheckIn } from '../types';

type WellnessState = {
  todayCheckIn: WellnessCheckIn | null;
  weeklyCheckIns: WellnessCheckIn[];
  updateCheckIn: (checkIn: Partial<WellnessCheckIn>) => void;
  addWeeklyCheckIn: (checkIn: WellnessCheckIn) => void;
  calculateWellnessScore: () => number;
  getRecoveryRecommendations: () => string[];
};

export const useWellnessStore = create<WellnessState>((set, get) => ({
  todayCheckIn: null,
  weeklyCheckIns: [],
  updateCheckIn: (checkIn) =>
    set((state) => ({
      todayCheckIn: state.todayCheckIn
        ? { ...state.todayCheckIn, ...checkIn }
        : ({
            date: new Date().toISOString(),
            mood: 'neutral',
            sleepHours: 0,
            sleepQuality: 'fair',
            stressLevel: 5,
            energyLevel: 5,
            ...checkIn,
          } as WellnessCheckIn),
    })),
  addWeeklyCheckIn: (checkIn) =>
    set((state) => ({ weeklyCheckIns: [checkIn, ...state.weeklyCheckIns].slice(0, 7) })),
  calculateWellnessScore: () => {
    const checkIn = get().todayCheckIn;
    if (!checkIn) return 0;

    const moodScores: Record<WellnessCheckIn['mood'], number> = {
      excellent: 25,
      good: 20,
      neutral: 15,
      poor: 5,
      terrible: 0,
    };

    let score = 0;
    score += checkIn.sleepHours >= 7 ? 25 : (checkIn.sleepHours / 7) * 25;
    score += checkIn.stressLevel <= 4 ? 25 : ((10 - checkIn.stressLevel) / 6) * 25;
    score += checkIn.energyLevel >= 7 ? 25 : (checkIn.energyLevel / 7) * 25;
    score += moodScores[checkIn.mood];

    return Math.round(Math.max(0, Math.min(score, 100)));
  },
  getRecoveryRecommendations: () => {
    const checkIn = get().todayCheckIn;
    if (!checkIn) return ['Completa tu check-in para recomendaciones personalizadas.'];

    const recommendations: string[] = [];

    if (checkIn.sleepHours < 6) recommendations.push('Prioriza 7-8 horas de sueño esta noche.');
    if (checkIn.stressLevel > 7) recommendations.push('Haz una sesión breve de respiración guiada.');
    if (checkIn.energyLevel < 4) recommendations.push('Reduce intensidad y programa recuperación activa.');
    if (recommendations.length === 0) recommendations.push('Estado sólido: mantén tu plan y progresión actual.');

    return recommendations;
  },
}));
