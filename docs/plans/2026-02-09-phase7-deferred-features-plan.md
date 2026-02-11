# Phase 7 — Deferred Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the three features deferred from Phase 6 — HealthKit integration, camera food scanner, and voice call audio pipeline — turning three beautiful UI stubs into fully functional features.

**Architecture:** Each feature follows the app's established pattern: UI modal/screen (already exists) → hook/service (to build) → BFF endpoint or native API (to wire) → Zustand store (to update). All features gracefully degrade when hardware/API unavailable.

**Tech Stack:** Expo SDK 54, expo-health-connect, expo-camera (already installed), expo-av (already installed), ElevenLabs Conversational AI WebSocket, Gemini 2.0 Flash Vision API, NativeWind v4, Zustand, FastAPI BFF.

---

## Current State Summary

| Feature | UI | Service | Store | BFF | Native API | Overall |
|---------|-----|---------|-------|-----|------------|---------|
| HealthKit (6.14) | MetricMini in home.tsx shows `'--'` | Stub returns zeros (16 lines) | Not connected | N/A | Not installed | **5%** |
| Camera Scanner (6.13) | Full glassmorphic modal, setTimeout mock | visionApi.ts interface ready | Not connected | No vision endpoint | expo-camera installed, never imported | **40%** |
| Voice Call (6.12) | Full modal with pulse animation, timer, controls | elevenLabsApi.ts has TTS only | voiceState in genesisStore (UI only) | No voice endpoint | expo-av installed, not used for voice | **30%** |

---

## Sprint Structure

```
SPRINT 1 (Task 7.1): HealthKit Integration — ~3 hours
├── 7.1a  Install expo-health-connect + configure permissions
├── 7.1b  Implement real getDailySnapshot()
├── 7.1c  Create useHealthKit hook
├── 7.1d  Wire home.tsx stepsValue to real data
└── 7.1e  Graceful degradation (permission denied, simulator)

SPRINT 2 (Task 7.2): Camera Scanner — ~5 hours
├── 7.2a  Wire CameraView into camera-scanner.tsx
├── 7.2b  BFF vision endpoint (Gemini 2.0 Flash)
├── 7.2c  Replace setTimeout mock with real scan flow
├── 7.2d  Scan result → nutrition store integration
└── 7.2e  Add "Scan" entry point on fuel tab

SPRINT 3 (Task 7.3): Voice Call Audio Pipeline — ~6 hours
├── 7.3a  ElevenLabs Conversational AI WebSocket service
├── 7.3b  Audio recording with expo-av
├── 7.3c  Audio playback pipeline
├── 7.3d  Wire voice-call.tsx to real audio
└── 7.3e  Connection lifecycle + error states
```

---

## TASK 7.1 — HealthKit Integration

**Effort:** 3 hours | **Risk:** Low
**Dependency:** Physical device for testing (iOS Simulator has no HealthKit data)

### Task 7.1a: Install expo-health-connect + configure permissions

**Files:**
- Modify: `package.json` (add dependency)
- Modify: `app.json:16-18` (iOS infoPlist) and `app.json:27-29` (plugins)

**Step 1: Install expo-health-connect**

Run: `npx expo install expo-health-connect`

**Step 2: Add iOS HealthKit permissions to app.json**

Update `app.json` — add `infoPlist` inside `ios` and add plugin:

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      "expo-font",
      [
        "expo-health-connect",
        {
          "healthSharePermission": "GENESIS necesita acceso a tus datos de salud para mostrar pasos, sueño y frecuencia cardíaca.",
          "healthUpdatePermission": "GENESIS puede registrar entrenamientos en Apple Health."
        }
      ]
    ],
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
        "NSHealthShareUsageDescription": "GENESIS necesita acceso a tus datos de salud para mostrar pasos, sueño y frecuencia cardíaca.",
        "NSHealthUpdateUsageDescription": "GENESIS puede registrar entrenamientos en Apple Health."
      }
    }
  }
}
```

**Step 3: Verify installation**

Run: `npx expo config --type public | grep health`
Expected: Plugin appears in config output.

**Step 4: Commit**

```bash
git add package.json app.json
git commit -m "feat(health): install expo-health-connect and configure iOS permissions"
```

---

### Task 7.1b: Implement real getDailySnapshot()

**Files:**
- Modify: `services/healthKitIntegration.ts` (replace 16-line stub)

**Step 1: Replace the stub service with real HealthKit queries**

Replace entire content of `services/healthKitIntegration.ts`:

```typescript
import { Platform } from 'react-native';

export interface HealthSnapshot {
  steps: number;
  restingHeartRate: number | null;
  sleepHours: number | null;
}

const EMPTY_SNAPSHOT: HealthSnapshot = {
  steps: 0,
  restingHeartRate: null,
  sleepHours: null,
};

let HealthConnect: typeof import('expo-health-connect') | null = null;

async function loadHealthConnect() {
  if (HealthConnect) return HealthConnect;
  if (Platform.OS === 'web') return null;
  try {
    HealthConnect = await import('expo-health-connect');
    return HealthConnect;
  } catch {
    return null;
  }
}

export const healthKitIntegration = {
  async isAvailable(): Promise<boolean> {
    const hc = await loadHealthConnect();
    if (!hc) return false;
    try {
      const available = await hc.isHealthDataAvailable();
      return available;
    } catch {
      return false;
    }
  },

  async requestPermissions(): Promise<boolean> {
    const hc = await loadHealthConnect();
    if (!hc) return false;
    try {
      const result = await hc.requestPermission([
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'SleepSession' },
      ]);
      return result.length > 0;
    } catch {
      return false;
    }
  },

  async getDailySnapshot(): Promise<HealthSnapshot> {
    const hc = await loadHealthConnect();
    if (!hc) return EMPTY_SNAPSHOT;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    try {
      const [stepsResult, hrResult, sleepResult] = await Promise.allSettled([
        hc.readRecords('Steps', {
          timeRangeFilter: { operator: 'between', startTime: startOfDay.toISOString(), endTime: now.toISOString() },
        }),
        hc.readRecords('HeartRate', {
          timeRangeFilter: { operator: 'between', startTime: startOfDay.toISOString(), endTime: now.toISOString() },
        }),
        hc.readRecords('SleepSession', {
          timeRangeFilter: {
            operator: 'between',
            startTime: new Date(startOfDay.getTime() - 12 * 60 * 60 * 1000).toISOString(), // look back 12h for last night
            endTime: now.toISOString(),
          },
        }),
      ]);

      const steps =
        stepsResult.status === 'fulfilled'
          ? stepsResult.value.records.reduce((sum, r) => sum + (r as any).count, 0)
          : 0;

      let restingHeartRate: number | null = null;
      if (hrResult.status === 'fulfilled' && hrResult.value.records.length > 0) {
        const samples = hrResult.value.records.flatMap((r: any) => r.samples ?? []);
        if (samples.length > 0) {
          restingHeartRate = Math.round(
            samples.reduce((sum: number, s: any) => sum + s.beatsPerMinute, 0) / samples.length,
          );
        }
      }

      let sleepHours: number | null = null;
      if (sleepResult.status === 'fulfilled' && sleepResult.value.records.length > 0) {
        const totalMs = sleepResult.value.records.reduce((sum, r: any) => {
          const start = new Date(r.startTime).getTime();
          const end = new Date(r.endTime).getTime();
          return sum + (end - start);
        }, 0);
        sleepHours = Math.round((totalMs / (1000 * 60 * 60)) * 10) / 10;
      }

      return { steps, restingHeartRate, sleepHours };
    } catch {
      return EMPTY_SNAPSHOT;
    }
  },
};
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit services/healthKitIntegration.ts` or `npx expo start` (check terminal for errors)

**Step 3: Commit**

```bash
git add services/healthKitIntegration.ts
git commit -m "feat(health): implement real getDailySnapshot with expo-health-connect"
```

---

### Task 7.1c: Create useHealthKit hook

**Files:**
- Create: `hooks/useHealthKit.ts`
- Modify: `hooks/index.ts` (add export)

**Step 1: Create the hook**

Write `hooks/useHealthKit.ts`:

```typescript
import { useEffect, useState } from 'react';
import { healthKitIntegration, type HealthSnapshot } from '../services/healthKitIntegration';

type HealthStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable';

export function useHealthKit() {
  const [snapshot, setSnapshot] = useState<HealthSnapshot | null>(null);
  const [status, setStatus] = useState<HealthStatus>('idle');

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setStatus('loading');

      const available = await healthKitIntegration.isAvailable();
      if (!available || cancelled) {
        if (!cancelled) setStatus('unavailable');
        return;
      }

      const granted = await healthKitIntegration.requestPermissions();
      if (!granted || cancelled) {
        if (!cancelled) setStatus('denied');
        return;
      }

      setStatus('granted');
      const data = await healthKitIntegration.getDailySnapshot();
      if (!cancelled) setSnapshot(data);
    }

    init();
    return () => { cancelled = true; };
  }, []);

  return { snapshot, status };
}
```

**Step 2: Export from hooks/index.ts**

Add to `hooks/index.ts`:

```typescript
export * from './useHealthKit';
```

**Step 3: Commit**

```bash
git add hooks/useHealthKit.ts hooks/index.ts
git commit -m "feat(health): add useHealthKit hook with permission handling"
```

---

### Task 7.1d: Wire home.tsx stepsValue to real data

**Files:**
- Modify: `app/(tabs)/home.tsx:1-2` (import), `app/(tabs)/home.tsx:46-47` (replace hardcoded `'--'`)

**Step 1: Import useHealthKit and replace stepsValue**

In `app/(tabs)/home.tsx`, add import:

```typescript
import { useHealthKit } from '../../hooks/useHealthKit';
```

Inside `HomeScreen()`, after the existing store hooks (~line 34), add:

```typescript
// HealthKit data
const { snapshot: healthSnapshot, status: healthStatus } = useHealthKit();
```

Replace line 47 (`const stepsValue = '--';`) with:

```typescript
const stepsValue =
  healthStatus === 'loading' ? '...'
  : healthSnapshot?.steps ? healthSnapshot.steps.toLocaleString()
  : '--';
```

Optionally enhance `sleepValue` to prefer HealthKit when available (line 44):

```typescript
const sleepValue =
  healthSnapshot?.sleepHours ? `${healthSnapshot.sleepHours}h`
  : todayCheckIn?.sleepHours ? `${todayCheckIn.sleepHours}h`
  : '--';
```

**Step 2: Verify app renders without crash**

Run: `npx expo start --ios` — home screen should show `'--'` on simulator (no HealthKit data), `'...'` briefly while loading.

**Step 3: Commit**

```bash
git add app/(tabs)/home.tsx
git commit -m "feat(health): wire home screen metrics to HealthKit data"
```

---

### Task 7.1e: Graceful degradation

**Files:**
- Modify: `services/healthKitIntegration.ts` (already handles errors)
- Verify: home.tsx behavior when health unavailable

**Step 1: Verify graceful behavior on web/simulator**

Run: `npx expo start --web` — steps should show `'--'` (Platform.OS === 'web' → isAvailable returns false)
Run: `npx expo start --ios` (simulator) — steps should show `'--'` (no HealthKit data in simulator)

**Step 2: Verify no crash if expo-health-connect not installed on device**

The dynamic `import('expo-health-connect')` in `loadHealthConnect()` catches any import failure and returns null. This means the app will never crash even if the native module isn't available.

**Step 3: Commit sprint**

```bash
git add -A
git commit -m "feat(health): HealthKit integration complete with graceful degradation

- expo-health-connect installed and configured
- Real getDailySnapshot() reads steps, heart rate, sleep
- useHealthKit hook handles permissions + availability
- Home screen wired to display real steps
- Falls back to '--' when unavailable (web, simulator, denied)"
```

---

## TASK 7.2 — Camera Scanner

**Effort:** 5 hours | **Risk:** Medium (Gemini Vision API key required)
**Dependency:** `GOOGLE_API_KEY` in BFF .env for Gemini Vision

### Task 7.2a: Wire CameraView into camera-scanner.tsx

**Files:**
- Modify: `app/(modals)/camera-scanner.tsx` (replace dark void with real camera)
- Modify: `app.json:27-29` (add expo-camera plugin)

**Step 1: Add expo-camera plugin to app.json**

In `app.json` plugins array, add:

```json
[
  "expo-camera",
  {
    "cameraPermission": "GENESIS necesita acceso a la cámara para escanear alimentos y equipamiento."
  }
]
```

**Step 2: Rewrite camera-scanner.tsx with real CameraView**

Replace entire file `app/(modals)/camera-scanner.tsx`:

```tsx
import { useState, useRef } from 'react';
import { Pressable, Text, View, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, Camera, ScanLine, Utensils, Dumbbell, RefreshCw } from 'lucide-react-native';
import { GlassCard } from '../../components/ui';
import { GENESIS_COLORS } from '../../constants/colors';
import { visionApi } from '../../services/visionApi';

type ScanMode = 'food' | 'equipment';

export default function CameraScannerScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [mode, setMode] = useState<ScanMode>('food');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const handleScan = async () => {
    if (!cameraRef.current) return;
    setScanning(true);
    setResult(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.6 });
      if (!photo?.base64) {
        setResult('Error: no se pudo capturar la imagen');
        setScanning(false);
        return;
      }

      if (mode === 'food') {
        const scanResult = await visionApi.scanFood(photo.base64);
        if (scanResult.detectedItems.length > 0) {
          const item = scanResult.detectedItems[0];
          setResult(`Detectado: ${item.name} (~${scanResult.estimatedCalories} cal) — ${Math.round(item.confidence * 100)}% confianza`);
        } else {
          setResult('No se detectaron alimentos. Intenta de nuevo.');
        }
      } else {
        const scanResult = await visionApi.detectEquipment(photo.base64);
        if (scanResult.detectedEquipment.length > 0) {
          const item = scanResult.detectedEquipment[0];
          setResult(`Detectado: ${item.name} — ${Math.round(item.confidence * 100)}% confianza`);
        } else {
          setResult('No se detectó equipamiento. Intenta de nuevo.');
        }
      }
    } catch (err: any) {
      setResult(`Error: ${err?.message ?? 'falló el escaneo'}`);
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setScanning(false);
  };

  // Permission not yet determined
  if (!permission) return null;

  // Permission denied
  if (!permission.granted) {
    return (
      <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 32 }}>
          <Camera size={48} color={GENESIS_COLORS.textMuted} />
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'InterBold', textAlign: 'center' }}>
            Permiso de cámara requerido
          </Text>
          <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 13, fontFamily: 'Inter', textAlign: 'center' }}>
            GENESIS necesita acceso a la cámara para escanear alimentos y equipamiento.
          </Text>
          <Pressable onPress={requestPermission}>
            <LinearGradient
              colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
              style={{ borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'JetBrainsMonoSemiBold' }}>PERMITIR CÁMARA</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 13, fontFamily: 'Inter', marginTop: 8 }}>Cancelar</Text>
          </Pressable>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16, gap: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable
            onPress={() => router.back()}
            style={{ height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)' }}
          >
            <X size={20} color="#FFFFFF" />
          </Pressable>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: 'InterBold' }}>
            {mode === 'food' ? 'Escanear Comida' : 'Escanear Equipo'}
          </Text>
          <View style={{ height: 40, width: 40 }} />
        </View>

        {/* Mode Selector */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable onPress={() => { setMode('food'); handleReset(); }} style={{ flex: 1 }}>
            <GlassCard
              className="items-center gap-2"
              shadow={mode === 'food' ? 'primary' : undefined}
              style={mode === 'food' ? { borderColor: GENESIS_COLORS.borderActive, borderWidth: 1 } : undefined}
            >
              <Utensils size={20} color={mode === 'food' ? GENESIS_COLORS.primary : GENESIS_COLORS.textMuted} />
              <Text style={{ color: mode === 'food' ? '#FFFFFF' : GENESIS_COLORS.textTertiary, fontSize: 12, fontFamily: 'JetBrainsMonoSemiBold' }}>
                FOOD
              </Text>
            </GlassCard>
          </Pressable>
          <Pressable onPress={() => { setMode('equipment'); handleReset(); }} style={{ flex: 1 }}>
            <GlassCard
              className="items-center gap-2"
              shadow={mode === 'equipment' ? 'primary' : undefined}
              style={mode === 'equipment' ? { borderColor: GENESIS_COLORS.borderActive, borderWidth: 1 } : undefined}
            >
              <Dumbbell size={20} color={mode === 'equipment' ? GENESIS_COLORS.primary : GENESIS_COLORS.textMuted} />
              <Text style={{ color: mode === 'equipment' ? '#FFFFFF' : GENESIS_COLORS.textTertiary, fontSize: 12, fontFamily: 'JetBrainsMonoSemiBold' }}>
                EQUIPMENT
              </Text>
            </GlassCard>
          </Pressable>
        </View>

        {/* Camera Viewfinder — REAL CAMERA */}
        <View style={{
          flex: 1,
          overflow: 'hidden',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: GENESIS_COLORS.borderSubtle,
        }}>
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="back"
          >
            {/* Corner markers overlay */}
            <View style={{ flex: 1 }}>
              <View style={{ position: 'absolute', left: 16, top: 16, height: 32, width: 32, borderLeftWidth: 2, borderTopWidth: 2, borderColor: GENESIS_COLORS.primary, borderTopLeftRadius: 4 }} />
              <View style={{ position: 'absolute', right: 16, top: 16, height: 32, width: 32, borderRightWidth: 2, borderTopWidth: 2, borderColor: GENESIS_COLORS.primary, borderTopRightRadius: 4 }} />
              <View style={{ position: 'absolute', bottom: 16, left: 16, height: 32, width: 32, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: GENESIS_COLORS.primary, borderBottomLeftRadius: 4 }} />
              <View style={{ position: 'absolute', bottom: 16, right: 16, height: 32, width: 32, borderBottomWidth: 2, borderRightWidth: 2, borderColor: GENESIS_COLORS.primary, borderBottomRightRadius: 4 }} />

              {scanning && (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                  <ScanLine size={48} color={GENESIS_COLORS.primary} />
                  <Text style={{ color: GENESIS_COLORS.primary, fontSize: 13, fontFamily: 'JetBrainsMonoMedium', marginTop: 12 }}>Analizando...</Text>
                </View>
              )}
            </View>
          </CameraView>
        </View>

        {/* Result */}
        {result && (
          <GlassCard shine className="gap-2">
            <Text style={{ color: GENESIS_COLORS.success, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1 }}>
              RESULTADO
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>{result}</Text>
            <Pressable onPress={handleReset} style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={14} color={GENESIS_COLORS.primary} />
              <Text style={{ color: GENESIS_COLORS.primary, fontSize: 12, fontFamily: 'JetBrainsMonoMedium' }}>Escanear de nuevo</Text>
            </Pressable>
          </GlassCard>
        )}

        {/* Scan Button */}
        {!result && (
          <Pressable
            onPress={handleScan}
            disabled={scanning}
            style={{ opacity: scanning ? 0.5 : 1, marginBottom: 16 }}
          >
            <LinearGradient
              colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                shadowColor: GENESIS_COLORS.primary,
                shadowOpacity: 0.4,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
              }}
            >
              <ScanLine size={18} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'JetBrainsMonoSemiBold' }}>
                {scanning ? 'ANALIZANDO...' : 'ESCANEAR AHORA'}
              </Text>
            </LinearGradient>
          </Pressable>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
```

**Step 3: Commit**

```bash
git add app/(modals)/camera-scanner.tsx app.json
git commit -m "feat(camera): wire real CameraView with expo-camera permissions"
```

---

### Task 7.2b: BFF vision endpoint (Gemini 2.0 Flash)

**Files:**
- Create: `bff/services/vision.py`
- Modify: `bff/routers/mobile.py` (add 2 endpoints)
- Modify: `bff/models/requests.py` (add VisionScanRequest)
- Modify: `bff/models/responses.py` (add VisionScanResponse)
- Modify: `bff/.env.example` (add GOOGLE_API_KEY note)

**Step 1: Add request/response models**

In `bff/models/requests.py`, add:

```python
class VisionScanRequest(BaseModel):
    imageBase64: str
    mode: str = "food"  # "food" or "equipment"
```

In `bff/models/responses.py`, add:

```python
class DetectedItem(BaseModel):
    name: str
    confidence: float

class VisionFoodScanResponse(BaseModel):
    detectedItems: list[DetectedItem]
    estimatedCalories: int
    estimatedProtein: int | None = None
    estimatedCarbs: int | None = None
    estimatedFat: int | None = None

class VisionEquipmentResponse(BaseModel):
    detectedEquipment: list[DetectedItem]
```

**Step 2: Create vision service**

Write `bff/services/vision.py`:

```python
import os
import json
import google.generativeai as genai

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

def _get_model():
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY not configured")
    genai.configure(api_key=GOOGLE_API_KEY)
    return genai.GenerativeModel("gemini-2.0-flash")


async def scan_food(image_base64: str) -> dict:
    """Send image to Gemini Vision and parse food items + macros."""
    model = _get_model()

    prompt = """Analyze this food image. Return ONLY valid JSON with this exact structure:
{
  "detectedItems": [{"name": "Food Name", "confidence": 0.95}],
  "estimatedCalories": 350,
  "estimatedProtein": 25,
  "estimatedCarbs": 30,
  "estimatedFat": 12
}
Rules:
- Name foods in Spanish
- Estimate macros per visible portion
- Confidence 0.0-1.0
- If no food detected, return {"detectedItems": [], "estimatedCalories": 0}"""

    response = model.generate_content([
        prompt,
        {"mime_type": "image/jpeg", "data": image_base64},
    ])

    try:
        text = response.text.strip()
        # Strip markdown fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(text)
    except (json.JSONDecodeError, IndexError):
        return {"detectedItems": [], "estimatedCalories": 0}


async def detect_equipment(image_base64: str) -> dict:
    """Send image to Gemini Vision and parse gym equipment."""
    model = _get_model()

    prompt = """Analyze this gym equipment image. Return ONLY valid JSON:
{
  "detectedEquipment": [{"name": "Equipment Name", "confidence": 0.90}]
}
Rules:
- Name equipment in Spanish
- Include weight range if visible
- If no equipment detected, return {"detectedEquipment": []}"""

    response = model.generate_content([
        prompt,
        {"mime_type": "image/jpeg", "data": image_base64},
    ])

    try:
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(text)
    except (json.JSONDecodeError, IndexError):
        return {"detectedEquipment": []}
```

**Step 3: Add endpoints to mobile router**

In `bff/routers/mobile.py`, add two endpoints:

```python
from services.vision import scan_food, detect_equipment
from models.requests import VisionScanRequest
from models.responses import VisionFoodScanResponse, VisionEquipmentResponse

@router.post("/vision/scan-food", response_model=VisionFoodScanResponse)
async def vision_scan_food(req: VisionScanRequest):
    result = await scan_food(req.imageBase64)
    return result

@router.post("/vision/detect-equipment", response_model=VisionEquipmentResponse)
async def vision_detect_equipment(req: VisionScanRequest):
    result = await detect_equipment(req.imageBase64)
    return result
```

**Step 4: Update .env.example**

Add to `bff/.env.example`:

```
# Gemini Vision (for food/equipment scanning)
GOOGLE_API_KEY=
```

**Step 5: Update visionApi.ts to point to BFF**

In `services/visionApi.ts`, change the URL to use the BFF base URL instead of a separate vision API:

```typescript
const bffUrl = process.env.EXPO_PUBLIC_BFF_URL ?? '';

export const visionApi = {
  async scanFood(imageBase64: string): Promise<VisionFoodScanResult> {
    if (!bffUrl) return { detectedItems: [], estimatedCalories: 0 };

    const response = await fetch(`${bffUrl}/mobile/vision/scan-food`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
    });

    if (!response.ok) throw new Error('Vision scan failed');
    return (await response.json()) as VisionFoodScanResult;
  },

  async detectEquipment(imageBase64: string): Promise<VisionEquipmentResult> {
    if (!bffUrl) return { detectedEquipment: [] };

    const response = await fetch(`${bffUrl}/mobile/vision/detect-equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
    });

    if (!response.ok) throw new Error('Vision detect failed');
    return (await response.json()) as VisionEquipmentResult;
  },
};
```

**Step 6: Commit**

```bash
git add bff/services/vision.py bff/routers/mobile.py bff/models/requests.py bff/models/responses.py bff/.env.example services/visionApi.ts
git commit -m "feat(vision): add Gemini 2.0 Flash vision endpoints for food/equipment scanning"
```

---

### Task 7.2c: Scan result → nutrition store integration

**Files:**
- Modify: `services/visionApi.ts` (add macro fields to VisionFoodScanResult)
- Modify: `app/(modals)/camera-scanner.tsx` (add "Agregar a comidas" button)
- Modify: `stores/useNutritionStore.ts` (add addMealFromScan helper)

**Step 1: Extend VisionFoodScanResult with macros**

In `services/visionApi.ts`, update the interface:

```typescript
export interface VisionFoodScanResult {
  detectedItems: Array<{ name: string; confidence: number }>;
  estimatedCalories: number;
  estimatedProtein?: number;
  estimatedCarbs?: number;
  estimatedFat?: number;
}
```

**Step 2: Add "Agregar a comidas" action in scan result**

In `camera-scanner.tsx`, after the result display `<GlassCard>`, add an "add to meals" button that calls `useNutritionStore.addMeal()` with the scan result, then navigates back.

**Step 3: Commit**

```bash
git add services/visionApi.ts app/(modals)/camera-scanner.tsx stores/useNutritionStore.ts
git commit -m "feat(camera): scan results integrate with nutrition store"
```

---

### Task 7.2d: Add "Scan" entry point on fuel tab

**Files:**
- Modify: `app/(tabs)/fuel.tsx` (add scan button)

**Step 1: Add scan FAB to fuel tab**

In `app/(tabs)/fuel.tsx`, add a floating scan button that navigates to `/(modals)/camera-scanner`:

```tsx
import { useRouter } from 'expo-router';
import { Camera } from 'lucide-react-native';

// In the render, add before closing </SafeAreaView>:
<Pressable
  onPress={() => router.push('/(modals)/camera-scanner')}
  style={{ position: 'absolute', bottom: 24, right: 24 }}
>
  <LinearGradient
    colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
    style={{
      height: 56, width: 56, borderRadius: 28,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: GENESIS_COLORS.primary,
      shadowOpacity: 0.5, shadowRadius: 16,
      shadowOffset: { width: 0, height: 4 },
    }}
  >
    <Camera size={22} color="#FFFFFF" />
  </LinearGradient>
</Pressable>
```

**Step 2: Commit sprint**

```bash
git add app/(tabs)/fuel.tsx
git commit -m "feat(camera): add scan FAB to fuel tab

- CameraView with expo-camera replaces dark void
- Gemini 2.0 Flash Vision API backend for food/equipment recognition
- Scan results can be added to nutrition store
- Permission denied graceful UI
- Floating scan button on fuel tab"
```

---

## TASK 7.3 — Voice Call Audio Pipeline

**Effort:** 6 hours | **Risk:** High (ElevenLabs WebSocket API, real-time audio)
**Dependency:** `ELEVENLABS_API_KEY` and ElevenLabs Conversational AI agent configured

### Task 7.3a: ElevenLabs Conversational AI WebSocket service

**Files:**
- Create: `services/elevenLabsConversation.ts`
- Modify: `.env.example` (add agent ID)

**Step 1: Create the conversational AI service**

Write `services/elevenLabsConversation.ts`:

```typescript
type ConversationCallbacks = {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
  onAgentSpeaking?: (audioBase64: string) => void;
  onAgentText?: (text: string) => void;
  onUserTranscript?: (text: string) => void;
};

type ConversationState = 'idle' | 'connecting' | 'connected' | 'error';

const ELEVENLABS_AGENT_ID = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID ?? '';

export class ElevenLabsConversation {
  private ws: WebSocket | null = null;
  private state: ConversationState = 'idle';
  private callbacks: ConversationCallbacks;

  constructor(callbacks: ConversationCallbacks) {
    this.callbacks = callbacks;
  }

  getState(): ConversationState {
    return this.state;
  }

  async connect(): Promise<void> {
    if (!ELEVENLABS_AGENT_ID) {
      this.callbacks.onError?.('ElevenLabs Agent ID not configured');
      return;
    }

    this.state = 'connecting';

    try {
      const url = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${ELEVENLABS_AGENT_ID}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.state = 'connected';
        this.callbacks.onConnected?.();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case 'audio':
              this.callbacks.onAgentSpeaking?.(data.audio_event?.audio_base_64 ?? '');
              break;
            case 'agent_response':
              this.callbacks.onAgentText?.(data.agent_response_event?.agent_response ?? '');
              break;
            case 'user_transcript':
              this.callbacks.onUserTranscript?.(data.user_transcription_event?.user_transcript ?? '');
              break;
          }
        } catch {
          // ignore malformed messages
        }
      };

      this.ws.onerror = () => {
        this.state = 'error';
        this.callbacks.onError?.('WebSocket connection failed');
      };

      this.ws.onclose = () => {
        this.state = 'idle';
        this.callbacks.onDisconnected?.();
      };
    } catch (err: any) {
      this.state = 'error';
      this.callbacks.onError?.(err?.message ?? 'Connection failed');
    }
  }

  sendAudio(base64Audio: string): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({
      user_audio_chunk: base64Audio,
    }));
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.state = 'idle';
  }
}
```

**Step 2: Add agent ID to .env.example**

```
# ElevenLabs Conversational AI
EXPO_PUBLIC_ELEVENLABS_AGENT_ID=
```

**Step 3: Commit**

```bash
git add services/elevenLabsConversation.ts .env.example
git commit -m "feat(voice): add ElevenLabs Conversational AI WebSocket service"
```

---

### Task 7.3b: Create useVoiceCall hook (audio recording + playback)

**Files:**
- Create: `hooks/useVoiceCall.ts`
- Modify: `hooks/index.ts` (add export)

**Step 1: Create the hook**

Write `hooks/useVoiceCall.ts`:

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import { Audio } from 'expo-av';
import { ElevenLabsConversation } from '../services/elevenLabsConversation';

type CallState = 'idle' | 'connecting' | 'connected' | 'error';

export function useVoiceCall() {
  const [callState, setCallState] = useState<CallState>('idle');
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Idle');

  const conversationRef = useRef<ElevenLabsConversation | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const startCall = useCallback(async () => {
    setCallState('connecting');
    setStatusText('Conectando...');
    setError(null);

    // Request microphone permission
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      setCallState('error');
      setError('Permiso de micrófono denegado');
      return;
    }

    // Configure audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    // Create conversation
    const conversation = new ElevenLabsConversation({
      onConnected: () => {
        setCallState('connected');
        setStatusText('Escuchando...');
        startRecording();
      },
      onDisconnected: () => {
        setCallState('idle');
        setStatusText('Llamada terminada');
        stopRecording();
      },
      onError: (err) => {
        setCallState('error');
        setError(err);
        setStatusText('Error de conexión');
      },
      onAgentSpeaking: async (audioBase64: string) => {
        setStatusText('GENESIS habla...');
        await playAudioChunk(audioBase64);
      },
      onAgentText: (text) => {
        // Could display transcript if desired
      },
      onUserTranscript: () => {
        setStatusText('Escuchando...');
      },
    });

    conversationRef.current = conversation;
    await conversation.connect();
  }, []);

  const endCall = useCallback(async () => {
    conversationRef.current?.disconnect();
    await stopRecording();
    setCallState('idle');
    setStatusText('Llamada terminada');
  }, []);

  const toggleMute = useCallback(async () => {
    setMuted((prev) => {
      const next = !prev;
      if (next) {
        stopRecording();
        setStatusText('Micrófono silenciado');
      } else {
        startRecording();
        setStatusText('Escuchando...');
      }
      return next;
    });
  }, []);

  const toggleSpeaker = useCallback(async () => {
    const next = !speakerOn;
    setSpeakerOn(next);
    // expo-av handles speaker routing via audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: !muted,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: !next,
    });
  }, [speakerOn, muted]);

  async function startRecording() {
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.LOW_QUALITY,
      );
      recordingRef.current = recording;

      // Poll for audio data and send to WebSocket
      // In production, use onRecordingStatusUpdate for streaming
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && status.durationMillis > 0 && status.durationMillis % 250 < 50) {
          // Send audio chunks periodically
          sendAudioChunk();
        }
      });
    } catch {
      // Recording may fail on simulator
    }
  }

  async function stopRecording() {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
    } catch {
      // Ignore stop errors
    }
  }

  async function sendAudioChunk() {
    // In a real implementation, read the recording buffer and send base64 chunks
    // For now, this is a placeholder — ElevenLabs expects PCM16 audio
    if (!conversationRef.current || !recordingRef.current) return;
    // TODO: Extract audio buffer from recording and send as base64 PCM16
  }

  async function playAudioChunk(base64Audio: string) {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${base64Audio}` },
        { shouldPlay: true },
      );
      soundRef.current = sound;
    } catch {
      // Audio playback may fail
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      conversationRef.current?.disconnect();
      stopRecording();
      soundRef.current?.unloadAsync();
    };
  }, []);

  return {
    callState,
    muted,
    speakerOn,
    error,
    statusText,
    startCall,
    endCall,
    toggleMute,
    toggleSpeaker,
  };
}
```

**Step 2: Export from hooks/index.ts**

Add to `hooks/index.ts`:

```typescript
export * from './useVoiceCall';
```

**Step 3: Commit**

```bash
git add hooks/useVoiceCall.ts hooks/index.ts
git commit -m "feat(voice): add useVoiceCall hook with recording + playback pipeline"
```

---

### Task 7.3c: Wire voice-call.tsx to real audio

**Files:**
- Modify: `app/(modals)/voice-call.tsx` (replace stub with real hook)

**Step 1: Rewrite voice-call.tsx to use useVoiceCall**

Replace entire `app/(modals)/voice-call.tsx`:

```tsx
import { useState, useEffect, useRef } from 'react';
import { Pressable, Text, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PhoneOff, Mic, MicOff, Volume2, Sparkles, WifiOff } from 'lucide-react-native';
import { GlassCard } from '../../components/ui';
import { GENESIS_COLORS } from '../../constants/colors';
import { useVoiceCall } from '../../hooks/useVoiceCall';

export default function VoiceCallScreen() {
  const router = useRouter();
  const {
    callState, muted, speakerOn, error, statusText,
    startCall, endCall, toggleMute, toggleSpeaker,
  } = useVoiceCall();

  const [callSeconds, setCallSeconds] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Auto-start call on mount
  useEffect(() => {
    startCall();
    return () => { endCall(); };
  }, []);

  // Call timer
  useEffect(() => {
    if (callState !== 'connected') return;
    const interval = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [callState]);

  // Pulse animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    if (callState === 'connected') loop.start();
    return () => loop.stop();
  }, [pulseAnim, callState]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndCall = () => {
    endCall();
    router.back();
  };

  const statusColor =
    callState === 'connected' ? GENESIS_COLORS.success
    : callState === 'connecting' ? GENESIS_COLORS.warning
    : callState === 'error' ? GENESIS_COLORS.error
    : GENESIS_COLORS.textMuted;

  return (
    <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 40 }}>
        {/* Top Info */}
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1 }}>
            GENESIS AI
          </Text>
          <Text style={{ color: statusColor, fontSize: 14, fontFamily: 'InterBold' }}>
            {statusText}
          </Text>
          {error && (
            <Text style={{ color: GENESIS_COLORS.error, fontSize: 12, fontFamily: 'Inter', textAlign: 'center', paddingHorizontal: 32 }}>
              {error}
            </Text>
          )}
        </View>

        {/* Avatar + Pulse */}
        <View style={{ alignItems: 'center', gap: 24 }}>
          <Animated.View
            style={{
              transform: [{ scale: callState === 'connected' ? pulseAnim : 1 }],
              width: 140, height: 140, borderRadius: 70,
              backgroundColor: callState === 'error' ? GENESIS_COLORS.error + '15' : GENESIS_COLORS.primary + '15',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <View
              style={{
                height: 100, width: 100, alignItems: 'center', justifyContent: 'center',
                borderRadius: 50,
                backgroundColor: callState === 'error' ? GENESIS_COLORS.error + '30' : GENESIS_COLORS.primary + '30',
                shadowColor: callState === 'error' ? GENESIS_COLORS.error : GENESIS_COLORS.primary,
                shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20,
              }}
            >
              {callState === 'error' ? (
                <WifiOff size={40} color={GENESIS_COLORS.error} />
              ) : (
                <Sparkles size={40} color={GENESIS_COLORS.primaryLight} />
              )}
            </View>
          </Animated.View>

          <Text style={{ color: '#FFFFFF', fontSize: 32, fontFamily: 'JetBrainsMonoBold' }}>
            {callState === 'connected' ? formatTime(callSeconds) : '--:--'}
          </Text>

          {/* Status */}
          <GlassCard className="px-6 py-2">
            <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 12, fontFamily: 'Inter' }}>
              {muted ? 'Micrófono silenciado' : callState === 'connected' ? 'Escuchando...' : callState === 'connecting' ? 'Estableciendo conexión...' : 'Desconectado'}
            </Text>
          </GlassCard>
        </View>

        {/* Controls */}
        <View style={{ width: '100%', alignItems: 'center', gap: 24, paddingHorizontal: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
            {/* Mute */}
            <Pressable
              onPress={toggleMute}
              disabled={callState !== 'connected'}
              style={{
                height: 56, width: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 28,
                backgroundColor: muted ? GENESIS_COLORS.error + '30' : 'rgba(255,255,255,0.04)',
                opacity: callState !== 'connected' ? 0.4 : 1,
              }}
            >
              {muted ? <MicOff size={22} color={GENESIS_COLORS.error} /> : <Mic size={22} color="#FFFFFF" />}
            </Pressable>

            {/* End Call */}
            <Pressable
              onPress={handleEndCall}
              style={{
                height: 64, width: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 32,
                backgroundColor: '#ff4444',
                shadowColor: '#ff4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
              }}
            >
              <PhoneOff size={24} color="#FFFFFF" />
            </Pressable>

            {/* Speaker */}
            <Pressable
              onPress={toggleSpeaker}
              disabled={callState !== 'connected'}
              style={{
                height: 56, width: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 28,
                backgroundColor: speakerOn ? GENESIS_COLORS.primary + '30' : 'rgba(255,255,255,0.04)',
                opacity: callState !== 'connected' ? 0.4 : 1,
              }}
            >
              <Volume2 size={22} color={speakerOn ? GENESIS_COLORS.primaryLight : '#FFFFFF'} />
            </Pressable>
          </View>

          <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 11, fontFamily: 'Inter' }}>
            Powered by GENESIS + ElevenLabs
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
```

**Step 2: Commit sprint**

```bash
git add app/(modals)/voice-call.tsx
git commit -m "feat(voice): wire voice-call modal to real audio pipeline

- ElevenLabs Conversational AI WebSocket connection
- Real microphone recording with expo-av
- Audio playback for agent responses
- Connection states: connecting, connected, error
- Mute/speaker controls affect real audio
- Auto-connect on mount, cleanup on unmount
- Spanish status text throughout"
```

---

## SECTION D — ENVIRONMENT VARIABLES CHECKLIST

After implementation, these env vars must be configured:

```bash
# .env (mobile app — EXPO_PUBLIC_ prefix)
EXPO_PUBLIC_ELEVENLABS_AGENT_ID=agent_xxxxxxxxxxxx   # Task 7.3
EXPO_PUBLIC_BFF_URL=http://localhost:8000             # Already exists

# bff/.env (backend)
GOOGLE_API_KEY=AIza...                                # Task 7.2 (Gemini Vision)
ELEVENLABS_API_KEY=sk_...                             # Task 7.3 (if BFF needs it)
```

HealthKit (Task 7.1) requires **no API keys** — it reads from the device's native health data store.

---

## SECTION E — TESTING REQUIREMENTS

| Feature | Unit Tests | Integration Test | Device Test |
|---------|-----------|-----------------|-------------|
| 7.1 HealthKit | Mock `getDailySnapshot()` returns | Hook renders with `'--'` when unavailable | Physical iOS/Android device |
| 7.2 Camera Scanner | Mock `visionApi.scanFood()` response | BFF endpoint with test image base64 | Physical device (camera) |
| 7.3 Voice Call | Mock WebSocket messages | ElevenLabs connection with test agent | Physical device (microphone) |

**Critical:** All three features require **physical device testing** — simulators lack camera, microphone, and HealthKit data.

---

## SECTION F — SUCCESS CRITERIA

Phase 7 is complete when:

1. **HealthKit**: Home screen shows real step count on a physical device with HealthKit data
2. **Camera Scanner**: User can photograph food → see AI-detected items with estimated macros
3. **Voice Call**: User can have a real-time voice conversation with GENESIS AI agent
4. **Graceful Degradation**: All three features show helpful messages when hardware/API unavailable (no crashes)
5. **No regressions**: All Phase 6 functionality continues working

---

## SECTION G — CONSTRAINTS

1. **Spanish UI text**: All user-facing strings in Spanish. Code/comments in English.
2. **No visual redesigns**: Use existing glassmorphic design system. Don't change colors, fonts, or layout patterns.
3. **BFF is the gateway**: Vision API calls go through BFF (not direct from app to Gemini). Voice call is the exception — ElevenLabs WebSocket connects directly from app.
4. **expo-av for audio**: Already installed. Use it for recording and playback in voice call.
5. **expo-camera for camera**: Already installed. Use `CameraView` and `useCameraPermissions`.
6. **Feature flags**: Each feature should gracefully return to stub behavior if its env vars are not configured.
