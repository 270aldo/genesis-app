import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cpu, Menu } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import { GENESIS_COLORS } from '../../constants/colors';
import { useGenesisChat } from '../../hooks/useGenesisChat';
import { MessageBubble } from '../../components/genesis/MessageBubble';
import { WidgetRenderer } from '../../components/genesis/WidgetRenderer';
import { useDrawer } from '../../contexts/DrawerContext';
import { BriefingCard } from '../../components/chat/BriefingCard';
import { QuickActionsBar } from '../../components/chat/QuickActionsBar';
import { ChatInput } from '../../components/chat/ChatInput';
import { AgentThinkingBlock } from '../../components/chat/AgentThinkingBlock';
import { SeasonBadge } from '../../components/chat/SeasonBadge';
import { usePanels } from '../../contexts/PanelContext';
import { hapticLight } from '../../utils/haptics';
import type { ChatMessage } from '../../types';
import type { AgentType } from '../../components/chat/AgentContribution';

export default function ChatScreen() {
  const [value, setValue] = useState('');
  const { messages, isLoading, send } = useGenesisChat();
  const [lastError, setLastError] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { openDrawer } = useDrawer();
  const { openWorkoutPanel } = usePanels();

  const sendDisabled = isLoading || value.trim().length === 0;

  // Agent thinking state
  const [thinkingElapsed, setThinkingElapsed] = useState(0);
  const thinkingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [lastThinkingTime, setLastThinkingTime] = useState(0);
  const [thinkingContributions, setThinkingContributions] = useState<
    Array<{ agent: AgentType; text: string }>
  >([]);

  // Track loading state for thinking UI
  useEffect(() => {
    if (isLoading) {
      setThinkingElapsed(0);
      setThinkingContributions([]);
      thinkingTimerRef.current = setInterval(() => {
        setThinkingElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (thinkingTimerRef.current) {
        clearInterval(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }
      if (thinkingElapsed > 0) {
        setLastThinkingTime(thinkingElapsed);
      }
    }
    return () => {
      if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current);
    };
  }, [isLoading]);

  // Simulate agent contributions based on last user message
  useEffect(() => {
    if (!isLoading || thinkingElapsed < 1) return;

    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;
    const lower = lastUserMsg.content.toLowerCase();

    const contribs: Array<{ agent: AgentType; text: string }> = [];
    if (lower.match(/entreno|workout|ejercicio|serie|reps|peso|fuerza/)) {
      contribs.push({ agent: 'train', text: 'Analizando tu plan de entrenamiento...' });
    }
    if (lower.match(/comida|macro|nutrición|comer|proteina|calorias|dieta/)) {
      contribs.push({ agent: 'fuel', text: 'Revisando tus macros y nutrición...' });
    }
    if (lower.match(/recovery|dormir|sueño|estres|mental|meditacion|bienestar/)) {
      contribs.push({ agent: 'mind', text: 'Evaluando tu bienestar...' });
    }
    if (lower.match(/progreso|record|pr|avance|semana|season|métrica/)) {
      contribs.push({ agent: 'track', text: 'Consultando tu progreso...' });
    }
    if (contribs.length === 0) {
      contribs.push({ agent: 'train', text: 'Procesando tu consulta...' });
    }

    setThinkingContributions(contribs);
  }, [isLoading, thinkingElapsed, messages]);

  // Pulse animation for empty state
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    if (messages.length === 0) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1250 }),
          withTiming(1, { duration: 1250 }),
        ),
        -1,
        true,
      );
    }
  }, [messages.length, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleSend = async (content: string) => {
    setLastError(null);
    setFailedMessage(null);
    try {
      await send(content);
    } catch (err: any) {
      setLastError(err?.message ?? 'Error al enviar');
      setFailedMessage(content);
    }
  };

  const handleQuickAction = useCallback(
    (text: string) => {
      handleSend(text);
    },
    [handleSend],
  );

  const handleSendButton = useCallback(async () => {
    const content = value.trim();
    if (!content) return;
    hapticLight();
    setValue('');
    await handleSend(content);
  }, [value, handleSend]);

  // Build flat list data: messages + inline widgets after assistant messages
  type ListItem =
    | { type: 'message'; data: ChatMessage }
    | { type: 'widgets'; data: ChatMessage }
    | { type: 'thinking'; data: null };

  const listData = useMemo(() => {
    const items: ListItem[] = [];
    for (const msg of messages) {
      items.push({ type: 'message', data: msg });
      if (msg.role === 'assistant' && msg.widgets?.length) {
        items.push({ type: 'widgets', data: msg });
      }
    }
    // Show thinking block while loading (or collapsed after response)
    if (isLoading) {
      items.push({ type: 'thinking', data: null });
    }
    return items;
  }, [messages, isLoading]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'message') {
        return (
          <Animated.View entering={FadeInDown.duration(250)}>
            <MessageBubble message={item.data} />
          </Animated.View>
        );
      }
      if (item.type === 'thinking') {
        return (
          <AgentThinkingBlock
            isActive={isLoading}
            contributions={thinkingContributions}
            elapsedSeconds={thinkingElapsed}
          />
        );
      }
      // widgets row
      return (
        <View style={{ gap: 8, paddingLeft: 4, paddingRight: 16 }}>
          {item.data!.widgets!.map((widget, index) => (
            <WidgetRenderer key={widget.id} widget={widget} staggerIndex={index} />
          ))}
        </View>
      );
    },
    [isLoading, thinkingContributions, thinkingElapsed],
  );

  const keyExtractor = useCallback(
    (item: ListItem, index: number) => {
      if (item.type === 'thinking') return 'thinking-block';
      if (item.type === 'message') return item.data!.id;
      return `widgets-${item.data!.id}`;
    },
    [],
  );

  return (
    <LinearGradient
      colors={[GENESIS_COLORS.bgGradientStart, '#000000']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 12,
            }}
          >
            {/* Logo */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <LinearGradient
                colors={['#6D00FF', '#a866ff']}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Cpu size={16} color="#FFFFFF" />
              </LinearGradient>
              <Text
                style={{
                  color: GENESIS_COLORS.primary,
                  fontSize: 12,
                  fontFamily: 'JetBrainsMonoBold',
                  letterSpacing: 2,
                }}
              >
                GENESIS
              </Text>
            </View>

            {/* Season badge */}
            <SeasonBadge />

            {/* Hamburger */}
            <Pressable
              onPress={() => {
                hapticLight();
                openDrawer();
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.06)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Menu size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Chat content */}
          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            {messages.length === 0 ? (
              /* Empty state */
              <View style={{ flex: 1, gap: 16 }}>
                {/* Briefing card at top */}
                <BriefingCard />

                {/* Centered GENESIS logo */}
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                  <View style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }}>
                    <Animated.View
                      style={[
                        {
                          position: 'absolute',
                          width: 80,
                          height: 80,
                          borderRadius: 40,
                          borderWidth: 1.5,
                          borderColor: 'rgba(109,0,255,0.3)',
                        },
                        pulseStyle,
                      ]}
                    />
                    <LinearGradient
                      colors={['#6D00FF', '#a866ff']}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Cpu size={28} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                  <View style={{ alignItems: 'center', gap: 8 }}>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 20,
                        fontFamily: 'InterBold',
                        textAlign: 'center',
                      }}
                    >
                      ¿En qué puedo ayudarte?
                    </Text>
                    <Text
                      style={{
                        color: GENESIS_COLORS.textMuted,
                        fontSize: 14,
                        fontFamily: 'Inter',
                        textAlign: 'center',
                        maxWidth: 280,
                        lineHeight: 20,
                      }}
                    >
                      Pregúntame sobre entrenamiento, nutrición, recuperación o bienestar.
                    </Text>
                  </View>
                </View>

                {/* Quick actions at bottom of empty state */}
                <QuickActionsBar onSend={handleQuickAction} />
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={listData}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={<BriefingCard />}
                contentContainerStyle={{ gap: 10, paddingBottom: 12 }}
                onContentSizeChange={() =>
                  flatListRef.current?.scrollToEnd({ animated: true })
                }
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* Error with retry */}
          {lastError && failedMessage && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 20,
                paddingBottom: 4,
              }}
            >
              <Text style={{ color: GENESIS_COLORS.error, fontSize: 11, flex: 1 }}>
                Error al enviar
              </Text>
              <Pressable
                onPress={() => handleSend(failedMessage)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  padding: 6,
                  borderRadius: 8,
                  backgroundColor: `${GENESIS_COLORS.error}22`,
                }}
              >
                <Text
                  style={{
                    color: GENESIS_COLORS.error,
                    fontSize: 11,
                    fontWeight: '600',
                  }}
                >
                  Reintentar
                </Text>
              </Pressable>
            </View>
          )}

          {/* Quick actions when in conversation */}
          {messages.length > 0 && !isLoading && (
            <QuickActionsBar onSend={handleQuickAction} />
          )}

          {/* Chat input */}
          <ChatInput
            value={value}
            onChangeText={setValue}
            onSend={handleSendButton}
            sendDisabled={sendDisabled}
            onOpenWorkout={openWorkoutPanel}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
