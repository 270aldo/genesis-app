import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { GenesisChat, VoiceCallUI } from '../../components/genesis';
import { theme } from '../../constants/theme';
import { useGenesisStore } from '../../stores';

export default function GenesisChatModal() {
  const router = useRouter();
  const voiceState = useGenesisStore((state) => state.voiceState);
  const setVoiceState = useGenesisStore((state) => state.setVoiceState);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgStart, padding: 20, paddingTop: 56, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.textPrimary, fontSize: 22, fontWeight: '700' }}>GENESIS Chat</Text>
        <Pressable onPress={() => router.back()} style={{ borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: theme.colors.surface }}>
          <Text style={{ color: theme.colors.textSecondary }}>Close</Text>
        </Pressable>
      </View>
      <VoiceCallUI
        state={voiceState}
        onToggle={() =>
          setVoiceState(voiceState === 'idle' ? 'listening' : voiceState === 'listening' ? 'speaking' : 'idle')
        }
      />
      <GenesisChat />
    </View>
  );
}
