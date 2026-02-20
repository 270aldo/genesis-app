import { useEffect } from 'react';
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

type ChatInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sendDisabled: boolean;
  onQuickSend?: (text: string) => void;
  /** Controlled popover state from parent */
  showPopover: boolean;
  onTogglePopover: () => void;
};

export function ChatInput({ value, onChangeText, onSend, sendDisabled, onQuickSend, showPopover, onTogglePopover }: ChatInputProps) {
  const router = useRouter();
  const hasText = value.trim().length > 0;

  const plusRotation = useSharedValue(0);
  const plusStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${plusRotation.value}deg` }],
  }));

  // Sync rotation with external popover state
  useEffect(() => {
    plusRotation.value = withSpring(showPopover ? 45 : 0, { damping: 15 });
  }, [showPopover]);

  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
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
        <Pressable onPress={onTogglePopover} style={{ marginBottom: 2 }}>
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
