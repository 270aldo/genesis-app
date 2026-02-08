import { Pressable, Text } from 'react-native';
import { theme } from '../../constants/theme';

type ButtonProps = {
  label: string;
  onPress?: () => void;
};

export function Button({ label, onPress }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: theme.radius.button,
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
      }}
    >
      <Text style={{ color: '#0D0D2B', fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}
