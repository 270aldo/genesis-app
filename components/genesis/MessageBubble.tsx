import { Text, View } from 'react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import type { ChatMessage } from '../../types';

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={{ alignItems: isUser ? 'flex-end' : 'flex-start' }}>
      <View
        style={
          isUser
            ? {
                maxWidth: '80%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                borderBottomRightRadius: 4,
                padding: 14,
              }
            : {
                maxWidth: '85%',
                backgroundColor: 'rgba(109, 0, 255, 0.12)',
                borderRadius: 16,
                borderTopLeftRadius: 4,
                borderLeftWidth: 3,
                borderLeftColor: '#6D00FF',
                padding: 14,
              }
        }
      >
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter', lineHeight: 20 }}>
          {message.content}
        </Text>
        {message.timestamp ? (
          <Text style={{
            color: GENESIS_COLORS.textMuted,
            fontSize: 10,
            fontFamily: 'Inter',
            marginTop: 4,
          }}>
            {new Date(message.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
