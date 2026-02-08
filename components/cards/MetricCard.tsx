import { Text } from 'react-native';
import { theme } from '../../constants/theme';
import { GlassCard, ProgressBar } from '../ui';

type MetricCardProps = {
  label: string;
  value: string;
  trend?: string;
  progress?: number;
};

export function MetricCard({ label, value, trend, progress = 0 }: MetricCardProps) {
  return (
    <GlassCard>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 11, fontWeight: '600' }}>{label}</Text>
      <Text style={{ color: theme.colors.textPrimary, fontSize: 28, fontWeight: '700' }}>{value}</Text>
      {trend ? <Text style={{ color: theme.colors.info, fontSize: 12 }}>{trend}</Text> : null}
      <ProgressBar value={progress} max={100} />
    </GlassCard>
  );
}
