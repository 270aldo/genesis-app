import { Text, View } from 'react-native';
import { theme } from '../../constants/theme';

type Variant = 'primary' | 'success' | 'warning' | 'error' | 'info';

type PillBadgeProps = {
  label: string;
  variant?: Variant;
};

const variantMap: Record<Variant, string> = {
  primary: theme.colors.primary,
  success: theme.colors.success,
  warning: theme.colors.warning,
  error: theme.colors.error,
  info: theme.colors.info,
};

export function PillBadge({ label, variant = 'primary' }: PillBadgeProps) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderRadius: theme.radius.pill,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: `${variantMap[variant]}33`,
        borderColor: `${variantMap[variant]}66`,
        borderWidth: 1,
      }}
    >
      <Text style={{ color: variantMap[variant], fontSize: 11, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}
