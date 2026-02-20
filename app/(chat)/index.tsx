import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Layers, Menu } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GENESIS_COLORS } from '../../constants/colors';
import { useGenesisChat } from '../../hooks/useGenesisChat';
import { MessageBubble } from '../../components/genesis/MessageBubble';
import { WidgetRenderer } from '../../components/genesis/WidgetRenderer';
import { useDrawer } from '../../contexts/DrawerContext';
import { BriefingCard } from '../../components/chat/BriefingCard';
import { ChatInput } from '../../components/chat/ChatInput';
import { ToolsPopover } from '../../components/chat/ToolsPopover';
import { AgentThinkingBlock } from '../../components/chat/AgentThinkingBlock';
import { StarterActions } from '../../components/chat/StarterActions';
import { SeasonBadge } from '../../components/chat/SeasonBadge';
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

  const sendDisabled = isLoading || value.trim().length === 0;

  // ── FIX 4: ToolsPopover state at screen level ──
  const [showPopover, setShowPopover] = useState(false);
  const togglePopover = useCallback(() => {
    hapticLight();
    setShowPopover((prev) => !prev);
  }, []);
  const closePopover = useCallback(() => setShowPopover(false), []);

  // ── FIX 5: Smart auto-scroll — only if user is near bottom ──
  const isNearBottomRef = useRef(true);
  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    isNearBottomRef.current = distanceFromBottom < 120;
  }, []);

  // Agent thinking state
  const [thinkingElapsed, setThinkingElapsed] = useState(0);
  const thinkingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const thinkingElapsedRef = useRef(0);
  const [thinkingContributions, setThinkingContributions] = useState<
    Array<{ agent: AgentType; text: string }>
  >([]);

  // Track loading state for thinking UI
  useEffect(() => {
    if (isLoading) {
      thinkingElapsedRef.current = 0;
      setThinkingElapsed(0);
      setThinkingContributions([]);
      thinkingTimerRef.current = setInterval(() => {
        thinkingElapsedRef.current += 1;
        setThinkingElapsed(thinkingElapsedRef.current);
      }, 1000);
    } else {
      if (thinkingTimerRef.current) {
        clearInterval(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }
    }
    return () => {
      if (thinkingTimerRef.current) {
        clearInterval(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }
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

  const handleSend = async (content: string) => {
    setLastError(null);
    setFailedMessage(null);
    closePopover(); // Close popover on any send
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

  // ── Build flat list data with grouping metadata ──
  type ListItem =
    | { type: 'message'; data: ChatMessage; showHeader: boolean; isFirstInGroup: boolean }
    | { type: 'widgets'; data: ChatMessage }
    | { type: 'thinking'; data: null };

  const listData = useMemo(() => {
    const items: ListItem[] = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const prevMsg = i > 0 ? messages[i - 1] : null;

      // FIX 2+3: Determine if this is a new sender group
      const isFirstInGroup = !prevMsg || prevMsg.role !== msg.role;
      // Only show header (avatar/name) for first message in a GENESIS group
      const showHeader = msg.role === 'assistant' ? isFirstInGroup : true;

      items.push({ type: 'message', data: msg, showHeader, isFirstInGroup });

      if (msg.role === 'assistant' && msg.widgets?.length) {
        items.push({ type: 'widgets', data: msg });
      }
    }
    if (isLoading) {
      items.push({ type: 'thinking', data: null });
    }
    return items;
  }, [messages, isLoading]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'message') {
        return (
          <MessageBubble
            message={item.data}
            showHeader={item.showHeader}
            isFirstInGroup={item.isFirstInGroup}
          />
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
      // widgets row — aligned with GENESIS message text (38px = 28px avatar + 10px gap)
      return (
        <View style={{ gap: 8, marginLeft: 38, paddingRight: 16, marginTop: 6 }}>
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

  // FIX 5: Smart scroll — only auto-scroll when near bottom
  const handleContentSizeChange = useCallback(() => {
    if (isNearBottomRef.current) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: GENESIS_COLORS.void }}>
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
                <Layers size={16} color="#FFFFFF" />
              </LinearGradient>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontFamily: 'JetBrainsMono',
                  fontWeight: '600',
                  letterSpacing: 1.5,
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
              /* ── EMPTY STATE ── */
              <View style={{ flex: 1 }}>
                {/* Top: Compact GENESIS header */}
                <Animated.View
                  entering={FadeInUp.delay(100).duration(300)}
                  style={{ alignItems: 'center', gap: 6, paddingTop: 12, paddingBottom: 16 }}
                >
                  <LinearGradient
                    colors={['#6D00FF', '#a866ff']}
                    style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Layers size={20} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={{ color: GENESIS_COLORS.textGhost, fontSize: 13, fontFamily: 'Inter', textAlign: 'center' }}>
                    ¿En qué te ayudo hoy?
                  </Text>
                </Animated.View>

                {/* Briefing card — collapsed by default, tappable */}
                <Animated.View entering={FadeInUp.delay(200).duration(250)} style={{ marginBottom: 12 }}>
                  <BriefingCard defaultExpanded={false} />
                </Animated.View>

                {/* Starter action grid */}
                <StarterActions onSend={handleQuickAction} />
              </View>
            ) : (
              /* ── ACTIVE CONVERSATION ── */
              <FlatList
                ref={flatListRef}
                data={listData}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                // FIX 1: BriefingCard starts collapsed in active conversation
                ListHeaderComponent={
                  <View style={{ paddingBottom: 16 }}>
                    <BriefingCard defaultExpanded={false} />
                  </View>
                }
                // FIX 3: No global gap — spacing handled by MessageBubble marginTop
                contentContainerStyle={{ paddingBottom: 12 }}
                // FIX 5: Smart auto-scroll
                onScroll={handleScroll}
                scrollEventThrottle={100}
                onContentSizeChange={handleContentSizeChange}
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

          {/* Chat input */}
          <ChatInput
            value={value}
            onChangeText={setValue}
            onSend={handleSendButton}
            sendDisabled={sendDisabled}
            onQuickSend={handleQuickAction}
            showPopover={showPopover}
            onTogglePopover={togglePopover}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* ToolsPopover overlay — OUTSIDE SafeAreaView/KAV to avoid layout crashes */}
      {showPopover && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}>
          {/* Backdrop */}
          <Pressable
            onPress={closePopover}
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
          />
          {/* Popover anchored to bottom */}
          <View style={{ position: 'absolute', bottom: 90, left: 16, right: 16 }}>
            <Animated.View entering={FadeInUp.duration(200)}>
              <ToolsPopover
                onClose={closePopover}
                onSend={(text) => { closePopover(); handleQuickAction(text); }}
              />
            </Animated.View>
          </View>
        </View>
      )}
    </View>
  );
}
