import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { theme } from '../../constants/theme';
import { useGenesisStore } from '../../stores';
import { ChatMessage } from './ChatMessage';
import { WidgetRenderer } from './WidgetRenderer';

export function GenesisChat() {
  const [value, setValue] = useState('');
  const { messages, isLoading, sendMessage } = useGenesisStore();

  const widgets = useMemo(() => messages.flatMap((message) => message.widgets ?? []), [messages]);

  return (
    <View style={{ flex: 1, gap: 10 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 12 }}
        renderItem={({ item }) => <ChatMessage message={item} />}
      />

      {widgets.length > 0 ? (
        <View style={{ gap: 8 }}>
          {widgets.slice(-2).map((widget) => (
            <WidgetRenderer key={widget.id} widget={widget} />
          ))}
        </View>
      ) : null}

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
            await sendMessage(content);
          }}
          style={{
            borderRadius: 12,
            paddingHorizontal: 16,
            justifyContent: 'center',
            backgroundColor: isLoading ? `${theme.colors.primary}66` : theme.colors.primary,
          }}
        >
          <Text style={{ color: '#0D0D2B', fontWeight: '700' }}>{isLoading ? '...' : 'Send'}</Text>
        </Pressable>
      </View>
    </View>
  );
}
