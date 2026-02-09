import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { theme } from '../../constants/theme';

export function FloatingGenesisButton() {
  const router = useRouter();

  return (
    <Pressable
      accessibilityLabel="Open GENESIS chat"
      onPress={() => router.push('/(modals)/genesis-chat')}
      style={{
        position: 'absolute',
        right: 20,
        bottom: 24,
        width: 62,
        height: 62,
        borderRadius: 31,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${theme.colors.primary}EE`,
        borderWidth: 1,
        borderColor: `${theme.colors.primary}FF`,
        shadowColor: theme.shadows.glowPrimary,
        shadowOpacity: 0.5,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
      }}
    >
      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>GEN</Text>
    </Pressable>
  );
}
