import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
// Animation handled by parent (index.tsx)
import { Camera, Phone, ClipboardCheck, TrendingUp, BookOpen } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { hapticLight } from '../../utils/haptics';

type Tool = {
  key: string;
  icon: React.ElementType;
  name: string;
  desc: string;
  action: 'navigate' | 'send';
  target: string;
};

const TOOLS: Tool[] = [
  { key: 'camera', icon: Camera, name: 'Escanear alimento', desc: 'CÁMARA · IDENTIFICA Y REGISTRA', action: 'navigate', target: '/(modals)/camera-scanner' },
  { key: 'voice', icon: Phone, name: 'Llamada de voz', desc: 'HABLA CON GENESIS EN TIEMPO REAL', action: 'navigate', target: '/(modals)/voice-call' },
  { key: 'checkin', icon: ClipboardCheck, name: 'Check-in diario', desc: 'REGISTRA ENERGÍA, SUEÑO, ESTADO', action: 'navigate', target: '/(modals)/check-in' },
  { key: 'progress', icon: TrendingUp, name: 'Mi progreso', desc: 'MÉTRICAS, FOTOS, TENDENCIAS', action: 'send', target: '¿Cómo voy?' },
  { key: 'logos', icon: BookOpen, name: 'LOGOS', desc: 'BIBLIOTECA DE CONOCIMIENTO', action: 'navigate', target: '/(screens)/education' },
];

type Props = { onClose: () => void; onSend: (text: string) => void };

export function ToolsPopover({ onClose, onSend }: Props) {
  const router = useRouter();

  const handlePress = (tool: Tool) => {
    hapticLight();
    onClose();
    if (tool.action === 'navigate') router.push(tool.target as any);
    else onSend(tool.target);
  };

  return (
    <View
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(14,14,22,0.97)',
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.5,
        shadowRadius: 40,
        elevation: 20,
      }}
    >
      <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 10, fontWeight: '500', letterSpacing: 1.5, textTransform: 'uppercase', color: GENESIS_COLORS.textGhost, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 }}>
        Herramientas
      </Text>

      {TOOLS.map((tool, i) => {
        const Icon = tool.icon;
        return (
          <View key={tool.key}>
            {/* Divider after voice call (index 1) */}
            {i === 2 && <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.04)', marginVertical: 4, marginHorizontal: 12 }} />}
            <Pressable
              onPress={() => handlePress(tool)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: pressed ? 'rgba(255,255,255,0.04)' : 'transparent',
              })}
            >
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.06)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={16} color={GENESIS_COLORS.iconDefault} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '500', color: '#FFFFFF' }}>
                  {tool.name}
                </Text>
                <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 10, color: GENESIS_COLORS.textTertiary, letterSpacing: 0.3 }}>
                  {tool.desc}
                </Text>
              </View>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
