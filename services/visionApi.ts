export interface VisionFoodScanResult {
  detectedItems: Array<{ name: string; confidence: number }>;
  estimatedCalories: number;
  estimatedProtein?: number;
  estimatedCarbs?: number;
  estimatedFat?: number;
}

export interface VisionEquipmentResult {
  detectedEquipment: Array<{ name: string; confidence: number }>;
}

import { useAuthStore } from '../stores/useAuthStore';

const bffUrl = process.env.EXPO_PUBLIC_BFF_URL ?? '';

function getAuthHeaders(): Record<string, string> {
  const token = useAuthStore.getState().session?.access_token;
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}

export const visionApi = {
  async scanFood(imageBase64: string): Promise<VisionFoodScanResult> {
    if (!bffUrl) {
      return { detectedItems: [], estimatedCalories: 0 };
    }

    const response = await fetch(`${bffUrl}/mobile/vision/scan-food`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ imageBase64, mode: 'food' }),
    });

    if (!response.ok) throw new Error('Vision API scanFood failed');
    return (await response.json()) as VisionFoodScanResult;
  },

  async detectEquipment(imageBase64: string): Promise<VisionEquipmentResult> {
    if (!bffUrl) {
      return { detectedEquipment: [] };
    }

    const response = await fetch(`${bffUrl}/mobile/vision/detect-equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ imageBase64, mode: 'equipment' }),
    });

    if (!response.ok) throw new Error('Vision API detectEquipment failed');
    return (await response.json()) as VisionEquipmentResult;
  },
};
