import { Text, View } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { GENESIS_COLORS } from '../../constants/colors';

type EmptyStateProps = {
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
};

export function EmptyState({ icon, title = 'Sin datos', subtitle }: EmptyStateProps) {
  return (
    <View style={{ alignItems: 'center', gap: 10, paddingVertical: 32 }}>
      {icon ?? <Inbox size={36} color={GENESIS_COLORS.textMuted} />}
      <Text style={{ color: GENESIS_COLORS.textSecondary, fontSize: 14, fontFamily: 'InterBold', textAlign: 'center' }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ color: GENESIS_COLORS.textMuted, fontSize: 12, fontFamily: 'Inter', textAlign: 'center', maxWidth: 250 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
