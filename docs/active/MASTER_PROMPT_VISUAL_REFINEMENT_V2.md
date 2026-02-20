# GENESIS Visual Refinement V2.2 — EXECUTE THIS

**Date:** 2026-02-20
**Branch:** `feat/visual-refinement-v2`
**Reference mockup:** `docs/plans/chat-ui-mockup-v2.html` (open it in browser to see the target)

---

## CRITICAL INSTRUCTIONS

1. **USE THE EXPO MCP SERVER** — run `EXPO_UNSTABLE_MCP_SERVER=1 npx expo start` and use the MCP to validate React Native APIs, Reanimated v4 syntax, and Expo SDK 54 compatibility.
2. **DO NOT IMPROVISE** — copy each file below EXACTLY as written. Do not add, remove, or rename props.
3. **DO NOT TOUCH** — `bff/`, `stores/`, `services/`, `hooks/`, `types/`, business logic.
4. **LiquidGlass does NOT exist yet** as an npm package. The `LiquidGlassCard` component below is a **glass-effect wrapper using standard React Native** with backdrop simulation. Do NOT try to install `@callstack/liquid-glass`.
5. After all files are written, run `npx expo start` and verify the app compiles.
6. Commit, push, and create PR per the GIT section at the end.

---

## FILE 1: `components/ui/LiquidGlassCard.tsx` — REPLACE ENTIRELY

This is the glass card wrapper. Uses LinearGradient + border for the glass effect since real LiquidGlass is not available yet.

```tsx
import type { PropsWithChildren } from 'react';
import { View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Effect = 'clear' | 'regular';

type LiquidGlassCardProps = PropsWithChildren<{
  effect?: Effect;
  borderRadius?: number;
  style?: ViewStyle;
}>;

const EFFECT_STYLES: Record<Effect, { colors: [string, string]; borderColor: string }> = {
  clear: {
    colors: ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)'],
    borderColor: 'rgba(255,255,255,0.10)',
  },
  regular: {
    colors: ['rgba(255,255,255,0.05)', 'rgba(109,0,255,0.04)'],
    borderColor: 'rgba(255,255,255,0.08)',
  },
};

export function LiquidGlassCard({
  children,
  effect = 'clear',
  borderRadius = 16,
  style,
}: LiquidGlassCardProps) {
  const { colors, borderColor } = EFFECT_STYLES[effect];

  return (
    <View style={[{ borderRadius, borderWidth: 1, borderColor, overflow: 'hidden' }, style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        {children}
      </LinearGradient>
    </View>
  );
}
```

---

## FILE 2: `components/genesis/MessageBubble.tsx` — REPLACE ENTIRELY

User = glass bubble right with iMessage corner. GENESIS = NO bubble, avatar + name row, then text with VERTICAL violet gradient line on the left.

```tsx
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Layers } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import type { ChatMessage } from '../../types';

type MessageBubbleProps = {
  message: ChatMessage;
};

function formatTime(ts: number | undefined): string | null {
  if (!ts) return null;
  return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const time = formatTime(message.timestamp);

  // ── USER BUBBLE ──
  if (isUser) {
    return (
      <View style={{ alignItems: 'flex-end', paddingHorizontal: 4 }}>
        <LiquidGlassCard effect="clear" borderRadius={20} style={{ maxWidth: '78%', borderBottomRightRadius: 6 }}>
          <View style={{ padding: 12, paddingHorizontal: 16 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter', lineHeight: 21 }}>
              {message.content}
            </Text>
            {time && (
              <Text style={{ color: GENESIS_COLORS.textGhost, fontSize: 10, fontFamily: 'JetBrainsMono', textAlign: 'right', marginTop: 6 }}>
                {time}
              </Text>
            )}
          </View>
        </LiquidGlassCard>
      </View>
    );
  }

  // ── GENESIS MESSAGE — NO BUBBLE ──
  return (
    <View style={{ paddingHorizontal: 4 }}>
      {/* Avatar row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <LinearGradient
          colors={['#6D00FF', '#4A00B0']}
          style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
        >
          <Layers size={14} color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>
        <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 12, fontWeight: '600', letterSpacing: 1, color: GENESIS_COLORS.textSecondary }}>
          GENESIS
        </Text>
        {time && (
          <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 10, color: GENESIS_COLORS.textGhost }}>
            {time}
          </Text>
        )}
      </View>

      {/* Text body with VERTICAL violet line on left */}
      <View style={{ paddingLeft: 38, position: 'relative' }}>
        <LinearGradient
          colors={[GENESIS_COLORS.primary, 'transparent']}
          style={{ position: 'absolute', left: 13, top: 0, bottom: 0, width: 2, borderRadius: 1, opacity: 0.3 }}
        />
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter', lineHeight: 23 }}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}
```

---

## FILE 3: `components/chat/ChatInput.tsx` — REPLACE ENTIRELY

Clean input: [+ button] [text field] [mic OR send]. No inline tool icons.

```tsx
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Plus, Mic, ArrowUp } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { hapticLight } from '../../utils/haptics';
import { ToolsPopover } from './ToolsPopover';

type ChatInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sendDisabled: boolean;
  onQuickSend?: (text: string) => void;
};

export function ChatInput({ value, onChangeText, onSend, sendDisabled, onQuickSend }: ChatInputProps) {
  const router = useRouter();
  const [showPopover, setShowPopover] = useState(false);
  const hasText = value.trim().length > 0;

  const plusRotation = useSharedValue(0);
  const plusStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${plusRotation.value}deg` }],
  }));

  const togglePopover = () => {
    hapticLight();
    const next = !showPopover;
    setShowPopover(next);
    plusRotation.value = withSpring(next ? 45 : 0, { damping: 15 });
  };

  const closePopover = () => {
    setShowPopover(false);
    plusRotation.value = withSpring(0, { damping: 15 });
  };

  return (
    <View style={{ position: 'relative', paddingHorizontal: 16, paddingBottom: 8 }}>
      {showPopover && (
        <ToolsPopover
          onClose={closePopover}
          onSend={(text) => { closePopover(); onQuickSend?.(text); }}
        />
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 10,
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 24,
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderWidth: 1,
          borderColor: hasText ? 'rgba(109,0,255,0.20)' : 'rgba(255,255,255,0.07)',
        }}
      >
        {/* + button */}
        <Pressable onPress={togglePopover} style={{ marginBottom: 2 }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: showPopover ? GENESIS_COLORS.primaryDim : 'rgba(255,255,255,0.06)',
              borderWidth: 1,
              borderColor: showPopover ? 'rgba(109,0,255,0.20)' : 'rgba(255,255,255,0.08)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Animated.View style={plusStyle}>
              <Plus size={18} color={showPopover ? GENESIS_COLORS.primary : GENESIS_COLORS.iconDefault} />
            </Animated.View>
          </View>
        </Pressable>

        {/* Text input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Pregunta a GENESIS..."
          placeholderTextColor={GENESIS_COLORS.textMuted}
          multiline
          style={{
            flex: 1,
            color: '#FFFFFF',
            fontFamily: 'Inter',
            fontSize: 15,
            lineHeight: 20,
            maxHeight: 100,
            paddingVertical: 6,
          }}
        />

        {/* Mic or Send */}
        {hasText ? (
          <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)} style={{ marginBottom: 2 }}>
            <Pressable
              disabled={sendDisabled}
              onPress={() => { hapticLight(); onSend(); }}
              style={{ opacity: sendDisabled ? 0.4 : 1 }}
            >
              <LinearGradient
                colors={['#6D00FF', '#4A00B0']}
                style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }}
              >
                <ArrowUp size={18} color="#FFFFFF" strokeWidth={2.5} />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)} style={{ marginBottom: 2 }}>
            <Pressable
              onPress={() => { hapticLight(); router.push('/(modals)/voice-call'); }}
              style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }}
            >
              <Mic size={18} color={GENESIS_COLORS.iconDefault} />
            </Pressable>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
```

---

## FILE 4: `components/chat/ToolsPopover.tsx` — REPLACE ENTIRELY

Full-width popover with icon + name + description per tool. Slides up from input.

```tsx
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { Camera, Phone, ClipboardCheck, TrendingUp, BookOpen } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { hapticLight } from '../../utils/haptics';

type Tool = {
  key: string;
  icon: React.ElementType;
  name: string;
  desc: string;
  action: 'navigate' | 'send';
  target: string;
};

const TOOLS: Tool[] = [
  { key: 'camera', icon: Camera, name: 'Escanear alimento', desc: 'CÁMARA · IDENTIFICA Y REGISTRA', action: 'navigate', target: '/(modals)/camera-scanner' },
  { key: 'voice', icon: Phone, name: 'Llamada de voz', desc: 'HABLA CON GENESIS EN TIEMPO REAL', action: 'navigate', target: '/(modals)/voice-call' },
  { key: 'checkin', icon: ClipboardCheck, name: 'Check-in diario', desc: 'REGISTRA ENERGÍA, SUEÑO, ESTADO', action: 'navigate', target: '/(modals)/check-in' },
  { key: 'progress', icon: TrendingUp, name: 'Mi progreso', desc: 'MÉTRICAS, FOTOS, TENDENCIAS', action: 'send', target: '¿Cómo voy?' },
  { key: 'logos', icon: BookOpen, name: 'LOGOS', desc: 'BIBLIOTECA DE CONOCIMIENTO', action: 'navigate', target: '/(screens)/education' },
];

type Props = { onClose: () => void; onSend: (text: string) => void };

export function ToolsPopover({ onClose, onSend }: Props) {
  const router = useRouter();

  const handlePress = (tool: Tool) => {
    hapticLight();
    onClose();
    if (tool.action === 'navigate') router.push(tool.target as any);
    else onSend(tool.target);
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(250)}
      exiting={FadeOutDown.duration(200)}
      style={{
        position: 'absolute',
        bottom: 64,
        left: 0,
        right: 0,
        zIndex: 100,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(14,14,22,0.97)',
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.5,
        shadowRadius: 40,
        elevation: 20,
      }}
    >
      <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 10, fontWeight: '500', letterSpacing: 1.5, textTransform: 'uppercase', color: GENESIS_COLORS.textGhost, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 }}>
        Herramientas
      </Text>

      {TOOLS.map((tool, i) => {
        const Icon = tool.icon;
        return (
          <View key={tool.key}>
            {/* Divider after voice call (index 1) */}
            {i === 2 && <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.04)', marginVertical: 4, marginHorizontal: 12 }} />}
            <Pressable
              onPress={() => handlePress(tool)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: pressed ? 'rgba(255,255,255,0.04)' : 'transparent',
              })}
            >
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.06)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={16} color={GENESIS_COLORS.iconDefault} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '500', color: '#FFFFFF' }}>
                  {tool.name}
                </Text>
                <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 10, color: GENESIS_COLORS.textTertiary, letterSpacing: 0.3 }}>
                  {tool.desc}
                </Text>
              </View>
            </Pressable>
          </View>
        );
      })}
    </Animated.View>
  );
}
```

---

## FILE 5: `components/chat/BriefingCard.tsx` — REPLACE ENTIRELY

Collapsed = single compact row. Expanded = greeting + body text + 3 HORIZONTAL metric boxes.

```tsx
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronRight, Sun, Sunset, Moon } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { GENESIS_COLORS } from '../../constants/colors';
import { useAuthStore, useSeasonStore, useTrainingStore } from '../../stores';
import { useNutritionStore } from '../../stores/useNutritionStore';
import { useTrackStore } from '../../stores/useTrackStore';

function getGreeting(): { text: string; Icon: React.ElementType } {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Buenos días', Icon: Sun };
  if (h < 19) return { text: 'Buenas tardes', Icon: Sunset };
  return { text: 'Buenas noches', Icon: Moon };
}

export function BriefingCard() {
  const [expanded, setExpanded] = useState(true);
  const userName = useAuthStore((s) => s.user?.name ?? 'Athlete');
  const currentWeek = useSeasonStore((s) => s.currentWeek);
  const currentPhase = useSeasonStore((s) => s.currentPhase);
  const todayPlan = useTrainingStore((s) => s.todayPlan);
  const meals = useNutritionStore((s) => s.meals);
  const dailyGoal = useNutritionStore((s) => s.dailyGoal);
  const streak = useTrackStore((s) => s.streak);

  const consumedKcal = useMemo(() => meals.reduce((sum, m) => sum + (m.calories || 0), 0), [meals]);
  const kcalStr = consumedKcal.toLocaleString();
  const workoutLabel = todayPlan?.name ?? 'Día de descanso';
  const { text: greeting, Icon: GreetingIcon } = getGreeting();

  // ── COLLAPSED ──
  if (!expanded) {
    return (
      <Pressable onPress={() => setExpanded(true)}>
        <LiquidGlassCard effect="regular" borderRadius={16}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, paddingHorizontal: 18 }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: '500', color: '#FFFFFF' }}>
              {greeting}, {userName}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 11, color: GENESIS_COLORS.textSecondary }}>
                {kcalStr} kcal
              </Text>
              {streak > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: GENESIS_COLORS.primary }} />
                  <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 11, fontWeight: '600', color: GENESIS_COLORS.primary }}>
                    {streak}
                  </Text>
                </View>
              )}
              <ChevronRight size={14} color={GENESIS_COLORS.textGhost} />
            </View>
          </View>
        </LiquidGlassCard>
      </Pressable>
    );
  }

  // ── EXPANDED ──
  return (
    <Pressable onPress={() => setExpanded(false)}>
      <LiquidGlassCard effect="regular" borderRadius={18}>
        <View style={{ padding: 18 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <GreetingIcon size={14} color={GENESIS_COLORS.iconDefault} />
              <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 11, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', color: GENESIS_COLORS.textSecondary }}>
                {greeting}
              </Text>
            </View>
            <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 10, color: GENESIS_COLORS.textGhost }}>
              Hoy · {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          {/* Body text */}
          <Text style={{ fontFamily: 'Inter', fontSize: 14, lineHeight: 21, color: GENESIS_COLORS.textSecondary, marginBottom: 14 }}>
            {workoutLabel}. Semana {currentWeek}/12{currentPhase ? ` — ${currentPhase}` : ''}.{streak >= 3 ? ` Llevas ${streak} días seguidos.` : ''}
          </Text>

          {/* 3 metric boxes — HORIZONTAL */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <MetricBox value={kcalStr} label="kcal hoy" />
            <MetricBox value="—" label="sueño" />
            <MetricBox value={streak > 0 ? String(streak) : '—'} label="racha" highlight={streak >= 3} />
          </View>
        </View>
      </LiquidGlassCard>
    </Pressable>
  );
}

function MetricBox({ value, label, highlight }: { value: string; label: string; highlight?: boolean }) {
  return (
    <View style={{
      flex: 1,
      padding: 10,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.04)',
      alignItems: 'center',
    }}>
      <Text style={{
        fontFamily: 'JetBrainsMono',
        fontSize: 18,
        fontWeight: '600',
        color: highlight ? GENESIS_COLORS.primary : '#FFFFFF',
      }}>
        {value}
      </Text>
      <Text style={{ fontFamily: 'Inter', fontSize: 10, color: GENESIS_COLORS.textTertiary, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}
```

---

## FILE 6: `components/chat/QuickActionsBar.tsx` — REPLACE ENTIRELY

Pills with glass effect. Emojis allowed here.

```tsx
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { useTrainingStore } from '../../stores';
import { hapticSelection } from '../../utils/haptics';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';

type QuickActionsBarProps = { onSend: (text: string) => void };

function getContextualPills(todayPlan: any, hasCompleted: boolean): string[] {
  const h = new Date().getHours();
  const rest = !todayPlan;
  if (h >= 6 && h < 11) {
    return rest ? ['☀️ Mi briefing', '📋 Check-in', '🫁 Breathwork', '📚 LOGOS'] : ['☀️ Mi briefing', '📋 Check-in', '🏋️ Entreno de hoy', '🫁 Breathwork'];
  }
  if (h >= 11 && h < 13 && !rest && !hasCompleted) return ['⏱ Empezar workout', '🔥 Calentamiento', '🍌 Pre-entreno'];
  if (h >= 11 && h < 15) {
    return hasCompleted ? ['📊 Resumen workout', '🍽 ¿Qué como?', '🧊 Recovery'] : ['🍽 Loggear comida', '💧 Registrar agua', '📷 Escanear comida'];
  }
  if (h >= 15 && h < 20) {
    if (hasCompleted) return ['📊 Resumen workout', '🍽 ¿Qué como?', '🧊 Recovery'];
    if (!rest && !hasCompleted) return ['⏱ Empezar workout', '🍽 Loggear comida', '💧 Registrar agua'];
    return ['📈 ¿Cómo voy?', '🍽 Loggear comida', '💧 Registrar agua'];
  }
  return ['📊 Resumen del día', '🧘 Meditación', '🌙 Rutina de sueño'];
}

export function QuickActionsBar({ onSend }: QuickActionsBarProps) {
  const todayPlan = useTrainingStore((s) => s.todayPlan);
  const pills = useMemo(() => getContextualPills(todayPlan, false), [todayPlan]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 8 }}
    >
      {pills.map((pill) => (
        <Pressable key={pill} onPress={() => { hapticSelection(); onSend(pill); }}>
          <LiquidGlassCard effect="clear" borderRadius={20}>
            <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
              <Text style={{
                fontFamily: 'JetBrainsMono',
                fontSize: 11,
                fontWeight: '500',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: GENESIS_COLORS.textSecondary,
              }}>
                {pill}
              </Text>
            </View>
          </LiquidGlassCard>
        </Pressable>
      ))}
    </ScrollView>
  );
}
```

---

## FILE 7: `components/chat/AgentThinkingBlock.tsx` — REPLACE ENTIRELY

Active = glass card with CPU + 3 pulsing dots + timer + 6px agent dots. Collapsed = single line.

```tsx
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  FadeIn,
} from 'react-native-reanimated';
import { Cpu, Zap } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import type { AgentType } from './AgentContribution';

type Contribution = { agent: AgentType; text: string };

type Props = {
  isActive: boolean;
  contributions: Contribution[];
  elapsedSeconds: number;
};

const AGENT_COLORS: Record<string, string> = {
  train: GENESIS_COLORS.agentTrain,
  fuel: GENESIS_COLORS.agentFuel,
  mind: GENESIS_COLORS.agentMind,
  track: GENESIS_COLORS.agentTrack,
  vision: GENESIS_COLORS.agentVision,
};

function PulsingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0.3, { duration: 700 })), -1));
    scale.value = withDelay(delay, withRepeat(withSequence(withTiming(1.2, { duration: 700 }), withTiming(0.8, { duration: 700 })), -1));
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[{ width: 4, height: 4, borderRadius: 2, backgroundColor: GENESIS_COLORS.primary }, style]} />
  );
}

export function AgentThinkingBlock({ isActive, contributions, elapsedSeconds }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => { if (isActive) setIsExpanded(true); }, [isActive]);

  const uniqueAgents = [...new Set(contributions.map((c) => c.agent))];

  // ── COLLAPSED ──
  if (!isActive && !isExpanded) {
    return (
      <Pressable onPress={() => setIsExpanded(true)} style={{ paddingLeft: 42, paddingVertical: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Zap size={12} color={GENESIS_COLORS.textGhost} />
          <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 10, color: GENESIS_COLORS.textGhost, letterSpacing: 0.5 }}>
            {elapsedSeconds}s · {uniqueAgents.length} agentes
          </Text>
        </View>
      </Pressable>
    );
  }

  // ── ACTIVE / EXPANDED ──
  return (
    <Animated.View entering={FadeIn.duration(200)} style={{ paddingLeft: 42 }}>
      <LiquidGlassCard effect="regular" borderRadius={12}>
        <View style={{ padding: 10, paddingHorizontal: 14, gap: 8 }}>
          {/* Header: CPU + dots + timer */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Cpu size={13} color={GENESIS_COLORS.primary} style={{ opacity: 0.7 }} />
            <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
              <PulsingDot delay={0} />
              <PulsingDot delay={200} />
              <PulsingDot delay={400} />
            </View>
            <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 10, color: GENESIS_COLORS.textGhost, letterSpacing: 0.5 }}>
              GENESIS · {elapsedSeconds}s
            </Text>
          </View>

          {/* Agent dots — 6px colored dots */}
          {uniqueAgents.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {uniqueAgents.map((agent) => (
                <View key={agent} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: AGENT_COLORS[agent] ?? GENESIS_COLORS.primary }} />
                  <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 10, fontWeight: '500', letterSpacing: 0.8, textTransform: 'uppercase', color: GENESIS_COLORS.textTertiary }}>
                    {agent}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </LiquidGlassCard>

      {/* Collapse after response */}
      {!isActive && (
        <Pressable onPress={() => setIsExpanded(false)} style={{ paddingTop: 4 }}>
          <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 10, color: GENESIS_COLORS.textGhost }}>
            ▲ Colapsar
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
}
```

---

## FILE 8: `app/(chat)/index.tsx` — Changes Required

In the existing ChatScreen, make these specific changes:

### 8a. Background — change from gradient to void flat

Replace:
```tsx
<LinearGradient colors={[GENESIS_COLORS.bgGradientStart, '#000000']} style={{ flex: 1 }}>
```
With:
```tsx
<View style={{ flex: 1, backgroundColor: GENESIS_COLORS.void }}>
```

And the closing `</LinearGradient>` → `</View>`

### 8b. Header GENESIS text — white not violet, 15px

Replace:
```tsx
color: GENESIS_COLORS.primary,
fontSize: 12,
fontFamily: 'JetBrainsMonoBold',
letterSpacing: 2,
```
With:
```tsx
color: '#FFFFFF',
fontSize: 15,
fontFamily: 'JetBrainsMono',
fontWeight: '600',
letterSpacing: 1.5,
```

### 8c. Header icon — Layers instead of Cpu

Replace the header's `<Cpu size={16} color="#FFFFFF" />` with:
```tsx
<Layers size={16} color="#FFFFFF" />
```
Add `Layers` to the lucide import.

### 8d. Empty state — reorder: logo FIRST, then briefing, then pills

Change the empty state layout order to:
1. Centered GENESIS logo + title + subtitle (centered vertically with `flex: 1`)
2. BriefingCard (collapsed) below the centered content
3. QuickActionsBar at the bottom

### 8e. Subtitle text

Replace:
```
Pregúntame sobre entrenamiento, nutrición o bienestar.
```
With:
```
Tu copiloto de rendimiento y longevidad
```

---

## GIT & DELIVERY

After all files are written and `npx expo start` compiles:

```bash
git add -A
git commit -m "$(cat <<'EOF'
polish(chat-ui): V2.2 visual refinement — glass cards, Claude input pattern, typography

- Rewrite MessageBubble: user glass bubble, GENESIS no-bubble with vertical violet line
- Replace inline tool icons with + button → full ToolsPopover (icon + name + desc)
- Redesign AgentThinkingBlock: 6px agent dots, pulsing animation, compact layout
- Redesign BriefingCard: collapsed row + expanded with 3 horizontal metric boxes
- LiquidGlassCard with LinearGradient glass simulation (no @callstack/liquid-glass)
- QuickActionsBar pills with glass cards
- Void background (#050508), Layers icon for GENESIS avatar
- JetBrains Mono for system/numbers, Inter for conversation text

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
git push -u origin feat/visual-refinement-v2
```

Then create PR:
```bash
gh pr create \
  --base feat/chat-first-ui \
  --head feat/visual-refinement-v2 \
  --title "polish(chat-ui): V2.2 visual refinement" \
  --body "## Summary
- MessageBubble: user = glass bubble, GENESIS = no bubble + vertical violet line
- ChatInput: + button → animated ToolsPopover with 5 tools (icon + name + desc)
- AgentThinkingBlock: compact 6px dots, pulsing animation
- BriefingCard: collapsed row / expanded with 3 horizontal metric boxes
- Glass simulation via LinearGradient (real LiquidGlass when available)
- Full typography system: JetBrains Mono (system) + Inter (conversation)

## Test plan
- [ ] App compiles
- [ ] Input bar: type → send appears, clear → mic returns
- [ ] Tools popover opens/closes with animation
- [ ] Messages: user = glass bubble right, GENESIS = no bubble left with violet line
- [ ] BriefingCard toggles between collapsed and expanded
- [ ] Quick action pills tappable
- [ ] Empty state: logo centered, briefing below, pills at bottom

🤖 Generated with Claude Code"
```
