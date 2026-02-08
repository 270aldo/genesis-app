import { useRef, useEffect, useState } from 'react';
import { Animated, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import type { WidgetPayload } from '../../types';
import { MetricCard, WorkoutCard } from '../cards';
import { ProgressBar } from '../ui';
import { useGenesisStore } from '../../stores';

type WidgetRendererProps = {
  widget: WidgetPayload;
};

function SlideIn({ children }: { children: React.ReactNode }) {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [translateY, opacity]);

  return (
    <Animated.View style={{ transform: [{ translateY }], opacity }}>
      {children}
    </Animated.View>
  );
}

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  const router = useRouter();
  const { sendMessage } = useGenesisStore();
  const [formValue, setFormValue] = useState('');

  const handleAction = () => {
    const action = widget.data?.action as string | undefined;
    const route = widget.data?.route as string | undefined;

    if (route) {
      router.push(route as any);
    } else if (action === 'start_workout') {
      router.push('/(screens)/active-workout' as any);
    } else if (action === 'check_in') {
      router.push('/(modals)/check-in' as any);
    } else if (action === 'view_library') {
      router.push('/(screens)/library' as any);
    }
  };

  const handleFormSubmit = () => {
    if (formValue.trim()) {
      sendMessage(formValue.trim());
      setFormValue('');
    }
  };

  const content = (() => {
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
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                value={formValue}
                onChangeText={setFormValue}
                placeholder="Type..."
                placeholderTextColor={theme.colors.textTertiary}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: theme.colors.borderSubtle,
                  borderRadius: 12,
                  padding: 10,
                  color: theme.colors.textPrimary,
                }}
                onSubmitEditing={handleFormSubmit}
                returnKeyType="send"
              />
              <Pressable
                onPress={handleFormSubmit}
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#0D0D2B', fontWeight: '700', fontSize: 12 }}>Send</Text>
              </Pressable>
            </View>
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
          <Pressable
            onPress={handleAction}
            style={{ borderRadius: 14, padding: 12, alignItems: 'center', backgroundColor: theme.colors.primary }}
          >
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
  })();

  return <SlideIn>{content}</SlideIn>;
}
