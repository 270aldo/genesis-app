import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { GenesisChat, VoiceCallUI } from '../../components/genesis';
import { theme } from '../../constants/theme';
import { GENESIS_COLORS } from '../../constants/colors';
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
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 2 }}>
          <Text style={{ color: GENESIS_COLORS.primary, fontSize: 14, fontFamily: 'JetBrainsMonoBold' }}>
            GENESIS
          </Text>
          <Text style={{ color: GENESIS_COLORS.textTertiary, fontSize: 12, fontFamily: 'Inter' }}>
            AI Coach
          </Text>
        </View>
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

      {/* Quick Action Pills */}
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
                backgroundColor: GENESIS_COLORS.primaryDim,
                borderWidth: 1,
                borderColor: GENESIS_COLORS.primary,
                borderRadius: 9999,
                paddingHorizontal: 14,
                paddingVertical: 8,
              }}
            >
              <Text style={{
                color: GENESIS_COLORS.primary,
                fontSize: 10,
                fontFamily: 'JetBrainsMonoMedium',
                textTransform: 'uppercase',
              }}>
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
