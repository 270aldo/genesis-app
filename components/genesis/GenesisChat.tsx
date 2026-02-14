import { useMemo, useRef, useState } from 'react';
import { FlatList, Platform, Pressable, Text, TextInput, View, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUp, RefreshCw } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { useGenesisStore } from '../../stores';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './ChatMessage';
import { WidgetRenderer } from './WidgetRenderer';
import { hapticLight } from '../../utils/haptics';

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
  const sendDisabled = isLoading || value.trim().length === 0;

  const handleSend = async (content: string) => {
    setLastError(null);
    setFailedMessage(null);
    try {
      await sendMessage(content);
    } catch (err: any) {
      setLastError(err?.message ?? 'Error al enviar');
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
            backgroundColor: `${GENESIS_COLORS.warning}22`,
            borderRadius: 8,
            padding: 8,
            borderWidth: 1,
            borderColor: `${GENESIS_COLORS.warning}44`,
          }}>
            <Text style={{ color: GENESIS_COLORS.warning, fontSize: 11, fontFamily: 'JetBrainsMonoMedium', textAlign: 'center' }}>
              OFFLINE — respuestas locales
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
            <Text style={{ color: GENESIS_COLORS.error, fontSize: 11, flex: 1 }}>Error al enviar</Text>
            <Pressable
              onPress={() => handleSend(failedMessage)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6, borderRadius: 8, backgroundColor: `${GENESIS_COLORS.error}22` }}
            >
              <RefreshCw size={12} color={GENESIS_COLORS.error} />
              <Text style={{ color: GENESIS_COLORS.error, fontSize: 11, fontWeight: '600' }}>Reintentar</Text>
            </Pressable>
          </View>
        )}

        {/* Input bar */}
        <View style={{
          backgroundColor: GENESIS_COLORS.surfaceCard,
          borderWidth: 1,
          borderColor: GENESIS_COLORS.borderSubtle,
          borderRadius: 24,
          padding: 6,
          flexDirection: 'row',
          gap: 6,
          alignItems: 'flex-end',
        }}>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Escríbele a GENESIS..."
            placeholderTextColor={GENESIS_COLORS.textMuted}
            multiline
            style={{
              flex: 1,
              color: GENESIS_COLORS.textPrimary,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontFamily: 'Inter',
              fontSize: 14,
              maxHeight: 100,
            }}
          />
          <View style={{ opacity: sendDisabled ? 0.4 : 1 }}>
            <Pressable
              disabled={sendDisabled}
              onPress={async () => {
                const content = value.trim();
                if (!content) return;
                hapticLight();
                setValue('');
                await handleSend(content);
              }}
            >
              <LinearGradient
                colors={[GENESIS_COLORS.primary, GENESIS_COLORS.primaryDark]}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowUp size={20} color="#FFFFFF" strokeWidth={2.5} />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
