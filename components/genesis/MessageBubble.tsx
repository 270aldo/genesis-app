import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Layers } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import type { ChatMessage } from '../../types';

type MessageBubbleProps = {
  message: ChatMessage;
  /** Whether to show the avatar/name header (false for consecutive same-sender messages) */
  showHeader?: boolean;
  /** Whether previous message was from a different sender (controls top margin) */
  isFirstInGroup?: boolean;
};

function formatTime(ts: number | undefined): string | null {
  if (!ts) return null;
  return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message, showHeader = true, isFirstInGroup = true }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const time = formatTime(message.timestamp);

  // Dynamic top margin: more space when switching senders, tight when consecutive
  const topMargin = isFirstInGroup ? 14 : 4;

  // ── USER BUBBLE ──
  if (isUser) {
    return (
      <View style={{ alignItems: 'flex-end', paddingHorizontal: 4, marginTop: topMargin }}>
        <LiquidGlassCard
          effect="clear"
          borderRadius={20}
          style={{
            maxWidth: '78%',
            // iMessage tail: first in group gets sharp corner, consecutive get uniform radius
            borderBottomRightRadius: isFirstInGroup ? 6 : 20,
          }}
        >
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
    <View style={{ paddingHorizontal: 4, marginTop: topMargin }}>
      {/* Avatar row — only shown for first message in a group */}
      {showHeader && (
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
      )}

      {/* Text body with VERTICAL violet line on left */}
      <View style={{ paddingLeft: 38, position: 'relative' }}>
        <LinearGradient
          colors={[GENESIS_COLORS.primary, 'transparent']}
          style={{ position: 'absolute', left: 13, top: 0, bottom: 0, width: 2, borderRadius: 1, opacity: 0.3 }}
        />
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter', lineHeight: 23 }}>
          {message.content}
        </Text>
        {/* Show time inline for continuation messages (no header) */}
        {!showHeader && time && (
          <Text style={{ fontFamily: 'JetBrainsMono', fontSize: 10, color: GENESIS_COLORS.textGhost, marginTop: 4 }}>
            {time}
          </Text>
        )}
      </View>
    </View>
  );
}
