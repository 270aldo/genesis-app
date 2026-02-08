import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Camera, ScanLine, Utensils, Dumbbell, RefreshCw } from 'lucide-react-native';
import { GlassCard } from '../../components/ui';

type ScanMode = 'food' | 'equipment';

export default function CameraScannerScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<ScanMode>('food');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleScan = async () => {
    setScanning(true);
    setResult(null);
    try {
      // TODO: Connect to Vision API via visionApi service
      // Simulate scan delay
      setTimeout(() => {
        setResult(
          mode === 'food'
            ? 'Detected: Grilled Chicken Breast (~165 cal, 31g protein)'
            : 'Detected: Adjustable Dumbbell (5-25kg)'
        );
        setScanning(false);
      }, 2000);
    } catch {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setScanning(false);
  };

  return (
    <LinearGradient colors={['#0D0D2B', '#1A0A30']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16, gap: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-[#FFFFFF0A]"
          >
            <X size={20} color="#FFFFFF" />
          </Pressable>
          <Text className="font-inter-bold text-[18px] text-white">
            {mode === 'food' ? 'Scan Food' : 'Scan Equipment'}
          </Text>
          <View className="h-10 w-10" />
        </View>

        {/* Mode Selector */}
        <View className="flex-row gap-3">
          <Pressable onPress={() => { setMode('food'); handleReset(); }} className="flex-1">
            <GlassCard
              className={`items-center gap-2 ${mode === 'food' ? 'border-[#b39aff]' : ''}`}
              shadow={mode === 'food' ? 'primary' : undefined}
            >
              <Utensils size={20} color={mode === 'food' ? '#b39aff' : '#6b6b7b'} />
              <Text
                className={`font-jetbrains-semibold text-[12px] ${mode === 'food' ? 'text-white' : 'text-[#827a89]'}`}
              >
                FOOD
              </Text>
            </GlassCard>
          </Pressable>
          <Pressable onPress={() => { setMode('equipment'); handleReset(); }} className="flex-1">
            <GlassCard
              className={`items-center gap-2 ${mode === 'equipment' ? 'border-[#b39aff]' : ''}`}
              shadow={mode === 'equipment' ? 'primary' : undefined}
            >
              <Dumbbell size={20} color={mode === 'equipment' ? '#b39aff' : '#6b6b7b'} />
              <Text
                className={`font-jetbrains-semibold text-[12px] ${mode === 'equipment' ? 'text-white' : 'text-[#827a89]'}`}
              >
                EQUIPMENT
              </Text>
            </GlassCard>
          </Pressable>
        </View>

        {/* Camera Viewfinder */}
        <View className="flex-1 items-center justify-center overflow-hidden rounded-[20px] border border-[#FFFFFF14] bg-[#0D0D2B]">
          {/* Corner markers */}
          <View className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-[#b39aff] rounded-tl-[4px]" />
          <View className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-[#b39aff] rounded-tr-[4px]" />
          <View className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-[#b39aff] rounded-bl-[4px]" />
          <View className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-[#b39aff] rounded-br-[4px]" />

          {scanning ? (
            <View className="items-center gap-3">
              <ScanLine size={48} color="#b39aff" />
              <Text className="font-jetbrains-medium text-[13px] text-[#b39aff]">Scanning...</Text>
            </View>
          ) : (
            <View className="items-center gap-3">
              <Camera size={48} color="#6b6b7b" />
              <Text className="font-inter text-[13px] text-[#827a89]">
                Point camera at {mode === 'food' ? 'your meal' : 'gym equipment'}
              </Text>
            </View>
          )}
        </View>

        {/* Result */}
        {result && (
          <GlassCard shine className="gap-2">
            <Text className="font-jetbrains-medium text-[11px] tracking-[1px] text-[#22ff73]">
              SCAN RESULT
            </Text>
            <Text className="font-inter-bold text-[14px] text-white">{result}</Text>
            <Pressable onPress={handleReset} className="mt-1 flex-row items-center gap-2">
              <RefreshCw size={14} color="#b39aff" />
              <Text className="font-jetbrains-medium text-[12px] text-[#b39aff]">Scan Again</Text>
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
              colors={['#6D00FF', '#5B21B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <ScanLine size={18} color="#FFFFFF" />
              <Text className="font-jetbrains-semibold text-[14px] text-white">
                {scanning ? 'SCANNING...' : 'SCAN NOW'}
              </Text>
            </LinearGradient>
          </Pressable>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
