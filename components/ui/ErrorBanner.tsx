import { Pressable, Text, View } from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';
import { GlassCard } from './GlassCard';

type ErrorBannerProps = {
  message: string;
  onDismiss?: () => void;
};

/** Extract a human-readable message from raw BFF/API error strings */
function humanizeError(raw: string): string {
  // Try to extract nested JSON message from BFF responses
  // e.g. 'BFF 401: {"detail":{"reason":"invalid","message":"Invalid token: ..."}}'
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const detail = parsed.detail ?? parsed;
      const inner = typeof detail === 'string' ? detail : detail.message ?? detail.reason;
      if (inner) {
        const statusMatch = raw.match(/^BFF\s*(\d{3})/);
        const code = statusMatch?.[1];
        if (code === '401' || code === '403') return 'Tu sesión expiró. Cierra y vuelve a iniciar sesión.';
        if (code === '404') return 'Recurso no encontrado.';
        if (code === '500') return 'Error del servidor. Intenta más tarde.';
        return typeof inner === 'string' ? inner : raw;
      }
    }
  } catch {
    // not JSON — fall through
  }

  // Common network errors
  if (raw.includes('Network request failed') || raw.includes('fetch failed'))
    return 'Sin conexión. Revisa tu internet e intenta de nuevo.';
  if (raw.includes('timeout') || raw.includes('Timeout'))
    return 'El servidor tardó demasiado. Intenta de nuevo.';

  // Fallback: cap long messages
  return raw.length > 120 ? raw.slice(0, 117) + '...' : raw;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  const displayMessage = humanizeError(message);

  return (
    <GlassCard style={{ borderColor: '#FF6B6B40', borderWidth: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <AlertTriangle size={16} color="#FF6B6B" />
        <Text style={{ color: '#FF6B6B', fontSize: 12, fontFamily: 'Inter', flex: 1, lineHeight: 18 }}>
          {displayMessage}
        </Text>
        {onDismiss && (
          <Pressable onPress={onDismiss} hitSlop={8}>
            <X size={14} color="#FF6B6B" />
          </Pressable>
        )}
      </View>
    </GlassCard>
  );
}
