import { useMemo, useRef, useState } from 'react';
import { FlatList, Platform, Pressable, Text, TextInput, View, KeyboardAvoidingView } from 'react-native';
import { ArrowUp, RefreshCw } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { useGenesisStore } from '../../stores';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './ChatMessage';
import { WidgetRenderer } from './WidgetRenderer';

export function GenesisChat() {
  const [value, setValue] = useState('');
  const { messages, isLoading, sendMessage } = useGenesisStore();
  const [lastError, setLastError] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const lastAssistantWidgets = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant' && messages[i].widgets?.length) {
        return messages[i].widgets!;
      }
    }
    return [];
  }, [messages]);

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
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
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 10, paddingBottom: 12 }}
          renderItem={({ item }) => <MessageBubble message={item} />}
          ListFooterComponent={isLoading ? <TypingIndicator /> : null}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {lastAssistantWidgets.length > 0 ? (
          <View style={{ gap: 8 }}>
            {lastAssistantWidgets.map((widget, index) => (
              <WidgetRenderer key={widget.id} widget={widget} staggerIndex={index} />
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

        {/* Input bar */}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Ask GENESIS"
            placeholderTextColor={GENESIS_COLORS.textMuted}
            multiline
            style={{
              flex: 1,
              color: GENESIS_COLORS.textPrimary,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              fontFamily: 'Inter',
              fontSize: 14,
              maxHeight: 100,
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
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isLoading || value.trim().length === 0
                ? `${GENESIS_COLORS.primary}66`
                : GENESIS_COLORS.primary,
            }}
          >
            <ArrowUp size={20} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
