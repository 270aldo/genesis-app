import { Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import type { ChatMessage as ChatMessageType } from '../../types';

type ChatMessageProps = {
  message: ChatMessageType;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <View style={{ alignItems: isUser ? 'flex-end' : 'flex-start' }}>
      <View
        style={{
          maxWidth: '88%',
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: isUser ? `${theme.colors.primary}33` : theme.colors.surfaceElevated,
          borderWidth: 1,
          borderColor: isUser ? `${theme.colors.primary}66` : theme.colors.borderSubtle,
        }}
      >
        <Text style={{ color: theme.colors.textPrimary }}>{message.content}</Text>
      </View>
    </View>
  );
}
