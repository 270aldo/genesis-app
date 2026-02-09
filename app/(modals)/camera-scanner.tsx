import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Camera, ScanLine, Utensils, Dumbbell, RefreshCw } from 'lucide-react-native';
import { GlassCard } from '../../components/ui';
import { GENESIS_COLORS } from '../../constants/colors';

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
            {mode === 'food' ? 'Scan Food' : 'Scan Equipment'}
          </Text>
          <View style={{ height: 40, width: 40 }} />
        </View>

        {/* Mode Selector */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable onPress={() => { setMode('food'); handleReset(); }} style={{ flex: 1 }}>
            <GlassCard
              className={`items-center gap-2`}
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
              className={`items-center gap-2`}
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

        {/* Camera Viewfinder */}
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: GENESIS_COLORS.borderSubtle,
          backgroundColor: GENESIS_COLORS.bgVoid,
        }}>
          {/* Corner markers */}
          <View style={{ position: 'absolute', left: 16, top: 16, height: 32, width: 32, borderLeftWidth: 2, borderTopWidth: 2, borderColor: GENESIS_COLORS.primary, borderTopLeftRadius: 4 }} />
          <View style={{ position: 'absolute', right: 16, top: 16, height: 32, width: 32, borderRightWidth: 2, borderTopWidth: 2, borderColor: GENESIS_COLORS.primary, borderTopRightRadius: 4 }} />
          <View style={{ position: 'absolute', bottom: 16, left: 16, height: 32, width: 32, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: GENESIS_COLORS.primary, borderBottomLeftRadius: 4 }} />
          <View style={{ position: 'absolute', bottom: 16, right: 16, height: 32, width: 32, borderBottomWidth: 2, borderRightWidth: 2, borderColor: GENESIS_COLORS.primary, borderBottomRightRadius: 4 }} />

          {scanning ? (
            <View style={{ alignItems: 'center', gap: 12 }}>
              <ScanLine size={48} color={GENESIS_COLORS.primary} />
              <Text style={{ color: GENESIS_COLORS.primary, fontSize: 13, fontFamily: 'JetBrainsMonoMedium' }}>Scanning...</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center', gap: 12 }}>
              <Camera size={48} color={GENESIS_COLORS.textMuted} />
              <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 13, fontFamily: 'Inter' }}>
                Point camera at {mode === 'food' ? 'your meal' : 'gym equipment'}
              </Text>
            </View>
          )}
        </View>

        {/* Result */}
        {result && (
          <GlassCard shine className="gap-2">
            <Text style={{ color: GENESIS_COLORS.success, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', letterSpacing: 1 }}>
              SCAN RESULT
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold' }}>{result}</Text>
            <Pressable onPress={handleReset} style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={14} color={GENESIS_COLORS.primary} />
              <Text style={{ color: GENESIS_COLORS.primary, fontSize: 12, fontFamily: 'JetBrainsMonoMedium' }}>Scan Again</Text>
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
                {scanning ? 'SCANNING...' : 'SCAN NOW'}
              </Text>
            </LinearGradient>
          </Pressable>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
