import { useState, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';

type FormCuesProps = {
  cues: string[];
};

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
          {cues.map((cue, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <View style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: GENESIS_COLORS.primary,
                marginTop: 6,
              }} />
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
          ))}
        </View>
      )}
    </View>
  );
}
