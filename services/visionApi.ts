export interface VisionFoodScanResult {
  detectedItems: Array<{ name: string; confidence: number }>;
  estimatedCalories: number;
}

export interface VisionEquipmentResult {
  detectedEquipment: Array<{ name: string; confidence: number }>;
}

const visionApiUrl = process.env.EXPO_PUBLIC_VISION_API_URL ?? '';

export const visionApi = {
  async scanFood(imageBase64: string): Promise<VisionFoodScanResult> {
    if (!visionApiUrl) {
      return { detectedItems: [], estimatedCalories: 0 };
    }

    const response = await fetch(`${visionApiUrl}/scan-food`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
    });

    if (!response.ok) throw new Error('Vision API scanFood failed');
    return (await response.json()) as VisionFoodScanResult;
  },

  async detectEquipment(imageBase64: string): Promise<VisionEquipmentResult> {
    if (!visionApiUrl) {
      return { detectedEquipment: [] };
    }

    const response = await fetch(`${visionApiUrl}/detect-equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
    });

    if (!response.ok) throw new Error('Vision API detectEquipment failed');
    return (await response.json()) as VisionEquipmentResult;
  },
};
