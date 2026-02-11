import { useState, useRef, useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, ScanLine, Utensils, Dumbbell, RefreshCw, ShieldAlert, Plus } from 'lucide-react-native';
import { GlassCard } from '../../components/ui';
import { GENESIS_COLORS } from '../../constants/colors';
import { visionApi } from '../../services/visionApi';
import type { VisionFoodScanResult, VisionEquipmentResult } from '../../services/visionApi';
import { useNutritionStore } from '../../stores';
import type { Meal } from '../../types';

type ScanMode = 'food' | 'equipment';

type FoodScanResult = {
  type: 'food';
  data: VisionFoodScanResult;
};

type EquipmentScanResult = {
  type: 'equipment';
  data: VisionEquipmentResult;
};

type ScanResult = FoodScanResult | EquipmentScanResult;

export default function CameraScannerScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<ScanMode>('food');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addingMeal, setAddingMeal] = useState(false);

  const addMeal = useNutritionStore((s) => s.addMeal);

  // Cleanup camera ref on unmount to release native resource
  useEffect(() => {
    return () => {
      cameraRef.current = null;
    };
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setResult(null);
    setError(null);

    try {
      if (!cameraRef.current) {
        throw new Error('Cámara no disponible');
      }

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,
      });

      if (!photo?.base64) {
        throw new Error('No se pudo capturar la imagen');
      }

      if (mode === 'food') {
        const data = await visionApi.scanFood(photo.base64);
        setResult({ type: 'food', data });
      } else {
        const data = await visionApi.detectEquipment(photo.base64);
        setResult({ type: 'equipment', data });
      }
    } catch (err: any) {
      const raw = err?.message ?? '';
      const isSafe = raw === 'Cámara no disponible' || raw === 'No se pudo capturar la imagen';
      setError(isSafe ? raw : 'Error al analizar la imagen. Intenta de nuevo.');
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setScanning(false);
    setError(null);
  };

  const handleAddMeal = () => {
    if (result?.type !== 'food') return;
    setAddingMeal(true);

    const { data } = result;
    const topItem = data.detectedItems[0];
    const mealName = topItem?.name ?? 'Comida escaneada';

    const meal: Meal = {
      id: Date.now().toString(),
      name: mealName,
      calories: data.estimatedCalories ?? 0,
      protein: data.estimatedProtein ?? 0,
      carbs: data.estimatedCarbs ?? 0,
      fat: data.estimatedFat ?? 0,
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    };

    addMeal(meal);

    // Short delay so user sees the action before navigating back
    setTimeout(() => {
      setAddingMeal(false);
      router.back();
    }, 400);
  };

  // Build result display text
  const getResultText = (): string => {
    if (!result) return '';

    if (result.type === 'food') {
      const { data } = result;
      const items = data.detectedItems.map(
        (item) => `${item.name} (${Math.round(item.confidence * 100)}%)`
      );
      const macros = [
        `~${data.estimatedCalories} cal`,
        data.estimatedProtein != null ? `${data.estimatedProtein}g proteína` : null,
        data.estimatedCarbs != null ? `${data.estimatedCarbs}g carbos` : null,
        data.estimatedFat != null ? `${data.estimatedFat}g grasa` : null,
      ].filter(Boolean).join(' · ');

      return items.length > 0
        ? `${items.join(', ')}\n${macros}`
        : 'No se detectaron alimentos';
    }

    const { data } = result;
    const items = data.detectedEquipment.map(
      (item) => `${item.name} (${Math.round(item.confidence * 100)}%)`
    );
    return items.length > 0 ? items.join(', ') : 'No se detectó equipamiento';
  };

  // Permission not yet determined
  if (!permission) {
    return (
      <LinearGradient colors={[GENESIS_COLORS.bgGradientStart, GENESIS_COLORS.bgGradientEnd]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={GENESIS_COLORS.primary} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Permission denied
  if (!permission.granted) {
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
              Escáner
            </Text>
            <View style={{ height: 40, width: 40 }} />
          </View>

          {/* Permission prompt */}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 24 }}>
            <View style={{
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: GENESIS_COLORS.primaryDim,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldAlert size={36} color={GENESIS_COLORS.primary} />
            </View>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontFamily: 'InterBold', textAlign: 'center' }}>
              Permiso de cámara requerido
            </Text>
            <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 14, fontFamily: 'Inter', textAlign: 'center', lineHeight: 22 }}>
              GENESIS necesita acceso a la cámara para escanear alimentos y detectar equipamiento de gimnasio.
            </Text>
            <Pressable onPress={requestPermission}>
              <LinearGradient
                colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 14,
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  alignItems: 'center',
                  shadowColor: GENESIS_COLORS.primary,
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 8,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'JetBrainsMonoSemiBold' }}>
                  PERMITIR CÁMARA
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
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
                COMIDA
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
                EQUIPO
              </Text>
            </GlassCard>
          </Pressable>
        </View>

        {/* Camera Viewfinder */}
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

              {/* Scanning indicator overlay */}
              {scanning && (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                  <ScanLine size={48} color={GENESIS_COLORS.primary} />
                  <Text style={{ color: GENESIS_COLORS.primary, fontSize: 13, fontFamily: 'JetBrainsMonoMedium', marginTop: 12 }}>
                    Analizando...
                  </Text>
                </View>
              )}
            </View>
          </CameraView>
        </View>

        {/* Error */}
        {error && (
          <GlassCard>
            <Text style={{ color: GENESIS_COLORS.error, fontSize: 13, fontFamily: 'Inter', textAlign: 'center' }}>
              {error}
            </Text>
            <Pressable onPress={handleReset} style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <RefreshCw size={14} color={GENESIS_COLORS.primary} />
              <Text style={{ color: GENESIS_COLORS.primary, fontSize: 12, fontFamily: 'JetBrainsMonoMedium' }}>Intentar de nuevo</Text>
            </Pressable>
          </GlassCard>
        )}

        {/* Result */}
        {result && (
          <GlassCard shine className="gap-2">
            <Text style={{ color: GENESIS_COLORS.success, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1 }}>
              RESULTADO
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold', lineHeight: 22 }}>
              {getResultText()}
            </Text>

            {/* Add to meals button (food mode only) */}
            {result.type === 'food' && result.data.detectedItems.length > 0 && (
              <Pressable
                onPress={handleAddMeal}
                disabled={addingMeal}
                style={{ marginTop: 8, opacity: addingMeal ? 0.5 : 1 }}
              >
                <LinearGradient
                  colors={[GENESIS_COLORS.success, GENESIS_COLORS.mint]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 10,
                    paddingVertical: 12,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Plus size={16} color={GENESIS_COLORS.bgGradientEnd} />
                  <Text style={{ color: GENESIS_COLORS.bgGradientEnd, fontSize: 13, fontFamily: 'JetBrainsMonoSemiBold' }}>
                    {addingMeal ? 'Agregando...' : 'Agregar a comidas'}
                  </Text>
                </LinearGradient>
              </Pressable>
            )}

            <Pressable onPress={handleReset} style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={14} color={GENESIS_COLORS.primary} />
              <Text style={{ color: GENESIS_COLORS.primary, fontSize: 12, fontFamily: 'JetBrainsMonoMedium' }}>Escanear de nuevo</Text>
            </Pressable>
          </GlassCard>
        )}

        {/* Scan Button */}
        {!result && !error && (
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
