import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { useGenesisStore } from '../../stores';
import { ChatMessage, TypingIndicator } from './ChatMessage';
import { WidgetRenderer } from './WidgetRenderer';

export function GenesisChat() {
  const [value, setValue] = useState('');
  const { messages, isLoading, sendMessage } = useGenesisStore();
  const [lastError, setLastError] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);

  const widgets = useMemo(() => messages.flatMap((message) => message.widgets ?? []), [messages]);

  // Check if the last message was a mock fallback (offline mode)
  const lastMsg = messages[messages.length - 1];
  const isOffline = lastMsg?.id?.startsWith('mock-');

  const handleSend = async (content: string) => {
    setLastError(null);
    setFailedMessage(null);
    try {
      await sendMessage(content);
    } catch (err: any) {
      setLastError(err?.message ?? 'Failed to send message');
      setFailedMessage(content);
    }
  };

  return (
    <View style={{ flex: 1, gap: 10 }}>
      {/* Offline banner */}
      {isOffline && (
        <View style={{
          backgroundColor: `${theme.colors.warning}22`,
          borderRadius: 8,
          padding: 8,
          borderWidth: 1,
          borderColor: `${theme.colors.warning}44`,
        }}>
          <Text style={{ color: theme.colors.warning, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', textAlign: 'center' }}>
            Offline mode — using local responses
          </Text>
        </View>
      )}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 12 }}
        renderItem={({ item }) => <ChatMessage message={item} />}
        ListFooterComponent={isLoading ? <TypingIndicator /> : null}
      />

      {widgets.length > 0 ? (
        <View style={{ gap: 8 }}>
          {widgets.slice(-2).map((widget) => (
            <WidgetRenderer key={widget.id} widget={widget} />
          ))}
        </View>
      ) : null}

      {/* Error with retry */}
      {lastError && failedMessage && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 }}>
          <Text style={{ color: theme.colors.error, fontSize: 11, flex: 1 }}>Failed to send</Text>
          <Pressable
            onPress={() => handleSend(failedMessage)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6, borderRadius: 8, backgroundColor: `${theme.colors.error}22` }}
          >
            <RefreshCw size={12} color={theme.colors.error} />
            <Text style={{ color: theme.colors.error, fontSize: 11, fontWeight: '600' }}>Retry</Text>
          </Pressable>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Ask GENESIS"
          placeholderTextColor={theme.colors.textTertiary}
          style={{
            flex: 1,
            color: theme.colors.textPrimary,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: theme.colors.surface,
          }}
        />
        <Pressable
          disabled={isLoading || value.trim().length === 0}
          onPress={async () => {
            const content = value.trim();
            if (!content) return;
            setValue('');
            await handleSend(content);
          }}
          style={{
            borderRadius: 12,
            paddingHorizontal: 16,
            justifyContent: 'center',
            backgroundColor: isLoading ? `${theme.colors.primary}66` : theme.colors.primary,
          }}
        >
          <Text style={{ color: '#0D0D2B', fontWeight: '700' }}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}
