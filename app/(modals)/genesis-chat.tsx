import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { GenesisChat, VoiceCallUI } from '../../components/genesis';
import { theme } from '../../constants/theme';
import { useGenesisStore } from '../../stores';
import { QUICK_ACTIONS } from '../../data';

export default function GenesisChatModal() {
  const router = useRouter();
  const voiceState = useGenesisStore((state) => state.voiceState);
  const setVoiceState = useGenesisStore((state) => state.setVoiceState);
  const sendMessage = useGenesisStore((state) => state.sendMessage);
  const messages = useGenesisStore((state) => state.messages);
  const [showQuickActions, setShowQuickActions] = useState(true);

  const handleQuickAction = (prompt: string) => {
    setShowQuickActions(false);
    sendMessage(prompt);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bgStart, padding: 20, paddingTop: 56, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.textPrimary, fontSize: 22, fontFamily: 'InterBold' }}>GENESIS Chat</Text>
        <Pressable onPress={() => router.back()} style={{ borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: theme.colors.surface }}>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: 'Inter' }}>Close</Text>
        </Pressable>
      </View>
      <VoiceCallUI
        state={voiceState}
        onToggle={() =>
          setVoiceState(voiceState === 'idle' ? 'listening' : voiceState === 'listening' ? 'speaking' : 'idle')
        }
      />
      {showQuickActions && messages.length === 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
        >
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.id}
              onPress={() => handleQuickAction(action.prompt)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: '#b39aff', fontSize: 12, fontFamily: 'JetBrainsMonoMedium' }}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      <GenesisChat />
    </View>
  );
}
