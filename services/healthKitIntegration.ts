export interface HealthSnapshot {
  steps: number;
  restingHeartRate: number | null;
  sleepHours: number | null;
}

export const healthKitIntegration = {
  async getDailySnapshot(): Promise<HealthSnapshot> {
    return {
      steps: 0,
      restingHeartRate: null,
      sleepHours: null,
    };
  },
};
