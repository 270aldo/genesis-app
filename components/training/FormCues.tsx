import { useState, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronDown, ChevronUp, Footprints, ArrowUp, ArrowDown, Shield, Scan, CircleDot, Target, RotateCcw, Hand, Zap } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';

type FormCuesProps = {
  cues: string[];
};

const CUE_ICON_RULES: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ['pie', 'foot', 'stance', 'feet', 'pies'], icon: Footprints },
  { keywords: ['arriba', 'up', 'push', 'press', 'sube', 'empuja'], icon: ArrowUp },
  { keywords: ['abajo', 'down', 'lower', 'descend', 'baja'], icon: ArrowDown },
  { keywords: ['core', 'brace', 'tight', 'espalda', 'abdomen', 'tensa'], icon: Shield },
  { keywords: ['retract', 'squeeze', 'contract', 'aprieta', 'contrae'], icon: Scan },
  { keywords: ['grip', 'agarre', 'mano', 'manos', 'hand'], icon: Hand },
  { keywords: ['explosive', 'rápido', 'rapido', 'power', 'explosiv'], icon: Zap },
  { keywords: ['rotate', 'rotar', 'giro', 'twist', 'rota'], icon: RotateCcw },
  { keywords: ['target', 'foco', 'focus', 'enfoca', 'activa'], icon: Target },
];

function getIconForCue(cue: string): LucideIcon {
  const lower = cue.toLowerCase();
  for (const rule of CUE_ICON_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.icon;
    }
  }
  return CircleDot;
}

export function FormCues({ cues }: FormCuesProps) {
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => setExpanded((prev) => !prev), []);

  if (cues.length === 0) return null;

  return (
    <View style={{
      backgroundColor: GENESIS_COLORS.surfaceCard,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: GENESIS_COLORS.borderSubtle,
      overflow: 'hidden',
    }}>
      <Pressable
        onPress={toggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 12,
          paddingHorizontal: 14,
        }}
      >
        <Text style={{
          color: GENESIS_COLORS.primary,
          fontSize: 12,
          fontFamily: 'JetBrainsMonoSemiBold',
        }}>
          Ver indicaciones
        </Text>
        {expanded
          ? <ChevronUp size={16} color={GENESIS_COLORS.primary} />
          : <ChevronDown size={16} color={GENESIS_COLORS.primary} />
        }
      </Pressable>

      {expanded && (
        <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 8 }}>
          {cues.map((cue, index) => {
            const Icon = getIconForCue(cue);
            return (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: GENESIS_COLORS.primary + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 0,
                }}>
                  <Icon size={12} color={GENESIS_COLORS.primary} />
                </View>
                <Text style={{
                  flex: 1,
                  color: GENESIS_COLORS.textSecondary,
                  fontSize: 12,
                  fontFamily: 'Inter',
                  lineHeight: 17,
                }}>
                  {cue}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
