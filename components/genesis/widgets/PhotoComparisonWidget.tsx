import { Text, View } from 'react-native';
import { Camera, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../ui/GlassCard';
import { GENESIS_COLORS } from '../../../constants/colors';
import type { WidgetPayload } from '../../../types';

export function PhotoComparisonWidget({ widget }: { widget: WidgetPayload }) {
  const beforeDate = (widget.data?.beforeDate as string) ?? '';
  const afterDate = (widget.data?.afterDate as string) ?? '';
  const beforeLabel = (widget.data?.beforeLabel as string) ?? 'Antes';
  const afterLabel = (widget.data?.afterLabel as string) ?? 'Despues';

  return (
    <GlassCard>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Camera size={18} color={GENESIS_COLORS.primary} />
        <Text style={{ color: GENESIS_COLORS.textPrimary, fontSize: 16, fontWeight: '700', flex: 1 }}>
          {widget.title ?? 'Comparacion de progreso'}
        </Text>
      </View>

      {/* Subtitle */}
      {widget.subtitle && (
        <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 13, marginBottom: 14, lineHeight: 18 }}>
          {widget.subtitle}
        </Text>
      )}

      {/* Side-by-side photo placeholders */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        {/* Before */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: GENESIS_COLORS.textSecondary,
              fontSize: 11,
              fontFamily: 'JetBrainsMonoMedium',
              textTransform: 'uppercase',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            {beforeLabel}
          </Text>
          <View style={{ borderRadius: 12, overflow: 'hidden', height: 180 }}>
            <LinearGradient
              colors={['#1a0a3e', GENESIS_COLORS.bgGradientStart, '#0a0a18']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: GENESIS_COLORS.borderSubtle,
                borderRadius: 12,
              }}
            >
              <Camera size={28} color={GENESIS_COLORS.textMuted} />
              <Text
                style={{
                  color: GENESIS_COLORS.textMuted,
                  fontSize: 10,
                  fontFamily: 'JetBrainsMonoMedium',
                  marginTop: 8,
                }}
              >
                FOTO
              </Text>
            </LinearGradient>
          </View>
          {beforeDate ? (
            <Text
              style={{
                color: GENESIS_COLORS.textMuted,
                fontSize: 10,
                fontFamily: 'JetBrainsMonoMedium',
                textAlign: 'center',
                marginTop: 6,
              }}
            >
              {beforeDate}
            </Text>
          ) : null}
        </View>

        {/* Arrow separator */}
        <View style={{ justifyContent: 'center', paddingTop: 20 }}>
          <ArrowRight size={16} color={GENESIS_COLORS.primary} />
        </View>

        {/* After */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: GENESIS_COLORS.textSecondary,
              fontSize: 11,
              fontFamily: 'JetBrainsMonoMedium',
              textTransform: 'uppercase',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            {afterLabel}
          </Text>
          <View style={{ borderRadius: 12, overflow: 'hidden', height: 180 }}>
            <LinearGradient
              colors={[GENESIS_COLORS.primaryDark, '#2a0a5e', GENESIS_COLORS.bgGradientStart]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: GENESIS_COLORS.borderActive,
                borderRadius: 12,
              }}
            >
              <Camera size={28} color={GENESIS_COLORS.primaryLight} />
              <Text
                style={{
                  color: GENESIS_COLORS.primaryLight,
                  fontSize: 10,
                  fontFamily: 'JetBrainsMonoMedium',
                  marginTop: 8,
                }}
              >
                FOTO
              </Text>
            </LinearGradient>
          </View>
          {afterDate ? (
            <Text
              style={{
                color: GENESIS_COLORS.textMuted,
                fontSize: 10,
                fontFamily: 'JetBrainsMonoMedium',
                textAlign: 'center',
                marginTop: 6,
              }}
            >
              {afterDate}
            </Text>
          ) : null}
        </View>
      </View>

      {/* GENESIS badge */}
      <Text
        style={{
          color: GENESIS_COLORS.primary,
          fontSize: 9,
          fontFamily: 'JetBrainsMonoMedium',
          marginTop: 12,
          opacity: 0.7,
        }}
      >
        GENERATED BY GENESIS
      </Text>
    </GlassCard>
  );
}
