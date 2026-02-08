import { Pressable, Text, View } from 'react-native';
import { theme } from '../../constants/theme';

type VoiceCallUIProps = {
  state: 'idle' | 'listening' | 'speaking';
  onToggle: () => void;
};

export function VoiceCallUI({ state, onToggle }: VoiceCallUIProps) {
  const label = state === 'idle' ? 'Start Voice' : state === 'listening' ? 'Listening…' : 'Speaking…';

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: theme.colors.textSecondary }}>Voice Coach</Text>
      <Pressable
        onPress={onToggle}
        style={{
          borderRadius: 14,
          paddingVertical: 12,
          alignItems: 'center',
          backgroundColor: `${theme.colors.primary}22`,
          borderWidth: 1,
          borderColor: `${theme.colors.primary}66`,
        }}
      >
        <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>{label}</Text>
      </Pressable>
    </View>
  );
}
