import type { WidgetType } from '../types';

type WidgetRegistryEntry = {
  component: string;
  category: 'display' | 'visualization' | 'action' | 'input' | 'informational' | 'feedback' | 'interactive';
  supportedTouchpoints: string[];
};

export const WIDGET_REGISTRY: Record<string, WidgetRegistryEntry> = {
  metric_card: {
    component: 'MetricCardWidget',
    category: 'display',
    supportedTouchpoints: ['chat', 'dashboard', 'home'],
  },
  chart_line: {
    component: 'LineChartWidget',
    category: 'visualization',
    supportedTouchpoints: ['dashboard', 'tracking'],
  },
  chart_bar: {
    component: 'BarChartWidget',
    category: 'visualization',
    supportedTouchpoints: ['dashboard', 'nutrition'],
  },
  recommendation: {
    component: 'RecommendationWidget',
    category: 'action',
    supportedTouchpoints: ['chat', 'home', 'training', 'wellness'],
  },
  form_field: {
    component: 'FormFieldWidget',
    category: 'input',
    supportedTouchpoints: ['chat', 'modals'],
  },
  insight_card: {
    component: 'InsightCardWidget',
    category: 'informational',
    supportedTouchpoints: ['home', 'dashboard', 'chat'],
  },
  progress_indicator: {
    component: 'ProgressIndicatorWidget',
    category: 'feedback',
    supportedTouchpoints: ['home', 'tracking', 'training'],
  },
  action_button: {
    component: 'ActionButtonWidget',
    category: 'interactive',
    supportedTouchpoints: ['chat', 'dashboard'],
  },
} as const;

export const TOUCHPOINTS = [
  'chat',
  'dashboard',
  'home',
  'training',
  'nutrition',
  'wellness',
  'tracking',
  'modals',
] as const;

export type Touchpoint = (typeof TOUCHPOINTS)[number];
