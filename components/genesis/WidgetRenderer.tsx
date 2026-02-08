import { Pressable, Text, TextInput, View } from 'react-native';
import { theme } from '../../constants/theme';
import type { WidgetPayload } from '../../types';
import { MetricCard, WorkoutCard } from '../cards';
import { ProgressBar } from '../ui';

type WidgetRendererProps = {
  widget: WidgetPayload;
};

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  switch (widget.type) {
    case 'metric_card':
      return <MetricCard label={widget.title ?? 'Metric'} value={String(widget.value ?? '--')} progress={Number(widget.data?.progress ?? 0)} />;
    case 'chart_line':
      return (
        <View style={{ borderRadius: 16, backgroundColor: theme.colors.surface, padding: 12 }}>
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{widget.title ?? 'Trend'}</Text>
          <Text style={{ color: theme.colors.textSecondary }}>{widget.subtitle ?? 'Line chart widget'}</Text>
        </View>
      );
    case 'recommendation':
      return (
        <View style={{ borderRadius: 16, backgroundColor: theme.colors.surface, padding: 12 }}>
          <Text style={{ color: theme.colors.info, fontWeight: '700' }}>Recommendation</Text>
          <Text style={{ color: theme.colors.textPrimary }}>{widget.subtitle ?? 'Adjust training load by 5% today.'}</Text>
        </View>
      );
    case 'form_field':
      return (
        <View style={{ borderRadius: 16, backgroundColor: theme.colors.surface, padding: 12, gap: 8 }}>
          <Text style={{ color: theme.colors.textPrimary }}>{widget.title ?? 'Field'}</Text>
          <TextInput placeholder="Type..." placeholderTextColor={theme.colors.textTertiary} style={{ borderWidth: 1, borderColor: theme.colors.borderSubtle, borderRadius: 12, padding: 10, color: theme.colors.textPrimary }} />
        </View>
      );
    case 'insight_card':
      return (
        <View style={{ borderRadius: 16, backgroundColor: theme.colors.surface, padding: 12 }}>
          <Text style={{ color: theme.colors.success, fontWeight: '700' }}>Insight</Text>
          <Text style={{ color: theme.colors.textPrimary }}>{widget.subtitle ?? 'Recovery improved vs last week.'}</Text>
        </View>
      );
    case 'progress_indicator':
      return (
        <View style={{ borderRadius: 16, backgroundColor: theme.colors.surface, padding: 12, gap: 8 }}>
          <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{widget.title ?? 'Progress'}</Text>
          <ProgressBar value={Number(widget.value ?? 0)} max={100} color={theme.colors.primary} />
        </View>
      );
    case 'action_button':
      return (
        <Pressable style={{ borderRadius: 14, padding: 12, alignItems: 'center', backgroundColor: theme.colors.primary }}>
          <Text style={{ color: '#0D0D2B', fontWeight: '700' }}>{widget.title ?? 'Take action'}</Text>
        </Pressable>
      );
    default:
      return (
        <WorkoutCard
          session={{
            id: 'fallback',
            date: new Date().toISOString(),
            duration: 45,
            completed: false,
            exercises: [
              { id: 'fb-1', name: 'Goblet Squat', sets: 4, reps: 10, weight: 24, unit: 'kg', completed: false },
            ],
          }}
        />
      );
  }
}
