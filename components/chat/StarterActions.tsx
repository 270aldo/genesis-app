import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Dumbbell,
  Utensils,
  Camera,
  TrendingUp,
  ClipboardCheck,
  BookOpen,
  Droplets,
  Moon,
  Zap,
  Heart,
  Salad,
} from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { hapticSelection } from '../../utils/haptics';

type StarterAction = {
  key: string;
  icon: React.ElementType;
  label: string;
  color: string;
  action: 'send' | 'navigate';
  target: string;
};

function getTimeActions(): StarterAction[] {
  const h = new Date().getHours();

  // Morning (5-12)
  if (h >= 5 && h < 12) {
    return [
      { key: 'workout', icon: Dumbbell, label: 'Entreno de hoy', color: GENESIS_COLORS.agentTrain, action: 'send', target: '¿Cuál es mi entrenamiento de hoy?' },
      { key: 'checkin', icon: ClipboardCheck, label: 'Check-in', color: '#00BFA5', action: 'navigate', target: '/(modals)/check-in' },
      { key: 'nutrition', icon: Salad, label: '¿Qué desayuno?', color: GENESIS_COLORS.agentFuel, action: 'send', target: '¿Qué me recomiendas desayunar hoy?' },
      { key: 'progress', icon: TrendingUp, label: '¿Cómo voy?', color: GENESIS_COLORS.agentTrack, action: 'send', target: '¿Cómo va mi progreso esta semana?' },
      { key: 'scan', icon: Camera, label: 'Escanear', color: GENESIS_COLORS.textSecondary, action: 'navigate', target: '/(modals)/camera-scanner' },
      { key: 'tips', icon: Zap, label: 'Tip del día', color: GENESIS_COLORS.agentMind, action: 'send', target: 'Dame un tip de rendimiento para hoy' },
    ];
  }

  // Midday (12-17)
  if (h >= 12 && h < 17) {
    return [
      { key: 'log-meal', icon: Utensils, label: 'Loggear comida', color: GENESIS_COLORS.agentFuel, action: 'send', target: 'Quiero registrar mi comida' },
      { key: 'workout', icon: Dumbbell, label: 'Entreno de hoy', color: GENESIS_COLORS.agentTrain, action: 'send', target: '¿Cuál es mi entrenamiento de hoy?' },
      { key: 'water', icon: Droplets, label: 'Hidratación', color: '#29B6F6', action: 'send', target: 'Registrar 500ml de agua' },
      { key: 'scan', icon: Camera, label: 'Escanear', color: GENESIS_COLORS.textSecondary, action: 'navigate', target: '/(modals)/camera-scanner' },
      { key: 'progress', icon: TrendingUp, label: '¿Cómo voy?', color: GENESIS_COLORS.agentTrack, action: 'send', target: '¿Cómo va mi progreso esta semana?' },
      { key: 'logos', icon: BookOpen, label: 'LOGOS', color: '#AB47BC', action: 'navigate', target: '/(screens)/education' },
    ];
  }

  // Evening (17+)
  return [
    { key: 'summary', icon: TrendingUp, label: 'Resumen del día', color: GENESIS_COLORS.agentTrack, action: 'send', target: '¿Cómo estuvo mi día?' },
    { key: 'dinner', icon: Utensils, label: '¿Qué ceno?', color: GENESIS_COLORS.agentFuel, action: 'send', target: '¿Qué me recomiendas cenar hoy?' },
    { key: 'recovery', icon: Heart, label: 'Recovery', color: GENESIS_COLORS.agentMind, action: 'send', target: '¿Qué puedo hacer para recuperarme mejor?' },
    { key: 'checkin', icon: ClipboardCheck, label: 'Check-in', color: '#00BFA5', action: 'navigate', target: '/(modals)/check-in' },
    { key: 'water', icon: Droplets, label: 'Hidratación', color: '#29B6F6', action: 'send', target: '¿Cuánta agua llevo hoy?' },
    { key: 'sleep', icon: Moon, label: 'Rutina de sueño', color: '#7E57C2', action: 'send', target: '¿Cuál es mi rutina ideal para dormir?' },
  ];
}

type Props = { onSend: (text: string) => void };

export function StarterActions({ onSend }: Props) {
  const router = useRouter();
  const actions = getTimeActions();

  const handlePress = (action: StarterAction) => {
    hapticSelection();
    if (action.action === 'navigate') {
      router.push(action.target as any);
    } else {
      onSend(action.target);
    }
  };

  return (
    <View style={{ paddingHorizontal: 4 }}>
      {/* 3-column grid — clean toolbar style */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Pressable
              key={action.key}
              onPress={() => handlePress(action)}
              style={{ width: '31%', flexGrow: 1 }}
            >
              <LiquidGlassCard effect="clear" borderRadius={14}>
                <View style={{ paddingVertical: 16, alignItems: 'center', gap: 8 }}>
                  <Icon size={20} color={action.color} strokeWidth={1.8} />
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: 'Inter',
                      fontSize: 11,
                      fontWeight: '500',
                      color: GENESIS_COLORS.textSecondary,
                      textAlign: 'center',
                    }}
                  >
                    {action.label}
                  </Text>
                </View>
              </LiquidGlassCard>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
