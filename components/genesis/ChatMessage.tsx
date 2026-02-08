import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
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

export function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
      );

    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 200);
    const a3 = animate(dot3, 400);
    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={{ alignItems: 'flex-start' }}>
      <View
        style={{
          flexDirection: 'row',
          gap: 4,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: theme.colors.surfaceElevated,
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
        }}
      >
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.primary,
              opacity: dot,
            }}
          />
        ))}
      </View>
    </View>
  );
}
